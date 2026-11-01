#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MDSync — Conversor de Modelo de Blocos Datamine (.dm, precisão dupla) para o site.

Lê o arquivo .dm em streaming (sem carregar na memória) e gera, em
public/data/block-model/<id>/ :

  meta.json            -> ficha do arquivo, dicionário de campos, categorias,
                          resumos (global, por litologia, bancada, destino...)
  bench_<cota>.bin.gz  -> células-pai (10x10x10 m) de cada bancada, colunar
  overview.bin.gz      -> células agregadas (LOD) para o 3D da mina inteira

Uso:
  python scripts/convert_dm_block_model.py caminho/bm_1126_2.dm \
      --id BM_1126 --out public/data/block-model/BM_1126

Formato (DmFile Component, Double Precision), conforme engenharia reversa:
  * página de 4096 bytes; a 1ª página é o cabeçalho
  * cabeçalho: tabela de campos a partir do byte 0xE0, 56 bytes por campo
      [0:16] nome (2 palavras de 4 chars, cada uma em 8 bytes)
      [16:20] tipo ('N' numérico / 'A' alfa)
      [24:32] posição (double; 0 = constante só no cabeçalho)
      [32:40] índice da palavra (alfa)   [48:56] valor padrão (double)
  * registros de N palavras (8 bytes) empacotados por página
    (floor(512/N) registros por página; resto da página é preenchimento)
  * campos alfa: 4 caracteres por palavra (bytes 0..3 de cada palavra)
  * IJK = (i*NY + j)*NZ + k  (0-based, k varia mais rápido)
"""
import argparse
import gzip
import json
import math
import os
import struct
import sys
import time

import numpy as np

PAGE = 4096
WORDS_PER_PAGE = PAGE // 8

GRADE_VARS = [
    'FEGL', 'SIGL', 'PGL', 'ALGL', 'MNGL', 'PFGL',
    'G1', 'FE1', 'SI1', 'P1', 'AL1', 'MN1', 'PF1',
    'G23', 'FE23', 'SI23', 'P23', 'AL23', 'MN23', 'PF23',
    'G4', 'FE4', 'SI4', 'P4', 'AL4', 'MN4', 'PF4',
    'FQGL',
]
BASIC_VARS = ['FEGL', 'SIGL', 'PGL', 'ALGL', 'MNGL', 'PFGL', 'G1', 'G23', 'G4', 'FQGL']
CAT_DIMS = ['lito', 'tipo', 'destino', 'risco', 'dm', 'city']
CAT_FIELD = {'lito': 'LITOLOGY', 'tipo': 'TIPO', 'destino': 'DESTINO',
             'risco': 'RISCO', 'dm': 'DM', 'city': 'CITY'}
KMAX = 64      # máximo de categorias por dimensão
BMAX = 128     # máximo de bancadas

GROUPINGS = {
    'all': (),
    'tipo': ('tipo',), 'lito': ('lito',), 'destino': ('destino',), 'risco': ('risco',),
    'dm': ('dm',), 'city': ('city',), 'bench': ('bench',),
    'bench_tipo': ('bench', 'tipo'), 'bench_destino': ('bench', 'destino'),
    'bench_lito': ('bench', 'lito'), 'bench_risco': ('bench', 'risco'),
    'lito_tipo': ('lito', 'tipo'), 'tipo_destino': ('tipo', 'destino'),
    'dm_tipo': ('dm', 'tipo'), 'city_tipo': ('city', 'tipo'),
    'lito_destino': ('lito', 'destino'), 'lito_risco': ('lito', 'risco'),
    'tipo_risco': ('tipo', 'risco'),
}
BASIC_GROUPS = {'bench_tipo', 'bench_destino', 'bench_lito', 'bench_risco'}


# --------------------------------------------------------------------------
# Cabeçalho
# --------------------------------------------------------------------------
def read_header(path):
    with open(path, 'rb') as f:
        hdr = f.read(PAGE)
    size = os.path.getsize(path)
    text = b''.join(hdr[o:o + 4] for o in range(0x20, 0xB0, 8)).decode('latin1')
    text = ' '.join(text.split())
    nfields = int(struct.unpack('<d', hdr[0xC8:0xD0])[0])
    fields = []
    off = 0xE0
    for _ in range(nfields):
        raw = hdr[off:off + 16]
        name = (raw[0:4].decode('latin1').strip() + raw[8:12].decode('latin1').strip())
        typ = hdr[off + 16:off + 17].decode('latin1')
        pos = int(struct.unpack('<d', hdr[off + 24:off + 32])[0])
        widx = int(struct.unpack('<d', hdr[off + 32:off + 40])[0])
        dflt = struct.unpack('<d', hdr[off + 48:off + 56])[0]
        fields.append({'name': name, 'type': typ, 'pos': pos, 'word': widx, 'default': dflt})
        off += 56
    return {'text': text, 'size': size, 'nfields': nfields, 'fields': fields}


def build_layout(header):
    """Resolve campos numéricos (posição) e alfa (posição inicial + nº de palavras)."""
    nwords = max(f['pos'] for f in header['fields'])
    num, alpha, consts = {}, {}, {}
    for f in header['fields']:
        if f['pos'] == 0:
            consts[f['name']] = f['default']
        elif f['type'] == 'N':
            num[f['name']] = f['pos'] - 1
        else:
            a = alpha.setdefault(f['name'], [f['pos'] - 1, 0])
            a[1] += 1
    return nwords, num, alpha, consts


def read_chunk(mm, p0, p1, nwords, rpp):
    a = np.asarray(mm[p0 * WORDS_PER_PAGE:p1 * WORDS_PER_PAGE]).reshape(p1 - p0, WORDS_PER_PAGE)
    r = np.ascontiguousarray(a[:, :rpp * nwords]).reshape(-1, nwords)
    return r[r[:, 0] > 0]


def decode_alpha(recs, start, n):
    sub = np.ascontiguousarray(recs[:, start:start + n])
    raw = sub.view(np.uint8).reshape(len(recs), n, 8)[:, :, :4].reshape(len(recs), n * 4)
    return np.ascontiguousarray(raw).view('S%d' % (n * 4)).ravel()


# --------------------------------------------------------------------------
# Acumuladores
# --------------------------------------------------------------------------
class Agg:
    def __init__(self, dims, nv):
        self.dims = dims
        self.caps = [BMAX if d == 'bench' else KMAX for d in dims]
        self.size = int(np.prod(self.caps)) if dims else 1
        self.cnt = np.zeros(self.size)
        self.vol = np.zeros(self.size)
        self.mass = np.zeros(self.size)
        self.sw = np.zeros((nv, self.size))
        self.swv = np.zeros((nv, self.size))

    def key(self, ids):
        if not self.dims:
            return None
        k = ids[self.dims[0]].astype(np.int64)
        for d, cap in zip(self.dims[1:], self.caps[1:]):
            k = k * cap + ids[d]
        return k

    def add(self, k, vol, mass, w, valid, V):
        n = len(vol)
        if k is None:
            k = np.zeros(n, dtype=np.int64)
        s = self.size
        self.cnt += np.bincount(k, minlength=s)
        self.vol += np.bincount(k, weights=vol, minlength=s)
        self.mass += np.bincount(k, weights=mass, minlength=s)
        for v in range(V.shape[1]):
            wv = w * valid[:, v]
            self.sw[v] += np.bincount(k, weights=wv, minlength=s)
            self.swv[v] += np.bincount(k, weights=wv * V[:, v], minlength=s)


# --------------------------------------------------------------------------
# Passo principal
# --------------------------------------------------------------------------
def scan(path, header, limit_pages=None, chunk_pages=6000, log=print):
    nwords, num, alpha, consts = build_layout(header)
    rpp = WORDS_PER_PAGE // nwords
    mm = np.memmap(path, dtype='<f8', mode='r', offset=PAGE)
    npages = (header['size'] - PAGE) // PAGE
    if limit_pages:
        npages = min(npages, limit_pages)

    NX = int(consts.get('NX', 0)); NY = int(consts.get('NY', 0)); NZ = int(consts.get('NZ', 0))
    X0 = consts.get('XMORIG', 0.0); Y0 = consts.get('YMORIG', 0.0); Z0 = consts.get('ZMORIG', 0.0)
    PS = header_default(header, 'XINC', 10.0)
    PSZ = header_default(header, 'ZINC', 10.0)

    gvars = [v for v in GRADE_VARS if v in num]
    nv = len(gvars)
    gcol = np.array([num[v] for v in gvars])
    vmax = np.array([200.0 if v == 'FQGL' else 100.0 for v in gvars])

    cats = {d: {} for d in CAT_DIMS}          # nome -> id
    aggs = {name: Agg(dims, nv) for name, dims in GROUPINGS.items()}

    # estatísticas por campo numérico
    fstat = {}
    for name, ci in num.items():
        fstat[name] = {'n': 0, 'sentinel': 0, 'sum': 0.0, 'min': math.inf, 'max': -math.inf,
                       'neg': 0, 'over': 0, 'valid': 0, 'vsum': 0.0, 'vmin': math.inf, 'vmax': -math.inf}
    size_stats = {}
    bbox = {'xmin': math.inf, 'xmax': -math.inf, 'ymin': math.inf, 'ymax': -math.inf,
            'zmin': math.inf, 'zmax': -math.inf}
    n_records = 0
    dens_zero = 0
    pairs = {}

    P = {'ijk': [], 'cat': [], 'vol': [], 'dens': [], 'gr': []}
    carry = None
    t0 = time.time()
    for p0 in range(0, npages, chunk_pages):
        p1 = min(npages, p0 + chunk_pages)
        R = read_chunk(mm, p0, p1, nwords, rpp)
        if carry is not None and len(carry):
            R = np.vstack([carry, R])
        last_chunk = p1 >= npages
        if len(R) == 0:
            continue
        if not last_chunk:
            ijk_all = R[:, 0]
            first_last = np.searchsorted(ijk_all, ijk_all[-1], side='left')
            carry = R[first_last:]
            R = R[:first_last]
            if len(R) == 0:
                carry = np.vstack([carry]) if carry is not None else None
                continue
        else:
            carry = None

        n = len(R)
        n_records += n
        ijk = R[:, num['IJK']].astype(np.int64)
        xinc = R[:, num['XINC']]; yinc = R[:, num['YINC']]; zinc = R[:, num['ZINC']]
        vol = xinc * yinc * zinc
        dens = R[:, num['DENS']] if 'DENS' in num else np.full(n, 2.65)
        dens_zero += int(np.sum(dens <= 0))
        mass = vol * np.where(dens > 0, dens, 0.0)
        w = vol * np.maximum(dens, 1e-3)

        # bbox
        xc, yc, zc = R[:, num['XC']], R[:, num['YC']], R[:, num['ZC']]
        bbox['xmin'] = min(bbox['xmin'], float(np.min(xc - xinc / 2))); bbox['xmax'] = max(bbox['xmax'], float(np.max(xc + xinc / 2)))
        bbox['ymin'] = min(bbox['ymin'], float(np.min(yc - yinc / 2))); bbox['ymax'] = max(bbox['ymax'], float(np.max(yc + yinc / 2)))
        bbox['zmin'] = min(bbox['zmin'], float(np.min(zc - zinc / 2))); bbox['zmax'] = max(bbox['zmax'], float(np.max(zc + zinc / 2)))

        # tamanhos de sub-bloco
        for sz in np.unique(xinc):
            m = xinc == sz
            s = size_stats.setdefault(float(sz), {'n': 0, 'vol': 0.0})
            s['n'] += int(m.sum()); s['vol'] += float(vol[m].sum())

        # categorias
        ids = {}
        for d in CAT_DIMS:
            fld = CAT_FIELD[d]
            if fld in alpha:
                a = decode_alpha(R, alpha[fld][0], alpha[fld][1])
                u, inv = np.unique(a, return_inverse=True)
                mp = np.empty(len(u), dtype=np.int64)
                for ui, raw in enumerate(u):
                    nm = raw.decode('latin1').strip() or '(vazio)'
                    if nm not in cats[d]:
                        if len(cats[d]) >= KMAX:
                            raise SystemExit('Categorias demais em %s' % d)
                        cats[d][nm] = len(cats[d])
                    mp[ui] = cats[d][nm]
                ids[d] = mp[inv.ravel()]
            else:
                ids[d] = np.zeros(n, dtype=np.int64)
        kbench = np.clip(np.floor((zc - Z0) / PSZ).astype(np.int64), 0, BMAX - 1)
        ids['bench'] = kbench

        # numéricos (teores) e validade
        V = R[:, gcol]
        sentinel = V <= -1e29
        neg = (~sentinel) & (V < 0)
        over = V > vmax
        valid = (~sentinel) & (~neg) & (~over)
        Vc = np.where(valid, V, 0.0)
        for vi, v in enumerate(gvars):
            st = fstat[v]
            st['n'] += n
            st['sentinel'] += int(sentinel[:, vi].sum()); st['neg'] += int(neg[:, vi].sum()); st['over'] += int(over[:, vi].sum())
            vv = V[valid[:, vi], vi]
            if len(vv):
                st['valid'] += len(vv); st['vsum'] += float(vv.sum())
                st['vmin'] = min(st['vmin'], float(vv.min())); st['vmax'] = max(st['vmax'], float(vv.max()))
        for v in ('XC', 'YC', 'ZC', 'XINC', 'YINC', 'ZINC', 'DENS', 'F_GRA'):
            if v in num:
                col = R[:, num[v]]
                ok = col > -1e29
                st = fstat[v]
                st['n'] += n; st['sentinel'] += int((~ok).sum())
                if ok.any():
                    cv = col[ok]
                    st['valid'] += len(cv); st['vsum'] += float(cv.sum())
                    st['vmin'] = min(st['vmin'], float(cv.min())); st['vmax'] = max(st['vmax'], float(cv.max()))

        # checagem de qualidade: campos que deveriam ser distintos mas são idênticos
        for a_, b_ in (('PF1', 'P1'), ('PF23', 'P23'), ('PF4', 'P4')):
            if a_ in gvars and b_ in gvars:
                ia, ib = gvars.index(a_), gvars.index(b_)
                both = valid[:, ia] & valid[:, ib]
                st = pairs.setdefault('%s=%s' % (a_, b_), {'ambos': 0, 'iguais': 0})
                st['ambos'] += int(both.sum())
                st['iguais'] += int((both & (np.abs(V[:, ia] - V[:, ib]) < 1e-9)).sum())

        for name, ag in aggs.items():
            ag.add(ag.key(ids), vol, mass, w, valid, Vc)

        # ---- células-pai ----
        first = np.r_[0, np.flatnonzero(np.diff(ijk)) + 1]
        counts = np.diff(np.r_[first, n])
        seg = np.repeat(np.arange(len(first)), counts)
        ns = len(first)
        pvol = np.bincount(seg, weights=vol, minlength=ns)
        pmass = np.bincount(seg, weights=mass, minlength=ns)
        wdom = w
        cat_p = np.zeros((ns, len(CAT_DIMS)), dtype=np.uint8)
        for ci, d in enumerate(CAT_DIMS):
            M = np.bincount(seg * KMAX + ids[d], weights=wdom, minlength=ns * KMAX).reshape(ns, KMAX)
            cat_p[:, ci] = M.argmax(axis=1)
        gr_p = np.full((ns, nv), np.nan, dtype=np.float32)
        for vi in range(nv):
            sw = np.bincount(seg, weights=w * valid[:, vi], minlength=ns)
            swv = np.bincount(seg, weights=w * valid[:, vi] * Vc[:, vi], minlength=ns)
            ok = sw > 0
            gr_p[ok, vi] = (swv[ok] / sw[ok]).astype(np.float32)
        P['ijk'].append(ijk[first].astype(np.int32))
        P['cat'].append(cat_p)
        P['vol'].append(pvol.astype(np.float32))
        P['dens'].append((pmass / np.maximum(pvol, 1e-9)).astype(np.float32))
        P['gr'].append(gr_p)

        if (p0 // chunk_pages) % 20 == 0:
            el = time.time() - t0
            log('páginas %d/%d (%.1f%%)  registros %d  %.0fs' % (p1, npages, 100.0 * p1 / npages, n_records, el))

    parents = {k: np.concatenate(v) for k, v in P.items()}
    return {
        'nwords': nwords, 'rpp': rpp, 'num': num, 'alpha': alpha, 'consts': consts,
        'NX': NX, 'NY': NY, 'NZ': NZ, 'X0': X0, 'Y0': Y0, 'Z0': Z0, 'PS': PS, 'PSZ': PSZ,
        'gvars': gvars, 'cats': cats, 'aggs': aggs, 'fstat': fstat, 'size_stats': size_stats,
        'bbox': bbox, 'n_records': n_records, 'dens_zero': dens_zero, 'pairs': pairs, 'parents': parents,
        'npages': npages,
    }


def header_default(header, name, fallback):
    for f in header['fields']:
        if f['name'] == name:
            return f['default']
    return fallback


# --------------------------------------------------------------------------
# Exportação
# --------------------------------------------------------------------------
def rnd(x, nd=3):
    if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))):
        return None
    return round(float(x), nd)


def group_rows(res, name):
    ag = res['aggs'][name]
    gvars = res['gvars']
    names = {d: {i: n for n, i in res['cats'][d].items()} for d in CAT_DIMS}
    sel = [i for i, v in enumerate(gvars) if (name not in BASIC_GROUPS or v in BASIC_VARS)]
    rows = []
    for idx in np.flatnonzero(ag.cnt > 0):
        keys = []
        rem = int(idx)
        for d, cap in reversed(list(zip(ag.dims, ag.caps))):
            keys.append(rem % cap)
            rem //= cap
        keys = list(reversed(keys))
        row = {}
        for d, kk in zip(ag.dims, keys):
            row[d] = int(kk) if d == 'bench' else names[d].get(kk, str(kk))
        row['n'] = int(ag.cnt[idx])
        row['vol'] = rnd(ag.vol[idx], 1)
        row['massa'] = rnd(ag.mass[idx], 1)
        row['dens'] = rnd(ag.mass[idx] / ag.vol[idx], 3) if ag.vol[idx] > 0 else None
        g = {}
        for vi in sel:
            if ag.sw[vi, idx] > 0:
                g[gvars[vi]] = rnd(ag.swv[vi, idx] / ag.sw[vi, idx], 3 if not gvars[vi].startswith('P') else 4)
        row['g'] = g
        rows.append(row)
    rows.sort(key=lambda r: -r['massa'])
    if 'bench' in ag.dims:
        rows.sort(key=lambda r: (r['bench'], -r['massa']))
    return rows


SCALE = {v: (1000 if v.startswith('P') and v != 'PF1' and v != 'PF23' and v != 'PF4' and v != 'PFGL' else 100) for v in GRADE_VARS}
NULL16 = 65535


def quant(arr, scale):
    out = np.full(arr.shape, NULL16, dtype=np.uint16)
    ok = ~np.isnan(arr)
    out[ok] = np.clip(np.rint(arr[ok] * scale), 0, NULL16 - 1).astype(np.uint16)
    return out


def write_gz(path, buf, level=9):
    with gzip.GzipFile(path, 'wb', compresslevel=level, mtime=0) as g:
        g.write(buf)


def export(res, header, out_dir, model_id, source_name, log=print):
    os.makedirs(out_dir, exist_ok=True)
    P = res['parents']
    gvars = res['gvars']
    NY, NZ = res['NY'], res['NZ']
    ijk = P['ijk'].astype(np.int64)
    ii = ijk // (NY * NZ); jj = (ijk % (NY * NZ)) // NZ; kk = ijk % NZ
    order = np.lexsort((jj, ii, kk))
    ii, jj, kk = ii[order], jj[order], kk[order]
    cat = P['cat'][order]; vol = P['vol'][order]; dens = P['dens'][order]; gr = P['gr'][order]
    z_base = res['Z0']

    bench_files = []
    total_bytes = 0
    for k in np.unique(kk):
        m = kk == k
        n = int(m.sum())
        cols = [ii[m].astype(np.uint16), jj[m].astype(np.uint16)]
        cols += [cat[m][:, c].astype(np.uint8) for c in range(len(CAT_DIMS))]
        cols.append(np.clip(np.rint(vol[m]), 0, 65535).astype(np.uint16))
        cols.append(np.clip(np.rint(dens[m] * 50), 0, 255).astype(np.uint8))
        for vi, v in enumerate(gvars):
            cols.append(quant(gr[m][:, vi], SCALE[v]))
        buf = b''.join(c.astype('<' + c.dtype.str[1:]).tobytes() for c in cols)
        z0 = int(z_base + k * res['PSZ'])
        fn = 'bench_%d.bin.gz' % z0
        write_gz(os.path.join(out_dir, fn), buf)
        sz = os.path.getsize(os.path.join(out_dir, fn))
        total_bytes += sz
        bench_files.append({'k': int(k), 'z0': z0, 'z1': int(z0 + res['PSZ']), 'file': fn, 'n': n, 'bytes': sz})
    log('bancadas: %d arquivos, %.1f MB' % (len(bench_files), total_bytes / 1e6))

    # ---- overview (LOD) ----
    LX, LY, LZ = 4, 4, 2
    ci, cj, ck = ii // LX, jj // LY, kk // LZ
    ncy = int(cj.max()) + 1; ncz = int(ck.max()) + 1
    okey = (ci * ncy + cj) * ncz + ck
    uk, inv = np.unique(okey, return_inverse=True)
    inv = inv.ravel()
    nc = len(uk)
    pm = vol.astype(np.float64) * np.maximum(dens, 1e-3)
    ovol = np.bincount(inv, weights=vol, minlength=nc)
    omass = np.bincount(inv, weights=vol * dens, minlength=nc)
    ocat = np.zeros((nc, len(CAT_DIMS)), dtype=np.uint8)
    for c in range(len(CAT_DIMS)):
        M = np.bincount(inv * KMAX + cat[:, c], weights=pm, minlength=nc * KMAX).reshape(nc, KMAX)
        ocat[:, c] = M.argmax(axis=1)
    ocols = []
    ocx = (uk // (ncy * ncz)).astype(np.uint16)
    ocy = ((uk % (ncy * ncz)) // ncz).astype(np.uint16)
    ocz = (uk % ncz).astype(np.uint16)
    ocols += [ocx, ocy, ocz]
    ocols += [ocat[:, c] for c in range(len(CAT_DIMS))]
    ocols.append(np.clip(np.rint(ovol), 0, 65535).astype(np.uint16))
    ocols.append(np.clip(np.rint(omass / np.maximum(ovol, 1e-9) * 50), 0, 255).astype(np.uint8))
    for v in BASIC_VARS:
        if v not in gvars:
            continue
        vi = gvars.index(v)
        g = gr[:, vi].astype(np.float64)
        ok = ~np.isnan(g)
        sw = np.bincount(inv, weights=np.where(ok, pm, 0), minlength=nc)
        swv = np.bincount(inv, weights=np.where(ok, pm * np.nan_to_num(g), 0), minlength=nc)
        mean = np.full(nc, np.nan)
        pos = sw > 0
        mean[pos] = swv[pos] / sw[pos]
        ocols.append(quant(mean, SCALE[v]))
    obuf = b''.join(c.astype('<' + c.dtype.str[1:]).tobytes() for c in ocols)
    write_gz(os.path.join(out_dir, 'overview.bin.gz'), obuf)
    osz = os.path.getsize(os.path.join(out_dir, 'overview.bin.gz'))
    log('overview: %d células, %.1f MB' % (nc, osz / 1e6))

    # ---- meta ----
    cats_out = {}
    for d in CAT_DIMS:
        inv_names = sorted(res['cats'][d].items(), key=lambda kv: kv[1])
        cats_out[d] = [n for n, _ in inv_names]
    allrow = group_rows(res, 'all')
    summaries = {name: group_rows(res, name) for name in GROUPINGS}

    fields_out = []
    for f in header['fields']:
        pass
    seen = set()
    for f in header['fields']:
        nm = f['name']
        if nm in seen:
            continue
        seen.add(nm)
        entry = {'nome': nm, 'tipo': f['type'], 'constante': f['pos'] == 0}
        if f['pos'] == 0:
            entry['valor'] = rnd(f['default'], 3)
        if f['type'] == 'A':
            entry['palavras'] = sum(1 for g in header['fields'] if g['name'] == nm and g['type'] == 'A')
            entry['comprimento'] = entry['palavras'] * 4
        st = res['fstat'].get(nm)
        if st and st['n']:
            entry['estat'] = {
                'n': st['n'], 'validos': st['valid'],
                'min': rnd(st['vmin']) if st['valid'] else None,
                'max': rnd(st['vmax']) if st['valid'] else None,
                'media': rnd(st['vsum'] / st['valid']) if st['valid'] else None,
                'sentinela': st['sentinel'], 'negativos': st['neg'], 'acimaLimite': st['over'],
            }
        fields_out.append(entry)

    bb = res['bbox']
    ps = res['PS']
    meta = {
        'id': model_id,
        'arquivo': source_name,
        'tamanhoBytes': header['size'],
        'criadoPor': header['text'],
        'palavrasPorRegistro': res['nwords'],
        'registrosPorPagina': res['rpp'],
        'bytesPorRegistro': res['nwords'] * 8,
        'campos': fields_out,
        'registros': res['n_records'],
        'celulasPai': int(len(P['ijk'])),
        'subBlocos': [{'tamanho': k, 'n': v['n'], 'volM3': rnd(v['vol'], 0)} for k, v in sorted(res['size_stats'].items())],
        'densidadeZero': res['dens_zero'],
        'qualidade': {'camposIdenticos': res['pairs']},
        'origem': {'x': res['X0'], 'y': res['Y0'], 'z': res['Z0']},
        'dimensao': {'nx': res['NX'], 'ny': res['NY'], 'nz': res['NZ']},
        'tamanhoPai': {'x': ps, 'y': header_default(header, 'YINC', ps), 'z': res['PSZ']},
        'extensao': {k: rnd(v, 2) for k, v in bb.items()},
        'crs': 'SIRGAS 2000 / UTM 23S',
        'colunasGrade': gvars,
        'escalaGrade': {v: SCALE[v] for v in gvars},
        'colunasCat': CAT_DIMS,
        'categorias': cats_out,
        'bancadas': bench_files,
        'overview': {'arquivo': 'overview.bin.gz', 'n': int(nc), 'lx': LX, 'ly': LY, 'lz': LZ,
                      'colunasGrade': [v for v in BASIC_VARS if v in gvars], 'bytes': osz},
        'resumo': allrow[0] if allrow else None,
        'resumos': {k: v for k, v in summaries.items() if k != 'all'},
        'layoutBench': ['i:u16', 'j:u16'] + ['%s:u8' % d for d in CAT_DIMS] + ['vol:u16', 'dens50:u8'] + ['%s:u16' % v for v in gvars],
        'geradoEm': time.strftime('%Y-%m-%d %H:%M:%S'),
    }
    with open(os.path.join(out_dir, 'meta.json'), 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, separators=(',', ':'))
    log('meta.json: %.0f KB' % (os.path.getsize(os.path.join(out_dir, 'meta.json')) / 1024))
    return meta


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('dm')
    ap.add_argument('--id', default='BM')
    ap.add_argument('--out', required=True)
    ap.add_argument('--limit-pages', type=int, default=None, help='processa só as N primeiras páginas (teste)')
    ap.add_argument('--chunk-pages', type=int, default=6000)
    a = ap.parse_args()
    header = read_header(a.dm)
    print(header['text'], '| campos:', header['nfields'], '| tamanho:', header['size'])
    res = scan(a.dm, header, a.limit_pages, a.chunk_pages)
    print('registros:', res['n_records'], 'células-pai:', len(res['parents']['ijk']))
    export(res, header, a.out, a.id, os.path.basename(a.dm))


if __name__ == '__main__':
    sys.exit(main())

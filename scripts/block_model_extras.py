#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MDSync — Derivados do modelo de blocos (a partir dos arquivos bench_*.bin.gz já convertidos).

Gera, sem precisar reler o .dm de vários GB:

  terrain.bin.gz  -> superfície do terreno (cota do topo do modelo por coluna 10x10 m)
  lod20.bin.gz    -> células agregadas de 20x20x10 m (2x2 blocos-pai por bancada),
                     todas as classes de material, teores principais

e atualiza meta.json ('terreno' e 'lod20').

Uso:
  python scripts/block_model_extras.py public/data/block-model/BM_1126
"""
import gzip
import json
import os
import sys

import numpy as np

KMAX = 64
NULL16 = 65535
TYPES = {'u16': '<u2', 'u8': 'u1'}


def read_bench(dir_, meta, info):
    buf = gzip.open(os.path.join(dir_, info['file']), 'rb').read()
    n = info['n']
    cols, off = {}, 0
    for spec in meta['layoutBench']:
        name, t = spec.split(':')
        dt = np.dtype(TYPES[t])
        cols[name] = np.frombuffer(buf, dtype=dt, count=n, offset=off)
        off += n * dt.itemsize
    assert off == len(buf), 'layout inconsistente em %s' % info['file']
    return cols


def write_gz(path, buf):
    with gzip.GzipFile(path, 'wb', compresslevel=9, mtime=0) as g:
        g.write(buf)


def build(dir_):
    meta_path = os.path.join(dir_, 'meta.json')
    meta = json.load(open(meta_path, encoding='utf-8'))
    nx, ny = meta['dimensao']['nx'], meta['dimensao']['ny']
    z0 = meta['origem']['z']
    pz = meta['tamanhoPai']['z']
    cats = meta['colunasCat']
    scale = meta['escalaGrade']
    gvars = meta['overview']['colunasGrade']          # mesmas colunas do overview
    LX, LY = 2, 2

    top_k = np.full((nx, ny), -1, dtype=np.int16)
    lod_rows = []

    for info in sorted(meta['bancadas'], key=lambda b: b['k']):
        k = info['k']
        c = read_bench(dir_, meta, info)
        i = c['i'].astype(np.int64)
        j = c['j'].astype(np.int64)
        top_k[i, j] = np.maximum(top_k[i, j], k)

        vol = c['vol'].astype(np.float64)
        dens = c['dens50'].astype(np.float64) / 50.0
        mass = vol * dens
        w = vol * np.maximum(dens, 1e-3)

        ci, cj = i // LX, j // LY
        ncj = (ny + LY - 1) // LY
        key = ci * ncj + cj
        uk, inv = np.unique(key, return_inverse=True)
        inv = inv.ravel()
        nc = len(uk)
        cvol = np.bincount(inv, weights=vol, minlength=nc)
        cmass = np.bincount(inv, weights=mass, minlength=nc)
        ccat = np.zeros((nc, len(cats)), dtype=np.uint8)
        for ci_, d in enumerate(cats):
            m = np.bincount(inv * KMAX + c[d], weights=w, minlength=nc * KMAX).reshape(nc, KMAX)
            ccat[:, ci_] = m.argmax(axis=1)
        grades = []
        for v in gvars:
            raw = c[v].astype(np.float64)
            ok = raw != NULL16
            val = raw / scale[v]
            sw = np.bincount(inv, weights=np.where(ok, w, 0), minlength=nc)
            swv = np.bincount(inv, weights=np.where(ok, w * val, 0), minlength=nc)
            mean = np.full(nc, np.nan)
            pos = sw > 0
            mean[pos] = swv[pos] / sw[pos]
            q = np.full(nc, NULL16, dtype=np.uint16)
            okm = ~np.isnan(mean)
            q[okm] = np.clip(np.rint(mean[okm] * scale[v]), 0, NULL16 - 1).astype(np.uint16)
            grades.append(q)
        lod_rows.append({
            'ci': (uk // ncj).astype(np.uint16),
            'cj': (uk % ncj).astype(np.uint16),
            'ck': np.full(nc, k, dtype=np.uint16),
            'cat': ccat,
            'vol': np.clip(np.rint(cvol), 0, 65535).astype(np.uint16),
            'dens': np.clip(np.rint(cmass / np.maximum(cvol, 1e-9) * 50), 0, 255).astype(np.uint8),
            'grades': grades,
        })

    # ---- LOD 20 m (colunar, mesmo layout do overview) ----
    cat = lambda f: np.concatenate([r[f] for r in lod_rows])
    cols = [cat('ci'), cat('cj'), cat('ck')]
    allcat = np.vstack([r['cat'] for r in lod_rows])
    cols += [allcat[:, x] for x in range(len(cats))]
    cols += [cat('vol'), cat('dens')]
    for gi in range(len(gvars)):
        cols.append(np.concatenate([r['grades'][gi] for r in lod_rows]))
    n_lod = len(cols[0])
    buf = b''.join(c.astype('<' + c.dtype.str[1:]).tobytes() for c in cols)
    lod_name = 'lod20.bin.gz'
    write_gz(os.path.join(dir_, lod_name), buf)
    lod_bytes = os.path.getsize(os.path.join(dir_, lod_name))

    # ---- terreno ----
    ok = top_k >= 0
    elev = np.full((nx, ny), NULL16, dtype=np.uint16)
    elev[ok] = np.rint((z0 + (top_k[ok].astype(np.int64) + 1) * pz) * 10).astype(np.uint16)
    write_gz(os.path.join(dir_, 'terrain.bin.gz'), elev.astype('<u2').tobytes())
    t_bytes = os.path.getsize(os.path.join(dir_, 'terrain.bin.gz'))
    zt = elev[ok].astype(np.float64) / 10.0

    meta['lod20'] = {
        'arquivo': lod_name, 'n': int(n_lod), 'lx': LX, 'ly': LY, 'lz': 1,
        'colunasGrade': gvars, 'bytes': int(lod_bytes),
    }
    meta['terreno'] = {
        'arquivo': 'terrain.bin.gz', 'nx': nx, 'ny': ny, 'escala': 10,
        'zmin': float(zt.min()), 'zmax': float(zt.max()), 'colunasComDados': int(ok.sum()),
        'bytes': int(t_bytes),
        'descricao': 'Cota do topo do modelo de blocos em cada coluna 10x10 m (superfície topográfica implícita no modelo).',
    }
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, separators=(',', ':'))
    print('lod20: %d células, %.2f MB' % (n_lod, lod_bytes / 1e6))
    print('terrain: %d colunas com dado, cota %.1f–%.1f m, %.0f kB' % (ok.sum(), zt.min(), zt.max(), t_bytes / 1e3))
    return meta


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    build(sys.argv[1])

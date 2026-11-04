// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { decodeColumns, shapeCells, cellGeometry } from '../services/blockModelService';
import { buildGeometry, computeVisible } from '../utils/blockModelView';
import {
  buildAxisLabels, buildInstrumentMarkers, buildStructureLabels, buildSurface, mosaicBounds, pickZoom, surfaceUV
} from '../utils/blockModelGeo';
import { latLonToMercatorPx, latLonToUtm23S, utm23SToLatLon } from '../utils/blockModelFormat';

const dir = path.resolve(__dirname, '../../public/data/block-model/BM_1126');
const hasData = fs.existsSync(path.join(dir, 'meta.json')) && fs.existsSync(path.join(dir, 'terrain.bin.gz'));
const geoFile = path.resolve(__dirname, '../../public/data/geotech_master.json');

describe('projeções', () => {
  it('UTM 23S <-> lat/lon é uma ida e volta sem perda (< 1 cm)', () => {
    const pts = [[591240, 7776900], [596070, 7778580], [593500, 7777700], [592733.38, 7781145.23]];
    pts.forEach(([E, N]) => {
      const { lat, lon } = utm23SToLatLon(E, N);
      const back = latLonToUtm23S(lat, lon);
      expect(Math.abs(back.easting - E)).toBeLessThan(0.01);
      expect(Math.abs(back.northing - N)).toBeLessThan(0.01);
    });
  });

  it('coordenadas do MDSync (lat/lon) coincidem com o UTM informado no cadastro', () => {
    // instrumento 106 de B1: lat -20.064375, lon -44.115164 => E 592523.569, N 7781149.779
    const u = latLonToUtm23S(-20.064375, -44.115164);
    expect(Math.abs(u.easting - 592523.569)).toBeLessThan(2);
    expect(Math.abs(u.northing - 7781149.779)).toBeLessThan(2);
  });

  it('mercator: equador/meridiano e monotonicidade', () => {
    const a = latLonToMercatorPx(0, 0, 1);
    expect(a.x).toBeCloseTo(256, 6);
    expect(a.y).toBeCloseTo(256, 6);
    expect(latLonToMercatorPx(-20, -44, 17).y).toBeGreaterThan(latLonToMercatorPx(-19, -44, 17).y);
  });
});

describe.skipIf(!hasData)('camadas geoespaciais do modelo BM_1126', () => {
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
  const gz = (f) => { const b = zlib.gunzipSync(fs.readFileSync(path.join(dir, f))); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); };
  const terrain = (() => {
    const t = meta.terreno;
    const raw = new Uint16Array(gz(t.arquivo).slice(0, t.nx * t.ny * 2));
    const elev = new Float32Array(raw.length);
    for (let i = 0; i < raw.length; i++) elev[i] = raw[i] === 65535 ? NaN : raw[i] / t.escala;
    return { nx: t.nx, ny: t.ny, elev };
  })();
  const loadLod20 = () => {
    const ov = meta.lod20;
    const layout = ['ci:u16', 'cj:u16', 'ck:u16', ...meta.colunasCat.map((d) => `${d}:u8`), 'vol:u16', 'dens50:u8', ...ov.colunasGrade.map((v) => `${v}:u16`)];
    const cols = decodeColumns(gz(ov.arquivo), layout, ov.n);
    return shapeCells(cols, meta, ov.colunasGrade, ov.n, { i: cols.ci, j: cols.cj, k: cols.ck, kind: 'overview', lod: { lx: ov.lx, ly: ov.ly, lz: ov.lz } });
  };

  it('terreno: cotas coerentes com o modelo', () => {
    const valid = [...terrain.elev].filter((x) => !Number.isNaN(x));
    expect(valid.length).toBe(meta.terreno.colunasComDados);
    expect(Math.min(...valid)).toBeCloseTo(meta.terreno.zmin, 1);
    expect(Math.max(...valid)).toBeCloseTo(meta.terreno.zmax, 1);
    expect(Math.max(...valid)).toBeLessThanOrEqual(meta.extensao.zmax + 10);
  });

  it('LOD 20 m: 4x mais detalhe que o de 40 m e dentro da extensão do modelo', () => {
    const d = loadLod20();
    expect(d.n).toBe(meta.lod20.n);
    expect(d.n).toBeGreaterThan(meta.overview.n * 5);
    const g = buildGeometry(meta, d);
    expect(g.sx).toBe(20);
    expect(g.sz).toBe(10);
    for (let c = 0; c < d.n; c += 4999) {
      const q = cellGeometry(meta, d, c);
      expect(q.e).toBeGreaterThan(meta.extensao.xmin - 1);
      expect(q.e).toBeLessThan(meta.extensao.xmax + 1);
      expect(q.n).toBeGreaterThan(meta.extensao.ymin - 20);
      expect(q.n).toBeLessThan(meta.extensao.ymax + 20);
      expect(q.z).toBeGreaterThan(meta.extensao.zmin);
      expect(q.z).toBeLessThan(meta.extensao.zmax + 1);
    }
  });

  it('filtros de seção (E/N) e teor de corte reduzem as células visíveis', () => {
    const d = loadLod20();
    const g = buildGeometry(meta, d);
    const base = { tipoOff: new Set(['esteril']) };
    const all = computeVisible(meta, d, g, base).reduce((a, b) => a + b, 0);
    const mid = (meta.extensao.xmin + meta.extensao.xmax) / 2;
    const half = computeVisible(meta, d, g, { ...base, eMax: mid }).reduce((a, b) => a + b, 0);
    expect(half).toBeGreaterThan(0);
    expect(half).toBeLessThan(all);
    const rich = computeVisible(meta, d, g, { ...base, valueVar: 'FEGL', valueMin: 60 });
    const n60 = rich.reduce((a, b) => a + b, 0);
    expect(n60).toBeGreaterThan(0);
    expect(n60).toBeLessThan(all);
    for (let c = 0; c < d.n; c++) if (rich[c]) expect(d.g.FEGL[c]).toBeGreaterThanOrEqual(60 - 0.01);
  });

  it('mosaico de satélite: tiles, zoom e UVs dentro de [0,1]', () => {
    const z = pickZoom(meta, 4096);
    const b = mosaicBounds(meta, z);
    expect(b.w).toBeLessThanOrEqual(4096);
    expect(b.tiles).toBeLessThanOrEqual(220);
    expect(z).toBeGreaterThanOrEqual(15);
    const e = meta.extensao;
    [[e.xmin, e.ymin], [e.xmax, e.ymax], [e.xmin, e.ymax], [e.xmax, e.ymin]].forEach(([E, N]) => {
      const [u, v] = surfaceUV(E, N, b);
      expect(u).toBeGreaterThan(0); expect(u).toBeLessThan(1);
      expect(v).toBeGreaterThan(0); expect(v).toBeLessThan(1);
    });
    // norte fica "acima" (v maior) e leste à direita (u maior)
    const [u1, v1] = surfaceUV(e.xmin, e.ymin, b);
    const [u2, v2] = surfaceUV(e.xmax, e.ymax, b);
    expect(u2).toBeGreaterThan(u1);
    expect(v2).toBeGreaterThan(v1);
  });

  it('superfície DEM: malha íntegra e UVs válidos', () => {
    const b = mosaicBounds(meta, 16);
    const s = buildSurface(meta, terrain, b, { mode: 'dem', stride: 2 });
    expect(s.positions.length).toBe(s.nVerts * 3);
    expect(s.uvs.length).toBe(s.nVerts * 2);
    let maxIdx = 0;
    for (let i = 0; i < s.index.length; i++) if (s.index[i] > maxIdx) maxIdx = s.index[i];
    expect(maxIdx).toBe(s.nVerts - 1);
    for (let i = 0; i < s.uvs.length; i++) { expect(s.uvs[i]).toBeGreaterThanOrEqual(0); expect(s.uvs[i]).toBeLessThanOrEqual(1); }
    const ys = [];
    for (let i = 1; i < s.positions.length; i += 3) ys.push(s.positions[i]);
    expect(Math.max(...ys)).toBeLessThanOrEqual(meta.terreno.zmax - meta.origem.z + 1);
    const flat = buildSurface(meta, null, b, { mode: 'flat', flatZ: meta.extensao.zmin });
    expect(flat.nVerts).toBe(25 * 9);
  });

  it.skipIf(!fs.existsSync(geoFile))('instrumentos e estruturas do MDSync caem sobre o modelo', () => {
    const j = JSON.parse(fs.readFileSync(geoFile, 'utf8'));
    const assets = { instrumentos: j.instrumentos, estruturas: j.estruturas };
    const m = buildInstrumentMarkers(assets, meta, { colorBy: 'status' });
    expect(m.n).toBeGreaterThan(50);
    expect(m.n + m.outside).toBe(j.instrumentos.length);
    for (let k = 0; k < m.n; k++) {
      expect(m.positions[k * 3]).toBeGreaterThan(-300);
      expect(m.positions[k * 3]).toBeLessThan(meta.extensao.xmax - meta.origem.x + 300);
    }
    const st = buildStructureLabels(assets, meta, terrain);
    expect(st.items.length).toBeGreaterThanOrEqual(3);
    expect(st.labels.every((l) => typeof l.text === 'string' && l.text.length > 0)).toBe(true);
    const ax = buildAxisLabels(meta);
    expect(ax.filter((l) => l.text.startsWith('E ')).length).toBeGreaterThanOrEqual(4);
    expect(ax.filter((l) => l.text.endsWith(' m')).length).toBeGreaterThanOrEqual(4);
  });
});

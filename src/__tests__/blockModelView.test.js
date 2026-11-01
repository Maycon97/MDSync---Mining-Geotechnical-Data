// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { decodeColumns, shapeCells, mergeBenches, cellGeometry } from '../services/blockModelService';
import {
  buildGeometry, computeColors, computeStats, computeVisible, cellInfo, rayBoxDistance
} from '../utils/blockModelView';
import { latLonToUtm23S, pointInPolygon } from '../utils/blockModelFormat';

const dir = path.resolve(__dirname, '../../public/data/block-model/BM_1126');
const hasData = fs.existsSync(path.join(dir, 'meta.json'));

describe('rayBoxDistance', () => {
  it('acerta e erra caixas alinhadas aos eixos', () => {
    expect(rayBoxDistance(0, 0, 10, 0, 0, -1, 0, 0, 0, 1, 1, 1)).toBeCloseTo(9, 6);
    expect(rayBoxDistance(5, 0, 10, 0, 0, -1, 0, 0, 0, 1, 1, 1)).toBe(-1);
    expect(rayBoxDistance(0, 0, -10, 0, 0, -1, 0, 0, 0, 1, 1, 1)).toBe(-1); // caixa atrás do raio
  });
});

describe('utilitários geodésicos', () => {
  it('converte coordenadas para UTM 23S na faixa do modelo', () => {
    const u = latLonToUtm23S(-20.0965, -44.112);
    expect(u.easting).toBeGreaterThan(591240);
    expect(u.easting).toBeLessThan(596070);
    expect(u.northing).toBeGreaterThan(7776900);
    expect(u.northing).toBeLessThan(7778600);
  });
  it('ponto em polígono', () => {
    const sq = [[0, 0], [10, 0], [10, 10], [0, 10]];
    expect(pointInPolygon(5, 5, sq)).toBe(true);
    expect(pointInPolygon(15, 5, sq)).toBe(false);
  });
});

describe.skipIf(!hasData)('modelo de blocos BM_1126 (dados reais gerados)', () => {
  const meta = hasData ? JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')) : null;

  const loadBenchNode = (k) => {
    const info = meta.bancadas.find((b) => b.k === k);
    const buf = zlib.gunzipSync(fs.readFileSync(path.join(dir, info.file)));
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const cols = decodeColumns(ab, meta.layoutBench, info.n);
    return shapeCells(cols, meta, meta.colunasGrade, info.n, { i: cols.i, j: cols.j, k, z0: info.z0, kind: 'detail' });
  };

  it('meta coerente com o arquivo .dm', () => {
    expect(meta.registros).toBe(21274024);
    expect(meta.celulasPai).toBe(2517583);
    expect(meta.palavrasPorRegistro).toBe(54);
    expect(meta.bancadas.reduce((s, b) => s + b.n, 0)).toBe(meta.celulasPai);
    expect(meta.categorias.lito.length).toBeGreaterThan(20);
  });

  it('decodifica uma bancada e respeita a geometria do modelo', () => {
    const bench = loadBenchNode(meta.bancadas[10].k);
    const d = mergeBenches([bench]);
    const geom = buildGeometry(meta, d);
    expect(d.n).toBe(meta.bancadas[10].n);
    for (let c = 0; c < d.n; c += 997) {
      const g = cellGeometry(meta, d, c);
      expect(g.e).toBeGreaterThan(meta.extensao.xmin - 1);
      expect(g.e).toBeLessThan(meta.extensao.xmax + 1);
      expect(g.n).toBeGreaterThan(meta.extensao.ymin - 10);
      expect(g.n).toBeLessThan(meta.extensao.ymax + 10);
      expect(g.z).toBeGreaterThanOrEqual(meta.bancadas[10].z0);
      expect(g.z).toBeLessThanOrEqual(meta.bancadas[10].z1);
    }
    const colors = computeColors(meta, d, geom, 'lito');
    expect(colors.length).toBe(d.n * 3);
    const vis = computeVisible(meta, d, geom, { tipoOff: new Set(['esteril']) });
    const stats = computeStats(d, vis);
    expect(stats.n).toBeLessThanOrEqual(d.n);
    const info = cellInfo(meta, d, 0);
    expect(info.massa).toBeGreaterThanOrEqual(0);
    expect(Object.keys(info.g).length).toBe(meta.colunasGrade.length);
  });

  it('mescla bancadas preservando o número de células', () => {
    const a = loadBenchNode(meta.bancadas[10].k);
    const b = loadBenchNode(meta.bancadas[11].k);
    const m = mergeBenches([a, b]);
    expect(m.n).toBe(a.n + b.n);
    expect(m.kk[0]).toBe(a.k);
    expect(m.kk[m.n - 1]).toBe(b.k);
  });

  it('massa do resumo global é a soma dos tipos', () => {
    const soma = meta.resumos.tipo.reduce((s, r) => s + r.massa, 0);
    expect(Math.abs(soma - meta.resumo.massa) / meta.resumo.massa).toBeLessThan(1e-6);
  });

  it('overview tem layout consistente', () => {
    const ov = meta.overview;
    const buf = zlib.gunzipSync(fs.readFileSync(path.join(dir, ov.arquivo)));
    const layout = ['ci:u16', 'cj:u16', 'ck:u16', ...meta.colunasCat.map((d) => `${d}:u8`), 'vol:u16', 'dens50:u8', ...ov.colunasGrade.map((v) => `${v}:u16`)];
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const cols = decodeColumns(ab, layout, ov.n);
    expect(cols.ci.length).toBe(ov.n);
  });
});

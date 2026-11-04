// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const dir = path.resolve(__dirname, '../../public/data/block-model/BM_1126');
const hasData = fs.existsSync(path.join(dir, 'meta.json'));

vi.mock('../components/BlockModel3D', () => ({
  BlockModel3D: ({ cells, visible, markers, labels, surface }) => (
    <div
      data-testid="three"
      data-cells={cells ? cells.n : 0}
      data-visible={visible ? visible.reduce((a, b) => a + b, 0) : 0}
      data-markers={markers ? markers.n : 0}
      data-labels={labels ? labels.length : 0}
      data-surface={surface ? surface.nVerts : 0}
    />
  )
}));

// Carrega os dados reais do disco em vez de usar fetch/DecompressionStream
vi.mock('../services/blockModelService', async (importActual) => {
  const actual = await importActual();
  const fsm = await import('node:fs');
  const pathm = await import('node:path');
  const zl = await import('node:zlib');
  const base = pathm.resolve(__dirname, '../../public/data/block-model/BM_1126');
  const ab = (f) => { const b = zl.gunzipSync(fsm.readFileSync(pathm.join(base, f))); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); };
  return {
    ...actual,
    loadMeta: async () => JSON.parse(fsm.readFileSync(pathm.join(base, 'meta.json'), 'utf8')),
    loadLod: async (_id, meta, which = 'overview') => {
      const ov = meta[which];
      const layout = ['ci:u16', 'cj:u16', 'ck:u16', ...meta.colunasCat.map((d) => `${d}:u8`), 'vol:u16', 'dens50:u8', ...ov.colunasGrade.map((v) => `${v}:u16`)];
      const cols = actual.decodeColumns(ab(ov.arquivo), layout, ov.n);
      return actual.shapeCells(cols, meta, ov.colunasGrade, ov.n, { i: cols.ci, j: cols.cj, k: cols.ck, kind: 'overview', lod: { lx: ov.lx, ly: ov.ly, lz: ov.lz }, lodKey: which });
    },
    loadTerrain: async (_id, meta) => {
      const t = meta.terreno;
      const raw = new Uint16Array(ab(t.arquivo).slice(0, t.nx * t.ny * 2));
      const elev = new Float32Array(raw.length);
      for (let i = 0; i < raw.length; i++) elev[i] = raw[i] === 65535 ? NaN : raw[i] / t.escala;
      return { nx: t.nx, ny: t.ny, elev };
    },
    loadGeoAssets: async () => {
      const j = JSON.parse(fsm.readFileSync(pathm.resolve(__dirname, '../../public/data/geotech_master.json'), 'utf8'));
      return { instrumentos: j.instrumentos, estruturas: j.estruturas };
    },
    loadBench: async (_id, meta, k) => {
      const info = meta.bancadas.find((b) => b.k === k);
      const cols = actual.decodeColumns(ab(info.file), meta.layoutBench, info.n);
      return actual.shapeCells(cols, meta, meta.colunasGrade, info.n, { i: cols.i, j: cols.j, k, z0: info.z0, kind: 'detail' });
    }
  };
});

import { BlockModelRealPanel } from '../components/BlockModelRealPanel';

const tick = (ms = 60) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });
async function waitFor(container, predicate, tries = 80) {
  for (let i = 0; i < tries; i++) {
    if (predicate(container)) return true;
    await tick();
  }
  return false;
}
const click = async (el) => { await act(async () => { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }); };

describe.skipIf(!hasData)('BlockModelRealPanel com dados reais', () => {
  let container, root;
  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    globalThis.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterAll(() => { act(() => root.unmount()); container.remove(); });

  it('renderiza cards, 3D e as abas Resumo / Arquivo / Planta', async () => {
    await act(async () => { root.render(<BlockModelRealPanel modelId="BM_1126" />); });
    expect(await waitFor(container, (c) => c.textContent.includes('bm_1126_2.dm'))).toBe(true);
    expect(container.textContent).toContain('ROM Especial');
    expect(container.textContent).toContain('REM');

    // 3D recebe células do overview (estéril oculto por padrão)
    expect(await waitFor(container, (c) => Number(c.querySelector('[data-testid=three]')?.dataset.cells) > 1000)).toBe(true);
    const three = container.querySelector('[data-testid=three]');
    expect(Number(three.dataset.visible)).toBeGreaterThan(0);
    expect(Number(three.dataset.visible)).toBeLessThan(Number(three.dataset.cells));

    const tabBtn = (label) => [...container.querySelectorAll('button')].find((b) => b.textContent.includes(label));

    await click(tabBtn('Resumo & teores'));
    expect(container.textContent).toContain('Agrupar por');
    expect(container.textContent).toContain('CG'); // litologia

    await click(tabBtn('Arquivo & campos'));
    expect(container.textContent).toContain('Dicionário de campos');
    expect(container.textContent).toContain('PF23 é idêntico a P23');
    expect(container.textContent).toContain('FEGL');

    await click(tabBtn('Planta por bancada'));
    expect(container.textContent).toContain('Cota / Bancada');
  });

  it('LOD 20 m refinado, camadas geoespaciais e filtros de seção/teor', async () => {
    const tabBtn = (label) => [...container.querySelectorAll('button')].find((b) => b.textContent.includes(label));
    await click(tabBtn('Modelo 3D'));
    // por padrão usa o LOD de 20 m (muito mais células que o de 40 m)
    expect(await waitFor(container, (c) => Number(c.querySelector('[data-testid=three]')?.dataset.cells) > 100000)).toBe(true);
    const three = () => container.querySelector('[data-testid=three]');
    expect(container.textContent).toContain('Camadas geoespaciais');
    expect(Number(three().dataset.labels)).toBeGreaterThan(5); // eixos UTM/cotas

    // instrumentos do MDSync
    const chk = (txt) => [...container.querySelectorAll('label')].find((l) => l.textContent.includes(txt)).querySelector('input');
    await click(chk('Instrumentos MDSync'));
    expect(await waitFor(container, (c) => Number(c.querySelector('[data-testid=three]')?.dataset.markers) > 50)).toBe(true);
    expect(container.textContent).toMatch(/Instrumentos MDSync \(\d+ na área\)/);

    // estruturas georreferenciadas
    const before = Number(three().dataset.labels);
    await click(chk('Estruturas'));
    expect(await waitFor(container, (c) => Number(c.querySelector('[data-testid=three]')?.dataset.labels) > before)).toBe(true);

    // seção + teor de corte reduzem as células visíveis
    const vis0 = Number(three().dataset.visible);
    const sel = [...container.querySelectorAll('select')].find((x) => [...x.options].some((o) => o.value === 'FEGL'));
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(sel, 'FEGL');
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const inputs = [...container.querySelectorAll('input[type=number]')];
    expect(inputs.length).toBe(2);
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(inputs[0], '60');
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    });
    await tick();
    const vis1 = Number(three().dataset.visible);
    expect(vis1).toBeGreaterThan(0);
    expect(vis1).toBeLessThan(vis0);
  });
});

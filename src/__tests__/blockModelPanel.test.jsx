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
  BlockModel3D: ({ cells, visible }) => (
    <div data-testid="three" data-cells={cells ? cells.n : 0} data-visible={visible ? visible.reduce((a, b) => a + b, 0) : 0} />
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
    loadOverview: async (_id, meta) => {
      const ov = meta.overview;
      const layout = ['ci:u16', 'cj:u16', 'ck:u16', ...meta.colunasCat.map((d) => `${d}:u8`), 'vol:u16', 'dens50:u8', ...ov.colunasGrade.map((v) => `${v}:u16`)];
      const cols = actual.decodeColumns(ab(ov.arquivo), layout, ov.n);
      return actual.shapeCells(cols, meta, ov.colunasGrade, ov.n, { i: cols.ci, j: cols.cj, k: cols.ck, kind: 'overview' });
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
});

// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

vi.mock('../components/BlockModelRealPanel', () => ({
  default: ({ modelId }) => (
    <div data-testid="real-panel" data-model={modelId}>
      Painel Datamine Real 3D
    </div>
  ),
  BlockModelRealPanel: ({ modelId }) => (
    <div data-testid="real-panel" data-model={modelId}>
      Painel Datamine Real 3D
    </div>
  )
}));

import { EngenhoSecoBlockModelViewer } from '../components/EngenhoSecoBlockModelViewer';

describe('EngenhoSecoBlockModelViewer', () => {
  let container, root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterAll(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('inicia no modo 3D WebGL por padrão exibindo BlockModelRealPanel com BM_1126', async () => {
    await act(async () => {
      root.render(<EngenhoSecoBlockModelViewer onClose={() => {}} />);
    });

    const realPanel = container.querySelector('[data-testid="real-panel"]');
    expect(realPanel).not.toBeNull();
    expect(realPanel?.getAttribute('data-model')).toBe('BM_1126');
    expect(container.textContent).toContain('Visualizador 3D Datamine');
    expect(container.textContent).toContain('Planejamento Mensal (CP)');
  });

  it('permite alternar para o modo Planejamento Mensal (CP)', async () => {
    await act(async () => {
      root.render(<EngenhoSecoBlockModelViewer onClose={() => {}} />);
    });

    const mensalBtn = [...container.querySelectorAll('button')].find(b => b.textContent.includes('Planejamento Mensal'));
    expect(mensalBtn).toBeDefined();

    await act(async () => {
      mensalBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Mês de Lavra:');
  });
});

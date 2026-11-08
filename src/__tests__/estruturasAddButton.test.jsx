// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { EstruturasEmpreendimentoTab } from '../components/EstruturasEmpreendimentoTab';
import { GeotechDataProvider } from '../context/GeotechDataContext';
import { AuthProvider } from '../context/AuthContext';

describe('EstruturasEmpreendimentoTab - Animated Add Button (+)', () => {
  let container, root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    globalThis.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ estruturas: [], instrumentos: [] })
      });
    });
  });

  afterAll(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('renders the animated plus (+) blue button with class btn-structure-add and title', async () => {
    await act(async () => {
      root.render(
        <AuthProvider>
          <GeotechDataProvider>
            <EstruturasEmpreendimentoTab />
          </GeotechDataProvider>
        </AuthProvider>
      );
    });

    const addBtn = container.querySelector('.btn-structure-add');
    expect(addBtn).not.toBeNull();
    expect(addBtn.getAttribute('title')).toContain('Cadastrar nova estrutura');

    const iconSpan = addBtn.querySelector('.icon-plus-animated');
    expect(iconSpan).not.toBeNull();

    const svgIcon = addBtn.querySelector('svg');
    expect(svgIcon).not.toBeNull();
  });

  it('opens modal to register new structure when clicking the button', async () => {
    await act(async () => {
      root.render(
        <AuthProvider>
          <GeotechDataProvider>
            <EstruturasEmpreendimentoTab />
          </GeotechDataProvider>
        </AuthProvider>
      );
    });

    const addBtn = container.querySelector('.btn-structure-add');
    await act(async () => {
      addBtn.click();
    });

    // Check modal appears
    const modalBackdrop = container.querySelector('.modal-backdrop');
    expect(modalBackdrop).not.toBeNull();
    expect(modalBackdrop.textContent).toContain('Cadastrar Nova Estrutura');
  });
});

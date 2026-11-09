// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SysdamEmpreendimentosPanel } from '../components/SysdamEmpreendimentosPanel';
import { storageService } from '../services/storageService';

describe('Map Structure Pin Click & General Information (Side B)', () => {
  let container, root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders general information (Side B) when structure is selected and panel is open', async () => {
    const estruturas = storageService.getEstruturasEmpreendimento();
    const testStruct = estruturas.find(e => e.sigla === 'MGB' || e.nome.includes('Mangaba')) || estruturas[0];
    const onCloseDetails = vi.fn();
    const onNavigateModule = vi.fn();

    await act(async () => {
      root.render(
        <SysdamEmpreendimentosPanel
          estruturas={estruturas}
          selectedEstrutura={testStruct}
          isCollapsed={false}
          isFlipped={true}
          onCloseDetails={onCloseDetails}
          onNavigateModule={onNavigateModule}
        />
      );
    });

    // Check panel is open (not collapsed)
    const sider = container.querySelector('.sysdam-map-sider');
    expect(sider).not.toBeNull();
    expect(sider.classList.contains('collapsed')).toBe(false);

    // Check flipper has flipped class
    const flipper = container.querySelector('.sysdam-card-flipper');
    expect(flipper.classList.contains('flipped')).toBe(true);

    // Check structure general information is visible
    expect(container.textContent).toContain(testStruct.nome);
    expect(container.textContent).toContain(testStruct.sigla);
    expect(container.textContent).toContain('Sarzedo / MG • Itaminas Mineração S/A');
    expect(container.textContent).toContain('Cota Crista:');
    expect(container.textContent).toContain('Altura Máx:');
    expect(container.textContent).toContain('DPA / CRI:');
    expect(container.textContent).toContain('Módulos Operacionais Disponíveis:');
    expect(container.textContent).toContain('Monitoramento Piezométrico');
    expect(container.textContent).toContain('Inspeções Regulares & Anomalias');

    // Test close button
    const closeBtn = container.querySelector('.sysdam-card-back button[title="Voltar para lista de estruturas"]');
    expect(closeBtn).not.toBeNull();

    await act(async () => {
      closeBtn.click();
    });

    expect(onCloseDetails).toHaveBeenCalledTimes(1);
  });
});

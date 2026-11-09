// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { PiezometryTab, resolveCanonicalStructure, CANONICAL_STRUCTURE_MAP } from '../components/PiezometryTab';

// Mock chart.js and react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-piezo-chart">Mock Chart</div>
}));

const mockInstruments = [
  {
    uid: 'BARRAGEM_B1_INA_106',
    id: '106',
    tipo: 'INA',
    estrutura: 'BARRAGEM B1',
    secao: 'AA',
    statusCalculado: 'NORMAL',
    ultimaCota: 827.65,
    ultimaData: '2026-10-22'
  },
  {
    uid: 'BARRAGEM_B1_INA_107',
    id: '107',
    tipo: 'INA',
    estrutura: 'BARRAGEM B1',
    secao: 'BB',
    statusCalculado: 'ATENÇÃO',
    ultimaCota: 828.41,
    ultimaData: '2026-10-22'
  },
  {
    uid: 'BARRAGEM_B4_PZ_01',
    id: '01',
    tipo: 'PZ',
    estrutura: 'BARRAGEM B4',
    secao: 'CC',
    statusCalculado: 'NORMAL',
    ultimaCota: 1140.2,
    ultimaData: '2026-10-20'
  },
  {
    uid: 'PDE_MANGABA_INA_01',
    id: '01',
    tipo: 'INA',
    estrutura: 'PDE MANGABA',
    secao: 'MGB-1',
    statusCalculado: 'NORMAL',
    ultimaCota: 980.5,
    ultimaData: '2026-10-18'
  }
];

const mockReadingsPiezometria = [
  {
    uid: 'BARRAGEM_B1_INA_106',
    estrutura: 'BARRAGEM B1',
    tipo: 'INA',
    id: '106',
    data: '2026-10-20',
    leitura: 11.5,
    cota: 827.5,
    status: 'NORMAL'
  },
  {
    uid: 'BARRAGEM_B1_INA_106',
    estrutura: 'BARRAGEM B1',
    tipo: 'INA',
    id: '106',
    data: '2026-10-22',
    leitura: 11.79,
    cota: 827.65,
    status: 'NORMAL'
  },
  {
    uid: 'PDE_MANGABA_INA_01',
    estrutura: 'PDE MANGABA',
    tipo: 'INA',
    id: '01',
    data: '2026-10-18',
    leitura: 14.2,
    cota: 980.5,
    status: 'NORMAL'
  }
];

let mockActiveStructure = 'TODAS';

vi.mock('../context/GeotechDataContext', () => ({
  useGeotechData: () => ({
    structures: [
      { id: 'B1', sigla: 'B1', nome: 'Barragem B1' },
      { id: 'B4', sigla: 'B4', nome: 'Barragem B4' },
      { id: 'MGB', sigla: 'MGB', nome: 'PDE Mangaba' }
    ],
    instruments: mockInstruments,
    readingsPiezometria: mockReadingsPiezometria,
    activeStructureId: mockActiveStructure,
    selectStructure: vi.fn((val) => { mockActiveStructure = val; })
  })
}));

describe('PiezometryTab Data Integrity and Resolution', () => {
  let container, root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mockActiveStructure = 'TODAS';
    if (root) {
      act(() => root.unmount());
    }
    if (container) {
      container.remove();
    }
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterAll(() => {
    if (root) {
      act(() => root.unmount());
    }
    if (container) {
      container.remove();
    }
  });

  it('correctly resolves structure short codes and slugs via resolveCanonicalStructure', () => {
    expect(resolveCanonicalStructure('B1')).toBe('BARRAGEM B1');
    expect(resolveCanonicalStructure('BARRAGEM_B1')).toBe('BARRAGEM B1');
    expect(resolveCanonicalStructure('B4')).toBe('BARRAGEM B4');
    expect(resolveCanonicalStructure('MGB')).toBe('PDE MANGABA');
    expect(resolveCanonicalStructure('MG')).toBe('PDE MANGABA');
    expect(resolveCanonicalStructure('PDE_MANGABA')).toBe('PDE MANGABA');
    expect(resolveCanonicalStructure('JC')).toBe('PDE JACÓ');
    expect(resolveCanonicalStructure('ES')).toBe('ENGENHO SECO');
    expect(resolveCanonicalStructure('JGD')).toBe('JANGADA');
    expect(resolveCanonicalStructure('PB2')).toBe('PILHA B2');
    expect(resolveCanonicalStructure('TODAS')).toBe('TODAS');
  });

  it('renders PiezometryTab with TODAS selected and populates instruments without empty glitch', async () => {
    await act(async () => {
      root.render(<PiezometryTab onNavigateTab={vi.fn()} />);
    });

    expect(container.textContent).toContain("Monitoramento Piezométrico e Nível d'Água (N.A)");
    expect(container.querySelector('[data-testid="mock-piezo-chart"]')).toBeDefined();

    // Verify instrument dropdown is populated and not blank
    const selectEl = container.querySelectorAll('select')[2]; // third select is instrument
    expect(selectEl).toBeDefined();
    expect(selectEl.options.length).toBeGreaterThan(0);
    expect(selectEl.value).toBe('BARRAGEM_B1_INA_106');
    expect(container.textContent).toContain('Exibindo 2 leituras');
  });

  it('handles activeStructureId with short code like MGB and resolves to PDE MANGABA', async () => {
    mockActiveStructure = 'MGB';
    await act(async () => {
      root.render(<PiezometryTab onNavigateTab={vi.fn()} />);
    });

    expect(container.textContent).toContain('PDE MANGABA');
    const selectInst = container.querySelectorAll('select')[2];
    expect(selectInst.value).toBe('PDE_MANGABA_INA_01');
    expect(container.textContent).toContain('Exibindo 1 leituras');
  });

  it('supports navigationContext to focus directly on specific structure and instrument', async () => {
    await act(async () => {
      root.render(
        <PiezometryTab 
          onNavigateTab={vi.fn()} 
          navigationContext={{ structureId: 'BARRAGEM B1', instrumentId: '107' }} 
        />
      );
    });

    const selectInst = container.querySelectorAll('select')[2];
    expect(selectInst.value).toBe('BARRAGEM_B1_INA_107');
    expect(container.textContent).toContain('INA 107');
  });

  it('activates failsafe when structure has no piezometers instead of breaking screen', async () => {
    mockActiveStructure = 'PDE_ES_SMB';
    await act(async () => {
      root.render(<PiezometryTab onNavigateTab={vi.fn()} />);
    });

    // Should NOT crash and still render chart and instruments
    expect(container.querySelector('[data-testid="mock-piezo-chart"]')).toBeDefined();
    const selectInst = container.querySelectorAll('select')[2];
    expect(selectInst.options.length).toBeGreaterThan(0);
  });
});

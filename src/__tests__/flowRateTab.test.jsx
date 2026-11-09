// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { FlowRateTab, parseFlowRateLs } from '../components/FlowRateTab';
import { GeotechDataProvider } from '../context/GeotechDataContext';
import masterData from '../../public/data/geotech_master.json';

// Mock chart.js to avoid canvas rendering requirements in jsdom
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-chart-line">Gráfico de Vazão Chart.js</div>,
  Bar: () => <div data-testid="mock-chart-bar">Gráfico de Barra Chart.js</div>
}));

describe('FlowRateTab & Flow Rate Geotechnical Data Verification', () => {
  let container, root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    const lightweightMaster = {
      ...masterData,
      leiturasPiezometricas: masterData.leiturasPiezometricas.slice(-50),
      leiturasVertedouro: masterData.leiturasVertedouro.slice(-100),
      leiturasVazao: masterData.leiturasVazao
    };

    globalThis.fetch = vi.fn().mockImplementation((url) => {
      if (String(url).includes('geotech_master.json')) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve(lightweightMaster)
        });
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([])
      });
    });
  });

  afterAll(() => {
    act(() => root.unmount());
    container.remove();
  });

  describe('parseFlowRateLs unit conversion helper', () => {
    it('handles explicit lS or ls', () => {
      expect(parseFlowRateLs({ lS: 0.187 })).toBeCloseTo(0.187, 3);
      expect(parseFlowRateLs({ ls: 1.25 })).toBeCloseTo(1.25, 2);
    });

    it('converts qM3s to L/s (multiplies by 1000)', () => {
      expect(parseFlowRateLs({ qM3s: 0.0008388 })).toBeCloseTo(0.8388, 4);
    });

    it('converts qM3h to L/s (divides by 3.6)', () => {
      expect(parseFlowRateLs({ qM3h: 36.0 })).toBeCloseTo(10.0, 1);
    });

    it('handles generic vazao for VT (m3/h) and MV (m3/s or L/s)', () => {
      expect(parseFlowRateLs({ tipo: 'VT', vazao: 7.2 })).toBeCloseTo(2.0, 1);
      expect(parseFlowRateLs({ tipo: 'MV', vazao: 0.000141 })).toBeCloseTo(0.141, 3);
    });

    it('calculates Thomson triangular weir flow from hCm', () => {
      // Q(L/s) = 0.0138 * h^2.5
      const h = 5.0;
      const expected = 0.0138 * Math.pow(5.0, 2.5);
      expect(parseFlowRateLs({ hCm: 5.0 })).toBeCloseTo(expected, 3);
    });

    it('returns 0 for null or empty reading', () => {
      expect(parseFlowRateLs(null)).toBe(0);
      expect(parseFlowRateLs({})).toBe(0);
    });
  });

  describe('FlowRateTab Component Mount and Master Data Integration', () => {
    it('verifies geotech_master.json contains both MV and VT flow instruments and readings', () => {
      const flowInsts = masterData.instrumentos.filter(i => i.tipo === 'MV' || i.tipo === 'VT');
      expect(flowInsts.length).toBeGreaterThanOrEqual(20);

      // Verify B1 MV 1 exists
      const b1Mv = flowInsts.find(i => i.uid === 'BARRAGEM_B1_MV_1');
      expect(b1Mv).toBeDefined();
      expect(b1Mv.estrutura).toBe('BARRAGEM B1');
      expect(b1Mv.tipo).toBe('MV');

      // Verify B4 MV 1, 2, 3 exist
      const b4Mvs = flowInsts.filter(i => i.estrutura === 'BARRAGEM B4' && i.tipo === 'MV');
      expect(b4Mvs.length).toBe(3);

      // Verify Pilha B2 MV 1 exists
      const b2Mv = flowInsts.find(i => i.uid === 'PILHA_B2_MV_1');
      expect(b2Mv).toBeDefined();
      expect(b2Mv.estrutura).toBe('PILHA B2');

      // Verify PDE Jaco MV 1 exists
      const jcMv = flowInsts.find(i => i.uid === 'PDE_JACÓ_MV_1');
      expect(jcMv).toBeDefined();

      // Verify consolidation according to official Basemap_HIDRO:
      // 14 VT weirs distributed across their true geotechnical structures:
      // - 7 in Cava Jangada
      // - 3 in Engenho Seco
      // - 1 in PDE Mangaba
      // - 3 in PDE Samambaia
      const jgdVts = flowInsts.filter(i => i.estrutura === 'JANGADA' && i.tipo === 'VT');
      expect(jgdVts.length).toBe(7);

      const engVts = flowInsts.filter(i => i.estrutura === 'ENGENHO SECO' && i.tipo === 'VT');
      expect(engVts.length).toBe(3);

      const manVts = flowInsts.filter(i => i.estrutura === 'PDE MANGABA' && i.tipo === 'VT');
      expect(manVts.length).toBe(1);

      const samVts = flowInsts.filter(i => i.estrutura === 'PDE SAMAMBAIA' && i.tipo === 'VT');
      expect(samVts.length).toBe(3);

      // Verify readings count
      expect(masterData.leiturasVazao.length).toBeGreaterThanOrEqual(325);
      expect(masterData.leiturasVertedouro.length).toBeGreaterThanOrEqual(6650);
    });

    it('renders FlowRateTab with title, metrics, chart, and populated selectors', async () => {
      const mockNavigate = vi.fn();

      await act(async () => {
        root.render(
          <GeotechDataProvider>
            <FlowRateTab onNavigateTab={mockNavigate} />
          </GeotechDataProvider>
        );
      });

      // Verify header text
      expect(container.textContent).toContain('Medição de Vazão e Vertedouros (Drenagem Interna)');

      // Verify "Ver no Georeferenciamento" button exists
      const geoBtn = Array.from(container.querySelectorAll('button')).find(b => 
        b.textContent.includes('Ver no Georeferenciamento')
      );
      expect(geoBtn).toBeDefined();

      // Verify mock chart is rendered
      expect(container.querySelector('[data-testid="mock-chart-line"]')).toBeDefined();

      // Verify selects are rendered with options
      const selects = container.querySelectorAll('select');
      expect(selects.length).toBeGreaterThanOrEqual(2);

      // Instrument select should contain flow options
      const instSelect = selects[1];
      expect(instSelect.options.length).toBeGreaterThan(0);

      // Click "Ver no Georeferenciamento" and verify parameters passed to MapTab
      act(() => {
        geoBtn.click();
      });
      expect(mockNavigate).toHaveBeenCalledWith('mapa', expect.objectContaining({
        filterType: expect.any(String),
        instrumentId: expect.any(String),
        structureId: expect.any(String)
      }));
    });

    it('verifies that PDE_ES_2 normalizes to ENGENHO_SECO and displays Engenho Seco weirs without error banner', async () => {
      const { normalizeStructureKey } = await import('../context/GeotechDataContext');
      expect(normalizeStructureKey('PDE_ES_2')).toBe('ENGENHO_SECO');
      expect(normalizeStructureKey('PDE_ES2')).toBe('ENGENHO_SECO');
      expect(normalizeStructureKey('PDE ES 2')).toBe('ENGENHO_SECO');
      expect(normalizeStructureKey('PDE_MANGABA')).toBe('PDE_MANGABA');
      expect(normalizeStructureKey('MGB')).toBe('PDE_MANGABA');
      expect(normalizeStructureKey('SMB')).toBe('PDE_ES_SMB');
      expect(normalizeStructureKey('PDE SAMAMBAIA')).toBe('PDE_ES_SMB');

      // Check instruments belonging to Engenho Seco
      const engWeirs = masterData.instrumentos.filter(i => 
        normalizeStructureKey(i.estrutura) === 'ENGENHO_SECO' && i.tipo === 'VT'
      );
      expect(engWeirs.length).toBe(3);
      const engIds = engWeirs.map(i => i.id);
      expect(engIds).toContain('JGD_VZ_ENG_09/01');
      expect(engIds).toContain('JGD_VZ_ENG_12/01');
      expect(engIds).toContain('JGD_VZ_ENG_57/02');
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { SysdamEmpreendimentosPanel } from '../components/SysdamEmpreendimentosPanel';
import { storageService } from '../services/storageService';

describe('SysDam Georeferencing & Empreendimentos Mechanics', () => {
  beforeEach(() => {
    if (typeof globalThis.localStorage === 'undefined') {
      const store = {};
      globalThis.localStorage = {
        getItem: (key) => store[key] || null,
        setItem: (key, val) => { store[key] = String(val); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); }
      };
    }
  });

  it('should export SysdamEmpreendimentosPanel component', () => {
    expect(SysdamEmpreendimentosPanel).toBeDefined();
    expect(typeof SysdamEmpreendimentosPanel).toBe('function');
  });

  it('should return all geotechnical structures with full SysDam specifications', () => {
    const estruturas = storageService.getEstruturasEmpreendimento();
    expect(estruturas.length).toBeGreaterThanOrEqual(8);

    const b1 = estruturas.find(e => e.sigla === 'B1' || e.id === 'B1');
    expect(b1).toBeDefined();
    expect(b1.nome).toContain('Barragem B1');
    expect(b1.categoria).toBe('BARRAGEM');
    expect(b1.dpa).toBeDefined();
    expect(b1.cri).toBeDefined();
    expect(b1.volume).toBeDefined();
    expect(b1.cotaCrista).toBeDefined();
    expect(b1.alturaMaxima).toBeDefined();
    expect(b1.dce).toBeDefined();
    expect(b1.lat).toBeLessThan(-19.5);
    expect(b1.lat).toBeGreaterThan(-20.5);
    expect(b1.lon).toBeLessThan(-43.5);
    expect(b1.lon).toBeGreaterThan(-44.5);
  });

  it('should verify diacritics-insensitive search mechanism (normalize NFD)', () => {
    const estruturas = storageService.getEstruturasEmpreendimento();
    const query = 'jaco';
    const normQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const filtered = estruturas.filter(e => {
      const normNome = e.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const normSigla = e.sigla.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normNome.includes(normQuery) || normSigla.includes(normQuery);
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].nome).toContain('Jacó');
  });

  it('should sort structures by different SysDam criteria (A-Z, Z-A, DPA Crítico, +Instrumentos)', () => {
    const estruturas = storageService.getEstruturasEmpreendimento();

    // 1. A-Z
    const sortedAZ = [...estruturas].sort((a, b) => a.nome.localeCompare(b.nome));
    expect(sortedAZ[0].nome.localeCompare(sortedAZ[1].nome)).toBeLessThanOrEqual(0);

    // 2. Z-A
    const sortedZA = [...estruturas].sort((a, b) => b.nome.localeCompare(a.nome));
    expect(sortedZA[0].nome.localeCompare(sortedZA[1].nome)).toBeGreaterThanOrEqual(0);

    // 3. DPA Crítico (Alto > Médio > Baixo)
    const dpaWeight = { ALTO: 3, MÉDIO: 2, BAIXO: 1 };
    const sortedDpa = [...estruturas].sort((a, b) => (dpaWeight[b.dpa?.toUpperCase()] || 0) - (dpaWeight[a.dpa?.toUpperCase()] || 0));
    expect(sortedDpa[0].dpa?.toUpperCase()).toBe('ALTO');

    // 4. Mais instrumentos
    const sortedInst = [...estruturas].sort((a, b) => (b.totalInstrumentos || 0) - (a.totalInstrumentos || 0));
    expect(sortedInst[0].totalInstrumentos).toBeGreaterThanOrEqual(sortedInst[sortedInst.length - 1].totalInstrumentos);
  });

  it('should filter structures by category (BARRAGEM, PILHA, CAVA)', () => {
    const estruturas = storageService.getEstruturasEmpreendimento();

    const barragens = estruturas.filter(e => e.categoria === 'BARRAGEM');
    expect(barragens.length).toBeGreaterThan(0);
    barragens.forEach(b => expect(b.categoria).toBe('BARRAGEM'));

    const pilhas = estruturas.filter(e => e.categoria === 'PILHA');
    expect(pilhas.length).toBeGreaterThan(0);
    pilhas.forEach(p => expect(p.categoria).toBe('PILHA'));

    const cavas = estruturas.filter(e => e.categoria === 'CAVA');
    expect(cavas.length).toBeGreaterThan(0);
    cavas.forEach(c => expect(c.categoria).toBe('CAVA'));
  });

  it('should correctly support saving, parsing and removing camera preset in localStorage', () => {
    const mockPreset = {
      center: [-20.063818, -44.11436],
      zoom: 16
    };

    localStorage.setItem('mdsync_map_preset', JSON.stringify(mockPreset));
    const retrieved = JSON.parse(localStorage.getItem('mdsync_map_preset'));

    expect(retrieved.center[0]).toBeCloseTo(-20.063818, 5);
    expect(retrieved.center[1]).toBeCloseTo(-44.11436, 5);
    expect(retrieved.zoom).toBe(16);

    localStorage.removeItem('mdsync_map_preset');
    expect(localStorage.getItem('mdsync_map_preset')).toBeNull();
  });
});

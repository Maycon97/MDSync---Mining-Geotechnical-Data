// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { SysdamEmpreendimentosPanel, matchesStructure, toUtm23s } from '../components/SysdamEmpreendimentosPanel';
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

  it('should accurately convert Lat/Lon to UTM Fuso 23S coordinates', () => {
    // Sarzedo / Itaminas coordinates: approx -20.088788, -44.092452
    const utm = toUtm23s(-20.088788, -44.092452);
    expect(utm).toBeDefined();
    expect(utm.easting).toBeGreaterThan(500000);
    expect(utm.easting).toBeLessThan(700000);
    expect(utm.northing).toBeGreaterThan(7000000);
    expect(utm.northing).toBeLessThan(8000000);
  });

  it('should correctly match diverse structure names and acronyms via matchesStructure', () => {
    const mangaba = { id: 'MGB', sigla: 'MGB', nome: 'PDE Mangaba', nomeCompleto: 'Pilha de Disposição de Estéril Mangaba' };
    expect(matchesStructure('PDE MANGABA', mangaba)).toBe(true);
    expect(matchesStructure('MGB', mangaba)).toBe(true);
    expect(matchesStructure('MANGABA', mangaba)).toBe(true);
    expect(matchesStructure('BARRAGEM B1', mangaba)).toBe(false);

    const b1 = { id: 'B1', sigla: 'B1', nome: 'Barragem B1' };
    expect(matchesStructure('BARRAGEM B1', b1)).toBe(true);
    expect(matchesStructure('B1', b1)).toBe(true);

    const b4 = { id: 'B4', sigla: 'B4', nome: 'Barragem B4' };
    expect(matchesStructure('BARRAGEM B4', b4)).toBe(true);

    const es = { id: 'ES', sigla: 'ES', nome: 'Cava Engenho Seco' };
    expect(matchesStructure('ENGENHO SECO', es)).toBe(true);
    expect(matchesStructure('CAVA ENGENHO SECO', es)).toBe(true);

    const pb2 = { id: 'PB2', sigla: 'PB2', nome: 'PDR B2' };
    expect(matchesStructure('PILHA B2', pb2)).toBe(true);
  });

  it('should render Side B with all geotechnical details and clickable operational module cards', async () => {
    const testStructure = {
      id: 'MGB',
      sigla: 'MGB',
      nome: 'PDE Mangaba',
      nomeCompleto: 'Pilha de Disposição de Estéril Mangaba',
      tipo: 'PILHA',
      faseProjeto: 'Operação Regular',
      tipoSecao: 'Camadas Compactadas de Estéril Friável',
      finalidade: 'Deposição Geotécnica de Estéril Itabirítico',
      estruturaAssoc: 'Dique de Contenção de Pé',
      orgaoFiscalizador: 'ANM & FEAM',
      dpa: 'Médio',
      cri: 'Baixo',
      statusDce: 'DCE Vigente',
      cotaCrista: 840.0,
      alturaMaxima: 50.0,
      volumeAtual: '2.400.000 m³',
      coordenadas: { lat: -20.088788, lon: -44.092452 }
    };

    const mockInstruments = [
      { id: 'PZ-MGB-01', estrutura: 'PDE MANGABA', tipo: 'PZ', status: 'Normal' },
      { id: 'INA-MGB-02', estrutura: 'PDE MANGABA', tipo: 'INA', status: 'Normal' }
    ];

    const mockAnomalias = [
      { id: 'ANOM-01', estrutura: 'PDE MANGABA', descricao: 'Trinca superficial', status: 'Em Análise' }
    ];

    const mockTickets = [
      { id: 'TKT-101', numero: '132707', estrutura: 'PDE Mangaba', status: 'Em Execução' }
    ];

    const onNavigateTab = vi.fn();
    const onNavigateModule = vi.fn();
    const onFocusStructure = vi.fn();

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <SysdamEmpreendimentosPanel
          estruturas={[testStructure]}
          selectedEstrutura={testStructure}
          isFlipped={true}
          instruments={mockInstruments}
          anomalias={mockAnomalias}
          fluigTickets={mockTickets}
          onNavigateTab={onNavigateTab}
          onNavigateModule={onNavigateModule}
          onFocusStructure={onFocusStructure}
        />
      );
    });

    // Verify Side B header and full technical dossier information
    expect(container.textContent).toContain('PDE Mangaba');
    expect(container.textContent).toContain('Pilha de Disposição de Estéril Mangaba');
    expect(container.textContent).toContain('DCE Vigente');
    expect(container.textContent).toContain('Operação Regular');
    expect(container.textContent).toContain('Camadas Compactadas de Estéril Friável');
    expect(container.textContent).toContain('Deposição Geotécnica de Estéril Itabirítico');
    expect(container.textContent).toContain('Dique de Contenção de Pé');
    expect(container.textContent).toContain('ANM & FEAM');
    expect(container.textContent).toContain('840 m');
    expect(container.textContent).toContain('50 m');
    expect(container.textContent).toContain('2.400.000 m³');
    expect(container.textContent).toContain('UTM 23S:');

    // Verify all 5 Operational Modules are present
    expect(container.textContent).toContain('Monitoramento Piezométrico');
    expect(container.textContent).toContain('Inspeções Regulares & Anomalias');
    expect(container.textContent).toContain('Topografia & Geometria 030-MINA');
    expect(container.textContent).toContain('Cadastro Técnico & DCE');
    expect(container.textContent).toContain('Chamados & Manutenção PCMI');

    // Find and click the cards
    const piezometriaEl = Array.from(container.querySelectorAll('div')).find(
      el => el.textContent.includes('Monitoramento Piezométrico') && el.getAttribute('role') === 'button'
    );
    expect(piezometriaEl).toBeDefined();
    await act(async () => {
      piezometriaEl.click();
    });
    expect(onNavigateModule).toHaveBeenCalledWith('piezometria', testStructure);

    const anomaliasEl = Array.from(container.querySelectorAll('div')).find(
      el => el.textContent.includes('Inspeções Regulares & Anomalias') && el.getAttribute('role') === 'button'
    );
    expect(anomaliasEl).toBeDefined();
    await act(async () => {
      anomaliasEl.click();
    });
    expect(onNavigateModule).toHaveBeenCalledWith('anomalias_inspecoes', testStructure);

    const chamadosEl = Array.from(container.querySelectorAll('div')).find(
      el => el.textContent.includes('Chamados & Manutenção PCMI') && el.getAttribute('role') === 'button'
    );
    expect(chamadosEl).toBeDefined();
    await act(async () => {
      chamadosEl.click();
    });
    expect(onNavigateModule).toHaveBeenCalledWith('chamados', testStructure);

    const cadastroEl = Array.from(container.querySelectorAll('div')).find(
      el => el.textContent.includes('Cadastro Técnico & DCE') && el.getAttribute('role') === 'button'
    );
    expect(cadastroEl).toBeDefined();
    await act(async () => {
      cadastroEl.click();
    });
    expect(onNavigateModule).toHaveBeenCalledWith('estruturas', testStructure);

    // Clean up
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});

import { describe, it, expect } from 'vitest';
import React from 'react';
import { STRUCTURE_BOUNDARIES } from '../data/structureBoundaries';
import masterData from '../../public/data/geotech_master.json';

describe('All Modules Geotechnical Data & Map Verification', () => {
  it('should have all 8 mining structures from Banco_De_Dados.xlsx with exact coordinates', () => {
    expect(masterData.estruturas).toBeDefined();
    expect(masterData.estruturas.length).toBe(8);

    const expectedStructures = [
      'BARRAGEM B1',
      'BARRAGEM B4',
      'ENGENHO SECO',
      'JANGADA',
      'PDE ES1',
      'PDE JACÓ',
      'PDE MANGABA',
      'PILHA B2'
    ];

    expectedStructures.forEach(name => {
      const s = masterData.estruturas.find(st => st.nome === name);
      expect(s, `Estrutura ${name} não encontrada`).toBeDefined();
      expect(s.lat).toBeLessThan(-19.5);
      expect(s.lat).toBeGreaterThan(-20.5);
      expect(s.lon).toBeLessThan(-43.5);
      expect(s.lon).toBeGreaterThan(-44.5);
      expect(s.totalInstrumentos).toBeGreaterThan(0);
    });
  });

  it('should have 218 instruments all georeferenced with exact coordinates from Banco_De_Dados.xlsx', () => {
    expect(masterData.instrumentos).toBeDefined();
    expect(masterData.instrumentos.length).toBe(218);

    const withoutCoords = masterData.instrumentos.filter(i => !i.lat || !i.lon);
    expect(withoutCoords.length).toBe(0);

    masterData.instrumentos.forEach(inst => {
      expect(inst.id).toBeDefined();
      expect(inst.tipo).toBeDefined();
      expect(inst.estrutura).toBeDefined();
      expect(inst.lat).toBeLessThan(-19.5);
      expect(inst.lat).toBeGreaterThan(-20.5);
      expect(inst.lon).toBeLessThan(-43.5);
      expect(inst.lon).toBeGreaterThan(-44.5);
      expect(inst.coordenadaNS).toBeGreaterThan(7000000);
      expect(inst.coordenadaEW).toBeGreaterThan(500000);
    });
  });

  it('should have Limites defined for B1 and B4 from Banco_De_Dados.xlsx', () => {
    expect(masterData.limites).toBeDefined();
    expect(masterData.limites.BARRAGEM_B1).toBeDefined();
    expect(masterData.limites.BARRAGEM_B1.crista).toBe(851.66);
    expect(masterData.limites.BARRAGEM_B1.pe).toBe(823.66);

    expect(masterData.limites.BARRAGEM_B4).toBeDefined();
    expect(masterData.limites.BARRAGEM_B4.crista).toBe(1166.0);
    expect(masterData.limites.BARRAGEM_B4.pe).toBe(1077.0);
  });

  it('should have rich piezometric, flow rate, spillway and water level readings', () => {
    expect(masterData.leiturasPiezometricas.length).toBeGreaterThan(5000);
    expect(masterData.leiturasVazao.length).toBeGreaterThan(100);
    expect(masterData.leiturasVertedouro.length).toBeGreaterThan(1000);
    expect(masterData.nivelAgua.length).toBeGreaterThan(50);
  });

  it('should verify structure boundaries centers match exact Excel centroids', () => {
    STRUCTURE_BOUNDARIES.forEach(b => {
      const match = masterData.estruturas.find(s => s.id === b.id);
      expect(match).toBeDefined();
      expect(Math.abs(b.center[0] - match.lat)).toBeLessThan(0.005);
      expect(Math.abs(b.center[1] - match.lon)).toBeLessThan(0.005);
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';

// Polyfill localStorage and window in node test environment
const memoryStore = {};
const localStorageMock = {
  getItem: (key) => memoryStore[key] ?? null,
  setItem: (key, val) => { memoryStore[key] = String(val); },
  removeItem: (key) => { delete memoryStore[key]; },
  clear: () => {
    Object.keys(memoryStore).forEach(k => delete memoryStore[k]);
  }
};

globalThis.localStorage = localStorageMock;
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    dispatchEvent: () => true
  };
}
if (typeof globalThis.CustomEvent === 'undefined') {
  globalThis.CustomEvent = class CustomEvent {
    constructor(type, eventInitDict) {
      this.type = type;
      this.detail = eventInitDict?.detail;
    }
  };
}

import { mobileInspectionService, SITUACOES_REGISTRO, MAGNITUDES_REGISTRO } from '../services/mobileInspectionService';

describe('mobileInspectionService (SYSDAM APK)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Haversine Distance & Proximity', () => {
    it('should return 0 meters for identical coordinates', () => {
      const dist = mobileInspectionService.calculateDistance(-20.063818, -44.114360, -20.063818, -44.114360);
      expect(dist).toBe(0);
    });

    it('should calculate realistic distance between Barragem B1 and Barragem B4', () => {
      // B1: ~(-20.0638, -44.1147), B4: ~(-20.0890, -44.1005)
      const dist = mobileInspectionService.calculateDistance(-20.0638, -44.1147, -20.0890, -44.1005);
      expect(dist).toBeGreaterThan(2500); // ~3.1 km
      expect(dist).toBeLessThan(4000);
    });

    it('should return null safely for missing coordinates', () => {
      expect(mobileInspectionService.calculateDistance(null, null, -20.0, -44.0)).toBeNull();
      expect(mobileInspectionService.calculateDistance(undefined, -44.0, -20.0, -44.0)).toBeNull();
    });

    it('should format distances properly matching SYSDAM mobile badges', () => {
      expect(mobileInspectionService.formatDistance(null)).toBe('+999m');
      expect(mobileInspectionService.formatDistance(undefined)).toBe('+999m');
      expect(mobileInspectionService.formatDistance(120)).toBe('120m');
      expect(mobileInspectionService.formatDistance(850)).toBe('850m');
      expect(mobileInspectionService.formatDistance(1400)).toBe('+1.4km');
      expect(mobileInspectionService.formatDistance(3200)).toBe('+3.2km');
    });
  });

  describe('Checkpoints Catalog', () => {
    it('should return default checkpoints for Barragem B1 with technical conditions', () => {
      const cps = mobileInspectionService.getCheckpointsForStructure('B1');
      expect(cps.length).toBeGreaterThanOrEqual(2);

      const cp1 = cps[0];
      expect(cp1.nome).toBe('Checkpoint 1');
      expect(cp1.condicaoInicial).toContain('A foto seja tirada em pe pegando todo espaco da estrutura');
      expect(cp1.coords).toBeDefined();
    });

    it('should return fallback checkpoints for uncatalogued structures', () => {
      const cps = mobileInspectionService.getCheckpointsForStructure('ESTRUTURA_NOVA');
      expect(cps.length).toBe(2);
      expect(cps[0].nome).toBe('Checkpoint 1');
    });
  });

  describe('Campaign Stopwatch Time Formatting', () => {
    it('should format 0 seconds to 00h 00m', () => {
      expect(mobileInspectionService.formatTimeSpent(0)).toBe('00h 00m');
    });

    it('should format minutes and hours properly', () => {
      expect(mobileInspectionService.formatTimeSpent(125)).toBe('00h 02m');
      expect(mobileInspectionService.formatTimeSpent(3600)).toBe('01h 00m');
      expect(mobileInspectionService.formatTimeSpent(3720)).toBe('01h 02m');
    });
  });

  describe('Record Creation with Situation, Description and Magnitude', () => {
    it('should export standard SYSDAM situation and magnitude options', () => {
      expect(SITUACOES_REGISTRO.map(s => s.id)).toEqual(['PV', 'RA', 'MO']);
      expect(MAGNITUDES_REGISTRO.map(m => m.id)).toEqual(['insignificante', 'pequena', 'media', 'grande']);
    });

    it('should create an anomaly record with situation (PV), 500-char truncated description and magnitude', () => {
      const record = mobileInspectionService.createInspectionRecord({
        sintoma: 'Buraco',
        situacao: 'PV',
        descricao: 'Buraco identificado na crista da Barragem B1 próximo ao marco M-02',
        magnitude: 'pequena',
        estrutura: 'Barragem B1',
        siglaEstrutura: 'B1'
      });

      expect(record.id).toMatch(/^ANOM-\d{4}$/);
      expect(record.sintoma).toBe('Buraco');
      expect(record.situacao).toBe('(PV)');
      expect(record.magnitude).toBe('Pequena');
      expect(record.origem).toBe('APLICATIVO_MOBILE_APK');
      expect(record.descricao).toContain('Buraco identificado na crista');
    });
  });
});

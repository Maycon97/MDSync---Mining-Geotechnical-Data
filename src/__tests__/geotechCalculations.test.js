import { describe, it, expect } from 'vitest';

describe('Geotechnical Formulas & Business Logic', () => {
  describe('Piezometer Water Level (Cota d\'Água)', () => {
    // Formula: Cota d'Água = Cota da Boca (Topo do Tubo) - Profundidade da Linha d'Água (Nível)
    function calculateCotaAgua(cotaBoca, profundidade) {
      if (typeof cotaBoca !== 'number' || typeof profundidade !== 'number') return null;
      if (profundidade < 0) return null; // Profundidade negativa é fisicamente inválida
      return Number((cotaBoca - profundidade).toFixed(2));
    }

    it('should correctly compute cota d\'água from boca and depth', () => {
      const cotaBoca = 850.50; // metros
      const profundidade = 12.30; // metros medidos com pio elétrico
      const result = calculateCotaAgua(cotaBoca, profundidade);
      expect(result).toBe(838.20);
    });

    it('should reject invalid or negative depth measurements', () => {
      expect(calculateCotaAgua(850.50, -5)).toBeNull();
      expect(calculateCotaAgua('invalid', 10)).toBeNull();
    });
  });

  describe('Flow Rate (Vazão Medidor Triangular / Calha Parshall)', () => {
    // Conversão de Tempo para Encher Balde Volumétrico (L/s)
    // Q = Volume (litros) / Tempo (segundos)
    function calculateVazaoVolumetrica(volumeLitros, tempoSegundos) {
      if (!volumeLitros || !tempoSegundos || tempoSegundos <= 0) return 0;
      return Number((volumeLitros / tempoSegundos).toFixed(3));
    }

    it('should calculate flow rate in L/s from volumetric bucket test', () => {
      const volume = 20; // 20 Litros
      const tempo = 8.5; // 8.5 segundos no cronômetro
      const q = calculateVazaoVolumetrica(volume, tempo);
      expect(q).toBe(2.353); // L/s
    });

    it('should return 0 when time is zero or invalid to prevent division by zero', () => {
      expect(calculateVazaoVolumetrica(20, 0)).toBe(0);
      expect(calculateVazaoVolumetrica(0, 10)).toBe(0);
    });
  });

  describe('Geotechnical Limit Thresholds (Limiares de Alerta)', () => {
    // Classificação de risco:
    // NORMAL: Cota < Alerta
    // ATENCAO: Alerta <= Cota < Emergencia
    // EMERGENCIA: Cota >= Emergencia
    function classifyRisk(cota, limiarAlerta, limiarEmergencia) {
      if (typeof cota !== 'number') return 'DESCONHECIDO';
      if (cota >= limiarEmergencia) return 'EMERGÊNCIA';
      if (cota >= limiarAlerta) return 'ALERTA / ATENÇÃO';
      return 'NORMAL';
    }

    it('should classify normal status when water level is below alert threshold', () => {
      expect(classifyRisk(830.0, 840.0, 845.0)).toBe('NORMAL');
    });

    it('should classify alert status when water level reaches or exceeds alert threshold', () => {
      expect(classifyRisk(840.0, 840.0, 845.0)).toBe('ALERTA / ATENÇÃO');
      expect(classifyRisk(843.5, 840.0, 845.0)).toBe('ALERTA / ATENÇÃO');
    });

    it('should classify emergency status when water level reaches or exceeds emergency threshold', () => {
      expect(classifyRisk(845.0, 840.0, 845.0)).toBe('EMERGÊNCIA');
      expect(classifyRisk(849.0, 840.0, 845.0)).toBe('EMERGÊNCIA');
    });
  });
});

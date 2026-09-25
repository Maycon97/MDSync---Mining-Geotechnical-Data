import { describe, it, expect } from 'vitest';

describe('Field Collection (Inspect) & Geotechnical Module Null Safety', () => {
  it('should safely calculate lastDeltaCm when an instrument has NO previous reading (1 or 0 readings)', () => {
    // Replicate the exact logic from FieldCollectionTab.jsx
    const calculateLastDelta = (lastHistoricalReading, previousHistoricalReading) => {
      if (
        lastHistoricalReading &&
        previousHistoricalReading &&
        lastHistoricalReading.leitura != null &&
        previousHistoricalReading.leitura != null &&
        !isNaN(Number(lastHistoricalReading.leitura)) &&
        !isNaN(Number(previousHistoricalReading.leitura))
      ) {
        const diff = Number(lastHistoricalReading.leitura) - Number(previousHistoricalReading.leitura);
        return Number((diff * 100).toFixed(1));
      }
      return null;
    };

    // Case 1: No readings at all
    expect(calculateLastDelta(null, null)).toBeNull();

    // Case 2: Exactly 1 reading -> previousHistoricalReading is null (The exact user bug!)
    const singleReading = { data: '2026-09-01', leitura: 12.45, cota: 840.12 };
    expect(() => calculateLastDelta(singleReading, null)).not.toThrow();
    expect(calculateLastDelta(singleReading, null)).toBeNull();

    // Case 3: 2 readings with valid numbers
    const prevReading = { data: '2026-08-25', leitura: 12.40, cota: 840.17 };
    const delta = calculateLastDelta(singleReading, prevReading);
    expect(delta).toBe(5.0); // (12.45 - 12.40) * 100 = 5.0 cm

    // Case 4: Readings with null leitura
    const nullLeituraReading = { data: '2026-08-25', leitura: null, cota: 840.17 };
    expect(calculateLastDelta(singleReading, nullLeituraReading)).toBeNull();
  });

  it('should safely resolve ultimaLeituraPiu when lastHistoricalReading is null or has null leitura', () => {
    const resolveUltimaLeituraPiu = (lastHistoricalReading, currentInst, isPiuInstrument) => {
      return (lastHistoricalReading && lastHistoricalReading.leitura != null && !isNaN(Number(lastHistoricalReading.leitura)))
        ? Number(lastHistoricalReading.leitura)
        : (currentInst?.ultimaLeituraPiu != null && !isNaN(Number(currentInst.ultimaLeituraPiu))
            ? Number(currentInst.ultimaLeituraPiu)
            : ((currentInst?.cotaTopo != null && currentInst?.ultimaCota != null && isPiuInstrument) 
                ? Number((Number(currentInst.cotaTopo) - Number(currentInst.ultimaCota)).toFixed(3)) 
                : null
              ));
    };

    // Instrument with no history but has cotaTopo & ultimaCota
    const inst = { tipo: 'PZ', id: 'PZ-01', cotaTopo: 850.00, ultimaCota: 838.50 };
    expect(resolveUltimaLeituraPiu(null, inst, true)).toBe(11.500);

    // Instrument with history containing leitura
    const lastReading = { leitura: 11.48 };
    expect(resolveUltimaLeituraPiu(lastReading, inst, true)).toBe(11.48);

    // Instrument with history containing null leitura
    const nullReading = { leitura: null };
    expect(resolveUltimaLeituraPiu(nullReading, inst, true)).toBe(11.500);

    // Completely empty
    expect(resolveUltimaLeituraPiu(null, null, true)).toBeNull();
  });

  it('should safely handle trendAnalysis with fewer than 2 readings or missing values', () => {
    const evaluateTrend = (instrumentHistory) => {
      if (!Array.isArray(instrumentHistory) || instrumentHistory.length < 2) {
        return { status: 'ESTÁVEL', icon: '↔', color: 'var(--geo-normal)' };
      }
      const recent = instrumentHistory.slice(-4);
      const firstItem = recent[0];
      const lastItem = recent[recent.length - 1];
      if (!firstItem || !lastItem) {
        return { status: 'ESTÁVEL', icon: '↔', color: 'var(--geo-normal)' };
      }
      const firstVal = firstItem.cota ?? firstItem.leitura;
      const lastVal = lastItem.cota ?? lastItem.leitura;
      if (firstVal == null || lastVal == null || isNaN(Number(firstVal)) || isNaN(Number(lastVal))) {
        return { status: 'ESTÁVEL', icon: '↔', color: 'var(--geo-normal)' };
      }
      const diff = Number(lastVal) - Number(firstVal);

      if (diff > 0.15) {
        return { status: 'ELEVAÇÃO (↗)', icon: '↗', color: 'var(--geo-atencao)' };
      } else if (diff < -0.15) {
        return { status: 'REBAIXAMENTO (↘)', icon: '↘', color: 'var(--geo-normal)' };
      }
      return { status: 'ESTÁVEL (↔)', icon: '↔', color: 'var(--geo-normal)' };
    };

    expect(evaluateTrend([])).toEqual({ status: 'ESTÁVEL', icon: '↔', color: 'var(--geo-normal)' });
    expect(evaluateTrend([{ leitura: 10 }])).toEqual({ status: 'ESTÁVEL', icon: '↔', color: 'var(--geo-normal)' });
    expect(evaluateTrend([{ leitura: null }, { leitura: null }])).toEqual({ status: 'ESTÁVEL', icon: '↔', color: 'var(--geo-normal)' });
    expect(evaluateTrend([{ cota: 850.0 }, { cota: 850.25 }]).status).toBe('ELEVAÇÃO (↗)');
    expect(evaluateTrend([{ cota: 850.25 }, { cota: 850.0 }]).status).toBe('REBAIXAMENTO (↘)');
  });

  it('should safely guard PiezometryTab statsIntervalo formatting against null', () => {
    const formatStats = (statsIntervalo) => {
      if (statsIntervalo && statsIntervalo.minCota != null && statsIntervalo.maxCota != null) {
        return `• Cotas: ${statsIntervalo.minCota.toFixed(2)} m a ${statsIntervalo.maxCota.toFixed(2)} m`;
      }
      return null;
    };

    expect(formatStats(null)).toBeNull();
    expect(formatStats({ minCota: null, maxCota: null })).toBeNull();
    expect(formatStats({ minCota: 820.5, maxCota: 845.2 })).toBe('• Cotas: 820.50 m a 845.20 m');
  });
});

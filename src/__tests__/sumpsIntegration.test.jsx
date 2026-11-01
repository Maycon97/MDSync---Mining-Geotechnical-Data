import { describe, it, expect } from 'vitest';
import { SUMPS_DATA } from '../data/sumpsData';

describe('SUMPs Integration & Executive Panel Data', () => {
  it('should have official sumps georeferenced with valid coordinates', () => {
    expect(SUMPS_DATA).toBeDefined();
    expect(SUMPS_DATA.length).toBeGreaterThanOrEqual(90);

    const withCoords = SUMPS_DATA.filter(s => typeof s.lat === 'number' && typeof s.lon === 'number');
    expect(withCoords.length).toBe(SUMPS_DATA.length);

    withCoords.forEach(s => {
      expect(s.lat).toBeLessThan(0); // Southern hemisphere (Itaminas Minas Gerais)
      expect(s.lon).toBeLessThan(0); // Western hemisphere
      expect(s.tag).toMatch(/^ITA-/);
      expect(['ENGENHO SECO', 'JANGADA']).toContain(s.mina);
    });
  });

  it('should contain valid operational metrics for capacity and utilization', () => {
    const totalCap = SUMPS_DATA.reduce((acc, s) => acc + (s.cap || 0), 0);
    const totalUtil = SUMPS_DATA.reduce((acc, s) => acc + (s.util || 0), 0);

    expect(totalCap).toBeGreaterThan(0);
    expect(totalUtil).toBeGreaterThan(0);
    
    // Utilization rate should be positive
    const pct = totalUtil / totalCap;
    expect(pct).toBeGreaterThan(0);
  });

  it('should classify sumps according to official criticality categories', () => {
    const validCrits = ['Crítico', 'Moderado', 'Leve', 'Muito Crítico'];
    SUMPS_DATA.forEach(s => {
      if (s.crit) {
        expect(validCrits).toContain(s.crit);
      }
    });

    const criticos = SUMPS_DATA.filter(s => s.crit === 'Crítico');
    expect(criticos.length).toBeGreaterThan(0);
  });
});


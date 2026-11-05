import { describe, it, expect } from 'vitest';
import { 
  PLUVIOMETRIA_DATA, 
  MONTH_LABELS, 
  STATION_NAMES, 
  getStationName, 
  formatNumber 
} from '../data/pluviometriaData';
import { TABS } from '../components/Navigation';

describe('Pluviometria & Clima - Painel Executivo', () => {
  it('should have valid and complete historical data structure', () => {
    expect(PLUVIOMETRIA_DATA).toBeDefined();
    expect(Array.isArray(PLUVIOMETRIA_DATA.daily)).toBe(true);
    expect(Array.isArray(PLUVIOMETRIA_DATA.stagg)).toBe(true);
    expect(Array.isArray(PLUVIOMETRIA_DATA.locs)).toBe(true);
    expect(Array.isArray(PLUVIOMETRIA_DATA.anos)).toBe(true);

    // Deve cobrir a série contínua de 2018 a 2026
    expect(PLUVIOMETRIA_DATA.anos).toEqual([2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]);
    expect(PLUVIOMETRIA_DATA.daily.length).toBeGreaterThan(3000);
    expect(PLUVIOMETRIA_DATA.nstations).toBe(5);
  });

  it('should contain the 5 official Itaminas rain gauge stations with valid coordinates', () => {
    expect(PLUVIOMETRIA_DATA.locs.length).toBe(5);
    const stationCodes = PLUVIOMETRIA_DATA.locs.map(l => l.loc);

    expect(stationCodes).toContain('PLATAFORMA');
    expect(stationCodes).toContain('PATIO DE PRODUTOS');
    expect(stationCodes).toContain('BARRAGEM B1');
    expect(stationCodes).toContain('PILHA B2');
    expect(stationCodes).toContain('BARRAGEM B4');

    PLUVIOMETRIA_DATA.locs.forEach(station => {
      expect(station.lat).toBeLessThan(-19.9);
      expect(station.lat).toBeGreaterThan(-20.2);
      expect(station.lon).toBeLessThan(-44.0);
      expect(station.lon).toBeGreaterThan(-44.3);
    });
  });

  it('should correctly format station names and numbers', () => {
    expect(getStationName('BARRAGEM B1')).toBe('Barragem B1');
    expect(getStationName('BARRAGEM B4')).toBe('Barragem B4');
    expect(getStationName('PILHA B2')).toBe('Pilha B2');
    expect(getStationName('PLATAFORMA')).toBe('Plataforma');
    expect(getStationName('PATIO DE PRODUTOS')).toBe('Pátio de Produtos');
    expect(getStationName('OUTRA')).toBe('OUTRA');

    expect(formatNumber(1245.678, 1)).toBe('1.245,7');
    expect(formatNumber(0, 1)).toBe('0,0');
    expect(formatNumber(null)).toBe('0,0');
  });

  it('should properly calculate aggregations for year and month filters', () => {
    // Filtrar ano 2026
    const daily2026 = PLUVIOMETRIA_DATA.daily.filter(x => x.d.startsWith('2026'));
    expect(daily2026.length).toBeGreaterThan(300);

    const soma2026 = daily2026.reduce((acc, curr) => acc + curr.v, 0);
    expect(soma2026).toBeGreaterThan(500); // Pluviometria de 2026 acumulada

    // Verificar dados dos meses recentes (Setembro, Outubro, Novembro 2026)
    const stagg2026 = PLUVIOMETRIA_DATA.stagg.filter(s => s.ano === 2026);
    expect(stagg2026.length).toBeGreaterThan(0);

    const staggSetembro = stagg2026.filter(s => s.mes === 9);
    const staggOutubro = stagg2026.filter(s => s.mes === 10);
    const staggNovembro = stagg2026.filter(s => s.mes === 11);

    expect(staggSetembro.length).toBeGreaterThanOrEqual(4);
    expect(staggOutubro.length).toBeGreaterThanOrEqual(4);
    expect(staggNovembro.length).toBeGreaterThanOrEqual(4);

    expect(PLUVIOMETRIA_DATA.datamax).toBe('2026-11-02');
    expect(PLUVIOMETRIA_DATA.totalLeituras).toBeGreaterThanOrEqual(14371);
  });

  it('should have 12 month labels in correct sequence', () => {
    expect(MONTH_LABELS.length).toBe(12);
    expect(MONTH_LABELS[0]).toBe('Jan');
    expect(MONTH_LABELS[11]).toBe('Dez');
  });

  it('should register pluviometria tab in Navigation TABS', () => {
    const pluvioTab = TABS.find(t => t.id === 'pluviometria');
    expect(pluvioTab).toBeDefined();
    expect(pluvioTab.label).toBe('Pluviometria & Clima');
    expect(pluvioTab.desc).toContain('Pluviometria');
  });
});


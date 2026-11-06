import { describe, it, expect } from 'vitest';
import masterData from '../../public/data/geotech_master.json';
import { normalizeStructureKey, STRUCTURE_KEY_MAP } from '../context/GeotechDataContext';

describe('Geotechnical Services & Full Dashboard Data Verification', () => {
  it('should have all 8 structures and 218 instruments in master data', () => {
    expect(masterData.estruturas.length).toBe(8);
    expect(masterData.instrumentos.length).toBeGreaterThanOrEqual(218);
  });

  it('should verify normalizeStructureKey correctly normalizes aliases and siglas', () => {
    expect(normalizeStructureKey('B1')).toBe('BARRAGEM_B1');
    expect(normalizeStructureKey('B4')).toBe('BARRAGEM_B4');
    expect(normalizeStructureKey('B2')).toBe('PILHA_B2');
    expect(normalizeStructureKey('ES1')).toBe('PDE_ES1');
    expect(normalizeStructureKey('JC')).toBe('PDE_JACÓ');
    expect(normalizeStructureKey('MG')).toBe('PDE_MANGABA');
    expect(normalizeStructureKey('JANGADA')).toBe('JANGADA');
    expect(normalizeStructureKey('ENGENHO')).toBe('ENGENHO_SECO');
    expect(normalizeStructureKey('TODAS')).toBe('TODAS');
    expect(normalizeStructureKey('')).toBe('TODAS');
  });

  it('should have all new consolidated geotechnical services datasets in geotech_master.json', () => {
    // 1. Demandas Regulatórias (ANM, FEAM, MPMG)
    expect(masterData.demandasRegulatorias).toBeDefined();
    expect(masterData.demandasRegulatorias.length).toBeGreaterThanOrEqual(90);

    // 2. Rotina da Equipe de Geotecnia
    expect(masterData.rotinaGeotecnia).toBeDefined();
    expect(masterData.rotinaGeotecnia.length).toBeGreaterThanOrEqual(400);

    // 3. Exigências Extraordinárias e PSB
    expect(masterData.exigenciasExtraordinarias).toBeDefined();
    expect(masterData.exigenciasExtraordinarias.length).toBeGreaterThanOrEqual(400);
    expect(masterData.planoSegurancaBarragens).toBeDefined();
    expect(masterData.planoSegurancaBarragens.length).toBeGreaterThanOrEqual(100);

    // 4. Fatores de Segurança (FoS)
    expect(masterData.fatoresSeguranca).toBeDefined();
    expect(masterData.fatoresSeguranca.length).toBeGreaterThanOrEqual(200);

    // 5. Georadar SSR929 FX
    expect(masterData.radarEventos).toBeDefined();
    expect(masterData.radarEventos.length).toBeGreaterThanOrEqual(300);

    // 6. Cronograma Físico PCMI
    expect(masterData.cronogramaPcmi).toBeDefined();
    expect(masterData.cronogramaPcmi.length).toBeGreaterThanOrEqual(1500);

    // 7. Pendências Contratuais e Pareceres Jurídicos
    expect(masterData.pendenciasContratuais).toBeDefined();
    expect(masterData.pendenciasContratuais.length).toBeGreaterThanOrEqual(70);
  });
});


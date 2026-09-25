import { describe, it, expect } from 'vitest';
import GeotechCrossSectionTab, { 
  SECTIONS_DATA, 
  LITHOLOGIES, 
  ENGEMEC_MINA_CAMPAIGNS_2026, 
  ITAMINAS_GEOM_CODES, 
  evaluateSlopeGeometry 
} from '../components/GeotechCrossSectionTab';
import { 
  ENGENHO_SECO_BLOCK_MODELS, 
  ENGENHO_SECO_SECTORS, 
  DATAMINE_BLOCK_LITHOLOGIES, 
  generateBlockSlice 
} from '../data/engenhoSecoBlockModelData';

describe('Datamine Studio RM 2D Cross Section Module', () => {
  it('should export GeotechCrossSectionTab component as default', () => {
    expect(GeotechCrossSectionTab).toBeDefined();
    expect(typeof GeotechCrossSectionTab).toBe('function');
  });

  it('should have all 7 sections defined with azimuth, elevation, and instrument data', () => {
    expect(SECTIONS_DATA.length).toBe(7);
    SECTIONS_DATA.forEach(sec => {
      expect(sec.id).toBeDefined();
      expect(sec.nome).toBeDefined();
      expect(sec.estruturaId).toBeDefined();
      expect(sec.cotaCrista).toBeGreaterThan(sec.cotaPe);
      expect(sec.cotaPe).toBeGreaterThan(sec.cotaFundacao);
      expect(sec.azimute).toBeDefined();
      expect(sec.fatorSeguranca).toBeGreaterThan(1.0);
      expect(sec.instrumentos.length).toBeGreaterThan(0);
      expect(sec.bermas.length).toBeGreaterThan(0);
      expect(sec.drillholes.length).toBeGreaterThan(0);
    });
  });

  it('should define key mineral and rock lithologies with geomechanical parameters', () => {
    const requiredLithologies = ['CANGA', 'IF', 'IC', 'HEM', 'BATATAL', 'ATERRO', 'SAPROLITO'];
    requiredLithologies.forEach(key => {
      const lito = LITHOLOGIES[key];
      expect(lito).toBeDefined();
      expect(lito.cor).toBeDefined();
      expect(lito.pesoEsp).toBeGreaterThan(15);
      expect(lito.coesao).toBeGreaterThan(0);
      expect(lito.atrito).toBeGreaterThan(20);
      expect(lito.rqdPadrao).toBeGreaterThan(10);
    });
  });

  it('should validate drillhole lithology intervals match LITHOLOGIES catalog', () => {
    SECTIONS_DATA.forEach(sec => {
      sec.drillholes.forEach(dh => {
        expect(dh.id).toBeDefined();
        expect(dh.bocaCota).toBeGreaterThan(0);
        expect(dh.profundidade).toBeGreaterThan(0);
        expect(dh.rqdMedio).toBeGreaterThan(0);
        expect(dh.intervalos.length).toBeGreaterThan(0);
        dh.intervalos.forEach(interv => {
          expect(LITHOLOGIES[interv.litologia]).toBeDefined();
          expect(interv.ate).toBeGreaterThan(interv.de);
        });
      });
    });
  });

  it('should validate all monitoring instruments on sections have valid coordinates and piezometric heads', () => {
    SECTIONS_DATA.forEach(sec => {
      sec.instrumentos.forEach(inst => {
        expect(inst.id).toBeDefined();
        expect(inst.tipo).toBeDefined();
        expect(inst.x).toBeGreaterThan(0);
        expect(inst.bocaCota).toBeGreaterThan(inst.pontaCota);
        expect(inst.naAtual).toBeDefined();
        expect(inst.naAtual).toBeLessThanOrEqual(inst.bocaCota);
      });
    });
  });

  it('should contain specific sections for B1, B4, PDE ES1, Jangada, PDE Mangaba, PDE Jaco and Engenho Seco', () => {
    const structureIds = SECTIONS_DATA.map(s => s.estruturaId);
    expect(structureIds).toContain('BARRAGEM_B1');
    expect(structureIds).toContain('BARRAGEM_B4');
    expect(structureIds).toContain('PDE_ES1');
    expect(structureIds).toContain('JANGADA');
    expect(structureIds).toContain('PDE_MANGABA');
    expect(structureIds).toContain('PDE_JACO');
    expect(structureIds).toContain('ENGENHO_SECO');
  });

  it('should export all 12 monthly Engemec 2026 topography campaigns (030-MINA)', () => {
    expect(ENGEMEC_MINA_CAMPAIGNS_2026).toBeDefined();
    expect(ENGEMEC_MINA_CAMPAIGNS_2026.length).toBe(12);
    
    // Check OS identifiers from OS-0102 to OS-0341
    const osList = ENGEMEC_MINA_CAMPAIGNS_2026.map(c => c.os);
    expect(osList).toContain('OS-0102');
    expect(osList).toContain('OS-0230');
    expect(osList).toContain('OS-0341');

    ENGEMEC_MINA_CAMPAIGNS_2026.forEach(camp => {
      expect(camp.os).toMatch(/^OS-\d{4}$/);
      expect(camp.mes).toBeDefined();
      expect(camp.data).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(camp.status).toBeDefined();
      expect(camp.arquivos.length).toBeGreaterThan(0);
      expect(camp.cotaReferencia).toBe('SIRGAS 2000');
    });
  });

  it('should define the 6 Itaminas geotechnical geometry diagnostic codes with Datamine colors', () => {
    expect(ITAMINAS_GEOM_CODES).toBeDefined();
    const codes = ['01_APROVADO', '02_TALUDE_ALTO', '03_FACE_VERTICAL', '04_FACE_SUAVE', '05_TALUDE_ALTO_E_VERTICAL', 'BERMA_ESTREITA'];
    codes.forEach(code => {
      const item = ITAMINAS_GEOM_CODES[code];
      expect(item).toBeDefined();
      expect(item.codigo).toBe(code);
      expect(item.nome).toBeDefined();
      expect(item.cor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(typeof item.corDatamine).toBe('number');
      expect(item.descricao).toBeDefined();
    });

    // Check specific Datamine palette color indices
    expect(ITAMINAS_GEOM_CODES['01_APROVADO'].corDatamine).toBe(5);
    expect(ITAMINAS_GEOM_CODES['02_TALUDE_ALTO'].corDatamine).toBe(2);
    expect(ITAMINAS_GEOM_CODES['03_FACE_VERTICAL'].corDatamine).toBe(8);
    expect(ITAMINAS_GEOM_CODES['04_FACE_SUAVE'].corDatamine).toBe(35);
    expect(ITAMINAS_GEOM_CODES['05_TALUDE_ALTO_E_VERTICAL'].corDatamine).toBe(3);
    expect(ITAMINAS_GEOM_CODES['BERMA_ESTREITA'].corDatamine).toBe(11);
  });

  it('should execute evaluateSlopeGeometry for all cross sections and return valid audit metrics', () => {
    SECTIONS_DATA.forEach(section => {
      const result = evaluateSlopeGeometry(section, 10, 5.0, 1.0);
      expect(result).toBeDefined();
      expect(result.totalBancadas).toBe(section.bermas.length - 1);
      expect(result.bancadas.length).toBe(result.totalBancadas);
      expect(result.conformidadePercent).toBeGreaterThanOrEqual(0);
      expect(result.conformidadePercent).toBeLessThanOrEqual(100);
      expect(result.aprovadosCount).toBeLessThanOrEqual(result.totalBancadas);

      result.bancadas.forEach(b => {
        expect(b.indice).toBeGreaterThan(0);
        expect(b.nome).toBeDefined();
        expect(b.hReal).toBeGreaterThan(0);
        expect(b.anguloFaceReal).toBeGreaterThan(0);
        expect(b.diagCodigo).toBeDefined();
        expect(ITAMINAS_GEOM_CODES[b.diagCodigo]).toBeDefined();
        expect(b.diagCor).toBeDefined();
        expect(['OK', 'BAIXO', 'MEDIO', 'ALTO', 'CRITICO']).toContain(b.severidade);
        expect(b.drenagemOk).toBe(true);
      });
    });
  });

  it('should handle edge cases in evaluateSlopeGeometry gracefully', () => {
    // Null or invalid section
    expect(evaluateSlopeGeometry(null)).toEqual({ bancadas: [], totalBancadas: 0, aprovadosCount: 0, conformidadePercent: 100 });
    expect(evaluateSlopeGeometry({})).toEqual({ bancadas: [], totalBancadas: 0, aprovadosCount: 0, conformidadePercent: 100 });
    expect(evaluateSlopeGeometry({ bermas: [{ nome: 'Crista', cota: 800, x: 100 }] })).toEqual({ bancadas: [], totalBancadas: 0, aprovadosCount: 0, conformidadePercent: 100 });

    // Custom tight tolerances
    const testSection = SECTIONS_DATA[0];
    const strictResult = evaluateSlopeGeometry(testSection, 1, 0.5, 0.1);
    expect(strictResult.totalBancadas).toBe(testSection.bermas.length - 1);
    expect(typeof strictResult.conformidadePercent).toBe('number');
  });
});

describe('Mina Engenho Seco - Modelos de Bloco Curto Prazo (CP)', () => {
  it('should export all 11 monthly block models from Fev/26 to Dez/26', () => {
    expect(ENGENHO_SECO_BLOCK_MODELS).toBeDefined();
    expect(ENGENHO_SECO_BLOCK_MODELS.length).toBe(11);

    const modelIds = ENGENHO_SECO_BLOCK_MODELS.map(m => m.id);
    expect(modelIds).toContain('BM_0226');
    expect(modelIds).toContain('BM_0826');
    expect(modelIds).toContain('BM_0926');
    expect(modelIds).toContain('BM_1226');

    ENGENHO_SECO_BLOCK_MODELS.forEach(m => {
      expect(m.id).toMatch(/^BM_\d{4}$/);
      expect(m.mes).toBeDefined();
      expect(m.arquivo).toBeDefined();
      expect(m.romEspecial.massa).toBeGreaterThan(0);
      expect(m.romEspecial.fe).toBeGreaterThan(50);
      expect(m.romEspecial.sio2).toBeGreaterThan(0);
      expect(m.romComum.massa).toBeGreaterThan(0);
      expect(m.esteril.massa).toBeGreaterThan(0);
      expect(m.bancadasAtivas.length).toBeGreaterThan(0);
    });
  });

  it('should define the 4 georeferenced sectors of Mina Engenho Seco', () => {
    expect(ENGENHO_SECO_SECTORS).toBeDefined();
    expect(ENGENHO_SECO_SECTORS.length).toBe(4);

    const sectorIds = ENGENHO_SECO_SECTORS.map(s => s.id);
    expect(sectorIds).toContain('ENS_INDIA');
    expect(sectorIds).toContain('ENS_OESTE_INF');
    expect(sectorIds).toContain('ENS_PILHAO_MANGABA');
    expect(sectorIds).toContain('ENS_SAMAMBAIA');

    ENGENHO_SECO_SECTORS.forEach(sec => {
      expect(sec.nome).toBeDefined();
      expect(sec.centroWGS84[0]).toBeLessThan(-20.0);
      expect(sec.centroWGS84[1]).toBeLessThan(-44.0);
      expect(sec.centroUTM23S.easting).toBeGreaterThan(500000);
      expect(sec.centroUTM23S.northing).toBeGreaterThan(7000000);
      expect(sec.coordinates.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('should define Datamine block lithologies with density, geomechanical properties, and colors', () => {
    const requiredKeys = ['hgo', 'ifr', 'igo', 'if', 'ial', 'ic', 'ia', 'at'];
    requiredKeys.forEach(k => {
      const lito = DATAMINE_BLOCK_LITHOLOGIES[k];
      expect(lito).toBeDefined();
      expect(lito.codigo).toBe(k);
      expect(lito.densidadePadrao).toBeGreaterThan(1.5);
      expect(lito.cor).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('should generate valid 2D block slices for any bench elevation and sector', () => {
    const sliceIndia850 = generateBlockSlice(850, 'ENS_INDIA', 'BM_0926');
    expect(sliceIndia850).toBeDefined();
    expect(sliceIndia850.length).toBeGreaterThan(0);

    sliceIndia850.forEach(b => {
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.cota).toBe(850);
      expect(b.litologia).toBeDefined();
      expect(b.fe).toBeGreaterThanOrEqual(0);
      expect(b.sio2).toBeGreaterThanOrEqual(0);
      expect(b.fsBancada).toBeGreaterThan(0);
    });
  });
});

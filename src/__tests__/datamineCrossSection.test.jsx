import { describe, it, expect } from 'vitest';
import GeotechCrossSectionTab, { SECTIONS_DATA, LITHOLOGIES } from '../components/GeotechCrossSectionTab';

describe('Datamine Studio RM 2D Cross Section Module', () => {
  it('should export GeotechCrossSectionTab component as default', () => {
    expect(GeotechCrossSectionTab).toBeDefined();
    expect(typeof GeotechCrossSectionTab).toBe('function');
  });

  it('should have all 6 sections defined with azimuth, elevation, and instrument data', () => {
    expect(SECTIONS_DATA.length).toBe(6);
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

  it('should contain specific sections for B1, B4, PDE ES1, Jangada, PDE Mangaba and PDE Jaco', () => {
    const structureIds = SECTIONS_DATA.map(s => s.estruturaId);
    expect(structureIds).toContain('BARRAGEM_B1');
    expect(structureIds).toContain('BARRAGEM_B4');
    expect(structureIds).toContain('PDE_ES1');
    expect(structureIds).toContain('JANGADA');
    expect(structureIds).toContain('PDE_MANGABA');
    expect(structureIds).toContain('PDE_JACO');
  });
});

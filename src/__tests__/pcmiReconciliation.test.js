import { describe, it, expect } from 'vitest';
import masterData from '../../public/data/geotech_master.json';

describe('PCMI Central Database Reconciliation', () => {
  it('should have 8 audited geotechnical anomalies with official PCMI origin', () => {
    expect(masterData.anomalias).toBeDefined();
    expect(masterData.anomalias.length).toBe(8);

    masterData.anomalias.forEach(anom => {
      expect(anom.origemValidacao).toBe('BANCO_CENTRAL_PCMI_ITAMINAS');
      expect(anom.parecerGeotecnico).toBeDefined();
      expect(typeof anom.parecerGeotecnico).toBe('string');
      expect(anom.parecerGeotecnico.length).toBeGreaterThan(20);
    });
  });

  it('should have resolved the 7 false-positive anomalies from Pilha B2 and Barragem B4', () => {
    const resolvedAnomalies = masterData.anomalias.filter(a => a.status === 'RESOLVIDA');
    expect(resolvedAnomalies.length).toBe(7);

    // Pilha B2 instruments (2, 4, 7, 8, 9)
    const pilhaB2Anoms = resolvedAnomalies.filter(a => a.estrutura === 'PILHA B2');
    expect(pilhaB2Anoms.length).toBe(5);
    pilhaB2Anoms.forEach(a => {
      expect(a.parecerGeotecnico).toContain('NORMAL');
    });

    // Barragem B4 (B48M seco and B33 normal)
    const b4Anoms = resolvedAnomalies.filter(a => a.estrutura === 'BARRAGEM B4');
    expect(b4Anoms.length).toBe(2);
    const b48m = b4Anoms.find(a => a.instrumentoId === 'B48M');
    expect(b48m.parecerGeotecnico).toContain('SECO');
  });

  it('should prioritize the active Cava Jangada PZ-07/04 anomaly in intensive monitoring', () => {
    const jangadaAnom = masterData.anomalias.find(a => a.instrumentoId === '07/04');
    expect(jangadaAnom).toBeDefined();
    expect(jangadaAnom.status).toBe('EM_MONITORAMENTO_PRIORITARIO');
    expect(jangadaAnom.cotaAtual).toBe(1096.5);
    expect(jangadaAnom.limite).toBe(1095.5);
    expect(jangadaAnom.cotaAtual - jangadaAnom.limite).toBe(1.0);
    expect(jangadaAnom.prioridade).toBe('CRITICA');
  });

  it('should include real georeferenced PCMI tickets with valid coordinates and protocol', () => {
    expect(masterData.chamadosFluig).toBeDefined();
    expect(masterData.chamadosFluig.length).toBeGreaterThanOrEqual(8);

    const georeferenced = masterData.chamadosFluig.filter(t => t.lat && t.lon);
    expect(georeferenced.length).toBeGreaterThanOrEqual(8);

    georeferenced.forEach(ticket => {
      expect(typeof ticket.lat).toBe('number');
      expect(typeof ticket.lon).toBe('number');
      expect(ticket.lat).toBeLessThan(0); // South hemisphere
      expect(ticket.lon).toBeLessThan(0); // West longitude
      expect(ticket.protocolo).toBeDefined();
      expect(ticket.titulo).toBeDefined();
    });
  });
});

import { describe, it, expect } from 'vitest';

describe('ImportacoesTab Defensive Formatting', () => {
  function formatImportRecord(imp, idx = 0) {
    const total = imp?.registrosImportados ?? imp?.totalLeituras ?? 0;
    const impId = imp?.id || `IMP-${String(idx + 1).padStart(3, '0')}`;
    const impTipo = imp?.tipo || (imp?.totalLeituras ? 'Base Completa PCMI' : 'Importação Automática');
    const formattedTotal = Number(total).toLocaleString('pt-BR');
    return {
      id: impId,
      tipo: impTipo,
      totalFormatted: formattedTotal
    };
  }

  it('should safely format record with undefined registrosImportados without throwing', () => {
    const brokenRecord = {
      data: '18/09/2026 16:00:34',
      origem: 'C:\\Banco_De_Dados.xlsx',
      totalInstrumentos: 218,
      totalLeituras: 32296,
      status: 'SINCRONIZADO'
    };

    expect(() => formatImportRecord(brokenRecord)).not.toThrow();
    const result = formatImportRecord(brokenRecord);
    expect(result.id).toBe('IMP-001');
    expect(result.tipo).toBe('Base Completa PCMI');
    expect(result.totalFormatted).toContain('32');
  });

  it('should safely format completely empty or nullish record', () => {
    expect(() => formatImportRecord(null, 5)).not.toThrow();
    const result = formatImportRecord({}, 2);
    expect(result.id).toBe('IMP-003');
    expect(result.tipo).toBe('Importação Automática');
    expect(result.totalFormatted).toBe('0');
  });

  it('should format standard record with valid registrosImportados', () => {
    const record = {
      id: 'IMP-042',
      tipo: 'Piezometria',
      registrosImportados: 5420
    };
    const result = formatImportRecord(record);
    expect(result.id).toBe('IMP-042');
    expect(result.tipo).toBe('Piezometria');
    expect(result.totalFormatted).toContain('5');
  });
});

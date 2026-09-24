import { describe, it, expect } from 'vitest';
import { recordIdTemplateService, AVAILABLE_VARIABLES } from '../services/recordIdTemplateService';

describe('recordIdTemplateService', () => {
  it('should export all documented available variables', () => {
    const tokens = AVAILABLE_VARIABLES.map(v => v.token);
    expect(tokens).toContain('{SIGLA_ESTRUTURA}');
    expect(tokens).toContain('{SIGLA_EMPREENDIMENTO}');
    expect(tokens).toContain('{CONTADOR}');
    expect(tokens).toContain('{DATA}');
    expect(tokens).toContain('{NOME_SINTOMA}');
    expect(tokens).toContain('{ID}');
    expect(tokens).toContain('{DEFAULT}');
  });

  it('should interpolate default SYSDAM pattern: {SIGLA_EMPREENDIMENTO} - {NOME_SINTOMA}', () => {
    const template = '{SIGLA_EMPREENDIMENTO} - {NOME_SINTOMA}';
    const context = {
      siglaEmpreendimento: 'IT',
      sintoma: 'Erosão'
    };
    const result = recordIdTemplateService.interpolateTemplate(template, context);
    expect(result).toBe('IT - Erosão');
  });

  it('should extract correct structure acronyms', () => {
    expect(recordIdTemplateService.extractStructureAcronym('Barragem B1')).toBe('B1');
    expect(recordIdTemplateService.extractStructureAcronym('Barragem B4')).toBe('B4');
    expect(recordIdTemplateService.extractStructureAcronym('Cava Engenho Seco')).toBe('ES');
    expect(recordIdTemplateService.extractStructureAcronym('Cava Jangada')).toBe('JGD');
    expect(recordIdTemplateService.extractStructureAcronym('PDE Engenho Seco 1')).toBe('ES1');
    expect(recordIdTemplateService.extractStructureAcronym('PDE Jacó')).toBe('JC');
    expect(recordIdTemplateService.extractStructureAcronym('PDE Mangaba')).toBe('MGB');
    expect(recordIdTemplateService.extractStructureAcronym('PDR B2')).toBe('PB2');
  });

  it('should format padded counter correctly with {CONTADOR}', () => {
    const template = '{SIGLA_ESTRUTURA}-{CONTADOR}';
    const result1 = recordIdTemplateService.interpolateTemplate(template, {
      siglaEstrutura: 'B1',
      contador: 1
    });
    expect(result1).toBe('B1-0001');

    const result2 = recordIdTemplateService.interpolateTemplate(template, {
      siglaEstrutura: 'B4',
      contador: 42
    });
    expect(result2).toBe('B4-0042');
  });

  it('should format default token {DEFAULT} with #ID - Sintoma', () => {
    const template = '{DEFAULT}';
    const result = recordIdTemplateService.interpolateTemplate(template, {
      id: '372',
      sintoma: 'Vegetação'
    });
    expect(result).toBe('#372 - Vegetação');
  });

  it('should format {DATA} with current or provided date', () => {
    const template = '{SIGLA_EMPREENDIMENTO}_{DATA}_{NOME_SINTOMA}';
    const result = recordIdTemplateService.interpolateTemplate(template, {
      siglaEmpreendimento: 'IT',
      sintoma: 'Trinca',
      data: new Date('2026-09-24T12:00:00Z')
    });
    expect(result).toBe('IT_2026-09-24_Trinca');
  });

  it('should generate fallback code if template is empty', () => {
    const result = recordIdTemplateService.interpolateTemplate('', {
      id: '12',
      sintoma: 'Erosão'
    });
    expect(result).toBe('#12 - Erosão');
  });
});

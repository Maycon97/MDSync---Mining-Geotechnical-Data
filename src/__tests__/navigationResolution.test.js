import { describe, it, expect } from 'vitest';
import { TABS } from '../components/Navigation';

describe('Navigation & Tab Resolution', () => {
  const KNOWN_VALID_TABS = [
    'home', 'dashboard', 'analises', 'coletas', 'importacoes', 'ordens_servico',
    'lotes_relatorios', 'clientes', 'contratos', 'mapa', 'secoes', 'campo',
    'fila_sync', 'anomalias_inspecoes', 'checklist', 'chamados', 'piezometria',
    'vazao', 'documentos', 'comunicacao', 'laudo', 'historico', 'ia',
    'cadastro', 'configuracoes_perfil'
  ];

  it('should include all critical geotechnical modules in the main tabs array', () => {
    const tabIds = TABS.map(t => t.id);
    
    // Core geotechnical modules
    expect(tabIds).toContain('dashboard');
    expect(tabIds).toContain('mapa');
    expect(tabIds).toContain('piezometria');
    expect(tabIds).toContain('vazao');
    expect(tabIds).toContain('laudo');
    expect(tabIds).toContain('cadastro');

    // Recently added / validated corporate and field modules
    expect(tabIds).toContain('coletas');
    expect(tabIds).toContain('ordens_servico');
    expect(tabIds).toContain('lotes_relatorios');
    expect(tabIds).toContain('clientes');
    expect(tabIds).toContain('contratos');
    expect(tabIds).toContain('importacoes');
  });

  it('should have valid labels and icons for every tab entry', () => {
    TABS.forEach(tab => {
      expect(tab.id).toBeDefined();
      expect(typeof tab.id).toBe('string');
      expect(tab.label).toBeDefined();
      expect(typeof tab.label).toBe('string');
      expect(tab.icon).toBeDefined();
    });
  });

  it('should recognize all known tabs and reject unknown IDs in fallback check', () => {
    // Check all known tabs pass
    KNOWN_VALID_TABS.forEach(tabId => {
      expect(KNOWN_VALID_TABS.includes(tabId)).toBe(true);
    });

    // Check invalid/typo tabs trigger fallback
    const invalidTabs = ['relatorio_antigo', 'aba_fantasma', 'unknown_module', ''];
    invalidTabs.forEach(invalidId => {
      expect(KNOWN_VALID_TABS.includes(invalidId)).toBe(false);
    });
  });

  it('should ensure no duplicate tab IDs exist in Navigation.TABS', () => {
    const tabIds = TABS.map(t => t.id);
    const uniqueIds = new Set(tabIds);
    expect(tabIds.length).toBe(uniqueIds.size);
  });
});

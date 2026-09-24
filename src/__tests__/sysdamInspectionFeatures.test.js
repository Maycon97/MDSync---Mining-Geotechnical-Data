import { describe, it, expect, beforeEach } from 'vitest';

// Polyfill localStorage and window in node test environment
const memoryStore = {};
const localStorageMock = {
  getItem: (key) => memoryStore[key] ?? null,
  setItem: (key, val) => { memoryStore[key] = String(val); },
  removeItem: (key) => { delete memoryStore[key]; },
  clear: () => {
    Object.keys(memoryStore).forEach(k => delete memoryStore[k]);
  }
};

globalThis.localStorage = localStorageMock;
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    dispatchEvent: () => true
  };
}
if (typeof globalThis.CustomEvent === 'undefined') {
  globalThis.CustomEvent = class CustomEvent {
    constructor(type, eventInitDict) {
      this.type = type;
      this.detail = eventInitDict?.detail;
    }
  };
}

import { storageService } from '../services/storageService';

describe('sysdamInspectionFeatures', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize default inspection rules matching SYSDAM specification', () => {
    const rules = storageService.getInspectionRules();
    expect(rules).toBeDefined();
    expect(rules.habilitarRegistroAvulso).toBe(true);
    expect(rules.permitirHistoricosOutrosRegistros).toBe(true);
    expect(rules.configuracaoPinInspecoes).toBe(false);
    expect(rules.habilitarLiveInspection).toBe(true);
    expect(rules.dataCorteHistorico).toBe('2026-01-01');
  });

  it('should save and retrieve updated inspection rules', () => {
    storageService.saveInspectionRules({
      habilitarRegistroAvulso: false,
      permitirHistoricosOutrosRegistros: false,
      configuracaoPinInspecoes: true,
      habilitarLiveInspection: false,
      dataCorteHistorico: '2026-06-01'
    });

    const updated = storageService.getInspectionRules();
    expect(updated.habilitarRegistroAvulso).toBe(false);
    expect(updated.configuracaoPinInspecoes).toBe(true);
    expect(updated.dataCorteHistorico).toBe('2026-06-01');
  });

  it('should initialize and persist record ID template', () => {
    expect(storageService.getRecordIdTemplate()).toBe('{SIGLA_EMPREENDIMENTO} - {NOME_SINTOMA}');

    storageService.saveRecordIdTemplate('{SIGLA_ESTRUTURA}-{CONTADOR}');
    expect(storageService.getRecordIdTemplate()).toBe('{SIGLA_ESTRUTURA}-{CONTADOR}');
  });

  it('should return initial structures of the enterprise (Itaminas complex)', () => {
    const estruturas = storageService.getEstruturasEmpreendimento();
    expect(estruturas.length).toBeGreaterThanOrEqual(8);

    const siglaB1 = estruturas.find(e => e.id === 'B1');
    expect(siglaB1).toBeDefined();
    expect(siglaB1.tipo).toBe('BARRAGEM');
    expect(siglaB1.tipoLetra).toBe('B');

    const cavaES = estruturas.find(e => e.id === 'ES');
    expect(cavaES).toBeDefined();
    expect(cavaES.tipo).toBe('CAVA');
    expect(cavaES.tipoLetra).toBe('C');

    const pilhaES1 = estruturas.find(e => e.id === 'ES1');
    expect(pilhaES1).toBeDefined();
    expect(pilhaES1.tipo).toBe('PILHA');
    expect(pilhaES1.tipoLetra).toBe('P');
  });
});

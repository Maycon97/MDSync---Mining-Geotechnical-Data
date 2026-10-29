import { describe, it, expect, beforeEach } from 'vitest';

// Polyfill localStorage para ambiente Node vitest
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

import { cookieConsentService, COOKIE_CATEGORIES } from '../services/cookieConsentService';

describe('Legal & Compliance Suite (17 Itens Jurídicos e LGPD)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Item 3 & 7: Cookie Consent & Storage Management', () => {
    it('deve iniciar sem consentimento gravado', () => {
      expect(cookieConsentService.hasConsent()).toBe(false);
      const defaults = cookieConsentService.getPreferences();
      expect(defaults.necessary).toBe(true);
      expect(defaults.preferences).toBe(false);
      expect(defaults.analytics).toBe(false);
    });

    it('deve salvar consentimento de todas as categorias ao aceitar tudo', () => {
      const saved = cookieConsentService.acceptAll();
      expect(saved.necessary).toBe(true);
      expect(saved.preferences).toBe(true);
      expect(saved.analytics).toBe(true);
      expect(cookieConsentService.hasConsent()).toBe(true);

      const retrieved = cookieConsentService.getPreferences();
      expect(retrieved.preferences).toBe(true);
      expect(retrieved.analytics).toBe(true);
    });

    it('deve aceitar apenas os essenciais quando solicitado', () => {
      const saved = cookieConsentService.acceptEssentialOnly();
      expect(saved.necessary).toBe(true);
      expect(saved.preferences).toBe(false);
      expect(saved.analytics).toBe(false);
      expect(cookieConsentService.hasConsent()).toBe(true);

      const retrieved = cookieConsentService.getPreferences();
      expect(retrieved.preferences).toBe(false);
      expect(retrieved.analytics).toBe(false);
    });

    it('deve permitir revogar o consentimento conforme o Art. 18 da LGPD', () => {
      cookieConsentService.acceptAll();
      expect(cookieConsentService.hasConsent()).toBe(true);

      cookieConsentService.resetConsent();
      expect(cookieConsentService.hasConsent()).toBe(false);
    });

    it('deve conter as categorias obrigatórias e descrições transparentes', () => {
      expect(COOKIE_CATEGORIES.NECESSARY.required).toBe(true);
      expect(COOKIE_CATEGORIES.PREFERENCES.required).toBe(false);
      expect(COOKIE_CATEGORIES.ANALYTICS.required).toBe(false);
      expect(COOKIE_CATEGORIES.NECESSARY.description).toContain('segurança');
    });
  });
});


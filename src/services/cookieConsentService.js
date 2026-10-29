// ============================================================
// MDSync — Cookie & Storage Consent Service (LGPD / ANPD)
// Gestão de Consentimento e Privacidade de Armazenamento Local
// ============================================================

const STORAGE_KEY = 'mdsync_cookie_consent_v1';

export const COOKIE_CATEGORIES = {
  NECESSARY: {
    id: 'necessary',
    name: 'Estritamente Necessários',
    required: true,
    description: 'Essenciais para a segurança, autenticação de engenheiros, funcionamento offline e sincronização criptográfica de leituras geotécnicas. Não podem ser desativados.'
  },
  PREFERENCES: {
    id: 'preferences',
    name: 'Preferências e Ergonomia',
    required: false,
    description: 'Armazenam o tema visual (Modo Escuro / Claro), filtros de busca preferenciais e configurações de exibição para facilitar o uso contínuo em campo.'
  },
  ANALYTICS: {
    id: 'analytics',
    name: 'Desempenho e Telemetria Técnica',
    required: false,
    description: 'Métricas anônimas de tempo de resposta da telemetria e renderização de mapa cartográfico. Nenhum dado pessoal ou de localização externa é compartilhado com terceiros.'
  }
};

class CookieConsentService {
  /**
   * Verifica se o usuário já registrou uma escolha de consentimento
   */
  hasConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Obtém as preferências salvas ou o padrão seguro
   */
  getPreferences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          necessary: true,
          preferences: Boolean(parsed.preferences),
          analytics: Boolean(parsed.analytics),
          consentedAt: parsed.consentedAt || new Date().toISOString(),
          version: parsed.version || '1.0'
        };
      }
    } catch {
      // Fallback
    }

    return {
      necessary: true,
      preferences: false,
      analytics: false,
      consentedAt: null,
      version: '1.0'
    };
  }

  /**
   * Salva as preferências de consentimento do usuário
   */
  savePreferences(prefs) {
    const data = {
      necessary: true, // Sempre obrigatório
      preferences: Boolean(prefs.preferences),
      analytics: Boolean(prefs.analytics),
      consentedAt: new Date().toISOString(),
      version: '1.0'
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('mdsync:cookie-consent-changed', { detail: data }));
      }
    } catch (e) {
      console.warn('[CookieConsentService] Não foi possível gravar preferências no localStorage:', e);
    }

    return data;
  }

  /**
   * Aceita todas as categorias de cookies
   */
  acceptAll() {
    return this.savePreferences({
      necessary: true,
      preferences: true,
      analytics: true
    });
  }

  /**
   * Aceita apenas os estritamente necessários
   */
  acceptEssentialOnly() {
    return this.savePreferences({
      necessary: true,
      preferences: false,
      analytics: false
    });
  }

  /**
   * Limpa o consentimento (para fins de teste ou revogação pelo titular)
   */
  resetConsent() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('mdsync:cookie-consent-changed', { detail: null }));
      }
    } catch {}
  }
}

export const cookieConsentService = new CookieConsentService();

// ============================================================
// MDSync — Serviço CometAPI: Motor de Pesquisa e IA do Geotinho
// Endpoint: https://api.cometapi.com/v1 (OpenAI-compatible)
// Modelo Padrão: gpt-6-astra
// ============================================================

import { geminiService } from './geminiService';

const STORAGE_KEY_API = 'mdsync_cometapi_key';
const STORAGE_KEY_MODEL = 'mdsync_cometapi_model';
const STORAGE_KEY_BASE_URL = 'mdsync_cometapi_base_url';

export const DEFAULT_COMET_BASE_URL = 'https://api.cometapi.com/v1';
export const DEFAULT_COMET_MODEL = 'gpt-6-astra';

export const AVAILABLE_MODELS = [
  { id: 'gpt-6-astra', name: 'GPT-6 Astra (CometAPI Flagship)', desc: 'Modelo avançado de alta velocidade e raciocínio técnico para o Geotinho' },
  { id: 'gpt-4o', name: 'GPT-4o (Omni)', desc: 'Multimodal de alta precisão' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Respostas ultrarrápidas de baixo consumo de tokens' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Modelo alternativo de latência ultrabaixa' }
];

export const cometApiService = {
  /**
   * Obtém a chave da CometAPI (localStorage ou variável de ambiente)
   */
  getApiKey() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_API);
      if (stored && stored.trim().length > 0) return stored.trim();
    } catch (e) {}
    return import.meta.env.VITE_COMETAPI_KEY || '';
  },

  /**
   * Salva a chave da CometAPI
   */
  setApiKey(key) {
    try {
      if (key && key.trim()) {
        localStorage.setItem(STORAGE_KEY_API, key.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY_API);
      }
    } catch (e) {
      console.error('Erro ao salvar chave CometAPI:', e);
    }
  },

  /**
   * Remove a chave configurada
   */
  clearApiKey() {
    try {
      localStorage.removeItem(STORAGE_KEY_API);
    } catch (e) {}
  },

  /**
   * Verifica se há chave configurada
   */
  hasApiKey() {
    return Boolean(this.getApiKey());
  },

  /**
   * Obtém o modelo configurado
   */
  getModel() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MODEL);
      if (stored && stored.trim()) return stored.trim();
    } catch (e) {}
    return DEFAULT_COMET_MODEL;
  },

  /**
   * Define o modelo configurado
   */
  setModel(model) {
    try {
      if (model) localStorage.setItem(STORAGE_KEY_MODEL, model);
    } catch (e) {}
  },

  /**
   * Obtém a Base URL (padrão https://api.cometapi.com/v1)
   */
  getBaseUrl() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BASE_URL);
      if (stored && stored.trim()) return stored.trim().replace(/\/+$/, '');
    } catch (e) {}
    return DEFAULT_COMET_BASE_URL;
  },

  /**
   * Define a Base URL
   */
  setBaseUrl(url) {
    try {
      if (url && url.trim()) {
        localStorage.setItem(STORAGE_KEY_BASE_URL, url.trim().replace(/\/+$/, ''));
      } else {
        localStorage.removeItem(STORAGE_KEY_BASE_URL);
      }
    } catch (e) {}
  },

  /**
   * Envia mensagem para a CometAPI usando formato OpenAI-compatible
   * com fallback automático para Gemini e para o motor heurístico local do Geotinho
   */
  async sendMessage({ prompt, history = [], context = {} }) {
    const apiKey = this.getApiKey();
    const model = this.getModel();
    const baseUrl = this.getBaseUrl();

    // Se não houver chave da CometAPI configurada, tenta o Gemini ou recorre ao motor local
    if (!apiKey) {
      if (geminiService.hasApiKey()) {
        return geminiService.sendMessage({ prompt, history, context });
      }
      return geminiService.localSimulatedResponse(prompt, context);
    }

    const systemPrompt = geminiService.buildSystemInstruction(context);

    // Formatar histórico padrão OpenAI Chat Messages
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    const recentHistory = history.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text || ''
      });
    });

    messages.push({
      role: 'user',
      content: prompt
    });

    let lastError = null;

    // 1. TENTATIVA VIA /v1/chat/completions (Padrão universal OpenAI)
    try {
      const chatUrl = `${baseUrl}/chat/completions`;
      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
          max_tokens: 1500
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return {
            text: content,
            source: 'cometapi',
            model,
            engine: 'CometAPI (OpenAI-compatible)'
          };
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        lastError = new Error(errJson?.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        console.warn('Tentativa via CometAPI /v1/chat/completions retornou status:', response.status, lastError.message);
      }
    } catch (err) {
      lastError = err;
      console.warn('Erro de rede na chamada CometAPI /chat/completions:', err.message);
    }

    // 2. TENTATIVA VIA /v1/responses (Endpoint especializado da CometAPI especificado na doc)
    try {
      const responsesUrl = `${baseUrl}/responses`;
      const response = await fetch(responsesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          input: `${systemPrompt}\n\nPergunta do Usuário:\n${prompt}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Tratar possíveis formatos retornados pelo endpoint responses
        const text = data.output || data.response || data.text || data.choices?.[0]?.message?.content;
        if (text) {
          return {
            text: typeof text === 'string' ? text : JSON.stringify(text),
            source: 'cometapi',
            model,
            engine: 'CometAPI (Responses API)'
          };
        }
      }
    } catch (err) {
      console.warn('Tentativa secundária CometAPI /responses falhou:', err.message);
    }

    // 3. FALLBACK: Se a CometAPI falhou e temos chave Gemini configurada, tentar Gemini
    if (geminiService.hasApiKey()) {
      try {
        const geminiRes = await geminiService.sendMessage({ prompt, history, context });
        geminiRes.apiErrorNotice = `CometAPI temporariamente indisponível (${lastError?.message || 'timeout'}). Respondido com sucesso via Google Gemini.`;
        return geminiRes;
      } catch (e) {}
    }

    // 4. FALLBACK FINAL: Motor Heurístico Geotinho Offline
    const localResult = geminiService.localSimulatedResponse(prompt, context);
    localResult.apiErrorNotice = `Geotinho: Resposta gerada via motor heurístico offline especializado (${lastError?.message || 'CometAPI desconectada'}).`;
    return localResult;
  }
};

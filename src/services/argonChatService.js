const STORAGE_KEY_ENDPOINT = 'mdsync_argon_chat_endpoint';
const DEFAULT_ENDPOINT = (import.meta.env.VITE_ARGON_CHAT_URL || 'https://mdsync---mining-geotechnical-data.maycondouglasreymont.workers.dev').trim();

function normalizeEndpoint(endpoint) {
  const cleanEndpoint = (endpoint || '').trim().replace(/\/+$/, '');
  if (!cleanEndpoint) return '';
  const parsed = new URL(cleanEndpoint);
  const localDevelopment = ['localhost', '127.0.0.1'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !(localDevelopment && parsed.protocol === 'http:')) {
    throw new Error('A URL do backend precisa usar HTTPS. HTTP é permitido somente em localhost.');
  }
  return cleanEndpoint;
}

const pick = (value, max = 180) => {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text ? text.slice(0, max) : undefined;
};

const DATA_QUESTION = /\b(n[ií]vel|leitura|medi[cç][aã]o|medida|instrumento|piez[oô]metro|piezometria|vaz[aã]o|vertedouro|chuva|pluviometria|anomalia|alerta|emerg[eê]ncia|estabilidade|barragem|pilha|cava|estrutura|limite|cota|press[aã]o|percola[cç][aã]o|dreno|jangada|mangaba|engenho|jac[oó]|\bB[1-9]\b|\bPDE\b)/i;

const pickNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

function sanitizeContext(context = {}) {
  return {
    structures: (Array.isArray(context.structures) ? context.structures : []).slice(0, 30).map((item) => ({
      id: pick(item.id, 80),
      name: pick(item.nome || item.name, 120),
      instruments: pickNumber(item.totalInstrumentos)
    })),
    instruments: (Array.isArray(context.instruments) ? context.instruments : []).slice(0, 250).map((item) => ({
      id: pick(item.id, 60),
      type: pick(item.tipo, 40),
      structure: pick(item.estrutura, 100),
      status: pick(item.statusCalculado, 40),
      latestValue: pickNumber(item.ultimaCota ?? item.ultimaLeitura ?? item.valorAtual),
      attentionLimit: pickNumber(item.limiteAtencao),
      alertLimit: pickNumber(item.limiteAlerta),
      emergencyLimit: pickNumber(item.limiteEmergencia)
    })),
    anomalies: (Array.isArray(context.anomalies) ? context.anomalies : []).slice(0, 60).map((item) => ({
      structure: pick(item.estrutura, 100),
      type: pick(item.tipo || item.categoria, 80),
      status: pick(item.status || item.situacao, 50),
      description: pick(item.descricao || item.observacao, 500)
    })),
    rainfall: (Array.isArray(context.pluviometria) ? context.pluviometria : []).slice(-7).map((item) => ({
      date: pick(item.data || item.dataLeitura, 40),
      millimeters: pickNumber(item.precipitacaoMm ?? item.valor ?? item.mm),
      sevenDayTotal: pickNumber(item.acumulado7Dias)
    })),
    stats: {
      sevenDayRainfallMm: pickNumber(context.stats?.chuva7Dias),
      totalInstruments: (Array.isArray(context.instruments) ? context.instruments : []).length
    }
  };
}

export const argonChatService = {
  getEndpoint() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ENDPOINT);
      if (stored?.trim()) return stored.trim().replace(/\/+$/, '');
    } catch {}
    return DEFAULT_ENDPOINT.replace(/\/+$/, '');
  },

  setEndpoint(endpoint) {
    const cleanEndpoint = normalizeEndpoint(endpoint);
    try {
      if (cleanEndpoint) localStorage.setItem(STORAGE_KEY_ENDPOINT, cleanEndpoint);
      else localStorage.removeItem(STORAGE_KEY_ENDPOINT);
    } catch {}
  },

  hasEndpoint() {
    return Boolean(this.getEndpoint());
  },

  async sendMessage({ prompt, history = [], context = {} }) {
    const endpoint = this.getEndpoint();
    if (!endpoint) {
      throw new Error('O endpoint do Geotinho ainda não foi configurado. Informe a URL do Cloudflare Worker nas configurações.');
    }

    let url;
    try {
      url = new URL('/api/chat', normalizeEndpoint(endpoint)).toString();
    } catch {
      throw new Error('A URL do Cloudflare Worker é inválida. Confira as configurações do Geotinho.');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: String(prompt || '').slice(0, 4000),
        history: history.filter((message) => !['welcome', 'reset'].includes(message.id)).slice(-6).map((message) => ({
          sender: message.sender === 'user' ? 'user' : 'assistant',
          text: String(message.text || '').slice(0, 1800)
        })),
        context: DATA_QUESTION.test(prompt) ? sanitizeContext(context) : {}
      }),
      signal: AbortSignal.timeout(65000)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const safeMessages = {
        400: 'A pergunta excede o limite permitido ou está vazia.',
        403: 'A origem do aplicativo não está autorizada no serviço do Geotinho.',
        429: 'O limite de uso do modelo Gemini ou do serviço do Geotinho foi atingido. Aguarde e tente novamente.',
        503: 'O serviço do Geotinho está sem configuração ou temporariamente indisponível.'
      };
      throw new Error(safeMessages[response.status] || result.error || 'Não foi possível consultar o Gemini 3.6 Flash.');
    }

    if (!result.text) throw new Error('O Gemini 3.6 Flash retornou uma resposta vazia. Tente novamente.');
    return { text: result.text, source: 'google', model: result.model || 'gemini-3.6-flash' };
  }
};


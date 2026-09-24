// ============================================================
// MDSync — Record ID Template Engine (Inspirado no SYSDAM)
// Gerador dinâmico de identificadores customizados de inspeção e anomalias
// ============================================================

export const DEFAULT_TEMPLATE = '{SIGLA_EMPREENDIMENTO} - {NOME_SINTOMA}';

export const TEMPLATE_VARIABLES = [
  {
    token: '{SIGLA_ESTRUTURA}',
    label: 'Sigla da estrutura',
    description: 'Sigla da estrutura associada (ex: B1, B4, ES, JGD). Se não cadastrado será vazio.',
    example: 'B1'
  },
  {
    token: '{SIGLA_EMPREENDIMENTO}',
    label: 'Sigla do empreendimento',
    description: 'Sigla corporativa do empreendimento (ex: IT para Itaminas). Se não cadastrado será vazio.',
    example: 'IT'
  },
  {
    token: '{CONTADOR}',
    label: 'Contador incremental',
    description: 'Um número incremental com 4 dígitos, iniciando em "0001". Leva em conta registros existentes.',
    example: '0001'
  },
  {
    token: '{DATA}',
    label: 'Data da ocorrência',
    description: 'Data do registro. Pode ser seguida por formato: (yyyy-MM-dd), (yyyyMMdd), (dd-MM-yyyy), (ddMMyyyy), (MMM-yy), (MMMyy).',
    example: '2026-09-24'
  },
  {
    token: '{NOME_SINTOMA}',
    label: 'Nome do sintoma',
    description: 'Nome técnico do sintoma geotécnico cadastrado (ex: "Erosão", "Trinca", "Surgência").',
    example: 'Erosão'
  },
  {
    token: '{ID}',
    label: 'Identificador único',
    description: 'Identificador numérico sequencial simples (ex: "1", "372").',
    example: '1'
  },
  {
    token: '{DEFAULT}',
    label: 'Template padrão',
    description: 'Template clássico de engenharia: ID seguido pelo nome do sintoma (ex: "#1 - Erosão").',
    example: '#1 - Erosão'
  }
];

export const AVAILABLE_VARIABLES = TEMPLATE_VARIABLES;

export const STRUCTURE_SIGLAS = {
  'BARRAGEM B1': 'B1',
  'BARRAGEM_B1': 'B1',
  'B1': 'B1',
  'BARRAGEM B4': 'B4',
  'BARRAGEM_B4': 'B4',
  'B4': 'B4',
  'CAVA ENGENHO SECO': 'ES',
  'ENGENHO_SECO': 'ES',
  'ES': 'ES',
  'CAVA JANGADA': 'JGD',
  'JANGADA': 'JGD',
  'JGD': 'JGD',
  'PDE ENGENHO SECO I': 'ES1',
  'PDE ENGENHO SECO 1': 'ES1',
  'PDE_ES1': 'ES1',
  'ES1': 'ES1',
  'PDE JACÓ': 'JC',
  'PDE JACO': 'JC',
  'PDE_JACÓ': 'JC',
  'JC': 'JC',
  'PDE MANGABA': 'MGB',
  'PDE_MANGABA': 'MGB',
  'MGB': 'MGB',
  'PILHA DE ESTÉRIL B2': 'PB2',
  'PILHA_B2': 'PB2',
  'PDR B2': 'PB2',
  'PB2': 'PB2'
};

export const recordIdTemplateService = {
  getStructureSigla(structureName = '') {
    if (!structureName) return '';
    const norm = String(structureName).trim().toUpperCase();
    if (STRUCTURE_SIGLAS[norm]) return STRUCTURE_SIGLAS[norm];
    for (const [key, val] of Object.entries(STRUCTURE_SIGLAS)) {
      if (norm.includes(key) || key.includes(norm)) return val;
    }
    // Fallback: extrair as primeiras letras de cada palavra
    const parts = norm.split(/[\s_-]+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 3);
    return parts.map(p => p[0]).join('').slice(0, 4);
  },

  extractStructureAcronym(structureName = '') {
    return this.getStructureSigla(structureName);
  },

  formatDate(dateObj = new Date(), format = 'yyyy-MM-dd') {
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj || Date.now());
    const yyyy = String(d.getFullYear());
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const MMM = months[d.getMonth()] || MM;
    const yy = yyyy.slice(-2);

    switch (format) {
      case 'yyyyMMdd': return `${yyyy}${MM}${dd}`;
      case 'dd-MM-yyyy': return `${dd}-${MM}-${yyyy}`;
      case 'ddMMyyyy': return `${dd}${MM}${yyyy}`;
      case 'MMM-yy': return `${MMM}-${yy}`;
      case 'MMMyy': return `${MMM}${yy}`;
      case 'yyyy-MM-dd':
      default:
        return `${yyyy}-${MM}-${dd}`;
    }
  },

  interpolateTemplate(template, data = {}, counter = 1) {
    if (!template || typeof template !== 'string' || !template.trim()) {
      template = '{DEFAULT}';
    }

    const nomeSintoma = data.nomeSintoma || data.sintoma || 'Erosão';
    const siglaEmpreendimento = data.siglaEmpreendimento !== undefined ? data.siglaEmpreendimento : 'IT';
    const resolvedCounter = data.contador !== undefined ? data.contador : (data.id !== undefined && !isNaN(Number(data.id)) ? Number(data.id) : counter);
    const counterPadded = String(resolvedCounter).padStart(4, '0');
    const id = data.id !== undefined ? String(data.id) : String(resolvedCounter);
    const resolvedDate = data.dataOcorrencia || data.data || new Date();
    const estrutura = data.estrutura || '';
    const siglaEstrutura = data.siglaEstrutura || this.getStructureSigla(estrutura);

    let result = template;

    // {DEFAULT}
    result = result.replace(/\{DEFAULT\}/g, `#${id} - ${nomeSintoma}`);

    // {SIGLA_EMPREENDIMENTO}
    result = result.replace(/\{SIGLA_EMPREENDIMENTO\}/g, siglaEmpreendimento || '');

    // {SIGLA_ESTRUTURA}
    result = result.replace(/\{SIGLA_ESTRUTURA\}/g, siglaEstrutura || '');

    // {CONTADOR}
    result = result.replace(/\{CONTADOR\}/g, counterPadded);

    // {NOME_SINTOMA}
    result = result.replace(/\{NOME_SINTOMA\}/g, nomeSintoma || '');

    // {ID}
    result = result.replace(/\{ID\}/g, String(id));

    // {DATA} com ou sem formato (ex: {DATA:dd-MM-yyyy} ou {DATA})
    result = result.replace(/\{DATA(?::([a-zA-Z0-9_-]+))?\}/g, (_, fmt) => {
      return this.formatDate(resolvedDate, fmt || 'yyyy-MM-dd');
    });

    // Limpar hifens ou pontuações órfãs se campos estiverem vazios (ex: " - Erosão" -> "Erosão")
    result = result.replace(/^\s*[-–—]\s*/, '').replace(/\s*[-–—]\s*$/, '').trim();

    return result || `#${id} - ${nomeSintoma}`;
  },

  generatePreview(template) {
    return this.interpolateTemplate(template, {
      siglaEmpreendimento: 'IT',
      estrutura: 'BARRAGEM B1',
      siglaEstrutura: 'B1',
      nomeSintoma: 'Erosão',
      id: '1',
      dataOcorrencia: new Date()
    }, 1);
  }
};


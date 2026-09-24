// ============================================================
// MDSync — Mobile Field Inspection Service (Padrão SYSDAM APK)
// Gerenciamento de campanhas de campo, checkpoints e cálculo de proximidade GPS
// ============================================================

import { storageService } from './storageService';
import { recordIdTemplateService } from './recordIdTemplateService';

// Catálogo padrão de Checkpoints para as estruturas do complexo Itaminas
export const DEFAULT_STRUCTURE_CHECKPOINTS = {
  B1: [
    {
      id: 'CP-B1-01',
      nome: 'Checkpoint 1',
      local: 'Crista da Barragem B1 - Margem Direita',
      coords: [-20.0625, -44.1165],
      condicaoInicial: 'A foto seja tirada em pe pegando todo espaco da estrutura',
      eAnomalia: false,
      fotoReferencia: null,
      data: '23/09/2026',
      status: 'pendente'
    },
    {
      id: 'CP-B1-02',
      nome: 'Checkpoint 2',
      local: 'Talude de Jusante - Berma Intermediária 2',
      coords: [-20.0638, -44.1147],
      condicaoInicial: 'Enquadrar o pé do talude e os drenos sub-horizontais (DSH)',
      eAnomalia: false,
      fotoReferencia: null,
      data: '23/09/2026',
      status: 'pendente'
    },
    {
      id: 'CP-B1-03',
      nome: 'Checkpoint 3',
      local: 'Vertedouro Tulipa & Canal de Descarga',
      coords: [-20.0652, -44.1135],
      condicaoInicial: 'Verificar ausência de obstruções na soleira livre e dissipador',
      eAnomalia: false,
      fotoReferencia: null,
      data: '23/09/2026',
      status: 'pendente'
    }
  ],
  B4: [
    {
      id: 'CP-B4-01',
      nome: 'Checkpoint 1',
      local: 'Coroamento e Borda Livre B4',
      coords: [-20.0890, -44.1005],
      condicaoInicial: 'Foto panorâmica do nível do reservatório e crista da barragem',
      eAnomalia: false,
      fotoReferencia: null,
      data: '23/09/2026',
      status: 'pendente'
    },
    {
      id: 'CP-B4-02',
      nome: 'Checkpoint 2',
      local: 'Canal de Desvio e Dreno de Fundo D-03',
      coords: [-20.0875, -44.0990],
      condicaoInicial: 'Inspeção de turbidez e vazão na saída do canal',
      eAnomalia: false,
      fotoReferencia: null,
      data: '23/09/2026',
      status: 'pendente'
    }
  ],
  ES: [
    {
      id: 'CP-ES-01',
      nome: 'Checkpoint 1',
      local: 'Talude Superior - Cava Engenho Seco',
      coords: [-20.0958, -44.1118],
      condicaoInicial: 'Enquadrar bancadas ativas de lavra e bermas de segurança',
      eAnomalia: false,
      fotoReferencia: null,
      data: '23/09/2026',
      status: 'pendente'
    }
  ],
  JGD: [
    {
      id: 'CP-JGD-01',
      nome: 'Checkpoint 1',
      local: 'Crista da Cava Jangada',
      coords: [-20.1085, -44.1022],
      condicaoInicial: 'Foto da lagoa de amortecimento e drenagem perimetral',
      eAnomalia: false,
      fotoReferencia: null,
      data: '23/09/2026',
      status: 'pendente'
    }
  ]
};

export const SITUACOES_REGISTRO = [
  { id: 'PV', sigla: '(PV)', label: 'Constatada pela primeira vez', description: 'Nova anomalia sem registro prévio' },
  { id: 'RA', sigla: '(RA)', label: 'Reincidência de anomalia', description: 'Anomalia já tratada anteriormente que voltou a se manifestar' },
  { id: 'MO', sigla: '(MO)', label: 'Monitoramento de anomalia existente', description: 'Acompanhamento de evolução de defeito cadastrado' }
];

export const MAGNITUDES_REGISTRO = [
  { id: 'insignificante', label: 'Insignificante', nivel: 1, cor: '#10b981' },
  { id: 'pequena', label: 'Pequena', nivel: 2, cor: '#38bdf8' },
  { id: 'media', label: 'Média', nivel: 3, cor: '#f59e0b' },
  { id: 'grande', label: 'Grande', nivel: 4, cor: '#ef4444' }
];

export const mobileInspectionService = {
  // Fórmula Haversine para cálculo de distância em metros entre duas coordenadas geográficas
  calculateDistance(lat1, lon1, lat2, lon2) {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
    if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;

    const R = 6371e3; // Raio médio da Terra em metros
    const phi1 = (Number(lat1) * Math.PI) / 180;
    const phi2 = (Number(lat2) * Math.PI) / 180;
    const deltaPhi = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
    const deltaLambda = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  },

  formatDistance(meters) {
    if (meters === null || meters === undefined || isNaN(meters)) return '+999m';
    if (meters >= 1000) {
      const km = (meters / 1000).toFixed(1);
      return `+${km}km`;
    }
    return `${meters}m`;
  },

  getCheckpointsForStructure(structureId = 'B1') {
    const key = String(structureId).toUpperCase().replace('BARRAGEM_', '').replace('CAVA_', '');
    if (DEFAULT_STRUCTURE_CHECKPOINTS[key]) {
      return [...DEFAULT_STRUCTURE_CHECKPOINTS[key]];
    }
    // Checkpoints genéricos padrão para a estrutura
    return [
      {
        id: `CP-${key}-01`,
        nome: 'Checkpoint 1',
        local: `Crista / Borda Principal - ${structureId}`,
        coords: [-20.0638, -44.1147],
        condicaoInicial: 'A foto seja tirada em pe pegando todo espaco da estrutura',
        eAnomalia: false,
        fotoReferencia: null,
        data: new Date().toLocaleDateString('pt-BR'),
        status: 'pendente'
      },
      {
        id: `CP-${key}-02`,
        nome: 'Checkpoint 2',
        local: `Drenagem e Berma de Jusante - ${structureId}`,
        coords: [-20.0650, -44.1158],
        condicaoInicial: 'Enquadrar alinhamento dos taludes e canais de escoamento',
        eAnomalia: false,
        fotoReferencia: null,
        data: new Date().toLocaleDateString('pt-BR'),
        status: 'pendente'
      }
    ];
  },

  formatTimeSpent(seconds = 0) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    return `${hrs}h ${mins}m`;
  },

  createInspectionRecord({
    sintoma = 'Buraco',
    situacao = 'PV',
    descricao = '',
    magnitude = 'pequena',
    estrutura = 'Barragem B1',
    siglaEstrutura = 'B1',
    coords = null,
    foto = null,
    checkpointId = null
  }) {
    const existing = storageService.getAnomaliasGeotecnicas();
    const counter = existing.length + 1;
    const template = storageService.getRecordIdTemplate();

    const formattedCode = recordIdTemplateService.interpolateTemplate(template, {
      siglaEmpreendimento: 'IT',
      siglaEstrutura,
      sintoma,
      id: String(counter),
      contador: counter
    }, counter);

    const situacaoObj = SITUACOES_REGISTRO.find(s => s.id === situacao) || SITUACOES_REGISTRO[0];
    const magnitudeObj = MAGNITUDES_REGISTRO.find(m => m.id === magnitude) || MAGNITUDES_REGISTRO[1];

    const newRecord = {
      id: `ANOM-${String(counter).padStart(4, '0')}`,
      codigo: formattedCode,
      sintoma,
      situacao: situacaoObj.sigla,
      situacaoDesc: `${situacaoObj.sigla} ${situacaoObj.label}`,
      descricao: descricao.trim().slice(0, 500),
      magnitude: magnitudeObj.label,
      nivelSeveridade: magnitudeObj.nivel,
      corMagnitude: magnitudeObj.cor,
      estrutura,
      siglaEstrutura,
      checkpointId,
      foto,
      dataCriacao: new Date().toISOString(),
      dataFormatada: new Date().toLocaleDateString('pt-BR'),
      horaFormatada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      coordenadas: coords || { lat: -20.063818, lon: -44.114360 },
      origem: 'APLICATIVO_MOBILE_APK',
      status: 'REGISTRADO_CAMPO'
    };

    // Salvar no storage
    storageService.saveAnomaliaGeotecnica(newRecord);
    return newRecord;
  }
};

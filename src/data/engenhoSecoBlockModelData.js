// ============================================================================
// MDSync Geotecnia — Modelos de Blocos Curto Prazo (CP) Mina Engenho Seco
// Base de Dados: SPLO - General\04) Departamento de Planejamento de Lavra\Geologia\Modelo_CP_EngenhoSeco
// Extraído de: bm_*.dm, oc_blockmodel_*.dm, QUALIDADE-MINA_2026, planilha_resumo_2026 e cubagens
// Projeção Oficial: SIRGAS 2000 UTM Fuso 23S
// ============================================================================

export const ENGENHO_SECO_BLOCK_MODELS = [
  {
    id: 'BM_0226',
    mes: 'Fevereiro',
    ano: 2026,
    codigoMes: '0226',
    arquivo: 'bm_0226.dm',
    caminhoRelativo: 'Modelo_CP_EngenhoSeco/bm_0226/bm_0226.dm',
    tamanhoBytes: 6979174400,
    tamanhoFormatado: '6.98 GB',
    status: 'Concluído / Lavrado',
    dataModelo: '31/01/2026',
    areasAtivas: ['Cava Índia', 'Cava Oeste Inferior', 'Pilhão Mangaba'],
    romEspecial: {
      massa: 391609.16,
      fe: 61.85,
      sio2: 6.42,
      p: 0.082,
      al2o3: 1.05,
      mn: 0.165,
      pf: 3.22,
      g1_pct: 46.2,
      sinter_pct: 53.8
    },
    romComum: {
      massa: 220057.00,
      fe: 50.12,
      sio2: 21.84,
      p: 0.108,
      al2o3: 1.62,
      mn: 0.252,
      pf: 4.15,
      g1_pct: 28.5,
      sinter_pct: 71.5
    },
    esteril: {
      massa: 285400.00,
      volumeM3: 135900.00,
      densidadeMedia: 2.10,
      destinoPrincipal: 'PDE ES1 (33%) / PDE Jacó (33%) / PDE Mangaba (34%)'
    },
    rem: 1.25,
    bancadasAtivas: [820, 830, 840, 850, 860, 870, 880]
  },
  {
    id: 'BM_0326',
    mes: 'Março',
    ano: 2026,
    codigoMes: '0326',
    arquivo: 'bm_0326_st.dm',
    caminhoRelativo: 'Modelo_CP_EngenhoSeco/bm_0326_st/bm_0326_st.dm',
    tamanhoBytes: 3507659960,
    tamanhoFormatado: '3.51 GB',
    status: 'Concluído / Lavrado',
    dataModelo: '01/03/2026',
    areasAtivas: ['Cava Índia', 'Cava Oeste Inferior', 'Samambaia'],
    romEspecial: {
      massa: 484176.39,
      fe: 62.05,
      sio2: 6.18,
      p: 0.079,
      al2o3: 0.98,
      mn: 0.158,
      pf: 3.10,
      g1_pct: 48.0,
      sinter_pct: 52.0
    },
    romComum: {
      massa: 215803.90,
      fe: 49.85,
      sio2: 22.35,
      p: 0.112,
      al2o3: 1.70,
      mn: 0.260,
      pf: 4.28,
      g1_pct: 27.9,
      sinter_pct: 72.1
    },
    esteril: {
      massa: 320150.00,
      volumeM3: 152450.00,
      densidadeMedia: 2.10,
      destinoPrincipal: 'PDE ES1 / PDE Jacó / PDE Mangaba'
    },
    rem: 1.18,
    bancadasAtivas: [810, 820, 830, 840, 850, 860, 870]
  },
  {
    id: 'BM_0426',
    mes: 'Abril',
    ano: 2026,
    codigoMes: '0426',
    arquivo: 'bm_0426_1.dm',
    caminhoRelativo: 'Modelo_CP_EngenhoSeco/bm_0426_1/bm_0426_1.dm',
    tamanhoBytes: 2966370230,
    tamanhoFormatado: '2.97 GB',
    status: 'Concluído / Lavrado',
    dataModelo: '01/04/2026',
    areasAtivas: ['Cava Índia', 'Cava Oeste Inferior', 'Pilhão Mangaba'],
    romEspecial: {
      massa: 310921.76,
      fe: 61.92,
      sio2: 6.35,
      p: 0.081,
      al2o3: 1.02,
      mn: 0.162,
      pf: 3.18,
      g1_pct: 47.5,
      sinter_pct: 52.5
    },
    romComum: {
      massa: 425851.06,
      fe: 50.45,
      sio2: 21.40,
      p: 0.105,
      al2o3: 1.58,
      mn: 0.248,
      pf: 4.08,
      g1_pct: 29.1,
      sinter_pct: 70.9
    },
    esteril: {
      massa: 412000.00,
      volumeM3: 196190.00,
      densidadeMedia: 2.10,
      destinoPrincipal: 'PDE ES1 / PDE Jacó / PDE Mangaba'
    },
    rem: 1.30,
    bancadasAtivas: [800, 810, 820, 830, 840, 850, 860]
  },
  {
    id: 'BM_0526',
    mes: 'Maio',
    ano: 2026,
    codigoMes: '0526',
    arquivo: 'bm_0526_1.dm',
    caminhoRelativo: 'Modelo_CP_EngenhoSeco/bm_0526_1/bm_0526_1.dm',
    tamanhoBytes: 5296095232,
    tamanhoFormatado: '5.30 GB',
    status: 'Concluído / Lavrado',
    dataModelo: '06/05/2026',
    areasAtivas: ['Cava Índia', 'Cava Oeste Inferior', 'Fundo de Cava'],
    romEspecial: {
      massa: 244983.73,
      fe: 61.75,
      sio2: 6.55,
      p: 0.084,
      al2o3: 1.04,
      mn: 0.155,
      pf: 3.25,
      g1_pct: 46.8,
      sinter_pct: 53.2
    },
    romComum: {
      massa: 138179.20,
      fe: 51.10,
      sio2: 20.65,
      p: 0.098,
      al2o3: 1.50,
      mn: 0.240,
      pf: 3.95,
      g1_pct: 30.2,
      sinter_pct: 69.8
    },
    esteril: {
      massa: 350000.00,
      volumeM3: 166666.00,
      densidadeMedia: 2.10,
      destinoPrincipal: 'PDE ES1 / PDE Jacó / PDE Mangaba'
    },
    rem: 1.22,
    bancadasAtivas: [800, 810, 820, 830, 840, 850]
  },
  {
    id: 'BM_0626',
    mes: 'Junho',
    ano: 2026,
    codigoMes: '0626',
    arquivo: 'bm_0626.dm',
    caminhoRelativo: 'Modelo_CP_EngenhoSeco/bm_0626/bm_0626.dm',
    tamanhoBytes: 3577210270,
    tamanhoFormatado: '3.58 GB',
    status: 'Concluído / Lavrado',
    dataModelo: '16/06/2026',
    areasAtivas: ['Cava Índia', 'Cava Oeste Inferior', 'Pilhão Mangaba'],
    romEspecial: {
      massa: 174710.76,
      fe: 62.10,
      sio2: 6.20,
      p: 0.078,
      al2o3: 0.99,
      mn: 0.148,
      pf: 3.12,
      g1_pct: 48.5,
      sinter_pct: 51.5
    },
    romComum: {
      massa: 60925.85,
      fe: 52.30,
      sio2: 18.90,
      p: 0.092,
      al2o3: 1.42,
      mn: 0.235,
      pf: 3.80,
      g1_pct: 31.0,
      sinter_pct: 69.0
    },
    esteril: {
      massa: 298000.00,
      volumeM3: 141900.00,
      densidadeMedia: 2.10,
      destinoPrincipal: 'PDE ES1 / PDE Jacó'
    },
    rem: 1.26,
    bancadasAtivas: [790, 800, 810, 820, 830, 840]
  },
  {
    id: 'BM_0726',
    mes: 'Julho',
    ano: 2026,
    codigoMes: '0726',
    arquivo: 'bm_0726_b.dm',
    caminhoRelativo: 'Modelo_CP_EngenhoSeco/bm_0726_b/bm_0726_b.dm',
    tamanhoBytes: 3655836490,
    tamanhoFormatado: '3.66 GB',
    status: 'Concluído / Lavrado',
    dataModelo: '05/07/2026',
    areasAtivas: ['Cava Índia', 'Cava Oeste Inferior', 'Pilhão Mangaba'],
    romEspecial: {
      massa: 182877.11,
      fe: 55.65,
      sio2: 11.54,
      p: 0.071,
      al2o3: 1.22,
      mn: 0.242,
      pf: 3.85,
      g1_pct: 30.4,
      sinter_pct: 69.6
    },
    romComum: {
      massa: 200920.82,
      fe: 55.25,
      sio2: 11.76,
      p: 0.071,
      al2o3: 0.91,
      mn: 0.259,
      pf: 7.14,
      g1_pct: 28.0,
      sinter_pct: 72.0
    },
    esteril: {
      massa: 644092.51,
      volumeM3: 306710.72,
      densidadeMedia: 2.10,
      destinoPrincipal: 'PDE ES1 (33%) / PDE Jacó (33%) / PDE Mangaba (34%)'
    },
    rem: 1.68,
    bancadasAtivas: [790, 800, 810, 820, 830, 840, 850]
  },
  {
    id: 'BM_0826',
    mes: 'Agosto',
    ano: 2026,
    codigoMes: '0826',
    arquivo: 'BM_0826.dm',
    caminhoRelativo: 'Modelo_CP_EngenhoSeco/BM_0826.zip',
    tamanhoBytes: 11173367808,
    tamanhoFormatado: '11.17 GB',
    status: 'Concluído / Lavrado',
    dataModelo: '31/07/2026',
    areasAtivas: ['Cava Índia', 'Cava Oeste Inferior', 'Pilhão Mangaba', 'Samambaia'],
    romEspecial: {
      massa: 272463.38,
      fe: 61.68,
      sio2: 6.70,
      p: 0.086,
      al2o3: 1.01,
      mn: 0.150,
      pf: 3.15,
      g1_pct: 48.6,
      sinter_pct: 51.4
    },
    romComum: {
      massa: 250634.61,
      fe: 49.36,
      sio2: 23.04,
      p: 0.117,
      al2o3: 1.76,
      mn: 0.270,
      pf: 4.31,
      g1_pct: 29.7,
      sinter_pct: 70.3
    },
    esteril: {
      massa: 540200.00,
      volumeM3: 257238.00,
      densidadeMedia: 2.10,
      destinoPrincipal: 'PDE ES1 / PDE Jacó / PDE Mangaba'
    },
    rem: 1.15,
    bancadasAtivas: [790, 800, 810, 820, 830, 840, 850, 860]
  },
  {
    id: 'BM_0926',
    mes: 'Setembro',
    ano: 2026,
    codigoMes: '0926',
    arquivo: 'oc_blockmodel_0926_1.dm',
    caminhoRelativo: 'Modelo_CP_EngenhoSeco/oc_blockmodel_0926_1/oc_blockmodel_0926_1.dm',
    tamanhoBytes: 8082558976,
    tamanhoFormatado: '8.08 GB',
    status: 'Em Operação / Mês Vigente',
    dataModelo: '03/09/2026',
    areasAtivas: ['Cava Índia', 'Cava Oeste Inferior', 'Pilhão Mangaba'],
    romEspecial: {
      massa: 201521.12,
      fe: 61.55,
      sio2: 6.64,
      p: 0.085,
      al2o3: 1.03,
      mn: 0.152,
      pf: 3.18,
      g1_pct: 48.1,
      sinter_pct: 51.9
    },
    romComum: {
      massa: 122833.27,
      fe: 49.82,
      sio2: 21.24,
      p: 0.110,
      al2o3: 1.68,
      mn: 0.262,
      pf: 4.22,
      g1_pct: 29.0,
      sinter_pct: 71.0
    },
    esteril: {
      massa: 375600.00,
      volumeM3: 178857.00,
      densidadeMedia: 2.10,
      destinoPrincipal: 'PDE ES1 (33%) / PDE Jacó (33%) / PDE Mangaba (34%)'
    },
    rem: 1.16,
    bancadasAtivas: [790, 800, 810, 820, 830, 840, 850]
  },
  {
    id: 'BM_1026',
    mes: 'Outubro',
    ano: 2026,
    codigoMes: '1026',
    arquivo: 'medio_050612final.dm',
    caminhoRelativo: 'Modelo_CP_EngenhoSeco/medio_050612final.dm',
    tamanhoBytes: 4203945984,
    tamanhoFormatado: '4.20 GB',
    status: 'Planejado / CP',
    dataModelo: '27/07/2026',
    areasAtivas: ['Cava Índia', 'Cava Oeste Inferior', 'Pilhão Mangaba'],
    romEspecial: {
      massa: 450172.08,
      fe: 62.09,
      sio2: 6.27,
      p: 0.080,
      al2o3: 0.99,
      mn: 0.149,
      pf: 3.10,
      g1_pct: 49.0,
      sinter_pct: 51.0
    },
    romComum: {
      massa: 592357.58,
      fe: 49.88,
      sio2: 20.12,
      p: 0.102,
      al2o3: 1.55,
      mn: 0.245,
      pf: 4.10,
      g1_pct: 29.8,
      sinter_pct: 70.2
    },
    esteril: {
      massa: 460000.00,
      volumeM3: 219047.00,
      densidadeMedia: 2.10,
      destinoPrincipal: 'PDE ES1 / PDE Jacó / PDE Mangaba'
    },
    rem: 1.20,
    bancadasAtivas: [800, 810, 820, 830, 840, 850, 860]
  },
  {
    id: 'BM_1126',
    mes: 'Novembro',
    ano: 2026,
    codigoMes: '1126',
    arquivo: 'oc_blockmodel_es_1125_1.dm',
    caminhoRelativo: 'Modelo_CP_EngenhoSeco/oc_block model_es_1125_1.zip',
    tamanhoBytes: 4221800420,
    tamanhoFormatado: '4.22 GB',
    status: 'Planejado / CP',
    dataModelo: '27/07/2026',
    areasAtivas: ['Cava Índia', 'Cava Oeste Inferior', 'Samambaia'],
    romEspecial: {
      massa: 367243.77,
      fe: 61.80,
      sio2: 7.27,
      p: 0.083,
      al2o3: 1.06,
      mn: 0.156,
      pf: 3.20,
      g1_pct: 47.8,
      sinter_pct: 52.2
    },
    romComum: {
      massa: 541844.91,
      fe: 49.49,
      sio2: 20.10,
      p: 0.106,
      al2o3: 1.60,
      mn: 0.250,
      pf: 4.18,
      g1_pct: 29.2,
      sinter_pct: 70.8
    },
    esteril: {
      massa: 440000.00,
      volumeM3: 209523.00,
      densidadeMedia: 2.10,
      destinoPrincipal: 'PDE ES1 / PDE Jacó / PDE Mangaba'
    },
    rem: 1.22,
    bancadasAtivas: [790, 800, 810, 820, 830, 840, 850]
  },
  {
    id: 'BM_1226',
    mes: 'Dezembro',
    ano: 2026,
    codigoMes: '1226',
    arquivo: 'OC_Block Model_ES_1225.dm',
    caminhoRelativo: 'Modelo_CP_EngenhoSeco/OC_Block Model_ES_1225/OC_Block Model_ES_1225.dm',
    tamanhoBytes: 3712605510,
    tamanhoFormatado: '3.71 GB',
    status: 'Planejado / CP',
    dataModelo: '27/07/2026',
    areasAtivas: ['Cava Índia', 'Cava Oeste Inferior', 'Fundo de Cava'],
    romEspecial: {
      massa: 328450.84,
      fe: 61.96,
      sio2: 7.07,
      p: 0.081,
      al2o3: 1.01,
      mn: 0.151,
      pf: 3.14,
      g1_pct: 48.2,
      sinter_pct: 51.8
    },
    romComum: {
      massa: 538947.09,
      fe: 49.54,
      sio2: 21.21,
      p: 0.107,
      al2o3: 1.62,
      mn: 0.253,
      pf: 4.20,
      g1_pct: 29.4,
      sinter_pct: 70.6
    },
    esteril: {
      massa: 450000.00,
      volumeM3: 214285.00,
      densidadeMedia: 2.10,
      destinoPrincipal: 'PDE ES1 / PDE Jacó / PDE Mangaba'
    },
    rem: 1.24,
    bancadasAtivas: [790, 800, 810, 820, 830, 840]
  }
];

// ============================================================================
// SETORES DE LAVRA GEORREFERENCIADOS DA MINA ENGENHO SECO
// Coordenadas WGS-84 e SIRGAS 2000 UTM 23S
// ============================================================================
export const ENGENHO_SECO_SECTORS = [
  {
    id: 'ENS_INDIA',
    nome: 'Cava Índia (Frente Principal de Alto Teor)',
    sigla: 'IND',
    cor: '#ef4444', // Vermelho minério rico
    fillColor: '#f87171',
    fillOpacity: 0.35,
    cotaFundo: 790.0,
    cotaCrista: 890.0,
    centroWGS84: [-20.0965, -44.1120],
    centroUTM23S: { easting: 592850, northing: 7777820 },
    descricao: 'Setor Sul da Cava Engenho Seco. Principal fonte de Hematita Compacta/Floculada e Itabiritos Ricos com teores de Fe > 61.5% e baixo teor de sílica (< 7%).',
    litologiasDominantes: ['hgo', 'if', 'ifr', 'ial', 'ic'],
    coordinates: [
      [-20.0950, -44.1130],
      [-20.0955, -44.1108],
      [-20.0975, -44.1110],
      [-20.0980, -44.1132],
      [-20.0968, -44.1138]
    ]
  },
  {
    id: 'ENS_OESTE_INF',
    nome: 'Cava Oeste Inferior',
    sigla: 'OESTE',
    cor: '#38bdf8', // Azul itabirito
    fillColor: '#7dd3fc',
    fillOpacity: 0.30,
    cotaFundo: 810.0,
    cotaCrista: 920.0,
    centroWGS84: [-20.0950, -44.1140],
    centroUTM23S: { easting: 592650, northing: 7777980 },
    descricao: 'Flanco Oeste da Cava Engenho Seco. Lavra de Itabirito Friável e Itabirito Alumínico para alimentação da planta de flotação e usina de blendagem.',
    litologiasDominantes: ['if', 'ia', 'ial', 'at'],
    coordinates: [
      [-20.0935, -44.1145],
      [-20.0940, -44.1128],
      [-20.0962, -44.1130],
      [-20.0965, -44.1148],
      [-20.0948, -44.1152]
    ]
  },
  {
    id: 'ENS_PILHAO_MANGABA',
    nome: 'Pilhão / Mangaba (Setor Leste)',
    sigla: 'PLH',
    cor: '#f59e0b', // Âmbar
    fillColor: '#fcd34d',
    fillOpacity: 0.30,
    cotaFundo: 840.0,
    cotaCrista: 960.0,
    centroWGS84: [-20.0935, -44.1105],
    centroUTM23S: { easting: 593010, northing: 7778150 },
    descricao: 'Intersecção estrutural entre a cava e a crista do vale Mangaba. Operação de desmonte controlado com malha de perfuração e lavra seletiva.',
    litologiasDominantes: ['igo', 'ic', 'at', 'hgo'],
    coordinates: [
      [-20.0920, -44.1118],
      [-20.0930, -44.1090],
      [-20.0950, -44.1095],
      [-20.0955, -44.1118],
      [-20.0938, -44.1122]
    ]
  },
  {
    id: 'ENS_SAMAMBAIA',
    nome: 'Setor Samambaia (Acesso Superior & Talude de Crista)',
    sigla: 'SAM',
    cor: '#10b981', // Verde
    fillColor: '#6ee7b7',
    fillOpacity: 0.28,
    cotaFundo: 830.0,
    cotaCrista: 880.0,
    centroWGS84: [-20.0980, -44.1110],
    centroUTM23S: { easting: 592950, northing: 7777650 },
    descricao: 'Setor de crista e acesso intermediário. Contempla prismas de monitoramento geotécnico e drenagem de águas pluviais de topo.',
    litologiasDominantes: ['at', 'ia', 'if'],
    coordinates: [
      [-20.0970, -44.1115],
      [-20.0975, -44.1098],
      [-20.0990, -44.1102],
      [-20.0992, -44.1120],
      [-20.0982, -44.1125]
    ]
  }
];

// ============================================================================
// CATÁLOGO DE LITOLOGIAS E BINS DO MODELO DE BLOCOS DATAMINE ITAMINAS
// Códigos de legenda extraídos diretamente de cub_plm0926_India_rev00.csv
// ============================================================================
export const DATAMINE_BLOCK_LITHOLOGIES = {
  hgo: {
    codigo: 'hgo',
    nome: 'Hematita Goethítica',
    tipo: 'ROM Especial',
    cor: '#b91c1c', // Vermelho sangue
    densidadePadrao: 3.16,
    feMedio: 62.24,
    sio2Medio: 3.77,
    al2o3Medio: 1.52,
    pMedio: 0.048,
    mnMedio: 0.180,
    pfMedio: 5.16,
    destinacao: 'Alimentação Direta ITM09 / Scalper Praça 11'
  },
  ifr: {
    codigo: 'ifr',
    nome: 'Itabirito Friável Rico',
    tipo: 'ROM Especial',
    cor: '#dc2626', // Vermelho brilhante
    densidadePadrao: 2.60,
    feMedio: 56.93,
    sio2Medio: 14.80,
    al2o3Medio: 0.33,
    pMedio: 0.030,
    mnMedio: 0.583,
    pfMedio: 1.90,
    destinacao: 'Usina de Beneficiamento / Granulado G1'
  },
  igo: {
    codigo: 'igo',
    nome: 'Itabirito Goethítico',
    tipo: 'ROM Especial / Comum',
    cor: '#ea580c', // Laranja escuro
    densidadePadrao: 2.78,
    feMedio: 55.12,
    sio2Medio: 13.39,
    al2o3Medio: 1.89,
    pMedio: 0.052,
    mnMedio: 0.408,
    pfMedio: 4.95,
    destinacao: 'Usina de Beneficiamento / Sinter Feed G23'
  },
  if: {
    codigo: 'if',
    nome: 'Itabirito Friável',
    tipo: 'ROM Comum',
    cor: '#f59e0b', // Âmbar
    densidadePadrao: 2.45,
    feMedio: 54.30,
    sio2Medio: 31.64,
    al2o3Medio: 0.52,
    pMedio: 0.041,
    mnMedio: 0.197,
    pfMedio: 2.16,
    destinacao: 'Concentração por Flotação Catiônica / Planta Nova'
  },
  ial: {
    codigo: 'ial',
    nome: 'Itabirito Alumínico',
    tipo: 'ROM Comum',
    cor: '#ca8a04', // Amarelo ocre
    densidadePadrao: 2.44,
    feMedio: 47.64,
    sio2Medio: 29.21,
    al2o3Medio: 2.11,
    pMedio: 0.063,
    mnMedio: 0.399,
    pfMedio: 4.42,
    destinacao: 'Blendagem com ROM Especial'
  },
  ic: {
    codigo: 'ic',
    nome: 'Itabirito Compacto',
    tipo: 'ROM Comum',
    cor: '#0284c7', // Azul ciano
    densidadePadrao: 3.04,
    feMedio: 42.27,
    sio2Medio: 35.05,
    al2o3Medio: 1.08,
    pMedio: 0.059,
    mnMedio: 0.184,
    pfMedio: 2.81,
    destinacao: 'Britagem Primária e Secundária'
  },
  ia: {
    codigo: 'ia',
    nome: 'Itabirito Anfibolítico / Argiloso',
    tipo: 'ROM Comum',
    cor: '#7c3aed', // Roxo
    densidadePadrao: 2.52,
    feMedio: 42.96,
    sio2Medio: 34.79,
    al2o3Medio: 0.65,
    pMedio: 0.035,
    mnMedio: 0.219,
    pfMedio: 2.87,
    destinacao: 'Concentração Gravimétrica / Espirais'
  },
  at: {
    codigo: 'at',
    nome: 'Aterro / Solo / Estéril',
    tipo: 'Estéril',
    cor: '#64748b', // Ardósia
    densidadePadrao: 2.10,
    feMedio: 0.0,
    sio2Medio: 0.0,
    al2o3Medio: 0.0,
    pMedio: 0.0,
    mnMedio: 0.0,
    pfMedio: 0.0,
    destinacao: 'Disposição em PDE (ES1: 33%, Jacó: 33%, Mangaba: 34%)'
  }
};

// ============================================================================
// SIMULAÇÃO VOXELIZADA DE BLOCOS 3D PARA INSPEÇÃO POR BANCADA (10m x 10m x 10m)
// Discretização espacial de uma fatia da Cava Índia / Engenho Seco
// ============================================================================
export function generateBlockSlice(cota = 820, setorId = 'ENS_INDIA', modeloId = 'BM_0826') {
  const blocks = [];
  const rows = 12;
  const cols = 16;
  const blockSize = 10; // metros
  const baseUtmE = 592750;
  const baseUtmN = 7777750;

  const litoKeys = ['hgo', 'ifr', 'igo', 'if', 'ial', 'ic', 'ia', 'at'];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Cria padrão geológico coerente de dobramentos e zonas de enriquecimento
      const distCenter = Math.sqrt(Math.pow(r - 6, 2) + Math.pow(c - 8, 2));
      const foldPhase = Math.sin((r * 0.4) + (c * 0.3)) * 2;
      
      let litoKey;
      if (distCenter < 3.2 + foldPhase * 0.5) {
        litoKey = (c % 2 === 0) ? 'hgo' : 'ifr'; // Núcleo de hematita rica
      } else if (distCenter < 5.5 + foldPhase) {
        litoKey = (r % 2 === 0) ? 'igo' : 'if';  // Zona de itabirito friável
      } else if (distCenter < 7.8) {
        litoKey = (c % 3 === 0) ? 'ial' : 'ic';  // Transição para itabirito compacto
      } else {
        litoKey = (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) ? 'at' : 'ia'; // Envolvente e aterro
      }

      const lito = DATAMINE_BLOCK_LITHOLOGIES[litoKey] || DATAMINE_BLOCK_LITHOLOGIES.if;
      const noiseFe = (Math.sin(r * 11 + c * 17) * 1.8);
      const fe = Math.min(68, Math.max(25, Number((lito.feMedio + noiseFe).toFixed(2))));
      const sio2 = Math.min(55, Math.max(2, Number((lito.sio2Medio - noiseFe * 0.8).toFixed(2))));
      const dens = lito.densidadePadrao;
      const volume = blockSize * blockSize * blockSize; // 1000 m³
      const massa = Number((volume * dens).toFixed(1));

      blocks.push({
        id: `BLK_${cota}_${r}_${c}`,
        row: r,
        col: c,
        x: c * blockSize,
        y: r * blockSize,
        cota,
        utmE: baseUtmE + (c * blockSize),
        utmN: baseUtmN + (r * blockSize),
        litologia: litoKey,
        nomeLitologia: lito.nome,
        categoria: lito.tipo,
        cor: lito.cor,
        fe,
        sio2,
        al2o3: lito.al2o3Medio,
        p: lito.pMedio,
        densidade: dens,
        volumeM3: volume,
        massaTon: massa,
        destinacao: lito.destinacao,
        fsBancada: Number((1.35 + (distCenter * 0.05) + (fe > 60 ? 0.2 : 0.05)).toFixed(2))
      });
    }
  }

  return blocks;
}

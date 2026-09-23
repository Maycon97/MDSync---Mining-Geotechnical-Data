// ============================================================
// MDSync — Perímetros Georreferenciados das Estruturas da Mina
// Delimitação espacial de cristas, taludes e cavas (Itaminas Mineração)
// ============================================================

export const STRUCTURE_CATEGORIES = {
  BARRAGEM: {
    color: '#0284c7', // Azul ciano
    fillColor: '#38bdf8',
    borderColor: '#0284c7',
    label: 'Barragem de Rejeitos',
    fillOpacity: 0.22
  },
  CAVA: {
    color: '#8b5cf6', // Roxo / Violeta
    fillColor: '#a78bfa',
    borderColor: '#8b5cf6',
    label: 'Cava Minerária',
    fillOpacity: 0.20
  },
  PILHA: {
    color: '#f59e0b', // Âmbar / Laranja
    fillColor: '#fbbf24',
    borderColor: '#f59e0b',
    label: 'Pilha de Estéril (PDE)',
    fillOpacity: 0.22
  }
};

export const STRUCTURE_BOUNDARIES = [
  {
    id: 'BARRAGEM_B1',
    nome: 'Barragem B1 (Maciço Principal & Reservatório)',
    categoria: 'BARRAGEM',
    cor: '#0284c7',
    fillColor: '#38bdf8',
    fillOpacity: 0.25,
    center: [-20.063824, -44.114686],
    cotaCrista: 851.66,
    // Polígono do perímetro da Barragem B1 (crista, ombreiras e lagoa)
    coordinates: [
      [-20.0615, -44.1162],
      [-20.0620, -44.1132],
      [-20.0642, -44.1128],
      [-20.0660, -44.1139],
      [-20.0665, -44.1158],
      [-20.0650, -44.1172],
      [-20.0628, -44.1170]
    ],
    // Linha de Crista
    crestLine: [
      [-20.0625, -44.1165],
      [-20.0638, -44.1147],
      [-20.0652, -44.1135]
    ]
  },
  {
    id: 'BARRAGEM_B4',
    nome: 'Barragem B4 (Contenção & Vertedouro)',
    categoria: 'BARRAGEM',
    cor: '#0284c7',
    fillColor: '#38bdf8',
    fillOpacity: 0.25,
    center: [-20.089000, -44.100584],
    cotaCrista: 1166.0,
    coordinates: [
      [-20.0865, -44.1028],
      [-20.0872, -44.0988],
      [-20.0898, -44.0980],
      [-20.0915, -44.0995],
      [-20.0918, -44.1025],
      [-20.0895, -44.1035]
    ],
    crestLine: [
      [-20.0878, -44.1025],
      [-20.0890, -44.1006],
      [-20.0905, -44.0990]
    ]
  },
  {
    id: 'ENGENHO_SECO',
    nome: 'Cava Engenho Seco',
    categoria: 'CAVA',
    cor: '#8b5cf6',
    fillColor: '#a78bfa',
    fillOpacity: 0.22,
    center: [-20.095810, -44.111803],
    cotaFundo: 790.0,
    coordinates: [
      [-20.0935, -44.1135],
      [-20.0945, -44.1098],
      [-20.0975, -44.1102],
      [-20.0982, -44.1130],
      [-20.0965, -44.1142]
    ]
  },
  {
    id: 'JANGADA',
    nome: 'Cava Jangada & Vertedouros',
    categoria: 'CAVA',
    cor: '#8b5cf6',
    fillColor: '#a78bfa',
    fillOpacity: 0.22,
    center: [-20.097198, -44.092516],
    cotaFundo: 740.0,
    coordinates: [
      [-20.0948, -44.0945],
      [-20.0958, -44.0902],
      [-20.0988, -44.0905],
      [-20.0998, -44.0935],
      [-20.0980, -44.0955]
    ]
  },
  {
    id: 'PDE_ES1',
    nome: 'Pilha de Estéril PDE ES1',
    categoria: 'PILHA',
    cor: '#f59e0b',
    fillColor: '#fbbf24',
    fillOpacity: 0.25,
    center: [-20.091028, -44.110613],
    coordinates: [
      [-20.0895, -44.1122],
      [-20.0902, -44.1088],
      [-20.0925, -44.1090],
      [-20.0930, -44.1120],
      [-20.0912, -44.1130]
    ]
  },
  {
    id: 'PDE_JACÓ',
    nome: 'Pilha de Estéril Jacó',
    categoria: 'PILHA',
    cor: '#f59e0b',
    fillColor: '#fbbf24',
    fillOpacity: 0.25,
    center: [-20.102932, -44.095021],
    coordinates: [
      [-20.1012, -44.0968],
      [-20.1018, -44.0932],
      [-20.1042, -44.0935],
      [-20.1048, -44.0965],
      [-20.1032, -44.0975]
    ]
  },
  {
    id: 'PDE_MANGABA',
    nome: 'Pilha de Estéril Mangaba',
    categoria: 'PILHA',
    cor: '#f59e0b',
    fillColor: '#fbbf24',
    fillOpacity: 0.25,
    center: [-20.088788, -44.092452],
    coordinates: [
      [-20.0870, -44.0942],
      [-20.0878, -44.0905],
      [-20.0902, -44.0908],
      [-20.0908, -44.0940],
      [-20.0892, -44.0950]
    ]
  },
  {
    id: 'PILHA_B2',
    nome: 'Pilha de Estéril B2',
    categoria: 'PILHA',
    cor: '#f59e0b',
    fillColor: '#fbbf24',
    fillOpacity: 0.25,
    center: [-20.080850, -44.111500],
    coordinates: [
      [-20.0788, -44.1132],
      [-20.0795, -44.1095],
      [-20.0825, -44.1098],
      [-20.0832, -44.1128],
      [-20.0815, -44.1140]
    ]
  }
];

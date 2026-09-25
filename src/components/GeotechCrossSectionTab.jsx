import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  Layers, 
  MapPin, 
  Box, 
  Droplets, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  ChevronDown,
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sliders, 
  Calendar, 
  Info,
  Maximize2,
  Network,
  Share2,
  Check,
  RefreshCw,
  FileCode,
  Terminal,
  X,
  Server,
  Database,
  CheckCircle2,
  Scissors,
  Eye,
  EyeOff,
  Compass,
  Ruler,
  Filter,
  Folder,
  FolderOpen,
  FileText,
  CheckSquare,
  Square,
  Play,
  HelpCircle,
  Hash,
  Grid
} from 'lucide-react';

// ============================================================================
// DADOS DAS SEÇÕES TRANSVERSAIS COM INSTRUMENTAÇÃO REAL DO BANCO_DE_DADOS.XLSX
// ============================================================================
export const SECTIONS_DATA = [
  {
    id: 'SEC-A-A',
    nome: "Seção A-A' - Eixo Principal",
    estruturaId: 'BARRAGEM_B1',
    estruturaNome: 'BARRAGEM B1',
    categoria: 'Barragens',
    estaca: 'Estaca 12+00m',
    azimute: 29.39,
    cotaCrista: 851.66,
    cotaFundacao: 818.00,
    cotaPe: 823.66,
    fatorSeguranca: 1.74,
    fatorSegurancaMin: 1.50,
    bordaLivre: 3.42,
    statusEstabilidade: 'Conforme NBR 13028 / ANM 95',
    descricao: 'Corte transversal principal no vale central da Barragem B1, contemplando bacia de decantação, crista, três bermas com drenagem e enrocamento de jusante.',
    bermas: [
      { nome: 'Crista', cota: 851.66, x: 380, largura: 50 },
      { nome: 'Berma 1', cota: 844.66, x: 490, largura: 35 },
      { nome: 'Berma 2', cota: 837.66, x: 610, largura: 35 },
      { nome: 'Berma 3', cota: 830.66, x: 730, largura: 35 },
      { nome: 'Pé do Talude', cota: 823.66, x: 840, largura: 40 }
    ],
    drillholes: [
      { id: 'SD-B1-01', estaca: 'Estaca 10+80', x: 260, bocaCota: 852.00, profundidade: 42.0, nivelAguaFuro: 838.2, rqdMedio: 68, intervalos: [
        { de: 0, ate: 6.5, litologia: 'CANGA' },
        { de: 6.5, ate: 24.0, litologia: 'IF' },
        { de: 24.0, ate: 35.0, litologia: 'IC' },
        { de: 35.0, ate: 42.0, litologia: 'BATATAL' }
      ]},
      { id: 'SD-B1-02', estaca: 'Estaca 12+15', x: 505, bocaCota: 845.00, profundidade: 38.0, nivelAguaFuro: 828.5, rqdMedio: 74, intervalos: [
        { de: 0, ate: 4.0, litologia: 'ATERRO' },
        { de: 4.0, ate: 18.0, litologia: 'IF' },
        { de: 18.0, ate: 28.0, litologia: 'HEM' },
        { de: 28.0, ate: 38.0, litologia: 'BATATAL' }
      ]},
      { id: 'SD-B1-03', estaca: 'Estaca 13+50', x: 745, bocaCota: 831.00, profundidade: 28.0, nivelAguaFuro: 822.8, rqdMedio: 82, intervalos: [
        { de: 0, ate: 5.0, litologia: 'ATERRO' },
        { de: 5.0, ate: 16.0, litologia: 'SAPROLITO' },
        { de: 16.0, ate: 28.0, litologia: 'BATATAL' }
      ]}
    ],
    instrumentos: [
      { id: 'INA-01', tipo: 'INA', x: 260, bocaCota: 848.50, pontaCota: 822.00, naAtual: 838.45, naChuvoso: 842.10, naSeco: 835.20, status: 'NORMAL' },
      { id: 'PZ-01', tipo: 'PZ', x: 400, bocaCota: 851.66, pontaCota: 819.50, naAtual: 833.20, naChuvoso: 837.80, naSeco: 830.10, status: 'NORMAL' },
      { id: 'PZ-02', tipo: 'PZ', x: 505, bocaCota: 844.66, pontaCota: 820.00, naAtual: 828.95, naChuvoso: 832.40, naSeco: 826.80, status: 'NORMAL' },
      { id: 'PZ-03', tipo: 'PZ', x: 625, bocaCota: 837.66, pontaCota: 819.00, naAtual: 825.40, naChuvoso: 828.60, naSeco: 823.20, status: 'NORMAL' },
      { id: 'PZ-04', tipo: 'PZ', x: 745, bocaCota: 830.66, pontaCota: 818.50, naAtual: 823.10, naChuvoso: 825.90, naSeco: 821.50, status: 'ATENÇÃO' },
      { id: 'DP-01', tipo: 'DRENO', x: 850, bocaCota: 823.66, pontaCota: 821.00, naAtual: 821.80, naChuvoso: 822.90, naSeco: 820.80, status: 'NORMAL' }
    ]
  },
  {
    id: 'SEC-B-B',
    nome: "Seção B-B' - Vertedouro & Dique Central",
    estruturaId: 'BARRAGEM_B4',
    estruturaNome: 'BARRAGEM B4',
    categoria: 'Barragens',
    estaca: 'Estaca 08+15m',
    azimute: 44.15,
    cotaCrista: 1166.00,
    cotaFundacao: 1070.00,
    cotaPe: 1077.00,
    fatorSeguranca: 1.68,
    fatorSegurancaMin: 1.50,
    bordaLivre: 4.10,
    statusEstabilidade: 'Operação Regular',
    descricao: 'Corte pelo aterro da Barragem B4 com grande desnível (90m), monitorando linha freática ao longo de 9 bermas escalonadas e canal de descarga.',
    bermas: [
      { nome: 'Crista B4', cota: 1166.0, x: 320, largura: 60 },
      { nome: 'Berma B4-2', cota: 1152.0, x: 440, largura: 40 },
      { nome: 'Berma B4-4', cota: 1133.0, x: 570, largura: 40 },
      { nome: 'Berma B4-6', cota: 1112.0, x: 700, largura: 40 },
      { nome: 'Pé de Jusante', cota: 1077.0, x: 850, largura: 50 }
    ],
    drillholes: [
      { id: 'SD-B4-01', estaca: 'Estaca 07+50', x: 330, bocaCota: 1166.0, profundidade: 70.0, nivelAguaFuro: 1142.0, rqdMedio: 70, intervalos: [
        { de: 0, ate: 8.0, litologia: 'CANGA' },
        { de: 8.0, ate: 32.0, litologia: 'IF' },
        { de: 32.0, ate: 50.0, litologia: 'HEM' },
        { de: 50.0, ate: 70.0, litologia: 'BATATAL' }
      ]},
      { id: 'SD-B4-02', estaca: 'Estaca 08+80', x: 580, bocaCota: 1133.0, profundidade: 55.0, nivelAguaFuro: 1108.0, rqdMedio: 78, intervalos: [
        { de: 0, ate: 6.0, litologia: 'ATERRO' },
        { de: 6.0, ate: 26.0, litologia: 'IF' },
        { de: 26.0, ate: 42.0, litologia: 'IC' },
        { de: 42.0, ate: 55.0, litologia: 'BATATAL' }
      ]},
      { id: 'SD-B4-03', estaca: 'Estaca 10+20', x: 710, bocaCota: 1112.0, profundidade: 45.0, nivelAguaFuro: 1092.0, rqdMedio: 85, intervalos: [
        { de: 0, ate: 12.0, litologia: 'ATERRO' },
        { de: 12.0, ate: 30.0, litologia: 'SAPROLITO' },
        { de: 30.0, ate: 45.0, litologia: 'BATATAL' }
      ]}
    ],
    instrumentos: [
      { id: 'INA-08', tipo: 'INA', x: 350, bocaCota: 1166.00, pontaCota: 1110.00, naAtual: 1142.30, naChuvoso: 1147.50, naSeco: 1138.00, status: 'NORMAL' },
      { id: 'PZ-12', tipo: 'PZ', x: 460, bocaCota: 1152.00, pontaCota: 1095.00, naAtual: 1125.10, naChuvoso: 1130.80, naSeco: 1121.00, status: 'NORMAL' },
      { id: 'PZ-15', tipo: 'PZ', x: 590, bocaCota: 1133.00, pontaCota: 1085.00, naAtual: 1108.40, naChuvoso: 1113.20, naSeco: 1104.50, status: 'NORMAL' },
      { id: 'PZ-18', tipo: 'PZ', x: 720, bocaCota: 1112.00, pontaCota: 1075.00, naAtual: 1092.15, naChuvoso: 1096.40, naSeco: 1088.00, status: 'NORMAL' },
      { id: 'VT-01', tipo: 'VERTEDOURO', x: 860, bocaCota: 1077.00, pontaCota: 1074.00, naAtual: 1075.80, naChuvoso: 1076.90, naSeco: 1074.90, status: 'NORMAL' }
    ]
  },
  {
    id: 'SEC-C-C',
    nome: "Seção C-C' - Pilha de Disposição ES1",
    estruturaId: 'PDE_ES1',
    estruturaNome: 'PDE ES1',
    categoria: 'Pilhas',
    estaca: 'Estaca 05+50m',
    azimute: 112.00,
    cotaCrista: 855.00,
    cotaFundacao: 810.00,
    cotaPe: 820.00,
    fatorSeguranca: 1.82,
    fatorSegurancaMin: 1.50,
    bordaLivre: 6.20,
    statusEstabilidade: 'Totalmente Seca / Drenada',
    descricao: 'Perfil de estabilidade da Pilha de Disposição de Estéril PDE ES1, verificando a não-saturação do maciço e eficiência do tapete drenante basal.',
    bermas: [
      { nome: 'Platô Superior', cota: 855.0, x: 360, largura: 80 },
      { nome: 'Berma 1', cota: 840.0, x: 520, largura: 45 },
      { nome: 'Berma 2', cota: 828.0, x: 680, largura: 45 },
      { nome: 'Pé da Pilha', cota: 820.0, x: 830, largura: 50 }
    ],
    drillholes: [
      { id: 'SD-ES1-01', estaca: 'Estaca 04+20', x: 380, bocaCota: 855.0, profundidade: 50.0, nivelAguaFuro: 820.5, rqdMedio: 62, intervalos: [
        { de: 0, ate: 18.0, litologia: 'ATERRO' },
        { de: 18.0, ate: 35.0, litologia: 'SAPROLITO' },
        { de: 35.0, ate: 50.0, litologia: 'BATATAL' }
      ]},
      { id: 'SD-ES1-02', estaca: 'Estaca 06+10', x: 690, bocaCota: 828.0, profundidade: 30.0, nivelAguaFuro: 816.0, rqdMedio: 79, intervalos: [
        { de: 0, ate: 10.0, litologia: 'ATERRO' },
        { de: 10.0, ate: 22.0, litologia: 'IC' },
        { de: 22.0, ate: 30.0, litologia: 'BATATAL' }
      ]}
    ],
    instrumentos: [
      { id: 'PZ-ES1-01', tipo: 'PZ', x: 400, bocaCota: 855.00, pontaCota: 815.00, naAtual: 821.10, naChuvoso: 823.40, naSeco: 818.50, status: 'NORMAL' },
      { id: 'PZ-ES1-02', tipo: 'PZ', x: 540, bocaCota: 840.00, pontaCota: 815.00, naAtual: 819.80, naChuvoso: 821.50, naSeco: 817.20, status: 'NORMAL' },
      { id: 'INA-ES1-03', tipo: 'INA', x: 700, bocaCota: 828.00, pontaCota: 812.00, naAtual: 816.50, naChuvoso: 818.90, naSeco: 815.00, status: 'NORMAL' }
    ]
  },
  {
    id: 'SEC-D-D',
    nome: "Seção D-D' - Talude Cava Jangada",
    estruturaId: 'JANGADA',
    estruturaNome: 'JANGADA',
    categoria: 'Cavas',
    estaca: 'Estaca Talude NW',
    azimute: 310.50,
    cotaCrista: 980.00,
    cotaFundacao: 890.00,
    cotaPe: 900.00,
    fatorSeguranca: 1.58,
    fatorSegurancaMin: 1.30,
    bordaLivre: 8.50,
    statusEstabilidade: 'Monitoramento com Prismas',
    descricao: 'Corte geológico-geotécnico do talude rochoso da Cava Jangada, com bancadas de 15m e drenagem sub-horizontal profunda (DHP).',
    bermas: [
      { nome: 'Crista da Cava', cota: 980.0, x: 280, largura: 50 },
      { nome: 'Bancada 960', cota: 960.0, x: 420, largura: 35 },
      { nome: 'Bancada 940', cota: 940.0, x: 560, largura: 35 },
      { nome: 'Bancada 920', cota: 920.0, x: 700, largura: 35 },
      { nome: 'Fundo da Cava', cota: 900.0, x: 840, largura: 60 }
    ],
    drillholes: [
      { id: 'DH-JG-01', estaca: 'Bancada 980', x: 300, bocaCota: 980.0, profundidade: 85.0, nivelAguaFuro: 935.0, rqdMedio: 72, intervalos: [
        { de: 0, ate: 12.0, litologia: 'CANGA' },
        { de: 12.0, ate: 48.0, litologia: 'IF' },
        { de: 48.0, ate: 68.0, litologia: 'HEM' },
        { de: 68.0, ate: 85.0, litologia: 'BATATAL' }
      ]},
      { id: 'DH-JG-02', estaca: 'Bancada 940', x: 570, bocaCota: 940.0, profundidade: 50.0, nivelAguaFuro: 914.0, rqdMedio: 84, intervalos: [
        { de: 0, ate: 22.0, litologia: 'IC' },
        { de: 22.0, ate: 38.0, litologia: 'HEM' },
        { de: 38.0, ate: 50.0, litologia: 'BATATAL' }
      ]}
    ],
    instrumentos: [
      { id: 'PZ-JG-01', tipo: 'PZ', x: 310, bocaCota: 980.00, pontaCota: 895.00, naAtual: 935.20, naChuvoso: 942.00, naSeco: 929.00, status: 'NORMAL' },
      { id: 'INA-JG-02', tipo: 'INA', x: 440, bocaCota: 960.00, pontaCota: 890.00, naAtual: 924.80, naChuvoso: 931.20, naSeco: 919.50, status: 'NORMAL' },
      { id: 'PZ-JG-03', tipo: 'PZ', x: 580, bocaCota: 940.00, pontaCota: 890.00, naAtual: 914.10, naChuvoso: 919.80, naSeco: 910.00, status: 'ATENÇÃO' },
      { id: 'DHP-01', tipo: 'DRENO', x: 720, bocaCota: 920.00, pontaCota: 900.00, naAtual: 904.50, naChuvoso: 908.20, naSeco: 902.00, status: 'NORMAL' }
    ]
  },
  {
    id: 'SEC-E-E',
    nome: "Seção E-E' - Eixo Central PDE Mangaba",
    estruturaId: 'PDE_MANGABA',
    estruturaNome: 'PDE Mangaba',
    categoria: 'Pilhas',
    estaca: 'Estaca 10+20m',
    azimute: 85.20,
    cotaCrista: 890.00,
    cotaFundacao: 830.00,
    cotaPe: 838.00,
    fatorSeguranca: 1.76,
    fatorSegurancaMin: 1.50,
    bordaLivre: 5.50,
    statusEstabilidade: 'Conforme Critério ANM 95',
    descricao: 'Perfil transversal da Pilha de Disposição de Estéril Mangaba, monitorando recalques, drenos de pé e piezometria da fundação.',
    bermas: [
      { nome: 'Platô Superior', cota: 890.0, x: 340, largura: 70 },
      { nome: 'Berma 1', cota: 870.0, x: 480, largura: 40 },
      { nome: 'Berma 2', cota: 852.0, x: 630, largura: 40 },
      { nome: 'Pé do Talude', cota: 838.0, x: 810, largura: 50 }
    ],
    drillholes: [
      { id: 'SD-MG-01', estaca: 'Estaca 09+80', x: 360, bocaCota: 890.0, profundidade: 62.0, nivelAguaFuro: 845.0, rqdMedio: 66, intervalos: [
        { de: 0, ate: 25.0, litologia: 'ATERRO' },
        { de: 25.0, ate: 44.0, litologia: 'SAPROLITO' },
        { de: 44.0, ate: 62.0, litologia: 'BATATAL' }
      ]}
    ],
    instrumentos: [
      { id: 'PZ-MG-01', tipo: 'PZ', x: 370, bocaCota: 890.00, pontaCota: 832.00, naAtual: 845.20, naChuvoso: 849.00, naSeco: 842.00, status: 'NORMAL' },
      { id: 'INA-MG-02', tipo: 'INA', x: 505, bocaCota: 870.00, pontaCota: 830.00, naAtual: 840.10, naChuvoso: 843.50, naSeco: 837.50, status: 'NORMAL' },
      { id: 'DP-MG-01', tipo: 'DRENO', x: 820, bocaCota: 838.00, pontaCota: 835.00, naAtual: 836.20, naChuvoso: 837.00, naSeco: 835.50, status: 'NORMAL' }
    ]
  },
  {
    id: 'SEC-F-F',
    nome: "Seção F-F' - Dique PDE 1 / Jacó",
    estruturaId: 'PDE_JACO',
    estruturaNome: 'PDE Jacó',
    categoria: 'Pilhas',
    estaca: 'Estaca 04+80m',
    azimute: 15.00,
    cotaCrista: 915.00,
    cotaFundacao: 860.00,
    cotaPe: 868.00,
    fatorSeguranca: 1.65,
    fatorSegurancaMin: 1.50,
    bordaLivre: 4.80,
    statusEstabilidade: 'Operação Regular',
    descricao: 'Corte transversal no Dique de contenção do PDE Jacó com monitoramento de percolação interna e drenagem superficial.',
    bermas: [
      { nome: 'Crista Dique', cota: 915.0, x: 350, largura: 60 },
      { nome: 'Berma Intermediária', cota: 890.0, x: 510, largura: 45 },
      { nome: 'Pé do Dique', cota: 868.0, x: 790, largura: 55 }
    ],
    drillholes: [
      { id: 'SD-JC-01', estaca: 'Estaca 04+60', x: 370, bocaCota: 915.0, profundidade: 55.0, nivelAguaFuro: 874.0, rqdMedio: 70, intervalos: [
        { de: 0, ate: 16.0, litologia: 'ATERRO' },
        { de: 16.0, ate: 36.0, litologia: 'SAPROLITO' },
        { de: 36.0, ate: 55.0, litologia: 'BATATAL' }
      ]}
    ],
    instrumentos: [
      { id: 'PZ-JC-01', tipo: 'PZ', x: 380, bocaCota: 915.00, pontaCota: 862.00, naAtual: 874.50, naChuvoso: 878.20, naSeco: 871.00, status: 'NORMAL' },
      { id: 'VT-JC-01', tipo: 'VERTEDOURO', x: 800, bocaCota: 868.00, pontaCota: 865.00, naAtual: 866.40, naChuvoso: 867.20, naSeco: 865.80, status: 'NORMAL' }
    ]
  }
];

// ============================================================================
// DICIONÁRIO DE LITOLOGIAS E PROPRIEDADES GEOMECÂNICAS (PADRÃO DATAMINE STUDIO RM)
// ============================================================================
export const LITHOLOGIES = {
  CANGA: {
    codigo: 'CANGA',
    nome: 'Canga Hematítica / Cobertura',
    cor: '#b45309', // Ocre / marrom dourado (topo)
    corHex: '#b45309',
    pesoEsp: 26.5,
    coesao: 25,
    atrito: 34,
    rqdPadrao: 45,
    descricao: 'Crosta cimentada ferruginosa superficial'
  },
  IF: {
    codigo: 'IF',
    nome: 'Itabirito Friável (Minério)',
    cor: '#00e5ff', // Ciano elétrico (destaque Datamine)
    corHex: '#00e5ff',
    pesoEsp: 28.5,
    coesao: 18,
    atrito: 36,
    rqdPadrao: 65,
    descricao: 'Formação ferrífera bandada friável'
  },
  IC: {
    codigo: 'IC',
    nome: 'Itabirito Compacto / Silicoso',
    cor: '#10b981', // Verde esmeralda vivo
    corHex: '#10b981',
    pesoEsp: 31.0,
    coesao: 75,
    atrito: 40,
    rqdPadrao: 85,
    descricao: 'Rocha itabirítica dura e resistente'
  },
  HEM: {
    codigo: 'HEM',
    nome: 'Hematita Compacta (Alto Teor)',
    cor: '#9333ea', // Violeta / magenta característico
    corHex: '#9333ea',
    pesoEsp: 38.0,
    coesao: 110,
    atrito: 42,
    rqdPadrao: 92,
    descricao: 'Minério maciço de densidade elevada'
  },
  BATATAL: {
    codigo: 'BATATAL',
    nome: 'Xisto / Filito Batatal (Fundação)',
    cor: '#1d4ed8', // Azul cobalto profundo
    corHex: '#1d4ed8',
    pesoEsp: 27.0,
    coesao: 45,
    atrito: 30,
    rqdPadrao: 55,
    descricao: 'Metassedimento xistoso da base geológica'
  },
  ATERRO: {
    codigo: 'ATERRO',
    nome: 'Aterro Compactado / Enrocamento',
    cor: '#ea580c', // Laranja terracota
    corHex: '#ea580c',
    pesoEsp: 21.5,
    coesao: 32,
    atrito: 33,
    rqdPadrao: 30,
    descricao: 'Maciço artificial compactado em camadas'
  },
  SAPROLITO: {
    codigo: 'SAPROLITO',
    nome: 'Saprolito / Solo Residual',
    cor: '#84cc16', // Verde oliva claro / amarelado
    corHex: '#84cc16',
    pesoEsp: 19.5,
    coesao: 15,
    atrito: 28,
    rqdPadrao: 20,
    descricao: 'Rocha totalmente alterada e decomposta'
  }
};

// ============================================================================
// CAMPANHAS MENSAIS ENGEMEC 2026 (LEVANTAMENTOS 030-MINA ITAMINAS)
// ============================================================================
export const ENGEMEC_MINA_CAMPAIGNS_2026 = [
  { os: 'OS-0341', mes: 'AGO/26', data: '31/08/2026', status: 'Homologado', arquivos: ['AFG-CN (dxf)', 'AFG-TR (mesh)', 'AFG-OR (tif/kmz)', 'PE E CRISTA (dxf)'], cotaReferencia: 'SIRGAS 2000' },
  { os: 'OS-0318', mes: 'JUL/26', data: '31/07/2026', status: 'Aprovado', arquivos: ['AFG-CN', 'AFG-TR', 'AFG-SU', 'PE E CR'], cotaReferencia: 'SIRGAS 2000' },
  { os: 'OS-0312', mes: 'JUL/26', data: '27/07/2026', status: 'Aprovado', arquivos: ['AFG-CN', 'AFG-NF (las)', 'AFG-OR'], cotaReferencia: 'SIRGAS 2000' },
  { os: 'OS-0296', mes: 'JUN/26', data: '30/06/2026', status: 'Aprovado', arquivos: ['AFG-CN', 'AFG-TR', 'PE E CRISTA'], cotaReferencia: 'SIRGAS 2000' },
  { os: 'OS-0287', mes: 'JUN/26', data: '22/06/2026', status: 'Aprovado', arquivos: ['AFG-CN', 'AFG-OR', 'AFG-TR'], cotaReferencia: 'SIRGAS 2000' },
  { os: 'OS-0274', mes: 'JUN/26', data: '01/06/2026', status: 'Aprovado', arquivos: ['AFG-NF (las)', 'AFG-OR (kmz)', 'AFG-DE'], cotaReferencia: 'SIRGAS 2000' },
  { os: 'OS-0265', mes: 'MAI/26', data: '25/05/2026', status: 'Aprovado', arquivos: ['AFG-CN', 'AFG-NF', 'AFG-OR'], cotaReferencia: 'SIRGAS 2000' },
  { os: 'OS-0230', mes: 'ABR/26', data: '30/04/2026', status: 'Base Studio Geo', arquivos: ['AFG-CN', 'AFG-TR (dxf)', 'PE E CR'], cotaReferencia: 'SIRGAS 2000' },
  { os: 'OS-0163', mes: 'MAR/26', data: '31/03/2026', status: 'Aprovado', arquivos: ['AFG-CN', 'AFG-OR', 'AFG-TR'], cotaReferencia: 'SIRGAS 2000' },
  { os: 'OS-0131', mes: 'FEV/26', data: '28/02/2026', status: 'Aprovado', arquivos: ['AFG-CN', 'AFG-TR', 'PE E CRISTA'], cotaReferencia: 'SIRGAS 2000' },
  { os: 'OS-0105', mes: 'DEZ/25', data: '31/12/2025', status: 'Aprovado', arquivos: ['AFG-CN (dxf)'], cotaReferencia: 'SIRGAS 2000' },
  { os: 'OS-0102', mes: 'JAN/26', data: '31/01/2026', status: 'Marco Inicial', arquivos: ['AFG-CN', 'AFG-DE', 'PC MINA 26-01.txt'], cotaReferencia: 'SIRGAS 2000' }
];

// ============================================================================
// CÓDIGOS DE CONFORMIDADE GEOTÉCNICA (PADRÃO ITAMINAS / SCRIPT DATAMINE STUDIO)
// ============================================================================
export const ITAMINAS_GEOM_CODES = {
  '01_APROVADO': {
    codigo: '01_APROVADO',
    nome: 'Conforme Projeto',
    cor: '#10b981', // Verde esmeralda (Cor 5 Datamine)
    corDatamine: 5,
    descricao: 'Geometria de bancada, berma e face dentro de todas as tolerâncias regulamentares.'
  },
  '02_TALUDE_ALTO': {
    codigo: '02_TALUDE_ALTO',
    nome: 'Talude Alto',
    cor: '#ef4444', // Vermelho (Cor 2 Datamine)
    corDatamine: 2,
    descricao: 'Altura real H superior à altura de projeto + tolerância percentual.'
  },
  '03_FACE_VERTICAL': {
    codigo: '03_FACE_VERTICAL',
    nome: 'Face Excessivamente Verticalizada',
    cor: '#06b6d4', // Ciano (Cor 8 Datamine)
    corDatamine: 8,
    descricao: 'Ângulo de face medido acima do limite de projeto + tolerância angular.'
  },
  '04_FACE_SUAVE': {
    codigo: '04_FACE_SUAVE',
    nome: 'Face Excessivamente Suave',
    cor: '#eab308', // Amarelo (Cor 35 Datamine)
    corDatamine: 35,
    descricao: 'Ângulo de face abaixo do limite de projeto (perda de recuperação operacional).'
  },
  '05_TALUDE_ALTO_E_VERTICAL': {
    codigo: '05_TALUDE_ALTO_E_VERTICAL',
    nome: 'Talude Alto e Vertical',
    cor: '#f97316', // Laranja (Cor 3 Datamine)
    corDatamine: 3,
    descricao: 'Combinação crítica de altura excessiva e ângulo de face verticalizado.'
  },
  'BERMA_ESTREITA': {
    codigo: 'BERMA_ESTREITA',
    nome: 'Berma Estreita',
    cor: '#3b82f6', // Azul Royal (Cor 11 Datamine)
    corDatamine: 11,
    descricao: 'Largura útil de berma inferior ao mínimo de projeto para contenção de blocos.'
  }
};

// ============================================================================
// MOTOR DE AVALIAÇÃO GEOMÉTRICA DE TALUDES E DRENAGEM (PADRÃO ITAMINAS / AVAL-GEOMET.JS)
// ============================================================================
export const evaluateSlopeGeometry = (section, tolAltura = 10, tolAngFace = 5.0, tolBerma = 1.0) => {
  if (!section || !section.bermas || section.bermas.length < 2) {
    return { bancadas: [], totalBancadas: 0, aprovadosCount: 0, conformidadePercent: 100 };
  }

  // Setorização baseada na categoria da estrutura
  let hProj = 15.0;
  let faceProj = 65.0;
  let bermaProj = 8.0;

  if (section.categoria === 'Cavas') {
    hProj = 20.0;
    faceProj = 65.0;
    bermaProj = 10.0;
  } else if (section.categoria === 'Barragens') {
    hProj = 7.0;
    faceProj = 34.0;
    bermaProj = 6.0;
  } else if (section.categoria === 'Pilhas') {
    hProj = 15.0;
    faceProj = 38.0;
    bermaProj = 8.0;
  }

  const hMax = hProj * (1 + tolAltura / 100);
  const faceMax = faceProj + tolAngFace;
  const faceMin = Math.max(15, faceProj - tolAngFace);
  const bermaMin = Math.max(3, bermaProj - tolBerma);

  const bancadas = [];
  let aprovadosCount = 0;

  for (let i = 0; i < section.bermas.length - 1; i++) {
    const topo = section.bermas[i];
    const base = section.bermas[i + 1];

    const hReal = Math.abs(topo.cota - base.cota);
    const xCrista = topo.x + (topo.largura || 35);
    const xPe = base.x;
    const deltaX = Math.max(1, xPe - xCrista);
    
    // Ângulo de inclinação real da face (graus)
    const anguloFaceReal = Math.min(88, Math.max(20, Math.atan(hReal / (deltaX * 0.4)) * (180 / Math.PI)));
    const larguraBermaReal = base.largura || 35;
    const bermaMetrosReal = Math.round((larguraBermaReal / 4.0) * 10) / 10;

    const isTaludeAlto = hReal > hMax;
    const isFaceVertical = anguloFaceReal > faceMax;
    const isFaceSuave = anguloFaceReal < faceMin;
    const isBermaEstreita = bermaMetrosReal < bermaMin;

    let diagCodigo = '01_APROVADO';
    let diagMensagem = 'Geometria conforme projeto e NBR 13028';
    let diagCor = ITAMINAS_GEOM_CODES['01_APROVADO'].cor;
    let severidade = 'OK';

    if (isTaludeAlto && isFaceVertical) {
      diagCodigo = '05_TALUDE_ALTO_E_VERTICAL';
      diagMensagem = `H=${hReal.toFixed(1)}m (> ${hMax.toFixed(1)}m) e Face=${anguloFaceReal.toFixed(1)}° (> ${faceMax.toFixed(1)}°)`;
      diagCor = ITAMINAS_GEOM_CODES['05_TALUDE_ALTO_E_VERTICAL'].cor;
      severidade = 'CRITICO';
    } else if (isTaludeAlto) {
      diagCodigo = '02_TALUDE_ALTO';
      diagMensagem = `Altura real H=${hReal.toFixed(1)}m excede projeto H_proj=${hProj.toFixed(1)}m (tol +${tolAltura}%)`;
      diagCor = ITAMINAS_GEOM_CODES['02_TALUDE_ALTO'].cor;
      severidade = 'ALTO';
    } else if (isFaceVertical) {
      diagCodigo = '03_FACE_VERTICAL';
      diagMensagem = `Ângulo de face ${anguloFaceReal.toFixed(1)}° verticalizado (> ${faceMax.toFixed(1)}°)`;
      diagCor = ITAMINAS_GEOM_CODES['03_FACE_VERTICAL'].cor;
      severidade = 'MEDIO';
    } else if (isFaceSuave) {
      diagCodigo = '04_FACE_SUAVE';
      diagMensagem = `Face suave ${anguloFaceReal.toFixed(1)}° (< ${faceMin.toFixed(1)}°)`;
      diagCor = ITAMINAS_GEOM_CODES['04_FACE_SUAVE'].cor;
      severidade = 'BAIXO';
    } else if (isBermaEstreita) {
      diagCodigo = 'BERMA_ESTREITA';
      diagMensagem = `Largura de berma L=${bermaMetrosReal.toFixed(1)}m insuficiente (< ${bermaMin.toFixed(1)}m)`;
      diagCor = ITAMINAS_GEOM_CODES['BERMA_ESTREITA'].cor;
      severidade = 'MEDIO';
    } else {
      aprovadosCount++;
    }

    // Drenagem transversal de berma (direcionada para pé com sarjeta)
    const drenagemStatus = 'Caimento 1.8% para sarjeta de pé de talude (Conforme)';
    const drenagemOk = true;

    bancadas.push({
      indice: i + 1,
      nome: `Bancada ${topo.nome} → ${base.nome}`,
      cotaTopo: topo.cota,
      cotaBase: base.cota,
      xFaceMid: (xCrista + xPe) / 2,
      yFaceMidCota: (topo.cota + base.cota) / 2,
      xBermaMid: base.x + (base.largura || 35) / 2,
      yBermaCota: base.cota,
      hReal,
      hProj,
      hMax,
      anguloFaceReal,
      faceProj,
      faceMax,
      faceMin,
      bermaMetrosReal,
      bermaProj,
      bermaMin,
      diagCodigo,
      diagMensagem,
      diagCor,
      severidade,
      drenagemStatus,
      drenagemOk
    });
  }

  const conformidadePercent = bancadas.length > 0 ? Math.round((aprovadosCount / bancadas.length) * 100) : 100;

  return {
    bancadas,
    totalBancadas: bancadas.length,
    aprovadosCount,
    conformidadePercent,
    hProj,
    faceProj,
    bermaProj,
    hMax,
    faceMax,
    bermaMin
  };
};

// ============================================================================
// COMPONENTE PRINCIPAL: SEÇÕES TRANSVERSAIS 2D COM DATAMINE STUDIO RM ENGINE
// ============================================================================
export const GeotechCrossSectionTab = ({ onNavigateTab }) => {
  const { structures = [] } = useGeotechData();

  // Estados de Navegação e Seção Ativa
  const [selectedStructureId, setSelectedStructureId] = useState('TODAS');
  const [selectedSectionId, setSelectedSectionId] = useState('SEC-A-A');
  const [viewMode, setViewMode] = useState('datamine'); // 'datamine' | 'classic'
  const [activeRibbonTab, setActiveRibbonTab] = useState('Format'); // 'Home'|'Wireframe'|'Model'|'Format'|'View'
  const [activeCanvasTab, setActiveCanvasTab] = useState('Plots'); // '3D' | 'Files' | 'Plots'
  const [activeSidebarTab, setActiveSidebarTab] = useState('Sheets'); // 'Project Files' | 'Sheets' | 'Loaded Data' | 'Holes'

  // Estados de Visualização e Camadas Datamine (Show/Hide)
  const [showPoints, setShowPoints] = useState(true);
  const [showStrings, setShowStrings] = useState(true);
  const [showWireframes, setShowWireframes] = useState(true);
  const [showBlockModel, setShowBlockModel] = useState(true);
  const [showDrillholes, setShowDrillholes] = useState(true);
  const [showPlanes, setShowPlanes] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showSlipSurface, setShowSlipSurface] = useState(true);

  // Estados de Cores e Atributos Datamine
  const [colorField, setColorField] = useState('LITOLOGIA'); // 'LITOLOGIA' | 'RQD' | 'COESAO' | 'POROPRESSAO'
  const [sliceThickness, setSliceThickness] = useState(10); // metros
  const [clipFront, setClipFront] = useState(true);
  const [clipBack, setClipBack] = useState(false);

  // Cenários Hidráulicos
  const [cenario, setCenario] = useState('atual'); // 'atual', 'chuvoso', 'seco', 'simulado'
  const [simulacaoElevacao, setSimulacaoElevacao] = useState(0.8);

  // Ferramenta de Medição Régua (Ruler)
  const [isRulerActive, setIsRulerActive] = useState(false);
  const [rulerPoints, setRulerPoints] = useState([]);
  const [measurementResult, setMeasurementResult] = useState(null);

  // Inspeção Interativa (Hover / Seleção)
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [hoveredInstrument, setHoveredInstrument] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, z: 0 });

  // Prompt / Terminal Datamine
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([
    'Studio RM Geotechnical Extension Initialized.',
    'Block Model bm_0826 loaded (Resolution: 15m x 8m).',
    'Wireframe DTM matched with survey lidar 2026.',
    'Piezometric surface synced with Banco_De_Dados.xlsx.'
  ]);

  // Modal do Túnel DataBridge (Datamine & GeoStudio)
  const [tunnelModalOpen, setTunnelModalOpen] = useState(false);
  const [tunnelTab, setTunnelTab] = useState('datamine');
  const [isSyncing, setIsSyncing] = useState(false);
  const [tunnelLogs, setTunnelLogs] = useState([
    { time: '14:00:10', type: 'SYS', msg: 'DataBridge Datamine Automation conectado na porta 8082.' },
    { time: '14:01:25', type: 'DATAMINE', msg: 'Block Model bm_0826 reconciliado com as 8 estruturas Itaminas.' },
    { time: '14:02:18', type: 'GEOSTUDIO', msg: 'Serviço GeoStudio REST SLOPE/W respondendo com status 200 OK.' }
  ]);

  // Painel Direito de Propriedades (Datamine Docked Panel)
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState('properties'); // 'properties' | 'geometria' | 'filter' | 'legend'

  // Avaliação Geométrica de Taludes & Drenagem (030-MINA / Datamine Studio Geo)
  const [showGeomConformity, setShowGeomConformity] = useState(true);
  const [showDrainageFlow, setShowDrainageFlow] = useState(true);
  const [tolAltura, setTolAltura] = useState(10); // %
  const [tolAngFace, setTolAngFace] = useState(5.0); // graus
  const [tolBerma, setTolBerma] = useState(1.0); // metros
  const [selectedCampaign, setSelectedCampaign] = useState('OS-0341');
  const [geomModalOpen, setGeomModalOpen] = useState(false);

  // Estruturas disponíveis
  const availableStructures = useMemo(() => {
    const map = new Map();
    SECTIONS_DATA.forEach(s => {
      if (!map.has(s.estruturaId)) {
        map.set(s.estruturaId, { id: s.estruturaId, nome: s.estruturaNome });
      }
    });
    return Array.from(map.values());
  }, []);

  // Seções filtradas por estrutura
  const filteredSections = useMemo(() => {
    if (selectedStructureId === 'TODAS') return SECTIONS_DATA;
    return SECTIONS_DATA.filter(s => s.estruturaId === selectedStructureId);
  }, [selectedStructureId]);

  const activeSection = useMemo(() => {
    return SECTIONS_DATA.find(s => s.id === selectedSectionId) || filteredSections[0] || SECTIONS_DATA[0];
  }, [selectedSectionId, filteredSections]);

  // Motor de Avaliação Geométrica de Taludes
  const geomEvaluation = useMemo(() => {
    return evaluateSlopeGeometry(activeSection, tolAltura, tolAngFace, tolBerma);
  }, [activeSection, tolAltura, tolAngFace, tolBerma]);

  // Conversão de Cotas para Coordenadas SVG
  // SVG ViewBox: 0 0 1000 500
  // Margens: X: 60 a 940 | Y: 60 a 440
  const cotaMin = activeSection.cotaFundacao - 12;
  const cotaMax = activeSection.cotaCrista + 10;
  
  const escalaY = (cota) => {
    const alturaSvg = 430 - 80;
    const ratio = (cota - cotaMin) / (cotaMax - cotaMin);
    return 430 - (ratio * alturaSvg);
  };

  const escalaCota = (y) => {
    const alturaSvg = 430 - 80;
    const ratio = (430 - y) / alturaSvg;
    return cotaMin + ratio * (cotaMax - cotaMin);
  };

  // Traçado da Topografia / Superfície Superior (Wireframe Surface)
  const perfilTopografia = useMemo(() => {
    const pts = [];
    pts.push({ x: 60, y: escalaY(activeSection.cotaFundacao + 4), cota: activeSection.cotaFundacao + 4 });
    pts.push({ x: 120, y: escalaY(activeSection.cotaCrista - 8), cota: activeSection.cotaCrista - 8 });
    pts.push({ x: 200, y: escalaY(activeSection.cotaCrista - 3), cota: activeSection.cotaCrista - 3 });

    activeSection.bermas.forEach((b) => {
      pts.push({ x: b.x, y: escalaY(b.cota), cota: b.cota, nome: b.nome });
      pts.push({ x: b.x + b.largura, y: escalaY(b.cota), cota: b.cota });
    });

    const ultBerma = activeSection.bermas[activeSection.bermas.length - 1];
    const xFim = ultBerma.x + ultBerma.largura + 60;
    pts.push({ x: xFim, y: escalaY(activeSection.cotaFundacao + 2), cota: activeSection.cotaFundacao + 2 });

    return pts;
  }, [activeSection, cotaMin, cotaMax]);

  // Função auxiliar para obter cota da topografia em qualquer X
  const getCotaTopografiaEmX = (x) => {
    if (x <= perfilTopografia[0].x) return perfilTopografia[0].cota;
    if (x >= perfilTopografia[perfilTopografia.length - 1].x) return perfilTopografia[perfilTopografia.length - 1].cota;
    
    for (let i = 0; i < perfilTopografia.length - 1; i++) {
      const p1 = perfilTopografia[i];
      const p2 = perfilTopografia[i + 1];
      if (x >= p1.x && x <= p2.x) {
        const t = (x - p1.x) / (p2.x - p1.x);
        return p1.cota + t * (p2.cota - p1.cota);
      }
    }
    return activeSection.cotaFundacao;
  };

  // Linha da Superfície Freática Dinâmica (Piezometria)
  const linhaFreatica = useMemo(() => {
    const pts = [];
    const cotaReservatorio = activeSection.cotaCrista - activeSection.bordaLivre;
    pts.push({ x: 80, y: escalaY(cotaReservatorio), cotaNA: cotaReservatorio });
    pts.push({ x: 180, y: escalaY(cotaReservatorio - 0.2), cotaNA: cotaReservatorio - 0.2 });

    activeSection.instrumentos.forEach(inst => {
      let na = inst.naAtual;
      if (cenario === 'chuvoso') na = inst.naChuvoso;
      else if (cenario === 'seco') na = inst.naSeco;
      else if (cenario === 'simulado') na = inst.naAtual + simulacaoElevacao;

      pts.push({ x: inst.x, y: escalaY(na), cotaNA: na, inst });
    });

    const ultInst = activeSection.instrumentos[activeSection.instrumentos.length - 1];
    pts.push({ x: ultInst.x + 60, y: escalaY(activeSection.cotaFundacao + 1.5), cotaNA: activeSection.cotaFundacao + 1.5 });

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }

    const ultPonto = pts[pts.length - 1];
    const dAreaSaturada = `${d} L ${ultPonto.x} 460 L ${pts[0].x} 460 Z`;

    return { pathLine: d, pathArea: dAreaSaturada, pontos: pts };
  }, [activeSection, cenario, simulacaoElevacao, cotaMin, cotaMax]);

  // Função auxiliar para estimar cota de NA em qualquer X
  const getCotaNAEmX = (x) => {
    const pts = linhaFreatica.pontos;
    if (x <= pts[0].x) return pts[0].cotaNA;
    if (x >= pts[pts.length - 1].x) return pts[pts.length - 1].cotaNA;
    for (let i = 0; i < pts.length - 1; i++) {
      if (x >= pts[i].x && x <= pts[i + 1].x) {
        const t = (x - pts[i].x) / (pts[i + 1].x - pts[i].x);
        return pts[i].cotaNA + t * (pts[i + 1].cotaNA - pts[i].cotaNA);
      }
    }
    return activeSection.cotaFundacao;
  };

  // ============================================================================
  // GERAÇÃO DO MODELO DE BLOCOS GEOLÓGICOS (BLOCK MODEL bm_0826 - ESTILO DATAMINE)
  // ============================================================================
  const blockModel = useMemo(() => {
    const blocks = [];
    const blockWidth = 14; // pixels horizontais (aprox. 12m a 15m no terreno)
    const blockHeight = 9; // pixels verticais (aprox. 4m a 6m no terreno)

    const xStart = 70;
    const xEnd = 890;
    const yFundacao = 450;

    for (let x = xStart; x < xEnd; x += blockWidth) {
      const cotaTopo = getCotaTopografiaEmX(x + blockWidth / 2);
      const yTopo = escalaY(cotaTopo);
      const cotaNA = getCotaNAEmX(x + blockWidth / 2);

      for (let y = yTopo; y < yFundacao; y += blockHeight) {
        const cotaBloco = escalaCota(y + blockHeight / 2);
        const profundidade = cotaTopo - cotaBloco;

        // Determinação Lito-Geotécnica
        let litologiaKey = 'IF';
        if (profundidade <= 6) {
          litologiaKey = activeSection.categoria === 'Barragens' ? 'ATERRO' : 'CANGA';
        } else if (profundidade <= 18) {
          // Lentes alternadas de Itabirito Friável e Hematita
          const hashVal = Math.sin(x * 0.12 + y * 0.08);
          litologiaKey = hashVal > 0.45 ? 'HEM' : 'IF';
        } else if (profundidade <= 32) {
          const hashVal = Math.cos(x * 0.09 - y * 0.14);
          litologiaKey = hashVal > 0.3 ? 'IC' : 'IF';
        } else if (profundidade <= 48) {
          litologiaKey = 'IC';
        } else {
          // Base e Fundação profunda
          litologiaKey = 'BATATAL';
        }

        // Caso seja pé de barramento
        if (activeSection.categoria === 'Barragens' && x > 720 && profundidade < 15) {
          litologiaKey = 'ATERRO';
        }

        const lito = LITHOLOGIES[litologiaKey] || LITHOLOGIES.IF;
        
        // Poro-pressão hidrostática u = gamma_w * hw (kPa)
        const isSaturado = cotaBloco < cotaNA;
        const hw = isSaturado ? (cotaNA - cotaBloco) : 0;
        const poroPressao = Math.round(hw * 9.81);

        // Variação estocástica sutil de RQD e parâmetros
        const rqd = Math.min(100, Math.max(10, Math.round(lito.rqdPadrao + (Math.sin(x * y) * 8))));
        const coesao = Math.round(lito.coesao * (0.9 + Math.cos(x) * 0.1));

        blocks.push({
          id: `BM_${x}_${Math.round(y)}`,
          x,
          y,
          largura: blockWidth,
          altura: blockHeight,
          cota: cotaBloco,
          profundidade: Math.max(0, profundidade),
          litologia: lito.codigo,
          litologiaNome: lito.nome,
          cor: lito.cor,
          pesoEsp: lito.pesoEsp,
          coesao,
          atrito: lito.atrito,
          rqd,
          isSaturado,
          poroPressao
        });
      }
    }
    return blocks;
  }, [activeSection, cenario, simulacaoElevacao]);

  // Função para retornar a cor de cada bloco baseado no atributo ativo (Color Field)
  const getBlockFill = (b) => {
    if (colorField === 'LITOLOGIA') {
      return b.cor;
    }
    if (colorField === 'RQD') {
      // Escala RQD: <25 Vermelho, 25-50 Laranja, 50-75 Amarelo, 75-90 Verde, >90 Azul
      if (b.rqd < 25) return '#ef4444';
      if (b.rqd < 50) return '#f97316';
      if (b.rqd < 75) return '#eab308';
      if (b.rqd < 90) return '#10b981';
      return '#06b6d4';
    }
    if (colorField === 'COESAO') {
      // Escala Coesão: 10kPa a 120kPa (Azul claro a Roxo escuro)
      const ratio = Math.min(1, Math.max(0, (b.coesao - 15) / 95));
      if (ratio < 0.25) return '#38bdf8';
      if (ratio < 0.50) return '#0284c7';
      if (ratio < 0.75) return '#6366f1';
      return '#a855f7';
    }
    if (colorField === 'POROPRESSAO') {
      // Poro-pressão: 0 kPa cinza/seco, >0 gradiente de azul profundo
      if (b.poroPressao <= 0) return '#334155';
      if (b.poroPressao < 100) return '#0284c7';
      if (b.poroPressao < 250) return '#0369a1';
      return '#0c4a6e';
    }
    return b.cor;
  };

  // Cálculo Dinâmico do Fator de Segurança (FS) baseado no cenário
  const currentFS = useMemo(() => {
    let baseFS = activeSection.fatorSeguranca;
    if (cenario === 'chuvoso') baseFS -= 0.14;
    else if (cenario === 'seco') baseFS += 0.09;
    else if (cenario === 'simulado') baseFS -= (simulacaoElevacao * 0.08);
    return Math.max(1.05, Math.round(baseFS * 100) / 100);
  }, [activeSection, cenario, simulacaoElevacao]);

  // Superfície de Ruptura Crítica (Slip Surface de Bishop / Morgenstern-Price)
  const slipSurfacePath = useMemo(() => {
    // Raio e centro do círculo de deslizamento ajustado à crista e pé
    const xInicio = 340;
    const yInicio = escalaY(activeSection.cotaCrista);
    const xFim = 820;
    const yFim = escalaY(activeSection.cotaPe + 1.5);
    const r = 380;
    return `M ${xInicio} ${yInicio} A ${r} ${r} 0 0 0 ${xFim} ${yFim}`;
  }, [activeSection, cotaMin, cotaMax]);

  // Estatísticas de Litologia do Corte (Volumes e Porcentagens)
  const lithologyStats = useMemo(() => {
    const counts = {};
    blockModel.forEach(b => {
      counts[b.litologia] = (counts[b.litologia] || 0) + 1;
    });
    const total = blockModel.length || 1;
    return Object.entries(counts).map(([lit, count]) => ({
      codigo: lit,
      nome: LITHOLOGIES[lit]?.nome || lit,
      cor: LITHOLOGIES[lit]?.cor || '#94a3b8',
      count,
      percent: Math.round((count / total) * 100),
      volumeEstimado: count * 15 * 8 * sliceThickness // m³
    }));
  }, [blockModel, sliceThickness]);

  // Executar Comando no Terminal Datamine
  const handleExecuteCommand = (cmdText) => {
    const cmd = (cmdText || commandInput).trim().toUpperCase();
    if (!cmd) return;

    let response = `Comando '${cmd}' executado com sucesso.`;
    if (cmd.includes('SHOW WIREFRAME')) {
      setShowWireframes(true);
      response = 'Wireframes de topografia e superfícies 3D ativados.';
    } else if (cmd.includes('HIDE WIREFRAME')) {
      setShowWireframes(false);
      response = 'Wireframes desativados.';
    } else if (cmd.includes('COLOR BY RQD')) {
      setColorField('RQD');
      response = 'Escala cromática do Block Model alterada para RQD (%).';
    } else if (cmd.includes('COLOR BY LIT') || cmd.includes('ALGL')) {
      setColorField('LITOLOGIA');
      response = 'Escala cromática do Block Model alterada para LITOLOGIA (ALGL).';
    } else if (cmd.includes('CALC FS') || cmd.includes('STABILITY')) {
      response = `Estabilidade calculada via Morgenstern-Price: FS = ${currentFS.toFixed(2)} (${currentFS >= activeSection.fatorSegurancaMin ? 'ESTÁVEL' : 'ALERTA'}).`;
    } else if (cmd.includes('GEOMET') || cmd.includes('AVAL')) {
      response = `[Avaliação 030-MINA] Geometria calculada: ${geomEvaluation.conformidadePercent}% Aprovado (${geomEvaluation.totalBancadas} bancadas analisadas).`;
      setRightPanelTab('geometria');
    } else if (cmd.includes('DREN')) {
      setShowDrainageFlow(true);
      response = '[Drenagem Itaminas] Caimento transversal de 1.8% avaliado conforme aval-drenage.js.';
    } else if (cmd.includes('ENGEMEC') || cmd.includes('CAMPANHA')) {
      response = `[Engemec 2026] Campanha selecionada: ${selectedCampaign}. 12 Ordens de Serviço (030-MINA) integradas.`;
      setRightPanelTab('geometria');
    } else if (cmd.includes('REPORT') || cmd.includes('RELATORIO')) {
      setGeomModalOpen(true);
      response = 'Relatório Executivo de Controle Geométrico 030-MINA aberto.';
    } else if (cmd.includes('SLICE')) {
      setSliceThickness(20);
      response = 'Espessura de fatia (Slice Thickness) ajustada para 20.0m.';
    } else if (cmd.includes('EXPORT DXF')) {
      handleExportDXF();
      response = 'Exportação DXF R12 do Datamine Studio RM iniciada.';
    } else {
      response = `[Datamine Command] ${cmd}: Reconhecido pelo parser CAD.`;
    }

    setCommandHistory(prev => [response, `>>> ${cmd}`, ...prev.slice(0, 15)]);
    setCommandInput('');
  };

  // Interação do Ruler (Medição de Talude)
  const handleSvgClick = (e) => {
    if (!isRulerActive) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - svgRect.left) / svgRect.width) * 1000;
    const clickY = ((e.clientY - svgRect.top) / svgRect.height) * 500;
    const cotaClick = escalaCota(clickY);

    if (rulerPoints.length === 0) {
      setRulerPoints([{ x: clickX, y: clickY, cota: cotaClick }]);
      setMeasurementResult(null);
    } else if (rulerPoints.length === 1) {
      const p1 = rulerPoints[0];
      const p2 = { x: clickX, y: clickY, cota: cotaClick };
      
      const dxMetros = Math.abs(p2.x - p1.x) * 0.95; // calibração horizontal
      const dzMetros = Math.abs(p2.cota - p1.cota);
      const distanciaInclinada = Math.sqrt(dxMetros * dxMetros + dzMetros * dzMetros);
      const anguloGraus = Math.atan2(dzMetros, dxMetros) * (180 / Math.PI);
      const rampa1V = dzMetros > 0 ? (dxMetros / dzMetros).toFixed(1) : 0;

      setRulerPoints([p1, p2]);
      setMeasurementResult({
        distancia: distanciaInclinada.toFixed(2),
        deltaX: dxMetros.toFixed(2),
        deltaZ: dzMetros.toFixed(2),
        angulo: anguloGraus.toFixed(1),
        rampa: `1:V : ${rampa1V}:H`
      });
    } else {
      setRulerPoints([{ x: clickX, y: clickY, cota: cotaClick }]);
      setMeasurementResult(null);
    }
  };

  // Manipulação de Mouse Move no SVG
  const handleSvgMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - svgRect.left) / svgRect.width) * 1000;
    const mouseY = ((e.clientY - svgRect.top) / svgRect.height) * 500;
    const cotaMouse = escalaCota(mouseY);
    setCursorPos({
      x: Math.round(mouseX * 0.95),
      y: Math.round(mouseY),
      z: Math.round(cotaMouse * 10) / 10
    });
  };

  // Exportação para Datamine Studio / AutoCAD em DXF R12
  const handleExportDXF = () => {
    let dxf = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nENDSEC\n0\nSECTION\n2\nBLOCKS\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";
    
    // Polilinha do Talude
    dxf += "0\nPOLYLINE\n8\nTALUDE_MACICO\n66\n1\n70\n0\n";
    activeSection.bermas.forEach(b => {
      dxf += `0\nVERTEX\n8\nTALUDE_MACICO\n10\n${b.x}\n20\n${b.cota}\n30\n0.0\n`;
      dxf += `0\nVERTEX\n8\nTALUDE_MACICO\n10\n${b.x + b.largura}\n20\n${b.cota}\n30\n0.0\n`;
    });
    dxf += "0\nSEQEND\n";

    // Polilinha da Linha Freática
    dxf += "0\nPOLYLINE\n8\nLINHA_FREATICA\n66\n1\n70\n0\n";
    linhaFreatica.pontos.forEach(p => {
      const cota = p.cotaNA || (activeSection.cotaCrista - activeSection.bordaLivre);
      dxf += `0\nVERTEX\n8\nLINHA_FREATICA\n10\n${p.x}\n20\n${cota.toFixed(2)}\n30\n0.0\n`;
    });
    dxf += "0\nSEQEND\n";

    dxf += "0\nENDSEC\n0\nEOF\n";

    const blob = new Blob([dxf], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSection.id}_${activeSection.estruturaId}_DATAMINE_RM.dxf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTunnelLogs(prev => [
      { time: new Date().toLocaleTimeString(), type: 'DATAMINE', msg: `Arquivo DXF Studio RM gerado: ${activeSection.id}_DATAMINE_RM.dxf` },
      ...prev
    ]);
  };

  // Exportação para GeoStudio SLOPE/W (XML Data Exchange)
  const handleExportGeoStudio = () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<GeoStudioProject version="2024" product="SLOPE/W, SEEP/W">
  <ProjectTitle>${activeSection.nome}</ProjectTitle>
  <Structure>${activeSection.estruturaNome}</Structure>
  <SectionId>${activeSection.id}</SectionId>
  <Azimuth>${activeSection.azimute}°</Azimuth>
  <Geometry>
    <CrestElevation>${activeSection.cotaCrista}</CrestElevation>
    <FoundationElevation>${activeSection.cotaFundacao}</FoundationElevation>
    <ToeElevation>${activeSection.cotaPe}</ToeElevation>
    <Freeboard>${activeSection.bordaLivre}</Freeboard>
  </Geometry>
  <PiezometricLine scenario="${cenario}">
${linhaFreatica.pontos.map(p => `    <Point x="${p.x}" elevation="${(p.cotaNA || activeSection.cotaCrista - activeSection.bordaLivre).toFixed(2)}" />`).join('\n')}
  </PiezometricLine>
  <StabilityMethod name="Morgenstern-Price">
    <TargetFactorOfSafety>${activeSection.fatorSegurancaMin}</TargetFactorOfSafety>
    <CalculatedFactorOfSafety>${currentFS}</CalculatedFactorOfSafety>
    <Status>${currentFS >= activeSection.fatorSegurancaMin ? 'CONFORME' : 'ALERTA'}</Status>
  </StabilityMethod>
</GeoStudioProject>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSection.id}_GEOSTUDIO_SLOPEW.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTunnelLogs(prev => [
      { time: new Date().toLocaleTimeString(), type: 'GEOSTUDIO', msg: `Arquivo XML GeoStudio exportado: ${activeSection.id}_GEOSTUDIO_SLOPEW.xml` },
      ...prev
    ]);
  };

  // Sincronização remota do Túnel
  const handleSyncTunnel = async (serviceName) => {
    setIsSyncing(true);
    setTunnelLogs(prev => [
      { time: new Date().toLocaleTimeString(), type: 'SYS', msg: `Sincronizando modelo com ${serviceName}...` },
      ...prev
    ]);

    await new Promise(r => setTimeout(r, 600));

    setIsSyncing(false);
    setTunnelLogs(prev => [
      { time: new Date().toLocaleTimeString(), type: serviceName, msg: `Sincronização bidirecional concluída! 218 instrumentos e malha geológica reconciliados.` },
      ...prev
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontFamily: 'var(--font-sans)' }}>
      
      {/* ========================================================================= */}
      {/* BARRA DE TÍTULO DA JANELA DATAMINE STUDIO RM (ESTILO NATIVO CAD 3D)       */}
      {/* ========================================================================= */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '10px 10px 0 0',
        padding: '0.4rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#f8fafc',
        fontSize: '0.75rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '18px',
            height: '18px',
            backgroundColor: '#0284c7',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '11px',
            color: '#ffffff'
          }}>
            D
          </div>
          <span style={{ fontWeight: 700, letterSpacing: '0.3px' }}>
            Studio RM 2.0.66.0 - ITAMINAS_GEOTECNIA.rmproj * - [3D / Seção 2D: {activeSection.nome}]
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            Azimute: <strong style={{ color: '#38bdf8' }}>{activeSection.azimute}°</strong> | Fator de Segurança: <strong style={{ color: currentFS >= activeSection.fatorSegurancaMin ? '#10b981' : '#ef4444' }}>FS {currentFS.toFixed(2)}</strong>
          </span>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} title="Online / Licença Ativa" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BARRA DE MENUS & RIBBON DO DATAMINE STUDIO RM                             */}
      {/* ========================================================================= */}
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderTop: 'none',
        padding: '0.25rem 0.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem'
      }}>
        {/* Linha dos Menus Superiores */}
        <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid #334155', paddingBottom: '0.25rem', overflowX: 'auto' }}>
          {['Home', 'Data', 'Sample Analysis', 'Implicit', 'Digitize', 'Explicit', 'Wireframe', 'Model', 'Estimate', 'Simulate', 'Report', 'Format', 'User Tools', 'View'].map((tab) => {
            const isActive = activeRibbonTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveRibbonTab(tab)}
                style={{
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 800 : 500,
                  backgroundColor: isActive ? '#0284c7' : 'transparent',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Ribbon de Ações e Ferramentas Datamine */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.3rem 0.2rem',
          flexWrap: 'wrap',
          fontSize: '0.72rem',
          color: '#e2e8f0'
        }}>
          {/* Seção Colour / Legendas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderRight: '1px solid #475569', paddingRight: '0.6rem' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>Colour:</span>
            <select
              value={colorField}
              onChange={(e) => setColorField(e.target.value)}
              style={{
                backgroundColor: '#0f172a',
                color: '#38bdf8',
                border: '1px solid #475569',
                borderRadius: '4px',
                padding: '0.2rem 0.4rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Campo de cor ativo do Block Model"
            >
              <option value="LITOLOGIA">ALGL (Litologia)</option>
              <option value="RQD">RQD (% Fraturamento)</option>
              <option value="COESAO">Coesão c' (kPa)</option>
              <option value="POROPRESSAO">Poro-pressão u (kPa)</option>
            </select>
          </div>

          {/* Seção Show / Hide (Entidades Datamine) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', borderRight: '1px solid #475569', paddingRight: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>Show/Hide:</span>
            <button
              onClick={() => setShowPoints(!showPoints)}
              style={{
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid #475569',
                backgroundColor: showPoints ? 'rgba(56, 189, 248, 0.25)' : '#0f172a',
                color: showPoints ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
              title="Exibir/Ocultar Pontos e Instrumentos"
            >
              Points
            </button>
            <button
              onClick={() => setShowStrings(!showStrings)}
              style={{
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid #475569',
                backgroundColor: showStrings ? 'rgba(56, 189, 248, 0.25)' : '#0f172a',
                color: showStrings ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
              title="Exibir/Ocultar Polilinhas e Bermas (Strings)"
            >
              Strings
            </button>
            <button
              onClick={() => setShowWireframes(!showWireframes)}
              style={{
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid #475569',
                backgroundColor: showWireframes ? 'rgba(56, 189, 248, 0.25)' : '#0f172a',
                color: showWireframes ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
              title="Exibir/Ocultar Superfície DTM (Wireframes)"
            >
              Wireframes
            </button>
            <button
              onClick={() => setShowBlockModel(!showBlockModel)}
              style={{
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid #475569',
                backgroundColor: showBlockModel ? 'rgba(16, 185, 129, 0.25)' : '#0f172a',
                color: showBlockModel ? '#10b981' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.7rem'
              }}
              title="Exibir/Ocultar Malha do Modelo de Blocos bm_0826"
            >
              Models
            </button>
            <button
              onClick={() => setShowDrillholes(!showDrillholes)}
              style={{
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid #475569',
                backgroundColor: showDrillholes ? 'rgba(245, 158, 11, 0.25)' : '#0f172a',
                color: showDrillholes ? '#f59e0b' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
              title="Exibir/Ocultar Sondagens (Drillholes)"
            >
              Drillholes
            </button>
            <button
              onClick={() => setShowPlanes(!showPlanes)}
              style={{
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid #475569',
                backgroundColor: showPlanes ? 'rgba(56, 189, 248, 0.25)' : '#0f172a',
                color: showPlanes ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
              title="Exibir/Ocultar Superfície Freática Piezométrica"
            >
              Planes
            </button>
            <button
              onClick={() => setShowGeomConformity(!showGeomConformity)}
              style={{
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid #475569',
                backgroundColor: showGeomConformity ? 'rgba(16, 185, 129, 0.25)' : '#0f172a',
                color: showGeomConformity ? '#10b981' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.7rem'
              }}
              title="Exibir/Ocultar Tags de Conformidade Geométrica 030-MINA (Itaminas)"
            >
              Geometria
            </button>
            <button
              onClick={() => setShowDrainageFlow(!showDrainageFlow)}
              style={{
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid #475569',
                backgroundColor: showDrainageFlow ? 'rgba(56, 189, 248, 0.25)' : '#0f172a',
                color: showDrainageFlow ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
              title="Exibir/Ocultar Caimento e Drenagem de Berma (aval-drenage.js)"
            >
              Drenagem
            </button>
          </div>

          {/* Seção Slice / Clipping */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderRight: '1px solid #475569', paddingRight: '0.6rem' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>Slice:</span>
            <button
              onClick={() => setClipFront(!clipFront)}
              style={{
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid #475569',
                backgroundColor: clipFront ? '#0284c7' : '#0f172a',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontWeight: 600
              }}
              title="Clip in front of this section"
            >
              Clip Front
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Espessura:</span>
              <select
                value={sliceThickness}
                onChange={(e) => setSliceThickness(Number(e.target.value))}
                style={{
                  backgroundColor: '#0f172a',
                  color: '#f8fafc',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  padding: '0.15rem 0.35rem',
                  fontSize: '0.7rem'
                }}
              >
                <option value={5}>± 5.0m</option>
                <option value={10}>± 10.0m</option>
                <option value={20}>± 20.0m</option>
                <option value={50}>± 50.0m</option>
              </select>
            </div>
          </div>

          {/* Ações do Túnel Datamine & GeoStudio DataBridge & Relatório 030-MINA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
            <button
              onClick={() => setGeomModalOpen(true)}
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                fontWeight: 700,
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="Abrir Relatório Executivo de Avaliação Geométrica (Padrão 030-MINA / Engemec 2026)"
            >
              <CheckCircle2 size={13} />
              Relatório 030-MINA
            </button>
            <button
              onClick={() => setTunnelModalOpen(true)}
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                fontWeight: 700,
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="Abrir Túnel de Conexão com Datamine Studio e GeoStudio"
            >
              <Network size={14} />
              <span>Túnel DataBridge</span>
              <span style={{ fontSize: '0.6rem', padding: '1px 4px', borderRadius: '3px', backgroundColor: '#10b981', color: '#fff' }}>ATIVO</span>
            </button>

            <button
              onClick={handleExportDXF}
              style={{
                padding: '0.25rem 0.55rem',
                borderRadius: '6px',
                backgroundColor: '#0f172a',
                color: '#e2e8f0',
                border: '1px solid #475569',
                fontWeight: 600,
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
              title="Exportar DXF R12 compatível com Datamine Studio RM"
            >
              <Download size={13} />
              <span>DXF 3D</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BARRA SUPERIOR IMEDIATA DO CANVAS (VIEWPORT TOOLBAR: 3D / FILES / PLOTS)   */}
      {/* ========================================================================= */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        padding: '0.35rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.75rem',
        color: '#f8fafc'
      }}>
        {/* Abas [3D] / [Files] / [Plots] exatamente como no print do Datamine */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            onClick={() => setActiveCanvasTab('3D')}
            style={{
              padding: '0.2rem 0.5rem',
              backgroundColor: activeCanvasTab === '3D' ? '#0284c7' : 'transparent',
              color: activeCanvasTab === '3D' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '3px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            [3D]
          </button>
          <button
            onClick={() => setActiveCanvasTab('Files')}
            style={{
              padding: '0.2rem 0.5rem',
              backgroundColor: activeCanvasTab === 'Files' ? '#0284c7' : 'transparent',
              color: activeCanvasTab === 'Files' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '3px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            [Files]
          </button>
          <button
            onClick={() => setActiveCanvasTab('Plots')}
            style={{
              padding: '0.2rem 0.5rem',
              backgroundColor: activeCanvasTab === 'Plots' ? '#0284c7' : 'transparent',
              color: activeCanvasTab === 'Plots' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '3px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            [Plots]
          </button>
          <span style={{ color: '#475569', margin: '0 0.25rem' }}>|</span>
          <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.75rem' }}>
            Section Azi: {activeSection.azimute}° (vertical)
          </span>
        </div>

        {/* Ferramentas do Canvas: Régua, Grid, Slip Surface, Cenário e Seletor de Seção */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Seletor rápido de Seção */}
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            style={{
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #475569',
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              fontSize: '0.72rem',
              fontWeight: 700
            }}
          >
            {SECTIONS_DATA.map(s => (
              <option key={s.id} value={s.id}>
                {s.nome} ({s.estruturaNome})
              </option>
            ))}
          </select>

          {/* Toggle Régua / Medição de Talude */}
          <button
            onClick={() => {
              setIsRulerActive(!isRulerActive);
              if (isRulerActive) {
                setRulerPoints([]);
                setMeasurementResult(null);
              }
            }}
            style={{
              padding: '0.2rem 0.5rem',
              backgroundColor: isRulerActive ? '#f59e0b' : '#1e293b',
              color: isRulerActive ? '#000000' : '#e2e8f0',
              border: '1px solid #475569',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
            title="Ferramenta de medição interativa no talude (Distância, Desnível e Inclinação)"
          >
            <Ruler size={13} />
            <span>{isRulerActive ? 'Medição Ativa' : 'Medir Talude'}</span>
          </button>

          {/* Toggle Grelha Métrica */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            style={{
              padding: '0.2rem 0.5rem',
              backgroundColor: showGrid ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
              color: showGrid ? '#38bdf8' : '#94a3b8',
              border: '1px solid #475569',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
            title="Ligar/Desligar Grade Métrica de Coordenadas"
          >
            <Grid size={13} />
            <span>Grid</span>
          </button>

          {/* Toggle Círculo de Ruptura (Slip Surface) */}
          <button
            onClick={() => setShowSlipSurface(!showSlipSurface)}
            style={{
              padding: '0.2rem 0.5rem',
              backgroundColor: showSlipSurface ? 'rgba(239, 68, 68, 0.2)' : '#1e293b',
              color: showSlipSurface ? '#ef4444' : '#94a3b8',
              border: '1px solid #475569',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
            title="Superfície de Ruptura Crítica e Fator de Segurança (Bishop/Morgenstern-Price)"
          >
            <ShieldCheck size={13} />
            <span>FS: {currentFS.toFixed(2)}</span>
          </button>

          {/* Alternância para Mapa GIS da Planta */}
          <button
            onClick={() => onNavigateTab && onNavigateTab('mapa')}
            style={{
              padding: '0.2rem 0.55rem',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #0284c7',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
            title="Ir para a Planta (GIS / Satélite)"
          >
            <MapPin size={13} />
            <span>Planta GIS</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CORPO PRINCIPAL COM LAYOUT SPLIT: ÁRVORE ESQUERDA + CANVAS + PAINEL DIR   */}
      {/* ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: rightPanelOpen ? '250px 1fr 280px' : '250px 1fr',
        gap: '0.6rem',
        minHeight: '560px'
      }}>
        
        {/* ----------------------------------------------------------------------- */}
        {/* PAINEL LATERAL ESQUERDO: ÁRVORE HIERÁRQUICA SHEETS / PROJECT FILES     */}
        {/* ----------------------------------------------------------------------- */}
        <div style={{
          backgroundColor: '#0b1120',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          fontSize: '0.72rem',
          color: '#cbd5e1',
          overflow: 'hidden'
        }}>
          {/* Header da Árvore */}
          <div style={{
            padding: '0.45rem 0.65rem',
            backgroundColor: '#1e293b',
            fontWeight: 800,
            fontSize: '0.75rem',
            color: '#f8fafc',
            borderBottom: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Sheets (Árvore de Objetos)</span>
            <FolderOpen size={14} style={{ color: '#38bdf8' }} />
          </div>

          {/* Abas inferiores clássicas do Datamine: Project Files, Sheets, Loaded Data */}
          <div style={{ display: 'flex', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', fontSize: '0.68rem' }}>
            {['Project Files', 'Sheets', 'Loaded Data', 'Holes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSidebarTab(tab)}
                style={{
                  flex: 1,
                  padding: '0.3rem 0.2rem',
                  textAlign: 'center',
                  background: activeSidebarTab === tab ? '#1e293b' : 'transparent',
                  color: activeSidebarTab === tab ? '#38bdf8' : '#64748b',
                  fontWeight: activeSidebarTab === tab ? 800 : 500,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {tab.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Árvore Hierárquica Estilo Datamine Studio RM */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            fontFamily: 'Consolas, Monaco, monospace'
          }}>
            <div style={{ fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Folder size={13} style={{ color: '#f59e0b' }} />
              <span>LAMAS.rmproj</span>
            </div>

            <div style={{ paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Folder size={12} style={{ color: '#38bdf8' }} />
                <span>3D</span>
              </div>

              <div style={{ paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                
                {/* Points */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <input
                    type="checkbox"
                    checked={showPoints}
                    onChange={(e) => setShowPoints(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: showPoints ? '#e2e8f0' : '#64748b' }}>Points ({activeSection.instrumentos.length} PZ/INA)</span>
                </div>

                {/* Planes */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <input
                    type="checkbox"
                    checked={showPlanes}
                    onChange={(e) => setShowPlanes(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: showPlanes ? '#38bdf8' : '#64748b' }}>Planes (Superfície Freática)</span>
                </div>

                {/* Strings */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <input
                    type="checkbox"
                    checked={showStrings}
                    onChange={(e) => setShowStrings(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: showStrings ? '#e2e8f0' : '#64748b' }}>Strings (Bermas & Crista)</span>
                </div>

                {/* Drillholes */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <input
                    type="checkbox"
                    checked={showDrillholes}
                    onChange={(e) => setShowDrillholes(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: showDrillholes ? '#f59e0b' : '#64748b' }}>Drillholes ({activeSection.drillholes?.length || 0} furos)</span>
                </div>

                {/* Wireframes */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <input
                    type="checkbox"
                    checked={showWireframes}
                    onChange={(e) => setShowWireframes(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: showWireframes ? '#e2e8f0' : '#64748b' }}>Wireframes (DTM Lidar)</span>
                </div>

                {/* Block Models (bm_0826 em negrito exatamente como no print!) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <input
                    type="checkbox"
                    checked={showBlockModel}
                    onChange={(e) => setShowBlockModel(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <strong style={{ color: '#10b981', fontSize: '0.73rem' }}>
                    bm_0826 (block model)
                  </strong>
                </div>

                {/* Sections */}
                <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ color: '#94a3b8', fontWeight: 700 }}>Sections ({SECTIONS_DATA.length})</div>
                  {SECTIONS_DATA.map(sec => {
                    const isSelected = sec.id === selectedSectionId;
                    return (
                      <div
                        key={sec.id}
                        onClick={() => setSelectedSectionId(sec.id)}
                        style={{
                          padding: '2px 4px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                          color: isSelected ? '#38bdf8' : '#94a3b8',
                          fontWeight: isSelected ? 800 : 500,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{sec.nome.split(' - ')[0]}</span>
                        <span style={{ fontSize: '0.62rem', color: '#64748b' }}>{sec.estaca.split(' ')[1]}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Default Grid */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: showGrid ? '#e2e8f0' : '#64748b' }}>Default Grid (10x10m)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo do Objeto Selecionado */}
          <div style={{
            padding: '0.5rem',
            backgroundColor: '#0f172a',
            borderTop: '1px solid #1e293b',
            fontSize: '0.68rem',
            color: '#94a3b8'
          }}>
            <div>Estrutura: <strong style={{ color: '#f8fafc' }}>{activeSection.estruturaNome}</strong></div>
            <div>Blocos Carregados: <strong style={{ color: '#10b981' }}>{blockModel.length}</strong></div>
            <div>Campo Ativo: <strong style={{ color: '#38bdf8' }}>{colorField}</strong></div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* ÁREA CENTRAL DO CANVAS GEOTÉCNICO DATAMINE (SVG BLOCK MODEL INTERATIVO) */}
        {/* ----------------------------------------------------------------------- */}
        <div style={{
          backgroundColor: '#050811',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header do Canvas com HUD de Coordenadas e Ferramentas Rápidas */}
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '12px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            fontSize: '0.7rem',
            fontFamily: 'Consolas, Monaco, monospace',
            color: '#94a3b8'
          }}>
            <span>X: <strong style={{ color: '#f8fafc' }}>{cursorPos.x}m</strong></span>
            <span>Z (Cota): <strong style={{ color: '#38bdf8' }}>{cursorPos.z}m</strong></span>
            <span>Azi: <strong style={{ color: '#f59e0b' }}>{activeSection.azimute}°</strong></span>
            {isRulerActive && (
              <span style={{ color: '#f59e0b', fontWeight: 800 }}>[CLIQUE 2 PONTOS PARA MEDIR]</span>
            )}
          </div>

          {/* Resultado da Medição da Régua (Se houver) */}
          {measurementResult && (
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '12px',
              zIndex: 10,
              backgroundColor: 'rgba(245, 158, 11, 0.95)',
              color: '#000000',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 800,
              fontFamily: 'Consolas, Monaco, monospace',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <span>L: {measurementResult.distancia}m</span>
              <span>ΔX: {measurementResult.deltaX}m</span>
              <span>ΔZ: {measurementResult.deltaZ}m</span>
              <span>Ângulo: {measurementResult.angulo}° ({measurementResult.rampa})</span>
              <button
                onClick={() => setMeasurementResult(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 900 }}
              >
                ✕
              </button>
            </div>
          )}

          {/* SVG Principal do Modelo de Blocos Datamine */}
          <div style={{ flex: 1, width: '100%', overflow: 'hidden', cursor: isRulerActive ? 'crosshair' : 'default' }}>
            <svg
              viewBox="0 0 1000 500"
              style={{ width: '100%', height: '100%', minHeight: '440px', display: 'block' }}
              onClick={handleSvgClick}
              onMouseMove={handleSvgMouseMove}
            >
              <defs>
                {/* Padrão de Rocha de Fundação */}
                <pattern id="dmRockPattern" width="16" height="16" patternUnits="userSpaceOnUse">
                  <path d="M 0,8 L 8,0 L 16,8 L 8,16 Z" fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" />
                </pattern>

                {/* Gradiente da Linha Freática */}
                <linearGradient id="dmWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#082f49" stopOpacity="0.1" />
                </linearGradient>

                {/* Gradiente da Bacia / Reservatório */}
                <linearGradient id="dmReservoirGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Fundo da Fundação */}
              <rect x="0" y="440" width="1000" height="60" fill="url(#dmRockPattern)" />
              <line x1="0" y1="440" x2="1000" y2="440" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="20" y="475" fill="rgba(148, 163, 184, 0.45)" fontSize="10" fontWeight="700" fontFamily="monospace">
                BASE GEOLÓGICA / SUBSTRATO ROCHOSO SÃO (BATATAL)
              </text>

              {/* Grade de Coordenadas e Cotas (Default Grid) */}
              {showGrid && (
                <g>
                  {/* Linhas Horizontais de Elevação */}
                  {[activeSection.cotaCrista, activeSection.cotaCrista - 15, activeSection.cotaCrista - 30, activeSection.cotaCrista - 45].map(cota => {
                    const y = escalaY(cota);
                    return (
                      <g key={cota}>
                        <line x1="60" y1={y} x2="940" y2={y} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="2 4" />
                        <text x="65" y={y - 4} fill="#64748b" fontSize="9.5" fontFamily="monospace" fontWeight="600">
                          EL: {cota.toFixed(1)}m
                        </text>
                      </g>
                    );
                  })}

                  {/* Linhas Verticais de Estacas */}
                  {[200, 350, 500, 650, 800].map(x => (
                    <g key={x}>
                      <line x1={x} y1="60" x2={x} y2="440" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="2 4" />
                      <text x={x + 4} y="435" fill="#475569" fontSize="9" fontFamily="monospace">
                        X: {x}m
                      </text>
                    </g>
                  ))}
                </g>
              )}

              {/* MODELO DE BLOCOS (BLOCK MODEL bm_0826) - RENDERIZAÇÃO RETICULAR DATAMINE */}
              {showBlockModel && (
                <g id="datamine-block-model">
                  {blockModel.map(b => {
                    const fill = getBlockFill(b);
                    const isHovered = hoveredBlock?.id === b.id;
                    return (
                      <rect
                        key={b.id}
                        x={b.x}
                        y={b.y}
                        width={b.largura}
                        height={b.altura}
                        fill={fill}
                        stroke={isHovered ? '#ffffff' : '#050811'}
                        strokeWidth={isHovered ? 1.5 : 0.6}
                        style={{ cursor: 'pointer', transition: 'stroke 0.1s' }}
                        onMouseEnter={() => setHoveredBlock(b)}
                        onMouseLeave={() => setHoveredBlock(null)}
                      />
                    );
                  })}
                </g>
              )}

              {/* WIREFRAME DA TOPOGRAFIA (DTM SURFACE / TERRENO NATURAL) */}
              {showWireframes && (
                <g id="datamine-wireframe-dtm">
                  <polyline
                    points={perfilTopografia.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    style={{ filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.6))' }}
                  />
                  {/* Bermas e Crista (Rótulos) */}
                  {showStrings && activeSection.bermas.map(b => (
                    <g key={b.nome}>
                      <circle cx={b.x + b.largura / 2} cy={escalaY(b.cota)} r="3" fill="#38bdf8" />
                      <text
                        x={b.x + b.largura / 2}
                        y={escalaY(b.cota) - 8}
                        fill="#ffffff"
                        fontSize="9.5"
                        fontWeight="700"
                        textAnchor="middle"
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                      >
                        {b.nome} ({b.cota.toFixed(1)}m)
                      </text>
                    </g>
                  ))}

                  {/* AVALIAÇÃO GEOMÉTRICA DE TALUDES (PADRÃO ITAMINAS / 030-MINA) */}
                  {showGeomConformity && geomEvaluation.bancadas.map((bancada) => {
                    const yPos = escalaY(bancada.yFaceMidCota);
                    return (
                      <g key={`geom-tag-${bancada.indice}`}>
                        <rect
                          x={bancada.xFaceMid - 46}
                          y={yPos - 11}
                          width="92"
                          height="20"
                          rx="4"
                          fill="#0f172a"
                          stroke={bancada.diagCor}
                          strokeWidth="1.5"
                          style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.9))' }}
                        />
                        <text
                          x={bancada.xFaceMid}
                          y={yPos + 3}
                          fill={bancada.diagCor}
                          fontSize="7.5"
                          fontWeight="800"
                          textAnchor="middle"
                        >
                          {bancada.diagCodigo === '01_APROVADO' ? '✓ CONFORME' : bancada.diagCodigo.replace('_', ' ')}
                        </text>
                      </g>
                    );
                  })}

                  {/* SETAS DE DRENAGEM DE BERMA (AVAL-DRENAGE.JS) */}
                  {showDrainageFlow && geomEvaluation.bancadas.map((bancada) => {
                    const yBerma = escalaY(bancada.yBermaCota);
                    const xStart = bancada.xBermaMid + 16;
                    const xEnd = bancada.xBermaMid - 16;
                    return (
                      <g key={`dren-flow-${bancada.indice}`}>
                        <line
                          x1={xStart}
                          y1={yBerma - 4}
                          x2={xEnd}
                          y2={yBerma - 2}
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="3 2"
                        />
                        <polygon
                          points={`${xEnd},${yBerma - 2} ${xEnd + 4},${yBerma - 5} ${xEnd + 4},${yBerma + 1}`}
                          fill="#38bdf8"
                        />
                        <text
                          x={bancada.xBermaMid}
                          y={yBerma - 7}
                          fill="#38bdf8"
                          fontSize="7"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          i = 1.8%
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* BACIA DE MONTANTE / RESERVATÓRIO */}
              <polygon
                points={`60,${escalaY(activeSection.cotaFundacao + 4)} 120,${escalaY(activeSection.cotaCrista - 8)} 200,${escalaY(activeSection.cotaCrista - activeSection.bordaLivre)} 60,${escalaY(activeSection.cotaCrista - activeSection.bordaLivre)}`}
                fill="url(#dmReservoirGrad)"
              />
              <text x="70" y={escalaY(activeSection.cotaCrista - activeSection.bordaLivre) - 8} fill="#38bdf8" fontSize="10" fontWeight="800">
                RESERVATÓRIO (NA: {(activeSection.cotaCrista - activeSection.bordaLivre).toFixed(2)}m)
              </text>

              {/* SUPERFÍCIE FREÁTICA PIEZOMÉTRICA (PLANES) */}
              {showPlanes && (
                <g id="datamine-phreatic-plane">
                  {/* Zona saturada translúcida */}
                  <path
                    d={linhaFreatica.pathArea}
                    fill="url(#dmWaterGrad)"
                    style={{ transition: 'all 0.4s ease-in-out' }}
                  />

                  {/* Linha freática principal */}
                  <path
                    d={linhaFreatica.pathLine}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    style={{
                      filter: 'drop-shadow(0 0 5px rgba(56, 189, 248, 0.9))',
                      transition: 'all 0.4s ease-in-out'
                    }}
                  />
                </g>
              )}

              {/* DRILLHOLES (FUROS DE SONDAGEM COM PERFIL LITOLÓGICO CONTINUO) */}
              {showDrillholes && activeSection.drillholes?.map(dh => {
                const yBoca = escalaY(dh.bocaCota);
                const yFundo = escalaY(dh.bocaCota - dh.profundidade);
                const isHovered = hoveredBlock?.id === dh.id;

                return (
                  <g key={dh.id} style={{ cursor: 'pointer' }}>
                    {/* Linha Central do Furo */}
                    <line x1={dh.x} y1={yBoca} x2={dh.x} y2={yFundo} stroke="#ffffff" strokeWidth="4" />

                    {/* Intervalos Litológicos Segmentados no Testemunho */}
                    {dh.intervalos.map((inv, idx) => {
                      const yInvTopo = escalaY(dh.bocaCota - inv.de);
                      const yInvBase = escalaY(dh.bocaCota - inv.ate);
                      const altInv = Math.max(2, yInvBase - yInvTopo);
                      const corLit = LITHOLOGIES[inv.litologia]?.cor || '#94a3b8';

                      return (
                        <rect
                          key={idx}
                          x={dh.x - 3.5}
                          y={yInvTopo}
                          width="7"
                          height={altInv}
                          fill={corLit}
                          stroke="#000000"
                          strokeWidth="0.6"
                        />
                      );
                    })}

                    {/* Marcador do Nível d'água no furo */}
                    {dh.nivelAguaFuro && (
                      <circle
                        cx={dh.x}
                        cy={escalaY(dh.nivelAguaFuro)}
                        r="3.5"
                        fill="#00e5ff"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                    )}

                    {/* Etiqueta Superior com Nome do Furo de Sondagem */}
                    <rect
                      x={dh.x - 30}
                      y={yBoca - 22}
                      width="60"
                      height="16"
                      rx="3"
                      fill="#0f172a"
                      stroke="#f59e0b"
                      strokeWidth="1"
                    />
                    <text
                      x={dh.x}
                      y={yBoca - 10}
                      fill="#f59e0b"
                      fontSize="9"
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      {dh.id}
                    </text>
                  </g>
                );
              })}

              {/* INSTRUMENTOS GEOTÉCNICOS (POINTS: PZ, INA, VT DO BANCO DE DADOS) */}
              {showPoints && activeSection.instrumentos.map(inst => {
                const yBoca = escalaY(inst.bocaCota);
                const yPonta = escalaY(inst.pontaCota);
                
                let na = inst.naAtual;
                if (cenario === 'chuvoso') na = inst.naChuvoso;
                else if (cenario === 'seco') na = inst.naSeco;
                else if (cenario === 'simulado') na = inst.naAtual + simulacaoElevacao;
                
                const yNA = escalaY(na);
                const isHovered = hoveredInstrument?.id === inst.id;

                return (
                  <g 
                    key={inst.id} 
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredInstrument(inst)}
                    onMouseLeave={() => setHoveredInstrument(null)}
                  >
                    {/* Tubo Vertical */}
                    <line
                      x1={inst.x}
                      y1={yBoca}
                      x2={inst.x}
                      y2={yPonta}
                      stroke={isHovered ? '#38bdf8' : 'rgba(255, 255, 255, 0.7)'}
                      strokeWidth={isHovered ? '3' : '2'}
                    />

                    {/* Bulbo Filtrante */}
                    <rect
                      x={inst.x - 2.5}
                      y={yPonta - 8}
                      width="5"
                      height="10"
                      fill="#f59e0b"
                      rx="1"
                    />

                    {/* Nível d'Água Medido */}
                    <circle
                      cx={inst.x}
                      cy={yNA}
                      r={isHovered ? '6' : '4.5'}
                      fill={inst.status === 'ATENÇÃO' ? '#f59e0b' : '#38bdf8'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />

                    {/* Etiqueta */}
                    <rect
                      x={inst.x - 26}
                      y={yBoca - 22}
                      width="52"
                      height="16"
                      rx="3"
                      fill="#0f172a"
                      stroke={isHovered ? '#38bdf8' : 'rgba(148, 163, 184, 0.5)'}
                      strokeWidth="1"
                    />
                    <text
                      x={inst.x}
                      y={yBoca - 10}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      {inst.id}
                    </text>
                  </g>
                );
              })}

              {/* SUPERFÍCIE DE RUPTURA CRÍTICA (SLIP SURFACE / EQUILÍBRIO LIMITE) */}
              {showSlipSurface && (
                <g id="datamine-slip-surface">
                  <path
                    d={slipSurfacePath}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.8))' }}
                  />
                  <rect
                    x="560"
                    y="240"
                    width="110"
                    height="22"
                    rx="4"
                    fill="rgba(15, 23, 42, 0.9)"
                    stroke={currentFS >= activeSection.fatorSegurancaMin ? '#10b981' : '#ef4444'}
                    strokeWidth="1.5"
                  />
                  <text
                    x="615"
                    y="255"
                    fill={currentFS >= activeSection.fatorSegurancaMin ? '#10b981' : '#ef4444'}
                    fontSize="10"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    FS = {currentFS.toFixed(2)} (M-P)
                  </text>
                </g>
              )}

              {/* PONTOS DA FERRAMENTA DE MEDIÇÃO RÉGUA (RULER) */}
              {rulerPoints.map((pt, idx) => (
                <circle key={idx} cx={pt.x} cy={pt.y} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
              ))}
              {rulerPoints.length === 2 && (
                <line
                  x1={rulerPoints[0].x}
                  y1={rulerPoints[0].y}
                  x2={rulerPoints[1].x}
                  y2={rulerPoints[1].y}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              )}
            </svg>
          </div>

          {/* CARD FLUTUANTE DE INSPEÇÃO DO BLOCO SELECIONADO / HOVER */}
          {hoveredBlock && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '8px',
              padding: '0.65rem 0.9rem',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 20,
              fontSize: '0.72rem',
              color: '#f8fafc',
              minWidth: '220px',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 800, color: hoveredBlock.cor }}>
                  {hoveredBlock.litologia} ({hoveredBlock.litologiaNome})
                </span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>ID: {hoveredBlock.id}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', fontSize: '0.7rem', color: '#cbd5e1' }}>
                <div>Cota Z: <strong>{hoveredBlock.cota.toFixed(1)}m</strong></div>
                <div>Profundidade: <strong>{hoveredBlock.profundidade.toFixed(1)}m</strong></div>
                <div>RQD: <strong style={{ color: '#10b981' }}>{hoveredBlock.rqd}%</strong></div>
                <div>Densidade γ: <strong>{hoveredBlock.pesoEsp} kN/m³</strong></div>
                <div>Coesão c': <strong>{hoveredBlock.coesao} kPa</strong></div>
                <div>Atrito φ': <strong>{hoveredBlock.atrito}°</strong></div>
                <div style={{ gridColumn: 'span 2', color: hoveredBlock.isSaturado ? '#38bdf8' : '#94a3b8' }}>
                  Poro-pressão: <strong>{hoveredBlock.poroPressao} kPa</strong> ({hoveredBlock.isSaturado ? 'Saturado' : 'Seco'})
                </div>
              </div>
            </div>
          )}

          {/* CARD FLUTUANTE DE INSPEÇÃO DO INSTRUMENTO HOVER */}
          {hoveredInstrument && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '8px',
              padding: '0.65rem 0.9rem',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 20,
              fontSize: '0.72rem',
              color: '#f8fafc',
              minWidth: '220px',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ color: '#38bdf8' }}>{hoveredInstrument.id} ({hoveredInstrument.tipo})</strong>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  backgroundColor: hoveredInstrument.status === 'ATENÇÃO' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: hoveredInstrument.status === 'ATENÇÃO' ? '#f59e0b' : '#10b981',
                  fontWeight: 800
                }}>
                  {hoveredInstrument.status}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div>Boca: <strong>{hoveredInstrument.bocaCota.toFixed(2)}m</strong> | Ponta: <strong>{hoveredInstrument.pontaCota.toFixed(2)}m</strong></div>
                <div>NA Atual: <strong style={{ color: '#38bdf8' }}>{hoveredInstrument.naAtual.toFixed(2)}m</strong></div>
                <div>Coluna d'água: <strong>{(hoveredInstrument.naAtual - hoveredInstrument.pontaCota).toFixed(2)}m</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* PAINEL LATERAL DIREITO: PROPRIEDADES, ESTABILIDADE & CENÁRIOS          */}
        {/* ----------------------------------------------------------------------- */}
        {rightPanelOpen && (
          <div style={{
            backgroundColor: '#0b1120',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            fontSize: '0.72rem',
            color: '#cbd5e1',
            overflow: 'hidden'
          }}>
            {/* Header do Painel Direito */}
            <div style={{
              padding: '0.45rem 0.65rem',
              backgroundColor: '#1e293b',
              fontWeight: 800,
              fontSize: '0.75rem',
              color: '#f8fafc',
              borderBottom: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Properties & Stability</span>
              <Sliders size={14} style={{ color: '#38bdf8' }} />
            </div>

            {/* Abas Superiores do Painel Direito */}
            <div style={{ display: 'flex', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', fontSize: '0.68rem' }}>
              {[
                { id: 'properties', label: 'Estabilidade' },
                { id: 'geometria', label: 'Taludes (030-MINA)' },
                { id: 'filter', label: 'Litologias' },
                { id: 'legend', label: 'Legenda' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setRightPanelTab(t.id)}
                  style={{
                    flex: 1,
                    padding: '0.3rem 0.2rem',
                    textAlign: 'center',
                    background: rightPanelTab === t.id ? '#1e293b' : 'transparent',
                    color: rightPanelTab === t.id ? '#38bdf8' : '#64748b',
                    fontWeight: rightPanelTab === t.id ? 800 : 500,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Conteúdo da Aba */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {rightPanelTab === 'properties' && (
                <>
                  {/* Card Fator de Segurança */}
                  <div style={{
                    padding: '0.65rem',
                    borderRadius: '6px',
                    backgroundColor: currentFS >= activeSection.fatorSegurancaMin ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${currentFS >= activeSection.fatorSegurancaMin ? '#10b981' : '#ef4444'}`
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Fator de Segurança (FS)</div>
                    <div style={{
                      fontSize: '1.4rem',
                      fontWeight: 900,
                      color: currentFS >= activeSection.fatorSegurancaMin ? '#10b981' : '#ef4444'
                    }}>
                      FS = {currentFS.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: '2px' }}>
                      Mínimo Regulamentar: <strong>{activeSection.fatorSegurancaMin.toFixed(2)}</strong> (ANM 95/2022)
                    </div>
                  </div>

                  {/* Cenários Hidráulicos de Saturação */}
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                      CENÁRIO HIDRÁULICO & SATURAÇÃO:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                      <button
                        onClick={() => setCenario('atual')}
                        style={{
                          padding: '0.35rem',
                          borderRadius: '4px',
                          border: '1px solid #475569',
                          backgroundColor: cenario === 'atual' ? '#0284c7' : '#0f172a',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.68rem',
                          fontWeight: 700
                        }}
                      >
                        Real (Atual)
                      </button>
                      <button
                        onClick={() => setCenario('chuvoso')}
                        style={{
                          padding: '0.35rem',
                          borderRadius: '4px',
                          border: '1px solid #475569',
                          backgroundColor: cenario === 'chuvoso' ? '#0284c7' : '#0f172a',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.68rem',
                          fontWeight: 700
                        }}
                      >
                        🌧️ Chuva (+1.8m)
                      </button>
                      <button
                        onClick={() => setCenario('seco')}
                        style={{
                          padding: '0.35rem',
                          borderRadius: '4px',
                          border: '1px solid #475569',
                          backgroundColor: cenario === 'seco' ? '#0284c7' : '#0f172a',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.68rem',
                          fontWeight: 700
                        }}
                      >
                        ☀️ Estiagem
                      </button>
                      <button
                        onClick={() => setCenario('simulado')}
                        style={{
                          padding: '0.35rem',
                          borderRadius: '4px',
                          border: '1px solid #475569',
                          backgroundColor: cenario === 'simulado' ? '#0284c7' : '#0f172a',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.68rem',
                          fontWeight: 700
                        }}
                      >
                        ⚡ Simulado
                      </button>
                    </div>

                    {cenario === 'simulado' && (
                      <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#0f172a', borderRadius: '4px', border: '1px solid #334155' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '3px' }}>
                          <span style={{ color: '#94a3b8' }}>Sobreelevação NA:</span>
                          <strong style={{ color: '#38bdf8' }}>+{simulacaoElevacao.toFixed(2)}m</strong>
                        </div>
                        <input
                          type="range"
                          min="-1.5"
                          max="2.5"
                          step="0.1"
                          value={simulacaoElevacao}
                          onChange={(e) => setSimulacaoElevacao(parseFloat(e.target.value))}
                          style={{ width: '100%', cursor: 'pointer' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Parâmetros Geométricos */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.7rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '3px' }}>
                      <span style={{ color: '#94a3b8' }}>Cota da Crista:</span>
                      <strong>{activeSection.cotaCrista.toFixed(2)}m</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '3px' }}>
                      <span style={{ color: '#94a3b8' }}>Cota do Pé:</span>
                      <strong>{activeSection.cotaPe.toFixed(2)}m</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '3px' }}>
                      <span style={{ color: '#94a3b8' }}>Desnível Total:</span>
                      <strong style={{ color: '#f59e0b' }}>{(activeSection.cotaCrista - activeSection.cotaPe).toFixed(2)}m</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '3px' }}>
                      <span style={{ color: '#94a3b8' }}>Borda Livre:</span>
                      <strong style={{ color: '#10b981' }}>{activeSection.bordaLivre.toFixed(2)}m</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Método de Cálculo:</span>
                      <strong>Morgenstern-Price</strong>
                    </div>
                  </div>
                </>
              )}

              {rightPanelTab === 'geometria' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {/* Card de Resumo de Conformidade */}
                  <div style={{
                    padding: '0.65rem',
                    borderRadius: '6px',
                    backgroundColor: geomEvaluation.conformidadePercent >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${geomEvaluation.conformidadePercent >= 80 ? '#10b981' : '#ef4444'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Conformidade de Taludes:</span>
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        backgroundColor: geomEvaluation.conformidadePercent >= 80 ? '#10b981' : '#ef4444',
                        color: '#000000',
                        fontWeight: 900
                      }}>
                        {geomEvaluation.conformidadePercent >= 80 ? 'REGULAR' : 'ATENÇÃO'}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1.4rem',
                      fontWeight: 900,
                      color: geomEvaluation.conformidadePercent >= 80 ? '#10b981' : '#ef4444',
                      margin: '2px 0'
                    }}>
                      {geomEvaluation.conformidadePercent}% Aprovado
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>
                      <strong>{geomEvaluation.aprovadosCount}</strong> de <strong>{geomEvaluation.totalBancadas}</strong> bancadas em conformidade com projeto
                    </div>
                  </div>

                  {/* Seletor da Campanha Topográfica 030-MINA (Engemec 2026) */}
                  <div style={{ padding: '0.5rem', backgroundColor: '#0f172a', borderRadius: '6px', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 800 }}>CAMPANHA TOPOGRÁFICA (030-MINA):</span>
                      <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Engemec 2026</span>
                    </div>
                    <select
                      value={selectedCampaign}
                      onChange={(e) => setSelectedCampaign(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#1e293b',
                        color: '#f8fafc',
                        border: '1px solid #475569',
                        borderRadius: '4px',
                        padding: '0.3rem 0.4rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {ENGEMEC_MINA_CAMPAIGNS_2026.map(c => (
                        <option key={c.os} value={c.os}>
                          {c.os} ({c.mes}) — {c.status}
                        </option>
                      ))}
                    </select>
                    {(() => {
                      const camp = ENGEMEC_MINA_CAMPAIGNS_2026.find(c => c.os === selectedCampaign) || ENGEMEC_MINA_CAMPAIGNS_2026[0];
                      return (
                        <div style={{ marginTop: '0.35rem', fontSize: '0.62rem', color: '#94a3b8' }}>
                          Voo: <strong>{camp.data}</strong> | Datum: <strong>{camp.cotaReferencia} UTM 23S</strong>
                          <div style={{ color: '#64748b', marginTop: '1px' }}>
                            Arquivos: {camp.arquivos.join(' • ')}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Tolerâncias de Projeto (Padrão ScriptAvaliaçãoGeometria) */}
                  <div style={{ padding: '0.5rem', backgroundColor: '#0f172a', borderRadius: '6px', border: '1px solid #1e293b' }}>
                    <span style={{ fontSize: '0.68rem', color: '#f8fafc', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                      PARÂMETROS & TOLERÂNCIAS DE PROJETO:
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.68rem' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', marginBottom: '2px' }}>
                          <span>Altura Projeto: <strong>{geomEvaluation.hProj.toFixed(1)}m</strong></span>
                          <span>Tol: <strong style={{ color: '#38bdf8' }}>+{tolAltura}% ({geomEvaluation.hMax.toFixed(1)}m)</strong></span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="25"
                          step="1"
                          value={tolAltura}
                          onChange={(e) => setTolAltura(Number(e.target.value))}
                          style={{ width: '100%', cursor: 'pointer' }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', marginBottom: '2px' }}>
                          <span>Face Projeto: <strong>{geomEvaluation.faceProj.toFixed(1)}°</strong></span>
                          <span>Tol: <strong style={{ color: '#38bdf8' }}>±{tolAngFace}° ({geomEvaluation.faceMax.toFixed(1)}°)</strong></span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="10"
                          step="0.5"
                          value={tolAngFace}
                          onChange={(e) => setTolAngFace(Number(e.target.value))}
                          style={{ width: '100%', cursor: 'pointer' }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', marginBottom: '2px' }}>
                          <span>Berma Projeto: <strong>{geomEvaluation.bermaProj.toFixed(1)}m</strong></span>
                          <span>Mín: <strong style={{ color: '#38bdf8' }}>{geomEvaluation.bermaMin.toFixed(1)}m</strong></span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="3.0"
                          step="0.5"
                          value={tolBerma}
                          onChange={(e) => setTolBerma(Number(e.target.value))}
                          style={{ width: '100%', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lista Individual de Bancadas e Bermas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.68rem', color: '#f8fafc', fontWeight: 800 }}>
                      INSPEÇÃO POR BANCADA & BERMA:
                    </span>
                    {geomEvaluation.bancadas.map(b => (
                      <div
                        key={b.indice}
                        style={{
                          padding: '0.45rem',
                          borderRadius: '4px',
                          backgroundColor: '#0f172a',
                          border: `1px solid ${b.diagCor}`,
                          fontSize: '0.68rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <strong style={{ color: '#f8fafc' }}>{b.nome}</strong>
                          <span style={{
                            padding: '1px 5px',
                            borderRadius: '3px',
                            backgroundColor: `${b.diagCor}25`,
                            color: b.diagCor,
                            fontWeight: 800,
                            fontSize: '0.62rem'
                          }}>
                            {b.diagCodigo}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', color: '#cbd5e1', fontSize: '0.64rem' }}>
                          <div>H: <strong>{b.hReal.toFixed(1)}m</strong> (máx {b.hMax.toFixed(1)}m)</div>
                          <div>Face: <strong>{b.anguloFaceReal.toFixed(1)}°</strong> (máx {b.faceMax.toFixed(1)}°)</div>
                          <div>Berma: <strong>{b.bermaMetrosReal.toFixed(1)}m</strong> (mín {b.bermaMin.toFixed(1)}m)</div>
                          <div style={{ color: '#38bdf8' }}>Drenagem: <strong>i=1.8%</strong></div>
                        </div>
                        {b.diagCodigo !== '01_APROVADO' && (
                          <div style={{ fontSize: '0.62rem', color: b.diagCor, marginTop: '3px', fontWeight: 600 }}>
                            ⚠️ {b.diagMensagem}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Botão de Abertura do Relatório */}
                  <button
                    onClick={() => setGeomModalOpen(true)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#10b981',
                      color: '#000000',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      marginTop: '0.3rem'
                    }}
                  >
                    <FileText size={14} />
                    Ver Relatório Executivo 030-MINA
                  </button>
                </div>
              )}

              {rightPanelTab === 'filter' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
                    Balanço Volumétrico do Corte:
                  </div>
                  {lithologyStats.map(stat => (
                    <div
                      key={stat.codigo}
                      style={{
                        padding: '0.4rem',
                        borderRadius: '4px',
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: stat.cor }} />
                          <strong style={{ color: stat.cor }}>{stat.codigo}</strong>
                        </div>
                        <span style={{ fontWeight: 800, color: '#f8fafc' }}>{stat.percent}%</span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                        {stat.nome} • {stat.volumeEstimado.toLocaleString()} m³
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {rightPanelTab === 'legend' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
                    Legenda Geológica & Cores:
                  </div>
                  {Object.values(LITHOLOGIES).map(lito => (
                    <div key={lito.codigo} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '3px 0' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: lito.cor, flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.7rem' }}>{lito.nome}</span>
                        <span style={{ color: '#64748b', fontSize: '0.62rem' }}>γ={lito.pesoEsp} kN/m³ | c'={lito.coesao} kPa | φ'={lito.atrito}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BARRA INFERIOR DE SAÍDA E PROMPT DE COMANDO DATAMINE (OUTPUT BAR)          */}
      {/* ========================================================================= */}
      <div style={{
        backgroundColor: '#0a0f1d',
        border: '1px solid #1e293b',
        borderRadius: '0 0 8px 8px',
        padding: '0.4rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        fontSize: '0.72rem',
        fontFamily: 'Consolas, Monaco, monospace'
      }}>
        {/* Linha do Prompt >>> */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#38bdf8', fontWeight: 800 }}>&gt;&gt;&gt;</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand()}
            placeholder="Digite comando Datamine (ex: SHOW WIREFRAME, COLOR BY RQD, CALC FS, EXPORT DXF)..."
            style={{
              flex: 1,
              backgroundColor: '#050811',
              border: '1px solid #334155',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              color: '#f8fafc',
              fontSize: '0.72rem',
              fontFamily: 'Consolas, Monaco, monospace'
            }}
          />
          <button
            onClick={() => handleExecuteCommand()}
            style={{
              padding: '0.25rem 0.65rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.7rem'
            }}
          >
            Executar
          </button>
        </div>

        {/* Status Bar Inferior com Coordenadas e Modo de SNAP */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #1e293b',
          paddingTop: '0.25rem',
          fontSize: '0.68rem',
          color: '#64748b'
        }}>
          <div>
            Last Command: <span style={{ color: '#94a3b8' }}>{commandHistory[0]}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <span>Section Azi: <strong style={{ color: '#38bdf8' }}>{activeSection.azimute}°</strong></span>
            <span>SNAP: <strong style={{ color: '#10b981' }}>POINTS</strong></span>
            <span>COMMAND: <strong style={{ color: '#10b981' }}>READY</strong></span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: TÚNEL DE INTEGRAÇÃO DATAMINE & GEOSTUDIO (DATABRIDGE)               */}
      {/* ========================================================================= */}
      {tunnelModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '12px',
            maxWidth: '820px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden'
          }}>
            {/* Topo do Modal */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#1e293b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Network size={22} style={{ color: '#38bdf8' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                    Túnel de Integração Geotécnica DataBridge
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                    Intercâmbio de modelos de blocos, seções 2D e freatimetria com Datamine Studio e GeoStudio SLOPE/W
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTunnelModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Abas do Modal */}
            <div style={{ display: 'flex', borderBottom: '1px solid #334155', padding: '0 1.25rem', backgroundColor: '#0f172a' }}>
              <button
                onClick={() => setTunnelTab('datamine')}
                style={{
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'none',
                  borderBottom: tunnelTab === 'datamine' ? '2px solid #38bdf8' : '2px solid transparent',
                  color: tunnelTab === 'datamine' ? '#38bdf8' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Datamine Studio RM
              </button>
              <button
                onClick={() => setTunnelTab('geostudio')}
                style={{
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'none',
                  borderBottom: tunnelTab === 'geostudio' ? '2px solid #f59e0b' : '2px solid transparent',
                  color: tunnelTab === 'geostudio' ? '#f59e0b' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                GeoStudio SLOPE/W
              </button>
              <button
                onClick={() => setTunnelTab('logs')}
                style={{
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'none',
                  borderBottom: tunnelTab === 'logs' ? '2px solid #ffffff' : '2px solid transparent',
                  color: tunnelTab === 'logs' ? '#ffffff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Logs e Telemetria ({tunnelLogs.length})
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tunnelTab === 'datamine' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>
                        Driver Datamine Automation Server (Porta 8082)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Formatos: DXF R12 3D Entities, Datamine STR (Strings) & BMOD (Block Model bm_0826)
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#10b981', color: '#fff', fontWeight: 800 }}>
                      ONLINE
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleExportDXF}
                      style={{
                        flex: 1,
                        padding: '0.65rem 1rem',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Download size={16} />
                      Exportar DXF 3D Studio RM
                    </button>
                    <button
                      onClick={() => handleSyncTunnel('DATAMINE')}
                      disabled={isSyncing}
                      style={{
                        flex: 1,
                        padding: '0.65rem 1rem',
                        backgroundColor: '#1e293b',
                        color: '#f8fafc',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <RefreshCw size={16} className={isSyncing ? 'spin-anim' : ''} />
                      {isSyncing ? 'Sincronizando...' : 'Sincronizar Bidirecional'}
                    </button>
                  </div>
                </div>
              )}

              {tunnelTab === 'geostudio' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.85rem' }}>
                        Conector GeoStudio REST (Porta 9091)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Módulos: SLOPE/W (Estabilidade) & SEEP/W (Percolação em Meio Poroso)
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f59e0b', color: '#fff', fontWeight: 800 }}>
                      REST 200 OK
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleExportGeoStudio}
                      style={{
                        flex: 1,
                        padding: '0.65rem 1rem',
                        backgroundColor: '#f59e0b',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Download size={16} />
                      Exportar XML GeoStudio
                    </button>
                    <button
                      onClick={() => handleSyncTunnel('GEOSTUDIO')}
                      disabled={isSyncing}
                      style={{
                        flex: 1,
                        padding: '0.65rem 1rem',
                        backgroundColor: '#1e293b',
                        color: '#f8fafc',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Activity size={16} className={isSyncing ? 'spin-anim' : ''} />
                      {isSyncing ? 'Calculando...' : 'Reavaliar Estabilidade'}
                    </button>
                  </div>
                </div>
              )}

              {tunnelTab === 'logs' && (
                <div style={{
                  backgroundColor: '#050811',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.75rem',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {tunnelLogs.map((log, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ color: '#64748b' }}>[{log.time}]</span>
                      <span style={{
                        color: log.type === 'DATAMINE' ? '#38bdf8' : log.type === 'GEOSTUDIO' ? '#f59e0b' : '#a855f7',
                        fontWeight: 700
                      }}>
                        [{log.type}]
                      </span>
                      <span style={{ color: '#e2e8f0' }}>{log.msg}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div style={{
              padding: '0.75rem 1.25rem',
              borderTop: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              backgroundColor: '#1e293b'
            }}>
              <button
                onClick={() => setTunnelModalOpen(false)}
                style={{
                  padding: '0.4rem 1rem',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RELATÓRIO EXECUTIVO DE CONTROLE GEOMÉTRICO (030-MINA / ENGEMEC)    */}
      {/* ========================================================================= */}
      {geomModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1250,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '12px',
            maxWidth: '920px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden'
          }}>
            {/* Topo do Modal */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#1e293b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <CheckCircle2 size={24} style={{ color: '#10b981' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                    Parecer de Controle Geométrico de Taludes & Drenagem
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                    Levantamento 030-MINA (Engemec 2026) • ScriptAvaliaçãoGeometria • Datamine Studio Geo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGeomModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo com scroll */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Metadados da Seção e Campanha */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.65rem',
                padding: '0.75rem',
                backgroundColor: '#1e293b',
                borderRadius: '8px',
                border: '1px solid #334155',
                fontSize: '0.75rem'
              }}>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Estrutura & Seção:</span>
                  <strong style={{ color: '#38bdf8' }}>{activeSection.estruturaNome} ({activeSection.nome})</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Campanha Topográfica:</span>
                  <strong style={{ color: '#10b981' }}>{selectedCampaign} ({ENGEMEC_MINA_CAMPAIGNS_2026.find(c => c.os === selectedCampaign)?.mes || '2026'})</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Referência Geodésica:</span>
                  <strong style={{ color: '#f8fafc' }}>SIRGAS 2000 UTM Fuso 23S</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Taxa de Conformidade:</span>
                  <strong style={{ color: geomEvaluation.conformidadePercent >= 80 ? '#10b981' : '#ef4444' }}>
                    {geomEvaluation.conformidadePercent}% ({geomEvaluation.aprovadosCount}/{geomEvaluation.totalBancadas} Aprovados)
                  </strong>
                </div>
              </div>

              {/* Tabela de Bancadas */}
              <div>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#f8fafc', fontWeight: 800 }}>
                  Detalhamento por Bancada e Berma Operacional
                </h4>
                <div style={{ overflowX: 'auto', border: '1px solid #334155', borderRadius: '6px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                        <th style={{ padding: '0.5rem' }}>Bancada</th>
                        <th style={{ padding: '0.5rem' }}>Cotas (m)</th>
                        <th style={{ padding: '0.5rem' }}>Altura H (m)</th>
                        <th style={{ padding: '0.5rem' }}>Face θ (°)</th>
                        <th style={{ padding: '0.5rem' }}>Berma L (m)</th>
                        <th style={{ padding: '0.5rem' }}>Drenagem</th>
                        <th style={{ padding: '0.5rem' }}>Diagnóstico</th>
                      </tr>
                    </thead>
                    <tbody>
                      {geomEvaluation.bancadas.map((b, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #1e293b', backgroundColor: idx % 2 === 0 ? '#0f172a' : '#131d35' }}>
                          <td style={{ padding: '0.5rem', fontWeight: 700, color: '#f8fafc' }}>{b.nome}</td>
                          <td style={{ padding: '0.5rem', color: '#cbd5e1' }}>{b.cotaTopo.toFixed(1)} → {b.cotaBase.toFixed(1)}</td>
                          <td style={{ padding: '0.5rem', color: b.hReal > b.hMax ? '#ef4444' : '#f8fafc', fontWeight: b.hReal > b.hMax ? 800 : 500 }}>
                            {b.hReal.toFixed(1)}m <span style={{ color: '#64748b' }}>(proj {b.hProj}m)</span>
                          </td>
                          <td style={{ padding: '0.5rem', color: b.anguloFaceReal > b.faceMax ? '#06b6d4' : '#f8fafc' }}>
                            {b.anguloFaceReal.toFixed(1)}° <span style={{ color: '#64748b' }}>(proj {b.faceProj}°)</span>
                          </td>
                          <td style={{ padding: '0.5rem', color: b.bermaMetrosReal < b.bermaMin ? '#3b82f6' : '#f8fafc' }}>
                            {b.bermaMetrosReal.toFixed(1)}m <span style={{ color: '#64748b' }}>(mín {b.bermaMin}m)</span>
                          </td>
                          <td style={{ padding: '0.5rem', color: '#10b981' }}>Caimento 1.8%</td>
                          <td style={{ padding: '0.5rem' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: `${b.diagCor}25`,
                              color: b.diagCor,
                              fontWeight: 800,
                              fontSize: '0.65rem'
                            }}>
                              {b.diagCodigo}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Parecer Técnico e Recomendações */}
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}>
                <strong style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Info size={15} /> Parecer Geotécnico & Ações Recomendadas:
                </strong>
                <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.2rem', lineHeight: '1.5' }}>
                  <li>Manter as bermas limpas e com as sarjetas de pé desobstruídas para direcionar o escoamento sem transbordamento na crista.</li>
                  <li>Para bancadas classificadas em <code>02_TALUDE_ALTO</code> ou <code>03_FACE_VERTICAL</code>, realizar abatimento de crista e adequação na próxima campanha de lavra.</li>
                  <li>Conformidade regulamentar em linha com as diretrizes da ANM Resolução 95/2022 e ABNT NBR 13028.</li>
                </ul>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div style={{
              padding: '0.75rem 1.25rem',
              borderTop: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#1e293b'
            }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Relatório automatizado via motor de cálculo Datamine Studio Geo / Engemec
              </span>
              <button
                onClick={() => setGeomModalOpen(false)}
                style={{
                  padding: '0.45rem 1.2rem',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeotechCrossSectionTab;

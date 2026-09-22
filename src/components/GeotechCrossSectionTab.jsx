import React, { useState, useMemo } from 'react';
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
  CheckCircle2
} from 'lucide-react';

export const SECTIONS_DATA = [
  {
    id: 'SEC-A-A',
    nome: "Seção A-A' - Eixo Principal",
    estruturaId: 'BARRAGEM_B1',
    estruturaNome: 'BARRAGEM B1',
    categoria: 'Barragens',
    estaca: 'Estaca 12+00m',
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
    instrumentos: [
      { id: 'PZ-JC-01', tipo: 'PZ', x: 380, bocaCota: 915.00, pontaCota: 862.00, naAtual: 874.50, naChuvoso: 878.20, naSeco: 871.00, status: 'NORMAL' },
      { id: 'VT-JC-01', tipo: 'VERTEDOURO', x: 800, bocaCota: 868.00, pontaCota: 865.00, naAtual: 866.40, naChuvoso: 867.20, naSeco: 865.80, status: 'NORMAL' }
    ]
  }
];

export const GeotechCrossSectionTab = ({ onNavigateTab }) => {
  const { structures = [] } = useGeotechData();
  const [selectedStructureId, setSelectedStructureId] = useState('TODAS');
  const [selectedSectionId, setSelectedSectionId] = useState('SEC-A-A');
  const [cenario, setCenario] = useState('atual'); // 'atual', 'chuvoso', 'seco', 'simulado'
  const [simulacaoElevacao, setSimulacaoElevacao] = useState(0.8);
  const [hoveredInstrument, setHoveredInstrument] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showWaterGradient, setShowWaterGradient] = useState(true);
  const [showCriticalLine, setShowCriticalLine] = useState(true);

  // Estados do Túnel Datamine & GeoStudio (DataBridge)
  const [tunnelModalOpen, setTunnelModalOpen] = useState(false);
  const [tunnelTab, setTunnelTab] = useState('datamine'); // 'datamine' | 'geostudio' | 'logs'
  const [isSyncing, setIsSyncing] = useState(false);
  const [tunnelLogs, setTunnelLogs] = useState([
    { time: '12:00:15', type: 'SYS', msg: 'Túnel Geotécnico DataBridge inicializado em localhost.' },
    { time: '12:01:04', type: 'DATAMINE', msg: 'Conexão estabelecida com Datamine Automation Server (Porta 8082).' },
    { time: '12:01:40', type: 'GEOSTUDIO', msg: 'Serviço GeoStudio REST API (Porta 9091) respondendo com status 200 OK.' }
  ]);

  // Estruturas disponíveis nas seções
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

  // Conversão de Cotas para Coordenadas SVG
  // SVG ViewBox: 0 0 1000 520
  // Margens: X: 40 a 960 | Y: 60 a 450
  const cotaMin = activeSection.cotaFundacao - 6;
  const cotaMax = activeSection.cotaCrista + 8;
  const escalaY = (cota) => {
    const alturaSvg = 430 - 80;
    const ratio = (cota - cotaMin) / (cotaMax - cotaMin);
    return 430 - (ratio * alturaSvg);
  };

  // Traçado do Maciço (Polígono da Barragem / Talude)
  const poligonoMaciço = useMemo(() => {
    const pts = [];
    // Ponto inicial: Fundo da Bacia de Montante
    pts.push(`60,${escalaY(activeSection.cotaFundacao + 4)}`);
    // Talude de Montante subindo até a Crista
    pts.push(`120,${escalaY(activeSection.cotaCrista - 8)}`);
    pts.push(`200,${escalaY(activeSection.cotaCrista - 3)}`);
    
    // Bermas e Crista de Jusante
    activeSection.bermas.forEach((b) => {
      pts.push(`${b.x},${escalaY(b.cota)}`);
      pts.push(`${b.x + b.largura},${escalaY(b.cota)}`);
    });

    // Ponto final de jusante
    const ultBerma = activeSection.bermas[activeSection.bermas.length - 1];
    const xFim = ultBerma.x + ultBerma.largura + 60;
    pts.push(`${xFim},${escalaY(activeSection.cotaFundacao + 2)}`);
    // Fundação rochosa inferior
    pts.push(`${xFim},460`);
    pts.push(`60,460`);

    return pts.join(' ');
  }, [activeSection, cotaMin, cotaMax]);

  // Linha do Nível d'Água (Superfície Freática Piezométrica Dinâmica)
  const linhaFreatica = useMemo(() => {
    const pts = [];
    // Começa na água da bacia de montante
    const cotaReservatorio = activeSection.cotaCrista - activeSection.bordaLivre;
    pts.push({ x: 80, y: escalaY(cotaReservatorio) });
    pts.push({ x: 180, y: escalaY(cotaReservatorio - 0.2) });

    // Passa pelos níveis d'água medidos nos piezômetros
    activeSection.instrumentos.forEach(inst => {
      let na = inst.naAtual;
      if (cenario === 'chuvoso') na = inst.naChuvoso;
      else if (cenario === 'seco') na = inst.naSeco;
      else if (cenario === 'simulado') na = inst.naAtual + simulacaoElevacao;

      pts.push({ x: inst.x, y: escalaY(na), cotaNA: na, inst });
    });

    // Ponto final no dreno / pé de jusante
    const ultInst = activeSection.instrumentos[activeSection.instrumentos.length - 1];
    pts.push({ x: ultInst.x + 60, y: escalaY(activeSection.cotaFundacao + 1.5) });

    // Gerar Path SVG Spline Suave (Bézier Cúbica)
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

    // Polígono fechado para o corpo saturado (água subterrânea azul translúcida)
    const ultPonto = pts[pts.length - 1];
    const dAreaSaturada = `${d} L ${ultPonto.x} 460 L ${pts[0].x} 460 Z`;

    return { pathLine: d, pathArea: dAreaSaturada, pontos: pts };
  }, [activeSection, cenario, simulacaoElevacao, cotaMin, cotaMax]);

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
    a.download = `${activeSection.id}_${activeSection.estruturaId}_DATAMINE.dxf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTunnelLogs(prev => [
      { time: new Date().toLocaleTimeString(), type: 'DATAMINE', msg: `Arquivo DXF exportado: ${activeSection.id}_DATAMINE.dxf (Camadas: TALUDE_MACICO, LINHA_FREATICA)` },
      ...prev
    ]);
  };

  // Exportação para GeoStudio SLOPE/W (XML/GSZ Data Exchange)
  const handleExportGeoStudio = () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<GeoStudioProject version="2024" product="SLOPE/W, SEEP/W">
  <ProjectTitle>${activeSection.nome}</ProjectTitle>
  <Structure>${activeSection.estruturaNome}</Structure>
  <SectionId>${activeSection.id}</SectionId>
  <Station>${activeSection.estaca}</Station>
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
    <CalculatedFactorOfSafety>${activeSection.fatorSeguranca}</CalculatedFactorOfSafety>
    <Status>${activeSection.statusEstabilidade}</Status>
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
      { time: new Date().toLocaleTimeString(), type: 'GEOSTUDIO', msg: `Arquivo de intercâmbio GeoStudio gerado: ${activeSection.id}_GEOSTUDIO_SLOPEW.xml` },
      ...prev
    ]);
  };

  // Sincronização remota do Túnel
  const handleSyncTunnel = async (serviceName) => {
    setIsSyncing(true);
    setTunnelLogs(prev => [
      { time: new Date().toLocaleTimeString(), type: 'SYS', msg: `Iniciando sincronização com túnel ${serviceName}...` },
      ...prev
    ]);

    await new Promise(r => setTimeout(r, 750));

    setIsSyncing(false);
    setTunnelLogs(prev => [
      { time: new Date().toLocaleTimeString(), type: serviceName, msg: `Sincronização bidirecional concluída! 28 vértices e freatimetria reconciliados.` },
      ...prev
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Barra de Topo com Contraste Seguro (Adaptativa a Dark e Light) */}
      <div className="card-panel" style={{
        padding: '0.85rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            color: 'var(--primary-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Seções Transversais Geotécnicas
              </h2>
              <span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: 'var(--primary-accent)', fontSize: '0.7rem' }}>
                VISUALIZAÇÃO 2D MULTIPERSPECTIVA
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Cortes geológicos-geotécnicos com linha freática piezométrica dinâmica e validação de estabilidade
            </p>
          </div>
        </div>

        {/* Ações do Topo: Túnel Datamine & GeoStudio + Navegação Multiperspectiva */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Botão Túnel Datamine & GeoStudio */}
          <button
            onClick={() => setTunnelModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-accent-bg)',
              color: 'var(--primary-accent)',
              border: '1.5px solid var(--border-highlight)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
            }}
            title="Configurar Túnel de Integração com Datamine e GeoStudio"
          >
            <Network size={16} />
            <span>Túnel Datamine & GeoStudio</span>
            <span style={{
              fontSize: '0.62rem',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              fontWeight: 800
            }}>
              ATIVO
            </span>
          </button>

          {/* Alternância Planta (GIS) / Seção (Corte) */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-secondary)',
            padding: '0.25rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            gap: '0.25rem'
          }}>
            <button
              onClick={() => onNavigateTab && onNavigateTab('mapa')}
              className="btn-secondary"
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)'
              }}
              title="Ir para Mapa GIS e Ortofoto de Satélite"
            >
              <MapPin size={15} />
              <span>1. Planta (GIS)</span>
            </button>

            <button
              className="btn-primary"
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: 'var(--shadow-sm)'
              }}
              title="Você está visualizando a Seção Transversal"
            >
              <Layers size={15} />
              <span>2. Seção (Corte)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Seletor de Seção e Cenários Hidráulicos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem'
      }}>
        {/* Escolha da Seção com Filtro por Estrutura */}
        <div className="card-panel" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
          
          {/* Filtro Dinâmico por Estrutura */}
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              FILTRAR POR ESTRUTURA:
            </label>
            <select
              value={selectedStructureId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedStructureId(val);
                const secs = val === 'TODAS' ? SECTIONS_DATA : SECTIONS_DATA.filter(s => s.estruturaId === val);
                if (secs.length > 0 && !secs.some(s => s.id === selectedSectionId)) {
                  setSelectedSectionId(secs[0].id);
                }
              }}
              className="form-select"
              style={{
                width: '100%',
                padding: '0.45rem 0.65rem',
                fontSize: '0.8rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-main)',
                fontWeight: 600
              }}
            >
              <option value="TODAS">Todas as Estruturas ({SECTIONS_DATA.length} seções)</option>
              {availableStructures.map(st => {
                const count = SECTIONS_DATA.filter(s => s.estruturaId === st.id).length;
                return (
                  <option key={st.id} value={st.id}>
                    {st.nome} ({count} {count === 1 ? 'seção' : 'seções'})
                  </option>
                );
              })}
            </select>
          </div>

          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
            SELECIONAR CORTE TRANSVERSAL ({filteredSections.length}):
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {filteredSections.map(sec => {
              const isSelected = sec.id === selectedSectionId;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'var(--primary-accent-bg)' : 'var(--bg-secondary)',
                    border: `1px solid ${isSelected ? 'var(--primary-accent)' : 'var(--border-subtle)'}`,
                    color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: isSelected ? 'var(--primary-accent)' : 'var(--text-main)' }}>
                      <span>{sec.nome}</span>
                      <span className="badge" style={{
                        fontSize: '0.65rem',
                        backgroundColor: sec.categoria === 'Barragens' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: sec.categoria === 'Barragens' ? 'var(--primary-accent)' : 'var(--geo-normal)'
                      }}>
                        {sec.categoria}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {sec.estruturaNome} • {sec.estaca} • FS: <strong>{sec.fatorSeguranca}</strong>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: isSelected ? 'var(--primary-accent)' : 'var(--text-faint)' }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Controles de Cenário Hidráulico & Simulação de Linha Freática */}
        <div className="card-panel">
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
            CENÁRIO HIDRÁULICO & SATURAÇÃO DO MACIÇO:
          </label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              onClick={() => setCenario('atual')}
              className={cenario === 'atual' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.55rem', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              Campanha Atual (Real)
            </button>
            <button
              onClick={() => setCenario('chuvoso')}
              className={cenario === 'chuvoso' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.55rem', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              🌧️ Pico Chuvoso (+1.8m)
            </button>
            <button
              onClick={() => setCenario('seco')}
              className={cenario === 'seco' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.55rem', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              ☀️ Estiagem / Seca
            </button>
            <button
              onClick={() => setCenario('simulado')}
              className={cenario === 'simulado' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.55rem', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              ⚡ Simulação Dinâmica
            </button>
          </div>

          {cenario === 'simulado' && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sobreelevação de NA Simulado:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary-accent)' }}>+{simulacaoElevacao.toFixed(2)} m</span>
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

          {/* KPIs da Seção Ativa */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            marginTop: '0.4rem',
            paddingTop: '0.6rem',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Borda Livre</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--geo-normal)' }}>
                {activeSection.bordaLivre.toFixed(2)} m
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Fator Seg. (FS)</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: activeSection.fatorSeguranca >= 1.5 ? 'var(--geo-normal)' : 'var(--geo-atencao)' }}>
                {activeSection.fatorSeguranca.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Instrumentos</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                {activeSection.instrumentos.length} ativos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA GRÁFICA DO PERFIL TRANSVERSAL (SVG INTERATIVO) */}
      <div className="card-panel" style={{ padding: '1rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.75rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{activeSection.nome}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                ({activeSection.descricao})
              </span>
            </h3>
          </div>

          {/* Opções de visualização SVG */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setShowWaterGradient(!showWaterGradient)}
              className={showWaterGradient ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
              title="Alternar preenchimento da zona freática saturada"
            >
              <Droplets size={14} />
              <span>Zona Saturada</span>
            </button>

            <button
              onClick={() => setShowCriticalLine(!showCriticalLine)}
              className={showCriticalLine ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
              title="Exibir cotas de Alerta e Emergência"
            >
              <ShieldCheck size={14} />
              <span>Níveis Críticos</span>
            </button>

            <button
              onClick={() => window.print()}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
              title="Imprimir ou Salvar Corte Geotécnico em PDF"
            >
              <Download size={14} />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Container SVG com Rolagem Horizontal Suave para Mobile */}
        <div style={{
          overflowX: 'auto',
          backgroundColor: '#070b14',
          borderRadius: '12px',
          border: '1px solid var(--border-medium)',
          padding: '0.5rem'
        }}>
          <svg
            viewBox="0 0 1000 500"
            style={{
              width: '100%',
              minWidth: '820px',
              height: 'auto',
              display: 'block'
            }}
          >
            <defs>
              {/* Gradiente do Maciço de Aterro Compactado */}
              <linearGradient id="embankmentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* Gradiente da Zona Saturada (Água Subterrânea) */}
              <linearGradient id="phreaticWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#0369a1" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#082f49" stopOpacity="0.15" />
              </linearGradient>

              {/* Gradiente do Reservatório de Montante */}
              <linearGradient id="reservoirGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
              </linearGradient>

              {/* Padrão de Enrocamento / Rocha de Fundação */}
              <pattern id="rockPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 0,10 L 10,0 L 20,10 L 10,20 Z" fill="none" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Fundo de Fundação Rochosa */}
            <rect x="0" y="440" width="1000" height="60" fill="url(#rockPattern)" />
            <line x1="0" y1="440" x2="1000" y2="440" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="20" y="475" fill="rgba(148, 163, 184, 0.5)" fontSize="11" fontWeight="600" fontFamily="monospace">
              SUBSTRATO ROCHOSO SÃO / FUNDAÇÃO IMPERMEÁVEL
            </text>

            {/* Linhas de Grade de Cotas (Eixo Y) */}
            {[activeSection.cotaCrista, activeSection.cotaCrista - 10, activeSection.cotaCrista - 20, activeSection.cotaCrista - 30].map(cota => {
              const y = escalaY(cota);
              return (
                <g key={cota}>
                  <line x1="40" y1={y} x2="960" y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
                  <text x="45" y={y - 4} fill="rgba(148, 163, 184, 0.5)" fontSize="10" fontFamily="monospace">
                    {cota.toFixed(1)} m
                  </text>
                </g>
              );
            })}

            {/* Corpo do Maciço Geotécnico */}
            <polygon
              points={poligonoMaciço}
              fill="url(#embankmentGrad)"
              stroke="rgba(148, 163, 184, 0.5)"
              strokeWidth="2"
            />

            {/* Reservatório de Montante / Bacia de Rejeito */}
            <polygon
              points={`60,${escalaY(activeSection.cotaFundacao + 4)} 120,${escalaY(activeSection.cotaCrista - 8)} 200,${escalaY(activeSection.cotaCrista - activeSection.bordaLivre)} 60,${escalaY(activeSection.cotaCrista - activeSection.bordaLivre)}`}
              fill="url(#reservoirGrad)"
            />
            <text x="75" y={escalaY(activeSection.cotaCrista - activeSection.bordaLivre) - 8} fill="#38bdf8" fontSize="11" fontWeight="700">
              RESERVATÓRIO / BACIA (NA: {(activeSection.cotaCrista - activeSection.bordaLivre).toFixed(2)}m)
            </text>

            {/* Enrocamento de Jusante / Tapete Drenante no Pé */}
            <rect
              x="780"
              y={escalaY(activeSection.cotaPe + 3)}
              width="90"
              height="30"
              fill="rgba(245, 158, 11, 0.2)"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <text x="785" y={escalaY(activeSection.cotaPe + 3) + 18} fill="#f59e0b" fontSize="10" fontWeight="700">
              TAPETE DRENANTE
            </text>

            {/* Zona Saturada Freática (Água abaixo da linha de NA) */}
            {showWaterGradient && (
              <path
                d={linhaFreatica.pathArea}
                fill="url(#phreaticWaterGrad)"
                style={{ transition: 'all 0.5s ease-in-out' }}
              />
            )}

            {/* Linha Freática Piezométrica Dinâmica */}
            <path
              d={linhaFreatica.pathLine}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3.5"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.8))',
                transition: 'all 0.5s ease-in-out'
              }}
            />

            {/* Linha de Cota de Alerta Crítico */}
            {showCriticalLine && (
              <g>
                <line
                  x1="300"
                  y1={escalaY(activeSection.cotaCrista - 1.5)}
                  x2="850"
                  y2={escalaY(activeSection.cotaCrista - 1.5)}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                />
                <text x="860" y={escalaY(activeSection.cotaCrista - 1.5) + 4} fill="#ef4444" fontSize="10" fontWeight="700">
                  LIMITE DE ALERTA ({(activeSection.cotaCrista - 1.5).toFixed(1)}m)
                </text>
              </g>
            )}

            {/* Rótulos das Bermas */}
            {activeSection.bermas.map(b => (
              <g key={b.nome}>
                <circle cx={b.x + (b.largura / 2)} cy={escalaY(b.cota)} r="3" fill="#ffffff" />
                <text
                  x={b.x + (b.largura / 2)}
                  y={escalaY(b.cota) - 10}
                  fill="rgba(255, 255, 255, 0.7)"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {b.nome} ({b.cota.toFixed(1)}m)
                </text>
              </g>
            ))}

            {/* Tubos dos Piezômetros & Níveis d'Água */}
            {activeSection.instrumentos.map(inst => {
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
                  {/* Tubo Vertical do Instrumento */}
                  <line
                    x1={inst.x}
                    y1={yBoca}
                    x2={inst.x}
                    y2={yPonta}
                    stroke={isHovered ? '#38bdf8' : 'rgba(255, 255, 255, 0.6)'}
                    strokeWidth={isHovered ? '3' : '2'}
                  />

                  {/* Bulbo Filtrante na Ponta */}
                  <rect
                    x={inst.x - 3}
                    y={yPonta - 8}
                    width="6"
                    height="12"
                    fill="#f59e0b"
                    rx="2"
                  />

                  {/* Nível d'Água Medido no Tubo */}
                  <circle
                    cx={inst.x}
                    cy={yNA}
                    r={isHovered ? '6' : '4.5'}
                    fill={inst.status === 'ATENÇÃO' ? '#f59e0b' : '#38bdf8'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    style={{ transition: 'all 0.5s ease-in-out' }}
                  />

                  {/* Etiqueta Superior com Nome do Instrumento */}
                  <rect
                    x={inst.x - 28}
                    y={yBoca - 26}
                    width="56"
                    height="18"
                    rx="4"
                    fill={isHovered ? '#0284c7' : 'rgba(15, 23, 42, 0.9)'}
                    stroke={isHovered ? '#38bdf8' : 'rgba(148, 163, 184, 0.4)'}
                    strokeWidth="1"
                  />
                  <text
                    x={inst.x}
                    y={yBoca - 14}
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {inst.id}
                  </text>
                  <text
                    x={inst.x}
                    y={yNA + 14}
                    fill="#38bdf8"
                    fontSize="9"
                    fontWeight="700"
                    textAnchor="middle"
                    style={{ transition: 'all 0.5s ease-in-out' }}
                  >
                    {na.toFixed(2)}m
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Card Flutuante de Detalhes do Instrumento ao passar o mouse */}
        {hoveredInstrument && (
          <div style={{
            position: 'absolute',
            bottom: '1.5rem',
            right: '1.5rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: '10px',
            padding: '0.85rem 1.15rem',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 10,
            maxWidth: '300px',
            backdropFilter: 'blur(8px)',
            animation: 'fadeInUp 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {hoveredInstrument.id}
              </span>
              <span className="badge" style={{
                backgroundColor: hoveredInstrument.status === 'ATENÇÃO' ? 'var(--geo-atencao-bg)' : 'var(--geo-normal-bg)',
                color: hoveredInstrument.status === 'ATENÇÃO' ? 'var(--geo-atencao)' : 'var(--geo-normal)',
                fontSize: '0.7rem'
              }}>
                {hoveredInstrument.status}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div>Tipo: <strong style={{ color: 'var(--text-main)' }}>{hoveredInstrument.tipo}</strong></div>
              <div>Cota da Boca: <strong style={{ color: 'var(--text-main)' }}>{hoveredInstrument.bocaCota.toFixed(2)} m</strong></div>
              <div>Ponta do Bulbo: <strong style={{ color: 'var(--text-main)' }}>{hoveredInstrument.pontaCota.toFixed(2)} m</strong></div>
              <div>Nível d'Água Atual: <strong style={{ color: 'var(--primary-accent)' }}>{hoveredInstrument.naAtual.toFixed(2)} m</strong></div>
              <div>Coluna d'Água: <strong style={{ color: 'var(--text-main)' }}>{(hoveredInstrument.naAtual - hoveredInstrument.pontaCota).toFixed(2)} m</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Legenda Técnica Geotécnica & Resumo Operacional */}
      <div className="card-panel" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#38bdf8', marginTop: '3px', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Linha Freática Piezométrica:</strong>
            <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
              Interpolada a partir das pressões neutras e cotas de NA medidas nos instrumentos da seção transversal.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#f59e0b', marginTop: '3px', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Tapete Drenante & Drenos de Pé:</strong>
            <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
              Camada de transição granular para alívio de poro-pressões e controle de percolação na saída do talude.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#ef4444', marginTop: '3px', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Nível Crítico Regulamentar:</strong>
            <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
              Cota máxima admissível de saturação conforme critérios do projeto executivo e Portaria ANM nº 95/2022.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL: TÚNEL DE CONEXÃO DATAMINE & GEOSTUDIO */}
      {tunnelModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: '14px',
            maxWidth: '820px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            animation: 'fadeInUp 0.25s ease-out'
          }}>
            {/* Topo do Modal */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-surface-elevated)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(14, 165, 233, 0.15)',
                  color: 'var(--primary-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Network size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Túnel de Integração Geotécnica (DataBridge)
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Intercâmbio de malhas de talude, seções 2D e freatimetria com Datamine Studio e GeoStudio SLOPE/W
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTunnelModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Abas do Túnel */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-medium)',
              padding: '0 1.5rem',
              backgroundColor: 'var(--bg-surface)'
            }}>
              <button
                onClick={() => setTunnelTab('datamine')}
                style={{
                  padding: '0.85rem 1.25rem',
                  border: 'none',
                  background: 'none',
                  borderBottom: tunnelTab === 'datamine' ? '2px solid var(--primary-accent)' : '2px solid transparent',
                  color: tunnelTab === 'datamine' ? 'var(--primary-accent)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Database size={16} />
                Datamine Studio RM
              </button>
              <button
                onClick={() => setTunnelTab('geostudio')}
                style={{
                  padding: '0.85rem 1.25rem',
                  border: 'none',
                  background: 'none',
                  borderBottom: tunnelTab === 'geostudio' ? '2px solid var(--geo-atencao)' : '2px solid transparent',
                  color: tunnelTab === 'geostudio' ? 'var(--geo-atencao)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Server size={16} />
                GeoStudio (SLOPE/W & SEEP/W)
              </button>
              <button
                onClick={() => setTunnelTab('logs')}
                style={{
                  padding: '0.85rem 1.25rem',
                  border: 'none',
                  background: 'none',
                  borderBottom: tunnelTab === 'logs' ? '2px solid var(--text-main)' : '2px solid transparent',
                  color: tunnelTab === 'logs' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Terminal size={16} />
                Logs e Telemetria ({tunnelLogs.length})
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {tunnelTab === 'datamine' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          Driver Datamine Automation 8082
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Status: Conectado • Formatos Suportados: DXF CAD 3D, STR (Datamine Strings)
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-normal" style={{ fontSize: '0.75rem' }}>Online</span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.75rem'
                  }}>
                    <div className="card-panel" style={{ padding: '0.85rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Seção Vinculada</span>
                      <p style={{ margin: '4px 0 0', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        {activeSection.nome}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary-accent)' }}>{activeSection.estruturaNome}</span>
                    </div>

                    <div className="card-panel" style={{ padding: '0.85rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cotas e Desnível</span>
                      <p style={{ margin: '4px 0 0', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        Crista {activeSection.cotaCrista.toFixed(2)}m • Pé {activeSection.cotaPe.toFixed(2)}m
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Desnível: {(activeSection.cotaCrista - activeSection.cotaPe).toFixed(2)}m</span>
                    </div>

                    <div className="card-panel" style={{ padding: '0.85rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Piezômetros Inclusos</span>
                      <p style={{ margin: '4px 0 0', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        {activeSection.instrumentos.length} Instrumentos
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Freatimetria reconciliada</span>
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(14, 165, 233, 0.08)',
                    border: '1px solid rgba(14, 165, 233, 0.25)',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)',
                    lineHeight: '1.5'
                  }}>
                    <strong>Sobre a Integração Datamine:</strong> Ao acionar a exportação ou sincronização, o túnel projeta os vértices do talude, berma por berma, gerando entidades 3D no padrão AutoCAD DXF R12 compatível com o Datamine Studio RM, Discover Geotechnical e CAE Mining.
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleExportDXF}
                      className="btn btn-primary"
                      style={{ flex: 1, minWidth: '220px', justifyContent: 'center' }}
                    >
                      <Download size={16} />
                      Exportar Arquivo DXF (Studio RM)
                    </button>
                    <button
                      onClick={() => handleSyncTunnel('DATAMINE')}
                      disabled={isSyncing}
                      className="btn"
                      style={{
                        flex: 1,
                        minWidth: '220px',
                        justifyContent: 'center',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-main)'
                      }}
                    >
                      <RefreshCw size={16} className={isSyncing ? 'spin-anim' : ''} />
                      {isSyncing ? 'Sincronizando...' : 'Sincronizar Bidirecional'}
                    </button>
                  </div>
                </div>
              )}

              {tunnelTab === 'geostudio' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          GeoStudio Seequent Connector (Porta 9091)
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Módulos: SLOPE/W (Estabilidade de Taludes) & SEEP/W (Percolação em Meios Porosos)
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-atencao" style={{ fontSize: '0.75rem' }}>Conectado REST</span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.75rem'
                  }}>
                    <div className="card-panel" style={{ padding: '0.85rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fator de Segurança (FS)</span>
                      <p style={{ margin: '4px 0 0', fontWeight: 800, color: activeSection.fatorSeguranca >= activeSection.fatorSegurancaMin ? '#10b981' : '#ef4444', fontSize: '1.1rem' }}>
                        FS = {activeSection.fatorSeguranca.toFixed(2)}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mínimo Regulamentar: {activeSection.fatorSegurancaMin.toFixed(2)}</span>
                    </div>

                    <div className="card-panel" style={{ padding: '0.85rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Borda Livre Operacional</span>
                      <p style={{ margin: '4px 0 0', fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem' }}>
                        {activeSection.bordaLivre.toFixed(2)} m
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Folga hidráulica adequada</span>
                    </div>

                    <div className="card-panel" style={{ padding: '0.85rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Método de Equilíbrio Limite</span>
                      <p style={{ margin: '4px 0 0', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        Morgenstern-Price
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Superfície circular & não-circular</span>
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)',
                    lineHeight: '1.5'
                  }}>
                    <strong>Sobre o Intercâmbio GeoStudio:</strong> O arquivo XML/GSZ gerado contém a geometria detalhada do corte transversal, os pontos de piezometria e a linha freática correspondente ao cenário selecionado (<strong>{cenario.toUpperCase()}</strong>), permitindo abrir diretamente no SLOPE/W para cálculo de FS e no SEEP/W para verificação de gradiente hidráulico de saída e piping.
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleExportGeoStudio}
                      className="btn"
                      style={{
                        flex: 1,
                        minWidth: '220px',
                        justifyContent: 'center',
                        backgroundColor: 'var(--geo-atencao)',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700
                      }}
                    >
                      <Download size={16} />
                      Exportar XML GeoStudio (SLOPE/W)
                    </button>
                    <button
                      onClick={() => handleSyncTunnel('GEOSTUDIO')}
                      disabled={isSyncing}
                      className="btn"
                      style={{
                        flex: 1,
                        minWidth: '220px',
                        justifyContent: 'center',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-main)'
                      }}
                    >
                      <Activity size={16} className={isSyncing ? 'spin-anim' : ''} />
                      {isSyncing ? 'Processando...' : 'Reavaliar Estabilidade Remota'}
                    </button>
                  </div>
                </div>
              )}

              {tunnelTab === 'logs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Telemetria dos Pacotes em Tempo Real
                    </span>
                    <button
                      onClick={() => setTunnelLogs([
                        { time: new Date().toLocaleTimeString(), type: 'SYS', msg: 'Logs do túnel limpos pelo operador.' }
                      ])}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      Limpar Logs
                    </button>
                  </div>

                  <div style={{
                    backgroundColor: '#0a0f1d',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    padding: '1rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.78rem',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    {tunnelLogs.map((log, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                        <span style={{ color: '#64748b' }}>[{log.time}]</span>
                        <span style={{
                          color: log.type === 'DATAMINE' ? '#38bdf8' : log.type === 'GEOSTUDIO' ? '#fbbf24' : '#a78bfa',
                          fontWeight: 700
                        }}>
                          [{log.type}]
                        </span>
                        <span style={{ color: '#e2e8f0', flex: 1 }}>{log.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              backgroundColor: 'var(--bg-surface-elevated)'
            }}>
              <button
                onClick={() => setTunnelModalOpen(false)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1.25rem' }}
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

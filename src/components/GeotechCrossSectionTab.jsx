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
  Maximize2
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
  }
];

export const GeotechCrossSectionTab = ({ onNavigateTab }) => {
  const { structures = [] } = useGeotechData();
  const [selectedSectionId, setSelectedSectionId] = useState('SEC-A-A');
  const [cenario, setCenario] = useState('atual'); // 'atual', 'chuvoso', 'seco', 'simulado'
  const [simulacaoElevacao, setSimulacaoElevacao] = useState(0.8);
  const [hoveredInstrument, setHoveredInstrument] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showWaterGradient, setShowWaterGradient] = useState(true);
  const [showCriticalLine, setShowCriticalLine] = useState(true);

  const activeSection = useMemo(() => {
    return SECTIONS_DATA.find(s => s.id === selectedSectionId) || SECTIONS_DATA[0];
  }, [selectedSectionId]);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Barra de Alternância Multiperspectiva Sentnel */}
      <div className="card-panel" style={{
        padding: '0.85rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
        border: '1px solid var(--border-medium)'
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
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Seções Transversais Geotécnicas
              </h2>
              <span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: 'var(--primary-accent)', fontSize: '0.7rem' }}>
                VISUALIZAÇÃO 2D MULTIPERSPECTIVA
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Cortes geológicos-geotécnicos com linha freática piezométrica dinâmica e validação de estabilidade
            </p>
          </div>
        </div>

        {/* Tríade Sentnel: Planta (GIS) | Seção Transversal | Modelo 3D */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-secondary)',
          padding: '0.25rem',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          gap: '0.25rem'
        }}>
          <button
            onClick={() => onNavigateTab && onNavigateTab('mapa')}
            className="btn-secondary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)'
            }}
            title="Ir para Mapa GIS e Ortofoto de Satélite"
          >
            <MapPin size={16} />
            <span>1. Planta (GIS)</span>
          </button>

          <button
            className="btn-primary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: 'var(--shadow-sm)'
            }}
            title="Você está visualizando a Seção Transversal"
          >
            <Layers size={16} />
            <span>2. Seção (Corte)</span>
          </button>
        </div>
      </div>

      {/* Seletor de Seção e Cenários Hidráulicos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem'
      }}>
        {/* Escolha da Seção */}
        <div className="card-panel">
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
            SELECIONAR SEÇÃO TRANSVERSAL:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {SECTIONS_DATA.map(sec => {
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
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{sec.nome}</span>
                      <span className="badge" style={{
                        fontSize: '0.65rem',
                        backgroundColor: sec.categoria === 'Barragens' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: sec.categoria === 'Barragens' ? 'var(--primary-accent)' : 'var(--geo-normal)'
                      }}>
                        {sec.categoria}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                      {sec.estruturaNome} • {sec.estaca} • FS: {sec.fatorSeguranca}
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
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--primary-accent)',
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
    </div>
  );
};

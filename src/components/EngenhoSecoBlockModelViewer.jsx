import React, { useState, useMemo } from 'react';
import { 
  ENGENHO_SECO_BLOCK_MODELS, 
  ENGENHO_SECO_SECTORS, 
  DATAMINE_BLOCK_LITHOLOGIES, 
  generateBlockSlice 
} from '../data/engenhoSecoBlockModelData';
import { 
  Box, 
  Layers, 
  Calendar, 
  Activity, 
  Sliders, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Compass, 
  ShieldCheck, 
  AlertTriangle, 
  FileCode, 
  Info, 
  Check, 
  Database,
  Grid
} from 'lucide-react';

export const EngenhoSecoBlockModelViewer = ({ onClose, onNavigateToMap }) => {
  const [selectedModelId, setSelectedModelId] = useState('BM_0926'); // Mês vigente: Setembro/2026
  const [selectedSectorId, setSelectedSectorId] = useState('ENS_INDIA');
  const [selectedCota, setSelectedCota] = useState(820);
  const [colorMode, setColorMode] = useState('lito'); // 'lito' | 'fe' | 'sio2' | 'dest' | 'fs'
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Modelo Selecionado
  const activeModel = useMemo(() => {
    return ENGENHO_SECO_BLOCK_MODELS.find(m => m.id === selectedModelId) || ENGENHO_SECO_BLOCK_MODELS[0];
  }, [selectedModelId]);

  // Setor Selecionado
  const activeSector = useMemo(() => {
    return ENGENHO_SECO_SECTORS.find(s => s.id === selectedSectorId) || ENGENHO_SECO_SECTORS[0];
  }, [selectedSectorId]);

  // Gerar Fatia de Blocos 3D
  const blocks = useMemo(() => {
    return generateBlockSlice(selectedCota, selectedSectorId, selectedModelId);
  }, [selectedCota, selectedSectorId, selectedModelId]);

  // Estatísticas da Fatia
  const sliceStats = useMemo(() => {
    let totalMassa = 0;
    let sumFeMassa = 0;
    let sumSiMassa = 0;
    let massaEspecial = 0;
    let massaComum = 0;
    let massaEsteril = 0;

    blocks.forEach(b => {
      totalMassa += b.massaTon;
      sumFeMassa += b.fe * b.massaTon;
      sumSiMassa += b.sio2 * b.massaTon;
      if (b.categoria === 'ROM Especial') massaEspecial += b.massaTon;
      else if (b.categoria === 'ROM Comum') massaComum += b.massaTon;
      else massaEsteril += b.massaTon;
    });

    const mediaFe = totalMassa > 0 ? (sumFeMassa / totalMassa).toFixed(2) : 0;
    const mediaSi = totalMassa > 0 ? (sumSiMassa / totalMassa).toFixed(2) : 0;
    const rem = (massaEspecial + massaComum) > 0 ? (massaEsteril / (massaEspecial + massaComum)).toFixed(2) : 0;

    return {
      totalBlocos: blocks.length,
      totalMassa: Math.round(totalMassa),
      massaEspecial: Math.round(massaEspecial),
      massaComum: Math.round(massaComum),
      massaEsteril: Math.round(massaEsteril),
      mediaFe,
      mediaSi,
      rem
    };
  }, [blocks]);

  // Rampa de Cores para Teores de Ferro (%Fe)
  const getFeColor = (fe) => {
    if (fe >= 62) return '#b91c1c'; // Vermelho escuro (>62%)
    if (fe >= 58) return '#ea580c'; // Laranja avermelhado
    if (fe >= 50) return '#eab308'; // Amarelo
    if (fe >= 40) return '#06b6d4'; // Ciano
    return '#64748b'; // Cinza / Estéril
  };

  // Rampa de Cores para Teores de Sílica (%SiO2)
  const getSiColor = (si) => {
    if (si <= 8) return '#10b981';  // Verde (baixa sílica, excelente)
    if (si <= 18) return '#f59e0b'; // Amarelo
    if (si <= 30) return '#ea580c'; // Laranja
    return '#ef4444'; // Vermelho (alta sílica)
  };

  // Cor do Bloco conforme modo selecionado
  const getBlockColor = (b) => {
    if (colorMode === 'lito') return b.cor;
    if (colorMode === 'fe') return getFeColor(b.fe);
    if (colorMode === 'sio2') return getSiColor(b.sio2);
    if (colorMode === 'dest') {
      if (b.categoria === 'ROM Especial') return '#ef4444';
      if (b.categoria === 'ROM Comum') return '#38bdf8';
      return '#64748b';
    }
    if (colorMode === 'fs') {
      if (b.fsBancada >= 1.5) return '#10b981';
      if (b.fsBancada >= 1.3) return '#f59e0b';
      return '#ef4444';
    }
    return b.cor;
  };

  return (
    <div className="card-panel glass-panel animate-page-enter" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1.25rem',
      borderRadius: '14px',
      border: '1px solid var(--border-medium)',
      backgroundColor: 'var(--bg-surface)'
    }}>
      {/* 1. Cabeçalho Executivo do Módulo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444'
          }}>
            <Box size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Modelos de Bloco Curto Prazo (CP) — Mina Engenho Seco
              </h2>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)'
              }}>
                Datamine Studio RM
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Discretização voxelizada 3D por mês de lavra, teores químicos (Fe, SiO₂, P, Al₂O₃, Mn, PF) e parametrização geotécnica das bancadas.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onNavigateToMap && (
            <button
              onClick={() => onNavigateToMap('ENGENHO_SECO')}
              className="btn-subtle"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 148, 234, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(0, 148, 234, 0.4)',
                fontWeight: 600
              }}
              title="Visualizar Mina Engenho Seco no mapa GIS georreferenciado"
            >
              <Compass size={14} />
              <span>Ver no Mapa GIS</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="btn-subtle"
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', borderRadius: '8px' }}
            >
              ✕ Fechar
            </button>
          )}
        </div>
      </div>

      {/* 2. Barra de Controle e Seleção: Mês, Setor, Cota e Rampa */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)'
      }}>
        {/* Seletor de Modelo de Bloco Mensal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Calendar size={15} style={{ color: 'var(--primary-accent)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Mês de Lavra:</span>
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="form-select"
            style={{
              padding: '0.3rem 0.6rem',
              fontSize: '0.76rem',
              fontWeight: 700,
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--primary-accent)',
              color: 'var(--text-main)',
              minWidth: '160px'
            }}
          >
            {ENGENHO_SECO_BLOCK_MODELS.map(m => (
              <option key={m.id} value={m.id}>
                {m.mes} / {m.ano} ({m.arquivo})
              </option>
            ))}
          </select>
        </div>

        {/* Seletor de Setor de Lavra */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Layers size={15} style={{ color: '#f59e0b' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Setor / Cava:</span>
          <select
            value={selectedSectorId}
            onChange={(e) => setSelectedSectorId(e.target.value)}
            className="form-select"
            style={{
              padding: '0.3rem 0.6rem',
              fontSize: '0.76rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)'
            }}
          >
            {ENGENHO_SECO_SECTORS.map(s => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
        </div>

        {/* Seletor de Bancada / Cota Z */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Grid size={15} style={{ color: '#10b981' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Cota / Bancada:</span>
          <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--bg-surface)', borderRadius: '6px', padding: '2px' }}>
            {activeModel.bancadasAtivas.map(cota => (
              <button
                key={cota}
                onClick={() => setSelectedCota(cota)}
                style={{
                  padding: '0.2rem 0.45rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: selectedCota === cota ? 'var(--primary-accent)' : 'transparent',
                  color: selectedCota === cota ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {cota}m
              </button>
            ))}
          </div>
        </div>

        {/* Rampa Temática de Coloração */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Sliders size={15} style={{ color: '#8b5cf6' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Coloração:</span>
          <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--bg-surface)', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setColorMode('lito')}
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: colorMode === 'lito' ? '#8b5cf6' : 'transparent',
                color: colorMode === 'lito' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
              title="Colorir por Litologia / Bin Datamine"
            >
              Litologia
            </button>
            <button
              onClick={() => setColorMode('fe')}
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: colorMode === 'fe' ? '#ef4444' : 'transparent',
                color: colorMode === 'fe' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
              title="Colorir por Teor de Ferro (%Fe)"
            >
              %Fe
            </button>
            <button
              onClick={() => setColorMode('sio2')}
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: colorMode === 'sio2' ? '#f59e0b' : 'transparent',
                color: colorMode === 'sio2' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
              title="Colorir por Teor de Sílica (%SiO2)"
            >
              %SiO₂
            </button>
            <button
              onClick={() => setColorMode('dest')}
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: colorMode === 'dest' ? '#0284c7' : 'transparent',
                color: colorMode === 'dest' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
              title="Colorir por Destino (Especial / Comum / Estéril)"
            >
              Destino
            </button>
            <button
              onClick={() => setColorMode('fs')}
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: colorMode === 'fs' ? '#10b981' : 'transparent',
                color: colorMode === 'fs' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
              title="Colorir por Fator de Segurança Geotécnico (FS)"
            >
              FS
            </button>
          </div>
        </div>
      </div>

      {/* 3. Cards de Resumo Mensal da Cubagem & Teores Globais */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.75rem'
      }}>
        {/* ROM Especial */}
        <div className="glass-panel" style={{
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          borderLeft: '4px solid #ef4444'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            ROM Especial ({activeModel.mes})
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
            {activeModel.romEspecial.massa.toLocaleString('pt-BR')} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>t</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700, marginTop: '3px', display: 'flex', gap: '8px' }}>
            <span>Fe: {activeModel.romEspecial.fe}%</span>
            <span>SiO₂: {activeModel.romEspecial.sio2}%</span>
            <span>P: {activeModel.romEspecial.p}%</span>
          </div>
        </div>

        {/* ROM Comum */}
        <div className="glass-panel" style={{
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          borderLeft: '4px solid #38bdf8'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            ROM Comum ({activeModel.mes})
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
            {activeModel.romComum.massa.toLocaleString('pt-BR')} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>t</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, marginTop: '3px', display: 'flex', gap: '8px' }}>
            <span>Fe: {activeModel.romComum.fe}%</span>
            <span>SiO₂: {activeModel.romComum.sio2}%</span>
            <span>P: {activeModel.romComum.p}%</span>
          </div>
        </div>

        {/* Estéril & REM */}
        <div className="glass-panel" style={{
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Estéril & Relação REM
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
            {activeModel.esteril.massa.toLocaleString('pt-BR')} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>t</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, marginTop: '3px', display: 'flex', gap: '8px' }}>
            <span>REM: {activeModel.rem} t/t</span>
            <span>Vol: {Math.round(activeModel.esteril.volumeM3).toLocaleString('pt-BR')} m³</span>
          </div>
        </div>

        {/* Arquivo Datamine & Geometria */}
        <div className="glass-panel" style={{
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileCode size={12} style={{ color: '#10b981' }} />
            <span>Arquivo Datamine (.dm)</span>
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px', wordBreak: 'break-all' }}>
            {activeModel.arquivo}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, marginTop: '3px' }}>
            {activeModel.tamanhoFormatado} • Bloco: 10×10×10m
          </div>
        </div>
      </div>

      {/* 4. Visualizador Interativo da Malha de Blocos Voxelizada (SVG Canvas) */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '440px',
        backgroundColor: '#070b14',
        borderRadius: '12px',
        border: '1px solid var(--border-medium)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Barra Superior do Canvas: Legenda Dinâmica e Zoom */}
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.73rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              Fatia Cota {selectedCota}m ({activeSector.nome}):
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              {sliceStats.totalBlocos} blocos ({sliceStats.totalMassa.toLocaleString('pt-BR')} t) • Fe Médio: <strong style={{ color: '#ef4444' }}>{sliceStats.mediaFe}%</strong> • SiO₂: <strong style={{ color: '#f59e0b' }}>{sliceStats.mediaSi}%</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.15))}
              className="btn-subtle"
              style={{ padding: '3px 8px', borderRadius: '4px' }}
              title="Aproximar zoom"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
              className="btn-subtle"
              style={{ padding: '3px 8px', borderRadius: '4px' }}
              title="Afastar zoom"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={() => setZoomLevel(1.0)}
              className="btn-subtle"
              style={{ padding: '3px 8px', borderRadius: '4px' }}
              title="Resetar zoom"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Área do Grid SVG */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          overflow: 'auto'
        }}>
          <div style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease'
          }}>
            <svg
              width="680"
              height="480"
              viewBox="0 0 680 480"
              style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))' }}
            >
              {/* Malha de Coordenadas de Fundo */}
              <defs>
                <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="680" height="480" fill="url(#gridPattern)" />

              {/* Contorno do Setor de Lavra */}
              <rect
                x="30"
                y="30"
                width="620"
                height="420"
                fill="none"
                stroke="rgba(56, 189, 248, 0.3)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                rx="8"
              />

              {/* Renderização dos Blocos do Modelo */}
              {blocks.map((b) => {
                const bx = 45 + (b.col * 36);
                const by = 45 + (b.row * 32);
                const isHovered = hoveredBlock?.id === b.id;
                const fill = getBlockColor(b);

                return (
                  <g
                    key={b.id}
                    onMouseEnter={() => setHoveredBlock(b)}
                    onMouseLeave={() => setHoveredBlock(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      x={bx}
                      y={by}
                      width="34"
                      height="30"
                      rx="3"
                      fill={fill}
                      fillOpacity={isHovered ? 1 : 0.88}
                      stroke={isHovered ? '#ffffff' : 'rgba(0, 0, 0, 0.5)'}
                      strokeWidth={isHovered ? 2.5 : 1}
                      style={{ transition: 'all 0.15s ease' }}
                    />
                    {/* Rótulo de Teor ou Litologia no Bloco */}
                    <text
                      x={bx + 17}
                      y={by + 16}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="var(--font-mono, monospace)"
                      fontWeight="700"
                      pointerEvents="none"
                      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                    >
                      {colorMode === 'lito' && b.litologia.toUpperCase()}
                      {colorMode === 'fe' && `${Math.round(b.fe)}%`}
                      {colorMode === 'sio2' && `${Math.round(b.sio2)}%`}
                      {colorMode === 'dest' && (b.categoria === 'ROM Especial' ? 'ESP' : b.categoria === 'ROM Comum' ? 'COM' : 'EST')}
                      {colorMode === 'fs' && b.fsBancada}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Tooltip do Bloco Inspecionado */}
        {hoveredBlock && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--primary-accent)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.74rem',
            backdropFilter: 'blur(8px)',
            zIndex: 20
          }}>
            <div>
              <strong style={{ color: 'var(--primary-accent)' }}>{hoveredBlock.id}</strong> • Cota: <strong>{hoveredBlock.cota}m</strong> • UTM 23S: <span style={{ color: '#38bdf8' }}>E {hoveredBlock.utmE} / N {hoveredBlock.utmN}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span>Lito: <strong style={{ color: hoveredBlock.cor }}>{hoveredBlock.nomeLitologia}</strong></span>
              <span>Fe: <strong style={{ color: '#ef4444' }}>{hoveredBlock.fe}%</strong></span>
              <span>SiO₂: <strong style={{ color: '#f59e0b' }}>{hoveredBlock.sio2}%</strong></span>
              <span>Massa: <strong>{hoveredBlock.massaTon} t</strong> (Dens: {hoveredBlock.densidade})</span>
              <span>FS Bancada: <strong style={{ color: hoveredBlock.fsBancada >= 1.5 ? '#10b981' : '#f59e0b' }}>{hoveredBlock.fsBancada}</strong></span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: hoveredBlock.categoria === 'ROM Especial' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                color: hoveredBlock.categoria === 'ROM Especial' ? '#ef4444' : '#38bdf8'
              }}>
                {hoveredBlock.categoria}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Catálogo de Litologias da Mina & Destinação Geotécnica */}
      <div className="glass-panel" style={{
        padding: '0.85rem 1rem',
        borderRadius: '10px',
        border: '1px solid var(--border-medium)'
      }}>
        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={14} style={{ color: 'var(--primary-accent)' }} />
          <span>Classificação Litológica & Destinação de Lavra (Padrão Datamine / Itaminas)</span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.5rem'
        }}>
          {Object.values(DATAMINE_BLOCK_LITHOLOGIES).map(lito => (
            <div
              key={lito.codigo}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.35rem 0.55rem',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.72rem'
              }}
            >
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: lito.cor,
                flexShrink: 0
              }} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--text-main)' }}>{lito.nome} ({lito.codigo.toUpperCase()})</strong>
                  <span style={{ color: lito.feMedio > 50 ? '#ef4444' : 'var(--text-muted)', fontWeight: 700 }}>
                    {lito.feMedio > 0 ? `${lito.feMedio}% Fe` : 'Estéril'}
                  </span>
                </div>
                <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {lito.destinacao}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EngenhoSecoBlockModelViewer;

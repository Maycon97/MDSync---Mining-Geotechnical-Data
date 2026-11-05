import React, { useState, useMemo } from 'react';
import { 
  Droplet, 
  Filter, 
  RotateCcw, 
  MapPin, 
  Crosshair, 
  Maximize2, 
  Minimize2, 
  X, 
  Pin, 
  PinOff,
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  ChevronRight,
  TrendingUp,
  Search,
  ExternalLink
} from 'lucide-react';
import { SUMPS_DATA } from '../data/sumpsData';

export const SumpsExecutivePanel = ({
  sumpsList = SUMPS_DATA,
  isOpen = true,
  onClose,
  isPinned = true,
  onTogglePin,
  onFocusSump,
  selectedSumpTag = null,
  activeFilterMina = 'Todas',
  onChangeFilterMina,
  activeFilterCrits = [],
  onChangeFilterCrits,
  activeFilterAnom = 'Todas',
  onChangeFilterAnom
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'tabela'

  // Dados consolidados (com fallback de segurança para SUMPS_DATA)
  const allSumps = useMemo(() => {
    return (sumpsList && sumpsList.length > 0) ? sumpsList : SUMPS_DATA;
  }, [sumpsList]);

  // Cores padronizadas oficiais da Geotecnia Itaminas
  const COL = {
    'Crítico': '#ff4b4b',
    'Leve': '#33d17a',
    'Moderado': '#ffc21a',
    'Muito Crítico': '#7c8aa3'
  };

  const colorFor = (crit) => COL[crit] || '#71d1f8';
  const nf = (n) => Math.round(n || 0).toLocaleString('pt-BR');
  const pf = (n) => (n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const num = (v) => (v == null ? 0 : Number(v));

  const fmtMil = (v) => {
    if (v >= 1000) return `${Math.round(v / 1000)} Mil`;
    return nf(v);
  };

  const nomeAnom = (a) => {
    const map = {
      'ASSOREAMENTO': 'Assoreamento',
      'VEGETAÇÃO ALTA': 'Vegetação alta',
      'DEFORMAÇÃO ESTRUTURAL': 'Deformação estrutural',
      'CANAL/CANALETA OBSTRUIDO': 'Canal/canaleta obstruído',
      'SEM ANOMALIA': 'Sem anomalia'
    };
    return map[a] || a || 'Sem anomalia';
  };

  // Filtragem dos SUMPs
  const filteredSumps = useMemo(() => {
    return allSumps.filter(d => {
      // Filtro Mina
      if (activeFilterMina !== 'Todas' && d.mina !== activeFilterMina) return false;
      // Filtro Criticidade
      if (activeFilterCrits.length > 0 && !activeFilterCrits.includes(d.crit)) return false;
      // Filtro Anomalia
      if (activeFilterAnom !== 'Todas' && d.anom !== activeFilterAnom) return false;
      // Busca por texto
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchTag = (d.tag || '').toLowerCase().includes(q);
        const matchMina = (d.mina || '').toLowerCase().includes(q);
        const matchAnom = (d.anom || '').toLowerCase().includes(q);
        if (!matchTag && !matchMina && !matchAnom) return false;
      }
      return true;
    });
  }, [allSumps, activeFilterMina, activeFilterCrits, activeFilterAnom, searchTerm]);

  // Cálculos de KPIs
  const total = filteredSumps.length;
  const leve = filteredSumps.filter(d => d.crit === 'Leve').length;
  const mod = filteredSumps.filter(d => d.crit === 'Moderado').length;
  const crit = filteredSumps.filter(d => d.crit === 'Crítico').length;
  const vcrit = filteredSumps.filter(d => d.crit === 'Muito Crítico').length;

  const capTotal = filteredSumps.reduce((s, d) => s + num(d.cap), 0);
  const utilTotal = filteredSumps.reduce((s, d) => s + num(d.util), 0);
  const pctUtil = capTotal > 0 ? (utilTotal / capTotal) : 0;

  // Situação Operacional
  const situacao = useMemo(() => {
    if (pctUtil < 0.40) return { title: 'NORMAL', color: '#33d17a', desc: 'dentro da capacidade', badge: 'rgba(51,209,122,0.15)' };
    if (pctUtil <= 0.60) return { title: 'ATENÇÃO', color: '#ffc21a', desc: 'em atenção', badge: 'rgba(255,194,26,0.15)' };
    if (pctUtil <= 0.80) return { title: 'ALERTA', color: '#ff9f1a', desc: 'em alerta', badge: 'rgba(255,159,26,0.15)' };
    return { title: 'CRÍTICO', color: '#ff4b4b', desc: 'acima da capacidade', badge: 'rgba(255,75,75,0.15)' };
  }, [pctUtil]);

  // Distribuição de Anomalias
  const anomOrder = ['ASSOREAMENTO', 'VEGETAÇÃO ALTA', 'DEFORMAÇÃO ESTRUTURAL', 'CANAL/CANALETA OBSTRUIDO', 'SEM ANOMALIA'];
  const anomStats = useMemo(() => {
    const counts = {};
    filteredSumps.forEach(d => {
      const a = d.anom || 'SEM ANOMALIA';
      counts[a] = (counts[a] || 0) + 1;
    });
    const maxVal = Math.max(1, ...Object.values(counts));
    return anomOrder.map(a => ({
      key: a,
      label: nomeAnom(a),
      count: counts[a] || 0,
      pct: ((counts[a] || 0) / maxVal) * 100,
      isOk: a === 'SEM ANOMALIA'
    }));
  }, [filteredSumps]);

  // Estatísticas por Mina
  const minasStats = useMemo(() => {
    const minas = ['ENGENHO SECO', 'JANGADA'];
    return minas.map(m => {
      const sumpsMina = filteredSumps.filter(d => d.mina === m);
      const t = sumpsMina.length;
      const c = sumpsMina.filter(d => d.crit === 'Crítico').length;
      const l = sumpsMina.filter(d => d.crit === 'Leve').length;
      const mo = sumpsMina.filter(d => d.crit === 'Moderado').length;
      const cap = sumpsMina.reduce((s, d) => s + num(d.cap), 0);
      const util = sumpsMina.reduce((s, d) => s + num(d.util), 0);
      return {
        mina: m,
        displayName: m === 'ENGENHO SECO' ? 'Engenho Seco' : 'Jangada',
        total: t,
        crit: c,
        leve: l,
        mod: mo,
        cap,
        util,
        pctCrit: t ? (c / t) * 100 : 0,
        pctMod: t ? (mo / t) * 100 : 0,
        pctLeve: t ? (l / t) * 100 : 0
      };
    });
  }, [filteredSumps]);

  // Alternadores de Filtro
  const toggleCrit = (c) => {
    if (!onChangeFilterCrits) return;
    if (activeFilterCrits.includes(c)) {
      onChangeFilterCrits(activeFilterCrits.filter(x => x !== c));
    } else {
      onChangeFilterCrits([...activeFilterCrits, c]);
    }
  };

  const handleClearFilters = () => {
    if (onChangeFilterMina) onChangeFilterMina('Todas');
    if (onChangeFilterCrits) onChangeFilterCrits([]);
    if (onChangeFilterAnom) onChangeFilterAnom('Todas');
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`sumps-executive-container ${isExpanded ? 'fullscreen-mode' : (isPinned ? 'pinned-dock' : 'floating-window')}`}
      style={{
        position: 'absolute',
        top: isExpanded ? 0 : '60px',
        right: isExpanded ? 0 : '16px',
        bottom: isExpanded ? 0 : '20px',
        width: isExpanded ? '100%' : (isPinned ? '460px' : '420px'),
        maxWidth: isExpanded ? '100%' : '92vw',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: isExpanded ? '0' : '12px',
        background: 'linear-gradient(165deg, rgba(10, 26, 51, 0.98) 0%, rgba(11, 30, 59, 0.98) 45%, rgba(10, 24, 48, 0.98) 100%)',
        border: '1px solid rgba(113, 209, 248, 0.28)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        color: '#eaf2fb',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* ========================================================
          1. HEADER DO PAINEL EXECUTIVO
         ======================================================== */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(113, 209, 248, 0.18)',
        background: 'rgba(16, 40, 78, 0.65)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 14px rgba(56, 189, 248, 0.45)'
          }}>
            <Droplet size={18} />
          </div>
          <div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              PAINEL EXECUTIVO — SUMPs
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '99px',
                border: `1px solid ${situacao.color}`,
                backgroundColor: situacao.badge,
                color: situacao.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: situacao.color,
                  boxShadow: `0 0 8px ${situacao.color}`
                }} />
                {situacao.title}
              </span>
            </div>
            <div style={{
              fontSize: '10px',
              color: '#9db3d1',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginTop: '1px'
            }}>
              Gestão Operacional de Drenagem • Itaminas
            </div>
          </div>
        </div>

        {/* Controles de Janela */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setActiveTab(activeTab === 'dashboard' ? 'tabela' : 'dashboard')}
            className="btn-subtle"
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: '#71d1f8',
              border: '1px solid rgba(113, 209, 248, 0.25)'
            }}
            title="Alternar entre visualização gráfica e lista de sumps"
          >
            {activeTab === 'dashboard' ? 'Lista de SUMPs' : 'Gráficos'}
          </button>

          {onTogglePin && (
            <button
              onClick={onTogglePin}
              className="btn-icon"
              style={{
                background: isPinned ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: isPinned ? '#38bdf8' : '#9db3d1',
                padding: '5px',
                borderRadius: '6px',
                border: isPinned ? '1px solid rgba(56, 189, 248, 0.4)' : 'none',
                cursor: 'pointer'
              }}
              title={isPinned ? 'Desafixar painel do mapa' : 'Fixar painel no mapa'}
            >
              {isPinned ? <Pin size={14} /> : <PinOff size={14} />}
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-icon"
            style={{
              background: 'transparent',
              color: '#9db3d1',
              padding: '5px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title={isExpanded ? 'Reduzir para lateral' : 'Expandir tela cheia'}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="btn-icon"
              style={{
                background: 'transparent',
                color: '#9db3d1',
                padding: '5px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Fechar painel de sumps"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          2. BARRA DE FILTROS INTERATIVOS (Mina, Criticidade, Anomalias)
         ======================================================== */}
      <div style={{
        padding: '8px 14px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid rgba(113, 209, 248, 0.15)',
        background: 'rgba(10, 22, 44, 0.7)'
      }}>
        {/* Mina Segments */}
        <div style={{
          display: 'inline-flex',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid rgba(113, 209, 248, 0.2)',
          background: 'rgba(255,255,255,0.03)'
        }}>
          {['Todas', 'ENGENHO SECO', 'JANGADA'].map(m => {
            const label = m === 'Todas' ? 'Todas' : (m === 'ENGENHO SECO' ? 'Eng. Seco' : 'Jangada');
            const isActive = activeFilterMina === m;
            return (
              <button
                key={m}
                onClick={() => onChangeFilterMina && onChangeFilterMina(m)}
                style={{
                  border: 'none',
                  background: isActive ? '#0284c7' : 'transparent',
                  color: isActive ? '#ffffff' : '#9db3d1',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Chips de Criticidade */}
        <div style={{ display: 'inline-flex', gap: '4px' }}>
          {[
            { id: 'Crítico', color: '#ff4b4b' },
            { id: 'Moderado', color: '#ffc21a' },
            { id: 'Leve', color: '#33d17a' }
          ].map(c => {
            const isSel = activeFilterCrits.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleCrit(c.id)}
                style={{
                  border: `1px solid ${isSel ? c.color : 'rgba(113, 209, 248, 0.2)'}`,
                  borderRadius: '99px',
                  background: isSel ? c.color : 'rgba(255,255,255,0.03)',
                  color: isSel ? (c.id === 'Moderado' ? '#08131f' : '#ffffff') : '#9db3d1',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isSel ? (c.id === 'Moderado' ? '#08131f' : '#ffffff') : c.color
                }} />
                {c.id}
              </button>
            );
          })}
        </div>

        {/* Dropdown de Anomalias */}
        <select
          value={activeFilterAnom}
          onChange={(e) => onChangeFilterAnom && onChangeFilterAnom(e.target.value)}
          style={{
            background: 'rgba(14, 34, 68, 0.85)',
            color: '#eaf2fb',
            border: '1px solid rgba(113, 209, 248, 0.25)',
            borderRadius: '6px',
            padding: '3px 6px',
            fontSize: '10px',
            cursor: 'pointer',
            maxWidth: '130px'
          }}
        >
          <option value="Todas">Todas Anomalias</option>
          <option value="ASSOREAMENTO">Assoreamento</option>
          <option value="VEGETAÇÃO ALTA">Vegetação alta</option>
          <option value="DEFORMAÇÃO ESTRUTURAL">Deformação estrutural</option>
          <option value="CANAL/CANALETA OBSTRUIDO">Canaleta obstruída</option>
          <option value="SEM ANOMALIA">Sem anomalia</option>
        </select>

        {/* Limpar Filtros & Contador */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {(activeFilterMina !== 'Todas' || activeFilterCrits.length > 0 || activeFilterAnom !== 'Todas' || searchTerm) && (
            <button
              onClick={handleClearFilters}
              style={{
                background: 'transparent',
                border: '1px solid rgba(113, 209, 248, 0.3)',
                color: '#71d1f8',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '9px',
                cursor: 'pointer'
              }}
              title="Limpar todos os filtros"
            >
              Limpar
            </button>
          )}
          <span style={{ fontSize: '11px', color: '#71d1f8', fontWeight: 700 }}>
            {total} <span style={{ color: '#9db3d1', fontWeight: 500, fontSize: '10px' }}>SUMPs</span>
          </span>
        </div>
      </div>

      {/* ========================================================
          3. CORPO DO PAINEL (SCROLLÁVEL)
         ======================================================== */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* 6 KPIS EM GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px'
        }}>
          {/* Total */}
          <div style={{
            position: 'relative',
            border: '1px solid rgba(113, 209, 248, 0.2)',
            borderRadius: '8px',
            padding: '8px',
            background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#0284c7' }} />
            <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#9db3d1', fontWeight: 700 }}>TOTAL</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>{total}</div>
          </div>

          {/* Crítico */}
          <div 
            onClick={() => toggleCrit('Crítico')}
            style={{
              position: 'relative',
              border: `1px solid ${activeFilterCrits.includes('Crítico') ? '#ff4b4b' : 'rgba(255, 75, 75, 0.25)'}`,
              borderRadius: '8px',
              padding: '8px',
              background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))',
              cursor: 'pointer'
            }}
          >
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#ff4b4b' }} />
            <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#ff8a8a', fontWeight: 700 }}>CRÍTICO</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ff4b4b', marginTop: '2px' }}>{crit}</div>
          </div>

          {/* Moderado */}
          <div 
            onClick={() => toggleCrit('Moderado')}
            style={{
              position: 'relative',
              border: `1px solid ${activeFilterCrits.includes('Moderado') ? '#ffc21a' : 'rgba(255, 194, 26, 0.25)'}`,
              borderRadius: '8px',
              padding: '8px',
              background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))',
              cursor: 'pointer'
            }}
          >
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#ffc21a' }} />
            <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#ffd566', fontWeight: 700 }}>MODERADO</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffc21a', marginTop: '2px' }}>{mod}</div>
          </div>

          {/* Leve */}
          <div 
            onClick={() => toggleCrit('Leve')}
            style={{
              position: 'relative',
              border: `1px solid ${activeFilterCrits.includes('Leve') ? '#33d17a' : 'rgba(51, 209, 122, 0.25)'}`,
              borderRadius: '8px',
              padding: '8px',
              background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))',
              cursor: 'pointer'
            }}
          >
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#33d17a' }} />
            <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 700 }}>LEVE</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#33d17a', marginTop: '2px' }}>{leve}</div>
          </div>

          {/* Muito Crítico */}
          <div style={{
            position: 'relative',
            border: '1px solid rgba(124, 138, 163, 0.25)',
            borderRadius: '8px',
            padding: '8px',
            background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))'
          }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#7c8aa3' }} />
            <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>MTO CRÍTICO</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#94a3b8', marginTop: '2px' }}>{vcrit}</div>
          </div>

          {/* Taxa Utilização */}
          <div style={{
            position: 'relative',
            border: '1px solid rgba(113, 209, 248, 0.35)',
            borderRadius: '8px',
            padding: '8px',
            background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))'
          }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#71d1f8' }} />
            <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#71d1f8', fontWeight: 700 }}>UTILIZAÇÃO</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#71d1f8', marginTop: '2px' }}>
              {pf(pctUtil * 100)}<span style={{ fontSize: '11px', fontWeight: 600 }}>%</span>
            </div>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <>
            {/* CARD 1: SITUAÇÃO OPERACIONAL & BARRAS CAPACIDADE VS UTILIZAÇÃO */}
            <div style={{
              border: '1px solid rgba(113, 209, 248, 0.2)',
              borderRadius: '10px',
              padding: '12px',
              background: 'rgba(16, 40, 78, 0.65)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#71d1f8', letterSpacing: '0.06em' }}>
                  UTILIZAÇÃO VS CAPACIDADE TOTAL
                </span>
                <span style={{ fontSize: '10px', color: '#9db3d1' }}>
                  Total: {nf(capTotal)} m³
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Barras Gráficas Verticais */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '90px', paddingBottom: '4px' }}>
                  {/* Utilização */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#71d1f8', marginBottom: '4px' }}>
                      {fmtMil(utilTotal)}
                    </span>
                    <div style={{
                      width: '24px',
                      height: `${Math.max(12, Math.min(100, (utilTotal / Math.max(capTotal, 1)) * 75))}%`,
                      background: 'linear-gradient(180deg, #8fd0ff, #0284c7)',
                      borderRadius: '4px 4px 0 0'
                    }} />
                    <span style={{ fontSize: '9px', color: '#9db3d1', textTransform: 'uppercase', marginTop: '4px' }}>Util</span>
                  </div>

                  {/* Capacidade */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                      {fmtMil(capTotal)}
                    </span>
                    <div style={{
                      width: '24px',
                      height: '75%',
                      background: 'linear-gradient(180deg, #3b5e8f, #1e3a5f)',
                      borderRadius: '4px 4px 0 0'
                    }} />
                    <span style={{ fontSize: '9px', color: '#9db3d1', textTransform: 'uppercase', marginTop: '4px' }}>Cap</span>
                  </div>
                </div>

                {/* Situação Texto & Gauge */}
                <div style={{
                  flex: 1,
                  borderLeft: '1px solid rgba(113, 209, 248, 0.2)',
                  paddingLeft: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#9db3d1' }}>SITUAÇÃO GERAL</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: situacao.color, lineHeight: 1.1 }}>
                    {situacao.title}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#71d1f8' }}>
                    {pf(pctUtil * 100)}%
                  </div>
                  <div style={{ fontSize: '10px', color: situacao.color, marginTop: '2px' }}>
                    {situacao.desc}
                  </div>
                  <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
                    Normal &lt;40% • Atenção 40-60% • Alerta 60-80% • Crítico &gt;80%
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: CRITICIDADE POR MINA (BARRAS PROPORCIONAIS) */}
            <div style={{
              border: '1px solid rgba(113, 209, 248, 0.2)',
              borderRadius: '10px',
              padding: '12px',
              background: 'rgba(16, 40, 78, 0.65)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#71d1f8', letterSpacing: '0.06em', marginBottom: '8px' }}>
                DISTRIBUIÇÃO DE CRITICIDADE POR MINA
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {minasStats.map(m => (
                  <div 
                    key={m.mina}
                    onClick={() => onChangeFilterMina && onChangeFilterMina(activeFilterMina === m.mina ? 'Todas' : m.mina)}
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      background: activeFilterMina === m.mina ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                      border: activeFilterMina === m.mina ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>{m.displayName}</span>
                      <span style={{ fontSize: '10px', color: '#9db3d1' }}>{m.total} SUMPs</span>
                    </div>

                    {/* Barra empilhada */}
                    <div style={{
                      display: 'flex',
                      height: '16px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      background: 'rgba(255,255,255,0.05)'
                    }}>
                      {m.pctCrit > 0 && (
                        <div style={{
                          width: `${m.pctCrit}%`,
                          background: '#ff4b4b',
                          color: '#ffffff',
                          fontSize: '9px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {m.pctCrit >= 10 ? `${Math.round(m.pctCrit)}%` : ''}
                        </div>
                      )}
                      {m.pctMod > 0 && (
                        <div style={{
                          width: `${m.pctMod}%`,
                          background: '#ffc21a',
                          color: '#08131f',
                          fontSize: '9px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {m.pctMod >= 10 ? `${Math.round(m.pctMod)}%` : ''}
                        </div>
                      )}
                      {m.pctLeve > 0 && (
                        <div style={{
                          width: `${m.pctLeve}%`,
                          background: '#33d17a',
                          color: '#ffffff',
                          fontSize: '9px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {m.pctLeve >= 10 ? `${Math.round(m.pctLeve)}%` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 3: ANOMALIAS DETECTADAS */}
            <div style={{
              border: '1px solid rgba(113, 209, 248, 0.2)',
              borderRadius: '10px',
              padding: '12px',
              background: 'rgba(16, 40, 78, 0.65)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#71d1f8', letterSpacing: '0.06em' }}>
                  ANOMALIAS EM SUMPS
                </span>
                <span style={{ fontSize: '10px', color: '#9db3d1' }}>
                  {filteredSumps.filter(d => d.anom && d.anom !== 'SEM ANOMALIA').length} com anomalia
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {anomStats.map(a => (
                  <div
                    key={a.key}
                    onClick={() => onChangeFilterAnom && onChangeFilterAnom(activeFilterAnom === a.key ? 'Todas' : a.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      background: activeFilterAnom === a.key ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <span style={{ width: '130px', fontSize: '11px', color: a.isOk ? '#33d17a' : '#eaf2fb', flexShrink: 0 }}>
                      {a.label}
                    </span>
                    <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${a.pct}%`,
                        background: a.isOk ? 'linear-gradient(90deg, #10b981, #33d17a)' : 'linear-gradient(90deg, #0284c7, #38bdf8)',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <span style={{ width: '24px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                      {a.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 4: TABELA RESUMO POR MINA */}
            <div style={{
              border: '1px solid rgba(113, 209, 248, 0.2)',
              borderRadius: '10px',
              padding: '10px',
              background: 'rgba(16, 40, 78, 0.65)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(113, 209, 248, 0.2)', color: '#9db3d1', textAlign: 'right' }}>
                    <th style={{ textAlign: 'left', padding: '4px 6px' }}>Mina</th>
                    <th style={{ padding: '4px 6px' }}>Total</th>
                    <th style={{ padding: '4px 6px', color: '#ff4b4b' }}>Crítico</th>
                    <th style={{ padding: '4px 6px' }}>Cap (m³)</th>
                    <th style={{ padding: '4px 6px' }}>Util (m³)</th>
                  </tr>
                </thead>
                <tbody>
                  {minasStats.map(m => (
                    <tr key={m.mina} style={{ borderBottom: '1px solid rgba(113, 209, 248, 0.1)', textAlign: 'right' }}>
                      <td style={{ textAlign: 'left', fontWeight: 700, color: '#ffffff', padding: '6px' }}>{m.displayName}</td>
                      <td style={{ fontWeight: 800, padding: '6px' }}>{m.total}</td>
                      <td style={{ color: '#ff4b4b', fontWeight: 700, padding: '6px' }}>{m.crit}</td>
                      <td style={{ padding: '6px' }}>{nf(m.cap)}</td>
                      <td style={{ padding: '6px', color: '#71d1f8' }}>{nf(m.util)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 800, textAlign: 'right' }}>
                    <td style={{ textAlign: 'left', color: '#38bdf8', padding: '6px' }}>Total</td>
                    <td style={{ padding: '6px' }}>{total}</td>
                    <td style={{ color: '#ff4b4b', padding: '6px' }}>{crit}</td>
                    <td style={{ padding: '6px' }}>{nf(capTotal)}</td>
                    <td style={{ padding: '6px', color: '#71d1f8' }}>{nf(utilTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* TABELA COMPLETA COM AÇÃO DE LOCALIZAÇÃO NO MAPA */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#9db3d1' }} />
              <input
                type="text"
                placeholder="Buscar por TAG, Mina ou Anomalia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  borderRadius: '6px',
                  border: '1px solid rgba(113, 209, 248, 0.25)',
                  background: 'rgba(14, 34, 68, 0.8)',
                  color: '#ffffff',
                  fontSize: '11px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '440px',
              overflowY: 'auto'
            }}>
              {filteredSumps.map(s => {
                const isSelected = selectedSumpTag === s.tag;
                const col = colorFor(s.crit);
                return (
                  <div
                    key={s.tag}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 40, 78, 0.6)',
                      border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(113, 209, 248, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: col,
                          boxShadow: `0 0 6px ${col}`
                        }} />
                        <strong style={{ color: '#ffffff', fontSize: '12px' }}>{s.tag}</strong>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: `${col}22`,
                          color: col
                        }}>
                          {s.crit}
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#9db3d1', marginTop: '2px' }}>
                        {s.mina} • {nomeAnom(s.anom)}
                      </div>
                      <div style={{ fontSize: '9px', color: '#71d1f8', marginTop: '1px' }}>
                        Cap: {nf(s.cap)} m³ • Util: {nf(s.util)} m³
                      </div>
                    </div>

                    {s.lat && s.lon && (
                      <button
                        onClick={() => onFocusSump && onFocusSump(s)}
                        style={{
                          background: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          color: '#38bdf8',
                          borderRadius: '6px',
                          padding: '5px 8px',
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Centralizar e visualizar no mapa"
                      >
                        <Crosshair size={12} />
                        Ver no Georeferenciamento
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          4. FOOTER COM STATUS & SINCRONISMO
         ======================================================== */}
      <div style={{
        padding: '8px 14px',
        borderTop: '1px solid rgba(113, 209, 248, 0.15)',
        background: 'rgba(10, 22, 44, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '10px',
        color: '#9db3d1'
      }}>
        <span>Origem: <strong>GUT_SUMPS Oficial</strong></span>
        <span style={{ color: '#71d1f8' }}>92 SUMPs georreferenciados</span>
      </div>
    </div>
  );
};

export default SumpsExecutivePanel;


import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from '../utils/leafletCompat';
import logoItaminas from '../assets/logo_itaminas.png';
import {
  CONTROLE_CHAMADOS_DATA,
  STATUS_COLORS,
  TIPO_COLOR,
  CRIT_ORDER,
  CRIT_PRAZO,
  getCritColor,
  getCritLabel,
  formatMesLabel,
  isTicketOpen,
  getDaysTo,
  getEffectivenessBand,
  formatNumber
} from '../data/controleChamadosData';
import {
  LifeBuoy,
  Filter,
  RotateCcw,
  Download,
  Table as TableIcon,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Search,
  X,
  Eye,
  ExternalLink,
  Calendar,
  Layers,
  Activity,
  FileSpreadsheet,
  Building2,
  Flame,
  Info
} from 'lucide-react';

export const ChamadosPainelExecutivo = ({ onNavigateTab, onOpenNewTicket, onOpenFluigList }) => {
  // Filtros
  const [selectedMes, setSelectedMes] = useState('Todos');
  const [selectedEstrutura, setSelectedEstrutura] = useState('Todas');
  const [selectedTipo, setSelectedTipo] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [searchTableQuery, setSearchTableQuery] = useState('');

  // Modais e gavetas
  const [showTableModal, setShowTableModal] = useState(false);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState(null);
  const [activeTabSubView, setActiveTabSubView] = useState('dashboard'); // 'dashboard' | 'tabela' | 'cronograma'

  // Map refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerLayerRef = useRef(null);

  // Filtragem dos chamados
  const filteredTickets = useMemo(() => {
    return CONTROLE_CHAMADOS_DATA.tickets.filter(t => {
      const matchMes = selectedMes === 'Todos' || t.mesano === selectedMes;
      const matchEstr = selectedEstrutura === 'Todas' || t.estr === selectedEstrutura;
      const matchTipo = selectedTipo === 'Todos' || t.tipo === selectedTipo;
      const matchStatus = selectedStatus === 'Todos' || t.status === selectedStatus;
      return matchMes && matchEstr && matchTipo && matchStatus;
    });
  }, [selectedMes, selectedEstrutura, selectedTipo, selectedStatus]);

  // Cálculos Executivos e KPIs
  const totalCount = filteredTickets.length;
  const aprovadosCount = useMemo(() => filteredTickets.filter(t => t.status === 'Realizado e Aprovado').length, [filteredTickets]);
  const canceladosCount = useMemo(() => filteredTickets.filter(t => t.status === 'Não Realizado e Cancelado').length, [filteredTickets]);
  const pendentesCount = useMemo(() => filteredTickets.filter(t => t.status === 'Não Realizado e Pendente').length, [filteredTickets]);
  const finalizadosCount = useMemo(() => filteredTickets.filter(t => t.statusCh === 'Finalizado').length, [filteredTickets]);

  const atingidosCount = aprovadosCount + canceladosCount;
  const efetividadeRatio = totalCount > 0 ? atingidosCount / totalCount : 0;
  const efetividadePct = (efetividadeRatio * 100).toFixed(1).replace('.', ',');

  const vencidosCount = useMemo(() => {
    return filteredTickets.filter(t => isTicketOpen(t) && t.limite && getDaysTo(t.limite) < 0).length;
  }, [filteredTickets]);

  const aVencerCount = useMemo(() => {
    return filteredTickets.filter(t => {
      if (!isTicketOpen(t) || !t.limite) return false;
      const d = getDaysTo(t.limite);
      return d >= 0 && d <= 7;
    }).length;
  }, [filteredTickets]);

  const emAbertoCount = useMemo(() => {
    return filteredTickets.filter(isTicketOpen).length;
  }, [filteredTickets]);

  const currentBand = useMemo(() => getEffectivenessBand(efetividadeRatio), [efetividadeRatio]);

  // Georreferenciados
  const georefTickets = useMemo(() => {
    return filteredTickets.filter(t => t.lat && t.lon);
  }, [filteredTickets]);

  // Tallies para listas de barras
  const tallyStatus = useMemo(() => {
    const counts = {};
    filteredTickets.forEach(t => {
      const st = t.status || 'Sem classificação';
      counts[st] = (counts[st] || 0) + 1;
    });
    return CONTROLE_CHAMADOS_DATA.statuses
      .filter(s => counts[s] !== undefined)
      .map(s => [s, counts[s] || 0]);
  }, [filteredTickets]);

  const tallyTipos = useMemo(() => {
    const counts = {};
    filteredTickets.forEach(t => {
      const tp = t.tipo || 'N/D';
      counts[tp] = (counts[tp] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [filteredTickets]);

  const tallyCriticidade = useMemo(() => {
    const counts = {};
    filteredTickets.forEach(t => {
      const c = t.crit || 'N/D';
      counts[c] = (counts[c] || 0) + 1;
    });
    return CRIT_ORDER
      .filter(c => counts[c] !== undefined)
      .map(c => [c, counts[c] || 0]);
  }, [filteredTickets]);

  // Máximos para barras proporcionais
  const maxStatus = useMemo(() => Math.max(1, ...tallyStatus.map(e => e[1])), [tallyStatus]);
  const maxTipos = useMemo(() => Math.max(1, ...tallyTipos.map(e => e[1])), [tallyTipos]);
  const maxCrit = useMemo(() => Math.max(1, ...tallyCriticidade.map(e => e[1])), [tallyCriticidade]);

  // Reset filtros
  const handleClearFilters = () => {
    setSelectedMes('Todos');
    setSelectedEstrutura('Todas');
    setSelectedTipo('Todos');
    setSelectedStatus('Todos');
  };

  // Inicialização e atualização do Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false,
        center: [-20.091, -44.112],
        zoom: 14
      });

      // Satélite Esri
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      }).addTo(map);

      // Boundaries & Places overlay
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        opacity: 0.85
      }).addTo(map);

      const markerLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markerLayerRef.current = markerLayer;

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    // Atualizar marcadores
    if (markerLayerRef.current && mapInstanceRef.current) {
      markerLayerRef.current.clearLayers();

      if (georefTickets.length > 0) {
        georefTickets.forEach(t => {
          const color = STATUS_COLORS[t.status] || '#71d1f8';
          const marker = L.circleMarker([t.lat, t.lon], {
            radius: 6,
            color: '#ffffff',
            weight: 1.5,
            fillColor: color,
            fillOpacity: 0.95
          });

          const popupContent = `
            <div style="font-family: inherit; font-size: 12px; line-height: 1.45; min-width: 170px;">
              <div style="font-size: 13px; font-weight: 800; color: #0284c7; margin-bottom: 3px;">
                Protocolo #${t.proto || '—'}
              </div>
              <div><b>Estrutura:</b> ${t.estr || '—'}</div>
              <div><b>Tipo:</b> ${t.tipo || '—'}</div>
              <div><b>Criticidade:</b> <span style="font-weight: 700; color: ${getCritColor(t.crit)}">${t.crit || '—'}</span></div>
              <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(0,0,0,0.1);">
                <b>Status:</b> <span style="font-weight: 700; color: ${color}">${t.status}</span>
              </div>
              ${t.limite ? `<div><b>Limite:</b> ${t.limite.split('-').reverse().join('/')}</div>` : ''}
              ${t.statusCh ? `<div><small style="color: #64748b">Etapa: ${t.statusCh}</small></div>` : ''}
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.on('click', () => setSelectedTicketDetail(t));
          marker.addTo(markerLayerRef.current);
        });

        try {
          const bounds = L.latLngBounds(georefTickets.map(t => [t.lat, t.lon]));
          if (bounds.isValid()) {
            mapInstanceRef.current.fitBounds(bounds.pad(0.12), { maxZoom: 16 });
          }
        } catch {
          // ignore
        }
      }
    }
  }, [georefTickets]);

  // Exportar chamados filtrados para CSV
  const handleExportCSV = () => {
    const headers = ['Protocolo', 'Estrutura', 'Tipo', 'Criticidade', 'Status', 'Etapa_Fluig', 'MesAno', 'Abertura', 'Limite', 'Latitude', 'Longitude'];
    const rows = filteredTickets.map(t => [
      t.proto || '',
      `"${t.estr || ''}"`,
      `"${t.tipo || ''}"`,
      t.crit || '',
      `"${t.status || ''}"`,
      `"${t.statusCh || ''}"`,
      t.mesano || '',
      t.abertura || '',
      t.limite || '',
      t.lat || '',
      t.lon || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Controle_Chamados_Itaminas_${selectedMes}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtragem da tabela analítica
  const tableDisplayTickets = useMemo(() => {
    if (!searchTableQuery.trim()) return filteredTickets;
    const q = searchTableQuery.toLowerCase();
    return filteredTickets.filter(t => {
      const str = `${t.proto} ${t.estr} ${t.tipo} ${t.crit} ${t.status} ${t.statusCh}`.toLowerCase();
      return str.includes(q);
    });
  }, [filteredTickets, searchTableQuery]);

  // Gauge calculations
  const gaugeRadius = 50;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius; // ~314.159
  const gaugeOffset = gaugeCircumference * (1 - Math.max(0, Math.min(1, efetividadeRatio)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      
      {/* CABEÇALHO DO PAINEL EXECUTIVO */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(16,40,78,.85), rgba(11,28,56,.90))',
        border: '1px solid rgba(113,209,248,.25)',
        borderRadius: '16px',
        padding: '1rem 1.4rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand & Título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
          <img 
            src={logoItaminas} 
            alt="Itaminas Mineração" 
            style={{ height: '38px', objectFit: 'contain' }} 
          />
          <div style={{ width: '1px', height: '36px', background: 'rgba(113,209,248,.25)' }} />
          <div>
            <div style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '0.02em',
              color: '#ffffff',
              textTransform: 'uppercase',
              lineHeight: 1.15
            }}>
              PAINEL EXECUTIVO · GERÊNCIA DE GEOTECNIA
            </div>
            <div style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#9db3d1',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: '4px'
            }}>
              Controle de Chamados & Efetividade PCM
            </div>
          </div>
        </div>

        {/* Efetividade Badge e Subview Switchers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
          {/* Subview pills */}
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderRadius: '10px',
            padding: '3px',
            border: '1px solid rgba(113,209,248,0.2)'
          }}>
            <button
              onClick={() => setActiveTabSubView('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTabSubView === 'dashboard' ? 'var(--primary-accent, #0284c7)' : 'transparent',
                color: activeTabSubView === 'dashboard' ? '#fff' : '#94a3b8',
                transition: 'all 0.2s'
              }}
            >
              <Activity size={14} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTabSubView('tabela')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTabSubView === 'tabela' ? 'var(--primary-accent, #0284c7)' : 'transparent',
                color: activeTabSubView === 'tabela' ? '#fff' : '#94a3b8',
                transition: 'all 0.2s'
              }}
            >
              <TableIcon size={14} />
              Lista de Chamados ({totalCount})
            </button>
            <button
              onClick={() => setActiveTabSubView('cronograma')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTabSubView === 'cronograma' ? 'var(--primary-accent, #0284c7)' : 'transparent',
                color: activeTabSubView === 'cronograma' ? '#fff' : '#94a3b8',
                transition: 'all 0.2s'
              }}
            >
              <FileSpreadsheet size={14} />
              Cronograma PCM ({CONTROLE_CHAMADOS_DATA.cronogramaPCM?.length || 0})
            </button>
          </div>

          {/* Badge Indicador de Efetividade */}
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '0.78rem', color: '#9db3d1', lineHeight: 1.2 }}>
              Efetividade PCM: <b style={{ color: currentBand.color }}>{efetividadePct}% atingido</b>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '99px',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: '0.82rem',
              letterSpacing: '0.05em',
              border: `1px solid ${currentBand.color}`,
              backgroundColor: `${currentBand.color}1f`,
              color: currentBand.color,
              marginTop: '4px'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: currentBand.color,
                boxShadow: `0 0 8px ${currentBand.color}`
              }} />
              <span>{currentBand.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS EXECUTIVOS */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(16,40,78,.65), rgba(11,28,56,.70))',
        border: '1px solid rgba(113,209,248,.18)',
        borderRadius: '12px',
        padding: '0.65rem 1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
        boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#71d1f8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          <Filter size={15} />
          <span>Filtros</span>
        </div>

        {/* Mês/Ano */}
        <select
          value={selectedMes}
          onChange={e => setSelectedMes(e.target.value)}
          style={{
            fontFamily: 'inherit',
            background: 'rgba(14, 34, 68, 0.85)',
            color: '#eaf2fb',
            border: '1px solid rgba(113,209,248,.25)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '0.82rem',
            cursor: 'pointer',
            minWidth: '130px'
          }}
        >
          <option value="Todos">Todos os meses</option>
          {CONTROLE_CHAMADOS_DATA.mesanos.map(m => (
            <option key={m} value={m}>{formatMesLabel(m)}</option>
          ))}
        </select>

        {/* Estrutura */}
        <select
          value={selectedEstrutura}
          onChange={e => setSelectedEstrutura(e.target.value)}
          style={{
            fontFamily: 'inherit',
            background: 'rgba(14, 34, 68, 0.85)',
            color: '#eaf2fb',
            border: '1px solid rgba(113,209,248,.25)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '0.82rem',
            cursor: 'pointer',
            maxWidth: '180px'
          }}
        >
          <option value="Todas">Todas as estruturas</option>
          {CONTROLE_CHAMADOS_DATA.estruturas.filter(e => e !== 'TODAS').map(estr => (
            <option key={estr} value={estr}>{estr}</option>
          ))}
        </select>

        {/* Tipo */}
        <select
          value={selectedTipo}
          onChange={e => setSelectedTipo(e.target.value)}
          style={{
            fontFamily: 'inherit',
            background: 'rgba(14, 34, 68, 0.85)',
            color: '#eaf2fb',
            border: '1px solid rgba(113,209,248,.25)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '0.82rem',
            cursor: 'pointer',
            minWidth: '120px'
          }}
        >
          <option value="Todos">Todos os tipos</option>
          {CONTROLE_CHAMADOS_DATA.tipos.map(tp => (
            <option key={tp} value={tp}>{tp}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          style={{
            fontFamily: 'inherit',
            background: 'rgba(14, 34, 68, 0.85)',
            color: '#eaf2fb',
            border: '1px solid rgba(113,209,248,.25)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '0.82rem',
            cursor: 'pointer',
            minWidth: '160px'
          }}
        >
          <option value="Todos">Todos os status</option>
          {CONTROLE_CHAMADOS_DATA.statuses.map(st => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>

        {/* Limpar */}
        <button
          onClick={handleClearFilters}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontFamily: 'inherit',
            background: 'transparent',
            border: '1px solid rgba(113,209,248,.25)',
            color: '#9db3d1',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#71d1f8'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9db3d1'; e.currentTarget.style.borderColor = 'rgba(113,209,248,.25)'; }}
        >
          <RotateCcw size={13} />
          Limpar
        </button>

        {/* Exportar CSV */}
        <button
          onClick={handleExportCSV}
          title="Exportar chamados filtrados para CSV"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontFamily: 'inherit',
            background: 'rgba(2, 132, 199, 0.18)',
            border: '1px solid rgba(2, 132, 199, 0.35)',
            color: '#71d1f8',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <Download size={13} />
          Exportar CSV
        </button>

        {/* Contador */}
        <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#9db3d1' }}>
          <b style={{ color: '#71d1f8', fontSize: '1rem', fontWeight: 800 }}>{formatNumber(totalCount)}</b> chamados filtrados
        </div>
      </div>

      {/* 6 KPIS EXECUTIVOS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.85rem'
      }}>
        {/* KPI 1: Ocorrências */}
        <div style={{
          position: 'relative',
          border: '1px solid rgba(113,209,248,.20)',
          borderRadius: '12px',
          padding: '0.85rem 1.1rem',
          background: 'linear-gradient(180deg, rgba(18,48,88,.75), rgba(11,30,59,.75))',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#71d1f8' }} />
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
            Ocorrências (chamados)
          </div>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#ffffff', marginTop: '4px' }}>
            {formatNumber(totalCount)}
          </div>
        </div>

        {/* KPI 2: Efetividade PCM */}
        <div style={{
          position: 'relative',
          border: '1px solid rgba(113,209,248,.20)',
          borderRadius: '12px',
          padding: '0.85rem 1.1rem',
          background: 'linear-gradient(180deg, rgba(18,48,88,.75), rgba(11,30,59,.75))',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: currentBand.color }} />
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
            Efetividade PCM
          </div>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '1.8rem', color: currentBand.color, marginTop: '4px' }}>
            {efetividadePct}<small style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9db3d1', marginLeft: '3px' }}>%</small>
          </div>
        </div>

        {/* KPI 3: Realizado e Aprovado */}
        <div style={{
          position: 'relative',
          border: '1px solid rgba(113,209,248,.20)',
          borderRadius: '12px',
          padding: '0.85rem 1.1rem',
          background: 'linear-gradient(180deg, rgba(18,48,88,.75), rgba(11,30,59,.75))',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#17FF1F' }} />
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
            Realizado e Aprovado
          </div>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#17FF1F', marginTop: '4px' }}>
            {formatNumber(aprovadosCount)}
          </div>
        </div>

        {/* KPI 4: Não Realizado e Pendente */}
        <div style={{
          position: 'relative',
          border: '1px solid rgba(113,209,248,.20)',
          borderRadius: '12px',
          padding: '0.85rem 1.1rem',
          background: 'linear-gradient(180deg, rgba(18,48,88,.75), rgba(11,30,59,.75))',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#FBFF0E' }} />
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
            Não Realizado e Pendente
          </div>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#FBFF0E', marginTop: '4px' }}>
            {formatNumber(pendentesCount)}
          </div>
        </div>

        {/* KPI 5: Chamados Vencidos */}
        <div style={{
          position: 'relative',
          border: '1px solid rgba(113,209,248,.20)',
          borderRadius: '12px',
          padding: '0.85rem 1.1rem',
          background: 'linear-gradient(180deg, rgba(18,48,88,.75), rgba(11,30,59,.75))',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#FF0000' }} />
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
            Chamados Vencidos
          </div>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#FF0000', marginTop: '4px' }}>
            {formatNumber(vencidosCount)}
          </div>
        </div>

        {/* KPI 6: À Vencer (≤ 7 dias) */}
        <div style={{
          position: 'relative',
          border: '1px solid rgba(113,209,248,.20)',
          borderRadius: '12px',
          padding: '0.85rem 1.1rem',
          background: 'linear-gradient(180deg, rgba(18,48,88,.75), rgba(11,30,59,.75))',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#ff9f1a' }} />
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
            À Vencer (≤ 7 dias)
          </div>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#ff9f1a', marginTop: '4px' }}>
            {formatNumber(aVencerCount)}
          </div>
        </div>
      </div>

      {/* CORPO PRINCIPAL COM CONTEÚDO CONDICIONAL */}
      {activeTabSubView === 'dashboard' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1fr) minmax(320px, 1.15fr) minmax(380px, 1.35fr)',
          gap: '1rem',
          minHeight: '620px'
        }}>
          
          {/* COLUNA 1: GAUGE EFETIVIDADE PCM & RANKING TIPOS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* PAINEL 1: GAUGE EFETIVIDADE PCM */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(16,40,78,.72), rgba(11,28,56,.72))',
              border: '1px solid rgba(113,209,248,.18)',
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h2 style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '0.86rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#71d1f8',
                margin: '0 0 1rem 0'
              }}>
                Efetividade PCM
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                {/* SVG Gauge */}
                <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                  <svg viewBox="0 0 120 120" width="100%" height="100%" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="60"
                      cy="60"
                      r={gaugeRadius}
                      fill="none"
                      stroke="rgba(255,255,255,.08)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={gaugeRadius}
                      fill="none"
                      stroke={currentBand.color}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={gaugeCircumference}
                      strokeDashoffset={gaugeOffset}
                      style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 800,
                      fontSize: '1.6rem',
                      lineHeight: 1,
                      color: currentBand.color
                    }}>
                      {(efetividadeRatio * 100).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#9db3d1', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '3px' }}>
                      Efetividade
                    </div>
                  </div>
                </div>

                {/* Resumo Estatístico */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(113,209,248,.15)', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9db3d1' }}>Atingido (aprov.+canc.)</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: '#ffffff' }}>
                      {atingidosCount} / {totalCount}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(113,209,248,.15)', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9db3d1' }}>Realizado e Aprovado</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: '#17FF1F' }}>
                      {formatNumber(aprovadosCount)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(113,209,248,.15)', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9db3d1' }}>Não Realiz. e Cancelado</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: '#7c8aa3' }}>
                      {formatNumber(canceladosCount)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9db3d1' }}>Finalizados no Sistema</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: '#71d1f8' }}>
                      {formatNumber(finalizadosCount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PAINEL 2: CHAMADOS POR TIPO */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(16,40,78,.72), rgba(11,28,56,.72))',
              border: '1px solid rgba(113,209,248,.18)',
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h2 style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '0.86rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#71d1f8',
                margin: '0 0 1rem 0',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Chamados por Tipo</span>
                <span style={{ fontSize: '0.72rem', color: '#9db3d1', fontWeight: 500, textTransform: 'none' }}>
                  Top 7 tipos
                </span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tallyTipos.map(([tipo, qtd]) => {
                  const isSelected = selectedTipo === tipo;
                  return (
                    <div
                      key={tipo}
                      onClick={() => setSelectedTipo(isSelected ? 'Todos' : tipo)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'rgba(113,209,248,.15)' : 'transparent',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(113,209,248,.06)'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{
                        width: '100px',
                        fontSize: '0.78rem',
                        color: isSelected ? '#ffffff' : '#eaf2fb',
                        fontWeight: isSelected ? 700 : 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }} title={tipo}>
                        {tipo}
                      </div>
                      <div style={{
                        flex: 1,
                        height: '12px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${(qtd / maxTipos) * 100}%`,
                          backgroundColor: TIPO_COLOR,
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                      <div style={{
                        width: '32px',
                        textAlign: 'right',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color: '#71d1f8'
                      }}>
                        {qtd}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* COLUNA 2: STATUS DA APROVAÇÃO & CRITICIDADE GUT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* PAINEL 3: STATUS DA APROVAÇÃO */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(16,40,78,.72), rgba(11,28,56,.72))',
              border: '1px solid rgba(113,209,248,.18)',
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h2 style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '0.86rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#71d1f8',
                margin: '0 0 1rem 0',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Status da Aprovação</span>
                <span style={{ fontSize: '0.72rem', color: '#9db3d1', fontWeight: 500, textTransform: 'none' }}>
                  Clique p/ filtrar
                </span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tallyStatus.map(([st, qtd]) => {
                  const isSelected = selectedStatus === st;
                  const color = STATUS_COLORS[st] || '#71d1f8';
                  return (
                    <div
                      key={st}
                      onClick={() => setSelectedStatus(isSelected ? 'Todos' : st)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'rgba(113,209,248,.15)' : 'transparent',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(113,209,248,.06)'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{
                        width: '135px',
                        fontSize: '0.76rem',
                        color: isSelected ? '#ffffff' : '#eaf2fb',
                        fontWeight: isSelected ? 700 : 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }} title={st}>
                        {st}
                      </div>
                      <div style={{
                        flex: 1,
                        height: '12px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${(qtd / maxStatus) * 100}%`,
                          backgroundColor: color,
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                      <div style={{
                        width: '32px',
                        textAlign: 'right',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color: color
                      }}>
                        {qtd}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PAINEL 4: CHAMADOS POR CRITICIDADE GUT */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(16,40,78,.72), rgba(11,28,56,.72))',
              border: '1px solid rgba(113,209,248,.18)',
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h2 style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '0.86rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#71d1f8',
                margin: '0 0 0.85rem 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}>
                <span>Chamados por Criticidade</span>
                <span style={{ fontSize: '0.72rem', color: '#9db3d1', fontWeight: 500, textTransform: 'none' }}>
                  classes GUT · prazos
                </span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
                {tallyCriticidade.map(([crit, qtd]) => {
                  const label = getCritLabel(crit);
                  const color = getCritColor(crit);
                  return (
                    <div
                      key={crit}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '2px 4px'
                      }}
                    >
                      <div style={{
                        width: '105px',
                        fontSize: '0.74rem',
                        color: '#eaf2fb',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }} title={label}>
                        {label}
                      </div>
                      <div style={{
                        flex: 1,
                        height: '11px',
                        borderRadius: '3px',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${(qtd / maxCrit) * 100}%`,
                          backgroundColor: color,
                          borderRadius: '3px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                      <div style={{
                        width: '28px',
                        textAlign: 'right',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        color: color
                      }}>
                        {qtd}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legenda GUT */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(113,209,248,.15)',
                flexWrap: 'wrap'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#9db3d1' }}>
                  <i style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ff4b4b', display: 'inline-block' }} />
                  A · Alto
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#9db3d1' }}>
                  <i style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ff9f1a', display: 'inline-block' }} />
                  M · Médio
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#9db3d1' }}>
                  <i style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#33d17a', display: 'inline-block' }} />
                  B · Baixo
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#9db3d1' }}>
                  <i style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#71d1f8', display: 'inline-block' }} />
                  R · Rotina
                </span>
              </div>
            </div>

          </div>

          {/* COLUNA 3: MAPA LEAFLET DE PONTOS DE ANOMALIA */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(16,40,78,.72), rgba(11,28,56,.72))',
            border: '1px solid rgba(113,209,248,.18)',
            borderRadius: '14px',
            padding: '1.1rem 1.25rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '580px'
          }}>
            <h2 style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: '0.86rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#71d1f8',
              margin: '0 0 0.85rem 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} />
                Pontos de Anomalia
              </span>
              <span style={{ fontSize: '0.74rem', color: '#9db3d1', fontWeight: 500, textTransform: 'none' }}>
                {georefTickets.length} georreferenciados
              </span>
            </h2>

            {/* Container do Mapa */}
            <div 
              ref={mapContainerRef} 
              style={{
                flex: 1,
                width: '100%',
                borderRadius: '10px',
                border: '1px solid rgba(113,209,248,.25)',
                overflow: 'hidden',
                minHeight: '440px',
                backgroundColor: '#0e2244'
              }} 
            />

            {/* Legenda do Mapa */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '10px',
              flexWrap: 'wrap',
              fontSize: '0.72rem',
              color: '#9db3d1'
            }}>
              {CONTROLE_CHAMADOS_DATA.statuses.map(st => (
                <span key={st} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <i style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: STATUS_COLORS[st] || '#71d1f8',
                    display: 'inline-block',
                    border: '1px solid rgba(255,255,255,0.7)'
                  }} />
                  {st.replace('Não Realizado e ', '').replace('Realizado e ', '')}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUBVIEW TABELA: LISTA DETALHADA DE CHAMADOS */}
      {activeTabSubView === 'tabela' && (
        <div style={{
          background: 'linear-gradient(180deg, rgba(16,40,78,.75), rgba(11,28,56,.80))',
          border: '1px solid rgba(113,209,248,.20)',
          borderRadius: '14px',
          padding: '1.25rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}>
          {/* Header da Tabela com Busca */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#ffffff',
                margin: 0
              }}>
                Base Detalhada de Chamados Geotécnicos
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#9db3d1', margin: '3px 0 0 0' }}>
                Exibindo {tableDisplayTickets.length} registros de {filteredTickets.length} filtrados ({CONTROLE_CHAMADOS_DATA.tickets.length} total)
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9db3d1' }} />
                <input
                  type="text"
                  placeholder="Buscar protocolo, estrutura, criticidade..."
                  value={searchTableQuery}
                  onChange={e => setSearchTableQuery(e.target.value)}
                  style={{
                    padding: '7px 12px 7px 32px',
                    backgroundColor: 'rgba(14, 34, 68, 0.9)',
                    border: '1px solid rgba(113,209,248,0.25)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    width: '280px',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                onClick={handleExportCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  backgroundColor: 'rgba(2, 132, 199, 0.25)',
                  border: '1px solid rgba(2, 132, 199, 0.4)',
                  borderRadius: '8px',
                  color: '#71d1f8',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Download size={14} />
                Exportar
              </button>
            </div>
          </div>

          {/* Tabela de Registros */}
          <div style={{ overflowX: 'auto', maxHeight: '550px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderBottom: '1px solid rgba(113,209,248,0.2)',
                  color: '#71d1f8',
                  textTransform: 'uppercase',
                  fontSize: '0.72rem',
                  letterSpacing: '0.06em'
                }}>
                  <th style={{ padding: '10px 12px' }}>Protocolo</th>
                  <th style={{ padding: '10px 12px' }}>Estrutura</th>
                  <th style={{ padding: '10px 12px' }}>Tipo</th>
                  <th style={{ padding: '10px 12px' }}>Criticidade</th>
                  <th style={{ padding: '10px 12px' }}>Status Aprovação</th>
                  <th style={{ padding: '10px 12px' }}>Etapa no Fluig</th>
                  <th style={{ padding: '10px 12px' }}>Mês/Ano</th>
                  <th style={{ padding: '10px 12px' }}>Abertura</th>
                  <th style={{ padding: '10px 12px' }}>Data Limite</th>
                  <th style={{ padding: '10px 12px' }}>Coordenadas</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {tableDisplayTickets.map((t, idx) => {
                  const stColor = STATUS_COLORS[t.status] || '#71d1f8';
                  const critColor = getCritColor(t.crit);
                  return (
                    <tr 
                      key={t.proto || idx}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(113,209,248,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}
                    >
                      <td style={{ padding: '9px 12px', fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: '#0284c7' }}>
                        #{t.proto}
                      </td>
                      <td style={{ padding: '9px 12px', fontWeight: 600, color: '#eaf2fb' }}>
                        {t.estr}
                      </td>
                      <td style={{ padding: '9px 12px', color: '#9db3d1' }}>
                        {t.tipo}
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          backgroundColor: `${critColor}22`,
                          color: critColor,
                          border: `1px solid ${critColor}44`
                        }}>
                          {t.crit}
                        </span>
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: stColor,
                          fontWeight: 600
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: stColor }} />
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '9px 12px', color: '#cbd5e1' }}>
                        {t.statusCh || '—'}
                      </td>
                      <td style={{ padding: '9px 12px', color: '#9db3d1' }}>
                        {formatMesLabel(t.mesano)}
                      </td>
                      <td style={{ padding: '9px 12px', color: '#9db3d1' }}>
                        {t.abertura ? t.abertura.split('-').reverse().join('/') : '—'}
                      </td>
                      <td style={{ padding: '9px 12px', color: t.limite && getDaysTo(t.limite) < 0 ? '#ff4b4b' : '#9db3d1' }}>
                        {t.limite ? t.limite.split('-').reverse().join('/') : '—'}
                      </td>
                      <td style={{ padding: '9px 12px', fontSize: '0.74rem', color: '#64748b' }}>
                        {t.lat && t.lon ? `${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}` : 'Não georreferenciado'}
                      </td>
                      <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedTicketDetail(t)}
                          title="Ver detalhes do chamado"
                          style={{
                            padding: '4px 8px',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '6px',
                            color: '#71d1f8',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem'
                          }}
                        >
                          <Eye size={12} />
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBVIEW CRONOGRAMA PCM: AÇÕES DO CRONOGRAMA */}
      {activeTabSubView === 'cronograma' && (
        <div style={{
          background: 'linear-gradient(180deg, rgba(16,40,78,.75), rgba(11,28,56,.80))',
          border: '1px solid rgba(113,209,248,.20)',
          borderRadius: '14px',
          padding: '1.25rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#ffffff',
                margin: 0
              }}>
                Cronograma PCM de Geotecnia & Manutenção
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#9db3d1', margin: '3px 0 0 0' }}>
                {CONTROLE_CHAMADOS_DATA.cronogramaPCM?.length || 0} ações de inspeção e instrumentação programadas no complexo
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '550px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderBottom: '1px solid rgba(113,209,248,0.2)',
                  color: '#71d1f8',
                  textTransform: 'uppercase',
                  fontSize: '0.72rem',
                  letterSpacing: '0.06em'
                }}>
                  <th style={{ padding: '10px 12px' }}>ID</th>
                  <th style={{ padding: '10px 12px' }}>Estrutura</th>
                  <th style={{ padding: '10px 12px' }}>Ação de Manutenção</th>
                  <th style={{ padding: '10px 12px' }}>Mês / Dia</th>
                  <th style={{ padding: '10px 12px' }}>Data Planejada</th>
                  <th style={{ padding: '10px 12px' }}>Data Realizada</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>Desvio / Justificativa</th>
                </tr>
              </thead>
              <tbody>
                {(CONTROLE_CHAMADOS_DATA.cronogramaPCM || []).slice(0, 150).map((pcm, idx) => {
                  const isDone = (pcm.status || '').toLowerCase().includes('conclu');
                  const isLate = (pcm.status || '').toLowerCase().includes('atraso');
                  return (
                    <tr 
                      key={pcm.id || idx}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'
                      }}
                    >
                      <td style={{ padding: '8px 12px', color: '#71d1f8', fontWeight: 700 }}>#{pcm.id}</td>
                      <td style={{ padding: '8px 12px', color: '#ffffff', fontWeight: 600 }}>{pcm.estrutura}</td>
                      <td style={{ padding: '8px 12px', color: '#cbd5e1' }}>{pcm.acao}</td>
                      <td style={{ padding: '8px 12px', color: '#9db3d1' }}>{pcm.mes} {pcm.dia ? `· dia ${pcm.dia}` : ''}</td>
                      <td style={{ padding: '8px 12px', color: '#9db3d1' }}>{pcm.dataPlanejada || '—'}</td>
                      <td style={{ padding: '8px 12px', color: '#9db3d1' }}>{pcm.dataRealizada || '—'}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: isDone ? 'rgba(23,255,31,0.15)' : isLate ? 'rgba(255,75,75,0.15)' : 'rgba(255,255,255,0.1)',
                          color: isDone ? '#17FF1F' : isLate ? '#ff4b4b' : '#cbd5e1',
                          border: `1px solid ${isDone ? '#17FF1F44' : isLate ? '#ff4b4b44' : 'rgba(255,255,255,0.2)'}`
                        }}>
                          {pcm.status || 'Pendente'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#94a3b8', fontSize: '0.75rem' }}>
                        {pcm.desvio || pcm.justificativa || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RODAPÉ DO PAINEL EXECUTIVO */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        color: '#9db3d1',
        padding: '0.5rem 0.5rem',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        <div>
          Fonte: <b style={{ color: '#ffffff' }}>Controle_de_Chamados.pbix</b> · Gestão Geral
        </div>
        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
          <span><b style={{ color: '#FBFF0E' }}>{emAbertoCount}</b> em aberto · <b style={{ color: '#FF0000' }}>{vencidosCount}</b> vencidos</span>
          <span>Atualizado em {new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      {/* MODAL DETALHES DO TICKET */}
      {selectedTicketDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(180deg, #10284e, #0b1c38)',
            border: '1px solid rgba(113,209,248,0.3)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(113,209,248,0.2)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LifeBuoy size={20} color="#71d1f8" />
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.1rem', fontWeight: 800 }}>
                  Chamado #{selectedTicketDetail.proto}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicketDetail(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9db3d1',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: '#9db3d1', fontSize: '0.74rem', textTransform: 'uppercase' }}>Estrutura</div>
                <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>{selectedTicketDetail.estr || '—'}</div>
              </div>
              <div>
                <div style={{ color: '#9db3d1', fontSize: '0.74rem', textTransform: 'uppercase' }}>Tipo da Ocorrência</div>
                <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>{selectedTicketDetail.tipo || '—'}</div>
              </div>
              <div>
                <div style={{ color: '#9db3d1', fontSize: '0.74rem', textTransform: 'uppercase' }}>Criticidade GUT</div>
                <div style={{ color: getCritColor(selectedTicketDetail.crit), fontWeight: 700, marginTop: '2px' }}>
                  {getCritLabel(selectedTicketDetail.crit)}
                </div>
              </div>
              <div>
                <div style={{ color: '#9db3d1', fontSize: '0.74rem', textTransform: 'uppercase' }}>Status da Aprovação</div>
                <div style={{ color: STATUS_COLORS[selectedTicketDetail.status] || '#71d1f8', fontWeight: 700, marginTop: '2px' }}>
                  {selectedTicketDetail.status}
                </div>
              </div>
              <div>
                <div style={{ color: '#9db3d1', fontSize: '0.74rem', textTransform: 'uppercase' }}>Etapa no Fluig</div>
                <div style={{ color: '#ffffff', marginTop: '2px' }}>{selectedTicketDetail.statusCh || '—'}</div>
              </div>
              <div>
                <div style={{ color: '#9db3d1', fontSize: '0.74rem', textTransform: 'uppercase' }}>Mês de Abertura</div>
                <div style={{ color: '#ffffff', marginTop: '2px' }}>{formatMesLabel(selectedTicketDetail.mesano)}</div>
              </div>
              <div>
                <div style={{ color: '#9db3d1', fontSize: '0.74rem', textTransform: 'uppercase' }}>Data de Abertura</div>
                <div style={{ color: '#ffffff', marginTop: '2px' }}>
                  {selectedTicketDetail.abertura ? selectedTicketDetail.abertura.split('-').reverse().join('/') : '—'}
                </div>
              </div>
              <div>
                <div style={{ color: '#9db3d1', fontSize: '0.74rem', textTransform: 'uppercase' }}>Data Limite / SLA</div>
                <div style={{ color: selectedTicketDetail.limite && getDaysTo(selectedTicketDetail.limite) < 0 ? '#ff4b4b' : '#ffffff', fontWeight: 700, marginTop: '2px' }}>
                  {selectedTicketDetail.limite ? selectedTicketDetail.limite.split('-').reverse().join('/') : '—'}
                </div>
              </div>
              {selectedTicketDetail.lat && selectedTicketDetail.lon && (
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ color: '#9db3d1', fontSize: '0.74rem', textTransform: 'uppercase' }}>Coordenadas Geográficas</div>
                  <div style={{ color: '#71d1f8', fontFamily: 'monospace', marginTop: '2px' }}>
                    LAT: {selectedTicketDetail.lat.toFixed(6)} | LON: {selectedTicketDetail.lon.toFixed(6)}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
              <button
                onClick={() => setSelectedTicketDetail(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
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

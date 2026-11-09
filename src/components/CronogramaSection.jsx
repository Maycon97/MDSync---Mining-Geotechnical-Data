import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from '../utils/leafletCompat';
import {
  CRONOGRAMA_ITEMS,
  ESTRUTURAS_COORDENADAS,
  STATUS_CONFIG,
  P_DATA,
  STATUS_ORDER_P,
  STATUS_COLORS_P,
  MONTH_LABELS_PT,
  MESES_ORDENADOS,
  getCronogramaStatusBadge
} from '../data/cronogramaData';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Search,
  RotateCcw,
  Download,
  ChevronRight,
  Eye,
  MapPin,
  Building2,
  Layers,
  AlertCircle,
  FileSpreadsheet,
  X,
  Activity,
  Check,
  ChevronLeft,
  ChevronDown,
  PieChart,
  Target,
  BarChart2,
  TrendingUp,
  Maximize2
} from 'lucide-react';

export const CronogramaSection = ({ onNavigateTab }) => {
  // Abas principais: 'op' (Operacional / Calendário), 'ind' (Indicadores Estratégicos), 'tab' (Tabela Analítica)
  const [activeTab, setActiveTab] = useState('op');

  // Filtros Globais
  const [selectedAno, setSelectedAno] = useState('Todos');
  const [selectedMes, setSelectedMes] = useState('Todos');
  const [selectedEstrutura, setSelectedEstrutura] = useState('Todas');
  const [selectedCiclo, setSelectedCiclo] = useState('Todos'); // 'Todos' | '1' | '2'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Todos');
  const [selectedDesvioFilter, setSelectedDesvioFilter] = useState('Todos');

  // Estado do mês em exibição no calendário (YYYY-MM)
  // Define o mês inicial baseado no dataset executivo
  const defaultYM = useMemo(() => {
    const today = new Date();
    const curYM = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const meses = (P_DATA?.meses || []).slice().sort();
    if (meses.includes(curYM)) return curYM;
    const before = meses.filter(m => m <= curYM);
    return before.length ? before[before.length - 1] : (meses[meses.length - 1] || '2026-08');
  }, []);

  const [calYM, setCalYM] = useState(defaultYM);

  // Paginação da tabela analítica
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Modal de detalhes de item
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);
  // Modal de tarefas do dia no calendário
  const [selectedDayTasks, setSelectedDayTasks] = useState(null); // { date: 'YYYY-MM-DD', tasks: [] }

  // Refs para Leaflet Map
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerLayerRef = useRef(null);

  // Hoje normalizado
  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const parseDate = (s) => (s ? new Date(s + 'T00:00:00') : null);

  // Filtragem dos itens com base nos filtros da barra
  const filteredActs = useMemo(() => {
    return (P_DATA?.acts || CRONOGRAMA_ITEMS).filter(x => {
      const matchAno = selectedAno === 'Todos' || (x.mesano && x.mesano.slice(0, 4) === selectedAno);
      const matchMes = selectedMes === 'Todos' || (x.mesano && x.mesano.slice(5, 7) === selectedMes);
      const matchEstr = selectedEstrutura === 'Todas' || x.estr === selectedEstrutura || x.estrutura === selectedEstrutura;
      const matchCiclo = selectedCiclo === 'Todos' || String(x.ciclo) === selectedCiclo;
      const matchStatus = selectedStatusFilter === 'Todos' || x.status === selectedStatusFilter;
      const matchDesvio = selectedDesvioFilter === 'Todos' || (selectedDesvioFilter === 'COM_DESVIO' ? !!x.desvio : x.desvio === selectedDesvioFilter);
      
      let matchSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchSearch =
          (x.acao && x.acao.toLowerCase().includes(q)) ||
          (x.estr && x.estr.toLowerCase().includes(q)) ||
          (x.estrutura && x.estrutura.toLowerCase().includes(q)) ||
          (x.status && x.status.toLowerCase().includes(q)) ||
          (x.desvio && x.desvio.toLowerCase().includes(q)) ||
          (x.justificativa && x.justificativa.toLowerCase().includes(q)) ||
          (x.plan && x.plan.toLowerCase().includes(q));
      }

      return matchAno && matchMes && matchEstr && matchCiclo && matchStatus && matchDesvio && matchSearch;
    });
  }, [selectedAno, selectedMes, selectedEstrutura, selectedCiclo, selectedStatusFilter, selectedDesvioFilter, searchQuery]);

  // Lista de anos, meses e estruturas para os selects
  const anosList = useMemo(() => P_DATA?.anos || ['2025', '2026'], []);
  const estruturasList = useMemo(() => P_DATA?.estruturas || ['TODAS', 'B1', 'B4', 'PDE1'], []);

  // Lista de desvios distintos
  const desviosList = useMemo(() => {
    const set = new Set();
    CRONOGRAMA_ITEMS.forEach(i => {
      if (i.desvio) set.add(i.desvio);
    });
    return Array.from(set).sort();
  }, []);

  // KPIs Estratégicos (Aba Indicadores)
  const indStats = useMemo(() => {
    const rows = filteredActs;
    const plate = rows.filter(x => x.plan && parseDate(x.plan) <= todayDate);
    const efet = plate.filter(x => x.status === 'Concluído' || x.status === 'Realizado com Atraso');
    const noprazo = plate.filter(x => x.status === 'Concluído');
    const atraso = rows.filter(x => x.plan && parseDate(x.plan) < todayDate && !(x.status === 'Concluído' || x.status === 'Realizado com Atraso'));
    const fut = rows.filter(x => x.status === 'Ações futuras');
    const reprog = rows.filter(x => x.status === 'Reprogramada');
    const comAtraso = rows.filter(x => x.status === 'Realizado com Atraso');

    const ef = plate.length ? efet.length / plate.length : 0;
    const np = plate.length ? noprazo.length / plate.length : 0;

    const target = P_DATA?.meta || 0.75;
    const band = ef >= target
      ? { c: '#33d17a', t: 'ATINGIU', label: 'Adequado' }
      : ef >= 0.60
      ? { c: '#ffc21a', t: 'ABAIXO DA META', label: 'Atenção' }
      : { c: '#ff4b4b', t: 'ABAIXO DA META', label: 'Crítico' };

    return {
      total: rows.length,
      plateCount: plate.length,
      efetCount: efet.length,
      noprazoCount: noprazo.length,
      atrasoCount: atraso.length,
      futCount: fut.length,
      reprogCount: reprog.length,
      comAtrasoCount: comAtraso.length,
      efetividade: ef,
      aderenciaNoPrazo: np,
      band,
      target
    };
  }, [filteredActs, todayDate]);

  // KPIs Operacionais do Mês (Aba Operacional)
  const opStats = useMemo(() => {
    const acts = (P_DATA?.acts || CRONOGRAMA_ITEMS).filter(x => {
      const matchYM = x.mesano === calYM;
      const matchEstr = selectedEstrutura === 'Todas' || x.estr === selectedEstrutura || x.estrutura === selectedEstrutura;
      const matchCiclo = selectedCiclo === 'Todos' || String(x.ciclo) === selectedCiclo;
      return matchYM && matchEstr && matchCiclo;
    });

    const concl = acts.filter(x => x.status === 'Concluído').length;
    const atr = acts.filter(x => x.plan && parseDate(x.plan) < todayDate && !(x.status === 'Concluído' || x.status === 'Realizado com Atraso')).length;
    const fut = acts.filter(x => x.status === 'Ações futuras').length;

    return {
      totalMes: acts.length,
      concluidas: concl,
      emAtraso: atr,
      futuras: fut,
      actsList: acts
    };
  }, [calYM, selectedEstrutura, selectedCiclo, todayDate]);

  // Cálculos do Calendário Mensal
  const calendarGridData = useMemo(() => {
    const [yStr, mStr] = calYM.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);

    const firstDayIndex = new Date(y, m - 1, 1).getDay(); // 0 = Dom, 6 = Sáb
    const daysInMonth = new Date(y, m, 0).getDate();
    const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

    // Agrupar tarefas do mês por dia do mês (1..31)
    const byDay = {};
    opStats.actsList.forEach(x => {
      if (x.plan && x.plan.length >= 10) {
        const d = parseInt(x.plan.slice(8, 10), 10);
        if (!byDay[d]) byDay[d] = [];
        byDay[d].push(x);
      }
    });

    const tY = todayDate.getFullYear();
    const tM = todayDate.getMonth() + 1;
    const tD = todayDate.getDate();

    const cells = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - firstDayIndex + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        cells.push({ out: true, day: null, tasks: [] });
      } else {
        const isToday = y === tY && m === tM && dayNum === tD;
        const tasks = (byDay[dayNum] || []).slice().sort((a, b) => {
          const ia = STATUS_ORDER_P.indexOf(a.status);
          const ib = STATUS_ORDER_P.indexOf(b.status);
          return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
        });
        const dateStr = `${yStr}-${mStr}-${String(dayNum).padStart(2, '0')}`;
        cells.push({ out: false, day: dayNum, dateStr, isToday, tasks });
      }
    }

    const monthName = MONTH_LABELS_PT[m - 1] || '';
    return {
      cells,
      year: y,
      month: m,
      monthLabel: `${monthName} ${y}`.toUpperCase(),
      monthLongLabel: `${MESES_ORDENADOS[m - 1] || monthName} de ${y}`
    };
  }, [calYM, opStats.actsList, todayDate]);

  // Navegação do Mês (Avançar / Retroceder)
  const stepMonth = (delta) => {
    let y = parseInt(calYM.slice(0, 4), 10);
    let mo = parseInt(calYM.slice(5, 7), 10) - 1;
    let idx = y * 12 + mo + delta;
    y = Math.floor(idx / 12);
    mo = (idx % 12) + 1;
    const nextYM = `${y}-${String(mo).padStart(2, '0')}`;
    setCalYM(nextYM);
    // Sincroniza selects se ambos estiverem definidos
    if (selectedAno !== 'Todos') setSelectedAno(String(y));
    if (selectedMes !== 'Todos') setSelectedMes(String(mo).padStart(2, '0'));
  };

  // Limpeza de filtros
  const handleClearFilters = () => {
    setSelectedAno('Todos');
    setSelectedMes('Todos');
    setSelectedEstrutura('Todas');
    setSelectedCiclo('Todos');
    setSearchQuery('');
    setSelectedStatusFilter('Todos');
    setSelectedDesvioFilter('Todos');
    setCalYM(defaultYM);
    setCurrentPage(1);
  };

  // Ranking de Status para a Aba Indicadores
  const statusRanking = useMemo(() => {
    const tally = {};
    filteredActs.forEach(r => {
      const s = r.status || 'N/D';
      tally[s] = (tally[s] || 0) + 1;
    });
    return STATUS_ORDER_P.map(st => [st, tally[st] || 0]).filter(entry => entry[1] > 0);
  }, [filteredActs]);

  // Ranking de Desvios para a Aba Indicadores
  const desvioRanking = useMemo(() => {
    const tally = {};
    filteredActs.forEach(r => {
      if (r.desvio) {
        tally[r.desvio] = (tally[r.desvio] || 0) + 1;
      }
    });
    return Object.entries(tally).sort((a, b) => b[1] - a[1]);
  }, [filteredActs]);

  // Ranking de Estruturas para a Aba Indicadores (Top 8)
  const estruturaRanking = useMemo(() => {
    const tally = {};
    filteredActs.forEach(r => {
      const e = r.estr || r.estrutura || 'OUTRAS';
      tally[e] = (tally[e] || 0) + 1;
    });
    return Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [filteredActs]);

  // Inicialização e atualização do Leaflet Map (Aba Indicadores)
  useEffect(() => {
    if (activeTab !== 'ind') return;
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false,
        center: [-20.091, -44.110],
        zoom: 14
      });

      // Satélite Esri World Imagery
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      }).addTo(map);

      // Boundaries & Labels overlay
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
      }, 200);
    }

    // Desenhar marcadores das estruturas georreferenciadas
    if (markerLayerRef.current && mapInstanceRef.current) {
      markerLayerRef.current.clearLayers();

      const coordsMap = P_DATA?.coords || ESTRUTURAS_COORDENADAS || {};
      const byEstr = {};

      filteredActs.forEach(x => {
        const ek = x.ek || (x.estr || x.estrutura || '').trim().toUpperCase();
        if (!coordsMap[ek]) return;
        if (!byEstr[ek]) {
          byEstr[ek] = { n: 0, plate: 0, efet: 0, estr: x.estr || x.estrutura };
        }
        byEstr[ek].n++;
        if (x.plan && parseDate(x.plan) <= todayDate) {
          byEstr[ek].plate++;
          if (x.status === 'Concluído' || x.status === 'Realizado com Atraso') {
            byEstr[ek].efet++;
          }
        }
      });

      const counts = Object.values(byEstr).map(o => o.n);
      const mx = Math.max(1, ...counts);
      const bounds = [];

      Object.entries(byEstr).forEach(([ek, o]) => {
        const c = coordsMap[ek];
        if (!c) return;
        const lat = Array.isArray(c) ? c[0] : c.lat;
        const lon = Array.isArray(c) ? c[1] : c.lon;
        if (lat === undefined || lon === undefined) return;

        bounds.push([lat, lon]);
        const ef = o.plate ? o.efet / o.plate : 1;
        const target = P_DATA?.meta || 0.75;
        const col = ef >= target ? '#33d17a' : ef >= 0.60 ? '#ffc21a' : '#ff4b4b';
        const rad = 6 + Math.sqrt(o.n / mx) * 14;

        const circle = L.circleMarker([lat, lon], {
          radius: rad,
          color: '#ffffff',
          weight: 1.5,
          fillColor: col,
          fillOpacity: 0.85
        });

        const efText = o.plate
          ? (ef * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
          : '—';

        circle.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.45; min-width: 170px;">
            <div style="font-weight: 800; font-size: 13px; color: #0284c7; margin-bottom: 4px; text-transform: uppercase;">
              ${o.estr}
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #64748b;">Atividades:</span>
              <strong style="color: #0f172a;">${o.n.toLocaleString('pt-BR')}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #64748b;">Planejado até hoje:</span>
              <strong style="color: #0f172a;">${o.plate.toLocaleString('pt-BR')}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 4px;">
              <span style="color: #64748b;">Efetividade PCM:</span>
              <strong style="color: ${col}; font-weight: 800;">${efText}</strong>
            </div>
          </div>
        `);

        circle.addTo(markerLayerRef.current);
      });

      if (bounds.length > 0) {
        try {
          mapInstanceRef.current.fitBounds(L.latLngBounds(bounds).pad(0.18));
        } catch (e) {
          // ignore fitBounds if container not sized yet
        }
      }
    }
  }, [activeTab, filteredActs, todayDate]);

  // Exportação CSV formatada no padrão oficial regulatório ANM / PCM (delimitador ;)
  const handleExportCSV = () => {
    const headers = [
      'ID Atividade',
      'Estrutura Geotécnica',
      'Mês Planejado',
      'Dia do Cronograma',
      'Data Planejada',
      'Ação / Atividade Geotécnica',
      'Ciclo Operacional',
      'Data Realizada',
      'Desvio / Causa de Atraso',
      'Status Operacional',
      'Justificativa Técnica',
      'Latitude SIRGAS 2000',
      'Longitude SIRGAS 2000'
    ];

    const cleanField = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

    const rows = filteredActs.map(item => [
      cleanField(item.id),
      cleanField(item.estr || item.estrutura),
      cleanField(item.mes),
      cleanField(item.dia),
      cleanField(item.plan || item.dataPlanejada),
      cleanField(item.acao),
      cleanField(item.ciclo),
      cleanField(item.dataRealizada),
      cleanField(item.desvio),
      cleanField(item.status),
      cleanField(item.justificativa),
      cleanField(item.lat),
      cleanField(item.lon)
    ]);

    const metadataLines = [
      '# ====================================================================================================',
      '# CRONOGRAMA EXECUTIVO E CONTROLE DE ATIVIDADES GEOTÉCNICAS - PCM ITAMINAS (PADRÃO ANM / PNSB)',
      '# ====================================================================================================',
      '# EMPREENDEDOR;ITAMINAS COMÉRCIO DE MINÉRIOS S.A.',
      '# COMPLEXO MINERÁRIO;COMPLEXO JANGADA / ENGENHO SECO - SARZEDO/IBIRITÉ - MG',
      '# ÓRGÃO FISCALIZADOR ALVO;AGÊNCIA NACIONAL DE MINERAÇÃO (ANM) / FEAM / MPMG',
      `# COMPETÊNCIA / MÊS;${calYM}`,
      `# DATA DE EMISSÃO;${new Date().toLocaleDateString('pt-BR')}`,
      `# TOTAL DE ATIVIDADES;${filteredActs.length} registros`,
      '# ====================================================================================================',
      ''
    ];

    const csvContent = '\uFEFF' + metadataLines.join('\n') + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Painel_Executivo_Cronograma_PCM_Itaminas_${calYM}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Paginação de tabela analítica
  const totalPages = Math.ceil(filteredActs.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredActs.slice(start, start + pageSize);
  }, [filteredActs, currentPage, pageSize]);

  return (
    <div
      id="cronograma-section"
      className="card-panel"
      style={{
        background: 'linear-gradient(160deg, #0a1a33 0%, #0b1e3b 45%, #0a1830 100%)',
        border: '1px solid rgba(113, 209, 248, 0.22)',
        borderRadius: '16px',
        padding: '24px',
        color: '#eaf2fb',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '28px'
      }}
    >
      {/* 1. CABEÇALHO DO PAINEL EXECUTIVO */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '14px 20px',
          background: 'linear-gradient(180deg, rgba(16, 40, 78, 0.72), rgba(11, 28, 56, 0.72))',
          border: '1px solid rgba(113, 209, 248, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          marginBottom: '18px'
        }}
      >
        {/* Marca & Título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '280px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Calendar size={22} color="#ffffff" />
          </div>
          <div style={{ width: '1px', height: '36px', background: 'rgba(113, 209, 248, 0.2)' }} />
          <div>
            <h1
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                fontSize: '18px',
                margin: 0,
                lineHeight: 1.2,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                color: '#ffffff'
              }}
            >
              Painel Executivo · Gerência de Geotecnia · Cronograma PCM
            </h1>
            <div
              style={{
                fontSize: '12px',
                color: '#9db3d1',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Cronograma Geotécnico &amp; PCM</span>
              <span style={{ color: 'rgba(113, 209, 248, 0.4)' }}>•</span>
              <span style={{ color: '#71d1f8', fontWeight: 600 }}>Espelho Fiel Excel (1.693 Tarefas)</span>
            </div>
          </div>
        </div>

        {/* Alternador de Abas */}
        <div
          style={{
            display: 'inline-flex',
            border: '1px solid rgba(113, 209, 248, 0.25)',
            borderRadius: '10px',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.04)'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('op')}
            style={{
              fontFamily: "'Montserrat', sans-serif",
              border: 'none',
              background: activeTab === 'op' ? '#027bff' : 'transparent',
              color: activeTab === 'op' ? '#ffffff' : '#9db3d1',
              fontSize: '13px',
              fontWeight: 700,
              padding: '10px 18px',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Calendar size={15} />
            Operacional
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ind')}
            style={{
              fontFamily: "'Montserrat', sans-serif",
              border: 'none',
              borderLeft: '1px solid rgba(113, 209, 248, 0.25)',
              background: activeTab === 'ind' ? '#027bff' : 'transparent',
              color: activeTab === 'ind' ? '#ffffff' : '#9db3d1',
              fontSize: '13px',
              fontWeight: 700,
              padding: '10px 18px',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BarChart2 size={15} />
            Indicadores estratégicos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tab')}
            style={{
              fontFamily: "'Montserrat', sans-serif",
              border: 'none',
              borderLeft: '1px solid rgba(113, 209, 248, 0.25)',
              background: activeTab === 'tab' ? '#027bff' : 'transparent',
              color: activeTab === 'tab' ? '#ffffff' : '#9db3d1',
              fontSize: '13px',
              fontWeight: 700,
              padding: '10px 18px',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileSpreadsheet size={15} />
            Tabela Analítica
          </button>
        </div>

        {/* Badge Dinâmico de Efetividade / Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '12px', color: '#9db3d1', textAlign: 'right', lineHeight: 1.35 }}>
            <span>{activeTab === 'op' ? 'Mês em exibição' : 'Efetividade · meta 75%'}</span>
            <br />
            <b style={{ color: activeTab === 'op' ? '#71d1f8' : indStats.band.c, fontSize: '13px' }}>
              {activeTab === 'op'
                ? `${opStats.totalMes} atividades`
                : (indStats.plateCount ? `${(indStats.efetividade * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% de efetividade` : 'Sem base até hoje')}
            </b>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 14px',
              borderRadius: '99px',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: '12px',
              letterSpacing: '0.04em',
              border: `1px solid ${activeTab === 'op' ? '#3aa0ff' : indStats.band.c}`,
              background: activeTab === 'op' ? 'rgba(58, 160, 255, 0.12)' : 'rgba(51, 209, 122, 0.12)',
              color: activeTab === 'op' ? '#8fd0ff' : indStats.band.c
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: activeTab === 'op' ? '#3aa0ff' : indStats.band.c
              }}
            />
            <span>{activeTab === 'op' ? calendarGridData.monthLabel : indStats.band.t}</span>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS EXECUTIVA */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(113, 209, 248, 0.15)',
          borderRadius: '10px',
          marginBottom: '16px'
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#71d1f8',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 700
          }}
        >
          <Filter size={14} /> Filtros:
        </span>

        {/* Ano */}
        <select
          value={selectedAno}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedAno(val);
            if (val !== 'Todos' && selectedMes !== 'Todos') {
              setCalYM(`${val}-${selectedMes}`);
            }
          }}
          style={{
            background: 'rgba(16, 40, 78, 0.85)',
            color: '#eaf2fb',
            border: '1px solid rgba(113, 209, 248, 0.25)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          <option value="Todos">Todos os anos</option>
          {anosList.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {/* Mês */}
        <select
          value={selectedMes}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedMes(val);
            if (selectedAno !== 'Todos' && val !== 'Todos') {
              setCalYM(`${selectedAno}-${val}`);
            }
          }}
          style={{
            background: 'rgba(16, 40, 78, 0.85)',
            color: '#eaf2fb',
            border: '1px solid rgba(113, 209, 248, 0.25)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          <option value="Todos">Todos os meses</option>
          {MONTH_LABELS_PT.map((m, idx) => {
            const num = String(idx + 1).padStart(2, '0');
            return <option key={num} value={num}>{m}</option>;
          })}
        </select>

        {/* Estrutura */}
        <select
          value={selectedEstrutura}
          onChange={(e) => setSelectedEstrutura(e.target.value)}
          style={{
            background: 'rgba(16, 40, 78, 0.85)',
            color: '#eaf2fb',
            border: '1px solid rgba(113, 209, 248, 0.25)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '12px',
            cursor: 'pointer',
            maxWidth: '180px'
          }}
        >
          <option value="Todas">Todas estruturas</option>
          {estruturasList.filter(e => e !== 'TODAS').map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>

        {/* Segmented Control de Ciclo */}
        <div
          style={{
            display: 'inline-flex',
            border: '1px solid rgba(113, 209, 248, 0.25)',
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.03)'
          }}
        >
          {['Todos', '1', '2'].map((c, i) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCiclo(c)}
              style={{
                fontFamily: 'inherit',
                border: 'none',
                borderLeft: i > 0 ? '1px solid rgba(113, 209, 248, 0.2)' : 'none',
                background: selectedCiclo === c ? '#027bff' : 'transparent',
                color: selectedCiclo === c ? '#ffffff' : '#9db3d1',
                fontSize: '12px',
                fontWeight: 600,
                padding: '6px 12px',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
            >
              {c === 'Todos' ? 'Todos ciclos' : `Ciclo ${c}`}
            </button>
          ))}
        </div>

        {/* Botão Limpar Filtros */}
        <button
          type="button"
          onClick={handleClearFilters}
          style={{
            fontFamily: 'inherit',
            background: 'transparent',
            border: '1px solid rgba(113, 209, 248, 0.25)',
            color: '#9db3d1',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'border-color 0.15s, color 0.15s'
          }}
        >
          <RotateCcw size={13} />
          Limpar
        </button>

        {/* Botão Exportar CSV */}
        <button
          type="button"
          onClick={handleExportCSV}
          style={{
            fontFamily: 'inherit',
            background: 'rgba(14, 165, 233, 0.15)',
            border: '1px solid rgba(14, 165, 233, 0.4)',
            color: '#38bdf8',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Download size={13} />
          Exportar CSV
        </button>

        {/* Contador de Atividades Filtradas */}
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#9db3d1' }}>
          <b style={{ fontFamily: "'Montserrat', sans-serif", color: '#71d1f8', fontSize: '15px' }}>
            {filteredActs.length.toLocaleString('pt-BR')}
          </b>{' '}
          atividades
        </span>
      </div>

      {/* RESUMO EXECUTIVO DE KPIS MACRO (GESTÃO À VISTA) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div
          style={{
            position: 'relative',
            border: '1px solid rgba(113, 209, 248, 0.2)',
            borderRadius: '10px',
            padding: '10px 14px',
            background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.65), rgba(11, 30, 59, 0.65))',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#71d1f8' }} />
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9db3d1', letterSpacing: '0.04em' }}>
            Total de Tarefas
          </div>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '20px', color: '#ffffff', marginTop: '2px' }}>
            {indStats.total.toLocaleString('pt-BR')}
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            border: '1px solid rgba(113, 209, 248, 0.2)',
            borderRadius: '10px',
            padding: '10px 14px',
            background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.65), rgba(11, 30, 59, 0.65))',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#33d17a' }} />
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9db3d1', letterSpacing: '0.04em' }}>
            Concluídas
          </div>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '20px', color: '#33d17a', marginTop: '2px' }}>
            {indStats.efetCount.toLocaleString('pt-BR')}
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            border: '1px solid rgba(113, 209, 248, 0.2)',
            borderRadius: '10px',
            padding: '10px 14px',
            background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.65), rgba(11, 30, 59, 0.65))',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#ffc21a' }} />
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9db3d1', letterSpacing: '0.04em' }}>
            Realizadas c/ Atraso
          </div>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '20px', color: '#ffc21a', marginTop: '2px' }}>
            {indStats.comAtrasoCount.toLocaleString('pt-BR')}
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            border: '1px solid rgba(113, 209, 248, 0.2)',
            borderRadius: '10px',
            padding: '10px 14px',
            background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.65), rgba(11, 30, 59, 0.65))',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#7c8aa3' }} />
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9db3d1', letterSpacing: '0.04em' }}>
            Reprogramadas
          </div>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '20px', color: '#7c8aa3', marginTop: '2px' }}>
            {indStats.reprogCount.toLocaleString('pt-BR')}
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            border: '1px solid rgba(113, 209, 248, 0.2)',
            borderRadius: '10px',
            padding: '10px 14px',
            background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.65), rgba(11, 30, 59, 0.65))',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#027bff' }} />
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9db3d1', letterSpacing: '0.04em' }}>
            Ações Futuras
          </div>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '20px', color: '#8fd0ff', marginTop: '2px' }}>
            {indStats.futCount.toLocaleString('pt-BR')}
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            border: '1px solid rgba(113, 209, 248, 0.2)',
            borderRadius: '10px',
            padding: '10px 14px',
            background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.65), rgba(11, 30, 59, 0.65))',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: indStats.band.c }} />
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9db3d1', letterSpacing: '0.04em' }}>
            Aderência no Prazo
          </div>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '20px', color: indStats.band.c, marginTop: '2px' }}>
            {indStats.plateCount
              ? (indStats.aderenciaNoPrazo * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
              : '—'}
          </div>
        </div>
      </div>

      {/* 3. ABA OPERACIONAL (CALENDÁRIO DIÁRIO + KPIS DO MÊS) */}
      {activeTab === 'op' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 4 KPIs do Mês */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px'
            }}
          >
            {/* KPI 1: Atividades no Mês */}
            <div
              style={{
                position: 'relative',
                border: '1px solid rgba(113, 209, 248, 0.2)',
                borderRadius: '12px',
                padding: '14px 18px',
                background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#71d1f8' }} />
              <div style={{ fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
                Atividades no mês
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '26px',
                  lineHeight: 1.1,
                  marginTop: '6px',
                  color: '#ffffff'
                }}
              >
                {opStats.totalMes.toLocaleString('pt-BR')}
              </div>
            </div>

            {/* KPI 2: Concluídas */}
            <div
              style={{
                position: 'relative',
                border: '1px solid rgba(113, 209, 248, 0.2)',
                borderRadius: '12px',
                padding: '14px 18px',
                background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#33d17a' }} />
              <div style={{ fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
                Concluídas
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '26px',
                  lineHeight: 1.1,
                  marginTop: '6px',
                  color: '#33d17a'
                }}
              >
                {opStats.concluidas.toLocaleString('pt-BR')}
              </div>
            </div>

            {/* KPI 3: Em Atraso */}
            <div
              style={{
                position: 'relative',
                border: '1px solid rgba(113, 209, 248, 0.2)',
                borderRadius: '12px',
                padding: '14px 18px',
                background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#ff4b4b' }} />
              <div style={{ fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
                Em atraso
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '26px',
                  lineHeight: 1.1,
                  marginTop: '6px',
                  color: '#ff8a8a'
                }}
              >
                {opStats.emAtraso.toLocaleString('pt-BR')}
              </div>
            </div>

            {/* KPI 4: Ações Futuras */}
            <div
              style={{
                position: 'relative',
                border: '1px solid rgba(113, 209, 248, 0.2)',
                borderRadius: '12px',
                padding: '14px 18px',
                background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#027bff' }} />
              <div style={{ fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
                Ações futuras
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '26px',
                  lineHeight: 1.1,
                  marginTop: '6px',
                  color: '#8fd0ff'
                }}
              >
                {opStats.futuras.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>

          {/* Painel Calendário Mensal */}
          <div
            style={{
              border: '1px solid rgba(113, 209, 248, 0.2)',
              borderRadius: '14px',
              padding: '16px 20px',
              background: 'linear-gradient(180deg, rgba(16, 40, 78, 0.72), rgba(11, 28, 56, 0.72))',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Barra do Mês com Navegação e Legenda */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                marginBottom: '14px'
              }}
            >
              {/* Botões de Navegação */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => stepMonth(-1)}
                  style={{
                    fontFamily: 'inherit',
                    width: '34px',
                    height: '34px',
                    border: '1px solid rgba(113, 209, 248, 0.25)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#eaf2fb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'border-color 0.15s, background 0.15s'
                  }}
                  title="Mês Anterior"
                >
                  ‹
                </button>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 800,
                    fontSize: '17px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    minWidth: '160px',
                    textAlign: 'center',
                    color: '#ffffff'
                  }}
                >
                  {calendarGridData.monthLabel}
                </div>
                <button
                  type="button"
                  onClick={() => stepMonth(1)}
                  style={{
                    fontFamily: 'inherit',
                    width: '34px',
                    height: '34px',
                    border: '1px solid rgba(113, 209, 248, 0.25)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#eaf2fb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'border-color 0.15s, background 0.15s'
                  }}
                  title="Próximo Mês"
                >
                  ›
                </button>
              </div>

              {/* Legenda de Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#9db3d1' }}>
                  <i style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#33d17a', display: 'inline-block' }} />
                  Concluído
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#9db3d1' }}>
                  <i style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ffc21a', display: 'inline-block' }} />
                  Realizado c/ atraso
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#9db3d1' }}>
                  <i style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#027bff', display: 'inline-block' }} />
                  Ações futuras
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#9db3d1' }}>
                  <i style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#7c8aa3', display: 'inline-block' }} />
                  Reprogramada
                </span>
              </div>
            </div>

            {/* Cabeçalho dos Dias da Semana */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '6px',
                marginBottom: '6px'
              }}
            >
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div
                  key={d}
                  style={{
                    fontSize: '11px',
                    color: '#71d1f8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    textAlign: 'center',
                    fontWeight: 700
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid dos Dias do Calendário */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '6px'
              }}
            >
              {calendarGridData.cells.map((cell, idx) => {
                if (cell.out) {
                  return (
                    <div
                      key={`out-${idx}`}
                      style={{
                        minHeight: '85px',
                        background: 'transparent',
                        border: '1px solid transparent',
                        borderRadius: '8px'
                      }}
                    />
                  );
                }

                return (
                  <div
                    key={`day-${cell.day}`}
                    onClick={() => {
                      if (cell.tasks.length > 0) {
                        setSelectedDayTasks({ date: cell.dateStr, dayNum: cell.day, tasks: cell.tasks });
                      }
                    }}
                    style={{
                      minHeight: '85px',
                      border: `1px solid ${cell.isToday ? 'var(--sky, #71d1f8)' : 'rgba(113, 209, 248, 0.15)'}`,
                      borderRadius: '8px',
                      padding: '6px 8px',
                      background: cell.isToday ? 'rgba(113, 209, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      boxShadow: cell.isToday ? 'inset 0 0 0 1px rgba(113, 209, 248, 0.4)' : 'none',
                      cursor: cell.tasks.length > 0 ? 'pointer' : 'default',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'background 0.15s, border-color 0.15s'
                    }}
                  >
                    {/* Número do Dia */}
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: cell.isToday ? '#71d1f8' : '#9db3d1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{cell.day}</span>
                      {cell.tasks.length > 0 && (
                        <span style={{ fontSize: '10px', color: '#64748b' }}>
                          {cell.tasks.length}
                        </span>
                      )}
                    </div>

                    {/* Chips de Atividades */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden' }}>
                      {cell.tasks.slice(0, 3).map((act, actIdx) => {
                        const col = STATUS_COLORS_P[act.status] || '#71d1f8';
                        const isLight = act.status === 'Realizado com Atraso';
                        const textColor = isLight ? '#08131f' : '#ffffff';

                        return (
                          <div
                            key={act.id || actIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItemDetail(act);
                            }}
                            title={`${act.estr || act.estrutura} — ${act.acao} — ${act.status}`}
                            style={{
                              fontSize: '10px',
                              padding: '2px 5px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              background: col,
                              color: textColor,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.25,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}
                          >
                            {act.estr || act.estrutura}
                          </div>
                        );
                      })}

                      {cell.tasks.length > 3 && (
                        <div
                          style={{
                            fontSize: '10px',
                            color: '#71d1f8',
                            fontWeight: 600,
                            paddingLeft: '2px'
                          }}
                        >
                          +{cell.tasks.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. ABA INDICADORES ESTRATÉGICOS (GAUGE, 6 KPIS, MAPA GIS, BARRAS) */}
      {activeTab === 'ind' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 6 KPIs Estratégicos */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '12px'
            }}
          >
            {/* KPI 1: Total Planejado / Total de Tarefas */}
            <div
              style={{
                position: 'relative',
                border: '1px solid rgba(113, 209, 248, 0.2)',
                borderRadius: '10px',
                padding: '12px 14px',
                background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#71d1f8' }} />
              <div style={{ fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
                Total Planejado
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '24px',
                  color: '#ffffff',
                  marginTop: '4px'
                }}
              >
                {indStats.total.toLocaleString('pt-BR')}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Total de Tarefas</div>
            </div>

            {/* KPI 2: Efetividade */}
            <div
              style={{
                position: 'relative',
                border: '1px solid rgba(113, 209, 248, 0.2)',
                borderRadius: '10px',
                padding: '12px 14px',
                background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: indStats.band.c }} />
              <div style={{ fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
                Efetividade (meta 75%)
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '24px',
                  color: indStats.band.c,
                  marginTop: '4px'
                }}
              >
                {indStats.plateCount
                  ? (indStats.efetividade * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
                  : '—'}
              </div>
              <div style={{ fontSize: '10px', color: indStats.band.c, marginTop: '2px' }}>{indStats.band.label}</div>
            </div>

            {/* KPI 3: No Prazo / Aderência no Prazo */}
            <div
              style={{
                position: 'relative',
                border: '1px solid rgba(113, 209, 248, 0.2)',
                borderRadius: '10px',
                padding: '12px 14px',
                background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#027bff' }} />
              <div style={{ fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
                No Prazo
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '24px',
                  color: '#ffffff',
                  marginTop: '4px'
                }}
              >
                {indStats.plateCount
                  ? (indStats.aderenciaNoPrazo * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
                  : '—'}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Aderência no Prazo</div>
            </div>

            {/* KPI 4: Realizado (efetivo) / Concluídas */}
            <div
              style={{
                position: 'relative',
                border: '1px solid rgba(113, 209, 248, 0.2)',
                borderRadius: '10px',
                padding: '12px 14px',
                background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#33d17a' }} />
              <div style={{ fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
                Realizado (efetivo)
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '24px',
                  color: '#33d17a',
                  marginTop: '4px'
                }}
              >
                {indStats.efetCount.toLocaleString('pt-BR')}
              </div>
              <div style={{ fontSize: '10px', color: '#33d17a', marginTop: '2px' }}>Concluídas</div>
            </div>

            {/* KPI 5: Em Atraso / Realizadas c/ Atraso */}
            <div
              style={{
                position: 'relative',
                border: '1px solid rgba(113, 209, 248, 0.2)',
                borderRadius: '10px',
                padding: '12px 14px',
                background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#ff4b4b' }} />
              <div style={{ fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
                Em Atraso
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '24px',
                  color: '#ff8a8a',
                  marginTop: '4px'
                }}
              >
                {indStats.atrasoCount.toLocaleString('pt-BR')}
              </div>
              <div style={{ fontSize: '10px', color: '#ff8a8a', marginTop: '2px' }}>Realizadas c/ Atraso: {indStats.comAtrasoCount}</div>
            </div>

            {/* KPI 6: Ações Futuras / Reprogramadas */}
            <div
              style={{
                position: 'relative',
                border: '1px solid rgba(113, 209, 248, 0.2)',
                borderRadius: '10px',
                padding: '12px 14px',
                background: 'linear-gradient(180deg, rgba(18, 48, 88, 0.75), rgba(11, 30, 59, 0.75))',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#ffc21a' }} />
              <div style={{ fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9db3d1' }}>
                Ações Futuras
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '24px',
                  color: '#8fd0ff',
                  marginTop: '4px'
                }}
              >
                {indStats.futCount.toLocaleString('pt-BR')}
              </div>
              <div style={{ fontSize: '10px', color: '#7c8aa3', marginTop: '2px' }}>Reprogramadas: {indStats.reprogCount}</div>
            </div>
          </div>

          {/* Grade Principal dos 5 Painéis Executivos */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px'
            }}
          >
            {/* PAINEL 1: GAUGE CIRCULAR DE EFETIVIDADE */}
            <div
              style={{
                border: '1px solid rgba(113, 209, 248, 0.2)',
                borderRadius: '14px',
                padding: '18px 20px',
                background: 'linear-gradient(180deg, rgba(16, 40, 78, 0.72), rgba(11, 28, 56, 0.72))',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#71d1f8',
                  marginBottom: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline'
                }}
              >
                <span>Efetividade PCM</span>
                <span style={{ color: '#9db3d1', fontWeight: 500, fontSize: '11px' }}>meta 75%</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                {/* SVG Circular Gauge */}
                <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
                  <svg viewBox="0 0 120 120" width="100%" height="100%" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={indStats.band.c}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 50}
                      strokeDashoffset={2 * Math.PI * 50 * (1 - Math.max(0, Math.min(1, indStats.efetividade)))}
                      style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 800,
                        fontSize: '28px',
                        lineHeight: 1,
                        color: indStats.band.c
                      }}
                    >
                      {Math.round(indStats.efetividade * 100)}%
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#9db3d1',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginTop: '4px'
                      }}
                    >
                      Efetividade
                    </div>
                  </div>
                </div>

                {/* Estatísticas do Gauge */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(113, 209, 248, 0.15)', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#9db3d1' }}>Planejado até hoje:</span>
                    <strong style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '13px', color: '#ffffff' }}>
                      {indStats.plateCount.toLocaleString('pt-BR')}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(113, 209, 248, 0.15)', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#9db3d1' }}>Efetivo até hoje:</span>
                    <strong style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '13px', color: '#33d17a' }}>
                      {indStats.efetCount.toLocaleString('pt-BR')}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(113, 209, 248, 0.15)', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#9db3d1' }}>No prazo (concluído):</span>
                    <strong style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '13px', color: '#ffffff' }}>
                      {indStats.noprazoCount.toLocaleString('pt-BR')}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: '#9db3d1' }}>Em atraso:</span>
                    <strong style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '13px', color: '#ff8a8a' }}>
                      {indStats.atrasoCount.toLocaleString('pt-BR')}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* PAINEL 2: STATUS DAS ATIVIDADES */}
            <div
              style={{
                border: '1px solid rgba(113, 209, 248, 0.2)',
                borderRadius: '14px',
                padding: '18px 20px',
                background: 'linear-gradient(180deg, rgba(16, 40, 78, 0.72), rgba(11, 28, 56, 0.72))',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#71d1f8',
                  marginBottom: '14px'
                }}
              >
                Status das Atividades
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'center' }}>
                {statusRanking.map(([st, cnt]) => {
                  const maxCnt = Math.max(1, ...statusRanking.map(e => e[1]));
                  const pct = (cnt / maxCnt) * 100;
                  const col = STATUS_COLORS_P[st] || '#71d1f8';

                  return (
                    <div
                      key={st}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <div
                        style={{
                          width: '130px',
                          fontSize: '11px',
                          color: '#eaf2fb',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={st}
                      >
                        {st}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          height: '10px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: col,
                            borderRadius: '6px',
                            transition: 'width 0.5s ease'
                          }}
                        />
                      </div>
                      <div
                        style={{
                          width: '45px',
                          textAlign: 'right',
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 700,
                          fontSize: '12px',
                          color: '#ffffff'
                        }}
                      >
                        {cnt.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PAINEL 3: MAPA GIS LEAFLET DAS ESTRUTURAS */}
            <div
              style={{
                border: '1px solid rgba(113, 209, 248, 0.2)',
                borderRadius: '14px',
                padding: '18px 20px',
                background: 'linear-gradient(180deg, rgba(16, 40, 78, 0.72), rgba(11, 28, 56, 0.72))',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gridColumn: '1 / -1',
                minHeight: '380px'
              }}
            >
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#71d1f8',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline'
                }}
              >
                <span>Estruturas no Complexo Itaminas (Mapa Georreferenciado)</span>
                <span style={{ color: '#9db3d1', fontSize: '11px', fontWeight: 500 }}>
                  {Object.keys(P_DATA?.coords || ESTRUTURAS_COORDENADAS).length} estruturas georreferenciadas
                </span>
              </div>

              {/* Contêiner Leaflet */}
              <div
                ref={mapContainerRef}
                style={{
                  flex: 1,
                  minHeight: '290px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid rgba(113, 209, 248, 0.25)',
                  background: '#0e2244'
                }}
              />

              {/* Legenda do Mapa */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '10px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#9db3d1' }}>
                  <i style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#33d17a', display: 'inline-block', border: '1px solid #fff' }} />
                  ≥ 75% (Meta Atingida)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#9db3d1' }}>
                  <i style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffc21a', display: 'inline-block', border: '1px solid #fff' }} />
                  60% – 75% (Atenção)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#9db3d1' }}>
                  <i style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff4b4b', display: 'inline-block', border: '1px solid #fff' }} />
                  &lt; 60% (Abaixo da Meta)
                </span>
              </div>
            </div>

            {/* PAINEL 4: DESVIOS (CAUSAS) */}
            <div
              style={{
                border: '1px solid rgba(113, 209, 248, 0.2)',
                borderRadius: '14px',
                padding: '18px 20px',
                background: 'linear-gradient(180deg, rgba(16, 40, 78, 0.72), rgba(11, 28, 56, 0.72))',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#71d1f8',
                  marginBottom: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline'
                }}
              >
                <span>Desvios (Causas)</span>
                <span style={{ color: '#9db3d1', fontSize: '11px', fontWeight: 500 }}>
                  {desvioRanking.reduce((sum, e) => sum + e[1], 0)} com desvio
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {desvioRanking.length === 0 ? (
                  <div style={{ color: '#9db3d1', fontSize: '12px', textAlign: 'center', margin: 'auto' }}>
                    Nenhum desvio registrado no recorte selecionado.
                  </div>
                ) : (
                  desvioRanking.map(([desv, cnt]) => {
                    const maxCnt = Math.max(1, ...desvioRanking.map(e => e[1]));
                    const pct = (cnt / maxCnt) * 100;

                    return (
                      <div
                        key={desv}
                        onClick={() => setSelectedDesvioFilter(selectedDesvioFilter === desv ? 'Todos' : desv)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          borderRadius: '6px',
                          background: selectedDesvioFilter === desv ? 'rgba(143, 123, 255, 0.15)' : 'transparent',
                          transition: 'background 0.15s'
                        }}
                      >
                        <div
                          style={{
                            width: '130px',
                            fontSize: '11px',
                            color: '#eaf2fb',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={desv}
                        >
                          {desv}
                        </div>
                        <div
                          style={{
                            flex: 1,
                            height: '10px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${pct}%`,
                              background: '#8f7bff',
                              borderRadius: '6px',
                              transition: 'width 0.5s ease'
                            }}
                          />
                        </div>
                        <div
                          style={{
                            width: '45px',
                            textAlign: 'right',
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 700,
                            fontSize: '12px',
                            color: '#ffffff'
                          }}
                        >
                          {cnt.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* PAINEL 5: ATIVIDADES POR ESTRUTURA (TOP 8) */}
            <div
              style={{
                border: '1px solid rgba(113, 209, 248, 0.2)',
                borderRadius: '14px',
                padding: '18px 20px',
                background: 'linear-gradient(180deg, rgba(16, 40, 78, 0.72), rgba(11, 28, 56, 0.72))',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#71d1f8',
                  marginBottom: '14px'
                }}
              >
                Atividades por Estrutura (Top 8)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {estruturaRanking.map(([estr, cnt]) => {
                  const maxCnt = Math.max(1, ...estruturaRanking.map(e => e[1]));
                  const pct = (cnt / maxCnt) * 100;
                  const isSelected = selectedEstrutura === estr;

                  return (
                    <div
                      key={estr}
                      onClick={() => setSelectedEstrutura(isSelected ? 'Todas' : estr)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        background: isSelected ? 'rgba(2, 123, 255, 0.2)' : 'transparent',
                        transition: 'background 0.15s'
                      }}
                      title="Clique para filtrar por esta estrutura"
                    >
                      <div
                        style={{
                          width: '130px',
                          fontSize: '11px',
                          color: '#eaf2fb',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {estr}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          height: '10px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: '#027bff',
                            borderRadius: '6px',
                            transition: 'width 0.5s ease'
                          }}
                        />
                      </div>
                      <div
                        style={{
                          width: '45px',
                          textAlign: 'right',
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 700,
                          fontSize: '12px',
                          color: '#ffffff'
                        }}
                      >
                        {cnt.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ABA TABELA ANALÍTICA (BUSCA, FILTRO, PAGINAÇÃO, AUDITORIA) */}
      {activeTab === 'tab' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Barra de Busca na Tabela */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(113, 209, 248, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
              <Search size={15} color="#71d1f8" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Pesquisar por ação, estrutura, status, justificativa..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  width: '100%',
                  outline: 'none'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', color: '#9db3d1', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={selectedStatusFilter}
                onChange={(e) => {
                  setSelectedStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  background: 'rgba(16, 40, 78, 0.85)',
                  color: '#eaf2fb',
                  border: '1px solid rgba(113, 209, 248, 0.25)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                <option value="Todos">Todos os Status</option>
                {STATUS_ORDER_P.filter(s => s !== 'N/D').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={selectedDesvioFilter}
                onChange={(e) => {
                  setSelectedDesvioFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  background: 'rgba(16, 40, 78, 0.85)',
                  color: '#eaf2fb',
                  border: '1px solid rgba(113, 209, 248, 0.25)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                <option value="Todos">Todos os Desvios</option>
                <option value="COM_DESVIO">Apenas com Desvio</option>
                {desviosList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabela de Dados */}
          <div
            style={{
              overflowX: 'auto',
              borderRadius: '10px',
              border: '1px solid rgba(113, 209, 248, 0.18)',
              background: 'rgba(16, 40, 78, 0.45)'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: 'rgba(2, 123, 255, 0.15)', borderBottom: '1px solid rgba(113, 209, 248, 0.25)' }}>
                  <th style={{ padding: '10px 12px', color: '#71d1f8', fontWeight: 700, width: '50px' }}>ID</th>
                  <th style={{ padding: '10px 12px', color: '#71d1f8', fontWeight: 700 }}>Estrutura</th>
                  <th style={{ padding: '10px 12px', color: '#71d1f8', fontWeight: 700 }}>Data Plan.</th>
                  <th style={{ padding: '10px 12px', color: '#71d1f8', fontWeight: 700 }}>Ação Geotécnica / Manutenção</th>
                  <th style={{ padding: '10px 12px', color: '#71d1f8', fontWeight: 700, width: '65px' }}>Ciclo</th>
                  <th style={{ padding: '10px 12px', color: '#71d1f8', fontWeight: 700, width: '130px' }}>Status</th>
                  <th style={{ padding: '10px 12px', color: '#71d1f8', fontWeight: 700 }}>Desvio</th>
                  <th style={{ padding: '10px 12px', color: '#71d1f8', fontWeight: 700, textAlign: 'center', width: '70px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#9db3d1' }}>
                      Nenhuma atividade encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, idx) => {
                    const stColor = STATUS_COLORS_P[item.status] || '#71d1f8';
                    const isEven = idx % 2 === 0;

                    return (
                      <tr
                        key={item.id || idx}
                        style={{
                          background: isEven ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                          borderBottom: '1px solid rgba(113, 209, 248, 0.08)',
                          cursor: 'pointer',
                          transition: 'background 0.15s'
                        }}
                        onClick={() => setSelectedItemDetail(item)}
                      >
                        <td style={{ padding: '9px 12px', color: '#9db3d1', fontFamily: 'monospace' }}>
                          #{item.id}
                        </td>
                        <td style={{ padding: '9px 12px', fontWeight: 700, color: '#ffffff' }}>
                          {item.estr || item.estrutura}
                        </td>
                        <td style={{ padding: '9px 12px', color: '#eaf2fb' }}>
                          {item.plan || item.dataPlanejada}
                        </td>
                        <td style={{ padding: '9px 12px', color: '#cbd5e1', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.acao}
                        </td>
                        <td style={{ padding: '9px 12px', color: '#9db3d1' }}>
                          Ciclo {item.ciclo}
                        </td>
                        <td style={{ padding: '9px 12px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: stColor,
                              color: item.status === 'Realizado com Atraso' ? '#08131f' : '#ffffff'
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '9px 12px', color: item.desvio ? '#f87171' : '#64748b' }}>
                          {item.desvio || '—'}
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItemDetail(item);
                            }}
                            style={{
                              background: 'rgba(2, 123, 255, 0.15)',
                              border: '1px solid rgba(2, 123, 255, 0.4)',
                              color: '#38bdf8',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px'
                            }}
                          >
                            <Eye size={12} />
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação da Tabela */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#9db3d1',
              padding: '6px 4px'
            }}
          >
            <div>
              Mostrando <b>{Math.min(filteredActs.length, (currentPage - 1) * pageSize + 1)}</b> a{' '}
              <b>{Math.min(filteredActs.length, currentPage * pageSize)}</b> de <b>{filteredActs.length}</b> atividades
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(113, 209, 248, 0.2)',
                  color: currentPage <= 1 ? '#475569' : '#eaf2fb',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Anterior
              </button>
              <span>
                Página <b>{currentPage}</b> de <b>{totalPages}</b>
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(113, 209, 248, 0.2)',
                  color: currentPage >= totalPages ? '#475569' : '#eaf2fb',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL DE TAREFAS DO DIA (CALENDÁRIO) */}
      {selectedDayTasks && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(8, 20, 40, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedDayTasks(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '85vh',
              background: '#0b1e3b',
              border: '1px solid rgba(113, 209, 248, 0.35)',
              borderRadius: '16px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal de Dia */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(113, 209, 248, 0.2)',
                background: 'rgba(16, 40, 78, 0.6)'
              }}
            >
              <div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '16px', color: '#ffffff' }}>
                  Atividades em {selectedDayTasks.date}
                </div>
                <div style={{ fontSize: '12px', color: '#71d1f8', marginTop: '2px' }}>
                  {selectedDayTasks.tasks.length} atividades programadas no cronograma
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayTasks(null)}
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

            {/* Lista de Atividades do Dia */}
            <div style={{ overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedDayTasks.tasks.map((act, idx) => {
                const col = STATUS_COLORS_P[act.status] || '#71d1f8';

                return (
                  <div
                    key={act.id || idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(113, 209, 248, 0.15)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <span style={{ fontWeight: 800, fontSize: '13px', color: '#71d1f8' }}>
                        {act.estr || act.estrutura}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          background: col,
                          color: act.status === 'Realizado com Atraso' ? '#08131f' : '#ffffff'
                        }}
                      >
                        {act.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 600 }}>
                      {act.acao}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', color: '#9db3d1', flexWrap: 'wrap' }}>
                      <span>Ciclo {act.ciclo}</span>
                      {act.dataRealizada && <span>Realizado em: {act.dataRealizada}</span>}
                      {act.desvio && <span style={{ color: '#f87171' }}>Desvio: {act.desvio}</span>}
                    </div>

                    {act.justificativa && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#cbd5e1',
                          background: 'rgba(0, 0, 0, 0.2)',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          marginTop: '2px'
                        }}
                      >
                        Justificativa: {act.justificativa}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL DE DETALHES DE UMA ATIVIDADE ESPECÍFICA */}
      {selectedItemDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(8, 20, 40, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedItemDetail(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: '#0b1e3b',
              border: '1px solid rgba(113, 209, 248, 0.35)',
              borderRadius: '16px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(113, 209, 248, 0.2)',
                background: 'rgba(16, 40, 78, 0.6)'
              }}
            >
              <div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '16px', color: '#ffffff' }}>
                  Tarefa #{selectedItemDetail.id || '—'}
                </div>
                <div style={{ fontSize: '12px', color: '#71d1f8', marginTop: '2px' }}>
                  {selectedItemDetail.estr || selectedItemDetail.estrutura}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemDetail(null)}
                style={{ background: 'transparent', border: 'none', color: '#9db3d1', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#9db3d1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ação / Atividade Geotécnica
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginTop: '3px' }}>
                  {selectedItemDetail.acao}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#9db3d1' }}>Data Planejada</div>
                  <strong style={{ color: '#ffffff' }}>{selectedItemDetail.plan || selectedItemDetail.dataPlanejada}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#9db3d1' }}>Data Realizada</div>
                  <strong style={{ color: selectedItemDetail.dataRealizada ? '#33d17a' : '#94a3b8' }}>
                    {selectedItemDetail.dataRealizada || 'Pendente'}
                  </strong>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#9db3d1' }}>Ciclo</div>
                  <strong style={{ color: '#ffffff' }}>Ciclo {selectedItemDetail.ciclo}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#9db3d1' }}>Status Atual</div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: STATUS_COLORS_P[selectedItemDetail.status] || '#71d1f8',
                      color: selectedItemDetail.status === 'Realizado com Atraso' ? '#08131f' : '#ffffff',
                      marginTop: '3px'
                    }}
                  >
                    {selectedItemDetail.status}
                  </span>
                </div>
              </div>

              {selectedItemDetail.desvio && (
                <div style={{ borderTop: '1px solid rgba(113, 209, 248, 0.15)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#f87171' }}>Desvio Registrado (Causa)</div>
                  <strong style={{ color: '#fca5a5' }}>{selectedItemDetail.desvio}</strong>
                </div>
              )}

              {selectedItemDetail.justificativa && (
                <div>
                  <div style={{ fontSize: '11px', color: '#9db3d1' }}>Justificativa Operacional</div>
                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px', borderRadius: '8px', color: '#cbd5e1', marginTop: '3px' }}>
                    {selectedItemDetail.justificativa}
                  </div>
                </div>
              )}

              {/* Localização / GPS */}
              {(selectedItemDetail.lat || selectedItemDetail.lon) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(113, 209, 248, 0.15)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#9db3d1' }}>
                    Coordenadas: {selectedItemDetail.lat}, {selectedItemDetail.lon}
                  </span>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => {
                        const coords = (selectedItemDetail.lat && selectedItemDetail.lon) 
                          ? [selectedItemDetail.lat, selectedItemDetail.lon] 
                          : undefined;
                        setSelectedItemDetail(null);
                        onNavigateTab('mapa', {
                          coords,
                          zoom: 17,
                          structureId: selectedItemDetail.estruturaId || 'TODAS'
                        });
                      }}
                      style={{
                        background: '#0284c7',
                        border: 'none',
                        color: '#ffffff',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <MapPin size={12} />
                      Ver no Georeferenciamento
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. RODAPÉ DO PAINEL EXECUTIVO */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          borderTop: '1px solid rgba(113, 209, 248, 0.15)',
          paddingTop: '14px',
          marginTop: '18px',
          fontSize: '11px',
          color: '#9db3d1'
        }}
      >
        <div>
          Fonte: <b style={{ color: '#ffffff' }}>Painel Executivo de Cronograma PCM</b> — Gerência de Geotecnia Itaminas
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>
            {indStats.futCount.toLocaleString('pt-BR')} ações futuras · {indStats.atrasoCount.toLocaleString('pt-BR')} em atraso
          </span>
          <span style={{ color: 'rgba(113, 209, 248, 0.4)' }}>•</span>
          <span>Atualizado em 27/08/2026</span>
        </div>
      </div>
    </div>
  );
};

export default CronogramaSection;

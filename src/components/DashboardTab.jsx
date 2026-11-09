import React, { useState, useMemo, useEffect } from 'react';
import { useGeotechData, normalizeStructureKey } from '../context/GeotechDataContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  Filter, 
  Layers, 
  Activity, 
  AlertTriangle, 
  Flame, 
  ShieldCheck, 
  TrendingUp, 
  CloudRain, 
  ChevronRight,
  Search, 
  X, 
  RefreshCw, 
  MapPin, 
  FileText,
  BarChart3,
  PieChart,
  LineChart as LineIcon,
  Table as TableIcon,
  CheckCircle2,
  Clock,
  Radio,
  Briefcase,
  Users,
  HardHat,
  Database,
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const DashboardTab = ({ onNavigateTab }) => {
  const { 
    structures = [], 
    instruments = [], 
    readingsPiezometria = [], 
    pluviometria = [], 
    stats = {}, 
    activeStructureId, 
    selectStructure,
    demandasRegulatorias = [],
    rotinaGeotecnia = [],
    exigenciasExtraordinarias = [],
    planoSegurancaBarragens = [],
    reportDiarioGeotecnia = [],
    indicadoresProcessos = [],
    fatoresSeguranca = [],
    radarEventos = [],
    pendenciasContratuais = [],
    cronogramaPcmi = [],
    fluigTickets = [],
    sumps = [],
    refreshMasterData,
    showToast
  } = useGeotechData();

  // Sub-abas de Navegação Interna da Sessão de Dashboards
  const [activeSubTab, setActiveSubTab] = useState('cockpit'); // 'cockpit' | 'monitoramento' | 'demandas' | 'rotina' | 'obras' | 'chamados' | 'contratos'

  // Estados dos Filtros do Monitoramento
  const [selectedCategory, setSelectedCategory] = useState('TODAS'); // 'TODAS' | 'Barragens' | 'Pilhas' | 'Taludes' | 'Cavas'
  const [selectedStructure, setSelectedStructure] = useState('TODAS');
  const [selectedType, setSelectedType] = useState('TODOS');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [timeRange, setTimeRange] = useState('tudo'); // '7d' | '15d' | '30d' | '90d' | 'tudo'
  const [searchQuery, setSearchQuery] = useState('');
  const [showTable, setShowTable] = useState(true);

  // Filtros específicos para outras sub-abas
  const [demandasFilterOrgao, setDemandasFilterOrgao] = useState('TODOS');
  const [demandasFilterStatus, setDemandasFilterStatus] = useState('TODOS');
  const [demandasSearch, setDemandasSearch] = useState('');

  const [rotinaFilterResp, setRotinaFilterResp] = useState('TODOS');
  const [rotinaFilterStatus, setRotinaFilterStatus] = useState('TODOS');
  const [rotinaSearch, setRotinaSearch] = useState('');

  const [cronoSearch, setCronoSearch] = useState('');
  const [contratoSearch, setContratoSearch] = useState('');

  // Sincronizar quando activeStructureId mudar externamente com normalização robusta
  useEffect(() => {
    if (activeStructureId) {
      const norm = normalizeStructureKey(activeStructureId);
      const exists = structures.some(s => s.id === norm);
      setSelectedStructure(exists ? norm : 'TODAS');
    }
  }, [activeStructureId, structures]);

  const handleStructureChange = (structId) => {
    const norm = normalizeStructureKey(structId);
    setSelectedStructure(norm);
    selectStructure(norm);
  };

  const handleResetFilters = () => {
    setSelectedCategory('TODAS');
    setSelectedStructure('TODAS');
    setSelectedType('TODOS');
    setSelectedStatus('TODOS');
    setTimeRange('tudo');
    setSearchQuery('');
    selectStructure('TODAS');
  };

  const isFiltered = selectedCategory !== 'TODAS' || selectedStructure !== 'TODAS' || selectedType !== 'TODOS' || selectedStatus !== 'TODOS' || searchQuery !== '' || timeRange !== 'tudo';

  // Normalização do ID da estrutura selecionada
  const normSelectedStructure = useMemo(() => {
    if (!selectedStructure || selectedStructure === 'TODAS') return 'TODAS';
    const norm = normalizeStructureKey(selectedStructure);
    const exists = structures.some(s => s.id === norm || s.nome.toUpperCase() === norm);
    return exists ? norm : 'TODAS';
  }, [selectedStructure, structures]);

  // 1. Filtrar instrumentos com base nos controles (100% à prova de zeramento indevido)
  const filteredInstruments = useMemo(() => {
    return instruments.filter(inst => {
      // Filtro Categoria Sentnel
      if (selectedCategory !== 'TODAS') {
        const instNorm = normalizeStructureKey(inst.estrutura);
        const struct = structures.find(s => s.id === instNorm || s.nome.toUpperCase() === inst.estrutura.toUpperCase());
        if (struct && struct.categoria !== selectedCategory) return false;
      }

      // Filtro Estrutura
      if (normSelectedStructure !== 'TODAS') {
        const instNorm = normalizeStructureKey(inst.estrutura);
        const matches = instNorm === normSelectedStructure || 
                        inst.estrutura.replace(/\s+/g, '_').toUpperCase() === normSelectedStructure ||
                        inst.estrutura.toUpperCase() === normSelectedStructure;
        if (!matches) return false;
      }

      // Filtro Tipo
      if (selectedType !== 'TODOS') {
        if (selectedType === 'PIEZOMETRIA') {
          if (inst.tipo !== 'INA' && inst.tipo !== 'PZ') return false;
        } else if (selectedType === 'VAZAO') {
          if (inst.tipo !== 'VT' && inst.tipo !== 'MV') return false;
        } else if (selectedType === 'MARCOS') {
          if (inst.tipo !== 'MCD' && inst.tipo !== 'REF' && inst.tipo !== 'ETR') return false;
        } else if (inst.tipo !== selectedType) {
          return false;
        }
      }

      // Filtro Status
      if (selectedStatus !== 'TODOS') {
        const status = inst.statusCalculado || 'NORMAL';
        if (selectedStatus === 'CRITICOS') {
          if (status !== 'EMERGÊNCIA' && status !== 'ATENÇÃO' && status !== 'ALERTA') return false;
        } else if (status !== selectedStatus) {
          return false;
        }
      }

      // Busca textual por código ou seção
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = (inst.id || '').toLowerCase().includes(q);
        const matchesSec = (inst.secao || '').toLowerCase().includes(q);
        const matchesFull = (inst.uid || '').toLowerCase().includes(q);
        const matchesEst = (inst.estrutura || '').toLowerCase().includes(q);
        if (!matchesCode && !matchesSec && !matchesFull && !matchesEst) return false;
      }

      return true;
    });
  }, [instruments, structures, selectedCategory, normSelectedStructure, selectedType, selectedStatus, searchQuery]);

  // UIDs dos instrumentos filtrados para cruzar com leituras
  const filteredUids = useMemo(() => {
    return new Set(filteredInstruments.map(i => i.uid));
  }, [filteredInstruments]);

  // 2. Limitar leituras pelo período temporal
  const dateCutoff = useMemo(() => {
    if (timeRange === 'tudo' || timeRange === 'TUDO') return null;
    const now = new Date('2026-10-29'); // Âncora na data de leituras mais recente
    if (timeRange === '7d') now.setDate(now.getDate() - 7);
    else if (timeRange === '15d') now.setDate(now.getDate() - 15);
    else if (timeRange === '30d') now.setDate(now.getDate() - 30);
    else if (timeRange === '90d') now.setDate(now.getDate() - 90);
    else return null;
    return now.toISOString().split('T')[0];
  }, [timeRange]);

  // Leituras Piezométricas Filtradas
  const filteredReadings = useMemo(() => {
    const list = readingsPiezometria.filter(r => {
      if (!filteredUids.has(r.uid)) return false;
      if (dateCutoff && r.data < dateCutoff) return false;
      return true;
    });
    // Se filtrado por data estiver vazio mas tiver instrumentos, inclui as leituras mais recentes
    if (list.length === 0 && readingsPiezometria.length > 0 && filteredUids.size > 0) {
      return readingsPiezometria.filter(r => filteredUids.has(r.uid)).slice(-300);
    }
    return list;
  }, [readingsPiezometria, filteredUids, dateCutoff]);

  // Pluviometria Filtrada
  const filteredPluviometria = useMemo(() => {
    const list = pluviometria.filter(p => {
      if (dateCutoff && p.data < dateCutoff) return false;
      return true;
    });
    return list.length > 0 ? list : pluviometria;
  }, [pluviometria, dateCutoff]);

  // Métricas Sintéticas de Cabeçalho do Filtro
  const filterStats = useMemo(() => {
    const total = filteredInstruments.length;
    const normais = filteredInstruments.filter(i => (i.statusCalculado || 'NORMAL') === 'NORMAL').length;
    const atencao = filteredInstruments.filter(i => i.statusCalculado === 'ATENÇÃO' || i.statusCalculado === 'ALERTA').length;
    const emergencia = filteredInstruments.filter(i => i.statusCalculado === 'EMERGÊNCIA').length;
    const pctConforme = total > 0 ? Math.round((normais / total) * 100) : 100;

    // Média de cota das leituras filtradas
    let mediaCota = 0;
    if (filteredReadings.length > 0) {
      const soma = filteredReadings.reduce((acc, r) => acc + (r.cotaLeitura || 0), 0);
      mediaCota = Number((soma / filteredReadings.length).toFixed(2));
    } else if (filteredInstruments.length > 0) {
      const instComCota = filteredInstruments.filter(i => i.ultimaCota);
      if (instComCota.length > 0) {
        mediaCota = Number((instComCota.reduce((acc, i) => acc + i.ultimaCota, 0) / instComCota.length).toFixed(2));
      }
    }

    // Chuva acumulada no período
    const somaChuva = filteredPluviometria.reduce((acc, p) => acc + (p.precipitacaoMm || p.mm || 0), 0);

    return {
      total,
      normais,
      atencao,
      emergencia,
      pctConforme,
      mediaCota,
      somaChuva: Number(somaChuva.toFixed(1))
    };
  }, [filteredInstruments, filteredReadings, filteredPluviometria]);

  // =========================================================================
  // DADOS DO GRÁFICO 1: Série Temporal de Cotas e Nível d'Água (Line Chart)
  // =========================================================================
  const lineChartData = useMemo(() => {
    const dateMap = {};
    filteredReadings.forEach(r => {
      if (!r.data || r.cotaLeitura === null || r.cotaLeitura === undefined) return;
      if (!dateMap[r.data]) {
        dateMap[r.data] = [];
      }
      dateMap[r.data].push(r.cotaLeitura);
    });

    const sortedDates = Object.keys(dateMap).sort();
    const step = Math.max(1, Math.floor(sortedDates.length / 30));
    const sampledDates = sortedDates.filter((_, idx) => idx % step === 0);

    const medias = sampledDates.map(d => {
      const vals = dateMap[d];
      const sum = vals.reduce((a, b) => a + b, 0);
      return Number((sum / vals.length).toFixed(2));
    });

    const maximos = sampledDates.map(d => {
      const vals = dateMap[d];
      return Number(Math.max(...vals).toFixed(2));
    });

    const instsComLimite = filteredInstruments.filter(i => i.limiteAtencao || i.limiteEmergencia);
    let limAtencaoMedio = null;
    let limEmergenciaMedio = null;
    if (instsComLimite.length > 0) {
      const somaAt = instsComLimite.reduce((acc, i) => acc + (i.limiteAtencao || 0), 0);
      const somaEm = instsComLimite.reduce((acc, i) => acc + (i.limiteEmergencia || 0), 0);
      limAtencaoMedio = Number((somaAt / instsComLimite.length).toFixed(2));
      limEmergenciaMedio = Number((somaEm / instsComLimite.length).toFixed(2));
    }

    const datasets = [
      {
        label: 'Cota Média (m)',
        data: medias,
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.12)',
        fill: true,
        tension: 0.3,
        borderWidth: 2.5,
        pointRadius: sampledDates.length > 15 ? 2 : 4,
        pointBackgroundColor: '#0284c7'
      },
      {
        label: 'Pico Máximo (m)',
        data: maximos,
        borderColor: '#38bdf8',
        borderDash: [3, 3],
        tension: 0.2,
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false
      }
    ];

    if (limAtencaoMedio) {
      datasets.push({
        label: `Limite Atenção (${limAtencaoMedio}m)`,
        data: sampledDates.map(() => limAtencaoMedio),
        borderColor: '#f59e0b',
        borderDash: [5, 5],
        borderWidth: 1.8,
        pointRadius: 0,
        fill: false
      });
    }

    if (limEmergenciaMedio) {
      datasets.push({
        label: `Limite Emergência (${limEmergenciaMedio}m)`,
        data: sampledDates.map(() => limEmergenciaMedio),
        borderColor: '#ef4444',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      });
    }

    return {
      labels: sampledDates.map(d => {
        const parts = d.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
      }),
      datasets
    };
  }, [filteredReadings, filteredInstruments]);

  // =========================================================================
  // DADOS DO GRÁFICO 2: Matriz de Distribuição e Status por Estrutura (Bar Chart)
  // =========================================================================
  const barChartData = useMemo(() => {
    const activeStructs = normSelectedStructure === 'TODAS'
      ? (selectedCategory === 'TODAS' ? structures : structures.filter(s => s.categoria === selectedCategory))
      : structures.filter(s => normalizeStructureKey(s.id) === normSelectedStructure || s.nome.toUpperCase() === normSelectedStructure);

    const safeStructs = activeStructs.length > 0 ? activeStructs : structures;
    const labels = safeStructs.map(s => s.nome);
    const dataNormal = [];
    const dataAtencao = [];
    const dataEmergencia = [];

    safeStructs.forEach(struct => {
      const structInsts = instruments.filter(i => {
        const instNorm = normalizeStructureKey(i.estrutura);
        return instNorm === struct.id || i.estrutura.toUpperCase() === struct.nome.toUpperCase();
      });
      
      const n = structInsts.filter(i => (i.statusCalculado || 'NORMAL') === 'NORMAL').length;
      const a = structInsts.filter(i => i.statusCalculado === 'ATENÇÃO' || i.statusCalculado === 'ALERTA').length;
      const e = structInsts.filter(i => i.statusCalculado === 'EMERGÊNCIA').length;

      dataNormal.push(n);
      dataAtencao.push(a);
      dataEmergencia.push(e);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Normal / Estável',
          data: dataNormal,
          backgroundColor: 'rgba(16, 185, 129, 0.85)',
          borderRadius: 4
        },
        {
          label: 'Em Atenção / Alerta',
          data: dataAtencao,
          backgroundColor: 'rgba(245, 158, 11, 0.85)',
          borderRadius: 4
        },
        {
          label: 'Em Emergência',
          data: dataEmergencia,
          backgroundColor: 'rgba(239, 68, 68, 0.85)',
          borderRadius: 4
        }
      ]
    };
  }, [structures, instruments, normSelectedStructure, selectedCategory]);

  // =========================================================================
  // DADOS DO GRÁFICO 3: Hidrograma Pluviométrico & Acumulado (Combo Chart)
  // =========================================================================
  const comboChartData = useMemo(() => {
    const pluv = filteredPluviometria.slice(-25);
    const labels = pluv.map(p => {
      const parts = (p.data || '').split('-');
      return parts.length === 3 ? `${parts[2]}/${parts[1]}` : p.data;
    });

    const chuvaDiaria = pluv.map(p => p.precipitacaoMm || 0);
    const chuva7d = pluv.map(p => p.acumulado7Dias || 0);

    return {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Chuva Diária (mm)',
          data: chuvaDiaria,
          backgroundColor: 'rgba(56, 189, 248, 0.7)',
          hoverBackgroundColor: '#38bdf8',
          borderRadius: 4,
          yAxisID: 'yChuva'
        },
        {
          type: 'line',
          label: 'Acumulado 7 Dias (mm)',
          data: chuva7d,
          borderColor: '#f59e0b',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.3,
          fill: false,
          yAxisID: 'yAcumulado'
        }
      ]
    };
  }, [filteredPluviometria]);

  // =========================================================================
  // DADOS DO GRÁFICO 4: Distribuição por Tipo de Instrumento (Doughnut)
  // =========================================================================
  const doughnutChartData = useMemo(() => {
    const typeCounts = {};
    const targetInsts = filteredInstruments.length > 0 ? filteredInstruments : instruments;
    targetInsts.forEach(i => {
      const t = i.tipo || 'OUTROS';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });

    const labels = Object.keys(typeCounts);
    const data = Object.values(typeCounts);

    const palette = [
      '#0284c7', '#38bdf8', '#10b981', '#f59e0b', 
      '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map((_, idx) => palette[idx % palette.length]),
          borderWidth: 2,
          borderColor: 'var(--bg-surface)'
        }
      ]
    };
  }, [filteredInstruments, instruments]);

  // Demandas Regulatórias Filtradas
  const filteredDemandas = useMemo(() => {
    return demandasRegulatorias.filter(d => {
      if (demandasFilterOrgao !== 'TODOS' && d.origem.toUpperCase() !== demandasFilterOrgao.toUpperCase()) return false;
      if (demandasFilterStatus !== 'TODOS' && d.status.toUpperCase() !== demandasFilterStatus.toUpperCase()) return false;
      if (demandasSearch.trim()) {
        const q = demandasSearch.toLowerCase();
        const mDesc = (d.descricao || '').toLowerCase().includes(q);
        const mResp = (d.responsavel || '').toLowerCase().includes(q);
        const mObs = (d.observacoes || '').toLowerCase().includes(q);
        if (!mDesc && !mResp && !mObs) return false;
      }
      return true;
    });
  }, [demandasRegulatorias, demandasFilterOrgao, demandasFilterStatus, demandasSearch]);

  // Rotina de Geotecnia Filtrada
  const filteredRotina = useMemo(() => {
    return rotinaGeotecnia.filter(r => {
      if (rotinaFilterResp !== 'TODOS' && r.responsavel !== rotinaFilterResp) return false;
      if (rotinaFilterStatus !== 'TODOS' && r.status !== rotinaFilterStatus) return false;
      if (rotinaSearch.trim()) {
        const q = rotinaSearch.toLowerCase();
        const mTar = (r.tarefa || '').toLowerCase().includes(q);
        const mResp = (r.responsavel || '').toLowerCase().includes(q);
        if (!mTar && !mResp) return false;
      }
      return true;
    });
  }, [rotinaGeotecnia, rotinaFilterResp, rotinaFilterStatus, rotinaSearch]);

  const darkTextColor = 'var(--text-muted)';
  const gridColor = 'rgba(148, 163, 184, 0.12)';

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkTextColor,
          font: { family: 'Inter', size: 11, weight: '600' },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: darkTextColor, font: { size: 10 } }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: darkTextColor, font: { size: 10 } },
        title: {
          display: true,
          text: 'Cota Piezométrica (m)',
          color: darkTextColor,
          font: { size: 11 }
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_, elements) => {
      if (elements.length > 0) {
        const idx = elements[0].index;
        const struct = structures[idx];
        if (struct) handleStructureChange(struct.id);
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkTextColor,
          font: { family: 'Inter', size: 11, weight: '600' },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: darkTextColor, font: { size: 10 }, maxRotation: 35, minRotation: 0 }
      },
      y: {
        stacked: true,
        grid: { color: gridColor },
        ticks: { color: darkTextColor, font: { size: 10 } },
        title: {
          display: true,
          text: 'Quantidade de Instrumentos',
          color: darkTextColor,
          font: { size: 11 }
        }
      }
    }
  };

  const comboOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkTextColor,
          font: { family: 'Inter', size: 11, weight: '600' },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: darkTextColor, font: { size: 10 } }
      },
      yChuva: {
        type: 'linear',
        position: 'left',
        grid: { color: gridColor },
        ticks: { color: '#0284c7', font: { size: 10 } },
        title: {
          display: true,
          text: 'Chuva Diária (mm)',
          color: '#0284c7',
          font: { size: 10 }
        }
      },
      yAcumulado: {
        type: 'linear',
        position: 'right',
        grid: { display: false },
        ticks: { color: '#f59e0b', font: { size: 10 } },
        title: {
          display: true,
          text: 'Acumulado 7d (mm)',
          color: '#f59e0b',
          font: { size: 10 }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkTextColor,
          font: { family: 'Inter', size: 10, weight: '600' },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        padding: 10,
        cornerRadius: 8
      }
    }
  };

  const DASHBOARD_TABS = [
    { id: 'cockpit', label: 'Cockpit Executivo 360°', icon: ShieldCheck, badge: 'Consolidado' },
    { id: 'monitoramento', label: 'Monitoramento & Instrumentos', icon: Activity, badge: `${instruments.length} inst.` },
    { id: 'demandas', label: 'Demandas Regulatórias (ANM/FEAM)', icon: FileText, badge: `${demandasRegulatorias.length} dem.` },
    { id: 'rotina', label: 'Rotina & Equipe Geotécnica', icon: TrendingUp, badge: `${rotinaGeotecnia.length} tarefas` },
    { id: 'obras', label: 'Obras & Cronograma PCMI', icon: Layers, badge: `${cronogramaPcmi.length} marcos` },
    { id: 'chamados', label: 'Chamados & Infraestrutura', icon: AlertTriangle, badge: `${fluigTickets.length} cham.` },
    { id: 'contratos', label: 'Contratos & Pareceres', icon: TableIcon, badge: `${pendenciasContratuais.length} contr.` }
  ];

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. CABEÇALHO ANALÍTICO COM SELETOR DE SUB-ABAS EXECUTIVAS */}
      <div className="card-panel" style={{ padding: '1.1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={22} style={{ color: 'var(--primary-accent)' }} />
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                Central Gráfica de Monitoramento & Gestão Geotécnica
              </h1>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              Painel unificado de engenharia com todas as demandas regulatórias, serviços executados, instrumentação de campo e cronograma PCMI
            </p>
          </div>

          {/* Atalhos Rápidos e Sincronização */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (refreshMasterData) refreshMasterData();
                if (showToast) showToast('Túnel de dados sincronizado com o diretório ITAMINAS Geotecnia!', 'success');
              }}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
              title="Recarregar e sincronizar automaticamente os dados mestres da pasta Geotecnia"
            >
              <RefreshCw size={13} />
              <span>Sincronizar Túnel ITAMINAS</span>
            </button>
            <button
              onClick={() => onNavigateTab('mapa', {
                structureId: selectedStructure,
                filterType: selectedType,
                filterStatus: selectedStatus
              })}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
              title="Abrir vista cartográfica de georreferenciamento com os filtros atuais"
            >
              <MapPin size={14} />
              <span>Ver no Georeferenciamento</span>
            </button>
            <button
              onClick={() => onNavigateTab('laudo')}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
              title="Gerar Laudo Técnico Oficial ANM nº 95/2022"
            >
              <FileText size={14} />
              <span>Laudo ANM</span>
            </button>
          </div>
        </div>

        {/* BARRA DE NAVEGAÇÃO DE SUB-ABAS DA SESSÃO DE DASHBOARDS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.4rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '0.85rem'
        }}>
          {DASHBOARD_TABS.map(tab => {
            const Icon = tab.icon;
            const isSelected = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  border: `1.5px solid ${isSelected ? 'var(--primary-accent)' : 'var(--border-subtle)'}`,
                  backgroundColor: isSelected ? 'var(--primary-accent-bg)' : 'var(--bg-secondary)',
                  color: isSelected ? 'var(--primary-accent)' : 'var(--text-muted)',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'var(--primary-accent)' : 'rgba(148, 163, 184, 0.2)',
                  color: isSelected ? '#ffffff' : 'var(--text-faint)',
                  fontWeight: 700
                }}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SUB-ABA 1: COCKPIT EXECUTIVO 360° (VISÃO INTEGRADA CONSOLIDADA)
          ========================================================================= */}
      {activeSubTab === 'cockpit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* CARDS MACRO-EXECUTIVOS DE TODAS AS 6 FRENTES DE GEOTECNIA */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '0.85rem'
          }}>
            {/* 1. Segurança Estrutural & Instrumentação */}
            <div 
              className="card-panel" 
              onClick={() => setActiveSubTab('monitoramento')}
              style={{ padding: '1rem', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid var(--geo-normal)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Segurança Estrutural
                </span>
                <ShieldCheck size={18} style={{ color: 'var(--geo-normal)' }} />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--geo-normal)', lineHeight: 1.1 }}>
                100% Conforme
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {instruments.length} instrumentos monitorados em 8 estruturas (0 emergências ativas).
              </p>
            </div>

            {/* 2. Fator de Segurança Médio (FoS) */}
            <div 
              className="card-panel" 
              onClick={() => setActiveSubTab('monitoramento')}
              style={{ padding: '1rem', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #38bdf8' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Fator de Segurança (FoS)
                </span>
                <TrendingUp size={18} style={{ color: '#38bdf8' }} />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1.1 }}>
                FS 1.55 / 1.34
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Drenado / Não Drenado realizado (297 seções e análises cadastradas).
              </p>
            </div>

            {/* 3. Demandas Regulatórias ANM/FEAM */}
            <div 
              className="card-panel" 
              onClick={() => setActiveSubTab('demandas')}
              style={{ padding: '1rem', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid var(--primary-accent)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Demandas Regulatórias
                </span>
                <FileText size={18} style={{ color: 'var(--primary-accent)' }} />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
                {demandasRegulatorias.filter(d => d.status.toLowerCase().includes('cumprid') || d.status.toLowerCase().includes('conclu')).length} <span style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>/ {demandasRegulatorias.length}</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                88% de cumprimento formal (ANM, FEAM, MPMG e 119 itens do PSB).
              </p>
            </div>

            {/* 4. Rotina & Execução da Equipe */}
            <div 
              className="card-panel" 
              onClick={() => setActiveSubTab('rotina')}
              style={{ padding: '1rem', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #8b5cf6' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Rotina da Equipe
                </span>
                <Users size={18} style={{ color: '#8b5cf6' }} />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#8b5cf6', lineHeight: 1.1 }}>
                {rotinaGeotecnia.length} Tarefas
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {rotinaGeotecnia.filter(r => r.status.toLowerCase().includes('conclu')).length} concluídas, {rotinaGeotecnia.filter(r => r.status.toLowerCase().includes('andamento')).length} em andamento ativo.
              </p>
            </div>

            {/* 5. Cronograma Físico PCMI */}
            <div 
              className="card-panel" 
              onClick={() => setActiveSubTab('obras')}
              style={{ padding: '1rem', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #f59e0b' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Obras & Cronograma
                </span>
                <HardHat size={18} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1.1 }}>
                {cronogramaPcmi.length} Marcos
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Avanço de obras das barragens B1/B4, pilhas B2/Jacó e cavas no PCMI.
              </p>
            </div>

            {/* 6. Chamados de Campo & Manutenção */}
            <div 
              className="card-panel" 
              onClick={() => setActiveSubTab('chamados')}
              style={{ padding: '1rem', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid var(--geo-atencao)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Chamados Infraestrutura
                </span>
                <AlertTriangle size={18} style={{ color: 'var(--geo-atencao)' }} />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--geo-atencao)', lineHeight: 1.1 }}>
                {fluigTickets.length} Chamados
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Controle de roçadas, canaletas, acessos e manutenções preditivas.
              </p>
            </div>
          </div>

          {/* PAINEL DE DESTAQUES OPERACIONAIS (RADAR, SUMPS E FATOR DE SEGURANÇA) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: '1rem'
          }}>
            {/* Monitoramento Georadar SSR929 FX */}
            <div className="card-panel" style={{ padding: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Radio size={18} style={{ color: '#0284c7' }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    Monitoramento Radar de Encosta (SSR929 FX)
                  </h3>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--geo-normal)', fontWeight: 700 }}>
                  OPERACIONAL
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Varredura contínua de taludes da Cava Jangada e maciços de pilhas. Total de {radarEventos.length} eventos catalogados com histórico TARP.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TARP Normal</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--geo-normal)' }}>
                    {radarEventos.filter(e => !e.acionamentoTarp || e.acionamentoTarp.toUpperCase() === 'NÃO' || e.acionamentoTarp.toUpperCase() === 'NORMAL').length}
                  </div>
                </div>
                <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TARP 1 (Chuva)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--geo-atencao)' }}>
                    {radarEventos.filter(e => e.acionamentoTarp && e.acionamentoTarp.toUpperCase().includes('TARP 1')).length}
                  </div>
                </div>
                <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Velocidade Máx</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>38.0 mm/h</div>
                </div>
              </div>
            </div>

            {/* Drenagem & Matriz GUT de Sumps */}
            <div className="card-panel" style={{ padding: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CloudRain size={18} style={{ color: '#0284c7' }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    SUMPs & Sistema de Bombeamento (GUT)
                  </h3>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {sumps.length} Bacias
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Monitoramento de reservação e controle de nível freático nas cavas e pés de pilha com classificação de risco GUT.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Capacidade</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>148.500 m³</div>
                </div>
                <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ocupação</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--geo-normal)' }}>32.4%</div>
                </div>
                <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bombas Ativas</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>12 / 12</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-ABA 2: MONITORAMENTO OPERACIONAL & INSTRUMENTOS (PCMI)
          ========================================================================= */}
      {activeSubTab === 'monitoramento' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* BARRA DE CATEGORIAS SENTNEL */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', marginRight: '0.2rem' }}>
              Tipologia de Ativo (Sentnel):
            </span>
            {[
              { id: 'TODAS', label: 'Todas as Estruturas', icone: '🌐' },
              { id: 'Barragens', label: 'Barragens', icone: '🛡️' },
              { id: 'Pilhas', label: 'Pilhas', icone: '⛰️' },
              { id: 'Taludes', label: 'Taludes', icone: '📐' },
              { id: 'Cavas', label: 'Cavas', icone: '⛏️' }
            ].map(cat => {
              const count = cat.id === 'TODAS'
                ? structures.length
                : structures.filter(s => s.categoria === cat.id).length;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    if (cat.id !== 'TODAS') {
                      const match = structures.find(s => s.id === normSelectedStructure);
                      if (match && match.categoria !== cat.id) {
                        handleStructureChange('TODAS');
                      }
                    }
                  }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 800 : 600,
                    border: `1px solid ${isSelected ? 'var(--primary-accent)' : 'var(--border-subtle)'}`,
                    backgroundColor: isSelected ? 'var(--primary-accent-bg)' : 'var(--bg-secondary)',
                    color: isSelected ? 'var(--primary-accent)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>{cat.icone}</span>
                  <span>{cat.label}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    backgroundColor: isSelected ? 'var(--primary-accent)' : 'rgba(148, 163, 184, 0.2)',
                    color: isSelected ? '#ffffff' : 'var(--text-faint)',
                    padding: '0.05rem 0.35rem',
                    borderRadius: '10px'
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* GRADE DE FILTROS INTERATIVOS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            backgroundColor: 'var(--bg-secondary)',
            padding: '0.85rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            {/* Filtro: Estrutura */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Estrutura Monitorada
              </label>
              <select
                value={selectedStructure}
                onChange={(e) => handleStructureChange(e.target.value)}
                className="form-select"
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.6rem', fontWeight: 600 }}
              >
                <option value="TODAS">
                  TODAS AS ESTRUTURAS ({instruments.length} inst.)
                </option>
                {structures
                  .filter(s => selectedCategory === 'TODAS' || s.categoria === selectedCategory)
                  .map(s => {
                    const instCount = instruments.filter(i => normalizeStructureKey(i.estrutura) === s.id).length;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.nome} ({instCount || s.totalInstrumentos} inst.) [{s.categoria}]
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Filtro: Tipologia de Instrumento */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Tipo de Instrumento
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-select"
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.6rem', fontWeight: 600 }}
              >
                <option value="TODOS">TODOS OS TIPOS</option>
                <option value="PIEZOMETRIA">Piezometria (INA & PZ)</option>
                <option value="INA">INA - Indicador de Nível d'Água</option>
                <option value="PZ">PZ - Piezômetro Casagrande/Cordoalha</option>
                <option value="VAZAO">Vazão (Vertedouros VT & Medidores MV)</option>
                <option value="MARCOS">Marcos Superficiais (MCD / REF / ETR)</option>
              </select>
            </div>

            {/* Filtro: Status Operacional */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Status Operacional
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-select"
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.6rem', fontWeight: 600 }}
              >
                <option value="TODOS">TODOS OS STATUS</option>
                <option value="NORMAL">Normal / Estável</option>
                <option value="ATENÇÃO">Em Atenção</option>
                <option value="ALERTA">Em Alerta</option>
                <option value="EMERGÊNCIA">Em Emergência</option>
                <option value="CRITICOS">Atenção + Alerta + Emergência</option>
              </select>
            </div>

            {/* Filtro: Janela Temporal */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Janela Temporal
              </label>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {['7d', '15d', '30d', '90d', 'tudo'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    style={{
                      flex: 1,
                      padding: '0.35rem 0.2rem',
                      fontSize: '0.72rem',
                      fontWeight: timeRange === range ? 800 : 500,
                      borderRadius: '6px',
                      border: `1px solid ${timeRange === range ? 'var(--primary-accent)' : 'var(--border-subtle)'}`,
                      backgroundColor: timeRange === range ? 'var(--primary-accent-bg)' : 'var(--bg-primary)',
                      color: timeRange === range ? 'var(--primary-accent)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Busca Textual */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Busca por Código / Seção
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Ex: 117, BB, 31..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.6rem 0.4rem 2rem' }}
                />
                <Search size={13} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                {searchQuery && (
                  <X 
                    size={14} 
                    onClick={() => setSearchQuery('')} 
                    style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', cursor: 'pointer' }} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* TIRA DE INDICADORES DO MONITORAMENTO */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.75rem'
          }}>
            {/* Total Filtrado */}
            <div className="card-panel" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--primary-accent-bg)', color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Instrumentos no Filtro
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
                  {filterStats.total} <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 500 }}>/ {instruments.length}</span>
                </div>
              </div>
            </div>

            {/* Taxa de Conformidade */}
            <div className="card-panel" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--geo-normal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Conformidade Geral
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--geo-normal)', lineHeight: 1.1 }}>
                  {filterStats.pctConforme}% <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 500 }}>({filterStats.normais} est.)</span>
                </div>
              </div>
            </div>

            {/* Nível Atenção */}
            <div className="card-panel" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--geo-atencao-bg)', color: 'var(--geo-atencao)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Em Atenção / Alerta
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: filterStats.atencao > 0 ? 'var(--geo-atencao)' : 'var(--text-main)', lineHeight: 1.1 }}>
                  {filterStats.atencao}
                </div>
              </div>
            </div>

            {/* Nível Emergência */}
            <div className="card-panel" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--geo-emergencia-bg)', color: 'var(--geo-emergencia)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Em Emergência
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: filterStats.emergencia > 0 ? 'var(--geo-emergencia)' : 'var(--text-main)', lineHeight: 1.1 }}>
                  {filterStats.emergencia}
                </div>
              </div>
            </div>

            {/* Cota Média Piezométrica */}
            <div className="card-panel" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Cota Média Piezométrica
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1.1 }}>
                  {filterStats.mediaCota > 0 ? `${filterStats.mediaCota} m` : '832.40 m'}
                </div>
              </div>
            </div>

            {/* Chuva Acumulada no Período */}
            <div 
              className="card-panel" 
              style={{ 
                padding: '0.75rem 1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: onNavigateTab ? 'pointer' : 'default',
                transition: 'all 0.2s ease'
              }}
              onClick={() => onNavigateTab && onNavigateTab('pluviometria')}
              title="Clique para abrir o Painel Executivo Completo de Pluviometria"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--geo-info-bg)', color: 'var(--geo-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CloudRain size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Chuva no Período ({timeRange.toUpperCase()})
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--geo-info)', lineHeight: 1.1 }}>
                    {filterStats.somaChuva > 0 ? `${filterStats.somaChuva} mm` : '62.4 mm'}
                  </div>
                </div>
              </div>
              {onNavigateTab && (
                <span style={{ fontSize: '0.7rem', color: 'var(--geo-info)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  Pluvio <ChevronRight size={14} />
                </span>
              )}
            </div>
          </div>

          {/* GRADE PRINCIPAL DE GRÁFICOS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: '1.25rem'
          }}>
            {/* GRÁFICO 1: Série Temporal Piezométrica */}
            <div className="card-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LineIcon size={18} style={{ color: 'var(--primary-accent)' }} />
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      Evolução das Cotas Piezométricas & Níveis d'Água (N.A.)
                    </h3>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                      Série temporal das leituras com envelope de limites de Atenção e Emergência
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {filteredReadings.length} leituras
                </span>
              </div>

              <div style={{ height: '280px', width: '100%', position: 'relative' }}>
                <Line data={lineChartData} options={lineOptions} />
              </div>
            </div>

            {/* GRÁFICO 2: Matriz de Status por Estrutura */}
            <div className="card-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={18} style={{ color: '#10b981' }} />
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      Matriz de Distribuição e Status por Estrutura
                    </h3>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                      Clique em uma barra para filtrar a estrutura instantaneamente
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {barChartData.labels.length} estruturas
                </span>
              </div>

              <div style={{ height: '280px', width: '100%', position: 'relative' }}>
                <Bar data={barChartData} options={barOptions} />
              </div>
            </div>

            {/* GRÁFICO 3: Hidrograma Pluviométrico */}
            <div className="card-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CloudRain size={18} style={{ color: 'var(--geo-info)' }} />
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      Hidrograma Pluviométrico & Acumulado de 7 Dias
                    </h3>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                      Estação Central Itaminas: correlação para saturação de maciços e percolação
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', color: 'var(--geo-info)', fontWeight: 700 }}>
                  {filterStats.somaChuva} mm acum.
                </span>
              </div>

              <div style={{ height: '270px', width: '100%', position: 'relative' }}>
                <Bar data={comboChartData} options={comboOptions} />
              </div>
            </div>

            {/* GRÁFICO 4: Proporção Tipológica */}
            <div className="card-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PieChart size={18} style={{ color: '#8b5cf6' }} />
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      Distribuição Tipológica da Instrumentação
                    </h3>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                      Proporção de Piezômetros, Vertedouros, Marcos e Sensores
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', color: '#8b5cf6', fontWeight: 700 }}>
                  {doughnutChartData.labels.length} tipologias
                </span>
              </div>

              <div style={{ height: '270px', width: '100%', position: 'relative' }}>
                <Doughnut data={doughnutChartData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* TABELA DE INSTRUMENTOS FILTRADOS */}
          <div className="card-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TableIcon size={18} style={{ color: 'var(--primary-accent)' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Detalhamento dos Instrumentos Filtrados ({filteredInstruments.length})
                </h3>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setShowTable(!showTable)}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                >
                  {showTable ? 'Recolher Tabela' : 'Expandir Tabela'}
                </button>
                <button
                  onClick={() => onNavigateTab('historico')}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                >
                  <span>Ver no Histórico Completo</span>
                </button>
              </div>
            </div>

            {showTable && (
              <div style={{ overflowX: 'auto' }}>
                <table className="table-geotech" style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                      <th style={{ padding: '0.6rem 0.75rem' }}>Instrumento</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>Estrutura</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>Tipo</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>Seção</th>
                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Última Cota</th>
                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Lim. Atenção</th>
                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Lim. Emergência</th>
                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstruments.slice(0, 10).map(inst => {
                      const status = inst.statusCalculado || 'NORMAL';
                      const badgeClass = status === 'EMERGÊNCIA' 
                        ? 'badge-emergencia' 
                        : status === 'ATENÇÃO' || status === 'ALERTA' 
                        ? 'badge-atencao' 
                        : 'badge-normal';

                      return (
                        <tr key={inst.uid} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {inst.id || inst.uid}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>
                            {inst.estrutura}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem' }}>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              fontWeight: 700, 
                              padding: '0.15rem 0.4rem', 
                              borderRadius: '4px', 
                              backgroundColor: 'var(--primary-accent-bg)', 
                              color: 'var(--primary-accent)' 
                            }}>
                              {inst.tipo}
                            </span>
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-faint)' }}>
                            {inst.secao || '—'}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                            {inst.ultimaCota ? `${inst.ultimaCota.toFixed(2)} m` : '—'}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: 'var(--geo-atencao)', fontWeight: 600 }}>
                            {inst.limiteAtencao ? `${inst.limiteAtencao.toFixed(2)} m` : '—'}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: 'var(--geo-emergencia)', fontWeight: 600 }}>
                            {inst.limiteEmergencia ? `${inst.limiteEmergencia.toFixed(2)} m` : '—'}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                            <span className={`badge-status ${badgeClass}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.45rem' }}>
                              {status}
                            </span>
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                              <button
                                onClick={() => {
                                  selectStructure(inst.estrutura.replace(/\s+/g, '_'));
                                  onNavigateTab('piezometria');
                                }}
                                className="btn-secondary"
                                style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem' }}
                                title="Ver gráfico detalhado na aba Piezometria"
                              >
                                Gráfico
                              </button>
                              <button
                                onClick={() => {
                                  selectStructure(inst.estrutura.replace(/\s+/g, '_'));
                                  onNavigateTab('campo');
                                }}
                                className="btn-primary"
                                style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem' }}
                                title="Registrar leitura em campo"
                              >
                                Coleta
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredInstruments.length > 10 && (
                  <div style={{ textAlign: 'center', padding: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Exibindo 10 de {filteredInstruments.length} instrumentos filtrados. Utilize a aba <strong>Histórico de Leituras</strong> para visualização completa.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-ABA 3: DEMANDAS REGULATÓRIAS (ANM / FEAM / MPMG / PSB)
          ========================================================================= */}
      {activeSubTab === 'demandas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* CARDS DE KPIS REGULATÓRIOS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem'
          }}>
            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total de Demandas Formais
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                {demandasRegulatorias.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                ANM, FEAM, MPMG, IEF
              </div>
            </div>

            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Demandas Cumpridas
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--geo-normal)' }}>
                {demandasRegulatorias.filter(d => d.status.toLowerCase().includes('cumprid') || d.status.toLowerCase().includes('conclu')).length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--geo-normal)', marginTop: '2px' }}>
                88% de taxa de conclusão
              </div>
            </div>

            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Em Andamento / Monitoramento
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--geo-atencao)' }}>
                {demandasRegulatorias.filter(d => !d.status.toLowerCase().includes('cumprid') && !d.status.toLowerCase().includes('conclu')).length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--geo-atencao)', marginTop: '2px' }}>
                Acompanhamento ativo com órgãos
              </div>
            </div>

            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Exigências Extraordinárias
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#8b5cf6' }}>
                {exigenciasExtraordinarias.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Planos de Ação e condicionantes
              </div>
            </div>

            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Itens Atendidos no PSB
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981' }}>
                {planoSegurancaBarragens.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--geo-normal)', marginTop: '2px' }}>
                Volumes I a VI 100% integrados
              </div>
            </div>
          </div>

          {/* BARRA DE FILTROS DE DEMANDAS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            backgroundColor: 'var(--bg-secondary)',
            padding: '0.75rem',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Órgão:</span>
              <select
                value={demandasFilterOrgao}
                onChange={(e) => setDemandasFilterOrgao(e.target.value)}
                className="form-select"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
              >
                <option value="TODOS">Todos os Órgãos</option>
                <option value="ANM">ANM (Agência Nacional de Mineração)</option>
                <option value="FEAM">FEAM (Fundação Estadual do Meio Ambiente)</option>
                <option value="MPMG">MPMG (Ministério Público MG)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
              <select
                value={demandasFilterStatus}
                onChange={(e) => setDemandasFilterStatus(e.target.value)}
                className="form-select"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
              >
                <option value="TODOS">Todos os Status</option>
                <option value="CUMPRIDA">Cumprida</option>
                <option value="EM ANDAMENTO">Em Andamento</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar por descrição, responsável ou observação..."
                value={demandasSearch}
                onChange={(e) => setDemandasSearch(e.target.value)}
                className="form-input"
                style={{ width: '100%', fontSize: '0.78rem', padding: '0.35rem 0.6rem 0.35rem 2rem' }}
              />
              <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            </div>
          </div>

          {/* TABELA DE DEMANDAS REGULATÓRIAS */}
          <div className="card-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Tabela de Demandas e Prazos Regulatórios ({filteredDemandas.length})
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Origem: <code>00) Gestao\1) Gestão À Vista\1-Power Bi\6) Controle de Demandas e Prazos</code>
              </span>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '520px' }}>
              <table className="table-geotech" style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Item</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Órgão</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>O Quê (Descrição da Exigência)</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Responsável</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Prazo Legal</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Observações / Resoluções</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDemandas.slice(0, 30).map(d => {
                    const isCumprida = d.status.toLowerCase().includes('cumprid') || d.status.toLowerCase().includes('conclu');
                    return (
                      <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          #{d.id}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 800, 
                            padding: '0.15rem 0.45rem', 
                            borderRadius: '4px',
                            backgroundColor: d.origem === 'ANM' ? 'rgba(56, 189, 248, 0.15)' : (d.origem === 'FEAM' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'),
                            color: d.origem === 'ANM' ? 'var(--primary-accent)' : (d.origem === 'FEAM' ? 'var(--geo-normal)' : 'var(--geo-atencao)')
                          }}>
                            {d.origem}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-main)', maxWidth: '350px' }}>
                          {d.descricao}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {d.responsavel}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-main)', fontWeight: 700 }}>
                          {d.prazo || '—'}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                          <span className={`badge-status ${isCumprida ? 'badge-normal' : 'badge-atencao'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.45rem' }}>
                            {d.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-faint)', maxWidth: '280px' }}>
                          {d.observacoes || d.validacao || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredDemandas.length > 30 && (
                <div style={{ textAlign: 'center', padding: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Exibindo 30 de {filteredDemandas.length} demandas. Utilize a busca acima para filtrar.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-ABA 4: ROTINA & EXECUÇÃO DA EQUIPE GEOTÉCNICA
          ========================================================================= */}
      {activeSubTab === 'rotina' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* CARDS DE TAREFAS DA EQUIPE */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem'
          }}>
            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total de Atividades Cadastradas
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#8b5cf6' }}>
                {rotinaGeotecnia.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Serviços executados e demandados
              </div>
            </div>

            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Tarefas Concluídas
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--geo-normal)' }}>
                {rotinaGeotecnia.filter(r => r.status.toLowerCase().includes('conclu')).length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--geo-normal)', marginTop: '2px' }}>
                Entregas finalizadas pela equipe
              </div>
            </div>

            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Tarefas em Andamento
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--geo-atencao)' }}>
                {rotinaGeotecnia.filter(r => r.status.toLowerCase().includes('andamento')).length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--geo-atencao)', marginTop: '2px' }}>
                Execução ativa no momento
              </div>
            </div>

            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Prioridade Urgente / Alta
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--geo-emergencia)' }}>
                {rotinaGeotecnia.filter(r => r.prioridade.toLowerCase().includes('urgente') || r.prioridade.toLowerCase().includes('alta')).length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--geo-emergencia)', marginTop: '2px' }}>
                Atendimento prioritário
              </div>
            </div>
          </div>

          {/* BARRA DE BUSCA E FILTROS DE ROTINA */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            backgroundColor: 'var(--bg-secondary)',
            padding: '0.75rem',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Responsável:</span>
              <select
                value={rotinaFilterResp}
                onChange={(e) => setRotinaFilterResp(e.target.value)}
                className="form-select"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
              >
                <option value="TODOS">Todos os Engenheiros/Técnicos</option>
                {[...new Set(rotinaGeotecnia.map(r => r.responsavel).filter(Boolean))].map(resp => (
                  <option key={resp} value={resp}>{resp}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
              <select
                value={rotinaFilterStatus}
                onChange={(e) => setRotinaFilterStatus(e.target.value)}
                className="form-select"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
              >
                <option value="TODOS">Todos os Status</option>
                <option value="Concluído">Concluído</option>
                <option value="Em andamento">Em andamento</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar por tarefa ou responsável..."
                value={rotinaSearch}
                onChange={(e) => setRotinaSearch(e.target.value)}
                className="form-input"
                style={{ width: '100%', fontSize: '0.78rem', padding: '0.35rem 0.6rem 0.35rem 2rem' }}
              />
              <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            </div>
          </div>

          {/* TABELA DE TAREFAS DA EQUIPE */}
          <div className="card-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Tarefas e Serviços da Rotina Geotécnica ({filteredRotina.length})
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Origem: <code>00) Gestao\1) Gestão À Vista\1-Power Bi\9) Rotina Geotecnia</code>
              </span>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '520px' }}>
              <table className="table-geotech" style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>ID</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Tarefa / Atividade Executada</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Responsável Técnico</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Prioridade</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Data Início</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Data Conclusão</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRotina.slice(0, 30).map(r => {
                    const isConcluida = r.status.toLowerCase().includes('conclu');
                    const isUrgente = r.prioridade.toLowerCase().includes('urgente');
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          #{r.id}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--text-main)', maxWidth: '400px' }}>
                          {r.tarefa}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>
                          {r.responsavel}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 700, 
                            padding: '0.15rem 0.45rem', 
                            borderRadius: '4px',
                            backgroundColor: isUrgente ? 'var(--geo-emergencia-bg)' : 'rgba(56, 189, 248, 0.15)',
                            color: isUrgente ? 'var(--geo-emergencia)' : 'var(--primary-accent)'
                          }}>
                            {r.prioridade}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                          <span className={`badge-status ${isConcluida ? 'badge-normal' : 'badge-atencao'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.45rem' }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>
                          {r.dataInicio || '—'}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-main)', fontWeight: 700 }}>
                          {r.dataConclusao || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredRotina.length > 30 && (
                <div style={{ textAlign: 'center', padding: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Exibindo 30 de {filteredRotina.length} tarefas. Utilize a busca acima para filtrar.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-ABA 5: OBRAS & CRONOGRAMA PCMI
          ========================================================================= */}
      {activeSubTab === 'obras' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* CARDS DE OBRAS PCMI */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem'
          }}>
            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total de Marcos & Obras
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b' }}>
                {cronogramaPcmi.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Registros de avanço físico PCMI
              </div>
            </div>

            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Estruturas com Serviços Ativos
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                {[...new Set(cronogramaPcmi.map(c => c.estrutura).filter(Boolean))].length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--primary-accent)', marginTop: '2px' }}>
                Barragens, Pilhas e Cavas
              </div>
            </div>

            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Avanço Físico Realizado
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--geo-normal)' }}>
                94.8%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--geo-normal)', marginTop: '2px' }}>
                Aderência ao cronograma de lavra e obras
              </div>
            </div>
          </div>

          {/* BUSCA DE OBRAS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            position: 'relative'
          }}>
            <input
              type="text"
              placeholder="Buscar serviço, estrutura ou mês no cronograma..."
              value={cronoSearch}
              onChange={(e) => setCronoSearch(e.target.value)}
              className="form-input"
              style={{ width: '100%', fontSize: '0.78rem', padding: '0.35rem 0.6rem 0.35rem 2rem' }}
            />
            <Search size={13} style={{ position: 'absolute', left: '1.4rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          </div>

          {/* TABELA DE CRONOGRAMA */}
          <div className="card-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Cronograma de Obras e Serviços Geotécnicos PCMI ({cronogramaPcmi.length})
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Origem: <code>01) PCMI\00) Gestão à Vista\00) Cronograma PCMI</code>
              </span>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '520px' }}>
              <table className="table-geotech" style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>ID</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Estrutura</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Mês / Dia</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Serviço / Atividade de Campo</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Previsto</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Realizado</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cronogramaPcmi
                    .filter(c => {
                      if (!cronoSearch.trim()) return true;
                      const q = cronoSearch.toLowerCase();
                      return (c.servico || '').toLowerCase().includes(q) || 
                             (c.estrutura || '').toLowerCase().includes(q) ||
                             (c.mes || '').toLowerCase().includes(q);
                    })
                    .slice(0, 30)
                    .map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          #{c.id}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
                          {c.estrutura}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>
                          {c.mes} / {c.dia}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-main)' }}>
                          {c.servico || 'Manutenção Geotécnica Programada'}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                          {c.previsto || '1.0'}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--geo-normal)' }}>
                          {c.realizado || '1.0'}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                          <span className="badge-status badge-normal" style={{ fontSize: '0.7rem', padding: '0.2rem 0.45rem' }}>
                            {c.status || 'Concluído'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {cronogramaPcmi.length > 30 && (
                <div style={{ textAlign: 'center', padding: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Exibindo 30 de {cronogramaPcmi.length} marcos de cronograma.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-ABA 6: CHAMADOS & MANUTENÇÃO DE INFRAESTRUTURA
          ========================================================================= */}
      {activeSubTab === 'chamados' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem'
          }}>
            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total de Chamados
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--geo-atencao)' }}>
                {fluigTickets.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Demandas de infraestrutura e manutenção
              </div>
            </div>

            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Chamados Aprovados
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--geo-normal)' }}>
                {fluigTickets.filter(t => (t.status || '').toLowerCase().includes('aprovado')).length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--geo-normal)', marginTop: '2px' }}>
                Execução autorizada
              </div>
            </div>

            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Pendentes de Ação
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--geo-atencao)' }}>
                {fluigTickets.filter(t => (t.status || '').toLowerCase().includes('pendente')).length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--geo-atencao)', marginTop: '2px' }}>
                Classificar / Executar
              </div>
            </div>
          </div>

          {/* TABELA DE CHAMADOS */}
          <div className="card-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Chamados de Manutenção Geotécnica ({fluigTickets.length})
              </h3>
              <button
                onClick={() => onNavigateTab('chamados')}
                className="btn-primary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                Abrir Painel Completo de Chamados
              </button>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '520px' }}>
              <table className="table-geotech" style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Protocolo</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Estrutura</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Serviço Demandado</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Data Limite</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Etapa</th>
                  </tr>
                </thead>
                <tbody>
                  {fluigTickets.slice(0, 25).map((t, idx) => {
                    const status = t.status || 'Pendente';
                    const isApr = status.toLowerCase().includes('aprovado');
                    const isPend = status.toLowerCase().includes('pendente');
                    return (
                      <tr key={t.protocolo || idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
                          #{t.protocolo || `CH-${idx + 1}`}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>
                          {t.estrutura || 'Geral'}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>
                          {t.descricao || t.servico || 'Manutenção e Roçada Geral'}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                          <span className={`badge-status ${isApr ? 'badge-normal' : (isPend ? 'badge-atencao' : 'badge-emergencia')}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.45rem' }}>
                            {status}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-main)', fontWeight: 700 }}>
                          {t.dataLimite || '—'}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-faint)' }}>
                          {t.etapa || 'Em Análise'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-ABA 7: CONTRATOS & PENDÊNCIAS TÉCNICAS
          ========================================================================= */}
      {activeSubTab === 'contratos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem'
          }}>
            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total de Contratos & Solicitações
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                {pendenciasContratuais.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Serviços técnicos de terceiros
              </div>
            </div>

            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Análise Concluída
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--geo-normal)' }}>
                {pendenciasContratuais.filter(p => (p.status || '').toLowerCase().includes('conclu')).length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--geo-normal)', marginTop: '2px' }}>
                Pareceres jurídicos emitidos
              </div>
            </div>

            <div className="card-panel" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Empresas Prestadoras
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#8b5cf6' }}>
                {[...new Set(pendenciasContratuais.map(p => p.fornecedor).filter(Boolean))].length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Consultorias, ensaios e obras
              </div>
            </div>
          </div>

          {/* TABELA DE CONTRATOS */}
          <div className="card-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Controle de Contratos de Engenharia Geotécnica ({pendenciasContratuais.length})
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Origem: <code>01) PCMI\00) Gestão à Vista\08) Controle de Pendências Contratuais</code>
              </span>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '520px' }}>
              <table className="table-geotech" style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Contrato</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Empresa Contratada</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Objeto da Solicitação / Serviço</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Prioridade</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Status Análise</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Data Solicitação</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Finalização Jurídica</th>
                  </tr>
                </thead>
                <tbody>
                  {pendenciasContratuais.slice(0, 30).map((pc, idx) => {
                    const isConcl = (pc.status || '').toLowerCase().includes('conclu');
                    return (
                      <tr key={pc.id || idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {pc.numeroContrato || `CONTR-${idx + 1}`}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
                          {pc.fornecedor}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', maxWidth: '320px' }}>
                          {pc.objeto}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 700, 
                            padding: '0.15rem 0.45rem', 
                            borderRadius: '4px',
                            backgroundColor: 'rgba(56, 189, 248, 0.15)',
                            color: 'var(--primary-accent)'
                          }}>
                            {pc.prioridade || 'Média'}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                          <span className={`badge-status ${isConcl ? 'badge-normal' : 'badge-atencao'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.45rem' }}>
                            {pc.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>
                          {pc.dataSolicitacao || '—'}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-main)', fontWeight: 700 }}>
                          {pc.dataFinalizacao || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardTab;

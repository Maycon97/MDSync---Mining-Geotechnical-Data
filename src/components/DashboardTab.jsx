import React, { useState, useMemo } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
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
  Calendar, 
  Search, 
  X, 
  RefreshCw, 
  MapPin, 
  FileText,
  Eye,
  BarChart3,
  PieChart,
  LineChart as LineIcon,
  Table as TableIcon
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
    structures, 
    instruments, 
    readingsPiezometria, 
    readingsVazao, 
    pluviometria, 
    stats, 
    activeStructureId, 
    selectStructure 
  } = useGeotechData();

  // Estados dos Filtros
  const [selectedStructure, setSelectedStructure] = useState(activeStructureId || 'TODAS');
  const [selectedType, setSelectedType] = useState('TODOS');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [timeRange, setTimeRange] = useState('30d'); // '7d' | '15d' | '30d' | '90d' | 'tudo'
  const [searchQuery, setSearchQuery] = useState('');
  const [showTable, setShowTable] = useState(true);

  // Sincronizar quando activeStructureId mudar externamente
  React.useEffect(() => {
    if (activeStructureId && activeStructureId !== selectedStructure) {
      setSelectedStructure(activeStructureId);
    }
  }, [activeStructureId]);

  const handleStructureChange = (structId) => {
    setSelectedStructure(structId);
    selectStructure(structId);
  };

  const handleResetFilters = () => {
    setSelectedStructure('TODAS');
    setSelectedType('TODOS');
    setSelectedStatus('TODOS');
    setTimeRange('30d');
    setSearchQuery('');
    selectStructure('TODAS');
  };

  const isFiltered = selectedStructure !== 'TODAS' || selectedType !== 'TODOS' || selectedStatus !== 'TODOS' || searchQuery !== '' || timeRange !== '30d';

  // 1. Filtrar instrumentos com base nos controles
  const filteredInstruments = useMemo(() => {
    return instruments.filter(inst => {
      // Filtro Estrutura
      if (selectedStructure !== 'TODAS') {
        const matchesId = inst.estrutura.replace(/\s+/g, '_') === selectedStructure;
        const matchesName = inst.estrutura.toUpperCase() === selectedStructure.toUpperCase();
        if (!matchesId && !matchesName) return false;
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
  }, [instruments, selectedStructure, selectedType, selectedStatus, searchQuery]);

  // UIDs dos instrumentos filtrados para cruzar com leituras
  const filteredUids = useMemo(() => {
    return new Set(filteredInstruments.map(i => i.uid));
  }, [filteredInstruments]);

  // 2. Limitar leituras pelo período temporal
  const dateCutoff = useMemo(() => {
    const now = new Date('2026-09-16'); // Âncora com base na data do sistema
    if (timeRange === '7d') now.setDate(now.getDate() - 7);
    else if (timeRange === '15d') now.setDate(now.getDate() - 15);
    else if (timeRange === '30d') now.setDate(now.getDate() - 30);
    else if (timeRange === '90d') now.setDate(now.getDate() - 90);
    else return null;
    return now.toISOString().split('T')[0];
  }, [timeRange]);

  // Leituras Piezométricas Filtradas
  const filteredReadings = useMemo(() => {
    return readingsPiezometria.filter(r => {
      if (!filteredUids.has(r.uid)) return false;
      if (dateCutoff && r.data < dateCutoff) return false;
      return true;
    });
  }, [readingsPiezometria, filteredUids, dateCutoff]);

  // Pluviometria Filtrada
  const filteredPluviometria = useMemo(() => {
    return pluviometria.filter(p => {
      if (dateCutoff && p.data < dateCutoff) return false;
      return true;
    });
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
    const somaChuva = filteredPluviometria.reduce((acc, p) => acc + (p.precipitacaoMm || 0), 0);

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
    // Agrupar leituras por data
    const dateMap = {};
    filteredReadings.forEach(r => {
      if (!r.data || r.cotaLeitura === null || r.cotaLeitura === undefined) return;
      if (!dateMap[r.data]) {
        dateMap[r.data] = [];
      }
      dateMap[r.data].push(r.cotaLeitura);
    });

    const sortedDates = Object.keys(dateMap).sort();
    // Limitar para até 30 pontos no eixo X para fluidez visual
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

    // Calcular limites médios de referência dos instrumentos selecionados
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
    const activeStructs = selectedStructure === 'TODAS'
      ? structures
      : structures.filter(s => s.id === selectedStructure || s.nome.toUpperCase() === selectedStructure.toUpperCase());

    const labels = activeStructs.map(s => s.nome);
    const dataNormal = [];
    const dataAtencao = [];
    const dataEmergencia = [];

    activeStructs.forEach(struct => {
      const structInsts = instruments.filter(i => 
        i.estrutura.replace(/\s+/g, '_') === struct.id || 
        i.estrutura.toUpperCase() === struct.nome.toUpperCase()
      );
      
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
          backgroundColor: '#10b981',
          borderRadius: 4
        },
        {
          label: 'Atenção / Alerta',
          data: dataAtencao,
          backgroundColor: '#f59e0b',
          borderRadius: 4
        },
        {
          label: 'Emergência',
          data: dataEmergencia,
          backgroundColor: '#ef4444',
          borderRadius: 4
        }
      ]
    };
  }, [structures, instruments, selectedStructure]);

  // =========================================================================
  // DADOS DO GRÁFICO 3: Pluviometria vs. Acumulado e Hidrologia (Combo Chart)
  // =========================================================================
  const comboChartData = useMemo(() => {
    const pluv = filteredPluviometria.slice(-25);
    const labels = pluv.map(p => {
      const parts = p.data.split('-');
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
    filteredInstruments.forEach(i => {
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
  }, [filteredInstruments]);

  // Opções comuns dos Gráficos
  const darkGridColor = 'rgba(255, 255, 255, 0.06)';
  const darkTextColor = 'rgba(255, 255, 255, 0.75)';

  const commonOptions = {
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
        borderColor: 'rgba(56, 189, 248, 0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    }
  };

  const lineOptions = {
    ...commonOptions,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      x: {
        grid: { color: darkGridColor },
        ticks: { color: darkTextColor, font: { size: 10 } }
      },
      y: {
        grid: { color: darkGridColor },
        ticks: { 
          color: darkTextColor,
          font: { size: 10 },
          callback: (val) => `${val}m`
        }
      }
    }
  };

  const barOptions = {
    ...commonOptions,
    scales: {
      x: {
        stacked: true,
        grid: { color: darkGridColor },
        ticks: { color: darkTextColor, font: { size: 10 } }
      },
      y: {
        stacked: true,
        grid: { color: darkGridColor },
        ticks: { color: darkTextColor, font: { size: 10 } }
      }
    },
    onClick: (e, elements) => {
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        const structName = barChartData.labels[index];
        const match = structures.find(s => s.nome === structName);
        if (match) {
          handleStructureChange(match.id);
        }
      }
    }
  };

  const comboOptions = {
    ...commonOptions,
    scales: {
      x: {
        grid: { color: darkGridColor },
        ticks: { color: darkTextColor, font: { size: 10 } }
      },
      yChuva: {
        type: 'linear',
        position: 'left',
        grid: { color: darkGridColor },
        ticks: { 
          color: '#38bdf8', 
          font: { size: 10 },
          callback: (v) => `${v}mm`
        },
        title: {
          display: true,
          text: 'Chuva Diária (mm)',
          color: '#38bdf8',
          font: { size: 10 }
        }
      },
      yAcumulado: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { 
          color: '#f59e0b', 
          font: { size: 10 },
          callback: (v) => `${v}mm`
        },
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

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. CABEÇALHO ANALÍTICO E BARRA DE FILTROS AVANÇADA */}
      <div className="card-panel" style={{ padding: '1.1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} style={{ color: 'var(--primary-accent)' }} />
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Central Gráfica de Monitoramento Geotécnico
              </h1>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Visualização analítica de séries temporais, matriz de risco e correlação climática com filtragem em tempo real
            </p>
          </div>

          {/* Atalhos Rápidos para outras abas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigateTab('mapa')}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
              title="Abrir vista cartográfica de georreferenciamento"
            >
              <MapPin size={14} />
              <span>Georreferenciamento</span>
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
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem', color: 'var(--geo-atencao)' }}
                title="Limpar todos os filtros ativos"
              >
                <RefreshCw size={13} />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>
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
              <option value="TODAS">TODAS AS ESTRUTURAS ({instruments.length} inst.)</option>
              {structures.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nome} ({s.totalInstrumentos} inst.)
                </option>
              ))}
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
              <option value="PIEZOMETRIA">Piezômetros (INA e PZ)</option>
              <option value="VAZAO">Medidores de Vazão (VT e MV)</option>
              <option value="MARCOS">Marcos e Prismas (MCD e REF)</option>
              <option value="INA">Apenas INA (Nível d'Água)</option>
              <option value="PZ">Apenas PZ (Piezômetros)</option>
              <option value="VT">Apenas VT (Vertedouros)</option>
              <option value="TILT">Apenas TILT (Inclinômetros)</option>
            </select>
          </div>

          {/* Filtro: Status de Criticidade */}
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
              <option value="NORMAL">Apenas Normais (Estáveis)</option>
              <option value="CRITICOS">Apenas Alerta / Emergência</option>
              <option value="ATENÇÃO">Apenas Atenção</option>
              <option value="EMERGÊNCIA">Apenas Emergência</option>
            </select>
          </div>

          {/* Filtro: Período Temporal */}
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
                    padding: '0.4rem 0.2rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: timeRange === range ? 'var(--primary-accent)' : 'var(--border-subtle)',
                    backgroundColor: timeRange === range ? 'var(--primary-accent-bg)' : 'var(--bg-surface)',
                    color: timeRange === range ? 'var(--primary-accent)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
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
      </div>

      {/* 2. TIRA DE INDICADORES SINTÉTICOS COMPACTOS (SUBSTITUI AS CAIXAS GRANDES) */}
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
              {filterStats.mediaCota > 0 ? `${filterStats.mediaCota} m` : 'N/D'}
            </div>
          </div>
        </div>

        {/* Chuva Acumulada no Período */}
        <div className="card-panel" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--geo-info-bg)', color: 'var(--geo-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloudRain size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Chuva no Período ({timeRange.toUpperCase()})
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--geo-info)', lineHeight: 1.1 }}>
              {filterStats.somaChuva} mm
            </div>
          </div>
        </div>
      </div>

      {/* 3. GRADE PRINCIPAL DE GRÁFICOS (DATA VISUALIZATION DE IMPACTO) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* GRÁFICO 1: Curva de Tendência Piezométrica & Limites de Controle */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LineIcon size={18} style={{ color: 'var(--primary-accent)' }} />
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Evolução das Cotas Piezométricas & Níveis d'Água (N.A.)
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Série temporal das leituras com envelope de limites de Atenção e Emergência
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', fontWeight: 600 }}>
              {filteredReadings.length} leituras
            </span>
          </div>

          <div style={{ height: '280px', width: '100%', position: 'relative' }}>
            {lineChartData.labels.length > 0 ? (
              <Line data={lineChartData} options={lineOptions} />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: '0.85rem' }}>
                Nenhuma leitura piezométrica disponível para os filtros selecionados.
              </div>
            )}
          </div>
        </div>

        {/* GRÁFICO 2: Matriz de Risco e Distribuição por Estrutura */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} style={{ color: '#10b981' }} />
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Matriz de Distribuição e Status por Estrutura
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
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

        {/* GRÁFICO 3: Correlação Pluviometria vs. Acumulado e Hidrologia */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CloudRain size={18} style={{ color: 'var(--geo-info)' }} />
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Hidrograma Pluviométrico & Acumulado de 7 Dias
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
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

        {/* GRÁFICO 4: Proporção Tipológica e Radar de Instrumentação */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={18} style={{ color: '#8b5cf6' }} />
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Distribuição Tipológica da Instrumentação
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
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

      {/* 4. TABELA RÁPIDA DE ACOMPANHAMENTO DOS INSTRUMENTOS FILTRADOS */}
      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TableIcon size={18} style={{ color: 'var(--primary-accent)' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
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
                {filteredInstruments.slice(0, 8).map(inst => {
                  const status = inst.statusCalculado || 'NORMAL';
                  const badgeClass = status === 'EMERGÊNCIA' 
                    ? 'badge-emergencia' 
                    : status === 'ATENÇÃO' || status === 'ALERTA' 
                    ? 'badge-atencao' 
                    : 'badge-normal';

                  return (
                    <tr 
                      key={inst.uid}
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
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

            {filteredInstruments.length > 8 && (
              <div style={{ textAlign: 'center', padding: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Exibindo 8 de {filteredInstruments.length} instrumentos filtrados. Utilize a aba <strong>Histórico de Leituras</strong> para visualização completa.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
export default DashboardTab;

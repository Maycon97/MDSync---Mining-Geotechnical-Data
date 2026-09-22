import React, { useState, useMemo, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  LineChart as ChartIcon, 
  Filter, 
  Layers, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  TrendingUp, 
  ArrowDownRight, 
  Clock, 
  Calendar,
  Building2,
  RotateCcw,
  Info,
  CalendarRange
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const PiezometryTab = ({ onNavigateTab }) => {
  const { structures, instruments, readingsPiezometria, activeStructureId, selectStructure } = useGeotechData();

  // Helper para formatar valores numéricos com casas decimais fixas (evita 827.6510000000001)
  const formatMeters = (val, decimals = 3) => {
    if (val === null || val === undefined || val === '') return '-';
    const n = parseFloat(val);
    return isNaN(n) ? val : n.toFixed(decimals);
  };

  // 1. Estruturas com instrumentos piezométricos disponíveis
  const availableStructures = useMemo(() => {
    const structs = new Set();
    instruments.forEach(i => {
      if (i.tipo === 'INA' || i.tipo === 'PZ') {
        structs.add(i.estrutura);
      }
    });
    return ['TODAS', ...Array.from(structs).sort()];
  }, [instruments]);

  // Estado do Filtro de Estrutura
  const [selectedStructure, setSelectedStructure] = useState(() => {
    return activeStructureId !== 'TODAS' ? activeStructureId : 'BARRAGEM B1';
  });

  // 2. Instrumentos piezométricos filtrados pela Estrutura selecionada
  const piezoInstruments = useMemo(() => {
    return instruments.filter(i => {
      const isPiezo = i.tipo === 'INA' || i.tipo === 'PZ';
      if (!isPiezo) return false;
      if (selectedStructure !== 'TODAS') {
        const match = i.estrutura === selectedStructure || 
                      i.estrutura.replace(/\s+/g, '_') === selectedStructure ||
                      i.estrutura.toUpperCase() === selectedStructure.toUpperCase();
        if (!match) return false;
      }
      return true;
    });
  }, [instruments, selectedStructure]);

  // 3. Seções disponíveis para a estrutura selecionada
  const availableSections = useMemo(() => {
    const secs = new Set();
    piezoInstruments.forEach(i => {
      if (i.secao) secs.add(i.secao);
    });
    return ['TODAS', ...Array.from(secs).sort()];
  }, [piezoInstruments]);

  const [selectedSection, setSelectedSection] = useState('TODAS');

  // Filtrar por seção
  const sectionFilteredInsts = useMemo(() => {
    if (selectedSection === 'TODAS') return piezoInstruments;
    return piezoInstruments.filter(i => i.secao === selectedSection);
  }, [piezoInstruments, selectedSection]);

  // 4. Instrumento ativo
  const [selectedInstUid, setSelectedInstUid] = useState(() => piezoInstruments[0]?.uid || '');

  // Se a lista filtrada mudar e o instrumento atual não estiver nela, seleciona o primeiro
  useEffect(() => {
    if (sectionFilteredInsts.length > 0) {
      const exists = sectionFilteredInsts.some(i => i.uid === selectedInstUid);
      if (!exists) {
        setSelectedInstUid(sectionFilteredInsts[0].uid);
      }
    }
  }, [sectionFilteredInsts, selectedInstUid]);

  const currentInst = useMemo(() => {
    return sectionFilteredInsts.find(i => i.uid === selectedInstUid) || sectionFilteredInsts[0] || piezoInstruments[0];
  }, [sectionFilteredInsts, selectedInstUid, piezoInstruments]);

  // 5. Filtros de Data de Início e Data de Final
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // 6. Leituras do instrumento selecionado filtradas por período
  const { filteredReadings, statsIntervalo } = useMemo(() => {
    if (!currentInst) return { filteredReadings: [], statsIntervalo: null };

    const allForInst = readingsPiezometria
      .filter(r => r.uid === currentInst.uid || 
        (r.estrutura === currentInst.estrutura && String(r.id) === String(currentInst.id) && r.tipo === currentInst.tipo))
      .sort((a, b) => new Date(a.data) - new Date(b.data));

    let filtered = allForInst;

    if (dataInicio) {
      filtered = filtered.filter(r => r.data && r.data.split(' ')[0] >= dataInicio);
    }
    if (dataFim) {
      filtered = filtered.filter(r => r.data && r.data.split(' ')[0] <= dataFim);
    }

    // Se nenhum filtro de data específico foi marcado e houver muitas leituras, exibe as 40 mais recentes
    const displayList = (!dataInicio && !dataFim && filtered.length > 40)
      ? filtered.slice(-40)
      : filtered;

    const validCotas = displayList
      .map(r => {
        const val = r.cota !== undefined && r.cota !== null ? r.cota : (r.cotaLeitura !== undefined && r.cotaLeitura !== null ? r.cotaLeitura : r.leitura);
        return val !== null && val !== undefined ? parseFloat(val) : null;
      })
      .filter(v => v !== null && !isNaN(v));

    const minCota = validCotas.length > 0 ? Math.min(...validCotas) : null;
    const maxCota = validCotas.length > 0 ? Math.max(...validCotas) : null;

    return {
      filteredReadings: displayList,
      statsIntervalo: {
        total: displayList.length,
        totalGeral: allForInst.length,
        minCota,
        maxCota,
        primeiraData: displayList[0]?.data ? displayList[0].data.split(' ')[0] : null,
        ultimaData: displayList[displayList.length - 1]?.data ? displayList[displayList.length - 1].data.split(' ')[0] : null
      }
    };
  }, [readingsPiezometria, currentInst, dataInicio, dataFim]);

  // 7. Configuração dos dados do Gráfico
  const chartData = useMemo(() => {
    if (!currentInst || filteredReadings.length === 0) {
      return {
        labels: ['Sem dados'],
        datasets: []
      };
    }

    const labels = filteredReadings.map(r => r.data ? r.data.split(' ')[0] : 'Data');
    const values = filteredReadings.map(r => {
      const val = r.cota !== undefined && r.cota !== null 
        ? r.cota 
        : (r.cotaLeitura !== undefined && r.cotaLeitura !== null ? r.cotaLeitura : r.leitura);
      return val !== null && val !== undefined ? parseFloat(val) : null;
    });

    const datasets = [
      {
        label: `Cota N.A (${currentInst.tipo}-${currentInst.id})`,
        data: values,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 2.5,
        pointRadius: filteredReadings.length > 50 ? 2 : 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#38bdf8',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#0284c7',
        pointHoverBorderWidth: 3
      }
    ];

    // Linha de Emergência (Vermelho)
    if (currentInst.limiteEmergencia) {
      const valEmerg = parseFloat(currentInst.limiteEmergencia);
      datasets.push({
        label: `Emergência (${formatMeters(valEmerg, 2)} m)`,
        data: labels.map(() => valEmerg),
        borderColor: '#ef4444',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      });
    }

    // Linha de Alerta (Laranja)
    if (currentInst.limiteAlerta) {
      const valAlerta = parseFloat(currentInst.limiteAlerta);
      datasets.push({
        label: `Alerta (${formatMeters(valAlerta, 2)} m)`,
        data: labels.map(() => valAlerta),
        borderColor: '#f97316',
        borderDash: [5, 4],
        borderWidth: 1.8,
        pointRadius: 0,
        fill: false
      });
    }

    // Linha de Atenção (Amarelo)
    if (currentInst.limiteAtencao) {
      const valAtencao = parseFloat(currentInst.limiteAtencao);
      datasets.push({
        label: `Atenção (${formatMeters(valAtencao, 2)} m)`,
        data: labels.map(() => valAtencao),
        borderColor: '#f59e0b',
        borderDash: [4, 4],
        borderWidth: 1.8,
        pointRadius: 0,
        fill: false
      });
    }

    return { labels, datasets };
  }, [currentInst, filteredReadings]);

  // Opções do Gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-main)',
          font: { family: 'Inter', size: 12, weight: '600' },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        titleColor: '#ffffff',
        bodyColor: '#f8fafc',
        titleFont: { family: 'Inter', weight: 'bold', size: 13 },
        bodyFont: { family: 'JetBrains Mono', size: 12 },
        padding: 12,
        cornerRadius: 8,
        borderColor: 'rgba(56, 189, 248, 0.3)',
        borderWidth: 1,
        boxPadding: 4,
        callbacks: {
          label: function(context) {
            return ` ${context.dataset.label}: ${context.parsed.y !== null ? context.parsed.y.toFixed(3) + ' m' : 'N/A'}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'var(--border-subtle)' },
        ticks: { color: 'var(--text-muted)', font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: 'var(--border-subtle)' },
        ticks: { 
          color: 'var(--text-muted)', 
          font: { family: 'JetBrains Mono', size: 11 },
          callback: (value) => `${value} m`
        }
      }
    }
  };

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* ============================================================ */}
      {/* BARRA SUPERIOR DE FILTROS: ESTRUTURA, INSTRUMENTO E DATAS    */}
      {/* ============================================================ */}
      <div className="card-panel" style={{ padding: '1rem 1.25rem' }}>
        
        {/* Topo do Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ChartIcon size={20} style={{ color: 'var(--primary-accent)' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Monitoramento Piezométrico e Nível d'Água (N.A)
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              Indicadores de Nível d'Água (INA) e Piezômetros (PZ) com curvas de segurança
            </p>
          </div>

          {currentInst && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`badge-status ${currentInst.statusCalculado === 'EMERGÊNCIA' ? 'badge-emergencia' : currentInst.statusCalculado === 'ATENÇÃO' ? 'badge-atencao' : 'badge-normal'}`} style={{ fontSize: '0.72rem' }}>
                {currentInst.statusCalculado}
              </span>
              <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-accent)', backgroundColor: 'var(--primary-accent-bg)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                {currentInst.tipo} {currentInst.id}
              </span>
            </div>
          )}
        </div>

        {/* Grade de Filtros: ESTRUTURA, SEÇÃO, INSTRUMENTO, DATA INÍCIO E DATA FINAL */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: '0.75rem',
          width: '100%',
          marginTop: '0.9rem',
          paddingTop: '0.9rem',
          borderTop: '1px solid var(--border-subtle)',
          alignItems: 'flex-end'
        }}>
          
          {/* 1. FILTRO: ESTRUTURA */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
              <Building2 size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: 'var(--primary-accent)' }} />
              Estrutura
            </label>
            <select
              value={selectedStructure}
              onChange={(e) => {
                setSelectedStructure(e.target.value);
                setSelectedSection('TODAS');
              }}
              className="form-select"
              style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.8rem', fontWeight: 700 }}
            >
              {availableStructures.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* 2. FILTRO: SEÇÃO */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
              <Layers size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: '#8b5cf6' }} />
              Seção
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="form-select"
              style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
            >
              {availableSections.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 3. FILTRO: INSTRUMENTO */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
              <Filter size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: '#10b981' }} />
              Instrumento
            </label>
            <select
              value={currentInst?.uid || ''}
              onChange={(e) => setSelectedInstUid(e.target.value)}
              className="form-select font-mono"
              style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.8rem', fontWeight: 700 }}
            >
              {sectionFilteredInsts.map(i => (
                <option key={i.uid} value={i.uid}>
                  {i.tipo} {i.id} ({i.secao ? 'Seção ' + i.secao : i.estrutura}) - {i.statusCalculado}
                </option>
              ))}
            </select>
          </div>

          {/* 4. FILTRO: DATA DE INÍCIO */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
              <Calendar size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: 'var(--primary-accent)' }} />
              Data de Início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="form-input font-mono"
              style={{ width: '100%', padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
            />
          </div>

          {/* 5. FILTRO: DATA DE FINAL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
              <Calendar size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: 'var(--primary-accent)' }} />
              Data de Final
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="form-input font-mono"
              style={{ width: '100%', padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
            />
          </div>

        </div>

        {/* Linha de Atalhos Rápidos & Feedback do Período */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.6rem',
          marginTop: '0.85rem',
          paddingTop: '0.65rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Botões Rápidos de Período */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 600 }}>Atalhos:</span>
            
            <button
              type="button"
              onClick={() => {
                setDataInicio('2026-08-08');
                setDataFim('2026-09-08');
              }}
              className="btn-ghost"
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', borderRadius: '5px' }}
            >
              Últimos 30 Dias
            </button>

            <button
              type="button"
              onClick={() => {
                setDataInicio('2026-06-08');
                setDataFim('2026-09-08');
              }}
              className="btn-ghost"
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', borderRadius: '5px' }}
            >
              Últimos 90 Dias
            </button>

            <button
              type="button"
              onClick={() => {
                setDataInicio('2026-01-01');
                setDataFim('2026-12-31');
              }}
              className="btn-ghost"
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', borderRadius: '5px' }}
            >
              Ano 2026
            </button>

            <button
              type="button"
              onClick={() => {
                setDataInicio('2025-01-01');
                setDataFim('2025-12-31');
              }}
              className="btn-ghost"
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', borderRadius: '5px' }}
            >
              Ano 2025
            </button>

            {(dataInicio || dataFim) && (
              <button
                type="button"
                onClick={() => {
                  setDataInicio('');
                  setDataFim('');
                }}
                className="btn-ghost"
                style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', color: '#ef4444', borderRadius: '5px', fontWeight: 600 }}
              >
                <RotateCcw size={12} style={{ display: 'inline', marginRight: '3px' }} />
                Limpar Datas
              </button>
            )}
          </div>

          {/* Resumo do Período Selecionado */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {filteredReadings.length > 0 ? (
              <span>
                Exibindo <strong>{filteredReadings.length}</strong> leituras
                {dataInicio || dataFim ? (
                  <span> ({dataInicio ? 'de ' + dataInicio.split('-').reverse().join('/') : ''} {dataFim ? 'até ' + dataFim.split('-').reverse().join('/') : ''})</span>
                ) : ' (amostra recente)'}
                {statsIntervalo?.minCota !== null && (
                  <span style={{ color: 'var(--primary-accent)' }}> • Cotas: {statsIntervalo.minCota.toFixed(2)} m a {statsIntervalo.maxCota.toFixed(2)} m</span>
                )}
              </span>
            ) : (
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                Nenhuma leitura encontrada para este filtro de período.
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Cards de Ficha Técnica e Situação Atual */}
      {currentInst && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.85rem'
        }}>
          <div className="card-panel">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Estrutura & Seção</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {currentInst.estrutura}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary-accent)' }}>
              Seção {currentInst.secao || 'Não informada'}
            </div>
          </div>

          <div className="card-panel">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Cota Topo / Cota Fundo</div>
            <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {formatMeters(currentInst.cotaTopo)} m
            </div>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Fundo: {formatMeters(currentInst.cotaFundo)} m
            </div>
          </div>

          <div className="card-panel">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Última Cota Medida</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-accent)', marginTop: '2px' }}>
              {currentInst.ultimaCota ? `${formatMeters(currentInst.ultimaCota)} m` : 'Sem medição'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Data: {currentInst.ultimaData || '-'}
            </div>
          </div>

          <div className="card-panel">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Status Operacional</div>
            <div style={{ marginTop: '4px' }}>
              <span className={`badge-status ${currentInst.statusCalculado === 'EMERGÊNCIA' ? 'badge-emergencia' : currentInst.statusCalculado === 'ATENÇÃO' ? 'badge-atencao' : 'badge-normal'}`}>
                {currentInst.statusCalculado}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '4px' }}>
              Leitura: {currentInst.leituraTipo || 'Manual'}
            </div>
          </div>
        </div>
      )}

      {/* ÁREA DO GRÁFICO INTERATIVO */}
      <div className="card-panel" style={{ height: '420px', padding: '1.25rem', position: 'relative' }}>
        {filteredReadings.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <Info size={36} style={{ marginBottom: '0.5rem', color: 'var(--text-faint)' }} />
            <p style={{ fontWeight: 600 }}>Nenhuma leitura histórica registrada para o período ou instrumento selecionado.</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '4px' }}>
              Tente expandir o intervalo de datas ou selecionar outro instrumento piezométrico.
            </p>
            {(dataInicio || dataFim) && (
              <button 
                onClick={() => { setDataInicio(''); setDataFim(''); }}
                className="btn-secondary"
                style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
              >
                Limpar Filtro de Datas
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabela de Leituras Históricas do Período */}
      {filteredReadings.length > 0 && (
        <div className="card-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Leituras do Período Selecionado ({filteredReadings.length})
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
              Ordenadas da mais recente para a mais antiga
            </span>
          </div>

          <div className="table-container" style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Leitura Bruta (m)</th>
                  <th>Cota N.A Calculada (m)</th>
                  <th>Status</th>
                  <th>Origem / Situação</th>
                </tr>
              </thead>
              <tbody>
                {filteredReadings.slice().reverse().map((r, idx) => {
                  const valCota = r.cota !== undefined && r.cota !== null ? r.cota : (r.cotaLeitura !== undefined && r.cotaLeitura !== null ? r.cotaLeitura : null);
                  return (
                    <tr key={idx}>
                      <td className="font-mono">{r.data ? r.data.split(' ')[0] : '-'}</td>
                      <td className="font-mono">{formatMeters(r.leitura, 2)}</td>
                      <td className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-accent)' }}>
                        {valCota !== null ? `${formatMeters(valCota)} m` : '-'}
                      </td>
                      <td>
                        <span className={`badge-status ${r.status === 'EMERGENCIA' || r.status === 'EMERGÊNCIA' ? 'badge-emergencia' : r.status === 'ATENCAO' || r.status === 'ATENÇÃO' ? 'badge-atencao' : 'badge-normal'}`}>
                          {r.status || 'NORMAL'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.origem || r.situacao || 'PCMI'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

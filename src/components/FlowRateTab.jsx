import React, { useState, useMemo, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useGeotechData, normalizeStructureKey } from '../context/GeotechDataContext';
import { 
  Droplets, 
  Filter, 
  CloudRain, 
  Activity, 
  TrendingUp, 
  Info, 
  Calendar, 
  MapPin, 
  Download, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Função utilitária para converter qualquer leitura de vazão / vertedouro do banco
 * para a unidade padrão de engenharia geotécnica: Litros por segundo (L/s).
 */
export const parseFlowRateLs = (r) => {
  if (!r) return 0;
  // 1. Campo lS ou ls explícito (L/s)
  if (r.lS !== undefined && r.lS !== null) return Number(r.lS);
  if (r.ls !== undefined && r.ls !== null) return Number(r.ls);

  // 2. Campo qM3s explícito (m³/s -> L/s)
  if (r.qM3s !== undefined && r.qM3s !== null && Number(r.qM3s) > 0) {
    return Number(r.qM3s) * 1000;
  }

  // 3. Vertedouro com qM3h (m³/h -> L/s: divide por 3.6)
  if (r.qM3h !== undefined && r.qM3h !== null && Number(r.qM3h) > 0) {
    return Number(r.qM3h) / 3.6;
  }

  // 4. Campo vazao genérico
  if (r.vazao !== undefined && r.vazao !== null) {
    const v = Number(r.vazao);
    if (v <= 0) return 0;
    // No banco oficial ITAMINAS, vertedouros registram vazao em m³/h
    if (r.tipo === 'VT') return v / 3.6;
    // Se o valor numérico for típico de m³/s (ex: 0.00014 m³/s -> 0.14 L/s)
    if (v < 0.1) return v * 1000;
    return v;
  }

  // 5. Carga hidráulica hCm (cm) em vertedouro triangular de 90° (fórmula de Thomson): Q(L/s) = 0.0138 * h^(2.5)
  if (r.hCm !== undefined && r.hCm !== null && Number(r.hCm) > 0) {
    return 0.0138 * Math.pow(Number(r.hCm), 2.5);
  }

  return 0;
};

export const FlowRateTab = ({ onNavigateTab }) => {
  const { structures = [], instruments = [], readingsVazao = [], readingsVertedouro = [], activeStructureId } = useGeotechData();

  // Todos os instrumentos de vazão (MV) e vertedouro (VT) cadastrados no complexo
  const allFlowInstruments = useMemo(() => {
    return (instruments || []).filter(i => i.tipo === 'MV' || i.tipo === 'VT');
  }, [instruments]);

  // Estruturas que possuem medidores de vazão disponíveis
  const structuresWithFlow = useMemo(() => {
    const set = new Set();
    allFlowInstruments.forEach(i => {
      if (i.estrutura) set.add(i.estrutura);
    });
    return Array.from(set).sort();
  }, [allFlowInstruments]);

  // Filtro de estrutura local (permite alternar entre estruturas ou ver todas)
  const [selectedStructure, setSelectedStructure] = useState('TODAS');
  const [timeRange, setTimeRange] = useState('60'); // '30' | '60' | 'all'

  // Sincronizar com activeStructureId se a estrutura tiver instrumentos de vazão
  useEffect(() => {
    if (!activeStructureId || activeStructureId === 'TODAS') {
      setSelectedStructure('TODAS');
      return;
    }
    const norm = normalizeStructureKey(activeStructureId);
    const hasFlow = allFlowInstruments.some(i => normalizeStructureKey(i.estrutura) === norm);
    if (hasFlow) {
      const match = allFlowInstruments.find(i => normalizeStructureKey(i.estrutura) === norm);
      if (match) setSelectedStructure(match.estrutura);
    } else {
      // Se a estrutura ativa não tiver vazão, manter TODAS para nunca deixar a tela em branco
      setSelectedStructure('TODAS');
    }
  }, [activeStructureId, allFlowInstruments]);

  // Filtrar instrumentos pela estrutura selecionada
  const flowInstruments = useMemo(() => {
    if (selectedStructure === 'TODAS') {
      return allFlowInstruments;
    }
    const normSelected = normalizeStructureKey(selectedStructure);
    const filtered = allFlowInstruments.filter(i => normalizeStructureKey(i.estrutura) === normSelected);
    // Fallback defensivo: se não encontrar na estrutura, retornar todos
    return filtered.length > 0 ? filtered : allFlowInstruments;
  }, [allFlowInstruments, selectedStructure]);

  const [selectedInstUid, setSelectedInstUid] = useState('');

  // Manter selectedInstUid sempre válido
  useEffect(() => {
    if (flowInstruments.length > 0) {
      const exists = flowInstruments.some(i => i.uid === selectedInstUid);
      if (!exists) {
        setSelectedInstUid(flowInstruments[0].uid);
      }
    }
  }, [flowInstruments, selectedInstUid]);

  const currentInst = useMemo(() => {
    if (flowInstruments.length === 0) return null;
    return flowInstruments.find(i => i.uid === selectedInstUid) || flowInstruments[0];
  }, [flowInstruments, selectedInstUid]);

  // Leituras correspondentes ao instrumento selecionado (busca combinada e normalizada)
  const allInstReadings = useMemo(() => {
    if (!currentInst) return [];
    const combined = [...(readingsVertedouro || []), ...(readingsVazao || [])];
    const instNorm = normalizeStructureKey(currentInst.estrutura);
    const instIdStr = String(currentInst.id || '').trim();
    const currTipo = String(currentInst.tipo || '').toUpperCase();

    return combined
      .filter(r => {
        // 1. Se tiver uid idêntico, match direto
        if (r.uid && currentInst.uid && r.uid === currentInst.uid) return true;
        const rIdStr = String(r.id || '').trim();
        const rTipo = String(r.tipo || '').toUpperCase();

        // 2. Vertedouros (VT): IDs são códigos seriais únicos em toda a mina (ex: JGD_VZ_ENG_09/01, JGDENMM062)
        if ((currTipo === 'VT' || rTipo === 'VT') && rIdStr === instIdStr) {
          return true;
        }

        // 3. Medidores de Vazão (MV): validar estrutura normalizada e ID (ex: MV 1 B1 vs MV 1 B4 vs MV 1 Jacó)
        const rNorm = normalizeStructureKey(r.estrutura);
        return rNorm === instNorm && rIdStr === instIdStr && (rTipo === currTipo || !rTipo);
      })
      .sort((a, b) => new Date(a.data) - new Date(b.data));
  }, [currentInst, readingsVazao, readingsVertedouro]);

  // Leituras limitadas pelo filtro de período
  const instReadings = useMemo(() => {
    if (timeRange === '30') return allInstReadings.slice(-30);
    if (timeRange === '60') return allInstReadings.slice(-60);
    return allInstReadings;
  }, [allInstReadings, timeRange]);

  // Estatísticas calculadas com parsing de alta fidelidade
  const metrics = useMemo(() => {
    if (instReadings.length === 0) {
      return { media: '0.000', max: '0.000', ult: '0.000', total: 0, status: 'Sem Leituras' };
    }
    const values = instReadings.map(parseFlowRateLs);
    const sum = values.reduce((acc, v) => acc + v, 0);
    const max = Math.max(...values);
    const ult = values[values.length - 1] || 0;
    const media = values.length > 0 ? sum / values.length : 0;

    return {
      media: media.toFixed(3),
      max: max.toFixed(3),
      ult: ult.toFixed(3),
      total: allInstReadings.length,
      status: ult > 0 ? 'Drenagem Operacional' : 'Seco / Sem Descarga'
    };
  }, [instReadings, allInstReadings]);

  // Configuração do Gráfico de Vazão
  const chartData = useMemo(() => {
    if (!currentInst || instReadings.length === 0) {
      return { labels: ['Sem dados'], datasets: [] };
    }

    const labels = instReadings.map(r => r.data ? r.data.split(' ')[0] : 'Data');
    const qValues = instReadings.map(r => Number(parseFlowRateLs(r).toFixed(3)));

    return {
      labels,
      datasets: [
        {
          type: 'line',
          label: `Vazão Medida (${currentInst.tipo === 'MV' ? 'Medidor MV' : 'Vertedouro VT'} - L/s)`,
          data: qValues,
          borderColor: '#0284c7',
          backgroundColor: 'rgba(2, 132, 199, 0.12)',
          fill: true,
          tension: 0.3,
          borderWidth: 2.5,
          pointRadius: instReadings.length > 40 ? 3 : 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#0284c7',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          yAxisID: 'y'
        }
      ]
    };
  }, [currentInst, instReadings]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-main)',
          font: { family: 'Inter', size: 12, weight: '600' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#f8fafc',
        titleFont: { family: 'Inter', weight: 'bold', size: 13 },
        bodyFont: { family: 'JetBrains Mono', size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => {
            const raw = instReadings[ctx.dataIndex];
            const ls = ctx.parsed.y.toFixed(3);
            const m3h = (ctx.parsed.y * 3.6).toFixed(2);
            let extra = ` Vazão: ${ls} L/s (${m3h} m³/h)`;
            if (raw?.hCm !== undefined && raw?.hCm !== null) {
              extra += ` | Lâmina h: ${raw.hCm} cm`;
            }
            return extra;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'var(--border-subtle)' },
        ticks: { 
          color: 'var(--text-muted)', 
          font: { family: 'Inter', size: 11 },
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        grid: { color: 'var(--border-subtle)' },
        ticks: { 
          color: 'var(--text-muted)', 
          font: { family: 'JetBrains Mono', size: 11 },
          callback: (v) => `${v} L/s`
        }
      }
    }
  };

  // Exportar dados em CSV
  const handleExportCsv = () => {
    if (!currentInst || allInstReadings.length === 0) return;
    const header = ['Estrutura', 'Instrumento', 'Tipo', 'Data', 'Vazao_Ls', 'Vazao_M3h', 'Lamina_hCm', 'Situacao', 'Origem'];
    const rows = allInstReadings.map(r => {
      const ls = parseFlowRateLs(r).toFixed(3);
      const m3h = (parseFlowRateLs(r) * 3.6).toFixed(3);
      const h = r.hCm !== undefined && r.hCm !== null ? r.hCm : '';
      return [
        `"${currentInst.estrutura}"`,
        `"${currentInst.id}"`,
        `"${currentInst.tipo}"`,
        `"${r.data}"`,
        ls,
        m3h,
        h,
        `"${r.situacao || 'NORMAL'}"`,
        `"${r.origem || 'BANCO_MESTRE_PCMI'}"`
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [header.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vazao_${currentInst.estrutura.replace(/\s+/g, '_')}_${currentInst.tipo}_${currentInst.id}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const isStructureActiveWithoutFlow = activeStructureId && activeStructureId !== 'TODAS' && !allFlowInstruments.some(i => normalizeStructureKey(i.estrutura) === normalizeStructureKey(activeStructureId));

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Alerta Informativo se a estrutura selecionada no topo não tiver medidores de vazão */}
      {isStructureActiveWithoutFlow && (
        <div style={{
          padding: '0.65rem 1rem',
          borderRadius: '8px',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.82rem',
          color: 'var(--text-main)'
        }}>
          <Info size={18} style={{ color: 'var(--geo-info)', flexShrink: 0 }} />
          <span>
            A estrutura <strong>{activeStructureId}</strong> não possui medidores de vazão diretos. Exibindo todos os <strong>{allFlowInstruments.length} medidores de vazão e vertedouros</strong> do Complexo Itaminas com dados ativos do banco.
          </span>
        </div>
      )}

      {/* Barra de Filtro Principal */}
      <div className="card-panel" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Droplets size={22} style={{ color: 'var(--geo-info)' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Medição de Vazão e Vertedouros (Drenagem Interna)
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Medidores de Vazão (MV) e Vertedouros Parshall / Thomson (VT) &bull; <strong>{allFlowInstruments.length} instrumentos</strong> com <strong>{readingsVazao.length + readingsVertedouro.length} leituras</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* Filtro de Estrutura */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Layers size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estrutura:</span>
              <select
                value={selectedStructure}
                onChange={(e) => setSelectedStructure(e.target.value)}
                className="form-select font-mono"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <option value="TODAS">Todas as Estruturas ({allFlowInstruments.length} inst.)</option>
                {structuresWithFlow.map(est => {
                  const count = allFlowInstruments.filter(i => i.estrutura === est).length;
                  return (
                    <option key={est} value={est}>
                      {est} ({count} {count === 1 ? 'inst.' : 'inst.'})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Filtro de Instrumento */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Instrumento:</span>
              <select
                value={currentInst?.uid || ''}
                onChange={(e) => setSelectedInstUid(e.target.value)}
                className="form-select font-mono"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', fontWeight: 700 }}
              >
                {flowInstruments.map(i => (
                  <option key={i.uid} value={i.uid}>
                    {i.tipo} {i.id} &bull; {i.estrutura} {i.secao ? `(${i.secao})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Botões de Ação Rápida */}
            {onNavigateTab && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateTab('mapa', {
                    filterType: currentInst?.tipo || 'VT',
                    instrumentId: currentInst?.id,
                    instrumentUid: currentInst?.uid,
                    structureId: currentInst?.estrutura,
                    coords: currentInst?.lat && currentInst?.lon ? [currentInst.lat, currentInst.lon] : undefined,
                    zoom: 17
                  })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: 'var(--geo-info)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="Ver medidor no Mapa Georreferenciado"
                >
                  <MapPin size={15} />
                  <span>Ver no Georeferenciamento</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('pluviometria')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="Abrir o Painel Executivo de Pluviometria"
                >
                  <CloudRain size={15} />
                  <span>Painel de Pluviometria</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!currentInst || allInstReadings.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: currentInst && allInstReadings.length > 0 ? 'pointer' : 'not-allowed',
                opacity: currentInst && allInstReadings.length > 0 ? 1 : 0.5
              }}
              title="Exportar histórico de leituras em CSV"
            >
              <Download size={14} />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas de Descarga */}
      {currentInst && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem'
        }}>
          <div className="card-panel">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>
              Estrutura & Identificação
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {currentInst.estrutura}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--geo-info)', fontWeight: 600, marginTop: '2px' }}>
              {currentInst.tipo === 'MV' ? 'Medidor de Vazão de Dreno (MV)' : 'Vertedouro de Descarga (VT)'} &bull; {currentInst.id}
            </div>
            {currentInst.secao && (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Local: {currentInst.secao}
              </div>
            )}
          </div>

          <div className="card-panel">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>
              Última Medição Registrada
            </div>
            <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-accent)', marginTop: '2px' }}>
              {metrics.ult} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>L/s</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--geo-normal)', fontWeight: 600, marginTop: '2px' }}>
              <CheckCircle2 size={12} />
              <span>{metrics.status}</span>
            </div>
          </div>

          <div className="card-panel">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>
              Vazão Média ({timeRange === 'all' ? 'Histórico Completo' : `Últimas ${timeRange} Leituras`})
            </div>
            <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {metrics.media} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>L/s</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Taxa equivalente: {(Number(metrics.media) * 3.6).toFixed(2)} m³/h
            </div>
          </div>

          <div className="card-panel">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>
              Pico Máximo Observado
            </div>
            <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--geo-atencao)', marginTop: '2px' }}>
              {metrics.max} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>L/s</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Pico pós-precipitação pluviométrica
            </div>
          </div>

          <div className="card-panel">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>
              Volume de Dados do Instrumento
            </div>
            <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {metrics.total} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>leituras</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>
              Última leitura: {currentInst.ultimaData || allInstReadings[allInstReadings.length - 1]?.data || '2026-10-22'}
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Vazão com Seletor de Período */}
      <div className="card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} style={{ color: 'var(--primary-accent)' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Curva Hidrológica & Histórico de Descarga: {currentInst ? `${currentInst.tipo} ${currentInst.id} (${currentInst.estrutura})` : ''}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Exibir:</span>
            {[
              { id: '30', label: 'Últimas 30' },
              { id: '60', label: 'Últimas 60' },
              { id: 'all', label: 'Todo o Histórico' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeRange(tab.id)}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: timeRange === tab.id ? 800 : 500,
                  borderRadius: '5px',
                  backgroundColor: timeRange === tab.id ? 'var(--primary-accent)' : 'var(--bg-secondary)',
                  color: timeRange === tab.id ? '#ffffff' : 'var(--text-muted)',
                  border: '1px solid ' + (timeRange === tab.id ? 'var(--primary-accent)' : 'var(--border-subtle)'),
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: '360px', width: '100%' }}>
          {instReadings.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              <Info size={32} style={{ marginBottom: '0.5rem', color: 'var(--text-faint)' }} />
              <p>Nenhuma leitura encontrada para o medidor de vazão selecionado.</p>
            </div>
          )}
        </div>
      </div>

      {/* Extrato Detalhado de Leituras em Tabela */}
      {currentInst && instReadings.length > 0 && (
        <div className="card-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} style={{ color: 'var(--geo-info)' }} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Extrato Recente de Medições de Campo ({instReadings.length} de {allInstReadings.length} registros)
              </h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Origem: Banco Mestre PCMI / ITAMINAS
            </span>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '320px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '0.55rem 0.75rem', fontWeight: 700 }}>Data da Medição</th>
                  <th style={{ padding: '0.55rem 0.75rem', fontWeight: 700 }}>Carga Lâmina (h)</th>
                  <th style={{ padding: '0.55rem 0.75rem', fontWeight: 700 }}>Vazão Calculada</th>
                  <th style={{ padding: '0.55rem 0.75rem', fontWeight: 700 }}>Vazão Equivalente</th>
                  <th style={{ padding: '0.55rem 0.75rem', fontWeight: 700 }}>Situação</th>
                  <th style={{ padding: '0.55rem 0.75rem', fontWeight: 700 }}>Origem</th>
                </tr>
              </thead>
              <tbody>
                {[...instReadings].reverse().slice(0, 50).map((r, idx) => {
                  const ls = parseFlowRateLs(r);
                  const m3h = ls * 3.6;
                  return (
                    <tr 
                      key={idx} 
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'
                      }}
                    >
                      <td style={{ padding: '0.45rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
                        {r.data}
                      </td>
                      <td style={{ padding: '0.45rem 0.75rem', fontFamily: 'var(--font-mono)' }}>
                        {r.hCm !== undefined && r.hCm !== null ? `${r.hCm} cm` : '—'}
                      </td>
                      <td style={{ padding: '0.45rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-accent)' }}>
                        {ls.toFixed(3)} L/s
                      </td>
                      <td style={{ padding: '0.45rem 0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {m3h.toFixed(2)} m³/h
                      </td>
                      <td style={{ padding: '0.45rem 0.75rem' }}>
                        <span style={{
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          backgroundColor: r.situacao === 'ATENÇÃO' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: r.situacao === 'ATENÇÃO' ? '#f59e0b' : '#10b981'
                        }}>
                          {r.situacao || 'NORMAL'}
                        </span>
                      </td>
                      <td style={{ padding: '0.45rem 0.75rem', color: 'var(--text-faint)', fontSize: '0.72rem' }}>
                        {r.origem || 'BANCO_MESTRE_PCMI'}
                      </td>
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

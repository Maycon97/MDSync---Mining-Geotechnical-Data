import React, { useState, useMemo } from 'react';
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
import { Line, Bar } from 'react-chartjs-2';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  Droplets, 
  Filter, 
  CloudRain, 
  Activity, 
  TrendingUp, 
  Info,
  Calendar
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

export const FlowRateTab = () => {
  const { structures, instruments, readingsVazao, readingsVertedouro, pluviometria, activeStructureId } = useGeotechData();

  // Filtrar instrumentos de vazão e vertedouros
  const flowInstruments = useMemo(() => {
    return instruments.filter(i => {
      const isFlow = i.tipo === 'MV' || i.tipo === 'VT';
      if (!isFlow) return false;
      if (activeStructureId !== 'TODAS' && i.estrutura.replace(/\s+/g, '_') !== activeStructureId && i.estrutura !== activeStructureId) {
        return false;
      }
      return true;
    });
  }, [instruments, activeStructureId]);

  const [selectedInstUid, setSelectedInstUid] = useState(() => flowInstruments[0]?.uid || '');

  const currentInst = useMemo(() => {
    return flowInstruments.find(i => i.uid === selectedInstUid) || flowInstruments[0];
  }, [flowInstruments, selectedInstUid]);

  // Leituras correspondentes ao instrumento selecionado (busca combinada robusta)
  const instReadings = useMemo(() => {
    if (!currentInst) return [];
    const combined = [...(readingsVertedouro || []), ...(readingsVazao || [])];
    return combined
      .filter(r => r.uid === currentInst.uid || (r.estrutura === currentInst.estrutura && (r.id === currentInst.id || r.id === currentInst.uid)))
      .sort((a, b) => new Date(a.data) - new Date(b.data))
      .slice(-40);
  }, [currentInst, readingsVazao, readingsVertedouro]);

  // Estatísticas calculadas
  const metrics = useMemo(() => {
    if (instReadings.length === 0) return { media: 0, max: 0, ult: 0 };
    const values = instReadings.map(r => {
      if (r.ls !== undefined && r.ls !== null) return r.ls;
      if (r.vazao !== undefined && r.vazao !== null) return r.vazao;
      if (r.q !== undefined && r.q !== null) return r.q * 1000;
      return 0;
    });
    const sum = values.reduce((acc, v) => acc + v, 0);
    return {
      media: (sum / values.length).toFixed(3),
      max: Math.max(...values).toFixed(3),
      ult: (values[values.length - 1] || 0).toFixed(3)
    };
  }, [instReadings]);

  // Configuração do Gráfico de Vazão
  const chartData = useMemo(() => {
    if (!currentInst || instReadings.length === 0) {
      return { labels: ['Sem dados'], datasets: [] };
    }

    const labels = instReadings.map(r => r.data ? r.data.split(' ')[0] : 'Data');
    const qValues = instReadings.map(r => {
      if (r.ls !== undefined && r.ls !== null) return r.ls;
      if (r.vazao !== undefined && r.vazao !== null) return r.vazao;
      if (r.q !== undefined && r.q !== null) return r.q * 1000;
      return 0;
    });

    return {
      labels,
      datasets: [
        {
          type: 'line',
          label: `Vazão Medida (${currentInst.tipo === 'MV' ? 'L/s' : 'L/s'})`,
          data: qValues,
          borderColor: '#0284c7',
          backgroundColor: 'rgba(2, 132, 199, 0.15)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: '#0284c7',
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
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        titleColor: '#ffffff',
        bodyColor: '#f8fafc',
        titleFont: { family: 'Inter', weight: 'bold', size: 13 },
        bodyFont: { family: 'JetBrains Mono', size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` Vazão: ${ctx.parsed.y.toFixed(3)} L/s`
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
          callback: (v) => `${v} L/s`
        }
      }
    }
  };

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Barra de Filtro */}
      <div className="card-panel" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Droplets size={20} style={{ color: 'var(--geo-info)' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Medição de Vazão e Vertedouros (Drenagem Interna)
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Medidores de Vazão (MV) e Vertedouros Parshall / Retangulares (VT)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instrumento:</span>
            <select
              value={currentInst?.uid || ''}
              onChange={(e) => setSelectedInstUid(e.target.value)}
              className="form-select font-mono"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.825rem', fontWeight: 600 }}
            >
              {flowInstruments.map(i => (
                <option key={i.uid} value={i.uid}>
                  {i.tipo} {i.id} ({i.estrutura})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Métricas de Descarga */}
      {currentInst && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div className="card-panel">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Estrutura de Origem</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {currentInst.estrutura}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--geo-info)' }}>
              Tipo: {currentInst.tipo === 'MV' ? 'Medidor de Vazão de Dreno' : 'Vertedouro de Descarga'}
            </div>
          </div>

          <div className="card-panel">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Vazão Média do Período</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {metrics.media} L/s
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Comportamento constante</div>
          </div>

          <div className="card-panel">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Pico Máximo Observado</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--geo-atencao)', marginTop: '2px' }}>
              {metrics.max} L/s
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Pós-evento pluviométrico</div>
          </div>

          <div className="card-panel">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Última Medição</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-accent)', marginTop: '2px' }}>
              {metrics.ult} L/s
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--geo-normal)', fontWeight: 600 }}>Drenagem desobstruída</div>
          </div>
        </div>
      )}

      {/* Gráfico de Vazão */}
      <div className="card-panel" style={{ height: '380px', padding: '1.25rem' }}>
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
  );
};

import React, { useState, useMemo } from 'react';
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
  Info
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

  // Filtrar apenas instrumentos piezométricos (INA e PZ)
  const piezoInstruments = useMemo(() => {
    return instruments.filter(i => {
      const isPiezo = i.tipo === 'INA' || i.tipo === 'PZ';
      if (!isPiezo) return false;
      if (activeStructureId !== 'TODAS' && i.estrutura.replace(/\s+/g, '_') !== activeStructureId && i.estrutura !== activeStructureId) {
        return false;
      }
      return true;
    });
  }, [instruments, activeStructureId]);

  // Seções disponíveis
  const availableSections = useMemo(() => {
    const secs = new Set();
    piezoInstruments.forEach(i => {
      if (i.secao) secs.add(i.secao);
    });
    return ['TODAS', ...Array.from(secs).sort()];
  }, [piezoInstruments]);

  const [selectedSection, setSelectedSection] = useState('TODAS');
  const [selectedInstUid, setSelectedInstUid] = useState(() => piezoInstruments[0]?.uid || '');

  // Filtrar por seção
  const sectionFilteredInsts = useMemo(() => {
    if (selectedSection === 'TODAS') return piezoInstruments;
    return piezoInstruments.filter(i => i.secao === selectedSection);
  }, [piezoInstruments, selectedSection]);

  // Instrumento ativo
  const currentInst = useMemo(() => {
    return sectionFilteredInsts.find(i => i.uid === selectedInstUid) || sectionFilteredInsts[0] || piezoInstruments[0];
  }, [sectionFilteredInsts, selectedInstUid, piezoInstruments]);

  // Leituras do instrumento selecionado ordenadas cronologicamente
  const instReadings = useMemo(() => {
    if (!currentInst) return [];
    return readingsPiezometria
      .filter(r => r.uid === currentInst.uid || (r.estrutura === currentInst.estrutura && r.id === currentInst.id && r.tipo === currentInst.tipo))
      .sort((a, b) => new Date(a.data) - new Date(b.data))
      .slice(-30); // Últimas 30 leituras para visualização clara
  }, [readingsPiezometria, currentInst]);

  // Configuração dos dados do Gráfico
  const chartData = useMemo(() => {
    if (!currentInst || instReadings.length === 0) {
      return {
        labels: ['Sem dados'],
        datasets: []
      };
    }

    const labels = instReadings.map(r => r.data ? r.data.split(' ')[0] : 'Data');
    const values = instReadings.map(r => r.cotaLeitura !== null ? r.cotaLeitura : (r.leitura !== null ? r.leitura : null));

    const datasets = [
      {
        label: `Cota N.A (${currentInst.tipo}-${currentInst.id})`,
        data: values,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#38bdf8',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#0284c7',
        pointHoverBorderWidth: 3
      }
    ];

    // Adicionar Linha de Emergência (Vermelho)
    if (currentInst.limiteEmergencia) {
      datasets.push({
        label: `Emergência (${currentInst.limiteEmergencia} m)`,
        data: labels.map(() => currentInst.limiteEmergencia),
        borderColor: '#ef4444',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      });
    }

    // Adicionar Linha de Alerta (Laranja)
    if (currentInst.limiteAlerta) {
      datasets.push({
        label: `Alerta (${currentInst.limiteAlerta} m)`,
        data: labels.map(() => currentInst.limiteAlerta),
        borderColor: '#f97316',
        borderDash: [5, 4],
        borderWidth: 1.8,
        pointRadius: 0,
        fill: false
      });
    }

    // Adicionar Linha de Atenção (Amarelo)
    if (currentInst.limiteAtencao) {
      datasets.push({
        label: `Atenção (${currentInst.limiteAtencao} m)`,
        data: labels.map(() => currentInst.limiteAtencao),
        borderColor: '#f59e0b',
        borderDash: [4, 4],
        borderWidth: 1.8,
        pointRadius: 0,
        fill: false
      });
    }

    return { labels, datasets };
  }, [currentInst, instReadings]);

  // Opções do Gráfico com Hover / Tooltips avançados
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
      {/* Barra de Filtros e Seleção */}
      <div className="card-panel" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ChartIcon size={20} style={{ color: 'var(--primary-accent)' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Monitoramento Piezométrico e Nível d'Água (N.A)
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Indicadores de Nível d'Água (INA) e Piezômetros (PZ) com curvas de segurança
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            {/* Filtro de Seção */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Seção:</span>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="form-select"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
              >
                {availableSections.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Seletor do Instrumento */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instrumento:</span>
              <select
                value={currentInst?.uid || ''}
                onChange={(e) => setSelectedInstUid(e.target.value)}
                className="form-select font-mono"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', fontWeight: 600 }}
              >
                {sectionFilteredInsts.map(i => (
                  <option key={i.uid} value={i.uid}>
                    {i.tipo} {i.id} ({i.estrutura}) - {i.statusCalculado}
                  </option>
                ))}
              </select>
            </div>
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
              {currentInst.cotaTopo || '-'} m
            </div>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Fundo: {currentInst.cotaFundo || '-'} m
            </div>
          </div>

          <div className="card-panel">
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Última Cota Medida</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-accent)', marginTop: '2px' }}>
              {currentInst.ultimaCota ? `${currentInst.ultimaCota} m` : 'Sem medição'}
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
        {instReadings.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <Info size={36} style={{ marginBottom: '0.5rem', color: 'var(--text-faint)' }} />
            <p style={{ fontWeight: 600 }}>Nenhuma leitura histórica registrada para o instrumento selecionado.</p>
            <button 
              onClick={() => onNavigateTab('campo')}
              className="btn-primary"
              style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
            >
              Registrar Primeira Leitura em Campo
            </button>
          </div>
        )}
      </div>

      {/* Tabela de Leituras Históricas Recentes */}
      {instReadings.length > 0 && (
        <div className="card-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Últimas Leituras Registradas ({instReadings.length})
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
              Ordenadas cronologicamente
            </span>
          </div>

          <div className="table-container" style={{ maxHeight: '250px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Leitura Bruta (m)</th>
                  <th>Cota N.A Calculada (m)</th>
                  <th>Status</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {instReadings.slice().reverse().map((r, idx) => (
                  <tr key={idx}>
                    <td className="font-mono">{r.data ? r.data.split(' ')[0] : '-'}</td>
                    <td className="font-mono">{r.leitura !== null ? r.leitura : '-'}</td>
                    <td className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-accent)' }}>
                      {r.cotaLeitura !== null ? `${r.cotaLeitura} m` : '-'}
                    </td>
                    <td>
                      <span className={`badge-status ${r.status === 'EMERGENCIA' || r.status === 'EMERGÊNCIA' ? 'badge-emergencia' : r.status === 'ATENCAO' || r.status === 'ATENÇÃO' ? 'badge-atencao' : 'badge-normal'}`}>
                        {r.status || 'NORMAL'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.situacao || 'Normal'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

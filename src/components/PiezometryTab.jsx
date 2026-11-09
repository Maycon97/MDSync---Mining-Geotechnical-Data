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
  CalendarRange,
  MapPin
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

export const CANONICAL_STRUCTURE_MAP = {
  'B1': 'BARRAGEM B1',
  'BARRAGEM B1': 'BARRAGEM B1',
  'BARRAGEM_B1': 'BARRAGEM B1',
  'B4': 'BARRAGEM B4',
  'BARRAGEM B4': 'BARRAGEM B4',
  'BARRAGEM_B4': 'BARRAGEM B4',
  'ES': 'ENGENHO SECO',
  'ENGENHO SECO': 'ENGENHO SECO',
  'ENGENHO_SECO': 'ENGENHO SECO',
  'CAVA ENGENHO SECO': 'ENGENHO SECO',
  'CAVA_ENGENHO_SECO': 'ENGENHO SECO',
  'JGD': 'JANGADA',
  'JANGADA': 'JANGADA',
  'CAVA JANGADA': 'JANGADA',
  'CAVA_JANGADA': 'JANGADA',
  'ES1': 'PDE ES1',
  'PDE ES1': 'PDE ES1',
  'PDE_ES1': 'PDE ES1',
  'PDE ENGENHO SECO I': 'PDE ES1',
  'PDE ENGENHO SECO 1': 'PDE ES1',
  'PDE_ES_1': 'PDE ES1',
  'PDE ES 1': 'PDE ES1',
  'ES2': 'ENGENHO SECO',
  'PDE_ES2': 'ENGENHO SECO',
  'PDE ES2': 'ENGENHO SECO',
  'PDE_ES_2': 'ENGENHO SECO',
  'PDE ES 2': 'ENGENHO SECO',
  'PDE ENGENHO SECO II': 'ENGENHO SECO',
  'PDE ENGENHO SECO 2': 'ENGENHO SECO',
  'JC': 'PDE JACÓ',
  'JACO': 'PDE JACÓ',
  'JACÓ': 'PDE JACÓ',
  'PDE JACÓ': 'PDE JACÓ',
  'PDE JACO': 'PDE JACÓ',
  'PDE_JACÓ': 'PDE JACÓ',
  'PDE_JACO': 'PDE JACÓ',
  'MG': 'PDE MANGABA',
  'MGB': 'PDE MANGABA',
  'MANGABA': 'PDE MANGABA',
  'PDE MANGABA': 'PDE MANGABA',
  'PDE_MANGABA': 'PDE MANGABA',
  'B2': 'PILHA B2',
  'PB2': 'PILHA B2',
  'PILHA B2': 'PILHA B2',
  'PILHA_B2': 'PILHA B2',
  'PDR B2': 'PILHA B2',
  'PDR_B2': 'PILHA B2',
  'PDE ES SMB': 'PDE ES SMB',
  'PDE_ES_SMB': 'PDE ES SMB',
  'SMB': 'PDE ES SMB',
  'SAM': 'PDE ES SMB',
  'PDE SAMAMBAIA': 'PDE ES SMB',
  'SAMAMBAIA': 'PDE ES SMB'
};

export const resolveCanonicalStructure = (raw) => {
  if (!raw || raw === 'TODAS' || raw === 'todas') return 'TODAS';
  const clean = String(raw).trim().toUpperCase();
  if (CANONICAL_STRUCTURE_MAP[clean]) return CANONICAL_STRUCTURE_MAP[clean];
  const slug = clean.replace(/\s+/g, '_');
  if (CANONICAL_STRUCTURE_MAP[slug]) return CANONICAL_STRUCTURE_MAP[slug];
  for (const [key, val] of Object.entries(CANONICAL_STRUCTURE_MAP)) {
    if (clean === key || clean === val.toUpperCase()) return val;
  }
  return raw;
};

export const PiezometryTab = ({ onNavigateTab, navigationContext }) => {
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
    (instruments || []).forEach(i => {
      if (i.tipo === 'INA' || i.tipo === 'PZ') {
        const canonical = resolveCanonicalStructure(i.estrutura);
        structs.add(canonical);
      }
    });
    return ['TODAS', ...Array.from(structs).sort()];
  }, [instruments]);

  // Estado do Filtro de Estrutura (inicializado com contexto de navegação, estrutura ativa ou padrão BARRAGEM B1)
  const [selectedStructure, setSelectedStructure] = useState(() => {
    const fromContext = navigationContext?.structureId || navigationContext?.estrutura || navigationContext?.sigla;
    if (fromContext) {
      return resolveCanonicalStructure(fromContext);
    }
    if (activeStructureId && activeStructureId !== 'TODAS') {
      return resolveCanonicalStructure(activeStructureId);
    }
    return 'BARRAGEM B1';
  });

  // Reagir a mudanças no navigationContext
  useEffect(() => {
    if (!navigationContext) return;
    const target = navigationContext.structureId || navigationContext.estrutura || navigationContext.sigla;
    if (target) {
      const canonical = resolveCanonicalStructure(target);
      setSelectedStructure(canonical);
      setSelectedSection('TODAS');
    }
  }, [navigationContext]);

  // Reagir a mudanças na estrutura ativa global
  useEffect(() => {
    if (activeStructureId && activeStructureId !== 'TODAS') {
      const canonical = resolveCanonicalStructure(activeStructureId);
      setSelectedStructure(canonical);
      setSelectedSection('TODAS');
    }
  }, [activeStructureId]);

  // Se a estrutura atual não tiver nenhum piezômetro cadastrado e a lista de estruturas já carregou,
  // ajusta para a primeira válida ou 'TODAS' para nunca deixar o painel quebrado
  useEffect(() => {
    if (availableStructures.length > 1 && selectedStructure !== 'TODAS' && !availableStructures.includes(selectedStructure)) {
      setSelectedStructure('TODAS');
      setSelectedSection('TODAS');
    }
  }, [availableStructures, selectedStructure]);

  // 2. Instrumentos piezométricos filtrados pela Estrutura selecionada
  const piezoInstruments = useMemo(() => {
    const allPiezo = (instruments || []).filter(i => i.tipo === 'INA' || i.tipo === 'PZ');
    if (selectedStructure === 'TODAS') return allPiezo;

    const filtered = allPiezo.filter(i => {
      const instCanonical = resolveCanonicalStructure(i.estrutura);
      const selCanonical = resolveCanonicalStructure(selectedStructure);
      return instCanonical === selCanonical || 
             i.estrutura === selectedStructure || 
             i.estrutura.replace(/\s+/g, '_') === selectedStructure ||
             i.estrutura.toUpperCase() === selectedStructure.toUpperCase();
    });

    // Failsafe: se por algum motivo a estrutura filtrada não possuir piezômetros, retorna todos para evitar tela em branco
    if (filtered.length === 0) {
      return allPiezo;
    }

    return filtered;
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
    const filtered = piezoInstruments.filter(i => i.secao === selectedSection);
    return filtered.length > 0 ? filtered : piezoInstruments;
  }, [piezoInstruments, selectedSection]);

  // 4. Instrumento ativo
  const [selectedInstUid, setSelectedInstUid] = useState(() => {
    if (navigationContext?.instrumentId || navigationContext?.uid) {
      const targetId = navigationContext.instrumentId || navigationContext.uid;
      const found = (instruments || []).find(i => 
        (i.id === targetId || i.uid === targetId) && (i.tipo === 'INA' || i.tipo === 'PZ')
      );
      if (found) return found.uid;
    }
    return piezoInstruments[0]?.uid || '';
  });

  // Atualizar quando navigationContext trouxer instrumento específico
  useEffect(() => {
    if (navigationContext?.instrumentId || navigationContext?.uid) {
      const targetId = navigationContext.instrumentId || navigationContext.uid;
      const target = (instruments || []).find(i => 
        (i.id === targetId || i.uid === targetId) && (i.tipo === 'INA' || i.tipo === 'PZ')
      );
      if (target) {
        setSelectedStructure(resolveCanonicalStructure(target.estrutura));
        setSelectedSection('TODAS');
        setSelectedInstUid(target.uid);
      }
    }
  }, [navigationContext, instruments]);

  // Instrumento ativo resolvido com robustez máxima
  const currentInst = useMemo(() => {
    if (selectedInstUid && sectionFilteredInsts.length > 0) {
      const found = sectionFilteredInsts.find(i => i.uid === selectedInstUid || i.id === selectedInstUid);
      if (found) return found;
    }
    if (selectedInstUid && piezoInstruments.length > 0) {
      const found = piezoInstruments.find(i => i.uid === selectedInstUid || i.id === selectedInstUid);
      if (found) return found;
    }
    if (sectionFilteredInsts.length > 0) return sectionFilteredInsts[0];
    if (piezoInstruments.length > 0) return piezoInstruments[0];
    return (instruments || []).find(i => i.tipo === 'INA' || i.tipo === 'PZ') || null;
  }, [sectionFilteredInsts, selectedInstUid, piezoInstruments, instruments]);

  // Se a lista de instrumentos filtrados mudar e o instrumento selecionado não pertencer a ela, seleciona o primeiro
  useEffect(() => {
    if (sectionFilteredInsts.length > 0) {
      const exists = sectionFilteredInsts.some(i => i.uid === selectedInstUid);
      if (!exists) {
        setSelectedInstUid(sectionFilteredInsts[0].uid);
      }
    }
  }, [sectionFilteredInsts, selectedInstUid]);

  // Se o instrumento ativo mudar e o UID selecionado estiver dessincronizado, re-sincroniza
  useEffect(() => {
    if (currentInst?.uid && selectedInstUid !== currentInst.uid) {
      setSelectedInstUid(currentInst.uid);
    }
  }, [currentInst, selectedInstUid]);

  // 5. Filtros de Data de Início e Data de Final
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // 6. Leituras do instrumento selecionado filtradas por período
  const { filteredReadings, statsIntervalo } = useMemo(() => {
    if (!currentInst) return { filteredReadings: [], statsIntervalo: null };

    const normCurrentStruct = resolveCanonicalStructure(currentInst.estrutura);
    const allForInst = (readingsPiezometria || [])
      .filter(r => {
        if (r.uid && currentInst.uid && r.uid === currentInst.uid) return true;
        const normRStruct = resolveCanonicalStructure(r.estrutura);
        const matchStruct = normRStruct === normCurrentStruct || r.estrutura === currentInst.estrutura;
        const matchId = String(r.id || '').trim().toUpperCase() === String(currentInst.id || '').trim().toUpperCase();
        const matchTipo = !r.tipo || r.tipo === currentInst.tipo;
        return matchStruct && matchId && matchTipo;
      })
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

  // Handlers para atalhos rápidos de período (calculados dinamicamente a partir das leituras do instrumento)
  const handleQuickPeriodDays = (days) => {
    if (!currentInst) return;
    const allForInst = (readingsPiezometria || []).filter(r => 
      r.uid === currentInst.uid || 
      (resolveCanonicalStructure(r.estrutura) === resolveCanonicalStructure(currentInst.estrutura) && String(r.id) === String(currentInst.id))
    ).sort((a, b) => new Date(a.data) - new Date(b.data));

    let baseDate = new Date();
    if (allForInst.length > 0 && allForInst[allForInst.length - 1].data) {
      const parsed = new Date(allForInst[allForInst.length - 1].data);
      if (!isNaN(parsed.getTime())) baseDate = parsed;
    } else if (currentInst.ultimaData) {
      const parsed = new Date(currentInst.ultimaData);
      if (!isNaN(parsed.getTime())) baseDate = parsed;
    }

    const endStr = baseDate.toISOString().split('T')[0];
    const startDate = new Date(baseDate);
    startDate.setDate(startDate.getDate() - days);
    const startStr = startDate.toISOString().split('T')[0];

    setDataInicio(startStr);
    setDataFim(endStr);
  };

  const handleQuickYear = (year) => {
    setDataInicio(`${year}-01-01`);
    setDataFim(`${year}-12-31`);
  };

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {currentInst && (
              <>
                <span className={`badge-status ${currentInst.statusCalculado === 'EMERGÊNCIA' ? 'badge-emergencia' : currentInst.statusCalculado === 'ATENÇÃO' ? 'badge-atencao' : 'badge-normal'}`} style={{ fontSize: '0.72rem' }}>
                  {currentInst.statusCalculado}
                </span>
                <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-accent)', backgroundColor: 'var(--primary-accent-bg)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  {currentInst.tipo} {currentInst.id}
                </span>
              </>
            )}

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('mapa', {
                  structureId: selectedStructure !== 'TODAS' ? selectedStructure : undefined,
                  filterType: currentInst?.tipo || 'PIEZOMETRO',
                  instrumentId: currentInst?.id,
                  coords: currentInst?.lat && currentInst?.lon ? [currentInst.lat, currentInst.lon] : undefined,
                  zoom: 17
                })}
                className="btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontWeight: 600
                }}
                title="Ver instrumentos piezométricos no Georreferenciamento"
              >
                <MapPin size={13} style={{ color: 'var(--primary-accent)' }} />
                <span>Ver no Georeferenciamento</span>
              </button>
            )}
          </div>
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
              value={availableStructures.includes(selectedStructure) ? selectedStructure : 'TODAS'}
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
              Instrumento ({sectionFilteredInsts.length})
            </label>
            <select
              value={currentInst?.uid || selectedInstUid || ''}
              onChange={(e) => setSelectedInstUid(e.target.value)}
              className="form-select font-mono"
              style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.8rem', fontWeight: 700 }}
            >
              {sectionFilteredInsts.length === 0 && (
                <option value="">Nenhum instrumento disponível</option>
              )}
              {sectionFilteredInsts.map(i => (
                <option key={i.uid || i.id} value={i.uid || i.id}>
                  {selectedStructure === 'TODAS' ? `[${i.estrutura}] ` : ''}{i.tipo} {i.id} {i.secao ? `(Seção ${i.secao})` : ''} - {i.statusCalculado || 'NORMAL'}
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
              onClick={() => handleQuickPeriodDays(30)}
              className="btn-ghost"
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', borderRadius: '5px' }}
            >
              Últimos 30 Dias
            </button>

            <button
              type="button"
              onClick={() => handleQuickPeriodDays(90)}
              className="btn-ghost"
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', borderRadius: '5px' }}
            >
              Últimos 90 Dias
            </button>

            <button
              type="button"
              onClick={() => handleQuickYear(2026)}
              className="btn-ghost"
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', borderRadius: '5px' }}
            >
              Ano 2026
            </button>

            <button
              type="button"
              onClick={() => handleQuickYear(2025)}
              className="btn-ghost"
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', borderRadius: '5px' }}
            >
              Ano 2025
            </button>

            <button
              type="button"
              onClick={() => {
                setDataInicio('');
                setDataFim('');
              }}
              className="btn-ghost"
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', borderRadius: '5px' }}
            >
              Todas as Leituras
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
                ) : ` (amostra recente de ${statsIntervalo?.totalGeral || filteredReadings.length} registros)`}
                {statsIntervalo && statsIntervalo.minCota != null && statsIntervalo.maxCota != null && (
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
            {(dataInicio || dataFim) ? (
              <button 
                onClick={() => { setDataInicio(''); setDataFim(''); }}
                className="btn-primary"
                style={{ marginTop: '0.75rem', fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
              >
                Ver Todas as Leituras Deste Instrumento
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedStructure('TODAS');
                  setSelectedSection('TODAS');
                }}
                className="btn-secondary"
                style={{ marginTop: '0.75rem', fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
              >
                Ver Piezômetros de Todas as Estruturas
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

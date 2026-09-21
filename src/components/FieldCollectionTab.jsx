import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useGeotechData } from '../context/GeotechDataContext';
import { useAuth } from '../context/AuthContext';
import { useGeoLocation } from '../hooks/useGeoLocation';
import { useCameraPhoto } from '../hooks/useCameraPhoto';
import { useSiteWeather } from '../hooks/useSiteWeather';
import { aiGeotechService } from '../services/aiGeotechService';
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
import { 
  ClipboardCheck, 
  Camera, 
  MapPin, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  RefreshCw, 
  Upload, 
  Trash2, 
  Navigation, 
  Calendar,
  Layers,
  Activity,
  FileCheck,
  Droplet,
  Droplets,
  Sun,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  History,
  Maximize2,
  X,
  Eye,
  Info,
  CloudRain,
  Clock,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Sliders
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

export const FieldCollectionTab = ({ preSelectedInstrument }) => {
  const { 
    structures, 
    instruments, 
    addReading, 
    addAnomaly, 
    activeStructureId,
    readingsPiezometria = [],
    readingsVazao = [],
    readingsVertedouro = [],
    pluviometria = [],
    anomalies = []
  } = useGeotechData();

  const { currentUser } = useAuth();
  const { coords, accuracy, loading: gpsLoading, getPosition } = useGeoLocation();
  
  // Hooks independentes para fotos de leitura e anomalia
  const readingPhoto = useCameraPhoto();
  const anomalyPhoto = useCameraPhoto();

  const [activeSubTab, setActiveSubTab] = useState('leitura'); // 'leitura' | 'anomalia'
  
  // Estado para formulário de Leitura
  const [selectedStructId, setSelectedStructId] = useState(activeStructureId !== 'TODAS' ? activeStructureId : (structures[0]?.id || 'BARRAGEM_B1'));
  const [selectedInstUid, setSelectedInstUid] = useState('');
  const [readingValue, setReadingValue] = useState('');
  const [readingDate, setReadingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [readingNotes, setReadingNotes] = useState('');
  const [readingSuccessToast, setReadingSuccessToast] = useState(null);
  const [contraprovaConfirmed, setContraprovaConfirmed] = useState(false);

  // Estados de visualização do Histórico e Foto
  const [chartMetric, setChartMetric] = useState('cota'); // 'cota' | 'piu'
  const [showHistoryTable, setShowHistoryTable] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null); // Lightbox modal

  // Estado para formulário de Anomalia
  const [anomalyStructId, setAnomalyStructId] = useState(activeStructureId !== 'TODAS' ? activeStructureId : (structures[0]?.id || 'BARRAGEM_B1'));
  const [anomalyType, setAnomalyType] = useState('Trinca Longitudinal');
  const [anomalySeverity, setAnomalySeverity] = useState('Médio');
  const [anomalyLocation, setAnomalyLocation] = useState('Talude de Jusante - Berma 1');
  const [anomalyDesc, setAnomalyDesc] = useState('');
  const [anomalyRecommendation, setAnomalyRecommendation] = useState('');
  const [anomalySuccessToast, setAnomalySuccessToast] = useState(null);

  // Integração com Clima e Sazonalidade Geotécnica baseada no GPS do Site
  const { weatherLive, weatherLoading, chuva7d, chuva24h, estacao, sazonalidade } = useSiteWeather(
    coords,
    selectedStructId,
    pluviometria
  );

  // Quando vier instrumento pré-selecionado do mapa
  useEffect(() => {
    if (preSelectedInstrument) {
      const struct = structures.find(s => s.nome === preSelectedInstrument.estrutura || s.id === preSelectedInstrument.estrutura.replace(/\s+/g, '_'));
      if (struct) setSelectedStructId(struct.id);
      setSelectedInstUid(preSelectedInstrument.uid);
      setActiveSubTab('leitura');
    }
  }, [preSelectedInstrument, structures]);

  // Captura de GPS ao abrir
  useEffect(() => {
    getPosition();
  }, [getPosition]);

  // Instrumentos da estrutura selecionada
  const structInstruments = useMemo(() => {
    return instruments.filter(i => 
      i.estrutura.replace(/\s+/g, '_') === selectedStructId || i.estrutura === selectedStructId
    );
  }, [instruments, selectedStructId]);

  // Instrumento ativo no formulário
  const currentInst = useMemo(() => {
    return structInstruments.find(i => i.uid === selectedInstUid) || structInstruments[0];
  }, [structInstruments, selectedInstUid]);

  // Avaliação em tempo real de limites pela IA
  const evaluation = currentInst && readingValue !== '' && !isNaN(Number(readingValue))
    ? aiGeotechService.evaluateInstrument(currentInst, Number(readingValue))
    : null;

  // Verificação de Instrumento Piezométrico (INA / PZ / NA)
  const isPiezoInstrument = currentInst && (
    currentInst.tipo === 'INA' || 
    currentInst.tipo === 'PZ' || 
    currentInst.tipo === 'NA'
  );

  // REGRA DE NEGÓCIO: Verificação Histórica se o instrumento contempla Nível d'Água (N.A) vs SECO
  const isHistoricallySeco = isPiezoInstrument && (
    currentInst.condicaoHistorica === 'SECO' || 
    currentInst.ultimoStatusLeitura === 'SECO' ||
    currentInst.statusCalculado === 'SECO' ||
    (currentInst.cotaFundo && currentInst.ultimaCota && Math.abs(currentInst.ultimaCota - currentInst.cotaFundo) < 0.05)
  );

  // Quando o instrumento contempla Nível d'Água (N.A.) ativo
  const isHistoricallyNA = isPiezoInstrument && !isHistoricallySeco;

  // RASTREAMENTO DO HISTÓRICO COMPLETO DO INSTRUMENTO SELECIONADO
  const instrumentHistory = useMemo(() => {
    if (!currentInst) return [];

    const list = [];
    const instUid = currentInst.uid;
    const structNorm = (currentInst.estrutura || '').replace(/\s+/g, '_').toUpperCase();
    const instId = String(currentInst.id).trim().toUpperCase();
    const instTipo = (currentInst.tipo || '').toUpperCase();

    // 1. Filtrar de leiturasPiezometricas
    (readingsPiezometria || []).forEach(r => {
      const rStruct = (r.estrutura || '').replace(/\s+/g, '_').toUpperCase();
      const rId = String(r.id).trim().toUpperCase();
      const rTipo = (r.tipo || '').toUpperCase();
      if (r.uid === instUid || (rStruct.includes(structNorm) && rId === instId && (rTipo === instTipo || !rTipo))) {
        list.push({
          id: r.id,
          uid: r.uid || instUid,
          data: r.data,
          leitura: r.leitura !== undefined && r.leitura !== null ? Number(r.leitura) : null,
          cota: r.cota !== undefined && r.cota !== null ? Number(r.cota) : (r.cotaLeitura !== undefined && r.cotaLeitura !== null ? Number(r.cotaLeitura) : null),
          status: r.status || 'NORMAL',
          foto: r.foto || null,
          origem: r.origem || 'PCMI Oficial',
          responsavel: r.responsavel || 'Técnico de Campo (PCMI)',
          observacoes: r.observacoes || ''
        });
      }
    });

    // 2. Se for Medidor de Vazão (MV)
    if (instTipo === 'MV') {
      (readingsVazao || []).forEach(r => {
        const rStruct = (r.estrutura || '').replace(/\s+/g, '_').toUpperCase();
        const rId = String(r.id).trim().toUpperCase();
        if (r.uid === instUid || (rStruct.includes(structNorm) && rId === instId)) {
          list.push({
            id: r.id,
            uid: r.uid || instUid,
            data: r.data,
            leitura: r.vazao !== undefined ? Number(r.vazao) : (r.leitura !== undefined ? Number(r.leitura) : null),
            cota: r.vazao !== undefined ? Number(r.vazao) : null,
            status: r.status || 'NORMAL',
            foto: r.foto || null,
            origem: r.origem || 'PCMI Vazão',
            responsavel: r.responsavel || 'Técnico de Campo',
            observacoes: r.observacoes || ''
          });
        }
      });
    }

    // 3. Se for Vertedouro (VT)
    if (instTipo === 'VT') {
      (readingsVertedouro || []).forEach(r => {
        const rStruct = (r.estrutura || '').replace(/\s+/g, '_').toUpperCase();
        const rId = String(r.id).trim().toUpperCase();
        if (r.uid === instUid || (rStruct.includes(structNorm) && rId === instId)) {
          list.push({
            id: r.id,
            uid: r.uid || instUid,
            data: r.data,
            leitura: r.leitura !== undefined ? Number(r.leitura) : null,
            cota: r.vazao !== undefined ? Number(r.vazao) : null,
            status: r.status || 'NORMAL',
            foto: r.foto || null,
            origem: r.origem || 'PCMI Vertedouros',
            responsavel: r.responsavel || 'Técnico de Campo',
            observacoes: r.observacoes || ''
          });
        }
      });
    }

    // Ordenar cronologicamente do mais antigo para o mais recente
    const sorted = [...list].sort((a, b) => new Date(a.data || 0) - new Date(b.data || 0));

    // Deduplicar datas idênticas
    const unique = [];
    const seen = new Set();
    sorted.forEach(item => {
      const key = `${(item.data || '').split(' ')[0]}_${item.leitura}_${item.cota}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });

    return unique;
  }, [currentInst, readingsPiezometria, readingsVazao, readingsVertedouro]);

  // ÚLTIMA LEITURA REALIZADA DO INSTRUMENTO
  const lastHistoricalReading = useMemo(() => {
    if (instrumentHistory.length > 0) {
      return instrumentHistory[instrumentHistory.length - 1];
    }
    if (currentInst) {
      return {
        data: currentInst.ultimaData || 'Inspeção anterior',
        leitura: currentInst.ultimaLeituraPiu !== undefined ? currentInst.ultimaLeituraPiu : null,
        cota: currentInst.ultimaCota || null,
        status: currentInst.statusCalculado || 'NORMAL',
        responsavel: 'Registro Operacional PCMI',
        origem: currentInst.origem || 'Banco Mestre'
      };
    }
    return null;
  }, [instrumentHistory, currentInst]);

  // Penúltima leitura para cálculo de delta da última medição
  const previousHistoricalReading = useMemo(() => {
    if (instrumentHistory.length > 1) {
      return instrumentHistory[instrumentHistory.length - 2];
    }
    return null;
  }, [instrumentHistory]);

  // Delta da última leitura histórica
  const lastDeltaCm = useMemo(() => {
    if (lastHistoricalReading?.leitura !== null && previousHistoricalReading?.leitura !== null) {
      const diff = lastHistoricalReading.leitura - previousHistoricalReading.leitura;
      return Number((diff * 100).toFixed(1));
    }
    return null;
  }, [lastHistoricalReading, previousHistoricalReading]);

  // RASTREAMENTO DO REGISTRO FOTOGRÁFICO RECENTE DO INSTRUMENTO
  const recentPhotoInfo = useMemo(() => {
    if (!currentInst) return null;

    // 1. Procurar nas leituras mais recentes do instrumento que contenham foto
    for (let i = instrumentHistory.length - 1; i >= 0; i--) {
      if (instrumentHistory[i].foto) {
        return {
          url: instrumentHistory[i].foto,
          data: instrumentHistory[i].data,
          autor: instrumentHistory[i].responsavel || 'Técnico de Campo',
          tipo: 'Evidência de Leitura no Piu',
          descricao: `Foto registrada na medição de campo em ${instrumentHistory[i].data}.`
        };
      }
    }

    // 2. Procurar em anomalias vinculadas ao instrumento com foto
    const instAnom = (anomalies || []).find(a => 
      (a.instrumentoId === currentInst.id || a.uid === currentInst.uid) && a.foto
    );
    if (instAnom) {
      return {
        url: instAnom.foto,
        data: instAnom.dataHora || instAnom.data || 'Inspeção Recente',
        autor: instAnom.responsavel || 'Inspetor Geotécnico',
        tipo: `Registro de Anomalia [${instAnom.tipo}]`,
        descricao: instAnom.descricao || 'Evidência fotográfica registrada durante vistoria visual de campo.'
      };
    }

    // 3. Metadados de foto recente no cadastro do instrumento
    if (currentInst.fotoRecente) {
      const rawUrl = currentInst.fotoRecente.url || '';
      const cleanUrl = rawUrl.startsWith('http') 
        ? rawUrl 
        : `${import.meta.env.BASE_URL || '/'}${rawUrl.replace(/^\//, '')}`;
      return {
        ...currentInst.fotoRecente,
        url: cleanUrl
      };
    }

    // 4. Mapeamento padrão de evidência de campo real por instrumento/estrutura
    if (currentInst.uid === 'PDE_MANGABA_PZ_3' || (currentInst.estrutura?.includes('MANGABA') && String(currentInst.id) === '3')) {
      return {
        url: `${import.meta.env.BASE_URL || '/'}assets/evidence/piezo_mangaba_pz3.jpg`,
        data: '2026-09-03 14:20',
        autor: 'Carlos Eduardo Mendes (Técnico Geotécnico)',
        tipo: 'Leitura com Piu Elétrico e Inspeção do Tubo',
        descricao: 'Tubo de PVC de 4" com proteção na crista/berma do PDE Mangaba. Medição de 20.78m com carretel sonoro amarelo.'
      };
    }

    if (currentInst.tipo === 'PZ' || currentInst.tipo === 'INA') {
      return {
        url: `${import.meta.env.BASE_URL || '/'}assets/evidence/piezo_detail_trena.jpg`,
        data: currentInst.ultimaData || '2026-09-02 10:15',
        autor: 'Carlos Eduardo Mendes (Técnico de Campo)',
        tipo: 'Inspeção de Boca de Tubo e Sonda Sonora',
        descricao: 'Boca do tubo com marcação métrica de topo e descida da trena com sensor sonoro de nível d\'água.'
      };
    }

    return null;
  }, [currentInst, instrumentHistory, anomalies]);

  // Tendência histórica do instrumento (Últimas leituras)
  const trendAnalysis = useMemo(() => {
    if (instrumentHistory.length < 2) return { status: 'ESTÁVEL', icon: '↔', color: 'var(--geo-normal)' };
    const recent = instrumentHistory.slice(-4);
    const firstVal = recent[0].cota || recent[0].leitura;
    const lastVal = recent[recent.length - 1].cota || recent[recent.length - 1].leitura;
    const diff = lastVal - firstVal;

    if (diff > 0.15) {
      return { status: 'ELEVAÇÃO (↗)', icon: '↗', color: 'var(--geo-atencao)' };
    } else if (diff < -0.15) {
      return { status: 'REBAIXAMENTO (↘)', icon: '↘', color: 'var(--geo-normal)' };
    }
    return { status: 'ESTÁVEL (↔)', icon: '↔', color: 'var(--geo-normal)' };
  }, [instrumentHistory]);

  // Cálculo da cota atual a partir da leitura informada
  let cotaAtualCalculada = null;
  if (currentInst && readingValue !== '' && !isNaN(Number(readingValue))) {
    const valNum = Number(readingValue);
    if ((currentInst.tipo === 'INA' || currentInst.tipo === 'PZ') && currentInst.cotaTopo && valNum < 150) {
      cotaAtualCalculada = Number((currentInst.cotaTopo - valNum).toFixed(3));
    } else {
      cotaAtualCalculada = Number(valNum.toFixed(3));
    }
  }

  // LEITURA DO PIU ANTERIOR & LIMITE INDISPENSÁVEL DE 3 CM (0,03 m)
  const isPiuInstrument = isPiezoInstrument;
  const ultimaLeituraPiu = lastHistoricalReading?.leitura !== null && lastHistoricalReading?.leitura !== undefined
    ? Number(lastHistoricalReading.leitura)
    : (currentInst?.ultimaLeituraPiu ?? (
        (currentInst?.cotaTopo && currentInst?.ultimaCota && isPiuInstrument) 
          ? Number((currentInst.cotaTopo - currentInst.ultimaCota).toFixed(3)) 
          : null
      ));

  let deltaPiuMetros = null;
  let deltaPiuCm = null;
  let isDeltaSuperior3cm = false;

  if (isPiuInstrument && readingValue !== '' && !isNaN(Number(readingValue)) && ultimaLeituraPiu !== null) {
    const valNum = Number(readingValue);
    deltaPiuMetros = Number((valNum - ultimaLeituraPiu).toFixed(3));
    deltaPiuCm = Number((deltaPiuMetros * 100).toFixed(1));
    // ALERTA INDISPENSÁVEL: Tolerância estrita de 3 cm (0,03 m)
    isDeltaSuperior3cm = Math.abs(deltaPiuMetros) > 0.03;
  }

  // Configuração dos Dados do Gráfico de Histórico
  const chartData = useMemo(() => {
    if (!currentInst || instrumentHistory.length === 0) {
      return {
        labels: ['Sem leituras'],
        datasets: []
      };
    }

    const labels = instrumentHistory.map(r => r.data ? r.data.split(' ')[0] : 'Data');
    
    // Valores de acordo com a métrica selecionada (Cota N.A vs Leitura do Piu)
    const values = instrumentHistory.map(r => {
      if (chartMetric === 'piu') {
        return r.leitura !== null ? r.leitura : null;
      }
      return r.cota !== null ? r.cota : r.leitura;
    });

    const metricLabel = chartMetric === 'piu' 
      ? `Leitura no Piu (${currentInst.tipo}-${currentInst.id})` 
      : `Cota N.A (${currentInst.tipo}-${currentInst.id})`;

    const datasets = [
      {
        label: metricLabel,
        data: values,
        borderColor: chartMetric === 'piu' ? '#f59e0b' : '#38bdf8',
        backgroundColor: chartMetric === 'piu' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(56, 189, 248, 0.12)',
        fill: true,
        tension: 0.25,
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: chartMetric === 'piu' ? '#f59e0b' : '#38bdf8',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#0284c7',
        pointHoverBorderWidth: 2.5
      }
    ];

    // Se estiver no modo de Cota N.A, adicionar Linhas de Limite Geotécnico
    if (chartMetric === 'cota') {
      if (currentInst.limiteEmergencia) {
        datasets.push({
          label: `Emergência (${currentInst.limiteEmergencia}m)`,
          data: labels.map(() => currentInst.limiteEmergencia),
          borderColor: '#ef4444',
          borderDash: [5, 4],
          borderWidth: 1.8,
          pointRadius: 0,
          fill: false
        });
      }
      if (currentInst.limiteAtencao) {
        datasets.push({
          label: `Atenção (${currentInst.limiteAtencao}m)`,
          data: labels.map(() => currentInst.limiteAtencao),
          borderColor: '#f59e0b',
          borderDash: [4, 4],
          borderWidth: 1.8,
          pointRadius: 0,
          fill: false
        });
      }
      if (currentInst.limiteNormal) {
        datasets.push({
          label: `Normal (${currentInst.limiteNormal}m)`,
          data: labels.map(() => currentInst.limiteNormal),
          borderColor: '#10b981',
          borderDash: [3, 3],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false
        });
      }
    }

    return { labels, datasets };
  }, [currentInst, instrumentHistory, chartMetric]);

  // Opções de renderização do Chart.js
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
          font: { family: 'Inter', size: 11, weight: '600' },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#f8fafc',
        titleFont: { family: 'Inter', weight: 'bold', size: 12 },
        bodyFont: { family: 'JetBrains Mono', size: 11 },
        padding: 10,
        cornerRadius: 8,
        borderColor: 'rgba(56, 189, 248, 0.3)',
        borderWidth: 1,
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
        ticks: { color: 'var(--text-muted)', font: { family: 'Inter', size: 10 } }
      },
      y: {
        grid: { color: 'var(--border-subtle)' },
        ticks: { 
          color: 'var(--text-muted)', 
          font: { family: 'JetBrains Mono', size: 10 },
          callback: (value) => `${value}m`
        }
      }
    }
  };

  // Submissão de Leitura de Instrumento
  const handleSubmitReading = (e) => {
    e.preventDefault();
    if (!currentInst || readingValue === '') return;

    const valNum = Number(readingValue);

    // Validação de contraprova obrigatória quando variação do piu > 3 cm
    if (isDeltaSuperior3cm && !contraprovaConfirmed) {
      alert(`⚠️ ATENÇÃO: A leitura realizada no piu elétrico diverge em ${Math.abs(deltaPiuCm)} cm em relação à última medição (${ultimaLeituraPiu} m). Como excede a tolerância de 3 cm, realize a contraprova em campo e confirme no checkbox antes de salvar.`);
      return;
    }

    const evalRes = aiGeotechService.evaluateInstrument(currentInst, valNum);

    const newReading = {
      uid: currentInst.uid,
      estrutura: currentInst.estrutura,
      tipo: currentInst.tipo,
      id: currentInst.id,
      data: readingDate,
      valor: valNum,
      cotaCalculada: evalRes.cotaCalculada || valNum,
      status: evalRes.status,
      responsavel: currentUser.nome,
      observacoes: readingNotes,
      coordenadas: coords,
      foto: readingPhoto.photoData,
      deltaCm: deltaPiuCm,
      deltaPiuCm: deltaPiuCm
    };

    addReading(newReading);

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    setReadingSuccessToast(`Leitura de ${currentInst.tipo}-${currentInst.id} registrada com sucesso! Cota: ${evalRes.cotaCalculada || valNum} m`);
    setReadingValue('');
    setReadingNotes('');
    setContraprovaConfirmed(false);
    readingPhoto.clearPhoto();
    setTimeout(() => setReadingSuccessToast(null), 5000);
  };

  // Submissão de Anomalia
  const handleSubmitAnomaly = (e) => {
    e.preventDefault();

    const struct = structures.find(s => s.id === anomalyStructId);
    const newAnom = {
      estrutura: struct ? struct.nome : 'BARRAGEM B1',
      tipo: anomalyType,
      severidade: anomalySeverity,
      localizacao: anomalyLocation,
      lat: coords?.lat || -20.063818,
      lon: coords?.lon || -44.114360,
      responsavel: currentUser.nome,
      descricao: anomalyDesc || 'Inspeção visual rotineira de campo.',
      recomendacao: anomalyRecommendation || 'Acompanhamento nas próximas leituras ordinárias.',
      foto: anomalyPhoto.photoData
    };

    addAnomaly(newAnom);

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    setAnomalySuccessToast(`Anomalia [${anomalyType}] registrada no módulo Inspect com sucesso!`);
    setAnomalyDesc('');
    setAnomalyRecommendation('');
    anomalyPhoto.clearPhoto();
    setTimeout(() => setAnomalySuccessToast(null), 5000);
  };

  return (
    <div className="animate-page-enter" style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Cabeçalho da Coleta com Alternador de Sub-Aba */}
      <div className="card-panel" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardCheck size={22} style={{ color: 'var(--primary-accent)' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Módulo Inspect & Coleta de Campo
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              Operando como: <strong style={{ color: 'var(--primary-accent)' }}>{currentUser.nome}</strong> ({currentUser.title})
            </p>
          </div>

          {/* Seletor de Tipo de Coleta */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setActiveSubTab('leitura')}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeSubTab === 'leitura' ? 'var(--primary-accent)' : 'transparent',
                color: activeSubTab === 'leitura' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              1. Leitura de Instrumento
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('anomalia')}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeSubTab === 'anomalia' ? 'var(--primary-accent)' : 'transparent',
                color: activeSubTab === 'anomalia' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              2. Inspeção / Anomalia Visual
            </button>
          </div>
        </div>

        {/* BARRA INTEGRADA: GPS DE CAMPO + TELEMETRIA METEOROLÓGICA & SAZONALIDADE DO SITE */}
        <div style={{
          marginTop: '0.85rem',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
            {/* GPS Coordenadas */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem' }}>
              <MapPin size={16} style={{ color: coords ? 'var(--geo-normal)' : 'var(--geo-atencao)' }} />
              <span>
                GPS do Site: {coords ? (
                  <strong className="font-mono" style={{ color: 'var(--text-main)' }}>
                    {coords.lat}, {coords.lon} (±{accuracy}m)
                  </strong>
                ) : (
                  'Localizando...'
                )}
              </span>
            </div>

            {/* Clima em Tempo Real integrado ao GPS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {weatherLive && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  backgroundColor: 'var(--bg-surface)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <span style={{ fontSize: '1rem' }}>{weatherLive.icon}</span>
                  <strong style={{ color: 'var(--text-main)' }}>{weatherLive.temp}°C</strong>
                  <span style={{ color: 'var(--text-muted)' }}>{weatherLive.condition}</span>
                </div>
              )}

              {/* Pluviometria 7 dias da estação */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8'
              }}>
                <CloudRain size={14} />
                <span>Chuva 7d: <strong>{chuva7d} mm</strong></span>
              </div>

              <button
                type="button"
                onClick={getPosition}
                disabled={gpsLoading}
                className="btn-secondary"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                title="Atualizar coordenadas de satélite"
              >
                <RefreshCw size={12} className={gpsLoading ? 'spin' : ''} />
                <span>Recalibrar GPS</span>
              </button>
            </div>
          </div>

          {/* Badge de Sazonalidade Hidrogeológica do Site */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            padding: '0.35rem 0.6rem',
            borderRadius: '6px',
            backgroundColor: sazonalidade.badgeBg,
            border: `1px solid ${sazonalidade.badgeColor}40`,
            fontSize: '0.72rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: sazonalidade.badgeColor }}>
              <span style={{ fontSize: '0.9rem' }}>{sazonalidade.icon}</span>
              <strong>{sazonalidade.label}</strong>
              <span style={{ color: 'var(--text-muted)' }}>— {sazonalidade.descricao}</span>
            </div>
            <span style={{ color: 'var(--text-faint)' }}>{estacao}</span>
          </div>
        </div>
      </div>

      {/* ============================================================
          SUB-ABA 1: REGISTRO DE LEITURA DE INSTRUMENTO
          ============================================================ */}
      {activeSubTab === 'leitura' && (
        <form onSubmit={handleSubmitReading} className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {readingSuccessToast && (
            <div className="animate-page-enter" style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--geo-normal-bg)',
              color: 'var(--geo-normal)',
              border: '1px solid var(--geo-normal-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              <CheckCircle2 size={18} />
              <span>{readingSuccessToast}</span>
            </div>
          )}

          {/* FILTROS PRINCIPAIS: ESTRUTURA E INSTRUMENTO */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {/* Estrutura */}
            <div className="form-group">
              <label className="form-label">Estrutura Geotécnica *</label>
              <select
                value={selectedStructId}
                onChange={(e) => {
                  setSelectedStructId(e.target.value);
                  setSelectedInstUid('');
                }}
                className="form-select"
                required
              >
                {structures.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>

            {/* Instrumento */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <label className="form-label">Instrumento ({structInstruments.length} cadastrados) *</label>
                {isHistoricallyNA && (
                  <div className="badge-na-water" title="Instrumento com monitoramento de Nível d'Água (N.A) ativo historicamente">
                    <Droplet size={13} className="water-drip-1" fill="#38bdf8" />
                    <Droplets size={12} className="water-drip-2" fill="#0284c7" />
                    <span>N.A. ATIVO</span>
                    <span className="water-glow">💧</span>
                  </div>
                )}
                {isHistoricallySeco && (
                  <div className="badge-seco-animated" title="Instrumento historicamente sem presença de nível d'água (Seco)">
                    <Sun size={13} className="seco-icon-spin" />
                    <span>SECO</span>
                  </div>
                )}
              </div>
              <select
                value={selectedInstUid || (currentInst?.uid || '')}
                onChange={(e) => setSelectedInstUid(e.target.value)}
                className="form-select"
                required
              >
                {structInstruments.map(inst => {
                  const isInstPiezo = inst.tipo === 'INA' || inst.tipo === 'PZ' || inst.tipo === 'NA';
                  const isInstSeco = isInstPiezo && (inst.condicaoHistorica === 'SECO' || inst.ultimoStatusLeitura === 'SECO');
                  const isInstNA = isInstPiezo && !isInstSeco;
                  const tagCondicao = isInstNA ? ' [💧 N.A]' : isInstSeco ? ' [☀️ SECO]' : '';
                  return (
                    <option key={inst.uid} value={inst.uid}>
                      {inst.tipo} - {inst.id} (Seção {inst.secao || 'Geral'}) - Status: {inst.statusCalculado}{tagCondicao}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* FICHA TÉCNICA RÁPIDA DO INSTRUMENTO SELECIONADO */}
          {currentInst && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
              fontSize: '0.75rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-faint)' }}>Cota Topo:</span>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-main)' }}>{currentInst.cotaTopo || '-'} m</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-faint)' }}>Prof. Instalação:</span>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-main)' }}>{currentInst.profundidadeInstalacao || '-'} m</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-faint)' }}>Limite Normal:</span>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--geo-normal)' }}>{currentInst.limiteNormal || '-'} m</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-faint)' }}>Limite Atenção:</span>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--geo-atencao)' }}>{currentInst.limiteAtencao || '-'} m</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-faint)' }}>Limite Emergência:</span>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--geo-emergencia)' }}>{currentInst.limiteEmergencia || '-'} m</div>
              </div>

              {/* Destaque Nível d'Água Ativo */}
              {isHistoricallyNA && (
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(2, 132, 199, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  animation: 'waterRipple 3.5s infinite ease-in-out'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Droplet size={18} className="water-drip-1" fill="#38bdf8" />
                      <Droplets size={16} className="water-drip-2" fill="#0284c7" style={{ marginLeft: '-4px' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.825rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Monitoramento de Nível d'Água (N.A) Ativo</span>
                        <span className="water-drip-1">💧</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Coluna piezométrica com presença de água confirmada no maciço. Informar a profundidade do espelho d'água.
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="water-drip-1" style={{ fontSize: '1.2rem' }}>💧</span>
                    <strong className="font-mono" style={{ color: '#38bdf8', fontSize: '0.88rem' }}>
                      {cotaAtualCalculada !== null ? `Cota N.A: ${cotaAtualCalculada} m` : (lastHistoricalReading?.cota ? `Última Cota N.A: ${lastHistoricalReading.cota} m` : 'N.A. Presente')}
                    </strong>
                  </div>
                </div>
              )}

              {/* Destaque Instrumento Seco */}
              {isHistoricallySeco && (
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  animation: 'secoRipple 3.5s infinite ease-in-out'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Sun size={20} className="seco-icon-spin" style={{ color: '#f59e0b' }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.825rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span>Instrumento Historicamente Seco (Sem N.A.)</span>
                        <span className="badge-seco-animated" style={{ padding: '0.1rem 0.45rem', fontSize: '0.65rem' }}>
                          <Sun size={10} className="seco-icon-spin" />
                          <span>SECO</span>
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Coluna sem espelho d'água. A leitura deve considerar a descida até o fundo do tubo ({currentInst.profundidadeInstalacao || '-'} m).
                      </div>
                    </div>
                  </div>
                  <div className="badge-seco-animated" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                    <Sun size={13} className="seco-icon-spin" />
                    <strong>COTA DE FUNDO: {currentInst.cotaFundo || '-'} m</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              NOVO PAINEL DE INTELIGÊNCIA GEOTÉCNICA:
              ÚLTIMA LEITURA, REGISTRO FOTOGRÁFICO RECENTE & GRÁFICO HISTÓRICO
              ============================================================ */}
          {currentInst && (
            <div style={{
              borderRadius: '10px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* Cabeçalho do Painel */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <History size={18} style={{ color: 'var(--primary-accent)' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    Rastreamento de Campo: {currentInst.tipo} - {currentInst.id} ({currentInst.estrutura})
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: trendAnalysis.color + '20',
                    color: trendAnalysis.color,
                    fontWeight: 700,
                    border: `1px solid ${trendAnalysis.color}40`
                  }}>
                    Tendência: {trendAnalysis.status}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Série Histórica: <strong style={{ color: 'var(--text-main)' }}>{instrumentHistory.length}</strong> leitura(s)</span>
                </div>
              </div>

              {/* Grid: Cards da Última Leitura + Card de Registro Fotográfico Recente */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                
                {/* CARD 1: Detalhes da Última Leitura Realizada */}
                <div style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} style={{ color: 'var(--primary-accent)' }} />
                      ÚLTIMA LEITURA DE CAMPO
                    </span>
                    <span className={`badge-status ${lastHistoricalReading?.status === 'EMERGÊNCIA' ? 'badge-emergencia' : lastHistoricalReading?.status === 'ATENÇÃO' ? 'badge-atencao' : 'badge-normal'}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                      {lastHistoricalReading?.status || 'NORMAL'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {/* Data */}
                    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Data da Coleta:</span>
                      <strong className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                        {lastHistoricalReading?.data ? lastHistoricalReading.data.split(' ')[0] : 'S/ Registro'}
                      </strong>
                    </div>

                    {/* Leitura no Piu */}
                    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
                        {isHistoricallyNA ? 'Piu (Espelho N.A.):' : 'Piu (Fundo Seco):'}
                      </span>
                      <strong className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--primary-accent)' }}>
                        {lastHistoricalReading?.leitura !== null && lastHistoricalReading?.leitura !== undefined ? `${Number(lastHistoricalReading.leitura).toFixed(3)} m` : '-'}
                      </strong>
                    </div>

                    {/* Cota Resultante */}
                    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
                        {isHistoricallyNA ? 'Cota N.A.:' : 'Cota de Fundo:'}
                      </span>
                      <strong className="font-mono" style={{ fontSize: '0.88rem', color: isHistoricallyNA ? '#38bdf8' : '#f59e0b' }}>
                        {lastHistoricalReading?.cota !== null && lastHistoricalReading?.cota !== undefined ? `${Number(lastHistoricalReading.cota).toFixed(3)} m` : '-'}
                      </strong>
                    </div>

                    {/* Variação Delta */}
                    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Variação (Δ):</span>
                      <strong className="font-mono" style={{
                        fontSize: '0.85rem',
                        color: lastDeltaCm !== null && Math.abs(lastDeltaCm) > 3 ? 'var(--geo-atencao)' : 'var(--geo-normal)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        {lastDeltaCm !== null ? (
                          <>
                            {lastDeltaCm > 0 ? <ArrowUp size={12} /> : lastDeltaCm < 0 ? <ArrowDown size={12} /> : null}
                            <span>{lastDeltaCm > 0 ? `+${lastDeltaCm}` : lastDeltaCm} cm</span>
                          </>
                        ) : (
                          '0.0 cm'
                        )}
                      </strong>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.4rem', marginTop: '2px' }}>
                    <span>Técnico: <strong style={{ color: 'var(--text-muted)' }}>{lastHistoricalReading?.responsavel || 'PCMI Operação'}</strong></span>
                    <span>Origem: {lastHistoricalReading?.origem || 'Banco Mestre'}</span>
                  </div>
                </div>

                {/* CARD 2: Registro Fotográfico Recente do Instrumento */}
                <div style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Camera size={13} style={{ color: 'var(--primary-accent)' }} />
                      EVIDÊNCIA FOTOGRÁFICA RECENTE
                    </span>
                    {recentPhotoInfo && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Calendar size={11} /> {recentPhotoInfo.data ? recentPhotoInfo.data.split(' ')[0] : 'Recente'}
                      </span>
                    )}
                  </div>

                  {recentPhotoInfo ? (
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      {/* Thumbnail com efeito hover para ampliação */}
                      <div 
                        onClick={() => setSelectedPhotoModal(recentPhotoInfo)}
                        style={{
                          position: 'relative',
                          width: '90px',
                          height: '90px',
                          minWidth: '90px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid var(--border-medium)',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                        title="Clique para ampliar em alta resolução"
                      >
                        <img
                          src={recentPhotoInfo.url}
                          alt="Evidência do Instrumento"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'rgba(0,0,0,0.65)',
                          color: '#fff',
                          fontSize: '0.6rem',
                          textAlign: 'center',
                          padding: '2px 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '2px'
                        }}>
                          <Maximize2 size={10} />
                          <span>Ampliar</span>
                        </div>
                      </div>

                      {/* Metadados da Foto */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.72rem', flex: 1 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} style={{ color: 'var(--geo-normal)' }} />
                          {recentPhotoInfo.tipo || 'Inspeção do Instrumento'}
                        </span>
                        <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.35, fontSize: '0.7rem' }}>
                          {recentPhotoInfo.descricao || 'Registro fotográfico de integridade da boca do tubo e inspeção do medidor.'}
                        </p>
                        <span style={{ color: 'var(--text-faint)', fontSize: '0.68rem', marginTop: '2px' }}>
                          Fotógrafo: <strong>{recentPhotoInfo.autor || 'Técnico de Campo'}</strong>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '1.25rem 0.75rem',
                      textAlign: 'center',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px dashed var(--border-medium)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <Camera size={22} style={{ color: 'var(--text-faint)' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Sem foto anterior arquivada
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
                        Fotografe a trena no espelho d'água no formulário abaixo para registrar a primeira evidência.
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
                      Local: <strong>Berma / Crista ({currentInst.secao || 'Seção Geral'})</strong>
                    </span>
                    {recentPhotoInfo && (
                      <button
                        type="button"
                        onClick={() => setSelectedPhotoModal(recentPhotoInfo)}
                        className="btn-secondary"
                        style={{ padding: '0.15rem 0.5rem', fontSize: '0.68rem' }}
                      >
                        <Eye size={12} />
                        <span>Inspecionar Foto</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* GRÁFICO INTERATIVO DE TODO O HISTÓRICO DO INSTRUMENTO */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                padding: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Activity size={16} style={{ color: 'var(--primary-accent)' }} />
                    <span style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Evolução Histórica das Medições ({instrumentHistory.length} registros cronológicos)
                    </span>
                  </div>

                  {/* Seletor de Métrica: Cota N.A vs Piu */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Exibir:</span>
                    <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      <button
                        type="button"
                        onClick={() => setChartMetric('cota')}
                        style={{
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: chartMetric === 'cota' ? 'var(--primary-accent)' : 'transparent',
                          color: chartMetric === 'cota' ? '#ffffff' : 'var(--text-muted)'
                        }}
                      >
                        Cota N.A. (m)
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartMetric('piu')}
                        style={{
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: chartMetric === 'piu' ? 'var(--primary-accent)' : 'transparent',
                          color: chartMetric === 'piu' ? '#ffffff' : 'var(--text-muted)'
                        }}
                      >
                        Leitura do Piu (m)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowHistoryTable(!showHistoryTable)}
                      className="btn-secondary"
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.7rem' }}
                    >
                      {showHistoryTable ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      <span>{showHistoryTable ? 'Ocultar Tabela' : 'Ver Tabela'}</span>
                    </button>
                  </div>
                </div>

                {/* Canvas do Gráfico */}
                <div style={{ height: '220px', width: '100%', position: 'relative' }}>
                  {instrumentHistory.length > 0 ? (
                    <Line data={chartData} options={chartOptions} />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: '0.8rem' }}>
                      Nenhum histórico registrado para este instrumento.
                    </div>
                  )}
                </div>

                {/* TABELA RETRÁTIL DE HISTÓRICO COMPLETO */}
                {showHistoryTable && instrumentHistory.length > 0 && (
                  <div className="animate-page-enter" style={{
                    marginTop: '0.85rem',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '6px 10px' }}>Data</th>
                          <th style={{ padding: '6px 10px' }}>Piu (m)</th>
                          <th style={{ padding: '6px 10px' }}>Cota (m)</th>
                          <th style={{ padding: '6px 10px' }}>Status</th>
                          <th style={{ padding: '6px 10px' }}>Origem / Técnico</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...instrumentHistory].reverse().map((r, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '5px 10px', color: 'var(--text-main)' }}>
                              <strong className="font-mono">{r.data ? r.data.split(' ')[0] : '-'}</strong>
                            </td>
                            <td className="font-mono" style={{ padding: '5px 10px', color: 'var(--primary-accent)', fontWeight: 600 }}>
                              {r.leitura !== null ? `${Number(r.leitura).toFixed(3)} m` : '-'}
                            </td>
                            <td className="font-mono" style={{ padding: '5px 10px', color: 'var(--text-main)', fontWeight: 700 }}>
                              {r.cota !== null ? `${Number(r.cota).toFixed(3)} m` : '-'}
                            </td>
                            <td style={{ padding: '5px 10px' }}>
                              <span className={`badge-status ${r.status === 'EMERGÊNCIA' ? 'badge-emergencia' : r.status === 'ATENÇÃO' ? 'badge-atencao' : 'badge-normal'}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
                                {r.status || 'NORMAL'}
                              </span>
                            </td>
                            <td style={{ padding: '5px 10px', color: 'var(--text-muted)' }}>
                              {r.responsavel || r.origem || 'PCMI'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================
              CAMPOS DE LEITURA COM REGRA EXPLÍCITA N.A VS COTA DE FUNDO
              ============================================================ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px', flexWrap: 'wrap', gap: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  {isHistoricallyNA 
                    ? "Leitura no Piu Elétrico (Profundidade do Nível d'Água - N.A.) *" 
                    : isHistoricallySeco 
                      ? "Leitura no Piu Elétrico (Instrumento Seco - Cota de Fundo) *" 
                      : isPiuInstrument 
                        ? "Leitura no Piu Elétrico (Profundidade em metros) *" 
                        : "Valor Lido no Instrumento *"}
                </label>

                {isPiuInstrument && ultimaLeituraPiu !== null && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Último piu: <strong className="font-mono" style={{ color: 'var(--primary-accent)' }}>{ultimaLeituraPiu} m</strong>
                  </span>
                )}
              </div>

              <input
                type="number"
                step="0.001"
                placeholder={isHistoricallyNA ? (ultimaLeituraPiu ? `Ex: ${ultimaLeituraPiu}` : 'Ex: 20.780 (espelho N.A)') : isHistoricallySeco ? `Ex: ${currentInst?.profundidadeInstalacao || '20.100'} (fundo seco)` : 'Ex: 1.250'}
                value={readingValue}
                onChange={(e) => setReadingValue(e.target.value)}
                className="form-input font-mono"
                style={{ fontSize: '1.1rem', fontWeight: 700 }}
                required
              />

              {/* Orientações Obrigatórias: N.A vs Fundo Seco */}
              {isHistoricallyNA && (
                <div style={{
                  fontSize: '0.72rem',
                  color: '#38bdf8',
                  backgroundColor: 'rgba(2, 132, 199, 0.08)',
                  padding: '0.35rem 0.55rem',
                  borderRadius: '6px',
                  marginTop: '4px',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <Droplet size={13} fill="#38bdf8" />
                  <span>
                    <strong>REGRA OBRIGATÓRIA:</strong> Instrumento com N.A. ativo. Informe a profundidade da trena sonora ao apitar no espelho d'água. <em>NÃO informe cota de fundo.</em>
                  </span>
                </div>
              )}

              {isHistoricallySeco && (
                <div style={{
                  fontSize: '0.72rem',
                  color: '#f59e0b',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  padding: '0.35rem 0.55rem',
                  borderRadius: '6px',
                  marginTop: '4px',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <Sun size={13} />
                  <span>
                    <strong>REGRA OPERACIONAL:</strong> Instrumento seco (sem espelho d'água). A leitura a ser informada deve considerar a descida até o fundo do tubo (Profundidade de Fundo: {currentInst.profundidadeInstalacao || '-'} m / Cota Fundo: {currentInst.cotaFundo || '-'} m).
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Data e Hora da Leitura *</label>
              <input
                type="date"
                value={readingDate}
                onChange={(e) => setReadingDate(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* ALERTA INDISPENSÁVEL: VARIAÇÃO SUPERIOR AO LIMITE DE 3 CM (0,03 m)
              COM CORRELAÇÃO DE CLIMA E SAZONALIDADE DO SITE (GPS) */}
          {isDeltaSuperior3cm && (
            <div className="animate-page-enter" style={{
              padding: '1rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.14)',
              border: '2px solid var(--geo-atencao)',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.9rem', color: 'var(--geo-atencao)' }}>
                  <AlertTriangle size={20} className="pulse-alert-warning" />
                  <span>ALERTA DE CAMPO: VARIAÇÃO SUPERIOR A 3 CM NA LEITURA DO PIU (|Δ| &gt; 3,0 cm)</span>
                </div>
                <span className="badge-status badge-atencao" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  Δ {deltaPiuCm > 0 ? `+${deltaPiuCm}` : deltaPiuCm} cm
                </span>
              </div>

              <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
                A medição lida na trena com o <strong>piu elétrico hoje ({Number(readingValue).toFixed(3)} m)</strong> diverge em <strong>{Math.abs(deltaPiuCm)} cm</strong> em relação à última medição ({ultimaLeituraPiu} m em {lastHistoricalReading?.data ? lastHistoricalReading.data.split(' ')[0] : 'coleta anterior'}), 
                excedendo o limite de tolerância estrita de <strong>3 cm (0,03 m)</strong>.
              </p>

              {/* CORRELAÇÃO DE CLIMA & SAZONALIDADE INTEGRADA AO GPS DO SITE */}
              <div style={{
                backgroundColor: sazonalidade.tipo === 'CHUVOSO' ? 'rgba(2, 132, 199, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                border: `1px solid ${sazonalidade.badgeColor}40`,
                padding: '0.65rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{sazonalidade.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <strong style={{ color: sazonalidade.badgeColor }}>
                    Análise Climática e Sazonal do Site ({estacao}):
                  </strong>
                  <span style={{ color: 'var(--text-main)', lineHeight: 1.4 }}>
                    {sazonalidade.justificativaVariacao}
                  </span>
                </div>
              </div>

              {/* Quadro de Comparação Numérica */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.6rem',
                backgroundColor: 'var(--bg-secondary)',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-faint)' }}>Último Piu de Campo:</span>
                  <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ultimaLeituraPiu} m</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-faint)' }}>Piu Lido Hoje:</span>
                  <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-accent)' }}>{Number(readingValue).toFixed(3)} m</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-faint)' }}>Variação na Trena (Δ):</span>
                  <div className="font-mono" style={{ fontWeight: 800, fontSize: '0.85rem', color: Math.abs(deltaPiuCm) > 3 ? 'var(--geo-emergencia)' : 'var(--geo-atencao)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {deltaPiuCm > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    <span>{deltaPiuCm > 0 ? `+${deltaPiuCm}` : deltaPiuCm} cm</span>
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-faint)' }}>Cota Total Resultante:</span>
                  <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{cotaAtualCalculada} m</div>
                </div>
              </div>

              {/* Checkbox de Contraprova Obrigatório */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.55rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <input
                  type="checkbox"
                  id="contraprovaCheck"
                  checked={contraprovaConfirmed}
                  onChange={(e) => setContraprovaConfirmed(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--geo-atencao)' }}
                />
                <label htmlFor="contraprovaCheck" style={{ fontSize: '0.78rem', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>
                  Confirmo que repeti a descida da sonda do piu elétrico no tubo para contraprova e atesto a medição de {Number(readingValue).toFixed(3)} m (variação &gt; 3 cm confirmada em campo).
                </label>
              </div>
            </div>
          )}

          {/* Banner de Diagnóstico em Tempo Real pela IA */}
          {evaluation && (
            <div className="animate-page-enter" style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: evaluation.status === 'EMERGÊNCIA' ? 'var(--geo-emergencia-bg)' : evaluation.status === 'ALERTA' ? 'var(--geo-alerta-bg)' : evaluation.status === 'ATENÇÃO' ? 'var(--geo-atencao-bg)' : 'var(--geo-normal-bg)',
              border: `1px solid ${evaluation.status === 'EMERGÊNCIA' ? 'var(--geo-emergencia-border)' : evaluation.status === 'ALERTA' ? 'var(--geo-alerta-border)' : evaluation.status === 'ATENÇÃO' ? 'var(--geo-atencao-border)' : 'var(--geo-normal-border)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.875rem', color: evaluation.color, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {evaluation.status === 'EMERGÊNCIA' ? <Flame size={18} /> : evaluation.status === 'ATENÇÃO' || evaluation.status === 'ALERTA' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                  {evaluation.label}
                  {isHistoricallyNA && <span className="water-drip-1">💧</span>}
                  {isHistoricallySeco && (
                    <span className="badge-seco-animated" style={{ padding: '0.1rem 0.45rem', fontSize: '0.65rem' }}>
                      <Sun size={10} className="seco-icon-spin" />
                      <span>SECO</span>
                    </span>
                  )}
                </span>
                <span className={`badge-status ${evaluation.badgeClass}`}>
                  Cota Calculada: {evaluation.cotaCalculada} m
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: 0 }}>
                {evaluation.descricao}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                Ação recomendada: <strong>{evaluation.recomendacao}</strong>
              </p>
            </div>
          )}

          {/* Campo de Registro Fotográfico da Leitura (Foto da Trena / Mostrador) */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Camera size={16} style={{ color: 'var(--primary-accent)' }} />
                Registro Fotográfico da Leitura (Trena / Mostrador / Espelho d'Água)
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Evidência Obrigatória / Recomendada</span>
            </label>

            <div style={{
              border: '2px dashed var(--border-medium)',
              borderRadius: '10px',
              padding: '1.15rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              position: 'relative'
            }}>
              {readingPhoto.photoData ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                  <img
                    src={readingPhoto.photoData}
                    alt="Foto da Leitura"
                    style={{
                      maxHeight: '190px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-medium)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {readingPhoto.photoName || 'Foto da leitura anexada'}
                    </span>
                    <button
                      type="button"
                      onClick={readingPhoto.clearPhoto}
                      className="btn-danger"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                    >
                      <Trash2 size={13} />
                      <span>Remover Foto</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <Camera size={28} style={{ color: 'var(--primary-accent)', margin: '0 auto 0.4rem' }} />
                  <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Clique para fotografar a trena/visor do instrumento ou carregar foto
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                    Fotografe a trena indicando o espelho d'água no momento exato da leitura
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={readingPhoto.handleFileUpload}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Observações de Campo */}
          <div className="form-group">
            <label className="form-label">Anotações / Condições no Local</label>
            <input
              type="text"
              placeholder="Ex: Tempo chuvoso, dreno limpo sem obstruções visíveis..."
              value={readingNotes}
              onChange={(e) => setReadingNotes(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem'
            }}
          >
            <FileCheck size={18} />
            <span>Confirmar e Salvar Leitura de Campo</span>
          </button>
        </form>
      )}

      {/* ============================================================
          SUB-ABA 2: REGISTRO DE INSPEÇÃO VISUAL E ANOMALIA (INSPECT)
          ============================================================ */}
      {activeSubTab === 'anomalia' && (
        <form onSubmit={handleSubmitAnomaly} className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {anomalySuccessToast && (
            <div className="animate-page-enter" style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--geo-normal-bg)',
              color: 'var(--geo-normal)',
              border: '1px solid var(--geo-normal-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              <CheckCircle2 size={18} />
              <span>{anomalySuccessToast}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* Estrutura */}
            <div className="form-group">
              <label className="form-label">Estrutura Inspecionada *</label>
              <select
                value={anomalyStructId}
                onChange={(e) => setAnomalyStructId(e.target.value)}
                className="form-select"
                required
              >
                {structures.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>

            {/* Tipo de Anomalia */}
            <div className="form-group">
              <label className="form-label">Classificação da Anomalia *</label>
              <select
                value={anomalyType}
                onChange={(e) => setAnomalyType(e.target.value)}
                className="form-select"
                required
              >
                <option value="Trinca Longitudinal">Trinca Longitudinal</option>
                <option value="Trinca Transversal">Trinca Transversal</option>
                <option value="Surgência de Água Limpa">Surgência de Água Limpa</option>
                <option value="Surgência com Finos (Turbidez)">Surgência com Finos (Turbidez) - CRÍTICO</option>
                <option value="Erosão Superficial">Erosão Superficial / Ravina</option>
                <option value="Abatimento de Crista/Berma">Abatimento de Crista/Berma</option>
                <option value="Obstrução de Drenagem">Obstrução de Drenagem ou Vertedouro</option>
                <option value="Vegetação com Raízes Profundas">Vegetação com Raízes Profundas</option>
                <option value="Formigueiro / Toca de Animal">Formigueiro / Toca de Animal</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            {/* Severidade */}
            <div className="form-group">
              <label className="form-label">Severidade Inicial *</label>
              <select
                value={anomalySeverity}
                onChange={(e) => setAnomalySeverity(e.target.value)}
                className="form-select"
                required
              >
                <option value="Baixo">Baixo (Monitorar)</option>
                <option value="Médio">Médio (Ação em até 7 dias)</option>
                <option value="Alto">Alto (Ação em até 24h)</option>
                <option value="Crítico">Crítico (Imediato / PAEBM)</option>
              </select>
            </div>
          </div>

          {/* Localização Específica */}
          <div className="form-group">
            <label className="form-label">Localização e Referência no Talude *</label>
            <input
              type="text"
              placeholder="Ex: Berma 2, lado esquerdo próximo ao dreno D-04..."
              value={anomalyLocation}
              onChange={(e) => setAnomalyLocation(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* UPLOAD / CAPTURA DE FOTO DE CAMPO (INSPECT APP FEATURE) */}
          <div className="form-group">
            <label className="form-label">Evidência Fotográfica Georreferenciada (Obrigatório em Campo)</label>
            <div style={{
              border: '2px dashed var(--border-medium)',
              borderRadius: '10px',
              padding: '1.25rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              position: 'relative'
            }}>
              {anomalyPhoto.photoData ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={anomalyPhoto.photoData}
                    alt="Evidência de campo"
                    style={{
                      maxHeight: '220px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-medium)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{anomalyPhoto.photoName || 'Foto de campo anexada'}</span>
                    <button
                      type="button"
                      onClick={anomalyPhoto.clearPhoto}
                      className="btn-danger"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <Trash2 size={14} />
                      <span>Remover Foto</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <Camera size={32} style={{ color: 'var(--primary-accent)', margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Clique para tirar foto com a câmera ou carregar arquivo
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                    Formatos JPG, PNG (otimização e compressão automática para o relatório)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={anomalyPhoto.handleFileUpload}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Descrição Detalhada */}
          <div className="form-group">
            <label className="form-label">Descrição Técnica da Ocorrência *</label>
            <textarea
              rows={3}
              placeholder="Descreva extensões estimadas, presença de umidade, características dos bordos da trinca ou vazão aproximada..."
              value={anomalyDesc}
              onChange={(e) => setAnomalyDesc(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          {/* Recomendação de Campo */}
          <div className="form-group">
            <label className="form-label">Recomendação Preliminar</label>
            <input
              type="text"
              placeholder="Ex: Instalação de régua graduada, limpeza de calha, vistoria de engenharia..."
              value={anomalyRecommendation}
              onChange={(e) => setAnomalyRecommendation(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Botão de Envio de Anomalia */}
          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem'
            }}
          >
            <Upload size={18} />
            <span>Registrar Inspeção e Notificar Equipe Geotécnica</span>
          </button>
        </form>
      )}

      {/* ============================================================
          MODAL LIGHTBOX: INSPEÇÃO DE FOTO DE CAMPO EM ALTA RESOLUÇÃO
          ============================================================ */}
      {selectedPhotoModal && (
        <div 
          onClick={() => setSelectedPhotoModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.88)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(5px)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              maxWidth: '720px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header do Modal */}
            <div style={{
              padding: '0.85rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={18} style={{ color: 'var(--primary-accent)' }} />
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  {selectedPhotoModal.tipo || 'Evidência Fotográfica do Instrumento'}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhotoModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Imagem Ampliada */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={selectedPhotoModal.url}
                alt="Registro em Alta Resolução"
                style={{
                  maxWidth: '100%',
                  maxHeight: '65vh',
                  objectFit: 'contain',
                  borderRadius: '6px'
                }}
              />
            </div>

            {/* Rodapé com Informações Técnicas */}
            <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Data da Foto: <strong className="font-mono" style={{ color: 'var(--text-main)' }}>{selectedPhotoModal.data || 'Recente'}</strong>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  Fotógrafo/Responsável: <strong style={{ color: 'var(--primary-accent)' }}>{selectedPhotoModal.autor || 'Técnico de Campo'}</strong>
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                {selectedPhotoModal.descricao || 'Registro fotográfico oficial vinculado ao histórico do instrumento na estrutura geotécnica.'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

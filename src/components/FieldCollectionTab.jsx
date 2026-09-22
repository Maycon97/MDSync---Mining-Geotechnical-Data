import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Sliders,
  Building2,
  ShieldCheck,
  PenTool,
  RotateCcw,
  Globe,
  Sparkles,
  ExternalLink,
  FileText,
  ChevronLeft,
  ChevronRight,
  Check
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
    addChecklist,
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

  // ============================================================
  // ESTADOS OFICIAIS SURVEY123 FIR (https://arcg.is/0yOmKX0)
  // ============================================================
  const SURVEY123_FIR_STRUCTURES = [
    'Barragem B1',
    'Barragem B4',
    'Cava Jangada',
    'Contrapilhamento Carrapato',
    'PDE Mangaba',
    'PDE Jacó',
    'PDE ( Engenho Seco I )',
    'PDE ( Engenho Seco II )',
    'Pilha de Produto/Sub-Produto',
    'Cava Antena',
    'Cava Engenho Seco',
    'Cava Índia',
    'Cava Samambaia',
    'Dique PDE1',
    'Pilha de Rejeito',
    'Sump',
    'Taludes/Encostas'
  ];

  const [firMode, setFirMode] = useState('nativo'); // 'nativo' | 'survey123_web'
  const [firViewMode, setFirViewMode] = useState('paginado'); // 'paginado' | 'completo'
  const [currentFirPage, setCurrentFirPage] = useState(1); // 1 a 10

  // PÁGINA 1: Informações Gerais
  const [firEstrutura, setFirEstrutura] = useState('Barragem B1');
  const [firData, setFirData] = useState(() => new Date().toISOString().split('T')[0]);
  const [firHora, setFirHora] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [firProfissional, setFirProfissional] = useState(currentUser?.nome || 'Maycon Douglas Nascimento');
  const [firRegistro, setFirRegistro] = useState(currentUser?.registro || 'CREA 85.120/D-MG');
  const [firCondicoesClimaticas, setFirCondicoesClimaticas] = useState('Parcialmente Nublado');
  const [firVolumeAcumulado, setFirVolumeAcumulado] = useState(14.8);
  const [firVazaoHm, setFirVazaoHm] = useState(2.10);

  // PÁGINA 2: Acessos (Avaliação dos Acessos - Tabela)
  const [firAcessoRevestimento, setFirAcessoRevestimento] = useState('Bom');
  const [firAcessoEmpocamento, setFirAcessoEmpocamento] = useState('Bom');
  const [firAcessoGreide, setFirAcessoGreide] = useState('Bom');
  const [firAcessoDrenagem, setFirAcessoDrenagem] = useState('Bom');
  const [firAcessoConservacao, setFirAcessoConservacao] = useState('Bom');
  const [firAcessosObs, setFirAcessosObs] = useState('');

  // PÁGINA 3: Maciço e Ombreiras
  // 3.1 Condições Estruturais (Sim / Não / N/A)
  const [firMacicoAbatimento, setFirMacicoAbatimento] = useState('Não');
  const [firMacicoDeslocamento, setFirMacicoDeslocamento] = useState('Não');
  const [firMacicoErosoes, setFirMacicoErosoes] = useState('Não');
  const [firMacicoEscorregamento, setFirMacicoEscorregamento] = useState('Não');
  const [firMacicoRecalque, setFirMacicoRecalque] = useState('Não');
  const [firMacicoSaturacao, setFirMacicoSaturacao] = useState('Não');
  const [firMacicoTrincas, setFirMacicoTrincas] = useState('Não');
  const [firMacicoObsEstrutural, setFirMacicoObsEstrutural] = useState('');

  // 3.2 Condições Visuais (Bom / Regular / Deficiente / N/A)
  const [firMacicoBermas, setFirMacicoBermas] = useState('Bom');
  const [firMacicoCrista, setFirMacicoCrista] = useState('Bom');
  const [firMacicoOmbreiras, setFirMacicoOmbreiras] = useState('Bom');
  const [firMacicoRevestVegetalVis, setFirMacicoRevestVegetalVis] = useState('Bom');
  const [firMacicoTaludesJusanteVis, setFirMacicoTaludesJusanteVis] = useState('Bom');
  const [firMacicoObsVisual, setFirMacicoObsVisual] = useState('');

  // 3.4 Condições Superficiais (Sim / Não / N/A)
  const [firMacicoAnimais, setFirMacicoAnimais] = useState('Não');
  const [firMacicoCupinzeiros, setFirMacicoCupinzeiros] = useState('Não');
  const [firMacicoFormigueiros, setFirMacicoFormigueiros] = useState('Não');
  const [firMacicoRevestVegetalSup, setFirMacicoRevestVegetalSup] = useState('Não');
  const [firMacicoTaludesJusanteSup, setFirMacicoTaludesJusanteSup] = useState('Não');
  const [firMacicoObsSuperficial, setFirMacicoObsSuperficial] = useState('');

  // PÁGINA 4: Dispositivos de Drenagem Superficial
  const [firDrenagemSuperficial, setFirDrenagemSuperficial] = useState('Sim');
  const [firDrenagemObstrucao, setFirDrenagemObstrucao] = useState('Não');
  const [firDrenagemTipoObstrucao, setFirDrenagemTipoObstrucao] = useState('N/A');
  const [firDrenagemConservacao, setFirDrenagemConservacao] = useState('Bom');
  const [firDrenagemObs, setFirDrenagemObs] = useState('');

  // PÁGINA 5: Reservatório
  const [firReservatorioQualidade, setFirReservatorioQualidade] = useState('Bom');
  const [firReservatorioAssoreamento, setFirReservatorioAssoreamento] = useState('Baixo');
  const [firReservatorioTaludeMontante, setFirReservatorioTaludeMontante] = useState('Bom');
  const [firReservatorioConservacao, setFirReservatorioConservacao] = useState('Bom');
  const [firCotaEspelho, setFirCotaEspelho] = useState(848.50);
  const [firBordaLivre, setFirBordaLivre] = useState(3.16);
  const [firReservatorioObs, setFirReservatorioObs] = useState('');

  // PÁGINA 6: Drenagem Interna
  const [firDrenagemInterna, setFirDrenagemInterna] = useState('Sim');
  const [firDrenagemMedidorVazao, setFirDrenagemMedidorVazao] = useState('Sim');
  const [firDrenagemQualidadeAgua, setFirDrenagemQualidadeAgua] = useState('Límpida');
  const [firDrenagemAltVazao, setFirDrenagemAltVazao] = useState('Não');
  const [firDrenagemAssoreamentoSaida, setFirDrenagemAssoreamentoSaida] = useState('Não');
  const [firDrenagemCarreamentoSolidos, setFirDrenagemCarreamentoSolidos] = useState('Não');
  const [firDrenagemPresencaVegetacao, setFirDrenagemPresencaVegetacao] = useState('Não');
  const [firDrenagemInternaObs, setFirDrenagemInternaObs] = useState('');

  // PÁGINA 7: Instrumentação
  const [firInstrumentacaoMonitoramento, setFirInstrumentacaoMonitoramento] = useState('Sim');
  const [firInstAcessoLeitura, setFirInstAcessoLeitura] = useState('Bom');
  const [firInstIdentificacao, setFirInstIdentificacao] = useState('Bom');
  const [firInstIntegridade, setFirInstIntegridade] = useState('Bom');
  const [firInstTipos, setFirInstTipos] = useState(['Piezômetro_-_PZ', 'Indicador_de_Nível_D\'água']);
  const [firInstObs, setFirInstObs] = useState('');

  // PÁGINA 8: Sistema Extravasor
  const [firExtravasorObstrucoes, setFirExtravasorObstrucoes] = useState('Não');
  const [firExtravasorTipoObstrucao, setFirExtravasorTipoObstrucao] = useState('N/A');
  const [firExtravasorFluxo, setFirExtravasorFluxo] = useState('Normal');
  const [firExtravasorConservacao, setFirExtravasorConservacao] = useState('Bom');
  const [firExtravasorObs, setFirExtravasorObs] = useState('');

  // PÁGINA 9: Estado de Conservação da Estrutura - EC & Matriz de Classificação ANM
  const [firMatrizK, setFirMatrizK] = useState(0); // 0, 3, 6, 10
  const [firMatrizL, setFirMatrizL] = useState(0); // 0, 3, 6, 10
  const [firMatrizM, setFirMatrizM] = useState(0); // 0, 2, 6, 10
  const [firMatrizN, setFirMatrizN] = useState(0); // 0, 2, 6, 10
  const [firMatrizO, setFirMatrizO] = useState(0); // 0, 2, 4, 5
  const [firMatrizDrenadaObs, setFirMatrizDrenadaObs] = useState('');
  const [firMatrizNaoDrenadaObs, setFirMatrizNaoDrenadaObs] = useState('');
  const [firClassificacaoGeral, setFirClassificacaoGeral] = useState('Nível 0 - Normal / Conforme');

  // PÁGINA 10: Assinatura Digital com Canvas Touch/Mouse
  const [firAssinatura, setFirAssinatura] = useState('');
  const firCanvasRef = useRef(null);
  const [isFirDrawing, setIsFirDrawing] = useState(false);
  const [hasFirDrawn, setHasFirDrawn] = useState(false);

  // Estado para campos de Anomalia vinculados à FIR
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

  // Funções para Canvas de Assinatura Digital FIR
  const startFirDrawing = (e) => {
    const canvas = firCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsFirDrawing(true);
    setHasFirDrawn(true);
  };

  const drawFir = (e) => {
    if (!isFirDrawing) return;
    const canvas = firCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopFirDrawing = () => {
    if (!isFirDrawing) return;
    setIsFirDrawing(false);
    const canvas = firCanvasRef.current;
    if (canvas) {
      setFirAssinatura(canvas.toDataURL('image/png'));
    }
  };

  const clearFirSignature = () => {
    const canvas = firCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasFirDrawn(false);
      setFirAssinatura('');
    }
  };

  // Submissão Completa do Formulário Survey123 FIR (https://arcg.is/0yOmKX0)
  const handleSubmitAnomaly = (e) => {
    e.preventDefault();

    const struct = structures.find(s => s.id === anomalyStructId);
    const structName = firEstrutura || (struct ? struct.nome : 'Barragem B1');

    // 1. Objeto oficial da Ficha de Inspeção Regular FIR - Survey123 (10 Páginas)
    const newFirRecord = {
      id: `FIR-${Date.now().toString().slice(-6)}`,
      surveyId: '8f6f56e94ec142af90e2ac9084ce716c',
      titulo: 'Formulário de Inspeção Regular - FIR - R0',
      linkSurvey: 'https://arcg.is/0yOmKX0',
      // PÁGINA 1
      data: firData,
      hora: firHora,
      estrutura: structName,
      profissional: `${firProfissional} (${firRegistro})`,
      condicoesClimaticas: firCondicoesClimaticas,
      volumeAcumulado: Number(firVolumeAcumulado) || 0,
      vazaoHm: Number(firVazaoHm) || 0,
      lat: coords?.lat || -20.063818,
      lon: coords?.lon || -44.114360,
      // PÁGINA 2
      acessoRevestimento: firAcessoRevestimento,
      acessoEmpocamento: firAcessoEmpocamento,
      acessoGreide: firAcessoGreide,
      acessoDrenagem: firAcessoDrenagem,
      acessoConservacao: firAcessoConservacao,
      acessosObs: firAcessosObs,
      // PÁGINA 3
      macicoEstruturais: {
        abatimento: firMacicoAbatimento,
        deslocamento: firMacicoDeslocamento,
        erosoes: firMacicoErosoes,
        escorregamento: firMacicoEscorregamento,
        recalque: firMacicoRecalque,
        saturacao: firMacicoSaturacao,
        trincas: firMacicoTrincas
      },
      macicoObsEstrutural: firMacicoObsEstrutural,
      macicoVisuais: {
        bermas: firMacicoBermas,
        crista: firMacicoCrista,
        ombreiras: firMacicoOmbreiras,
        revestimentoVegetal: firMacicoRevestVegetalVis,
        taludesJusante: firMacicoTaludesJusanteVis
      },
      macicoObsVisual: firMacicoObsVisual,
      macicoSuperficiais: {
        animais: firMacicoAnimais,
        cupinzeiros: firMacicoCupinzeiros,
        formigueiros: firMacicoFormigueiros,
        revestimentoVegetal: firMacicoRevestVegetalSup,
        taludesJusante: firMacicoTaludesJusanteSup
      },
      macicoObsSuperficial: firMacicoObsSuperficial,
      // PÁGINA 4
      drenagemSuperficial: firDrenagemSuperficial,
      drenagemObstrucao: firDrenagemObstrucao,
      drenagemTipoObstrucao: firDrenagemTipoObstrucao,
      drenagemConservacao: firDrenagemConservacao,
      drenagemObs: firDrenagemObs,
      // PÁGINA 5
      reservatorioQualidade: firReservatorioQualidade,
      reservatorioAssoreamento: firReservatorioAssoreamento,
      reservatorioTaludeMontante: firReservatorioTaludeMontante,
      reservatorioConservacao: firReservatorioConservacao,
      cotaEspelho: Number(firCotaEspelho) || 0,
      bordaLivre: Number(firBordaLivre) || 0,
      reservatorioObs: firReservatorioObs,
      // PÁGINA 6
      drenagemInterna: firDrenagemInterna,
      drenagemMedidorVazao: firDrenagemMedidorVazao,
      drenagemQualidadeAgua: firDrenagemQualidadeAgua,
      drenagemCondicoes: {
        alteracaoVazao: firDrenagemAltVazao,
        assoreamentoSaida: firDrenagemAssoreamentoSaida,
        carreamentoSolidos: firDrenagemCarreamentoSolidos,
        presencaVegetacao: firDrenagemPresencaVegetacao
      },
      drenagemInternaObs: firDrenagemInternaObs,
      // PÁGINA 7
      instrumentacaoMonitoramento: firInstrumentacaoMonitoramento,
      instrumentacaoCondicoes: {
        acessoLeitura: firInstAcessoLeitura,
        identificacao: firInstIdentificacao,
        integridade: firInstIntegridade
      },
      instrumentacaoTipos: firInstTipos,
      instrumentacaoObs: firInstObs,
      // PÁGINA 8
      extravasorObstrucoes: firExtravasorObstrucoes,
      extravasorTipoObstrucao: firExtravasorTipoObstrucao,
      extravasorFluxo: firExtravasorFluxo,
      extravasorConservacao: firExtravasorConservacao,
      extravasorObs: firExtravasorObs,
      // PÁGINA 9
      matrizANM: {
        k: firMatrizK,
        l: firMatrizL,
        m: firMatrizM,
        n: firMatrizN,
        o: firMatrizO
      },
      matrizDrenadaObs: firMatrizDrenadaObs,
      matrizNaoDrenadaObs: firMatrizNaoDrenadaObs,
      classificacaoGeral: firClassificacaoGeral,
      foto: anomalyPhoto.photoData,
      // PÁGINA 10
      assinatura: firAssinatura || `${firProfissional} (Assinatura Digitalizada)`
    };

    if (addChecklist) {
      addChecklist(newFirRecord);
    }

    // 2. Registro no Módulo de Anomalias & Inspeções
    const newAnom = {
      estrutura: structName,
      tipo: anomalyType,
      severidade: anomalySeverity,
      localizacao: anomalyLocation || 'Talude Geral / Crista',
      lat: coords?.lat || -20.063818,
      lon: coords?.lon || -44.114360,
      responsavel: firProfissional,
      descricao: firMacicoObs || anomalyDesc || `Inspeção Regular FIR registrada conforme padrão Survey123 (${firClassificacaoGeral}).`,
      recomendacao: firAcoesCorretivas || anomalyRecommendation || 'Monitoramento ordinário e vistoria geotécnica de campo.',
      foto: anomalyPhoto.photoData
    };

    addAnomaly(newAnom);

    confetti({ particleCount: 70, spread: 75, origin: { y: 0.7 } });
    setAnomalySuccessToast(`Ficha de Inspeção Regular (Survey123 FIR) e Ocorrência de [${structName}] registradas com sucesso no MDSync!`);
    
    // Limpeza parcial
    setAnomalyDesc('');
    setAnomalyRecommendation('');
    setFirMacicoObs('');
    setFirAcoesCorretivas('');
    setFirObservacoesFinais('');
    anomalyPhoto.clearPhoto();
    clearFirSignature();

    setTimeout(() => setAnomalySuccessToast(null), 6000);
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
          SUB-ABA 2: REGISTRO DE INSPEÇÃO VISUAL E ANOMALIA (SURVEY123 FIR)
          Base oficial: https://arcg.is/0yOmKX0 (Portaria ANM 95/2022)
          ============================================================ */}
      {activeSubTab === 'anomalia' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Banner de Identificação Oficial Survey123 FIR */}
          <div className="card-panel" style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)',
            border: '1px solid var(--border-medium)',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge-status badge-info" style={{ fontSize: '0.7rem', fontWeight: 800 }}>
                    PORTARIA ANM Nº 95/2022
                  </span>
                  <span className="badge-status badge-normal" style={{ fontSize: '0.7rem' }}>
                    ArcGIS Survey123 Oficial
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'monospace' }}>
                    ID: 8f6f56e94ec142af90e2ac9084ce716c
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem', marginBottom: '0.2rem' }}>
                  Ficha de Inspeção Regular — FIR - R0
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  ITAMINAS COMÉRCIO DE MINÉRIOS S.A • Mina Engenho Seco / Sarzedo-MG
                </p>
              </div>

              {/* Botões de Ação do Topo e Alternador de Modo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <a
                  href="https://arcg.is/0yOmKX0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', textDecoration: 'none', padding: '0.45rem 0.8rem' }}
                  title="Abrir pesquisa original no ArcGIS Survey123"
                >
                  <ExternalLink size={14} />
                  <span>Abrir Survey123 Web</span>
                </a>

                <div style={{
                  display: 'flex',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '3px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <button
                    type="button"
                    onClick={() => setFirMode('nativo')}
                    style={{
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: firMode === 'nativo' ? 'var(--primary-accent)' : 'transparent',
                      color: firMode === 'nativo' ? '#ffffff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <FileText size={14} />
                    <span>Formulário Nativo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFirMode('survey123_web')}
                    style={{
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: firMode === 'survey123_web' ? 'var(--primary-accent)' : 'transparent',
                      color: firMode === 'survey123_web' ? '#ffffff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Globe size={14} />
                    <span>Survey123 Embutido</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback de Sucesso Toast */}
          {anomalySuccessToast && (
            <div className="animate-page-enter" style={{
              padding: '0.9rem 1.25rem',
              borderRadius: '10px',
              backgroundColor: 'var(--geo-normal-bg)',
              color: 'var(--geo-normal)',
              border: '1px solid var(--geo-normal-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <CheckCircle2 size={22} />
              <span>{anomalySuccessToast}</span>
            </div>
          )}

          {/* MODO 1: SURVEY123 ARCGIS WEB EMBUTIDO (IFRAME) */}
          {firMode === 'survey123_web' && (
            <div className="card-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                  <Info size={16} style={{ color: 'var(--primary-accent)' }} />
                  <span>
                    Conexão direta com a nuvem <strong>ArcGIS Online (Esri Survey123)</strong>. Os dados preenchidos serão transmitidos diretamente aos servidores da Itaminas.
                  </span>
                </div>
                <a
                  href="https://survey123.arcgis.com/share/8f6f56e94ec142af90e2ac9084ce716c"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  <ExternalLink size={13} />
                  <span>Abrir em Tela Cheia</span>
                </a>
              </div>

              <div style={{
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-md)',
                backgroundColor: '#ffffff'
              }}>
                <iframe
                  src="https://survey123.arcgis.com/share/8f6f56e94ec142af90e2ac9084ce716c"
                  title="ArcGIS Survey123 - Ficha de Inspeção Regular FIR - R0"
                  width="100%"
                  height="850px"
                  frameBorder="0"
                  marginHeight="0"
                  marginWidth="0"
                  style={{ display: 'block', border: 'none' }}
                  allow="geolocation; camera; microphone"
                />
              </div>
            </div>
          )}

          {/* MODO 2: FORMULÁRIO NATIVO MDSYNC (BASE OFICIAL SURVEY123 FIR - 10 PÁGINAS) */}
          {firMode === 'nativo' && (
            <form onSubmit={handleSubmitAnomaly} className="fir-form-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Barra de Controle de Navegação: Stepper de 10 Páginas & Modo de Visualização */}
              <div className="card-panel" style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Estrutura da Pesquisa Survey123:
                    </span>
                    <span className="badge-status badge-info" style={{ fontSize: '0.72rem' }}>
                      {firViewMode === 'paginado' ? `Página ${currentFirPage} de 10` : 'Visão Completa Contínua'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setFirViewMode('paginado')}
                      className={`btn-secondary ${firViewMode === 'paginado' ? 'active-preset' : ''}`}
                      style={{ fontSize: '0.74rem', padding: '0.35rem 0.7rem', borderRadius: '6px' }}
                    >
                      Navegação em Páginas
                    </button>
                    <button
                      type="button"
                      onClick={() => setFirViewMode('completo')}
                      className={`btn-secondary ${firViewMode === 'completo' ? 'active-preset' : ''}`}
                      style={{ fontSize: '0.74rem', padding: '0.35rem 0.7rem', borderRadius: '6px' }}
                    >
                      Todas as Seções (Contínuo)
                    </button>
                  </div>
                </div>

                {/* Stepper Buttons (1 a 10) */}
                <div style={{
                  display: 'flex',
                  gap: '0.4rem',
                  overflowX: 'auto',
                  paddingBottom: '0.25rem',
                  scrollbarWidth: 'thin'
                }}>
                  {[
                    { num: 1, label: '1. Geral' },
                    { num: 2, label: '2. Acessos' },
                    { num: 3, label: '3. Maciço' },
                    { num: 4, label: '4. Dren. Sup.' },
                    { num: 5, label: '5. Reservatório' },
                    { num: 6, label: '6. Dren. Int.' },
                    { num: 7, label: '7. Instrumentos' },
                    { num: 8, label: '8. Extravasor' },
                    { num: 9, label: '9. Matriz ANM' },
                    { num: 10, label: '10. Assinatura' }
                  ].map(step => (
                    <button
                      key={step.num}
                      type="button"
                      onClick={() => {
                        setCurrentFirPage(step.num);
                        setFirViewMode('paginado');
                      }}
                      className={`fir-stepper-btn ${currentFirPage === step.num && firViewMode === 'paginado' ? 'active' : ''}`}
                    >
                      <span>{step.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ============================================================
                  PÁGINA 1: INFORMAÇÕES GERAIS DA INSPEÇÃO
                  ============================================================ */}
              {(firViewMode === 'completo' || currentFirPage === 1) && (
                <div className="card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={18} style={{ color: 'var(--primary-accent)' }} />
                      <span>Seção 1 — Informações Gerais da Inspeção</span>
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Portaria ANM 95/2022 • Resolução Regular</span>
                  </div>

                  {/* GRID 12 COLUNAS PERFEITAMENTE ALINHADO: 4 colunas na linha 1 + 4 colunas na linha 2 + 1 coluna full na linha 3 */}
                  <div className="fir-grid-12">
                    {/* Linha 1 - Coluna 1 (span 3) */}
                    <div className="fir-col-3 form-group">
                      <label className="form-label">Estrutura Inspecionada *</label>
                      <select
                        value={firEstrutura}
                        onChange={(e) => {
                          setFirEstrutura(e.target.value);
                          const matched = structures.find(s => s.nome === e.target.value || s.id === e.target.value.replace(/\s+/g, '_'));
                          if (matched) setAnomalyStructId(matched.id);
                        }}
                        className="form-select"
                        style={{ fontWeight: 700, width: '100%', boxSizing: 'border-box' }}
                        required
                      >
                        {SURVEY123_FIR_STRUCTURES.map((st, idx) => (
                          <option key={idx} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    {/* Linha 1 - Coluna 2 (span 3) */}
                    <div className="fir-col-3 form-group">
                      <label className="form-label">Data da Inspeção *</label>
                      <input
                        type="date"
                        value={firData}
                        onChange={(e) => setFirData(e.target.value)}
                        className="form-input"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        required
                      />
                    </div>

                    {/* Linha 1 - Coluna 3 (span 3) */}
                    <div className="fir-col-3 form-group">
                      <label className="form-label">Hora *</label>
                      <input
                        type="time"
                        value={firHora}
                        onChange={(e) => setFirHora(e.target.value)}
                        className="form-input"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        required
                      />
                    </div>

                    {/* Linha 1 - Coluna 4 (span 3) */}
                    <div className="fir-col-3 form-group">
                      <label className="form-label">Profissional Responsável *</label>
                      <input
                        type="text"
                        value={firProfissional}
                        onChange={(e) => setFirProfissional(e.target.value)}
                        className="form-input"
                        placeholder="Nome do Engenheiro ou Técnico"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        required
                      />
                    </div>

                    {/* Linha 2 - Coluna 1 (span 3) */}
                    <div className="fir-col-3 form-group">
                      <label className="form-label">Registro Profissional (CREA / CFT) *</label>
                      <input
                        type="text"
                        value={firRegistro}
                        onChange={(e) => setFirRegistro(e.target.value)}
                        className="form-input"
                        placeholder="Ex: CREA 85.120/D-MG"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        required
                      />
                    </div>

                    {/* Linha 2 - Coluna 2 (span 3) */}
                    <div className="fir-col-3 form-group">
                      <label className="form-label">Condições Climáticas no Momento *</label>
                      <select
                        value={firCondicoesClimaticas}
                        onChange={(e) => setFirCondicoesClimaticas(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="Ensolarado">Ensolarado (Tempo Seco)</option>
                        <option value="Parcialmente Nublado">Parcialmente Nublado</option>
                        <option value="Nublado">Nublado</option>
                        <option value="Chuvoso">Chuvoso (Precipitação ativa)</option>
                      </select>
                    </div>

                    {/* Linha 2 - Coluna 3 (span 3) */}
                    <div className="fir-col-3 form-group">
                      <label className="form-label">Chuva Acum. 24h (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={firVolumeAcumulado}
                        onChange={(e) => setFirVolumeAcumulado(parseFloat(e.target.value) || 0)}
                        className="form-input font-mono"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* Linha 2 - Coluna 4 (span 3) - REDIMENSIONADO E ALINHADO PERFEITAMENTE */}
                    <div className="fir-col-3 form-group">
                      <label className="form-label">Vazão HM (m³/h)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={firVazaoHm}
                        onChange={(e) => setFirVazaoHm(parseFloat(e.target.value) || 0)}
                        className="form-input font-mono"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* Linha 3 - Full Width (span 12) - Coordenadas GPS Georreferenciadas */}
                    <div className="fir-col-12 form-group">
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={15} style={{ color: 'var(--geo-normal)' }} />
                          Georreferenciamento de Campo (Latitude / Longitude) *
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Capturado automaticamente via GPS</span>
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', width: '100%', boxSizing: 'border-box' }}>
                        <input
                          type="text"
                          readOnly
                          value={coords ? `${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)} (Precisão: ±${accuracy ? accuracy.toFixed(1) : 5}m)` : '-20.083601, -44.103632 (Mina Engenho Seco)'}
                          className="form-input font-mono"
                          style={{ backgroundColor: 'var(--bg-secondary)', fontSize: '0.85rem', flex: 1, minWidth: 0, boxSizing: 'border-box' }}
                        />
                        <button
                          type="button"
                          onClick={getPosition}
                          className="btn-secondary"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', fontSize: '0.8rem', flexShrink: 0 }}
                          disabled={gpsLoading}
                        >
                          <RefreshCw size={14} className={gpsLoading ? 'spin' : ''} />
                          <span>Atualizar GPS</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================
                  PÁGINA 2: AVALIAÇÃO DOS ACESSOS
                  ============================================================ */}
              {(firViewMode === 'completo' || currentFirPage === 2) && (
                <div className="card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Navigation size={18} style={{ color: '#0284c7' }} />
                      <span>Seção 2 — Avaliação dos Acessos à Estrutura</span>
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Página 2 • Formulário Oficial</span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Avalie as condições de tráfego, drenagem e conservação das vias de acesso à estrutura:
                  </p>

                  <div className="fir-matrix-container">
                    <table className="fir-matrix-table">
                      <thead>
                        <tr>
                          <th>Item Avaliado</th>
                          <th>Bom</th>
                          <th>Regular</th>
                          <th>Deficiente</th>
                          <th>N/A</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'revestimento', label: 'Revestimento do Acesso', val: firAcessoRevestimento, set: setFirAcessoRevestimento },
                          { key: 'empocamento', label: 'Empoçamento', val: firAcessoEmpocamento, set: setFirAcessoEmpocamento },
                          { key: 'greide', label: 'Greide', val: firAcessoGreide, set: setFirAcessoGreide },
                          { key: 'drenagem', label: 'Dispositivos de Drenagem Superficial', val: firAcessoDrenagem, set: setFirAcessoDrenagem },
                          { key: 'conservacao', label: 'Conservação Geral', val: firAcessoConservacao, set: setFirAcessoConservacao }
                        ].map(row => (
                          <tr key={row.key}>
                            <td>{row.label}</td>
                            {['Bom', 'Regular', 'Deficiente', 'N/A'].map(opt => (
                              <td key={opt} className={row.val === opt ? 'fir-matrix-cell-active' : ''}>
                                <input
                                  type="radio"
                                  name={`acesso_${row.key}`}
                                  value={opt}
                                  checked={row.val === opt}
                                  onChange={() => row.set(opt)}
                                  className="fir-matrix-radio"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label className="form-label">2.1 - Observações e Detalhes dos Acessos</label>
                    <textarea
                      rows={2}
                      value={firAcessosObs}
                      onChange={(e) => setFirAcessosObs(e.target.value)}
                      placeholder="Ex: Pista patrolada recentemente, berma de acesso desobstruída..."
                      className="form-textarea"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* ============================================================
                  PÁGINA 3: MACIÇO E OMBREIRAS
                  ============================================================ */}
              {(firViewMode === 'completo' || currentFirPage === 3) && (
                <div className="card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Layers size={18} style={{ color: '#10b981' }} />
                      <span>Seção 3 — Maciço e Ombreiras</span>
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Página 3 • Formulário Oficial</span>
                  </div>

                  {/* 3.1 Condições Estruturais */}
                  <div>
                    <h5 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      3 — Condições Estruturais (Sim / Não / N/A)
                    </h5>
                    <div className="fir-matrix-container">
                      <table className="fir-matrix-table">
                        <thead>
                          <tr>
                            <th>Evidência Estrutural</th>
                            <th>Sim</th>
                            <th>Não</th>
                            <th>N/A</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: 'abatimento', label: 'Evidência de Abatimento', val: firMacicoAbatimento, set: setFirMacicoAbatimento },
                            { key: 'deslocamento', label: 'Evidência de Deslocamento', val: firMacicoDeslocamento, set: setFirMacicoDeslocamento },
                            { key: 'erosoes', label: 'Evidência de Erosões Superficiais', val: firMacicoErosoes, set: setFirMacicoErosoes },
                            { key: 'escorregamento', label: 'Evidência de Escorregamento', val: firMacicoEscorregamento, set: setFirMacicoEscorregamento },
                            { key: 'recalque', label: 'Evidência de Recalque', val: firMacicoRecalque, set: setFirMacicoRecalque },
                            { key: 'saturacao', label: 'Evidência de Saturação/Surgência', val: firMacicoSaturacao, set: setFirMacicoSaturacao },
                            { key: 'trincas', label: 'Evidência de Trincas', val: firMacicoTrincas, set: setFirMacicoTrincas }
                          ].map(row => (
                            <tr key={row.key}>
                              <td>{row.label}</td>
                              {['Sim', 'Não', 'N/A'].map(opt => (
                                <td key={opt} className={row.val === opt ? 'fir-matrix-cell-active' : ''}>
                                  <input
                                    type="radio"
                                    name={`macico_est_${row.key}`}
                                    value={opt}
                                    checked={row.val === opt}
                                    onChange={() => row.set(opt)}
                                    className="fir-matrix-radio"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="form-group" style={{ marginTop: '0.5rem' }}>
                      <label className="form-label">3.1 - Observações das Condições Estruturais</label>
                      <input
                        type="text"
                        value={firMacicoObsEstrutural}
                        onChange={(e) => setFirMacicoObsEstrutural(e.target.value)}
                        placeholder="Observações complementares..."
                        className="form-input"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {/* 3.2 Condições Visuais */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                    <h5 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      3.2 — Condições Visuais
                    </h5>
                    <div className="fir-matrix-container">
                      <table className="fir-matrix-table">
                        <thead>
                          <tr>
                            <th>Elemento Visual</th>
                            <th>Bom</th>
                            <th>Regular</th>
                            <th>Deficiente</th>
                            <th>N/A</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: 'bermas', label: 'Bermas', val: firMacicoBermas, set: setFirMacicoBermas },
                            { key: 'crista', label: 'Crista', val: firMacicoCrista, set: setFirMacicoCrista },
                            { key: 'ombreiras', label: 'Ombreiras', val: firMacicoOmbreiras, set: setFirMacicoOmbreiras },
                            { key: 'revestimento', label: 'Revestimento Vegetal', val: firMacicoRevestVegetalVis, set: setFirMacicoRevestVegetalVis },
                            { key: 'taludes_jusante', label: 'Taludes de Jusante', val: firMacicoTaludesJusanteVis, set: setFirMacicoTaludesJusanteVis }
                          ].map(row => (
                            <tr key={row.key}>
                              <td>{row.label}</td>
                              {['Bom', 'Regular', 'Deficiente', 'N/A'].map(opt => (
                                <td key={opt} className={row.val === opt ? 'fir-matrix-cell-active' : ''}>
                                  <input
                                    type="radio"
                                    name={`macico_vis_${row.key}`}
                                    value={opt}
                                    checked={row.val === opt}
                                    onChange={() => row.set(opt)}
                                    className="fir-matrix-radio"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="form-group" style={{ marginTop: '0.5rem' }}>
                      <label className="form-label">3.3 - Observações das Condições Visuais</label>
                      <input
                        type="text"
                        value={firMacicoObsVisual}
                        onChange={(e) => setFirMacicoObsVisual(e.target.value)}
                        placeholder="Observações complementares..."
                        className="form-input"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {/* 3.4 Condições Superficiais */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                    <h5 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      3.4 — Condições Superficiais (Sim / Não / N/A)
                    </h5>
                    <div className="fir-matrix-container">
                      <table className="fir-matrix-table">
                        <thead>
                          <tr>
                            <th>Evidência Superficial</th>
                            <th>Sim</th>
                            <th>Não</th>
                            <th>N/A</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: 'animais', label: 'Presença de Animais', val: firMacicoAnimais, set: setFirMacicoAnimais },
                            { key: 'cupinzeiros', label: 'Presença de Cupinzeiros', val: firMacicoCupinzeiros, set: setFirMacicoCupinzeiros },
                            { key: 'formigueiros', label: 'Presença de Formigueiros', val: firMacicoFormigueiros, set: setFirMacicoFormigueiros },
                            { key: 'revest_veg', label: 'Revestimento Vegetal Inadequado', val: firMacicoRevestVegetalSup, set: setFirMacicoRevestVegetalSup },
                            { key: 'taludes_jus', label: 'Taludes de Jusante', val: firMacicoTaludesJusanteSup, set: setFirMacicoTaludesJusanteSup }
                          ].map(row => (
                            <tr key={row.key}>
                              <td>{row.label}</td>
                              {['Sim', 'Não', 'N/A'].map(opt => (
                                <td key={opt} className={row.val === opt ? 'fir-matrix-cell-active' : ''}>
                                  <input
                                    type="radio"
                                    name={`macico_sup_${row.key}`}
                                    value={opt}
                                    checked={row.val === opt}
                                    onChange={() => row.set(opt)}
                                    className="fir-matrix-radio"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="form-group" style={{ marginTop: '0.5rem' }}>
                      <label className="form-label">3.5 - Observações das Condições Superficiais</label>
                      <input
                        type="text"
                        value={firMacicoObsSuperficial}
                        onChange={(e) => setFirMacicoObsSuperficial(e.target.value)}
                        placeholder="Observações complementares..."
                        className="form-input"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================
                  PÁGINA 4: DISPOSITIVOS DE DRENAGEM SUPERFICIAL
                  ============================================================ */}
              {(firViewMode === 'completo' || currentFirPage === 4) && (
                <div className="card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Droplets size={18} style={{ color: '#06b6d4' }} />
                      <span>Seção 4 — Dispositivos de Drenagem Superficial</span>
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Página 4 • Formulário Oficial</span>
                  </div>

                  <div className="fir-grid-12">
                    <div className="fir-col-3 form-group">
                      <label className="form-label">4 - Drenagem Superficial *</label>
                      <select
                        value={firDrenagemSuperficial}
                        onChange={(e) => setFirDrenagemSuperficial(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="Sim">Sim (Existente e operante)</option>
                        <option value="Não">Não (Ausente ou inoperante)</option>
                      </select>
                    </div>

                    <div className="fir-col-3 form-group">
                      <label className="form-label">4.1 - Obstrução *</label>
                      <select
                        value={firDrenagemObstrucao}
                        onChange={(e) => setFirDrenagemObstrucao(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="Não">Não (Desobstruída)</option>
                        <option value="Sim">Sim (Presença de obstrução)</option>
                      </select>
                    </div>

                    <div className="fir-col-3 form-group">
                      <label className="form-label">4.2 - Tipo de Obstrução *</label>
                      <select
                        value={firDrenagemTipoObstrucao}
                        onChange={(e) => setFirDrenagemTipoObstrucao(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="N/A">N/A (Nenhuma)</option>
                        <option value="Sedimentos">Sedimentos / Silte</option>
                        <option value="Vegetação">Vegetação / Capim</option>
                        <option value="Outros">Outros Detritos</option>
                      </select>
                    </div>

                    <div className="fir-col-3 form-group">
                      <label className="form-label">4.3 - Estado de Conservação Geral *</label>
                      <select
                        value={firDrenagemConservacao}
                        onChange={(e) => setFirDrenagemConservacao(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="Bom">Bom</option>
                        <option value="Regular">Regular</option>
                        <option value="Deficiente">Deficiente</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>

                    <div className="fir-col-12 form-group">
                      <label className="form-label">4.4 - Observações da Drenagem Superficial</label>
                      <input
                        type="text"
                        value={firDrenagemObs}
                        onChange={(e) => setFirDrenagemObs(e.target.value)}
                        placeholder="Ex: Canaletas limpas, descidas d'água sem rachaduras..."
                        className="form-input"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================
                  PÁGINA 5: RESERVATÓRIO
                  ============================================================ */}
              {(firViewMode === 'completo' || currentFirPage === 5) && (
                <div className="card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Droplet size={18} style={{ color: '#0284c7' }} />
                      <span>Seção 5 — Reservatório</span>
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Página 5 • Formulário Oficial</span>
                  </div>

                  <div className="fir-grid-12">
                    <div className="fir-col-3 form-group">
                      <label className="form-label">5 - Qualidade da Água *</label>
                      <select
                        value={firReservatorioQualidade}
                        onChange={(e) => setFirReservatorioQualidade(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="Bom">Bom</option>
                        <option value="Turva">Turva</option>
                        <option value="Com sólidos">Com sólidos</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>

                    <div className="fir-col-3 form-group">
                      <label className="form-label">5.1 - Nível de Assoreamento *</label>
                      <select
                        value={firReservatorioAssoreamento}
                        onChange={(e) => setFirReservatorioAssoreamento(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="Baixo">Baixo</option>
                        <option value="Médio">Médio</option>
                        <option value="Alto">Alto</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>

                    <div className="fir-col-3 form-group">
                      <label className="form-label">5.2 - Talude de Montante *</label>
                      <select
                        value={firReservatorioTaludeMontante}
                        onChange={(e) => setFirReservatorioTaludeMontante(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="Bom">Bom</option>
                        <option value="Regular">Regular</option>
                        <option value="Deficiente">Deficiente</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>

                    <div className="fir-col-3 form-group">
                      <label className="form-label">5.3 - Estado de Conservação Geral *</label>
                      <select
                        value={firReservatorioConservacao}
                        onChange={(e) => setFirReservatorioConservacao(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="Bom">Bom</option>
                        <option value="Regular">Regular</option>
                        <option value="Deficiente">Deficiente</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>

                    <div className="fir-col-3 form-group">
                      <label className="form-label">Cota do Espelho d'Água (m)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={firCotaEspelho}
                        onChange={(e) => setFirCotaEspelho(parseFloat(e.target.value) || 0)}
                        className="form-input font-mono"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div className="fir-col-3 form-group">
                      <label className="form-label">Borda Livre Mínima (m)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={firBordaLivre}
                        onChange={(e) => setFirBordaLivre(parseFloat(e.target.value) || 0)}
                        className="form-input font-mono"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div className="fir-col-6 form-group">
                      <label className="form-label">5.4 - Observações do Reservatório</label>
                      <input
                        type="text"
                        value={firReservatorioObs}
                        onChange={(e) => setFirReservatorioObs(e.target.value)}
                        placeholder="Observações complementares..."
                        className="form-input"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================
                  PÁGINA 6: DRENAGEM INTERNA
                  ============================================================ */}
              {(firViewMode === 'completo' || currentFirPage === 6) && (
                <div className="card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={18} style={{ color: '#8b5cf6' }} />
                      <span>Seção 6 — Drenagem Interna</span>
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Página 6 • Formulário Oficial</span>
                  </div>

                  <div className="fir-grid-12">
                    <div className="fir-col-4 form-group">
                      <label className="form-label">6 - Drenagem Interna *</label>
                      <select
                        value={firDrenagemInterna}
                        onChange={(e) => setFirDrenagemInterna(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="Sim">Sim (Existente e operante)</option>
                        <option value="Não">Não</option>
                      </select>
                    </div>

                    <div className="fir-col-4 form-group">
                      <label className="form-label">6.1 - Medidor de Vazão *</label>
                      <select
                        value={firDrenagemMedidorVazao}
                        onChange={(e) => setFirDrenagemMedidorVazao(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="Sim">Sim (Instalado e calibrado)</option>
                        <option value="Não">Não</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>

                    <div className="fir-col-4 form-group">
                      <label className="form-label">6.2 - Qualidade da Água *</label>
                      <select
                        value={firDrenagemQualidadeAgua}
                        onChange={(e) => setFirDrenagemQualidadeAgua(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="Límpida">Límpida (Normal)</option>
                        <option value="Turva">Turva (Atenção)</option>
                        <option value="Sólidos Suspensos">Sólidos Suspensos (Alerta / Finos)</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <h5 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      6.3 — Condições Gerais da Drenagem Interna
                    </h5>
                    <div className="fir-matrix-container">
                      <table className="fir-matrix-table">
                        <thead>
                          <tr>
                            <th>Condição</th>
                            <th>Sim</th>
                            <th>Não</th>
                            <th>N/A</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: 'alt_vazao', label: 'Alteração da Vazão', val: firDrenagemAltVazao, set: setFirDrenagemAltVazao },
                            { key: 'assoreamento_dreno', label: 'Assoreamento na Saída do Dreno', val: firDrenagemAssoreamentoSaida, set: setFirDrenagemAssoreamentoSaida },
                            { key: 'carreamento_sol', label: 'Carreamento de Sólidos', val: firDrenagemCarreamentoSolidos, set: setFirDrenagemCarreamentoSolidos },
                            { key: 'presenca_veg', label: 'Presença de Vegetação', val: firDrenagemPresencaVegetacao, set: setFirDrenagemPresencaVegetacao }
                          ].map(row => (
                            <tr key={row.key}>
                              <td>{row.label}</td>
                              {['Sim', 'Não', 'N/A'].map(opt => (
                                <td key={opt} className={row.val === opt ? 'fir-matrix-cell-active' : ''}>
                                  <input
                                    type="radio"
                                    name={`dren_int_${row.key}`}
                                    value={opt}
                                    checked={row.val === opt}
                                    onChange={() => row.set(opt)}
                                    className="fir-matrix-radio"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label className="form-label">6.4 - Observações da Drenagem Interna</label>
                    <input
                      type="text"
                      value={firDrenagemInternaObs}
                      onChange={(e) => setFirDrenagemInternaObs(e.target.value)}
                      placeholder="Observações complementares..."
                      className="form-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* ============================================================
                  PÁGINA 7: INSTRUMENTAÇÃO
                  ============================================================ */}
              {(firViewMode === 'completo' || currentFirPage === 7) && (
                <div className="card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sliders size={18} style={{ color: '#ec4899' }} />
                      <span>Seção 7 — Instrumentação de Monitoramento Geotécnico</span>
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Página 7 • Formulário Oficial</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">7 - Instrumentação de Monitoramento Geotécnico *</label>
                    <select
                      value={firInstrumentacaoMonitoramento}
                      onChange={(e) => setFirInstrumentacaoMonitoramento(e.target.value)}
                      className="form-select"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    >
                      <option value="Sim">Sim (Existente e em operação)</option>
                      <option value="Não">Não</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>

                  <div style={{ marginTop: '0.25rem' }}>
                    <h5 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      7.1 — Condições Gerais dos Instrumentos
                    </h5>
                    <div className="fir-matrix-container">
                      <table className="fir-matrix-table">
                        <thead>
                          <tr>
                            <th>Condição</th>
                            <th>Bom</th>
                            <th>Regular</th>
                            <th>Deficiente</th>
                            <th>N/A</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: 'acesso_leitura', label: 'Condições de Acesso/Leitura', val: firInstAcessoLeitura, set: setFirInstAcessoLeitura },
                            { key: 'identificacao', label: 'Identificação', val: firInstIdentificacao, set: setFirInstIdentificacao },
                            { key: 'integridade', label: 'Integridade Física', val: firInstIntegridade, set: setFirInstIntegridade }
                          ].map(row => (
                            <tr key={row.key}>
                              <td>{row.label}</td>
                              {['Bom', 'Regular', 'Deficiente', 'N/A'].map(opt => (
                                <td key={opt} className={row.val === opt ? 'fir-matrix-cell-active' : ''}>
                                  <input
                                    type="radio"
                                    name={`inst_cond_${row.key}`}
                                    value={opt}
                                    checked={row.val === opt}
                                    onChange={() => row.set(opt)}
                                    className="fir-matrix-radio"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label className="form-label">7.2 - Tipos de Instrumentos Presentes</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
                      {[
                        { id: 'Piezômetro_-_PZ', label: 'Piezômetro - PZ' },
                        { id: 'Indicador_de_Nível_D\'água', label: 'Indicador de Nível D\'água (INA)' },
                        { id: 'Marcos_Superficiais_-_MS', label: 'Marcos Superficiais - MS' },
                        { id: 'Medidor_de_Vazão_-_MV', label: 'Medidor de Vazão - MV' },
                        { id: 'Pluviômetro_-_PZ', label: 'Pluviômetro' },
                        { id: 'Régua_Linimétrica', label: 'Régua Linimétrica' },
                        { id: 'Tiltimeter_-_MT', label: 'Tiltimeter - MT' }
                      ].map(inst => {
                        const isSelected = firInstTipos.includes(inst.id);
                        return (
                          <button
                            key={inst.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setFirInstTipos(firInstTipos.filter(x => x !== inst.id));
                              } else {
                                setFirInstTipos([...firInstTipos, inst.id]);
                              }
                            }}
                            className={`btn-secondary ${isSelected ? 'active-preset' : ''}`}
                            style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem' }}
                          >
                            <span>{isSelected ? '✓ ' : '+ '}{inst.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">7.3 - Observações da Instrumentação</label>
                    <input
                      type="text"
                      value={firInstObs}
                      onChange={(e) => setFirInstObs(e.target.value)}
                      placeholder="Observações complementares..."
                      className="form-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* ============================================================
                  PÁGINA 8: SISTEMA EXTRAVASOR
                  ============================================================ */}
              {(firViewMode === 'completo' || currentFirPage === 8) && (
                <div className="card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldCheck size={18} style={{ color: '#10b981' }} />
                      <span>Seção 8 — Sistema Extravasor</span>
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Página 8 • Formulário Oficial</span>
                  </div>

                  <div className="fir-grid-12">
                    <div className="fir-col-3 form-group">
                      <label className="form-label">8.1 - Obstruções *</label>
                      <select
                        value={firExtravasorObstrucoes}
                        onChange={(e) => setFirExtravasorObstrucoes(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="Não">Não (Desobstruído)</option>
                        <option value="Sim">Sim (Obstruído)</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>

                    <div className="fir-col-3 form-group">
                      <label className="form-label">8.2 - Tipo de Obstrução *</label>
                      <select
                        value={firExtravasorTipoObstrucao}
                        onChange={(e) => setFirExtravasorTipoObstrucao(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="N/A">N/A (Nenhuma)</option>
                        <option value="Sedimentos">Sedimentos</option>
                        <option value="Vegetação">Vegetação</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>

                    <div className="fir-col-3 form-group">
                      <label className="form-label">8.3 - Condições de Fluxo *</label>
                      <select
                        value={firExtravasorFluxo}
                        onChange={(e) => setFirExtravasorFluxo(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="Normal">Normal</option>
                        <option value="Regular">Regular</option>
                        <option value="Deficiente">Deficiente</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>

                    <div className="fir-col-3 form-group">
                      <label className="form-label">8.4 - Estado de Conservação Geral *</label>
                      <select
                        value={firExtravasorConservacao}
                        onChange={(e) => setFirExtravasorConservacao(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      >
                        <option value="Bom">Bom</option>
                        <option value="Regular">Regular</option>
                        <option value="Deficiente">Deficiente</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>

                    <div className="fir-col-12 form-group">
                      <label className="form-label">8.5 - Observações do Sistema Extravasor</label>
                      <input
                        type="text"
                        value={firExtravasorObs}
                        onChange={(e) => setFirExtravasorObs(e.target.value)}
                        placeholder="Observações complementares..."
                        className="form-input"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================
                  PÁGINA 9: ESTADO DE CONSERVAÇÃO DA ESTRUTURA - EC & MATRIZ ANM
                  ============================================================ */}
              {(firViewMode === 'completo' || currentFirPage === 9) && (
                <div className="card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
                      <span>Seção 9 — Estado de Conservação da Estrutura - EC & Registro Fotográfico</span>
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Portaria ANM 95/2022 • Tabela de Severidade</span>
                  </div>

                  {/* 9.1 Matriz de Classificação ANM */}
                  <div>
                    <h5 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      9.1 — Matriz de Classificação do Estado de Conservação (EC)
                    </h5>
                    <div className="fir-grid-12">
                      <div className="fir-col-4 form-group">
                        <label className="form-label">Confiabilidade Estruturas Extravasoras (k)</label>
                        <select
                          value={firMatrizK}
                          onChange={(e) => setFirMatrizK(Number(e.target.value))}
                          className="form-select"
                          style={{ width: '100%', boxSizing: 'border-box' }}
                        >
                          <option value={0}>0 — Em condições normais</option>
                          <option value={3}>3 — Deficiências toleráveis</option>
                          <option value={6}>6 — Deficiências expressivas</option>
                          <option value={10}>10 — Comprometimento grave / Ruptura iminente</option>
                        </select>
                      </div>

                      <div className="fir-col-4 form-group">
                        <label className="form-label">Percolação (l)</label>
                        <select
                          value={firMatrizL}
                          onChange={(e) => setFirMatrizL(Number(e.target.value))}
                          className="form-select"
                          style={{ width: '100%', boxSizing: 'border-box' }}
                        >
                          <option value={0}>0 — Normal / Não detectada</option>
                          <option value={3}>3 — Umidade / Percolação sem carreados</option>
                          <option value={6}>6 — Surgência com fluxo contínuo</option>
                          <option value={10}>10 — Carreamento de finos (Piping ativo)</option>
                        </select>
                      </div>

                      <div className="fir-col-4 form-group">
                        <label className="form-label">Deformação e Recalques (m)</label>
                        <select
                          value={firMatrizM}
                          onChange={(e) => setFirMatrizM(Number(e.target.value))}
                          className="form-select"
                          style={{ width: '100%', boxSizing: 'border-box' }}
                        >
                          <option value={0}>0 — Não detectado</option>
                          <option value={2}>2 — Deformações leves toleráveis</option>
                          <option value={6}>6 — Trincas expressivas / Recalques</option>
                          <option value={10}>10 — Escorregamento / Abatimento grave</option>
                        </select>
                      </div>

                      <div className="fir-col-4 form-group">
                        <label className="form-label">Deterioração dos Taludes / Paramentos (n)</label>
                        <select
                          value={firMatrizN}
                          onChange={(e) => setFirMatrizN(Number(e.target.value))}
                          className="form-select"
                          style={{ width: '100%', boxSizing: 'border-box' }}
                        >
                          <option value={0}>0 — Vegetação íntegra / Taludes protegidos</option>
                          <option value={2}>2 — Falhas na vegetação / Sulcos leves</option>
                          <option value={6}>6 — Ravinamento severo / Erosões</option>
                          <option value={10}>10 — Boçorocas / Falha estrutural de talude</option>
                        </select>
                      </div>

                      <div className="fir-col-4 form-group">
                        <label className="form-label">Drenagem Superficial (o)</label>
                        <select
                          value={firMatrizO}
                          onChange={(e) => setFirMatrizO(Number(e.target.value))}
                          className="form-select"
                          style={{ width: '100%', boxSizing: 'border-box' }}
                        >
                          <option value={0}>0 — Desobstruída e íntegra</option>
                          <option value={2}>2 — Pequena obstrução / Trincas pontuais</option>
                          <option value={4}>4 — Assoreamento moderado / Danos</option>
                          <option value={5}>5 — Obstrução total / Ruptura de calha</option>
                        </select>
                      </div>

                      <div className="fir-col-4 form-group">
                        <label className="form-label">Classificação Geral (Matriz ANM) *</label>
                        <select
                          value={firClassificacaoGeral}
                          onChange={(e) => {
                            setFirClassificacaoGeral(e.target.value);
                            if (e.target.value.includes('Nível 3')) setAnomalySeverity('Crítico');
                            else if (e.target.value.includes('Nível 2')) setAnomalySeverity('Alto');
                            else if (e.target.value.includes('Nível 1')) setAnomalySeverity('Médio');
                            else setAnomalySeverity('Baixo');
                          }}
                          className="form-select"
                          style={{ fontWeight: 800, width: '100%', boxSizing: 'border-box' }}
                          required
                        >
                          <option value="Nível 0 - Normal / Conforme">Nível 0 — Normal / Conforme</option>
                          <option value="Nível 1 - Atenção Operacional">Nível 1 — Atenção</option>
                          <option value="Nível 2 - Alerta Geotécnico">Nível 2 — Alerta (Ação 24h)</option>
                          <option value="Nível 3 - Emergência (PAEBM)">Nível 3 — Emergência (PAEBM)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Campos de Ocorrência & Localização */}
                  <div className="fir-grid-12" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                    <div className="fir-col-6 form-group">
                      <label className="form-label">Tipo de Ocorrência / Anomalia Visual *</label>
                      <select
                        value={anomalyType}
                        onChange={(e) => setAnomalyType(e.target.value)}
                        className="form-select"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        required
                      >
                        <option value="Trinca Longitudinal">Trinca Longitudinal (Crista / Berma)</option>
                        <option value="Trinca Transversal">Trinca Transversal (Corpo do Maciço)</option>
                        <option value="Surgência de Água Limpa">Surgência de Água Limpa no Pé do Talude</option>
                        <option value="Surgência com Finos (Turbidez)">Surgência com Finos / Turbidez (Piping)</option>
                        <option value="Erosão Superficial">Erosão Superficial / Ravinamento de Talude</option>
                        <option value="Abatimento de Crista/Berma">Abatimento / Desnível de Crista ou Berma</option>
                        <option value="Obstrução de Drenagem">Obstrução de Drenagem, Canaleta ou Vertedouro</option>
                        <option value="Vegetação com Raízes Profundas">Vegetação Arbórea com Raízes Profundas</option>
                        <option value="Formigueiro / Toca de Animal">Formigueiro / Toca de Animal Escavador</option>
                        <option value="Nenhuma Anomalia Detectada">Nenhuma Anomalia Detectada (100% Conforme)</option>
                        <option value="Outro">Outro Tipo de Ocorrência</option>
                      </select>
                    </div>

                    <div className="fir-col-6 form-group">
                      <label className="form-label">Localização Exata e Referência no Talude *</label>
                      <input
                        type="text"
                        value={anomalyLocation}
                        onChange={(e) => setAnomalyLocation(e.target.value)}
                        placeholder="Ex: Talude de jusante, berma 2, entre drenos D-03 e D-04..."
                        className="form-input"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        required
                      />
                    </div>

                    <div className="fir-col-12 form-group">
                      <label className="form-label">Descrição Técnica Detalhada da Inspeção *</label>
                      <textarea
                        rows={3}
                        value={anomalyDesc}
                        onChange={(e) => setAnomalyDesc(e.target.value)}
                        placeholder="Descreva extensões estimadas, presença de umidade, características geométricas da trinca, vazão aproximada ou qualquer alteração perceptível..."
                        className="form-textarea"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Registro Fotográfico da Inspeção */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      <Camera size={16} style={{ color: 'var(--primary-accent)' }} />
                      <span>Registro Fotográfico da Inspeção (Evidência Obrigatória)</span>
                    </label>

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
                            alt="Evidência fotográfica Survey123"
                            style={{
                              maxHeight: '230px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1px solid var(--border-medium)',
                              boxShadow: 'var(--shadow-md)'
                            }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {anomalyPhoto.photoName || 'Foto anexada e georreferenciada'}
                            </span>
                            <button
                              type="button"
                              onClick={anomalyPhoto.clearPhoto}
                              className="btn-danger"
                              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                            >
                              <Trash2 size={14} />
                              <span>Remover Foto</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Camera size={34} style={{ color: 'var(--primary-accent)', margin: '0 auto 0.5rem' }} />
                          <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            Clique para tirar foto com a câmera do dispositivo ou fazer upload
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                            Compressão automática em JPG para relatório de conformidade e envio rápido
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
                </div>
              )}

              {/* ============================================================
                  PÁGINA 10: ASSINATURA DIGITAL DO INSPETOR
                  ============================================================ */}
              {(firViewMode === 'completo' || currentFirPage === 10) && (
                <div className="card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <PenTool size={18} style={{ color: 'var(--primary-accent)' }} />
                      <span>Seção 10 — Assinatura Digital do Inspetor Geotécnico</span>
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Validação em Tela Touch ou Mouse</span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Assine acima da linha para validação oficial nos termos da Portaria ANM nº 95/2022:
                  </p>

                  <div style={{
                    position: 'relative',
                    border: '2px solid var(--border-medium)',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-secondary)',
                    overflow: 'hidden',
                    touchAction: 'none'
                  }}>
                    <canvas
                      ref={firCanvasRef}
                      width={800}
                      height={140}
                      onMouseDown={startFirDrawing}
                      onMouseMove={drawFir}
                      onMouseUp={stopFirDrawing}
                      onMouseLeave={stopFirDrawing}
                      onTouchStart={startFirDrawing}
                      onTouchMove={drawFir}
                      onTouchEnd={stopFirDrawing}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '140px',
                        cursor: 'crosshair',
                        backgroundColor: 'transparent'
                      }}
                    />

                    {/* Linha guia para assinatura conforme Survey123 "Assine acima da linha" */}
                    <div style={{
                      position: 'absolute',
                      left: '5%',
                      right: '5%',
                      bottom: '35px',
                      height: '1px',
                      backgroundColor: 'var(--border-medium)',
                      pointerEvents: 'none'
                    }} />

                    {!hasFirDrawn && (
                      <div style={{
                        position: 'absolute',
                        top: '40%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'var(--text-faint)',
                        fontSize: '0.85rem',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}>
                        <PenTool size={16} />
                        <span>Assine acima da linha com o dedo ou mouse</span>
                      </div>
                    )}

                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {hasFirDrawn && (
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, backgroundColor: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '4px' }}>
                          ✓ Assinatura Capturada
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={clearFirSignature}
                        className="btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <RotateCcw size={12} />
                        <span>Limpar</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>Responsável: <strong>{firProfissional}</strong></span>
                    <span>Registro: <strong>{firRegistro}</strong></span>
                  </div>
                </div>
              )}

              {/* ============================================================
                  BARRA DE NAVEGAÇÃO DE PÁGINAS E SUBMISSÃO DA FICHA
                  ============================================================ */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                paddingTop: '0.5rem'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {firViewMode === 'paginado' && currentFirPage > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentFirPage(p => Math.max(1, p - 1))}
                      className="btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', padding: '0.75rem 1.15rem' }}
                    >
                      <ChevronLeft size={16} />
                      <span>Página Anterior</span>
                    </button>
                  )}
                  {firViewMode === 'paginado' && currentFirPage < 10 && (
                    <button
                      type="button"
                      onClick={() => setCurrentFirPage(p => Math.min(10, p + 1))}
                      className="btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', padding: '0.75rem 1.15rem', fontWeight: 700 }}
                    >
                      <span>Próxima Página</span>
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginLeft: 'auto' }}>
                  <a
                    href="https://arcg.is/0yOmKX0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', textDecoration: 'none', padding: '0.75rem 1.15rem' }}
                  >
                    <ExternalLink size={15} />
                    <span>Abrir Pesquisa Original Web</span>
                  </a>

                  {(firViewMode === 'completo' || currentFirPage === 10) && (
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        boxShadow: 'var(--shadow-md)'
                      }}
                    >
                      <ClipboardCheck size={18} />
                      <span>Salvar Ficha de Inspeção Regular (Survey123 FIR) & Notificar</span>
                    </button>
                  )}
                </div>
              </div>

            </form>
          )}

        </div>
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

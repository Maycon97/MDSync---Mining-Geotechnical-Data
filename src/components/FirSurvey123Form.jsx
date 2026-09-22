import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  MapPin, 
  RefreshCw, 
  Navigation, 
  Layers, 
  Droplets, 
  Droplet, 
  Activity, 
  Sliders, 
  ShieldCheck, 
  AlertTriangle, 
  Camera, 
  Trash2, 
  PenTool, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  ClipboardCheck, 
  ExternalLink, 
  Globe, 
  FileText, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { useGeotechData } from '../context/GeotechDataContext';
import { useAuth } from '../context/AuthContext';
import { useGeoLocation } from '../hooks/useGeoLocation';
import { useCameraPhoto } from '../hooks/useCameraPhoto';

export const SURVEY123_FIR_STRUCTURES = [
  'Barragem B1',
  'Barragem B2',
  'Barragem B3',
  'Barragem B4',
  'Barragem B5',
  'Barragem B6',
  'PDE ( Engenho Seco I )',
  'PDE ( Engenho Seco II )',
  'PDE ( Fazenda Velha )',
  'Dique D1',
  'Dique D2',
  'Cava de Mineração Sarzedo',
  'Cava Mina Jangada',
  'Bacia de Contenção Samambaia',
  'Pilha de Estéril Central',
  'Pilha de Rejeito Seco',
  'Vertedouro Principal B1'
];

export const FirSurvey123Form = ({ initialEstrutura, onSuccess, compact = false }) => {
  const { structures = [], addAnomaly, addInspecaoGeotecnica, addAnomaliaGeotecnica } = useGeotechData();
  const { currentUser } = useAuth();
  const { coords, accuracy, loading: gpsLoading, getPosition } = useGeoLocation();
  const firPhoto = useCameraPhoto();

  // Modos de Exibição
  const [firMode, setFirMode] = useState('nativo'); // 'nativo' | 'survey123_web'
  const [firViewMode, setFirViewMode] = useState('paginado'); // 'paginado' | 'completo'
  const [currentFirPage, setCurrentFirPage] = useState(1); // 1 a 10
  const [toastMessage, setToastMessage] = useState(null);

  // ==========================================
  // PÁGINA 1: Informações Gerais da Inspeção
  // ==========================================
  const [firEstrutura, setFirEstrutura] = useState(initialEstrutura || 'PDE ( Engenho Seco I )');
  const [firData, setFirData] = useState(() => new Date().toISOString().split('T')[0]);
  const [firHora, setFirHora] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [firProfissional, setFirProfissional] = useState(currentUser?.nome || 'Maycon Douglas Nascimento');
  const [firRegistro, setFirRegistro] = useState('CREA 85.120/D-MG');
  const [firCondicoesClimaticas, setFirCondicoesClimaticas] = useState('Parcialmente Nublado');
  const [firVolumeAcumulado, setFirVolumeAcumulado] = useState(14.8);
  const [firVazaoHm, setFirVazaoHm] = useState(2.1);

  // ==========================================
  // PÁGINA 2: Acessos
  // ==========================================
  const [firAcessoRevestimento, setFirAcessoRevestimento] = useState('Bom');
  const [firAcessoEmpocamento, setFirAcessoEmpocamento] = useState('Bom');
  const [firAcessoGreide, setFirAcessoGreide] = useState('Bom');
  const [firAcessoDrenagem, setFirAcessoDrenagem] = useState('Bom');
  const [firAcessoConservacao, setFirAcessoConservacao] = useState('Bom');
  const [firAcessosObs, setFirAcessosObs] = useState('');

  // ==========================================
  // PÁGINA 3: Maciço e Ombreiras
  // ==========================================
  const [firMacicoAbatimento, setFirMacicoAbatimento] = useState('Não');
  const [firMacicoDeslocamento, setFirMacicoDeslocamento] = useState('Não');
  const [firMacicoErosoes, setFirMacicoErosoes] = useState('Não');
  const [firMacicoEscorregamento, setFirMacicoEscorregamento] = useState('Não');
  const [firMacicoRecalque, setFirMacicoRecalque] = useState('Não');
  const [firMacicoSaturacao, setFirMacicoSaturacao] = useState('Não');
  const [firMacicoTrincas, setFirMacicoTrincas] = useState('Não');
  const [firMacicoObsEstrutural, setFirMacicoObsEstrutural] = useState('');

  const [firMacicoBermas, setFirMacicoBermas] = useState('Bom');
  const [firMacicoCrista, setFirMacicoCrista] = useState('Bom');
  const [firMacicoOmbreiras, setFirMacicoOmbreiras] = useState('Bom');
  const [firMacicoRevestVegetalVis, setFirMacicoRevestVegetalVis] = useState('Bom');
  const [firMacicoTaludesJusanteVis, setFirMacicoTaludesJusanteVis] = useState('Bom');
  const [firMacicoObsVisual, setFirMacicoObsVisual] = useState('');

  const [firMacicoAnimais, setFirMacicoAnimais] = useState('Não');
  const [firMacicoCupinzeiros, setFirMacicoCupinzeiros] = useState('Não');
  const [firMacicoFormigueiros, setFirMacicoFormigueiros] = useState('Não');
  const [firMacicoRevestVegetalSup, setFirMacicoRevestVegetalSup] = useState('Não');
  const [firMacicoTaludesJusanteSup, setFirMacicoTaludesJusanteSup] = useState('Não');
  const [firMacicoObsSuperficial, setFirMacicoObsSuperficial] = useState('');

  // ==========================================
  // PÁGINA 4: Dispositivos de Drenagem Superficial
  // ==========================================
  const [firDrenagemSuperficial, setFirDrenagemSuperficial] = useState('Sim');
  const [firDrenagemObstrucao, setFirDrenagemObstrucao] = useState('Não');
  const [firDrenagemTipoObstrucao, setFirDrenagemTipoObstrucao] = useState('N/A');
  const [firDrenagemConservacao, setFirDrenagemConservacao] = useState('Bom');
  const [firDrenagemObs, setFirDrenagemObs] = useState('');

  // ==========================================
  // PÁGINA 5: Reservatório
  // ==========================================
  const [firReservatorioQualidade, setFirReservatorioQualidade] = useState('Bom');
  const [firReservatorioAssoreamento, setFirReservatorioAssoreamento] = useState('Baixo');
  const [firReservatorioTaludeMontante, setFirReservatorioTaludeMontante] = useState('Bom');
  const [firReservatorioConservacao, setFirReservatorioConservacao] = useState('Bom');
  const [firCotaEspelho, setFirCotaEspelho] = useState(847.25);
  const [firBordaLivre, setFirBordaLivre] = useState(3.40);
  const [firReservatorioObs, setFirReservatorioObs] = useState('');

  // ==========================================
  // PÁGINA 6: Drenagem Interna
  // ==========================================
  const [firDrenagemInterna, setFirDrenagemInterna] = useState('Sim');
  const [firDrenagemMedidorVazao, setFirDrenagemMedidorVazao] = useState('Sim');
  const [firDrenagemQualidadeAgua, setFirDrenagemQualidadeAgua] = useState('Límpida');
  const [firDrenagemAltVazao, setFirDrenagemAltVazao] = useState('Não');
  const [firDrenagemAssoreamentoSaida, setFirDrenagemAssoreamentoSaida] = useState('Não');
  const [firDrenagemCarreamentoSolidos, setFirDrenagemCarreamentoSolidos] = useState('Não');
  const [firDrenagemPresencaVegetacao, setFirDrenagemPresencaVegetacao] = useState('Não');
  const [firDrenagemInternaObs, setFirDrenagemInternaObs] = useState('');

  // ==========================================
  // PÁGINA 7: Instrumentação
  // ==========================================
  const [firInstrumentacaoMonitoramento, setFirInstrumentacaoMonitoramento] = useState('Sim');
  const [firInstAcessoLeitura, setFirInstAcessoLeitura] = useState('Bom');
  const [firInstIdentificacao, setFirInstIdentificacao] = useState('Bom');
  const [firInstIntegridade, setFirInstIntegridade] = useState('Bom');
  const [firInstTipos, setFirInstTipos] = useState(['Piezômetro_-_PZ', 'Medidor_de_Vazão_-_MV', 'Indicador_de_Nível_D\'água']);
  const [firInstObs, setFirInstObs] = useState('');

  // ==========================================
  // PÁGINA 8: Sistema Extravasor
  // ==========================================
  const [firExtravasorObstrucoes, setFirExtravasorObstrucoes] = useState('Não');
  const [firExtravasorTipoObstrucao, setFirExtravasorTipoObstrucao] = useState('N/A');
  const [firExtravasorFluxo, setFirExtravasorFluxo] = useState('Normal');
  const [firExtravasorConservacao, setFirExtravasorConservacao] = useState('Bom');
  const [firExtravasorObs, setFirExtravasorObs] = useState('');

  // ==========================================
  // PÁGINA 9: Estado de Conservação da Estrutura - EC (ANM 95/2022)
  // ==========================================
  const [firMatrizK, setFirMatrizK] = useState(0);
  const [firMatrizL, setFirMatrizL] = useState(0);
  const [firMatrizM, setFirMatrizM] = useState(0);
  const [firMatrizN, setFirMatrizN] = useState(0);
  const [firMatrizO, setFirMatrizO] = useState(0);
  const [firClassificacaoGeral, setFirClassificacaoGeral] = useState('Nível 0 - Normal / Conforme');
  const [firOcorrenciaTipo, setFirOcorrenciaTipo] = useState('Nenhuma Anomalia Detectada');
  const [firLocalizacaoDetalhada, setFirLocalizacaoDetalhada] = useState('Crista e Taludes Gerais');
  const [firDescricaoTecnica, setFirDescricaoTecnica] = useState('Inspeção Regular FIR conforme Portaria ANM nº 95/2022. Estrutura sem indícios de instabilidade.');

  // ==========================================
  // PÁGINA 10: Assinatura Digital do Inspetor
  // ==========================================
  const [firAssinatura, setFirAssinatura] = useState('');
  const firCanvasRef = useRef(null);
  const [isFirDrawing, setIsFirDrawing] = useState(false);
  const [hasFirDrawn, setHasFirDrawn] = useState(false);

  // Inicialização e GPS
  useEffect(() => {
    getPosition();
  }, [getPosition]);

  useEffect(() => {
    if (initialEstrutura) {
      setFirEstrutura(initialEstrutura);
    }
  }, [initialEstrutura]);

  // Handlers para o Canvas de Assinatura
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

  // Submissão
  const handleSubmit = (e) => {
    e.preventDefault();

    const struct = structures.find(s => s.nome === firEstrutura || s.id === firEstrutura.replace(/\s+/g, '_'));
    const categoria = struct?.categoria || 'Barragens';

    const newFirRecord = {
      id: `FIR-${Date.now().toString().slice(-6)}`,
      surveyId: '8f6f56e94ec142af90e2ac9084ce716c',
      titulo: 'Formulário de Inspeção Regular - FIR - R0',
      linkSurvey: 'https://arcg.is/0yOmKX0',
      data: firData,
      hora: firHora,
      estrutura: firEstrutura,
      categoria,
      profissional: firProfissional,
      registro: firRegistro,
      condicoesClimaticas: firCondicoesClimaticas,
      volumeAcumulado: Number(firVolumeAcumulado) || 0,
      vazaoHm: Number(firVazaoHm) || 0,
      lat: coords?.lat || -20.083601,
      lon: coords?.lon || -44.103632,
      acessos: {
        revestimento: firAcessoRevestimento,
        empocamento: firAcessoEmpocamento,
        greide: firAcessoGreide,
        drenagem: firAcessoDrenagem,
        conservacao: firAcessoConservacao,
        obs: firAcessosObs
      },
      macico: {
        abatimento: firMacicoAbatimento,
        deslocamento: firMacicoDeslocamento,
        erosoes: firMacicoErosoes,
        escorregamento: firMacicoEscorregamento,
        recalque: firMacicoRecalque,
        saturacao: firMacicoSaturacao,
        trincas: firMacicoTrincas,
        obsEstrutural: firMacicoObsEstrutural,
        bermas: firMacicoBermas,
        crista: firMacicoCrista,
        ombreiras: firMacicoOmbreiras,
        revestVegetalVis: firMacicoRevestVegetalVis,
        taludesJusanteVis: firMacicoTaludesJusanteVis,
        obsVisual: firMacicoObsVisual,
        animais: firMacicoAnimais,
        cupinzeiros: firMacicoCupinzeiros,
        formigueiros: firMacicoFormigueiros,
        revestVegetalSup: firMacicoRevestVegetalSup,
        taludesJusanteSup: firMacicoTaludesJusanteSup,
        obsSuperficial: firMacicoObsSuperficial
      },
      drenagemSuperficial: {
        superficial: firDrenagemSuperficial,
        obstrucao: firDrenagemObstrucao,
        tipoObstrucao: firDrenagemTipoObstrucao,
        conservacao: firDrenagemConservacao,
        obs: firDrenagemObs
      },
      reservatorio: {
        qualidade: firReservatorioQualidade,
        assoreamento: firReservatorioAssoreamento,
        taludeMontante: firReservatorioTaludeMontante,
        conservacao: firReservatorioConservacao,
        cotaEspelho: Number(firCotaEspelho) || 0,
        bordaLivre: Number(firBordaLivre) || 0,
        obs: firReservatorioObs
      },
      drenagemInterna: {
        interna: firDrenagemInterna,
        medidorVazao: firDrenagemMedidorVazao,
        qualidadeAgua: firDrenagemQualidadeAgua,
        altVazao: firDrenagemAltVazao,
        assoreamentoSaida: firDrenagemAssoreamentoSaida,
        carreamentoSolidos: firDrenagemCarreamentoSolidos,
        presencaVegetacao: firDrenagemPresencaVegetacao,
        obs: firDrenagemInternaObs
      },
      instrumentacao: {
        monitoramento: firInstrumentacaoMonitoramento,
        acessoLeitura: firInstAcessoLeitura,
        identificacao: firInstIdentificacao,
        integridade: firInstIntegridade,
        tipos: firInstTipos,
        obs: firInstObs
      },
      extravasor: {
        obstrucoes: firExtravasorObstrucoes,
        tipoObstrucao: firExtravasorTipoObstrucao,
        fluxo: firExtravasorFluxo,
        conservacao: firExtravasorConservacao,
        obs: firExtravasorObs
      },
      matrizANM: {
        k: firMatrizK,
        l: firMatrizL,
        m: firMatrizM,
        n: firMatrizN,
        o: firMatrizO,
        classificacaoGeral: firClassificacaoGeral
      },
      ocorrencia: {
        tipo: firOcorrenciaTipo,
        localizacao: firLocalizacaoDetalhada,
        descricao: firDescricaoTecnica,
        foto: firPhoto.photoData
      },
      assinatura: firAssinatura || (hasFirDrawn ? 'Assinatura Digital Registrada' : null)
    };

    // 1. Persistência no LocalStorage para rastreabilidade
    try {
      const stored = JSON.parse(localStorage.getItem('mdsync_survey123_fir_records') || '[]');
      stored.unshift(newFirRecord);
      localStorage.setItem('mdsync_survey123_fir_records', JSON.stringify(stored.slice(0, 50)));
    } catch (err) {
      console.warn('Erro ao salvar FIR no localStorage:', err);
    }

    // 2. Se houver função de inspeção no contexto global, registrar também no histórico
    if (addInspecaoGeotecnica) {
      addInspecaoGeotecnica({
        tipo: 'ISR',
        titulo: `Inspeção Regular FIR - ${firEstrutura}`,
        estrutura: firEstrutura,
        categoria,
        data: firData,
        inspetor: `${firProfissional} (${firRegistro})`,
        resultadoGeral: firClassificacaoGeral,
        parecerTecnico: firDescricaoTecnica,
        status: 'Concluída'
      });
    }

    // 3. Se houver anomalia apontada, registrar na matriz
    if (firOcorrenciaTipo !== 'Nenhuma Anomalia Detectada' && addAnomaliaGeotecnica) {
      let sev = 1;
      if (firClassificacaoGeral.includes('Nível 3')) sev = 3;
      else if (firClassificacaoGeral.includes('Nível 2')) sev = 2;

      addAnomaliaGeotecnica({
        estrutura: firEstrutura,
        categoria,
        tipo: firOcorrenciaTipo,
        localizacao: firLocalizacaoDetalhada,
        cota: String(firCotaEspelho || ''),
        classificacao: firClassificacaoGeral,
        severidade: sev,
        descricao: firDescricaoTecnica,
        responsavel: firProfissional,
        status: 'Identificada'
      });
    } else if (addAnomaly) {
      addAnomaly({
        estruturaId: struct?.id || 'PDE_ENGENHO_SECO_I',
        tipo: firOcorrenciaTipo,
        severidade: firClassificacaoGeral.includes('Nível 3') ? 'Crítico' : (firClassificacaoGeral.includes('Nível 2') ? 'Alto' : 'Baixo'),
        localizacao: firLocalizacaoDetalhada,
        responsavel: firProfissional,
        descricao: firDescricaoTecnica,
        foto: firPhoto.photoData
      });
    }

    confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    setToastMessage(`Ficha FIR Survey123 de [${firEstrutura}] transmitida e sincronizada com sucesso!`);

    if (onSuccess) {
      onSuccess(newFirRecord);
    }

    setTimeout(() => setToastMessage(null), 6000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Banner de Identificação Oficial Survey123 FIR */}
      <div className="card-panel" style={{
        padding: '1.25rem',
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)',
        border: '1px solid var(--border-medium)',
        borderRadius: '12px',
        boxSizing: 'border-box'
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

      {/* Toast de Sucesso */}
      {toastMessage && (
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
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODO 1: IFRAME SURVEY123 ARCGIS WEB */}
      {firMode === 'survey123_web' && (
        <div className="card-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
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
                Conexão com a nuvem <strong>ArcGIS Online (Esri Survey123)</strong> da Itaminas.
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
              style={{ display: 'block', border: 'none', width: '100%' }}
              allow="geolocation; camera; microphone"
            />
          </div>
        </div>
      )}

      {/* MODO 2: FORMULÁRIO NATIVO MDSYNC (10 PÁGINAS TOTALMENTE RESPONSIVAS) */}
      {firMode === 'nativo' && (
        <form onSubmit={handleSubmit} className="fir-form-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>

          {/* Stepper de 10 Páginas & Modo de Visualização */}
          <div className="card-panel" style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', boxSizing: 'border-box' }}>
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
              PÁGINA 1: INFORMAÇÕES GERAIS DA INSPEÇÃO (ALINHAMENTO 100% PERFEITO)
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

              {/* GRID 12 COLUNAS: Linha 1 (4 cols) + Linha 2 (4 cols) + Linha 3 (100% full width) */}
              <div className="fir-grid-12">
                {/* Linha 1 - Coluna 1 */}
                <div className="fir-col-3 form-group">
                  <label className="form-label">Estrutura Inspecionada *</label>
                  <select
                    value={firEstrutura}
                    onChange={(e) => setFirEstrutura(e.target.value)}
                    className="form-select"
                    style={{ fontWeight: 700, width: '100%', boxSizing: 'border-box' }}
                    required
                  >
                    {SURVEY123_FIR_STRUCTURES.map((st, idx) => (
                      <option key={idx} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Linha 1 - Coluna 2 */}
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

                {/* Linha 1 - Coluna 3 */}
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

                {/* Linha 1 - Coluna 4 */}
                <div className="fir-col-3 form-group">
                  <label className="form-label">Profissional Responsável *</label>
                  <input
                    type="text"
                    value={firProfissional}
                    onChange={(e) => setFirProfissional(e.target.value)}
                    className="form-input"
                    placeholder="Nome do Inspetor"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                {/* Linha 2 - Coluna 1 */}
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

                {/* Linha 2 - Coluna 2 */}
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

                {/* Linha 2 - Coluna 3 */}
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

                {/* Linha 2 - Coluna 4 (Alinhado 100% dentro do card) */}
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

                {/* Linha 3 - Coluna 12 (Full Width) */}
                <div className="fir-col-12 form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={15} style={{ color: 'var(--geo-normal)' }} />
                      Georreferenciamento de Campo (Latitude / Longitude) *
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Capturado automaticamente via GPS</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%', boxSizing: 'border-box', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      readOnly
                      value={coords ? `${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)} (Precisão: ±${accuracy ? accuracy.toFixed(1) : 5}m)` : '-20.083601, -44.103632 (Mina Engenho Seco)'}
                      className="form-input font-mono"
                      style={{ backgroundColor: 'var(--bg-secondary)', fontSize: '0.85rem', flex: '1 1 240px', minWidth: 0, boxSizing: 'border-box' }}
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
                  3.1 — Condições Estruturais (Sim / Não / N/A)
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
                      onChange={(e) => setFirClassificacaoGeral(e.target.value)}
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
                    value={firOcorrenciaTipo}
                    onChange={(e) => setFirOcorrenciaTipo(e.target.value)}
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
                    value={firLocalizacaoDetalhada}
                    onChange={(e) => setFirLocalizacaoDetalhada(e.target.value)}
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
                    value={firDescricaoTecnica}
                    onChange={(e) => setFirDescricaoTecnica(e.target.value)}
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
                  {firPhoto.photoData ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={firPhoto.photoData}
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
                          {firPhoto.photoName || 'Foto anexada e georreferenciada'}
                        </span>
                        <button
                          type="button"
                          onClick={firPhoto.clearPhoto}
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
                        onChange={firPhoto.handleFileUpload}
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
  );
};

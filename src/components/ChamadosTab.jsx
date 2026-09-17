import React, { useState, useMemo } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { useAuth } from '../context/AuthContext';
import { Spline3DViewerTab } from './Spline3DViewerTab';
import { 
  LifeBuoy, 
  Plus, 
  Filter, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  ShieldCheck, 
  Calendar, 
  UserCheck, 
  MapPin, 
  Camera, 
  FileText, 
  Printer, 
  Eye, 
  Trash2, 
  X, 
  Layers, 
  Compass, 
  Building2, 
  Wrench, 
  Pickaxe, 
  Droplet, 
  Clock, 
  Send, 
  Settings, 
  RotateCw, 
  ArrowRight, 
  Box, 
  Upload, 
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  Briefcase
} from 'lucide-react';

export const ChamadosTab = ({ onNavigateTab }) => {
  const { 
    structures, 
    fluigTickets = [], 
    addFluigTicket, 
    updateFluigTicket, 
    deleteFluigTicket, 
    isOnline, 
    showToast 
  } = useGeotechData();
  const { currentUser } = useAuth();

  // Modo de visualização da aba: 'chamados' (padrão Fluig) ou '3d' (Gêmeo digital 3D)
  const [viewMode, setViewMode] = useState('chamados'); // 'chamados' | '3d'

  // Filtros
  const [selectedSetor, setSelectedSetor] = useState('TODOS');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [selectedStructure, setSelectedStructure] = useState('TODAS');
  const [selectedCriticidade, setSelectedCriticidade] = useState('TODAS');
  const [searchQuery, setSearchQuery] = useState('');

  // Modais
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Configurações do Fluig (TOTVS)
  const [fluigConfig, setFluigConfig] = useState({
    serverUrl: 'https://itaminas.fluig.com',
    empresaId: '1',
    processoId: 'GEO_GESTAO_ANOMALIAS',
    versaoProcesso: '2.4',
    nomeProcesso: 'Gestão de Anomalias e Chamados Geotécnicos'
  });

  // Setores Responsáveis pela Execução
  const SETORES_RESPONSAVEIS = [
    { id: 'MANUT_CIVIL', label: 'Manutenção Civil & Obras Geotécnicas', icon: Wrench, color: '#f59e0b' },
    { id: 'OP_MINA', label: 'Operação de Mina & Equipamentos Pesados', icon: Pickaxe, color: '#ef4444' },
    { id: 'INFRA_HIDRICA', label: 'Infraestrutura Hídrica & Drenagem', icon: Droplet, color: '#0284c7' },
    { id: 'TOPO_MONIT', label: 'Topografia & Monitoramento', icon: Compass, color: '#8b5cf6' },
    { id: 'MEIO_AMBIENTE', label: 'Meio Ambiente & PRAD', icon: ShieldCheck, color: '#10b981' },
    { id: 'ENG_GEOTEC', label: 'Engenharia Geotécnica & Projetos', icon: Building2, color: '#3b82f6' },
    { id: 'SEGURANCA_PAEBM', label: 'Segurança Ocupacional & PAEBM', icon: AlertTriangle, color: '#f97316' }
  ];

  // Tipos de Anomalias Geotécnicas
  const TIPOS_ANOMALIAS = [
    'Trinca / Fissura Longitudinal ou Transversal',
    'Erosão / Voçoroca / Ravinamento',
    'Surgência / Ponto Úmido / Percolação Anômala',
    'Obstrução de Drenagem / Quebra de Canaleta',
    'Assoreamento / Acúmulo de Detritos',
    'Depressão / Abatimento de Terreno',
    'Dano em Instrumentação / Tubo ou Tampa',
    'Problemas em Acessos / Pista Intransitável / Atolamento',
    'Perda de Cobertura Vegetal / Erosão Superficial',
    'Vandalismo / Danos em Cercamento ou Placas',
    'Outra Ocorrência Geotécnica'
  ];

  // Estruturas do Complexo
  const ESTRUTURAS_NOMES = [
    'Barragem B1',
    'Barragem B4',
    'Cava Jangada',
    'Contrapilhamento Carrapato',
    'PDE Mangaba',
    'PDE Jacó',
    'PDE Engenho Seco I',
    'PDE Engenho Seco II',
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

  // Estado do Formulário de Novo Chamado Fluig
  const [formData, setFormData] = useState({
    titulo: '',
    estrutura: 'Barragem B1',
    localizacao: '',
    tipoAnomalia: 'Obstrução de Drenagem / Quebra de Canaleta',
    criticidade: 'Média',
    setorResponsavel: 'Manutenção Civil & Obras Geotécnicas',
    prazoSla: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    descricao: '',
    acaoRecomendada: '',
    solicitante: `${currentUser?.nome || 'Eng. Marcelo N. Siqueira'} (${currentUser?.registro || 'CREA 85.120/D-MG'})`,
    lat: -20.063818,
    lon: -44.114360,
    evidenciaFoto: '',
    evidenciaFotoNome: ''
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isGettingGps, setIsGettingGps] = useState(false);

  // Capturar GPS
  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocalização não suportada no navegador.', 'warning');
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setFormData(prev => ({
          ...prev,
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lon: parseFloat(pos.coords.longitude.toFixed(6))
        }));
        setIsGettingGps(false);
        showToast('Coordenadas GPS capturadas com sucesso!', 'success');
      },
      err => {
        setIsGettingGps(false);
        showToast(`Erro ao capturar GPS: ${err.message}`, 'warning');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Upload de Foto de Evidência
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
        canvas.height = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);

        setFormData(prev => ({
          ...prev,
          evidenciaFoto: compressedBase64,
          evidenciaFotoNome: file.name
        }));
        setUploadingPhoto(false);
        showToast('Evidência fotográfica anexada!', 'success');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Submissão do Novo Chamado Fluig
  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      showToast('Preencha o título da ocorrência.', 'warning');
      return;
    }
    if (!formData.localizacao.trim()) {
      showToast('Informe a localização exata na estrutura.', 'warning');
      return;
    }

    const numProtocolo = `FLUIG-${Math.floor(10000 + Math.random() * 90000)}`;
    const setorObj = SETORES_RESPONSAVEIS.find(s => s.label === formData.setorResponsavel) || SETORES_RESPONSAVEIS[0];

    let badgeClass = 'badge-info';
    let criticidadeNivel = 'Nível 1 (Atenção)';
    if (formData.criticidade === 'Baixa') {
      badgeClass = 'badge-normal';
      criticidadeNivel = 'Nível 0 (Rotina)';
    } else if (formData.criticidade === 'Média') {
      badgeClass = 'badge-atencao';
      criticidadeNivel = 'Nível 1 (Atenção)';
    } else if (formData.criticidade === 'Alta') {
      badgeClass = 'badge-alerta';
      criticidadeNivel = 'Nível 2 (Alerta)';
    } else if (formData.criticidade === 'Crítica') {
      badgeClass = 'badge-emergencia';
      criticidadeNivel = 'Nível 3 (Emergência)';
    }

    const nowStr = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

    const newTicket = {
      id: `FLUIG-2026-${numProtocolo.replace('FLUIG-', '')}`,
      protocolo: numProtocolo,
      processoId: fluigConfig.processoId,
      versaoProcesso: fluigConfig.versaoProcesso,
      titulo: formData.titulo.trim(),
      estrutura: formData.estrutura,
      estruturaId: formData.estrutura.toUpperCase().replace(/\s+/g, '_'),
      localizacao: formData.localizacao.trim(),
      tipoAnomalia: formData.tipoAnomalia,
      criticidade: formData.criticidade,
      criticidadeNivel,
      status: 'ABERTO',
      statusLabel: 'Aberto / Triagem no Setor',
      badgeClass,
      setorResponsavel: formData.setorResponsavel,
      setorResponsavelSigla: setorObj.id,
      responsavelExecucao: `Setor ${setorObj.label}`,
      solicitante: formData.solicitante,
      dataAbertura: nowStr,
      prazoSla: formData.prazoSla,
      diasRestantes: Math.max(0, Math.ceil((new Date(formData.prazoSla) - new Date()) / (1000 * 60 * 60 * 24))),
      lat: formData.lat,
      lon: formData.lon,
      descricao: formData.descricao.trim(),
      acaoRecomendada: formData.acaoRecomendada.trim(),
      evidenciaFoto: formData.evidenciaFoto || '/assets/evidencia_placeholder.jpg',
      solucaoFoto: '',
      historico: [
        {
          data: nowStr,
          usuario: formData.solicitante,
          acao: `Chamado aberto via MDSync Geotecnia e enviado ao Fluig BPM (${setorObj.id})`
        }
      ],
      urlFluig: `${fluigConfig.serverUrl}/portal/p/${fluigConfig.empresaId}/workflowview?processId=${fluigConfig.processoId}&numProcess=${numProtocolo.replace('FLUIG-', '')}`
    };

    addFluigTicket(newTicket);
    setIsNewTicketOpen(false);

    // Resetar formulário
    setFormData({
      titulo: '',
      estrutura: 'Barragem B1',
      localizacao: '',
      tipoAnomalia: 'Obstrução de Drenagem / Quebra de Canaleta',
      criticidade: 'Média',
      setorResponsavel: 'Manutenção Civil & Obras Geotécnicas',
      prazoSla: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      descricao: '',
      acaoRecomendada: '',
      solicitante: `${currentUser?.nome || 'Eng. Marcelo N. Siqueira'} (${currentUser?.registro || 'CREA 85.120/D-MG'})`,
      lat: -20.063818,
      lon: -44.114360,
      evidenciaFoto: '',
      evidenciaFotoNome: ''
    });
  };

  // Movimentar Chamado no Fluig (Avançar etapa BPM)
  const handleAdvanceWorkflow = (ticket, proximoStatus) => {
    const nowStr = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    let statusLabel = '';
    let historicoMsg = '';

    if (proximoStatus === 'EM_EXECUCAO') {
      statusLabel = 'Em Execução pelo Setor';
      historicoMsg = `Atendimento iniciado em campo pelo setor ${ticket.setorResponsavel}`;
    } else if (proximoStatus === 'AGUARDANDO_VALIDACAO') {
      statusLabel = 'Aguardando Validação Geotécnica';
      historicoMsg = `Obras concluídas pelo setor executor. Encaminhado para validação e vistoria da Geotecnia.`;
    } else if (proximoStatus === 'CONCLUIDO') {
      statusLabel = 'Concluído e Validado';
      historicoMsg = `Chamado validado presencialmente e encerrado pelo Engenheiro Geotécnico.`;
    }

    const updatedHistorico = [
      ...(ticket.historico || []),
      {
        data: nowStr,
        usuario: currentUser?.nome || 'Engenharia Geotécnica',
        acao: historicoMsg
      }
    ];

    updateFluigTicket(ticket.id, {
      status: proximoStatus,
      statusLabel,
      historico: updatedHistorico,
      dataConclusao: proximoStatus === 'CONCLUIDO' ? nowStr : ticket.dataConclusao
    });

    if (selectedTicketDetail && selectedTicketDetail.id === ticket.id) {
      setSelectedTicketDetail(prev => ({
        ...prev,
        status: proximoStatus,
        statusLabel,
        historico: updatedHistorico
      }));
    }
  };

  // Filtragem dos Chamados
  const filteredTickets = useMemo(() => {
    return fluigTickets.filter(item => {
      // Filtro Setor
      if (selectedSetor !== 'TODOS') {
        if (item.setorResponsavelSigla !== selectedSetor && item.setorResponsavel !== selectedSetor) {
          return false;
        }
      }

      // Filtro Status
      if (selectedStatus !== 'TODOS') {
        if (item.status !== selectedStatus) return false;
      }

      // Filtro Estrutura
      if (selectedStructure !== 'TODAS') {
        const itemStruct = (item.estrutura || '').toUpperCase().replace(/\s+/g, '_');
        const selected = selectedStructure.toUpperCase().replace(/\s+/g, '_');
        if (!itemStruct.includes(selected) && !selected.includes(itemStruct)) {
          return false;
        }
      }

      // Filtro Criticidade
      if (selectedCriticidade !== 'TODAS') {
        if (item.criticidade !== selectedCriticidade) return false;
      }

      // Filtro de Busca Textual
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${item.protocolo} ${item.titulo} ${item.estrutura} ${item.setorResponsavel} ${item.tipoAnomalia} ${item.solicitante} ${item.localizacao}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [fluigTickets, selectedSetor, selectedStatus, selectedStructure, selectedCriticidade, searchQuery]);

  // Estatísticas calculadas
  const totalCount = fluigTickets.length;
  const abertosCount = fluigTickets.filter(t => t.status === 'ABERTO').length;
  const emExecucaoCount = fluigTickets.filter(t => t.status === 'EM_EXECUCAO').length;
  const aguardandoValCount = fluigTickets.filter(t => t.status === 'AGUARDANDO_VALIDACAO').length;
  const concluidosCount = fluigTickets.filter(t => t.status === 'CONCLUIDO').length;
  const criticosCount = fluigTickets.filter(t => t.criticidade === 'Alta' || t.criticidade === 'Crítica').length;

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. CABEÇALHO DO MÓDULO CHAMADOS FLUIG */}
      <div className="card-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(2, 132, 199, 0.15)',
              color: 'var(--primary-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
            }}>
              <LifeBuoy size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Chamados & Anomalias Geotécnicas
                </h1>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(2, 132, 199, 0.15)',
                  color: 'var(--primary-accent)',
                  border: '1px solid rgba(2, 132, 199, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <Building2 size={12} />
                  TOTVS Fluig Integrado
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  BPM API Online
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Abertura e rastreamento de ordens de serviço com evidência fotográfica, geolocalização e despacho direto aos setores executores.
              </p>
            </div>
          </div>

          {/* Ações do Topo: Alternador de Visualização, Configuração e Abrir Chamado */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            
            {/* Seletor de Modo de Visualização */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}>
              <button
                onClick={() => setViewMode('chamados')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'chamados' ? 'var(--primary-accent)' : 'transparent',
                  color: viewMode === 'chamados' ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.2s'
                }}
              >
                <LifeBuoy size={14} />
                <span>Painel Fluig ({totalCount})</span>
              </button>
              <button
                onClick={() => setViewMode('3d')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === '3d' ? 'var(--primary-accent)' : 'transparent',
                  color: viewMode === '3d' ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.2s'
                }}
              >
                <Box size={14} />
                <span>Modelo 3D & Spline</span>
              </button>
            </div>

            {/* Configurar Conexão Fluig */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
              title="Configurações da Conexão com o Servidor TOTVS Fluig"
            >
              <Settings size={15} />
              <span className="hide-mobile">Fluig API</span>
            </button>

            {/* Botão Principal: Novo Chamado */}
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.82rem',
                padding: '0.5rem 1rem',
                fontWeight: 700,
                backgroundColor: 'var(--primary-accent)',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
              }}
            >
              <Plus size={16} />
              <span>Novo Chamado Fluig</span>
            </button>
          </div>

        </div>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL: SE MODO 3D ESTIVER SELECIONADO */}
      {viewMode === '3d' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Box size={18} style={{ color: 'var(--primary-accent)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Visualizador 3D Integrado • Alterne para o Painel Fluig a qualquer momento.
              </span>
            </div>
            <button
              onClick={() => setViewMode('chamados')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
            >
              Voltar aos Chamados
            </button>
          </div>
          <Spline3DViewerTab />
        </div>
      ) : (
        /* MODO PRINCIPAL: PAINEL FLUIG */
        <>
          {/* 2. FAIXA DE MÉTRICAS (KPIS DOS CHAMADOS) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.75rem'
          }}>
            
            <div className="card-panel" style={{ padding: '1rem', borderLeft: '4px solid var(--primary-accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Total Chamados
                </span>
                <LifeBuoy size={16} style={{ color: 'var(--primary-accent)' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>
                {totalCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Cadastrados no sistema
              </div>
            </div>

            <div className="card-panel" style={{ padding: '1rem', borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Abertos / Triagem
                </span>
                <Clock size={16} style={{ color: '#ef4444' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#ef4444' }}>
                {abertosCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Aguardando início no setor
              </div>
            </div>

            <div className="card-panel" style={{ padding: '1rem', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Em Execução
                </span>
                <Wrench size={16} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#f59e0b' }}>
                {emExecucaoCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Obras/reparos em andamento
              </div>
            </div>

            <div className="card-panel" style={{ padding: '1rem', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Aguardando Validação
                </span>
                <Eye size={16} style={{ color: '#8b5cf6' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#8b5cf6' }}>
                {aguardandoValCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Concluídos pelo setor
              </div>
            </div>

            <div className="card-panel" style={{ padding: '1rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Concluídos
                </span>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#10b981' }}>
                {concluidosCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Validados e encerrados
              </div>
            </div>

          </div>

          {/* 3. BARRA DE FILTROS MULTI-CRITÉRIO */}
          <div className="card-panel" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center', flex: 1 }}>
                
                {/* Filtro Setor Responsável */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '190px' }}>
                  <Briefcase size={15} style={{ color: 'var(--text-muted)' }} />
                  <select
                    value={selectedSetor}
                    onChange={e => setSelectedSetor(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <option value="TODOS">Todos os Setores</option>
                    {SETORES_RESPONSAVEIS.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '160px' }}>
                  <Filter size={15} style={{ color: 'var(--text-muted)' }} />
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <option value="TODOS">Todos os Status</option>
                    <option value="ABERTO">Aberto / Triagem</option>
                    <option value="EM_EXECUCAO">Em Execução pelo Setor</option>
                    <option value="AGUARDANDO_VALIDACAO">Aguardando Validação</option>
                    <option value="CONCLUIDO">Concluído e Validado</option>
                  </select>
                </div>

                {/* Filtro Estrutura */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '160px' }}>
                  <Building2 size={15} style={{ color: 'var(--text-muted)' }} />
                  <select
                    value={selectedStructure}
                    onChange={e => setSelectedStructure(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <option value="TODAS">Todas as Estruturas</option>
                    {ESTRUTURAS_NOMES.map(est => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro Criticidade */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '140px' }}>
                  <AlertTriangle size={15} style={{ color: 'var(--text-muted)' }} />
                  <select
                    value={selectedCriticidade}
                    onChange={e => setSelectedCriticidade(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <option value="TODAS">Todas Criticidades</option>
                    <option value="Baixa">Baixa (Nível 0)</option>
                    <option value="Média">Média (Nível 1 - Atenção)</option>
                    <option value="Alta">Alta (Nível 2 - Alerta)</option>
                    <option value="Crítica">Crítica (Nível 3 - Emergência)</option>
                  </select>
                </div>

              </div>

              {/* Campo de Busca Textual */}
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar protocolo, título, setor..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem 0.45rem 2rem',
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)'
                  }}
                />
              </div>

            </div>
          </div>

          {/* 4. LISTA DE CARDS DE CHAMADOS FLUIG */}
          {filteredTickets.length === 0 ? (
            <div className="card-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                color: 'var(--primary-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <LifeBuoy size={32} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                Nenhum chamado encontrado
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                Nenhum chamado corresponde aos filtros selecionados. Altere os filtros ou abra um novo chamado integrado ao Fluig.
              </p>
              <button
                onClick={() => setIsNewTicketOpen(true)}
                className="btn-primary"
                style={{ fontSize: '0.825rem', padding: '0.5rem 1.25rem' }}
              >
                + Abrir Novo Chamado Fluig
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
              {filteredTickets.map(ticket => {
                const setorConfig = SETORES_RESPONSAVEIS.find(s => s.id === ticket.setorResponsavelSigla || s.label === ticket.setorResponsavel) || SETORES_RESPONSAVEIS[0];
                const SetorIcon = setorConfig.icon;

                return (
                  <div 
                    key={ticket.id} 
                    className="card-panel"
                    style={{
                      padding: '1.15rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.85rem',
                      borderTop: `3px solid ${ticket.criticidade === 'Crítica' ? '#ef4444' : (ticket.criticidade === 'Alta' ? '#f97316' : (ticket.criticidade === 'Média' ? '#f59e0b' : '#10b981'))}`,
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                  >
                    <div>
                      {/* Topo do Card: Protocolo Fluig + Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            color: 'var(--primary-accent)',
                            backgroundColor: 'rgba(2, 132, 199, 0.1)',
                            padding: '0.2rem 0.45rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(2, 132, 199, 0.25)'
                          }}>
                            {ticket.protocolo}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
                            Proc: {ticket.processoId}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span className={ticket.badgeClass} style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem', borderRadius: '12px' }}>
                            {ticket.statusLabel || ticket.status}
                          </span>
                        </div>
                      </div>

                      {/* Título da Ocorrência */}
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)', lineHeight: 1.35 }}>
                        {ticket.titulo}
                      </h4>

                      {/* Estrutura e Localização */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        <MapPin size={14} style={{ color: 'var(--primary-accent)', flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ticket.estrutura}</span>
                        <span>•</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.localizacao}</span>
                      </div>

                      {/* Tipo de Anomalia e Criticidade */}
                      <div style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        marginBottom: '0.65rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Anomalia:</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ticket.tipoAnomalia}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Criticidade ANM:</span>
                          <span style={{
                            fontWeight: 700,
                            color: ticket.criticidade === 'Crítica' ? '#ef4444' : (ticket.criticidade === 'Alta' ? '#f97316' : (ticket.criticidade === 'Média' ? '#f59e0b' : '#10b981'))
                          }}>
                            {ticket.criticidadeNivel || ticket.criticidade}
                          </span>
                        </div>
                      </div>

                      {/* Setor Executor e SLA */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.75rem', marginBottom: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            backgroundColor: `${setorConfig.color}22`,
                            color: setorConfig.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <SetorIcon size={14} />
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {ticket.setorResponsavel}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: ticket.diasRestantes <= 2 ? '#ef4444' : 'var(--text-muted)' }}>
                          <Calendar size={13} />
                          <span style={{ fontWeight: 600 }}>SLA: {ticket.prazoSla}</span>
                        </div>
                      </div>

                      {/* Evidência Fotográfica Thumbnail */}
                      {ticket.evidenciaFoto && (
                        <div 
                          onClick={() => setSelectedTicketDetail(ticket)}
                          style={{
                            height: '110px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#0f172a',
                            position: 'relative',
                            cursor: 'pointer',
                            border: '1px solid var(--border-subtle)',
                            marginBottom: '0.5rem'
                          }}
                        >
                          <img 
                            src={ticket.evidenciaFoto} 
                            alt={ticket.titulo}
                            onError={(e) => { e.target.style.display = 'none'; }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: '6px',
                            left: '6px',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}>
                            <Camera size={11} />
                            <span>Evidência Fotográfica</span>
                          </div>
                        </div>
                      )}

                      {/* Descrição resumida */}
                      <p style={{
                        fontSize: '0.76rem',
                        color: 'var(--text-muted)',
                        margin: '0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4
                      }}>
                        {ticket.descricao}
                      </p>
                    </div>

                    {/* Rodapé com Ações */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.65rem',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => setSelectedTicketDetail(ticket)}
                          className="btn-secondary"
                          style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Eye size={13} />
                          <span>Detalhes</span>
                        </button>

                        <a
                          href={ticket.urlFluig}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                          style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
                          title="Abrir diretamente no TOTVS Fluig Web"
                        >
                          <ExternalLink size={13} />
                          <span>Fluig</span>
                        </a>
                      </div>

                      {/* Botão de Avanço Rápido de Etapa */}
                      {ticket.status === 'ABERTO' && (
                        <button
                          onClick={() => handleAdvanceWorkflow(ticket, 'EM_EXECUCAO')}
                          className="btn-secondary"
                          style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                          title="Iniciar atendimento da equipe no campo"
                        >
                          <Wrench size={13} />
                          <span>Iniciar Obras</span>
                        </button>
                      )}

                      {ticket.status === 'EM_EXECUCAO' && (
                        <button
                          onClick={() => handleAdvanceWorkflow(ticket, 'AGUARDANDO_VALIDACAO')}
                          className="btn-secondary"
                          style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.4)' }}
                          title="Enviar para validação da equipe de Geotecnia"
                        >
                          <CheckCircle size={13} />
                          <span>Validar</span>
                        </button>
                      )}

                      {ticket.status === 'AGUARDANDO_VALIDACAO' && (
                        <button
                          onClick={() => handleAdvanceWorkflow(ticket, 'CONCLUIDO')}
                          className="btn-secondary"
                          style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                          title="Aprovar reparo e encerrar chamado no Fluig"
                        >
                          <CheckCircle2 size={13} />
                          <span>Concluir</span>
                        </button>
                      )}

                      {ticket.status === 'CONCLUIDO' && (
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 size={14} />
                          Encerrado
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </>
      )}

      {/* ============================================================
          5. MODAL DE ABERTURA DE NOVO CHAMADO FLUIG
          ============================================================ */}
      {isNewTicketOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card-panel" style={{
            width: '100%',
            maxWidth: '780px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-primary)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
          }}>
            
            {/* Cabeçalho do Modal */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-surface)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(2, 132, 199, 0.15)',
                  color: 'var(--primary-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LifeBuoy size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Abertura de Chamado Fluig (BPM)
                  </h3>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Processo Oficial: {fluigConfig.processoId} • Itaminas Mineração
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Corpo com Scroll */}
            <form onSubmit={handleSubmitTicket} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              {/* Título e Resumo */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Título da Ocorrência / Chamado *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Desobstrução urgente da canaleta trapezoidal na Berma 2"
                  value={formData.titulo}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)'
                  }}
                />
              </div>

              {/* Linha Dupla: Estrutura e Localização */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Estrutura Geotécnica *
                  </label>
                  <select
                    value={formData.estrutura}
                    onChange={e => setFormData({ ...formData, estrutura: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      fontSize: '0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {ESTRUTURAS_NOMES.map(est => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Localização Exata na Estrutura *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Berma 2 - Estaca 14+20m (Ombreira Direita)"
                    value={formData.localizacao}
                    onChange={e => setFormData({ ...formData, localizacao: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      fontSize: '0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  />
                </div>
              </div>

              {/* Linha Tripla: Anomalia, Criticidade e Setor Responsável */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Tipo de Anomalia *
                  </label>
                  <select
                    value={formData.tipoAnomalia}
                    onChange={e => setFormData({ ...formData, tipoAnomalia: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {TIPOS_ANOMALIAS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Criticidade / Gravidade ANM *
                  </label>
                  <select
                    value={formData.criticidade}
                    onChange={e => setFormData({ ...formData, criticidade: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <option value="Baixa">Baixa (Nível 0 - Rotina)</option>
                    <option value="Média">Média (Nível 1 - Atenção / 7 dias)</option>
                    <option value="Alta">Alta (Nível 2 - Alerta / 48h)</option>
                    <option value="Crítica">Crítica (Nível 3 - Emergência / Imediata)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Setor Responsável pela Execução *
                  </label>
                  <select
                    value={formData.setorResponsavel}
                    onChange={e => setFormData({ ...formData, setorResponsavel: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {SETORES_RESPONSAVEIS.map(s => (
                      <option key={s.id} value={s.label}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload de Evidência Fotográfica e GPS de Campo */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                
                {/* Evidência Fotográfica */}
                <div style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    📷 Evidência Fotográfica da Anomalia *
                  </label>
                  
                  {formData.evidenciaFoto ? (
                    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '140px' }}>
                      <img 
                        src={formData.evidenciaFoto} 
                        alt="Evidência" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, evidenciaFoto: '', evidenciaFotoNome: '' })}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      border: '2px dashed var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '1.25rem 1rem',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }}>
                      <Camera size={28} style={{ color: 'var(--primary-accent)' }} />
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {uploadingPhoto ? 'Comprimindo foto...' : 'Tire uma foto ou carregue da galeria'}
                      </div>
                      <label style={{
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        backgroundColor: 'var(--primary-accent)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}>
                        Selecionar Imagem
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Geolocalização e Prazo SLA */}
                <div style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                      Data Limite de Atendimento (SLA)
                    </label>
                    <input
                      type="date"
                      value={formData.prazoSla}
                      onChange={e => setFormData({ ...formData, prazoSla: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.82rem',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                      Coordenadas GPS de Campo
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Latitude"
                        value={formData.lat}
                        onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                        style={{
                          flex: 1,
                          padding: '0.45rem 0.65rem',
                          fontSize: '0.78rem',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      />
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Longitude"
                        value={formData.lon}
                        onChange={e => setFormData({ ...formData, lon: parseFloat(e.target.value) })}
                        style={{
                          flex: 1,
                          padding: '0.45rem 0.65rem',
                          fontSize: '0.78rem',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCaptureGps}
                      disabled={isGettingGps}
                      className="btn-secondary"
                      style={{ marginTop: '0.45rem', width: '100%', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      <MapPin size={13} style={{ color: 'var(--primary-accent)' }} />
                      <span>{isGettingGps ? 'Obtendo GPS...' : 'Capturar GPS Atual'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Descrição Detalhada da Anomalia */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Descrição Detalhada da Anomalia Geotécnica *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva as dimensões da anomalia, estado visual, se há umidade/água, trincamento ou risco de evolução..."
                  value={formData.descricao}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Ação Corretiva Solicitada ao Setor */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Ação Corretiva Solicitada ao Setor Executor *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Especifique a intervenção necessária: reconformação mecânica, desobstrução, aplicação de enrocamento, selagem de trincas..."
                  value={formData.acaoRecomendada}
                  onChange={e => setFormData({ ...formData, acaoRecomendada: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Solicitante / Responsável */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Solicitante / Engenheiro Geotécnico Emitente
                </label>
                <input
                  type="text"
                  value={formData.solicitante}
                  onChange={e => setFormData({ ...formData, solicitante: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)'
                  }}
                />
              </div>

              {/* Botões do Rodapé */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1rem',
                marginTop: '0.5rem'
              }}>
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '0.55rem 1.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'var(--primary-accent)'
                  }}
                >
                  <Send size={16} />
                  <span>Transmitir Chamado ao Fluig</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================
          6. MODAL DE VISUALIZAÇÃO DETALHADA DO CHAMADO FLUIG
          ============================================================ */}
      {selectedTicketDetail && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card-panel" style={{
            width: '100%',
            maxWidth: '820px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-primary)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
          }}>
            
            {/* Cabeçalho do Detalhe */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-surface)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--primary-accent)',
                  backgroundColor: 'rgba(2, 132, 199, 0.1)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(2, 132, 199, 0.3)'
                }}>
                  {selectedTicketDetail.protocolo}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    {selectedTicketDetail.titulo}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Processo Fluig: {selectedTicketDetail.processoId} • Abertura: {selectedTicketDetail.dataAbertura}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => window.print()}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  title="Imprimir Ordem de Serviço Fluig"
                >
                  <Printer size={14} />
                  <span>Imprimir O.S.</span>
                </button>
                <button
                  onClick={() => setSelectedTicketDetail(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Conteúdo com Scroll */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Quadro de Identificação */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
                padding: '1rem',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>ESTRUTURA</span>
                  <strong style={{ color: 'var(--text-main)' }}>{selectedTicketDetail.estrutura}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>LOCALIZAÇÃO</span>
                  <strong style={{ color: 'var(--text-main)' }}>{selectedTicketDetail.localizacao}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>SETOR EXECUTOR</span>
                  <strong style={{ color: 'var(--primary-accent)' }}>{selectedTicketDetail.setorResponsavel}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>CRITICIDADE ANM</span>
                  <strong style={{ color: selectedTicketDetail.criticidade === 'Crítica' ? '#ef4444' : '#f59e0b' }}>
                    {selectedTicketDetail.criticidadeNivel || selectedTicketDetail.criticidade}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>SOLICITANTE</span>
                  <strong style={{ color: 'var(--text-main)' }}>{selectedTicketDetail.solicitante}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>PRAZO SLA</span>
                  <strong style={{ color: 'var(--text-main)' }}>{selectedTicketDetail.prazoSla}</strong>
                </div>
              </div>

              {/* Evidência Fotográfica Ampliada */}
              {selectedTicketDetail.evidenciaFoto && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Camera size={16} style={{ color: 'var(--primary-accent)' }} />
                    Evidência Fotográfica da Anomalia
                  </h4>
                  <div style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#000000',
                    maxHeight: '320px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={selectedTicketDetail.evidenciaFoto} 
                      alt={selectedTicketDetail.titulo} 
                      style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain' }} 
                    />
                  </div>
                </div>
              )}

              {/* Descrição e Ação Corretiva */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                    Diagnóstico da Anomalia
                  </h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    {selectedTicketDetail.descricao}
                  </p>
                </div>

                <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--primary-accent)' }}>
                    Ação Corretiva Requerida
                  </h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.5 }}>
                    {selectedTicketDetail.acaoRecomendada}
                  </p>
                </div>
              </div>

              {/* Histórico do Workflow BPM Fluig */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} style={{ color: 'var(--primary-accent)' }} />
                  Histórico de Movimentações Fluig (BPM)
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(selectedTicketDetail.historico || []).map((hist, idx) => (
                    <div 
                      key={idx}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderLeft: '3px solid var(--primary-accent)',
                        fontSize: '0.78rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <strong style={{ color: 'var(--text-main)' }}>{hist.usuario}</strong>
                        <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>{hist.data}</span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                        {hist.acao}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Rodapé com Transição de Workflow */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-surface)'
            }}>
              <a
                href={selectedTicketDetail.urlFluig}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
              >
                <ExternalLink size={14} />
                <span>Abrir Processo no Portal Fluig</span>
              </a>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {selectedTicketDetail.status === 'ABERTO' && (
                  <button
                    onClick={() => handleAdvanceWorkflow(selectedTicketDetail, 'EM_EXECUCAO')}
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Wrench size={14} />
                    <span>Iniciar Atendimento no Setor</span>
                  </button>
                )}

                {selectedTicketDetail.status === 'EM_EXECUCAO' && (
                  <button
                    onClick={() => handleAdvanceWorkflow(selectedTicketDetail, 'AGUARDANDO_VALIDACAO')}
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', backgroundColor: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <CheckCircle size={14} />
                    <span>Concluir Obras & Enviar p/ Validação</span>
                  </button>
                )}

                {selectedTicketDetail.status === 'AGUARDANDO_VALIDACAO' && (
                  <button
                    onClick={() => handleAdvanceWorkflow(selectedTicketDetail, 'CONCLUIDO')}
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <CheckCircle2 size={14} />
                    <span>Validar e Encerrar Chamado</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedTicketDetail(null)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem' }}
                >
                  Fechar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================
          7. MODAL DE CONFIGURAÇÃO DA INTEGRAÇÃO FLUIG API
          ============================================================ */}
      {isConfigOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card-panel" style={{
            width: '100%',
            maxWidth: '560px',
            backgroundColor: 'var(--bg-primary)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={18} style={{ color: 'var(--primary-accent)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Configuração TOTVS Fluig API
                </h3>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  URL do Servidor Fluig (BPM)
                </label>
                <input
                  type="text"
                  value={fluigConfig.serverUrl}
                  onChange={e => setFluigConfig({ ...fluigConfig, serverUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Código da Empresa
                  </label>
                  <input
                    type="text"
                    value={fluigConfig.empresaId}
                    onChange={e => setFluigConfig({ ...fluigConfig, empresaId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    ID do Processo BPM
                  </label>
                  <input
                    type="text"
                    value={fluigConfig.processoId}
                    onChange={e => setFluigConfig({ ...fluigConfig, processoId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  />
                </div>
              </div>

              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.78rem',
                color: '#10b981'
              }}>
                <CheckCircle2 size={16} />
                <span>Endpoint REST v1 ativo e conectado. Autenticação OAuth2 / Token habilitada.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setIsConfigOpen(false)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    showToast('Configurações da integração Fluig salvas!', 'success');
                    setIsConfigOpen(false);
                  }}
                  className="btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 1.2rem' }}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

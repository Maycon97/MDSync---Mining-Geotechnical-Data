import React, { useState, useMemo } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardCheck, 
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
  CloudRain, 
  Droplets, 
  FileText, 
  Camera, 
  Download, 
  Printer, 
  Eye, 
  Trash2, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Compass, 
  Building2,
  RefreshCw,
  HardHat,
  Truck,
  Car,
  Gauge,
  Key,
  PenTool,
  ShieldAlert,
  ClipboardList
} from 'lucide-react';
import { VehicleChecklistModal } from './VehicleChecklistModal';
import { VehicleChecklistDetailModal } from './VehicleChecklistDetailModal';

export const ChecklistTab = ({ onNavigateTab }) => {
  const { 
    structures, 
    checklists = [], 
    vehicleChecklists = [],
    addChecklist, 
    deleteChecklist, 
    addVehicleChecklist,
    deleteVehicleChecklist,
    isOnline, 
    activeStructureId, 
    selectStructure 
  } = useGeotechData();
  const { currentUser } = useAuth();

  // Sub-aba ativa: FIR (Geotécnica) ou VEICULAR (Frota Diária)
  const [activeSubTab, setActiveSubTab] = useState('FIR');

  // Estados dos Filtros FIR
  const [selectedStructure, setSelectedStructure] = useState('TODAS');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados dos Filtros Veicular
  const [selectedPlate, setSelectedPlate] = useState('TODAS');
  const [selectedVehicleStatus, setSelectedVehicleStatus] = useState('TODOS');
  const [searchVehicleQuery, setSearchVehicleQuery] = useState('');

  // Controle de Modal / Formulário de Nova Inspeção FIR
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInspectionDetail, setSelectedInspectionDetail] = useState(null);

  // Controle de Modal / Formulário de Checklist Veicular
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
  const [selectedVehicleDetail, setSelectedVehicleDetail] = useState(null);

  // Estruturas do Survey123 (Ficha de Inspeção Regular - FIR)
  const SURVEY123_STRUCTURES = [
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

  // Estado do Formulário de Nova Inspeção
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    estrutura: 'Barragem B1',
    profissional: `${currentUser?.nome || 'Eng. Marcelo N. Siqueira'} (${currentUser?.registro || 'CREA 85.120/D-MG'})`,
    condicoesClimaticas: 'Ensolarado',
    volumeAcumulado: 14.8,
    vazaoHm: 2.1,
    lat: -20.063818,
    lon: -44.114360,
    acessos: 'Bom',
    acessosObs: '',
    macicoCondicoesEstruturais: 'Não detectado',
    macicoCondicoesVisuais: 'Não detectado',
    macicoCondicoesSuperficiais: 'Não detectado',
    macicoObs: '',
    drenagemSuperficial: 'Não',
    tipoObstrucao: 'Nenhum',
    estadoConservacaoDrenagem: 'Bom',
    drenagemObs: '',
    reservatorioQualidadeAgua: 'Límpida',
    nivelAssoreamento: 'Baixo',
    taludeMontante: 'Estável',
    reservatorioObs: '',
    drenagemInterna: 'Operando Normal',
    qualidadeAguaDrenagem: 'Límpida',
    estadoGeralDrenagemInterna: 'Bom',
    drenagemInternaObs: '',
    instrumentacao: 'Operando Normalmente',
    condicoesGeraisInstrumentacao: 'Bom',
    tampasProtecao: 'Íntegras',
    instrumentacaoObs: '',
    sistemaExtravasor: 'Não',
    tipoObstrucaoExtravasor: 'Nenhum',
    condicoesFluxo: 'Livre',
    estadoConservacaoExtravasor: 'Bom',
    extravasorObs: '',
    classificacaoGeral: 'Conforme / Nível Normal',
    observacoesFinais: '',
    acoesRecomendadas: '',
    fotoUrl: ''
  });

  // Obter Coordenadas GPS atuais
  const handleGetGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            lat: Number(pos.coords.latitude.toFixed(6)),
            lon: Number(pos.coords.longitude.toFixed(6))
          }));
        },
        () => {
          // Fallback padrão se GPS não permitido
          setFormData(prev => ({
            ...prev,
            lat: -20.063818,
            lon: -44.114360
          }));
        }
      );
    }
  };

  // Upload simulado de foto de evidência
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, fotoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submissão do Formulário de Inspeção
  const handleSubmitForm = (e) => {
    e.preventDefault();

    let status = 'CONFORME';
    let badgeClass = 'badge-normal';
    if (formData.classificacaoGeral.includes('Emergência')) {
      status = 'EMERGÊNCIA';
      badgeClass = 'badge-emergencia';
    } else if (formData.classificacaoGeral.includes('Alerta')) {
      status = 'ALERTA';
      badgeClass = 'badge-alerta';
    } else if (formData.classificacaoGeral.includes('Atenção')) {
      status = 'ATENÇÃO';
      badgeClass = 'badge-atencao';
    }

    const newEntry = {
      id: `FIR-${Date.now().toString().slice(-6)}`,
      surveyId: '8f6f56e94ec142af90e2ac9084ce716c',
      titulo: 'Formulário de Inspeção Regular - FIR - R0',
      ...formData,
      status,
      badgeClass,
      linkSurvey: 'https://arcg.is/0yOmKX0'
    };

    addChecklist(newEntry);
    setIsFormOpen(false);

    // Resetar campos opcionais
    setFormData(prev => ({
      ...prev,
      acessosObs: '',
      macicoObs: '',
      drenagemObs: '',
      reservatorioObs: '',
      drenagemInternaObs: '',
      instrumentacaoObs: '',
      extravasorObs: '',
      observacoesFinais: '',
      acoesRecomendadas: '',
      fotoUrl: ''
    }));
  };

  // Filtragem dos Checklists
  const filteredChecklists = useMemo(() => {
    return checklists.filter(item => {
      // Filtro Estrutura
      if (selectedStructure !== 'TODAS') {
        const itemStruct = item.estrutura?.toUpperCase().replace(/\s+/g, '_');
        const selected = selectedStructure.toUpperCase().replace(/\s+/g, '_');
        if (!itemStruct.includes(selected) && !selected.includes(itemStruct)) {
          return false;
        }
      }

      // Filtro Status
      if (selectedStatus !== 'TODOS') {
        if (item.status !== selectedStatus) return false;
      }

      // Filtro de Busca
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${item.id} ${item.estrutura} ${item.profissional} ${item.observacoesFinais} ${item.classificacaoGeral}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [checklists, selectedStructure, selectedStatus, searchQuery]);

  // Estatísticas calculadas - FIR
  const totalCount = checklists.length;
  const conformesCount = checklists.filter(c => c.status === 'CONFORME').length;
  const atencaoCount = checklists.filter(c => c.status === 'ATENÇÃO' || c.status === 'ALERTA').length;
  const emergenciaCount = checklists.filter(c => c.status === 'EMERGÊNCIA').length;

  // Filtragem dos Checklists Veiculares
  const filteredVehicleChecklists = useMemo(() => {
    return vehicleChecklists.filter(item => {
      // Filtro Placa
      if (selectedPlate !== 'TODAS') {
        if (item.placa !== selectedPlate) return false;
      }

      // Filtro Status
      if (selectedVehicleStatus !== 'TODOS') {
        if (item.status !== selectedVehicleStatus) return false;
      }

      // Filtro Busca
      if (searchVehicleQuery.trim()) {
        const q = searchVehicleQuery.toLowerCase();
        const text = `${item.id} ${item.placa} ${item.condutor} ${item.modeloVeiculo || ''} ${item.descreva_aqui || ''} ${item.status}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [vehicleChecklists, selectedPlate, selectedVehicleStatus, searchVehicleQuery]);

  // Estatísticas calculadas - Veicular
  const totalVehiclesCount = vehicleChecklists.length;
  const liberadosVehiclesCount = vehicleChecklists.filter(v => v.status === 'LIBERADO').length;
  const atencaoVehiclesCount = vehicleChecklists.filter(v => v.status === 'ATENÇÃO').length;
  const bloqueadosVehiclesCount = vehicleChecklists.filter(v => v.status === 'BLOQUEADO' || v.status === 'CRÍTICO').length;

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 0. SELETOR DE MODO: FIR vs CHECKLIST VEICULAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.5rem 0.75rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveSubTab('FIR')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: activeSubTab === 'FIR' ? 'var(--primary-accent)' : 'transparent',
              color: activeSubTab === 'FIR' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <ClipboardCheck size={16} />
            <span>Ficha de Inspeção Regular (FIR)</span>
            <span style={{
              fontSize: '0.7rem',
              padding: '0.1rem 0.45rem',
              borderRadius: '10px',
              backgroundColor: activeSubTab === 'FIR' ? 'rgba(255,255,255,0.25)' : 'var(--bg-panel)',
              color: activeSubTab === 'FIR' ? '#ffffff' : 'var(--text-faint)'
            }}>
              {checklists.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('VEICULAR')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: activeSubTab === 'VEICULAR' ? '#0284c7' : 'transparent',
              color: activeSubTab === 'VEICULAR' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <Truck size={16} />
            <span>Checklist Veicular Diário</span>
            <span style={{
              fontSize: '0.7rem',
              padding: '0.1rem 0.45rem',
              borderRadius: '10px',
              backgroundColor: activeSubTab === 'VEICULAR' ? 'rgba(255,255,255,0.25)' : 'var(--bg-panel)',
              color: activeSubTab === 'VEICULAR' ? '#ffffff' : 'var(--text-faint)'
            }}>
              {vehicleChecklists.length}
            </span>
          </button>
        </div>

        {/* Links rápidos diretos para os dois formulários Survey123 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-faint)' }}>Links Oficiais Survey123:</span>
          <a
            href="https://arcg.is/0yOmKX0"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: activeSubTab === 'FIR' ? 'var(--primary-accent)' : 'var(--text-muted)' }}
            title="Abrir Formulário Survey123 FIR (Geotecnia)"
          >
            <ExternalLink size={12} />
            <span>FIR Geotécnica</span>
          </a>
          <a
            href="https://arcg.is/0DuT4L1"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: activeSubTab === 'VEICULAR' ? '#0284c7' : 'var(--text-muted)' }}
            title="Abrir Formulário Survey123 Checklist Veicular Oficial"
          >
            <ExternalLink size={12} />
            <span>Checklist Veicular</span>
          </a>
        </div>
      </div>

      {/* 1. CABEÇALHO DO MÓDULO CHECKLIST */}
      <div className="card-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: activeSubTab === 'FIR' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 132, 199, 0.15)',
              color: activeSubTab === 'FIR' ? '#10b981' : 'var(--primary-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${activeSubTab === 'FIR' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(2, 132, 199, 0.3)'}`
            }}>
              {activeSubTab === 'FIR' ? <ClipboardCheck size={22} /> : <Truck size={22} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                  {activeSubTab === 'FIR' 
                    ? 'CheckList — Ficha de Inspeção Regular (FIR)'
                    : 'CheckList — Veicular Diário (Frota Operacional)'}
                </h1>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(2, 132, 199, 0.15)',
                  color: 'var(--primary-accent)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(2, 132, 199, 0.3)'
                }}>
                  Survey123 Integrado
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {activeSubTab === 'FIR'
                  ? 'Ficha de Inspeção Regular de Estruturas Geotécnicas (Itaminas Mineração • Sarzedo/MG)'
                  : 'Inspeção Diária de Veículos e Equipamentos Críticos (Itaminas Mineração • Sarzedo/MG)'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {activeSubTab === 'FIR' ? (
              <>
                {/* Botão para abrir o link oficial do Survey123 FIR */}
                <a
                  href="https://arcg.is/0yOmKX0"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
                  title="Abrir Formulário no ArcGIS Survey123 Web"
                >
                  <ExternalLink size={14} style={{ color: 'var(--primary-accent)' }} />
                  <span>Abrir Survey123 Oficial</span>
                </a>

                {/* Botão para Nova Ficha no MDSync */}
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', padding: '0.5rem 1rem', fontWeight: 700 }}
                >
                  <Plus size={16} />
                  <span>+ Nova Ficha de Inspeção</span>
                </button>
              </>
            ) : (
              <>
                {/* Botão para abrir o link oficial do Survey123 Veicular */}
                <a
                  href="https://arcg.is/0DuT4L1"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.5rem 0.85rem', borderColor: 'var(--primary-accent)', color: 'var(--primary-accent)' }}
                  title="Abrir Formulário Veicular no ArcGIS Survey123 Web (https://arcg.is/0DuT4L1)"
                >
                  <ExternalLink size={14} />
                  <span>Abrir Survey123 Oficial</span>
                </a>

                {/* Botão para Novo Checklist Veicular no MDSync */}
                <button
                  onClick={() => setIsVehicleFormOpen(true)}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', padding: '0.5rem 1rem', fontWeight: 700, background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}
                >
                  <Plus size={16} />
                  <span>+ Novo Checklist Veicular</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. FAIXA DE INDICADORES RÁPIDOS */}
      {activeSubTab === 'FIR' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.85rem'
        }}>
          <div className="card-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(2, 132, 199, 0.12)', color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total de Fichas FIR</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>{totalCount}</div>
            </div>
          </div>

          <div className="card-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--geo-normal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Conformes / Estáveis</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--geo-normal)', lineHeight: 1.1 }}>{conformesCount}</div>
            </div>
          </div>

          <div className="card-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--geo-atencao)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Atenção / Alerta</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--geo-atencao)', lineHeight: 1.1 }}>{atencaoCount}</div>
            </div>
          </div>

          <div className="card-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.12)', color: 'var(--geo-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CloudRain size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Chuva Acumulada Recente</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--geo-info)', lineHeight: 1.1 }}>14.8 mm</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.85rem'
        }}>
          <div className="card-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(2, 132, 199, 0.12)', color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Inspecionados</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>{totalVehiclesCount}</div>
            </div>
          </div>

          <div className="card-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--geo-normal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Veículos Liberados (OK)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--geo-normal)', lineHeight: 1.1 }}>{liberadosVehiclesCount}</div>
            </div>
          </div>

          <div className="card-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--geo-atencao)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Em Atenção / Manutenção</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--geo-atencao)', lineHeight: 1.1 }}>{atencaoVehiclesCount}</div>
            </div>
          </div>

          <div className="card-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bloqueados / Críticos</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', lineHeight: 1.1 }}>{bloqueadosVehiclesCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BARRA DE FILTROS E BUSCA */}
      {activeSubTab === 'FIR' ? (
        <div className="card-panel" style={{ padding: '0.85rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Filtro Estrutura */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estrutura:</span>
                <select
                  value={selectedStructure}
                  onChange={(e) => setSelectedStructure(e.target.value)}
                  className="form-select"
                  style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '180px' }}
                >
                  <option value="TODAS">Todas as Estruturas</option>
                  {structures.map(s => (
                    <option key={s.id} value={s.nome}>{s.nome}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classificação:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="form-select"
                  style={{ fontSize: '0.8rem', fontWeight: 600 }}
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="CONFORME">Conforme (Normal)</option>
                  <option value="ATENÇÃO">Atenção Operacional</option>
                  <option value="ALERTA">Alerta</option>
                  <option value="EMERGÊNCIA">Emergência</option>
                </select>
              </div>
            </div>

            {/* Campo de Busca */}
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ID, inspetor ou parecer..."
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.8rem' }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="card-panel" style={{ padding: '0.85rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Filtro Placa */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Placa:</span>
                <select
                  value={selectedPlate}
                  onChange={(e) => setSelectedPlate(e.target.value)}
                  className="form-select"
                  style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '170px' }}
                >
                  <option value="TODAS">Todas as Placas</option>
                  <option value="PZB-1G94">PZB-1G94 (Hilux Geot.)</option>
                  <option value="TXY-7J22">TXY-7J22 (L200 Triton)</option>
                  <option value="TEQ-1E02">TEQ-1E02 (Ranger Sup.)</option>
                  <option value="TEQ-1E17">TEQ-1E17 (Hilux Apoio)</option>
                  <option value="Outro">Outro / Terceiro</option>
                </select>
              </div>

              {/* Filtro Status Veicular */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status da Inspeção:</span>
                <select
                  value={selectedVehicleStatus}
                  onChange={(e) => setSelectedVehicleStatus(e.target.value)}
                  className="form-select"
                  style={{ fontSize: '0.8rem', fontWeight: 600 }}
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="LIBERADO">Liberado (100% OK)</option>
                  <option value="ATENÇÃO">Atenção Operacional</option>
                  <option value="BLOQUEADO">Bloqueado / Crítico</option>
                </select>
              </div>
            </div>

            {/* Campo de Busca Veicular */}
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input
                type="text"
                value={searchVehicleQuery}
                onChange={(e) => setSearchVehicleQuery(e.target.value)}
                placeholder="Buscar por placa, condutor ou parecer..."
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.8rem' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. LISTA / TABELA DE REGISTROS (FIR vs VEICULAR) */}
      {activeSubTab === 'FIR' ? (
        <div className="card-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Fichas de Inspeção Cadastradas ({filteredChecklists.length})
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Registros históricos oficiais conforme formulário Survey123 FIR - R0
              </p>
            </div>

            <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
              Exibindo {filteredChecklists.length} de {checklists.length} inspeções
            </span>
          </div>

          {filteredChecklists.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ClipboardCheck size={40} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Nenhuma ficha de inspeção encontrada com os filtros selecionados.</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
                Ajuste os filtros acima ou clique em "+ Nova Ficha de Inspeção" para registrar.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredChecklists.map(item => (
                <div
                  key={item.id}
                  className="card-panel card-panel-interactive"
                  style={{
                    padding: '1.15rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                          {item.id}
                        </span>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {item.estrutura}
                        </h3>
                        <span className={`badge-status ${item.badgeClass || 'badge-normal'}`} style={{ fontSize: '0.7rem' }}>
                          {item.classificacaoGeral || item.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={13} style={{ color: 'var(--primary-accent)' }} />
                          {item.data} às {item.hora || '10:00'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <UserCheck size={13} style={{ color: '#10b981' }} />
                          {item.profissional}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CloudRain size={13} style={{ color: 'var(--geo-info)' }} />
                          {item.condicoesClimaticas} ({item.volumeAcumulado || 0} mm)
                        </span>
                        {item.lat && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <MapPin size={13} style={{ color: 'var(--text-faint)' }} />
                            GPS: {item.lat.toFixed(4)}, {item.lon.toFixed(4)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => setSelectedInspectionDetail(item)}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                      >
                        <Eye size={14} />
                        <span>Ver Ficha Completa</span>
                      </button>
                      
                      <button
                        onClick={() => deleteChecklist(item.id)}
                        className="btn-ghost"
                        style={{ padding: '0.4rem', color: 'var(--text-faint)' }}
                        title="Excluir ficha de inspeção"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Resumo dos Itens Críticos do Formulário */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.6rem',
                    marginTop: '0.85rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Acessos:</span>{' '}
                      <strong style={{ color: item.acessos === 'Bom' ? 'var(--geo-normal)' : 'var(--geo-atencao)' }}>{item.acessos}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Maciço:</span>{' '}
                      <strong style={{ color: item.macicoCondicoesEstruturais === 'Não detectado' ? 'var(--geo-normal)' : 'var(--geo-atencao)' }}>
                        {item.macicoCondicoesEstruturais === 'Não detectado' ? 'Estável / Sem trincas' : 'Atenção Operacional'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Drenagem Superficial:</span>{' '}
                      <strong style={{ color: item.drenagemSuperficial === 'Não' ? 'var(--geo-normal)' : 'var(--geo-atencao)' }}>
                        {item.drenagemSuperficial === 'Não' ? 'Desobstruída' : 'Obstrução Detectada'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Drenagem Interna:</span>{' '}
                      <strong style={{ color: 'var(--geo-normal)' }}>{item.drenagemInterna}</strong>
                    </div>
                  </div>

                  {item.observacoesFinais && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                      "{item.observacoesFinais}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="card-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Truck size={18} style={{ color: 'var(--primary-accent)' }} />
                Checklists Veiculares Cadastrados ({filteredVehicleChecklists.length})
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Inspeções diárias oficiais de segurança veicular (Survey123 Itaminas Frota)
              </p>
            </div>

            <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
              Exibindo {filteredVehicleChecklists.length} de {vehicleChecklists.length} checklists
            </span>
          </div>

          {filteredVehicleChecklists.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Truck size={40} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Nenhum checklist veicular encontrado com os filtros selecionados.</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
                Ajuste os filtros ou clique em "+ Novo Checklist Veicular" para registrar.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredVehicleChecklists.map(item => (
                <div
                  key={item.id}
                  className="card-panel card-panel-interactive"
                  style={{
                    padding: '1.15rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                          {item.id}
                        </span>
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          backgroundColor: 'rgba(2, 132, 199, 0.15)',
                          color: 'var(--primary-accent)',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(2, 132, 199, 0.3)',
                          letterSpacing: '0.04em'
                        }}>
                          {item.placa}
                        </span>
                        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {item.modeloVeiculo || 'Veículo Operacional'}
                        </h3>
                        <span className={`badge-status ${item.badgeClass || 'badge-normal'}`} style={{ fontSize: '0.7rem' }}>
                          {item.status || 'LIBERADO'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={13} style={{ color: 'var(--primary-accent)' }} />
                          {item.data} às {item.hora || '07:30'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <UserCheck size={13} style={{ color: '#10b981' }} />
                          Condutor: <strong>{item.condutor}</strong>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Gauge size={13} style={{ color: 'var(--geo-atencao)' }} />
                          <strong>{item.hod_metro_km_atual?.toLocaleString('pt-BR')} km</strong>
                        </span>
                        {item.lat && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <MapPin size={13} style={{ color: 'var(--text-faint)' }} />
                            {item.localizacaoNome || `${item.lat.toFixed(4)}, ${item.lon.toFixed(4)}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <a
                        href={item.linkSurvey || 'https://arcg.is/0DuT4L1'}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                        title="Abrir no ArcGIS Survey123 (https://arcg.is/0DuT4L1)"
                      >
                        <ExternalLink size={13} />
                        <span className="hide-mobile">Survey123</span>
                      </a>

                      <button
                        onClick={() => setSelectedVehicleDetail(item)}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                      >
                        <Eye size={14} />
                        <span>Ver Ficha Completa</span>
                      </button>
                      
                      <button
                        onClick={() => deleteVehicleChecklist(item.id)}
                        className="btn-ghost"
                        style={{ padding: '0.4rem', color: 'var(--text-faint)' }}
                        title="Excluir checklist veicular"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Resumo dos Itens de Segurança e Condições Gerais */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '0.6rem',
                    marginTop: '0.85rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Freios:</span>{' '}
                      <strong style={{ color: item.itensSeguranca?.freios === 'OK' ? 'var(--geo-normal)' : (item.itensSeguranca?.freios === 'Atenção' ? 'var(--geo-atencao)' : '#ef4444') }}>
                        {item.itensSeguranca?.freios || 'OK'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Pneus / Estepe:</span>{' '}
                      <strong style={{ color: item.itensSeguranca?.pneusEstepe === 'OK' ? 'var(--geo-normal)' : 'var(--geo-atencao)' }}>
                        {item.itensSeguranca?.pneusEstepe || 'OK'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Cintos de Segurança:</span>{' '}
                      <strong style={{ color: item.itensSeguranca?.cintosSeguranca === 'OK' ? 'var(--geo-normal)' : '#ef4444' }}>
                        {item.itensSeguranca?.cintosSeguranca || 'OK'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-faint)' }}>Nível Óleo Motor:</span>{' '}
                      <strong style={{ color: item.condicoesGerais?.nivelOleoMotor === 'OK' ? 'var(--geo-normal)' : 'var(--geo-atencao)' }}>
                        {item.condicoesGerais?.nivelOleoMotor || 'OK'}
                      </strong>
                    </div>
                  </div>

                  {item.descreva_aqui && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                      "{item.descreva_aqui}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MODAL: FORMULÁRIO DE NOVA INSPEÇÃO REGULAR (SURVEY123)     */}
      {/* ============================================================ */}
      {isFormOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsFormOpen(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}
          >
            {/* Header do Modal */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ITAMINAS COMÉRCIO DE MINÉRIOS S.A • SARZEDO/MG
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  Formulário de Inspeção Regular - FIR - R0
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Padrão oficial Survey123 (Portaria ANM nº 95/2022)
                </span>
              </div>

              <button onClick={() => setIsFormOpen(false)} className="btn-ghost" style={{ padding: '0.4rem' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* SEÇÃO 1: INFORMAÇÕES GERAIS */}
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building2 size={16} style={{ color: 'var(--primary-accent)' }} />
                  Página 1 — Informações Gerais
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Estrutura Inspecionada *
                    </label>
                    <select
                      value={formData.estrutura}
                      onChange={(e) => setFormData(prev => ({ ...prev, estrutura: e.target.value }))}
                      className="form-select"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                      required
                    >
                      {SURVEY123_STRUCTURES.map((st, idx) => (
                        <option key={idx} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Data da Inspeção *
                    </label>
                    <input
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                      className="form-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Profissional Responsável (CREA/CFT) *
                    </label>
                    <input
                      type="text"
                      value={formData.profissional}
                      onChange={(e) => setFormData(prev => ({ ...prev, profissional: e.target.value }))}
                      className="form-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Condições Climáticas *
                    </label>
                    <select
                      value={formData.condicoesClimaticas}
                      onChange={(e) => setFormData(prev => ({ ...prev, condicoesClimaticas: e.target.value }))}
                      className="form-select"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    >
                      <option value="Ensolarado">Ensolarado</option>
                      <option value="Parcialmente Nublado">Parcialmente Nublado</option>
                      <option value="Nublado">Nublado</option>
                      <option value="Chuvoso">Chuvoso</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Volume Acumulado (mm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.volumeAcumulado}
                      onChange={(e) => setFormData(prev => ({ ...prev, volumeAcumulado: parseFloat(e.target.value) || 0 }))}
                      className="form-input"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Coordenadas GPS (Lat / Lon)
                    </label>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <input
                        type="text"
                        readOnly
                        value={`${formData.lat}, ${formData.lon}`}
                        className="form-input font-mono"
                        style={{ width: '100%', fontSize: '0.78rem', backgroundColor: 'var(--bg-surface)' }}
                      />
                      <button
                        type="button"
                        onClick={handleGetGps}
                        className="btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', whiteSpace: 'nowrap' }}
                      >
                        Obter GPS
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: MACIÇO, OMBREIRAS E ACESSOS */}
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layers size={16} style={{ color: '#10b981' }} />
                  Páginas 2 & 3 — Acessos, Maciço e Ombreiras
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Avaliação dos Acessos
                    </label>
                    <select
                      value={formData.acessos}
                      onChange={(e) => setFormData(prev => ({ ...prev, acessos: e.target.value }))}
                      className="form-select"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    >
                      <option value="Bom">Bom (Tráfego Livre)</option>
                      <option value="Regular">Regular (Pequenos Atolamentos/Pedras)</option>
                      <option value="Ruim">Ruim (Intransitável / Erosões)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Condições Estruturais (Trincas / Recalques)
                    </label>
                    <select
                      value={formData.macicoCondicoesEstruturais}
                      onChange={(e) => setFormData(prev => ({ ...prev, macicoCondicoesEstruturais: e.target.value }))}
                      className="form-select"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    >
                      <option value="Não detectado">Não detectado (Normal)</option>
                      <option value="Trincas superficiais leves">Trincas superficiais leves</option>
                      <option value="Fissuras longitudinais em crista">Fissuras longitudinais em crista</option>
                      <option value="Recalque / Deformação evidente">Recalque / Deformação evidente</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Condições Visuais (Surgências / Percolação)
                    </label>
                    <select
                      value={formData.macicoCondicoesVisuais}
                      onChange={(e) => setFormData(prev => ({ ...prev, macicoCondicoesVisuais: e.target.value }))}
                      className="form-select"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    >
                      <option value="Não detectado">Não detectado (Seco)</option>
                      <option value="Umidade pontual no talude">Umidade pontual no talude</option>
                      <option value="Surgência com água límpida">Surgência com água límpida</option>
                      <option value="Surgência com carreamento de finos">Surgência com carreamento de finos</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Observações do Maciço e Acessos
                  </label>
                  <textarea
                    rows={2}
                    value={formData.macicoObs}
                    onChange={(e) => setFormData(prev => ({ ...prev, macicoObs: e.target.value }))}
                    placeholder="Descreva detalhes de bermas, taludes, vegetação ou trincas observadas..."
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              {/* SEÇÃO 3: DRENAGENS E RESERVATÓRIO */}
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Droplets size={16} style={{ color: '#06b6d4' }} />
                  Páginas 4, 5 & 6 — Drenagens, Reservatório e Instrumentação
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Obstrução Drenagem Superficial
                    </label>
                    <select
                      value={formData.drenagemSuperficial}
                      onChange={(e) => setFormData(prev => ({ ...prev, drenagemSuperficial: e.target.value }))}
                      className="form-select"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    >
                      <option value="Não">Não (Desobstruída)</option>
                      <option value="Sim">Sim (Obstruída)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Drenagem Interna / Dreno de Pé
                    </label>
                    <select
                      value={formData.drenagemInterna}
                      onChange={(e) => setFormData(prev => ({ ...prev, drenagemInterna: e.target.value }))}
                      className="form-select"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    >
                      <option value="Operando Normal">Operando Normal (Vazão Contínua e Límpida)</option>
                      <option value="Vazão Elevada">Vazão Elevada</option>
                      <option value="Água Turva / Sedimentos">Água Turva / Presença de Sedimentos</option>
                      <option value="Seco">Seco</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Estado da Instrumentação (PZ, INA, VT)
                    </label>
                    <select
                      value={formData.instrumentacao}
                      onChange={(e) => setFormData(prev => ({ ...prev, instrumentacao: e.target.value }))}
                      className="form-select"
                      style={{ width: '100%', fontSize: '0.82rem' }}
                    >
                      <option value="Operando Normalmente">Operando Normalmente</option>
                      <option value="Necessita Manutenção / Calibração">Necessita Manutenção / Calibração</option>
                      <option value="Danificado / Obstruído">Danificado / Obstruído</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 4: ESTADO DE CONSERVAÇÃO E CONCLUSÃO */}
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} style={{ color: '#f59e0b' }} />
                  Página 9 — Estado de Conservação Geral (Matriz ANM)
                </h3>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Classificação Final do Estado de Conservação *
                  </label>
                  <select
                    value={formData.classificacaoGeral}
                    onChange={(e) => setFormData(prev => ({ ...prev, classificacaoGeral: e.target.value }))}
                    className="form-select"
                    style={{ width: '100%', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    <option value="Conforme / Nível Normal">Conforme / Nível Normal (Estável)</option>
                    <option value="Atenção Operacional">Atenção Operacional (Vigilância Aumentada)</option>
                    <option value="Alerta Geotécnico">Alerta Geotécnico (Inspeção Diária Obrigatória)</option>
                    <option value="Emergência (PAEBM)">Emergência (Acionar PAEBM Imediately)</option>
                  </select>
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Parecer Técnico & Ações Recomendadas
                  </label>
                  <textarea
                    rows={3}
                    value={formData.observacoesFinais}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoesFinais: e.target.value }))}
                    placeholder="Parecer conclusivo do técnico/engenheiro sobre a estabilidade e ações recomendadas..."
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  />
                </div>

                {/* Upload de Foto */}
                <div style={{ marginTop: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Registro Fotográfico da Inspeção (Evidência de Campo)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                      <Camera size={15} />
                      <span>{formData.fotoUrl ? 'Alterar Foto' : 'Tirar ou Selecionar Foto'}</span>
                      <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                    </label>
                    {formData.fotoUrl && (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Foto anexada com sucesso!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões do Rodapé do Formulário */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem' }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700 }}
                >
                  <ClipboardCheck size={16} />
                  <span>Salvar Ficha de Inspeção (FIR)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. MODAL: VISUALIZAÇÃO DETALHADA DA FICHA SELECIONADA          */}
      {/* ============================================================ */}
      {selectedInspectionDetail && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setSelectedInspectionDetail(null)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '2px solid var(--border-medium)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-accent)', letterSpacing: '0.05em' }}>
                  MDSYNC • REGISTRO DE INSPEÇÃO REGULAR SURVEY123
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {selectedInspectionDetail.id} — {selectedInspectionDetail.estrutura}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Data: <strong>{selectedInspectionDetail.data} ({selectedInspectionDetail.hora})</strong> • Inspetor: <strong>{selectedInspectionDetail.profissional}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`badge-status ${selectedInspectionDetail.badgeClass || 'badge-normal'}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                  {selectedInspectionDetail.classificacaoGeral}
                </span>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                  Portaria ANM 95/2022
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <span style={{ color: 'var(--text-faint)' }}>Clima / Chuva:</span>{' '}
                  <strong>{selectedInspectionDetail.condicoesClimaticas} ({selectedInspectionDetail.volumeAcumulado} mm)</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-faint)' }}>Vazão Aferida:</span>{' '}
                  <strong>{selectedInspectionDetail.vazaoHm} L/s</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-faint)' }}>Localização:</span>{' '}
                  <strong>{selectedInspectionDetail.lat?.toFixed(4)}, {selectedInspectionDetail.lon?.toFixed(4)}</strong>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Maciço, Taludes e Acessos
                </h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {selectedInspectionDetail.macicoObs || 'Taludes e bermas estáveis. Ausência de anomalias críticas ou deformações superficiais.'}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Drenagens e Percolação
                </h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {selectedInspectionDetail.drenagemObs || 'Dispositivos de drenagem superficial e drenos de pé desobstruídos e operando com água límpida.'}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Conclusão e Recomendações
                </h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {selectedInspectionDetail.observacoesFinais}
                </p>
              </div>

              {selectedInspectionDetail.acoesRecomendadas && (
                <div style={{ backgroundColor: 'rgba(2, 132, 199, 0.08)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
                  <strong style={{ color: 'var(--primary-accent)', display: 'block', marginBottom: '0.25rem' }}>Plano de Ação:</strong>
                  <span style={{ color: 'var(--text-main)' }}>{selectedInspectionDetail.acoesRecomendadas}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <a
                href={selectedInspectionDetail.linkSurvey || 'https://arcg.is/0yOmKX0'}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ExternalLink size={14} />
                <span>Abrir no Survey123</span>
              </a>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => window.print()}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Printer size={14} />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => setSelectedInspectionDetail(null)}
                  className="btn-primary"
                  style={{ fontSize: '0.78rem' }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Novo Checklist Veicular */}
      <VehicleChecklistModal
        isOpen={isVehicleFormOpen}
        onClose={() => setIsVehicleFormOpen(false)}
        onSave={addVehicleChecklist}
        currentUser={currentUser}
      />

      {/* Modal de Detalhes do Checklist Veicular */}
      <VehicleChecklistDetailModal
        item={selectedVehicleDetail}
        onClose={() => setSelectedVehicleDetail(null)}
      />

    </div>
  );
};

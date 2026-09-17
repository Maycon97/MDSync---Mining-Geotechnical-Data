import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGeotechData } from '../context/GeotechDataContext';
import { storageService } from '../services/storageService';
import { 
  X, 
  LayoutDashboard, 
  LineChart, 
  ClipboardEdit, 
  FolderInput, 
  Wrench, 
  Layers, 
  Building2, 
  Briefcase, 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  MapPin, 
  ClipboardCheck, 
  LifeBuoy, 
  Droplets, 
  FileText, 
  Cpu, 
  Database,
  CheckCircle2,
  Clock,
  Send,
  Award,
  Box,
  Smartphone,
  CloudLightning,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  LogIn,
  UserCheck,
  Download,
  RotateCcw,
  Sparkles,
  UserCog
} from 'lucide-react';

export const SideDrawer = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  onSelectTab, 
  onOpenEditProfile,
  onEditProfile,
  onOpenReport,
  onOpenSync,
  onOpenAuth,
  onOpenChecklist
}) => {
  const { currentUser, currentRole, currentRoleKey, changeRole, allRoles } = useAuth();
  const { 
    coletas = [], 
    ordensServico = [], 
    contratosTerceiros = [], 
    fluigTickets = [], 
    offlineCount = 0,
    isOnline,
    toggleSimulatedOffline
  } = useGeotechData();

  const [theme, setTheme] = useState(() => storageService.getTheme());
  const [roleSelectorOpen, setRoleSelectorOpen] = useState(false);
  const [coletasExpanded, setColetasExpanded] = useState(true);

  // Lista dinâmica ordenada pelo mais recente (LRU / Most Recently Used)
  const [recentUsage, setRecentUsage] = useState(() => {
    try {
      const saved = localStorage.getItem('mdsync_recent_menu_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    storageService.setTheme(nextTheme);
  };

  // Contadores dinâmicos para badges
  const coletasConcluidasCount = coletas.filter(c => c.status === 'CONCLUIDA').length;
  const coletasPreenchimentoCount = coletas.filter(c => c.status === 'EM_PREENCHIMENTO').length;
  const coletasFilaCount = coletas.filter(c => c.status === 'FILA_INTEGRACAO').length;
  const osAbertasCount = ordensServico.filter(o => o.status !== 'CONCLUIDA').length;
  const contratosVigentesCount = contratosTerceiros.length;
  const chamadosAbertosCount = fluigTickets.filter(t => t.status !== 'CONCLUIDO').length;

  // Registrar uso de um item para colocá-lo no topo
  const recordUsage = (itemId) => {
    setRecentUsage(prev => {
      const filtered = prev.filter(id => id !== itemId);
      const updated = [itemId, ...filtered];
      try {
        localStorage.setItem('mdsync_recent_menu_ids', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const resetUsageOrder = () => {
    setRecentUsage([]);
    try {
      localStorage.removeItem('mdsync_recent_menu_ids');
    } catch (e) {}
  };

  const handleNav = (tabId, subTab = null) => {
    if (tabId === 'laudo' && onOpenReport) {
      onOpenReport();
    } else if (tabId === 'checklist' && onOpenChecklist) {
      onSelectTab('checklist');
    } else {
      onSelectTab(tabId, subTab);
    }
    onClose();
  };

  const handleEditProfileClick = () => {
    recordUsage('configuracoes_perfil');
    handleNav('configuracoes_perfil');
  };

  /* ============================================================
     CATÁLOGO BASE DOS 19 MÓDULOS E AÇÕES
     ============================================================ */
  const baseMenuItems = [
    {
      id: 'analises',
      title: 'Análises',
      icon: LineChart,
      iconColor: '#a78bfa',
      type: 'tab',
      tabId: 'analises'
    },
    {
      id: 'baixar_apk',
      title: 'Baixar APK Android',
      subtitle: 'Instalador 4.3 MB',
      icon: Smartphone,
      iconColor: '#10b981',
      type: 'link',
      href: './mdsync-geotecnia.apk',
      download: 'mdsync-geotecnia.apk'
    },
    {
      id: 'cadastro',
      title: 'Cadastro & Limites',
      icon: Database,
      iconColor: '#cbd5e1',
      type: 'tab',
      tabId: 'cadastro'
    },
    {
      id: 'chamados',
      title: 'Chamados (TOTVS Fluig)',
      icon: LifeBuoy,
      iconColor: '#38bdf8',
      type: 'tab',
      tabId: 'chamados',
      badge: chamadosAbertosCount > 0 ? chamadosAbertosCount : null,
      badgeColor: '#38bdf8'
    },
    {
      id: 'checklist',
      title: 'CheckList (Survey123 FIR)',
      icon: ClipboardCheck,
      iconColor: '#34d399',
      type: 'tab',
      tabId: 'checklist'
    },
    {
      id: 'clientes',
      title: 'Clientes',
      icon: Building2,
      iconColor: '#38bdf8',
      type: 'tab',
      tabId: 'clientes'
    },
    {
      id: 'coletas',
      title: 'Coletas',
      icon: ClipboardEdit,
      iconColor: '#fbbf24',
      type: 'collapsible_coletas',
      badge: coletas.length,
      badgeColor: '#fbbf24'
    },
    {
      id: 'contratos',
      title: 'Contratos de Terceiros',
      icon: Briefcase,
      iconColor: '#4ade80',
      type: 'tab',
      tabId: 'contratos',
      badge: contratosVigentesCount,
      badgeColor: '#4ade80'
    },
    {
      id: 'configuracoes_perfil',
      title: 'Configurações de Perfil',
      subtitle: 'Credenciais & RBAC',
      icon: UserCog,
      iconColor: '#38bdf8',
      type: 'tab',
      tabId: 'configuracoes_perfil'
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      iconColor: '#38bdf8',
      type: 'tab',
      tabId: 'home'
    },
    {
      id: 'fila_sync',
      title: 'Fila de Sincronização',
      icon: CloudLightning,
      iconColor: offlineCount > 0 ? '#f59e0b' : '#94a3b8',
      type: 'action',
      action: () => {
        onClose();
        if (onOpenSync) onOpenSync();
      },
      badge: offlineCount > 0 ? offlineCount : null,
      badgeColor: '#f59e0b'
    },
    {
      id: 'mapa',
      title: 'Georreferenciamento (Mapa)',
      icon: MapPin,
      iconColor: '#10b981',
      type: 'tab',
      tabId: 'mapa'
    },
    {
      id: 'ia',
      title: 'IA & Estabilidade (Geotinho)',
      icon: Cpu,
      iconColor: '#c084fc',
      type: 'tab',
      tabId: 'ia'
    },
    {
      id: 'importacoes',
      title: 'Importações (PCMI)',
      icon: FolderInput,
      iconColor: '#34d399',
      type: 'tab',
      tabId: 'importacoes'
    },
    {
      id: 'laudo',
      title: 'Laudo ANM nº 95/2022',
      icon: FileText,
      iconColor: '#60a5fa',
      type: 'tab',
      tabId: 'laudo'
    },
    {
      id: 'lotes_relatorios',
      title: 'Lotes de Relatórios',
      icon: Layers,
      iconColor: '#60a5fa',
      type: 'tab',
      tabId: 'lotes_relatorios'
    },
    {
      id: 'ordens_servico',
      title: 'Ordens de Serviço',
      icon: Wrench,
      iconColor: '#f97316',
      type: 'tab',
      tabId: 'ordens_servico',
      badge: osAbertasCount > 0 ? osAbertasCount : null,
      badgeColor: '#f97316'
    },
    {
      id: 'piezometria',
      title: 'Piezometria & NA',
      icon: LineChart,
      iconColor: '#f59e0b',
      type: 'tab',
      tabId: 'piezometria'
    },
    {
      id: 'vazao',
      title: 'Vazão & Vertedouros',
      icon: Droplets,
      iconColor: '#0284c7',
      type: 'tab',
      tabId: 'vazao'
    },
    {
      id: '3d',
      title: 'Visualizador 3D (Spline)',
      icon: Box,
      iconColor: '#ec4899',
      type: 'tab',
      tabId: '3d'
    }
  ];

  /* ============================================================
     ORDENAÇÃO FLEXÍVEL: O ÚLTIMO USADO FICA PRIMEIRO (TOPO)
     ============================================================ */
  const displayMenuItems = useMemo(() => {
    const itemsMap = new Map(baseMenuItems.map(i => [i.id, i]));
    const ordered = [];

    // 1. Itens usados recentemente (do mais recente para o mais antigo)
    recentUsage.forEach(id => {
      if (itemsMap.has(id)) {
        ordered.push({ ...itemsMap.get(id), isRecent: true });
        itemsMap.delete(id);
      }
    });

    // 2. Itens restantes ordenados alfabeticamente
    const remaining = Array.from(itemsMap.values()).sort((a, b) => a.title.localeCompare(b.title));
    remaining.forEach(item => {
      ordered.push({ ...item, isRecent: false });
    });

    return ordered;
  }, [recentUsage, coletas.length, contratosVigentesCount, chamadosAbertosCount, offlineCount, osAbertasCount]);

  if (!isOpen) return null;

  return (
    <div 
      className="drawer-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 11, 26, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1300,
        display: 'flex',
      }}
      onClick={onClose}
    >
      <div 
        className="drawer-3d-panel drawer-container"
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '360px',
          maxWidth: '88vw',
          height: '100%',
        }}
      >
        {/* ============================================================
            1. CABEÇALHO DO MDSYNC (MENOS ARREDONDADO / INDUSTRIAL)
            ============================================================ */}
        <div style={{
          padding: '1.15rem 1.15rem 0.95rem',
          background: 'linear-gradient(180deg, rgba(2, 132, 199, 0.22) 0%, rgba(15, 23, 42, 0.4) 100%)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          position: 'relative'
        }}>
          {/* Botão Fechar Menos Arredondado (4px) */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.2))',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
              transition: 'transform 0.15s ease'
            }}
            title="Fechar Menu"
          >
            <X size={18} />
          </button>

          {/* Logo & Marca Oficial MDSync */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(2, 132, 199, 0.1))',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
            }}>
              <img 
                src="./logo_mdsync_icon.png" 
                alt="MDSync Logo" 
                style={{ 
                  height: '34px', 
                  width: '34px', 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 8px rgba(56, 189, 248, 0.4))'
                }} 
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ 
                  fontWeight: 800, 
                  fontSize: '1.25rem', 
                  letterSpacing: '-0.02em', 
                  color: '#ffffff',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                }}>
                  MDSync
                </span>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 700, 
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                  color: '#ffffff', 
                  padding: '0.12rem 0.4rem', 
                  borderRadius: '3px',
                  border: '1px solid rgba(125, 211, 252, 0.4)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}>
                  v2.0 GEOTEC
                </span>
              </div>
              <p style={{ 
                fontSize: '0.65rem', 
                fontWeight: 600, 
                color: 'rgba(255, 255, 255, 0.65)', 
                letterSpacing: '0.04em', 
                textTransform: 'uppercase', 
                margin: '2px 0 0 0' 
              }}>
                MINING | GEOTECHNICS | DATA PLATFORM
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================
            2. PERFIL DO USUÁRIO & AÇÕES RÁPIDAS (MENOS ARREDONDADO: 6px)
            ============================================================ */}
        <div style={{ padding: '0.75rem 0.95rem 0.4rem' }}>
          <div className="card-3d-drawer" style={{ padding: '0.85rem' }}>
            
            {/* Foto, Nome e Cargo */}
            <div 
              onClick={handleEditProfileClick}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
              title="Abrir Configurações de Perfil"
            >
              <div style={{
                position: 'relative',
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                padding: '2px',
                border: '1.5px solid #10b981',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                background: 'linear-gradient(145deg, #1e3a8a, #0f172a)'
              }}>
                {currentUser?.foto ? (
                  <img 
                    src={currentUser.foto} 
                    alt={currentUser.nome} 
                    style={{ width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '6px',
                    backgroundColor: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#ffffff'
                  }}>
                    {currentUser?.avatar || currentUser?.nome?.charAt(0) || 'M'}
                  </div>
                )}
                {/* Ponto de status online */}
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '11px',
                  height: '11px',
                  borderRadius: '3px',
                  backgroundColor: '#10b981',
                  border: '1.5px solid #0f172a'
                }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 700, 
                  margin: 0, 
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {currentUser?.nome || 'Eng. Geotécnico'}
                </h4>
                <p style={{ 
                  fontSize: '0.72rem', 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  margin: '1px 0 3px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {currentUser?.email || 'operacao@itaminas.com.br'}
                </p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#38bdf8'
                }}>
                  <Award size={10} />
                  <span>{currentRole?.title || currentUser?.badge || 'Engenharia'}</span>
                </div>
              </div>
            </div>

            {/* Ações de Perfil: Editar Perfil / Trocar Perfil */}
            <div style={{ 
              display: 'flex', 
              gap: '0.4rem', 
              marginTop: '0.65rem', 
              paddingTop: '0.55rem', 
              borderTop: '1px solid rgba(255, 255, 255, 0.08)' 
            }}>
              <button
                onClick={handleEditProfileClick}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '4px',
                  color: '#34d399',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.35rem 0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={11} />
                <span>Perfil</span>
              </button>

              <button
                onClick={() => setRoleSelectorOpen(!roleSelectorOpen)}
                style={{
                  flex: 1,
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '4px',
                  color: '#38bdf8',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.35rem 0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer'
                }}
              >
                <UserCheck size={11} />
                <span>Cargo</span>
                <ChevronDown size={11} />
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth('login');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '4px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.35rem 0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer'
                }}
                title="Login / Alternar Usuário"
              >
                <LogIn size={11} />
              </button>
            </div>

            {/* Dropdown de Cargos Operacionais */}
            {roleSelectorOpen && allRoles && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.4rem',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem'
              }}>
                {Object.keys(allRoles).map(rKey => {
                  const roleObj = allRoles[rKey];
                  const isCur = currentRoleKey === rKey;
                  return (
                    <div
                      key={rKey}
                      onClick={() => {
                        changeRole(rKey);
                        setRoleSelectorOpen(false);
                      }}
                      style={{
                        padding: '0.35rem 0.5rem',
                        borderRadius: '3px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isCur ? 'rgba(2, 132, 199, 0.3)' : 'transparent',
                        color: isCur ? '#38bdf8' : 'rgba(255, 255, 255, 0.8)',
                        fontWeight: isCur ? 700 : 500
                      }}
                    >
                      <span>{roleObj.title}</span>
                      {isCur && <CheckCircle2 size={12} style={{ color: '#38bdf8' }} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Controles Rápidos: Tema & Status de Conexão */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              marginTop: '0.65rem',
              paddingTop: '0.55rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {/* Botão de Tema 3D */}
              <button
                onClick={toggleTheme}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.5rem',
                  borderRadius: '4px',
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(0,0,0,0.2))',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.25)'
                }}
                title={`Alternar para tema ${theme === 'dark' ? 'Claro' : 'Escuro'}`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={13} style={{ color: '#f59e0b' }} />
                    <span>Claro</span>
                  </>
                ) : (
                  <>
                    <Moon size={13} style={{ color: '#38bdf8' }} />
                    <span>Escuro</span>
                  </>
                )}
              </button>

              {/* Botão de Conexão Online/Offline 3D */}
              <button
                onClick={toggleSimulatedOffline}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.5rem',
                  borderRadius: '4px',
                  background: isOnline 
                    ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.15))' 
                    : 'linear-gradient(145deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.15))',
                  border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                  color: isOnline ? '#34d399' : '#fbbf24',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.25)'
                }}
                title={isOnline ? 'Conexão ativa. Clique para simular offline' : 'Modo offline. Clique para reconectar'}
              >
                {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
                <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* ============================================================
            3. LISTA DINÂMICA FLEXÍVEL: ÚLTIMO USADO PRIMEIRO (TOPO)
            ============================================================ */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.4rem 0.95rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.28rem'
        }}>
          {/* Barra de controle de ordenação dinâmica */}
          <div style={{ 
            fontSize: '0.65rem', 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            color: 'rgba(255, 255, 255, 0.45)', 
            letterSpacing: '0.05em',
            padding: '0.2rem 0.3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '0.35rem',
            marginBottom: '0.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: '#38bdf8' }}>⚡</span>
              <span>ORDENADO PELO ÚLTIMO ACESSO</span>
            </div>
            {recentUsage.length > 0 && (
              <button
                onClick={resetUsageOrder}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.45)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '2px 4px',
                  borderRadius: '3px'
                }}
                title="Restaurar ordem alfabética padrão"
              >
                <RotateCcw size={10} />
                <span>Resetar A-Z</span>
              </button>
            )}
          </div>

          {displayMenuItems.map((item, index) => {
            const ItemIcon = item.icon;
            const isTabActive = item.tabId && (activeTab === item.tabId || (item.tabId === 'home' && activeTab === 'dashboard'));
            const isMostRecent = index === 0 && recentUsage.length > 0 && recentUsage[0] === item.id;

            return (
              <div key={item.id}>
                {/* Tipo: Link Externo / Download (ex: Baixar APK) */}
                {item.type === 'link' && (
                  <a
                    href={item.href}
                    download={item.download}
                    onClick={() => recordUsage(item.id)}
                    className="nav-item-3d"
                    title={item.title}
                  >
                    <ItemIcon size={16} style={{ color: item.iconColor }} />
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600 }}>{item.title}</span>
                        {isMostRecent && (
                          <span className="recent-tag-3d">Último Usado</span>
                        )}
                      </div>
                      {item.subtitle && (
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                    <Download size={13} style={{ color: item.iconColor, opacity: 0.8 }} />
                  </a>
                )}

                {/* Tipo: Ação Especial (ex: Fila de Sincronização) */}
                {item.type === 'action' && (
                  <button
                    onClick={() => {
                      recordUsage(item.id);
                      item.action();
                    }}
                    className="nav-item-3d"
                    title={item.title}
                  >
                    <ItemIcon size={16} style={{ color: item.iconColor }} />
                    <div style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 600 }}>{item.title}</span>
                      {isMostRecent && (
                        <span className="recent-tag-3d">Último Usado</span>
                      )}
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span style={{
                        backgroundColor: `${item.badgeColor}25`,
                        color: item.badgeColor,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '3px',
                        border: `1px solid ${item.badgeColor}45`
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )}

                {/* Tipo: Coletas com Sub-abas Retráteis */}
                {item.type === 'collapsible_coletas' && (
                  <div>
                    <div 
                      onClick={() => {
                        recordUsage(item.id);
                        setColetasExpanded(!coletasExpanded);
                      }}
                      className={`nav-item-3d ${activeTab === 'coletas' ? 'active' : ''}`}
                      style={{ justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                        <ItemIcon size={16} style={{ color: item.iconColor }} />
                        <span style={{ textAlign: 'left', fontWeight: activeTab === 'coletas' ? 700 : 600 }}>
                          {item.title}
                        </span>
                        {isMostRecent && (
                          <span className="recent-tag-3d">Último Usado</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{
                          backgroundColor: 'rgba(251, 191, 36, 0.25)',
                          color: '#fbbf24',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '3px'
                        }}>
                          {item.badge}
                        </span>
                        {coletasExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                    </div>

                    {/* Sub-abas de Coletas Menos Arredondadas */}
                    {coletasExpanded && (
                      <div style={{ 
                        paddingLeft: '1.4rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.2rem', 
                        marginTop: '0.2rem',
                        borderLeft: '2px solid rgba(251, 191, 36, 0.3)',
                        marginLeft: '0.85rem'
                      }}>
                        <button
                          onClick={() => {
                            recordUsage(item.id);
                            handleNav('coletas', 'concluidas');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.38rem 0.65rem',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                          }}
                        >
                          <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                          <span style={{ flex: 1 }}>Concluídas</span>
                          <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>
                            {coletasConcluidasCount}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            recordUsage(item.id);
                            handleNav('coletas', 'preenchimento');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.38rem 0.65rem',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                          }}
                        >
                          <Clock size={13} style={{ color: '#fbbf24' }} />
                          <span style={{ flex: 1 }}>Em Preenchimento</span>
                          <span style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 700 }}>
                            {coletasPreenchimentoCount}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            recordUsage(item.id);
                            handleNav('coletas', 'fila');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.38rem 0.65rem',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                          }}
                        >
                          <Send size={13} style={{ color: '#f87171' }} />
                          <span style={{ flex: 1 }}>Fila de Integração</span>
                          <span style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700 }}>
                            {coletasFilaCount}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tipo: Aba Padrão de Navegação */}
                {item.type === 'tab' && (
                  <button
                    onClick={() => {
                      recordUsage(item.id);
                      handleNav(item.tabId);
                    }}
                    className={`nav-item-3d ${isTabActive ? 'active' : ''}`}
                    title={item.title}
                  >
                    <ItemIcon size={16} style={{ color: item.iconColor }} />
                    <div style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: isTabActive ? 700 : 600 }}>
                        {item.title}
                      </span>
                      {isMostRecent && (
                        <span className="recent-tag-3d">Último Usado</span>
                      )}
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span style={{
                        backgroundColor: `${item.badgeColor}25`,
                        color: item.badgeColor,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '3px',
                        border: `1px solid ${item.badgeColor}45`
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ============================================================
            4. RODAPÉ DO MENU LATERAL (CANTO RETO: 0px)
            ============================================================ */}
        <div style={{
          padding: '0.75rem 1.15rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(10, 18, 38, 0.6)',
          fontSize: '0.7rem',
          color: 'rgba(255, 255, 255, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}>
          <span style={{ fontWeight: 600 }}>MDSync v2.0 GEOTEC</span>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>Itaminas Mineração</span>
        </div>

      </div>
    </div>
  );
};

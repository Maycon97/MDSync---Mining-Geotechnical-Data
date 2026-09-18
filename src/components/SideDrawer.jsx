import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGeotechData } from '../context/GeotechDataContext';
import { storageService } from '../services/storageService';
import { 
  X, 
  Search,
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
  MapPin, 
  ClipboardCheck, 
  LifeBuoy, 
  Droplets, 
  FileText, 
  Cpu, 
  Database,
  History,
  CheckCircle2,
  Clock,
  Send,
  Box,
  Smartphone,
  CloudLightning,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  UserCheck,
  Download,
  UserCog,
  Check
} from 'lucide-react';

export const SideDrawer = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  onSelectTab, 
  onOpenReport,
  onOpenSync,
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
  const [searchQuery, setSearchQuery] = useState('');

  // Controle de montagem e animação fluida retrátil com transparência
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen) {
      setShouldRender(true);
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => {
          setIsActive(true);
        });
      });
      return () => {
        cancelAnimationFrame(r1);
      };
    } else {
      setIsActive(false);
      timer = setTimeout(() => {
        setShouldRender(false);
      }, 340); // Tempo para completar o movimento retrátil de saída
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  // Fechar com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    storageService.setTheme(nextTheme);
  };

  // Contadores para badges
  const coletasConcluidasCount = coletas.filter(c => c.status === 'CONCLUIDA').length;
  const coletasPreenchimentoCount = coletas.filter(c => c.status === 'EM_PREENCHIMENTO').length;
  const coletasFilaCount = coletas.filter(c => c.status === 'FILA_INTEGRACAO').length;
  const osAbertasCount = ordensServico.filter(o => o.status !== 'CONCLUIDA').length;
  const contratosVigentesCount = contratosTerceiros.length;
  const chamadosAbertosCount = fluigTickets.filter(t => t.status !== 'CONCLUIDO').length;

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

  /* Catálogo de Módulos Categorizados */
  const menuCategories = useMemo(() => [
    {
      category: 'Monitoramento',
      items: [
        {
          id: 'dashboard',
          title: 'Dashboard Executivo',
          icon: LayoutDashboard,
          type: 'tab',
          tabId: 'home'
        },
        {
          id: 'mapa',
          title: 'Georreferenciamento',
          icon: MapPin,
          type: 'tab',
          tabId: 'mapa'
        },
        {
          id: 'piezometria',
          title: 'Piezometria & NA',
          icon: LineChart,
          type: 'tab',
          tabId: 'piezometria'
        },
        {
          id: 'vazao',
          title: 'Vazão & Vertedouros',
          icon: Droplets,
          type: 'tab',
          tabId: 'vazao'
        },
        {
          id: '3d',
          title: 'Visualizador 3D Spline',
          icon: Box,
          type: 'tab',
          tabId: '3d'
        }
      ]
    },
    {
      category: 'Operação de Campo',
      items: [
        {
          id: 'coletas',
          title: 'Coletas de Campo',
          icon: ClipboardEdit,
          type: 'collapsible_coletas',
          badge: coletas.length,
          badgeColor: '#fbbf24'
        },
        {
          id: 'campo',
          title: 'Coleta em Campo (Inspect)',
          icon: ClipboardEdit,
          type: 'tab',
          tabId: 'campo'
        },
        {
          id: 'checklist',
          title: 'CheckList FIR (Survey123)',
          icon: ClipboardCheck,
          type: 'tab',
          tabId: 'checklist'
        },
        {
          id: 'ordens_servico',
          title: 'Ordens de Serviço',
          icon: Wrench,
          type: 'tab',
          tabId: 'ordens_servico',
          badge: osAbertasCount > 0 ? osAbertasCount : null,
          badgeColor: '#f97316'
        },
        {
          id: 'chamados',
          title: 'Chamados Fluig',
          icon: LifeBuoy,
          type: 'tab',
          tabId: 'chamados',
          badge: chamadosAbertosCount > 0 ? chamadosAbertosCount : null,
          badgeColor: '#38bdf8'
        },
        {
          id: 'fila_sync',
          title: 'Fila de Sincronização',
          icon: CloudLightning,
          type: 'action',
          action: () => {
            onClose();
            if (onOpenSync) onOpenSync();
          },
          badge: offlineCount > 0 ? offlineCount : null,
          badgeColor: '#f59e0b'
        }
      ]
    },
    {
      category: 'Engenharia & Relatórios',
      items: [
        {
          id: 'ia',
          title: 'IA Geotinho (Estabilidade)',
          icon: Cpu,
          type: 'tab',
          tabId: 'ia'
        },
        {
          id: 'laudo',
          title: 'Laudo ANM nº 95/2022',
          icon: FileText,
          type: 'tab',
          tabId: 'laudo'
        },
        {
          id: 'lotes_relatorios',
          title: 'Lotes de Relatórios',
          icon: Layers,
          type: 'tab',
          tabId: 'lotes_relatorios'
        },
        {
          id: 'historico',
          title: 'Histórico de Dados',
          icon: History,
          type: 'tab',
          tabId: 'historico'
        }
      ]
    },
    {
      category: 'Gestão & Sistema',
      items: [
        {
          id: 'cadastro',
          title: 'Cadastro & Limites',
          icon: Database,
          type: 'tab',
          tabId: 'cadastro'
        },
        {
          id: 'clientes',
          title: 'Clientes',
          icon: Building2,
          type: 'tab',
          tabId: 'clientes'
        },
        {
          id: 'contratos',
          title: 'Contratos Terceiros',
          icon: Briefcase,
          type: 'tab',
          tabId: 'contratos',
          badge: contratosVigentesCount > 0 ? contratosVigentesCount : null,
          badgeColor: '#10b981'
        },
        {
          id: 'importacoes',
          title: 'Importações PCMI',
          icon: FolderInput,
          type: 'tab',
          tabId: 'importacoes'
        },
        {
          id: 'configuracoes_perfil',
          title: 'Configurações de Perfil',
          icon: UserCog,
          type: 'tab',
          tabId: 'configuracoes_perfil'
        },
        {
          id: 'baixar_apk',
          title: 'Baixar APK Android',
          icon: Smartphone,
          type: 'link',
          href: 'https://github.com/Maycon97/MDSync---Mining-Geotechnical-Data/releases/latest/download/mdsync-geotecnia.apk',
          download: 'mdsync-geotecnia.apk',
          target: '_blank'
        }
      ]
    }
  ], [
    coletas.length, 
    osAbertasCount, 
    chamadosAbertosCount, 
    offlineCount, 
    contratosVigentesCount, 
    onOpenSync, 
    onClose
  ]);

  // Filtragem da busca
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return menuCategories;

    return menuCategories.map(cat => {
      const matched = cat.items.filter(item => 
        item.title.toLowerCase().includes(q)
      );
      return { ...cat, items: matched };
    }).filter(cat => cat.items.length > 0);
  }, [menuCategories, searchQuery]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`drawer-overlay ${isActive ? 'is-active' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Menu Lateral MDSync"
    >
      <div 
        className={`drawer-clean-panel ${isActive ? 'is-active' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* ============================================================
            1. CABEÇALHO TRANSLÚCIDO CLEAN
            ============================================================ */}
        <div className="drawer-header-clean">
          <div className="drawer-brand-clean">
            <img 
              src="./logo_mdsync_icon.png" 
              alt="MDSync" 
              style={{ height: '24px', width: '24px', objectFit: 'contain' }} 
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  MDSync
                </span>
                <span style={{ 
                  fontSize: '0.6rem', 
                  fontWeight: 600, 
                  backgroundColor: 'var(--primary-accent-bg)', 
                  color: 'var(--primary-accent)', 
                  padding: '0.05rem 0.3rem', 
                  borderRadius: '4px',
                  border: '1px solid rgba(56, 189, 248, 0.2)'
                }}>
                  v2.0
                </span>
              </div>
              <p style={{ fontSize: '0.62rem', color: 'var(--text-faint)', margin: 0, letterSpacing: '0.02em' }}>
                Itaminas Mineração
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="drawer-close-btn"
            title="Fechar (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* ============================================================
            2. CAMPO DE BUSCA TRANSLÚCIDO
            ============================================================ */}
        <div className="drawer-search-wrapper">
          <Search 
            size={13} 
            style={{ 
              position: 'absolute', 
              left: '0.6rem', 
              color: 'var(--text-faint)', 
              pointerEvents: 'none' 
            }} 
          />
          <input
            type="text"
            className="drawer-search-input"
            placeholder="Buscar ferramenta..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="drawer-search-clear"
              title="Limpar busca"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* ============================================================
            3. LISTA DE MÓDULOS CATEGORIZADOS
            ============================================================ */}
        <div className="drawer-clean-scroll">
          {filteredCategories.length === 0 ? (
            <div style={{ 
              padding: '2rem 1rem', 
              textAlign: 'center', 
              color: 'var(--text-faint)',
              fontSize: '0.78rem' 
            }}>
              Nenhum módulo encontrado para "{searchQuery}".
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.category} style={{ marginBottom: '0.35rem' }}>
                {/* Título da Categoria */}
                <div className="drawer-section-title">
                  <span>{cat.category}</span>
                  {searchQuery && (
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-faint)' }}>
                      {cat.items.length}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                  {cat.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isTabActive = item.tabId && (
                      activeTab === item.tabId || 
                      (item.tabId === 'home' && activeTab === 'dashboard')
                    );

                    /* 1. Item Tipo: Link Externo (APK) */
                    if (item.type === 'link') {
                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          download={item.download}
                          target={item.target || '_self'}
                          rel="noopener noreferrer"
                          className="nav-item-clean"
                          title={item.title}
                        >
                          <ItemIcon size={15} style={{ color: 'var(--primary-accent)' }} />
                          <span style={{ flex: 1 }}>{item.title}</span>
                          <Download size={12} style={{ color: 'var(--text-faint)', opacity: 0.8 }} />
                        </a>
                      );
                    }

                    /* 2. Item Tipo: Ação Especial */
                    if (item.type === 'action') {
                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          className="nav-item-clean"
                          title={item.title}
                        >
                          <ItemIcon size={15} style={{ color: item.badge ? '#f59e0b' : 'inherit' }} />
                          <span style={{ flex: 1 }}>{item.title}</span>
                          {item.badge !== null && item.badge !== undefined && (
                            <span 
                              className="badge-pill-clean"
                              style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245, 158, 11, 0.25)'
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    }

                    /* 3. Item Tipo: Coletas Retrátil */
                    if (item.type === 'collapsible_coletas') {
                      return (
                        <div key={item.id}>
                          <button
                            onClick={() => setColetasExpanded(!coletasExpanded)}
                            className={`nav-item-clean ${activeTab === 'coletas' ? 'active' : ''}`}
                            style={{ justifyContent: 'space-between' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1 }}>
                              <ItemIcon size={15} style={{ color: activeTab === 'coletas' ? 'var(--primary-accent)' : 'inherit' }} />
                              <span>{item.title}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span 
                                className="badge-pill-clean"
                                style={{
                                  backgroundColor: 'rgba(251, 191, 36, 0.15)',
                                  color: '#fbbf24',
                                  border: '1px solid rgba(251, 191, 36, 0.25)'
                                }}
                              >
                                {item.badge}
                              </span>
                              {coletasExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </div>
                          </button>

                          {/* Subitens de Coletas */}
                          {coletasExpanded && (
                            <div className="drawer-sublist">
                              <button
                                onClick={() => handleNav('coletas', 'concluidas')}
                                className="drawer-subitem"
                              >
                                <CheckCircle2 size={12} style={{ color: '#10b981' }} />
                                <span style={{ flex: 1 }}>Concluídas</span>
                                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600 }}>
                                  {coletasConcluidasCount}
                                </span>
                              </button>

                              <button
                                onClick={() => handleNav('coletas', 'preenchimento')}
                                className="drawer-subitem"
                              >
                                <Clock size={12} style={{ color: '#fbbf24' }} />
                                <span style={{ flex: 1 }}>Em Preenchimento</span>
                                <span style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 600 }}>
                                  {coletasPreenchimentoCount}
                                </span>
                              </button>

                              <button
                                onClick={() => handleNav('coletas', 'fila')}
                                className="drawer-subitem"
                              >
                                <Send size={12} style={{ color: '#f87171' }} />
                                <span style={{ flex: 1 }}>Fila de Integração</span>
                                <span style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 600 }}>
                                  {coletasFilaCount}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    }

                    /* 4. Item Padrão de Navegação */
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.tabId)}
                        className={`nav-item-clean ${isTabActive ? 'active' : ''}`}
                        title={item.title}
                      >
                        <ItemIcon 
                          size={15} 
                          style={{ 
                            color: isTabActive ? 'var(--primary-accent)' : 'inherit'
                          }} 
                        />
                        <span style={{ flex: 1 }}>{item.title}</span>
                        {item.badge !== null && item.badge !== undefined && (
                          <span 
                            className="badge-pill-clean"
                            style={{
                              backgroundColor: item.badgeColor ? `${item.badgeColor}20` : 'var(--primary-accent-bg)',
                              color: item.badgeColor || 'var(--primary-accent)',
                              border: `1px solid ${item.badgeColor ? `${item.badgeColor}30` : 'transparent'}`
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ============================================================
            4. SELETOR TRANSLÚCIDO DE CARGOS RBAC (QUANDO ABERTO)
            ============================================================ */}
        {roleSelectorOpen && allRoles && (
          <div style={{
            margin: '0 0.65rem 0.4rem',
            padding: '0.35rem',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.15rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ 
              fontSize: '0.62rem', 
              fontWeight: 700, 
              color: 'var(--text-faint)', 
              padding: '0.15rem 0.35rem', 
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Alternar Papel
            </div>
            {Object.keys(allRoles).map(rKey => {
              const roleObj = allRoles[rKey];
              const isCur = currentRoleKey === rKey;
              return (
                <button
                  key={rKey}
                  onClick={() => {
                    changeRole(rKey);
                    setRoleSelectorOpen(false);
                  }}
                  style={{
                    padding: '0.32rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isCur ? 'var(--primary-accent-bg)' : 'transparent',
                    color: isCur ? 'var(--primary-accent)' : 'var(--text-muted)',
                    fontWeight: isCur ? 600 : 400,
                    border: 'none',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.12s ease'
                  }}
                  onMouseEnter={e => {
                    if (!isCur) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onMouseLeave={e => {
                    if (!isCur) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>{roleObj.title}</span>
                  {isCur && <Check size={12} style={{ color: 'var(--primary-accent)' }} />}
                </button>
              );
            })}
          </div>
        )}

        {/* ============================================================
            5. RODAPÉ DO USUÁRIO & AÇÕES RÁPIDAS
            ============================================================ */}
        <div className="drawer-footer-clean">
          <div className="drawer-user-row">
            {/* Card do Usuário */}
            <div 
              onClick={() => handleNav('configuracoes_perfil')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                cursor: 'pointer',
                flex: 1,
                minWidth: 0
              }}
              title="Abrir Configurações de Perfil"
            >
              {/* Avatar com ponto de rede */}
              <div style={{
                position: 'relative',
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                backgroundColor: 'var(--primary-accent-bg)',
                color: 'var(--primary-accent)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.78rem',
                flexShrink: 0
              }}>
                {currentUser?.foto ? (
                  <img 
                    src={currentUser.foto} 
                    alt={currentUser.nome} 
                    style={{ width: '100%', height: '100%', borderRadius: '5px', objectFit: 'cover' }} 
                  />
                ) : (
                  <span>{currentUser?.avatar || currentUser?.nome?.charAt(0) || 'M'}</span>
                )}
                {/* Status Dot */}
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '7.5px',
                  height: '7.5px',
                  borderRadius: '50%',
                  backgroundColor: isOnline ? '#10b981' : '#f59e0b',
                  border: '1.5px solid var(--bg-surface)'
                }} />
              </div>

              {/* Nome e Cargo */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontSize: '0.76rem', 
                  fontWeight: 600, 
                  color: 'var(--text-main)', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {currentUser?.nome || 'Eng. Geotécnico'}
                </div>
                <div style={{ 
                  fontSize: '0.62rem', 
                  color: 'var(--text-faint)', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {currentRole?.title || currentUser?.badge || 'Engenharia'}
                </div>
              </div>
            </div>

            {/* Ações Rápidas: Cargo, Tema, Conexão */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <button
                onClick={() => setRoleSelectorOpen(!roleSelectorOpen)}
                className="drawer-action-btn"
                title="Trocar Papel Operacional (RBAC)"
                style={{
                  backgroundColor: roleSelectorOpen ? 'var(--primary-accent-bg)' : 'transparent',
                  color: roleSelectorOpen ? 'var(--primary-accent)' : 'inherit'
                }}
              >
                <UserCheck size={13} />
              </button>

              <button
                onClick={toggleTheme}
                className="drawer-action-btn"
                title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
              >
                {theme === 'dark' ? (
                  <Sun size={13} style={{ color: '#f59e0b' }} />
                ) : (
                  <Moon size={13} style={{ color: '#38bdf8' }} />
                )}
              </button>

              <button
                onClick={toggleSimulatedOffline}
                className="drawer-action-btn"
                title={isOnline ? 'Online (Clique para simular offline)' : 'Offline (Clique para conectar)'}
              >
                {isOnline ? (
                  <Wifi size={13} style={{ color: '#10b981' }} />
                ) : (
                  <WifiOff size={13} style={{ color: '#f59e0b' }} />
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

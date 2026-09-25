import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Activity, 
  Layers, 
  ClipboardCheck, 
  Wrench, 
  Compass, 
  FileText, 
  ExternalLink, 
  X, 
  RotateCcw, 
  Sliders, 
  ShieldCheck, 
  AlertTriangle, 
  GripVertical, 
  CheckCircle2,
  Droplet,
  Flame,
  ArrowRight
} from 'lucide-react';

/**
 * SysdamEmpreendimentosPanel
 * 
 * Painel flutuante de empreendimentos e estruturas georreferenciadas
 * inspirado na arquitetura oficial do Portal SysDam (/painel/empreendimentos).
 * 
 * Funcionalidades:
 * - Painel colapsável sobreposto à viewport do Leaflet com aba lateral de 24x80px
 * - Mecânica 3D Flip Card (Lado A: Lista filtrável com busca normalizada e ordenação; Lado B: Ficha completa com lista de serviços/módulos)
 * - Navegação direta para Piezometria, Seções 2D Datamine, Inspeções SYSDAM, Topografia 030-MINA, Chamados PCMI e Cadastro
 * - Vínculo direto com mapa Leaflet para flyTo suave de câmera
 */
export const SysdamEmpreendimentosPanel = ({
  estruturas = [],
  selectedEstrutura = null,
  onSelectEstrutura,
  onNavigateTab,
  instruments = [],
  anomalias = [],
  fluigTickets = [],
  isCollapsed = false,
  onToggleCollapse,
  isFlipped = false,
  setIsFlipped,
  onCloseDetails,
  onOpenGeomReport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [orderBy, setOrderBy] = useState('PADRAO'); // 'PADRAO' | 'AZ' | 'ZA' | 'DPA' | 'INSTRUMENTOS'

  // Normalização de texto sem acentos para busca rápida
  const normalize = (text) => (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // Filtragem e ordenação de estruturas
  const filteredEstruturas = useMemo(() => {
    let list = [...estruturas];

    // Categoria
    if (selectedCategory !== 'TODAS') {
      list = list.filter(e => e.tipo === selectedCategory);
    }

    // Busca textual
    if (searchQuery.trim()) {
      const q = normalize(searchQuery);
      list = list.filter(e => {
        const n = normalize(e.nome);
        const s = normalize(e.sigla);
        const nc = normalize(e.nomeCompleto);
        const t = normalize(e.tipo);
        return n.includes(q) || s.includes(q) || nc.includes(q) || t.includes(q);
      });
    }

    // Ordenação
    switch (orderBy) {
      case 'AZ':
        list.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
        break;
      case 'ZA':
        list.sort((a, b) => (b.nome || '').localeCompare(a.nome || ''));
        break;
      case 'DPA':
        list.sort((a, b) => {
          const score = (d) => (d === 'Alto' ? 3 : d === 'Médio' ? 2 : 1);
          return score(b.dpa) - score(a.dpa);
        });
        break;
      case 'INSTRUMENTOS':
        list.sort((a, b) => {
          const countA = instruments.filter(i => (i.estrutura || '').toUpperCase().includes(a.sigla)).length;
          const countB = instruments.filter(i => (i.estrutura || '').toUpperCase().includes(b.sigla)).length;
          return countB - countA;
        });
        break;
      case 'PADRAO':
      default:
        // Mantém ordem natural de projeto
        break;
    }

    return list;
  }, [estruturas, selectedCategory, searchQuery, orderBy, instruments]);

  // Contagem de instrumentos para uma estrutura
  const getInstrumentsCount = (sigla) => {
    if (!sigla) return 0;
    const s = sigla.toUpperCase();
    return instruments.filter(i => (i.estrutura || '').toUpperCase().includes(s)).length;
  };

  // Contagem de anomalias/ocorrências para uma estrutura
  const getAnomaliesCount = (sigla) => {
    if (!sigla) return 0;
    const s = sigla.toUpperCase();
    return anomalias.filter(a => (a.estrutura || '').toUpperCase().includes(s)).length;
  };

  // Cores por categoria de estrutura
  const getCategoryColor = (tipo) => {
    switch (tipo) {
      case 'BARRAGEM':
        return { badgeBg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: '#0284c7' };
      case 'CAVA':
        return { badgeBg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: '#8b5cf6' };
      case 'PILHA':
      default:
        return { badgeBg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: '#f59e0b' };
    }
  };

  // Selecionar estrutura e virar o card para Side B
  const handleCardClick = (e) => {
    if (onSelectEstrutura) {
      onSelectEstrutura(e);
    }
    if (setIsFlipped) {
      setIsFlipped(true);
    }
  };

  // Fechar Side B e voltar para Side A
  const handleBackToList = (ev) => {
    ev && ev.stopPropagation();
    if (setIsFlipped) {
      setIsFlipped(false);
    }
    if (onCloseDetails) {
      onCloseDetails();
    }
  };

  return (
    <div className={`sysdam-map-sider ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Botão de Colapso Lateral Padrão Sysdam (24x80px com seta) */}
      <button
        className="sysdam-collapse-button"
        onClick={onToggleCollapse}
        title={isCollapsed ? 'Expandir painel de empreendimentos' : 'Ocultar painel de empreendimentos'}
        aria-label="Alternar painel de empreendimentos"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Container 3D Flip Card */}
      <div className="sysdam-card-flip-container">
        <div className={`sysdam-card-flipper ${isFlipped && selectedEstrutura ? 'flipped' : ''}`}>
          
          {/* ========================================================================= */}
          {/* LADO A: LISTA DE EMPREENDIMENTOS & ESTRUTURAS GEORREFERENCIADAS          */}
          {/* ========================================================================= */}
          <div className="sysdam-card-front">
            {/* Header da Busca e Filtros */}
            <div style={{
              padding: '0.85rem 0.95rem 0.65rem 0.95rem',
              borderBottom: '1px solid var(--border-medium, #334155)',
              backgroundColor: 'var(--bg-secondary, #0f172a)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem'
            }}>
              {/* Título Principal */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Building2 size={16} style={{ color: 'var(--primary-accent, #38bdf8)' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#f8fafc', letterSpacing: '0.3px' }}>
                    Empreendimentos & Estruturas
                  </span>
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8'
                }}>
                  {filteredEstruturas.length} ativas
                </span>
              </div>

              {/* Barra de Pesquisa */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface, #1e293b)',
                border: '1px solid var(--border-medium, #475569)',
                borderRadius: '6px',
                padding: '0.3rem 0.6rem',
                gap: '0.4rem'
              }}>
                <Search size={14} style={{ color: 'var(--text-muted, #94a3b8)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar B1, B4, Cava, PDE..."
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#f8fafc',
                    fontSize: '0.75rem',
                    width: '100%',
                    fontFamily: 'inherit'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Categorias & Ordenação */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {['TODAS', 'BARRAGEM', 'CAVA', 'PILHA'].map(cat => {
                    const isActive = selectedCategory === cat;
                    const label = cat === 'TODAS' ? 'Todas' : cat === 'BARRAGEM' ? 'Barragens' : cat === 'CAVA' ? 'Cavas' : 'Pilhas';
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          border: isActive ? '1px solid #38bdf8' : '1px solid var(--border-subtle, #334155)',
                          backgroundColor: isActive ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                          color: isActive ? '#38bdf8' : '#94a3b8',
                          fontSize: '0.67rem',
                          fontWeight: isActive ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Seletor de Ordenação */}
                <select
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-surface, #1e293b)',
                    border: '1px solid var(--border-medium, #475569)',
                    borderRadius: '4px',
                    color: '#94a3b8',
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.35rem'
                  }}
                  title="Ordenar lista de empreendimentos"
                >
                  <option value="PADRAO">Padrão</option>
                  <option value="AZ">A - Z</option>
                  <option value="ZA">Z - A</option>
                  <option value="DPA">DPA Crítico</option>
                  <option value="INSTRUMENTOS">+ Instrumentos</option>
                </select>
              </div>
            </div>

            {/* Lista Rolável de Cards de Empreendimentos */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.65rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem'
            }}>
              {filteredEstruturas.length === 0 ? (
                <div style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: 'var(--text-muted, #94a3b8)',
                  fontSize: '0.75rem'
                }}>
                  Nenhuma estrutura localizada com os filtros ativos.
                </div>
              ) : (
                filteredEstruturas.map((e) => {
                  const isSelected = selectedEstrutura?.id === e.id || selectedEstrutura?.sigla === e.sigla;
                  const instCount = getInstrumentsCount(e.sigla);
                  const anomCount = getAnomaliesCount(e.sigla);
                  const catStyle = getCategoryColor(e.tipo);

                  return (
                    <div
                      key={e.id || e.sigla}
                      onClick={() => handleCardClick(e)}
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface, #1e293b)',
                        border: isSelected ? '1px solid #38bdf8' : '1px solid var(--border-medium, #334155)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        transition: 'all 0.18s ease',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      onMouseEnter={(el) => {
                        if (!isSelected) el.currentTarget.style.borderColor = '#475569';
                      }}
                      onMouseLeave={(el) => {
                        if (!isSelected) el.currentTarget.style.borderColor = 'var(--border-medium, #334155)';
                      }}
                    >
                      {/* Thumbnail Lateral Georreferenciado */}
                      <div style={{
                        width: '92px',
                        minWidth: '92px',
                        backgroundColor: catStyle.badgeBg,
                        borderRight: '1px solid var(--border-subtle, #334155)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        padding: '0.5rem'
                      }}>
                        <span style={{
                          fontSize: '1.25rem',
                          fontWeight: 900,
                          color: catStyle.text,
                          letterSpacing: '0.5px'
                        }}>
                          {e.sigla}
                        </span>
                        <span style={{
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          color: 'var(--text-muted, #94a3b8)',
                          textTransform: 'uppercase',
                          marginTop: '2px'
                        }}>
                          {e.tipo}
                        </span>
                        {e.cotaCrista && (
                          <span style={{
                            position: 'absolute',
                            bottom: '4px',
                            fontSize: '0.58rem',
                            fontFamily: 'monospace',
                            color: '#94a3b8'
                          }}>
                            {e.cotaCrista}m
                          </span>
                        )}
                      </div>

                      {/* Conteúdo do Card */}
                      <div style={{
                        flex: 1,
                        padding: '0.6rem 0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.3rem'
                      }}>
                        <div>
                          {/* Empreendedor */}
                          <div style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            color: '#38bdf8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span>ITAMINAS MINERAÇÃO</span>
                            <span style={{ fontSize: '0.6rem', color: '#64748b' }}>Sarzedo / MG</span>
                          </div>

                          {/* Nome da Estrutura */}
                          <div style={{
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            color: '#f8fafc',
                            marginTop: '1px',
                            lineHeight: 1.2
                          }}>
                            {e.nome}
                          </div>
                        </div>

                        {/* Metadados & Badges Técnicos */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '2px' }}>
                          {e.dpa && (
                            <span style={{
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '3px',
                              backgroundColor: e.dpa === 'Alto' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: e.dpa === 'Alto' ? '#ef4444' : '#f59e0b'
                            }}>
                              DPA {e.dpa}
                            </span>
                          )}

                          {instCount > 0 && (
                            <span style={{
                              fontSize: '0.62rem',
                              fontWeight: 600,
                              padding: '1px 5px',
                              borderRadius: '3px',
                              backgroundColor: 'rgba(56, 189, 248, 0.15)',
                              color: '#38bdf8',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              <Activity size={10} />
                              {instCount} inst.
                            </span>
                          )}

                          {anomCount > 0 && (
                            <span style={{
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '3px',
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              color: '#ef4444'
                            }}>
                              {anomCount} anom.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Rodapé do Painel Frontal */}
            <div style={{
              padding: '0.45rem 0.85rem',
              borderTop: '1px solid var(--border-medium, #334155)',
              backgroundColor: 'var(--bg-secondary, #0f172a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.68rem',
              color: 'var(--text-muted, #94a3b8)'
            }}>
              <span>Complexo Minerário Itaminas</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>SIRGAS 2000 UTM 23S</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LADO B: FICHA COMPLETA DO EMPREENDIMENTO & SERVIÇOS/MÓDULOS (SYSDAM)     */}
          {/* ========================================================================= */}
          <div className="sysdam-card-back">
            {selectedEstrutura ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
                
                {/* Header com Imagem / Gradiente e Ação de Fechar */}
                <div style={{
                  position: 'relative',
                  minHeight: '140px',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  borderBottom: '1px solid var(--border-medium, #334155)'
                }}>
                  {/* Botão de Fechar / Voltar à Lista */}
                  <button
                    onClick={handleBackToList}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                    title="Voltar para lista de empreendimentos"
                  >
                    <X size={15} />
                  </button>

                  {/* Informações Centrais do Header */}
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(56, 189, 248, 0.25)',
                      color: '#38bdf8',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      marginBottom: '4px'
                    }}>
                      {selectedEstrutura.sigla} • {selectedEstrutura.tipo}
                    </span>
                    <h2 style={{
                      margin: 0,
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      textShadow: '0 2px 4px rgba(0,0,0,0.6)'
                    }}>
                      {selectedEstrutura.nome}
                    </h2>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255, 255, 255, 0.85)',
                      marginTop: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      <MapPin size={12} style={{ color: '#38bdf8' }} />
                      <span>Sarzedo / MG • Itaminas Mineração S/A</span>
                    </div>
                  </div>
                </div>

                {/* Métricas Técnicas da Estrutura */}
                <div style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--bg-secondary, #0f172a)',
                  borderBottom: '1px solid var(--border-medium, #334155)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  fontSize: '0.68rem'
                }}>
                  <div>
                    <div style={{ color: '#94a3b8' }}>Cota Crista:</div>
                    <strong style={{ color: '#f8fafc' }}>{selectedEstrutura.cotaCrista ? `${selectedEstrutura.cotaCrista}m` : '-'}</strong>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8' }}>Altura Máx:</div>
                    <strong style={{ color: '#f8fafc' }}>{selectedEstrutura.alturaMaxima ? `${selectedEstrutura.alturaMaxima}m` : '-'}</strong>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8' }}>DPA / CRI:</div>
                    <strong style={{ color: selectedEstrutura.dpa === 'Alto' ? '#ef4444' : '#f59e0b' }}>
                      {selectedEstrutura.dpa || 'Alto'} / {selectedEstrutura.cri || 'Baixo'}
                    </strong>
                  </div>
                </div>

                {/* Lista de Módulos e Serviços Vinculados (Padrão SysDam) */}
                <div style={{
                  flex: 1,
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '2px'
                  }}>
                    Módulos Operacionais Disponíveis:
                  </div>

                  {/* 1. Seções 2D Datamine & LEM */}
                  <div 
                    onClick={() => onNavigateTab && onNavigateTab('secoes')}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-surface, #1e293b)',
                      border: '1px solid var(--border-medium, #334155)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        padding: '6px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8'
                      }}>
                        <Layers size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc' }}>
                          Seções 2D Datamine Studio & LEM
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                          Cortes transversais, modelo de blocos e Fator de Segurança
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: '#38bdf8' }} />
                  </div>

                  {/* 2. Monitoramento Piezométrico */}
                  <div 
                    onClick={() => onNavigateTab && onNavigateTab('piezometria')}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-surface, #1e293b)',
                      border: '1px solid var(--border-medium, #334155)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        padding: '6px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981'
                      }}>
                        <Activity size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc' }}>
                          Monitoramento Piezométrico
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                          {getInstrumentsCount(selectedEstrutura.sigla)} instrumentos com leituras e cotas freáticas
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: '#10b981' }} />
                  </div>

                  {/* 3. Inspeções & Anomalias (SYSDAM) */}
                  <div 
                    onClick={() => onNavigateTab && onNavigateTab('anomalias_inspecoes')}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-surface, #1e293b)',
                      border: '1px solid var(--border-medium, #334155)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        padding: '6px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444'
                      }}>
                        <ClipboardCheck size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc' }}>
                          Inspeções Regulares & Anomalias
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                          {getAnomaliesCount(selectedEstrutura.sigla)} anomalias cadastradas no padrão SYSDAM / ANM 95
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: '#ef4444' }} />
                  </div>

                  {/* 4. Topografia Engemec 2026 (030-MINA) */}
                  <div 
                    onClick={() => {
                      if (onOpenGeomReport) onOpenGeomReport();
                      else if (onNavigateTab) onNavigateTab('secoes');
                    }}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-surface, #1e293b)',
                      border: '1px solid var(--border-medium, #334155)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        padding: '6px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b'
                      }}>
                        <Compass size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc' }}>
                          Topografia & Geometria 030-MINA
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                          12 campanhas Engemec 2026 e conformidade NBR 13028
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: '#f59e0b' }} />
                  </div>

                  {/* 5. Dados Cadastrais & DCE */}
                  <div 
                    onClick={() => onNavigateTab && onNavigateTab('estruturas')}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-surface, #1e293b)',
                      border: '1px solid var(--border-medium, #334155)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        padding: '6px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(168, 85, 247, 0.15)',
                        color: '#a855f7'
                      }}>
                        <Building2 size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc' }}>
                          Cadastro Técnico & DCE
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                          Ficha técnica detalhada, seções e órgãos fiscalizadores
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: '#a855f7' }} />
                  </div>

                  {/* 6. Ordens de Serviço & Chamados PCMI */}
                  <div 
                    onClick={() => onNavigateTab && onNavigateTab('chamados')}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-surface, #1e293b)',
                      border: '1px solid var(--border-medium, #334155)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        padding: '6px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(2, 132, 199, 0.15)',
                        color: '#0284c7'
                      }}>
                        <Wrench size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc' }}>
                          Chamados & Manutenção PCMI
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                          Ordens de serviço de campo e monitoramento de ações
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: '#0284c7' }} />
                  </div>
                </div>

                {/* Rodapé com Botão Voltar */}
                <div style={{
                  padding: '0.55rem 0.85rem',
                  borderTop: '1px solid var(--border-medium, #334155)',
                  backgroundColor: 'var(--bg-secondary, #0f172a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <button
                    onClick={handleBackToList}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'none',
                      border: 'none',
                      color: '#38bdf8',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    <ChevronLeft size={15} />
                    <span>Voltar à lista de estruturas</span>
                  </button>
                  <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                    Padrão SYSDAM Portal
                  </span>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-muted, #94a3b8)',
                fontSize: '0.75rem'
              }}>
                Nenhum empreendimento selecionado.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SysdamEmpreendimentosPanel;

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
  ArrowRight,
  Crosshair,
  Shield,
  FileCheck,
  Send,
  Info,
  CheckCircle,
  Eye,
  Database
} from 'lucide-react';
import { chamadosSyncTunnel } from '../services/chamadosSyncTunnel';

/**
 * Converte coordenadas WGS-84 (Lat/Lon) para UTM Fuso 23S (SIRGAS 2000 / WGS-84)
 */
export function toUtm23s(lat, lon) {
  if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) return null;
  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const k0 = 0.9996;
  const lon0 = -45.0 * Math.PI / 180.0;
  const e2 = 2 * f - f * f;
  const e_prime2 = e2 / (1 - e2);

  const phi = lat * Math.PI / 180.0;
  const lambda = lon * Math.PI / 180.0;

  const N = a / Math.sqrt(1 - e2 * Math.sin(phi) * Math.sin(phi));
  const T = Math.tan(phi) * Math.tan(phi);
  const C = e_prime2 * Math.cos(phi) * Math.cos(phi);
  const A = Math.cos(phi) * (lambda - lon0);

  const M = a * (
    (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * phi -
    (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2 * e2 / 1024) * Math.sin(2 * phi) +
    (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * phi) -
    (35 * e2 * e2 / 3072) * Math.sin(6 * phi)
  );

  const easting = 500000 + k0 * N * (A + (1 - T + C) * Math.pow(A, 3) / 6 + (5 - 18 * T + T * T + 72 * C - 58 * e_prime2) * Math.pow(A, 5) / 120);
  const northing = 10000000 + k0 * (M + N * Math.tan(phi) * (Math.pow(A, 2) / 2 + (5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4) / 24 + (61 - 58 * T + T * T + 600 * C - 330 * e_prime2) * Math.pow(A, 6) / 720));

  return { easting: Math.round(easting), northing: Math.round(northing) };
}

/**
 * Normaliza e vincula instrumentos, anomalias e chamados à estrutura correta
 */
export function matchesStructure(itemEstr, struct) {
  if (!itemEstr || !struct) return false;
  const rawItem = String(itemEstr).toUpperCase().trim();
  const rawId = String(struct.id || '').toUpperCase().trim();
  const rawSigla = String(struct.sigla || '').toUpperCase().trim();
  const rawNome = String(struct.nome || '').toUpperCase().trim();
  const rawNomeCompleto = String(struct.nomeCompleto || '').toUpperCase().trim();

  if (rawItem === rawId || rawItem === rawSigla || rawItem === rawNome || rawItem === rawNomeCompleto) {
    return true;
  }
  if (rawId && (rawItem === rawId || rawItem.startsWith(rawId + '_') || rawItem.startsWith(rawId + ' ') || rawItem.endsWith('_' + rawId) || rawItem.endsWith(' ' + rawId))) {
    return true;
  }
  if (rawSigla && (rawItem === rawSigla || rawItem.startsWith(rawSigla + '_') || rawItem.startsWith(rawSigla + ' ') || rawItem.endsWith('_' + rawSigla) || rawItem.endsWith(' ' + rawSigla))) {
    return true;
  }
  if (rawNome && (rawItem.includes(rawNome) || rawNome.includes(rawItem))) {
    return true;
  }

  const normalize = (s) => (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ' ')
    .trim();

  const normItem = normalize(rawItem);
  const normNome = normalize(rawNome);

  const stopWords = ['PDE', 'PILHA', 'CAVA', 'BARRAGEM', 'DIQUE', 'DE', 'DO', 'DA', 'E', 'O', 'A', 'COMPLEXO', 'MINA'];
  const keywords = normNome.split(/\s+/).filter(w => w.length >= 2 && !stopWords.includes(w));

  if (keywords.length > 0 && keywords.every(kw => normItem.includes(kw))) {
    return true;
  }

  const siglaMap = {
    'MGB': ['MANGABA'],
    'ES': ['ENGENHO', 'SECO'],
    'ES1': ['ENGENHO', 'SECO', 'I'],
    'ES_1': ['ENGENHO', 'SECO', 'I'],
    'JGD': ['JANGADA'],
    'JC': ['JACO'],
    'SMB': ['SAMAMBAIA'],
    'B1': ['B1'],
    'B4': ['B4'],
    'PB2': ['B2'],
    'B2': ['B2']
  };

  const mappedKws = siglaMap[rawSigla] || siglaMap[rawId];
  if (mappedKws && mappedKws.every(kw => normItem.includes(kw))) {
    return true;
  }

  return false;
}

/**
 * SysdamEmpreendimentosPanel
 * 
 * Painel flutuante de empreendimentos e estruturas georreferenciadas
 * inspirado na arquitetura oficial do Portal SysDam (/painel/empreendimentos).
 */
export const SysdamEmpreendimentosPanel = ({
  estruturas = [],
  selectedEstrutura = null,
  onSelectEstrutura,
  onFocusStructure,
  onNavigateTab,
  onNavigateModule,
  onFlipChange,
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

  // Consolidação de chamados do túnel ou props
  const allTickets = useMemo(() => {
    if (fluigTickets && fluigTickets.length > 0) return fluigTickets;
    return (chamadosSyncTunnel?.getActiveTickets ? chamadosSyncTunnel.getActiveTickets() : []);
  }, [fluigTickets]);

  // Contagem de instrumentos para uma estrutura
  const getInstrumentsCount = (struct) => {
    if (!struct) return 0;
    return (instruments || []).filter(i => matchesStructure(i.estrutura, struct)).length;
  };

  // Contagem de anomalias para uma estrutura
  const getAnomaliesCount = (struct) => {
    if (!struct) return 0;
    return (anomalias || []).filter(a => matchesStructure(a.estrutura, struct)).length;
  };

  // Contagem de chamados para uma estrutura
  const getTicketsCount = (struct) => {
    if (!struct) return 0;
    return (allTickets || []).filter(t => matchesStructure(t.estrutura, struct)).length;
  };

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
          const countA = getInstrumentsCount(a);
          const countB = getInstrumentsCount(b);
          return countB - countA;
        });
        break;
      case 'PADRAO':
      default:
        break;
    }

    return list;
  }, [estruturas, selectedCategory, searchQuery, orderBy, instruments, allTickets]);

  // Cores por categoria de estrutura
  const getCategoryColor = (tipo) => {
    switch (tipo) {
      case 'BARRAGEM':
        return { badgeBg: 'rgba(56, 189, 248, 0.18)', text: '#38bdf8', border: '#0284c7' };
      case 'CAVA':
        return { badgeBg: 'rgba(168, 85, 247, 0.18)', text: '#c084fc', border: '#8b5cf6' };
      case 'PILHA':
      default:
        return { badgeBg: 'rgba(245, 158, 11, 0.18)', text: '#fbbf24', border: '#f59e0b' };
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
    if (onFlipChange) {
      onFlipChange(true);
    }
  };

  // Fechar Side B e voltar para Side A
  const handleBackToList = (ev) => {
    ev && ev.stopPropagation();
    if (setIsFlipped) {
      setIsFlipped(false);
    }
    if (onFlipChange) {
      onFlipChange(false);
    }
    if (onCloseDetails) {
      onCloseDetails();
    }
  };

  // Telemetria detalhada da estrutura selecionada
  const structInstruments = useMemo(() => {
    if (!selectedEstrutura) return [];
    return (instruments || []).filter(i => matchesStructure(i.estrutura, selectedEstrutura));
  }, [selectedEstrutura, instruments]);

  const structAnomalies = useMemo(() => {
    if (!selectedEstrutura) return [];
    return (anomalias || []).filter(a => matchesStructure(a.estrutura, selectedEstrutura));
  }, [selectedEstrutura, anomalias]);

  const structTickets = useMemo(() => {
    if (!selectedEstrutura) return [];
    return (allTickets || []).filter(t => matchesStructure(t.estrutura, selectedEstrutura));
  }, [selectedEstrutura, allTickets]);

  // Contagens por tipo de instrumento
  const pzCount = useMemo(() => {
    return structInstruments.filter(i => {
      const t = (i.tipo || '').toUpperCase();
      return t === 'PZ' || t === 'INA' || t.includes('PIEZ');
    }).length;
  }, [structInstruments]);

  const vazaoCount = useMemo(() => {
    return structInstruments.filter(i => {
      const t = (i.tipo || '').toUpperCase();
      return t === 'MV' || t === 'VT' || t.includes('VAZ') || t.includes('DREN');
    }).length;
  }, [structInstruments]);

  const alertasCount = useMemo(() => {
    return structInstruments.filter(i => {
      const s = String(i.status || '').toLowerCase();
      return s.includes('alert') || s.includes('atenc') || s.includes('atenç') || s.includes('emerg') || i.nivelAlerta;
    }).length;
  }, [structInstruments]);

  const pendingTicketsCount = useMemo(() => {
    return structTickets.filter(t => {
      const s = String(t.status || '').toLowerCase();
      return !s.includes('fech') && !s.includes('concl') && !s.includes('aprov');
    }).length;
  }, [structTickets]);

  // Coordenadas e projeção UTM 23S
  const lat = selectedEstrutura?.coordenadas?.lat ?? selectedEstrutura?.lat;
  const lon = selectedEstrutura?.coordenadas?.lon ?? selectedEstrutura?.lon;
  const utm = (lat != null && lon != null) ? toUtm23s(lat, lon) : null;

  // Navegação para módulos operacionais
  const handleNavigate = (tabKey, extraContext = {}) => {
    if (!selectedEstrutura) return;
    const ctx = {
      structureId: selectedEstrutura.id,
      sigla: selectedEstrutura.sigla,
      estrutura: selectedEstrutura.nome,
      selectedEstrutura,
      ...extraContext
    };

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('selected_geotech_structure', JSON.stringify(selectedEstrutura));
      }
    } catch (e) {}

    if (onNavigateModule) {
      onNavigateModule(tabKey, selectedEstrutura);
    } else if (onNavigateTab) {
      onNavigateTab(tabKey, ctx);
    }
  };

  // Centralizar no mapa
  const handleCenterMap = (ev) => {
    ev && ev.stopPropagation();
    if (!selectedEstrutura) return;
    if (onFocusStructure) {
      onFocusStructure(selectedEstrutura);
    } else if (onSelectEstrutura) {
      onSelectEstrutura(selectedEstrutura);
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
          <div className="sysdam-card-front" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>
            {/* Header da Busca e Filtros */}
            <div style={{
              padding: '0.85rem 0.95rem 0.65rem 0.95rem',
              borderBottom: '1px solid #334155',
              backgroundColor: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem'
            }}>
              {/* Título Principal */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Building2 size={16} style={{ color: '#38bdf8' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff', letterSpacing: '0.3px' }}>
                    Empreendimentos & Estruturas
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                  {onToggleCollapse && (
                    <button
                      onClick={onToggleCollapse}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Ocultar painel de empreendimentos"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Barra de Pesquisa */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '6px',
                padding: '0.3rem 0.6rem',
                gap: '0.4rem'
              }}>
                <Search size={14} style={{ color: '#94a3b8' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar B1, B4, Cava, PDE..."
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
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
                          border: isActive ? '1px solid #38bdf8' : '1px solid #334155',
                          backgroundColor: isActive ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                          color: isActive ? '#38bdf8' : '#94a3b8',
                          fontSize: '0.67rem',
                          fontWeight: isActive ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
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
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '4px',
                    color: '#f8fafc',
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.35rem',
                    outline: 'none'
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
              gap: '0.55rem',
              backgroundColor: '#0b1329'
            }}>
              {filteredEstruturas.length === 0 ? (
                <div style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.75rem'
                }}>
                  Nenhuma estrutura localizada com os filtros ativos.
                </div>
              ) : (
                filteredEstruturas.map((e) => {
                  const isSelected = selectedEstrutura?.id === e.id || selectedEstrutura?.sigla === e.sigla;
                  const instCount = getInstrumentsCount(e);
                  const anomCount = getAnomaliesCount(e);
                  const chamCount = getTicketsCount(e);
                  const catStyle = getCategoryColor(e.tipo);

                  return (
                    <div
                      key={e.id || e.sigla}
                      onClick={() => handleCardClick(e)}
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
                        border: isSelected ? '1px solid #38bdf8' : '1px solid #334155',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        transition: 'all 0.18s ease',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)'
                      }}
                      onMouseEnter={(el) => {
                        if (!isSelected) {
                          el.currentTarget.style.borderColor = '#0284c7';
                          el.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(el) => {
                        if (!isSelected) {
                          el.currentTarget.style.borderColor = '#334155';
                          el.currentTarget.style.transform = 'none';
                        }
                      }}
                    >
                      {/* Thumbnail Lateral Georreferenciado */}
                      <div style={{
                        width: '92px',
                        minWidth: '92px',
                        backgroundColor: catStyle.badgeBg,
                        borderRight: '1px solid #334155',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        padding: '0.5rem'
                      }}>
                        <span style={{
                          fontSize: '1.2rem',
                          fontWeight: 900,
                          color: catStyle.text,
                          letterSpacing: '0.5px'
                        }}>
                          {e.sigla}
                        </span>
                        <span style={{
                          fontSize: '0.58rem',
                          fontWeight: 700,
                          color: '#94a3b8',
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
                            color: '#cbd5e1'
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
                            <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Sarzedo / MG</span>
                          </div>

                          {/* Nome da Estrutura */}
                          <div style={{
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            color: '#ffffff',
                            marginTop: '2px',
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
                              backgroundColor: e.dpa === 'Alto' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
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
                              backgroundColor: 'rgba(56, 189, 248, 0.18)',
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
                              backgroundColor: 'rgba(239, 68, 68, 0.25)',
                              color: '#ef4444'
                            }}>
                              {anomCount} anom.
                            </span>
                          )}

                          {chamCount > 0 && (
                            <span style={{
                              fontSize: '0.62rem',
                              fontWeight: 600,
                              padding: '1px 5px',
                              borderRadius: '3px',
                              backgroundColor: 'rgba(2, 132, 199, 0.2)',
                              color: '#38bdf8',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              <Wrench size={9} />
                              {chamCount} chamados
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
              borderTop: '1px solid #334155',
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.68rem',
              color: '#94a3b8'
            }}>
              <span>Complexo Minerário Itaminas</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>SIRGAS 2000 UTM 23S</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LADO B: FICHA COMPLETA DO EMPREENDIMENTO & SERVIÇOS/MÓDULOS (SYSDAM)     */}
          {/* ========================================================================= */}
          <div className="sysdam-card-back" style={{ backgroundColor: '#0b1329', color: '#f8fafc' }}>
            {selectedEstrutura ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
                
                {/* Header com Gradiente Profundo de Alta Visibilidade */}
                <div style={{
                  position: 'relative',
                  background: 'linear-gradient(135deg, #091e3a 0%, #0f2744 55%, #0369a1 100%)',
                  padding: '1rem 1rem 0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  borderBottom: '1px solid #1e3a8a',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)'
                }}>
                  {/* Botão de Fechar / Voltar à Lista */}
                  <button
                    onClick={handleBackToList}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 10,
                      transition: 'all 0.15s ease'
                    }}
                    title="Voltar para lista de estruturas"
                  >
                    <X size={15} />
                  </button>

                  {/* Informações Principais da Estrutura */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(56, 189, 248, 0.3)',
                        color: '#38bdf8',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        border: '1px solid rgba(56, 189, 248, 0.4)'
                      }}>
                        <Building2 size={11} />
                        {selectedEstrutura.sigla || selectedEstrutura.id} • {selectedEstrutura.tipo}
                      </span>
                      {selectedEstrutura.statusDce && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(16, 185, 129, 0.25)',
                          color: '#34d399',
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          border: '1px solid rgba(16, 185, 129, 0.4)'
                        }}>
                          <ShieldCheck size={11} />
                          {selectedEstrutura.statusDce}
                        </span>
                      )}
                    </div>

                    <h2 style={{
                      margin: 0,
                      fontSize: '1.18rem',
                      fontWeight: 900,
                      color: '#ffffff',
                      letterSpacing: '0.3px',
                      textShadow: '0 2px 4px rgba(0,0,0,0.7)'
                    }}>
                      {selectedEstrutura.nome}
                    </h2>

                    {selectedEstrutura.nomeCompleto && selectedEstrutura.nomeCompleto !== selectedEstrutura.nome && (
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#93c5fd',
                        marginTop: '2px',
                        fontStyle: 'italic'
                      }}>
                        {selectedEstrutura.nomeCompleto}
                      </div>
                    )}

                    <div style={{
                      fontSize: '0.72rem',
                      color: '#e2e8f0',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} style={{ color: '#38bdf8' }} />
                        <span>Sarzedo / MG • Itaminas Mineração S/A</span>
                      </div>
                      <button
                        onClick={handleCenterMap}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: 'rgba(56, 189, 248, 0.25)',
                          border: '1px solid #38bdf8',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          marginLeft: 'auto'
                        }}
                        title="Centralizar câmera no mapa nesta estrutura"
                      >
                        <Crosshair size={11} style={{ color: '#38bdf8' }} />
                        Centralizar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Coordenadas Georreferenciadas WGS-84 & UTM 23S */}
                {(lat != null && lon != null) && (
                  <div style={{
                    padding: '0.45rem 0.85rem',
                    backgroundColor: '#0f172a',
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.66rem',
                    color: '#cbd5e1'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>WGS-84:</span>
                      <span style={{ fontFamily: 'monospace' }}>{Number(lat).toFixed(6)}, {Number(lon).toFixed(6)}</span>
                    </div>
                    {utm && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#34d399', fontWeight: 700 }}>UTM 23S:</span>
                        <span style={{ fontFamily: 'monospace' }}>E {utm.easting} / N {utm.northing}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Dossiê Técnico Completo de Parâmetros Geotécnicos */}
                <div style={{
                  padding: '0.75rem 0.85rem',
                  backgroundColor: '#0f172a',
                  borderBottom: '1px solid #334155',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem'
                }}>
                  <div style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Dossiê Técnico & Parâmetros da Estrutura:
                  </div>

                  {/* Grid de Métricas Técnicas */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.45rem'
                  }}>
                    <div style={{ backgroundColor: '#1e293b', padding: '0.45rem 0.55rem', borderRadius: '6px', border: '1px solid #334155' }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.63rem' }}>Cota Crista:</div>
                      <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.76rem', marginTop: '1px' }}>
                        {selectedEstrutura.cotaCrista ? `${selectedEstrutura.cotaCrista} m` : 'N/A'}
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#1e293b', padding: '0.45rem 0.55rem', borderRadius: '6px', border: '1px solid #334155' }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.63rem' }}>Altura Máx:</div>
                      <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.76rem', marginTop: '1px' }}>
                        {selectedEstrutura.alturaMaxima ? `${selectedEstrutura.alturaMaxima} m` : 'N/A'}
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#1e293b', padding: '0.45rem 0.55rem', borderRadius: '6px', border: '1px solid #334155' }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.63rem' }}>DPA / CRI:</div>
                      <div style={{
                        color: selectedEstrutura.dpa === 'Alto' ? '#f87171' : '#fbbf24',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        marginTop: '1px'
                      }}>
                        {selectedEstrutura.dpa || 'Alto'} / {selectedEstrutura.cri || 'Baixo'}
                      </div>
                    </div>
                  </div>

                  {/* Detalhes Adicionais de Engenharia */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    backgroundColor: '#1e293b',
                    padding: '0.55rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #334155',
                    fontSize: '0.68rem'
                  }}>
                    {selectedEstrutura.faseProjeto && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ color: '#94a3b8' }}>Fase do Projeto:</span>
                        <strong style={{ color: '#f8fafc', textAlign: 'right' }}>{selectedEstrutura.faseProjeto}</strong>
                      </div>
                    )}
                    {selectedEstrutura.tipoSecao && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ color: '#94a3b8' }}>Tipo de Seção:</span>
                        <span style={{ color: '#cbd5e1', textAlign: 'right' }}>{selectedEstrutura.tipoSecao}</span>
                      </div>
                    )}
                    {selectedEstrutura.finalidade && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ color: '#94a3b8' }}>Finalidade:</span>
                        <span style={{ color: '#cbd5e1', textAlign: 'right' }}>{selectedEstrutura.finalidade}</span>
                      </div>
                    )}
                    {selectedEstrutura.estruturaAssoc && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ color: '#94a3b8' }}>Estruturas Assoc.:</span>
                        <span style={{ color: '#38bdf8', textAlign: 'right' }}>{selectedEstrutura.estruturaAssoc}</span>
                      </div>
                    )}
                    {selectedEstrutura.volumeAtual && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ color: '#94a3b8' }}>Volume Atual:</span>
                        <strong style={{ color: '#f8fafc', textAlign: 'right' }}>{selectedEstrutura.volumeAtual}</strong>
                      </div>
                    )}
                    {selectedEstrutura.orgaoFiscalizador && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ color: '#94a3b8' }}>Órgão Fiscalizador:</span>
                        <span style={{ color: '#34d399', fontWeight: 700, textAlign: 'right' }}>{selectedEstrutura.orgaoFiscalizador}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Telemetria e Indicadores em Tempo Real */}
                <div style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#0b1329',
                  borderBottom: '1px solid #1e293b',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.4rem',
                  textAlign: 'center'
                }}>
                  <div style={{ backgroundColor: '#0f172a', padding: '0.35rem 0.2rem', borderRadius: '5px', border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#38bdf8' }}>{structInstruments.length}</div>
                    <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Instrumentos</div>
                  </div>
                  <div style={{ backgroundColor: '#0f172a', padding: '0.35rem 0.2rem', borderRadius: '5px', border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#34d399' }}>{pzCount}</div>
                    <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Piezômetros</div>
                  </div>
                  <div style={{ backgroundColor: '#0f172a', padding: '0.35rem 0.2rem', borderRadius: '5px', border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: structAnomalies.length > 0 ? '#ef4444' : '#34d399' }}>
                      {structAnomalies.length}
                    </div>
                    <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Anomalias</div>
                  </div>
                  <div style={{ backgroundColor: '#0f172a', padding: '0.35rem 0.2rem', borderRadius: '5px', border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: structTickets.length > 0 ? '#f59e0b' : '#94a3b8' }}>
                      {structTickets.length}
                    </div>
                    <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Chamados</div>
                  </div>
                </div>

                {/* Lista de Módulos Operacionais Disponíveis */}
                <div style={{
                  flex: 1,
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  backgroundColor: '#0b1329'
                }}>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>Módulos Operacionais Disponíveis:</span>
                    <span style={{ fontSize: '0.62rem', color: '#38bdf8', fontWeight: 600 }}>5 módulos interativos</span>
                  </div>

                  {/* 1. Monitoramento Piezométrico */}
                  <div 
                    onClick={() => handleNavigate('piezometria')}
                    role="button"
                    tabIndex={0}
                    style={{
                      padding: '0.7rem 0.85rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      borderLeft: '4px solid #10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseEnter={(el) => {
                      el.currentTarget.style.borderColor = '#10b981';
                      el.currentTarget.style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={(el) => {
                      el.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.35)';
                      el.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <div style={{
                        padding: '7px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Activity size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.2px' }}>
                          Monitoramento Piezométrico
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                          {structInstruments.length} instrumentos com leituras e cotas freáticas ({pzCount} PZ/INA)
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#10b981' }}>Abrir</span>
                      <ArrowRight size={14} style={{ color: '#10b981' }} />
                    </div>
                  </div>

                  {/* 2. Inspeções Regulares & Anomalias (SYSDAM) */}
                  <div 
                    onClick={() => handleNavigate('anomalias_inspecoes')}
                    role="button"
                    tabIndex={0}
                    style={{
                      padding: '0.7rem 0.85rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderLeft: '4px solid #ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseEnter={(el) => {
                      el.currentTarget.style.borderColor = '#ef4444';
                      el.currentTarget.style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={(el) => {
                      el.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
                      el.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <div style={{
                        padding: '7px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ClipboardCheck size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.2px' }}>
                          Inspeções Regulares & Anomalias
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                          {structAnomalies.length} anomalias cadastradas (Portaria ANM 95/2022 e PNSB)
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ef4444' }}>Abrir</span>
                      <ArrowRight size={14} style={{ color: '#ef4444' }} />
                    </div>
                  </div>

                  {/* 3. Topografia Engemec 2026 (030-MINA) */}
                  <div 
                    onClick={() => {
                      if (onOpenGeomReport) onOpenGeomReport();
                      else handleNavigate('mapa', { open3D: true });
                    }}
                    role="button"
                    tabIndex={0}
                    style={{
                      padding: '0.7rem 0.85rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      borderLeft: '4px solid #f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseEnter={(el) => {
                      el.currentTarget.style.borderColor = '#f59e0b';
                      el.currentTarget.style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={(el) => {
                      el.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.35)';
                      el.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <div style={{
                        padding: '7px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        color: '#f59e0b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Compass size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.2px' }}>
                          Topografia & Geometria 030-MINA
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                          12 campanhas Engemec 2026 e conformidade NBR 13028
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b' }}>3D</span>
                      <ArrowRight size={14} style={{ color: '#f59e0b' }} />
                    </div>
                  </div>

                  {/* 4. Dados Cadastrais & DCE */}
                  <div 
                    onClick={() => handleNavigate('estruturas')}
                    role="button"
                    tabIndex={0}
                    style={{
                      padding: '0.7rem 0.85rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
                      border: '1px solid rgba(168, 85, 247, 0.35)',
                      borderLeft: '4px solid #a855f7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseEnter={(el) => {
                      el.currentTarget.style.borderColor = '#a855f7';
                      el.currentTarget.style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={(el) => {
                      el.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.35)';
                      el.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <div style={{
                        padding: '7px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(168, 85, 247, 0.2)',
                        color: '#a855f7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.2px' }}>
                          Cadastro Técnico & DCE
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                          Ficha técnica detalhada, seções e órgãos fiscalizadores
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#a855f7' }}>Abrir</span>
                      <ArrowRight size={14} style={{ color: '#a855f7' }} />
                    </div>
                  </div>

                  {/* 5. Ordens de Serviço & Chamados PCMI */}
                  <div 
                    onClick={() => handleNavigate('chamados')}
                    role="button"
                    tabIndex={0}
                    style={{
                      padding: '0.7rem 0.85rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
                      border: '1px solid rgba(2, 132, 199, 0.35)',
                      borderLeft: '4px solid #0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseEnter={(el) => {
                      el.currentTarget.style.borderColor = '#0284c7';
                      el.currentTarget.style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={(el) => {
                      el.currentTarget.style.borderColor = 'rgba(2, 132, 199, 0.35)';
                      el.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <div style={{
                        padding: '7px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(2, 132, 199, 0.2)',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Wrench size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.2px' }}>
                          Chamados & Manutenção PCMI
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                          {structTickets.length} ordens de serviço ({pendingTicketsCount} em aberto)
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#38bdf8' }}>Abrir</span>
                      <ArrowRight size={14} style={{ color: '#38bdf8' }} />
                    </div>
                  </div>
                </div>

                {/* Rodapé com Botão Voltar & Ações Rápidas */}
                <div style={{
                  padding: '0.65rem 0.85rem',
                  borderTop: '1px solid #334155',
                  backgroundColor: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
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
                    <ChevronLeft size={16} />
                    <span>Voltar à lista de estruturas</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={handleCenterMap}
                      style={{
                        padding: '0.3rem 0.6rem',
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid #38bdf8',
                        borderRadius: '4px',
                        color: '#38bdf8',
                        fontSize: '0.67rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Centralizar no mapa Leaflet"
                    >
                      <Crosshair size={12} />
                      <span>Focar</span>
                    </button>
                    <button
                      onClick={() => handleNavigate('campo')}
                      style={{
                        padding: '0.3rem 0.6rem',
                        backgroundColor: '#0284c7',
                        border: '1px solid #38bdf8',
                        borderRadius: '4px',
                        color: '#ffffff',
                        fontSize: '0.67rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Iniciar nova coleta de campo para esta estrutura"
                    >
                      <ClipboardCheck size={12} />
                      <span>Vistoria</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#94a3b8',
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

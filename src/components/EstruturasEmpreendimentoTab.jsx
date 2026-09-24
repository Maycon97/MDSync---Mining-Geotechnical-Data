import React, { useState, useMemo } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { storageService } from '../services/storageService';
import { 
  Building2, 
  Search, 
  Plus, 
  ArrowRight, 
  Trash2, 
  Settings, 
  MapPin, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Edit3, 
  X, 
  Layers, 
  FileText,
  Compass,
  Eye,
  Sliders
} from 'lucide-react';

export const EstruturasEmpreendimentoTab = ({ onNavigateTab }) => {
  const { instruments = [], activeStructureId, selectStructure, setSystemToast } = useGeotechData();
  const [estruturas, setEstruturas] = useState(() => storageService.getEstruturasEmpreendimento());
  const [selectedId, setSelectedId] = useState(() => {
    const list = storageService.getEstruturasEmpreendimento();
    return list[0]?.id || 'B1';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');

  // Modais de Criação e Edição
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEstrutura, setEditingEstrutura] = useState(null);
  const [formData, setFormData] = useState({
    sigla: '',
    nome: '',
    tipo: 'BARRAGEM',
    faseProjeto: 'Em Operação',
    tipoSecao: 'Terra compactada com enrocamento',
    tipoEstrutura: 'Barragem de Rejeitos',
    finalidade: 'Contenção de Rejeitos de Minério de Ferro',
    estruturaAssoc: 'Vertedouro e Dique Auxiliar',
    orgaoFiscalizador: 'ANM & FEAM',
    dpa: 'Alto',
    cri: 'Baixo',
    statusDce: 'DCE Válida (Emitida)'
  });

  // Estruturas filtradas por busca e categoria
  const filteredEstruturas = useMemo(() => {
    return estruturas.filter(e => {
      if (selectedCategory !== 'TODAS' && e.tipo !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSigla = e.sigla?.toLowerCase().includes(q);
        const matchNome = e.nome?.toLowerCase().includes(q);
        const matchTipo = e.tipo?.toLowerCase().includes(q);
        if (!matchSigla && !matchNome && !matchTipo) return false;
      }
      return true;
    });
  }, [estruturas, selectedCategory, searchQuery]);

  // Estrutura selecionada ativa
  const selectedEstrutura = useMemo(() => {
    return estruturas.find(e => e.id === selectedId || e.sigla === selectedId) || estruturas[0] || null;
  }, [estruturas, selectedId]);

  // Contagem de instrumentos da estrutura selecionada
  const activeInstrumentsCount = useMemo(() => {
    if (!selectedEstrutura) return 0;
    return instruments.filter(i => {
      const structName = (i.estrutura || '').toUpperCase();
      const norm = selectedEstrutura.nome.toUpperCase();
      const sigla = selectedEstrutura.sigla.toUpperCase();
      return structName.includes(sigla) || structName.includes(norm);
    }).length;
  }, [instruments, selectedEstrutura]);

  // Cores dos badges circulares
  const getBadgeStyle = (tipo) => {
    switch (tipo) {
      case 'BARRAGEM':
        return { bg: 'rgba(56, 189, 248, 0.15)', text: '#0284c7', border: '#38bdf8' };
      case 'CAVA':
        return { bg: 'rgba(168, 85, 247, 0.15)', text: '#9333ea', border: '#a855f7' };
      case 'PILHA':
      default:
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706', border: '#f59e0b' };
    }
  };

  const handleOpenCreate = () => {
    setEditingEstrutura(null);
    setFormData({
      sigla: '',
      nome: '',
      tipo: 'BARRAGEM',
      faseProjeto: 'Em Operação',
      tipoSecao: 'Terra compactada com enrocamento',
      tipoEstrutura: 'Barragem de Rejeitos',
      finalidade: 'Contenção de Rejeitos',
      estruturaAssoc: 'Vertedouro',
      orgaoFiscalizador: 'ANM & FEAM',
      dpa: 'Alto',
      cri: 'Baixo',
      statusDce: 'DCE Válida (Emitida)'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (est) => {
    setEditingEstrutura(est);
    setFormData({
      sigla: est.sigla,
      nome: est.nome,
      tipo: est.tipo || 'BARRAGEM',
      faseProjeto: est.faseProjeto || '',
      tipoSecao: est.tipoSecao || '',
      tipoEstrutura: est.tipoEstrutura || '',
      finalidade: est.finalidade || '',
      estruturaAssoc: est.estruturaAssoc || '',
      orgaoFiscalizador: est.orgaoFiscalizador || 'ANM & FEAM',
      dpa: est.dpa || 'Médio',
      cri: est.cri || 'Baixo',
      statusDce: est.statusDce || 'DCE Válida'
    });
    setModalOpen(true);
  };

  const handleSaveFormData = (e) => {
    e.preventDefault();
    if (!formData.sigla.trim() || !formData.nome.trim()) {
      alert('Por favor, informe a sigla e o nome da estrutura.');
      return;
    }

    const payload = {
      ...formData,
      id: editingEstrutura ? editingEstrutura.id : formData.sigla.toUpperCase(),
      tipoLetra: formData.tipo === 'BARRAGEM' ? 'B' : (formData.tipo === 'CAVA' ? 'C' : 'P')
    };

    storageService.saveEstruturaEmpreendimento(payload);
    const updated = storageService.getEstruturasEmpreendimento();
    setEstruturas(updated);
    setSelectedId(payload.id);
    setModalOpen(false);

    if (setSystemToast) {
      setSystemToast({
        type: 'success',
        message: editingEstrutura ? 'Estrutura atualizada com sucesso!' : 'Nova estrutura cadastrada com sucesso!'
      });
    }
  };

  const handleDeleteEstrutura = (est) => {
    if (window.confirm(`Deseja realmente excluir o cadastro da estrutura "${est.nome}"?`)) {
      storageService.deleteEstruturaEmpreendimento(est.id);
      const updated = storageService.getEstruturasEmpreendimento();
      setEstruturas(updated);
      setSelectedId(updated[0]?.id || null);
      if (setSystemToast) {
        setSystemToast({
          type: 'info',
          message: `Estrutura "${est.nome}" removida do catálogo.`
        });
      }
    }
  };

  const handleGoToMap = (est) => {
    if (selectStructure) {
      selectStructure(est.sigla);
    }
    if (onNavigateTab) {
      onNavigateTab('mapa');
    }
  };

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Barra de Título Superior com Botão (+) (Fiel ao SYSDAM) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.9rem 1.4rem',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Estruturas do empreendimento
          </h1>
          <button
            onClick={handleOpenCreate}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#0284c7',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
              transition: 'transform 0.15s ease'
            }}
            title="Cadastrar nova estrutura"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Empreendimento: <strong style={{ color: 'var(--text-main)' }}>Complexo Itaminas Sarzedo/MG</strong>
          </span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            color: 'var(--primary-accent)'
          }}>
            {estruturas.length} Estruturas
          </span>
        </div>
      </div>

      {/* Grid Principal Mestre-Detalhe (Layout SYSDAM) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 480px) 1fr',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        
        {/* Painel Esquerdo: Minhas Estruturas */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '12px',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.75rem 0' }}>
              Minhas estruturas
            </h2>

            {/* Input de Busca do SYSDAM */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)'
            }}>
              <Search size={15} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  width: '100%'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filtros por Categoria */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '0.65rem' }}>
              {['TODAS', 'BARRAGEM', 'CAVA', 'PILHA'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: selectedCategory === cat ? 'var(--primary-accent)' : 'transparent',
                    color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  {cat === 'TODAS' ? 'Todas' : (cat === 'BARRAGEM' ? 'Barragens' : (cat === 'CAVA' ? 'Cavas' : 'Pilhas'))}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Estruturas com Badges Circulares (Exatamente como SYSDAM) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredEstruturas.map((est) => {
              const isSelected = selectedEstrutura?.id === est.id || selectedEstrutura?.sigla === est.sigla;
              const badge = getBadgeStyle(est.tipo);

              return (
                <div
                  key={est.id || est.sigla}
                  onClick={() => setSelectedId(est.id || est.sigla)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1.25rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    borderLeft: isSelected ? '4px solid #0284c7' : '4px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Badge Circular com Letra (B, C, P) */}
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      backgroundColor: badge.bg,
                      color: badge.text,
                      border: `1px solid ${badge.border}`
                    }}>
                      {est.tipoLetra || (est.tipo === 'BARRAGEM' ? 'B' : (est.tipo === 'CAVA' ? 'C' : 'P'))}
                    </div>

                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'var(--primary-accent)' : 'var(--text-main)'
                    }}>
                      {est.sigla} - {est.nome}
                    </span>
                  </div>

                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? '#0284c7' : 'var(--text-muted)',
                    border: isSelected ? '1px solid #0284c7' : '1px solid var(--border-subtle)'
                  }}>
                    <ArrowRight size={13} />
                  </div>
                </div>
              );
            })}

            {filteredEstruturas.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Nenhuma estrutura encontrada para o filtro.
              </div>
            )}
          </div>
        </div>

        {/* Painel Direito: Detalhes Cadastrais Técnicos da Estrutura Selecionada (SYSDAM) */}
        {selectedEstrutura ? (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '12px',
            border: '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-sm)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {/* Título da Estrutura */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-accent)', margin: 0 }}>
                  {selectedEstrutura.nome}
                </h2>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-accent)',
                  border: '1px solid var(--primary-accent)'
                }}>
                  <ArrowRight size={13} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => handleOpenEdit(selectedEstrutura)}
                  className="btn-secondary"
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Edit3 size={13} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleGoToMap(selectedEstrutura)}
                  className="btn-primary"
                  style={{
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <MapPin size={13} />
                  <span>Ver no Mapa GIS</span>
                </button>
              </div>
            </div>

            {/* Informações Técnicas Conforme SYSDAM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', minWidth: '150px' }}>
                  Fase do projeto:
                </span>
                <span style={{ color: selectedEstrutura.faseProjeto ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {selectedEstrutura.faseProjeto || 'Não cadastrado'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', minWidth: '150px' }}>
                  Tipo seção:
                </span>
                <span style={{ color: selectedEstrutura.tipoSecao ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {selectedEstrutura.tipoSecao || 'Não cadastrado'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', minWidth: '150px' }}>
                  Tipo estrutura:
                </span>
                <span style={{ color: selectedEstrutura.tipoEstrutura ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {selectedEstrutura.tipoEstrutura || 'Não cadastrado'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', minWidth: '150px' }}>
                  Finalidade:
                </span>
                <span style={{ color: selectedEstrutura.finalidade ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {selectedEstrutura.finalidade || 'Não cadastrado'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', minWidth: '150px' }}>
                  Estrutura assoc.:
                </span>
                <span style={{ color: selectedEstrutura.estruturaAssoc ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {selectedEstrutura.estruturaAssoc || 'Não cadastrado'}
                </span>
              </div>

              {/* Órgão Fiscalizador com Botão Gerenciar (SYSDAM) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)', minWidth: '150px' }}>
                  Órgão fiscalizador:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: 'var(--primary-accent)',
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}>
                    {selectedEstrutura.orgaoFiscalizador || 'ANM & FEAM'}
                  </span>
                  <button
                    onClick={() => alert(`Configuração de órgãos reguladores para ${selectedEstrutura.nome}:\n- ANM (Agência Nacional de Mineração)\n- FEAM (Fundação Estadual do Meio Ambiente - MG)\n- SEMAD`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '0.78rem'
                    }}
                  >
                    <span>Gerenciar</span>
                    <Settings size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Painel de Conformidade e Indicadores Geotécnicos */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              marginTop: '0.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dano Potencial (DPA):</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: selectedEstrutura.dpa === 'Alto' ? '#ef4444' : '#f59e0b' }}>
                  {selectedEstrutura.dpa || 'Alto'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Categoria de Risco (CRI):</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981' }}>
                  {selectedEstrutura.cri || 'Baixo'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status DCE (ANM):</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981' }}>
                  {selectedEstrutura.statusDce || 'DCE Válida'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Instrumentos Instalados:</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                  {activeInstrumentsCount} instalados
                </div>
              </div>
            </div>

            {/* Ações da Estrutura (SYSDAM) */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem',
              marginTop: '0.5rem'
            }}>
              <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
                Ações da estrutura
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <button
                  onClick={() => handleDeleteEstrutura(selectedEstrutura)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.18)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
                >
                  <Trash2 size={14} />
                  <span>Excluir</span>
                </button>

                <button
                  onClick={() => onNavigateTab && onNavigateTab('anomalias_inspecoes')}
                  className="btn-subtle"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.8rem'
                  }}
                >
                  <FileText size={14} />
                  <span>Registros e Inspeções</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Selecione uma estrutura para visualizar seus dados técnicos.
          </div>
        )}
      </div>

      {/* Modal de Criação / Edição de Estrutura */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-2xl)',
            width: '100%',
            maxWidth: '540px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                {editingEstrutura ? 'Editar Estrutura' : 'Cadastrar Nova Estrutura'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="btn-icon"
                style={{ width: '28px', height: '28px' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveFormData} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sigla *</label>
                  <input
                    type="text"
                    required
                    value={formData.sigla}
                    onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
                    placeholder="B1"
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Nome da Estrutura *</label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Barragem B1"
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="form-select"
                    style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem' }}
                  >
                    <option value="BARRAGEM">Barragem</option>
                    <option value="CAVA">Cava</option>
                    <option value="PILHA">Pilha de Estéril / Rejeito</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Fase do Projeto</label>
                  <input
                    type="text"
                    value={formData.faseProjeto}
                    onChange={(e) => setFormData({ ...formData, faseProjeto: e.target.value })}
                    placeholder="Em Operação"
                    style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tipo de Seção</label>
                <input
                  type="text"
                  value={formData.tipoSecao}
                  onChange={(e) => setFormData({ ...formData, tipoSecao: e.target.value })}
                  placeholder="Terra compactada homogênea"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Finalidade</label>
                <input
                  type="text"
                  value={formData.finalidade}
                  onChange={(e) => setFormData({ ...formData, finalidade: e.target.value })}
                  placeholder="Contenção de Rejeitos de Minério de Ferro"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Estruturas Associadas</label>
                <input
                  type="text"
                  value={formData.estruturaAssoc}
                  onChange={(e) => setFormData({ ...formData, estruturaAssoc: e.target.value })}
                  placeholder="Vertedouro e Dique Auxiliar"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.6rem',
                marginTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.75rem'
              }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.45rem 1.1rem', fontSize: '0.8rem' }}
                >
                  Salvar Estrutura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

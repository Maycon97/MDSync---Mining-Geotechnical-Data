import React, { useState, useMemo, useEffect } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { storageService } from '../services/storageService';
import { StructureLocationPickerModal } from './StructureLocationPickerModal';
import { 
  QGIS_PIN_COLORS, 
  resolveStructureDefaultColor, 
  createQgisPinSvg 
} from '../utils/qgisPinFormatter';
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
  Sliders,
  Navigation,
  Globe,
  Crosshair
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
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [directPickerEstrutura, setDirectPickerEstrutura] = useState(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);

  // Sincronizar catálogo quando houver alterações em outras abas
  useEffect(() => {
    const handleChanged = () => {
      setEstruturas(storageService.getEstruturasEmpreendimento());
    };
    window.addEventListener('mdsync:estruturas-changed', handleChanged);
    return () => window.removeEventListener('mdsync:estruturas-changed', handleChanged);
  }, []);

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
    statusDce: 'DCE Válida (Emitida)',
    lat: '',
    lon: ''
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
    setDirectPickerEstrutura(null);
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
      statusDce: 'DCE Válida (Emitida)',
      lat: '',
      lon: '',
      corMarcador: '#ef4444'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (est) => {
    setEditingEstrutura(est);
    setDirectPickerEstrutura(null);
    const lat = est.lat ?? est.coordenadas?.lat ?? '';
    const lon = est.lon ?? est.coordenadas?.lon ?? '';
    setFormData({
      sigla: est.sigla || '',
      nome: est.nome || '',
      tipo: est.tipo || 'BARRAGEM',
      faseProjeto: est.faseProjeto || '',
      tipoSecao: est.tipoSecao || '',
      tipoEstrutura: est.tipoEstrutura || '',
      finalidade: est.finalidade || '',
      estruturaAssoc: est.estruturaAssoc || '',
      orgaoFiscalizador: est.orgaoFiscalizador || 'ANM & FEAM',
      dpa: est.dpa || 'Médio',
      cri: est.cri || 'Baixo',
      statusDce: est.statusDce || 'DCE Válida',
      lat: lat !== undefined && lat !== null ? String(lat) : '',
      lon: lon !== undefined && lon !== null ? String(lon) : '',
      corMarcador: est.corMarcador || resolveStructureDefaultColor(est)
    });
    setModalOpen(true);
  };

  const handleOpenDirectLocationPicker = (est) => {
    setDirectPickerEstrutura(est);
    setLocationPickerOpen(true);
  };

  const handleConfirmLocation = (newCoords) => {
    if (directPickerEstrutura) {
      // Ajuste direto para a estrutura selecionada
      const updated = {
        ...directPickerEstrutura,
        lat: newCoords.lat,
        lon: newCoords.lon,
        corMarcador: newCoords.corMarcador || directPickerEstrutura.corMarcador || resolveStructureDefaultColor(directPickerEstrutura),
        coordenadas: { lat: newCoords.lat, lon: newCoords.lon }
      };
      storageService.saveEstruturaEmpreendimento(updated);
      const list = storageService.getEstruturasEmpreendimento();
      setEstruturas(list);
      setDirectPickerEstrutura(null);
      if (setSystemToast) {
        setSystemToast({
          type: 'success',
          message: `Localização no mapa da estrutura "${updated.nome}" definida com sucesso!`
        });
      }
    } else {
      // Preenchimento no formulário do modal
      setFormData(prev => ({
        ...prev,
        lat: String(newCoords.lat),
        lon: String(newCoords.lon),
        corMarcador: newCoords.corMarcador || prev.corMarcador || '#ef4444'
      }));
      if (setSystemToast) {
        setSystemToast({
          type: 'info',
          message: `Coordenadas e cor do alfinete definidas: Lat ${newCoords.lat}, Lon ${newCoords.lon}`
        });
      }
    }
  };

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não disponível no navegador.');
      return;
    }
    setIsCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsCapturingGps(false);
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        setFormData(prev => ({ ...prev, lat, lon }));
        if (setSystemToast) {
          setSystemToast({
            type: 'success',
            message: `GPS capturado com sucesso: ${lat}, ${lon}`
          });
        }
      },
      (err) => {
        setIsCapturingGps(false);
        alert(`Erro ao capturar GPS: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSaveFormData = (e) => {
    e.preventDefault();
    if (!formData.sigla.trim() || !formData.nome.trim()) {
      alert('Por favor, informe a sigla e o nome da estrutura.');
      return;
    }

    const latNum = (formData.lat !== '' && !isNaN(Number(formData.lat))) ? Number(formData.lat) : undefined;
    const lonNum = (formData.lon !== '' && !isNaN(Number(formData.lon))) ? Number(formData.lon) : undefined;

    const payload = {
      ...formData,
      id: editingEstrutura ? editingEstrutura.id : formData.sigla.toUpperCase(),
      tipoLetra: formData.tipo === 'BARRAGEM' ? 'B' : (formData.tipo === 'CAVA' ? 'C' : 'P'),
      lat: latNum,
      lon: lonNum,
      corMarcador: formData.corMarcador || resolveStructureDefaultColor(formData),
      coordenadas: (latNum !== undefined && lonNum !== undefined) 
        ? { lat: latNum, lon: lonNum } 
        : (editingEstrutura?.coordenadas || undefined)
    };

    storageService.saveEstruturaEmpreendimento(payload);
    const updated = storageService.getEstruturasEmpreendimento();
    setEstruturas(updated);
    setSelectedId(payload.id);
    setModalOpen(false);

    if (setSystemToast) {
      setSystemToast({
        type: 'success',
        message: editingEstrutura 
          ? `Estrutura "${payload.nome}" atualizada com sucesso!` 
          : `Nova estrutura "${payload.nome}" cadastrada e inserida no mapa com sucesso!`
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
    if (!est) return;
    if (selectStructure) {
      selectStructure(est.sigla || est.id);
    }
    const lat = est.lat ?? est.coordenadas?.lat;
    const lon = est.lon ?? est.coordenadas?.lon;
    
    // Se a estrutura ainda não possui coordenadas georreferenciadas salvas, abrir no modo de locação direta no mapa
    if (!lat || !lon) {
      if (onNavigateTab) {
        onNavigateTab('mapa', {
          locateStructureId: est.id || est.sigla
        });
      }
      return;
    }

    if (onNavigateTab) {
      onNavigateTab('mapa', {
        structureId: est.id || est.sigla,
        coords: [Number(lat), Number(lon)],
        zoom: 16
      });
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
            type="button"
            onClick={handleOpenCreate}
            className="btn-structure-add"
            title="Cadastrar nova estrutura (+)"
            aria-label="Cadastrar nova estrutura"
          >
            <span className="icon-plus-animated">
              <Plus size={17} strokeWidth={2.8} />
            </span>
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
      <div className="estruturas-master-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(min(100%, 320px), 480px) 1fr',
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
                    {/* Badge Circular com Letra e Cor Temática do Alfinete QGIS */}
                    {(() => {
                      const estColor = est.corMarcador || resolveStructureDefaultColor(est);
                      return (
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          backgroundColor: `${estColor}22`,
                          color: estColor,
                          border: `1.8px solid ${estColor}`,
                          boxShadow: `0 0 8px ${estColor}44`,
                          flexShrink: 0
                        }}>
                          {est.tipoLetra || (est.tipo === 'BARRAGEM' ? 'B' : (est.tipo === 'CAVA' ? 'C' : 'P'))}
                        </div>
                      );
                    })()}

                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'var(--primary-accent)' : 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: est.corMarcador || resolveStructureDefaultColor(est),
                        boxShadow: `0 0 5px ${est.corMarcador || resolveStructureDefaultColor(est)}`
                      }}></span>
                      <span>{est.sigla} - {est.nome}</span>
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
            {/* Título da Estrutura com Ícone de Alfinete QGIS */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div 
                  title={`Alfinete QGIS (${(selectedEstrutura.corMarcador || resolveStructureDefaultColor(selectedEstrutura)).toUpperCase()})`}
                  style={{ display: 'flex', alignItems: 'center' }}
                  dangerouslySetInnerHTML={{ 
                    __html: createQgisPinSvg({ 
                      color: selectedEstrutura.corMarcador || resolveStructureDefaultColor(selectedEstrutura), 
                      sigla: selectedEstrutura.sigla, 
                      width: 24, 
                      height: 33 
                    }) 
                  }} 
                />
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
                  <span>Ver no Georeferenciamento</span>
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

              {/* Localização Georreferenciada no Mapa & Simbologia QGIS */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginTop: '0.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div 
                    title="Alfinete Cartográfico QGIS"
                    style={{ display: 'flex', alignItems: 'center' }}
                    dangerouslySetInnerHTML={{ 
                      __html: createQgisPinSvg({ 
                        color: selectedEstrutura.corMarcador || resolveStructureDefaultColor(selectedEstrutura), 
                        sigla: selectedEstrutura.sigla, 
                        width: 24, 
                        height: 33 
                      }) 
                    }} 
                  />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Localização no Mapa (Alfinete QGIS)</span>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: selectedEstrutura.corMarcador || resolveStructureDefaultColor(selectedEstrutura),
                        boxShadow: `0 0 6px ${selectedEstrutura.corMarcador || resolveStructureDefaultColor(selectedEstrutura)}`
                      }}></span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {(selectedEstrutura.lat && selectedEstrutura.lon)
                        ? `Lat: ${Number(selectedEstrutura.lat).toFixed(6)} | Lon: ${Number(selectedEstrutura.lon).toFixed(6)} (WGS-84)`
                        : 'Nenhuma coordenada cadastrada para esta estrutura'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(selectedEstrutura.lat && selectedEstrutura.lon) ? (
                    <>
                      <button
                        onClick={() => handleGoToMap(selectedEstrutura)}
                        className="btn-primary"
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <Compass size={13} />
                        <span>Ver no Mapa</span>
                      </button>
                      <button
                        onClick={() => handleOpenDirectLocationPicker(selectedEstrutura)}
                        className="btn-secondary"
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Ajustar coordenadas da estrutura no mapa"
                      >
                        <Edit3 size={13} />
                        <span>Alterar Ponto</span>
                      </button>
                      <button
                        onClick={() => {
                          if (onNavigateTab && selectedEstrutura) {
                            onNavigateTab('mapa', {
                              locateStructureId: selectedEstrutura.id || selectedEstrutura.sigla
                            });
                          }
                        }}
                        className="btn-secondary"
                        style={{
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Ir ao mapa principal e clicar para reposicionar a estrutura"
                      >
                        <Crosshair size={13} />
                        <span>Reposicionar no Mapa</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenDirectLocationPicker(selectedEstrutura)}
                        className="btn-primary"
                        style={{
                          padding: '0.4rem 0.85rem',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#0284c7'
                        }}
                      >
                        <Plus size={14} />
                        <span>Adicionar no Mapa</span>
                      </button>
                      <button
                        onClick={() => {
                          if (onNavigateTab && selectedEstrutura) {
                            onNavigateTab('mapa', {
                              locateStructureId: selectedEstrutura.id || selectedEstrutura.sigla
                            });
                          }
                        }}
                        className="btn-secondary"
                        style={{
                          padding: '0.4rem 0.75rem',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Abrir mapa principal e clicar para definir o local exato"
                      >
                        <Crosshair size={13} />
                        <span>Marcar no Mapa Geral</span>
                      </button>
                    </>
                  )}
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
        <div 
          className="modal-backdrop"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2500,
            padding: '1rem'
          }}
        >
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

              {/* Seção: Simbologia & Cor do Alfinete no Mapa (Padrão QGIS) */}
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.95rem' }}>📍</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Simbologia & Cor do Alfinete (Estilo QGIS)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cor:</span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: 'var(--bg-card)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: formData.corMarcador
                    }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: formData.corMarcador }}></span>
                      <span>{formData.corMarcador.toUpperCase()}</span>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Prévia do Alfinete */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    minWidth: '54px'
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: createQgisPinSvg({ color: formData.corMarcador, sigla: formData.sigla || 'EX', width: 26, height: 36 }) }} />
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>Prévia</span>
                  </div>

                  {/* Paleta Rápida QGIS */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {QGIS_PIN_COLORS.map(c => {
                        const isCurrent = formData.corMarcador.toLowerCase() === c.hex.toLowerCase();
                        return (
                          <button
                            key={c.id}
                            data-color={c.hex}
                            data-testid={`color-swatch-${c.id}`}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, corMarcador: c.hex }))}
                            title={`${c.name} - ${c.desc}`}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: c.hex,
                              border: isCurrent ? '2.5px solid #ffffff' : '1.5px solid rgba(255,255,255,0.3)',
                              boxShadow: isCurrent ? `0 0 10px ${c.hex}, 0 2px 5px rgba(0,0,0,0.6)` : '0 2px 4px rgba(0,0,0,0.35)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transform: isCurrent ? 'scale(1.18)' : 'scale(1)',
                              transition: 'transform 0.15s ease',
                              padding: 0
                            }}
                          >
                            {isCurrent && <span style={{ color: '#ffffff', fontSize: '11px', fontWeight: 900 }}>✓</span>}
                          </button>
                        );
                      })}

                      {/* Seletor Customizado Pipeta */}
                      <label 
                        title="Escolher qualquer cor hexadecimal personalizada..."
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-medium)',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          color: 'var(--text-main)',
                          fontWeight: 600
                        }}
                      >
                        <span>🎨 Custom</span>
                        <input 
                          type="color" 
                          value={formData.corMarcador} 
                          onChange={(e) => setFormData(prev => ({ ...prev, corMarcador: e.target.value }))}
                          style={{
                            width: '20px',
                            height: '20px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: 0,
                            background: 'none'
                          }}
                        />
                      </label>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Escolha a cor do alfinete para marcar esta estrutura no mapa, assim como no software QGIS.
                    </span>
                  </div>
                </div>
              </div>

              {/* Seção: Localização Georreferenciada no Mapa */}
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} style={{ color: 'var(--primary-accent)' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Localização Georreferenciada no Mapa
                    </span>
                  </div>
                  {formData.lat && formData.lon ? (
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={11} /> Coordenadas Definidas
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      color: '#f59e0b',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <AlertTriangle size={11} /> Sem Coordenadas
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Latitude (WGS-84)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                      placeholder="Ex: -20.063824"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        fontSize: '0.8rem',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Longitude (WGS-84)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lon}
                      onChange={(e) => setFormData({ ...formData, lon: e.target.value })}
                      placeholder="Ex: -44.114686"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        fontSize: '0.8rem',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>
                </div>

                {/* Ações Rápidas de Localização */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setDirectPickerEstrutura(null);
                      setLocationPickerOpen(true);
                    }}
                    className="btn-primary"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#0284c7'
                    }}
                  >
                    <Compass size={13} />
                    <span>Marcar Ponto no Mapa</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    disabled={isCapturingGps}
                    className="btn-secondary"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Navigation size={13} />
                    <span>{isCapturingGps ? 'Capturando GPS...' : 'Capturar GPS Atual'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, lat: '-20.082500', lon: '-44.108500' }))}
                    className="btn-secondary"
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)'
                    }}
                    title="Inserir coordenadas centrais do Complexo Minerário Itaminas (Sarzedo/MG)"
                  >
                    <span>Centro Sarzedo</span>
                  </button>
                </div>
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

      {/* Modal Interativo de Marcação de Coordenadas no Mapa */}
      <StructureLocationPickerModal
        isOpen={locationPickerOpen}
        onClose={() => {
          setLocationPickerOpen(false);
          setDirectPickerEstrutura(null);
        }}
        initialCoords={{
          lat: directPickerEstrutura 
            ? (directPickerEstrutura.lat ?? directPickerEstrutura.coordenadas?.lat)
            : formData.lat,
          lon: directPickerEstrutura 
            ? (directPickerEstrutura.lon ?? directPickerEstrutura.coordenadas?.lon)
            : formData.lon
        }}
        structureName={directPickerEstrutura ? directPickerEstrutura.nome : (formData.nome || 'Nova Estrutura')}
        structureSigla={directPickerEstrutura ? directPickerEstrutura.sigla : formData.sigla}
        initialColor={directPickerEstrutura ? (directPickerEstrutura.corMarcador || resolveStructureDefaultColor(directPickerEstrutura)) : (formData.corMarcador || '#ef4444')}
        existingStructures={estruturas}
        onConfirm={handleConfirmLocation}
      />
    </div>
  );
};

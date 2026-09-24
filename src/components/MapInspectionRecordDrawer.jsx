import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  ArrowUpDown, 
  X, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ChevronRight,
  ShieldAlert,
  Camera,
  Layers,
  Sparkles,
  Settings
} from 'lucide-react';

export const MapInspectionRecordDrawer = ({
  isOpen,
  onClose,
  records = [],
  selectedRecord,
  onSelectRecord,
  onOpenNewRecord,
  onOpenSettings,
  onOpenTemplate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'severity' | 'structure'
  const [filterSeverity, setFilterSeverity] = useState('TODAS');

  // Filtragem e ordenação
  const filteredRecords = useMemo(() => {
    let list = records.filter(r => {
      if (filterSeverity !== 'TODAS' && String(r.severidade) !== String(filterSeverity)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = (r.codigo || r.id || '').toLowerCase().includes(q);
        const matchDesc = (r.descricao || '').toLowerCase().includes(q);
        const matchLoc = (r.localizacao || '').toLowerCase().includes(q);
        const matchTipo = (r.tipo || '').toLowerCase().includes(q);
        const matchStruct = (r.estrutura || '').toLowerCase().includes(q);
        if (!matchCode && !matchDesc && !matchLoc && !matchTipo && !matchStruct) return false;
      }
      return true;
    });

    if (sortBy === 'severity') {
      list = [...list].sort((a, b) => (b.severidade || 0) - (a.severidade || 0));
    } else if (sortBy === 'structure') {
      list = [...list].sort((a, b) => (a.estrutura || '').localeCompare(b.estrutura || ''));
    } else {
      // Recent
      list = [...list].sort((a, b) => new Date(b.dataIdentificacao || 0) - new Date(a.dataIdentificacao || 0));
    }

    return list;
  }, [records, searchQuery, sortBy, filterSeverity]);

  if (!isOpen) return null;

  const totalCount = records.length;
  const filteredCount = filteredRecords.length;

  return (
    <div style={{
      position: 'absolute',
      top: '72px',
      left: '12px',
      bottom: '16px',
      width: '380px',
      maxWidth: 'calc(100vw - 24px)',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: '14px',
      border: '1px solid var(--border-medium)',
      boxShadow: 'var(--shadow-2xl)',
      zIndex: 1050,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      backdropFilter: 'blur(20px)'
    }}>
      {/* Topo da Gaveta: Busca, Ordenação e Contadores (SYSDAM) */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Registros Georreferenciados
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.15rem 0.5rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--primary-accent)',
              fontFamily: 'var(--font-mono)'
            }}>
              {filteredCount}/{totalCount}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {onOpenNewRecord && (
              <button
                onClick={onOpenNewRecord}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.35)'
                }}
                title="Cadastrar novo registro avulso"
              >
                <Plus size={16} />
              </button>
            )}

            {onOpenTemplate && (
              <button
                onClick={onOpenTemplate}
                className="btn-icon"
                style={{ width: '28px', height: '28px' }}
                title="Configurar Template do Identificador"
              >
                <Sparkles size={14} style={{ color: '#7c3aed' }} />
              </button>
            )}

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="btn-icon"
                style={{ width: '28px', height: '28px' }}
                title="Regras operacionais de inspeção"
              >
                <Settings size={14} />
              </button>
            )}

            <button
              onClick={onClose}
              className="btn-icon"
              style={{ width: '28px', height: '28px' }}
              title="Fechar gaveta de registros"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Input de Busca do SYSDAM */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0.35rem 0.65rem',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)'
        }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Pesquise um registro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.78rem',
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

        {/* Linha de Ordenação & Filtro Rápido */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Severidade:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              style={{
                fontSize: '0.72rem',
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)'
              }}
            >
              <option value="TODAS">Todas</option>
              <option value="1">Baixo (1)</option>
              <option value="2">Médio (2)</option>
              <option value="3">Alto (3)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Ordem:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                fontSize: '0.72rem',
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)'
              }}
            >
              <option value="recent">Mais Recentes</option>
              <option value="severity">Maior Severidade</option>
              <option value="structure">Estrutura</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Cards com Thumbnails (Screenshot 4) */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        divideY: '1px solid var(--border-subtle)'
      }}>
        {filteredRecords.map((item) => {
          const isSelected = selectedRecord?.id === item.id;
          const severityLabel = item.severidade === 3 ? 'Alto: 3' : (item.severidade === 2 ? 'Médio: 2' : 'Baixo: 1');
          const severityClass = item.severidade === 3 ? 'badge-emergencia' : (item.severidade === 2 ? 'badge-atencao' : 'badge-normal');

          return (
            <div
              key={item.id}
              onClick={() => onSelectRecord(item)}
              style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                borderLeft: isSelected ? '4px solid #0284c7' : '4px solid transparent',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Thumbnail / Foto */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {item.fotoUrl ? (
                  <img
                    src={item.fotoUrl}
                    alt={item.tipo || 'Ocorrência'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-faint)',
                    gap: '2px'
                  }}>
                    <Camera size={20} />
                    <span style={{ fontSize: '0.62rem', fontWeight: 600 }}>Foto</span>
                  </div>
                )}
                {/* Badge de severidade flutuante sobre a foto */}
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  padding: '1px 3px',
                  borderRadius: '3px',
                  backgroundColor: item.severidade === 3 ? '#ef4444' : (item.severidade === 2 ? '#f59e0b' : '#10b981'),
                  color: '#ffffff'
                }}>
                  {item.severidade || 1}
                </div>
              </div>

              {/* Informações Textuais (SYSDAM) */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.3px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.estrutura || 'Estrutura Geotécnica'}
                </div>

                <div style={{
                  fontSize: '0.72rem',
                  color: 'var(--primary-accent)',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.localizacao || 'Localização Geral'} &gt; {item.tipo || 'Ocorrência'}
                </div>

                <h4 style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.codigo || item.id} - {item.tipo || 'Ocorrência'}
                </h4>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginTop: '3px',
                  flexWrap: 'wrap'
                }}>
                  <span className={`badge-status ${severityClass}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>
                    {severityLabel}
                  </span>

                  {/* Etiquetas Operacionais Padrão SYSDAM */}
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.3rem',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#0284c7'
                  }} title="Ponto Vistoriado">
                    PV
                  </span>

                  {item.status && (
                    <span style={{
                      fontSize: '0.62rem',
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '0.1rem 0.3rem',
                      borderRadius: '3px'
                    }}>
                      {item.status}
                    </span>
                  )}
                </div>

                <div style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-faint)',
                  marginTop: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Clock size={11} />
                  <span>
                    Criado em {item.dataIdentificacao || '2026-09-18'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredRecords.length === 0 && (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Nenhum registro encontrado com os filtros aplicados.
          </div>
        )}
      </div>
    </div>
  );
};

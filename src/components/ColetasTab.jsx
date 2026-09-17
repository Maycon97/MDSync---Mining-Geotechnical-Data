import React, { useState, useMemo, useEffect } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  ClipboardEdit, 
  CheckCircle2, 
  Clock, 
  Send, 
  Plus, 
  Search, 
  Filter, 
  Camera, 
  MapPin, 
  Calendar, 
  UserCheck, 
  FileText, 
  ArrowRight,
  RefreshCw,
  Eye,
  AlertTriangle,
  X
} from 'lucide-react';

export const ColetasTab = ({ onNavigateTab, initialSubTab, defaultSubTab }) => {
  const { coletas = [], structures = [], isOnline, showToast, addColeta } = useGeotechData();
  
  const [subTab, setSubTab] = useState(defaultSubTab || initialSubTab || 'concluidas'); // 'concluidas' | 'preenchimento' | 'fila'

  useEffect(() => {
    if (defaultSubTab || initialSubTab) {
      setSubTab(defaultSubTab || initialSubTab);
    }
  }, [defaultSubTab, initialSubTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStructure, setSelectedStructure] = useState('TODAS');
  const [selectedDetailColeta, setSelectedDetailColeta] = useState(null);

  // Filtragem
  const filteredColetas = useMemo(() => {
    let targetStatus = 'CONCLUIDA';
    if (subTab === 'preenchimento') targetStatus = 'EM_PREENCHIMENTO';
    if (subTab === 'fila') targetStatus = 'FILA_INTEGRACAO';

    return coletas.filter(item => {
      if (item.status !== targetStatus) return false;

      if (selectedStructure !== 'TODAS') {
        const itemStruct = (item.estrutura || '').toUpperCase().replace(/\s+/g, '_');
        const selected = selectedStructure.toUpperCase().replace(/\s+/g, '_');
        if (!itemStruct.includes(selected) && !selected.includes(itemStruct)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${item.codigoColeta || ''} ${item.titulo || ''} ${item.estrutura || ''} ${item.usuario || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [coletas, subTab, selectedStructure, searchQuery]);

  const concluidasCount = coletas.filter(c => c.status === 'CONCLUIDA').length;
  const preenchimentoCount = coletas.filter(c => c.status === 'EM_PREENCHIMENTO').length;
  const filaCount = coletas.filter(c => c.status === 'FILA_INTEGRACAO').length;

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Cabeçalho da Aba */}
      <div className="card-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(251, 191, 36, 0.15)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ClipboardEdit size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Gestão de Coletas de Campo (InspectApp)
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Acompanhamento de formulários finalizados, rascunhos em preenchimento e fila de integração offline.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('campo')}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', padding: '0.5rem 1.1rem', backgroundColor: '#f59e0b' }}
          >
            <Plus size={16} />
            <span>Nova Coleta em Campo</span>
          </button>
        </div>
      </div>

      {/* Sub-abas: Concluídas, Em Preenchimento, Fila de Integração */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.25rem'
      }}>
        <button
          onClick={() => setSubTab('concluidas')}
          style={{
            padding: '0.65rem 1.1rem',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            backgroundColor: subTab === 'concluidas' ? 'var(--bg-surface)' : 'transparent',
            color: subTab === 'concluidas' ? '#10b981' : 'var(--text-muted)',
            borderBottom: subTab === 'concluidas' ? '2.5px solid #10b981' : '2.5px solid transparent',
            fontWeight: subTab === 'concluidas' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CheckCircle2 size={16} />
          <span>Concluídas</span>
          <span style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.1rem 0.45rem',
            borderRadius: '10px'
          }}>
            {concluidasCount}
          </span>
        </button>

        <button
          onClick={() => setSubTab('preenchimento')}
          style={{
            padding: '0.65rem 1.1rem',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            backgroundColor: subTab === 'preenchimento' ? 'var(--bg-surface)' : 'transparent',
            color: subTab === 'preenchimento' ? '#f59e0b' : 'var(--text-muted)',
            borderBottom: subTab === 'preenchimento' ? '2.5px solid #f59e0b' : '2.5px solid transparent',
            fontWeight: subTab === 'preenchimento' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Clock size={16} />
          <span>Em Preenchimento</span>
          <span style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.1rem 0.45rem',
            borderRadius: '10px'
          }}>
            {preenchimentoCount}
          </span>
        </button>

        <button
          onClick={() => setSubTab('fila')}
          style={{
            padding: '0.65rem 1.1rem',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            backgroundColor: subTab === 'fila' ? 'var(--bg-surface)' : 'transparent',
            color: subTab === 'fila' ? '#ef4444' : 'var(--text-muted)',
            borderBottom: subTab === 'fila' ? '2.5px solid #ef4444' : '2.5px solid transparent',
            fontWeight: subTab === 'fila' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Send size={16} />
          <span>Fila de Integração</span>
          <span style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.1rem 0.45rem',
            borderRadius: '10px'
          }}>
            {filaCount}
          </span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="card-panel" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '220px' }}>
            <Filter size={15} style={{ color: 'var(--text-muted)' }} />
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
              {structures.map(st => (
                <option key={st.id} value={st.id}>{st.nome}</option>
              ))}
            </select>
          </div>

          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por código, título ou técnico..."
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

      {/* Lista de Cards de Coletas */}
      {filteredColetas.length === 0 ? (
        <div className="card-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <ClipboardEdit size={28} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
            Nenhuma coleta nesta categoria
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 1.25rem' }}>
            Utilize o botão abaixo para abrir o formulário Inspect de campo e registrar novas medições e fotos.
          </p>
          <button
            onClick={() => onNavigateTab('campo')}
            className="btn-primary"
            style={{ fontSize: '0.82rem', padding: '0.45rem 1.25rem' }}
          >
            Iniciar Nova Coleta
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
          {filteredColetas.map(coleta => (
            <div
              key={coleta.id}
              className="card-panel"
              style={{
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px'
                  }}>
                    {coleta.codigoColeta || coleta.id}
                  </span>
                  <span className={coleta.badgeClass} style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                    {coleta.statusLabel || coleta.status}
                  </span>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                  {coleta.titulo}
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <MapPin size={14} style={{ color: 'var(--primary-accent)' }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{coleta.estrutura}</span>
                </div>

                <div style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  fontSize: '0.74rem',
                  marginBottom: '0.65rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>TÉCNICO</span>
                    <strong style={{ color: 'var(--text-main)' }}>{coleta.usuario}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>DATA / HORA</span>
                    <strong style={{ color: 'var(--text-main)' }}>{coleta.dataHora}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>INSTRUMENTOS</span>
                    <strong style={{ color: '#10b981' }}>{coleta.totalInstrumentosLidos || 0} lidos</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>FOTOS / ANOMALIAS</span>
                    <strong style={{ color: 'var(--text-main)' }}>{coleta.fotosCount || 0} fotos • {coleta.anomaliasDetectadas || 0} anom.</strong>
                  </div>
                </div>

                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  {coleta.observacoes}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.65rem'
              }}>
                <button
                  onClick={() => setSelectedDetailColeta(coleta)}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Eye size={13} />
                  <span>Ver Detalhes</span>
                </button>

                {subTab === 'preenchimento' && (
                  <button
                    onClick={() => onNavigateTab('campo')}
                    className="btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', backgroundColor: '#f59e0b' }}
                  >
                    Retomar Coleta
                  </button>
                )}

                {subTab === 'fila' && (
                  <button
                    onClick={() => {
                      showToast('Coleta sincronizada com a base mestre!', 'success');
                    }}
                    className="btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', backgroundColor: '#ef4444' }}
                  >
                    Transmitir Agora
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal Detalhes */}
      {selectedDetailColeta && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card-panel" style={{ width: '100%', maxWidth: '600px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Detalhes da Coleta: {selectedDetailColeta.codigoColeta || selectedDetailColeta.id}
                </h3>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {selectedDetailColeta.estrutura} • {selectedDetailColeta.dataHora}
                </span>
              </div>
              <button onClick={() => setSelectedDetailColeta(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.82rem' }}>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>Título da Campanha:</strong>
                <p style={{ margin: '2px 0 0', color: 'var(--text-muted)' }}>{selectedDetailColeta.titulo}</p>
              </div>

              <div>
                <strong style={{ color: 'var(--text-main)' }}>Responsável:</strong>
                <p style={{ margin: '2px 0 0', color: 'var(--text-muted)' }}>{selectedDetailColeta.usuario} ({selectedDetailColeta.usuarioCargo || 'Técnico'})</p>
              </div>

              <div>
                <strong style={{ color: 'var(--text-main)' }}>Notas Técnicas de Campo:</strong>
                <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', lineHeight: 1.5 }}>{selectedDetailColeta.observacoes}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setSelectedDetailColeta(null)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

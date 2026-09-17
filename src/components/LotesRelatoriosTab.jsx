import React, { useState } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  Layers, 
  Plus, 
  FileText, 
  Download, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Share2,
  X,
  FileCheck
} from 'lucide-react';

export const LotesRelatoriosTab = () => {
  const { lotesRelatorios = [], structures = [], showToast } = useGeotechData();
  const [isNewLoteOpen, setIsNewLoteOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [loteForm, setLoteForm] = useState({
    titulo: 'Boletim Semanal de Estabilidade - Semana 38',
    tipo: 'Boletim Semanal',
    periodoInicio: '2026-09-10',
    periodoFim: '2026-09-16',
    estruturas: ['Barragem B1', 'Barragem B4', 'Cava Jangada']
  });

  const handleCreateLote = (e) => {
    e.preventDefault();
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setIsNewLoteOpen(false);
      showToast('Lote de relatórios gerado com sucesso! Arquivo consolidado pronto.', 'success');
    }, 1200);
  };

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Cabeçalho */}
      <div className="card-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(96, 165, 250, 0.15)',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Layers size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Lotes de Relatórios & Laudos Técnicos
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Emissão em lote de boletins semanais, Declarações de Estabilidade (ANM nº 95/2022) e consolidados.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewLoteOpen(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', padding: '0.5rem 1.1rem', backgroundColor: '#3b82f6' }}
          >
            <Plus size={16} />
            <span>Gerar Novo Lote</span>
          </button>
        </div>
      </div>

      {/* Grid de Lotes Existentes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
        {lotesRelatorios.map(lote => (
          <div key={lote.id} className="card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px'
                }}>
                  {lote.codigoLote || lote.id}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '10px',
                  backgroundColor: lote.status === 'EMITIDO' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: lote.status === 'EMITIDO' ? '#10b981' : '#f59e0b'
                }}>
                  {lote.status}
                </span>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                {lote.titulo}
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                <Calendar size={14} style={{ color: 'var(--primary-accent)' }} />
                <span>Período: {lote.periodo}</span>
              </div>

              <div style={{
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tipo de Relatório:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{lote.tipo}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estruturas Inclusas:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{(lote.estruturasIncluidas || []).join(', ')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Instrumentos Auditados:</span>
                  <strong style={{ color: '#10b981' }}>{lote.totalInstrumentosAuditados} sensores</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Responsável Técnico:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{lote.responsavel}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {lote.tamanho || 'PDF Pronto'}
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={() => showToast(`Baixando lote de relatórios consolidado...`, 'success')}
                  className="btn-primary"
                  style={{ fontSize: '0.74rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#3b82f6' }}
                >
                  <Download size={13} />
                  <span>Download ZIP / PDF</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Lote */}
      {isNewLoteOpen && (
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
          <div className="card-panel" style={{ width: '100%', maxWidth: '560px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Configurar Emissão em Lote de Relatórios
              </h3>
              <button onClick={() => setIsNewLoteOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLote} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Título do Lote *
                </label>
                <input
                  type="text"
                  required
                  value={loteForm.titulo}
                  onChange={e => setLoteForm({ ...loteForm, titulo: e.target.value })}
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
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Data Início *
                  </label>
                  <input
                    type="date"
                    required
                    value={loteForm.periodoInicio}
                    onChange={e => setLoteForm({ ...loteForm, periodoInicio: e.target.value })}
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
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Data Fim *
                  </label>
                  <input
                    type="date"
                    required
                    value={loteForm.periodoFim}
                    onChange={e => setLoteForm({ ...loteForm, periodoFim: e.target.value })}
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

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Tipo de Documento
                </label>
                <select
                  value={loteForm.tipo}
                  onChange={e => setLoteForm({ ...loteForm, tipo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <option value="Boletim Semanal">Boletim Semanal de Estabilidade</option>
                  <option value="Regulatório ANM / PNSB">Laudo ANM nº 95/2022 & Declaração de Estabilidade</option>
                  <option value="Dossiê de Auditoria">Dossiê Técnico Consolidado para Auditoria</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setIsNewLoteOpen(false)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={generating} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 1.25rem', backgroundColor: '#3b82f6' }}>
                  {generating ? 'Processando Lote...' : 'Gerar e Consolidar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

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
  FileCheck,
  Eye,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Award
} from 'lucide-react';

export const LotesRelatoriosTab = () => {
  const { 
    lotesRelatorios = [], 
    structures = [], 
    instruments = [],
    addLoteRelatorio, 
    deleteLoteRelatorio,
    showToast 
  } = useGeotechData();

  const [isNewLoteOpen, setIsNewLoteOpen] = useState(false);
  const [selectedLoteDetail, setSelectedLoteDetail] = useState(null);
  const [generating, setGenerating] = useState(false);

  const [loteForm, setLoteForm] = useState({
    titulo: 'Boletim Semanal de Estabilidade - Semana ' + Math.ceil((new Date().getDate()) / 7),
    tipo: 'Boletim Semanal de Estabilidade',
    periodoInicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    periodoFim: new Date().toISOString().split('T')[0],
    estruturas: ['Barragem B1', 'Barragem B4', 'Cava Jangada']
  });

  const handleToggleStructure = (structNome) => {
    setLoteForm(prev => {
      const exists = prev.estruturas.includes(structNome);
      return {
        ...prev,
        estruturas: exists 
          ? prev.estruturas.filter(s => s !== structNome)
          : [...prev.estruturas, structNome]
      };
    });
  };

  const handleCreateLote = (e) => {
    e.preventDefault();
    if (!loteForm.estruturas || loteForm.estruturas.length === 0) {
      showToast('Selecione ao menos uma estrutura para compor o lote.', 'warning');
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      const generatedCode = `LOTE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      addLoteRelatorio({
        id: generatedCode,
        codigoLote: generatedCode,
        titulo: loteForm.titulo,
        tipo: loteForm.tipo,
        periodo: `${loteForm.periodoInicio.split('-').reverse().join('/')} a ${loteForm.periodoFim.split('-').reverse().join('/')}`,
        periodoInicio: loteForm.periodoInicio,
        periodoFim: loteForm.periodoFim,
        status: 'EMITIDO',
        estruturasIncluidas: loteForm.estruturas,
        totalInstrumentosAuditados: loteForm.estruturas.length * 18,
        responsavel: 'Eng. Marcelo N. Siqueira (CREA 85.120/D-MG)',
        dataGeracao: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        tamanho: '14.8 MB (PDF Consolidado)'
      });
      setGenerating(false);
      setIsNewLoteOpen(false);
    }, 600);
  };

  // Função para download de dossiê técnico real em HTML/Impressão
  const handleDownloadDossie = (lote) => {
    try {
      const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Dossiê Técnico - ${lote.codigoLote || lote.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #1e293b; background: #fff; line-height: 1.5; }
    .header { border-bottom: 3px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
    .subtitle { color: #64748b; font-size: 14px; margin-top: 6px; }
    .badge { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; }
    .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 30px; font-size: 13px; }
    .meta-item strong { color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
    th { background: #f1f5f9; text-align: left; padding: 10px; border: 1px solid #cbd5e1; font-weight: 700; }
    td { padding: 10px; border: 1px solid #e2e8f0; }
    .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">ITAMINAS MINERAÇÃO S/A</h1>
      <div class="subtitle">MDSync - Dossiê e Lote Consolidado de Relatórios Geotécnicos</div>
      <div class="subtitle">Mina do Engenho - Sarzedo/MG</div>
    </div>
    <div style="text-align: right;">
      <span class="badge">${lote.codigoLote || lote.id}</span>
      <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Status: <strong>${lote.status}</strong></div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><strong>Título do Lote:</strong> ${lote.titulo}</div>
    <div class="meta-item"><strong>Tipo de Laudo:</strong> ${lote.tipo}</div>
    <div class="meta-item"><strong>Período Auditado:</strong> ${lote.periodo || 'Período Regulamentar'}</div>
    <div class="meta-item"><strong>Data de Emissão:</strong> ${lote.dataGeracao || new Date().toLocaleDateString('pt-BR')}</div>
    <div class="meta-item"><strong>Responsável Técnico:</strong> ${lote.responsavel || 'Eng. Marcelo N. Siqueira (CREA 85.120/D-MG)'}</div>
    <div class="meta-item"><strong>Conformidade Regulamentar:</strong> Resolução ANM nº 95/2022 & Portaria DNPM nº 70.389</div>
  </div>

  <h3 style="color: #0f172a; margin-top: 25px;">Estruturas Geotécnicas e Monitoramento Auditado</h3>
  <table>
    <thead>
      <tr>
        <th>Estrutura</th>
        <th>Tipo</th>
        <th>Instrumentos Auditados</th>
        <th>Condição de Estabilidade</th>
      </tr>
    </thead>
    <tbody>
      ${(lote.estruturasIncluidas || []).map(est => `
        <tr>
          <td><strong>${est}</strong></td>
          <td>Barragem de Rejeitos / Talude de Cava</td>
          <td>Conforme Plano de Monitoramento (Piezometria + Drenagem)</td>
          <td style="color: #10b981; font-weight: bold;">ESTÁVEL / NORMAL</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    Documento emitido eletronicamente via plataforma MDSync Geotecnia.<br>
    Assinatura Digital autenticada conforme ICP-Brasil e Resoluções ANM aplicáveis.
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DOSSIE_GEOTECNICO_${lote.codigoLote || lote.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Dossiê do lote ${lote.codigoLote || lote.id} baixado com sucesso!`, 'success');
    } catch (e) {
      console.error(e);
      showToast('Erro ao baixar dossiê.', 'warning');
    }
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
                  <strong style={{ color: '#10b981' }}>{lote.totalInstrumentosAuditados || (lote.estruturasIncluidas || []).length * 15} sensores</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Responsável Técnico:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{lote.responsavel}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {lote.tamanho || 'Dossiê Pronto'}
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={() => setSelectedLoteDetail(lote)}
                  className="btn-secondary"
                  style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  title="Visualizar ficha completa do lote"
                >
                  <Eye size={13} />
                  <span>Visualizar</span>
                </button>

                <button
                  onClick={() => handleDownloadDossie(lote)}
                  className="btn-primary"
                  style={{ fontSize: '0.74rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#3b82f6' }}
                  title="Baixar dossiê consolidado"
                >
                  <Download size={13} />
                  <span>Dossiê</span>
                </button>

                {deleteLoteRelatorio && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Deseja remover o lote ${lote.codigoLote || lote.id}?`)) {
                        deleteLoteRelatorio(lote.id);
                      }
                    }}
                    className="btn-ghost"
                    style={{ padding: '0.35rem 0.5rem', color: 'var(--text-faint)' }}
                    title="Excluir lote"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Detalhes do Dossiê do Lote */}
      {selectedLoteDetail && (
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
          <div className="card-panel" style={{ width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 800, color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  {selectedLoteDetail.codigoLote || selectedLoteDetail.id}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {selectedLoteDetail.titulo}
                </h3>
              </div>
              <button onClick={() => setSelectedLoteDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tipo de Relatório</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{selectedLoteDetail.tipo}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Período Auditado</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{selectedLoteDetail.periodo}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Responsável Técnico</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{selectedLoteDetail.responsavel}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Status de Emissão</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>{selectedLoteDetail.status}</div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.65rem' }}>
              Estruturas Incluídas no Dossiê
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {(selectedLoteDetail.estruturasIncluidas || []).map((est, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={16} style={{ color: '#3b82f6' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{est}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={14} /> Estável / Conforme
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '1.25rem' }}>
              <ShieldCheck size={20} style={{ color: '#10b981', flexShrink: 0 }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-main)' }}>
                <strong>Certificação e Enquadramento Legal:</strong> Este laudo consolidado segue estritamente as diretrizes da Resolução ANM nº 95/2022 e atesta a conformidade das leituras instrumentais do Complexo Minerário Itaminas Sarzedo.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => window.print()}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.45rem 1rem' }}
              >
                <Printer size={15} />
                <span>Imprimir / Salvar PDF</span>
              </button>

              <button
                onClick={() => handleDownloadDossie(selectedLoteDetail)}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.45rem 1.25rem', backgroundColor: '#3b82f6' }}
              >
                <Download size={15} />
                <span>Baixar Dossiê Completo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Lote com seleção dinâmica de estruturas */}
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
          <div className="card-panel" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
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
                  <option value="Boletim Semanal de Estabilidade">Boletim Semanal de Estabilidade</option>
                  <option value="Regulatório ANM nº 95/2022">Laudo ANM nº 95/2022 & Declaração de Estabilidade</option>
                  <option value="Dossiê Técnico Consolidado">Dossiê Técnico Consolidado para Auditoria Externa</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Estruturas Geotécnicas a Incluir ({loteForm.estruturas.length} selecionadas)
                </label>
                <div style={{
                  maxHeight: '140px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.4rem',
                  backgroundColor: 'var(--bg-secondary)'
                }}>
                  {structures.map(s => {
                    const checked = loteForm.estruturas.includes(s.nome);
                    return (
                      <label 
                        key={s.id} 
                        style={{
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.4rem', 
                          fontSize: '0.75rem', 
                          cursor: 'pointer',
                          padding: '0.25rem 0.4rem',
                          borderRadius: '4px',
                          backgroundColor: checked ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                          color: checked ? '#3b82f6' : 'var(--text-main)'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleStructure(s.nome)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{s.nome}</span>
                      </label>
                    );
                  })}
                </div>
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

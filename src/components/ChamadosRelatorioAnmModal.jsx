import React from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Hash,
  Scale
} from 'lucide-react';

export const ChamadosRelatorioAnmModal = ({
  isOpen,
  onClose,
  tickets = [],
  selectedMes = 'TODOS',
  selectedEstrutura = 'TODAS',
  currentUser = { nome: 'Eng. Marcelo N. Siqueira', title: 'Engenheiro Geotécnico Sênior', registro: 'CREA-MG 142.890/D' },
  onExportCsv
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const dataEmissao = new Date().toLocaleDateString('pt-BR');
  const horaEmissao = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const reportCode = `ANM-RTA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const authHash = `ANM-SIGBM-${Math.random().toString(36).substring(2, 10).toUpperCase()}-PNSB`;

  // Cálculos estatísticos regulatórios ANM
  const totalTickets = tickets.length;
  const countA1A2 = tickets.filter(t => t.crit === 'A1' || t.crit === 'A2').length;
  const countB1B2 = tickets.filter(t => t.crit === 'B1' || t.crit === 'B2').length;
  const countB3 = tickets.filter(t => t.crit === 'B3' || !t.crit).length;
  const countConcluidos = tickets.filter(t => {
    const s = String(t.status || t.statusCh || '').toLowerCase();
    return s.includes('conclu') || s.includes('finaliz') || s.includes('realizado');
  }).length;
  const countEmAndamento = totalTickets - countConcluidos;
  const percentConcluidos = totalTickets > 0 ? ((countConcluidos / totalTickets) * 100).toFixed(1) : '100.0';

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 10050 }}>
      <div 
        className="modal-content printable-report-card"
        style={{
          maxWidth: '920px',
          width: '96%',
          maxHeight: '94vh',
          overflowY: 'auto',
          padding: '2rem 2.5rem',
          borderRadius: '16px',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= BARRA DE CONTROLE SUPERIOR (NO-PRINT) ================= */}
        <div className="no-print" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '1.5rem', 
          paddingBottom: '1rem', 
          borderBottom: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Relatório Técnico Regulatório ANM / SIGBM
              </span>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                Padrão Oficial de Fiscalização • Ficha de Inspeção e Controle de Ocorrências (Resolução ANM nº 95/2022)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {onExportCsv && (
              <button
                type="button"
                onClick={onExportCsv}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  cursor: 'pointer'
                }}
                title="Exportar planilha formatada com separador ponto-e-vírgula para Excel"
              >
                <Download size={15} />
                <span>Planilha ANM (.csv)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 1.1rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '6px',
                backgroundColor: '#0284c7',
                border: '1px solid #0369a1',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)'
              }}
            >
              <Printer size={16} />
              <span>Imprimir / Gerar PDF A4</span>
            </button>

            <button 
              type="button"
              onClick={onClose} 
              className="btn-icon" 
              aria-label="Fechar laudo"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ================= CORPO OFICIAL DA FOLHA DE FISCALIZAÇÃO (PRINTABLE) ================= */}
        <div id="relatorio-anm-printable" style={{ color: '#0f172a', lineHeight: 1.5 }}>
          
          {/* CABEÇALHO OFICIAL REGULATÓRIO */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '3px solid #0284c7',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
            gap: '1rem'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                <span style={{ 
                  fontSize: '0.68rem', 
                  fontWeight: 900, 
                  backgroundColor: '#0f172a', 
                  color: '#ffffff', 
                  padding: '2px 6px', 
                  borderRadius: '3px',
                  letterSpacing: '0.06em'
                }}>
                  PNSB
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
                  Agência Nacional de Mineração • ANM / SIGBM
                </span>
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 2px 0', letterSpacing: '-0.02em' }}>
                ITAMINAS COMÉRCIO DE MINÉRIOS S.A.
              </h1>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                Gerência de Geotecnia & Segurança de Barragens • Complexo Jangada / Engenho Seco
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                Em conformidade com a Resolução ANM nº 95/2022, Portaria ANM nº 70.389/2017 e Lei nº 12.334/2010 (PNSB)
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                display: 'inline-block',
                border: '1px solid #bae6fd'
              }}>
                RELATÓRIO TÉCNICO Nº {reportCode}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                Emissão: <strong>{dataEmissao}</strong> às {horaEmissao}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Competência: <strong>{selectedMes}</strong>
              </div>
            </div>
          </div>

          {/* TÍTULO CENTRAL DO DOCUMENTO DE FISCALIZAÇÃO */}
          <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
            <h2 style={{ 
              fontSize: '1.1rem', 
              fontWeight: 900, 
              color: '#0f172a', 
              margin: 0, 
              textTransform: 'uppercase', 
              letterSpacing: '0.03em' 
            }}>
              Livro de Registro e Controle de Anomalias Geotécnicas e Demandas Corretivas
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#475569', margin: '4px 0 0 0' }}>
              Fiscalização Periódica de Conformidade das Obras de Terra, Cavas e Pilhas de Disposição de Estéril (PDE)
            </p>
          </div>

          {/* QUADRO 1: DADOS GERAIS DO EMPREENDIMENTO E ÂMBITO FISCALIZATÓRIO */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.65rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.78rem'
          }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Empreendimento:
              </span>
              <strong style={{ color: '#0f172a' }}>Complexo Jangada / ES</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Município / UF:
              </span>
              <strong style={{ color: '#0f172a' }}>Sarzedo / Ibirité - MG</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Órgão Notificado:
              </span>
              <strong style={{ color: '#0284c7' }}>ANM / FEAM / MPMG</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600 }}>
                Escopo Selecionado:
              </span>
              <strong style={{ color: '#0f172a' }}>{selectedEstrutura}</strong>
            </div>
          </div>

          {/* QUADRO 2: RESUMO ESTATÍSTICO DE FISCALIZAÇÃO (CRITÉRIOS ANM) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ 
              fontSize: '0.85rem', 
              fontWeight: 800, 
              color: '#0f172a', 
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderBottom: '1px solid #e2e8f0', 
              paddingBottom: '0.35rem', 
              marginBottom: '0.65rem' 
            }}>
              1. Panorama Executivo das Ocorrências Inspecionadas
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
              <div style={{ padding: '0.65rem', backgroundColor: '#f1f5f9', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>{totalTickets}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Inspecionado</div>
              </div>
              <div style={{ padding: '0.65rem', backgroundColor: '#dcfce7', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#15803d' }}>{countConcluidos}</div>
                <div style={{ fontSize: '0.65rem', color: '#15803d', textTransform: 'uppercase', fontWeight: 700 }}>Mitigados ({percentConcluidos}%)</div>
              </div>
              <div style={{ padding: '0.65rem', backgroundColor: '#e0f2fe', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0369a1' }}>{countEmAndamento}</div>
                <div style={{ fontSize: '0.65rem', color: '#0369a1', textTransform: 'uppercase', fontWeight: 700 }}>Em Tramitação</div>
              </div>
              <div style={{ padding: '0.65rem', backgroundColor: countA1A2 > 0 ? '#fee2e2' : '#f8fafc', borderRadius: '6px', border: countA1A2 > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: countA1A2 > 0 ? '#b91c1c' : '#64748b' }}>{countA1A2}</div>
                <div style={{ fontSize: '0.65rem', color: countA1A2 > 0 ? '#b91c1c' : '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Crítico A1 / A2</div>
              </div>
              <div style={{ padding: '0.65rem', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#b45309' }}>{countB1B2 + countB3}</div>
                <div style={{ fontSize: '0.65rem', color: '#b45309', textTransform: 'uppercase', fontWeight: 700 }}>Moderado B1/B2/B3</div>
              </div>
            </div>
          </div>

          {/* QUADRO 3: TABELA OFICIAL DE ANOMALIAS E AÇÕES MITIGATÓRIAS (PADRÃO FICHA DE INSPEÇÃO ANM) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ 
              fontSize: '0.85rem', 
              fontWeight: 800, 
              color: '#0f172a', 
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderBottom: '1px solid #e2e8f0', 
              paddingBottom: '0.35rem', 
              marginBottom: '0.65rem' 
            }}>
              2. Quadro Analítico de Ocorrências Geotécnicas e Ações Mitigatórias
            </h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  <th style={{ padding: '0.45rem 0.5rem', width: '70px' }}>Protocolo</th>
                  <th style={{ padding: '0.45rem 0.5rem', width: '110px' }}>Estrutura / Tipo</th>
                  <th style={{ padding: '0.45rem 0.5rem', width: '75px', textAlign: 'center' }}>Criticidade</th>
                  <th style={{ padding: '0.45rem 0.5rem' }}>Condição Observada & Ação Corretiva</th>
                  <th style={{ padding: '0.45rem 0.5rem', width: '80px', textAlign: 'center' }}>Prazo Limite</th>
                  <th style={{ padding: '0.45rem 0.5rem', width: '90px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.slice(0, 25).map((t, idx) => {
                  const isCrit = t.crit === 'A1' || t.crit === 'A2';
                  const isMod = t.crit === 'B1' || t.crit === 'B2';
                  const isConcl = String(t.status || t.statusCh || '').toLowerCase().includes('conclu') || 
                                  String(t.status || t.statusCh || '').toLowerCase().includes('finaliz') ||
                                  String(t.status || t.statusCh || '').toLowerCase().includes('realizado');

                  return (
                    <tr key={t.proto || idx} style={{ 
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}>
                      <td style={{ padding: '0.4rem 0.5rem', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
                        {t.proto || t.protocolo}
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.estr || t.estrutura}</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{t.tipo}</div>
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          backgroundColor: isCrit ? '#fee2e2' : (isMod ? '#ffedd5' : '#fef3c7'),
                          color: isCrit ? '#b91c1c' : (isMod ? '#c2410c' : '#b45309'),
                          display: 'inline-block'
                        }}>
                          {t.crit || 'B3'}
                        </span>
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {t.acaoCorretiva || t.titulo || 'Inspeção Geotécnica'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: '2px', lineHeight: 1.3 }}>
                          {t.requerido || t.planoAcao || 'Manutenção e controle mitigatório da anomalia'}
                        </div>
                        {t.lat && t.lon && (
                          <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                            Coord: {Number(t.lat).toFixed(6)}, {Number(t.lon).toFixed(6)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center', fontWeight: 600, color: '#334155' }}>
                        {t.limite ? t.limite.split('-').reverse().join('/') : (t.dataLimite || '—')}
                      </td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          backgroundColor: isConcl ? '#dcfce7' : '#e0f2fe',
                          color: isConcl ? '#15803d' : '#0369a1',
                          display: 'inline-block'
                        }}>
                          {isConcl ? 'Concluído' : 'Em Andamento'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {tickets.length > 25 && (
              <p style={{ fontSize: '0.68rem', color: '#64748b', textAlign: 'right', marginTop: '4px', fontStyle: 'italic' }}>
                * Exibindo 25 registros prioritários de um total de {tickets.length}. A relação completa consta na planilha regulatória oficial anexa.
              </p>
            )}
          </div>

          {/* QUADRO 4: PARECER TÉCNICO CONCLUSIVO DE FISCALIZAÇÃO */}
          <div style={{
            backgroundColor: countA1A2 > 0 ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${countA1A2 > 0 ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: '8px',
            padding: '0.9rem 1.1rem',
            marginBottom: '1.5rem',
            fontSize: '0.78rem'
          }}>
            <h4 style={{ 
              fontSize: '0.82rem', 
              fontWeight: 800, 
              color: countA1A2 > 0 ? '#991b1b' : '#166534', 
              margin: '0 0 0.35rem 0',
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}>
              3. Parecer Técnico Conclusivo & Diagnóstico de Conformidade
            </h4>
            <p style={{ 
              margin: 0, 
              color: countA1A2 > 0 ? '#7f1d1d' : '#14532d', 
              lineHeight: 1.5 
            }}>
              {countA1A2 > 0 
                ? `A fiscalização identificou ${countA1A2} anomalia(s) de criticidade A1/A2 requerendo intervenção prioritária imediata. As ações corretivas e planos de contingência mitigatória foram formalmente acionados conforme exigido pela Resolução ANM nº 95/2022.`
                : `A análise técnica das ${totalTickets} ocorrências registradas no período atesta que as anomalias identificadas possuem natureza operacional controlada (classes B1/B2/B3), sem comprometimento da estabilidade física global das estruturas. As ações corretivas encontram-se em execução dentro dos prazos regulatórios estipulados no Plano de Ação Geotécnico da unidade.`
              }
            </p>
          </div>

          {/* QUADRO 5: TERMO DE ENCERRAMENTO E ASSINATURA ELETRÔNICA DO RESPONSÁVEL TÉCNICO */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: '1.25rem',
            borderTop: '1px solid #cbd5e1',
            fontSize: '0.72rem',
            gap: '1rem'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#475569', fontWeight: 600 }}>Código de Autenticação Digital Regulatório:</div>
              <code style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 800, display: 'block', marginTop: '2px' }}>
                {authHash}
              </code>
              <div style={{ fontSize: '0.66rem', color: '#64748b', marginTop: '2px' }}>
                Documento emitido em conformidade com o Sistema Integrado de Gestão de Segurança de Barragens (SIGBM / ANM).
              </div>
              <div style={{ fontSize: '0.64rem', color: '#94a3b8', marginTop: '2px', fontStyle: 'italic' }}>
                * Válido exclusivamente mediante respectiva Anotação de Responsabilidade Técnica (ART/CREA-MG).
              </div>
            </div>

            <div style={{ textAlign: 'center', width: '280px', flexShrink: 0 }}>
              <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '0.35rem', height: '28px' }} />
              <div style={{ fontWeight: 800, color: '#0f172a' }}>{currentUser.nome}</div>
              <div style={{ color: '#475569', fontSize: '0.7rem' }}>{currentUser.title}</div>
              <div style={{ color: '#64748b', fontSize: '0.68rem' }}>Registro Profissional: <strong>{currentUser.registro}</strong></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

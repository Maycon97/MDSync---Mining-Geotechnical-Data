import React, { useState } from 'react';
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Clock, 
  ArrowLeftRight, 
  GitMerge, 
  QrCode, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Share2, 
  Eye, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Plus,
  Compass,
  Sparkles
} from 'lucide-react';

export const MapInspectionDetailPanel = ({
  record,
  onClose,
  onGenerateReport,
  onShowAuditHistory,
  onConvertRecord,
  onMergeRecord,
  onCenterOnMap
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showQrModal, setShowQrModal] = useState(false);
  const [expandAll, setExpandAll] = useState(false);

  // Estados dos acordeões
  const [openSections, setOpenSections] = useState({
    infoGerais: true,
    dadosRegistro: true,
    diagnostico: true,
    planoAcao: false,
    acoesExecutadas: false,
    classificacaoGUT: true,
    estatistica: false,
    localizacao: false,
    regioesAreas: false,
    historico: false
  });

  if (!record) return null;

  const toggleSection = (sectionKey) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleToggleExpandAll = () => {
    const nextState = !expandAll;
    setExpandAll(nextState);
    const updated = {};
    Object.keys(openSections).forEach(k => {
      updated[k] = nextState;
    });
    setOpenSections(updated);
  };

  // Simular fotos da ocorrência
  const photos = record.fotos && record.fotos.length > 0 
    ? record.fotos 
    : (record.fotoUrl ? [record.fotoUrl] : []);

  // Cálculo de GUT
  const g = record.gravidadeGUT || (record.severidade === 3 ? 5 : (record.severidade === 2 ? 3 : 2));
  const u = record.urgenciaGUT || (record.severidade === 3 ? 4 : (record.severidade === 2 ? 3 : 2));
  const t = record.tendenciaGUT || (record.severidade === 3 ? 4 : (record.severidade === 2 ? 2 : 1));
  const scoreGUT = g * u * t;

  const getGutPriority = (score) => {
    if (score >= 60) return { label: 'Crítica / Imediata', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
    if (score >= 30) return { label: 'Alta', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    if (score >= 15) return { label: 'Média', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
    return { label: 'Baixa / Rotina', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
  };

  const gutPriority = getGutPriority(scoreGUT);

  return (
    <div style={{
      position: 'absolute',
      top: '72px',
      left: '12px',
      bottom: '16px',
      width: '400px',
      maxWidth: 'calc(100vw - 24px)',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: '14px',
      border: '1px solid var(--border-medium)',
      boxShadow: 'var(--shadow-2xl)',
      zIndex: 1100,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      backdropFilter: 'blur(20px)'
    }}>
      {/* 1. Header de Foto com Carrossel e Overlay de QR Code (SYSDAM) */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '210px',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {photos.length > 0 ? (
          <img
            src={photos[photoIndex]}
            alt={record.tipo || 'Ocorrência'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-faint)',
            gap: '8px'
          }}>
            <ShieldAlert size={36} style={{ color: '#0284c7' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Registro Fotográfico Geotécnico</span>
          </div>
        )}

        {/* Gradiente escuro para legibilidade */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 40%, rgba(0,0,0,0.8) 100%)'
        }} />

        {/* Tag Superior Esquerda: Código / Título */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          padding: '0.25rem 0.65rem',
          borderRadius: '6px',
          fontSize: '0.78rem',
          fontWeight: 800,
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {record.codigo || record.id}
        </div>

        {/* Botões do Topo Direito (Fechar e QR) */}
        <div style={{ position: 'absolute', top: '10px', right: '12px', display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setShowQrModal(true)}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Ver QR Code do Registro"
          >
            <QrCode size={16} />
          </button>

          <button
            onClick={onClose}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Fechar detalhes"
          >
            <X size={16} />
          </button>
        </div>

        {/* Badge Flutuante de QR Code no Canto Inferior Direito da Foto (Fiel ao SYSDAM) */}
        <div 
          onClick={() => setShowQrModal(true)}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '4px 6px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          title="Clique para ampliar o QR Code do ponto"
        >
          <QrCode size={18} color="#0f172a" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>MDSYNC</span>
            <span style={{ fontSize: '0.5rem', color: '#64748b' }}>QR Ponto</span>
          </div>
        </div>

        {/* Título e Subtítulo Inferior da Foto */}
        <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '85px' }}>
          <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
            {record.estrutura}
          </div>
          <div style={{
            fontSize: '0.95rem',
            fontWeight: 800,
            color: '#ffffff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {record.tipo || 'Ocorrência Geotécnica'}
          </div>
        </div>

        {/* Controles de Navegação de Fotos (< e >) se houver mais de 1 foto */}
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setPhotoIndex((photoIndex - 1 + photos.length) % photos.length)}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* 2. Barra de 4 Ações Rápidas (Exatamente como SYSDAM) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-secondary)',
        padding: '0.5rem 0.25rem'
      }}>
        <button
          onClick={() => onGenerateReport && onGenerateReport(record)}
          className="btn-subtle"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            padding: '0.4rem 0.2rem',
            border: 'none',
            fontSize: '0.66rem',
            fontWeight: 600,
            color: 'var(--text-main)'
          }}
          title="Gerar laudo técnico do registro em PDF"
        >
          <FileText size={17} style={{ color: '#0284c7' }} />
          <span>Gerar relatório</span>
        </button>

        <button
          onClick={() => onShowAuditHistory && onShowAuditHistory(record)}
          className="btn-subtle"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            padding: '0.4rem 0.2rem',
            border: 'none',
            fontSize: '0.66rem',
            fontWeight: 600,
            color: 'var(--text-main)'
          }}
          title="Ver linha do tempo de alterações e auditoria"
        >
          <Clock size={17} style={{ color: '#0284c7' }} />
          <span>Histórico alt.</span>
        </button>

        <button
          onClick={() => onConvertRecord && onConvertRecord(record)}
          className="btn-subtle"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            padding: '0.4rem 0.2rem',
            border: 'none',
            fontSize: '0.66rem',
            fontWeight: 600,
            color: 'var(--text-main)'
          }}
          title="Converter registro em Chamado PCMI / Ordem de Serviço Fluig"
        >
          <ArrowLeftRight size={17} style={{ color: '#0284c7' }} />
          <span>Converter reg.</span>
        </button>

        <button
          onClick={() => onMergeRecord && onMergeRecord(record)}
          className="btn-subtle"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            padding: '0.4rem 0.2rem',
            border: 'none',
            fontSize: '0.66rem',
            fontWeight: 600,
            color: 'var(--text-main)'
          }}
          title="Fundir com outro registro duplicado ou histórico"
        >
          <GitMerge size={17} style={{ color: '#0284c7' }} />
          <span>Fundir registro</span>
        </button>
      </div>

      {/* Botão de Controle "Ver todas v / Recolher todas ^" */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.4rem 1rem',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Detalhamento da Ocorrência
        </span>
        <button
          onClick={handleToggleExpandAll}
          style={{
            background: 'none',
            border: 'none',
            color: '#0284c7',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}
        >
          <span>{expandAll ? 'Recolher todas' : 'Ver todas'}</span>
          {expandAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* 3. Seções em Acordeão (Fiel ao SYSDAM) */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Acordeão: Info. Gerais */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div
            onClick={() => toggleSection('infoGerais')}
            style={{
              padding: '0.65rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              backgroundColor: openSections.infoGerais ? 'var(--bg-secondary)' : 'transparent',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-main)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ChevronDown size={14} style={{ transform: openSections.infoGerais ? 'rotate(0deg)' : 'rotate(-90deg)', transition: '0.2s' }} />
              <span>Info. Gerais</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{record.codigo || record.id}</span>
          </div>

          {openSections.infoGerais && (
            <div style={{ padding: '0.65rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Identificador Único:</span>
                <strong className="font-mono">{record.codigo || record.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Data de Identificação:</span>
                <span>{record.dataIdentificacao || '2026-09-18'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Inspetor Responsável:</span>
                <span>{record.responsavel || 'Engenheiro Geotécnico Sênior'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estrutura Vinculada:</span>
                <strong style={{ color: 'var(--primary-accent)' }}>{record.estrutura}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status Operacional:</span>
                <span className="badge-status badge-atencao" style={{ fontSize: '0.65rem' }}>
                  {record.status || 'Em Monitoramento'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Acordeão: Dados do Registro */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div
            onClick={() => toggleSection('dadosRegistro')}
            style={{
              padding: '0.65rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              backgroundColor: openSections.dadosRegistro ? 'var(--bg-secondary)' : 'transparent',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-main)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ChevronDown size={14} style={{ transform: openSections.dadosRegistro ? 'rotate(0deg)' : 'rotate(-90deg)', transition: '0.2s' }} />
              <span>Dados do Registro</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{record.tipo}</span>
          </div>

          {openSections.dadosRegistro && (
            <div style={{ padding: '0.65rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Descrição Detalhada:</span>
                <div style={{
                  padding: '0.5rem 0.65rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  lineHeight: 1.4
                }}>
                  {record.descricao || 'Ocorrência geotécnica identificada durante ronda visual periódica.'}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cota Topográfica:</span>
                <span>{record.cota || '851.60 m'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Presença de Água / Umidade:</span>
                <span>{record.tipo?.includes('Surgência') ? 'Sim (Vazão Ativa)' : 'Não'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Acordeão: Diagnóstico */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div
            onClick={() => toggleSection('diagnostico')}
            style={{
              padding: '0.65rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              backgroundColor: openSections.diagnostico ? 'var(--bg-secondary)' : 'transparent',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-main)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ChevronDown size={14} style={{ transform: openSections.diagnostico ? 'rotate(0deg)' : 'rotate(-90deg)', transition: '0.2s' }} />
              <span>Diagnóstico</span>
            </div>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '0.1rem 0.35rem',
              borderRadius: '4px',
              backgroundColor: record.severidade === 3 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: record.severidade === 3 ? '#ef4444' : '#f59e0b'
            }}>
              {record.classificacao || 'Nível 1 - Atenção'}
            </span>
          </div>

          {openSections.diagnostico && (
            <div style={{ padding: '0.65rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Severidade:</span>
                <strong style={{ color: record.severidade === 3 ? '#ef4444' : (record.severidade === 2 ? '#f59e0b' : '#10b981') }}>
                  Nível {record.severidade || 1}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Parecer Geotécnico:</span>
                <span>Conforme diretrizes da Portaria ANM 95/2022</span>
              </div>
            </div>
          )}
        </div>

        {/* Acordeão: Classificação GUT (Matriz Gravidade x Urgência x Tendência) */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div
            onClick={() => toggleSection('classificacaoGUT')}
            style={{
              padding: '0.65rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              backgroundColor: openSections.classificacaoGUT ? 'var(--bg-secondary)' : 'transparent',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-main)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ChevronDown size={14} style={{ transform: openSections.classificacaoGUT ? 'rotate(0deg)' : 'rotate(-90deg)', transition: '0.2s' }} />
              <span>Classificação GUT</span>
            </div>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.1rem 0.45rem',
              borderRadius: '4px',
              backgroundColor: gutPriority.bg,
              color: gutPriority.color
            }}>
              Score {scoreGUT} ({gutPriority.label})
            </span>
          </div>

          {openSections.classificacaoGUT && (
            <div style={{ padding: '0.65rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                <div style={{ padding: '0.4rem', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Gravidade</div>
                  <strong style={{ fontSize: '0.95rem', color: '#ef4444' }}>{g}/5</strong>
                </div>
                <div style={{ padding: '0.4rem', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Urgência</div>
                  <strong style={{ fontSize: '0.95rem', color: '#f59e0b' }}>{u}/5</strong>
                </div>
                <div style={{ padding: '0.4rem', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Tendência</div>
                  <strong style={{ fontSize: '0.95rem', color: '#38bdf8' }}>{t}/5</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Acordeão: Localização e Coordenadas */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div
            onClick={() => toggleSection('localizacao')}
            style={{
              padding: '0.65rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              backgroundColor: openSections.localizacao ? 'var(--bg-secondary)' : 'transparent',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-main)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ChevronDown size={14} style={{ transform: openSections.localizacao ? 'rotate(0deg)' : 'rotate(-90deg)', transition: '0.2s' }} />
              <span>Localização Geográfica</span>
            </div>
            <MapPin size={14} style={{ color: 'var(--primary-accent)' }} />
          </div>

          {openSections.localizacao && (
            <div style={{ padding: '0.65rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Latitude:</span>
                <strong className="font-mono">{record.coordenadas?.lat?.toFixed(6) || '-20.063824'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Longitude:</span>
                <strong className="font-mono">{record.coordenadas?.lon?.toFixed(6) || '-44.114686'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Localização Técnica:</span>
                <span>{record.localizacao || 'Crista Central'}</span>
              </div>
              {onCenterOnMap && (
                <button
                  onClick={() => onCenterOnMap(record)}
                  className="btn-secondary"
                  style={{
                    padding: '0.35rem',
                    fontSize: '0.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    marginTop: '4px'
                  }}
                >
                  <Compass size={13} style={{ color: 'var(--primary-accent)' }} />
                  <span>Centralizar Câmera do Satélite</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tags de Rodapé: Acompanhamento (+21 dias) e Badges Padrão SYSDAM */}
        <div style={{
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          flexWrap: 'wrap',
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            color: '#f59e0b',
            border: '1px solid rgba(245, 158, 11, 0.4)'
          }}>
            +21 dias em aberto
          </span>

          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            color: '#a855f7'
          }}>
            PL - Plano de Ação
          </span>

          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: 'rgba(56, 189, 248, 0.2)',
            color: '#38bdf8'
          }}>
            MI - Monitoramento Intensivo
          </span>
        </div>
      </div>

      {/* Modal de QR Code Ampliado (SYSDAM) */}
      {showQrModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '340px',
            width: '100%',
            textAlign: 'center',
            color: '#0f172a',
            boxShadow: 'var(--shadow-2xl)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              QR Code do Ponto
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 1rem 0' }}>
              {record.estrutura} • {record.codigo || record.id}
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              margin: '0 auto 1rem auto'
            }}>
              <QrCode size={140} color="#0f172a" />
            </div>

            <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '1rem', wordBreak: 'break-all' }}>
              ID: <strong>{record.codigo || record.id}</strong>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="btn-primary"
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.82rem' }}
            >
              Fechar QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

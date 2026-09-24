import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, AlertCircle, Key, Radio, Layers, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';

export const InspectionSettingsModal = ({ isOpen, onClose, onSave }) => {
  const [rules, setRules] = useState({
    habilitarRegistroAvulso: true,
    permitirHistoricosOutrosRegistros: false,
    dataCorteHistorico: '2026-01-01',
    exigirPinInspecao: false,
    pinInspecao: '1234',
    habilitarLiveInspection: true
  });

  const [pinEditing, setPinEditing] = useState(false);
  const [newPin, setNewPin] = useState('1234');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const saved = storageService.getInspectionRules();
      setRules(saved);
      setNewPin(saved.pinInspecao || '1234');
      setPinEditing(false);
    }
  }, [isOpen]);

  const handleToggle = (key) => {
    setRules(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    const updated = {
      ...rules,
      pinInspecao: newPin || '1234'
    };
    storageService.saveInspectionRules(updated);
    if (onSave) onSave(updated);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '16px',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-2xl)',
        width: '100%',
        maxWidth: '720px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Cabeçalho */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.1rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Configurações & Parâmetros de Inspeção
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Diretrizes operacionais para registro de anomalias e sincronização mobile (Padrão SYSDAM)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', borderRadius: '8px' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
              style={{
                padding: '0.4rem 1.1rem',
                fontSize: '0.8rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700
              }}
            >
              Salvar Alterações
            </button>
          </div>
        </div>

        {/* Lista de Cards de Configuração (Fiel ao SYSDAM) */}
        <div style={{
          padding: '1.25rem 1.5rem',
          overflowY: 'auto',
          maxHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Card 1: Habilitar a inserção de registro avulso */}
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            border: rules.habilitarRegistroAvulso ? '1px solid var(--primary-accent)' : '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color 0.2s ease'
          }}>
            <h3 style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#0284c7',
              margin: '0 0 0.4rem 0'
            }}>
              Habilitar a inserção de registro avulso
            </h3>
            <p style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
              margin: '0 0 0.85rem 0'
            }}>
              Permite a inserção de registros avulsos no aplicativo. Quando desabilitada, os registros só poderão ser inseridos dentro de uma campanha de inspeção. Esta funcionalidade oferece maior flexibilidade para os inspetores registrarem ocorrências independentes.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                <input
                  type="checkbox"
                  checked={rules.habilitarRegistroAvulso}
                  onChange={() => handleToggle('habilitarRegistroAvulso')}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: rules.habilitarRegistroAvulso ? '#0284c7' : '#64748b',
                  borderRadius: '22px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '',
                    height: '16px',
                    width: '16px',
                    left: rules.habilitarRegistroAvulso ? '21px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.3s'
                  }} />
                </span>
              </label>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {rules.habilitarRegistroAvulso ? 'Registro avulso habilitado' : 'Registro avulso desabilitado'}
              </span>
            </div>
          </div>

          {/* Card 2: Permitir históricos em outros registros */}
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            border: rules.permitirHistoricosOutrosRegistros ? '1px solid var(--primary-accent)' : '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color 0.2s ease'
          }}>
            <h3 style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#0284c7',
              margin: '0 0 0.4rem 0'
            }}>
              Permitir históricos em outros registros
            </h3>
            <p style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
              margin: '0 0 0.65rem 0'
            }}>
              Quando habilitado, passa a ser permitido adicionar históricos em outros registros a partir da data de corte, e os registros com histórico dentro desse período passam a ser exibidos no aplicativo.
            </p>

            {/* Aviso/Alert do SYSDAM */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#f59e0b',
              fontSize: '0.75rem',
              lineHeight: 1.4,
              marginBottom: '0.85rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                Para registros anteriores, crie um novo registro após essa data e use a função de fundir registros para agrupá-los. Em caso de dúvida, contate o suporte.
              </span>
            </div>

            {rules.permitirHistoricosOutrosRegistros && (
              <div style={{ marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Data de corte:</span>
                <input
                  type="date"
                  value={rules.dataCorteHistorico}
                  onChange={(e) => setRules({ ...rules, dataCorteHistorico: e.target.value })}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                <input
                  type="checkbox"
                  checked={rules.permitirHistoricosOutrosRegistros}
                  onChange={() => handleToggle('permitirHistoricosOutrosRegistros')}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: rules.permitirHistoricosOutrosRegistros ? '#0284c7' : '#64748b',
                  borderRadius: '22px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '',
                    height: '16px',
                    width: '16px',
                    left: rules.permitirHistoricosOutrosRegistros ? '21px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.3s'
                  }} />
                </span>
              </label>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {rules.permitirHistoricosOutrosRegistros ? 'Histórico habilitado' : 'Histórico desabilitado'}
              </span>
            </div>
          </div>

          {/* Card 3: Configuração de PIN para inspeções */}
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            border: rules.exigirPinInspecao ? '1px solid var(--primary-accent)' : '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color 0.2s ease'
          }}>
            <h3 style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#0284c7',
              margin: '0 0 0.4rem 0'
            }}>
              Configuração de PIN para inspeções
            </h3>
            <p style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
              margin: '0 0 0.65rem 0'
            }}>
              Exigir PIN (senha) para envio de registros ou campanhas de inspeção do aplicativo mobile para a web. O PIN é individual e intransferível, podendo ser configurado pelo próprio usuário na tela de configurações do portal.{' '}
              <button
                type="button"
                onClick={() => setPinEditing(!pinEditing)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-accent)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                Clique aqui para gerenciar.
              </button>
            </p>

            {pinEditing && (
              <div style={{
                marginBottom: '0.85rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <Key size={16} style={{ color: 'var(--primary-accent)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Novo PIN (4 dígitos):
                </span>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  style={{
                    width: '80px',
                    padding: '0.25rem 0.5rem',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    letterSpacing: '3px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setPinEditing(false);
                    setToastMessage('PIN configurado temporariamente!');
                    setTimeout(() => setToastMessage(''), 2000);
                  }}
                  className="btn-subtle"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                >
                  OK
                </button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                <input
                  type="checkbox"
                  checked={rules.exigirPinInspecao}
                  onChange={() => handleToggle('exigirPinInspecao')}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: rules.exigirPinInspecao ? '#0284c7' : '#64748b',
                  borderRadius: '22px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '',
                    height: '16px',
                    width: '16px',
                    left: rules.exigirPinInspecao ? '21px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.3s'
                  }} />
                </span>
              </label>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {rules.exigirPinInspecao ? 'PIN exigido nas inspeções' : 'PIN não exigido nas inspeções'}
              </span>
            </div>
          </div>

          {/* Card 4: Habilitar Live Inspection */}
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            border: rules.habilitarLiveInspection ? '1px solid var(--primary-accent)' : '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color 0.2s ease'
          }}>
            <h3 style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#0284c7',
              margin: '0 0 0.4rem 0'
            }}>
              Habilitar Live Inspection
            </h3>
            <p style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
              margin: '0 0 0.85rem 0'
            }}>
              Permite a sincronização de inspeções em tempo real no aplicativo para a web, quando houver conexão com a internet. Ajuda a melhorar a eficiência e a precisão das inspeções, além de melhorar a experiência do usuário.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                <input
                  type="checkbox"
                  checked={rules.habilitarLiveInspection}
                  onChange={() => handleToggle('habilitarLiveInspection')}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: rules.habilitarLiveInspection ? '#0284c7' : '#64748b',
                  borderRadius: '22px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '',
                    height: '16px',
                    width: '16px',
                    left: rules.habilitarLiveInspection ? '21px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.3s'
                  }} />
                </span>
              </label>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {rules.habilitarLiveInspection ? 'Live Inspection ativada' : 'Live Inspection desativada'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

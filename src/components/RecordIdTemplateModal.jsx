import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Copy, Sparkles, HelpCircle, Code, ChevronDown, ChevronUp } from 'lucide-react';
import { recordIdTemplateService, TEMPLATE_VARIABLES } from '../services/recordIdTemplateService';
import { storageService } from '../services/storageService';

export const RecordIdTemplateModal = ({ isOpen, onClose, onSave }) => {
  const [template, setTemplate] = useState('');
  const [preview, setPreview] = useState('');
  const [showVariables, setShowVariables] = useState(true);
  const [showAtMenu, setShowAtMenu] = useState(false);
  const [atMenuCoords, setAtMenuCoords] = useState({ top: 0, left: 0 });
  const [toastMessage, setToastMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const saved = storageService.getRecordIdTemplate();
      setTemplate(saved);
      setPreview(recordIdTemplateService.generatePreview(saved));
      setShowAtMenu(false);
    }
  }, [isOpen]);

  // Atualizar preview dinamicamente ao digitar
  const handleTemplateChange = (val) => {
    setTemplate(val);
    setPreview(recordIdTemplateService.generatePreview(val));

    // Detectar digitação de '@'
    if (val.endsWith('@') || val.includes('@')) {
      setShowAtMenu(true);
    } else {
      setShowAtMenu(false);
    }
  };

  // Inserir variável na posição do cursor
  const handleInsertVariable = (token) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart || template.length;
      const end = input.selectionEnd || template.length;
      const textBefore = template.substring(0, start);
      const textAfter = template.substring(end);
      
      // Se estava digitando '@', remove o '@' antes de inserir
      const cleanBefore = textBefore.endsWith('@') ? textBefore.slice(0, -1) : textBefore;
      const newText = cleanBefore + token + textAfter;
      
      setTemplate(newText);
      setPreview(recordIdTemplateService.generatePreview(newText));
      setShowAtMenu(false);

      setTimeout(() => {
        input.focus();
        const nextPos = cleanBefore.length + token.length;
        input.setSelectionRange(nextPos, nextPos);
      }, 50);
    } else {
      const newText = template + token;
      setTemplate(newText);
      setPreview(recordIdTemplateService.generatePreview(newText));
      setShowAtMenu(false);
    }
  };

  const handleSave = () => {
    const cleanTemplate = template.trim() || '{SIGLA_EMPREENDIMENTO} - {NOME_SINTOMA}';
    storageService.saveRecordIdTemplate(cleanTemplate);
    if (onSave) onSave(cleanTemplate);
    onClose();
  };

  const handleCopyPreview = () => {
    navigator.clipboard?.writeText(preview);
    setToastMessage('Copiado para área de transferência!');
    setTimeout(() => setToastMessage(''), 2500);
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
        maxWidth: '560px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Cabeçalho do Modal (Fiel ao SYSDAM) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.1rem 1.4rem',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={onClose}
              className="btn-icon"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                color: 'var(--text-muted)'
              }}
              title="Fechar"
            >
              <X size={18} />
            </button>
            <h2 style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              margin: 0
            }}>
              Identificador do registro
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{
                padding: '0.4rem 0.9rem',
                fontSize: '0.8rem',
                borderRadius: '8px'
              }}
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
                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)'
              }}
            >
              Salvar
            </button>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div style={{
          padding: '1.25rem 1.5rem',
          overflowY: 'auto',
          maxHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem'
        }}>
          {/* Caixa de Instrução com Borda Azul Esquerda (SYSDAM) */}
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            borderLeft: '4px solid #0284c7',
            borderRadius: '0 8px 8px 0',
            fontSize: '0.82rem',
            color: 'var(--text-main)',
            lineHeight: 1.45
          }}>
            Utilize <strong>'@'</strong> para ver as variáveis disponíveis para o template do identificador do registro. Caso não seja informado um template do identificador, será utilizado o formato padrão.
          </div>

          {/* Campo Input de Template */}
          <div style={{ position: 'relative' }}>
            <label style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '0.45rem'
            }}>
              Template do identificador:
            </label>
            <input
              ref={inputRef}
              type="text"
              value={template}
              onChange={(e) => handleTemplateChange(e.target.value)}
              placeholder="{SIGLA_EMPREENDIMENTO} - {NOME_SINTOMA}"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
              }}
            />

            {/* Menu Popup Autocomplete de '@' */}
            {showAtMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 10,
                maxHeight: '180px',
                overflowY: 'auto'
              }}>
                <div style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontWeight: 700
                }}>
                  SELECIONE UMA VARIÁVEL:
                </div>
                {TEMPLATE_VARIABLES.map(v => (
                  <div
                    key={v.token}
                    onClick={() => handleInsertVariable(v.token)}
                    style={{
                      padding: '0.45rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontWeight: 700, color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)' }}>
                      {v.token}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {v.example}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pré-visualização em Tempo Real (Fiel ao SYSDAM) */}
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Pré-visualização:
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '4px'
            }}>
              <span style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-main)'
              }}>
                {preview || 'IT - Erosão'}
              </span>
              <button
                onClick={handleCopyPreview}
                className="btn-subtle"
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Copiar pré-visualização"
              >
                <Copy size={12} />
                <span>Copiar</span>
              </button>
            </div>
            {toastMessage && (
              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                {toastMessage}
              </span>
            )}
          </div>

          {/* Seção Expansível das Variáveis Disponíveis (SYSDAM) */}
          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.75rem'
          }}>
            <button
              onClick={() => setShowVariables(!showVariables)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                padding: '0.2rem 0'
              }}
            >
              <span>{showVariables ? 'Esconder variáveis disponíveis' : 'Mostrar variáveis disponíveis'}</span>
              {showVariables ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {showVariables && (
              <div style={{
                marginTop: '0.65rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem'
              }}>
                {TEMPLATE_VARIABLES.map(v => (
                  <div 
                    key={v.token}
                    onClick={() => handleInsertVariable(v.token)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      cursor: 'pointer',
                      border: '1px solid var(--border-subtle)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary-accent)';
                      e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    }}
                    title="Clique para inserir no template"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {v.token}:
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        color: 'var(--primary-accent)',
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        Inserir +
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      margin: '2px 0 0 0',
                      lineHeight: 1.35
                    }}>
                      {v.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { cookieConsentService, COOKIE_CATEGORIES } from '../services/cookieConsentService';
import { ShieldCheck, Cookie, Settings2, Check, X, ChevronDown, ChevronUp, Lock } from 'lucide-react';

export const CookieConsentBanner = ({ onOpenLegalCenter }) => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState({
    preferences: false,
    analytics: false
  });

  useEffect(() => {
    if (!cookieConsentService.hasConsent()) {
      // Pequeno delay para animação suave após carregamento
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    cookieConsentService.acceptAll();
    setVisible(false);
  };

  const handleAcceptEssential = () => {
    cookieConsentService.acceptEssentialOnly();
    setVisible(false);
  };

  const handleSaveCustom = () => {
    cookieConsentService.savePreferences({
      preferences: prefs.preferences,
      analytics: prefs.analytics
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="cookie-banner-container"
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'calc(100% - 2rem)',
        maxWidth: '960px',
        backgroundColor: 'var(--bg-surface)',
        border: '1.5px solid var(--border-highlight)',
        borderRadius: '14px',
        boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        padding: '1.25rem 1.5rem',
        color: 'var(--text-main)',
        backdropFilter: 'blur(12px)',
        animation: 'cookieBannerSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        
        {/* Ícone e Texto Informativo */}
        <div style={{ display: 'flex', gap: '0.85rem', flex: 1, minWidth: 'min(100%, 360px)' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary-accent-bg)',
            color: 'var(--primary-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Cookie size={22} aria-hidden="true" />
          </div>

          <div>
            <h2
              id="cookie-banner-title"
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: '0 0 0.3rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>Privacidade & Gestão de Cookies (LGPD)</span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                padding: '0.1rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                Lei 13.709/2018
              </span>
            </h2>

            <p id="cookie-banner-desc" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              O <strong>MDSync Geotecnia</strong> utiliza cookies e armazenamento local para garantir a autenticação de técnicos, 
              persistência de inspeções offline e segurança de barragens. Não realizamos rastreamento comercial nem repassamos dados para redes de anúncios.
            </p>

            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
              <button
                type="button"
                onClick={() => onOpenLegalCenter?.('privacidade')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--primary-accent)',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Política de Privacidade
              </button>
              <button
                type="button"
                onClick={() => onOpenLegalCenter?.('termos')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--primary-accent)',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Termos de Uso
              </button>
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>Personalizar</span>
                {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Botões de Ação Imediata */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap',
          alignSelf: 'center',
          marginLeft: 'auto'
        }}>
          <button
            type="button"
            onClick={handleAcceptEssential}
            className="btn-secondary"
            style={{
              padding: '0.55rem 0.9rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: '8px'
            }}
          >
            Apenas Necessários
          </button>

          <button
            type="button"
            onClick={handleAcceptAll}
            className="btn-primary"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Check size={15} aria-hidden="true" />
            <span>Aceitar Todos</span>
          </button>
        </div>
      </div>

      {/* Painel Expansível de Detalhes e Personalização */}
      {showDetails && (
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '0.85rem'
        }}>
          {/* Categoria 1: Necessários */}
          <div style={{
            padding: '0.75rem',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                <Lock size={14} style={{ color: 'var(--primary-accent)' }} />
                <span>{COOKIE_CATEGORIES.NECESSARY.name}</span>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981' }}>Sempre Ativo</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {COOKIE_CATEGORIES.NECESSARY.description}
            </p>
          </div>

          {/* Categoria 2: Preferências */}
          <div style={{
            padding: '0.75rem',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {COOKIE_CATEGORIES.PREFERENCES.name}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.35rem' }}>
                <input
                  type="checkbox"
                  checked={prefs.preferences}
                  onChange={(e) => setPrefs({ ...prefs, preferences: e.target.checked })}
                  style={{ accentColor: 'var(--primary-accent)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ativar</span>
              </label>
            </div>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {COOKIE_CATEGORIES.PREFERENCES.description}
            </p>
          </div>

          {/* Categoria 3: Analíticos */}
          <div style={{
            padding: '0.75rem',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {COOKIE_CATEGORIES.ANALYTICS.name}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.35rem' }}>
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                  style={{ accentColor: 'var(--primary-accent)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ativar</span>
              </label>
            </div>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {COOKIE_CATEGORIES.ANALYTICS.description}
            </p>
          </div>

          {/* Botão Salvar Seleção */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={handleSaveCustom}
              className="btn-primary"
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                borderRadius: '8px'
              }}
            >
              Salvar Minhas Escolhas
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};


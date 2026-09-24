import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { securityShield } from '../services/securityShield';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Capturado erro de renderização:', error, errorInfo);
    
    // Registrar incidente no log de auditoria e segurança
    securityShield.logSecurityEvent('RUNTIME_INCIDENT', {
      errorMessage: error?.message || 'Erro desconhecido',
      componentStack: errorInfo?.componentStack?.slice(0, 500)
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, resetError: this.resetError });
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1.5rem',
          minHeight: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div className="card-panel" style={{
            maxWidth: '560px',
            width: '100%',
            borderColor: 'var(--geo-emergencia, #ef4444)',
            boxShadow: '0 8px 30px rgba(239, 68, 68, 0.15)',
            padding: '2rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--geo-emergencia, #ef4444)'
            }}>
              <AlertTriangle size={26} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Incidente no Módulo Geotécnico
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Ocorreu um erro inesperado ao processar os dados deste módulo. O restante do MDSync continua operando normalmente.
            </p>

            {this.state.error && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: '#f87171',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '1.5rem',
                maxHeight: '120px'
              }}>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={this.resetError}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <RefreshCw size={15} />
                <span>Recarregar Módulo</span>
              </button>

              {this.props.onNavigateHome && (
                <button
                  onClick={() => {
                    this.resetError();
                    this.props.onNavigateHome();
                  }}
                  className="btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Home size={15} />
                  <span>Ir para Início</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

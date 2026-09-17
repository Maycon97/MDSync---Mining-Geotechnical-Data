import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  CheckCircle2, 
  MapPin, 
  Wifi, 
  WifiOff, 
  HardDrive, 
  RotateCw, 
  Smartphone, 
  FileText, 
  Edit3, 
  Clock, 
  QrCode, 
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';

export const InspectHeroCard = ({ onNavigateTab }) => {
  const { currentUser } = useAuth();
  const { 
    isOnline, 
    offlineCount, 
    contratosTerceiros = [], 
    coletas = [], 
    showToast 
  } = useGeotechData();

  const [isUpdatingForms, setIsUpdatingForms] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const contratosCount = contratosTerceiros.length;
  const emPreenchimentoCount = coletas.filter(c => c.status === 'EM_PREENCHIMENTO').length;
  const aguardandoEnvioCount = offlineCount + coletas.filter(c => c.status === 'FILA_INTEGRACAO').length;

  const handleUpdateForms = () => {
    setIsUpdatingForms(true);
    setTimeout(() => {
      setIsUpdatingForms(false);
      showToast('Formulários de campo e parâmetros de ensaio atualizados!', 'success');
    }, 900);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* ============================================================
          CARD SUPERIOR: BEM-VINDO + STATUS INSPECTAPP
          ============================================================ */}
      <div 
        className="card-panel" 
        style={{
          padding: '1.5rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(15, 23, 42, 0.4) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          
          {/* Lado Esquerdo: Identificação e Mensagem */}
          <div style={{ flex: '1 1 340px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
              <div style={{
                position: 'relative',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: '2px solid #10b981',
                padding: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }}>
                {currentUser?.foto ? (
                  <img 
                    src={currentUser.foto} 
                    alt={currentUser.nome} 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1.1rem'
                  }}>
                    {currentUser?.avatar || 'MA'}
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  bottom: '0px',
                  right: '0px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  border: '2px solid var(--bg-surface)'
                }} />
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  Bem-vindo,
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {currentUser?.nome || 'Marcos Alexandre Rodrigues'}
                </h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--primary-accent)', fontWeight: 600 }}>
                  {currentUser?.setor || 'Engenharia Geotécnica & Barragens'} • Itaminas S/A
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
              Tenho algumas informações importantes para você:
            </p>

            {/* Linha de Status de Conectividade & Hardware */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
              
              {/* GPS */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                <div style={{ color: '#10b981' }}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', display: 'block', textTransform: 'uppercase' }}>
                    GPS ATIVADO
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Alta Precisão RTK
                  </span>
                </div>
              </div>

              {/* Wi-Fi / Conexão */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: isOnline ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)'
              }}>
                <div style={{ color: isOnline ? '#10b981' : '#ef4444' }}>
                  {isOnline ? <CheckCircle2 size={16} /> : <WifiOff size={16} />}
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isOnline ? '#10b981' : '#ef4444', display: 'block', textTransform: 'uppercase' }}>
                    {isOnline ? 'WI-FI / 4G ONLINE' : 'MODO OFFLINE'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {isOnline ? 'Sincronização Ativa' : 'Fila local gravando'}
                  </span>
                </div>
              </div>

              {/* Espaço em Disco */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(2, 132, 199, 0.25)'
              }}>
                <div style={{ color: 'var(--primary-accent)' }}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-accent)', display: 'block', textTransform: 'uppercase' }}>
                    ESPAÇO LOCAL
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    14.77 de 51.65 GB Livre
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Lado Direito: Atualização de Formulários & Versão do App */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            minWidth: '220px',
            backgroundColor: 'var(--bg-secondary)',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>
                  ATUALIZAÇÃO DE FORMULÁRIOS
                </span>
                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#10b981' }}>
                  Última Atualização: Hoje
                </span>
              </div>
              <button
                onClick={handleUpdateForms}
                disabled={isUpdatingForms}
                className="btn-primary"
                style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem' }}
              >
                {isUpdatingForms ? 'Atualizando...' : 'ATUALIZAR'}
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>
                  VERSÃO DO APP
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  v2.4 (Build 2026.09.16)
                </span>
              </div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                padding: '0.15rem 0.45rem',
                borderRadius: '8px'
              }}>
                APK Oficial
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================
          GRADE DE ACESSO RÁPIDO INSPECTAPP (4 BOTÕES GRANDES COM BADGES)
          ============================================================ */}
      <div>
        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.75rem 0' }}>
          Gerencie suas atividades através das funcionalidades abaixo:
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.85rem'
        }}>
          
          {/* 1. CONTRATOS (Badge 92) */}
          <button
            onClick={() => onNavigateTab('contratos')}
            style={{
              padding: '1.15rem 1.25rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#10b981', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  CONTRATOS
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Empresas terceirizadas
                </span>
              </div>
            </div>

            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.95rem',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              {contratosCount || 92}
            </div>
          </button>

          {/* 2. EM PREENCHIMENTO (Badge 19) */}
          <button
            onClick={() => onNavigateTab('coletas', 'preenchimento')}
            style={{
              padding: '1.15rem 1.25rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.15)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Edit3 size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f59e0b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  EM PREENCHIMENTO
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Rascunhos de coleta
                </span>
              </div>
            </div>

            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.95rem',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              {emPreenchimentoCount || 19}
            </div>
          </button>

          {/* 3. AGUARDANDO ENVIO (Badge 0) */}
          <button
            onClick={() => onNavigateTab('coletas', 'fila')}
            style={{
              padding: '1.15rem 1.25rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(2, 132, 199, 0.12)',
              border: '1.5px solid rgba(2, 132, 199, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.15)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0284c7', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  AGUARDANDO ENVIO
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Fila de sincronização
                </span>
              </div>
            </div>

            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.95rem',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              {aguardandoEnvioCount}
            </div>
          </button>

          {/* 4. LER UM QR CODE */}
          <button
            onClick={() => setShowQrModal(true)}
            style={{
              padding: '1.15rem 1.25rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(168, 85, 247, 0.12)',
              border: '1.5px solid rgba(168, 85, 247, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(168, 85, 247, 0.15)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#a855f7',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <QrCode size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#a855f7', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  LER UM QR CODE
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Identificar instrumento
                </span>
              </div>
            </div>

            <ArrowRight size={20} style={{ color: '#a855f7' }} />
          </button>

        </div>
      </div>

      {/* MODAL SIMULADOR QR CODE */}
      {showQrModal && (
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
          <div className="card-panel" style={{ width: '100%', maxWidth: '420px', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Leitor de QR Code / Barcode
              </h3>
              <button onClick={() => setShowQrModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{
              width: '200px',
              height: '200px',
              margin: '0 auto 1.25rem',
              borderRadius: '12px',
              border: '2px dashed var(--primary-accent)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              backgroundColor: 'var(--bg-secondary)',
              position: 'relative'
            }}>
              <QrCode size={64} style={{ color: 'var(--primary-accent)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Aponte a câmera para a placa do instrumento
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  setShowQrModal(false);
                  onNavigateTab('campo');
                  showToast('Instrumento INA-108 identificado via QR Code!', 'success');
                }}
                className="btn-primary"
                style={{ width: '100%', fontSize: '0.825rem' }}
              >
                Simular Leitura: Piezômetro INA-108
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="btn-secondary"
                style={{ width: '100%', fontSize: '0.825rem' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

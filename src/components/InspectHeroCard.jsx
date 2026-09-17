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
  X,
  Download,
  Layers,
  Sparkles
} from 'lucide-react';

export const InspectHeroCard = ({ 
  onNavigate, 
  onNavigateTab, 
  onSelectInstrument, 
  onOpenSync 
}) => {
  const { currentUser } = useAuth();
  const { 
    isOnline, 
    offlineCount = 0, 
    contratosTerceiros = [], 
    coletas = [], 
    instruments = [],
    showToast,
    toggleSimulatedOffline 
  } = useGeotechData();

  const [isUpdatingForms, setIsUpdatingForms] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrScanningActive, setQrScanningActive] = useState(false);

  // Unificação de navegação para suportar onNavigateTab e onNavigate
  const navigate = (tabId, subTab = null) => {
    if (onNavigateTab) {
      onNavigateTab(tabId, subTab);
    } else if (onNavigate) {
      onNavigate(tabId, subTab);
    }
  };

  const contratosCount = contratosTerceiros.length;
  const emPreenchimentoCount = coletas.filter(c => c.status === 'EM_PREENCHIMENTO').length;
  const aguardandoEnvioCount = offlineCount + coletas.filter(c => c.status === 'FILA_INTEGRACAO').length;

  const handleUpdateForms = () => {
    setIsUpdatingForms(true);
    setTimeout(() => {
      setIsUpdatingForms(false);
      showToast('Formulários de campo e parâmetros de ensaio atualizados!', 'success');
    }, 800);
  };

  // Amostra de instrumentos para o QR Code
  const qrSampleInstruments = instruments.length > 0 
    ? instruments.slice(0, 5) 
    : [
        { id: 'INA-108', estrutura: 'CAVA_CENTRAL', tipo: 'Piezômetro Pneumático' },
        { id: 'PZ-03', estrutura: 'BARRAGEM_B1', tipo: 'Piezômetro Casagrande' },
        { id: 'NA-04', estrutura: 'PILHA_NORTE', tipo: 'Medidor Nível d\'Água' },
        { id: 'V-01', estrutura: 'DIQUE_SUL', tipo: 'Vertedouro Parshall' }
      ];

  const handleSelectQrInstrument = (inst) => {
    setShowQrModal(false);
    if (onSelectInstrument) {
      onSelectInstrument(inst);
    } else {
      navigate('campo');
    }
    showToast(`Instrumento ${inst.id} (${inst.estrutura || 'Geotecnia'}) identificado via QR Code!`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
      
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
        {/* Marca d'água de engenharia sutil */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          opacity: 0.04,
          pointerEvents: 'none'
        }}>
          <ShieldCheck size={260} />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Lado Esquerdo: Mensagem e Telemetria de Conexão */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                MDSync v2.0 Inspect
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• Itaminas Mineração</span>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
              Bem-vindo, {currentUser?.nome || 'Eng. Marcelo N. Siqueira'}!
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, maxWidth: '650px', lineHeight: 1.4 }}>
              Sistema de telemetria geotécnica, leituras de campo e fiscalização de estruturas.
            </p>

            {/* Chips de Telemetria de Hardware (GPS, Conexão, Armazenamento) */}
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              
              {/* GPS RTK */}
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
                    GPS ATIVO
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Alta Precisão RTK
                  </span>
                </div>
              </div>

              {/* Wi-Fi / Conexão (com Toggle Interativo) */}
              <div 
                onClick={toggleSimulatedOffline}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.12)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  border: isOnline ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(245, 158, 11, 0.35)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={isOnline ? 'Clique para simular modo offline de campo' : 'Modo offline. Clique para reconectar'}
              >
                <div style={{ color: isOnline ? '#10b981' : '#f59e0b' }}>
                  {isOnline ? <CheckCircle2 size={16} /> : <WifiOff size={16} />}
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isOnline ? '#10b981' : '#f59e0b', display: 'block', textTransform: 'uppercase' }}>
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
                  v2.0 GEOTEC
                </span>
              </div>
              <a
                href="./mdsync-geotecnia.apk"
                download="mdsync-geotecnia.apk"
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                title="Baixar instalador APK oficial para Android"
              >
                <Download size={11} />
                <span>APK Oficial</span>
              </a>
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
          
          {/* 1. CONTRATOS (Redireciona para o módulo Contratos de Terceiros) */}
          <button
            onClick={() => navigate('contratos')}
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
              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              textAlign: 'left'
            }}
            title="Abrir Módulo de Contratos de Empresas Terceirizadas"
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
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              border: '1.5px solid rgba(255, 255, 255, 0.2)'
            }}>
              {contratosCount || 5}
            </div>
          </button>

          {/* 2. EM PREENCHIMENTO (Redireciona para Coletas > Sub-aba Em Preenchimento) */}
          <button
            onClick={() => navigate('coletas', 'preenchimento')}
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
              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              textAlign: 'left'
            }}
            title="Acessar Coletas em Preenchimento (Rascunhos)"
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
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              border: '1.5px solid rgba(255, 255, 255, 0.2)'
            }}>
              {emPreenchimentoCount || 2}
            </div>
          </button>

          {/* 3. AGUARDANDO ENVIO (Redireciona para Coletas > Fila de Integração ou Modal de Sync) */}
          <button
            onClick={() => {
              if (onOpenSync && offlineCount > 0) {
                onOpenSync();
              } else {
                navigate('coletas', 'fila');
              }
            }}
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
              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              textAlign: 'left'
            }}
            title="Abrir Fila de Sincronização / Aguardando Envio"
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
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)'
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              border: '1.5px solid rgba(255, 255, 255, 0.2)'
            }}>
              {aguardandoEnvioCount || 1}
            </div>
          </button>

          {/* 4. LER UM QR CODE (Abre Modal de Scanner e Carrega Instrumento no Campo) */}
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
              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              textAlign: 'left'
            }}
            title="Escanear QR Code para Identificar Instrumento Geotécnico"
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
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(168, 85, 247, 0.4)'
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

      {/* ============================================================
          MODAL LEITOR / SIMULADOR DE QR CODE GEOTÉCNICO
          ============================================================ */}
      {showQrModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 1400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card-panel" style={{ 
            width: '100%', 
            maxWidth: '460px', 
            padding: '1.5rem', 
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
            border: '1.5px solid rgba(168, 85, 247, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={20} style={{ color: '#a855f7' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Leitor de QR Code Geotécnico
                </h3>
              </div>
              <button 
                onClick={() => { setShowQrModal(false); setQrScanningActive(false); }} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Viewfinder com Feixe de Laser 3D */}
            <div style={{
              width: '210px',
              height: '210px',
              margin: '0 auto 1.25rem',
              borderRadius: '16px',
              border: '2px dashed rgba(168, 85, 247, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 25px rgba(168, 85, 247, 0.25)'
            }}>
              {/* Feixe animado de escaneamento a laser */}
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #a855f7, #e879f9, transparent)',
                boxShadow: '0 0 14px #a855f7',
                top: qrScanningActive ? '80%' : '15%',
                transition: 'top 1.4s ease-in-out',
                animation: 'pulseGlow 1.2s infinite alternate'
              }} />

              <QrCode size={70} style={{ color: '#c084fc', opacity: 0.9 }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0 0.75rem' }}>
                {qrScanningActive ? 'Escaneando placa de identificação...' : 'Aponte a câmera para a plaqueta do instrumento'}
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0', fontWeight: 600 }}>
              Ou selecione um instrumento identificado para registrar leitura:
            </p>

            {/* Lista de Instrumentos Identificados no QR Code */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.45rem', 
              marginBottom: '1.25rem', 
              maxHeight: '190px', 
              overflowY: 'auto',
              textAlign: 'left'
            }}>
              {qrSampleInstruments.map((inst, i) => (
                <button
                  key={inst.uid || inst.id || i}
                  onClick={() => handleSelectQrInstrument(inst)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  title={`Registrar leitura no ${inst.id}`}
                >
                  <div>
                    <span style={{ fontWeight: 800, color: '#c084fc', display: 'block' }}>
                      {inst.id}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {inst.tipo || 'Instrumento Geotécnico'} • {inst.estrutura || 'Estrutura'}
                    </span>
                  </div>
                  <ArrowRight size={15} style={{ color: '#a855f7' }} />
                </button>
              ))}
            </div>

            {/* Botões de Ação do Modal */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  setShowQrModal(false);
                  navigate('campo');
                  showToast('Abrindo formulário de coleta de campo...', 'info');
                }}
                className="btn-primary"
                style={{ flex: 1, fontSize: '0.8rem' }}
              >
                Abrir Coleta Manual
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="btn-secondary"
                style={{ flex: 1, fontSize: '0.8rem' }}
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

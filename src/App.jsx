import React, { useState } from 'react';
import { useGeotechData } from './context/GeotechDataContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeTab } from './components/HomeTab';
import { DashboardTab } from './components/DashboardTab';
import { MapTab } from './components/MapTab';
import { FieldCollectionTab } from './components/FieldCollectionTab';
import { Spline3DViewerTab } from './components/Spline3DViewerTab';
import { PiezometryTab } from './components/PiezometryTab';
import { FlowRateTab } from './components/FlowRateTab';
import { ReportTab } from './components/ReportTab';
import { ReadingsHistoryTab } from './components/ReadingsHistoryTab';
import { AiAnalysisTab } from './components/AiAnalysisTab';
import { InstrumentsRegistryTab } from './components/InstrumentsRegistryTab';
import { AuthModal } from './components/AuthModal';
import { SyncQueueModal } from './components/SyncQueueModal';
import { ReportModal } from './components/ReportModal';
import { ChecklistModal } from './components/ChecklistModal';
import { ChecklistTab } from './components/ChecklistTab';
import { ChamadosTab } from './components/ChamadosTab';

// Novos componentes InspectApp & Centralizador Geotécnico
import { SideDrawer } from './components/SideDrawer';
import { InspectHeroCard } from './components/InspectHeroCard';
import { ColetasTab } from './components/ColetasTab';
import { ImportacoesTab } from './components/ImportacoesTab';
import { OrdensServicoTab } from './components/OrdensServicoTab';
import { LotesRelatoriosTab } from './components/LotesRelatoriosTab';
import { ClientesTab } from './components/ClientesTab';
import { ContratosTerceirosTab } from './components/ContratosTerceirosTab';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  X, 
  ClipboardEdit, 
  FileText, 
  CloudLightning 
} from 'lucide-react';

export function App() {
  const { loading, error, systemToast, setSystemToast, offlineCount } = useGeotechData();
  const [activeTab, setActiveTab] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [coletaInitialSubTab, setColetaInitialSubTab] = useState('concluidas');
  const [selectedInstrumentForReading, setSelectedInstrumentForReading] = useState(null);

  // Estados dos Modais
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);

  const handleNavigateTab = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectInstrumentForReading = (instrument) => {
    setSelectedInstrumentForReading(instrument);
    setActiveTab('campo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        gap: '1rem'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(56, 189, 248, 0.4)',
          animation: 'pulseGlow 2s infinite ease-in-out'
        }}>
          <Activity size={32} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            MDSync Centralizador
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Carregando 218 instrumentos e telemetria geotécnica...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        padding: '2rem'
      }}>
        <div className="card-panel" style={{ maxWidth: '500px', textAlign: 'center', borderColor: 'var(--geo-emergencia)' }}>
          <AlertCircle size={42} style={{ color: 'var(--geo-emergencia)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--geo-emergencia)' }}>
            Erro ao Inicializar Dados Geotécnicos
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
            style={{ marginTop: '1.25rem' }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Barra de Topo */}
      <Header 
        onOpenAuth={() => { setAuthModalTab('login'); setAuthModalOpen(true); }}
        onOpenSync={() => setSyncModalOpen(true)}
        onOpenReport={() => handleNavigateTab('lotes_relatorios')}
        onOpenChecklist={() => setChecklistModalOpen(true)}
        onToggleDrawer={() => setDrawerOpen(!drawerOpen)}
      />

      {/* Menu Retrátil Lateral Animado (InspectApp / Sysdam Style) */}
      <SideDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tabId, subTab) => {
          if (subTab) setColetaInitialSubTab(subTab);
          handleNavigateTab(tabId);
          setDrawerOpen(false);
        }}
        onEditProfile={() => {
          setAuthModalTab('profile');
          setAuthModalOpen(true);
          setDrawerOpen(false);
        }}
        onOpenChecklist={() => {
          setChecklistModalOpen(true);
          setDrawerOpen(false);
        }}
        onOpenReport={() => {
          handleNavigateTab('lotes_relatorios');
          setDrawerOpen(false);
        }}
      />

      {/* Navegação por Abas (com rolagem horizontal responsiva) */}
      <Navigation activeTab={activeTab} onSelectTab={handleNavigateTab} />

      {/* Área de Conteúdo da Aba Ativa */}
      <main style={{ flex: 1, padding: '1.25rem', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'home' && (
          <div>
            <InspectHeroCard onNavigate={handleNavigateTab} />
            <HomeTab onNavigateTab={handleNavigateTab} />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div>
            <InspectHeroCard onNavigate={handleNavigateTab} />
            <DashboardTab onNavigateTab={handleNavigateTab} />
          </div>
        )}

        {activeTab === 'analises' && (
          <div>
            <DashboardTab onNavigateTab={handleNavigateTab} />
          </div>
        )}

        {activeTab === 'coletas' && (
          <ColetasTab onNavigateTab={handleNavigateTab} defaultSubTab={coletaInitialSubTab} />
        )}

        {activeTab === 'importacoes' && (
          <ImportacoesTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'ordens_servico' && (
          <OrdensServicoTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'lotes_relatorios' && (
          <LotesRelatoriosTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'clientes' && (
          <ClientesTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'contratos' && (
          <ContratosTerceirosTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'mapa' && (
          <MapTab 
            onNavigateTab={handleNavigateTab}
            onSelectInstrumentForReading={handleSelectInstrumentForReading}
          />
        )}

        {activeTab === 'campo' && (
          <FieldCollectionTab preSelectedInstrument={selectedInstrumentForReading} />
        )}

        {activeTab === 'checklist' && (
          <ChecklistTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'chamados' && (
          <ChamadosTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === '3d' && (
          <Spline3DViewerTab />
        )}

        {activeTab === 'piezometria' && (
          <PiezometryTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'vazao' && (
          <FlowRateTab />
        )}

        {activeTab === 'laudo' && (
          <ReportTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'historico' && (
          <ReadingsHistoryTab />
        )}

        {activeTab === 'ia' && (
          <AiAnalysisTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'cadastro' && (
          <InstrumentsRegistryTab />
        )}
      </main>

      {/* Botão de Ação Rápida Flutuante (Mobile FAB) */}
      <div className="mobile-fab-container show-mobile-only" style={{
        position: 'fixed',
        bottom: '1.25rem',
        right: '1.25rem',
        zIndex: 900,
        display: 'none',
        flexDirection: 'column',
        gap: '0.6rem'
      }}>
        <button
          onClick={() => handleNavigateTab('campo')}
          className="btn-primary"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}
          title="Nova Coleta de Campo"
        >
          <ClipboardEdit size={24} />
        </button>
      </div>

      {/* Toast Flutuante de Notificação do Sistema */}
      {systemToast && (
        <div 
          className="system-toast-container"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            maxWidth: '560px',
            width: '90%',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            backgroundColor: systemToast.type === 'success' ? '#065f46' : (systemToast.type === 'warning' ? '#92400e' : (systemToast.type === 'error' ? '#991b1b' : '#1e293b')),
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'fadeInUp 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {systemToast.type === 'success' ? <CheckCircle2 size={20} /> : (systemToast.type === 'warning' ? <AlertCircle size={20} /> : <Info size={20} />)}
            <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>
              {systemToast.message}
            </span>
          </div>
          <button 
            onClick={() => setSystemToast(null)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Modais do Sistema */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialTab={authModalTab}
      />

      <SyncQueueModal 
        isOpen={syncModalOpen} 
        onClose={() => setSyncModalOpen(false)} 
      />

      <ReportModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
      />

      <ChecklistModal 
        isOpen={checklistModalOpen} 
        onClose={() => setChecklistModalOpen(false)}
        onOpenReport={() => { setChecklistModalOpen(false); setReportModalOpen(true); }}
        onOpenAuth={() => { setChecklistModalOpen(false); setAuthModalOpen(true); }}
        onOpenSync={() => { setChecklistModalOpen(false); setSyncModalOpen(true); }}
      />

      {/* Rodapé Institucional */}
      <footer style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '1rem 1.5rem',
        fontSize: '0.75rem',
        color: 'var(--text-faint)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>MDSync</span>
          <span>•</span>
          <span>Centralizador de Dados Geotécnicos de Barragens, Cavas e Pilhas</span>
        </div>
        <div>
          Conforme diretrizes da Portaria ANM nº 95/2022 e Política Nacional de Segurança de Barragens (PNSB).
        </div>
      </footer>
    </div>
  );
}

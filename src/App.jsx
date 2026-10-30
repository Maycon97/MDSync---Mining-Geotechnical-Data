import React, { useState, Suspense, lazy } from 'react';
import { useGeotechData } from './context/GeotechDataContext';
import { Header } from './components/Header';
import { HomeTab } from './components/HomeTab';
import { DashboardTab } from './components/DashboardTab';
import { InspectHeroCard } from './components/InspectHeroCard';
import { SideDrawer } from './components/SideDrawer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MobileBottomBar } from './components/MobileBottomBar';
import { AuthModal } from './components/AuthModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';

// Lazy loading sob demanda para aceleração de arranque e economia de memória (Mobile & Desktop)
const MapTab = lazy(() => import('./components/MapTab').then(m => ({ default: m.MapTab })));
const FieldCollectionTab = lazy(() => import('./components/FieldCollectionTab').then(m => ({ default: m.FieldCollectionTab })));
const PiezometryTab = lazy(() => import('./components/PiezometryTab').then(m => ({ default: m.PiezometryTab })));
const FlowRateTab = lazy(() => import('./components/FlowRateTab').then(m => ({ default: m.FlowRateTab })));
const ReportTab = lazy(() => import('./components/ReportTab').then(m => ({ default: m.ReportTab })));
const ReadingsHistoryTab = lazy(() => import('./components/ReadingsHistoryTab').then(m => ({ default: m.ReadingsHistoryTab })));
const AiAnalysisTab = lazy(() => import('./components/AiAnalysisTab').then(m => ({ default: m.AiAnalysisTab })));
const InstrumentsRegistryTab = lazy(() => import('./components/InstrumentsRegistryTab').then(m => ({ default: m.InstrumentsRegistryTab })));
const SyncQueueModal = lazy(() => import('./components/SyncQueueModal').then(m => ({ default: m.SyncQueueModal })));
const SyncQueueTab = lazy(() => import('./components/SyncQueueTab').then(m => ({ default: m.SyncQueueTab })));
const ReportModal = lazy(() => import('./components/ReportModal').then(m => ({ default: m.ReportModal })));
const ChecklistModal = lazy(() => import('./components/ChecklistModal').then(m => ({ default: m.ChecklistModal })));
const ChecklistTab = lazy(() => import('./components/ChecklistTab').then(m => ({ default: m.ChecklistTab })));
const ChamadosTab = lazy(() => import('./components/ChamadosTab').then(m => ({ default: m.ChamadosTab })));
const ColetasTab = lazy(() => import('./components/ColetasTab').then(m => ({ default: m.ColetasTab })));
const ImportacoesTab = lazy(() => import('./components/ImportacoesTab').then(m => ({ default: m.ImportacoesTab })));
const OrdensServicoTab = lazy(() => import('./components/OrdensServicoTab').then(m => ({ default: m.OrdensServicoTab })));
const LotesRelatoriosTab = lazy(() => import('./components/LotesRelatoriosTab').then(m => ({ default: m.LotesRelatoriosTab })));
const ClientesTab = lazy(() => import('./components/ClientesTab').then(m => ({ default: m.ClientesTab })));
const ContratosTerceirosTab = lazy(() => import('./components/ContratosTerceirosTab').then(m => ({ default: m.ContratosTerceirosTab })));
const ProfileSettingsTab = lazy(() => import('./components/ProfileSettingsTab').then(m => ({ default: m.ProfileSettingsTab })));
const LegalCenterModal = lazy(() => import('./components/LegalCenterModal').then(m => ({ default: m.LegalCenterModal })));
const AnomaliasInspecoesTab = lazy(() => import('./components/AnomaliasInspecoesTab').then(m => ({ default: m.AnomaliasInspecoesTab })));
const GestaoDocumentalTab = lazy(() => import('./components/GestaoDocumentalTab').then(m => ({ default: m.GestaoDocumentalTab })));
const CentralComunicacaoTab = lazy(() => import('./components/CentralComunicacaoTab').then(m => ({ default: m.CentralComunicacaoTab })));
const EstruturasEmpreendimentoTab = lazy(() => import('./components/EstruturasEmpreendimentoTab').then(m => ({ default: m.EstruturasEmpreendimentoTab })));
const MobileInspectionView = lazy(() => import('./components/MobileInspectionView').then(m => ({ default: m.MobileInspectionView })));
const EngenhoSecoBlockModelViewer = lazy(() => import('./components/EngenhoSecoBlockModelViewer').then(m => ({ default: m.EngenhoSecoBlockModelViewer })));

// Indicador visual ultra-leve para transição rápida de módulos
const ModuleLoadingFallback = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '340px',
    gap: '12px',
    color: 'var(--text-muted, #94a3b8)'
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      border: '3px solid rgba(14, 165, 233, 0.2)',
      borderTopColor: 'var(--primary-accent, #0ea5e9)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite'
    }} />
    <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.02em' }}>
      Carregando módulo geotécnico...
    </span>
  </div>
);
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
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState('privacidade');

  const handleOpenLegalCenter = (tab = 'privacidade') => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  const handleNavigateTab = (tabId, subTab = null) => {
    if (subTab) {
      setColetaInitialSubTab(subTab);
    } else if (tabId === 'coletas') {
      setColetaInitialSubTab('concluidas');
    }
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
      <div className="mdsync-loading-container">
        {/* Ícone com Anel de Radar Giratório e Pulso Tridimensional */}
        <div className="mdsync-loading-avatar-wrapper">
          <div className="mdsync-loading-radar-ring" />
          <div className="mdsync-loading-glow-badge">
            <img 
              src="./logo_mdsync_icon.png" 
              alt="MDSync Logo" 
              className="mdsync-loading-icon-animated"
              style={{
                width: '46px',
                height: '46px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.25))'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
              }}
            />
            <Activity 
              size={36} 
              className="mdsync-loading-icon-animated"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            MDSync Centralizador
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.02em' }}>
            Carregando 218 instrumentos e telemetria geotécnica...
          </p>
          <div className="mdsync-loading-shimmer-bar" />
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
      {/* Link de Acessibilidade: Pular para o Conteúdo Principal (Item 8 e 11 da Auditoria) */}
      <a href="#main-content" className="skip-to-content">
        Pular para o conteúdo principal
      </a>

      {/* Barra de Topo com Botão MENU e Identificação da Sessão */}
      <Header 
        activeTab={activeTab}
        onNavigateTab={handleNavigateTab}
        onOpenAuth={() => { setAuthModalTab('login'); setAuthModalOpen(true); }}
        onOpenSync={() => handleNavigateTab('fila_sync')}
        onOpenReport={() => handleNavigateTab('lotes_relatorios')}
        onOpenChecklist={() => setChecklistModalOpen(true)}
        onToggleDrawer={() => setDrawerOpen(!drawerOpen)}
        onOpenProfile={() => handleNavigateTab('configuracoes_perfil')}
      />

      {/* Menu Retrátil Lateral 3D (Consolidado e Alfabético) */}
      <SideDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tabId, subTab) => {
          handleNavigateTab(tabId, subTab);
          setDrawerOpen(false);
        }}
        onEditProfile={() => {
          handleNavigateTab('configuracoes_perfil');
          setDrawerOpen(false);
        }}
        onOpenChecklist={() => {
          handleNavigateTab('checklist');
          setDrawerOpen(false);
        }}
        onOpenReport={() => {
          handleNavigateTab('laudo');
          setDrawerOpen(false);
        }}
        onOpenSync={() => {
          handleNavigateTab('fila_sync');
          setDrawerOpen(false);
        }}
        onOpenAuth={(tab) => {
          setAuthModalTab(tab || 'login');
          setAuthModalOpen(true);
          setDrawerOpen(false);
        }}
        onOpenLegalCenter={handleOpenLegalCenter}
      />

      {/* Área de Conteúdo da Aba Ativa */}
      <main id="main-content" tabIndex={-1} style={{ flex: 1, padding: '1.25rem', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
        <ErrorBoundary key={activeTab} onNavigateHome={() => handleNavigateTab('home')}>
          <Suspense fallback={<ModuleLoadingFallback />}>
          {activeTab === 'home' && (
          <div>
            <InspectHeroCard 
              onNavigate={handleNavigateTab} 
              onNavigateTab={handleNavigateTab}
              onSelectInstrument={handleSelectInstrumentForReading}
              onOpenSync={() => handleNavigateTab('fila_sync')}
            />
            <HomeTab onNavigateTab={handleNavigateTab} />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div>
            <InspectHeroCard 
              onNavigate={handleNavigateTab} 
              onNavigateTab={handleNavigateTab}
              onSelectInstrument={handleSelectInstrumentForReading}
              onOpenSync={() => handleNavigateTab('fila_sync')}
            />
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

        {activeTab === 'fila_sync' && (
          <SyncQueueTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'anomalias_inspecoes' && (
          <AnomaliasInspecoesTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'checklist' && (
          <ChecklistTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'chamados' && (
          <ChamadosTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'piezometria' && (
          <PiezometryTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'vazao' && (
          <FlowRateTab />
        )}

        {activeTab === 'documentos' && (
          <GestaoDocumentalTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'comunicacao' && (
          <CentralComunicacaoTab onNavigateTab={handleNavigateTab} />
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
          <InstrumentsRegistryTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'configuracoes_perfil' && (
          <ProfileSettingsTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'estruturas_empreendimento' && (
          <EstruturasEmpreendimentoTab onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'mobile_inspecao' && (
          <MobileInspectionView onExit={() => handleNavigateTab('home')} />
        )}

        {activeTab === 'engenho_seco_modelo' && (
          <EngenhoSecoBlockModelViewer 
            onClose={() => handleNavigateTab('home')}
            onNavigateToMap={() => handleNavigateTab('mapa')}
          />
        )}

        {![
          'home', 'dashboard', 'analises', 'coletas', 'importacoes', 'ordens_servico',
          'lotes_relatorios', 'clientes', 'contratos', 'mapa', 'campo',
          'fila_sync', 'anomalias_inspecoes', 'checklist', 'chamados', 'piezometria',
          'vazao', 'documentos', 'comunicacao', 'laudo', 'historico', 'ia',
          'cadastro', 'configuracoes_perfil', 'estruturas_empreendimento', 'mobile_inspecao',
          'engenho_seco_modelo'
        ].includes(activeTab) && (
          <div className="card-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Módulo não encontrado
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              A aba solicitada ("{activeTab}") não está disponível ou foi movida.
            </p>
            <button 
              onClick={() => handleNavigateTab('home')}
              className="btn-primary"
            >
              Voltar para Página Inicial
            </button>
          </div>
        )}
          </Suspense>
        </ErrorBoundary>
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

      {/* Modais do Sistema com carregamento sob demanda */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialTab={authModalTab}
        onNavigateToProfileTab={() => handleNavigateTab('configuracoes_perfil')}
        onOpenLegalCenter={handleOpenLegalCenter}
      />

      <Suspense fallback={null}>
        {syncModalOpen && (
          <SyncQueueModal 
            isOpen={syncModalOpen} 
            onClose={() => setSyncModalOpen(false)} 
          />
        )}

        {reportModalOpen && (
          <ReportModal 
            isOpen={reportModalOpen} 
            onClose={() => setReportModalOpen(false)} 
          />
        )}

        {checklistModalOpen && (
          <ChecklistModal 
            isOpen={checklistModalOpen} 
            onClose={() => setChecklistModalOpen(false)}
            onOpenReport={() => { setChecklistModalOpen(false); setReportModalOpen(true); }}
            onOpenAuth={() => { setChecklistModalOpen(false); setAuthModalOpen(true); }}
            onOpenSync={() => { setChecklistModalOpen(false); handleNavigateTab('fila_sync'); }}
          />
        )}

        {legalModalOpen && (
          <LegalCenterModal
            isOpen={legalModalOpen}
            onClose={() => setLegalModalOpen(false)}
            initialTab={legalModalTab}
          />
        )}
      </Suspense>

      {/* Banner de Consentimento de Cookies (Item 3 & 7) */}
      <CookieConsentBanner onOpenLegalCenter={handleOpenLegalCenter} />

      {/* Rodapé Institucional com Blindagem Jurídica Completa (Itens 1 a 17) */}
      <footer 
        role="contentinfo"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.25rem 1.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-faint)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}
      >
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Identificação Institucional */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>MDSync Geotecnia</span>
            <span>•</span>
            <span>Centralizador de Dados Geotécnicos de Barragens, Cavas e Pilhas</span>
          </div>

          {/* Links Rápidos do Centro Jurídico & Privacidade */}
          <nav aria-label="Links Jurídicos e Regulatórios" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleOpenLegalCenter('privacidade')}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
            >
              Política de Privacidade (LGPD)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleOpenLegalCenter('termos')}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
            >
              Termos de Uso
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleOpenLegalCenter('cookies')}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
            >
              Aviso de Cookies
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleOpenLegalCenter('reembolso')}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
            >
              Política de Reembolso & Licenças
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleOpenLegalCenter('lgpd_titular')}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary-accent)', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
            >
              Direitos do Titular (Exportar Dados)
            </button>
          </nav>
        </div>

        {/* Linha de Compliance Regulatório e Dados Oficiais */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.65rem',
          fontSize: '0.7rem'
        }}>
          <div>
            Em estrita conformidade com a <strong>Portaria ANM nº 95/2022</strong>, <strong>Lei Federal nº 12.334/2010 (PNSB)</strong> e <strong>Lei nº 13.709/2018 (LGPD)</strong>.
          </div>
          <div>
            Responsável Técnico: <strong>CREA-MG</strong> • Encarregado de Dados (DPO): <strong style={{ color: 'var(--primary-accent)' }}>dpo@mdsync.com.br</strong>
          </div>
        </div>
      </footer>

      {/* Barra de Navegação Inferior Nativa (Padrão Mobile & APK) */}
      <MobileBottomBar 
        activeTab={activeTab}
        onNavigateTab={handleNavigateTab}
        onToggleDrawer={() => setDrawerOpen(!drawerOpen)}
        offlineCount={offlineCount}
      />
    </div>
  );
}

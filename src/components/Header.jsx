import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  Wifi, 
  WifiOff, 
  Menu,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';

const TAB_TITLES = {
  home: 'Página Inicial',
  dashboard: 'Dashboard Executivo',
  mapa: 'Planta (GIS / Satélite)',
  secoes: 'Seções 2D (Cortes & Estabilidade)',
  anomalias_inspecoes: 'Anomalias & ISR',
  campo: 'Coleta de Campo (Inspect)',
  mobile_inspecao: 'App de Campo (APK SYSDAM)',
  estruturas_empreendimento: 'Estruturas do Empreendimento',
  coletas: 'Coletas de Campo',
  fila_sync: 'Fila de Sincronização',
  checklist: 'CheckList FIR',
  chamados: 'Chamados Fluig',
  piezometria: 'Piezometria & NA',
  vazao: 'Vazão & Vertedouros',
  documentos: 'Gestão Documental',
  comunicacao: 'Central de Comunicação',
  laudo: 'Laudo ANM nº 95/2022',
  lotes_relatorios: 'Lotes de Relatórios',
  historico: 'Histórico de Dados',
  ia: 'SUPORTE GEOTINHO',
  cadastro: 'Cadastro & Limites',
  clientes: 'Clientes',
  contratos: 'Contratos Terceiros',
  importacoes: 'Importações PCMI',
  configuracoes_perfil: 'Configurações & Perfil'
};

export const Header = ({ onToggleDrawer, onOpenProfile, onNavigateTab, activeTab = 'home' }) => {
  const { currentUser } = useAuth();
  const { isOnline } = useGeotechData();

  return (
    <header className="header-bar" style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-medium)',
      padding: '0.65rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
    }}>
      {/* Lado Esquerdo: Botão Oficial MENU + Logo e Indicador de Sessão */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        
        {/* Botão Oficial MENU com Destaque Corporativo */}
        <button
          onClick={onToggleDrawer}
          className="btn-menu-clean"
          title="Clique para abrir o Menu Lateral com todas as 20 opções do MDSync"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            backgroundColor: 'var(--primary-accent-bg)',
            color: 'var(--primary-accent)',
            border: '1.5px solid var(--border-highlight)',
            fontWeight: 800,
            fontSize: '0.82rem',
            letterSpacing: '0.04em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Menu size={18} />
          <span>MENU</span>
        </button>

        {/* Marca & Identificação MDSync */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img 
            src="./logo_mdsync_icon.png" 
            alt="MDSync Logo" 
            style={{ 
              height: '36px', 
              width: '36px', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 8px rgba(56, 189, 248, 0.35))'
            }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                MDSync
              </span>
              <span style={{ 
                fontSize: '0.62rem', 
                fontWeight: 700, 
                backgroundColor: 'var(--primary-accent-bg)', 
                color: 'var(--primary-accent)', 
                padding: '0.12rem 0.4rem', 
                borderRadius: '6px',
                border: '1px solid var(--border-highlight)'
              }}>
                v2.0 GEOTEC
              </span>
            </div>
            <p style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-faint)', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
              MINING | GEOTECHNICS | DATA PLATFORM
            </p>
          </div>
        </div>

        {/* Indicador da Sessão Ativa */}
        <div className="hide-mobile" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginLeft: '0.4rem'
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--primary-accent)' }}></span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Sessão:</span>
          <span style={{ color: 'var(--primary-accent)' }}>{TAB_TITLES[activeTab] || 'MDSync'}</span>
        </div>

      </div>

      {/* Lado Direito: Status de Conexão e Acesso Rápido ao Menu / Perfil */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        
        {/* Chip 3D Status de Conexão */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: isOnline ? 'var(--geo-normal)' : 'var(--geo-atencao)',
            padding: '0.35rem 0.65rem',
            backgroundColor: isOnline ? 'var(--geo-normal-bg)' : 'var(--geo-atencao-bg)',
            borderRadius: '8px',
            border: `1px solid ${isOnline ? 'var(--geo-normal-border)' : 'var(--geo-atencao-border)'}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
          }}
          title={isOnline ? 'Conexão Geotécnica Ativa' : 'Modo Offline Ativo'}
        >
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>

        {/* Botão Rápido para Alternar ao Modo de Campo Mobile (APK) */}
        <button
          onClick={() => onNavigateTab && onNavigateTab('mobile_inspecao')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: activeTab === 'mobile_inspecao' ? '#ffffff' : '#0284c7',
            padding: '0.35rem 0.65rem',
            backgroundColor: activeTab === 'mobile_inspecao' ? '#0284c7' : 'rgba(2, 132, 199, 0.12)',
            borderRadius: '8px',
            border: '1.5px solid rgba(2, 132, 199, 0.35)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Abrir interface de inspeção de campo para smartphone/tablet (Padrão SYSDAM APK)"
        >
          <Smartphone size={13} />
          <span>APP CAMPO (APK)</span>
        </button>

        {/* Card Rápido de Perfil 3D que abre Configurações de Perfil */}
        <button
          onClick={onOpenProfile || onToggleDrawer}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            background: 'linear-gradient(145deg, var(--bg-card), var(--bg-surface))',
            border: '1px solid var(--border-highlight)',
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer',
            color: 'var(--text-main)',
            transition: 'all 0.15s ease'
          }}
          title="Abrir Configurações de Perfil"
        >
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-accent-bg)',
            color: 'var(--primary-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.75rem',
            border: '1.5px solid var(--primary-accent)',
            overflow: 'hidden'
          }}>
            {currentUser?.foto ? (
              <img src={currentUser.foto} alt={currentUser.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              currentUser?.avatar || currentUser?.nome?.charAt(0) || 'M'
            )}
          </div>
          <span className="hide-mobile" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
            {currentUser?.nome?.split(' ')[0] || 'Usuário'}
          </span>
        </button>

        {/* Link Direto do Repositório GitHub Oficial */}
        <a
          href="https://github.com/Maycon97/MDSync---Mining-Geotechnical-Data"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
            textDecoration: 'none',
            transition: 'all 0.15s ease'
          }}
          title="Abrir Repositório no GitHub"
          className="hide-mobile"
        >
          <GithubIcon size={16} />
        </a>

        {/* Botão Limpar Cache & Forçar Atualização */}
        <button
          onClick={async () => {
            try {
              if (typeof window !== 'undefined' && 'caches' in window) {
                const names = await window.caches.keys();
                await Promise.all(names.map(name => window.caches.delete(name)));
              }
              if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                await Promise.all(regs.map(r => r.unregister()));
              }
            } catch (err) {
              console.warn('Erro ao limpar cache local:', err);
            }
            window.location.reload(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Limpar Cache do Navegador e Recarregar Última Versão"
          className="hide-mobile"
        >
          <RefreshCw size={15} />
        </button>

      </div>
    </header>
  );
};

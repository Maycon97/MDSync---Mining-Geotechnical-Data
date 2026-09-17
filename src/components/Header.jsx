import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  Wifi, 
  WifiOff, 
  Menu
} from 'lucide-react';

export const Header = ({ onToggleDrawer }) => {
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
      {/* Lado Esquerdo: Botão 3D Tátil de Abrir Menu + Logo Oficial e Título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        
        {/* Botão de Abrir Menu 3D com Relevo e Efeito Físico de Pressionar */}
        <button
          onClick={onToggleDrawer}
          className="btn-menu-3d"
          title="Abrir Menu Lateral MDSync (3D)"
        >
          <Menu size={20} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
          <span>MENU MDSYNC</span>
        </button>

        {/* Marca & Identificação MDSync */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img 
            src="./logo_mdsync_icon.png" 
            alt="MDSync Logo" 
            style={{ 
              height: '38px', 
              width: '38px', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 8px rgba(56, 189, 248, 0.35))'
            }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                MDSync
              </span>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 700, 
                backgroundColor: 'var(--primary-accent-bg)', 
                color: 'var(--primary-accent)', 
                padding: '0.12rem 0.45rem', 
                borderRadius: '6px',
                border: '1px solid var(--border-highlight)'
              }}>
                v2.0 GEOTEC
              </span>
            </div>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-faint)', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
              MINING | GEOTECHNICS | DATA PLATFORM
            </p>
          </div>
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

        {/* Card Rápido de Perfil 3D que abre o menu lateral */}
        <button
          onClick={onToggleDrawer}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '10px',
            background: 'linear-gradient(145deg, var(--bg-card), var(--bg-surface))',
            border: '1px solid var(--border-highlight)',
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer',
            color: 'var(--text-main)',
            transition: 'all 0.15s ease'
          }}
          title="Abrir Menu e Perfil do Usuário"
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
            border: '1.5px solid var(--primary-accent)'
          }}>
            {currentUser?.avatar || currentUser?.nome?.charAt(0) || 'M'}
          </div>
          <span className="hide-mobile" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
            {currentUser?.nome?.split(' ')[0] || 'Usuário'}
          </span>
        </button>

      </div>
    </header>
  );
};

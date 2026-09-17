import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGeotechData } from '../context/GeotechDataContext';
import { storageService } from '../services/storageService';
import { 
  Sun, 
  Moon, 
  Wifi, 
  WifiOff, 
  UserCheck, 
  ChevronDown, 
  CheckCircle2, 
  CloudLightning,
  FileText,
  ShieldCheck,
  UserPlus,
  LogIn,
  Smartphone,
  Download,
  Menu
} from 'lucide-react';

export const Header = ({ onOpenAuth, onOpenSync, onOpenReport, onOpenChecklist, onToggleDrawer }) => {
  const { currentUser, currentRoleKey, changeRole, allRoles } = useAuth();
  const { 
    isOnline, 
    offlineCount,
    toggleSimulatedOffline,
    simulatedOffline 
  } = useGeotechData();

  const [theme, setTheme] = useState(() => storageService.getTheme());
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    storageService.setTheme(nextTheme);
  };

  return (
    <header className="header-bar" style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-medium)',
      padding: '0.65rem 1.25rem',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      {/* Lado Esquerdo: Botão Menu Gaveta, Logo Oficial e Título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={onToggleDrawer}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.18), rgba(14, 165, 233, 0.28))',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: 'var(--primary-accent, #0284c7)',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)',
            transition: 'all 0.2s ease',
          }}
          title="Abrir Menu InspectApp (Gaveta Lateral)"
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img 
            src="./logo_mdsync_icon.png" 
            alt="MDSync Logo" 
            style={{ 
              height: '42px', 
              width: '42px', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 10px rgba(56, 189, 248, 0.35))'
            }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                MDSync
              </span>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 700, 
                backgroundColor: 'var(--primary-accent-bg)', 
                color: 'var(--primary-accent)', 
                padding: '0.15rem 0.45rem', 
                borderRadius: '6px',
                border: '1px solid var(--border-highlight)'
              }}>
                v2.0 GEOTEC
              </span>
            </div>
            <p style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-faint)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '-2px' }}>
              MINING | GEOTECHNICS | DATA PLATFORM
            </p>
          </div>
        </div>
      </div>

      {/* Lado Direito: Ações Rápidas, Fila Offline, Alertas, Perfil e Tema */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {/* Botão Laudo ANM 95/2022 */}
        <button
          onClick={onOpenReport}
          className="btn-secondary hide-mobile"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          title="Gerar Laudo Técnico ANM nº 95/2022"
        >
          <FileText size={15} style={{ color: 'var(--primary-accent)' }} />
          <span>Laudo ANM</span>
        </button>


        {/* Botão Baixar APK Android */}
        <a
          href="./mdsync-geotecnia.apk"
          download="mdsync-geotecnia.apk"
          className="btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.65rem',
            fontSize: '0.75rem',
            textDecoration: 'none',
            color: 'var(--text-main)',
            border: '1px solid var(--border-highlight)'
          }}
          title="Baixar Aplicativo Android (.APK Instalador de 4.3 MB)"
        >
          <Smartphone size={14} style={{ color: '#10b981' }} />
          <span>Baixar APK</span>
        </a>

        {/* Botão Fila de Sincronização Offline */}
        <button
          onClick={onOpenSync}
          className="btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.65rem',
            fontSize: '0.75rem',
            borderColor: offlineCount > 0 ? 'var(--geo-atencao-border)' : 'var(--border-subtle)',
            backgroundColor: offlineCount > 0 ? 'var(--geo-atencao-bg)' : 'transparent'
          }}
          title="Fila de Sincronização Offline"
        >
          <CloudLightning size={15} style={{ color: offlineCount > 0 ? 'var(--geo-atencao)' : 'var(--text-muted)' }} />
          <span>Fila</span>
          {offlineCount > 0 && (
            <span className="pulse-alert-warning" style={{
              backgroundColor: 'var(--geo-atencao)',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.65rem',
              padding: '0.05rem 0.35rem',
              borderRadius: '9999px'
            }}>
              {offlineCount}
            </span>
          )}
        </button>


        {/* Indicador de Conexão Online/Offline com Toggle de Simulação */}
        <div
          onClick={toggleSimulatedOffline}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: isOnline ? 'var(--geo-normal)' : 'var(--geo-atencao)',
            padding: '0.3rem 0.55rem',
            backgroundColor: isOnline ? 'var(--geo-normal-bg)' : 'var(--geo-atencao-bg)',
            borderRadius: '6px',
            border: `1px solid ${isOnline ? 'var(--geo-normal-border)' : 'var(--geo-atencao-border)'}`,
            cursor: 'pointer'
          }}
          title={isOnline ? 'Clique para simular modo offline de campo' : 'Modo offline ativo. Clique para restabelecer conexão'}
        >
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>

        {/* Alternador de Tema Claro/Escuro */}
        <button 
          onClick={toggleTheme}
          className="btn-icon"
          title={`Alternar para tema ${theme === 'dark' ? 'Claro' : 'Escuro'}`}
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? (
            <Sun size={17} style={{ color: '#f59e0b' }} />
          ) : (
            <Moon size={17} style={{ color: '#0284c7' }} />
          )}
        </button>

        {/* Seletor de Perfil do Usuário e Login */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.7rem'
            }}
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
              fontWeight: 700,
              fontSize: '0.75rem'
            }}>
              {currentUser.nome.charAt(0)}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }} className="hide-mobile">
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {currentUser.nome.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--primary-accent)' }}>
                {currentUser.badge}
              </div>
            </div>
            <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Menu Dropdown de Perfis e Acesso */}
          {roleDropdownOpen && (
            <div className="card-panel glass-panel" style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '290px',
              padding: '0.6rem',
              zIndex: 1100,
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.3rem 0.6rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                  Perfil Operacional
                </span>
                <button
                  onClick={() => { setRoleDropdownOpen(false); onOpenAuth(); }}
                  style={{ background: 'none', border: 'none', fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  <LogIn size={12} /> Login / Novo
                </button>
              </div>

              {Object.keys(allRoles).map(roleKey => {
                const r = allRoles[roleKey];
                const isActive = currentRoleKey === roleKey;
                return (
                  <div
                    key={roleKey}
                    onClick={() => {
                      changeRole(roleKey);
                      setRoleDropdownOpen(false);
                    }}
                    style={{
                      padding: '0.5rem 0.7rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: isActive ? 'var(--primary-accent-bg)' : 'transparent',
                      border: isActive ? '1px solid var(--border-highlight)' : '1px solid transparent',
                      marginBottom: '0.2rem',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem', color: isActive ? 'var(--primary-accent)' : 'var(--text-main)' }}>
                        {r.title}
                      </span>
                      {isActive && <UserCheck size={14} style={{ color: 'var(--primary-accent)' }} />}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {r.badge}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { 
  Home, 
  LayoutDashboard, 
  MapPin, 
  Smartphone, 
  Menu 
} from 'lucide-react';

/**
 * MobileBottomBar - Barra de navegação inferior estilo nativo para smartphones e tablets.
 * Proporciona acesso rápido com o polegar às ferramentas mais críticas de campo (Sysdam Inspect)
 * e atalho para o Menu Completo (SideDrawer) com todos os 20 módulos do MDSync.
 */
export const MobileBottomBar = ({ 
  activeTab, 
  onNavigateTab, 
  onToggleDrawer, 
  offlineCount = 0 
}) => {
  const navItems = [
    {
      id: 'home',
      label: 'Início',
      icon: Home,
      isActive: activeTab === 'home',
      onClick: () => onNavigateTab('home')
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      isActive: activeTab === 'dashboard' || activeTab === 'analises',
      onClick: () => onNavigateTab('dashboard')
    },
    {
      id: 'mapa',
      label: 'Planta GIS',
      icon: MapPin,
      isActive: activeTab === 'mapa',
      onClick: () => onNavigateTab('mapa')
    },
    {
      id: 'mobile_inspecao',
      label: 'Inspeção',
      icon: Smartphone,
      isActive: activeTab === 'mobile_inspecao' || activeTab === 'campo',
      badge: offlineCount > 0 ? offlineCount : null,
      onClick: () => onNavigateTab('mobile_inspecao')
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: Menu,
      isActive: false,
      onClick: onToggleDrawer
    }
  ];

  return (
    <nav 
      className="mobile-bottom-bar" 
      aria-label="Navegação móvel principal do aplicativo"
      role="navigation"
    >
      {navItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            className={`mobile-bottom-bar-btn ${item.isActive ? 'active' : ''}`}
            onClick={item.onClick}
            aria-label={item.label}
            aria-current={item.isActive ? 'page' : undefined}
          >
            <div className="mobile-bottom-bar-icon-wrap">
              <IconComponent size={20} aria-hidden="true" />
              {item.badge && (
                <span className="mobile-bottom-bar-badge" title={`${item.badge} itens pendentes de sincronização`}>
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};


import React from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  Home,
  LayoutDashboard, 
  MapPin, 
  Layers,
  ClipboardEdit, 
  ShieldAlert,
  LineChart, 
  Droplets, 
  FolderArchive,
  Radio,
  History, 
  Cpu, 
  Database,
  Flame,
  AlertTriangle,
  FileText,
  ClipboardCheck,
  LifeBuoy,
  UserCog,
  CloudLightning,
  Sparkles,
  Sliders,
  Menu
} from 'lucide-react';

export const TABS = [
  { id: 'home', label: 'Home', icon: Home, desc: 'Visão geral e informações consolidadas de todos os campos' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Visão executiva e KPIs' },
  { id: 'mapa', label: 'Planta (GIS)', icon: MapPin, desc: 'Satélite, estruturas e localização espacial dos instrumentos' },
  { id: 'secoes', label: 'Seções 2D', icon: Layers, desc: 'Perfis geotécnicos transversais com linha freática piezométrica dinâmica' },
  { id: 'anomalias_inspecoes', label: 'Anomalias & ISR', icon: ShieldAlert, desc: 'Gestão de anomalias, inspeções regulares e especiais (ANM 95/2022)' },
  { id: 'campo', label: 'Coleta de Campo', icon: ClipboardEdit, desc: 'Módulo Inspect: fotos, GPS e leituras' },
  { id: 'fila_sync', label: 'Fila de Sincronização Offline', icon: CloudLightning, desc: 'Gestão de coletas offline e envio à nuvem central' },
  { id: 'checklist', label: 'CheckList', icon: ClipboardCheck, desc: 'Ficha de Inspeção Regular - FIR (Survey123 Itaminas)' },
  { id: 'chamados', label: 'Chamados', icon: LifeBuoy, desc: 'Abertura e gestão de chamados com integração direta ao TOTVS Fluig' },
  { id: 'piezometria', label: 'Piezometria & NA', icon: LineChart, desc: 'Curvas de INA/PZ com limites de alerta' },
  { id: 'vazao', label: 'Vazão & Vertedouros', icon: Droplets, desc: 'Drenos de pé, vertedouros e pluviometria' },
  { id: 'documentos', label: 'Gestão Documental', icon: FolderArchive, desc: 'Acervo técnico (PSB, PAEBM, DCE, As-Built) e legislações aplicadas' },
  { id: 'comunicacao', label: 'Comunicação', icon: Radio, desc: 'Central de comunicação operacional, feed e diário de bordo' },
  { id: 'laudo', label: 'Laudo ANM 95/2022', icon: FileText, desc: 'Emissão e gestão de laudos regulatórios ANM e PNSB' },
  { id: 'historico', label: 'Histórico de Dados', icon: History, desc: 'Consulta, filtros e exportação' },
  { id: 'ia', label: 'SUPORTE GEOTINHO', icon: Sparkles, desc: 'Assistente Geotinho, auditoria preditiva e parecer automatizado' },
  { id: 'cadastro', label: 'Cadastro & Limites', icon: Database, desc: 'Catálogo de instrumentos, cotas e seções' },
  { id: 'configuracoes_perfil', label: 'Configurações & Perfil', icon: Sliders, desc: 'Hub corporativo: perfil, senha, idioma i18n, tema, unidades, backup e compliance' }
];

export const CORE_TABS = [
  { id: 'home', label: 'Home', icon: Home, desc: 'Visão geral e indicadores' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Visão executiva e KPIs' },
  { id: 'mapa', label: 'Planta (GIS)', icon: MapPin, desc: 'Satélite e localização espacial dos instrumentos' },
  { id: 'secoes', label: 'Seções 2D', icon: Layers, desc: 'Cortes 2D com linha freática dinâmica' },
  { id: 'anomalias_inspecoes', label: 'Anomalias & ISR', icon: ShieldAlert, desc: 'Gestão de anomalias e inspeções (ANM 95/2022)' }
];

export const Navigation = ({ activeTab, onSelectTab, onOpenDrawer }) => {
  const { anomalies, anomaliasGeotecnicas = [], offlineCount = 0 } = useGeotechData();

  const isCoreActive = CORE_TABS.some(t => t.id === activeTab);
  const activeTabInfo = TABS.find(t => t.id === activeTab);
  const ActiveIcon = activeTabInfo?.icon || LayoutDashboard;

  return (
    <nav style={{
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.35rem 1.25rem 0',
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }} className="nav-horizontal-scroll">
      
      {/* Botão de Acesso Rápido ao Menu Lateral Completo */}
      <button
        type="button"
        onClick={onOpenDrawer}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.55rem 0.95rem',
          marginBottom: '2px',
          borderRadius: '6px',
          backgroundColor: 'var(--primary-accent-bg)',
          color: 'var(--primary-accent)',
          border: '1px solid var(--border-highlight)',
          fontSize: '0.8rem',
          fontWeight: 800,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
          boxShadow: 'var(--shadow-sm)'
        }}
        title="Clique para abrir o Menu Lateral com todas as 20 sessões e módulos"
      >
        <Menu size={16} />
        <span>Menu Lateral (Todas as Sessões)</span>
      </button>

      {/* Divisor vertical */}
      <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-medium)', margin: '0 0.4rem' }} />

      {/* Abas Principais Operacionais (Nunca sofrem overflow) */}
      {CORE_TABS.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            title={tab.desc}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '8px 8px 0 0',
              backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
              color: isActive ? 'var(--primary-accent)' : 'var(--text-muted)',
              borderTop: isActive ? '2px solid var(--primary-accent)' : '2px solid transparent',
              borderLeft: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
              borderRight: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
              borderBottom: 'none',
              fontWeight: isActive ? 800 : 600,
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
              cursor: 'pointer'
            }}
          >
            <Icon size={16} style={{
              color: isActive ? 'var(--primary-accent)' : 'var(--text-faint)'
            }} />
            <span>{tab.label}</span>

            {/* Badges de Destaque */}
            {tab.id === 'anomalias_inspecoes' && anomaliasGeotecnicas.length > 0 && (
              <span style={{
                backgroundColor: 'var(--geo-emergencia-bg)',
                color: 'var(--geo-emergencia)',
                border: '1px solid var(--geo-emergencia-border)',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '0.1rem 0.35rem',
                borderRadius: '9999px'
              }}>
                {anomaliasGeotecnicas.filter(a => a.status !== 'Mitigada / Fechada').length}
              </span>
            )}
          </button>
        );
      })}

      {/* Se uma aba secundária foi selecionada no Menu Lateral, exibe a aba ativa em destaque */}
      {!isCoreActive && activeTabInfo && (
        <>
          <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-medium)', margin: '0 0.4rem' }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1rem',
            borderRadius: '8px 8px 0 0',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '2px solid var(--primary-accent)',
            borderLeft: '1px solid var(--border-subtle)',
            borderRight: '1px solid var(--border-subtle)',
            fontSize: '0.825rem',
            fontWeight: 800,
            color: 'var(--primary-accent)',
            whiteSpace: 'nowrap'
          }}>
            <ActiveIcon size={16} />
            <span>{activeTabInfo.label}</span>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '0.12rem 0.4rem',
              borderRadius: '3px',
              backgroundColor: 'var(--primary-accent)',
              color: '#ffffff'
            }}>
              SESSÃO ATIVA
            </span>
          </div>
        </>
      )}

    </nav>
  );
};

import React from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  Home,
  LayoutDashboard, 
  MapPin, 
  Layers,
  Box,
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
  Sliders
} from 'lucide-react';

export const TABS = [
  { id: 'home', label: 'Home', icon: Home, desc: 'Visão geral e informações consolidadas de todos os campos' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Visão executiva e KPIs' },
  { id: 'mapa', label: 'Georreferenciamento', icon: MapPin, desc: 'Satélite, estruturas e localização espacial dos instrumentos' },
  { id: 'secoes', label: 'Seções (Cortes 2D)', icon: Layers, desc: 'Perfis geotécnicos transversais com linha freática piezométrica dinâmica' },
  { id: '3d', label: 'Modelo 3D', icon: Box, desc: 'Visualização tridimensional Spline 3D da estrutura e cava' },
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

export const Navigation = ({ activeTab, onSelectTab }) => {
  const { stats, anomalies, anomaliasGeotecnicas = [], fluigTickets = [], offlineCount = 0 } = useGeotechData();

  return (
    <nav style={{
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.35rem 1.5rem 0',
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }} className="nav-horizontal-scroll">
      {TABS.map(tab => {
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
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
              position: 'relative'
            }}
          >
            <Icon size={17} style={{
              color: isActive ? 'var(--primary-accent)' : 'var(--text-faint)',
              transition: 'transform var(--transition-bounce)'
            }} />
            <span>{tab.label}</span>

            {/* Badges de Destaque Específicos por Aba */}
            {tab.id === 'fila_sync' && offlineCount > 0 && (
              <span style={{
                backgroundColor: 'var(--geo-atencao-bg)',
                color: 'var(--geo-atencao)',
                border: '1px solid var(--geo-atencao-border)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px'
              }}>
                {offlineCount}
              </span>
            )}

            {tab.id === 'campo' && anomalies.length > 0 && (
              <span style={{
                backgroundColor: 'var(--geo-atencao-bg)',
                color: 'var(--geo-atencao)',
                border: '1px solid var(--geo-atencao-border)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px'
              }}>
                {anomalies.length}
              </span>
            )}

            {tab.id === 'anomalias_inspecoes' && anomaliasGeotecnicas.length > 0 && (
              <span style={{
                backgroundColor: 'var(--geo-emergencia-bg)',
                color: 'var(--geo-emergencia)',
                border: '1px solid var(--geo-emergencia-border)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px'
              }}>
                {anomaliasGeotecnicas.filter(a => a.status !== 'Mitigada / Fechada').length}
              </span>
            )}

            {tab.id === 'chamados' && fluigTickets.filter(t => t.status !== 'CONCLUIDO').length > 0 && (
              <span style={{
                backgroundColor: 'rgba(2, 132, 199, 0.2)',
                color: 'var(--primary-accent)',
                border: '1px solid rgba(2, 132, 199, 0.4)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px'
              }}>
                {fluigTickets.filter(t => t.status !== 'CONCLUIDO').length}
              </span>
            )}

            {tab.id === 'piezometria' && (stats.emergencia > 0 || stats.atencao > 0) && (
              <span style={{
                backgroundColor: stats.emergencia > 0 ? 'var(--geo-emergencia-bg)' : 'var(--geo-atencao-bg)',
                color: stats.emergencia > 0 ? 'var(--geo-emergencia)' : 'var(--geo-atencao)',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.08rem 0.38rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}>
                {stats.emergencia > 0 ? <Flame size={10} /> : <AlertTriangle size={10} />}
                {stats.emergencia > 0 ? stats.emergencia : stats.atencao}
              </span>
            )}

            {tab.id === 'cadastro' && (
              <span style={{
                fontSize: '0.7rem',
                color: 'var(--text-faint)',
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px'
              }}>
                {stats.totalInstrumentos}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

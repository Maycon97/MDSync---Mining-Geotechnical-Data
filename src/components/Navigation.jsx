import React from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  Home,
  LayoutDashboard, 
  MapPin, 
  ClipboardEdit, 
  LineChart, 
  Droplets, 
  History, 
  Cpu, 
  Database,
  Flame,
  AlertTriangle,
  Box,
  FileText,
  ClipboardCheck,
  LifeBuoy
} from 'lucide-react';

export const TABS = [
  { id: 'home', label: 'Home', icon: Home, desc: 'Visão geral e informações consolidadas de todos os campos' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Visão executiva e KPIs' },
  { id: 'mapa', label: 'Georreferenciamento', icon: MapPin, desc: 'Satélite, estruturas e localização espacial dos instrumentos' },
  { id: 'campo', label: 'Coleta de Campo', icon: ClipboardEdit, desc: 'Módulo Inspect: fotos, GPS e leituras' },
  { id: 'checklist', label: 'CheckList', icon: ClipboardCheck, desc: 'Ficha de Inspeção Regular - FIR (Survey123 Itaminas)' },
  { id: 'chamados', label: 'Chamados', icon: LifeBuoy, desc: 'Abertura e gestão de chamados com integração direta ao TOTVS Fluig' },
  { id: 'piezometria', label: 'Piezometria & NA', icon: LineChart, desc: 'Curvas de INA/PZ com limites de alerta' },
  { id: 'vazao', label: 'Vazão & Vertedouros', icon: Droplets, desc: 'Drenos de pé, vertedouros e pluviometria' },
  { id: 'laudo', label: 'Laudo ANM 95/2022', icon: FileText, desc: 'Emissão e gestão de laudos regulatórios ANM e PNSB' },
  { id: 'historico', label: 'Histórico de Dados', icon: History, desc: 'Consulta, filtros e exportação' },
  { id: 'ia', label: 'IA & Estabilidade', icon: Cpu, desc: 'Auditoria preditiva e parecer automatizado' },
  { id: 'cadastro', label: 'Cadastro & Limites', icon: Database, desc: 'Catálogo de instrumentos, cotas e seções' }
];

export const Navigation = ({ activeTab, onSelectTab }) => {
  const { stats, anomalies, fluigTickets = [] } = useGeotechData();

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

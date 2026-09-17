import React from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  LayoutDashboard, 
  MapPin, 
  ClipboardEdit, 
  LineChart, 
  Droplets, 
  FileText, 
  History, 
  Cpu, 
  Database, 
  Box, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  CloudRain, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  UserCheck, 
  Camera, 
  Layers, 
  Compass, 
  TrendingUp,
  Download,
  FolderSync,
  Building2,
  HardHat
} from 'lucide-react';

export const HomeTab = ({ onNavigateTab }) => {
  const { 
    structures, 
    instruments, 
    anomalies, 
    pluviometria, 
    stats, 
    isOnline, 
    offlineCount 
  } = useGeotechData();

  const { currentUser, currentRoleKey, allRoles } = useAuth();
  const currentRole = allRoles[currentRoleKey] || {};

  // Estatísticas calculadas de todos os campos do sistema
  const piezometrosCount = instruments.filter(i => i.tipo === 'INA' || i.tipo === 'PZ').length;
  const vazaoCount = instruments.filter(i => i.tipo === 'VT' || i.tipo === 'MV').length;
  const marcosCount = instruments.filter(i => i.tipo === 'MCD' || i.tipo === 'REF' || i.tipo === 'ETR').length;
  const outrosCount = instruments.length - piezometrosCount - vazaoCount - marcosCount;

  // Lista dos módulos/campos do sistema para cards navegáveis
  const modules = [
    {
      id: 'dashboard',
      title: 'Dashboard Analítico',
      category: 'Análise de Dados',
      icon: LayoutDashboard,
      color: '#0284c7',
      bgColor: 'rgba(2, 132, 199, 0.12)',
      desc: 'Gráficos interativos com filtros por estrutura, tipologia de sensor e janelas temporais dinâmicas.',
      stat: '4 Gráficos em Tempo Real',
      action: 'Acessar Dashboard'
    },
    {
      id: 'mapa',
      title: 'Georreferenciamento',
      category: 'Cartografia & GIS',
      icon: MapPin,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.12)',
      desc: `Mapeamento espacial com ortofoto de satélite, polígonos das estruturas e posicionamento exato de ${instruments.length} instrumentos.`,
      stat: `${structures.length} Estruturas Georreferenciadas`,
      action: 'Abrir Mapa 2D'
    },
    {
      id: 'campo',
      title: 'Coleta de Campo (Inspect)',
      category: 'Operação de Campo',
      icon: ClipboardEdit,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.12)',
      desc: 'Formulário inteligente para registro de leituras, captura de fotos geolocalizadas, detecção de anomalias e operação 100% offline.',
      stat: `${anomalies.length} Anomalias Registradas`,
      action: 'Iniciar Coleta'
    },
    {
      id: '3d',
      title: 'Modelo 3D & Spline',
      category: 'Gêmeo Digital',
      icon: Box,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.12)',
      desc: 'Representação tridimensional interativa do maciço, taludes de montante/jusante e linha freática simulada.',
      stat: 'Visualização Tridimensional',
      action: 'Explorar Modelo 3D'
    },
    {
      id: 'piezometria',
      title: 'Piezometria & Nível d\'Água',
      category: 'Monitoramento Piezométrico',
      icon: LineChart,
      color: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.12)',
      desc: 'Acompanhamento detalhado das pressões neutras e cotas piezométricas em relação aos limites de Atenção, Alerta e Emergência.',
      stat: `${piezometrosCount} Piezômetros Monitorados`,
      action: 'Ver Piezometria'
    },
    {
      id: 'vazao',
      title: 'Vazão & Vertedouros',
      category: 'Hidrologia & Drenagem',
      icon: Droplets,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.12)',
      desc: 'Medições de percolação interna nos drenos de pé, vertedouros triangulares e histórico diário da Estação Pluviométrica.',
      stat: `${vazaoCount} Medidores de Vazão`,
      action: 'Ver Vazões e Chuvas'
    },
    {
      id: 'laudo',
      title: 'Laudo Técnico ANM nº 95/2022',
      category: 'Regulação & PNSB',
      icon: FileText,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.12)',
      desc: 'Emissão automatizada de laudos regulatórios quinzenais e periódicos com parecer técnico gerado por inteligência artificial e exportação PDF.',
      stat: 'Resolução ANM 95/2022',
      action: 'Emitir Laudo Oficial'
    },
    {
      id: 'historico',
      title: 'Histórico Geral de Leituras',
      category: 'Auditoria de Dados',
      icon: History,
      color: '#14b8a6',
      bgColor: 'rgba(20, 184, 166, 0.12)',
      desc: 'Repositório central de dados com busca avançada, filtros cruzados, auditoria de autoria e exportação para Excel/CSV.',
      stat: '5.600+ Leituras Arquivadas',
      action: 'Consultar Histórico'
    },
    {
      id: 'ia',
      title: 'IA & Diagnóstico Preditivo',
      category: 'Inteligência Artificial',
      icon: Cpu,
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.12)',
      desc: 'Algoritmos de detecção de tendências anômalas, avaliação de estabilidade geotécnica e recomendações automáticas de mitigação.',
      stat: 'Auditoria Estatística Ativa',
      action: 'Ver Diagnóstico IA'
    },
    {
      id: 'cadastro',
      title: 'Cadastro & Limites de Projeto',
      category: 'Configuração Técnica',
      icon: Database,
      color: '#64748b',
      bgColor: 'rgba(100, 116, 139, 0.12)',
      desc: 'Fichas técnicas individuais com cotas de boca, fundo, comprimento, datum SIRGAS2000 e matriz de limites de controle.',
      stat: `${instruments.length} Instrumentos Cadastrados`,
      action: 'Gerenciar Cadastro'
    }
  ];

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* 1. BANNER DE BOAS-VINDAS E APRESENTAÇÃO INSTITUCIONAL */}
      <div className="card-panel" style={{
        padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(2, 132, 199, 0.08) 100%)',
        border: '1px solid var(--border-highlight)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow decorativo de fundo */}
        <div style={{
          position: 'absolute',
          right: '-50px',
          top: '-50px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '850px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <img 
                src="./logo_mdsync_icon.png" 
                alt="MDSync" 
                style={{ height: '48px', width: '48px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(56, 189, 248, 0.3))' }} 
              />
              <div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  MDSync — Centralizador de Dados Geotécnicos
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    MINING | GEOTECHNICS | DATA PLATFORM • v2.0 GEOTEC
                  </span>
                  <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', padding: '0.1rem 0.45rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    Itaminas Mineração
                  </span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '0.85rem' }}>
              Plataforma corporativa integrada para <strong>técnicos, engenheiros, geólogos e gerentes</strong>. 
              Centraliza a instrumentação geotécnica, monitoramento de percolação e cotas de reservatório, vistorias de campo com fotos e GPS, 
              inteligência artificial preditiva e conformidade legal com a <strong>Resolução ANM nº 95/2022</strong> e PNSB.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <HardHat size={15} style={{ color: 'var(--primary-accent)' }} />
                Perfil Atual: <strong style={{ color: 'var(--text-main)' }}>{currentUser?.name} ({currentRole.name || 'Engenheiro'})</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FolderSync size={15} style={{ color: '#10b981' }} />
                Base Local: <strong>01) PCMI Itaminas</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={15} style={{ color: isOnline ? '#10b981' : 'var(--geo-atencao)' }} />
                Rede: <strong style={{ color: isOnline ? '#10b981' : 'var(--geo-atencao)' }}>{isOnline ? 'Online / Conectado' : 'Modo Offline (Campo)'}</strong>
              </span>
            </div>
          </div>

          {/* Ações Rápidas em Destaque */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '220px' }}>
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
            >
              <LayoutDashboard size={16} />
              <span>Acessar Dashboard</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onNavigateTab('campo')}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <ClipboardEdit size={16} />
              <span>Nova Coleta de Campo</span>
            </button>
            <button
              onClick={() => onNavigateTab('laudo')}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <FileText size={16} />
              <span>Emitir Laudo ANM</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PANORAMA QUANTITATIVO GLOBAL (KPIs CONSOLIDADOS DE TODOS OS CAMPOS) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Panorama Consolidado de Dados Geotécnicos
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Indicadores consolidados de todo o parque de instrumentação, segurança e regulação do complexo
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontWeight: 600 }}>
            Atualizado em 16/09/2026
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem'
        }}>
          {/* Card: Estruturas Operacionais */}
          <div className="card-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '10px', backgroundColor: 'var(--primary-accent-bg)', color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Estruturas Monitoradas
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
                {structures.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                Barragens, Cavas, Pilhas
              </div>
            </div>
          </div>

          {/* Card: Instrumentação Ativa */}
          <div className="card-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--geo-normal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total de Instrumentos
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
                {instruments.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--geo-normal)', fontWeight: 600, marginTop: '2px' }}>
                {stats.normais} em nível Normal (97%)
              </div>
            </div>
          </div>

          {/* Card: Piezômetros & N.A. */}
          <div className="card-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LineChart size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Piezômetros (INA/PZ)
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1.1 }}>
                {piezometrosCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                Cotas freáticas e poro-pressões
              </div>
            </div>
          </div>

          {/* Card: Vazão & Drenos */}
          <div className="card-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '10px', backgroundColor: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Vazão & Vertedouros
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#06b6d4', lineHeight: 1.1 }}>
                {vazaoCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                Drenos de pé e vertedouros
              </div>
            </div>
          </div>

          {/* Card: Pluviometria 7 Dias */}
          <div className="card-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '10px', backgroundColor: 'var(--geo-info-bg)', color: 'var(--geo-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CloudRain size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Precipitação (7 Dias)
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--geo-info)', lineHeight: 1.1 }}>
                {stats.chuva7Dias} mm
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                Estação Central Itaminas
              </div>
            </div>
          </div>

          {/* Card: Nível Atenção & Alerta */}
          <div className="card-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '10px', backgroundColor: 'var(--geo-atencao-bg)', color: 'var(--geo-atencao)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Atenção / Alerta
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--geo-atencao)', lineHeight: 1.1 }}>
                {stats.atencao + stats.alerta}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                Acompanhamento intensivo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MATRIZ DE ESTRUTURAS DO COMPLEXO (INFORMAÇÕES GERAIS DE TODAS AS ÁREAS) */}
      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} style={{ color: 'var(--primary-accent)' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Diretório de Estruturas Monitoradas (PCMI Itaminas)
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Visão geral de localização, tipologia, cota e estado de estabilidade de cada maciço
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('mapa')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
          >
            <Compass size={14} />
            <span>Ver Todas no Mapa</span>
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem'
        }}>
          {structures.map(struct => {
            const structInsts = instruments.filter(i => 
              i.estrutura.replace(/\s+/g, '_') === struct.id || 
              i.estrutura.toUpperCase() === struct.nome.toUpperCase()
            );

            const hasEmergency = structInsts.some(i => i.statusCalculado === 'EMERGÊNCIA');
            const hasAttention = structInsts.some(i => i.statusCalculado === 'ATENÇÃO' || i.statusCalculado === 'ALERTA');

            let badgeClass = 'badge-normal';
            let badgeText = 'Estável / Normal';
            if (hasEmergency) {
              badgeClass = 'badge-emergencia';
              badgeText = 'Nível Emergência';
            } else if (hasAttention) {
              badgeClass = 'badge-atencao';
              badgeText = 'Nível Atenção';
            }

            return (
              <div
                key={struct.id}
                className="card-panel card-panel-interactive"
                style={{
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {struct.nome}
                    </h3>
                    <span className={`badge-status ${badgeClass}`} style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem' }}>
                      {badgeText}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.4 }}>
                    {struct.descricao}
                  </p>
                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    color: 'var(--text-faint)',
                    padding: '0.4rem 0',
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    <span>GPS: <strong>{struct.lat.toFixed(4)}, {struct.lon.toFixed(4)}</strong></span>
                    <span>Instrumentos: <strong style={{ color: 'var(--text-main)' }}>{struct.totalInstrumentos}</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => onNavigateTab('dashboard')}
                      className="btn-secondary"
                      style={{ flex: 1, fontSize: '0.72rem', padding: '0.35rem 0.4rem' }}
                    >
                      Gráficos
                    </button>
                    <button
                      onClick={() => onNavigateTab('mapa')}
                      className="btn-secondary"
                      style={{ flex: 1, fontSize: '0.72rem', padding: '0.35rem 0.4rem' }}
                    >
                      Mapa 2D
                    </button>
                    <button
                      onClick={() => onNavigateTab('campo')}
                      className="btn-primary"
                      style={{ flex: 1, fontSize: '0.72rem', padding: '0.35rem 0.4rem' }}
                    >
                      Coleta
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. MAPA DE MÓDULOS E CAMPOS DO SISTEMA (ACESSO A TODAS AS FUNCIONALIDADES) */}
      <div>
        <div style={{ marginBottom: '0.85rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Campos e Módulos Operacionais do Sistema
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Acesso direto a todas as áreas especializadas da plataforma MDSync
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '1rem'
        }}>
          {modules.map(mod => {
            const Icon = mod.icon;

            return (
              <div
                key={mod.id}
                onClick={() => onNavigateTab(mod.id)}
                className="card-panel card-panel-interactive"
                style={{
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: mod.bgColor,
                      color: mod.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={20} />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: mod.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {mod.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    {mod.title}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    {mod.desc}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.6rem',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-faint)' }}>
                    {mod.stat}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
                    <span>{mod.action}</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. SEÇÃO DE CONFORMIDADE REGULATÓRIA & AUDITORIA ANM */}
      <div className="card-panel" style={{
        padding: '1.25rem 1.5rem',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '800px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--geo-normal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Conformidade com a Política Nacional de Segurança de Barragens (PNSB)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
              Sistema preparado para emissão de laudos técnicos em atendimento à <strong>Resolução ANM nº 95/2022</strong>, 
              controle de Níveis de Emergência (NE 0, 1, 2 e 3), Plano de Ação de Emergência (PAEBM) e auditoria de leituras de campo.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('laudo')}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
        >
          <FileText size={15} />
          <span>Gestão de Laudos ANM</span>
        </button>
      </div>

    </div>
  );
};
export default HomeTab;

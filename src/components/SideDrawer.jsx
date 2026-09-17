import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  X, 
  Home, 
  LayoutDashboard, 
  LineChart, 
  ClipboardEdit, 
  FolderInput, 
  Wrench, 
  Layers, 
  Building2, 
  Briefcase, 
  ChevronRight, 
  ChevronDown, 
  User, 
  Edit3, 
  MapPin, 
  ClipboardCheck, 
  LifeBuoy, 
  Droplets, 
  FileText, 
  Cpu, 
  Database,
  CheckCircle2,
  Clock,
  Send,
  ExternalLink,
  ShieldCheck,
  Award
} from 'lucide-react';

export const SideDrawer = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  onSelectTab, 
  onOpenEditProfile 
}) => {
  const { currentUser, currentRole } = useAuth();
  const { 
    coletas = [], 
    ordensServico = [], 
    contratosTerceiros = [], 
    fluigTickets = [], 
    anomalies = [] 
  } = useGeotechData();

  const [coletasExpanded, setColetasExpanded] = useState(true);

  if (!isOpen) return null;

  // Contadores dinâmicos para badges
  const coletasConcluidasCount = coletas.filter(c => c.status === 'CONCLUIDA').length;
  const coletasPreenchimentoCount = coletas.filter(c => c.status === 'EM_PREENCHIMENTO').length;
  const coletasFilaCount = coletas.filter(c => c.status === 'FILA_INTEGRACAO').length;
  const osAbertasCount = ordensServico.filter(o => o.status !== 'CONCLUIDA').length;
  const contratosVigentesCount = contratosTerceiros.length;

  const handleNav = (tabId, subTab = null) => {
    onSelectTab(tabId, subTab);
    onClose();
  };

  return (
    <div 
      className="drawer-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1200,
        display: 'flex',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        className="drawer-content"
        onClick={e => e.stopPropagation()}
        style={{
          width: '320px',
          maxWidth: '85vw',
          height: '100%',
          backgroundColor: '#172554', // Azul profundo característico do InspectApp
          backgroundImage: 'linear-gradient(180deg, #1e3a8a 0%, #0f172a 100%)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 25px rgba(0,0,0,0.5)',
          animation: 'drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto'
        }}
      >
        {/* ============================================================
            1. CABEÇALHO DO PERFIL (INSPIRADO NO INSPECTAPP)
            ============================================================ */}
        <div style={{
          padding: '1.75rem 1.25rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          textAlign: 'center'
        }}>
          {/* Botão Fechar */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              padding: '4px'
            }}
            title="Fechar Menu"
          >
            <X size={22} />
          </button>

          {/* Avatar com Anel Verde de Status Ativo */}
          <div style={{
            position: 'relative',
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            padding: '3px',
            border: '2.5px solid #10b981', // Verde de conexão ativa
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
            marginBottom: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}>
            {currentUser?.foto ? (
              <img 
                src={currentUser.foto} 
                alt={currentUser.nome} 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#ffffff'
              }}>
                {currentUser?.avatar || 'MA'}
              </div>
            )}
            {/* Ponto de status */}
            <div style={{
              position: 'absolute',
              bottom: '2px',
              right: '4px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '2px solid #1e3a8a'
            }} />
          </div>

          {/* Nome e E-mail */}
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 2px 0', color: '#ffffff' }}>
            {currentUser?.nome || 'Marcos Alexandre Rodrigues'}
          </h3>
          <p style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.65)', margin: '0 0 0.5rem 0' }}>
            {currentUser?.email || 'marcos.rodrigues@itaminas.com.br'}
          </p>

          {/* Setor / Cargo */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.65rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: '#60a5fa',
            marginBottom: '0.75rem'
          }}>
            <Award size={12} />
            <span>{currentUser?.setor || currentRole?.title || 'Engenharia Geotécnica'}</span>
          </div>

          {/* Botão EDITAR PERFIL (Como na imagem do InspectApp) */}
          <button
            onClick={() => {
              onClose();
              if (onOpenEditProfile) onOpenEditProfile();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#34d399',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
          >
            <Edit3 size={13} />
            <span>EDITAR PERFIL</span>
          </button>
        </div>

        {/* ============================================================
            2. LISTA PRINCIPAL DE NAVEGAÇÃO DO MENU RETRÁTIL
            ============================================================ */}
        <div style={{ flex: 1, padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          
          <div style={{ padding: '0.3rem 0.75rem', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.05em' }}>
            Menu Principal InspectApp
          </div>

          {/* 1. Dashboard */}
          <button
            onClick={() => handleNav('home')}
            style={navItemStyle(activeTab === 'home' || activeTab === 'dashboard')}
          >
            <LayoutDashboard size={18} style={{ color: '#38bdf8' }} />
            <span style={{ flex: 1, textAlign: 'left', fontWeight: (activeTab === 'home' || activeTab === 'dashboard') ? 700 : 500 }}>
              Dashboard
            </span>
          </button>

          {/* 2. Análises */}
          <button
            onClick={() => handleNav('analises')}
            style={navItemStyle(activeTab === 'analises')}
          >
            <LineChart size={18} style={{ color: '#a78bfa' }} />
            <span style={{ flex: 1, textAlign: 'left', fontWeight: activeTab === 'analises' ? 700 : 500 }}>
              Análises
            </span>
          </button>

          {/* 3. Coletas (com sub-abas: Concluídas, Em Preenchimento, Fila de Integração) */}
          <div>
            <div 
              onClick={() => setColetasExpanded(!coletasExpanded)}
              style={{
                ...navItemStyle(activeTab === 'coletas'),
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                <ClipboardEdit size={18} style={{ color: '#fbbf24' }} />
                <span style={{ textAlign: 'left', fontWeight: activeTab === 'coletas' ? 700 : 500 }}>
                  Coletas
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{
                  backgroundColor: 'rgba(251, 191, 36, 0.25)',
                  color: '#fbbf24',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.4rem',
                  borderRadius: '10px'
                }}>
                  {coletas.length}
                </span>
                {coletasExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </div>
            </div>

            {/* Sub-abas de Coletas */}
            {coletasExpanded && (
              <div style={{ paddingLeft: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.2rem' }}>
                <button
                  onClick={() => handleNav('coletas', 'concluidas')}
                  style={subNavItemStyle(activeTab === 'coletas')}
                >
                  <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                  <span style={{ flex: 1, textAlign: 'left' }}>Concluídas</span>
                  <span style={badgeStyle('#10b981')}>{coletasConcluidasCount}</span>
                </button>

                <button
                  onClick={() => handleNav('coletas', 'preenchimento')}
                  style={subNavItemStyle(activeTab === 'coletas')}
                >
                  <Clock size={14} style={{ color: '#fbbf24' }} />
                  <span style={{ flex: 1, textAlign: 'left' }}>Em Preenchimento</span>
                  <span style={badgeStyle('#fbbf24')}>{coletasPreenchimentoCount}</span>
                </button>

                <button
                  onClick={() => handleNav('coletas', 'fila')}
                  style={subNavItemStyle(activeTab === 'coletas')}
                >
                  <Send size={14} style={{ color: '#f87171' }} />
                  <span style={{ flex: 1, textAlign: 'left' }}>Fila de Integração</span>
                  <span style={badgeStyle('#f87171')}>{coletasFilaCount}</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Importações (PCMI) */}
          <button
            onClick={() => handleNav('importacoes')}
            style={navItemStyle(activeTab === 'importacoes')}
          >
            <FolderInput size={18} style={{ color: '#34d399' }} />
            <span style={{ flex: 1, textAlign: 'left', fontWeight: activeTab === 'importacoes' ? 700 : 500 }}>
              Importações (PCMI)
            </span>
          </button>

          {/* 5. Ordens de Serviço */}
          <button
            onClick={() => handleNav('ordens_servico')}
            style={navItemStyle(activeTab === 'ordens_servico')}
          >
            <Wrench size={18} style={{ color: '#f97316' }} />
            <span style={{ flex: 1, textAlign: 'left', fontWeight: activeTab === 'ordens_servico' ? 700 : 500 }}>
              Ordens de Serviço
            </span>
            {osAbertasCount > 0 && (
              <span style={badgeStyle('#f97316')}>{osAbertasCount}</span>
            )}
          </button>

          {/* 6. Lotes de Relatórios */}
          <button
            onClick={() => handleNav('lotes_relatorios')}
            style={navItemStyle(activeTab === 'lotes_relatorios')}
          >
            <Layers size={18} style={{ color: '#60a5fa' }} />
            <span style={{ flex: 1, textAlign: 'left', fontWeight: activeTab === 'lotes_relatorios' ? 700 : 500 }}>
              Lotes de Relatórios
            </span>
          </button>

          {/* 7. Clientes */}
          <button
            onClick={() => handleNav('clientes')}
            style={navItemStyle(activeTab === 'clientes')}
          >
            <Building2 size={18} style={{ color: '#38bdf8' }} />
            <span style={{ flex: 1, textAlign: 'left', fontWeight: activeTab === 'clientes' ? 700 : 500 }}>
              Clientes
            </span>
          </button>

          {/* 8. Contratos de Empresas Terceiras */}
          <button
            onClick={() => handleNav('contratos')}
            style={navItemStyle(activeTab === 'contratos')}
          >
            <Briefcase size={18} style={{ color: '#4ade80' }} />
            <span style={{ flex: 1, textAlign: 'left', fontWeight: activeTab === 'contratos' ? 700 : 500 }}>
              Contratos de Terceiros
            </span>
            <span style={badgeStyle('#4ade80')}>{contratosVigentesCount}</span>
          </button>

          {/* Divisor de Módulos Geotécnicos Especializados */}
          <div style={{ margin: '0.75rem 0.5rem 0.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.5rem' }}>
            <div style={{ padding: '0.2rem 0.25rem', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.05em' }}>
              Módulos Geotécnicos Especializados
            </div>
          </div>

          <button onClick={() => handleNav('mapa')} style={subNavItemStyle(activeTab === 'mapa')}>
            <MapPin size={15} style={{ color: '#10b981' }} />
            <span>Georreferenciamento (Mapa)</span>
          </button>

          <button onClick={() => handleNav('checklist')} style={subNavItemStyle(activeTab === 'checklist')}>
            <ClipboardCheck size={15} style={{ color: '#34d399' }} />
            <span>CheckList (Survey123 FIR)</span>
          </button>

          <button onClick={() => handleNav('chamados')} style={subNavItemStyle(activeTab === 'chamados')}>
            <LifeBuoy size={15} style={{ color: '#38bdf8' }} />
            <span style={{ flex: 1, textAlign: 'left' }}>Chamados (TOTVS Fluig)</span>
            {fluigTickets.filter(t => t.status !== 'CONCLUIDO').length > 0 && (
              <span style={badgeStyle('#38bdf8')}>{fluigTickets.filter(t => t.status !== 'CONCLUIDO').length}</span>
            )}
          </button>

          <button onClick={() => handleNav('piezometria')} style={subNavItemStyle(activeTab === 'piezometria')}>
            <LineChart size={15} style={{ color: '#f59e0b' }} />
            <span>Piezometria & NA</span>
          </button>

          <button onClick={() => handleNav('vazao')} style={subNavItemStyle(activeTab === 'vazao')}>
            <Droplets size={15} style={{ color: '#0284c7' }} />
            <span>Vazão & Vertedouros</span>
          </button>

          <button onClick={() => handleNav('laudo')} style={subNavItemStyle(activeTab === 'laudo')}>
            <FileText size={15} style={{ color: '#60a5fa' }} />
            <span>Laudo ANM nº 95/2022</span>
          </button>

          <button onClick={() => handleNav('ia')} style={subNavItemStyle(activeTab === 'ia')}>
            <Cpu size={15} style={{ color: '#a855f7' }} />
            <span>IA & Estabilidade (Gemini)</span>
          </button>

          <button onClick={() => handleNav('cadastro')} style={subNavItemStyle(activeTab === 'cadastro')}>
            <Database size={15} style={{ color: '#cbd5e1' }} />
            <span>Cadastro & Limites</span>
          </button>

        </div>

        {/* Rodapé do Menu Lateral */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.72rem',
          color: 'rgba(255, 255, 255, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>MDSync v2.4 (Sysdam/Inspect)</span>
          <span>Itaminas S/A</span>
        </div>

      </div>
    </div>
  );
};

const navItemStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.65rem 0.85rem',
  borderRadius: '8px',
  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
  color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
  border: isActive ? '1px solid rgba(96, 165, 250, 0.4)' : '1px solid transparent',
  fontSize: '0.84rem',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  width: '100%'
});

const subNavItemStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  padding: '0.45rem 0.75rem',
  borderRadius: '6px',
  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
  color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
  border: 'none',
  fontSize: '0.78rem',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left'
});

const badgeStyle = (color) => ({
  backgroundColor: `${color}25`,
  color: color,
  fontSize: '0.68rem',
  fontWeight: 700,
  padding: '0.1rem 0.4rem',
  borderRadius: '10px',
  border: `1px solid ${color}45`
});

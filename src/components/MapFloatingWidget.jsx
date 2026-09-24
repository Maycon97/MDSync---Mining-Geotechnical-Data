import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Layers, 
  TrendingUp, 
  BarChart3,
  AlertTriangle
} from 'lucide-react';

export const MapFloatingWidget = ({
  records = [],
  plans = [],
  onFilterStatus,
  onFilterGut
}) => {
  const [activeItem, setActiveItem] = useState('legenda'); // 'status' | 'planos' | 'gut' | 'evolucao' | 'legenda' | null

  const toggleItem = (itemId) => {
    setActiveItem(prev => (prev === itemId ? null : itemId));
  };

  // Contadores de status dos registros
  const statusCounts = {
    total: records.length,
    emMonitoramento: records.filter(r => r.status === 'Em Monitoramento' || !r.status).length,
    acaoEmAndamento: records.filter(r => r.status === 'Ação em Andamento' || r.status === 'Programado Reparo').length,
    fechadas: records.filter(r => r.status === 'Mitigada / Fechada').length
  };

  // Contadores GUT
  const gutCounts = {
    critica: records.filter(r => {
      const g = r.gravidadeGUT || (r.severidade === 3 ? 5 : (r.severidade === 2 ? 3 : 2));
      const u = r.urgenciaGUT || (r.severidade === 3 ? 4 : (r.severidade === 2 ? 3 : 2));
      const t = r.tendenciaGUT || (r.severidade === 3 ? 4 : (r.severidade === 2 ? 2 : 1));
      return g * u * t >= 60;
    }).length,
    alta: records.filter(r => {
      const g = r.gravidadeGUT || (r.severidade === 3 ? 5 : (r.severidade === 2 ? 3 : 2));
      const u = r.urgenciaGUT || (r.severidade === 3 ? 4 : (r.severidade === 2 ? 3 : 2));
      const t = r.tendenciaGUT || (r.severidade === 3 ? 4 : (r.severidade === 2 ? 2 : 1));
      const score = g * u * t;
      return score >= 30 && score < 60;
    }).length,
    media: records.filter(r => {
      const g = r.gravidadeGUT || (r.severidade === 3 ? 5 : (r.severidade === 2 ? 3 : 2));
      const u = r.urgenciaGUT || (r.severidade === 3 ? 4 : (r.severidade === 2 ? 3 : 2));
      const t = r.tendenciaGUT || (r.severidade === 3 ? 4 : (r.severidade === 2 ? 2 : 1));
      const score = g * u * t;
      return score >= 15 && score < 30;
    }).length,
    baixa: records.filter(r => {
      const g = r.gravidadeGUT || (r.severidade === 3 ? 5 : (r.severidade === 2 ? 3 : 2));
      const u = r.urgenciaGUT || (r.severidade === 3 ? 4 : (r.severidade === 2 ? 3 : 2));
      const t = r.tendenciaGUT || (r.severidade === 3 ? 4 : (r.severidade === 2 ? 2 : 1));
      return g * u * t < 15;
    }).length
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '16px',
      right: '16px',
      zIndex: 1000,
      width: '280px',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: '12px',
      border: '1px solid var(--border-medium)',
      boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden',
      backdropFilter: 'blur(16px)'
    }}>
      {/* 1. Status dos Registros (SYSDAM) */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          onClick={() => toggleItem('status')}
          style={{
            padding: '0.6rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            backgroundColor: activeItem === 'status' ? 'var(--bg-secondary)' : 'transparent'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {activeItem === 'status' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Status dos registros</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--primary-accent)', fontWeight: 700 }}>
            {statusCounts.total}
          </span>
        </div>

        {activeItem === 'status' && (
          <div style={{ padding: '0.65rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.72rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Em Monitoramento:</span>
              <strong style={{ color: '#f59e0b' }}>{statusCounts.emMonitoramento}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Ação em Andamento:</span>
              <strong style={{ color: '#38bdf8' }}>{statusCounts.acaoEmAndamento}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Mitigadas / Fechadas:</span>
              <strong style={{ color: '#10b981' }}>{statusCounts.fechadas}</strong>
            </div>
          </div>
        )}
      </div>

      {/* 2. Planos de Ação (SYSDAM) */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          onClick={() => toggleItem('planos')}
          style={{
            padding: '0.6rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            backgroundColor: activeItem === 'planos' ? 'var(--bg-secondary)' : 'transparent'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {activeItem === 'planos' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Planos de ação</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>
            Ativos
          </span>
        </div>

        {activeItem === 'planos' && (
          <div style={{ padding: '0.65rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.72rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Planos 5W2H Cadastrados:</span>
              <strong style={{ color: 'var(--primary-accent)' }}>14 planos</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Prazos em Dia:</span>
              <strong style={{ color: '#10b981' }}>12 (85%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Ações Críticas em Campo:</span>
              <strong style={{ color: '#ef4444' }}>2</strong>
            </div>
          </div>
        )}
      </div>

      {/* 3. Classificação GUT [Detalhado] (SYSDAM) */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          onClick={() => toggleItem('gut')}
          style={{
            padding: '0.6rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            backgroundColor: activeItem === 'gut' ? 'var(--bg-secondary)' : 'transparent'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {activeItem === 'gut' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Classificação GUT</span>
          </div>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '0.1rem 0.35rem',
            borderRadius: '4px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            color: 'var(--primary-accent)'
          }}>
            Detalhado
          </span>
        </div>

        {activeItem === 'gut' && (
          <div style={{ padding: '0.65rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.72rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                Crítica (&ge; 60):
              </span>
              <strong style={{ color: '#ef4444' }}>{gutCounts.critica}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                Alta (30 - 59):
              </span>
              <strong style={{ color: '#f59e0b' }}>{gutCounts.alta}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#38bdf8' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
                Média (15 - 29):
              </span>
              <strong style={{ color: '#38bdf8' }}>{gutCounts.media}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                Baixa (&lt; 15):
              </span>
              <strong style={{ color: '#10b981' }}>{gutCounts.baixa}</strong>
            </div>
          </div>
        )}
      </div>

      {/* 4. Evolução Temporal (SYSDAM) */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          onClick={() => toggleItem('evolucao')}
          style={{
            padding: '0.6rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            backgroundColor: activeItem === 'evolucao' ? 'var(--bg-secondary)' : 'transparent'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {activeItem === 'evolucao' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Evolução temporal</span>
          </div>
          <TrendingUp size={13} style={{ color: 'var(--primary-accent)' }} />
        </div>

        {activeItem === 'evolucao' && (
          <div style={{ padding: '0.65rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.72rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Últimos 7 dias:</span>
              <strong>+3 registros</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Últimos 30 dias:</span>
              <strong style={{ color: 'var(--primary-accent)' }}>+8 registros</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tendência Geral:</span>
              <strong style={{ color: '#10b981' }}>Estável</strong>
            </div>
          </div>
        )}
      </div>

      {/* 5. Legenda Geotécnica Oficial (SYSDAM) */}
      <div>
        <div
          onClick={() => toggleItem('legenda')}
          style={{
            padding: '0.6rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            backgroundColor: activeItem === 'legenda' ? 'var(--bg-secondary)' : 'transparent'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {activeItem === 'legenda' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Legenda</span>
          </div>
          <MapPin size={13} style={{ color: 'var(--primary-accent)' }} />
        </div>

        {activeItem === 'legenda' && (
          <div style={{ padding: '0.65rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.72rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--geo-normal)' }} />
              <span>Normal (Operação Estável)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--geo-atencao)' }} />
              <span>Atenção Operacional</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--geo-alerta)' }} />
              <span>Alerta Geotécnico</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--geo-emergencia)' }} />
              <span>Emergência (PAEBM)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

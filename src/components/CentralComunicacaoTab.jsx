import React, { useState, useMemo } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  Radio, 
  MessageSquare, 
  Send, 
  Clock, 
  Calendar, 
  CloudRain, 
  Bomb, 
  Wrench, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Flame, 
  Search, 
  Sparkles,
  ShieldCheck,
  Building2,
  Filter
} from 'lucide-react';

export const CentralComunicacaoTab = ({ onNavigateTab }) => {
  const { 
    structures = [], 
    comunicadosOperacionais = [], 
    addComunicadoOperacional,
    stats,
    isOnline
  } = useGeotechData();

  const [novoTexto, setNovoTexto] = useState('');
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoTipo, setNovoTipo] = useState('PASSAGEM_TURNO');
  const [novaEstrutura, setNovaEstrutura] = useState('BARRAGEM B1');
  const [novaUrgencia, setNovaUrgencia] = useState('Normal');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [busca, setBusca] = useState('');

  const feedFiltrado = useMemo(() => {
    return comunicadosOperacionais.filter(item => {
      if (filtroTipo !== 'TODOS' && item.tipo !== filtroTipo) return false;
      if (busca.trim()) {
        const q = busca.toLowerCase();
        const matchTitle = item.titulo?.toLowerCase().includes(q);
        const matchText = item.conteudo?.toLowerCase().includes(q);
        const matchAuthor = item.autor?.toLowerCase().includes(q);
        const matchStruct = item.estrutura?.toLowerCase().includes(q);
        if (!matchTitle && !matchText && !matchAuthor && !matchStruct) return false;
      }
      return true;
    });
  }, [comunicadosOperacionais, filtroTipo, busca]);

  const handlePublicar = (e) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !novoTexto.trim()) {
      alert('Por favor, informe o título e o conteúdo do comunicado.');
      return;
    }

    const struct = structures.find(s => s.nome === novaEstrutura || s.id === novaEstrutura);
    const categoria = struct ? (struct.categoria || 'Barragens') : 'Geral';

    addComunicadoOperacional({
      autor: 'Operador Logado',
      cargo: 'Equipe Geotécnica MDSync',
      dataHora: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      tipo: novoTipo,
      titulo: novoTitulo,
      conteudo: novoTexto,
      estrutura: novaEstrutura,
      categoria,
      urgencia: novaUrgencia,
      badge: novoTipo === 'PASSAGEM_TURNO' ? 'Turno' : (novoTipo === 'CLIMA' ? 'Meteo' : (novoTipo === 'DETONACAO' ? 'Desmonte' : 'Campo'))
    });

    setNovoTitulo('');
    setNovoTexto('');
  };

  const getIconeTipo = (tipo) => {
    switch (tipo) {
      case 'CLIMA': return <CloudRain size={18} style={{ color: '#38bdf8' }} />;
      case 'DETONACAO': return <Bomb size={18} style={{ color: '#f97316' }} />;
      case 'MANUTENCAO': return <Wrench size={18} style={{ color: '#f59e0b' }} />;
      case 'ALERTA': return <Flame size={18} style={{ color: '#ef4444' }} />;
      default: return <Radio size={18} style={{ color: '#10b981' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Cabeçalho Sentnel */}
      <div className="card-panel" style={{
        padding: '1rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--geo-normal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Radio size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Central de Comunicação & Diário Operacional
              </h2>
              <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--geo-normal)', fontSize: '0.7rem' }}>
                FEED EM TEMPO REAL
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Acompanhamento de passagens de turno, alertas meteorológicos, detonações em cavas e ocorrências de campo
            </p>
          </div>
        </div>

        {/* Status da Rede */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="badge" style={{
            backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isOnline ? 'var(--geo-normal)' : 'var(--geo-atencao)',
            fontSize: '0.75rem',
            padding: '0.35rem 0.75rem'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOnline ? 'var(--geo-normal)' : 'var(--geo-atencao)', display: 'inline-block', marginRight: '6px' }} />
            {isOnline ? 'Canal Operacional Sincronizado' : 'Operação Local / Modo Offline'}
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 1fr) minmax(320px, 1.8fr)',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        
        {/* Painel Esquerdo: Publicar Novo Comunicado & Status Geral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="card-panel">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageSquare size={18} style={{ color: 'var(--primary-accent)' }} />
              <span>Publicar no Diário Geotécnico</span>
            </h3>

            <form onSubmit={handlePublicar} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>TIPO DE OCORRÊNCIA:</label>
                <select
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontSize: '0.8rem' }}
                >
                  <option value="PASSAGEM_TURNO">Passagem de Turno Geotécnico</option>
                  <option value="CLIMA">Alerta Climático / Chuva</option>
                  <option value="DETONACAO">Detonação de Mina / PPV</option>
                  <option value="MANUTENCAO">Manutenção de Instrumentação</option>
                  <option value="ALERTA">Alerta de Campo / Anomalia</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>ESTRUTURA RELACIONADA:</label>
                <select
                  value={novaEstrutura}
                  onChange={(e) => setNovaEstrutura(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontSize: '0.8rem' }}
                >
                  <option value="TODAS">Todas as Estruturas (Geral)</option>
                  {structures.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>TÍTULO DA COMUNICAÇÃO:</label>
                <input
                  type="text"
                  placeholder="Ex: Passagem de Turno - Piezometria B1 OK"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontSize: '0.8rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>MENSAGEM / OBSERVAÇÕES OPERACIONAIS:</label>
                <textarea
                  rows="4"
                  placeholder="Registre as informações técnicas observadas, condições dos instrumentos, desvios e orientações para o próximo turno..."
                  value={novoTexto}
                  onChange={(e) => setNovoTexto(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontSize: '0.8rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Urgência:</span>
                  <select
                    value={novaUrgencia}
                    onChange={(e) => setNovaUrgencia(e.target.value)}
                    style={{ padding: '0.3rem', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Atenção">Atenção</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Send size={14} />
                  <span>Publicar</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card de Radar de Telemetria e Inconsistências */}
          <div className="card-panel" style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={16} style={{ color: 'var(--geo-normal)' }} />
              <span>Radar de Inconsistência de Leituras</span>
            </h4>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              O algoritmo do MDSync analisa variações de NA &gt; 0.50m/dia e leituras fora do fundo de poço em tempo real.
            </div>
            <div style={{ marginTop: '0.6rem', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '0.72rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Instrumentos com telemetria ativa:</span>
                <strong style={{ color: 'var(--primary-accent)' }}>218 de 218</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: '3px' }}>
                <span>Inconsistências físicas detectadas:</span>
                <strong style={{ color: 'var(--geo-normal)' }}>0 anomalias de digitação</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Direito: Linha do Tempo / Feed de Mensagens */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          {/* Barra de Filtros e Busca do Feed */}
          <div className="card-panel" style={{
            padding: '0.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
              {['TODOS', 'PASSAGEM_TURNO', 'CLIMA', 'DETONACAO', 'MANUTENCAO', 'ALERTA'].map(t => (
                <button
                  key={t}
                  onClick={() => setFiltroTipo(t)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: filtroTipo === t ? 'var(--primary-accent)' : 'var(--bg-secondary)',
                    color: filtroTipo === t ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {t === 'TODOS' ? 'Todos' : (t === 'PASSAGEM_TURNO' ? 'Turnos' : (t === 'CLIMA' ? 'Clima' : (t === 'DETONACAO' ? 'Desmonte' : t)))}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', minWidth: '180px' }}>
              <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input
                type="text"
                placeholder="Buscar no feed..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.35rem 0.6rem 0.35rem 1.8rem',
                  fontSize: '0.75rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-main)'
                }}
              />
            </div>
          </div>

          {/* Itens do Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {feedFiltrado.length === 0 ? (
              <div className="card-panel" style={{ textAlign: 'center', padding: '2rem' }}>
                <CheckCircle2 size={32} style={{ color: 'var(--text-faint)', margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Nenhum comunicado encontrado com os filtros atuais.
                </p>
              </div>
            ) : (
              feedFiltrado.map(item => {
                const corUrgencia = item.urgencia === 'Crítica' ? 'var(--geo-emergencia)' : (item.urgencia === 'Atenção' ? '#f59e0b' : 'var(--border-subtle)');

                return (
                  <div
                    key={item.id}
                    className="card-panel"
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                      borderLeft: `3px solid ${item.urgencia === 'Normal' ? 'var(--primary-accent)' : corUrgencia}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {getIconeTipo(item.tipo)}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                              {item.titulo}
                            </strong>
                            <span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: 'var(--primary-accent)', fontSize: '0.68rem' }}>
                              {item.estrutura}
                            </span>
                            {item.urgencia !== 'Normal' && (
                              <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--geo-emergencia)', fontSize: '0.68rem' }}>
                                {item.urgencia}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                            {item.autor} ({item.cargo}) • {item.dataHora}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: '1.45', margin: 0 }}>
                      {item.conteudo}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

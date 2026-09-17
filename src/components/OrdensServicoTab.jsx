import React, { useState, useMemo } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText,
  Eye,
  X
} from 'lucide-react';

export const OrdensServicoTab = () => {
  const { ordensServico = [], clientes = [], structures = [], addOrdemServico, updateOrdemServico, showToast } = useGeotechData();
  const { currentUser } = useAuth();

  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [selectedStructure, setSelectedStructure] = useState('TODAS');
  const [searchQuery, setSearchQuery] = useState('');

  const [isNewOsOpen, setIsNewOsOpen] = useState(false);
  const [selectedOsDetail, setSelectedOsDetail] = useState(null);

  const [formData, setFormData] = useState({
    descricao: '',
    clienteId: 'CLI-001',
    clienteNome: 'Itaminas Mineração S/A',
    estrutura: 'Barragem B1',
    setorExecutor: 'Manutenção Civil & Obras Geotécnicas',
    responsavel: 'Carlos Eduardo Mendes',
    solicitante: currentUser?.nome || 'Eng. Marcelo N. Siqueira',
    prazoSla: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    prioridade: 'Média',
    observacoes: ''
  });

  const filteredOS = useMemo(() => {
    return ordensServico.filter(item => {
      if (selectedStatus !== 'TODOS' && item.status !== selectedStatus) return false;
      if (selectedStructure !== 'TODAS' && item.estrutura !== selectedStructure) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${item.numeroOS} ${item.descricao} ${item.estrutura} ${item.responsavel} ${item.setorExecutor}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [ordensServico, selectedStatus, selectedStructure, searchQuery]);

  const handleSubmitNewOs = (e) => {
    e.preventDefault();
    if (!formData.descricao.trim()) {
      showToast('Preencha a descrição da Ordem de Serviço.', 'warning');
      return;
    }

    const newOs = {
      numeroOS: `OS-${Math.floor(1000 + Math.random() * 9000)}/2026`,
      descricao: formData.descricao.trim(),
      clienteId: formData.clienteId,
      clienteNome: formData.clienteNome,
      estrutura: formData.estrutura,
      estruturaId: formData.estrutura.toUpperCase().replace(/\s+/g, '_'),
      setorExecutor: formData.setorExecutor,
      responsavel: formData.responsavel,
      solicitante: formData.solicitante,
      dataAbertura: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      prazoSla: formData.prazoSla,
      status: 'ABERTA',
      statusLabel: 'Aberta',
      badgeClass: 'badge-alerta',
      prioridade: formData.prioridade,
      observacoes: formData.observacoes.trim()
    };

    addOrdemServico(newOs);
    setIsNewOsOpen(false);
  };

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Cabeçalho */}
      <div className="card-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(249, 115, 22, 0.15)',
              color: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wrench size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Ordens de Serviço Geotécnicas (O.S.)
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Planejamento, despacho e execução de intervenções de campo em barragens, cavas e pilhas.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewOsOpen(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', padding: '0.5rem 1.1rem', backgroundColor: '#f97316' }}
          >
            <Plus size={16} />
            <span>Nova Ordem de Serviço</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card-panel" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center', flex: 1 }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '160px' }}>
              <Filter size={15} style={{ color: 'var(--text-muted)' }} />
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  fontSize: '0.8rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <option value="TODOS">Todos os Status</option>
                <option value="ABERTA">Aberta</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="CONCLUIDA">Concluída</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '180px' }}>
              <Building2 size={15} style={{ color: 'var(--text-muted)' }} />
              <select
                value={selectedStructure}
                onChange={e => setSelectedStructure(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  fontSize: '0.8rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <option value="TODAS">Todas as Estruturas</option>
                {structures.map(st => (
                  <option key={st.id} value={st.nome}>{st.nome}</option>
                ))}
              </select>
            </div>

          </div>

          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por número, descrição, responsável..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                fontSize: '0.8rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)'
              }}
            />
          </div>

        </div>
      </div>

      {/* Tabela de Ordens de Serviço */}
      <div className="card-panel" style={{ padding: '1.25rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.65rem 0.75rem' }}>Nº O.S.</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Descrição do Serviço</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Estrutura</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Setor Executor</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Responsável</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Prazo SLA</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Status</th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOS.map(os => (
                <tr key={os.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'monospace', fontWeight: 800, color: '#f97316' }}>
                    {os.numeroOS}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: 'var(--text-main)', maxWidth: '280px' }}>
                    {os.descricao}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>
                    {os.estrutura}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--primary-accent)', fontWeight: 600 }}>
                    {os.setorExecutor}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>
                    {os.responsavel}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>
                    {os.prazoSla}
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <span className={os.badgeClass} style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>
                      {os.statusLabel || os.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedOsDetail(os)}
                      className="btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                    >
                      <Eye size={13} style={{ marginRight: '4px' }} />
                      <span>Ver</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova OS */}
      {isNewOsOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card-panel" style={{ width: '100%', maxWidth: '640px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Abertura de Nova Ordem de Serviço (O.S.)
              </h3>
              <button onClick={() => setIsNewOsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitNewOs} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Descrição do Serviço / Obra *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Desobstrução preventiva de canaletas de berma"
                  value={formData.descricao}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Estrutura *
                  </label>
                  <select
                    value={formData.estrutura}
                    onChange={e => setFormData({ ...formData, estrutura: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {structures.map(st => (
                      <option key={st.id} value={st.nome}>{st.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Prazo SLA *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.prazoSla}
                    onChange={e => setFormData({ ...formData, prazoSla: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Setor Executor *
                  </label>
                  <input
                    type="text"
                    value={formData.setorExecutor}
                    onChange={e => setFormData({ ...formData, setorExecutor: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Responsável da Execução *
                  </label>
                  <input
                    type="text"
                    value={formData.responsavel}
                    onChange={e => setFormData({ ...formData, responsavel: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setIsNewOsOpen(false)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 1.25rem', backgroundColor: '#f97316' }}>
                  Emitir O.S.
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes OS */}
      {selectedOsDetail && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card-panel" style={{ width: '100%', maxWidth: '580px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#f97316' }}>
                  {selectedOsDetail.numeroOS}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Aberta em: {selectedOsDetail.dataAbertura}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => window.print()} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                  <Printer size={13} style={{ marginRight: '4px' }} />
                  <span>Imprimir</span>
                </button>
                <button onClick={() => setSelectedOsDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>Descrição:</strong>
                <p style={{ margin: '2px 0 0', color: 'var(--text-muted)' }}>{selectedOsDetail.descricao}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>ESTRUTURA</span>
                  <strong style={{ color: 'var(--text-main)' }}>{selectedOsDetail.estrutura}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>SETOR EXECUTOR</span>
                  <strong style={{ color: 'var(--primary-accent)' }}>{selectedOsDetail.setorExecutor}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>RESPONSÁVEL</span>
                  <strong style={{ color: 'var(--text-main)' }}>{selectedOsDetail.responsavel}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>SLA DE CONCLUSÃO</span>
                  <strong style={{ color: '#ef4444' }}>{selectedOsDetail.prazoSla}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setSelectedOsDetail(null)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

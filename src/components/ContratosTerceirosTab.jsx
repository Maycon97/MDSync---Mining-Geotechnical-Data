import React, { useState } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  Briefcase, 
  Plus, 
  Building2, 
  Calendar, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  X,
  Search
} from 'lucide-react';

export const ContratosTerceirosTab = () => {
  const { contratosTerceiros = [], clientes = [], addContratoTerceiro, showToast } = useGeotechData();
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    numeroContrato: '',
    empresaTerceirizada: '',
    cnpj: '',
    clienteId: 'CLI-001',
    clienteNome: 'Itaminas Mineração S/A',
    descricaoServico: '',
    setorExecutor: 'Sondagens & Geotecnia Especializada',
    responsavelTecnico: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    valorGlobal: '',
    slaAtendimento: '24 horas para atendimento emergencial'
  });

  const filteredContratos = contratosTerceiros.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const text = `${c.numeroContrato} ${c.empresaTerceirizada} ${c.descricaoServico} ${c.setorExecutor}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.empresaTerceirizada.trim() || !form.descricaoServico.trim()) {
      showToast('Preencha a empresa e a descrição do serviço prestado.', 'warning');
      return;
    }

    addContratoTerceiro({
      ...form,
      id: `CTR-2026-${Math.floor(100 + Math.random() * 900)}`,
      numeroContrato: form.numeroContrato || `CT-ITM-2026/${Math.floor(10 + Math.random() * 90)}`,
      status: 'VIGENTE',
      badgeClass: 'badge-normal'
    });

    setIsNewContractOpen(false);
    setForm({
      numeroContrato: '',
      empresaTerceirizada: '',
      cnpj: '',
      clienteId: 'CLI-001',
      clienteNome: 'Itaminas Mineração S/A',
      descricaoServico: '',
      setorExecutor: 'Sondagens & Geotecnia Especializada',
      responsavelTecnico: '',
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      valorGlobal: '',
      slaAtendimento: '24 horas para atendimento emergencial'
    });
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
              backgroundColor: 'rgba(74, 222, 128, 0.15)',
              color: '#4ade80',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Briefcase size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Contratos de Empresas Terceiras
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Gestão contratual de prestadores de serviços de sondagem, topografia, drenagem e obras geotécnicas.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewContractOpen(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', padding: '0.5rem 1.1rem', backgroundColor: '#10b981' }}
          >
            <Plus size={16} />
            <span>Cadastrar Contrato</span>
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="card-panel" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por empresa, serviço prestado ou contrato..."
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

      {/* Lista de Contratos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1rem' }}>
        {filteredContratos.map(ctr => (
          <div
            key={ctr.id}
            className="card-panel"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.85rem',
              borderTop: `3.5px solid ${ctr.status === 'VIGENTE' ? '#10b981' : (ctr.status === 'EM_RENOVACAO' ? '#f59e0b' : '#64748b')}`
            }}
          >
            <div>
              {/* Topo do Contrato */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px'
                }}>
                  {ctr.numeroContrato}
                </span>

                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '10px',
                  backgroundColor: ctr.status === 'VIGENTE' ? 'rgba(16, 185, 129, 0.15)' : (ctr.status === 'EM_RENOVACAO' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(100, 116, 139, 0.15)'),
                  color: ctr.status === 'VIGENTE' ? '#10b981' : (ctr.status === 'EM_RENOVACAO' ? '#f59e0b' : '#64748b')
                }}>
                  {ctr.status}
                </span>
              </div>

              {/* Empresa Terceirizada */}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--text-main)' }}>
                {ctr.empresaTerceirizada}
              </h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>
                CNPJ: {ctr.cnpj || 'Sob sigilo contratual'} • Contratante: {ctr.clienteNome}
              </span>

              {/* DESCRIÇÃO DO SERVIÇO SENDO PRESTADO (DESTAQUE SOLICITADO) */}
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                marginBottom: '0.85rem'
              }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  marginBottom: '0.35rem'
                }}>
                  <Briefcase size={12} />
                  Descrição do Serviço Sendo Prestado:
                </span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                  {ctr.descricaoServico}
                </p>
              </div>

              {/* Detalhes Técnicos e Prazos */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                fontSize: '0.75rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>SETOR EXECUTOR</span>
                  <strong style={{ color: 'var(--primary-accent)' }}>{ctr.setorExecutor}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>RESPONSÁVEL TÉCNICO</span>
                  <strong style={{ color: 'var(--text-main)' }}>{ctr.responsavelTecnico || 'Engenheiro Residente'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>VIGÊNCIA</span>
                  <strong style={{ color: 'var(--text-main)' }}>{ctr.dataInicio} até {ctr.dataFim}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>VALOR GLOBAL</span>
                  <strong style={{ color: '#10b981' }}>{ctr.valorGlobal || 'Sob demanda'}</strong>
                </div>
              </div>
            </div>

            {/* Rodapé com SLA */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '0.65rem',
              fontSize: '0.72rem',
              color: 'var(--text-muted)'
            }}>
              <span>SLA: {ctr.slaAtendimento}</span>
              <button
                onClick={() => showToast(`Emitindo espelho do contrato ${ctr.numeroContrato}...`, 'info')}
                className="btn-secondary"
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
              >
                Ver Minuta
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Modal Novo Contrato */}
      {isNewContractOpen && (
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
                Cadastrar Contrato de Empresa Terceira
              </h3>
              <button onClick={() => setIsNewContractOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Razão Social da Empresa Terceirizada *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Geosonda Engenharia Ltda."
                    value={form.empresaTerceirizada}
                    onChange={e => setForm({ ...form, empresaTerceirizada: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Nº do Contrato
                  </label>
                  <input
                    type="text"
                    placeholder="CT-ITM-2026/045"
                    value={form.numeroContrato}
                    onChange={e => setForm({ ...form, numeroContrato: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
              </div>

              {/* DESCRIÇÃO DO SERVIÇO SENDO PRESTADO */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#10b981', marginBottom: '0.3rem' }}>
                  Descrição Detalhada do Serviço Sendo Prestado *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva o escopo das atividades: execução de ensaios laboratoriais, leitura de marcos superficiais com estação total, recuperação de canaletas, perfuração de poços de rebaixamento freático..."
                  value={form.descricaoServico}
                  onChange={e => setForm({ ...form, descricaoServico: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Setor Executor
                  </label>
                  <input
                    type="text"
                    value={form.setorExecutor}
                    onChange={e => setForm({ ...form, setorExecutor: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Responsável Técnico (CREA/CFT)
                  </label>
                  <input
                    type="text"
                    placeholder="Eng. Roberto Vasconcelos"
                    value={form.responsavelTecnico}
                    onChange={e => setForm({ ...form, responsavelTecnico: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={form.dataInicio}
                    onChange={e => setForm({ ...form, dataInicio: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Data Fim (Vigência)
                  </label>
                  <input
                    type="date"
                    value={form.dataFim}
                    onChange={e => setForm({ ...form, dataFim: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Valor Global
                  </label>
                  <input
                    type="text"
                    placeholder="R$ 1.200.000,00"
                    value={form.valorGlobal}
                    onChange={e => setForm({ ...form, valorGlobal: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setIsNewContractOpen(false)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 1.25rem', backgroundColor: '#10b981' }}>
                  Salvar Contrato
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

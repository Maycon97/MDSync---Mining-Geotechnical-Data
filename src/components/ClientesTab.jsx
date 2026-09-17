import React, { useState } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Layers, 
  FileText,
  X
} from 'lucide-react';

export const ClientesTab = () => {
  const { clientes = [], structures = [], addCliente, showToast } = useGeotechData();
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    razaoSocial: '',
    cnpj: '',
    unidade: '',
    contato: '',
    email: '',
    telefone: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nome.trim()) return;

    addCliente({
      ...form,
      status: 'ATIVO',
      estruturasAtendidas: ['Barragem B1', 'Barragem B4', 'Cava Jangada']
    });
    setIsNewClientOpen(false);
    setForm({ nome: '', razaoSocial: '', cnpj: '', unidade: '', contato: '', email: '', telefone: '' });
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
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Gestão de Clientes & Unidades Minerárias
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Complexos minerários, empresas contratantes e estruturas geotécnicas vinculadas.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewClientOpen(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', padding: '0.5rem 1.1rem', backgroundColor: '#0284c7' }}
          >
            <Plus size={16} />
            <span>Cadastrar Cliente</span>
          </button>
        </div>
      </div>

      {/* Grid de Clientes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
        {clientes.map(cli => (
          <div key={cli.id} className="card-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: 'var(--primary-accent)',
                  backgroundColor: 'rgba(2, 132, 199, 0.1)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px'
                }}>
                  {cli.id}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981'
                }}>
                  {cli.status || 'ATIVO'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                {cli.nome}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.65rem' }}>
                {cli.razaoSocial} • CNPJ: {cli.cnpj}
              </span>

              <div style={{
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.76rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                marginBottom: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={13} style={{ color: '#10b981' }} />
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{cli.unidade}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={13} style={{ color: 'var(--primary-accent)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>{cli.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={13} style={{ color: '#f59e0b' }} />
                  <span style={{ color: 'var(--text-muted)' }}>{cli.telefone}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                  Estruturas Sob Gestão ({cli.estruturasAtendidas?.length || 0}):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {(cli.estruturasAtendidas || []).map((est, i) => (
                    <span key={i} style={{
                      fontSize: '0.68rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-main)'
                    }}>
                      {est}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => showToast(`Abrindo dossiê completo de ${cli.nome}...`, 'info')}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
              >
                Dossiê Completo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Cadastro de Cliente */}
      {isNewClientOpen && (
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
          <div className="card-panel" style={{ width: '100%', maxWidth: '540px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Cadastrar Novo Cliente / Unidade
              </h3>
              <button onClick={() => setIsNewClientOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Nome Fantasia / Unidade *
                </label>
                <input
                  type="text"
                  required
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Razão Social *
                </label>
                <input
                  type="text"
                  required
                  value={form.razaoSocial}
                  onChange={e => setForm({ ...form, razaoSocial: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={form.cnpj}
                    onChange={e => setForm({ ...form, cnpj: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={form.telefone}
                    onChange={e => setForm({ ...form, telefone: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setIsNewClientOpen(false)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 1.25rem', backgroundColor: '#0284c7' }}>
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

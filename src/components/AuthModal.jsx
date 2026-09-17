import React, { useState } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  ShieldCheck, 
  Award, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Camera,
  Save,
  UserCog
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { currentUser, login, register, users, changeRole, updateProfile } = useAuth();
  
  const [tab, setTab] = useState(initialTab); // 'login' | 'register' | 'profile'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Campos de registro
  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSenha, setRegSenha] = useState('');
  const [regRole, setRegRole] = useState('ENGENHEIRO');
  const [regRegistro, setRegRegistro] = useState('');
  const [regEmpresa, setRegEmpresa] = useState('Itaminas Mineração S/A');

  // Campos de Edição de Perfil (InspectApp)
  const [profileNome, setProfileNome] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileSetor, setProfileSetor] = useState('GEOTECNIA');
  const [profileUsuario, setProfileUsuario] = useState('');
  const [profileSenha, setProfileSenha] = useState('');
  const [profileFoto, setProfileFoto] = useState(null);

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Sincronizar dados do perfil quando modal abre ou usuário muda
  React.useEffect(() => {
    if (currentUser) {
      setProfileNome(currentUser.nome || '');
      setProfileEmail(currentUser.email || '');
      setProfileSetor(currentUser.setor || 'GEOTECNIA');
      setProfileUsuario(currentUser.usuario || currentUser.email?.split('@')[0] || '');
      setProfileSenha(currentUser.senhaHash || '');
      setProfileFoto(currentUser.foto || null);
    }
  }, [currentUser, isOpen]);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    try {
      login(email, password);
      setFeedback({ type: 'success', message: 'Autenticado com sucesso!' });
      setTimeout(() => {
        onClose();
        setFeedback({ type: '', message: '' });
      }, 700);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    try {
      register({
        nome: regNome,
        email: regEmail,
        senha: regSenha,
        roleKey: regRole,
        registro: regRegistro,
        empresa: regEmpresa
      });
      setFeedback({ type: 'success', message: 'Usuário cadastrado com sucesso e autenticado!' });
      setTimeout(() => {
        onClose();
        setFeedback({ type: '', message: '' });
      }, 900);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleQuickSelectUser = (user) => {
    try {
      login(user.email, user.senhaHash);
      setFeedback({ type: 'success', message: `Conectado como ${user.nome.split(' ')[0]}` });
      setTimeout(() => {
        onClose();
        setFeedback({ type: '', message: '' });
      }, 500);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFeedback({ type: 'error', message: 'A imagem deve ter no máximo 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setProfileFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    try {
      updateProfile({
        nome: profileNome,
        email: profileEmail,
        setor: profileSetor,
        usuario: profileUsuario,
        senhaHash: profileSenha,
        foto: profileFoto
      });
      setFeedback({ type: 'success', message: 'Perfil atualizado com sucesso!' });
      setTimeout(() => {
        onClose();
        setFeedback({ type: '', message: '' });
      }, 700);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content glass-panel"
        style={{
          maxWidth: '540px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          borderRadius: '16px',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: 'var(--bg-surface)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-accent-bg)',
              color: 'var(--primary-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Autenticação & Controle de Acesso
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                MDSync Segurança de Barragens • RBAC & Criptografia
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>

        {/* Feedback visual */}
        {feedback.message && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.825rem',
            fontWeight: 600,
            backgroundColor: feedback.type === 'error' ? 'var(--geo-emergencia-bg)' : 'var(--geo-normal-bg)',
            color: feedback.type === 'error' ? 'var(--geo-emergencia)' : 'var(--geo-normal)',
            border: `1px solid ${feedback.type === 'error' ? 'var(--geo-emergencia-border)' : 'var(--geo-normal-border)'}`
          }}>
            {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Abas Entrar / Meu Perfil / Cadastrar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '10px',
          padding: '0.25rem',
          marginBottom: '1.25rem',
          gap: '0.25rem'
        }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setFeedback({ type: '', message: '' }); }}
            style={{
              padding: '0.55rem 0.35rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              backgroundColor: tab === 'login' ? 'var(--bg-surface)' : 'transparent',
              color: tab === 'login' ? 'var(--primary-accent)' : 'var(--text-muted)',
              boxShadow: tab === 'login' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Acessar
          </button>
          <button
            type="button"
            onClick={() => { setTab('profile'); setFeedback({ type: '', message: '' }); }}
            style={{
              padding: '0.55rem 0.35rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              backgroundColor: tab === 'profile' ? 'var(--bg-surface)' : 'transparent',
              color: tab === 'profile' ? 'var(--primary-accent)' : 'var(--text-muted)',
              boxShadow: tab === 'profile' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Meu Perfil
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setFeedback({ type: '', message: '' }); }}
            style={{
              padding: '0.55rem 0.35rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              backgroundColor: tab === 'register' ? 'var(--bg-surface)' : 'transparent',
              color: tab === 'register' ? 'var(--primary-accent)' : 'var(--text-muted)',
              boxShadow: tab === 'register' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Novo Cadastro
          </button>
        </div>

        {tab === 'profile' ? (
          /* Formulário de Edição de Perfil (InspectApp) */
          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              padding: '0.85rem',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ position: 'relative' }}>
                {profileFoto ? (
                  <img 
                    src={profileFoto} 
                    alt="Foto Perfil" 
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-accent)' }} 
                  />
                ) : (
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #0284c7, #38bdf8)', 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1.4rem', 
                    fontWeight: 800,
                    border: '3px solid rgba(255,255,255,0.2)' 
                  }}>
                    {currentUser?.avatar || 'US'}
                  </div>
                )}
                <label 
                  htmlFor="avatar-upload-input" 
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-accent, #0284c7)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.35)'
                  }}
                  title="Alterar Foto"
                >
                  <Camera size={14} />
                  <input 
                    id="avatar-upload-input" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    style={{ display: 'none' }} 
                  />
                </label>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {currentUser?.nome || 'Usuário do Sistema'}
                </h4>
                <p style={{ margin: '2px 0 4px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {ROLES[currentUser?.roleKey]?.title || 'Especialista'} • {currentUser?.empresa || 'Itaminas Mineração'}
                </p>
                <label 
                  htmlFor="avatar-upload-input" 
                  style={{ fontSize: '0.72rem', color: 'var(--primary-accent)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Trocar foto de perfil...
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={profileNome}
                onChange={(e) => setProfileNome(e.target.value)}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Setor / Área Operacional *
                </label>
                <select
                  value={profileSetor}
                  onChange={(e) => setProfileSetor(e.target.value)}
                  className="form-select"
                  style={{ width: '100%' }}
                >
                  <option value="GEOTECNIA">GEOTECNIA</option>
                  <option value="HIDROGEOLOGIA">HIDROGEOLOGIA</option>
                  <option value="BARRAGENS">BARRAGENS & PILHAS</option>
                  <option value="OPERAÇÃO">OPERAÇÃO DE MINA</option>
                  <option value="MEIO AMBIENTE">MEIO AMBIENTE</option>
                  <option value="SEGURANÇA DO TRABALHO">SEGURANÇA DO TRABALHO</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Usuário (Login / Apelido) *
                </label>
                <input
                  type="text"
                  required
                  value={profileUsuario}
                  onChange={(e) => setProfileUsuario(e.target.value)}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                E-mail Corporativo *
              </label>
              <input
                type="email"
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Senha de Acesso / Chave PIN
              </label>
              <input
                type="password"
                value={profileSenha}
                onChange={(e) => setProfileSenha(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                style={{ width: '100%' }}
              />
              <small style={{ fontSize: '0.7rem', color: 'var(--text-faint)', display: 'block', marginTop: '4px' }}>
                Deixe como está ou digite uma nova senha para atualizar.
              </small>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Save size={16} />
              <span>Salvar Alterações do Perfil</span>
            </button>
          </form>
        ) : tab === 'login' ? (
          <div>
            {/* Acesso Rápido com Contas Demo da Equipe */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Acesso Rápido por Função Operacional:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                {users.map(u => {
                  const role = ROLES[u.roleKey] || {};
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleQuickSelectUser(u)}
                      style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        border: isCurrent ? '1.5px solid var(--primary-accent)' : '1px solid var(--border-subtle)',
                        backgroundColor: isCurrent ? 'var(--primary-accent-bg)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-accent)'}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-accent-bg)',
                        color: 'var(--primary-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {u.avatar}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {u.nome}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--primary-accent)', fontWeight: 600 }}>
                          {role.title || u.roleKey}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ position: 'relative', textAlign: 'center', margin: '1.25rem 0' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span style={{ position: 'relative', backgroundColor: 'var(--bg-surface)', padding: '0 0.75rem', fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                ou entre com suas credenciais
              </span>
            </div>

            {/* Formulário de Login */}
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  E-mail Corporativo
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                  <input
                    type="email"
                    required
                    placeholder="exemplo@itaminas.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Senha de Acesso
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', width: '100%' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-faint)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Lock size={16} />
                <span>Entrar no Sistema</span>
              </button>
            </form>
          </div>
        ) : (
          /* Formulário de Registro */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Nome Completo *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input
                  type="text"
                  required
                  placeholder="Ex: Engenheiro Silva"
                  value={regNome}
                  onChange={(e) => setRegNome(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  E-mail *
                </label>
                <input
                  type="email"
                  required
                  placeholder="nome@itaminas.com.br"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Senha *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regSenha}
                  onChange={(e) => setRegSenha(e.target.value)}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Perfil Profissional *
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="form-select"
                  style={{ width: '100%' }}
                >
                  {Object.keys(ROLES).map(k => (
                    <option key={k} value={k}>
                      {ROLES[k].title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Registro (CREA / CFT)
                </label>
                <input
                  type="text"
                  placeholder="Ex: CREA 12345/D-MG"
                  value={regRegistro}
                  onChange={(e) => setRegRegistro(e.target.value)}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Empresa / Empreendimento
              </label>
              <input
                type="text"
                value={regEmpresa}
                onChange={(e) => setRegEmpresa(e.target.value)}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <CheckCircle2 size={16} />
              <span>Concluir Cadastro</span>
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.25rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', fontSize: '0.7rem', color: 'var(--text-faint)', lineHeight: 1.4 }}>
          <strong>Segurança & Compliance:</strong> Acesso restrito a técnicos e engenheiros credenciados pelo PNSB / ANM. Registros de IP, data e telemetria são criptografados para auditoria técnica.
        </div>
      </div>
    </div>
  );
};

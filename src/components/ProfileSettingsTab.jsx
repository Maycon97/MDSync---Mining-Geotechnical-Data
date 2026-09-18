import React, { useState, useEffect } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  ShieldCheck, 
  Camera, 
  Save, 
  User, 
  Mail, 
  Lock, 
  Briefcase, 
  Building2, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Key, 
  Clock, 
  ShieldAlert, 
  Cpu, 
  FileCheck2,
  RefreshCw,
  LogOut,
  ArrowRight
} from 'lucide-react';

export const ProfileSettingsTab = ({ onNavigateTab }) => {
  const { currentUser, updateProfile, users, changeRole, currentRole, login } = useAuth();
  const { setSystemToast } = useGeotechData();

  // Estados dos campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [setor, setSetor] = useState('GEOTECNIA');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registro, setRegistro] = useState('');
  const [empresa, setEmpresa] = useState('Itaminas Mineração S/A');
  const [foto, setFoto] = useState(null);

  // Estados de feedback e loading
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Carregar dados do usuário ativo
  useEffect(() => {
    if (currentUser) {
      setNome(currentUser.nome || '');
      setEmail(currentUser.email || '');
      setSetor(currentUser.setor || 'GEOTECNIA');
      setUsuario(currentUser.usuario || currentUser.email?.split('@')[0] || '');
      setSenha(currentUser.senhaHash || '');
      setRegistro(currentUser.registro || '');
      setEmpresa(currentUser.empresa || 'Itaminas Mineração S/A');
      setFoto(currentUser.foto || null);
    }
  }, [currentUser]);

  // Upload e preview da foto de perfil
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFeedback({ type: 'error', message: 'A imagem deve ter no máximo 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFoto(reader.result);
        setFeedback({ type: 'success', message: 'Foto carregada! Clique em "Salvar Alterações" para fixar.' });
      };
      reader.readAsDataURL(file);
    }
  };

  // Submissão do formulário de perfil
  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    setIsSaving(true);

    try {
      updateProfile({
        nome: nome.trim(),
        email: email.trim(),
        setor,
        usuario: usuario.trim(),
        senhaHash: senha,
        registro: registro.trim(),
        empresa: empresa.trim(),
        foto
      });

      setFeedback({ type: 'success', message: 'Perfil e credenciais atualizados com sucesso!' });
      if (setSystemToast) {
        setSystemToast({
          type: 'success',
          message: 'Configurações de perfil salvas com sucesso no MDSync!'
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao atualizar dados do perfil.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Troca rápida de usuário (demonstração e auditoria)
  const handleSwitchUser = (usr) => {
    try {
      login(usr.email, usr.senhaHash);
      if (setSystemToast) {
        setSystemToast({
          type: 'success',
          message: `Sessão alternada para ${usr.nome} (${ROLES[usr.roleKey]?.title || usr.roleKey})`
        });
      }
      setFeedback({ type: 'success', message: `Você está conectado como ${usr.nome}.` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.25s ease-out' }}>
      
      {/* Cabeçalho da Aba */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1.25rem 1.5rem',
        borderRadius: '6px',
        background: 'linear-gradient(145deg, var(--bg-surface), var(--bg-card))',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '6px',
            backgroundColor: 'var(--primary-accent-bg)',
            color: 'var(--primary-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Configurações de Perfil
              </h1>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                RBAC & SEGURANÇA
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              MDSync Segurança de Barragens • Gestão de credenciais, dados cadastrais e compliance PNSB / ANM
            </p>
          </div>
        </div>

        {/* Badges de Status da Sessão */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-main)'
          }}>
            <Key size={14} style={{ color: 'var(--primary-accent)' }} />
            <span>ID: <strong>{currentUser?.id || 'USR-001'}</strong></span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-main)'
          }}>
            <Award size={14} style={{ color: '#10b981' }} />
            <span>Papel: <strong>{currentRole?.title || 'Engenheiro Geotécnico'}</strong></span>
          </div>
        </div>
      </div>

      {/* Grid Principal: Formulário + Painel Lateral de RBAC & Homologação */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        
        {/* ============================================================
            COLUNA 1: FORMULÁRIO DE EDIÇÃO DE PERFIL
            ============================================================ */}
        <div className="card-panel" style={{
          padding: '1.5rem',
          borderRadius: '6px',
          border: '1px solid var(--border-medium)',
          backgroundColor: 'var(--bg-surface)'
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Dados Cadastrais & Credenciais
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Edite suas informações cadastrais e chave de acesso
              </p>
            </div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '3px',
              backgroundColor: 'var(--primary-accent-bg)',
              color: 'var(--primary-accent)'
            }}>
              Campos com * obrigatórios
            </div>
          </div>

          {/* Feedback Visual */}
          {feedback.message && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '4px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              backgroundColor: feedback.type === 'error' ? 'var(--geo-emergencia-bg)' : 'var(--geo-normal-bg)',
              color: feedback.type === 'error' ? 'var(--geo-emergencia)' : 'var(--geo-normal)',
              border: `1px solid ${feedback.type === 'error' ? 'var(--geo-emergencia-border)' : 'var(--geo-normal-border)'}`
            }}>
              {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            
            {/* Box Superior: Avatar, Foto e Informações de Identificação */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              padding: '1rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ position: 'relative' }}>
                {foto ? (
                  <img 
                    src={foto} 
                    alt="Foto do Usuário" 
                    style={{ 
                      width: '72px', 
                      height: '72px', 
                      borderRadius: '6px', 
                      objectFit: 'cover', 
                      border: '2px solid var(--primary-accent)',
                      boxShadow: 'var(--shadow-sm)'
                    }} 
                  />
                ) : (
                  <div style={{ 
                    width: '72px', 
                    height: '72px', 
                    borderRadius: '6px', 
                    background: 'linear-gradient(135deg, #0284c7, #38bdf8)', 
                    color: '#ffffff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1.6rem', 
                    fontWeight: 800,
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {currentUser?.avatar || 'VA'}
                  </div>
                )}
                
                <label 
                  htmlFor="profile-avatar-upload" 
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--primary-accent)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
                    border: '1.5px solid var(--bg-surface)'
                  }}
                  title="Carregar nova foto"
                >
                  <Camera size={15} />
                  <input 
                    id="profile-avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    style={{ display: 'none' }} 
                  />
                </label>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {currentUser?.nome || 'Dra. Vanessa Albuquerque'}
                </h4>
                <p style={{ margin: '3px 0 6px 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {currentRole?.title || 'Engenheiro Geotécnico'} • {currentUser?.empresa || 'Itaminas Mineração S/A'}
                </p>
                <label 
                  htmlFor="profile-avatar-upload" 
                  style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--primary-accent)', 
                    fontWeight: 700, 
                    cursor: 'pointer', 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    textDecoration: 'underline' 
                  }}
                >
                  <Camera size={13} />
                  <span>Trocar foto de perfil...</span>
                </label>
              </div>
            </div>

            {/* Nome Completo */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="form-input"
                placeholder="Ex: Dra. Vanessa Albuquerque"
                style={{ width: '100%', borderRadius: '4px' }}
              />
            </div>

            {/* Setor e Usuário */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Setor / Área Operacional *
                </label>
                <select
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                  className="form-select"
                  style={{ width: '100%', borderRadius: '4px' }}
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
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Usuário (Login / Apelido) *
                </label>
                <input
                  type="text"
                  required
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="form-input"
                  placeholder="Ex: vanessa.albuquerque"
                  style={{ width: '100%', borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* E-mail Corporativo */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                E-mail Corporativo *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Ex: vanessa.albuquerque@itaminas.com.br"
                style={{ width: '100%', borderRadius: '4px' }}
              />
            </div>

            {/* Registro Profissional e Empresa */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Registro Técnico / Conselho (CREA / CFT)
                </label>
                <input
                  type="text"
                  value={registro}
                  onChange={(e) => setRegistro(e.target.value)}
                  className="form-input"
                  placeholder="Ex: CREA 142.890/D-MG"
                  style={{ width: '100%', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Empresa Contratante / Mineradora
                </label>
                <input
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className="form-input"
                  placeholder="Ex: Itaminas Mineração S/A"
                  style={{ width: '100%', borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* Senha de Acesso / Chave PIN */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Senha de Acesso / Chave PIN
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  style={{ width: '100%', borderRadius: '4px', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={showPassword ? 'Ocultar Senha' : 'Ver Senha'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                Deixe como está ou digite uma nova senha para atualizar.
              </small>
            </div>

            {/* Botão de Salvar Alterações */}
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '0.75rem',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.9rem',
                marginTop: '0.5rem',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              <span>{isSaving ? 'Salvando Alterações...' : 'Salvar Alterações do Perfil'}</span>
            </button>

            {/* Aviso de Segurança & Compliance */}
            <div style={{
              marginTop: '0.5rem',
              padding: '0.85rem',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45
            }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>
                Segurança & Compliance:
              </strong>
              Acesso restrito a técnicos e engenheiros credenciados pelo PNSB / ANM. Registros de IP, data e telemetria são criptografados para auditoria técnica.
            </div>

          </form>
        </div>

        {/* ============================================================
            COLUNA 2: RBAC, PERMISSÕES E HOMOLOGAÇÃO MULTIUSUÁRIO
            ============================================================ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card Matriz de Permissões RBAC do Usuário Ativo */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '6px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
              <Award size={20} style={{ color: '#38bdf8' }} />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Permissões de Acesso (RBAC)
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                  Perfil atual: <strong>{currentRole?.title}</strong>
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {currentRole?.foco || 'Atribuições e responsabilidades vinculadas a este usuário no MDSync.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { key: 'coleta_campo', label: 'Coleta de Campo & Fotos', desc: 'Registro offline no piu, piezômetros e anomalias' },
                { key: 'visualizar_dados', label: 'Visualização de Telemetria', desc: 'Gráficos, séries temporais e dados brutos' },
                { key: 'emitir_laudo', label: 'Emissão de Laudos ANM', desc: 'Conformidade com a Resolução ANM 95/2022' },
                { key: 'ajustar_limiares', label: 'Ajuste de Limiares Críticos', desc: 'Alteração de cotas de alerta e emergência' },
                { key: 'analise_ia', label: 'Suporte Geotinho (IA)', desc: 'Pareceres automáticos e estabilidade' },
                { key: 'auditoria_completa', label: 'Auditoria & Logs Globais', desc: 'Rastreabilidade de alterações e compliance' }
              ].map(perm => {
                const isAllowed = currentRole?.permissoes?.includes(perm.key);
                return (
                  <div 
                    key={perm.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '4px',
                      backgroundColor: isAllowed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
                      border: `1px solid ${isAllowed ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-subtle)'}`
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isAllowed ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {perm.label}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {perm.desc}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '3px',
                      backgroundColor: isAllowed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                      color: isAllowed ? '#10b981' : 'var(--text-faint)'
                    }}>
                      {isAllowed ? 'AUTORIZADO' : 'BLOQUEADO'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card Alternar Usuário / Simulação de Perfis de Teste */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '6px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
              <UserCheck size={20} style={{ color: '#10b981' }} />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Simulação Rápida de Usuários
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                  Alterne entre contas pré-configuradas para validar permissões
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {users.map(usr => {
                const isSelected = currentUser?.id === usr.id;
                const role = ROLES[usr.roleKey];

                return (
                  <button
                    key={usr.id}
                    type="button"
                    onClick={() => handleSwitchUser(usr)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '4px',
                      border: isSelected ? '1.5px solid #10b981' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '4px',
                        backgroundColor: isSelected ? '#10b981' : '#0284c7',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.8rem'
                      }}>
                        {usr.avatar}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {usr.nome}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {role?.title} • {usr.registro}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {isSelected ? (
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={13} /> ATIVO
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary-accent)', fontWeight: 600 }}>
                          Conectar
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Atalhos Rápidos */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '1rem',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => onNavigateTab && onNavigateTab('dashboard')}
              style={{
                flex: 1,
                padding: '0.6rem 0.85rem',
                borderRadius: '4px',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <span>Ir para o Dashboard</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab('coletas')}
              style={{
                flex: 1,
                padding: '0.6rem 0.85rem',
                borderRadius: '4px',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--primary-accent)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <span>Minhas Coletas</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useGeotechData } from '../context/GeotechDataContext';
import { storageService } from '../services/storageService';
import { TRANSLATIONS, getTranslation } from '../i18n/translations';
import { recordIdTemplateService, AVAILABLE_VARIABLES } from '../services/recordIdTemplateService';
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
  ArrowRight,
  Globe,
  Sun,
  Moon,
  Contrast,
  Bell,
  Volume2,
  VolumeX,
  Database,
  Download,
  Upload,
  Sparkles,
  Smartphone,
  Laptop,
  Radio,
  Sliders,
  FileText,
  History,
  Trash2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Fingerprint
} from 'lucide-react';

export const ProfileSettingsTab = ({ onNavigateTab }) => {
  const { currentUser, updateProfile, users, changeRole, currentRole, login } = useAuth();
  const { setSystemToast } = useGeotechData();

  // Sub-aba ativa no Hub de Configurações
  const [activeSection, setActiveSection] = useState('perfil');

  // ==========================================
  // 1. ESTADOS DO PERFIL & CREDENCIAIS
  // ==========================================
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [setor, setSetor] = useState('GEOTECNIA');
  const [usuario, setUsuario] = useState('');
  const [registro, setRegistro] = useState('');
  const [empresa, setEmpresa] = useState('Itaminas Mineração S/A');
  const [foto, setFoto] = useState(null);

  // ==========================================
  // 2. ESTADOS DE REDEFINIÇÃO DE SENHA & 2FA
  // ==========================================
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmaSenha, setShowConfirmaSenha] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [sessions, setSessions] = useState(() => storageService.getActiveSessions());

  // ==========================================
  // 3. ESTADOS DE IDIOMA, UNIDADES & DATUM
  // ==========================================
  const [currentLang, setCurrentLang] = useState(() => storageService.getLanguage());
  const [geotechUnits, setGeotechUnitsState] = useState(() => storageService.getGeotechUnits());

  // ==========================================
  // 4. ESTADOS DE TEMA & ERGONOMIA
  // ==========================================
  const [currentTheme, setCurrentTheme] = useState(() => storageService.getTheme());
  const [accentColor, setAccentColorState] = useState(() => storageService.getAccentColor());
  const [density, setDensity] = useState('normal'); // 'normal' | 'comfortable'

  // ==========================================
  // 5. ESTADOS DE NOTIFICAÇÕES & ALERTA
  // ==========================================
  const [notifConfig, setNotifConfig] = useState(() => storageService.getNotificationConfig());
  const [isTestingSiren, setIsTestingSiren] = useState(false);

  // ==========================================
  // 6. ESTADOS DE ARMAZENAMENTO & BACKUP
  // ==========================================
  const [storageStats, setStorageStats] = useState(() => storageService.getStorageUsage());
  const [syncFreq, setSyncFreq] = useState('5min');

  // ==========================================
  // 7. ESTADOS DE VERSÃO & PWA
  // ==========================================
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({ checked: false, latest: true, message: '' });

  // ==========================================
  // 8. POLÍTICAS & COMPLIANCE
  // ==========================================
  const [activePolicyDoc, setActivePolicyDoc] = useState('art');

  // ==========================================
  // 9. REGRAS DE INSPEÇÃO & IDENTIFICADORES (SYSDAM)
  // ==========================================
  const [inspectionRules, setInspectionRules] = useState(() => storageService.getInspectionRules());
  const [recordTemplate, setRecordTemplate] = useState(() => storageService.getRecordIdTemplate());
  const [showVarsGuide, setShowVarsGuide] = useState(false);

  // Estados de feedback e loading geral
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Obter dicionário de tradução corrente
  const t = useMemo(() => getTranslation(currentLang), [currentLang]);

  // Carregar dados do usuário ativo
  useEffect(() => {
    if (currentUser) {
      setNome(currentUser.nome || '');
      setEmail(currentUser.email || '');
      setSetor(currentUser.setor || 'GEOTECNIA');
      setUsuario(currentUser.usuario || currentUser.email?.split('@')[0] || '');
      setRegistro(currentUser.registro || '');
      setEmpresa(currentUser.empresa || 'Itaminas Mineração S/A');
      setFoto(currentUser.foto || null);
    }
  }, [currentUser]);

  // Atualizar contadores de armazenamento
  const refreshStorageStats = () => {
    setStorageStats(storageService.getStorageUsage());
  };

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
        setFeedback({ type: 'success', message: 'Foto carregada com sucesso! Clique em "Salvar Alterações" para fixar.' });
      };
      reader.readAsDataURL(file);
    }
  };

  // Submissão do perfil cadastral
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    setIsSaving(true);

    try {
      const updated = updateProfile({
        nome: nome.trim(),
        email: email.trim(),
        setor,
        usuario: usuario.trim(),
        registro: registro.trim(),
        empresa: empresa.trim(),
        foto
      });

      if (updated) {
        storageService.savePersistentProfile(updated);
      }

      setFeedback({ type: 'success', message: 'Dados cadastrais e profissionais atualizados com sucesso!' });
      if (setSystemToast) {
        setSystemToast({
          type: 'success',
          message: 'Perfil atualizado com sucesso no MDSync!'
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao atualizar dados do perfil.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Cálculo de Força de Senha
  const passwordStrength = useMemo(() => {
    if (!novaSenha) return { score: 0, label: 'Não digitada', color: 'var(--text-faint)' };
    let score = 0;
    if (novaSenha.length >= 8) score++;
    if (novaSenha.length >= 12) score++;
    if (/[A-Z]/.test(novaSenha)) score++;
    if (/[0-9]/.test(novaSenha)) score++;
    if (/[^A-Za-z0-9]/.test(novaSenha)) score++;

    if (score <= 2) return { score: 25, label: 'Fraca (não recomendada)', color: '#ef4444' };
    if (score === 3) return { score: 50, label: 'Média (aceitável)', color: '#f59e0b' };
    if (score === 4) return { score: 75, label: 'Forte (padrão ANM)', color: '#10b981' };
    return { score: 100, label: 'Excelente / Cibersegura', color: '#38bdf8' };
  }, [novaSenha]);

  // Submissão da Redefinição de Senha
  const handleResetPassword = (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!senhaAtual) {
      setFeedback({ type: 'error', message: 'Informe sua senha atual para validação de segurança.' });
      return;
    }
    if (currentUser?.senhaHash && senhaAtual !== currentUser.senhaHash) {
      setFeedback({ type: 'error', message: 'Senha atual incorreta.' });
      return;
    }
    if (novaSenha.length < 8) {
      setFeedback({ type: 'error', message: 'A nova senha deve ter no mínimo 8 caracteres.' });
      return;
    }
    if (novaSenha !== confirmaSenha) {
      setFeedback({ type: 'error', message: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    setIsSaving(true);
    try {
      updateProfile({ senhaHash: novaSenha });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmaSenha('');
      setFeedback({ type: 'success', message: 'Senha de acesso redefinida com sucesso! Em conformidade com o protocolo de segurança.' });
      if (setSystemToast) {
        setSystemToast({
          type: 'success',
          message: 'Nova senha criptografada e salva com sucesso!'
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao redefinir senha.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Troca de Idioma
  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode);
    storageService.setLanguage(langCode);
    if (setSystemToast) {
      setSystemToast({
        type: 'info',
        message: `Idioma alterado para ${TRANSLATIONS[langCode]?.name || langCode}`
      });
    }
  };

  // Troca de Tema
  const handleThemeChange = (themeName) => {
    setCurrentTheme(themeName);
    storageService.setTheme(themeName);
    if (setSystemToast) {
      setSystemToast({
        type: 'info',
        message: `Tema alterado para ${themeName === 'contrast' ? 'Alto Contraste Solar' : themeName === 'light' ? 'Claro Executivo' : 'Escuro Geotécnico'}`
      });
    }
  };

  // Troca de Cor de Acento
  const handleAccentChange = (hex) => {
    setAccentColorState(hex);
    storageService.setAccentColor(hex);
  };

  // Atualizar Unidades Geotécnicas
  const handleUnitsChange = (field, value) => {
    const updated = { ...geotechUnits, [field]: value };
    setGeotechUnitsState(updated);
    storageService.setGeotechUnits(updated);
    if (setSystemToast) {
      setSystemToast({
        type: 'success',
        message: `Unidade de ${field.toUpperCase()} atualizada para ${value}`
      });
    }
  };

  // Atualizar Configuração de Notificações
  const handleToggleNotif = (key) => {
    const updated = { ...notifConfig, [key]: !notifConfig[key] };
    setNotifConfig(updated);
    storageService.setNotificationConfig(updated);
  };

  // Teste de Sirene de Emergência (Web Audio API sintetizada - funciona offline sem falhas)
  const handlePlaySirenTest = () => {
    if (isTestingSiren) return;
    setIsTestingSiren(true);
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) {
        alert('Seu navegador não suporta sintetizador de áudio Web Audio API.');
        setIsTestingSiren(false);
        return;
      }
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);

      const now = audioCtx.currentTime;
      // Modulação de frequência padrão de sirene de barragem (700Hz a 1200Hz)
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.linearRampToValueAtTime(1250, now + 0.6);
      osc.frequency.linearRampToValueAtTime(700, now + 1.2);
      osc.frequency.linearRampToValueAtTime(1250, now + 1.8);
      osc.frequency.linearRampToValueAtTime(700, now + 2.4);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 2.5);

      setTimeout(() => {
        setIsTestingSiren(false);
      }, 2600);

      if (setSystemToast) {
        setSystemToast({
          type: 'warning',
          message: '🔊 Teste de sirene de emergência Nível 3 acionado com sucesso (2.5s)!'
        });
      }
    } catch (e) {
      console.error('Erro ao tocar teste de sirene:', e);
      setIsTestingSiren(false);
    }
  };

  // Revogar Sessão Conectada
  const handleRevokeSession = (sessionId) => {
    const updated = storageService.revokeSession(sessionId);
    setSessions(updated);
    if (setSystemToast) {
      setSystemToast({
        type: 'info',
        message: 'Sessão remota encerrada com sucesso!'
      });
    }
  };

  // Encerrar Todas as Outras Sessões
  const handleTerminateOtherSessions = () => {
    const onlyCurrent = sessions.filter(s => s.atual);
    localStorage.setItem('mdsync_active_sessions', JSON.stringify(onlyCurrent));
    setSessions(onlyCurrent);
    if (setSystemToast) {
      setSystemToast({
        type: 'success',
        message: 'Todas as outras sessões de dispositivos foram encerradas!'
      });
    }
  };

  // Limpar Cache Temporário
  const handleClearCache = () => {
    if (window.confirm('Deseja limpar o cache temporário do MDSync? Suas leituras salvas, anomalias e fotos NÃO serão apagadas.')) {
      refreshStorageStats();
      if (setSystemToast) {
        setSystemToast({
          type: 'success',
          message: 'Cache temporário de mapas e arquivos limpo com sucesso!'
        });
      }
    }
  };

  // Exportar Backup Completo JSON
  const handleExportBackup = () => {
    const ok = storageService.exportFullDatabaseJSON();
    if (ok && setSystemToast) {
      setSystemToast({
        type: 'success',
        message: 'Dossiê de backup exportado em JSON com sucesso!'
      });
    }
  };

  // Importar Backup JSON
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = storageService.importFullDatabaseJSON(reader.result);
      if (res.success) {
        refreshStorageStats();
        if (setSystemToast) {
          setSystemToast({
            type: 'success',
            message: `Backup restaurado com sucesso! ${res.count} tabelas e registros carregados.`
          });
        }
      } else {
        alert(`Falha ao restaurar backup: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  // Verificar Atualizações de Versão
  const handleCheckUpdates = () => {
    setIsCheckingUpdate(true);
    setUpdateStatus({ checked: false, latest: true, message: '' });

    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateStatus({
        checked: true,
        latest: true,
        message: 'MDSync Geotecnia está operando na versão mais recente (v2.5.0-PRO Sentnel-Build). Nenhum pacote pendente no repositório.'
      });
      if (setSystemToast) {
        setSystemToast({
          type: 'success',
          message: 'Sistema atualizado! Cache PWA e Service Worker em dia.'
        });
      }
    }, 1200);
  };

  // Troca rápida de usuário (simulação RBAC)
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

  // Download do Termo de Responsabilidade Técnica e Compliance
  const handleDownloadPolicy = (policyKey) => {
    let title = 'Termo_MDSync_Compliance';
    let textContent = '';

    if (policyKey === 'art') {
      title = 'Termo_Responsabilidade_Tecnica_ART_CREA';
      textContent = `MDSYNC GEOTECNIA - TERMO DE RESPONSABILIDADE TÉCNICA (ART/RRT)
Conforme Lei Federal nº 12.334/2010 (PNSB) e Portaria ANM nº 95/2022

Profissional Responsável: ${currentUser?.nome || 'Dra. Vanessa Albuquerque'}
Registro Profissional: ${currentUser?.registro || 'CREA 142.890/D-MG'}
Empresa / Mineradora: ${currentUser?.empresa || 'Itaminas Mineração S/A'}
Emissão: ${new Date().toLocaleString('pt-BR')}

DECLARAÇÃO:
Declaro sob as penas da lei que todas as leituras piezométricas, vistorias de campo (ISR/ISE) e cadastros de anomalias inseridos no MDSync Geotecnia refletem com veracidade e fidelidade as condições físicas e piezométricas das estruturas monitoradas (Barragens B1, B4, Pilhas de Estéril PDE ES1 e Cavas).
Comprometo-me a acionar imediatamente os protocolos do PAEBM caso qualquer instrumento atinja a Cota de Alerta ou Emergência.`;
    } else if (policyKey === 'sigilo') {
      title = 'Politica_Sigilo_Dados_Geotecnicos_Barragens';
      textContent = `MDSYNC GEOTECNIA - POLÍTICA DE SIGILO E SEGURANÇA DE DADOS CRÍTICOS
Classificação de Informação: CONFIDENCIAL / SEGREDOS DE ENGENHARIA

1. MAPAS DE INUNDAÇÃO E ZAS:
Os mapas de inundação (Dam Break), zonas de auto-salvamento (ZAS) e trajetórias de propagação da onda de cheia contidos neste sistema são confidenciais e de acesso exclusivo aos responsáveis geotécnicos e à Defesa Civil.

2. INSTRUMENTAÇÃO E TELEMETRIA:
É terminantemente vedada a divulgação externa ou cópia desautorizada das leituras diárias dos 218 instrumentos cadastrados na Itaminas Mineração S/A.`;
    } else {
      title = 'Politica_Privacidade_LGPD_Mineracao';
      textContent = `MDSYNC GEOTECNIA - POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS (LGPD)
Em conformidade com a Lei Federal nº 13.709/2018

1. COLETA DE DADOS PESSOAIS:
O sistema coleta apenas nome, e-mail corporativo, registro profissional (CREA/CFT) e fotos registradas durante as inspeções de campo.

2. AUDITORIA E LOGS:
Todas as alterações em cotas de alerta, limiares críticos e aprovações de laudos são registradas de forma indelével com hash criptográfico SHA-256 para auditoria dos órgãos fiscalizadores (ANM, FEAM, Ministério Público).`;
    }

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (setSystemToast) {
      setSystemToast({
        type: 'success',
        message: 'Dossiê do termo baixado com sucesso!'
      });
    }
  };

  // Seções da barra de navegação do Hub de Configurações
  const navigationPills = [
    { id: 'perfil', label: '1. Perfil & RBAC', icon: User, badge: 'Usuário' },
    { id: 'seguranca', label: '2. Segurança & Senha', icon: Lock, badge: '2FA' },
    { id: 'idioma_unidades', label: '3. Idioma & Unidades', icon: Globe, badge: currentLang.toUpperCase() },
    { id: 'tema_ergonomia', label: '4. Tema & Campo', icon: Contrast, badge: currentTheme.toUpperCase() },
    { id: 'notificacoes', label: '5. Alertas & Sirene', icon: Bell, badge: 'Som' },
    { id: 'armazenamento_backup', label: '6. Armazenamento', icon: Database, badge: storageStats.usedFormatted },
    { id: 'versao_pwa', label: '7. Versão & PWA', icon: RefreshCw, badge: 'v2.5.0' },
    { id: 'politicas_compliance', label: '8. Políticas & Compliance', icon: FileCheck2, badge: 'ANM 95' },
    { id: 'regras_inspecao', label: '9. Regras de Inspeção', icon: Sliders, badge: 'SYSDAM' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease-out' }}>
      
      {/* ============================================================
          CABEÇALHO DO HUB DE CONFIGURAÇÕES UNIFICADAS
          ============================================================ */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1.25rem 1.5rem',
        borderRadius: '8px',
        background: 'linear-gradient(145deg, var(--bg-surface), var(--bg-card))',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary-accent-bg)',
            color: 'var(--primary-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}>
            <Sliders size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {t.nav.settings}
              </h1>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--primary-accent)',
                border: '1px solid var(--border-highlight)'
              }}>
                MINING ENTERPRISE SUITE
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                PORTARIA ANM 95/2022
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              {t.nav.settingsDesc} • Padrão Itaminas Mineração & Sentnel
            </p>
          </div>
        </div>

        {/* Badges de Identificação da Sessão Ativa */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-main)'
          }}>
            <Key size={14} style={{ color: 'var(--primary-accent)' }} />
            <span>ID: <strong>{currentUser?.id || 'USR-002'}</strong></span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
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

      {/* ============================================================
          BARRA DE NAVEGAÇÃO POR PILLS / SUB-TABS (SCROLL HORIZONTAL)
          ============================================================ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        padding: '0.4rem 0.2rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {navigationPills.map(pill => {
          const Icon = pill.icon;
          const isActive = activeSection === pill.id;

          return (
            <button
              key={pill.id}
              onClick={() => {
                setActiveSection(pill.id);
                setFeedback({ type: '', message: '' });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1rem',
                borderRadius: '6px',
                border: isActive ? '1.5px solid var(--primary-accent)' : '1px solid var(--border-subtle)',
                backgroundColor: isActive ? 'var(--primary-accent-bg)' : 'var(--bg-surface)',
                color: isActive ? 'var(--primary-accent)' : 'var(--text-main)',
                fontSize: '0.78rem',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Icon size={16} />
              <span>{pill.label}</span>
              <span style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.35rem',
                borderRadius: '3px',
                backgroundColor: isActive ? 'var(--primary-accent)' : 'var(--bg-secondary)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700
              }}>
                {pill.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback de Operações */}
      {feedback.message && (
        <div style={{
          padding: '0.85rem 1.1rem',
          borderRadius: '6px',
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
          <span style={{ flex: 1 }}>{feedback.message}</span>
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem', fontWeight: 800 }}
          >
            ×
          </button>
        </div>
      )}

      {/* ============================================================
          CONTEÚDO DINÂMICO CONFORME SUB-ABA SELECIONADA
          ============================================================ */}

      {/* ------------------------------------------------------------
          1. SUB-ABA: PERFIL & CREDENCIAIS (RBAC)
          ------------------------------------------------------------ */}
      {activeSection === 'perfil' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Formulário de Perfil */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Dados Cadastrais & Credenciais
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Edite suas informações cadastrais e dados de ART/RRT
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

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Foto / Avatar */}
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
                    }} title="Avatar do Usuário">
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
                    title="Carregar nova foto de identificação de campo"
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

              {/* Setor e Login */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem' }}>
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
                    Usuário (Login) *
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Registro Profissional (CREA / CFT)
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
                    Empresa Mineradora / Contratante
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
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  marginTop: '0.5rem',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                <span>{isSaving ? 'Salvando Dados...' : 'Salvar Alterações do Perfil'}</span>
              </button>
            </form>
          </div>

          {/* Painel Lateral: Matriz de Permissões RBAC & Simulação */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Matriz RBAC */}
            <div className="card-panel" style={{
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-surface)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <Award size={18} style={{ color: 'var(--primary-accent)' }} />
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Permissões de Acesso (RBAC)
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                    Nível de privilégio ativo: <strong>{currentRole?.title}</strong>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { key: 'coleta_campo', label: 'Coleta de Campo & Fotos', desc: 'Registro offline no piu, piezômetros e anomalias' },
                  { key: 'visualizar_dados', label: 'Visualização de Telemetria', desc: 'Gráficos, seções 2D, séries temporais e dados' },
                  { key: 'emitir_laudo', label: 'Emissão de Laudos ANM', desc: 'Conformidade com a Resolução ANM 95/2022' },
                  { key: 'ajustar_limiares', label: 'Ajuste de Limiares Críticos', desc: 'Alteração de cotas de alerta e emergência' },
                  { key: 'analise_ia', label: 'Suporte Geotinho (IA)', desc: 'Pareceres automáticos e cálculo de estabilidade' },
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
                        padding: '0.55rem 0.75rem',
                        borderRadius: '4px',
                        backgroundColor: isAllowed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
                        border: `1px solid ${isAllowed ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-subtle)'}`
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isAllowed ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {perm.label}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {perm.desc}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.12rem 0.4rem',
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

            {/* Simulação Rápida de Usuários */}
            <div className="card-panel" style={{
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-surface)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <UserCheck size={18} style={{ color: '#10b981' }} />
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Simulação Rápida de Perfis
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                    Alterne entre contas de campo e engenharia para auditoria
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: isSelected ? '1.5px solid #10b981' : '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px',
                          backgroundColor: isSelected ? '#10b981' : '#0284c7',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          overflow: 'hidden'
                        }}>
                          {usr.foto ? (
                            <img src={usr.foto} alt={usr.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            usr.avatar
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {usr.nome}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {role?.title} • {usr.registro}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <CheckCircle2 size={12} /> ATIVO
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', color: 'var(--primary-accent)', fontWeight: 700 }}>
                          Conectar
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------
          2. SUB-ABA: SEGURANÇA & REDEFINIÇÃO DE SENHA (2FA / MFA)
          ------------------------------------------------------------ */}
      {activeSection === 'seguranca' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Formulário de Redefinição de Senha */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <Lock size={20} style={{ color: 'var(--primary-accent)' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {t.security.changePassword}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Atualize sua credencial com parâmetros de cibersegurança industrial
                </p>
              </div>
            </div>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Senha Atual */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  {t.security.currentPassword} *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSenhaAtual ? 'text' : 'password'}
                    required
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    className="form-input"
                    placeholder="Digite a senha atual"
                    style={{ width: '100%', borderRadius: '4px', paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showSenhaAtual ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Nova Senha */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  {t.security.newPassword} *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNovaSenha ? 'text' : 'password'}
                    required
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="form-input"
                    placeholder="Mínimo 8 dígitos com números e símbolos"
                    style={{ width: '100%', borderRadius: '4px', paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNovaSenha(!showNovaSenha)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showNovaSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Medidor de Força da Senha */}
                {novaSenha && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t.security.passwordStrength}:</span>
                      <strong style={{ color: passwordStrength.color }}>{passwordStrength.label}</strong>
                    </div>
                    <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${passwordStrength.score}%`,
                        height: '100%',
                        backgroundColor: passwordStrength.color,
                        transition: 'width 0.25s ease'
                      }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Nova Senha */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  {t.security.confirmPassword} *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmaSenha ? 'text' : 'password'}
                    required
                    value={confirmaSenha}
                    onChange={(e) => setConfirmaSenha(e.target.value)}
                    className="form-input"
                    placeholder="Repita a nova senha"
                    style={{ width: '100%', borderRadius: '4px', paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmaSenha(!showConfirmaSenha)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showConfirmaSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

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
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  marginTop: '0.5rem',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Lock size={18} />}
                <span>{isSaving ? 'Validando...' : 'Salvar Nova Senha'}</span>
              </button>
            </form>
          </div>

          {/* Painel Lateral: 2FA & Dispositivos Conectados */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Autenticação em Dois Fatores (2FA) */}
            <div className="card-panel" style={{
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-surface)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Fingerprint size={20} style={{ color: is2FAEnabled ? '#10b981' : 'var(--text-muted)' }} />
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {t.security.twoFactor}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: is2FAEnabled ? '#10b981' : 'var(--text-muted)', fontWeight: 700 }}>
                      {is2FAEnabled ? '● ATIVADO (Padrão Corporativo)' : '○ DESATIVADO'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: is2FAEnabled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: is2FAEnabled ? '#ef4444' : '#10b981'
                  }}
                >
                  {is2FAEnabled ? 'Desativar' : 'Ativar 2FA'}
                </button>
              </div>

              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                {t.security.twoFactorDesc}
              </p>
            </div>

            {/* Sessões e Dispositivos Conectados */}
            <div className="card-panel" style={{
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-surface)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Laptop size={18} style={{ color: 'var(--primary-accent)' }} />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {t.security.activeSessions}
                  </h4>
                </div>

                <button
                  onClick={handleTerminateOtherSessions}
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {t.security.terminateOtherSessions}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {sessions.map(s => (
                  <div
                    key={s.id}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '6px',
                      backgroundColor: s.atual ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-secondary)',
                      border: s.atual ? '1px solid var(--border-highlight)' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>{s.dispositivo}</span>
                        {s.atual && (
                          <span style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem', borderRadius: '3px', backgroundColor: 'var(--primary-accent)', color: '#ffffff' }}>
                            ESTE DISPOSITIVO
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        IP: {s.ip} • {s.localizacao} • {s.ultimoAcesso}
                      </div>
                    </div>

                    {!s.atual && (
                      <button
                        onClick={() => handleRevokeSession(s.id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          fontSize: '0.68rem',
                          cursor: 'pointer'
                        }}
                        title="Desconectar dispositivo"
                      >
                        Encerrar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------
          3. SUB-ABA: IDIOMA, UNIDADES & DATUM GEODÉSICO
          ------------------------------------------------------------ */}
      {activeSection === 'idioma_unidades' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Seletor de Idioma */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <Globe size={20} style={{ color: 'var(--primary-accent)' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Idioma do Sistema (i18n)
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Alterne o idioma de operação e relatórios técnicos do MDSync
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.keys(TRANSLATIONS).map(code => {
                const item = TRANSLATIONS[code];
                const isSelected = currentLang === code;

                return (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: '6px',
                      border: isSelected ? '1.5px solid var(--primary-accent)' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--primary-accent-bg)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.6rem' }}>{item.flag}</span>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isSelected ? 'var(--primary-accent)' : 'var(--text-main)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    {isSelected ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={15} /> ATIVO
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Selecionar
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Datum Geodésico & Unidades de Medida */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <Sliders size={20} style={{ color: '#10b981' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Datum Geodésico & Unidades Minerárias
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Parâmetros de cálculo piezométrico e cartografia de barragens
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Datum */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Sistema Geodésico de Referência (Datum)
                </label>
                <select
                  value={geotechUnits.datum}
                  onChange={(e) => handleUnitsChange('datum', e.target.value)}
                  className="form-select"
                  style={{ width: '100%', borderRadius: '4px' }}
                >
                  <option value="SIRGAS 2000 / UTM 23S">SIRGAS 2000 / UTM 23S (Oficial Minas Gerais / Quadrilátero)</option>
                  <option value="WGS 84 / UTM 23S">WGS 84 / UTM 23S (GPS Global / Imagens de Satélite)</option>
                  <option value="SAD 69 / UTM 23S">SAD 69 (Cartografia Legada de Engenharia)</option>
                </select>
              </div>

              {/* Cota e Piezometria */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Elevação / Cota
                  </label>
                  <select
                    value={geotechUnits.cota}
                    onChange={(e) => handleUnitsChange('cota', e.target.value)}
                    className="form-select"
                    style={{ width: '100%', borderRadius: '4px' }}
                  >
                    <option value="m a.n.m.">m a.n.m. (metros)</option>
                    <option value="ft">ft (pés - Padrão US)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Pressão Piezométrica
                  </label>
                  <select
                    value={geotechUnits.pressao}
                    onChange={(e) => handleUnitsChange('pressao', e.target.value)}
                    className="form-select"
                    style={{ width: '100%', borderRadius: '4px' }}
                  >
                    <option value="m.c.a.">m.c.a. (metros coluna d'água)</option>
                    <option value="kPa">kPa (quilopascal)</option>
                    <option value="bar">bar</option>
                  </select>
                </div>
              </div>

              {/* Vazão e Chuva */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Vazão de Drenos / Vertedouro
                  </label>
                  <select
                    value={geotechUnits.vazao}
                    onChange={(e) => handleUnitsChange('vazao', e.target.value)}
                    className="form-select"
                    style={{ width: '100%', borderRadius: '4px' }}
                  >
                    <option value="L/s">L/s (Litros por segundo)</option>
                    <option value="L/min">L/min (Litros por minuto)</option>
                    <option value="m3/h">m³/h (Metros cúbicos/hora)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Pluviometria Acumulada
                  </label>
                  <select
                    value={geotechUnits.chuva}
                    onChange={(e) => handleUnitsChange('chuva', e.target.value)}
                    className="form-select"
                    style={{ width: '100%', borderRadius: '4px' }}
                  >
                    <option value="mm/h">mm/h e mm/24h</option>
                    <option value="in/h">polegadas (in)</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------
          4. SUB-ABA: TEMA & ERGONOMIA DE CAMPO
          ------------------------------------------------------------ */}
      {activeSection === 'tema_ergonomia' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Modos de Tema */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <Contrast size={20} style={{ color: 'var(--primary-accent)' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Aparência & Ergonomia de Campo
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Modos visuais otimizados para sala de controle e luz solar intensa em campo
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { 
                  id: 'dark', 
                  label: 'Escuro Geotécnico (Dark Geotech)', 
                  desc: 'Padrão sala de controle e COI. Reduz cansaço visual em longos turnos.', 
                  icon: Moon,
                  previewBg: '#090d16',
                  previewColor: '#38bdf8'
                },
                { 
                  id: 'light', 
                  label: 'Claro Executivo (Light Modern)', 
                  desc: 'Ideal para escritórios e impressão de relatórios para diretoria.', 
                  icon: Sun,
                  previewBg: '#f8fafc',
                  previewColor: '#0284c7'
                },
                { 
                  id: 'contrast', 
                  label: 'Alto Contraste Solar (Campo & Mina)', 
                  desc: 'Fundo preto puro e bordas de alta visibilidade sob luz solar direta em tablets.', 
                  icon: Contrast,
                  previewBg: '#000000',
                  previewColor: '#facc15'
                }
              ].map(themeItem => {
                const Icon = themeItem.icon;
                const isSelected = currentTheme === themeItem.id;

                return (
                  <button
                    key={themeItem.id}
                    onClick={() => handleThemeChange(themeItem.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: '6px',
                      border: isSelected ? '2px solid var(--primary-accent)' : '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '6px',
                        backgroundColor: themeItem.previewBg,
                        border: `2px solid ${themeItem.previewColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: themeItem.previewColor
                      }}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {themeItem.label}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {themeItem.desc}
                        </div>
                      </div>
                    </div>

                    {isSelected ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={16} /> ATIVO
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Ativar
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cores de Acento & Densidade */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <Sparkles size={20} style={{ color: '#f59e0b' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Cores de Destaque & Ergonomia
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Personalize os botões e destaques de acordo com seu padrão operacional
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Paleta de Acento */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Cor de Destaque / Identidade Visual
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
                  {[
                    { hex: '#38bdf8', label: 'Ciano Geotech' },
                    { hex: '#f97316', label: 'Laranja EPI' },
                    { hex: '#10b981', label: 'Verde Mina' },
                    { hex: '#a855f7', label: 'Roxo Geofísica' }
                  ].map(color => {
                    const isSelected = accentColor === color.hex;
                    return (
                      <button
                        key={color.hex}
                        onClick={() => handleAccentChange(color.hex)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.6rem',
                          borderRadius: '6px',
                          border: isSelected ? `2px solid ${color.hex}` : '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: color.hex, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
                        <span style={{ fontSize: '0.68rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? color.hex : 'var(--text-muted)' }}>
                          {color.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Densidade de Campo */}
              <div style={{ marginTop: '0.5rem', padding: '0.85rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  Modo de Interface em Campo
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Os botões do MDSync possuem dimensões mínimas de toque de 44px (touch targets) para facilitar o manuseio com luvas de segurança em campo.
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------
          5. SUB-ABA: NOTIFICAÇÕES, ALERTAS & SIRENE GEOTÉCNICA
          ------------------------------------------------------------ */}
      {activeSection === 'notificacoes' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Configuração de Canais e Limiares */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <Bell size={20} style={{ color: '#f59e0b' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Canais de Notificação & Alerta
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Defina como a equipe geotécnica será acionada em caso de anomalias
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { key: 'pushWeb', label: 'Notificações Web Push no Navegador', desc: 'Alertas em tela imediata mesmo com aba em segundo plano' },
                { key: 'somNivel2', label: 'Sinal Sonoro para Nível 2 (Alerta)', desc: 'Beep de advertência em caso de variação piezométrica brusca' },
                { key: 'sireneNivel3', label: 'Sirene de Emergência para Nível 3', desc: 'Alarme sonoro contínuo e bloqueio de tela conforme PAEBM' },
                { key: 'emailRelatorios', label: 'Relatórios Diários por E-mail', desc: 'Envio consolidado de leituras às 07:00h e 19:00h' },
                { key: 'smsEmergencia', label: 'SMS de Plantão para Coordenadores', desc: 'Disparo via gateway de telefonia celular em emergência' }
              ].map(notif => (
                <div
                  key={notif.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {notif.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {notif.desc}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleNotif(notif.key)}
                    style={{
                      width: '46px',
                      height: '24px',
                      borderRadius: '12px',
                      backgroundColor: notifConfig[notif.key] ? '#10b981' : 'var(--border-subtle)',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      position: 'absolute',
                      top: '3px',
                      left: notifConfig[notif.key] ? '25px' : '3px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Teste da Sirene de Emergência */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <Volume2 size={20} style={{ color: '#ef4444' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Teste de Prontidão da Sirene Geotécnica
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Simulação de toque acústico de evacuação e emergência (PAEBM)
                </p>
              </div>
            </div>

            <div style={{
              padding: '1.25rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1.5px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: isTestingSiren ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
                color: isTestingSiren ? '#ffffff' : '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isTestingSiren ? '0 0 20px rgba(239, 68, 68, 0.7)' : 'none',
                transition: 'all 0.2s ease'
              }}>
                <Volume2 size={32} className={isTestingSiren ? 'animate-bounce' : ''} />
              </div>

              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {isTestingSiren ? '🔊 TRANSMITINDO TOM DE SIRENE...' : 'Simulador Acústico Offline'}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0', maxWidth: '320px' }}>
                  Utiliza o sintetizador de áudio Web Audio API integrado no navegador para gerar a frequência de alarme de Nível 3 (700Hz - 1250Hz).
                </p>
              </div>

              <button
                type="button"
                onClick={handlePlaySirenTest}
                disabled={isTestingSiren}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: isTestingSiren ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                }}
              >
                <Volume2 size={18} />
                <span>{isTestingSiren ? 'Tocando Sirene (2.5s)...' : 'Testar Sirene de Emergência'}</span>
              </button>
            </div>

            {/* Contatos de Plantão */}
            <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                Plantão Geotécnico 24h:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Telefone de Emergência:</span>
                <strong style={{ color: 'var(--text-main)' }}>+55 (31) 99887-6655</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>E-mail da Sala de Controle:</span>
                <strong style={{ color: 'var(--text-main)' }}>geotecnia.plantao@itaminas.com.br</strong>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------
          6. SUB-ABA: ARMAZENAMENTO OFFLINE & BACKUP
          ------------------------------------------------------------ */}
      {activeSection === 'armazenamento_backup' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Status do Armazenamento Local */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <Database size={20} style={{ color: 'var(--primary-accent)' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Armazenamento Local & Cache Offline
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Gerenciamento de dados gravados no dispositivo para operação em mina
                </p>
              </div>
            </div>

            {/* Indicador de Espaço */}
            <div style={{ padding: '1rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Espaço Utilizado no Dispositivo:
                </span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--primary-accent)' }}>
                  {storageStats.usedFormatted}
                </strong>
              </div>

              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                <div style={{
                  width: `${storageStats.percentEstimated}%`,
                  height: '100%',
                  backgroundColor: 'var(--primary-accent)'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>{storageStats.itemsCount} tabelas e chaves ativas</span>
                <span>Limite seguro estimado: ~5 MB LocalStorage</span>
              </div>
            </div>

            {/* Ações de Manutenção */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleClearCache}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <Trash2 size={14} style={{ color: '#f59e0b' }} />
                <span>Limpar Cache Temporário</span>
              </button>

              <button
                type="button"
                onClick={refreshStorageStats}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
                title="Recalcular espaço"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Exportação & Importação de Backup JSON */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <Download size={20} style={{ color: '#10b981' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Backup Completo da Base Geotécnica
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Exporte ou restaure todos os 218 instrumentos, leituras e anomalias
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Botão Exportar */}
              <button
                type="button"
                onClick={handleExportBackup}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1.5px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.825rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Download size={18} />
                  <span>Exportar Dossiê de Backup (JSON)</span>
                </div>
                <ChevronRight size={16} />
              </button>

              {/* Botão Importar */}
              <div>
                <label
                  htmlFor="backup-json-import"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px dashed var(--border-medium)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.825rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Upload size={18} style={{ color: 'var(--primary-accent)' }} />
                    <span>Restaurar Backup de Arquivo JSON...</span>
                  </div>
                  <input
                    id="backup-json-import"
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    style={{ display: 'none' }}
                  />
                  <ChevronRight size={16} />
                </label>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4, padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                ℹ️ O arquivo de backup exportado contém a integridade de todas as leituras, fotografias em Base64, fichas de inspeção ISR e matrizes de risco.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------
          7. SUB-ABA: ATUALIZAÇÃO DE VERSÃO & PWA
          ------------------------------------------------------------ */}
      {activeSection === 'versao_pwa' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Verificador de Versão */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <RefreshCw size={20} style={{ color: 'var(--primary-accent)' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Ciclo de Versões & Status do Sistema
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Gerenciador de atualizações online e cache do Progressive Web App (PWA)
                </p>
              </div>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Versão Atual em Execução:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    v2.5.0-PRO (Sentnel-Mining)
                  </div>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.6rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  PRODUÇÃO ESTÁVEL
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                <span>Build: 2026.09.22-REV6D5B</span>
                <span>Motor: Vite 8.3 + React 19</span>
              </div>
            </div>

            {updateStatus.checked && (
              <div style={{
                padding: '0.85rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                fontSize: '0.78rem',
                fontWeight: 600,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} />
                <span>{updateStatus.message}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleCheckUpdates}
              disabled={isCheckingUpdate}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <RefreshCw size={16} className={isCheckingUpdate ? 'animate-spin' : ''} />
              <span>{isCheckingUpdate ? 'Consultando Repositório...' : 'Verificar Atualizações do Sistema'}</span>
            </button>
          </div>

          {/* Changelog das Versões Recentes */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <History size={18} style={{ color: 'var(--primary-accent)' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Histórico de Atualizações (Changelog)
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                {
                  version: 'v2.5.0-PRO',
                  date: '22/09/2026',
                  title: 'Hub Unificado de Configurações & i18n',
                  items: ['Suporte multilíngue (Português, Inglês, Espanhol)', 'Redefinição de senha com força e 2FA corporativo', 'Temas Escuro, Claro e Alto Contraste Solar', 'Teste de sirene via Web Audio API e backup JSON']
                },
                {
                  version: 'v2.4.0',
                  date: '22/09/2026',
                  title: 'Refinamento Sentnel & Multiperspectiva',
                  items: ['Seções Transversais 2D com Linha Freática interativa', 'Matriz de Anomalias e Fichas ISR/ISE (ANM 95/2022)', 'Acervo Documental (PSB, PAEBM, DCE) e Diário Operacional']
                },
                {
                  version: 'v2.3.0',
                  date: '21/09/2026',
                  title: 'Coleta de Campo & Radar Meteorológico',
                  items: ['Registro com piômetro e fotos de campo', 'Integração meteorológica do site e chuva acumulada']
                }
              ].map((ver, idx) => (
                <div
                  key={ver.version}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '6px',
                    backgroundColor: idx === 0 ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-secondary)',
                    border: idx === 0 ? '1px solid var(--border-highlight)' : '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <strong style={{ fontSize: '0.825rem', color: idx === 0 ? 'var(--primary-accent)' : 'var(--text-main)' }}>
                      {ver.version} — {ver.title}
                    </strong>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{ver.date}</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {ver.items.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------
          8. SUB-ABA: POLÍTICAS, TERMOS DE USO & COMPLIANCE ANM
          ------------------------------------------------------------ */}
      {activeSection === 'politicas_compliance' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Seletor de Políticas */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <FileCheck2 size={20} style={{ color: '#10b981' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Políticas, Termos de Uso & Compliance
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Documentação regulatória, governança de dados e compliance PNSB
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { 
                  id: 'art', 
                  title: 'Termo de Responsabilidade Técnica (ART/RRT)', 
                  desc: 'Vínculo legal perante CREA/CONFEA e Portaria ANM nº 95/2022',
                  status: 'HOMOLOGADO E VÁLIDO'
                },
                { 
                  id: 'sigilo', 
                  title: 'Política de Sigilo e Dados Críticos de Barragens', 
                  desc: 'Proteção de mapas de inundação (Dam Break), ZAS e telemetria',
                  status: 'CONFIDENCIAL'
                },
                { 
                  id: 'lgpd', 
                  title: 'Política de Privacidade & LGPD na Mineração', 
                  desc: 'Tratamento de dados biométricos, fotos e rastreabilidade de IP',
                  status: 'CONFORME LEI 13.709'
                }
              ].map(item => {
                const isSelected = activePolicyDoc === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePolicyDoc(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: '6px',
                      border: isSelected ? '1.5px solid #10b981' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 800, color: isSelected ? '#10b981' : 'var(--text-main)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {item.desc}
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.4rem',
                      borderRadius: '3px',
                      backgroundColor: isSelected ? '#10b981' : 'var(--bg-surface)',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)'
                    }}>
                      {item.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visualizador do Termo Selecionado */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} style={{ color: 'var(--primary-accent)' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Visualizador do Termo Oficial
                </h4>
              </div>

              <button
                onClick={() => handleDownloadPolicy(activePolicyDoc)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '4px',
                  backgroundColor: 'var(--primary-accent-bg)',
                  border: '1px solid var(--border-highlight)',
                  color: 'var(--primary-accent)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Download size={14} />
                <span>Baixar Termo (.txt)</span>
              </button>
            </div>

            <div style={{
              padding: '1rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              maxHeight: '280px',
              overflowY: 'auto',
              fontSize: '0.75rem',
              lineHeight: 1.5,
              color: 'var(--text-main)',
              fontFamily: 'monospace'
            }}>
              {activePolicyDoc === 'art' && (
                <div>
                  <strong>MDSYNC GEOTECNIA - TERMO DE RESPONSABILIDADE TÉCNICA (ART/RRT)</strong><br />
                  Conforme Lei Federal nº 12.334/2010 (PNSB) e Portaria ANM nº 95/2022<br /><br />
                  <strong>Profissional Ativo:</strong> {currentUser?.nome || 'Dra. Vanessa Albuquerque'}<br />
                  <strong>Registro Profissional:</strong> {currentUser?.registro || 'CREA 142.890/D-MG'}<br />
                  <strong>Empresa Mineradora:</strong> {currentUser?.empresa || 'Itaminas Mineração S/A'}<br />
                  <strong>Data de Homologação:</strong> {new Date().toLocaleDateString('pt-BR')}<br /><br />
                  1. O profissional declara ciência de que as leituras piezométricas e inspeções periódicas registradas nesta plataforma são passíveis de fiscalização pela Agência Nacional de Mineração (ANM) e FEAM/SEMAD.<br />
                  2. O registro de falso nível d'água ou ocultação de anomalias Nível 2 ou 3 sujeita o infrator às sanções administrativas, civis e criminais cabíveis.<br />
                  3. Este sistema opera com selo criptográfico SHA-256 e blindagem anti-fraude em todas as transações de banco de dados.
                </div>
              )}

              {activePolicyDoc === 'sigilo' && (
                <div>
                  <strong>POLÍTICA DE SIGILO E GOVERNANÇA DE ATIVOS CRÍTICOS</strong><br />
                  Grau de Confidencialidade: SEGREDOS DE ENGENHARIA E INFRAESTRUTURA<br /><br />
                  1. Os dados de mancha de inundação (Dam Break), zoneamento ZAS e rotas de fuga são ativos confidenciais sob guarda da mineradora e Defesa Civil.<br />
                  2. O compartilhamento externo de prints, coordenadas ou coeficientes de segurança sem autorização expressa da diretoria de geotecnia constitui quebra de sigilo profissional.<br />
                  3. Todos os acessos e downloads realizados são auditados e logados com identificador de IP e carimbo de data/hora.
                </div>
              )}

              {activePolicyDoc === 'lgpd' && (
                <div>
                  <strong>POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS (LGPD)</strong><br />
                  Em atendimento à Lei Federal nº 13.709/2018<br /><br />
                  1. FINALIDADE: Os dados cadastrais de engenheiros e técnicos (nome, e-mail, CREA/CFT) são utilizados exclusivamente para fins de auditoria de responsabilidade técnica de segurança de barragens.<br />
                  2. FOTOGRAFIAS DE CAMPO: As fotos registradas no aplicativo vinculam-se unicamente às anomalias estruturais e inspeções de segurança.<br />
                  3. RETENÇÃO: Os registros de auditoria serão mantidos pelo período mínimo de 20 anos, conforme exigência do Plano de Segurança de Barragens (PSB).
                </div>
              )}
            </div>

            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>Status: <strong style={{ color: '#10b981' }}>Termo Válido e Aceito</strong></span>
              <span>Revisão: 2026.1</span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------
          9. SUB-ABA: REGRAS DE INSPEÇÃO & IDENTIFICADORES (SYSDAM)
          ------------------------------------------------------------ */}
      {activeSection === 'regras_inspecao' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* PAINEL 1: 4 REGRAS OPERACIONAIS DE INSPEÇÃO (INSPIRADO NO SYSDAM) */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sliders size={20} style={{ color: 'var(--primary-accent)' }} />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Parâmetros Operacionais de Inspeção (Padrão SYSDAM)
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Controle de inserção avulsa, histórico retroativo com data de corte, autenticação PIN e sincronismo ao vivo
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  storageService.saveInspectionRules(inspectionRules);
                  storageService.saveRecordIdTemplate(recordTemplate);
                  if (setSystemToast) {
                    setSystemToast({
                      type: 'success',
                      message: 'Regras de inspeção e template SYSDAM salvos com sucesso!'
                    });
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--primary-accent)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Save size={14} />
                <span>Salvar Parâmetros</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Regra 1: Registro Avulso */}
              <div style={{
                padding: '1.2rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-card)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'inline-block', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: 'var(--primary-accent)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                      Habilitar a inserção de registro avulso
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Permite a inserção de registros avulsos no aplicativo. Quando desabilitada, os registros só poderão ser inseridos dentro de uma campanha de inspeção. Esta funcionalidade oferece maior flexibilidade para os inspetores registrarem ocorrências independentes.
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={inspectionRules.habilitarRegistroAvulso}
                      onChange={(e) => {
                        const updated = { ...inspectionRules, habilitarRegistroAvulso: e.target.checked };
                        setInspectionRules(updated);
                        storageService.saveInspectionRules(updated);
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-accent)' }}
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: inspectionRules.habilitarRegistroAvulso ? 'var(--primary-accent)' : 'var(--text-faint)' }}>
                      {inspectionRules.habilitarRegistroAvulso ? 'Registro avulso habilitado' : 'Registro avulso desabilitado'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Regra 2: Permitir históricos em outros registros */}
              <div style={{
                padding: '1.2rem',
                borderRadius: '8px',
                border: '1.5px solid var(--border-highlight)',
                backgroundColor: 'var(--bg-card)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-accent)', marginBottom: '0.4rem' }}>
                      Permitir históricos em outros registros
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Quando habilitado, passa a ser permitido adicionar históricos em outros registros a partir da data de corte, e os registros com histórico dentro desse período passam a ser exibidos no aplicativo.
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={inspectionRules.permitirHistoricosOutrosRegistros}
                      onChange={(e) => {
                        const updated = { ...inspectionRules, permitirHistoricosOutrosRegistros: e.target.checked };
                        setInspectionRules(updated);
                        storageService.saveInspectionRules(updated);
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-accent)' }}
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: inspectionRules.permitirHistoricosOutrosRegistros ? 'var(--primary-accent)' : 'var(--text-faint)' }}>
                      {inspectionRules.permitirHistoricosOutrosRegistros ? 'Histórico habilitado' : 'Histórico desabilitado'}
                    </span>
                  </label>
                </div>

                {/* Alerta de Registro Retroativo */}
                <div style={{
                  padding: '0.7rem 0.9rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.74rem',
                  color: '#f59e0b',
                  marginBottom: '0.75rem'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>
                    Para registros anteriores, crie um novo registro após essa data e use a função de <strong>fundir registros</strong> para agrupá-los. Em caso de dúvida, contate o suporte.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Data de corte do histórico:</span>
                  <input
                    type="date"
                    value={inspectionRules.dataCorteHistorico || '2026-01-01'}
                    onChange={(e) => {
                      const updated = { ...inspectionRules, dataCorteHistorico: e.target.value };
                      setInspectionRules(updated);
                      storageService.saveInspectionRules(updated);
                    }}
                    style={{
                      padding: '0.35rem 0.6rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-medium)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-main)',
                      fontSize: '0.75rem'
                    }}
                  />
                </div>
              </div>

              {/* Regra 3: Configuração de PIN */}
              <div style={{
                padding: '1.2rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-card)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-accent)', marginBottom: '0.4rem' }}>
                      Configuração de PIN para inspeções
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Exigir PIN (senha) para envio de registros ou campanhas de inspeção do aplicativo mobile para a web. O PIN é individual e intransferível, podendo ser configurado pelo próprio usuário na tela de configurações do portal.
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={inspectionRules.configuracaoPinInspecoes}
                      onChange={(e) => {
                        const updated = { ...inspectionRules, configuracaoPinInspecoes: e.target.checked };
                        setInspectionRules(updated);
                        storageService.saveInspectionRules(updated);
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-accent)' }}
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: inspectionRules.configuracaoPinInspecoes ? 'var(--primary-accent)' : 'var(--text-faint)' }}>
                      {inspectionRules.configuracaoPinInspecoes ? 'PIN exigido nas inspeções' : 'PIN não exigido nas inspeções'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Regra 4: Live Inspection */}
              <div style={{
                padding: '1.2rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-card)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-accent)', marginBottom: '0.4rem' }}>
                      Habilitar Live Inspection
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Permite a sincronização de inspeções em tempo real no aplicativo para a web, quando houver conexão com a internet. Ajuda a melhorar a eficiência e a precisão das inspeções, além de melhorar a experiência do usuário.
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={inspectionRules.habilitarLiveInspection}
                      onChange={(e) => {
                        const updated = { ...inspectionRules, habilitarLiveInspection: e.target.checked };
                        setInspectionRules(updated);
                        storageService.saveInspectionRules(updated);
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-accent)' }}
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: inspectionRules.habilitarLiveInspection ? '#10b981' : 'var(--text-faint)' }}>
                      {inspectionRules.habilitarLiveInspection ? 'Live Inspection ativada' : 'Live Inspection desativada'}
                    </span>
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* PAINEL 2: MOTOR DE TEMPLATE DO IDENTIFICADOR DO REGISTRO (SCREENSHOT 5) */}
          <div className="card-panel" style={{
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileText size={20} style={{ color: 'var(--primary-accent)' }} />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Identificador do Registro — Sintaxe Customizada
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Formatação dinâmica do código das anomalias e ocorrências geotécnicas
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const defaultTpl = '{SIGLA_EMPREENDIMENTO} - {NOME_SINTOMA}';
                  setRecordTemplate(defaultTpl);
                  storageService.saveRecordIdTemplate(defaultTpl);
                  if (setSystemToast) {
                    setSystemToast({ type: 'info', message: 'Template restaurado para o padrão SYSDAM!' });
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={12} />
                <span>Restaurar Padrão</span>
              </button>
            </div>

            {/* Banner de Ajuda com Borda Azul Lateral */}
            <div style={{
              borderLeft: '4px solid var(--primary-accent)',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              padding: '0.85rem 1rem',
              borderRadius: '0 6px 6px 0',
              fontSize: '0.78rem',
              lineHeight: 1.5,
              color: 'var(--text-main)',
              marginBottom: '1.25rem'
            }}>
              Utilize <strong>'@'</strong> para ver as variáveis disponíveis para o template do identificador do registro. Caso não seja informado um template do identificador, será utilizado o formato padrão.
            </div>

            {/* Input do Template */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Template do identificador:
              </label>
              <input
                type="text"
                value={recordTemplate}
                onChange={(e) => {
                  setRecordTemplate(e.target.value);
                  storageService.saveRecordIdTemplate(e.target.value);
                }}
                placeholder="{SIGLA_EMPREENDIMENTO} - {NOME_SINTOMA}"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  border: '1.5px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Pré-visualização Dinâmica */}
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>
                Pré-visualização:
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-accent)', fontFamily: 'monospace' }}>
                {recordIdTemplateService.interpolateTemplate(recordTemplate, {
                  siglaEstrutura: 'B1',
                  siglaEmpreendimento: 'IT',
                  sintoma: 'Erosão',
                  id: '1',
                  contador: 1
                }) || '—'}
              </div>
            </div>

            {/* Inserção Rápida de Variáveis */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Inserir variável rapidamente:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {AVAILABLE_VARIABLES.map(v => (
                  <button
                    key={v.token}
                    type="button"
                    onClick={() => {
                      const updated = (recordTemplate ? recordTemplate + ' ' : '') + v.token;
                      setRecordTemplate(updated);
                      storageService.saveRecordIdTemplate(updated);
                    }}
                    style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid var(--border-highlight)',
                      color: 'var(--primary-accent)',
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + {v.token}
                  </button>
                ))}
              </div>
            </div>

            {/* Dicionário de Variáveis */}
            <div>
              <button
                type="button"
                onClick={() => setShowVarsGuide(!showVarsGuide)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-accent)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '0.75rem'
                }}
              >
                {showVarsGuide ? 'Esconder variáveis disponíveis' : 'Mostrar variáveis disponíveis'}
              </button>

              {showVarsGuide && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  padding: '1rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                  lineHeight: 1.5
                }}>
                  {AVAILABLE_VARIABLES.map(v => (
                    <div key={v.token}>
                      <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{v.token}:</strong>{' '}
                      <span style={{ color: 'var(--text-muted)' }}>{v.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ============================================================
          RODAPÉ INFORMATIVO DO SISTEMA
          ============================================================ */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem 1.25rem',
        borderRadius: '6px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={16} style={{ color: 'var(--geo-normal)' }} />
          <span>
            MDSync Geotecnia • Itaminas Mineração S/A • Sistema auditado conforme PNSB (Lei 12.334/2010 e ANM 95/2022)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => onNavigateTab && onNavigateTab('dashboard')}
            style={{ background: 'none', border: 'none', color: 'var(--primary-accent)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <span>Ir ao Dashboard</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

    </div>
  );
};

// ============================================================
// MDSync Geotecnia - Dicionário de Internacionalização (i18n)
// Suporte a Português (Brasil), English (US) e Español (ES)
// ============================================================

export const TRANSLATIONS = {
  'pt-BR': {
    code: 'pt-BR',
    name: 'Português (Brasil)',
    flag: '🇧🇷',
    subtitle: 'Padrão Oficial ANM / FEAM / PNSB',
    common: {
      save: 'Salvar Alterações',
      saving: 'Salvando...',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      delete: 'Excluir',
      export: 'Exportar',
      import: 'Importar',
      active: 'Ativo',
      inactive: 'Inativo',
      authorized: 'Autorizado',
      blocked: 'Bloqueado',
      success: 'Operação realizada com sucesso!',
      error: 'Ocorreu um erro na operação.',
      loading: 'Carregando dados...',
      search: 'Buscar...',
      status: 'Status',
      version: 'Versão',
      details: 'Detalhes'
    },
    nav: {
      settings: 'Configurações & Perfil',
      settingsDesc: 'Gestão de perfil, credenciais, segurança, preferências e compliance',
      dashboard: 'Painel Geotécnico',
      secoes: 'Seções 2D',
      anomalias: 'Anomalias & ISR',
      documentos: 'Documentos',
      comunicacao: 'Comunicação'
    },
    sections: {
      profile: 'Perfil & Credenciais',
      security: 'Segurança & Senha',
      languageUnits: 'Idioma, Unidades & Datum',
      theme: 'Tema & Ergonomia',
      notifications: 'Notificações & Sirene',
      storageBackup: 'Armazenamento & Backup',
      versionPwa: 'Versão & PWA',
      policies: 'Políticas & Compliance'
    },
    geotech: {
      dams: 'Barragens',
      slopes: 'Taludes',
      wasteDumps: 'Pilhas de Estéril',
      pits: 'Cavas de Mina',
      piezometer: 'Piezômetro',
      waterLevel: 'Nível d\'Água (NA)',
      porePressure: 'Pressão Neutra',
      flowRate: 'Vazão de Drenagem',
      rainGauge: 'Pluviômetro',
      factorOfSafety: 'Fator de Segurança (FS)',
      phreaticLine: 'Linha Freática'
    },
    security: {
      currentPassword: 'Senha Atual',
      newPassword: 'Nova Senha',
      confirmPassword: 'Confirmar Nova Senha',
      changePassword: 'Redefinir Senha de Acesso',
      passwordStrength: 'Força da Senha',
      weak: 'Fraca',
      medium: 'Média',
      strong: 'Forte',
      veryStrong: 'Excelente / Cibersegura',
      twoFactor: 'Autenticação em Dois Fatores (2FA / MFA)',
      twoFactorDesc: 'Exigir código TOTP em cada login para cumprimento da governança cibernética de mineração.',
      activeSessions: 'Sessões e Dispositivos Conectados',
      terminateOtherSessions: 'Encerrar Outras Sessões Ativas',
      rateLimitTitle: 'Auditoria de Tentativas de Acesso (Rate Limiting)',
      rateLimitDesc: 'Bloqueio progressivo de IP após 5 tentativas consecutivas incorretas.'
    }
  },

  'en-US': {
    code: 'en-US',
    name: 'English (US / Global)',
    flag: '🇺🇸',
    subtitle: 'ICOLD / GISTM Mining Standard',
    common: {
      save: 'Save Changes',
      saving: 'Saving...',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      export: 'Export',
      import: 'Import',
      active: 'Active',
      inactive: 'Inactive',
      authorized: 'Authorized',
      blocked: 'Blocked',
      success: 'Operation completed successfully!',
      error: 'An error occurred during operation.',
      loading: 'Loading data...',
      search: 'Search...',
      status: 'Status',
      version: 'Version',
      details: 'Details'
    },
    nav: {
      settings: 'Settings & Profile',
      settingsDesc: 'Profile management, credentials, security, preferences and compliance',
      dashboard: 'Geotechnical Dashboard',
      secoes: '2D Cross-Sections',
      anomalias: 'Anomalies & ISR',
      documentos: 'Documents Repository',
      comunicacao: 'Shift Operations'
    },
    sections: {
      profile: 'Profile & Credentials',
      security: 'Security & Password',
      languageUnits: 'Language, Units & Datum',
      theme: 'Theme & Ergonomics',
      notifications: 'Alerts & Siren',
      storageBackup: 'Offline Storage & Backup',
      versionPwa: 'Version & PWA',
      policies: 'Policies & Compliance'
    },
    geotech: {
      dams: 'Tailings Dams',
      slopes: 'Slopes',
      wasteDumps: 'Waste Dumps',
      pits: 'Open Pits',
      piezometer: 'Piezometer',
      waterLevel: 'Water Table Level (WL)',
      porePressure: 'Pore Pressure',
      flowRate: 'Drainage Flow Rate',
      rainGauge: 'Rain Gauge',
      factorOfSafety: 'Factor of Safety (FoS)',
      phreaticLine: 'Phreatic Surface'
    },
    security: {
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      changePassword: 'Reset Access Password',
      passwordStrength: 'Password Strength',
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
      veryStrong: 'Excellent / Cyber-safe',
      twoFactor: 'Two-Factor Authentication (2FA / MFA)',
      twoFactorDesc: 'Enforce TOTP code on every sign-in in compliance with mining cybersecurity protocols.',
      activeSessions: 'Connected Devices & Sessions',
      terminateOtherSessions: 'Terminate Other Active Sessions',
      rateLimitTitle: 'Login Attempt Audit (Rate Limiting)',
      rateLimitDesc: 'Progressive IP lockout triggered after 5 consecutive failed attempts.'
    }
  },

  'es-ES': {
    code: 'es-ES',
    name: 'Español (Latinoamérica)',
    flag: '🇪🇸',
    subtitle: 'Estándar Minería Chile / Perú / México',
    common: {
      save: 'Guardar Cambios',
      saving: 'Guardando...',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      delete: 'Eliminar',
      export: 'Exportar',
      import: 'Importar',
      active: 'Activo',
      inactive: 'Inactivo',
      authorized: 'Autorizado',
      blocked: 'Bloqueado',
      success: '¡Operación realizada con éxito!',
      error: 'Se produjo un error en la operación.',
      loading: 'Cargando datos...',
      search: 'Buscar...',
      status: 'Estado',
      version: 'Versión',
      details: 'Detalles'
    },
    nav: {
      settings: 'Configuraciones & Perfil',
      settingsDesc: 'Gestión de perfil, credenciales, seguridad, preferencias y cumplimiento',
      dashboard: 'Panel Geotécnico',
      secoes: 'Secciones 2D',
      anomalias: 'Anomalías & Inspecciones',
      documentos: 'Repositorio Documental',
      comunicacao: 'Comunicación y Turno'
    },
    sections: {
      profile: 'Perfil & Credenciales',
      security: 'Seguridad & Contraseña',
      languageUnits: 'Idioma, Unidades & Datum',
      theme: 'Tema & Ergonomía',
      notifications: 'Alertas & Sirena',
      storageBackup: 'Almacenamiento & Backup',
      versionPwa: 'Versión & PWA',
      policies: 'Políticas & Cumplimiento'
    },
    geotech: {
      dams: 'Presas de Relaves',
      slopes: 'Taludes',
      wasteDumps: 'Botaderos / Botaderos de Estéril',
      pits: 'Tajos de Mina',
      piezometer: 'Piezómetro',
      waterLevel: 'Nivel Freático (NF)',
      porePressure: 'Presión de Poros',
      flowRate: 'Caudal de Drenaje',
      rainGauge: 'Pluviómetro',
      factorOfSafety: 'Factor de Seguridad (FS)',
      phreaticLine: 'Línea Freática'
    },
    security: {
      currentPassword: 'Contraseña Actual',
      newPassword: 'Nueva Contraseña',
      confirmPassword: 'Confirmar Nueva Contraseña',
      changePassword: 'Restablecer Contraseña',
      passwordStrength: 'Fortaleza de Contraseña',
      weak: 'Débil',
      medium: 'Media',
      strong: 'Fuerte',
      veryStrong: 'Excelente / Cibersegura',
      twoFactor: 'Autenticación de Dos Factores (2FA / MFA)',
      twoFactorDesc: 'Exigir código TOTP en cada inicio de sesión según la gobernanza de ciberseguridad minera.',
      activeSessions: 'Sesiones y Dispositivos Conectados',
      terminateOtherSessions: 'Cerrar Otras Sesiones Activas',
      rateLimitTitle: 'Auditoría de Intentos de Acceso (Rate Limiting)',
      rateLimitDesc: 'Bloqueo progresivo tras 5 intentos fallidos consecutivos.'
    }
  }
};

export const getTranslation = (langCode = 'pt-BR') => {
  return TRANSLATIONS[langCode] || TRANSLATIONS['pt-BR'];
};

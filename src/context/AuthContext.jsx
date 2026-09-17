import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

const AuthContext = createContext(null);

export const ROLES = {
  TECNICO: {
    id: 'TECNICO',
    title: 'Técnico de Campo',
    badge: 'Campo / Coleta',
    foco: 'Registro de leituras no piu, fotos de anomalias e GPS',
    permissoes: ['coleta_campo', 'anomalias', 'visualizar_dados']
  },
  ENGENHEIRO: {
    id: 'ENGENHEIRO',
    title: 'Engenheiro Geotécnico',
    badge: 'Engenharia / Análise',
    foco: 'Curvas piezométricas, limiares, estabilidade e laudos ANM',
    permissoes: ['coleta_campo', 'anomalias', 'visualizar_dados', 'emitir_laudo', 'ajustar_limiares', 'analise_ia']
  },
  GEOLOGO: {
    id: 'GEOLOGO',
    title: 'Geólogo de Barragens',
    badge: 'Geologia / Percolação',
    foco: 'Mapeamento de surgências, seções geológicas e aquífero',
    permissoes: ['coleta_campo', 'anomalias', 'visualizar_dados', 'analise_geologica', 'analise_ia']
  },
  GERENTE: {
    id: 'GERENTE',
    title: 'Gerente de Geotecnia',
    badge: 'Gestão Executiva',
    foco: 'Compliance ANM, KPIs, aprovação de laudos e auditoria',
    permissoes: ['coleta_campo', 'anomalias', 'visualizar_dados', 'emitir_laudo', 'ajustar_limiares', 'analise_ia', 'auditoria_completa']
  }
};

const DEFAULT_USERS = [
  {
    id: 'USR-001',
    nome: 'Carlos Eduardo Mendes',
    email: 'carlos.mendes@itaminas.com.br',
    senhaHash: 'itaminas123', // Demo hash
    roleKey: 'TECNICO',
    registro: 'CFT 48921-MG',
    empresa: 'Itaminas Mineração S/A',
    avatar: 'CM',
    ultimoAcesso: new Date().toISOString()
  },
  {
    id: 'USR-002',
    nome: 'Dra. Vanessa Albuquerque',
    email: 'vanessa.albuquerque@itaminas.com.br',
    senhaHash: 'itaminas123',
    roleKey: 'ENGENHEIRO',
    registro: 'CREA 142.890/D-MG',
    empresa: 'Itaminas Mineração S/A',
    avatar: 'VA',
    ultimoAcesso: new Date().toISOString()
  },
  {
    id: 'USR-003',
    nome: 'Rodrigo P. Guimarães',
    email: 'rodrigo.guimaraes@itaminas.com.br',
    senhaHash: 'itaminas123',
    roleKey: 'GEOLOGO',
    registro: 'CREA 98.412/D-MG',
    empresa: 'Itaminas Mineração S/A',
    avatar: 'RG',
    ultimoAcesso: new Date().toISOString()
  },
  {
    id: 'USR-004',
    nome: 'Eng. Marcelo N. Siqueira',
    email: 'marcelo.siqueira@itaminas.com.br',
    senhaHash: 'itaminas123',
    roleKey: 'GERENTE',
    registro: 'CREA 85.120/D-MG',
    empresa: 'Itaminas Mineração S/A',
    avatar: 'MS',
    ultimoAcesso: new Date().toISOString()
  }
];

const USERS_STORAGE_KEY = 'mdsync_users_db';
const ACTIVE_USER_KEY = 'mdsync_active_user';
const RATE_LIMIT_KEY = 'mdsync_rate_limit';

export const AuthProvider = ({ children }) => {
  // Inicializar usuários no localStorage se não existirem
  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  });

  // Usuário ativo
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(ACTIVE_USER_KEY);
      if (storedUser) return JSON.parse(storedUser);
      // Fallback para o papel salvo anteriormente
      const savedRoleTitle = storageService.getUserRole();
      const defaultUser = DEFAULT_USERS.find(u => ROLES[u.roleKey]?.title === savedRoleTitle) || DEFAULT_USERS[1];
      return defaultUser;
    } catch {
      return DEFAULT_USERS[1];
    }
  });

  // Rate limiting de tentativas de login
  const [rateLimitState, setRateLimitState] = useState(() => {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { attempts: 0, lockedUntil: null };
  });

  // Salvar usuário ativo quando alterado
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(currentUser));
      if (ROLES[currentUser.roleKey]) {
        storageService.setUserRole(ROLES[currentUser.roleKey].title);
      }
    }
  }, [currentUser]);

  // Função de Login Seguro com Rate Limit
  const login = (email, password) => {
    const now = Date.now();
    if (rateLimitState.lockedUntil && now < rateLimitState.lockedUntil) {
      const secondsLeft = Math.ceil((rateLimitState.lockedUntil - now) / 1000);
      throw new Error(`Acesso temporariamente bloqueado por excesso de tentativas. Aguarde ${secondsLeft}s.`);
    }

    const foundUser = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (!foundUser || foundUser.senhaHash !== password) {
      const newAttempts = rateLimitState.attempts + 1;
      let lockedUntil = null;
      if (newAttempts >= 5) {
        lockedUntil = now + 30000; // Bloqueio por 30s
      }
      const updatedRL = { attempts: newAttempts, lockedUntil };
      setRateLimitState(updatedRL);
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(updatedRL));

      if (lockedUntil) {
        throw new Error('5 tentativas falhas. Conta bloqueada por 30 segundos.');
      }
      throw new Error(`Credenciais inválidas. (${5 - newAttempts} tentativas restantes)`);
    }

    // Sucesso no login - resetar rate limit
    const resetRL = { attempts: 0, lockedUntil: null };
    setRateLimitState(resetRL);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(resetRL));

    const updatedUser = { ...foundUser, ultimoAcesso: new Date().toISOString() };
    setCurrentUser(updatedUser);
    return updatedUser;
  };

  // Cadastro de Novo Usuário
  const register = ({ nome, email, senha, roleKey, registro, empresa }) => {
    if (!nome || !email || !senha || !roleKey) {
      throw new Error('Preencha todos os campos obrigatórios.');
    }
    const emailExists = users.some(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (emailExists) {
      throw new Error('Já existe um usuário cadastrado com este e-mail.');
    }

    const initials = nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const newUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      usuario: email.split('@')[0],
      senhaHash: senha,
      roleKey,
      setor: ROLES[roleKey]?.title || 'Engenharia Geotécnica',
      registro: registro || 'Não informado',
      empresa: empresa || 'Itaminas Mineração S/A',
      avatar: initials || 'US',
      foto: null,
      dataCadastro: new Date().toISOString(),
      ultimoAcesso: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    setCurrentUser(newUser);
    return newUser;
  };

  // Atualização de Perfil de Usuário
  const updateProfile = (updates) => {
    if (!currentUser) return null;
    const updatedUser = { 
      ...currentUser, 
      ...updates,
      avatar: updates.nome ? updates.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : currentUser.avatar
    };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    setCurrentUser(updatedUser);
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  };

  // Troca rápida de papel (útil para testes em campo e escritório)
  const changeRole = (newRoleKey) => {
    if (ROLES[newRoleKey]) {
      const match = users.find(u => u.roleKey === newRoleKey);
      if (match) {
        setCurrentUser(match);
      } else {
        // Atualizar papel do usuário atual
        const updated = {
          ...currentUser,
          roleKey: newRoleKey
        };
        setCurrentUser(updated);
      }
    }
  };

  // Verificar permissão
  const hasPermission = (permission) => {
    if (!currentUser || !currentUser.roleKey) return false;
    const roleConfig = ROLES[currentUser.roleKey];
    return roleConfig ? roleConfig.permissoes.includes(permission) : false;
  };

  const currentRole = ROLES[currentUser?.roleKey] || ROLES.ENGENHEIRO;

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentRole,
      currentRoleKey: currentUser?.roleKey || 'ENGENHEIRO',
      users,
      allRoles: ROLES,
      login,
      register,
      updateProfile,
      changeRole,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

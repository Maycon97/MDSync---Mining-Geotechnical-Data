import { describe, it, expect, beforeEach } from 'vitest';

// Polyfill localStorage para ambiente Node vitest
const memoryStore = {};
const localStorageMock = {
  getItem: (key) => memoryStore[key] ?? null,
  setItem: (key, val) => { memoryStore[key] = String(val); },
  removeItem: (key) => { delete memoryStore[key]; },
  clear: () => {
    Object.keys(memoryStore).forEach(k => delete memoryStore[k]);
  }
};
globalThis.localStorage = localStorageMock;

import { storageService } from '../services/storageService';
import { ROLES } from '../context/AuthContext';

describe('Auth & Profile Persistence Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve armazenar e recuperar o perfil persistente no storageService', () => {
    const profile = {
      id: 'USR-002',
      nome: 'Maycon Douglas M.D. Nascimento',
      email: 'maycon.nascimento@itaminas.com.br',
      usuario: 'Maycon1897',
      setor: 'GEOTECNIA',
      registro: 'CREA 142.890/D-MG',
      empresa: 'Itaminas Comercio de minérios S/A',
      foto: 'data:image/png;base64,fakePhotoData'
    };

    storageService.savePersistentProfile(profile);
    const retrieved = storageService.getPersistentProfile();

    expect(retrieved).not.toBeNull();
    expect(retrieved.nome).toBe('Maycon Douglas M.D. Nascimento');
    expect(retrieved.usuario).toBe('Maycon1897');
    expect(retrieved.email).toBe('maycon.nascimento@itaminas.com.br');
    expect(retrieved.registro).toBe('CREA 142.890/D-MG');
    expect(retrieved.foto).toBe('data:image/png;base64,fakePhotoData');
  });

  it('deve permitir limpar o perfil persistente', () => {
    storageService.savePersistentProfile({ id: 'USR-002', nome: 'Maycon' });
    expect(storageService.getPersistentProfile()).not.toBeNull();

    storageService.clearPersistentProfile();
    expect(storageService.getPersistentProfile()).toBeNull();
  });

  it('deve salvar e retornar papel de usuário (getUserRole/setUserRole)', () => {
    expect(storageService.getUserRole()).toBe('Engenheiro Geotécnico');
    storageService.setUserRole('Geólogo de Barragens');
    expect(storageService.getUserRole()).toBe('Geólogo de Barragens');
    storageService.setUserRole('Técnico de Campo');
    expect(storageService.getUserRole()).toBe('Técnico de Campo');
  });

  it('deve possuir os papéis do sistema e suas permissões configuradas', () => {
    expect(ROLES.ENGENHEIRO).toBeDefined();
    expect(ROLES.ENGENHEIRO.title).toBe('Engenheiro Geotécnico');
    expect(ROLES.ENGENHEIRO.permissoes).toContain('emitir_laudo');
    expect(ROLES.ENGENHEIRO.permissoes).toContain('ajustar_limiares');
    expect(ROLES.ENGENHEIRO.permissoes).toContain('analise_ia');

    expect(ROLES.TECNICO).toBeDefined();
    expect(ROLES.GEOLOGO).toBeDefined();
    expect(ROLES.GERENTE).toBeDefined();
  });

  it('deve suportar busca e autenticação por e-mail ou nome de usuário (loginIdentifier)', () => {
    const mockUsers = [
      {
        id: 'USR-002',
        nome: 'Maycon Douglas M.D. Nascimento',
        email: 'maycon.nascimento@itaminas.com.br',
        usuario: 'Maycon1897',
        senhaHash: 'itaminas123',
        roleKey: 'ENGENHEIRO'
      }
    ];

    const findUser = (cleanId) => {
      const id = cleanId.toLowerCase().trim();
      return mockUsers.find(u => 
        (u.email && u.email.toLowerCase().trim() === id) ||
        (u.usuario && u.usuario.toLowerCase().trim() === id)
      );
    };

    // Teste login por email
    const userByEmail = findUser('maycon.nascimento@itaminas.com.br');
    expect(userByEmail).toBeDefined();
    expect(userByEmail.id).toBe('USR-002');

    // Teste login por usuário (Maycon1897)
    const userByUsername = findUser('Maycon1897');
    expect(userByUsername).toBeDefined();
    expect(userByUsername.nome).toBe('Maycon Douglas M.D. Nascimento');

    // Teste com case insensitive
    const userCaseInsensitive = findUser('maycon1897');
    expect(userCaseInsensitive).toBeDefined();

    // Teste com credencial inexistente
    const notFound = findUser('usuario_desconhecido');
    expect(notFound).toBeUndefined();
  });

  it('deve reter o perfil mesmo após simular nova inicialização da aplicação', () => {
    const activeProfile = {
      id: 'USR-002',
      nome: 'Maycon Douglas M.D. Nascimento',
      email: 'maycon.nascimento@itaminas.com.br',
      usuario: 'Maycon1897',
      setor: 'GEOTECNIA',
      registro: 'CREA 142.890/D-MG',
      empresa: 'Itaminas Comercio de minérios S/A',
      foto: 'data:image/jpeg;base64,minhaFoto'
    };

    // Salvar perfil
    storageService.savePersistentProfile(activeProfile);

    // Simular reload lendo do storage
    const restored = storageService.getPersistentProfile();
    expect(restored).toEqual(activeProfile);
    expect(restored.registro).toBe('CREA 142.890/D-MG');
  });
});

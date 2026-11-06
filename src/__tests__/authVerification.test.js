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
import { compressImage } from '../utils/imageOptimizer';
import { indexedDBStorage } from '../services/indexedDBStorage';

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

  it('deve otimizar dados de imagem com compressImage sem quebrar em ambientes sem canvas', async () => {
    const rawData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = await compressImage(rawData, { maxWidth: 320, maxHeight: 320, quality: 0.82 });
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('deve blindar savePersistentProfile contra QuotaExceededError em localStorage', () => {
    const originalSetItem = localStorage.setItem;
    // Simula quota excedida no LocalStorage
    localStorage.setItem = (key, val) => {
      if (key.includes('persistent_profile') && val.includes('fotoPesada')) {
        const err = new Error('QuotaExceededError');
        err.name = 'QuotaExceededError';
        throw err;
      }
      originalSetItem(key, val);
    };

    const heavyProfile = {
      id: 'USR-002',
      nome: 'Maycon Douglas',
      foto: 'data:image/jpeg;base64,fotoPesada_99999999999999999'
    };

    expect(() => {
      storageService.savePersistentProfile(heavyProfile);
    }).not.toThrow();

    localStorage.setItem = originalSetItem;
  });

  it('deve disponibilizar a API de persistência de mídia e perfis no indexedDBStorage', async () => {
    expect(indexedDBStorage).toBeDefined();
    expect(typeof indexedDBStorage.saveUserProfile).toBe('function');
    expect(typeof indexedDBStorage.getUserProfile).toBe('function');
    expect(typeof indexedDBStorage.saveMedia).toBe('function');
    expect(typeof indexedDBStorage.getMedia).toBe('function');
  });
});

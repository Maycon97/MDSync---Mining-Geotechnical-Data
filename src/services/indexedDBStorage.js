/**
 * MDSync IndexedDB Storage Engine
 * Persistência local robusta com alta capacidade (>100MB) para avatares, evidências fotográficas
 * e dados cadastrais, complementando o LocalStorage e prevenindo QuotaExceededError.
 */

const DB_NAME = 'mdsync_geotecnia_db';
const DB_VERSION = 1;

class IndexedDBStorageService {
  constructor() {
    this.dbPromise = null;
  }

  isSupported() {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
  }

  async getDB() {
    if (!this.isSupported()) return null;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('user_profiles')) {
            db.createObjectStore('user_profiles', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('app_media')) {
            db.createObjectStore('app_media', { keyPath: 'key' });
          }
        };

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };

        request.onerror = (event) => {
          console.warn('[IndexedDB] Erro ao abrir banco de dados:', event.target.error);
          resolve(null); // Fallback amigável sem quebrar execução
        };
      } catch (err) {
        console.warn('[IndexedDB] Exceção ao inicializar:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  /**
   * Salva ou atualiza um perfil de usuário completo no IndexedDB
   */
  async saveUserProfile(user) {
    if (!user || !user.id) return false;
    const db = await this.getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(['user_profiles'], 'readwrite');
        const store = tx.objectStore('user_profiles');
        const record = {
          ...user,
          updatedAt: new Date().toISOString()
        };
        const req = store.put(record);
        req.onsuccess = () => resolve(true);
        req.onerror = (e) => {
          console.warn('[IndexedDB] Erro ao salvar perfil:', e.target.error);
          resolve(false);
        };
      } catch (err) {
        console.warn('[IndexedDB] Exceção em saveUserProfile:', err);
        resolve(false);
      }
    });
  }

  /**
   * Recupera o perfil de um usuário específico por ID
   */
  async getUserProfile(userId) {
    if (!userId) return null;
    const db = await this.getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(['user_profiles'], 'readonly');
        const store = tx.objectStore('user_profiles');
        const req = store.get(userId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  /**
   * Armazena dados de mídia pesados (ex: foto em base64, blobs)
   */
  async saveMedia(key, data, mimeType = 'image/jpeg') {
    if (!key || !data) return false;
    const db = await this.getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(['app_media'], 'readwrite');
        const store = tx.objectStore('app_media');
        const req = store.put({
          key,
          data,
          mimeType,
          updatedAt: new Date().toISOString()
        });
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Recupera mídia armazenada por chave
   */
  async getMedia(key) {
    if (!key) return null;
    const db = await this.getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(['app_media'], 'readonly');
        const store = tx.objectStore('app_media');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result?.data || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }
}

export const indexedDBStorage = new IndexedDBStorageService();
export default indexedDBStorage;


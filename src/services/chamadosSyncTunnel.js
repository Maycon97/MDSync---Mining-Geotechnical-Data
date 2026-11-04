/**
 * TÚNEL DE CONEXÃO AUTOMÁTICA — CONTROLE DE CHAMADOS & GEOTECNIA ITAMINAS
 * 
 * Funcionalidades do Túnel:
 * 1. BroadcastChannel bidirecional entre abas/janelas ('mdsync_chamados_sync_tunnel').
 * 2. Monitoramento automático contínuo de arquivos locais (File System Access API polling por timestamp).
 * 3. Parser universal e tolerante a falhas (JSON, HTML executivo, CSV).
 * 4. Persistência reativa em localStorage com fallback seguro para a base nativa (248 chamados).
 * 5. Notificação de eventos customizados ('mdsync_chamados_updated') para sincronização instantânea em tempo de execução.
 */

import { CONTROLE_CHAMADOS_DATA } from '../data/controleChamadosData';

const STORAGE_KEY = 'mdsync_chamados_custom_data';
const CONFIG_KEY = 'mdsync_chamados_tunnel_config';
const CHANNEL_NAME = 'mdsync_chamados_sync_tunnel';

class ChamadosSyncTunnelService {
  constructor() {
    this.broadcastChannel = null;
    this.listeners = new Set();
    this.fileHandle = null;
    this.pollInterval = null;
    this.lastModified = null;
    this.status = {
      connected: false,
      mode: 'nativa', // 'nativa' | 'arquivo_local' | 'personalizado'
      fileName: null,
      lastSyncTime: null,
      totalTickets: CONTROLE_CHAMADOS_DATA?.tickets?.length || 248,
      source: 'Base Oficial Itaminas'
    };

    this.initBroadcastChannel();
    this.initStorageListener();
    this.loadPersistedState();
  }

  /**
   * Inicializa canal de comunicação em tempo real entre abas do navegador
   */
  initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'CHAMADOS_SYNC_EVENT') {
            this.handleIncomingSync(event.data.payload, false);
          }
        };
      } catch (err) {
        console.warn('[SyncTunnel] BroadcastChannel indisponível:', err);
      }
    }
  }

  /**
   * Escuta alterações de storage vindas de outras janelas
   */
  initStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.handleIncomingSync(parsed, false);
          } catch (err) {
            console.error('[SyncTunnel] Erro ao sincronizar storage:', err);
          }
        }
      });
    }
  }

  /**
   * Carrega estado persistido
   */
  loadPersistedState() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed?.tickets) && parsed.tickets.length > 0) {
          this.status.mode = 'personalizado';
          this.status.source = parsed.source || 'Armazenamento Local';
          this.status.lastSyncTime = parsed.timestamp || new Date().toISOString();
          this.status.totalTickets = parsed.tickets.length;
        }
      }
    } catch (e) {
      console.warn('[SyncTunnel] Não foi possível ler cache local:', e);
    }
  }

  /**
   * Obtém a lista ativa de chamados (Base Oficial + Atualizações do Túnel)
   */
  getActiveTickets() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed?.tickets) && parsed.tickets.length > 0) {
            return parsed.tickets;
          }
        }
      } catch (e) {
        console.warn('[SyncTunnel] Erro ao obter dados ativos:', e);
      }
    }
    return CONTROLE_CHAMADOS_DATA?.tickets || [];
  }

  /**
   * Obtém status atual do túnel
   */
  getStatus() {
    const tickets = this.getActiveTickets();
    return {
      ...this.status,
      totalTickets: tickets.length,
      isAutoWatching: Boolean(this.pollInterval)
    };
  }

  /**
   * Assina atualizações do túnel (padrão Observer para React)
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Dispara atualização para todos os assinantes locais e outras abas
   */
  notify(payload, broadcast = true) {
    this.status.lastSyncTime = new Date().toISOString();
    this.status.totalTickets = payload.tickets?.length || 0;

    // Notifica listeners no processo local
    this.listeners.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        console.error('[SyncTunnel] Erro no listener:', e);
      }
    });

    // Dispara evento DOM global
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mdsync_chamados_updated', { detail: payload }));
    }

    // Propaga via BroadcastChannel para outras abas
    if (broadcast && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'CHAMADOS_SYNC_EVENT',
          payload
        });
      } catch (err) {
        console.warn('[SyncTunnel] Falha ao emitir broadcast:', err);
      }
    }
  }

  /**
   * Processa sincronização recebida
   */
  handleIncomingSync(payload, broadcast = false) {
    if (!payload?.tickets || !Array.isArray(payload.tickets)) return;
    this.status.source = payload.source || 'Túnel Conectado';
    this.status.lastSyncTime = payload.timestamp || new Date().toISOString();
    this.status.mode = payload.mode || 'personalizado';
    this.notify(payload, broadcast);
  }

  /**
   * Injeta ou mescla uma lista de novos chamados
   */
  updateTickets(newTickets, source = 'Importação Direta') {
    if (!Array.isArray(newTickets)) return false;

    // Mescla por protocolo preservando integridade
    const currentMap = new Map();
    // 1. Carrega base nativa
    (CONTROLE_CHAMADOS_DATA?.tickets || []).forEach(t => {
      currentMap.set(String(t.proto).trim(), { ...t });
    });
    // 2. Carrega customizados existentes
    this.getActiveTickets().forEach(t => {
      currentMap.set(String(t.proto).trim(), { ...t });
    });
    // 3. Aplica novidades
    newTickets.forEach(t => {
      if (!t || !t.proto) return;
      const key = String(t.proto).trim();
      currentMap.set(key, { ...currentMap.get(key), ...t });
    });

    const unifiedList = Array.from(currentMap.values());
    const payload = {
      tickets: unifiedList,
      timestamp: new Date().toISOString(),
      source,
      mode: 'personalizado'
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn('[SyncTunnel] LocalStorage cheio ou restrito:', err);
      }
    }

    this.notify(payload, true);
    return true;
  }

  /**
   * Restaura para a base nativa oficial
   */
  resetToBaseData() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.warn('[SyncTunnel] Erro ao limpar storage:', e);
      }
    }

    this.status.mode = 'nativa';
    this.status.source = 'Base Oficial Itaminas';
    this.status.fileName = null;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.fileHandle = null;

    const payload = {
      tickets: CONTROLE_CHAMADOS_DATA?.tickets || [],
      timestamp: new Date().toISOString(),
      source: 'Base Oficial Itaminas',
      mode: 'nativa'
    };

    this.notify(payload, true);
    return true;
  }

  /**
   * Conecta um arquivo local usando a File System Access API para monitoramento ativo contínuo
   */
  async connectLocalFileWatcher() {
    if (typeof window === 'undefined' || !window.showOpenFilePicker) {
      throw new Error('A API File System Access não é suportada neste navegador. Use a importação direta por arquivo.');
    }

    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'Painel ou Planilha de Chamados',
            accept: {
              'text/html': ['.html', '.htm'],
              'application/json': ['.json'],
              'text/csv': ['.csv']
            }
          }
        ],
        multiple: false
      });

      if (!handle) return null;

      this.fileHandle = handle;
      const file = await handle.getFile();
      this.status.fileName = file.name;
      this.lastModified = file.lastModified;

      // Lê e processa arquivo imediatamente
      await this.readAndProcessFile(file);

      // Inicia polling de verificação a cada 4 segundos
      if (this.pollInterval) clearInterval(this.pollInterval);
      this.pollInterval = setInterval(async () => {
        try {
          if (!this.fileHandle) return;
          const currentFile = await this.fileHandle.getFile();
          if (currentFile.lastModified !== this.lastModified) {
            this.lastModified = currentFile.lastModified;
            await this.readAndProcessFile(currentFile);
          }
        } catch (pollErr) {
          console.warn('[SyncTunnel] Erro no polling de arquivo:', pollErr);
        }
      }, 4000);

      this.status.connected = true;
      this.status.mode = 'arquivo_local';
      this.status.source = `Túnel Ativo: ${file.name}`;

      return {
        name: file.name,
        size: file.size,
        lastModified: new Date(file.lastModified).toLocaleString('pt-BR')
      };
    } catch (err) {
      if (err.name === 'AbortError') return null;
      throw err;
    }
  }

  /**
   * Lê e faz parse do arquivo fornecido
   */
  async readAndProcessFile(file) {
    const text = await file.text();
    const name = file.name.toLowerCase();

    let extractedTickets = [];

    if (name.endsWith('.json')) {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        extractedTickets = parsed;
      } else if (Array.isArray(parsed?.tickets)) {
        extractedTickets = parsed.tickets;
      }
    } else if (name.endsWith('.html') || name.endsWith('.htm')) {
      // Procura por const P = {"tickets": [...]}
      const match = text.match(/const\s+P\s*=\s*(\{[\s\S]*?\});/);
      if (match && match[1]) {
        try {
          const p = JSON.parse(match[1]);
          if (Array.isArray(p?.tickets)) {
            extractedTickets = p.tickets;
          }
        } catch (e) {
          console.warn('[SyncTunnel] Erro ao parsear const P do HTML:', e);
        }
      }
    } else if (name.endsWith('.csv')) {
      extractedTickets = this.parseCsv(text);
    }

    if (extractedTickets.length > 0) {
      this.updateTickets(extractedTickets, `Túnel Ativo: ${file.name}`);
      return extractedTickets.length;
    }
    return 0;
  }

  /**
   * Parser simples e resiliente de CSV
   */
  parseCsv(csvText) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(/[;,]/).map(h => h.trim().replace(/^"|"$/g, ''));
    const tickets = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(/[;,]/).map(p => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 2) continue;

      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = parts[idx] || null;
      });

      const proto = obj['Protocolo'] || obj['proto'] || obj['ID'] || obj['Código'];
      if (!proto) continue;

      tickets.push({
        proto: String(proto).trim(),
        estr: obj['Estrutura'] || obj['estr'] || 'Não informada',
        tipo: obj['Tipo'] || obj['tipo'] || 'Geral',
        crit: obj['Criticidade'] || obj['crit'] || 'B3',
        status: obj['Status da Aprovação'] || obj['status'] || 'Realizado e Aprovado',
        statusCh: obj['Status do Chamado'] || obj['statusCh'] || 'Finalizado',
        abertura: obj['Data de Abertura'] || obj['abertura'] || null,
        limite: obj['Data Limite'] || obj['limite'] || null,
        fim: obj['Data Finalização'] || obj['fim'] || null,
        lat: parseFloat(obj['Ponto da Anomalia LAT'] || obj['lat']) || null,
        lon: parseFloat(obj['Ponto da Anomalia LONG'] || obj['lon']) || null,
        requerido: obj['Requerido'] || null,
        acaoCorretiva: obj['Ação Corretiva'] || obj['acaoCorretiva'] || null,
        planoAcao: obj['PLANO DE AÇÃO'] || obj['planoAcao'] || null
      });
    }

    return tickets;
  }

  /**
   * Para monitoramento ativo
   */
  disconnectWatcher() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.fileHandle = null;
    this.status.connected = false;
    if (this.status.mode === 'arquivo_local') {
      this.status.mode = 'personalizado';
    }
  }

  /**
   * Exporta os chamados ativos em formato JSON
   */
  exportBackup() {
    const data = {
      exportDate: new Date().toISOString(),
      total: this.getActiveTickets().length,
      tickets: this.getActiveTickets()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mdsync_chamados_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Instância Singleton exportada
export const chamadosSyncTunnel = new ChamadosSyncTunnelService();
export default chamadosSyncTunnel;

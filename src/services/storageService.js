// ============================================================
// MDSync - Storage Service (Persistência Offline & LocalStorage)
// ============================================================

const STORAGE_KEYS = {
  THEME: 'mdsync_theme',
  USER_ROLE: 'mdsync_user_role',
  LOCAL_READINGS: 'mdsync_local_readings',
  LOCAL_ANOMALIES: 'mdsync_local_anomalies',
  LOCAL_CHECKLISTS: 'mdsync_local_checklists',
  FLUIG_TICKETS: 'mdsync_fluig_tickets',
  FLUIG_CONFIG: 'mdsync_fluig_config',
  CLIENTES: 'mdsync_clientes',
  CONTRATOS: 'mdsync_contratos_terceiros',
  ORDENS_SERVICO: 'mdsync_ordens_servico',
  COLETAS: 'mdsync_coletas_inspect',
  LOTES_RELATORIOS: 'mdsync_lotes_relatorios',
  OFFLINE_QUEUE: 'mdsync_offline_queue',
  ACTIVE_STRUCTURE: 'mdsync_active_structure'
};

export const storageService = {
  // Tema
  getTheme() {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    } catch {
      return 'dark';
    }
  },
  setTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      document.documentElement.setAttribute('data-theme', theme);
      const meta = document.querySelector('meta[name="color-scheme"]');
      if (meta) meta.content = theme;
    } catch (e) {
      console.error('Erro ao salvar tema:', e);
    }
  },

  // Perfil de Usuário
  getUserRole() {
    try {
      return localStorage.getItem(STORAGE_KEYS.USER_ROLE) || 'Engenheiro Geotécnico';
    } catch {
      return 'Engenheiro Geotécnico';
    }
  },
  setUserRole(role) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    } catch (e) {
      console.error('Erro ao salvar papel de usuário:', e);
    }
  },

  // Estrutura ativa
  getActiveStructure() {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_STRUCTURE) || 'TODAS';
    } catch {
      return 'TODAS';
    }
  },
  setActiveStructure(structureId) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_STRUCTURE, structureId);
    } catch (e) {
      console.error('Erro ao salvar estrutura ativa:', e);
    }
  },

  // Leituras Locais (Coletadas em Campo)
  getLocalReadings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOCAL_READINGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveLocalReading(reading) {
    try {
      const readings = this.getLocalReadings();
      const newReading = {
        ...reading,
        id: reading.id || `READ-${Date.now()}`,
        dataRegistro: reading.dataRegistro || new Date().toISOString(),
        origem: 'Campo (App Web)',
        sincronizado: reading.sincronizado !== undefined ? reading.sincronizado : true
      };
      // Evitar duplicatas
      const existingIdx = readings.findIndex(r => r.id === newReading.id);
      if (existingIdx !== -1) {
        readings[existingIdx] = newReading;
      } else {
        readings.unshift(newReading);
      }
      localStorage.setItem(STORAGE_KEYS.LOCAL_READINGS, JSON.stringify(readings));
      return newReading;
    } catch (e) {
      console.error('Erro ao salvar leitura local:', e);
      return null;
    }
  },

  // Anomalias Locais
  getLocalAnomalies() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOCAL_ANOMALIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveLocalAnomaly(anomaly) {
    try {
      const anomalies = this.getLocalAnomalies();
      const newAnomaly = {
        ...anomaly,
        id: anomaly.id || `ANOM-${Date.now().toString().slice(-4)}`,
        dataRegistro: anomaly.dataRegistro || new Date().toISOString().split('T')[0],
        status: anomaly.status || 'Registrado em Campo',
        origem: 'Módulo Inspect',
        sincronizado: anomaly.sincronizado !== undefined ? anomaly.sincronizado : true
      };
      const existingIdx = anomalies.findIndex(a => a.id === newAnomaly.id);
      if (existingIdx !== -1) {
        anomalies[existingIdx] = newAnomaly;
      } else {
        anomalies.unshift(newAnomaly);
      }
      localStorage.setItem(STORAGE_KEYS.LOCAL_ANOMALIES, JSON.stringify(anomalies));
      return newAnomaly;
    } catch (e) {
      console.error('Erro ao salvar anomalia local:', e);
      return null;
    }
  },

  // Checklists de Inspeção (Survey123 FIR)
  getLocalChecklists() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOCAL_CHECKLISTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveLocalChecklist(checklist) {
    try {
      const checklists = this.getLocalChecklists();
      const newChecklist = {
        ...checklist,
        id: checklist.id || `FIR-${Date.now().toString().slice(-6)}`,
        dataRegistro: checklist.dataRegistro || new Date().toISOString(),
        origem: 'Survey123 FIR (MDSync)',
        sincronizado: checklist.sincronizado !== undefined ? checklist.sincronizado : true
      };
      const existingIdx = checklists.findIndex(c => c.id === newChecklist.id);
      if (existingIdx !== -1) {
        checklists[existingIdx] = newChecklist;
      } else {
        checklists.unshift(newChecklist);
      }
      localStorage.setItem(STORAGE_KEYS.LOCAL_CHECKLISTS, JSON.stringify(checklists));
      return newChecklist;
    } catch (e) {
      console.error('Erro ao salvar checklist local:', e);
      return null;
    }
  },
  deleteLocalChecklist(id) {
    try {
      const checklists = this.getLocalChecklists().filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.LOCAL_CHECKLISTS, JSON.stringify(checklists));
      return true;
    } catch (e) {
      console.error('Erro ao excluir checklist:', e);
      return false;
    }
  },

  // Chamados do Sistema Fluig (BPM & Anomalias)
  getFluigTickets() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FLUIG_TICKETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveFluigTicket(ticket) {
    try {
      const tickets = this.getFluigTickets();
      const numProtocolo = ticket.protocolo || `FLUIG-${Math.floor(10000 + Math.random() * 90000)}`;
      const newTicket = {
        ...ticket,
        id: ticket.id || `FLUIG-2026-${numProtocolo.replace('FLUIG-', '')}`,
        protocolo: numProtocolo,
        dataAbertura: ticket.dataAbertura || new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
        processoId: ticket.processoId || 'GEO_GESTAO_ANOMALIAS',
        origem: 'App MDSync (Integrado TOTVS Fluig)',
        sincronizado: ticket.sincronizado !== undefined ? ticket.sincronizado : true
      };
      const existingIdx = tickets.findIndex(t => t.id === newTicket.id || t.protocolo === newTicket.protocolo);
      if (existingIdx !== -1) {
        tickets[existingIdx] = newTicket;
      } else {
        tickets.unshift(newTicket);
      }
      localStorage.setItem(STORAGE_KEYS.FLUIG_TICKETS, JSON.stringify(tickets));
      return newTicket;
    } catch (e) {
      console.error('Erro ao salvar chamado Fluig:', e);
      return null;
    }
  },
  updateFluigTicket(id, updates) {
    try {
      const tickets = this.getFluigTickets();
      const idx = tickets.findIndex(t => t.id === id || t.protocolo === id);
      if (idx !== -1) {
        tickets[idx] = { ...tickets[idx], ...updates, dataAtualizacao: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.FLUIG_TICKETS, JSON.stringify(tickets));
        return tickets[idx];
      }
      return null;
    } catch (e) {
      console.error('Erro ao atualizar chamado Fluig:', e);
      return null;
    }
  },
  deleteFluigTicket(id) {
    try {
      const tickets = this.getFluigTickets().filter(t => t.id !== id && t.protocolo !== id);
      localStorage.setItem(STORAGE_KEYS.FLUIG_TICKETS, JSON.stringify(tickets));
      return true;
    } catch (e) {
      console.error('Erro ao excluir chamado Fluig:', e);
      return false;
    }
  },
  getFluigConfig() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FLUIG_CONFIG);
      return data ? JSON.parse(data) : {
        serverUrl: 'https://itaminas.fluig.com',
        empresaId: '1',
        processoId: 'GEO_GESTAO_ANOMALIAS',
        versao: '2.4',
        ativo: true
      };
    } catch {
      return {
        serverUrl: 'https://itaminas.fluig.com',
        empresaId: '1',
        processoId: 'GEO_GESTAO_ANOMALIAS',
        versao: '2.4',
        ativo: true
      };
    }
  },
  saveFluigConfig(config) {
    try {
      localStorage.setItem(STORAGE_KEYS.FLUIG_CONFIG, JSON.stringify(config));
      return true;
    } catch {
      return false;
    }
  },

  // Clientes
  getClientes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLIENTES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveCliente(cliente) {
    try {
      const list = this.getClientes();
      const newCli = {
        ...cliente,
        id: cliente.id || `CLI-${Date.now().toString().slice(-4)}`
      };
      const idx = list.findIndex(c => c.id === newCli.id);
      if (idx !== -1) list[idx] = newCli;
      else list.unshift(newCli);
      localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(list));
      return newCli;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Contratos de Empresas Terceiras
  getContratos() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTRATOS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveContrato(contrato) {
    try {
      const list = this.getContratos();
      const newCtr = {
        ...contrato,
        id: contrato.id || `CTR-2026-${Math.floor(100 + Math.random() * 900)}`
      };
      const idx = list.findIndex(c => c.id === newCtr.id);
      if (idx !== -1) list[idx] = newCtr;
      else list.unshift(newCtr);
      localStorage.setItem(STORAGE_KEYS.CONTRATOS, JSON.stringify(list));
      return newCtr;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Ordens de Serviço
  getOrdensServico() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDENS_SERVICO);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveOrdemServico(os) {
    try {
      const list = this.getOrdensServico();
      const newOs = {
        ...os,
        id: os.id || `OS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        numeroOS: os.numeroOS || `OS-${Math.floor(1000 + Math.random() * 9000)}/2026`,
        dataAbertura: os.dataAbertura || new Date().toLocaleString('pt-BR')
      };
      const idx = list.findIndex(o => o.id === newOs.id);
      if (idx !== -1) list[idx] = newOs;
      else list.unshift(newOs);
      localStorage.setItem(STORAGE_KEYS.ORDENS_SERVICO, JSON.stringify(list));
      return newOs;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  updateOrdemServico(id, updates) {
    try {
      const list = this.getOrdensServico();
      const idx = list.findIndex(o => o.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        localStorage.setItem(STORAGE_KEYS.ORDENS_SERVICO, JSON.stringify(list));
        return list[idx];
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Coletas (Inspect)
  getColetas() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COLETAS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveColeta(coleta) {
    try {
      const list = this.getColetas();
      const newCol = {
        ...coleta,
        id: coleta.id || `COL-${Date.now().toString().slice(-6)}`,
        dataHora: coleta.dataHora || new Date().toLocaleString('pt-BR')
      };
      const idx = list.findIndex(c => c.id === newCol.id);
      if (idx !== -1) list[idx] = newCol;
      else list.unshift(newCol);
      localStorage.setItem(STORAGE_KEYS.COLETAS, JSON.stringify(list));
      return newCol;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  updateColeta(id, updates) {
    try {
      const list = this.getColetas();
      const idx = list.findIndex(c => c.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        localStorage.setItem(STORAGE_KEYS.COLETAS, JSON.stringify(list));
        return list[idx];
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  deleteColeta(id) {
    try {
      const list = this.getColetas().filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.COLETAS, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // Lotes de Relatórios
  getLotesRelatorios() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOTES_RELATORIOS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveLoteRelatorios(lote) {
    try {
      const list = this.getLotesRelatorios();
      const newLote = {
        ...lote,
        id: lote.id || `LOTE-${Date.now().toString().slice(-6)}`,
        dataGeracao: lote.dataGeracao || new Date().toLocaleString('pt-BR')
      };
      const idx = list.findIndex(l => l.id === newLote.id);
      if (idx !== -1) list[idx] = newLote;
      else list.unshift(newLote);
      localStorage.setItem(STORAGE_KEYS.LOTES_RELATORIOS, JSON.stringify(list));
      return newLote;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Fila Offline de Sincronização
  getOfflineQueue() {
    try {
      const q = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  },
  addToOfflineQueue(item) {
    try {
      const queue = this.getOfflineQueue();
      const queueItem = {
        ...item,
        queueId: `Q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        dataHoraFila: new Date().toLocaleString('pt-BR')
      };
      queue.unshift(queueItem);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
      window.dispatchEvent(new CustomEvent('mdsync:queue-changed', { detail: { count: queue.length } }));
      return queueItem;
    } catch (e) {
      console.error('Erro ao adicionar à fila offline:', e);
      return null;
    }
  },
  removeFromOfflineQueue(queueId) {
    try {
      const queue = this.getOfflineQueue().filter(item => item.queueId !== queueId);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
      window.dispatchEvent(new CustomEvent('mdsync:queue-changed', { detail: { count: queue.length } }));
    } catch (e) {
      console.error('Erro ao remover da fila offline:', e);
    }
  },
  clearOfflineQueue() {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('mdsync:queue-changed', { detail: { count: 0 } }));
    } catch (e) {
      console.error('Erro ao limpar fila offline:', e);
    }
  },

  // Processar e Sincronizar Fila com o Banco de Dados Interno
  async syncOfflineQueue() {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return { count: 0, items: [] };

    // Simular sincronização HTTP/WebSocket segura com retry
    await new Promise(resolve => setTimeout(resolve, 800));

    const syncedItems = [];
    queue.forEach(item => {
      if (item.type === 'reading' || item.tipo) {
        this.saveLocalReading({
          ...item,
          sincronizado: true,
          dataSincronizacao: new Date().toISOString()
        });
      } else if (item.type === 'anomaly' || item.severidade) {
        this.saveLocalAnomaly({
          ...item,
          sincronizado: true,
          dataSincronizacao: new Date().toISOString()
        });
      } else if (item.type === 'fluig_ticket' || item.protocolo) {
        this.saveFluigTicket({
          ...item,
          sincronizado: true,
          dataSincronizacao: new Date().toISOString()
        });
      } else if (item.type === 'checklist' || item.surveyId) {
        this.saveLocalChecklist({
          ...item,
          sincronizado: true,
          dataSincronizacao: new Date().toISOString()
        });
      }
      syncedItems.push(item);
    });

    this.clearOfflineQueue();
    return { count: syncedItems.length, items: syncedItems };
  }
};

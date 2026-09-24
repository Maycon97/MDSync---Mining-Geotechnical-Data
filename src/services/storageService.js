// ============================================================
// MDSync - Storage Service (Persistência Offline & LocalStorage)
// Blindagem de Dados com Selo de Integridade e Sanitização
// ============================================================

import { securityShield } from './securityShield';

const STORAGE_KEYS = {
  THEME: 'mdsync_theme',
  ACCENT_COLOR: 'mdsync_accent_color',
  LANGUAGE: 'mdsync_language',
  GEOTECH_UNITS: 'mdsync_geotech_units',
  NOTIFICATION_CONFIG: 'mdsync_notification_config',
  ACTIVE_SESSIONS: 'mdsync_active_sessions',
  TERMS_ACCEPTANCE: 'mdsync_terms_accepted',
  USER_ROLE: 'mdsync_user_role',
  PERSISTENT_PROFILE: 'mdsync_persistent_profile',
  LOCAL_READINGS: 'mdsync_local_readings',
  LOCAL_ANOMALIES: 'mdsync_local_anomalies',
  LOCAL_CHECKLISTS: 'mdsync_local_checklists',
  LOCAL_VEHICLE_CHECKLISTS: 'mdsync_local_vehicle_checklists',
  FLUIG_TICKETS: 'mdsync_fluig_tickets',
  FLUIG_CONFIG: 'mdsync_fluig_config',
  CLIENTES: 'mdsync_clientes',
  CONTRATOS: 'mdsync_contratos_terceiros',
  ORDENS_SERVICO: 'mdsync_ordens_servico',
  COLETAS: 'mdsync_coletas_inspect',
  LOTES_RELATORIOS: 'mdsync_lotes_relatorios',
  OFFLINE_QUEUE: 'mdsync_offline_queue',
  ACTIVE_STRUCTURE: 'mdsync_active_structure',
  ANOMALIAS_GEOTECNICAS: 'mdsync_anomalias_geotecnicas',
  INSPECOES_GEOTECNICAS: 'mdsync_inspecoes_geotecnicas',
  PLANOS_ACAO: 'mdsync_planos_acao',
  DOCUMENTOS_ESTRUTURAS: 'mdsync_documentos_estruturas',
  COMUNICADOS_OPERACIONAIS: 'mdsync_comunicados_operacionais',
  RECORD_ID_TEMPLATE: 'mdsync_record_id_template',
  INSPECTION_RULES: 'mdsync_inspection_rules',
  ESTRUTURAS_EMPREENDIMENTO: 'mdsync_estruturas_empreendimento'
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
      if (meta) meta.content = theme === 'contrast' ? 'dark' : theme;
    } catch (e) {
      console.error('Erro ao salvar tema:', e);
    }
  },

  // Cor de Destaque / Acento
  getAccentColor() {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACCENT_COLOR) || '#38bdf8';
    } catch {
      return '#38bdf8';
    }
  },
  setAccentColor(color) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCENT_COLOR, color);
      document.documentElement.style.setProperty('--primary-accent', color);
    } catch (e) {
      console.error('Erro ao salvar cor de acento:', e);
    }
  },

  // Idioma do Sistema
  getLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'pt-BR';
    } catch {
      return 'pt-BR';
    }
  },
  setLanguage(lang) {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
      document.documentElement.setAttribute('lang', lang);
    } catch (e) {
      console.error('Erro ao salvar idioma:', e);
    }
  },

  // Unidades Geotécnicas e Datum
  getGeotechUnits() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GEOTECH_UNITS);
      return data ? JSON.parse(data) : {
        datum: 'SIRGAS 2000 / UTM 23S',
        cota: 'm a.n.m.',
        pressao: 'm.c.a.',
        vazao: 'L/s',
        chuva: 'mm/h'
      };
    } catch {
      return {
        datum: 'SIRGAS 2000 / UTM 23S',
        cota: 'm a.n.m.',
        pressao: 'm.c.a.',
        vazao: 'L/s',
        chuva: 'mm/h'
      };
    }
  },
  setGeotechUnits(units) {
    try {
      localStorage.setItem(STORAGE_KEYS.GEOTECH_UNITS, JSON.stringify(units));
    } catch (e) {
      console.error('Erro ao salvar unidades geotécnicas:', e);
    }
  },

  // Configurações de Notificação e Alerta
  getNotificationConfig() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_CONFIG);
      return data ? JSON.parse(data) : {
        pushWeb: true,
        emailRelatorios: true,
        smsEmergencia: true,
        somNivel2: true,
        sireneNivel3: true,
        emailPlantao: 'geotecnia.plantao@itaminas.com.br',
        telefonePlantao: '+55 31 99887-6655'
      };
    } catch {
      return {
        pushWeb: true,
        emailRelatorios: true,
        smsEmergencia: true,
        somNivel2: true,
        sireneNivel3: true,
        emailPlantao: 'geotecnia.plantao@itaminas.com.br',
        telefonePlantao: '+55 31 99887-6655'
      };
    }
  },
  setNotificationConfig(config) {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Erro ao salvar configuração de notificações:', e);
    }
  },

  // Perfil Persistente de Usuário (Mantém dados até outro login)
  getPersistentProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERSISTENT_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  savePersistentProfile(profile) {
    try {
      if (!profile) return;
      localStorage.setItem(STORAGE_KEYS.PERSISTENT_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Erro ao salvar perfil persistente:', e);
    }
  },
  clearPersistentProfile() {
    try {
      localStorage.removeItem(STORAGE_KEYS.PERSISTENT_PROFILE);
    } catch (e) {
      console.error('Erro ao remover perfil persistente:', e);
    }
  },

  // Gestão de Sessões Ativas
  getActiveSessions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSIONS);
      if (data) return JSON.parse(data);
      const defaultSessions = [
        {
          id: 'SES-01',
          dispositivo: 'Tablet Samsung Galaxy Tab Active 4 Pro (Campo)',
          ip: '10.14.32.105',
          localizacao: 'Mina Itaminas - Crista B1',
          navegador: 'Chrome Mobile PWA',
          ultimoAcesso: 'Hoje às 08:42',
          atual: true
        },
        {
          id: 'SES-02',
          dispositivo: 'Workstation Dell Precision 5820 (COI Sala de Controle)',
          ip: '10.14.2.18',
          localizacao: 'Prédio da Engenharia Geotécnica',
          navegador: 'Chrome Desktop',
          ultimoAcesso: 'Ontem às 18:15',
          atual: false
        },
        {
          id: 'SES-03',
          dispositivo: 'Smartphone iPhone 15 Pro (Coordenador)',
          ip: '177.136.21.94',
          localizacao: 'Belo Horizonte / Remoto',
          navegador: 'Safari Mobile',
          ultimoAcesso: '20/09 às 11:30',
          atual: false
        }
      ];
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSIONS, JSON.stringify(defaultSessions));
      return defaultSessions;
    } catch {
      return [];
    }
  },
  revokeSession(sessionId) {
    try {
      const sessions = this.getActiveSessions().filter(s => s.id !== sessionId);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSIONS, JSON.stringify(sessions));
      return sessions;
    } catch (e) {
      console.error('Erro ao revogar sessão:', e);
      return [];
    }
  },

  // Monitor de Armazenamento Local
  getStorageUsage() {
    try {
      let totalBytes = 0;
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mdsync_')) {
          const val = localStorage.getItem(key);
          totalBytes += (key.length + (val ? val.length : 0)) * 2;
          count++;
        }
      }
      const kb = (totalBytes / 1024).toFixed(1);
      const mb = (totalBytes / (1024 * 1024)).toFixed(2);
      return {
        usedBytes: totalBytes,
        usedFormatted: totalBytes > 1048576 ? `${mb} MB` : `${kb} KB`,
        itemsCount: count,
        percentEstimated: Math.min(100, Math.max(2, Math.round((totalBytes / (5 * 1024 * 1024)) * 100)))
      };
    } catch {
      return { usedBytes: 0, usedFormatted: '0 KB', itemsCount: 0, percentEstimated: 2 };
    }
  },

  // Exportação Completa de Banco de Dados JSON
  exportFullDatabaseJSON() {
    try {
      const exportData = {
        app: 'MDSync Geotecnia',
        versao: '2.5.0-PRO',
        timestamp: new Date().toISOString(),
        mineradora: 'Itaminas Mineração S/A',
        dados: {}
      };
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mdsync_')) {
          try {
            exportData.dados[key] = JSON.parse(localStorage.getItem(key));
          } catch {
            exportData.dados[key] = localStorage.getItem(key);
          }
        }
      }
      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `MDSync_Backup_Geotecnia_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error('Erro ao exportar backup:', e);
      return false;
    }
  },

  // Importação de Banco de Dados JSON
  importFullDatabaseJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.dados || typeof parsed.dados !== 'object') {
        throw new Error('Arquivo de backup inválido ou sem a estrutura de dados correta.');
      }
      Object.keys(parsed.dados).forEach(key => {
        if (key.startsWith('mdsync_')) {
          const val = parsed.dados[key];
          localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : val);
        }
      });
      return { success: true, count: Object.keys(parsed.dados).length };
    } catch (e) {
      console.error('Erro ao importar backup:', e);
      return { success: false, error: e.message };
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
      const sanitized = securityShield.sanitizeObject(reading);
      const readings = this.getLocalReadings();
      const newReading = {
        ...sanitized,
        id: sanitized.id || `READ-${Date.now()}`,
        dataRegistro: sanitized.dataRegistro || new Date().toISOString(),
        origem: 'Campo (App Web MDSync)',
        sincronizado: sanitized.sincronizado !== undefined ? sanitized.sincronizado : true,
        sealHash: sanitized.sealHash || `SEAL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
      };
      // Evitar duplicatas
      const existingIdx = readings.findIndex(r => r.id === newReading.id);
      if (existingIdx !== -1) {
        readings[existingIdx] = newReading;
      } else {
        readings.unshift(newReading);
      }
      localStorage.setItem(STORAGE_KEYS.LOCAL_READINGS, JSON.stringify(readings));
      securityShield.logSecurityEvent('SAVE_READING', { id: newReading.id, instrumento: newReading.instrumento || newReading.id });
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
      const sanitized = securityShield.sanitizeObject(anomaly);
      const anomalies = this.getLocalAnomalies();
      const newAnomaly = {
        ...sanitized,
        id: sanitized.id || `ANOM-${Date.now().toString().slice(-4)}`,
        dataRegistro: sanitized.dataRegistro || new Date().toISOString().split('T')[0],
        status: sanitized.status || 'Registrado em Campo',
        origem: 'Módulo Inspect (MDSync)',
        sincronizado: sanitized.sincronizado !== undefined ? sanitized.sincronizado : true
      };
      const existingIdx = anomalies.findIndex(a => a.id === newAnomaly.id);
      if (existingIdx !== -1) {
        anomalies[existingIdx] = newAnomaly;
      } else {
        anomalies.unshift(newAnomaly);
      }
      localStorage.setItem(STORAGE_KEYS.LOCAL_ANOMALIES, JSON.stringify(anomalies));
      securityShield.logSecurityEvent('SAVE_ANOMALY', { id: newAnomaly.id, severidade: newAnomaly.severidade });
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
      const sanitized = securityShield.sanitizeObject(checklist);
      const checklists = this.getLocalChecklists();
      const newChecklist = {
        ...sanitized,
        id: sanitized.id || `FIR-${Date.now().toString().slice(-6)}`,
        dataRegistro: sanitized.dataRegistro || new Date().toISOString(),
        origem: 'Survey123 FIR (MDSync)',
        sincronizado: sanitized.sincronizado !== undefined ? sanitized.sincronizado : true
      };
      const existingIdx = checklists.findIndex(c => c.id === newChecklist.id);
      if (existingIdx !== -1) {
        checklists[existingIdx] = newChecklist;
      } else {
        checklists.unshift(newChecklist);
      }
      localStorage.setItem(STORAGE_KEYS.LOCAL_CHECKLISTS, JSON.stringify(checklists));
      securityShield.logSecurityEvent('SAVE_CHECKLIST', { id: newChecklist.id, estrutura: newChecklist.estrutura });
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

  // Checklists Veiculares Diários (Survey123 Itaminas Frota)
  getLocalVehicleChecklists() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOCAL_VEHICLE_CHECKLISTS);
      if (data) return JSON.parse(data);
      
      // Dados semente iniciais da frota Itaminas Sarzedo
      const defaultVehicleChecklists = [
        {
          id: 'CHK-VEIC-2026-001',
          data_e_hora: '2026-09-21T07:15',
          data: '2026-09-21',
          hora: '07:15',
          condutor: 'Carlos Eduardo Mendes',
          placa: 'PZB-1G94',
          modeloVeiculo: 'Toyota Hilux 4x4 (Geotecnia Operacional)',
          hod_metro_km_atual: 84520,
          lat: -20.063824,
          lon: -44.114686,
          localizacaoNome: 'Barragem B1 - Crista (Sarzedo/MG)',
          status: 'LIBERADO',
          badgeClass: 'badge-normal',
          linkSurvey: 'https://arcg.is/0DuT4L1',
          itensSeguranca: {
            aguaLimpador: 'OK',
            bandeirola: 'OK',
            buzina: 'OK',
            cintosSeguranca: 'OK',
            documentacao: 'OK',
            freios: 'OK',
            giroflex: 'OK',
            pneusEstepe: 'OK',
            kitSinalizacao: 'OK'
          },
          condicoesGerais: {
            calibragemPneus: 'OK',
            iluminacaoSinalizacao: 'OK',
            latariaPintura: 'OK',
            limpezaGeral: 'OK',
            nivelOleoMotor: 'OK',
            nivelAguaArrefecimento: 'OK',
            parabrisa: 'OK',
            vazamentosAparentes: 'OK'
          },
          descreva_aqui: 'Veículo em perfeito estado operacional. Liberado para rondas geotécnicas diárias nas barragens B1 e B4.',
          assinatura: 'Carlos Eduardo Mendes (Assinatura Digital)'
        },
        {
          id: 'CHK-VEIC-2026-002',
          data_e_hora: '2026-09-20T06:45',
          data: '2026-09-20',
          hora: '06:45',
          condutor: 'Eng. Marcelo N. Siqueira',
          placa: 'TXY-7J22',
          modeloVeiculo: 'Mitsubishi L200 Triton 4x4 (Campo/Piezometria)',
          hod_metro_km_atual: 62110,
          lat: -20.075412,
          lon: -44.118930,
          localizacaoNome: 'PDE Mangaba - Acesso Norte',
          status: 'ATENÇÃO',
          badgeClass: 'badge-atencao',
          linkSurvey: 'https://arcg.is/0DuT4L1',
          itensSeguranca: {
            aguaLimpador: 'Atenção',
            bandeirola: 'OK',
            buzina: 'OK',
            cintosSeguranca: 'OK',
            documentacao: 'OK',
            freios: 'OK',
            giroflex: 'OK',
            pneusEstepe: 'OK',
            kitSinalizacao: 'OK'
          },
          condicoesGerais: {
            calibragemPneus: 'Atenção',
            iluminacaoSinalizacao: 'OK',
            latariaPintura: 'OK',
            limpezaGeral: 'OK',
            nivelOleoMotor: 'OK',
            nivelAguaArrefecimento: 'OK',
            parabrisa: 'OK',
            vazamentosAparentes: 'OK'
          },
          descreva_aqui: 'Reservatório do limpador completado no início do turno. Pneu dianteiro esquerdo calibrado de 26 para 32 PSI.',
          assinatura: 'Marcelo N. Siqueira (Assinatura Digital)'
        },
        {
          id: 'CHK-VEIC-2026-003',
          data_e_hora: '2026-09-19T14:10',
          data: '2026-09-19',
          hora: '14:10',
          condutor: 'Dra. Vanessa Albuquerque',
          placa: 'TEQ-1E02',
          modeloVeiculo: 'Ford Ranger 4x4 (Supervisão Geotécnica)',
          hod_metro_km_atual: 41980,
          lat: -20.082150,
          lon: -44.108420,
          localizacaoNome: 'Cava Jangada - Bancada 890',
          status: 'LIBERADO',
          badgeClass: 'badge-normal',
          linkSurvey: 'https://arcg.is/0DuT4L1',
          itensSeguranca: {
            aguaLimpador: 'OK',
            bandeirola: 'OK',
            buzina: 'OK',
            cintosSeguranca: 'OK',
            documentacao: 'OK',
            freios: 'OK',
            giroflex: 'OK',
            pneusEstepe: 'OK',
            kitSinalizacao: 'OK'
          },
          condicoesGerais: {
            calibragemPneus: 'OK',
            iluminacaoSinalizacao: 'OK',
            latariaPintura: 'OK',
            limpezaGeral: 'OK',
            nivelOleoMotor: 'OK',
            nivelAguaArrefecimento: 'OK',
            parabrisa: 'OK',
            vazamentosAparentes: 'OK'
          },
          descreva_aqui: 'Inspeção de rotina sem inconformidades. Equipamentos de sinalização e EPIs a bordo e conformes.',
          assinatura: 'Vanessa Albuquerque (Assinatura Digital)'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.LOCAL_VEHICLE_CHECKLISTS, JSON.stringify(defaultVehicleChecklists));
      return defaultVehicleChecklists;
    } catch {
      return [];
    }
  },
  saveLocalVehicleChecklist(checklist) {
    try {
      const sanitized = securityShield.sanitizeObject(checklist);
      const list = this.getLocalVehicleChecklists();
      const newChecklist = {
        ...sanitized,
        id: sanitized.id || `CHK-VEIC-${Date.now().toString().slice(-6)}`,
        dataRegistro: sanitized.dataRegistro || new Date().toISOString(),
        origem: 'Survey123 Veicular (MDSync)',
        linkSurvey: 'https://arcg.is/0DuT4L1',
        sincronizado: sanitized.sincronizado !== undefined ? sanitized.sincronizado : true
      };
      const existingIdx = list.findIndex(c => c.id === newChecklist.id);
      if (existingIdx !== -1) {
        list[existingIdx] = newChecklist;
      } else {
        list.unshift(newChecklist);
      }
      localStorage.setItem(STORAGE_KEYS.LOCAL_VEHICLE_CHECKLISTS, JSON.stringify(list));
      securityShield.logSecurityEvent('SAVE_VEHICLE_CHECKLIST', { id: newChecklist.id, placa: newChecklist.placa });
      return newChecklist;
    } catch (e) {
      console.error('Erro ao salvar checklist veicular local:', e);
      return null;
    }
  },
  deleteLocalVehicleChecklist(id) {
    try {
      const list = this.getLocalVehicleChecklists().filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.LOCAL_VEHICLE_CHECKLISTS, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error('Erro ao excluir checklist veicular:', e);
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
      const sanitized = securityShield.sanitizeObject(ticket);
      const tickets = this.getFluigTickets();
      const numProtocolo = sanitized.protocolo || `FLUIG-${Math.floor(10000 + Math.random() * 90000)}`;
      const newTicket = {
        ...sanitized,
        id: sanitized.id || `FLUIG-2026-${numProtocolo.replace('FLUIG-', '')}`,
        protocolo: numProtocolo,
        dataAbertura: sanitized.dataAbertura || new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
        processoId: sanitized.processoId || 'GEO_GESTAO_ANOMALIAS',
        origem: 'App MDSync (Integrado TOTVS Fluig)',
        sincronizado: sanitized.sincronizado !== undefined ? sanitized.sincronizado : true
      };
      const existingIdx = tickets.findIndex(t => t.id === newTicket.id || t.protocolo === newTicket.protocolo);
      if (existingIdx !== -1) {
        tickets[existingIdx] = newTicket;
      } else {
        tickets.unshift(newTicket);
      }
      localStorage.setItem(STORAGE_KEYS.FLUIG_TICKETS, JSON.stringify(tickets));
      securityShield.logSecurityEvent('SAVE_FLUIG_TICKET', { protocolo: newTicket.protocolo });
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
  deleteLoteRelatorio(id) {
    try {
      const list = this.getLotesRelatorios().filter(l => l.id !== id);
      localStorage.setItem(STORAGE_KEYS.LOTES_RELATORIOS, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error(e);
      return false;
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
      } else if (item.type === 'vehicle_checklist' || item.type === 'checklist_veicular' || item.placa) {
        this.saveLocalVehicleChecklist({
          ...item,
          sincronizado: true,
          dataSincronizacao: new Date().toISOString()
        });
      }
      syncedItems.push(item);
    });

    this.clearOfflineQueue();
    
    // Auto-gerar pacote de staging corporativo se houver itens sincronizados
    try {
      this.exportCorporateStagingPackage(syncedItems);
    } catch (e) {
      console.warn('Falha no auto-despacho para staging corporativo:', e);
    }

    return { count: syncedItems.length, items: syncedItems };
  },

  // ==========================================================
  // GESTÃO DE ANOMALIAS GEOTÉCNICAS (PADRÃO SENTNEL / ANM 95/2022)
  // ==========================================================
  getAnomaliasGeotecnicas() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANOMALIAS_GEOTECNICAS);
      if (data) return JSON.parse(data);

      // Seed data inicial de anomalias reais de mineração
      const defaultAnomalies = [
        {
          id: 'ANOM-2026-001',
          codigo: 'ANOM-B1-01',
          estrutura: 'BARRAGEM B1',
          categoria: 'Barragens',
          localizacao: 'Crista - Trecho Central (Estaca 12+10m)',
          cota: '851.60 m',
          tipo: 'Trinca Longitudinal',
          classificacao: 'Nível 1 - Baixa (Atenção)',
          severidade: 1,
          descricao: 'Trinca incipiente com 4mm de abertura e 2.80m de extensão após tráfego de caminhão pipa. Sem movimentação nas últimas 72h.',
          dataIdentificacao: '2026-09-18',
          status: 'Em Monitoramento',
          planoAcaoId: 'PA-2026-014',
          responsavel: 'Eng. Geotécnico Sênior',
          fotoUrl: null,
          coordenadas: { lat: -20.063824, lon: -44.114686 }
        },
        {
          id: 'ANOM-2026-002',
          codigo: 'ANOM-B4-02',
          estrutura: 'BARRAGEM B4',
          categoria: 'Barragens',
          localizacao: 'Pé do Dique de Jusante - Próximo ao Dreno D-03',
          cota: '1078.20 m',
          tipo: 'Surgência de Água',
          classificacao: 'Nível 2 - Média (Alerta)',
          severidade: 2,
          descricao: 'Pequena surgência de água límpida (0.15 L/s) sem carreamento de finos. Turbidez analisada em 2.4 NTU (normal). DHP alocado.',
          dataIdentificacao: '2026-09-16',
          status: 'Ação em Andamento',
          planoAcaoId: 'PA-2026-016',
          responsavel: 'Técnico de Instrumentação',
          fotoUrl: null,
          coordenadas: { lat: -20.089000, lon: -44.100584 }
        },
        {
          id: 'ANOM-2026-003',
          codigo: 'ANOM-PDE-01',
          estrutura: 'PDE ES1',
          categoria: 'Pilhas',
          localizacao: 'Berma Intermediária 3 - Canaleta de Crista',
          cota: '835.00 m',
          tipo: 'Erosão de Superfície / Assoreamento',
          classificacao: 'Nível 1 - Baixa (Atenção)',
          severidade: 1,
          descricao: 'Acúmulo de sedimento em 12 metros de canaleta de concreto após chuva de 42mm. Risco de transbordo no talude inferior.',
          dataIdentificacao: '2026-09-19',
          status: 'Programado Reparo',
          planoAcaoId: null,
          responsavel: 'Equipe de Manutenção Civil',
          fotoUrl: null,
          coordenadas: { lat: -20.091028, lon: -44.110613 }
        },
        {
          id: 'ANOM-2026-004',
          codigo: 'ANOM-JANG-01',
          estrutura: 'JANGADA',
          categoria: 'Cavas',
          localizacao: 'Talude Noroeste - Bancada 960',
          cota: '960.00 m',
          tipo: 'Trinca de Alívio / Tração',
          classificacao: 'Nível 2 - Média (Alerta)',
          severidade: 2,
          descricao: 'Trinca de tração subparalela à crista da bancada de 5m de extensão. Prisma P-14 instalado para leitura robótica contínua.',
          dataIdentificacao: '2026-09-14',
          status: 'Em Investigação',
          planoAcaoId: 'PA-2026-015',
          responsavel: 'Geólogo de Operação de Mina',
          fotoUrl: null,
          coordenadas: { lat: -20.097198, lon: -44.092516 }
        }
      ];
      localStorage.setItem(STORAGE_KEYS.ANOMALIAS_GEOTECNICAS, JSON.stringify(defaultAnomalies));
      return defaultAnomalies;
    } catch {
      return [];
    }
  },
  saveAnomaliaGeotecnica(anomalia) {
    try {
      const list = this.getAnomaliasGeotecnicas();
      const newAnom = {
        ...anomalia,
        id: anomalia.id || `ANOM-2026-${String(list.length + 1).padStart(3, '0')}`,
        codigo: anomalia.codigo || `ANOM-GEO-${Math.floor(100 + Math.random() * 900)}`,
        dataIdentificacao: anomalia.dataIdentificacao || new Date().toISOString().split('T')[0]
      };
      const idx = list.findIndex(a => a.id === newAnom.id);
      if (idx !== -1) list[idx] = newAnom;
      else list.unshift(newAnom);
      localStorage.setItem(STORAGE_KEYS.ANOMALIAS_GEOTECNICAS, JSON.stringify(list));
      return newAnom;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  updateAnomaliaGeotecnica(id, updates) {
    try {
      const list = this.getAnomaliasGeotecnicas();
      const idx = list.findIndex(a => a.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        localStorage.setItem(STORAGE_KEYS.ANOMALIAS_GEOTECNICAS, JSON.stringify(list));
        return list[idx];
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // ==========================================================
  // INSPEÇÕES GEOTÉCNICAS REGULARES & ESPECIAIS (ISR / ISE)
  // ==========================================================
  getInspecoesGeotecnicas() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INSPECOES_GEOTECNICAS);
      if (data) return JSON.parse(data);

      const defaultInspections = [
        {
          id: 'INSP-2026-038',
          tipo: 'ISR', // Inspeção de Segurança Regular
          titulo: 'Inspeção Regular Quinzenal - Barragem B1',
          estrutura: 'BARRAGEM B1',
          categoria: 'Barragens',
          data: '2026-09-18',
          inspetor: 'Eng. Maycon Nascimento (CREA-MG)',
          status: 'Concluída',
          resultadoGeral: 'Estável com Observações (Nível 1)',
          itensInspecionados: {
            crista: 'Regular (trinca superficial identificada)',
            taludeJusante: 'Conforme (sem deformações)',
            taludeMontante: 'Conforme (enrocamento íntegro)',
            sistemaDrenagem: 'Operacional (vazão límpida)',
            instrumentacao: '100% lida e validada'
          },
          proximaInspecao: '2026-10-02',
          parecerTecnico: 'Maciço apresenta condições satisfatórias de estabilidade. Proceder ao selamento preventivo da trinca na crista.'
        },
        {
          id: 'INSP-2026-039',
          tipo: 'ISR',
          titulo: 'Inspeção Regular Quinzenal - Barragem B4 & Vertedouro',
          estrutura: 'BARRAGEM B4',
          categoria: 'Barragens',
          data: '2026-09-19',
          inspetor: 'Téc. Instrumentação Geotécnica',
          status: 'Concluída',
          resultadoGeral: 'Conforme / Normal',
          itensInspecionados: {
            crista: 'Conforme',
            taludeJusante: 'Pequena surgência monitorada',
            taludeMontante: 'Conforme',
            sistemaDrenagem: 'Conforme',
            instrumentacao: 'Conforme'
          },
          proximaInspecao: '2026-10-03',
          parecerTecnico: 'Vertedouro desobstruído com lâmina d água normal. Piezometria estável.'
        },
        {
          id: 'INSP-2026-004',
          tipo: 'ISE', // Inspeção Especial
          titulo: 'Inspeção Especial Pós-Chuva Intensa (62mm em 24h)',
          estrutura: 'BARRAGEM B1',
          categoria: 'Barragens',
          data: '2026-09-12',
          inspetor: 'Comitê de Segurança de Barragens',
          status: 'Concluída',
          resultadoGeral: 'Conforme / Resposta Hidráulica Adequada',
          itensInspecionados: {
            crista: 'Sem empoçamento',
            taludeJusante: 'Drenagem fluindo normalmente',
            taludeMontante: 'Borda livre de 3.20m',
            sistemaDrenagem: 'Vazão máxima atingida de 4.8 L/s',
            instrumentacao: 'NA elevado em 0.18m, retornando à curva'
          },
          proximaInspecao: 'Sob demanda',
          parecerTecnico: 'Estrutura respondeu de forma elástica e segura à precipitação atípica.'
        },
        {
          id: 'INSP-2026-040',
          tipo: 'ISR',
          titulo: 'Inspeção Regular Programada - Pilhas PDE ES1 e PDE Oeste',
          estrutura: 'PDE ES1',
          categoria: 'Pilhas',
          data: '2026-09-25',
          inspetor: 'Eng. Geotécnico de Minas',
          status: 'Agendada',
          resultadoGeral: 'Aguardando Execução',
          itensInspecionados: {},
          proximaInspecao: '2026-09-25',
          parecerTecnico: 'Foco na vistoria dos drenos de pé e canaletas de desvio de águas pluviais.'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.INSPECOES_GEOTECNICAS, JSON.stringify(defaultInspections));
      return defaultInspections;
    } catch {
      return [];
    }
  },
  saveInspecaoGeotecnica(inspecao) {
    try {
      const list = this.getInspecoesGeotecnicas();
      const newInsp = {
        ...inspecao,
        id: inspecao.id || `INSP-2026-${String(list.length + 1).padStart(3, '0')}`,
        data: inspecao.data || new Date().toISOString().split('T')[0]
      };
      const idx = list.findIndex(i => i.id === newInsp.id);
      if (idx !== -1) list[idx] = newInsp;
      else list.unshift(newInsp);
      localStorage.setItem(STORAGE_KEYS.INSPECOES_GEOTECNICAS, JSON.stringify(list));
      return newInsp;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // ==========================================================
  // PLANOS DE AÇÃO 5W2H (CAPA - AÇÕES CORRETIVAS E PREVENTIVAS)
  // ==========================================================
  getPlanosAcao() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLANOS_ACAO);
      if (data) return JSON.parse(data);

      const defaultPlans = [
        {
          id: 'PA-2026-014',
          titulo: 'Selamento de trinca em crista da B1 com argila plástica compactada',
          estrutura: 'BARRAGEM B1',
          categoria: 'Barragens',
          anomaliaId: 'ANOM-2026-001',
          oQue: 'Escarificar e preencher a fissura superficial com solo argiloso compactado manualmente em camadas.',
          porQue: 'Impedir a infiltração direta de água pluvial no corpo do maciço terroso.',
          quem: 'Equipe de Manutenção Civil & Geotecnia Itaminas',
          onde: 'Barragem B1, Crista, Estaca 12+10m',
          quando: '2026-09-25',
          como: 'Escarificação em V, aplicação de argila compactada com soquete e impermeabilização superficial.',
          quanto: 'R$ 3.500,00 (mão de obra interna)',
          status: 'Em Execução',
          progresso: 65,
          prioridade: 'Alta'
        },
        {
          id: 'PA-2026-015',
          titulo: 'Instalação de Drenos Sub-horizontais Profundos (DHP) na Cava Jangada',
          estrutura: 'JANGADA',
          categoria: 'Cavas',
          anomaliaId: 'ANOM-2026-004',
          oQue: 'Perfuração e instalação de 4 drenos sub-horizontais de 30 metros de profundidade.',
          porQue: 'Aliviar poro-pressões induzidas no maciço rochoso fraturado.',
          quem: 'Geosonda Engenharia & Perfurações Ltda',
          onde: 'Cava Jangada - Bancada 960 Noroeste',
          quando: '2026-10-10',
          como: 'Sonda roto-percussiva montada sobre esteiras com tubo PVC geomecânico ranhurado.',
          quanto: 'R$ 48.000,00',
          status: 'Em Andamento',
          progresso: 30,
          prioridade: 'Crítica'
        },
        {
          id: 'PA-2026-016',
          titulo: 'Desassoreamento de canaleta trapezoidal da Berma 4 - Barragem B4',
          estrutura: 'BARRAGEM B4',
          categoria: 'Barragens',
          anomaliaId: 'ANOM-2026-003',
          oQue: 'Limpeza e remoção de 4m³ de sedimento acumulado na calha de drenagem.',
          porQue: 'Garantir escoamento pluvial sem transbordamento para o talude.',
          quem: 'Equipe Operacional de Limpeza',
          onde: 'Barragem B4 - Berma 4 Jusante',
          quando: '2026-09-22',
          como: 'Remoção manual com pá e caçamba, com transporte para bota-fora autorizado.',
          quanto: 'R$ 1.800,00',
          status: 'Concluído',
          progresso: 100,
          prioridade: 'Média'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.PLANOS_ACAO, JSON.stringify(defaultPlans));
      return defaultPlans;
    } catch {
      return [];
    }
  },
  savePlanoAcao(plano) {
    try {
      const list = this.getPlanosAcao();
      const newPlan = {
        ...plano,
        id: plano.id || `PA-2026-${String(list.length + 1).padStart(3, '0')}`,
        status: plano.status || 'Não Iniciado',
        progresso: plano.progresso || 0
      };
      const idx = list.findIndex(p => p.id === newPlan.id);
      if (idx !== -1) list[idx] = newPlan;
      else list.unshift(newPlan);
      localStorage.setItem(STORAGE_KEYS.PLANOS_ACAO, JSON.stringify(list));
      return newPlan;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  updatePlanoAcao(id, updates) {
    try {
      const list = this.getPlanosAcao();
      const idx = list.findIndex(p => p.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        localStorage.setItem(STORAGE_KEYS.PLANOS_ACAO, JSON.stringify(list));
        return list[idx];
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // ==========================================================
  // GESTÃO DOCUMENTAL & LEGISLAÇÃO APLICADA (PADRÃO SENTNEL)
  // ==========================================================
  getDocumentosEstruturas() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTOS_ESTRUTURAS);
      if (data) return JSON.parse(data);

      const defaultDocs = [
        {
          id: 'DOC-2026-001',
          titulo: 'Plano de Segurança de Barragens (PSB) - Volume I & II',
          estrutura: 'BARRAGEM B1',
          categoria: 'Barragens',
          tipo: 'PSB',
          versao: 'Rev. 05',
          dataPublicacao: '2026-07-15',
          validade: '2027-07-15',
          status: 'Vigente',
          responsavelTecnico: 'Eng. Geotécnico Sênior (CREA/MG 148.920)',
          art: 'ART-MG-2026-089123',
          tamanhoMb: 18.4,
          formato: 'PDF Assinado Digitalmente'
        },
        {
          id: 'DOC-2026-002',
          titulo: 'Declaração de Condição de Estabilidade (DCE / DCR Semestral ANM)',
          estrutura: 'BARRAGEM B1',
          categoria: 'Barragens',
          tipo: 'DCE',
          versao: 'Ciclo Set/2026',
          dataPublicacao: '2026-09-10',
          validade: '2027-03-31',
          status: 'Atestada Estabilidade',
          responsavelTecnico: 'Auditoria Externa Geotécnica Ltda',
          art: 'ART-MG-2026-112034',
          tamanhoMb: 6.2,
          formato: 'PDF Assinado ICP-Brasil'
        },
        {
          id: 'DOC-2026-003',
          titulo: 'Plano de Ação de Emergência para Barragens de Mineração (PAEBM)',
          estrutura: 'BARRAGEM B4',
          categoria: 'Barragens',
          tipo: 'PAEBM',
          versao: 'Rev. 04',
          dataPublicacao: '2026-08-01',
          validade: '2027-08-01',
          status: 'Aprovado Defesa Civil',
          responsavelTecnico: 'Comitê Corporativo de Emergência',
          art: 'ART-MG-2026-077431',
          tamanhoMb: 24.8,
          formato: 'PDF com Mapas de Inundação'
        },
        {
          id: 'DOC-2026-004',
          titulo: 'Projeto Como Construído (As-Built) - Enrocamento e Filtro',
          estrutura: 'BARRAGEM B1',
          categoria: 'Barragens',
          tipo: 'PROJETO_AS_BUILT',
          versao: 'Final Aprovada',
          dataPublicacao: '2025-11-20',
          validade: 'Permanente',
          status: 'Vigente',
          responsavelTecnico: 'Consórcio Projetista Geotécnico',
          art: 'ART-MG-2025-998812',
          tamanhoMb: 42.1,
          formato: 'DWG / PDF Vetorial'
        },
        {
          id: 'DOC-2026-005',
          titulo: 'Levantamento Topográfico e Ortofoto Drone LiDAR 3D',
          estrutura: 'JANGADA',
          categoria: 'Cavas',
          tipo: 'TOPOGRAFIA_DRONE',
          versao: 'Campanha Set/2026',
          dataPublicacao: '2026-09-15',
          validade: '2026-12-15',
          status: 'Vigente',
          responsavelTecnico: 'Equipe de Topografia de Minas',
          art: 'ART-MG-2026-144021',
          tamanhoMb: 115.0,
          formato: 'Nuvem de Pontos LAS / Geotiff'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.DOCUMENTOS_ESTRUTURAS, JSON.stringify(defaultDocs));
      return defaultDocs;
    } catch {
      return [];
    }
  },
  saveDocumentoEstrutura(doc) {
    try {
      const list = this.getDocumentosEstruturas();
      const newDoc = {
        ...doc,
        id: doc.id || `DOC-2026-${String(list.length + 1).padStart(3, '0')}`,
        dataPublicacao: doc.dataPublicacao || new Date().toISOString().split('T')[0]
      };
      const idx = list.findIndex(d => d.id === newDoc.id);
      if (idx !== -1) list[idx] = newDoc;
      else list.unshift(newDoc);
      localStorage.setItem(STORAGE_KEYS.DOCUMENTOS_ESTRUTURAS, JSON.stringify(list));
      return newDoc;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // ==========================================================
  // CENTRAL DE COMUNICAÇÃO & DIÁRIO OPERACIONAL DE CAMPO
  // ==========================================================
  getComunicadosOperacionais() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMUNICADOS_OPERACIONAIS);
      if (data) return JSON.parse(data);

      const defaultFeed = [
        {
          id: 'COM-2026-001',
          autor: 'Eng. Maycon Nascimento',
          cargo: 'Engenheiro Geotécnico Sênior',
          dataHora: '2026-09-22 08:15',
          tipo: 'PASSAGEM_TURNO',
          titulo: 'Passagem de Turno Geotécnico - Status Geral Estável',
          conteudo: 'Todas as leituras dos 218 instrumentos da campanha do PCMI foram finalizadas e estão 100% íntegras. Nenhum instrumento superou a cota de emergência. Acompanhamento focado nos piezômetros PZ-04 e PZ-07 da B1.',
          estrutura: 'BARRAGEM B1',
          categoria: 'Barragens',
          badge: 'Turno A',
          urgencia: 'Normal'
        },
        {
          id: 'COM-2026-002',
          autor: 'Centro de Controle Meteorológico',
          cargo: 'Monitoramento Ambiental',
          dataHora: '2026-09-21 16:30',
          tipo: 'CLIMA',
          titulo: 'Alerta Preventivo de Precipitação Convectiva',
          conteudo: 'Previsão de 30 a 50mm de chuva isolada no Quadrilátero Ferrífero nas próximas 18 horas. Equipes de inspeção e fiscais de drenagem devem manter rádio aberto na frequência 4.',
          estrutura: 'TODAS',
          categoria: 'Geral',
          badge: 'Meteo',
          urgencia: 'Atenção'
        },
        {
          id: 'COM-2026-003',
          autor: 'Engenharia de Desmonte de Rocha',
          cargo: 'Operação de Mina Itaminas',
          dataHora: '2026-09-20 11:45',
          tipo: 'DETONACAO',
          titulo: 'Detonação Programada de Bancada 940 - Cava Jangada',
          conteudo: 'Fogo realizado com sucesso às 11:30. Acelerômetros e sismógrafos triaxiais registraram PPV de 1.7 mm/s no talude noroeste, bem abaixo do limite seguro de 5.0 mm/s. Sem danos estruturais observados.',
          estrutura: 'JANGADA',
          categoria: 'Cavas',
          badge: 'Mina',
          urgencia: 'Normal'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.COMUNICADOS_OPERACIONAIS, JSON.stringify(defaultFeed));
      return defaultFeed;
    } catch {
      return [];
    }
  },
  saveComunicadoOperacional(comunicado) {
    try {
      const list = this.getComunicadosOperacionais();
      const newCom = {
        ...comunicado,
        id: comunicado.id || `COM-2026-${String(list.length + 1).padStart(3, '0')}`,
        dataHora: comunicado.dataHora || new Date().toLocaleString('pt-BR')
      };
      list.unshift(newCom);
      localStorage.setItem(STORAGE_KEYS.COMUNICADOS_OPERACIONAIS, JSON.stringify(list));
      return newCom;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Gerar Pacote de Staging para a Pasta Corporativa ITAMINAS (00) Leituras\MDSync_Integracao_Campo)
  exportCorporateStagingPackage(specificItems = null) {
    const items = specificItems || [
      ...this.getLocalReadings().map(r => ({ ...r, type: 'reading' })),
      ...this.getLocalAnomalies().map(a => ({ ...a, type: 'anomaly' })),
      ...this.getLocalChecklists().map(c => ({ ...c, type: 'checklist' })),
      ...this.getFluigTickets().map(f => ({ ...f, type: 'fluig_ticket' }))
    ];

    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const batchId = `LOTE_MDSYNC_${Date.now()}`;
    const jsonFilename = `MDSync_Lote_Campo_${timestampStr}.json`;
    const csvFilename = `Leituras_Campo_${timestampStr}.csv`;

    const readings = items.filter(i => i.type === 'reading' || i.tipo || i.cotaCalculada !== undefined);
    const anomalies = items.filter(i => i.type === 'anomaly' || i.severidade);
    const checklists = items.filter(i => i.type === 'checklist' || i.surveyId);
    const fluigTickets = items.filter(i => i.type === 'fluig_ticket' || i.protocolo);

    // Gerar CSV delimitado por ponto e vírgula compatível com Excel corporativo
    const csvRows = [
      'Estrutura;Instrumento;Tipo;Data;Hora;Leitura;Cota_NA;Status;Operador;Origem;Hash_Integridade'
    ];
    readings.forEach(r => {
      csvRows.push([
        r.estrutura || 'BARRAGEM B1',
        r.instrumento || r.id || '',
        r.tipo || 'INA',
        r.data || new Date().toISOString().split('T')[0],
        r.hora || '12:00:00',
        String(r.valor !== undefined ? r.valor : (r.leitura || 0)).replace('.', ','),
        String(r.cotaCalculada !== undefined ? r.cotaCalculada : (r.cota || 0)).replace('.', ','),
        r.status || 'NORMAL',
        r.operador || 'Técnico de Campo',
        'App MDSync',
        r.sealHash || ''
      ].join(';'));
    });

    const payload = {
      batchId,
      geradoEm: new Date().toISOString(),
      origem: 'App Web/Mobile MDSync',
      pastaDestinoAlvo: 'C:\\Users\\maycon.nascimento\\ITAMINAS\\SPLO - General\\03) Geotecnia\\01) PCMI\\02) Monitoramentos\\00) Leituras\\MDSync_Integracao_Campo',
      totalItens: items.length,
      readings,
      anomalies,
      checklists,
      fluigTickets
    };

    // Registrar no histórico de lotes despachados
    try {
      const history = JSON.parse(localStorage.getItem('mdsync_staged_batches_history') || '[]');
      history.unshift({
        batchId,
        jsonFilename,
        csvFilename,
        timestamp: payload.geradoEm,
        totalItens: items.length,
        totalLeituras: readings.length,
        status: 'PRONTO_PARA_INTEGRACAO'
      });
      localStorage.setItem('mdsync_staged_batches_history', JSON.stringify(history.slice(0, 30)));
    } catch (e) {}

    securityShield.logSecurityEvent('DISPATCH_STAGING_PACKAGE', { batchId, totalItens: items.length });

    return {
      batchId,
      jsonFilename,
      csvFilename,
      payload,
      csvContent: csvRows.join('\r\n'),
      totalItens: items.length
    };
  },

  // Dispara download dos arquivos de integração de campo
  downloadCorporateStagingPackage(packageData) {
    if (!packageData) return;

    // 1. Download do JSON mestre
    const jsonBlob = new Blob([JSON.stringify(packageData.payload, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const aJson = document.createElement('a');
    aJson.href = jsonUrl;
    aJson.download = packageData.jsonFilename;
    aJson.click();
    URL.revokeObjectURL(jsonUrl);

    // 2. Download do CSV para Excel se houver leituras
    if (packageData.csvContent && packageData.payload.readings?.length > 0) {
      setTimeout(() => {
        const csvBlob = new Blob(['\uFEFF' + packageData.csvContent], { type: 'text/csv;charset=utf-8;' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const aCsv = document.createElement('a');
        aCsv.href = csvUrl;
        aCsv.download = packageData.csvFilename;
        aCsv.click();
        URL.revokeObjectURL(csvUrl);
      }, 300);
    }
  },

  // ============================================================
  // TEMPLATE DO IDENTIFICADOR DO REGISTRO (INSPIRADO NO SYSDAM)
  // ============================================================
  getRecordIdTemplate() {
    try {
      return localStorage.getItem(STORAGE_KEYS.RECORD_ID_TEMPLATE) || '{SIGLA_EMPREENDIMENTO} - {NOME_SINTOMA}';
    } catch {
      return '{SIGLA_EMPREENDIMENTO} - {NOME_SINTOMA}';
    }
  },
  saveRecordIdTemplate(template) {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORD_ID_TEMPLATE, template || '{SIGLA_EMPREENDIMENTO} - {NOME_SINTOMA}');
      window.dispatchEvent(new CustomEvent('mdsync:template-changed', { detail: { template } }));
      return true;
    } catch (e) {
      console.error('Erro ao salvar template:', e);
      return false;
    }
  },

  // ============================================================
  // REGRAS & PARÂMETROS OPERACIONAIS DE INSPEÇÃO (INSPIRADO NO SYSDAM)
  // ============================================================
  getInspectionRules() {
    try {
      if (typeof localStorage === 'undefined') {
        return {
          habilitarRegistroAvulso: true,
          permitirHistoricosOutrosRegistros: true,
          dataCorteHistorico: '2026-01-01',
          exigirPinInspecao: false,
          configuracaoPinInspecoes: false,
          pinInspecao: '1234',
          habilitarLiveInspection: true
        };
      }
      const data = localStorage.getItem(STORAGE_KEYS.INSPECTION_RULES);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          habilitarRegistroAvulso: true,
          permitirHistoricosOutrosRegistros: true,
          dataCorteHistorico: '2026-01-01',
          exigirPinInspecao: false,
          configuracaoPinInspecoes: parsed.configuracaoPinInspecoes ?? parsed.exigirPinInspecao ?? false,
          pinInspecao: '1234',
          habilitarLiveInspection: true,
          ...parsed
        };
      }
      return {
        habilitarRegistroAvulso: true,
        permitirHistoricosOutrosRegistros: true,
        dataCorteHistorico: '2026-01-01',
        exigirPinInspecao: false,
        configuracaoPinInspecoes: false,
        pinInspecao: '1234',
        habilitarLiveInspection: true
      };
    } catch {
      return {
        habilitarRegistroAvulso: true,
        permitirHistoricosOutrosRegistros: true,
        dataCorteHistorico: '2026-01-01',
        exigirPinInspecao: false,
        configuracaoPinInspecoes: false,
        pinInspecao: '1234',
        habilitarLiveInspection: true
      };
    }
  },
  saveInspectionRules(rules) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.INSPECTION_RULES, JSON.stringify(rules));
      }
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('mdsync:inspection-rules-changed', { detail: rules }));
      }
      return true;
    } catch (e) {
      console.error('Erro ao salvar regras de inspeção:', e);
      return false;
    }
  },

  // ============================================================
  // CATÁLOGO DE ESTRUTURAS DO EMPREENDIMENTO (INSPIRADO NO SYSDAM)
  // ============================================================
  getEstruturasEmpreendimento() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ESTRUTURAS_EMPREENDIMENTO);
      if (data) return JSON.parse(data);

      const defaultEstruturas = [
        {
          id: 'B1',
          sigla: 'B1',
          nome: 'Barragem B1',
          nomeCompleto: 'Barragem B1 (Maciço Principal & Reservatório)',
          tipo: 'BARRAGEM',
          tipoLetra: 'B',
          faseProjeto: 'Em Operação / Descaracterização em Planejamento',
          tipoSecao: 'Terra compactada homogênea com enrocamento',
          tipoEstrutura: 'Barragem de Contenção de Rejeitos',
          finalidade: 'Contenção de Rejeitos de Minério de Ferro e Água',
          estruturaAssoc: 'Vertedouro Tulipa, Bacia de Decantação e Dique Auxiliar B1',
          orgaoFiscalizador: 'ANM & FEAM',
          dpa: 'Alto',
          cri: 'Baixo',
          statusDce: 'DCE Válida (Emitida)',
          cotaCrista: 851.66,
          alturaMaxima: 56.4,
          volumeAtual: '4.820.000 m³',
          coordenadas: { lat: -20.063824, lon: -44.114686 }
        },
        {
          id: 'B4',
          sigla: 'B4',
          nome: 'Barragem B4',
          nomeCompleto: 'Barragem B4 (Contenção & Vertedouro)',
          tipo: 'BARRAGEM',
          tipoLetra: 'B',
          faseProjeto: 'Em Operação / Monitoramento Intensivo',
          tipoSecao: 'Maciço de Solo Reforçado com Enrocamento de Jusante',
          tipoEstrutura: 'Barragem de Sedimentos e Rejeito Arenoso',
          finalidade: 'Contenção de Sedimentos Pluviais e Rejeito',
          estruturaAssoc: 'Canal de Desvio Margem Direita e Dreno de Fundo D-03',
          orgaoFiscalizador: 'ANM & FEAM',
          dpa: 'Alto',
          cri: 'Médio',
          statusDce: 'DCE Válida (Emitida)',
          cotaCrista: 1166.0,
          alturaMaxima: 42.0,
          volumeAtual: '1.250.000 m³',
          coordenadas: { lat: -20.089000, lon: -44.100584 }
        },
        {
          id: 'ES',
          sigla: 'ES',
          nome: 'Cava Engenho Seco',
          nomeCompleto: 'Cava Engenho Seco (Lavra Ativa)',
          tipo: 'CAVA',
          tipoLetra: 'C',
          faseProjeto: 'Operação / Lavra Ativa a Céu Aberto',
          tipoSecao: 'Taludes Escavados em Rocha e Solo Alterado',
          tipoEstrutura: 'Cava Minerária a Céu Aberto',
          finalidade: 'Extração Mineral e Rebaixamento de Lençol Freático',
          estruturaAssoc: 'Sistema de Bombeamento e Drenos Horizontais Profundos (DHPs)',
          orgaoFiscalizador: 'ANM',
          dpa: 'Médio',
          cri: 'Baixo',
          statusDce: 'Conforme laudo geotécnico semestral',
          cotaCrista: 980.0,
          alturaMaxima: 190.0,
          volumeAtual: 'Em operação de lavra',
          coordenadas: { lat: -20.095810, lon: -44.111803 }
        },
        {
          id: 'JGD',
          sigla: 'JGD',
          nome: 'Cava Jangada',
          nomeCompleto: 'Cava Jangada & Vertedouros',
          tipo: 'CAVA',
          tipoLetra: 'C',
          faseProjeto: 'Desativação / Monitoramento Hidrogeológico',
          tipoSecao: 'Bancadas e Taludes Estabilizados',
          tipoEstrutura: 'Cava Minerária em Processo de Recuperação',
          finalidade: 'Reservatório de Amortecimento Hidráulico e Controle Ambiental',
          estruturaAssoc: 'Vertedouro Superficial e Vertedor Soleira Livre',
          orgaoFiscalizador: 'ANM & FEAM',
          dpa: 'Médio',
          cri: 'Baixo',
          statusDce: 'Inspeções Periódicas Regulares',
          cotaCrista: 890.0,
          alturaMaxima: 150.0,
          volumeAtual: 'Amortecimento controlado',
          coordenadas: { lat: -20.097198, lon: -44.092516 }
        },
        {
          id: 'ES1',
          sigla: 'ES1',
          nome: 'PDE Engenho Seco I',
          nomeCompleto: 'Pilha de Disposição de Estéril Engenho Seco I',
          tipo: 'PILHA',
          tipoLetra: 'P',
          faseProjeto: 'Operação de Deposição Controlada',
          tipoSecao: 'Bancadas Ascendentes com Bermas de 10m',
          tipoEstrutura: 'Pilha de Estéril (PDE)',
          finalidade: 'Disposição de Estéril e Rocha Sã Provenientes da Lavra',
          estruturaAssoc: 'Canaletas Periféricas e Drenos de Pé de Rocha',
          orgaoFiscalizador: 'ANM & FEAM',
          dpa: 'Médio',
          cri: 'Baixo',
          statusDce: 'Em conformidade com PNSB',
          cotaCrista: 835.0,
          alturaMaxima: 65.0,
          volumeAtual: '3.100.000 m³',
          coordenadas: { lat: -20.091028, lon: -44.110613 }
        },
        {
          id: 'JC',
          sigla: 'JC',
          nome: 'PDE Jacó',
          nomeCompleto: 'Pilha de Disposição de Estéril Jacó',
          tipo: 'PILHA',
          tipoLetra: 'P',
          faseProjeto: 'Pós-Fechamento / Revegetação em Andamento',
          tipoSecao: 'Taludes Conformados e Hidrossemeados',
          tipoEstrutura: 'Pilha de Estéril (PDE Concluída)',
          finalidade: 'Estabilização Geotécnica e Revegetação de Encosta',
          estruturaAssoc: 'Bacia de Sedimentação e Escada Hidráulica Dissipadora',
          orgaoFiscalizador: 'ANM & FEAM',
          dpa: 'Baixo',
          cri: 'Baixo',
          statusDce: 'Estabilidade Geotécnica Certificada',
          cotaCrista: 870.0,
          alturaMaxima: 45.0,
          volumeAtual: '1.800.000 m³',
          coordenadas: { lat: -20.102932, lon: -44.095021 }
        },
        {
          id: 'MGB',
          sigla: 'MGB',
          nome: 'PDE Mangaba',
          nomeCompleto: 'Pilha de Disposição de Estéril Mangaba',
          tipo: 'PILHA',
          tipoLetra: 'P',
          faseProjeto: 'Operação Regular',
          tipoSecao: 'Camadas Compactadas de Estéril Friável',
          tipoEstrutura: 'Pilha de Estéril (PDE)',
          finalidade: 'Deposição Geotécnica de Estéril Itabirítico',
          estruturaAssoc: 'Dique de Contenção de Pé e Rede de Canaletas Escalonadas',
          orgaoFiscalizador: 'ANM & FEAM',
          dpa: 'Médio',
          cri: 'Baixo',
          statusDce: 'DCE Vigente',
          cotaCrista: 840.0,
          alturaMaxima: 50.0,
          volumeAtual: '2.400.000 m³',
          coordenadas: { lat: -20.088788, lon: -44.092452 }
        },
        {
          id: 'PB2',
          sigla: 'PB2',
          nome: 'PDR B2',
          nomeCompleto: 'Pilha de Disposição de Rejeito B2 (PDR B2)',
          tipo: 'PILHA',
          tipoLetra: 'P',
          faseProjeto: 'Operação / Desaguamento e Empilhamento a Seco',
          tipoSecao: 'Rejeito Filtrado Compactado com Drenos Sub-superficiais',
          tipoEstrutura: 'Pilha de Rejeito Filtrado (Dry Stacking)',
          finalidade: 'Empilhamento a Seco de Rejeito Arenoso Desaguado',
          estruturaAssoc: 'Planta de Filtragem a Vácuo e Bacia de Retenção de Chuva',
          orgaoFiscalizador: 'ANM & FEAM',
          dpa: 'Médio',
          cri: 'Baixo',
          statusDce: 'Projeto Aprovado ANM',
          cotaCrista: 865.0,
          alturaMaxima: 38.0,
          volumeAtual: '950.000 m³',
          coordenadas: { lat: -20.080850, lon: -44.111500 }
        }
      ];

      localStorage.setItem(STORAGE_KEYS.ESTRUTURAS_EMPREENDIMENTO, JSON.stringify(defaultEstruturas));
      return defaultEstruturas;
    } catch {
      return [];
    }
  },
  saveEstruturaEmpreendimento(estrutura) {
    try {
      const estruturas = this.getEstruturasEmpreendimento();
      const idx = estruturas.findIndex(e => e.id === estrutura.id || e.sigla === estrutura.sigla);
      if (idx !== -1) {
        estruturas[idx] = { ...estruturas[idx], ...estrutura };
      } else {
        estruturas.push(estrutura);
      }
      localStorage.setItem(STORAGE_KEYS.ESTRUTURAS_EMPREENDIMENTO, JSON.stringify(estruturas));
      window.dispatchEvent(new CustomEvent('mdsync:estruturas-changed', { detail: estruturas }));
      return true;
    } catch (e) {
      console.error('Erro ao salvar estrutura:', e);
      return false;
    }
  },
  deleteEstruturaEmpreendimento(id) {
    try {
      const estruturas = this.getEstruturasEmpreendimento().filter(e => e.id !== id && e.sigla !== id);
      localStorage.setItem(STORAGE_KEYS.ESTRUTURAS_EMPREENDIMENTO, JSON.stringify(estruturas));
      window.dispatchEvent(new CustomEvent('mdsync:estruturas-changed', { detail: estruturas }));
      return true;
    } catch (e) {
      console.error('Erro ao excluir estrutura:', e);
      return false;
    }
  }
};

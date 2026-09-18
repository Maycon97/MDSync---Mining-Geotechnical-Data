// ============================================================
// MDSync — Serviço de Integração de Dados Corporativos
// Conecta fontes empresariais (APIs REST, Excel/CSV, TOTVS Fluig, IoT)
// ============================================================

import { storageService } from './storageService';

export const DATA_SOURCE_TYPES = {
  STATIC_MASTER: 'STATIC_MASTER',     // geotech_master.json
  COMPANY_REST_API: 'COMPANY_REST_API', // API REST corporativa (Oracle/PostgreSQL)
  EXCEL_IMPORT: 'EXCEL_IMPORT',       // Planilha Excel/CSV (PCMI / JGD)
  WEBHOOK: 'WEBHOOK'                  // Webhook em tempo real (SCADA/Datalogger)
};

export const dataIntegrationService = {
  /**
   * Configurações da API Corporativa
   */
  getConfig() {
    try {
      const stored = localStorage.getItem('mdsync_company_api_config');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      enabled: false,
      baseUrl: import.meta.env.VITE_COMPANY_API_URL || '',
      apiKey: import.meta.env.VITE_COMPANY_API_KEY || '',
      syncIntervalMinutes: 30,
      autoSyncOnReconnect: true
    };
  },

  /**
   * Salva configurações da API corporativa
   */
  saveConfig(config) {
    try {
      localStorage.setItem('mdsync_company_api_config', JSON.stringify(config));
    } catch (e) {
      console.error('Erro ao salvar configuração da API corporativa:', e);
    }
  },

  /**
   * Validador de Estrutura Geotécnica
   */
  validateStructure(struct) {
    const errors = [];
    if (!struct.id) errors.push('ID da estrutura é obrigatório');
    if (!struct.nome) errors.push('Nome da estrutura é obrigatório');
    if (struct.lat === undefined || struct.lon === undefined) {
      errors.push('Coordenadas geográficas (lat, lon) são obrigatórias');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validador de Instrumento
   */
  validateInstrument(inst) {
    const errors = [];
    if (!inst.id) errors.push('Identificador (ID) do instrumento é obrigatório');
    if (!inst.estrutura) errors.push('Estrutura de vínculo é obrigatória');
    if (!inst.tipo) errors.push('Tipo do instrumento (ex: INA, PZ, VT, DRENO) é obrigatório');
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validador de Leitura de Campo
   */
  validateReading(reading) {
    const errors = [];
    if (!reading.id && !reading.instrumentoId) errors.push('ID do instrumento é obrigatório');
    if (reading.valor === undefined || isNaN(Number(reading.valor))) {
      errors.push('Valor numérico da leitura é obrigatório');
    }
    if (!reading.data && !reading.dataHora) {
      errors.push('Data e hora da leitura são obrigatórias');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Mapeia linhas brutas de planilhas da empresa (PCMI / JGD) para o formato MDSync
   */
  mapCompanyExcelRowToInstrument(row) {
    // Normalizar chaves minúsculas sem acentos
    const cleanKeys = {};
    Object.keys(row || {}).forEach(k => {
      const clean = k.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      cleanKeys[clean] = row[k];
    });

    const id = cleanKeys['instrumento'] || cleanKeys['tag'] || cleanKeys['id'] || cleanKeys['codigo'] || 'INST_DESCONHECIDO';
    const tipo = (cleanKeys['tipo'] || (id.startsWith('INA') ? 'INA' : (id.startsWith('PZ') ? 'PZ' : (id.startsWith('VT') ? 'VT' : 'OUTRO')))).toUpperCase();
    const estrutura = (cleanKeys['estrutura'] || cleanKeys['barragem'] || cleanKeys['unidade'] || 'COMPLEXO_GERAL').toUpperCase();

    return {
      id,
      uid: `${estrutura}_${id}`,
      estrutura,
      tipo,
      descricao: cleanKeys['descricao'] || `${tipo} ${id}`,
      cotaBoca: Number(cleanKeys['cota_boca'] || cleanKeys['cota boca'] || cleanKeys['cota topo'] || 0),
      cotaFundo: Number(cleanKeys['cota_fundo'] || cleanKeys['cota fundo'] || 0),
      profundidadeTotal: Number(cleanKeys['profundidade'] || cleanKeys['profundidade total'] || 0),
      limiteAtencao: Number(cleanKeys['atencao'] || cleanKeys['limite atencao'] || cleanKeys['alerta'] || 0),
      limiteEmergencia: Number(cleanKeys['emergencia'] || cleanKeys['limite emergencia'] || 0),
      secao: cleanKeys['secao'] || cleanKeys['eixo'] || 'Geral',
      bacia: cleanKeys['bacia'] || 'Geral',
      lat: Number(cleanKeys['latitude'] || cleanKeys['lat'] || 0),
      lon: Number(cleanKeys['longitude'] || cleanKeys['lon'] || cleanKeys['long'] || 0),
      statusCalculado: 'NORMAL',
      origemIntegracao: 'EMPRESA_PCMI_EXCEL'
    };
  },

  /**
   * Testa conexão com API REST corporativa
   */
  async testCompanyApiConnection(url, token) {
    const endpoint = (url || this.getConfig().baseUrl || '').replace(/\/+$/, '');
    if (!endpoint) {
      throw new Error('URL da API da empresa não fornecida.');
    }

    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    try {
      const pingUrl = `${endpoint}/health` || `${endpoint}/status` || endpoint;
      const res = await fetch(pingUrl, { method: 'GET', headers });
      return {
        ok: res.ok,
        status: res.status,
        message: res.ok ? 'Conexão com a API corporativa estabelecida com sucesso!' : `Erro na API: HTTP ${res.status}`
      };
    } catch (err) {
      return {
        ok: false,
        error: err.message,
        message: `Não foi possível conectar ao servidor corporativo: ${err.message}`
      };
    }
  },

  /**
   * Exporta todo o banco de dados atual do sistema para backup em JSON
   */
  exportFullDatabaseJson(geotechDataContext) {
    const backup = {
      exportadoEm: new Date().toISOString(),
      versaoMDSync: '2.0.0-PROD',
      estruturas: geotechDataContext?.structures || [],
      instrumentos: geotechDataContext?.instruments || [],
      leiturasPiezometricas: geotechDataContext?.readingsPiezometria || [],
      leiturasVazao: geotechDataContext?.readingsVazao || [],
      pluviometria: geotechDataContext?.pluviometria || [],
      anomalias: geotechDataContext?.anomalies || [],
      contratosTerceiros: geotechDataContext?.contratosTerceiros || [],
      ordensServico: geotechDataContext?.ordensServico || [],
      fluigTickets: geotechDataContext?.fluigTickets || []
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mdsync_backup_geotecnia_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return backup;
  }
};

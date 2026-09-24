import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { aiGeotechService } from '../services/aiGeotechService';

const GeotechDataContext = createContext(null);

export const GeotechDataProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [masterData, setMasterData] = useState(null);

  const [structures, setStructures] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [readingsPiezometria, setReadingsPiezometria] = useState([]);
  const [readingsVazao, setReadingsVazao] = useState([]);
  const [readingsVertedouro, setReadingsVertedouro] = useState([]);
  const [pluviometria, setPluviometria] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [vehicleChecklists, setVehicleChecklists] = useState([]);
  const [fluigTickets, setFluigTickets] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [contratosTerceiros, setContratosTerceiros] = useState([]);
  const [ordensServico, setOrdensServico] = useState([]);
  const [coletas, setColetas] = useState([]);
  const [lotesRelatorios, setLotesRelatorios] = useState([]);
  const [importacoesPcmi, setImportacoesPcmi] = useState([]);
  const [limites, setLimites] = useState({});
  const [anomaliasGeotecnicas, setAnomaliasGeotecnicas] = useState(() => storageService.getAnomaliasGeotecnicas());
  const [inspecoesGeotecnicas, setInspecoesGeotecnicas] = useState(() => storageService.getInspecoesGeotecnicas());
  const [planosAcao, setPlanosAcao] = useState(() => storageService.getPlanosAcao());
  const [documentosEstruturas, setDocumentosEstruturas] = useState(() => storageService.getDocumentosEstruturas());
  const [comunicadosOperacionais, setComunicadosOperacionais] = useState(() => storageService.getComunicadosOperacionais());

  const [activeStructureId, setActiveStructureId] = useState(() => storageService.getActiveStructure());
  
  // Status de Rede & Simulação Offline
  const [realOnline, setRealOnline] = useState(navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const isOnline = realOnline && !simulatedOffline;

  // Fila Offline e Toasts do Sistema
  const [offlineQueue, setOfflineQueue] = useState(() => storageService.getOfflineQueue());
  const [systemToast, setSystemToast] = useState(null); // { message, type: 'info'|'success'|'warning'|'error' }

  // Atualizar fila quando evento for emitido
  useEffect(() => {
    const handleQueueChange = () => {
      setOfflineQueue(storageService.getOfflineQueue());
    };
    window.addEventListener('mdsync:queue-changed', handleQueueChange);
    return () => window.removeEventListener('mdsync:queue-changed', handleQueueChange);
  }, []);

  // Monitorar eventos reais de conexão
  useEffect(() => {
    const handleOnline = () => {
      setRealOnline(true);
      triggerAutoSyncIfPending();
    };
    const handleOffline = () => {
      setRealOnline(false);
      showToast('Conexão perdida. Modo Offline ativado: leituras serão salvas na fila.', 'warning');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (message, type = 'info', duration = 4000) => {
    setSystemToast({ message, type });
    if (duration > 0) {
      setTimeout(() => {
        setSystemToast(prev => (prev?.message === message ? null : prev));
      }, duration);
    }
  };

  // Alternar simulação offline
  const toggleSimulatedOffline = () => {
    const willBeOffline = !simulatedOffline;
    setSimulatedOffline(willBeOffline);
    if (willBeOffline) {
      showToast('Modo Offline Forçado (Simulação de Campo). Coletas serão enfileiradas.', 'warning');
    } else {
      showToast('Conexão restabelecida! Iniciando sincronização automática...', 'info');
      setTimeout(() => {
        triggerAutoSyncIfPending();
      }, 500);
    }
  };

  // Sincronização Automática ao restabelecer internet
  const triggerAutoSyncIfPending = async () => {
    const q = storageService.getOfflineQueue();
    if (q.length > 0) {
      try {
        const res = await storageService.syncOfflineQueue();
        setOfflineQueue([]);
        showToast(`Sincronização automática concluída com sucesso! ${res.count} item(ns) salvos no banco mestre.`, 'success', 5000);
      } catch (err) {
        showToast(`Erro na sincronização automática: ${err.message}`, 'error');
      }
    } else {
      showToast('Conexão restabelecida. Banco de dados sincronizado.', 'success');
    }
  };

  // Sincronização Manual da Fila
  const syncOfflineQueue = async () => {
    try {
      const res = await storageService.syncOfflineQueue();
      setOfflineQueue([]);
      showToast(`Sincronização manual concluída: ${res.count} item(ns) sincronizados com sucesso.`, 'success');
      return res;
    } catch (err) {
      showToast(`Erro ao sincronizar: ${err.message}`, 'error');
      throw err;
    }
  };

  // Carregar dados mestre de data/geotech_master.json com suporte robusto a SPA, GitHub Pages e Capacitor
  const loadMasterDatabase = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.BASE_URL || './';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
      const candidates = [
        `${cleanBase}data/geotech_master.json`,
        './data/geotech_master.json',
        '/data/geotech_master.json',
        'data/geotech_master.json'
      ];

      let validData = null;
      for (const url of candidates) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && (contentType.includes('application/json') || url.endsWith('.json'))) {
            const parsed = await res.json();
            if (parsed && (parsed.instrumentos || parsed.estruturas)) {
              validData = parsed;
              break;
            }
          }
        } catch (e) {
          // tentar próximo candidato
        }
      }

      if (data) {
        try {
          const lightweightCache = {
            ...data,
            leiturasPiezometricas: (data.leiturasPiezometricas || []).slice(-1000),
            leiturasVertedouro: (data.leiturasVertedouro || []).slice(-500)
          };
          localStorage.setItem('mdsync_cached_master_data', JSON.stringify(lightweightCache));
        } catch (storageErr) {
          console.warn('Aviso: Armazenamento local indisponível para cache offline:', storageErr);
        }
      } else {
        const cached = localStorage.getItem('mdsync_cached_master_data');
        if (cached) {
          data = JSON.parse(cached);
        } else {
          throw new Error('Falha ao carregar banco de dados geotécnico: JSON não encontrado.');
        }
      }
      setMasterData(data);
        const enrichedStructures = (data.estruturas || []).map(s => {
          let categoria = s.categoria;
          if (!categoria) {
            const upper = (s.nome || s.id || '').toUpperCase();
            if (upper.includes('BARRAGEM') || upper.includes('DIQUE')) categoria = 'Barragens';
            else if (upper.includes('PDE') || upper.includes('PILHA')) categoria = 'Pilhas';
            else if (upper.includes('CAVA') || upper.includes('JANGADA') || upper.includes('ENGENHO')) categoria = 'Cavas';
            else categoria = 'Taludes';
          }
          return { ...s, categoria };
        });
        setStructures(enrichedStructures);
        setLimites(data.limites || {});
        setReadingsPiezometria(data.leiturasPiezometricas || []);
        setReadingsVazao(data.leiturasVazao || []);
        setReadingsVertedouro(data.leiturasVertedouro || []);
        setPluviometria(data.pluviometria || []);

        // Mesclar instrumentos com leituras locais salvas
        const localReadings = storageService.getLocalReadings();
        const localAnomalies = storageService.getLocalAnomalies();

        let updatedInstruments = [...(data.instrumentos || [])];
        localReadings.forEach(local => {
          const idx = updatedInstruments.findIndex(i => i.uid === local.uid || (i.estrutura === local.estrutura && i.id === local.id));
          if (idx !== -1) {
            const evalResult = aiGeotechService.evaluateInstrument(updatedInstruments[idx], local.valor);
            updatedInstruments[idx] = {
              ...updatedInstruments[idx],
              ultimaCota: evalResult.cotaCalculada || local.valor,
              ultimaData: local.data || new Date().toISOString().split('T')[0],
              statusCalculado: evalResult.status
            };
          }
        });
        setInstruments(updatedInstruments);
        setAnomalies([...localAnomalies, ...(data.anomalias || [])]);

        const localChecklists = storageService.getLocalChecklists();
        setChecklists([...localChecklists, ...(data.checklists || [])]);

        const localVehicleChecklists = storageService.getLocalVehicleChecklists();
        setVehicleChecklists([...localVehicleChecklists, ...(data.checklistsVeiculares || [])]);

        const localFluig = storageService.getFluigTickets();
        setFluigTickets([...localFluig, ...(data.chamadosFluig || [])]);

        const localClientes = storageService.getClientes();
        setClientes([...localClientes, ...(data.clientes || [])]);

        const localContratos = storageService.getContratos();
        setContratosTerceiros([...localContratos, ...(data.contratosTerceiros || [])]);

        const localOS = storageService.getOrdensServico();
        setOrdensServico([...localOS, ...(data.ordensServico || [])]);

        const localColetas = storageService.getColetas();
        setColetas([...localColetas, ...(data.coletas || [])]);

        const localLotes = storageService.getLotesRelatorios();
        setLotesRelatorios([...localLotes, ...(data.lotesRelatorios || [])]);

        setImportacoesPcmi(data.importacoesPcmi || []);
      } catch (err) {
        console.error('Erro carregando dados mestres:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadMasterDatabase();
    }, []);

  // Salvar estrutura ativa
  const selectStructure = (structId) => {
    setActiveStructureId(structId);
    storageService.setActiveStructure(structId);
  };

  // Adicionar Leitura de Campo (suporta online e offline)
  const addReading = (readingData) => {
    const readingWithSyncStatus = {
      ...readingData,
      sincronizado: isOnline
    };

    // Salvar localmente
    const saved = storageService.saveLocalReading(readingWithSyncStatus);
    if (!saved) return null;

    // Se estiver offline, enfileirar para sincronização posterior
    if (!isOnline) {
      storageService.addToOfflineQueue({
        type: 'reading',
        ...readingWithSyncStatus,
        descricao: `Leitura ${readingData.tipo}-${readingData.id} (${readingData.valor} m)`
      });
      showToast(`Leitura salva na fila offline! Será sincronizada quando a conexão retornar.`, 'info');
    } else {
      showToast(`Leitura de ${readingData.tipo}-${readingData.id} transmitida com sucesso!`, 'success');
    }

    // Atualizar instrumento em memória
    setInstruments(prev => {
      return prev.map(inst => {
        if (inst.uid === readingData.uid || (inst.estrutura === readingData.estrutura && inst.id === readingData.id && inst.tipo === readingData.tipo)) {
          const evalResult = aiGeotechService.evaluateInstrument(inst, readingData.valor);
          return {
            ...inst,
            ultimaLeituraPiu: (inst.tipo === 'INA' || inst.tipo === 'PZ') ? readingData.valor : inst.ultimaLeituraPiu,
            ultimaCota: evalResult.cotaCalculada || readingData.valor,
            ultimaData: readingData.data || new Date().toISOString().split('T')[0],
            statusCalculado: evalResult.status
          };
        }
        return inst;
      });
    });

    // Adicionar à lista de leituras apropriada
    const newEntry = {
      uid: readingData.uid,
      estrutura: readingData.estrutura,
      tipo: readingData.tipo,
      id: readingData.id,
      data: readingData.data || new Date().toISOString().split('T')[0],
      leitura: readingData.valor,
      cotaLeitura: readingData.cotaCalculada || readingData.valor,
      status: readingData.status || 'NORMAL',
      situacao: isOnline ? 'Campo Recente' : 'Salvo Offline (Pendente)',
      foto: readingData.foto || null,
      deltaCm: readingData.deltaPiuCm !== undefined ? readingData.deltaPiuCm : (readingData.deltaCm !== undefined ? readingData.deltaCm : null),
      deltaPiuCm: readingData.deltaPiuCm !== undefined ? readingData.deltaPiuCm : null,
      coordenadas: readingData.coordenadas || null,
      observacoes: readingData.observacoes || '',
      responsavel: readingData.responsavel || 'Técnico de Campo',
      sincronizado: isOnline
    };

    if (readingData.tipo === 'INA' || readingData.tipo === 'PZ') {
      setReadingsPiezometria(prev => [newEntry, ...prev]);
    } else if (readingData.tipo === 'MV') {
      setReadingsVazao(prev => [newEntry, ...prev]);
    } else if (readingData.tipo === 'VT') {
      setReadingsVertedouro(prev => [newEntry, ...prev]);
    }

    return saved;
  };

  // Adicionar Anomalia de Campo
  const addAnomaly = (anomalyData) => {
    const anomalyWithSyncStatus = {
      ...anomalyData,
      sincronizado: isOnline
    };

    const saved = storageService.saveLocalAnomaly(anomalyWithSyncStatus);
    if (saved) {
      setAnomalies(prev => [saved, ...prev]);
      if (!isOnline) {
        storageService.addToOfflineQueue({
          type: 'anomaly',
          ...anomalyWithSyncStatus,
          descricao: `Anomalia ${anomalyData.tipo} em ${anomalyData.estrutura}`
        });
        showToast(`Anomalia registrada na fila offline.`, 'info');
      } else {
        showToast(`Anomalia registrada e transmitida com sucesso!`, 'warning');
      }
    }
    return saved;
  };

  // Adicionar Checklist de Inspeção Regular (Survey123 FIR)
  const addChecklist = (checklistData) => {
    const checklistWithSyncStatus = {
      ...checklistData,
      sincronizado: isOnline
    };

    const saved = storageService.saveLocalChecklist(checklistWithSyncStatus);
    if (saved) {
      setChecklists(prev => [saved, ...prev.filter(c => c.id !== saved.id)]);
      if (!isOnline) {
        storageService.addToOfflineQueue({
          type: 'checklist',
          ...checklistWithSyncStatus,
          descricao: `Checklist FIR - ${checklistData.estrutura} (${checklistData.classificacaoGeral || 'Normal'})`
        });
        showToast('Checklist salvo na fila offline! Será sincronizado quando a conexão retornar.', 'info');
      } else {
        showToast(`Checklist FIR de ${checklistData.estrutura} registrado com sucesso!`, 'success');
      }
      return saved;
    }
    return null;
  };

  // Excluir Checklist
  const deleteChecklist = (id) => {
    storageService.deleteLocalChecklist(id);
    setChecklists(prev => prev.filter(c => c.id !== id));
    showToast('Checklist removido.', 'info');
  };

  // Adicionar Checklist Veicular (Survey123 Frota Diário)
  const addVehicleChecklist = (vehicleData) => {
    const dataWithSyncStatus = {
      ...vehicleData,
      sincronizado: isOnline
    };

    const saved = storageService.saveLocalVehicleChecklist(dataWithSyncStatus);
    if (saved) {
      setVehicleChecklists(prev => [saved, ...prev.filter(c => c.id !== saved.id)]);
      if (!isOnline) {
        storageService.addToOfflineQueue({
          type: 'vehicle_checklist',
          ...dataWithSyncStatus,
          descricao: `Checklist Veicular - Placa ${vehicleData.placa} (${vehicleData.status || 'LIBERADO'})`
        });
        showToast('Checklist veicular salvo na fila offline! Sincronizará ao retornar conexão.', 'info');
      } else {
        showToast(`Checklist veicular da placa ${vehicleData.placa} registrado com sucesso!`, 'success');
      }
      return saved;
    }
    return null;
  };

  // Excluir Checklist Veicular
  const deleteVehicleChecklist = (id) => {
    storageService.deleteLocalVehicleChecklist(id);
    setVehicleChecklists(prev => prev.filter(c => c.id !== id));
    showToast('Checklist veicular removido.', 'info');
  };

  // Gerenciamento de Chamados Fluig (BPM & Anomalias)
  const addFluigTicket = (ticketData) => {
    const ticketWithSyncStatus = {
      ...ticketData,
      sincronizado: isOnline
    };

    const saved = storageService.saveFluigTicket(ticketWithSyncStatus);
    if (saved) {
      setFluigTickets(prev => [saved, ...prev.filter(t => t.id !== saved.id)]);
      if (!isOnline) {
        storageService.addToOfflineQueue({
          type: 'fluig_ticket',
          ...ticketWithSyncStatus,
          descricao: `Chamado Fluig ${saved.protocolo}: ${ticketData.titulo} (${ticketData.setorResponsavel})`
        });
        showToast(`Chamado ${saved.protocolo} gravado na fila offline. Sincronizará com o Fluig ao reconectar.`, 'info');
      } else {
        showToast(`Chamado ${saved.protocolo} aberto no Fluig com sucesso e encaminhado ao setor!`, 'success');
      }
      return saved;
    }
    return null;
  };

  const updateFluigTicket = (id, updates) => {
    const updated = storageService.updateFluigTicket(id, updates);
    if (updated) {
      setFluigTickets(prev => prev.map(t => (t.id === id || t.protocolo === id) ? updated : t));
      showToast(`Chamado ${updated.protocolo} atualizado no Fluig.`, 'info');
      return updated;
    }
    return null;
  };

  const deleteFluigTicket = (id) => {
    storageService.deleteFluigTicket(id);
    setFluigTickets(prev => prev.filter(t => t.id !== id && t.protocolo !== id));
    showToast('Chamado removido do registro local.', 'info');
  };

  // Coletas (Inspect)
  const addColeta = (coletaData) => {
    const saved = storageService.saveColeta(coletaData);
    if (saved) {
      setColetas(prev => [saved, ...prev.filter(c => c.id !== saved.id)]);
      showToast(`Coleta ${saved.codigoColeta || saved.id} registrada com sucesso!`, 'success');
      return saved;
    }
    return null;
  };

  const updateColeta = (id, updates) => {
    const updated = storageService.updateColeta(id, updates);
    if (updated) {
      setColetas(prev => prev.map(c => c.id === id ? updated : c));
      showToast(`Coleta atualizada.`, 'info');
      return updated;
    }
    return null;
  };

  const deleteColeta = (id) => {
    storageService.deleteColeta(id);
    setColetas(prev => prev.filter(c => c.id !== id));
    showToast('Coleta excluída.', 'info');
  };

  // Ordens de Serviço
  const addOrdemServico = (osData) => {
    const saved = storageService.saveOrdemServico(osData);
    if (saved) {
      setOrdensServico(prev => [saved, ...prev.filter(o => o.id !== saved.id)]);
      showToast(`Ordem de Serviço ${saved.numeroOS || saved.id} aberta com sucesso!`, 'success');
      return saved;
    }
    return null;
  };

  const updateOrdemServico = (id, updates) => {
    const updated = storageService.updateOrdemServico(id, updates);
    if (updated) {
      setOrdensServico(prev => prev.map(o => o.id === id ? updated : o));
      showToast(`Ordem de Serviço atualizada.`, 'info');
      return updated;
    }
    return null;
  };

  // Contratos de Empresas Terceiras
  const addContratoTerceiro = (contratoData) => {
    const saved = storageService.saveContrato(contratoData);
    if (saved) {
      setContratosTerceiros(prev => [saved, ...prev.filter(c => c.id !== saved.id)]);
      showToast(`Contrato cadastrado com sucesso!`, 'success');
      return saved;
    }
    return null;
  };

  // Clientes
  const addCliente = (clienteData) => {
    const saved = storageService.saveCliente(clienteData);
    if (saved) {
      setClientes(prev => [saved, ...prev.filter(c => c.id !== saved.id)]);
      showToast(`Cliente cadastrado com sucesso!`, 'success');
      return saved;
    }
    return null;
  };

  // Lotes de Relatórios
  const addLoteRelatorio = (loteData) => {
    const saved = storageService.saveLoteRelatorios(loteData);
    if (saved) {
      setLotesRelatorios(prev => [saved, ...prev.filter(l => l.id !== saved.id)]);
      showToast(`Lote ${saved.titulo || saved.id} gerado e salvo com sucesso!`, 'success');
      return saved;
    }
    return null;
  };

  const deleteLoteRelatorio = (id) => {
    const success = storageService.deleteLoteRelatorio(id);
    if (success) {
      setLotesRelatorios(prev => prev.filter(l => l.id !== id));
      showToast('Lote de relatório removido com sucesso.', 'info');
      return true;
    }
    return false;
  };

  // Funções Sentnel (Anomalias, Inspeções, Planos de Ação, Documentos, Feed)
  const addAnomaliaGeotecnica = (anomalia) => {
    const saved = storageService.saveAnomaliaGeotecnica(anomalia);
    if (saved) {
      setAnomaliasGeotecnicas(prev => [saved, ...prev.filter(a => a.id !== saved.id)]);
      showToast(`Anomalia ${saved.codigo} registrada com sucesso.`, 'success');
      return saved;
    }
    return null;
  };

  const updateAnomaliaGeotecnica = (id, updates) => {
    const updated = storageService.updateAnomaliaGeotecnica(id, updates);
    if (updated) {
      setAnomaliasGeotecnicas(prev => prev.map(a => a.id === id ? updated : a));
      showToast('Anomalia atualizada com sucesso.', 'info');
      return updated;
    }
    return null;
  };

  const addInspecaoGeotecnica = (inspecao) => {
    const saved = storageService.saveInspecaoGeotecnica(inspecao);
    if (saved) {
      setInspecoesGeotecnicas(prev => [saved, ...prev.filter(i => i.id !== saved.id)]);
      showToast(`Inspeção ${saved.id} registrada com sucesso.`, 'success');
      return saved;
    }
    return null;
  };

  const addPlanoAcao = (plano) => {
    const saved = storageService.savePlanoAcao(plano);
    if (saved) {
      setPlanosAcao(prev => [saved, ...prev.filter(p => p.id !== saved.id)]);
      showToast(`Plano de Ação ${saved.id} criado com sucesso.`, 'success');
      return saved;
    }
    return null;
  };

  const updatePlanoAcao = (id, updates) => {
    const updated = storageService.updatePlanoAcao(id, updates);
    if (updated) {
      setPlanosAcao(prev => prev.map(p => p.id === id ? updated : p));
      showToast('Plano de Ação atualizado com sucesso.', 'info');
      return updated;
    }
    return null;
  };

  const addDocumentoEstrutura = (doc) => {
    const saved = storageService.saveDocumentoEstrutura(doc);
    if (saved) {
      setDocumentosEstruturas(prev => [saved, ...prev.filter(d => d.id !== saved.id)]);
      showToast(`Documento ${saved.titulo} arquivado com sucesso.`, 'success');
      return saved;
    }
    return null;
  };

  const addComunicadoOperacional = (com) => {
    const saved = storageService.saveComunicadoOperacional(com);
    if (saved) {
      setComunicadosOperacionais(prev => [saved, ...prev.filter(c => c.id !== saved.id)]);
      showToast('Comunicado publicado no feed operacional.', 'success');
      return saved;
    }
    return null;
  };

  // Instrumentos filtrados pela estrutura ativa
  const filteredInstruments = activeStructureId === 'TODAS'
    ? instruments
    : instruments.filter(i => i.estrutura.replace(/\s+/g, '_') === activeStructureId || i.estrutura === activeStructureId);

  // Estatísticas calculadas dinamicamente
  const stats = {
    totalEstruturas: structures.length,
    totalInstrumentos: instruments.length,
    normais: instruments.filter(i => i.statusCalculado === 'NORMAL').length,
    atencao: instruments.filter(i => i.statusCalculado === 'ATENÇÃO').length,
    alerta: instruments.filter(i => i.statusCalculado === 'ALERTA').length,
    emergencia: instruments.filter(i => i.statusCalculado === 'EMERGÊNCIA').length,
    anomaliasAbertas: anomaliasGeotecnicas.filter(a => a.status !== 'Mitigada / Fechada').length,
    inspecoesPendentes: inspecoesGeotecnicas.filter(i => i.status === 'Agendada').length,
    planosAcaoAtivos: planosAcao.filter(p => p.status !== 'Concluído').length,
    chuva7Dias: pluviometria.length > 0 ? (pluviometria[pluviometria.length - 1].acumulado7Dias || 0) : 0
  };

  return (
    <GeotechDataContext.Provider value={{
      loading,
      error,
      masterData,
      structures,
      instruments,
      filteredInstruments,
      activeStructureId,
      selectStructure,
      readingsPiezometria,
      readingsVazao,
      readingsVertedouro,
      pluviometria,
      anomalies,
      checklists,
      vehicleChecklists,
      fluigTickets,
      clientes,
      contratosTerceiros,
      ordensServico,
      coletas,
      lotesRelatorios,
      importacoesPcmi,
      limites,
      stats,
      anomaliasGeotecnicas,
      inspecoesGeotecnicas,
      planosAcao,
      documentosEstruturas,
      comunicadosOperacionais,
      addAnomaliaGeotecnica,
      updateAnomaliaGeotecnica,
      addInspecaoGeotecnica,
      addPlanoAcao,
      updatePlanoAcao,
      addDocumentoEstrutura,
      addComunicadoOperacional,
      isOnline,
      simulatedOffline,
      toggleSimulatedOffline,
      offlineQueue,
      offlineCount: offlineQueue.length,
      syncOfflineQueue,
      systemToast,
      setSystemToast,
      showToast,
      addReading,
      addAnomaly,
      addChecklist,
      deleteChecklist,
      addVehicleChecklist,
      deleteVehicleChecklist,
      addFluigTicket,
      updateFluigTicket,
      deleteFluigTicket,
      addColeta,
      updateColeta,
      deleteColeta,
      addOrdemServico,
      updateOrdemServico,
      addContratoTerceiro,
      addCliente,
      addLoteRelatorio,
      deleteLoteRelatorio,
      refreshMasterData: loadMasterDatabase,
      exportCorporatePackage: () => {
        const pkg = storageService.exportCorporateStagingPackage();
        storageService.downloadCorporateStagingPackage(pkg);
        return pkg;
      }
    }}>
      {children}
    </GeotechDataContext.Provider>
  );
};

export const useGeotechData = () => {
  const context = useContext(GeotechDataContext);
  if (!context) {
    throw new Error('useGeotechData deve ser usado dentro de um GeotechDataProvider');
  }
  return context;
};

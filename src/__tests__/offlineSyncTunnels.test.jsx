// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { storageService } from '../services/storageService';
import { indexedDBStorage } from '../services/indexedDBStorage';
import { ImportacoesTab } from '../components/ImportacoesTab';
import { SyncQueueTab } from '../components/SyncQueueTab';
import { GeotechDataProvider } from '../context/GeotechDataContext';
import { AuthProvider } from '../context/AuthContext';

describe('Offline Synchronization & Connection Tunnels Suite', () => {
  let container, root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    globalThis.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ estruturas: [], instrumentos: [], importacoesPcmi: [] })
      });
    });
  });

  afterAll(() => {
    act(() => root.unmount());
    container.remove();
  });

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('storageService.addToOfflineQueue creates enriched item, saves to queue and dispatches event', () => {
    const queueEventSpy = vi.fn();
    window.addEventListener('mdsync:queue-changed', queueEventSpy);

    const item = {
      type: 'reading',
      tipo: 'INA',
      id: 'INA-B1-99',
      estrutura: 'BARRAGEM B1',
      valor: 852.35,
      origem: 'App Campo / APK'
    };

    const queued = storageService.addToOfflineQueue(item);

    expect(queued).not.toBeNull();
    expect(queued.queueId).toBeDefined();
    expect(queued.timestamp).toBeDefined();
    expect(queued.dataHoraFila).toBeDefined();
    expect(queued.sincronizado).toBe(false);

    const queue = storageService.getOfflineQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].id).toBe('INA-B1-99');
    expect(queueEventSpy).toHaveBeenCalled();

    window.removeEventListener('mdsync:queue-changed', queueEventSpy);
  });

  it('storageService.removeFromOfflineQueue and clearOfflineQueue correctly purge items', () => {
    const item1 = storageService.addToOfflineQueue({ type: 'reading', id: 'INA-01', valor: 850 });
    const item2 = storageService.addToOfflineQueue({ type: 'anomaly', id: 'ANOM-01', severidade: 'ALERTA' });

    expect(storageService.getOfflineQueue().length).toBe(2);

    storageService.removeFromOfflineQueue(item1.queueId);
    expect(storageService.getOfflineQueue().length).toBe(1);
    expect(storageService.getOfflineQueue()[0].id).toBe('ANOM-01');

    storageService.clearOfflineQueue();
    expect(storageService.getOfflineQueue().length).toBe(0);
  });

  it('storageService.syncOfflineQueue processes all field collection types into local databases', async () => {
    // Adicionar vários tipos coletados offline
    storageService.addToOfflineQueue({
      type: 'reading',
      tipo: 'INA',
      id: 'INA-TEST-01',
      estrutura: 'BARRAGEM B1',
      valor: 854.10
    });
    storageService.addToOfflineQueue({
      type: 'coleta',
      codigoColeta: 'COL-TEST-02',
      estrutura: 'BARRAGEM B4'
    });
    storageService.addToOfflineQueue({
      type: 'estrutura',
      sigla: 'NOVA_ESTRUTURA_TEST',
      nome: 'Estrutura Campo Teste',
      tipo: 'Barragem de Rejeitos'
    });

    expect(storageService.getOfflineQueue().length).toBe(3);

    const syncResult = await storageService.syncOfflineQueue();

    expect(syncResult.count).toBe(3);
    expect(storageService.getOfflineQueue().length).toBe(0);

    // Verificar se a estrutura foi persistida
    const estruturas = storageService.getEstruturasEmpreendimento();
    const foundEstrutura = estruturas.find(e => e.sigla === 'NOVA_ESTRUTURA_TEST');
    expect(foundEstrutura).toBeDefined();

    // Verificar se a leitura foi persistida
    const readings = storageService.getLocalReadings();
    const foundReading = readings.find(r => r.id === 'INA-TEST-01');
    expect(foundReading).toBeDefined();
    expect(foundReading.sincronizado).toBe(true);
  });

  it('storageService.exportContingencyPackage returns structured package for offline field handoff', () => {
    storageService.addToOfflineQueue({ type: 'reading', id: 'INA-B1-02', valor: 851.20 });

    const pkg = storageService.exportContingencyPackage();
    expect(pkg.tipo).toBe('PACOTE_CONTINGENCIA_OFFLINE_MDSYNC');
    expect(pkg.versaoApp).toBeDefined();
    expect(pkg.totalItens).toBe(1);
    expect(pkg.itensFila.length).toBe(1);
  });

  it('storageService.saveImportacaoPcmi and getImportacoesPcmi manage PCMI sync history', () => {
    const record = storageService.saveImportacaoPcmi({
      tipo: 'Planilha Campo Teste',
      origem: 'C:\\Teste\\Coletas.xlsx',
      registrosImportados: 45
    });

    expect(record.id).toBeDefined();
    expect(record.status).toBe('CONCLUIDO');

    const history = storageService.getImportacoesPcmi();
    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[0].tipo).toBe('Planilha Campo Teste');
  });

  it('ImportacoesTab mounts and renders all 4 connection tunnels including the field/APK tunnel', async () => {
    await act(async () => {
      root.render(
        <AuthProvider>
          <GeotechDataProvider>
            <ImportacoesTab />
          </GeotechDataProvider>
        </AuthProvider>
      );
    });

    const text = container.textContent;

    // Título da aba
    expect(text).toContain('Importações & Integração de Diretórios (PCMI)');

    // 4 túneis de conexão
    expect(text).toContain('Diretório Primário PCMI');
    expect(text).toContain('Diretório JGD Jangada');
    expect(text).toContain('SUMPs & Drenagem (GUT)');
    expect(text).toContain('Túnel de Campo (App/APK)');

    // Painel central de fila de campo
    expect(text).toContain('Fila de Sincronização de Campo (Aguardando Conexão)');

    // Área de inputs/outputs
    expect(text).toContain('Entradas & Saídas de Telemetria e Coletas');
    expect(text).toContain('Baixar Modelo (.csv)');
    expect(text).toContain('Exportar Backup Master (.json)');
  });

  it('storageService.getStagedBatchesHistory returns empty array initially and returns records after export', () => {
    expect(storageService.getStagedBatchesHistory()).toEqual([]);

    const pkg = storageService.exportCorporateStagingPackage([{
      type: 'reading',
      id: 'PZ-01',
      valor: 820.5
    }]);

    expect(pkg.batchId).toBeDefined();
    const history = storageService.getStagedBatchesHistory();
    expect(history.length).toBe(1);
    expect(history[0].batchId).toBe(pkg.batchId);
  });

  it('SyncQueueTab mounts cleanly without throwing getStagedBatchesHistory is not a function', async () => {
    await act(async () => {
      root.render(
        <AuthProvider>
          <GeotechDataProvider>
            <SyncQueueTab />
          </GeotechDataProvider>
        </AuthProvider>
      );
    });

    const text = container.textContent;
    expect(text).toContain('Fila de Sincronização');
    expect(text).toContain('Lotes Recentes Prontos para Ingestão');
  });
});

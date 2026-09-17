import React, { useState } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { storageService } from '../services/storageService';
import { 
  X, 
  CloudOff, 
  CloudLightning, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  FileText, 
  Camera, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const SyncQueueModal = ({ isOpen, onClose }) => {
  const { 
    offlineQueue, 
    syncOfflineQueue, 
    isOnline, 
    simulatedOffline, 
    toggleSimulatedOffline 
  } = useGeotechData();

  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(null);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    if (!isOnline) {
      alert('Você está offline no momento. Restabeleça a conexão ou desative o modo offline simulado para sincronizar.');
      return;
    }
    try {
      setSyncing(true);
      setSyncSuccess(null);
      const res = await syncOfflineQueue();
      setSyncSuccess(`Sucesso! ${res.count} item(ns) sincronizado(s) com a nuvem central.`);
      setTimeout(() => {
        setSyncSuccess(null);
        onClose();
      }, 1500);
    } catch (err) {
      alert(`Falha na sincronização: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleRemoveItem = (queueId) => {
    if (confirm('Deseja realmente remover esta coleta da fila offline?')) {
      storageService.removeFromOfflineQueue(queueId);
    }
  };

  const handleClearAll = () => {
    if (confirm('Atenção: deseja descartar todas as coletas da fila offline? Esta ação não pode ser desfeita.')) {
      storageService.clearOfflineQueue();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content glass-panel"
        style={{
          maxWidth: '680px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          borderRadius: '16px',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: 'var(--bg-surface)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: offlineQueue.length > 0 ? 'var(--geo-atencao-bg)' : 'var(--geo-normal-bg)',
              color: offlineQueue.length > 0 ? 'var(--geo-atencao)' : 'var(--geo-normal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${offlineQueue.length > 0 ? 'var(--geo-atencao-border)' : 'var(--geo-normal-border)'}`
            }}>
              {offlineQueue.length > 0 ? <CloudOff size={22} /> : <CloudLightning size={22} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Fila de Sincronização Offline
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {offlineQueue.length} registro(s) pendente(s) de transmissão
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>

        {/* Barra de Status de Conexão e Simulação */}
        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          backgroundColor: isOnline ? 'var(--geo-normal-bg)' : 'var(--geo-atencao-bg)',
          border: `1px solid ${isOnline ? 'var(--geo-normal-border)' : 'var(--geo-atencao-border)'}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {isOnline ? (
              <Wifi size={18} style={{ color: 'var(--geo-normal)' }} />
            ) : (
              <WifiOff size={18} style={{ color: 'var(--geo-atencao)' }} />
            )}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isOnline ? 'var(--geo-normal)' : 'var(--geo-atencao)' }}>
                {isOnline ? 'Conexão Estabelecida (Online)' : 'Dispositivo Desconectado (Offline)'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {isOnline 
                  ? 'Pronto para sincronizar automaticamente com a nuvem central.' 
                  : 'Os dados coletados estão seguros no armazenamento local do navegador.'}
              </div>
            </div>
          </div>

          <button
            onClick={toggleSimulatedOffline}
            className="btn-secondary"
            style={{
              fontSize: '0.75rem',
              padding: '0.35rem 0.75rem',
              borderColor: isOnline ? 'var(--geo-atencao-border)' : 'var(--geo-normal-border)'
            }}
          >
            {simulatedOffline ? 'Restabelecer Conexão (Online)' : 'Simular Modo Offline de Campo'}
          </button>
        </div>

        {/* Mensagem de sucesso após sincronizar */}
        {syncSuccess && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'var(--geo-normal-bg)',
            color: 'var(--geo-normal)',
            border: '1px solid var(--geo-normal-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={18} />
            <span>{syncSuccess}</span>
          </div>
        )}

        {/* Lista de Itens na Fila */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
              Itens Aguardando Transmissão ({offlineQueue.length}):
            </span>
            {offlineQueue.length > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--geo-emergencia)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Descartar Fila
              </button>
            )}
          </div>

          {offlineQueue.length === 0 ? (
            <div style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '10px',
              border: '1px dashed var(--border-subtle)'
            }}>
              <CheckCircle2 size={36} style={{ color: 'var(--geo-normal)', margin: '0 auto 0.5rem' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Nenhum dado pendente de sincronização
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                Todas as leituras e anomalias de campo foram transmitidas com sucesso.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {offlineQueue.map((item) => (
                <div
                  key={item.queueId}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    {item.foto ? (
                      <img
                        src={item.foto}
                        alt="Evidência"
                        style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--primary-accent-bg)',
                        color: 'var(--primary-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <FileText size={18} />
                      </div>
                    )}

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {item.tipo ? `${item.tipo}-${item.id}` : (item.descricao || 'Item de Coleta')}
                        </span>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          backgroundColor: 'var(--primary-accent-bg)',
                          color: 'var(--primary-accent)'
                        }}>
                          {item.estrutura || 'Itaminas'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.valor !== undefined && (
                          <span>Leitura no Piu: <strong>{Number(item.valor).toFixed(2)} m</strong> • </span>
                        )}
                        <span>{item.dataHoraFila || 'Data local'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.queueId)}
                    className="btn-icon"
                    title="Excluir item da fila"
                    style={{ color: 'var(--text-faint)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--geo-emergencia)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-faint)'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão de Ação Principal */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1, padding: '0.75rem' }}
          >
            Fechar
          </button>

          <button
            onClick={handleSyncNow}
            disabled={offlineQueue.length === 0 || syncing || !isOnline}
            className="btn-primary"
            style={{
              flex: 2,
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: (offlineQueue.length === 0 || syncing || !isOnline) ? 0.6 : 1,
              cursor: (offlineQueue.length === 0 || syncing || !isOnline) ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={16} className={syncing ? 'spin-animation' : ''} />
            <span>
              {syncing 
                ? 'Transmitindo dados...' 
                : (!isOnline ? 'Offline (Reconecte para sincronizar)' : `Sincronizar Agora (${offlineQueue.length})`)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

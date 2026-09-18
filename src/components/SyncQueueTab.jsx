import React, { useState } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { storageService } from '../services/storageService';
import { 
  CloudOff, 
  CloudLightning, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  FileText, 
  Database,
  ArrowRight,
  ShieldCheck,
  HardDrive,
  Clock,
  Send,
  Camera,
  AlertTriangle,
  ClipboardEdit
} from 'lucide-react';

export const SyncQueueTab = ({ onNavigateTab }) => {
  const { 
    offlineQueue = [], 
    syncOfflineQueue, 
    isOnline, 
    simulatedOffline, 
    toggleSimulatedOffline 
  } = useGeotechData();

  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(null);

  const handleSyncNow = async () => {
    if (!isOnline) {
      alert('Você está offline no momento. Restabeleça a conexão ou desative o modo offline simulado para sincronizar.');
      return;
    }
    try {
      setSyncing(true);
      setSyncSuccess(null);
      const res = await syncOfflineQueue();
      setSyncSuccess(`Sucesso! ${res.count || offlineQueue.length} item(ns) sincronizado(s) com a nuvem central.`);
      setTimeout(() => {
        setSyncSuccess(null);
      }, 3500);
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
    <div className="tab-container" style={{ padding: '1.25rem 1.5rem 3rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* 1. CABEÇALHO DA ABA */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: offlineQueue.length > 0 ? 'var(--geo-atencao-bg)' : 'var(--geo-normal-bg)',
            color: offlineQueue.length > 0 ? 'var(--geo-atencao)' : 'var(--geo-normal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${offlineQueue.length > 0 ? 'var(--geo-atencao-border)' : 'var(--geo-normal-border)'}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            {offlineQueue.length > 0 ? <CloudOff size={24} /> : <CloudLightning size={24} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Fila de Sincronização Offline
              </h1>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.12rem 0.5rem',
                borderRadius: '9999px',
                backgroundColor: offlineQueue.length > 0 ? 'var(--geo-atencao-bg)' : 'var(--geo-normal-bg)',
                color: offlineQueue.length > 0 ? 'var(--geo-atencao)' : 'var(--geo-normal)',
                border: `1px solid ${offlineQueue.length > 0 ? 'var(--geo-atencao-border)' : 'var(--geo-normal-border)'}`
              }}>
                {offlineQueue.length} PENDENTE(S)
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Gestão de persistência local, auditoria de coletas em campo e sincronização com a nuvem central Itaminas.
            </p>
          </div>
        </div>

        {/* Ações Rápidas no Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {offlineQueue.length > 0 && (
            <button
              onClick={handleClearAll}
              className="btn-secondary"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: 'var(--geo-emergencia)',
                fontSize: '0.8rem',
                padding: '0.5rem 0.85rem'
              }}
              title="Descartar todos os itens da fila offline"
            >
              <Trash2 size={15} />
              <span>Descartar Fila</span>
            </button>
          )}

          <button
            onClick={handleSyncNow}
            disabled={offlineQueue.length === 0 || syncing || !isOnline}
            className="btn-primary"
            style={{
              padding: '0.5rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              opacity: (offlineQueue.length === 0 || syncing || !isOnline) ? 0.6 : 1,
              cursor: (offlineQueue.length === 0 || syncing || !isOnline) ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={16} className={syncing ? 'spin-animation' : ''} />
            <span>
              {syncing 
                ? 'Transmitindo dados...' 
                : (!isOnline ? 'Offline (Reconecte para Sincronizar)' : `Sincronizar Agora (${offlineQueue.length})`)}
            </span>
          </button>
        </div>
      </div>

      {/* 2. CARD DE STATUS DA CONEXÃO & SIMULADOR DE CAMPO */}
      <div style={{
        padding: '1.1rem 1.35rem',
        borderRadius: '12px',
        backgroundColor: isOnline ? 'var(--geo-normal-bg)' : 'var(--geo-atencao-bg)',
        border: `1px solid ${isOnline ? 'var(--geo-normal-border)' : 'var(--geo-atencao-border)'}`,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isOnline ? (
              <Wifi size={20} style={{ color: 'var(--geo-normal)' }} />
            ) : (
              <WifiOff size={20} style={{ color: 'var(--geo-atencao)' }} />
            )}
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: isOnline ? 'var(--geo-normal)' : 'var(--geo-atencao)' }}>
              {isOnline ? 'Conexão Estabelecida (Online)' : 'Dispositivo Desconectado (Modo Offline Ativo)'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {isOnline 
                ? 'Pronto para sincronizar automaticamente com a nuvem central e banco de dados corporativo.' 
                : 'Os dados coletados em campo estão salvos com segurança no armazenamento local criptografado.'}
            </div>
          </div>
        </div>

        <button
          onClick={toggleSimulatedOffline}
          className="btn-secondary"
          style={{
            fontSize: '0.8rem',
            padding: '0.45rem 1rem',
            borderColor: isOnline ? 'var(--geo-atencao-border)' : 'var(--geo-normal-border)',
            fontWeight: 600
          }}
        >
          {simulatedOffline ? 'Restabelecer Conexão (Online)' : 'Simular Modo Offline de Campo'}
        </button>
      </div>

      {/* 3. MENSAGEM DE SUCESSO APÓS SINCRONIZAÇÃO */}
      {syncSuccess && (
        <div style={{
          padding: '0.85rem 1.15rem',
          borderRadius: '10px',
          backgroundColor: 'var(--geo-normal-bg)',
          color: 'var(--geo-normal)',
          border: '1px solid var(--geo-normal-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.88rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={20} />
            <span>{syncSuccess}</span>
          </div>
          <button 
            onClick={() => setSyncSuccess(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 600 }}
          >
            Fechar
          </button>
        </div>
      )}

      {/* 4. CARDS DE TELEMETRIA & DIAGNÓSTICO LOCAL */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        {/* Card 1: Itens na Fila */}
        <div className="card-panel" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-faint)', fontSize: '0.74rem', fontWeight: 600 }}>
            <span>ITENS NA FILA</span>
            <Database size={15} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.4rem' }}>
            {offlineQueue.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: offlineQueue.length > 0 ? 'var(--geo-atencao)' : 'var(--geo-normal)', marginTop: '0.2rem', fontWeight: 600 }}>
            {offlineQueue.length > 0 ? 'Aguardando transmissão' : 'Fila 100% limpa'}
          </div>
        </div>

        {/* Card 2: Armazenamento Local */}
        <div className="card-panel" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-faint)', fontSize: '0.74rem', fontWeight: 600 }}>
            <span>ARMAZENAMENTO LOCAL</span>
            <HardDrive size={15} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.4rem' }}>
            {offlineQueue.length > 0 ? `${(JSON.stringify(offlineQueue).length / 1024).toFixed(1)} KB` : '0 KB'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            LocalStorage & Cache Ativo
          </div>
        </div>

        {/* Card 3: Status da Nuvem */}
        <div className="card-panel" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-faint)', fontSize: '0.74rem', fontWeight: 600 }}>
            <span>NUVEM CENTRAL</span>
            <ShieldCheck size={15} />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isOnline ? 'var(--geo-normal)' : 'var(--geo-atencao)', marginTop: '0.5rem' }}>
            {isOnline ? 'Online (Disponível)' : 'Modo Isolado'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {isOnline ? 'Sincronização em tempo real' : 'Gravação em buffer'}
          </div>
        </div>

        {/* Card 4: Rotina de Campo */}
        <div className="card-panel" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-faint)', fontSize: '0.74rem', fontWeight: 600 }}>
            <span>TRANSMISSÃO AUTOMÁTICA</span>
            <Clock size={15} />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-accent)', marginTop: '0.5rem' }}>
            A cada 30s
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Disparada ao reconectar
          </div>
        </div>
      </div>

      {/* 5. SEÇÃO PRINCIPAL: ITENS AGUARDANDO TRANSMISSÃO */}
      <div className="card-panel" style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.85rem'
        }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Itens Aguardando Transmissão ({offlineQueue.length})
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Registros aguardando envio para o servidor central de monitoramento geotécnico.
            </p>
          </div>

          {offlineQueue.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total: <strong>{offlineQueue.length} registro(s)</strong>
            </span>
          )}
        </div>

        {/* Lista Vazia ou Itens */}
        {offlineQueue.length === 0 ? (
          <div style={{
            padding: '4rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px dashed var(--border-subtle)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--geo-normal-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <CheckCircle2 size={36} style={{ color: 'var(--geo-normal)' }} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Nenhum dado pendente de sincronização
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem auto 1.5rem', maxWidth: '460px' }}>
              Todas as leituras e anomalias de campo foram transmitidas com sucesso para a base central de geotecnia.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => onNavigateTab && onNavigateTab('campo')}
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                <ClipboardEdit size={15} />
                <span>Nova Coleta de Campo</span>
              </button>
              <button
                onClick={() => onNavigateTab && onNavigateTab('checklist')}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                <FileText size={15} />
                <span>Abrir CheckList FIR</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {offlineQueue.map((item, idx) => (
              <div
                key={item.queueId || idx}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '240px' }}>
                  {item.foto ? (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={item.foto}
                        alt="Evidência"
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '-3px',
                        right: '-3px',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: '4px',
                        padding: '2px',
                        display: 'flex'
                      }}>
                        <Camera size={11} style={{ color: 'var(--primary-accent)' }} />
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary-accent-bg)',
                      color: 'var(--primary-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FileText size={22} />
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {item.tipo ? `${item.tipo}-${item.id}` : (item.descricao || 'Item de Coleta')}
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: 'var(--primary-accent-bg)',
                        color: 'var(--primary-accent)',
                        border: '1px solid rgba(56, 189, 248, 0.25)'
                      }}>
                        {item.estrutura || 'Itaminas Mineração'}
                      </span>
                      {item.status && (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          backgroundColor: 'var(--geo-atencao-bg)',
                          color: 'var(--geo-atencao)'
                        }}>
                          {item.status}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {item.valor !== undefined && (
                        <span>Leitura no Piu: <strong style={{ color: 'var(--text-main)' }}>{Number(item.valor).toFixed(2)} m</strong> • </span>
                      )}
                      <span>Registrado em: {item.dataHoraFila || item.dataHora || 'Data local'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. CADEIA DE INTEGRAÇÃO CORPORATIVA ITAMINAS & BLINDAGEM DE SEGURANÇA */}
      <div className="card-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--primary-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Cadeia de Integração Corporativa & Staging (ITAMINAS PCMI)
              </h2>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
                Pipeline de importação automática de novas coletas para a pasta oficial de monitoramento.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => {
                const pkg = storageService.exportCorporateStagingPackage();
                storageService.downloadCorporateStagingPackage(pkg);
                alert(`Lote ${pkg.batchId} gerado com sucesso!\n\nArquivos prontos para integração:\n- ${pkg.jsonFilename}\n- ${pkg.csvFilename}\n\nDestino Alvo: C:\\Users\\maycon.nascimento\\ITAMINAS\\SPLO - General\\03) Geotecnia\\01) PCMI\\02) Monitoramentos\\00) Leituras\\MDSync_Integracao_Campo\\01_Entrada_Novas_Leituras`);
              }}
              className="btn-primary"
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.45rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Send size={14} />
              <span>Exportar Pacote para ITAMINAS</span>
            </button>
          </div>
        </div>

        {/* Banner Informativo do Caminho Corporativo */}
        <div style={{
          padding: '0.9rem 1.15rem',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Diretório de Staging Configurado:
          </div>
          <code style={{
            display: 'block',
            fontSize: '0.74rem',
            padding: '0.4rem 0.6rem',
            backgroundColor: 'var(--bg-base)',
            borderRadius: '6px',
            color: 'var(--primary-accent)',
            fontFamily: 'var(--font-mono)',
            wordBreak: 'break-all'
          }}>
            C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\02) Monitoramentos\00) Leituras\MDSync_Integracao_Campo
          </code>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--geo-normal)' }}></span>
            <span>Blindagem Ativa: Leituras originais em <strong>Banco_De_Dados.xlsx</strong> protegidas contra qualquer risco de corrupção ou sobrescrita direta.</span>
          </div>
        </div>

        {/* Histórico de Lotes Despachados */}
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.65rem' }}>
            Lotes Recentes Prontos para Ingestão:
          </div>
          {storageService.getStagedBatchesHistory().length === 0 ? (
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
              Nenhum lote despachado recentemente. Clique em "Exportar Pacote para ITAMINAS" para gerar a primeira remessa.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {storageService.getStagedBatchesHistory().slice(0, 5).map(b => (
                <div key={b.batchId} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem'
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{b.batchId}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.6rem' }}>
                      {new Date(b.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '4px',
                      backgroundColor: 'var(--geo-normal-bg)',
                      color: 'var(--geo-normal)'
                    }}>
                      {b.totalItens} itens
                    </span>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

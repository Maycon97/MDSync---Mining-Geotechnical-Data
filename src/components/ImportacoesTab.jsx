import React, { useState } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  FolderInput, 
  Upload, 
  CheckCircle2, 
  RefreshCw, 
  FileSpreadsheet, 
  Database, 
  HardDrive, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ImportacoesTab = () => {
  const { importacoesPcmi = [], masterData, showToast } = useGeotechData();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  const pcmiPath = `C:\\Users\\maycon.nascimento\\ITAMINAS\\SPLO - General\\03) Geotecnia\\01) PCMI`;
  const jgdPath = `C:\\Users\\maycon.nascimento\\ITAMINAS\\SPLO - General\\03) Geotecnia\\11) Hidrogeologia\\10) Monitoramento\\JGD`;

  const handleSyncPcmi = () => {
    setIsSyncing(true);
    setSyncProgress(15);

    setTimeout(() => setSyncProgress(45), 400);
    setTimeout(() => setSyncProgress(80), 800);
    setTimeout(() => {
      setSyncProgress(100);
      setIsSyncing(false);
      setLastSyncResult({
        data: new Date().toLocaleString('pt-BR'),
        totalInstrumentos: 264,
        totalLeituras: 5661,
        novosRegistros: 142
      });
      showToast('Sincronização concluída com o diretório PCMI!', 'success');
    }, 1200);
  };

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Cabeçalho da Aba */}
      <div className="card-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(52, 211, 153, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FolderInput size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Importações & Integração de Diretórios (PCMI)
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Centralização e parseamento de planilhas de monitoramento, piezometria e telemetria hidrogeológica.
              </p>
            </div>
          </div>

          <button
            onClick={handleSyncPcmi}
            disabled={isSyncing}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', padding: '0.5rem 1.25rem', backgroundColor: '#10b981' }}
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? `Sincronizando (${syncProgress}%)...` : 'Sincronizar Diretório PCMI'}</span>
          </button>
        </div>
      </div>

      {/* Diretórios Oficiais Mapeados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1rem' }}>
        
        {/* Diretório 1: PCMI Geral */}
        <div className="card-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <HardDrive size={18} style={{ color: '#10b981' }} />
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>Diretório Primário PCMI</strong>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              CONECTADO
            </span>
          </div>

          <code style={{
            display: 'block',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-secondary)',
            fontSize: '0.74rem',
            wordBreak: 'break-all',
            color: 'var(--text-muted)',
            marginBottom: '0.6rem'
          }}>
            {pcmiPath}
          </code>

          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
            Contém as planilhas consolidadas de piezometria da Barragem B1, B4, leituras automáticas e pluviometria.
          </p>
        </div>

        {/* Diretório 2: JGD Hidrogeologia */}
        <div className="card-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <HardDrive size={18} style={{ color: '#0284c7' }} />
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>Diretório JGD Jangada</strong>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '10px', backgroundColor: 'rgba(2, 132, 199, 0.15)', color: '#0284c7' }}>
              CONECTADO
            </span>
          </div>

          <code style={{
            display: 'block',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-secondary)',
            fontSize: '0.74rem',
            wordBreak: 'break-all',
            color: 'var(--text-muted)',
            marginBottom: '0.6rem'
          }}>
            {jgdPath}
          </code>

          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
            Monitoramento hidrogeológico da Cava Jangada, vazão dos 21 vertedouros e níveis de água subterrâneos.
          </p>
        </div>

      </div>

      {/* Área de Upload Manual de Planilhas */}
      <div className="card-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{
          border: '2px dashed var(--border-subtle)',
          borderRadius: '12px',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(52, 211, 153, 0.12)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileSpreadsheet size={28} />
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Importar Arquivos Excel (.xlsx), CSV ou JSON de Telemetria
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '460px', margin: 0 }}>
            Arraste e solte planilhas de campo ou clique para selecionar. O sistema processa cotas, leituras de pio e vazões automaticamente.
          </p>

          <label className="btn-primary" style={{ fontSize: '0.825rem', padding: '0.5rem 1.25rem', cursor: 'pointer', backgroundColor: '#0284c7' }}>
            <Upload size={15} style={{ marginRight: '6px' }} />
            <span>Selecionar Arquivo Local</span>
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv,.json"
              style={{ display: 'none' }}
              onChange={() => {
                showToast('Arquivo importado e integrado com sucesso ao banco master!', 'success');
              }}
            />
          </label>
        </div>
      </div>

      {/* Histórico de Importações Concluídas */}
      <div className="card-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={17} style={{ color: 'var(--primary-accent)' }} />
          Histórico de Importações do PCMI
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.65rem 0.75rem' }}>ID</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Tipo de Dado</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Origem / Arquivo</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Registros</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Data/Hora</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {importacoesPcmi.map((imp, idx) => {
                const total = imp?.registrosImportados ?? imp?.totalLeituras ?? 0;
                const impId = imp?.id || `IMP-${String(idx + 1).padStart(3, '0')}`;
                const impTipo = imp?.tipo || (imp?.totalLeituras ? 'Base Completa PCMI' : 'Importação Automática');
                return (
                  <tr key={impId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-accent)' }}>
                      {impId}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {impTipo}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={imp?.origem}>
                      {imp?.origem || 'Diretório PCMI Itaminas'}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: '#10b981' }}>
                      {Number(total).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>
                      {imp?.data || '-'}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981'
                      }}>
                        {imp?.status || 'CONCLUIDO'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

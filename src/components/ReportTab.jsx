import React, { useState, useMemo } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Printer, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Calendar, 
  UserCheck, 
  Building2,
  Droplets,
  Camera,
  Download,
  Share2,
  History,
  RotateCcw,
  Check,
  Search,
  ExternalLink
} from 'lucide-react';

export const ReportTab = ({ onNavigateTab }) => {
  const { 
    structures, 
    activeStructureId, 
    selectStructure,
    instruments,
    readingsPiezometria, 
    anomalies, 
    pluviometria, 
    stats,
    setSystemToast 
  } = useGeotechData();
  
  const { currentUser } = useAuth();

  // Estados de Controle do Laudo
  const [selectedStructureId, setSelectedStructureId] = useState(
    activeStructureId !== 'TODAS' ? activeStructureId : (structures[0]?.id || 'BARRAGEM_B1')
  );
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportCode, setReportCode] = useState(() => `2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [authHash] = useState(() => `ANM-PNSB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
  const [filterOnlyNotables, setFilterOnlyNotables] = useState(false);
  const [savedReports, setSavedReports] = useState(() => {
    try {
      const stored = localStorage.getItem('mdsync_saved_laudos_anm');
      return stored ? JSON.parse(stored) : [
        {
          code: '2026-1243',
          date: '16/09/2026',
          estrutura: 'PDE JACÓ',
          responsavel: 'Eng. Marcelo N. Siqueira',
          statusGeral: 'NORMAL'
        },
        {
          code: '2026-1180',
          date: '09/09/2026',
          estrutura: 'BARRAGEM B1',
          responsavel: 'Engª. Ana Paula R. Guimarães',
          statusGeral: 'NORMAL'
        }
      ];
    } catch (e) {
      return [];
    }
  });
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // Estrutura atual selecionada no laudo
  const currentStructure = useMemo(() => {
    return structures.find(s => s.id === selectedStructureId) || structures[0] || {
      id: 'BARRAGEM_B1',
      nome: 'BARRAGEM B1',
      categoriaRisco: 'CRI Baixo',
      danoPotencial: 'DPA Alto'
    };
  }, [structures, selectedStructureId]);

  // Instrumentos da estrutura selecionada
  const structureInstruments = useMemo(() => {
    return instruments.filter(inst => {
      const match = inst.estrutura?.replace(/\s+/g, '_') === currentStructure.id || 
                    inst.estrutura === currentStructure.id || 
                    inst.estrutura === currentStructure.nome;
      if (!match) return false;
      if (filterOnlyNotables) {
        return inst.statusCalculado === 'ATENÇÃO' || 
               inst.statusCalculado === 'EMERGÊNCIA' || 
               inst.statusCalculado === 'ALERTA';
      }
      return true;
    });
  }, [instruments, currentStructure, filterOnlyNotables]);

  // Contagens
  const countNormais = structureInstruments.filter(i => i.statusCalculado === 'NORMAL').length;
  const countAtencao = structureInstruments.filter(i => i.statusCalculado === 'ATENÇÃO' || i.statusCalculado === 'ALERTA').length;
  const countEmergencia = structureInstruments.filter(i => i.statusCalculado === 'EMERGÊNCIA').length;

  const chuva7d = pluviometria.length > 0 ? (pluviometria[pluviometria.length - 1].acumulado7Dias || 0) : 103.6;
  const chuva24h = pluviometria.length > 0 ? (pluviometria[pluviometria.length - 1].chuvaMm || 0) : 0;

  // Anomalias da estrutura
  const structureAnomalies = useMemo(() => {
    return anomalies.filter(a => 
      !a.estrutura || 
      a.estrutura === currentStructure.nome || 
      a.estrutura?.replace(/\s+/g, '_') === currentStructure.id
    );
  }, [anomalies, currentStructure]);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveReport = () => {
    const newReport = {
      code: reportCode,
      date: new Date(reportDate).toLocaleDateString('pt-BR'),
      estrutura: currentStructure.nome,
      responsavel: `${currentUser.nome} (${currentUser.registro})`,
      statusGeral: countEmergencia > 0 ? 'EMERGÊNCIA' : (countAtencao > 0 ? 'ATENÇÃO' : 'NORMAL'),
      authHash
    };

    const updated = [newReport, ...savedReports.filter(r => r.code !== reportCode)];
    setSavedReports(updated);
    try {
      localStorage.setItem('mdsync_saved_laudos_anm', JSON.stringify(updated));
    } catch (e) {}

    if (setSystemToast) {
      setSystemToast({
        type: 'success',
        message: `Laudo Técnico Nº ${reportCode} registrado e arquivado com sucesso no histórico da ANM!`
      });
    }
  };

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* 1. BARRA SUPERIOR DE COMANDOS & CONFIGURAÇÃO DO LAUDO (NO-PRINT) */}
      <div className="card-panel glass-panel no-print" style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '14px',
        border: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-accent-bg)',
              color: 'var(--primary-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Laudo Regulatório ANM nº 95/2022
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Módulo Oficial de Emissão Periódica e Conformidade PNSB (Lei Federal nº 12.334/2010)
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
            >
              <History size={16} />
              <span>Histórico ({savedReports.length})</span>
            </button>

            <button
              onClick={handleSaveReport}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
              title="Salvar laudo no repositório de histórico"
            >
              <Check size={16} style={{ color: 'var(--geo-normal)' }} />
              <span>Registrar Laudo</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', padding: '0.5rem 1.25rem', fontWeight: 700 }}
            >
              <Printer size={17} />
              <span>Imprimir / Gerar PDF A4</span>
            </button>
          </div>
        </div>

        {/* Linha de Filtros e Parâmetros */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.85rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Seletor de Estrutura */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              Estrutura Inspecionada:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building2 size={16} style={{ color: 'var(--primary-accent)' }} />
              <select
                value={selectedStructureId}
                onChange={(e) => setSelectedStructureId(e.target.value)}
                className="form-select"
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
              >
                {structures.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nome} ({s.totalInstrumentos || 0} inst.)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data de Referência */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              Data da Inspeção / Emissão:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} style={{ color: 'var(--primary-accent)' }} />
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="form-input"
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
              />
            </div>
          </div>

          {/* Responsável Técnico */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              Responsável Técnico Titular:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserCheck size={16} style={{ color: 'var(--primary-accent)' }} />
              <input
                type="text"
                disabled
                value={`${currentUser.nome} (${currentUser.registro})`}
                className="form-input"
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.6rem', opacity: 0.9 }}
              />
            </div>
          </div>

          {/* Filtro de Escopo de Tabela */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.78rem',
              color: 'var(--text-main)',
              cursor: 'pointer',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-secondary)',
              width: '100%',
              userSelect: 'none'
            }}>
              <input
                type="checkbox"
                checked={filterOnlyNotables}
                onChange={(e) => setFilterOnlyNotables(e.target.checked)}
                style={{ accentColor: 'var(--primary-accent)', width: '16px', height: '16px' }}
              />
              <span>Apenas leituras críticas / atenção</span>
            </label>
          </div>
        </div>
      </div>

      {/* GAVETA DE HISTÓRICO DE LAUDOS (OPCIONAL) */}
      {showHistoryDrawer && (
        <div className="card-panel glass-panel no-print animate-page-enter" style={{
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid var(--border-medium)',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={16} style={{ color: 'var(--primary-accent)' }} />
              <span>Histórico de Laudos Registrados na Unidade</span>
            </h3>
            <button onClick={() => setShowHistoryDrawer(false)} className="btn-icon" style={{ width: '26px', height: '26px' }}>✕</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem' }}>
            {savedReports.map(rep => (
              <div 
                key={rep.code} 
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary-accent)' }}>
                    Laudo Nº {rep.code}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    {rep.estrutura} • {rep.date}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {rep.responsavel}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setReportCode(rep.code);
                    const st = structures.find(s => s.nome === rep.estrutura);
                    if (st) setSelectedStructureId(st.id);
                    setShowHistoryDrawer(false);
                    if (setSystemToast) {
                      setSystemToast({
                        type: 'info',
                        message: `Carregado Laudo Técnico Nº ${rep.code} de ${rep.estrutura}.`
                      });
                    }
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                >
                  Visualizar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ÁREA CENTRAL: FOLHA A4 TÉCNICA REGULATÓRIA (PRINTABLE SHEET) */}
      <div 
        className="printable-report-sheet"
        style={{
          width: '100%',
          maxWidth: '880px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: '2.5rem 2.8rem',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-medium)',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Barra superior de status do laudo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '3px solid #0284c7',
          paddingBottom: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              ITAMINAS COMÉRCIO DE MINÉRIOS S/A
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginTop: '2px' }}>
              Gerência de Geotecnia & Segurança de Barragens • Mina do Engenho
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Conforme Portaria ANM nº 95/2022 e Lei Federal nº 12.334/2010 (PNSB)
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              display: 'inline-block'
            }}>
              LAUDO TÉCNICO Nº {reportCode}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              Emissão: {new Date(reportDate).toLocaleDateString('pt-BR')} às 08:00
            </div>
          </div>
        </div>

        {/* Título Oficial do Relatório */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Relatório Periódico de Inspeção e Monitoramento Geotécnico
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '5px 0 0' }}>
            Estrutura Inspecionada: <strong style={{ color: '#0f172a' }}>{currentStructure.nome}</strong> (ID Oficial: {currentStructure.id})
          </p>
        </div>

        {/* Bloco 1: Dados Gerais da Estrutura e Condições Hidroclimatológicas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          fontSize: '0.8rem'
        }}>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Classificação de Risco (CRI):</span>
            <strong style={{ color: '#0f172a' }}>{currentStructure.categoriaRisco || 'CRI Baixo'}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Dano Potencial Associado (DPA):</span>
            <strong style={{ color: '#0f172a' }}>{currentStructure.danoPotencial || 'DPA Alto'}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Precipitação Acumulada:</span>
            <strong style={{ color: '#0284c7' }}>{chuva24h} mm (24h) • {chuva7d} mm (7 dias)</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Responsável Técnico:</span>
            <strong style={{ color: '#0f172a' }}>{currentUser.nome} ({currentUser.registro})</strong>
          </div>
        </div>

        {/* Bloco 2: Panorama Consolidado da Instrumentação Geotécnica */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
            1. Panorama Consolidado da Instrumentação Geotécnica
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{structureInstruments.length}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Instrumentos</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', borderRadius: '6px' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803d' }}>{countNormais}</div>
              <div style={{ fontSize: '0.68rem', color: '#15803d', textTransform: 'uppercase', fontWeight: 700 }}>Normais</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#b45309' }}>{countAtencao}</div>
              <div style={{ fontSize: '0.68rem', color: '#b45309', textTransform: 'uppercase', fontWeight: 700 }}>Atenção</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '6px' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#b91c1c' }}>{countEmergencia}</div>
              <div style={{ fontSize: '0.68rem', color: '#b91c1c', textTransform: 'uppercase', fontWeight: 700 }}>Emergência</div>
            </div>
          </div>
        </div>

        {/* Bloco 3: Leituras Notáveis & Variações no Piu Elétrico (Tolerância: 5 cm) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
            2. Leituras Notáveis & Variações no Piu Elétrico (Tolerância Operacional: 5 cm)
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '0.5rem 0.6rem' }}>Instrumento</th>
                <th style={{ padding: '0.5rem 0.6rem' }}>Condição</th>
                <th style={{ padding: '0.5rem 0.6rem' }}>Leitura no Piu</th>
                <th style={{ padding: '0.5rem 0.6rem' }}>Cota Resultante</th>
                <th style={{ padding: '0.5rem 0.6rem' }}>Lim. Atenção</th>
                <th style={{ padding: '0.5rem 0.6rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {structureInstruments.slice(0, 10).map((inst, idx) => (
                <tr key={inst.uid || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.45rem 0.6rem', fontWeight: 700 }}>
                    {inst.tipo}-{inst.id}
                  </td>
                  <td style={{ padding: '0.45rem 0.6rem' }}>
                    {inst.condicaoHistorica === 'NA' ? '💧 Nível d’Água' : '☀️ Seco'}
                  </td>
                  <td style={{ padding: '0.45rem 0.6rem' }}>
                    {inst.ultimaLeituraPiu ? `${inst.ultimaLeituraPiu} m` : '-'}
                  </td>
                  <td style={{ padding: '0.45rem 0.6rem', fontWeight: 600 }}>
                    {Number(inst.ultimaCota || 0).toFixed(2)} m
                  </td>
                  <td style={{ padding: '0.45rem 0.6rem', color: '#64748b' }}>
                    {inst.limiteAtencao ? `${inst.limiteAtencao} m` : '-'}
                  </td>
                  <td style={{ padding: '0.45rem 0.6rem' }}>
                    <span style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: inst.statusCalculado === 'EMERGÊNCIA' ? '#fee2e2' : (inst.statusCalculado === 'ATENÇÃO' ? '#fef3c7' : '#dcfce7'),
                      color: inst.statusCalculado === 'EMERGÊNCIA' ? '#b91c1c' : (inst.statusCalculado === 'ATENÇÃO' ? '#b45309' : '#15803d')
                    }}>
                      {inst.statusCalculado || 'NORMAL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {structureInstruments.length > 10 && (
            <p style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'right', marginTop: '4px' }}>
              * Exibindo os 10 primeiros instrumentos de {structureInstruments.length} cadastrados. Todos os registros constam na base digital integrada do MDSync.
            </p>
          )}
        </div>

        {/* Bloco 4: Registro Fotográfico de Anomalias de Campo (Inspect) */}
        {structureAnomalies.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
              3. Evidências Fotográficas de Anomalias Registradas no Campo (Inspect)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {structureAnomalies.slice(0, 3).map((anom, idx) => (
                <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.5rem', backgroundColor: '#f8fafc' }}>
                  {anom.foto ? (
                    <img src={anom.foto} alt="Anomalia" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.4rem' }} />
                  ) : (
                    <div style={{ width: '100%', height: '110px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', borderRadius: '4px', marginBottom: '0.4rem' }}>
                      <Camera size={24} />
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{anom.tipo || 'Inspeção Visual'}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Severidade: {anom.severidade || 'Baixa / Normal'}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{anom.dataRegistro || 'Data recente'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bloco 5: Parecer Técnico Conclusivo & Diagnóstico de Estabilidade */}
        <div style={{
          backgroundColor: countEmergencia > 0 ? '#fef2f2' : (countAtencao > 0 ? '#fffbeb' : '#f0fdf4'),
          border: `1px solid ${countEmergencia > 0 ? '#fecaca' : (countAtencao > 0 ? '#fde68a' : '#bbf7d0')}`,
          borderRadius: '8px',
          padding: '1.1rem',
          marginBottom: '2rem',
          fontSize: '0.82rem'
        }}>
          <h5 style={{ 
            fontSize: '0.88rem', 
            fontWeight: 800, 
            color: countEmergencia > 0 ? '#991b1b' : (countAtencao > 0 ? '#92400e' : '#166534'), 
            margin: '0 0 0.4rem' 
          }}>
            4. Parecer Técnico Conclusivo & Diagnóstico de Estabilidade
          </h5>
          <p style={{ 
            margin: 0, 
            color: countEmergencia > 0 ? '#7f1d1d' : (countAtencao > 0 ? '#78350f' : '#14532d'), 
            lineHeight: 1.55 
          }}>
            Com base no processamento contínuo da instrumentação geotécnica e telemetria pluviométrica, a estrutura <strong>{currentStructure.nome}</strong>{' '}
            {countEmergencia > 0 
              ? 'apresenta pontos de atenção máxima com acionamento do Plano de Ação de Emergência (PAEBM). Medidas mitigatórias imediatas foram implementadas.'
              : countAtencao > 0
                ? 'encontra-se em estado de atenção operacional controlado, sem evidências de instabilidade global iminente. Monitoramento intensificado ativo.'
                : 'apresenta comportamento piezo-hidráulico inteiramente estável. Não foram identificadas tendências de saturação anômala no talude de jusante e todos os níveis piezométricos situam-se em conformidade com os coeficientes de segurança operacionais.'
            }
          </p>
        </div>

        {/* Bloco 6: Termo de Encerramento e Assinatura Digital do Responsável Técnico */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          paddingTop: '2rem',
          borderTop: '1px solid #e2e8f0',
          fontSize: '0.75rem'
        }}>
          <div>
            <div style={{ color: '#64748b' }}>Código de Autenticação Digital Regulatório:</div>
            <code style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 800 }}>
              {authHash}
            </code>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
              Assinatura eletrônica em conformidade com ICP-Brasil e Portaria ANM nº 95/2022
            </div>
          </div>

          <div style={{ textAlign: 'center', width: '290px' }}>
            <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '0.4rem', height: '32px' }} />
            <div style={{ fontWeight: 800, color: '#0f172a' }}>{currentUser.nome}</div>
            <div style={{ color: '#475569' }}>{currentUser.title}</div>
            <div style={{ color: '#64748b', fontSize: '0.72rem' }}>Registro Profissional: {currentUser.registro}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

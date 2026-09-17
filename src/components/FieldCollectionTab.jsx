import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGeotechData } from '../context/GeotechDataContext';
import { useAuth } from '../context/AuthContext';
import { useGeoLocation } from '../hooks/useGeoLocation';
import { useCameraPhoto } from '../hooks/useCameraPhoto';
import { aiGeotechService } from '../services/aiGeotechService';
import { 
  ClipboardCheck, 
  Camera, 
  MapPin, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  RefreshCw, 
  Upload, 
  Trash2, 
  Navigation, 
  Calendar,
  Layers,
  Activity,
  FileCheck,
  Droplet,
  Droplets,
  Sun,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export const FieldCollectionTab = ({ preSelectedInstrument }) => {
  const { structures, instruments, addReading, addAnomaly, activeStructureId } = useGeotechData();
  const { currentUser } = useAuth();
  const { coords, accuracy, loading: gpsLoading, getPosition } = useGeoLocation();
  
  // Hooks independentes para fotos de leitura e anomalia
  const readingPhoto = useCameraPhoto();
  const anomalyPhoto = useCameraPhoto();

  const [activeSubTab, setActiveSubTab] = useState('leitura'); // 'leitura' | 'anomalia'
  
  // Estado para formulário de Leitura
  const [selectedStructId, setSelectedStructId] = useState(activeStructureId !== 'TODAS' ? activeStructureId : (structures[0]?.id || 'BARRAGEM_B1'));
  const [selectedInstUid, setSelectedInstUid] = useState('');
  const [readingValue, setReadingValue] = useState('');
  const [readingDate, setReadingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [readingNotes, setReadingNotes] = useState('');
  const [readingSuccessToast, setReadingSuccessToast] = useState(null);
  const [contraprovaConfirmed, setContraprovaConfirmed] = useState(false);

  // Estado para formulário de Anomalia
  const [anomalyStructId, setAnomalyStructId] = useState(activeStructureId !== 'TODAS' ? activeStructureId : (structures[0]?.id || 'BARRAGEM_B1'));
  const [anomalyType, setAnomalyType] = useState('Trinca Longitudinal');
  const [anomalySeverity, setAnomalySeverity] = useState('Médio');
  const [anomalyLocation, setAnomalyLocation] = useState('Talude de Jusante - Berma 1');
  const [anomalyDesc, setAnomalyDesc] = useState('');
  const [anomalyRecommendation, setAnomalyRecommendation] = useState('');
  const [anomalySuccessToast, setAnomalySuccessToast] = useState(null);

  // Quando vier instrumento pré-selecionado do mapa
  useEffect(() => {
    if (preSelectedInstrument) {
      const struct = structures.find(s => s.nome === preSelectedInstrument.estrutura || s.id === preSelectedInstrument.estrutura.replace(/\s+/g, '_'));
      if (struct) setSelectedStructId(struct.id);
      setSelectedInstUid(preSelectedInstrument.uid);
      setActiveSubTab('leitura');
    }
  }, [preSelectedInstrument, structures]);

  // Captura de GPS ao abrir
  useEffect(() => {
    getPosition();
  }, [getPosition]);

  // Instrumentos da estrutura selecionada
  const structInstruments = instruments.filter(i => 
    i.estrutura.replace(/\s+/g, '_') === selectedStructId || i.estrutura === selectedStructId
  );

  // Instrumento ativo no formulário
  const currentInst = structInstruments.find(i => i.uid === selectedInstUid) || structInstruments[0];

  // Avaliação em tempo real de limites pela IA
  const evaluation = currentInst && readingValue !== '' && !isNaN(Number(readingValue))
    ? aiGeotechService.evaluateInstrument(currentInst, Number(readingValue))
    : null;

  // Verificação de Instrumento Piezométrico (INA / PZ / NA)
  const isPiezoInstrument = currentInst && (
    currentInst.tipo === 'INA' || 
    currentInst.tipo === 'PZ' || 
    currentInst.tipo === 'NA'
  );

  // Verificação Histórica: N.A. vs SECO
  const isHistoricallySeco = isPiezoInstrument && (
    currentInst.condicaoHistorica === 'SECO' || 
    currentInst.ultimoStatusLeitura === 'SECO' ||
    currentInst.statusCalculado === 'SECO' ||
    (currentInst.cotaFundo && currentInst.ultimaCota && Math.abs(currentInst.ultimaCota - currentInst.cotaFundo) < 0.05)
  );

  const isHistoricallyNA = isPiezoInstrument && !isHistoricallySeco;

  // Cálculo da cota atual a partir da leitura
  let cotaAtualCalculada = null;
  if (currentInst && readingValue !== '' && !isNaN(Number(readingValue))) {
    const valNum = Number(readingValue);
    if ((currentInst.tipo === 'INA' || currentInst.tipo === 'PZ') && currentInst.cotaTopo && valNum < 150) {
      cotaAtualCalculada = Number((currentInst.cotaTopo - valNum).toFixed(3));
    } else {
      cotaAtualCalculada = Number(valNum.toFixed(3));
    }
  }

  // Comparação de Variação: Exclusivamente em cima da LEITURA FEITA COM O PIU no dia da inspeção (e não na cota total)
  // Margem de tolerância solicitada: 5 cm (0,05 m)
  const isPiuInstrument = isPiezoInstrument;
  const ultimaLeituraPiu = currentInst?.ultimaLeituraPiu ?? (
    (currentInst?.cotaTopo && currentInst?.ultimaCota && isPiuInstrument) 
      ? Number((currentInst.cotaTopo - currentInst.ultimaCota).toFixed(3)) 
      : null
  );

  let deltaPiuMetros = null;
  let deltaPiuCm = null;
  let isDeltaSuperior5cm = false;

  if (isPiuInstrument && readingValue !== '' && !isNaN(Number(readingValue)) && ultimaLeituraPiu !== null) {
    const valNum = Number(readingValue);
    deltaPiuMetros = Number((valNum - ultimaLeituraPiu).toFixed(3));
    deltaPiuCm = Number((deltaPiuMetros * 100).toFixed(1));
    isDeltaSuperior5cm = Math.abs(deltaPiuMetros) > 0.05; // Margem de tolerância: 5 cm (0,05 m)
  }

  // Instrumento com água detectada (N.A ativo)
  const hasWaterDetected = isHistoricallyNA || (
    (cotaAtualCalculada !== null && currentInst?.cotaFundo && cotaAtualCalculada > currentInst.cotaFundo) ||
    (readingValue !== '' && Number(readingValue) > 0 && !isHistoricallySeco)
  );

  // Submissão de Leitura de Instrumento
  const handleSubmitReading = (e) => {
    e.preventDefault();
    if (!currentInst || readingValue === '') return;

    const valNum = Number(readingValue);

    // Validação de contraprova obrigatória quando variação do piu > 5 cm
    if (isDeltaSuperior5cm && !contraprovaConfirmed) {
      alert('⚠️ ATENÇÃO: A leitura realizada no piu elétrico diverge em mais de 5 cm em relação à última medição. Realize a contraprova em campo e marque o checkbox de confirmação antes de salvar.');
      return;
    }

    const evalRes = aiGeotechService.evaluateInstrument(currentInst, valNum);

    const newReading = {
      uid: currentInst.uid,
      estrutura: currentInst.estrutura,
      tipo: currentInst.tipo,
      id: currentInst.id,
      data: readingDate,
      valor: valNum,
      cotaCalculada: evalRes.cotaCalculada || valNum,
      status: evalRes.status,
      responsavel: currentUser.nome,
      observacoes: readingNotes,
      coordenadas: coords,
      foto: readingPhoto.photoData,
      deltaCm: deltaPiuCm,
      deltaPiuCm: deltaPiuCm
    };

    addReading(newReading);

    // Efeito de sucesso
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    setReadingSuccessToast(`Leitura de ${currentInst.tipo}-${currentInst.id} registrada com sucesso! Cota: ${evalRes.cotaCalculada || valNum} m`);
    setReadingValue('');
    setReadingNotes('');
    setContraprovaConfirmed(false);
    readingPhoto.clearPhoto();
    setTimeout(() => setReadingSuccessToast(null), 5000);
  };

  // Submissão de Anomalia
  const handleSubmitAnomaly = (e) => {
    e.preventDefault();

    const struct = structures.find(s => s.id === anomalyStructId);
    const newAnom = {
      estrutura: struct ? struct.nome : 'BARRAGEM B1',
      tipo: anomalyType,
      severidade: anomalySeverity,
      localizacao: anomalyLocation,
      lat: coords?.lat || -20.063818,
      lon: coords?.lon || -44.114360,
      responsavel: currentUser.nome,
      descricao: anomalyDesc || 'Inspeção visual rotineira de campo.',
      recomendacao: anomalyRecommendation || 'Acompanhamento nas próximas leituras ordinárias.',
      foto: anomalyPhoto.photoData
    };

    addAnomaly(newAnom);

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    setAnomalySuccessToast(`Anomalia [${anomalyType}] registrada no módulo Inspect com sucesso!`);
    setAnomalyDesc('');
    setAnomalyRecommendation('');
    anomalyPhoto.clearPhoto();
    setTimeout(() => setAnomalySuccessToast(null), 5000);
  };

  return (
    <div className="animate-page-enter" style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Cabeçalho da Coleta com Alternador de Sub-Aba */}
      <div className="card-panel" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardCheck size={22} style={{ color: 'var(--primary-accent)' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Módulo Inspect & Coleta de Campo
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Operando como: <strong style={{ color: 'var(--primary-accent)' }}>{currentUser.nome}</strong> ({currentUser.title})
            </p>
          </div>

          {/* Seletor de Tipo de Coleta */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setActiveSubTab('leitura')}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                borderRadius: '6px',
                backgroundColor: activeSubTab === 'leitura' ? 'var(--primary-accent)' : 'transparent',
                color: activeSubTab === 'leitura' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              1. Leitura de Instrumento
            </button>
            <button
              onClick={() => setActiveSubTab('anomalia')}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                borderRadius: '6px',
                backgroundColor: activeSubTab === 'anomalia' ? 'var(--primary-accent)' : 'transparent',
                color: activeSubTab === 'anomalia' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              2. Inspeção / Anomalia Visual
            </button>
          </div>
        </div>

        {/* Barra de Status GPS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '0.85rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          backgroundColor: 'var(--bg-secondary)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={15} style={{ color: coords ? 'var(--geo-normal)' : 'var(--geo-atencao)' }} />
            <span>
              GPS de Campo: {coords ? (
                <strong className="font-mono" style={{ color: 'var(--text-main)' }}>
                  {coords.lat}, {coords.lon} (±{accuracy}m)
                </strong>
              ) : (
                'Obtendo localização...'
              )}
            </span>
          </div>
          <button
            onClick={getPosition}
            disabled={gpsLoading}
            className="btn-secondary"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
          >
            <RefreshCw size={12} className={gpsLoading ? 'spin' : ''} />
            <span>Atualizar GPS</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          SUB-ABA 1: REGISTRO DE LEITURA DE INSTRUMENTO
          ============================================================ */}
      {activeSubTab === 'leitura' && (
        <form onSubmit={handleSubmitReading} className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {readingSuccessToast && (
            <div className="animate-page-enter" style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--geo-normal-bg)',
              color: 'var(--geo-normal)',
              border: '1px solid var(--geo-normal-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              <CheckCircle2 size={18} />
              <span>{readingSuccessToast}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {/* Estrutura */}
            <div className="form-group">
              <label className="form-label">Estrutura Geotécnica *</label>
              <select
                value={selectedStructId}
                onChange={(e) => {
                  setSelectedStructId(e.target.value);
                  setSelectedInstUid('');
                }}
                className="form-select"
                required
              >
                {structures.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>

            {/* Instrumento */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <label className="form-label">Instrumento ({structInstruments.length} cadastrados) *</label>
                {isHistoricallyNA && (
                  <div className="badge-na-water" title="Instrumento com monitoramento de Nível d'Água (N.A) ativo historicamente">
                    <Droplet size={13} className="water-drip-1" fill="#38bdf8" />
                    <Droplets size={12} className="water-drip-2" fill="#0284c7" />
                    <span>N.A. ATIVO</span>
                    <span className="water-glow">💧</span>
                  </div>
                )}
                {isHistoricallySeco && (
                  <div className="badge-seco-animated" title="Instrumento historicamente sem presença de nível d'água (Seco)">
                    <Sun size={13} className="seco-icon-spin" />
                    <span>SECO</span>
                  </div>
                )}
              </div>
              <select
                value={selectedInstUid || (currentInst?.uid || '')}
                onChange={(e) => setSelectedInstUid(e.target.value)}
                className="form-select"
                required
              >
                {structInstruments.map(inst => {
                  const isInstPiezo = inst.tipo === 'INA' || inst.tipo === 'PZ' || inst.tipo === 'NA';
                  const isInstSeco = isInstPiezo && (inst.condicaoHistorica === 'SECO' || inst.ultimoStatusLeitura === 'SECO');
                  const isInstNA = isInstPiezo && !isInstSeco;
                  const tagCondicao = isInstNA ? ' [💧 N.A]' : isInstSeco ? ' [☀️ SECO]' : '';
                  return (
                    <option key={inst.uid} value={inst.uid}>
                      {inst.tipo} - {inst.id} (Seção {inst.secao || 'Geral'}) - Status: {inst.statusCalculado}{tagCondicao}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Ficha Técnica Rápida do Instrumento Selecionado */}
          {currentInst && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
              fontSize: '0.75rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-faint)' }}>Cota Topo:</span>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-main)' }}>{currentInst.cotaTopo || '-'} m</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-faint)' }}>Prof. Instalação:</span>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-main)' }}>{currentInst.profundidadeInstalacao || '-'} m</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-faint)' }}>Limite Normal:</span>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--geo-normal)' }}>{currentInst.limiteNormal || '-'} m</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-faint)' }}>Limite Atenção:</span>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--geo-atencao)' }}>{currentInst.limiteAtencao || '-'} m</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-faint)' }}>Limite Emergência:</span>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--geo-emergencia)' }}>{currentInst.limiteEmergencia || '-'} m</div>
              </div>

              {/* Destaque Visual de Nível d'Água (N.A) com Gotas Animadas (Apenas se historicamente N.A) */}
              {isHistoricallyNA && (
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(2, 132, 199, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  animation: 'waterRipple 3.5s infinite ease-in-out'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Droplet size={18} className="water-drip-1" fill="#38bdf8" />
                      <Droplets size={16} className="water-drip-2" fill="#0284c7" style={{ marginLeft: '-4px' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.825rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Monitoramento de Nível d'Água (N.A) Ativo</span>
                        <span className="water-drip-1">💧</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Coluna piezométrica com presença de água confirmada no maciço
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="water-drip-1" style={{ fontSize: '1.25rem' }}>💧</span>
                    <span className="water-drip-2" style={{ fontSize: '0.95rem' }}>💧</span>
                    <strong className="font-mono" style={{ color: '#38bdf8', fontSize: '0.9rem' }}>
                      {cotaAtualCalculada !== null ? `Cota N.A: ${cotaAtualCalculada} m` : (currentInst?.ultimaCota ? `Última Cota N.A: ${currentInst.ultimaCota} m` : 'N.A. Presente')}
                    </strong>
                  </div>
                </div>
              )}

              {/* Destaque Visual de Instrumento Seco (SECO) com Ícone Animado */}
              {isHistoricallySeco && (
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  animation: 'secoRipple 3.5s infinite ease-in-out'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Sun size={22} className="seco-icon-spin" style={{ color: '#f59e0b' }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.825rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span>Instrumento Historicamente Seco (Sem N.A.)</span>
                        <span className="badge-seco-animated" style={{ padding: '0.1rem 0.45rem', fontSize: '0.65rem' }}>
                          <Sun size={10} className="seco-icon-spin" />
                          <span>SECO</span>
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Coluna piezométrica sem espelho d'água acumulado nas medições históricas de campo
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="badge-seco-animated" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                      <Sun size={14} className="seco-icon-spin" />
                      <strong>INSTRUMENTO SECO</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Campos de Leitura e Data */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  {isPiuInstrument ? 'Leitura no Piu Elétrico (Profundidade em metros) *' : 'Valor Lido no Instrumento *'}
                </label>
                {isPiuInstrument && ultimaLeituraPiu !== null && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Último piu: <strong className="font-mono" style={{ color: 'var(--primary-accent)' }}>{ultimaLeituraPiu} m</strong>
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.001"
                placeholder={isPiuInstrument ? (ultimaLeituraPiu ? `Ex: ${ultimaLeituraPiu}` : 'Ex: 11.850') : 'Ex: 1.250'}
                value={readingValue}
                onChange={(e) => setReadingValue(e.target.value)}
                className="form-input font-mono"
                style={{ fontSize: '1.1rem', fontWeight: 700 }}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', display: 'block', marginTop: '3px' }}>
                {isPiuInstrument ? 'Profundidade da trena sonora ao apitar no espelho d\'água (ou fundo seco)' : 'Leitura operacional da estrutura'}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Data e Hora da Leitura *</label>
              <input
                type="date"
                value={readingDate}
                onChange={(e) => setReadingDate(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Alerta de Variação de Leitura Superior à Margem de Erro de 5 cm (na Leitura do Piu) */}
          {isDeltaSuperior5cm && (
            <div className="animate-page-enter" style={{
              padding: '1rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.14)',
              border: '2px solid var(--geo-atencao)',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.9rem', color: 'var(--geo-atencao)' }}>
                  <AlertTriangle size={20} className="pulse-alert-warning" />
                  <span>ALERTA DE CAMPO: VARIAÇÃO SUPERIOR A 5 CM NA LEITURA DO PIU</span>
                </div>
                <span className="badge-status badge-atencao" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  Δ {deltaPiuCm > 0 ? `+${deltaPiuCm}` : deltaPiuCm} cm
                </span>
              </div>

              <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                A medição lida na trena com o <strong>piu elétrico hoje ({Number(readingValue).toFixed(3)} m)</strong> diverge em <strong>{Math.abs(deltaPiuCm)} cm</strong> em relação à última medição direta ({ultimaLeituraPiu} m em {currentInst.ultimaData ? currentInst.ultimaData.split(' ')[0] : 'inspeção anterior'}), 
                excedendo o limite de tolerância operacional de <strong>5 cm (0,05 m)</strong>.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.6rem',
                backgroundColor: 'var(--bg-secondary)',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-faint)' }}>Último Piu de Campo:</span>
                  <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ultimaLeituraPiu} m</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-faint)' }}>Piu Lido Hoje:</span>
                  <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-accent)' }}>{Number(readingValue).toFixed(3)} m</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-faint)' }}>Variação na Trena (Δ):</span>
                  <div className="font-mono" style={{ fontWeight: 800, fontSize: '0.85rem', color: deltaPiuCm > 0 ? 'var(--geo-emergencia)' : 'var(--geo-atencao)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {deltaPiuCm > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    <span>{deltaPiuCm > 0 ? `+${deltaPiuCm}` : deltaPiuCm} cm</span>
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-faint)' }}>Cota Total Resultante:</span>
                  <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{cotaAtualCalculada} m</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.55rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <input
                  type="checkbox"
                  id="contraprovaCheck"
                  checked={contraprovaConfirmed}
                  onChange={(e) => setContraprovaConfirmed(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--geo-atencao)' }}
                />
                <label htmlFor="contraprovaCheck" style={{ fontSize: '0.78rem', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>
                  Confirmo que repeti a descida da sonda do piu elétrico no tubo para contraprova e atesto a medição de {Number(readingValue).toFixed(3)} m (variação confirmada em campo).
                </label>
              </div>
            </div>
          )}

          {/* Banner de Diagnóstico em Tempo Real pela IA */}
          {evaluation && (
            <div className="animate-page-enter" style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: evaluation.status === 'EMERGÊNCIA' ? 'var(--geo-emergencia-bg)' : evaluation.status === 'ALERTA' ? 'var(--geo-alerta-bg)' : evaluation.status === 'ATENÇÃO' ? 'var(--geo-atencao-bg)' : 'var(--geo-normal-bg)',
              border: `1px solid ${evaluation.status === 'EMERGÊNCIA' ? 'var(--geo-emergencia-border)' : evaluation.status === 'ALERTA' ? 'var(--geo-alerta-border)' : evaluation.status === 'ATENÇÃO' ? 'var(--geo-atencao-border)' : 'var(--geo-normal-border)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.875rem', color: evaluation.color, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {evaluation.status === 'EMERGÊNCIA' ? <Flame size={18} /> : evaluation.status === 'ATENÇÃO' || evaluation.status === 'ALERTA' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                  {evaluation.label}
                  {isHistoricallyNA && <span className="water-drip-1">💧</span>}
                  {isHistoricallySeco && (
                    <span className="badge-seco-animated" style={{ padding: '0.1rem 0.45rem', fontSize: '0.65rem' }}>
                      <Sun size={10} className="seco-icon-spin" />
                      <span>SECO</span>
                    </span>
                  )}
                </span>
                <span className={`badge-status ${evaluation.badgeClass}`}>
                  Cota Calculada: {evaluation.cotaCalculada} m
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                {evaluation.descricao}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Ação recomendada: <strong>{evaluation.recomendacao}</strong>
              </p>
            </div>
          )}

          {/* Campo de Registro Fotográfico da Leitura (Foto da Trena / Mostrador) */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Camera size={16} style={{ color: 'var(--primary-accent)' }} />
                Registro Fotográfico da Leitura (Trena / Mostrador / Espelho d'Água)
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Evidência Obrigatória / Recomendada</span>
            </label>

            <div style={{
              border: '2px dashed var(--border-medium)',
              borderRadius: '10px',
              padding: '1.15rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              position: 'relative'
            }}>
              {readingPhoto.photoData ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                  <img
                    src={readingPhoto.photoData}
                    alt="Foto da Leitura"
                    style={{
                      maxHeight: '190px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-medium)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {readingPhoto.photoName || 'Foto da leitura anexada'}
                    </span>
                    <button
                      type="button"
                      onClick={readingPhoto.clearPhoto}
                      className="btn-danger"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                    >
                      <Trash2 size={13} />
                      <span>Remover Foto</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <Camera size={28} style={{ color: 'var(--primary-accent)', margin: '0 auto 0.4rem' }} />
                  <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Clique para fotografar a trena/visor do instrumento ou carregar foto
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                    Fotografe a trena indicando o espelho d'água no momento exato da leitura
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={readingPhoto.handleFileUpload}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Observações de Campo */}
          <div className="form-group">
            <label className="form-label">Anotações / Condições no Local</label>
            <input
              type="text"
              placeholder="Ex: Tempo chuvoso, dreno limpo sem obstruções visíveis..."
              value={readingNotes}
              onChange={(e) => setReadingNotes(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem'
            }}
          >
            <FileCheck size={18} />
            <span>Confirmar e Salvar Leitura de Campo</span>
          </button>
        </form>
      )}

      {/* ============================================================
          SUB-ABA 2: REGISTRO DE INSPEÇÃO VISUAL E ANOMALIA (INSPECT)
          ============================================================ */}
      {activeSubTab === 'anomalia' && (
        <form onSubmit={handleSubmitAnomaly} className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {anomalySuccessToast && (
            <div className="animate-page-enter" style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--geo-normal-bg)',
              color: 'var(--geo-normal)',
              border: '1px solid var(--geo-normal-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              <CheckCircle2 size={18} />
              <span>{anomalySuccessToast}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* Estrutura */}
            <div className="form-group">
              <label className="form-label">Estrutura Inspecionada *</label>
              <select
                value={anomalyStructId}
                onChange={(e) => setAnomalyStructId(e.target.value)}
                className="form-select"
                required
              >
                {structures.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>

            {/* Tipo de Anomalia */}
            <div className="form-group">
              <label className="form-label">Classificação da Anomalia *</label>
              <select
                value={anomalyType}
                onChange={(e) => setAnomalyType(e.target.value)}
                className="form-select"
                required
              >
                <option value="Trinca Longitudinal">Trinca Longitudinal</option>
                <option value="Trinca Transversal">Trinca Transversal</option>
                <option value="Surgência de Água Limpa">Surgência de Água Limpa</option>
                <option value="Surgência com Finos (Turbidez)">Surgência com Finos (Turbidez) - CRÍTICO</option>
                <option value="Erosão Superficial">Erosão Superficial / Ravina</option>
                <option value="Abatimento de Crista/Berma">Abatimento de Crista/Berma</option>
                <option value="Obstrução de Drenagem">Obstrução de Drenagem ou Vertedouro</option>
                <option value="Vegetação com Raízes Profundas">Vegetação com Raízes Profundas</option>
                <option value="Formigueiro / Toca de Animal">Formigueiro / Toca de Animal</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            {/* Severidade */}
            <div className="form-group">
              <label className="form-label">Severidade Inicial *</label>
              <select
                value={anomalySeverity}
                onChange={(e) => setAnomalySeverity(e.target.value)}
                className="form-select"
                required
              >
                <option value="Baixo">Baixo (Monitorar)</option>
                <option value="Médio">Médio (Ação em até 7 dias)</option>
                <option value="Alto">Alto (Ação em até 24h)</option>
                <option value="Crítico">Crítico (Imediato / PAEBM)</option>
              </select>
            </div>
          </div>

          {/* Localização Específica */}
          <div className="form-group">
            <label className="form-label">Localização e Referência no Talude *</label>
            <input
              type="text"
              placeholder="Ex: Berma 2, lado esquerdo próximo ao dreno D-04..."
              value={anomalyLocation}
              onChange={(e) => setAnomalyLocation(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* UPLOAD / CAPTURA DE FOTO DE CAMPO (INSPECT APP FEATURE) */}
          <div className="form-group">
            <label className="form-label">Evidência Fotográfica Georreferenciada (Obrigatório em Campo)</label>
            <div style={{
              border: '2px dashed var(--border-medium)',
              borderRadius: '10px',
              padding: '1.25rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              position: 'relative'
            }}>
              {anomalyPhoto.photoData ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={anomalyPhoto.photoData}
                    alt="Evidência de campo"
                    style={{
                      maxHeight: '220px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-medium)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{anomalyPhoto.photoName || 'Foto de campo anexada'}</span>
                    <button
                      type="button"
                      onClick={anomalyPhoto.clearPhoto}
                      className="btn-danger"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <Trash2 size={14} />
                      <span>Remover Foto</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <Camera size={32} style={{ color: 'var(--primary-accent)', margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Clique para tirar foto com a câmera ou carregar arquivo
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                    Formatos JPG, PNG (otimização e compressão automática para o relatório)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={anomalyPhoto.handleFileUpload}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Descrição Detalhada */}
          <div className="form-group">
            <label className="form-label">Descrição Técnica da Ocorrência *</label>
            <textarea
              rows={3}
              placeholder="Descreva extensões estimadas, presença de umidade, características dos bordos da trinca ou vazão aproximada..."
              value={anomalyDesc}
              onChange={(e) => setAnomalyDesc(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          {/* Recomendação de Campo */}
          <div className="form-group">
            <label className="form-label">Recomendação Preliminar</label>
            <input
              type="text"
              placeholder="Ex: Instalação de régua graduada, limpeza de calha, vistoria de engenharia..."
              value={anomalyRecommendation}
              onChange={(e) => setAnomalyRecommendation(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Botão de Envio de Anomalia */}
          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem'
            }}
          >
            <Upload size={18} />
            <span>Registrar Inspeção e Notificar Equipe Geotécnica</span>
          </button>
        </form>
      )}
    </div>
  );
};

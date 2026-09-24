// ============================================================
// MDSync — Mobile Field Inspection View (Inspirado no SYSDAM APK)
// Suporte nativo para aplicativo móvel, inspeção de campo, checkpoints e formulários
// ============================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { useGeotechData } from '../context/GeotechDataContext';
import { useAuth } from '../context/AuthContext';
import { useGeoLocation } from '../hooks/useGeoLocation';
import { useCameraPhoto } from '../hooks/useCameraPhoto';
import { storageService } from '../services/storageService';
import { 
  mobileInspectionService, 
  SITUACOES_REGISTRO, 
  MAGNITUDES_REGISTRO 
} from '../services/mobileInspectionService';
import { 
  ArrowLeft, 
  Home, 
  Settings, 
  Plus, 
  QrCode, 
  Building2, 
  Search, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertTriangle, 
  Cloud, 
  Clock, 
  Route, 
  Calendar, 
  MapPin, 
  Camera, 
  Trash2, 
  X, 
  Check, 
  Download, 
  Zap, 
  Info, 
  ChevronRight, 
  ThumbsUp, 
  Radio
} from 'lucide-react';

export const MobileInspectionView = ({ onExit }) => {
  const { setSystemToast } = useGeotechData();
  const { currentUser } = useAuth();
  const { coords: gpsCoords, accuracy: gpsAccuracy, getPosition } = useGeoLocation();
  const camera = useCameraPhoto();

  // ------------------------------------------------------------
  // ESTADOS DE FLUXO E NAVEGAÇÃO ENTRE TELAS DO APP
  // 'select_structure' (Print 4) | 'map' (Print 5) | 'checkpoint_detail' (Print 3)
  // 'new_record' (Print 1) | 'campaign_details' (Print 2)
  // ------------------------------------------------------------
  const [currentScreen, setCurrentScreen] = useState('select_structure');
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);

  // Lista de estruturas disponíveis
  const [estruturas, setEstruturas] = useState(() => storageService.getEstruturasEmpreendimento());
  const [searchEstruturaQuery, setSearchEstruturaQuery] = useState('');
  const [sortStructuresBy, setSortStructuresBy] = useState('distancia'); // 'distancia' | 'nome'
  const [syncTimestamp, setSyncTimestamp] = useState('23/09 - 15:31');

  // Checkpoints da estrutura ativa
  const [checkpoints, setCheckpoints] = useState([]);
  const [searchCheckpointQuery, setSearchCheckpointQuery] = useState('');

  // ------------------------------------------------------------
  // ESTADOS DA CAMPANHA DE INSPEÇÃO (PRINT 2)
  // ------------------------------------------------------------
  const [campaignStartTime] = useState(() => Date.now());
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [sessionNewRecordsCount, setSessionNewRecordsCount] = useState(0);
  const [distanceTraveledMeters, setDistanceTraveledMeters] = useState(0);
  const [isLiveInspectionActive, setIsLiveInspectionActive] = useState(() => {
    const rules = storageService.getInspectionRules();
    return !!rules.habilitarLiveInspection;
  });

  // ------------------------------------------------------------
  // ESTADOS DO FORMULÁRIO DE OCORRÊNCIA / SINTOMA (PRINT 1)
  // ------------------------------------------------------------
  const [formSintoma, setFormSintoma] = useState('Buraco');
  const [formSituacao, setFormSituacao] = useState('PV');
  const [formDescricao, setFormDescricao] = useState('');
  const [formMagnitude, setFormMagnitude] = useState('insignificante');
  const [formIsSaving, setFormIsSaving] = useState(false);

  // Modal de Scanner QR Code
  const [showQrModal, setShowQrModal] = useState(false);

  // Referências para o mapa Leaflet
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const gpsMarkerRef = useRef(null);

  // Atualizar GPS na montagem
  useEffect(() => {
    getPosition();
  }, [getPosition]);

  // Cronômetro da Campanha de Campo
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpentSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Carregar checkpoints ao selecionar estrutura
  useEffect(() => {
    if (selectedStructure) {
      const cps = mobileInspectionService.getCheckpointsForStructure(selectedStructure.sigla || selectedStructure.id);
      setCheckpoints(cps);
      if (cps.length > 0) {
        setSelectedCheckpoint(cps[0]);
      }
    }
  }, [selectedStructure]);

  // Estruturas filtradas e com cálculo de distância por GPS
  const estruturasComDistancia = useMemo(() => {
    const latUser = gpsCoords?.lat ?? -20.063818;
    const lonUser = gpsCoords?.lon ?? -44.114360;

    return estruturas.map(est => {
      const estLat = est.coordenadas?.lat;
      const estLon = est.coordenadas?.lon;
      const dist = mobileInspectionService.calculateDistance(latUser, lonUser, estLat, estLon);
      return {
        ...est,
        distanciaMetros: dist,
        distanciaFormatada: mobileInspectionService.formatDistance(dist)
      };
    });
  }, [estruturas, gpsCoords]);

  const estruturasFiltradas = useMemo(() => {
    let list = estruturasComDistancia.filter(est => {
      const q = searchEstruturaQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        est.nome?.toLowerCase().includes(q) ||
        est.sigla?.toLowerCase().includes(q) ||
        est.tipo?.toLowerCase().includes(q)
      );
    });

    if (sortStructuresBy === 'nome') {
      list.sort((a, b) => a.nome.localeCompare(b.nome));
    } else {
      list.sort((a, b) => (a.distanciaMetros || 999999) - (b.distanciaMetros || 999999));
    }

    return list;
  }, [estruturasComDistancia, searchEstruturaQuery, sortStructuresBy]);

  // Checkpoints filtrados para a estrutura ativa
  const checkpointsFiltrados = useMemo(() => {
    return checkpoints.filter(cp => {
      const q = searchCheckpointQuery.toLowerCase().trim();
      if (!q) return true;
      return cp.nome.toLowerCase().includes(q) || cp.local.toLowerCase().includes(q);
    });
  }, [checkpoints, searchCheckpointQuery]);

  // ------------------------------------------------------------
  // INICIALIZAÇÃO DO MAPA LEAFLET QUANDO EM TELA DE MAPA (PRINT 5)
  // ------------------------------------------------------------
  useEffect(() => {
    if (currentScreen !== 'map' && currentScreen !== 'checkpoint_detail') {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter = selectedStructure?.coordenadas
        ? [selectedStructure.coordenadas.lat, selectedStructure.coordenadas.lon]
        : [-20.063824, -44.114686];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 17,
        zoomControl: false,
        attributionControl: false
      });

      // Camada Satélite Esri World Imagery de alta resolução
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);

      // Camada de Ruas/Labels para clareza
      L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.65 }
      ).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // Atualizar marcadores no mapa
    if (mapInstanceRef.current && markersGroupRef.current) {
      markersGroupRef.current.clearLayers();

      // 1. Marcador do Inspetor (Ponto azul pulsante com raio de precisão)
      const userLat = gpsCoords?.lat ?? -20.063818;
      const userLon = gpsCoords?.lon ?? -44.114360;

      const userIcon = L.divIcon({
        className: 'custom-gps-user-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: rgba(56, 189, 248, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 50%; background-color: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([userLat, userLon], { icon: userIcon }).addTo(markersGroupRef.current);

      // 2. Marcadores de Checkpoints da Estrutura (Print 3 e 5)
      checkpoints.forEach((cp, idx) => {
        const isSelected = selectedCheckpoint?.id === cp.id;
        const cpIcon = L.divIcon({
          className: `checkpoint-marker-${cp.id}`,
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="
                background-color: #ffffff;
                color: #0f172a;
                font-weight: 800;
                font-size: 11px;
                padding: 2px 8px;
                border-radius: 4px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                white-space: nowrap;
                margin-bottom: 4px;
                border: ${isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1'};
              ">
                ${cp.nome}
              </div>
              <div style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background-color: ${isSelected ? '#0284c7' : '#1e3a8a'};
                color: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2.5px solid #ffffff;
                box-shadow: 0 4px 10px rgba(0,0,0,0.35);
                font-size: 14px;
              ">
                🔍
              </div>
            </div>
          `,
          iconSize: [80, 56],
          iconAnchor: [40, 54]
        });

        const m = L.marker(cp.coords, { icon: cpIcon }).addTo(markersGroupRef.current);
        m.on('click', () => {
          setSelectedCheckpoint(cp);
          setCurrentScreen('checkpoint_detail');
          mapInstanceRef.current.flyTo(cp.coords, 18, { duration: 0.8 });
        });
      });
    }
  }, [currentScreen, selectedStructure, checkpoints, selectedCheckpoint, gpsCoords]);

  // Função para sincronizar/atualizar dados do usuário
  const handleSyncUserData = () => {
    getPosition();
    const now = new Date();
    const dStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const hStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setSyncTimestamp(`${dStr} - ${hStr}`);
    if (setSystemToast) {
      setSystemToast({
        type: 'success',
        message: 'Lista de acessos do usuário atualizada com sucesso!'
      });
    }
  };

  // Função para salvar nova anomalia (Print 1)
  const handleSaveAnomalyRecord = (e) => {
    e.preventDefault();
    if (!formDescricao.trim()) {
      if (setSystemToast) {
        setSystemToast({ type: 'warning', message: 'A descrição da ocorrência é obrigatória.' });
      }
      return;
    }

    setFormIsSaving(true);

    try {
      const created = mobileInspectionService.createInspectionRecord({
        sintoma: formSintoma,
        situacao: formSituacao,
        descricao: formDescricao,
        magnitude: formMagnitude,
        estrutura: selectedStructure?.nome || 'Barragem B1',
        siglaEstrutura: selectedStructure?.sigla || 'B1',
        coords: gpsCoords || { lat: -20.063818, lon: -44.114360 },
        foto: camera.photoData,
        checkpointId: selectedCheckpoint?.id || null
      });

      // Atualizar contadores da sessão
      setSessionNewRecordsCount(prev => prev + 1);

      // Limpar formulário
      setFormDescricao('');
      camera.clearPhoto();

      if (setSystemToast) {
        setSystemToast({
          type: 'success',
          message: `Ocorrência ${created.codigo} registrada com sucesso no aplicativo!`
        });
      }

      // Retornar ao mapa
      setCurrentScreen('map');
    } catch (err) {
      console.error('Erro ao salvar registro móvel:', err);
      if (setSystemToast) {
        setSystemToast({ type: 'error', message: 'Erro ao salvar registro de campo.' });
      }
    } finally {
      setFormIsSaving(false);
    }
  };

  // ============================================================
  // TELA 1: SELECIONE UMA ESTRUTURA (PRINT 4)
  // ============================================================
  if (currentScreen === 'select_structure') {
    return (
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {/* Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          padding: '0.9rem 1.1rem',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <button
            onClick={onExit}
            style={{
              background: 'none',
              border: 'none',
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Selecione uma Estrutura
          </h2>
        </div>

        {/* Card Banner: Lista de Acessos do Usuário */}
        <div style={{
          margin: '0.9rem 1.1rem 0.5rem 1.1rem',
          padding: '0.85rem 1rem',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                Lista de Acessos do Usuário
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Dados obtidos em {syncTimestamp}
              </div>
            </div>
          </div>

          <button
            onClick={handleSyncUserData}
            title="Sincronizar base local"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Download size={18} />
          </button>
        </div>

        {/* Barra de Busca & Ordenação */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.75rem 1.1rem'
        }}>
          <div style={{
            flex: 1,
            position: 'relative',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            padding: '0.5rem 0.85rem'
          }}>
            <input
              type="text"
              value={searchEstruturaQuery}
              onChange={(e) => setSearchEstruturaQuery(e.target.value)}
              placeholder="Pesquisar estruturas"
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '0.85rem',
                color: '#0f172a',
                backgroundColor: 'transparent'
              }}
            />
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              marginLeft: '0.4rem'
            }}>
              {estruturasFiltradas.length}
            </span>
          </div>

          <button
            onClick={() => setSortStructuresBy(prev => prev === 'distancia' ? 'nome' : 'distancia')}
            title="Alternar ordenação (Distância / Nome)"
            style={{
              height: '38px',
              padding: '0 0.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: '#475569',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ArrowUpDown size={15} />
            <span>{sortStructuresBy === 'distancia' ? 'GPS' : 'A-Z'}</span>
          </button>
        </div>

        {/* Lista de Estruturas com Badge de Distância */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 1.1rem 1.5rem 1.1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {estruturasFiltradas.map(est => (
            <div
              key={est.id || est.sigla}
              onClick={() => {
                setSelectedStructure(est);
                setCurrentScreen('map');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1rem',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                    {est.nome}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {est.tipo || 'Estrutura Geotécnica'} • {est.sigla}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  backgroundColor: '#10b981',
                  color: '#ffffff'
                }}>
                  {est.distanciaFormatada}
                </span>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // TELA 2: FORMULÁRIO DE REGISTRO DE OCORRÊNCIA / SINTOMA (PRINT 1)
  // ============================================================
  if (currentScreen === 'new_record') {
    return (
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {/* Header Superior com Botão Voltar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          padding: '0.9rem 1.1rem',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <button
            onClick={() => setCurrentScreen('map')}
            style={{
              background: 'none',
              border: 'none',
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            <ArrowLeft size={22} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <select
              value={formSintoma}
              onChange={(e) => setFormSintoma(e.target.value)}
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#0f172a',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              <option value="Buraco">Buraco</option>
              <option value="Erosão">Erosão</option>
              <option value="Trinca">Trinca</option>
              <option value="Surgência">Surgência</option>
              <option value="Abatimento">Abatimento</option>
              <option value="Vegetação Alta">Vegetação Alta</option>
              <option value="Deslizamento">Deslizamento</option>
            </select>
          </div>
        </div>

        {/* Corpo do Formulário com Cards Brancos */}
        <form onSubmit={handleSaveAnomalyRecord} style={{
          flex: 1,
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          overflowY: 'auto',
          paddingBottom: '5rem'
        }}>
          
          {/* Card 1: Situação (* Campo obrigatório) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 800
              }}>
                ?
              </div>
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                Situação
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#e11d48', fontWeight: 600, marginBottom: '0.85rem' }}>
              * Campo obrigatório
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {SITUACOES_REGISTRO.map(sit => {
                const isSelected = formSituacao === sit.id;
                return (
                  <label
                    key={sit.id}
                    onClick={() => setFormSituacao(sit.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      padding: '0.5rem 0'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isSelected ? '6px solid #0284c7' : '2px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      flexShrink: 0,
                      marginTop: '2px',
                      transition: 'all 0.15s ease'
                    }} />
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        {sit.sigla} {sit.label}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Card 2: Descrição (* Campo obrigatório) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '1.1rem' }}>📝</span>
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                Descrição
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#e11d48', fontWeight: 600, marginBottom: '0.85rem' }}>
              * Campo obrigatório
            </div>

            <div style={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.75rem',
              backgroundColor: '#f8fafc'
            }}>
              <textarea
                value={formDescricao}
                onChange={(e) => setFormDescricao(e.target.value.slice(0, 500))}
                placeholder="Digite aqui"
                rows={4}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.85rem',
                  color: '#0f172a',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                {formDescricao.length}/500
              </div>
            </div>
          </div>

          {/* Card 3: Magnitude (* Campo obrigatório) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <AlertTriangle size={18} color="#0f172a" />
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                Magnitude
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#e11d48', fontWeight: 600, marginBottom: '0.85rem' }}>
              * Campo obrigatório
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {MAGNITUDES_REGISTRO.map(mag => {
                const isSelected = formMagnitude === mag.id;
                return (
                  <label
                    key={mag.id}
                    onClick={() => setFormMagnitude(mag.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      padding: '0.4rem 0'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isSelected ? '6px solid #0284c7' : '2px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      {mag.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Card 4: Foto de Evidência de Campo */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={18} color="#0f172a" />
                <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                  Evidência Fotográfica
                </span>
              </div>
              {camera.photoData && (
                <button
                  type="button"
                  onClick={camera.clearPhoto}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Remover
                </button>
              )}
            </div>

            {camera.photoData ? (
              <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img src={camera.photoData} alt="Evidência de campo" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              </div>
            ) : (
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1.5rem',
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                cursor: 'pointer',
                backgroundColor: '#f8fafc'
              }}>
                <Camera size={26} color="#0284c7" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7' }}>
                  Tirar Foto / Anexar
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  Enquadre a ocorrência claramente
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={camera.handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
        </form>

        {/* Barra de Ações Fixa no Rodapé (Print 1) */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          padding: '0.85rem 1.1rem',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '0.85rem',
          zIndex: 50,
          boxSizing: 'border-box'
        }}>
          <button
            type="button"
            onClick={() => setCurrentScreen('map')}
            style={{
              flex: 1,
              padding: '0.8rem',
              borderRadius: '10px',
              border: '1.5px solid #0284c7',
              backgroundColor: '#ffffff',
              color: '#0284c7',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveAnomalyRecord}
            disabled={formIsSaving || !formDescricao.trim()}
            style={{
              flex: 1,
              padding: '0.8rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: formDescricao.trim() ? '#0284c7' : '#cbd5e1',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: formDescricao.trim() ? 'pointer' : 'not-allowed',
              boxShadow: formDescricao.trim() ? '0 2px 6px rgba(2, 132, 199, 0.3)' : 'none'
            }}
          >
            {formIsSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // TELA 3: DETALHES DA CAMPANHA DE CAMPO (PRINT 2)
  // ============================================================
  if (currentScreen === 'campaign_details') {
    return (
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {/* Header Superior */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          padding: '0.9rem 1.1rem',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <button
            onClick={() => setCurrentScreen('map')}
            style={{
              background: 'none',
              border: 'none',
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Detalhes
          </h2>
        </div>

        {/* Grid 2x3 de Cartões de Métricas (Print 2) */}
        <div style={{
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.85rem'
        }}>
          
          {/* Card 1: Novos Registros */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ color: '#10b981', display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}>
              <Cloud size={24} />
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              Novos Registros
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a' }}>
              {sessionNewRecordsCount}
            </div>
          </div>

          {/* Card 2: Históricos */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ color: '#10b981', display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}>
              <CheckCircle2 size={24} />
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              Históricos
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a' }}>
              0 / 1
            </div>
          </div>

          {/* Card 3: Distância */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ color: '#f59e0b', display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}>
              <Route size={24} />
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              Distância
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a' }}>
              {distanceTraveledMeters > 0 ? `${(distanceTraveledMeters / 1000).toFixed(1)} km` : '-'}
            </div>
          </div>

          {/* Card 4: Tempo gasto */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ color: '#06b6d4', display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}>
              <Clock size={24} />
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              Tempo gasto
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a' }}>
              {mobileInspectionService.formatTimeSpent(timeSpentSeconds)}
            </div>
          </div>

          {/* Card 5: Checkpoints */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ color: '#8b5cf6', display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}>
              <MapPin size={24} />
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              Checkpoints
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a' }}>
              0 / {checkpoints.length}
            </div>
          </div>

          {/* Card 6: Roteiro planejado */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ color: '#0284c7', display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}>
              <Calendar size={24} />
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              Roteiro planejado
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a' }}>
              Não
            </div>
          </div>

        </div>

        {/* Card Inferior: Live Inspection (Print 2) */}
        <div style={{ padding: '0 1.25rem 1.5rem 1.25rem' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              color: '#0284c7',
              cursor: 'pointer'
            }} title="Sincronização contínua de telemetria">
              <Info size={18} />
            </div>

            <div style={{ color: isLiveInspectionActive ? '#10b981' : '#64748b', display: 'flex', justifyContent: 'center', marginBottom: '0.35rem' }}>
              <Zap size={24} />
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
              Live Inspection
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: isLiveInspectionActive ? '#10b981' : '#0f172a' }}>
              {isLiveInspectionActive ? 'Ativado' : 'Desativado'}
            </div>

            <button
              onClick={() => {
                const next = !isLiveInspectionActive;
                setIsLiveInspectionActive(next);
                const rules = storageService.getInspectionRules();
                storageService.saveInspectionRules({ ...rules, habilitarLiveInspection: next });
              }}
              style={{
                marginTop: '0.75rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#334155',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Alternar Live Inspection
            </button>
          </div>

          {/* Botões de Ação da Campanha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              onClick={() => {
                if (setSystemToast) {
                  setSystemToast({ type: 'success', message: 'Dados de campo transmitidos com sucesso!' });
                }
              }}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '12px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
              }}
            >
              Sincronizar Fila com a Web
            </button>

            <button
              onClick={() => {
                if (setSystemToast) {
                  setSystemToast({ type: 'info', message: 'Campanha de inspeção finalizada!' });
                }
                setCurrentScreen('select_structure');
              }}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                color: '#ef4444',
                border: '1.5px solid #ef4444',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Concluir Campanha de Campo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // TELA 4 & 5: MAPA DE CAMPO & DETALHE DE CHECKPOINT (PRINTS 3 E 5)
  // ============================================================
  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      height: '100vh',
      backgroundColor: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* ------------------------------------------------------------
          HEADER SUPERIOR DO MAPA DE INSPEÇÃO (PRINT 5)
          ------------------------------------------------------------ */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        background: 'linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0) 100%)'
      }}>
        {/* Botão Home */}
        <button
          onClick={() => setCurrentScreen('select_structure')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          <Home size={20} />
        </button>

        {/* Badge IN (Inspeção Ativa) */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: '#10b981',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: '0.9rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          IN
        </div>

        {/* Seletor da Estrutura Ativa */}
        <button
          onClick={() => setCurrentScreen('select_structure')}
          style={{
            flex: 1,
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0 0.85rem',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          <Building2 size={16} />
          <span>{selectedStructure?.nome || 'Barragem B1'}</span>
        </button>

        {/* Botão Configurações / Detalhes */}
        <button
          onClick={() => setCurrentScreen('campaign_details')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* ------------------------------------------------------------
          CONTAINER DO MAPA LEAFLET SATÉLITE
          ------------------------------------------------------------ */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#1e293b'
        }}
      />

      {/* ------------------------------------------------------------
          BOTÕES FLUTUANTES LATERAIS À DIREITA (PRINT 3 E 5)
          ------------------------------------------------------------ */}
      <div style={{
        position: 'absolute',
        top: '70px',
        right: '1rem',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem'
      }}>
        {/* Botão + (Adicionar Novo Registro) */}
        <button
          onClick={() => setCurrentScreen('new_record')}
          title="Nova Ocorrência / Sintoma"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)'
          }}
        >
          <Plus size={24} />
        </button>

        {/* Botão Fechar Seleção (se checkpoint estiver selecionado - Print 3) */}
        {currentScreen === 'checkpoint_detail' && (
          <button
            onClick={() => setCurrentScreen('map')}
            title="Fechar Detalhe"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
            }}
          >
            <X size={22} />
          </button>
        )}

        {/* Botão QR Code */}
        <button
          onClick={() => setShowQrModal(true)}
          title="Scanner de Marco QR"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            border: '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
          }}
        >
          <QrCode size={20} />
        </button>

        {/* Botão Trocar de Estrutura */}
        <button
          onClick={() => setCurrentScreen('select_structure')}
          title="Alternar Estrutura"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            border: '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
          }}
        >
          <Building2 size={20} />
        </button>
      </div>

      {/* ------------------------------------------------------------
          MODAL DE DETALHE DO CHECKPOINT (PRINT 3)
          ------------------------------------------------------------ */}
      {currentScreen === 'checkpoint_detail' && selectedCheckpoint && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          right: '1rem',
          zIndex: 600,
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
          animation: 'slideUp 0.25s ease-out'
        }}>
          {/* Header do Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 1.25rem 0.5rem 1.25rem'
          }}>
            <div style={{ color: '#0284c7' }}>
              <Search size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {selectedCheckpoint.nome}
            </h3>
          </div>

          <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', overflowY: 'auto' }}>
            {/* Imagem Ilustrativa / Guia de Enquadramento */}
            <div style={{
              width: '100%',
              height: '140px',
              borderRadius: '12px',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)',
                opacity: 0.95
              }} />
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: '#ffffff' }}>
                <Building2 size={42} style={{ opacity: 0.9, marginBottom: '0.2rem' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                  ENQUADRAMENTO GEOTÉCNICO OBRIGATÓRIO
                </div>
              </div>
            </div>

            {/* Metadados Técnicos do Checkpoint (Print 3) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="#0284c7" />
                <span style={{ fontWeight: 800, color: '#0f172a' }}>Data:</span>
                <span style={{ color: '#334155' }}>{selectedCheckpoint.data}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ThumbsUp size={16} color="#0284c7" />
                <span style={{ fontWeight: 800, color: '#0f172a' }}>É anomalia:</span>
                <span style={{ color: selectedCheckpoint.eAnomalia ? '#ef4444' : '#10b981', fontWeight: 800 }}>
                  {selectedCheckpoint.eAnomalia ? 'Sim' : 'Não'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem', marginTop: '-2px' }}>📝</span>
                <div>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>Condição Inicial: </span>
                  <span style={{ color: '#475569', lineHeight: 1.4 }}>
                    {selectedCheckpoint.condicaoInicial}
                  </span>
                </div>
              </div>
            </div>

            {/* Botões de Ação do Checkpoint */}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => {
                  setCurrentScreen('new_record');
                  setFormSintoma('Buraco');
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <Plus size={16} />
                <span>Registrar Anomalia</span>
              </button>

              <button
                onClick={() => {
                  if (setSystemToast) {
                    setSystemToast({ type: 'success', message: `${selectedCheckpoint.nome} validado com conformidade!` });
                  }
                  setCurrentScreen('map');
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <Check size={16} />
                <span>Conforme (Normal)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------
          BOTTOM SHEET / CARROSSEL INFERIOR DE CHECKPOINTS (PRINT 5)
          ------------------------------------------------------------ */}
      {currentScreen === 'map' && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 500,
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          padding: '0.65rem 1rem 1.25rem 1rem',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.2)'
        }}>
          {/* Handle de Arrasto */}
          <div style={{
            width: '40px',
            height: '4px',
            borderRadius: '999px',
            backgroundColor: '#cbd5e1',
            margin: '0 auto 0.75rem auto'
          }} />

          {/* Barra de Busca de Registros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.45rem 0.75rem'
            }}>
              <input
                type="text"
                value={searchCheckpointQuery}
                onChange={(e) => setSearchCheckpointQuery(e.target.value)}
                placeholder="Pesquisar registro"
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.82rem',
                  color: '#0f172a'
                }}
              />
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                marginLeft: '0.35rem'
              }}>
                {checkpointsFiltrados.length}
              </span>
            </div>

            <button
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              <ArrowUpDown size={16} />
            </button>
          </div>

          {/* Carrossel de Cards de Checkpoints (Print 5) */}
          <div style={{
            display: 'flex',
            gap: '0.85rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem'
          }}>
            {checkpointsFiltrados.map((cp) => (
              <div
                key={cp.id}
                onClick={() => {
                  setSelectedCheckpoint(cp);
                  setCurrentScreen('checkpoint_detail');
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo(cp.coords, 18, { duration: 0.8 });
                  }
                }}
                style={{
                  flexShrink: 0,
                  width: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
              >
                {/* Imagem do Card com Badges Thumbs Up e Distância */}
                <div style={{
                  width: '120px',
                  height: '100px',
                  borderRadius: '14px',
                  backgroundColor: '#3b82f6',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {/* Badge Thumbs Up */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0284c7',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    <ThumbsUp size={14} />
                  </div>

                  {/* Badge Distância */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '999px',
                    backgroundColor: '#10b981',
                    color: '#ffffff'
                  }}>
                    +999m
                  </div>
                </div>

                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginTop: '0.4rem',
                  textAlign: 'left'
                }}>
                  {cp.nome}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------
          MODAL DE LEITURA DE QR CODE
          ------------------------------------------------------------ */}
      {showQrModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '360px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Scanner de Tag QR / Marco
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
              Aproxime a câmera do marco físico na crista para validar presença
            </p>

            <div style={{
              width: '180px',
              height: '180px',
              margin: '0 auto 1.25rem auto',
              border: '2px solid #0284c7',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              backgroundColor: '#f8fafc'
            }}>
              <QrCode size={110} color="#0284c7" />
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={() => setShowQrModal(false)}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '10px',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowQrModal(false);
                  if (checkpoints.length > 0) {
                    setSelectedCheckpoint(checkpoints[0]);
                    setCurrentScreen('checkpoint_detail');
                  }
                  if (setSystemToast) {
                    setSystemToast({ type: 'success', message: 'Tag QR validada: Checkpoint 1 reconhecido!' });
                  }
                }}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '10px',
                  backgroundColor: '#0284c7',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Simular Leitura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

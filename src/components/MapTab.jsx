import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  Layers, 
  MapPin, 
  Filter, 
  Compass, 
  Crosshair, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Eye, 
  ClipboardEdit,
  Droplet,
  Sun,
  Building2,
  Search,
  X,
  RotateCcw
} from 'lucide-react';

export const MapTab = ({ onNavigateTab, onSelectInstrumentForReading }) => {
  const { structures, instruments, activeStructureId, selectStructure } = useGeotechData();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [mapType, setMapType] = useState('satellite'); // 'satellite' | 'streets'
  const [filterType, setFilterType] = useState('TODOS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [selectedInstrument, setSelectedInstrument] = useState(null);

  // Inicializar o mapa do Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centro padrão: Complexo Itaminas / Barragem B1
      const initialLat = -20.063818;
      const initialLon = -44.114360;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLon],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Layer de Satélite (Esri World Imagery)
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      });

      // Layer de Ruas / Terreno (OpenStreetMap)
      const streetsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      });

      satelliteLayer.addTo(map);
      mapInstanceRef.current = { map, satelliteLayer, streetsLayer };
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      // Manter instância viva ao alternar abas para performance instantânea
    };
  }, []);

  // Alternar camadas de satélite e ruas
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const { map, satelliteLayer, streetsLayer } = mapInstanceRef.current;

    if (mapType === 'satellite') {
      map.removeLayer(streetsLayer);
      map.addLayer(satelliteLayer);
    } else {
      map.removeLayer(satelliteLayer);
      map.addLayer(streetsLayer);
    }
  }, [mapType]);

  // Navegar suavemente para uma estrutura
  const handleSelectStructure = (structId) => {
    selectStructure(structId);

    // Se o instrumento selecionado não pertencer à nova estrutura, limpa seleção
    if (selectedInstrument && structId !== 'TODAS') {
      const instStruct = selectedInstrument.estrutura?.replace(/\s+/g, '_');
      if (instStruct !== structId && selectedInstrument.estrutura !== structId) {
        setSelectedInstrument(null);
      }
    }

    if (!mapInstanceRef.current?.map) return;
    const { map } = mapInstanceRef.current;

    if (structId === 'TODAS') {
      map.flyTo([-20.063818, -44.114360], 14, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    } else {
      const target = structures.find(s => s.id === structId);
      if (target && target.lat && target.lon) {
        map.flyTo([target.lat, target.lon], 16, {
          duration: 1.2,
          easeLinearity: 0.25
        });
      }
    }
  };

  // Navegar suavemente e focar em um instrumento específico
  const handleSelectInstrument = (inst) => {
    if (!inst) {
      setSelectedInstrument(null);
      return;
    }

    setSelectedInstrument(inst);

    if (mapInstanceRef.current?.map && inst.lat && inst.lon) {
      mapInstanceRef.current.map.flyTo([inst.lat, inst.lon], 18, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  };

  // Filtragem dos instrumentos para exibição e navegação
  const filteredInstruments = useMemo(() => {
    return instruments.filter(inst => {
      if (!inst.lat || !inst.lon) return false;
      if (activeStructureId !== 'TODAS' && 
          inst.estrutura?.replace(/\s+/g, '_') !== activeStructureId && 
          inst.estrutura !== activeStructureId) {
        return false;
      }
      if (filterType !== 'TODOS' && inst.tipo !== filterType) {
        return false;
      }
      if (filterStatus !== 'TODOS' && inst.statusCalculado !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [instruments, activeStructureId, filterType, filterStatus]);

  // Atualizar marcadores no mapa com animações e destaque do selecionado
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    // 1. Plotar centros das 8 estruturas
    structures.forEach(struct => {
      if (struct.lat && struct.lon) {
        const isCurrentActive = activeStructureId === struct.id;

        const structIcon = L.divIcon({
          className: 'structure-map-badge',
          html: `
            <div style="
              background: rgba(15, 23, 42, 0.92);
              border: 2px solid ${isCurrentActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.6)'};
              border-radius: 8px;
              padding: 4px 10px;
              color: #ffffff;
              font-family: 'Inter', sans-serif;
              font-size: 11px;
              font-weight: 700;
              box-shadow: ${isCurrentActive ? '0 0 16px rgba(56, 189, 248, 0.6)' : '0 4px 12px rgba(0,0,0,0.5)'};
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 6px;
              cursor: pointer;
              transform: translate(-50%, -50%);
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            ">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${isCurrentActive ? '#38bdf8' : '#10b981'}; display: inline-block;"></span>
              ${struct.nome}
            </div>
          `,
          iconSize: [0, 0]
        });

        const structMarker = L.marker([struct.lat, struct.lon], { icon: structIcon });
        structMarker.on('click', () => {
          handleSelectStructure(struct.id);
        });
        layer.addLayer(structMarker);
      }
    });

    // 2. Plotar os instrumentos filtrados
    filteredInstruments.forEach(inst => {
      const isSelected = selectedInstrument && selectedInstrument.id === inst.id;
      let markerClass = isSelected ? 'marker-selected' : 'marker-normal';
      let dotColor = '#10b981';

      if (inst.statusCalculado === 'EMERGÊNCIA') {
        if (!isSelected) markerClass = 'marker-emergencia';
        dotColor = '#ef4444';
      } else if (inst.statusCalculado === 'ALERTA') {
        if (!isSelected) markerClass = 'marker-alerta';
        dotColor = '#f97316';
      } else if (inst.statusCalculado === 'ATENÇÃO') {
        if (!isSelected) markerClass = 'marker-atencao';
        dotColor = '#f59e0b';
      }

      const instIcon = L.divIcon({
        className: 'custom-geo-marker-wrapper',
        html: `
          <div class="custom-geo-marker ${markerClass}" style="
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            background-color: ${dotColor};
            border: ${isSelected ? '3px solid #38bdf8' : '2px solid #ffffff'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '11px' : '10px'};
            font-weight: 800;
            color: #ffffff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          ">
            ${inst.tipo === 'INA' ? 'IN' : inst.tipo === 'PZ' ? 'PZ' : inst.tipo === 'MV' ? 'MV' : inst.tipo.slice(0, 2)}
          </div>
        `,
        iconSize: [isSelected ? 32 : 26, isSelected ? 32 : 26],
        iconAnchor: [isSelected ? 16 : 13, isSelected ? 16 : 13]
      });

      const marker = L.marker([inst.lat, inst.lon], { icon: instIcon });
      
      marker.on('click', () => {
        handleSelectInstrument(inst);
      });

      layer.addLayer(marker);
    });
  }, [structures, filteredInstruments, activeStructureId, selectedInstrument]);

  // Tipos únicos de instrumentos
  const availableTypes = ['TODOS', 'INA', 'PZ', 'MV', 'VT', 'TILT', 'REF', 'ETR'];

  return (
    <div className="animate-page-enter" style={{ 
      position: 'relative', 
      width: '100%', 
      height: 'calc(100vh - 130px)', 
      minHeight: '550px', 
      borderRadius: '12px', 
      overflow: 'hidden', 
      border: '1px solid var(--border-medium)' 
    }}>
      {/* Contêiner Leaflet */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Painel Flutuante Superior de Controles e Filtros de Navegação */}
      <div className="glass-panel" style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        maxWidth: '1100px',
        padding: '0.65rem 1rem',
        borderRadius: '12px',
        zIndex: 1000,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.6rem 0.8rem',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-medium)',
        transition: 'all 0.3s ease'
      }}>
        {/* 1. Alternador de Camada (Satélite / Terreno) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Layers size={16} style={{ color: 'var(--primary-accent)' }} />
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setMapType('satellite')}
              style={{
                padding: '0.25rem 0.55rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '5px',
                backgroundColor: mapType === 'satellite' ? 'var(--primary-accent)' : 'transparent',
                color: mapType === 'satellite' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              Satélite
            </button>
            <button
              onClick={() => setMapType('streets')}
              style={{
                padding: '0.25rem 0.55rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '5px',
                backgroundColor: mapType === 'streets' ? 'var(--primary-accent)' : 'transparent',
                color: mapType === 'streets' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              Terreno / Ruas
            </button>
          </div>
        </div>

        {/* 2. Filtro e Navegação por Estrutura */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Building2 size={16} style={{ color: activeStructureId !== 'TODAS' ? 'var(--primary-accent)' : 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estrutura:</span>
          <select
            value={activeStructureId}
            onChange={(e) => handleSelectStructure(e.target.value)}
            className="form-select"
            style={{ 
              padding: '0.25rem 0.55rem', 
              fontSize: '0.75rem', 
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '6px',
              border: activeStructureId !== 'TODAS' ? '1px solid var(--primary-accent)' : '1px solid var(--border-subtle)',
              fontWeight: activeStructureId !== 'TODAS' ? 700 : 500,
              maxWidth: '190px'
            }}
          >
            <option value="TODAS">Todas as Estruturas ({structures.length})</option>
            {structures.map(s => {
              const count = instruments.filter(i => 
                (i.estrutura?.replace(/\s+/g, '_') === s.id || i.estrutura === s.id || i.estrutura === s.nome)
              ).length;
              return (
                <option key={s.id} value={s.id}>
                  {s.nome} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* 3. Filtro e Navegação Direta por Instrumento */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Crosshair size={16} style={{ color: selectedInstrument ? 'var(--primary-accent)' : 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Instrumento:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <select
              value={selectedInstrument ? (selectedInstrument.uid || `${selectedInstrument.estrutura}_${selectedInstrument.id}`) : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  setSelectedInstrument(null);
                } else {
                  const inst = instruments.find(i => (i.uid === val || `${i.estrutura}_${i.id}` === val || i.id === val));
                  if (inst) handleSelectInstrument(inst);
                }
              }}
              className="form-select"
              style={{ 
                padding: '0.25rem 0.55rem', 
                fontSize: '0.75rem', 
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '6px',
                border: selectedInstrument ? '1px solid var(--primary-accent)' : '1px solid var(--border-subtle)',
                fontWeight: selectedInstrument ? 700 : 500,
                maxWidth: '200px'
              }}
            >
              <option value="">
                {filteredInstruments.length === 0 
                  ? 'Nenhum instrumento' 
                  : `Navegar p/ Instrumento (${filteredInstruments.length})...`}
              </option>
              {filteredInstruments.map((inst, idx) => {
                const uniqueVal = inst.uid || `${inst.estrutura}_${inst.id}`;
                return (
                  <option key={`opt-inst-${uniqueVal}-${idx}`} value={uniqueVal}>
                    {inst.id} • {inst.tipo} ({inst.estrutura}) - {inst.statusCalculado}
                  </option>
                );
              })}
            </select>
            {selectedInstrument && (
              <button
                onClick={() => setSelectedInstrument(null)}
                title="Limpar seleção de instrumento"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '11px',
                  padding: 0
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 4. Filtro por Tipo de Instrumento */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tipo:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-select"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}
          >
            {availableTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* 5. Filtro por Status de Segurança */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-select"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}
          >
            <option value="TODOS">Todos</option>
            <option value="NORMAL">Normal</option>
            <option value="ATENÇÃO">Atenção</option>
            <option value="ALERTA">Alerta</option>
            <option value="EMERGÊNCIA">Emergência</option>
          </select>
        </div>

        {/* 6. Botão Visão Geral com Transição Suave */}
        <button
          onClick={() => {
            handleSelectStructure('TODAS');
            setSelectedInstrument(null);
          }}
          className="btn-secondary"
          title="Resetar visualização para todo o complexo minerário"
          style={{ 
            padding: '0.3rem 0.65rem', 
            fontSize: '0.75rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.35rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Compass size={14} style={{ color: 'var(--primary-accent)' }} />
          <span>Visão Geral</span>
        </button>
      </div>

      {/* Legenda Flutuante Inferior Esquerda */}
      <div className="glass-panel hide-mobile" style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        padding: '0.65rem 0.85rem',
        borderRadius: '8px',
        zIndex: 1000,
        fontSize: '0.72rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-medium)'
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <MapPin size={13} style={{ color: 'var(--primary-accent)' }} />
          <span>Legenda Georreferenciada</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--geo-normal)' }}></span>
          <span>Normal (Operação Estável)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--geo-atencao)' }}></span>
          <span>Atenção Operacional</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--geo-alerta)' }}></span>
          <span>Alerta Geotécnico</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--geo-emergencia)' }}></span>
          <span>Emergência (PAEBM)</span>
        </div>
      </div>

      {/* Cartão Flutuante Lateral de Detalhes do Instrumento Clicado / Selecionado */}
      {selectedInstrument && (
        <div className="card-panel glass-panel animate-page-enter" style={{
          position: 'absolute',
          top: '80px',
          right: '16px',
          width: '330px',
          maxWidth: 'calc(100vw - 32px)',
          zIndex: 1000,
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 700, 
                color: 'var(--primary-accent)', 
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {selectedInstrument.estrutura}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', margin: '3px 0' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {selectedInstrument.tipo} - {selectedInstrument.id}
                </h3>
                {selectedInstrument.condicaoHistorica === 'NA' && (
                  <span className="badge-na-water" style={{ padding: '0.15rem 0.5rem', fontSize: '0.68rem' }}>
                    <Droplet size={11} className="water-drip-1" fill="#38bdf8" />
                    <span>N.A.</span>
                  </span>
                )}
                {selectedInstrument.condicaoHistorica === 'SECO' && (
                  <span className="badge-seco-animated" style={{ padding: '0.15rem 0.5rem', fontSize: '0.68rem' }}>
                    <Sun size={11} className="seco-icon-spin" />
                    <span>SECO</span>
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Seção de Monitoramento: <strong style={{ color: 'var(--text-main)' }}>{selectedInstrument.secao || 'Geral'}</strong>
              </span>
            </div>
            <button
              onClick={() => setSelectedInstrument(null)}
              className="btn-icon"
              title="Fechar detalhes"
              style={{ width: '28px', height: '28px', borderRadius: '50%' }}
            >
              ✕
            </button>
          </div>

          <div style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status de Segurança:</span>
            <span className={`badge-status ${selectedInstrument.statusCalculado === 'EMERGÊNCIA' ? 'badge-emergencia' : selectedInstrument.statusCalculado === 'ATENÇÃO' ? 'badge-atencao' : 'badge-normal'}`}>
              {selectedInstrument.statusCalculado}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
            <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-faint)', fontSize: '0.68rem' }}>Cota Topo</div>
              <strong className="font-mono">{selectedInstrument.cotaTopo || '-'} m</strong>
            </div>
            <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-faint)', fontSize: '0.68rem' }}>Cota Base</div>
              <strong className="font-mono">{selectedInstrument.cotaBase || '-'} m</strong>
            </div>
            <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-faint)', fontSize: '0.68rem' }}>Última Leitura / Cota</div>
              <strong className="font-mono" style={{ color: 'var(--primary-accent)' }}>
                {selectedInstrument.ultimaCota ? `${selectedInstrument.ultimaCota} m` : 'Sem leitura'}
              </strong>
            </div>
            <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-faint)', fontSize: '0.68rem' }}>Profundidade</div>
              <strong className="font-mono">{selectedInstrument.profundidadeInstalacao || '-'} m</strong>
            </div>
          </div>

          {/* Limiares Geotécnicos */}
          <div style={{ fontSize: '0.72rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Limites de Controle:</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--geo-atencao)' }}>
              <span>Atenção:</span> <strong>{selectedInstrument.limiteAtencao || '-'} m</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--geo-emergencia)' }}>
              <span>Emergência:</span> <strong>{selectedInstrument.limiteEmergencia || '-'} m</strong>
            </div>
          </div>

          {/* Ações Rápidas Operacionais */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              onClick={() => {
                if (onSelectInstrumentForReading) {
                  onSelectInstrumentForReading(selectedInstrument);
                }
                onNavigateTab('campo');
              }}
              className="btn-primary"
              style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <ClipboardEdit size={14} />
              <span>Coletar Leitura</span>
            </button>
            <button
              onClick={() => onNavigateTab('piezometria')}
              className="btn-secondary"
              style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <Eye size={14} />
              <span>Gráficos</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

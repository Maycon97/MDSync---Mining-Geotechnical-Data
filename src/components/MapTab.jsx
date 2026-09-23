import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { useGeotechData } from '../context/GeotechDataContext';
import { STRUCTURE_BOUNDARIES, STRUCTURE_CATEGORIES } from '../data/structureBoundaries';
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
  RotateCcw,
  Sliders,
  Maximize2
} from 'lucide-react';

export const MapTab = ({ onNavigateTab, onSelectInstrumentForReading }) => {
  const { structures, instruments, activeStructureId, selectStructure } = useGeotechData();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const polygonsLayerRef = useRef(null);

  // Estados de Configuração da Planta GIS
  const [mapType, setMapType] = useState('satellite_google'); // 'satellite_google' | 'satellite_esri' | 'topo' | 'streets' | 'dark'
  const [filterType, setFilterType] = useState('TODOS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [useClustering, setUseClustering] = useState(true);
  const [showPerimeters, setShowPerimeters] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cursorCoords, setCursorCoords] = useState(null);
  const [mapZoom, setMapZoom] = useState(15);

  // Inicializar o mapa Leaflet com ciclo de vida robusto e camadas anti-blecaute
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Destruir mapa anterior se ainda estiver associado
    if (mapInstanceRef.current?.map) {
      try {
        mapInstanceRef.current.map.remove();
      } catch (e) {
        console.warn('Erro ao remover mapa anterior:', e);
      }
      mapInstanceRef.current = null;
    }

    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    // Coordenadas Centrais do Complexo Minerário Itaminas (Barragem B1 / Mina de Ferro)
    const initialLat = -20.063818;
    const initialLon = -44.114360;

    const map = L.map(container, {
      center: [initialLat, initialLon],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true,
      zoomAnimation: true
    });

    // Controles Oficiais Leaflet (Zoom no canto inferior direito e escala métrica no inferior esquerdo)
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);

    // ========================================================
    // Definição das Camadas Geoespaciais com Resiliência Total
    // ========================================================

    // 1. Google Satélite Híbrido HD (Com estradas, acessos e resolução de até 0.5m)
    const satelliteGoogleLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: 'Google Satellite Hybrid'
    });

    // 2. Esri World Imagery (Imagens Satelitais Analíticas)
    const satelliteEsriLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Esri World Imagery'
    });

    // 3. Topografia & Relevo com Curvas (CartoDB Voyager)
    const topoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; CARTO & OpenStreetMap'
    });

    // 4. Ruas & Logística Viária (OpenStreetMap)
    const streetsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    });

    // 5. Dark Mode Geotécnico (Alto contraste para centros de controle)
    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; CARTO'
    });

    // Camadas de Vetores (Polígonos das Estruturas e Marcadores de Instrumentos)
    const polygonsLayer = L.layerGroup().addTo(map);
    
    // Função utilitária para criar agrupador com fallback seguro
    const createLayerGroupOrCluster = (clustered) => {
      if (clustered && typeof L.markerClusterGroup === 'function') {
        return L.markerClusterGroup({
          maxClusterRadius: 40,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          iconCreateFunction: (cluster) => {
            const markers = cluster.getAllChildMarkers();
            const count = markers.length;
            let worstClass = 'cluster-normal';
            for (const m of markers) {
              if (m.options.geoStatus === 'EMERGÊNCIA') {
                worstClass = 'cluster-emergencia';
                break;
              }
              if (m.options.geoStatus === 'ALERTA') {
                worstClass = 'cluster-alerta';
              } else if (m.options.geoStatus === 'ATENÇÃO' && worstClass !== 'cluster-alerta') {
                worstClass = 'cluster-atencao';
              }
            }
            return L.divIcon({
              html: `<div class="custom-geo-cluster ${worstClass}" style="width: 38px; height: 38px; font-size: 11px;">${count}</div>`,
              className: 'custom-cluster-icon',
              iconSize: [38, 38]
            });
          }
        });
      }
      return L.layerGroup();
    };

    const markersGroup = createLayerGroupOrCluster(useClustering);
    markersGroup.addTo(map);

    // Registro das instâncias
    mapInstanceRef.current = {
      map,
      layers: {
        satellite_google: satelliteGoogleLayer,
        satellite_esri: satelliteEsriLayer,
        topo: topoLayer,
        streets: streetsLayer,
        dark: darkLayer
      },
      currentLayer: null,
      createLayerGroupOrCluster
    };
    markersLayerRef.current = markersGroup;
    polygonsLayerRef.current = polygonsLayer;

    // Adiciona a camada inicial selecionada
    const initialLayer = mapInstanceRef.current.layers[mapType] || satelliteGoogleLayer;
    initialLayer.addTo(map);
    mapInstanceRef.current.currentLayer = initialLayer;

    // Rastreamento de coordenadas do cursor e nível de zoom em tempo real
    map.on('mousemove', (e) => {
      setCursorCoords({ lat: e.latlng.lat.toFixed(6), lon: e.latlng.lng.toFixed(6) });
    });
    map.on('zoomend', () => {
      setMapZoom(map.getZoom());
    });

    // Múltiplos invalidates debounced para adaptação perfeita a qualquer viewport
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 350);
    const t3 = setTimeout(() => map.invalidateSize(), 800);

    let resizeObserver = null;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        try {
          map.invalidateSize();
        } catch (e) {}
      });
      resizeObserver.observe(container);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (resizeObserver) resizeObserver.disconnect();
      try {
        map.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      polygonsLayerRef.current = null;
    };
  }, []);

  // Alternar Camadas de Fundo (Satélite Google, Esri, Topo, Ruas, Dark)
  useEffect(() => {
    if (!mapInstanceRef.current?.map) return;
    const { map, layers, currentLayer } = mapInstanceRef.current;
    const nextLayer = layers[mapType] || layers.satellite_google;

    if (currentLayer && map.hasLayer(currentLayer)) {
      map.removeLayer(currentLayer);
    }

    nextLayer.addTo(map);
    mapInstanceRef.current.currentLayer = nextLayer;
    map.invalidateSize();
  }, [mapType]);

  // Alternar Modo de Agrupamento (Clusters vs Individual)
  useEffect(() => {
    if (!mapInstanceRef.current?.map) return;
    const { map, createLayerGroupOrCluster } = mapInstanceRef.current;

    if (markersLayerRef.current && map.hasLayer(markersLayerRef.current)) {
      map.removeLayer(markersLayerRef.current);
    }

    const newGroup = createLayerGroupOrCluster(useClustering);
    newGroup.addTo(map);
    markersLayerRef.current = newGroup;

    // Re-renderizar marcadores no novo grupo
    renderMarkers();
  }, [useClustering]);

  // Filtragem dos instrumentos
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

  // Sugestões de busca por instrumentos para autocomplete instantâneo
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return instruments
      .filter(i => (
        i.id?.toLowerCase().includes(q) || 
        i.tipo?.toLowerCase().includes(q) || 
        i.estrutura?.toLowerCase().includes(q)
      ))
      .slice(0, 8);
  }, [instruments, searchQuery]);

  // Navegar e focar em uma estrutura
  const handleSelectStructure = useCallback((structId) => {
    selectStructure(structId);

    if (selectedInstrument && structId !== 'TODAS') {
      const instStruct = selectedInstrument.estrutura?.replace(/\s+/g, '_');
      if (instStruct !== structId && selectedInstrument.estrutura !== structId) {
        setSelectedInstrument(null);
      }
    }

    if (!mapInstanceRef.current?.map) return;
    const { map } = mapInstanceRef.current;

    if (structId === 'TODAS') {
      map.flyTo([-20.063818, -44.114360], 14, { duration: 1.2 });
    } else {
      const boundary = STRUCTURE_BOUNDARIES.find(b => b.id === structId);
      const struct = structures.find(s => s.id === structId);
      const targetCenter = boundary?.center || (struct?.lat && struct?.lon ? [struct.lat, struct.lon] : null);
      if (targetCenter) {
        map.flyTo(targetCenter, 16, { duration: 1.2 });
      }
    }
  }, [selectStructure, selectedInstrument, structures]);

  // Navegar suavemente e focar no instrumento selecionado
  const handleSelectInstrument = useCallback((inst) => {
    if (!inst) {
      setSelectedInstrument(null);
      return;
    }
    setSelectedInstrument(inst);
    setSearchQuery('');

    if (mapInstanceRef.current?.map && inst.lat && inst.lon) {
      mapInstanceRef.current.map.flyTo([inst.lat, inst.lon], 18, {
        duration: 1.1,
        easeLinearity: 0.25
      });
    }
  }, []);

  // Renderizar Perímetros das 8 Estruturas da Mina
  useEffect(() => {
    if (!polygonsLayerRef.current || !mapInstanceRef.current?.map) return;
    const layer = polygonsLayerRef.current;
    layer.clearLayers();

    if (!showPerimeters) return;

    STRUCTURE_BOUNDARIES.forEach(boundary => {
      const isSelected = activeStructureId === boundary.id;
      const catConfig = STRUCTURE_CATEGORIES[boundary.categoria] || STRUCTURE_CATEGORIES.BARRAGEM;

      // 1. Polígono de Perímetro
      if (boundary.coordinates && boundary.coordinates.length > 0) {
        const polygon = L.polygon(boundary.coordinates, {
          color: isSelected ? '#38bdf8' : boundary.cor || catConfig.color,
          weight: isSelected ? 3 : 2,
          fillColor: boundary.fillColor || catConfig.fillColor,
          fillOpacity: isSelected ? 0.35 : boundary.fillOpacity || 0.22,
          dashArray: isSelected ? null : '4, 6'
        });

        polygon.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 11px; padding: 2px 4px;">
            <strong>${boundary.nome}</strong><br/>
            <span style="color: #64748b;">${catConfig.label}</span>
          </div>
        `, { sticky: true, opacity: 0.95 });

        polygon.on('click', () => {
          handleSelectStructure(boundary.id);
        });

        layer.addLayer(polygon);
      }

      // 2. Linha de Crista (se aplicável para barragens)
      if (boundary.crestLine && boundary.crestLine.length > 0) {
        const crest = L.polyline(boundary.crestLine, {
          color: '#ffffff',
          weight: 3,
          opacity: 0.85,
          dashArray: '3, 4'
        });
        crest.bindTooltip(`Crista ${boundary.nome} (Cota ${boundary.cotaCrista || '-'}m)`, { sticky: true });
        layer.addLayer(crest);
      }
    });
  }, [showPerimeters, activeStructureId, handleSelectStructure]);

  // Função para renderizar marcadores de instrumentos
  const renderMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    // 1. Badges das Estruturas da Mina
    structures.forEach(struct => {
      if (struct.lat && struct.lon) {
        const isCurrentActive = activeStructureId === struct.id;
        const structIcon = L.divIcon({
          className: 'structure-map-badge',
          html: `
            <div style="
              background: rgba(15, 23, 42, 0.94);
              border: 2px solid ${isCurrentActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.7)'};
              border-radius: 8px;
              padding: 4px 10px;
              color: #ffffff;
              font-family: 'Inter', sans-serif;
              font-size: 11px;
              font-weight: 700;
              box-shadow: ${isCurrentActive ? '0 0 20px rgba(56, 189, 248, 0.7)' : '0 4px 12px rgba(0,0,0,0.5)'};
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 6px;
              cursor: pointer;
              transform: translate(-50%, -50%);
              backdrop-filter: blur(8px);
              transition: all 0.25s ease;
            ">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${isCurrentActive ? '#38bdf8' : '#10b981'}; display: inline-block;"></span>
              ${struct.nome}
            </div>
          `,
          iconSize: [0, 0]
        });

        const structMarker = L.marker([struct.lat, struct.lon], { icon: structIcon });
        structMarker.on('click', () => handleSelectStructure(struct.id));
        layer.addLayer(structMarker);
      }
    });

    // 2. Marcadores dos Instrumentos Geotécnicos
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
            width: ${isSelected ? '34px' : '26px'};
            height: ${isSelected ? '34px' : '26px'};
            background-color: ${dotColor};
            border: ${isSelected ? '3px solid #38bdf8' : '2px solid #ffffff'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '11px' : '10px'};
            font-weight: 800;
            color: #ffffff;
            box-shadow: 0 3px 10px rgba(0,0,0,0.55);
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          ">
            ${inst.tipo === 'INA' ? 'IN' : inst.tipo === 'PZ' ? 'PZ' : inst.tipo === 'MV' ? 'MV' : inst.tipo.slice(0, 2)}
          </div>
        `,
        iconSize: [isSelected ? 34 : 26, isSelected ? 34 : 26],
        iconAnchor: [isSelected ? 17 : 13, isSelected ? 17 : 13]
      });

      const marker = L.marker([inst.lat, inst.lon], { 
        icon: instIcon,
        geoStatus: inst.statusCalculado || 'NORMAL'
      });
      
      marker.on('click', () => handleSelectInstrument(inst));
      layer.addLayer(marker);
    });
  }, [structures, filteredInstruments, activeStructureId, selectedInstrument, handleSelectStructure, handleSelectInstrument]);

  // Atualizar marcadores quando filtros ou seleção mudarem
  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  // Tipos únicos de instrumentos para filtro
  const availableTypes = ['TODOS', 'INA', 'PZ', 'MV', 'VT', 'TILT', 'REF', 'ETR'];

  return (
    <div className="animate-page-enter" style={{ 
      position: 'relative', 
      width: '100%', 
      height: 'calc(100vh - 130px)', 
      minHeight: '600px', 
      borderRadius: '14px', 
      overflow: 'hidden', 
      border: '1px solid var(--border-medium)',
      boxShadow: 'var(--shadow-xl)'
    }}>
      {/* Contêiner Leaflet Principal */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#090d16' }} />

      {/* ========================================================
          Barra Flutuante Superior: Filtros, Camadas e Busca
         ======================================================== */}
      <div className="glass-panel" style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        padding: '0.65rem 1rem',
        borderRadius: '12px',
        zIndex: 1000,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.6rem 0.8rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        border: '1px solid var(--border-medium)',
        backdropFilter: 'blur(16px)'
      }}>
        {/* 1. Alternador de Camada de Fundo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Layers size={16} style={{ color: 'var(--primary-accent)' }} />
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '2px', gap: '2px' }}>
            <button
              onClick={() => setMapType('satellite_google')}
              className={`btn-subtle ${mapType === 'satellite_google' ? 'active' : ''}`}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.74rem',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: mapType === 'satellite_google' ? 'var(--primary-accent)' : 'transparent',
                color: mapType === 'satellite_google' ? '#ffffff' : 'var(--text-muted)'
              }}
              title="Satélite Google Hybrid com resolução de alta precisão"
            >
              Satélite HD
            </button>
            <button
              onClick={() => setMapType('satellite_esri')}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.74rem',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: mapType === 'satellite_esri' ? 'var(--primary-accent)' : 'transparent',
                color: mapType === 'satellite_esri' ? '#ffffff' : 'var(--text-muted)'
              }}
              title="Esri World Imagery"
            >
              Satélite Esri
            </button>
            <button
              onClick={() => setMapType('topo')}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.74rem',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: mapType === 'topo' ? 'var(--primary-accent)' : 'transparent',
                color: mapType === 'topo' ? '#ffffff' : 'var(--text-muted)'
              }}
              title="Curvas de Relevo e Topografia"
            >
              Relevo / Topo
            </button>
            <button
              onClick={() => setMapType('streets')}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.74rem',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: mapType === 'streets' ? 'var(--primary-accent)' : 'transparent',
                color: mapType === 'streets' ? '#ffffff' : 'var(--text-muted)'
              }}
              title="Ruas & Logística"
            >
              Ruas
            </button>
            <button
              onClick={() => setMapType('dark')}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.74rem',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: mapType === 'dark' ? 'var(--primary-accent)' : 'transparent',
                color: mapType === 'dark' ? '#ffffff' : 'var(--text-muted)'
              }}
              title="Modo Escuro Geotécnico"
            >
              Dark
            </button>
          </div>
        </div>

        {/* 2. Seleção de Estrutura */}
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
              maxWidth: '180px'
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

        {/* 3. Campo de Busca Instantânea com Autocomplete */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '6px',
            padding: '0.2rem 0.5rem',
            border: '1px solid var(--border-subtle)',
            gap: '6px',
            width: '180px'
          }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Buscar (ex: PZ-01)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main)',
                fontSize: '0.75rem',
                width: '100%'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Menu Dropdown de Resultados da Busca */}
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 2000,
              maxHeight: '220px',
              overflowY: 'auto'
            }}>
              {searchResults.map(inst => (
                <div
                  key={inst.id}
                  onClick={() => handleSelectInstrument(inst)}
                  style={{
                    padding: '0.45rem 0.65rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div>
                    <strong style={{ color: 'var(--primary-accent)' }}>{inst.id}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px', fontSize: '0.7rem' }}>
                      ({inst.estrutura})
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    backgroundColor: inst.statusCalculado === 'EMERGÊNCIA' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: inst.statusCalculado === 'EMERGÊNCIA' ? '#ef4444' : '#10b981'
                  }}>
                    {inst.statusCalculado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Filtro por Tipo */}
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

        {/* 5. Filtro por Status */}
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

        {/* 6. Toggles de Camadas: Clusters & Perímetros */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => setUseClustering(!useClustering)}
            className={`btn-subtle ${useClustering ? 'active' : ''}`}
            style={{
              padding: '0.25rem 0.55rem',
              fontSize: '0.72rem',
              borderRadius: '6px',
              backgroundColor: useClustering ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-secondary)',
              color: useClustering ? 'var(--primary-accent)' : 'var(--text-muted)',
              border: useClustering ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border-subtle)'
            }}
            title="Alternar entre agrupamento inteligente de marcadores ou exibição de todos os pinos individuais"
          >
            {useClustering ? '● Clusters Ativos' : '○ Pinos Soltos'}
          </button>

          <button
            onClick={() => setShowPerimeters(!showPerimeters)}
            className={`btn-subtle ${showPerimeters ? 'active' : ''}`}
            style={{
              padding: '0.25rem 0.55rem',
              fontSize: '0.72rem',
              borderRadius: '6px',
              backgroundColor: showPerimeters ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
              color: showPerimeters ? '#10b981' : 'var(--text-muted)',
              border: showPerimeters ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)'
            }}
            title="Exibir/Ocultar os perímetros poligonais georreferenciados das 8 estruturas da mina"
          >
            {showPerimeters ? 'Perímetros On' : 'Perímetros Off'}
          </button>
        </div>

        {/* 7. Botão Visão Geral com Reset de Câmera */}
        <button
          onClick={() => {
            handleSelectStructure('TODAS');
            setSelectedInstrument(null);
          }}
          className="btn-secondary"
          title="Resetar câmera para visualização de todo o complexo minerário"
          style={{ 
            padding: '0.28rem 0.65rem', 
            fontSize: '0.75rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.35rem'
          }}
        >
          <Compass size={14} style={{ color: 'var(--primary-accent)' }} />
          <span>Visão Geral</span>
        </button>
      </div>

      {/* ========================================================
          HUD Inferior Esquerdo: Legenda e Coordenadas em Tempo Real
         ======================================================== */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {/* Painel de Coordenadas do Cursor */}
        {cursorCoords && (
          <div className="glass-panel" style={{
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span>LAT: <strong style={{ color: 'var(--text-main)' }}>{cursorCoords.lat}</strong></span>
            <span>LON: <strong style={{ color: 'var(--text-main)' }}>{cursorCoords.lon}</strong></span>
            <span>ZOOM: <strong style={{ color: 'var(--primary-accent)' }}>{mapZoom}x</strong></span>
          </div>
        )}

        {/* Legenda Georreferenciada */}
        <div className="glass-panel hide-mobile" style={{
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          fontSize: '0.72rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-medium)'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MapPin size={13} style={{ color: 'var(--primary-accent)' }} />
            <span>Legenda Geotécnica</span>
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
      </div>

      {/* ========================================================
          Card Flutuante Lateral: Detalhes do Instrumento Selecionado
         ======================================================== */}
      {selectedInstrument && (
        <div className="card-panel glass-panel animate-page-enter" style={{
          position: 'absolute',
          top: '80px',
          right: '16px',
          width: '340px',
          maxWidth: 'calc(100vw - 32px)',
          zIndex: 1000,
          boxShadow: 'var(--shadow-2xl)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          backdropFilter: 'blur(20px)',
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
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
                Seção: <strong style={{ color: 'var(--text-main)' }}>{selectedInstrument.secao || 'Geral'}</strong>
              </span>
            </div>
            <button
              onClick={() => setSelectedInstrument(null)}
              className="btn-icon"
              title="Fechar painel"
              style={{ width: '28px', height: '28px', borderRadius: '50%' }}
            >
              ✕
            </button>
          </div>

          {/* Status de Segurança e Limiar */}
          <div style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status Operacional:</span>
            <span className={`badge-status ${selectedInstrument.statusCalculado === 'EMERGÊNCIA' ? 'badge-emergencia' : selectedInstrument.statusCalculado === 'ATENÇÃO' ? 'badge-atencao' : 'badge-normal'}`}>
              {selectedInstrument.statusCalculado || 'NORMAL'}
            </span>
          </div>

          {/* Métricas e Cotas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
            <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-faint)', fontSize: '0.68rem' }}>Cota Topo (Boca)</div>
              <strong className="font-mono">{selectedInstrument.cotaTopo || '-'} m</strong>
            </div>
            <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-faint)', fontSize: '0.68rem' }}>Cota Base (Ponta)</div>
              <strong className="font-mono">{selectedInstrument.cotaBase || '-'} m</strong>
            </div>
            <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-faint)', fontSize: '0.68rem' }}>Última Leitura</div>
              <strong className="font-mono" style={{ color: 'var(--primary-accent)' }}>
                {selectedInstrument.ultimaCota ? `${selectedInstrument.ultimaCota} m` : 'Sem leitura'}
              </strong>
            </div>
            <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-faint)', fontSize: '0.68rem' }}>Profundidade</div>
              <strong className="font-mono">{selectedInstrument.profundidadeInstalacao || '-'} m</strong>
            </div>
          </div>

          {/* Limiares Geotécnicos de Alerta */}
          <div style={{ fontSize: '0.72rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Limites de Controle:</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--geo-atencao)' }}>
              <span>Atenção:</span> <strong>{selectedInstrument.limiteAtencao ? `${selectedInstrument.limiteAtencao} m` : '-'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--geo-emergencia)' }}>
              <span>Emergência:</span> <strong>{selectedInstrument.limiteEmergencia ? `${selectedInstrument.limiteEmergencia} m` : '-'}</strong>
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
              <span>Curvas Piezométricas</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

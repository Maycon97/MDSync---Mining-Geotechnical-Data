import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L, { 
  Map, 
  TileLayer, 
  Marker, 
  Circle, 
  Polygon, 
  Polyline, 
  Popup, 
  LayerGroup, 
  DivIcon, 
  Control 
} from '../utils/leafletCompat';
import { useGeotechData, normalizeStructureKey } from '../context/GeotechDataContext';
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
  Maximize2,
  ExternalLink,
  Wrench,
  Sparkles,
  ClipboardList,
  Save,
  Copy,
  Check,
  TrendingUp,
  CloudRain
} from 'lucide-react';
import { PLUVIOMETRIA_DATA } from '../data/pluviometriaData';
import { MapInspectionRecordDrawer } from './MapInspectionRecordDrawer';
import { MapInspectionDetailPanel } from './MapInspectionDetailPanel';
import { MapFloatingWidget } from './MapFloatingWidget';
import { RecordIdTemplateModal } from './RecordIdTemplateModal';
import { InspectionSettingsModal } from './InspectionSettingsModal';
import { SysdamEmpreendimentosPanel } from './SysdamEmpreendimentosPanel';
import { storageService } from '../services/storageService';
import { ENGENHO_SECO_SECTORS } from '../data/engenhoSecoBlockModelData';
import { EngenhoSecoBlockModelViewer } from './EngenhoSecoBlockModelViewer';
import { SumpsExecutivePanel } from './SumpsExecutivePanel';
import { SUMPS_DATA } from '../data/sumpsData';
import { chamadosSyncTunnel } from '../services/chamadosSyncTunnel';
import { createChamadoMarkerHtml, createChamadoPopupContent } from '../utils/chamadoMarkerFormatter';
import { createQgisPinMarkerHtml, resolveStructureDefaultColor } from '../utils/qgisPinFormatter';

// Conversor Geodésico de Alta Precisão WGS-84 / SIRGAS 2000 -> UTM Fuso 23S
function latLonToUtm23S(lat, lon) {
  if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) {
    return { easting: 0, northing: 0 };
  }
  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const e2 = 2 * f - f * f;
  const e_prime2 = e2 / (1 - e2);
  const k0 = 0.9996;
  const lon0 = -45.0 * Math.PI / 180;
  const phi = lat * Math.PI / 180;
  const lambda = lon * Math.PI / 180;

  const N = a / Math.sqrt(1 - e2 * Math.sin(phi) * Math.sin(phi));
  const T = Math.tan(phi) * Math.tan(phi);
  const C = e_prime2 * Math.cos(phi) * Math.cos(phi);
  const A = Math.cos(phi) * (lambda - lon0);

  const M = a * (
    (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * phi -
    (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2 * e2 / 1024) * Math.sin(2 * phi) +
    (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * phi) -
    (35 * e2 * e2 * e2 / 3072) * Math.sin(6 * phi)
  );

  const easting = 500000 + k0 * N * (A + (1 - T + C) * Math.pow(A, 3) / 6 + (5 - 18 * T + T * T + 72 * C - 58 * e_prime2) * Math.pow(A, 5) / 120);
  const northing = 10000000 + k0 * (M + N * Math.tan(phi) * (Math.pow(A, 2) / 2 + (5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4) / 24 + (61 - 58 * T + T * T + 600 * C - 330 * e_prime2) * Math.pow(A, 6) / 720));

  return { easting: Math.round(easting), northing: Math.round(northing) };
}

export const MapTab = ({ 
  onNavigateTab, 
  onSelectInstrumentForReading, 
  navigationContext, 
  onClearNavigationContext 
}) => {
  const { 
    structures = [], 
    instruments = [], 
    fluigTickets = [], 
    activeStructureId, 
    selectStructure,
    anomaliasGeotecnicas = [],
    sumps = [],
    setSystemToast 
  } = useGeotechData();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const polygonsLayerRef = useRef(null);
  const sumpsLayerRef = useRef(null);
  const pluviometriaLayerRef = useRef(null);

  // Estados dos SUMPs (Painel Executivo e Camada GIS)
  const [showSumps, setShowSumps] = useState(true);
  const [showSumpsPanel, setShowSumpsPanel] = useState(false);
  const [isSumpsPanelPinned, setIsSumpsPanelPinned] = useState(false);
  const [selectedSumpTag, setSelectedSumpTag] = useState(null);
  const [filterSumpMina, setFilterSumpMina] = useState('Todas');
  const [filterSumpCrits, setFilterSumpCrits] = useState([]);
  const [filterSumpAnom, setFilterSumpAnom] = useState('Todas');

  // Camada de Estações Pluviométricas
  const [showPluviometria, setShowPluviometria] = useState(() => navigationContext?.focus === 'pluviometria');

  // Estados de Configuração da Planta GIS
  const [mapType, setMapType] = useState('satellite_google'); // 'satellite_google' | 'satellite_esri' | 'topo' | 'streets' | 'dark'
  const [filterType, setFilterType] = useState('TODOS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedInspectionRecord, setSelectedInspectionRecord] = useState(null);
  const [isRecordDrawerOpen, setIsRecordDrawerOpen] = useState(false);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [inspectionSettingsModalOpen, setInspectionSettingsModalOpen] = useState(false);
  const [blockModelModalOpen, setBlockModelModalOpen] = useState(false);

  const [useClustering, setUseClustering] = useState(true);
  const [showPerimeters, setShowPerimeters] = useState(true);
  const [showTickets, setShowTickets] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cursorCoords, setCursorCoords] = useState(null);
  const [mapZoom, setMapZoom] = useState(15);

  // Estados de Menus e Popovers Estratégicos
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showLegendPopover, setShowLegendPopover] = useState(false);

  // Estruturas e Empreendimentos Georreferenciados (Padrão Portal)
  const [estruturas, setEstruturas] = useState(() => storageService.getEstruturasEmpreendimento());

  useEffect(() => {
    const handleEstruturasChanged = () => {
      setEstruturas(storageService.getEstruturasEmpreendimento());
    };
    window.addEventListener('mdsync:estruturas-changed', handleEstruturasChanged);
    return () => window.removeEventListener('mdsync:estruturas-changed', handleEstruturasChanged);
  }, []);

  // Alvo para posicionamento direto de estrutura no mapa via clique
  const [locateStructureTarget, setLocateStructureTarget] = useState(null);
  const locateStructureTargetRef = useRef(null);
  useEffect(() => {
    locateStructureTargetRef.current = locateStructureTarget;
  }, [locateStructureTarget]);

  const [selectedEstrutura, setSelectedEstrutura] = useState(() => {
    return estruturas.find(e => e.id === activeStructureId || e.sigla === activeStructureId) || estruturas[0] || null;
  });
  const [isSiderCollapsed, setIsSiderCollapsed] = useState(true);
  const [isSiderFlipped, setIsSiderFlipped] = useState(false);
  const [isMapPresetModified, setIsMapPresetModified] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const structureTooltipsRef = useRef([]);
  const structuresLayerRef = useRef(null);

  // Catálogo unificado de estruturas (banco mestre + cadastradas pelo usuário com geolocalização)
  const allDisplayStructures = useMemo(() => {
    const structMap = new globalThis.Map();
    (structures || []).forEach(s => {
      const key = s.id || s.sigla;
      if (key) structMap.set(key, { ...s });
    });
    (estruturas || []).forEach(e => {
      const key = e.id || e.sigla;
      if (key) {
        const existing = structMap.get(key) || {};
        const lat = e.lat ?? e.coordenadas?.lat ?? existing.lat;
        const lon = e.lon ?? e.coordenadas?.lon ?? existing.lon;
        structMap.set(key, {
          ...existing,
          ...e,
          id: existing.id || e.id || e.sigla,
          sigla: e.sigla || existing.sigla || key,
          nome: e.nome || existing.nome || key,
          lat,
          lon,
          coordenadas: (lat && lon) ? { lat, lon } : (existing.coordenadas || e.coordenadas)
        });
      }
    });
    return Array.from(structMap.values());
  }, [structures, estruturas]);

  // Fechar popovers estratégicos com Escape ou clique externo
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest('.map-hud-popover') && !e.target.closest('.map-hud-trigger')) {
        setShowLayersMenu(false);
        setShowToolsMenu(false);
        setShowLegendPopover(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowLayersMenu(false);
        setShowToolsMenu(false);
        setShowLegendPopover(false);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Sincronizar selectedEstrutura quando activeStructureId mudar
  useEffect(() => {
    if (activeStructureId && activeStructureId !== 'TODAS') {
      const match = (estruturas || []).find(e => 
        e.id === activeStructureId || 
        e.sigla === activeStructureId || 
        normalizeStructureKey(e.id) === activeStructureId ||
        normalizeStructureKey(e.sigla) === activeStructureId ||
        activeStructureId.includes(e.sigla) ||
        (e.nome && activeStructureId.includes(e.nome.toUpperCase()))
      ) || (structures || []).find(s =>
        s.id === activeStructureId ||
        s.sigla === activeStructureId ||
        normalizeStructureKey(s.id) === activeStructureId ||
        normalizeStructureKey(s.sigla) === activeStructureId
      );
      if (match) {
        setSelectedEstrutura(match);
      }
    }
  }, [activeStructureId, estruturas, structures]);

  // Ocorrências / Anomalias de Inspeção Georreferenciadas (Padrão SYSDAM)
  const georeferencedAnomalies = useMemo(() => {
    return (anomaliasGeotecnicas || []).map(a => {
      let lat = a.coordenadas?.lat;
      let lon = a.coordenadas?.lon;
      if (!lat || !lon) {
        const norm = (a.estrutura || '').toUpperCase();
        const bound = STRUCTURE_BOUNDARIES.find(b => 
          norm.includes(b.id) || b.id.includes(norm) || (b.nome && norm.includes(b.nome.toUpperCase()))
        );
        if (bound && bound.center) {
          lat = bound.center[0];
          lon = bound.center[1];
        } else {
          lat = -20.063824;
          lon = -44.114686;
        }
      }
      return { ...a, lat, lon };
    }).filter(a => {
      if (activeStructureId !== 'TODAS') {
        const structNorm = (a.estrutura || '').toUpperCase().replace(/\s+/g, '_');
        if (!structNorm.includes(activeStructureId) && !activeStructureId.includes(structNorm)) {
          return false;
        }
      }
      return true;
    });
  }, [anomaliasGeotecnicas, activeStructureId]);

  // Chamados georreferenciados do Banco Central PCMI e Túnel Fluig
  const georeferencedTickets = useMemo(() => {
    const tunnelTickets = (typeof chamadosSyncTunnel !== 'undefined' && chamadosSyncTunnel?.getActiveTickets) 
      ? chamadosSyncTunnel.getActiveTickets() 
      : [];
    const all = [...(fluigTickets || [])];
    const seenProtos = new Set(all.map(t => String(t.protocolo || t.proto || t.id)));

    tunnelTickets.forEach(t => {
      const p = String(t.proto || t.protocolo || t.id);
      if (p && !seenProtos.has(p)) {
        seenProtos.add(p);
        all.push(t);
      }
    });

    return all.filter(t => {
      if (!t.lat || !t.lon) return false;
      if (activeStructureId !== 'TODAS') {
        const structNorm = (t.estrutura || t.estr || '').toUpperCase().replace(/\s+/g, '_');
        if (!structNorm.includes(activeStructureId) && !activeStructureId.includes(structNorm)) {
          return false;
        }
      }
      return true;
    });
  }, [fluigTickets, activeStructureId]);

  // Registra handler seguro para o clique no botão do balão Leaflet
  useEffect(() => {
    window.__handleSelectChamadoDetail = (proto) => {
      const target = String(proto).trim();
      const found = georeferencedTickets.find(x => 
        String(x.protocolo || x.proto || x.id).trim() === target
      );
      if (found) {
        setSelectedInstrument(null);
        setSelectedInspectionRecord(null);
        setSelectedTicket(found);
      }
    };
    return () => {
      delete window.__handleSelectChamadoDetail;
    };
  }, [georeferencedTickets]);

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
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Coordenadas Centrais do Complexo Minerário Itaminas (com suporte a navegação contextual e restauração de preset)
    let initialLat = -20.063818;
    let initialLon = -44.114360;
    let initialZoom = 15;

    if (navigationContext?.coords) {
      initialLat = navigationContext.coords[0];
      initialLon = navigationContext.coords[1];
      initialZoom = navigationContext.zoom || 17;
    } else if (navigationContext?.focus === 'pluviometria') {
      initialLat = -20.082;
      initialLon = -44.105;
      initialZoom = navigationContext.zoom || 15;
    } else if (navigationContext?.focus === 'block_model' || navigationContext?.structureId === 'ENGENHO_SECO') {
      initialLat = -20.095810;
      initialLon = -44.111803;
      initialZoom = navigationContext.zoom || 16;
    } else if (navigationContext?.locateStructureId) {
      const target = (estruturas || []).find(e => e.id === navigationContext.locateStructureId || e.sigla === navigationContext.locateStructureId) ||
                     (structures || []).find(s => s.id === navigationContext.locateStructureId || s.sigla === navigationContext.locateStructureId);
      const tLat = target?.lat ?? target?.coordenadas?.lat;
      const tLon = target?.lon ?? target?.coordenadas?.lon;
      if (tLat && tLon) {
        initialLat = tLat;
        initialLon = tLon;
        initialZoom = 16;
      }
    } else if (navigationContext?.structureId && navigationContext.structureId !== 'TODAS') {
      const bound = STRUCTURE_BOUNDARIES.find(b => b.id === navigationContext.structureId);
      const st = (estruturas || []).find(e => 
        e.id === navigationContext.structureId || 
        e.sigla === navigationContext.structureId || 
        normalizeStructureKey(e.id) === navigationContext.structureId || 
        normalizeStructureKey(e.sigla) === navigationContext.structureId
      ) || (structures || []).find(s => 
        s.id === navigationContext.structureId || 
        s.sigla === navigationContext.structureId || 
        normalizeStructureKey(s.id) === navigationContext.structureId || 
        normalizeStructureKey(s.sigla) === navigationContext.structureId
      );
      const lat = st?.lat ?? st?.coordenadas?.lat;
      const lon = st?.lon ?? st?.coordenadas?.lon;
      const center = (lat && lon) ? [lat, lon] : (bound?.center || null);
      if (center) {
        initialLat = center[0];
        initialLon = center[1];
        initialZoom = navigationContext.zoom || 16;
      }
    } else if (activeStructureId && activeStructureId !== 'TODAS') {
      const bound = STRUCTURE_BOUNDARIES.find(b => b.id === activeStructureId);
      const st = (estruturas || []).find(e => 
        e.id === activeStructureId || 
        e.sigla === activeStructureId || 
        normalizeStructureKey(e.id) === activeStructureId || 
        normalizeStructureKey(e.sigla) === activeStructureId
      ) || (structures || []).find(s => 
        s.id === activeStructureId || 
        s.sigla === activeStructureId || 
        normalizeStructureKey(s.id) === activeStructureId || 
        normalizeStructureKey(s.sigla) === activeStructureId
      );
      const lat = st?.lat ?? st?.coordenadas?.lat;
      const lon = st?.lon ?? st?.coordenadas?.lon;
      const center = (lat && lon) ? [lat, lon] : (bound?.center || null);
      if (center) {
        initialLat = center[0];
        initialLon = center[1];
        initialZoom = 16;
      }
    } else {
      try {
        const savedPresetRaw = localStorage.getItem('mdsync_map_preset');
        if (savedPresetRaw) {
          const preset = JSON.parse(savedPresetRaw);
          if (preset.center && Array.isArray(preset.center) && preset.center.length === 2) {
            initialLat = preset.center[0];
            initialLon = preset.center[1];
          }
          if (preset.zoom && typeof preset.zoom === 'number') {
            initialZoom = preset.zoom;
          }
        }
      } catch (e) {
        console.warn('Erro ao restaurar preset do mapa:', e);
      }
    }

    let map;
    try {
      map = new Map(container, {
        center: [initialLat, initialLon],
        zoom: initialZoom,
        maxZoom: 20,
        minZoom: 3,
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: true,
        zoomAnimation: true
      });
    } catch (e) {
      console.error('[MapTab] Falha ao criar instância Leaflet:', e);
      return;
    }

    // Controles Oficiais Leaflet (Zoom no canto inferior direito e escala métrica no inferior esquerdo)
    new Control.Zoom({ position: 'bottomright' }).addTo(map);
    new Control.Scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);

    // ========================================================
    // Definição das Camadas Geoespaciais com Resiliência Total (Leaflet 1.9)
    // ========================================================

    // 1. Google Satélite Híbrido HD (Com estradas, acessos e resolução de até 0.5m)
    const satelliteGoogleLayer = new TileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: 'Google Satellite Hybrid'
    });

    // 2. Esri World Imagery (Imagens Satelitais Analíticas)
    const satelliteEsriLayer = new TileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Esri World Imagery'
    });

    // 3. Topografia & Relevo com Curvas (CartoDB Voyager)
    const topoLayer = new TileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; CARTO & OpenStreetMap'
    });

    // 4. Ruas & Logística Viária (OpenStreetMap - Padrão Leaflet)
    const streetsLayer = new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    // 5. Dark Mode Geotécnico (Alto contraste para centros de controle)
    const darkLayer = new TileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; CARTO'
    });

    // Base Layers Map
    const baseLayers = {
      satellite_google: satelliteGoogleLayer,
      satellite_esri: satelliteEsriLayer,
      topo: topoLayer,
      streets: streetsLayer,
      dark: darkLayer
    };

    // Adiciona a camada base selecionada PRIMEIRO para garantir maxZoom do mapa
    const initialLayer = baseLayers[mapType] || satelliteGoogleLayer;
    initialLayer.addTo(map);

    // Camadas de Vetores (Polígonos das Estruturas e Marcadores de Instrumentos)
    const polygonsLayer = new LayerGroup().addTo(map);
    
    // Função utilitária para criar agrupador com fallback seguro
    const createLayerGroupOrCluster = (clustered) => {
      // Blindagem estrita de L.featureGroup em runtime para markercluster
      if (typeof L !== 'undefined' && typeof L.featureGroup !== 'function') {
        L.featureGroup = (layers, options) => new (L.FeatureGroup || LayerGroup)(layers, options);
      }
      if (typeof window !== 'undefined' && window.L && typeof window.L.featureGroup !== 'function') {
        window.L.featureGroup = (layers, options) => new (window.L.FeatureGroup || LayerGroup)(layers, options);
      }
      if (clustered && typeof L.markerClusterGroup === 'function') {
        try {
          return L.markerClusterGroup({
            maxClusterRadius: 40,
            maxZoom: 19,
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
              return new DivIcon({
                html: `<div class="custom-geo-cluster ${worstClass}" style="width: 38px; height: 38px; font-size: 11px;">${count}</div>`,
                className: 'custom-cluster-icon',
                iconSize: [38, 38]
              });
            }
          });
        } catch (err) {
          console.warn('[MapTab] Falha ao instanciar markerClusterGroup, utilizando LayerGroup padrão:', err);
        }
      }
      return new LayerGroup();
    };

    let markersGroup;
    try {
      markersGroup = createLayerGroupOrCluster(useClustering);
      markersGroup.addTo(map);
    } catch (err) {
      console.warn('[MapTab] Falha ao adicionar cluster no mapa, utilizando LayerGroup padrão:', err);
      markersGroup = new LayerGroup().addTo(map);
    }

    const sumpsLayer = new LayerGroup().addTo(map);
    const pluviometriaLayer = new LayerGroup().addTo(map);
    const structuresLayer = new LayerGroup().addTo(map);

    // Registro das instâncias
    mapInstanceRef.current = {
      map,
      layers: baseLayers,
      currentLayer: initialLayer,
      createLayerGroupOrCluster
    };
    markersLayerRef.current = markersGroup;
    polygonsLayerRef.current = polygonsLayer;
    sumpsLayerRef.current = sumpsLayer;
    pluviometriaLayerRef.current = pluviometriaLayer;
    structuresLayerRef.current = structuresLayer;

    // Rastreamento de coordenadas do cursor (WGS-84 e SIRGAS 2000 UTM 23S) e nível de zoom em tempo real
    map.on('mousemove', (e) => {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lon = Number(e.latlng.lng.toFixed(6));
      const utm = latLonToUtm23S(lat, lon);
      setCursorCoords({ lat, lon, utmE: utm.easting, utmN: utm.northing });
    });

    // Clique no mapa para posicionar estrutura quando em modo de georreferenciamento
    map.on('click', (e) => {
      if (locateStructureTargetRef.current) {
        const target = locateStructureTargetRef.current;
        const lat = Number(e.latlng.lat.toFixed(6));
        const lon = Number(e.latlng.lng.toFixed(6));
        const updated = {
          ...target,
          lat,
          lon,
          coordenadas: { lat, lon }
        };
        storageService.saveEstruturaEmpreendimento(updated);
        const refreshed = storageService.getEstruturasEmpreendimento();
        setEstruturas(refreshed);
        setSelectedEstrutura(updated);
        setLocateStructureTarget(null);
        if (setSystemToast) {
          setSystemToast({
            type: 'success',
            message: `Localização da estrutura "${target.nome}" inserida no mapa com sucesso! (Lat: ${lat}, Lon: ${lon})`
          });
        }
        map.flyTo([lat, lon], 17, { duration: 0.8 });
      }
    });

    const handleCameraChange = () => {
      const currentZoom = map.getZoom();
      const currentCenter = map.getCenter();
      setMapZoom(currentZoom);

      // Controle de visibilidade de tooltips dos empreendimentos no zoom (Padrão SysDam zoomend)
      if (structureTooltipsRef.current && structureTooltipsRef.current.length > 0) {
        structureTooltipsRef.current.forEach(m => {
          if (currentZoom < 14) {
            m.closeTooltip && m.closeTooltip();
          } else {
            m.openTooltip && m.openTooltip();
          }
        });
      }

      // Verificação se enquadramento foi modificado em relação ao preset salvo
      try {
        const savedRaw = localStorage.getItem('mdsync_map_preset');
        if (savedRaw) {
          const p = JSON.parse(savedRaw);
          const isDiff = Math.abs(p.center[0] - currentCenter.lat) > 0.0005 ||
                         Math.abs(p.center[1] - currentCenter.lng) > 0.0005 ||
                         p.zoom !== currentZoom;
          setIsMapPresetModified(isDiff);
        } else {
          const isDiff = Math.abs(initialLat - currentCenter.lat) > 0.0005 ||
                         Math.abs(initialLon - currentCenter.lng) > 0.0005 ||
                         initialZoom !== currentZoom;
          setIsMapPresetModified(isDiff);
        }
      } catch (err) {
        setIsMapPresetModified(true);
      }
    };

    map.on('zoomend', handleCameraChange);
    map.on('moveend', handleCameraChange);

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
      sumpsLayerRef.current = null;
      if (pluviometriaLayerRef.current) pluviometriaLayerRef.current.clearLayers();
      pluviometriaLayerRef.current = null;
      if (structuresLayerRef.current) structuresLayerRef.current.clearLayers();
      structuresLayerRef.current = null;
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

    let newGroup;
    try {
      newGroup = createLayerGroupOrCluster(useClustering);
      newGroup.addTo(map);
    } catch (err) {
      console.warn('[MapTab] Falha ao alternar cluster no mapa, utilizando LayerGroup padrão:', err);
      newGroup = new LayerGroup().addTo(map);
    }
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
      const bound = STRUCTURE_BOUNDARIES.find(b => b.id === structId);
      const struct = (estruturas || []).find(e => 
        e.id === structId || 
        e.sigla === structId || 
        normalizeStructureKey(e.id) === structId || 
        normalizeStructureKey(e.sigla) === structId
      ) || (structures || []).find(s => 
        s.id === structId || 
        s.sigla === structId || 
        normalizeStructureKey(s.id) === structId || 
        normalizeStructureKey(s.sigla) === structId
      );
      const targetLat = struct?.lat ?? struct?.coordenadas?.lat;
      const targetLon = struct?.lon ?? struct?.coordenadas?.lon;
      const targetCenter = (targetLat && targetLon) ? [targetLat, targetLon] : (bound?.center || null);
      if (targetCenter) {
        map.flyTo(targetCenter, 16, { duration: 1.2 });
      }
    }
  }, [selectStructure, selectedInstrument, structures, estruturas]);

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

  // Salvar enquadramento atual de câmera no localStorage (Padrão SysDam)
  const handleSaveMapPreset = useCallback(() => {
    if (!mapInstanceRef.current?.map) return;
    const map = mapInstanceRef.current.map;
    const center = [Number(map.getCenter().lat.toFixed(6)), Number(map.getCenter().lng.toFixed(6))];
    const zoom = map.getZoom();
    localStorage.setItem('mdsync_map_preset', JSON.stringify({ center, zoom }));
    setIsMapPresetModified(false);
    if (setSystemToast) {
      setSystemToast({
        message: `Enquadramento georreferenciado salvo com sucesso! (Centro: ${center[0]}, ${center[1]} | Zoom: ${zoom}x)`,
        type: 'success'
      });
    }
  }, [setSystemToast]);

  // Restaurar enquadramento mestre do Complexo Minerário Itaminas
  const handleResetMapPreset = useCallback(() => {
    localStorage.removeItem('mdsync_map_preset');
    if (mapInstanceRef.current?.map) {
      mapInstanceRef.current.map.flyTo([-20.063818, -44.114360], 15, { duration: 1.2 });
    }
    setIsMapPresetModified(false);
    if (setSystemToast) {
      setSystemToast({
        message: 'Enquadramento padrão do Complexo Minerário Itaminas restaurado.',
        type: 'info'
      });
    }
  }, [setSystemToast]);

  // Copiar coordenadas geodésicas (WGS-84 e SIRGAS 2000 UTM 23S) para a área de transferência
  const handleCopyCoords = useCallback(() => {
    if (!cursorCoords) return;
    const text = `WGS-84: Lat ${cursorCoords.lat}, Lon ${cursorCoords.lon} | SIRGAS 2000 UTM 23S: E ${cursorCoords.utmE}, N ${cursorCoords.utmN}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
    if (setSystemToast) {
      setSystemToast({
        message: 'Coordenadas geodésicas copiadas para a área de transferência!',
        type: 'success'
      });
    }
  }, [cursorCoords, setSystemToast]);

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
        const polygon = new Polygon(boundary.coordinates, {
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

        polygon.on('click', (e) => {
          if (locateStructureTargetRef.current) {
            const target = locateStructureTargetRef.current;
            const lat = Number(e.latlng.lat.toFixed(6));
            const lon = Number(e.latlng.lng.toFixed(6));
            const updated = { ...target, lat, lon, coordenadas: { lat, lon } };
            storageService.saveEstruturaEmpreendimento(updated);
            const refreshed = storageService.getEstruturasEmpreendimento();
            setEstruturas(refreshed);
            setSelectedEstrutura(updated);
            setLocateStructureTarget(null);
            if (setSystemToast) {
              setSystemToast({
                type: 'success',
                message: `Localização da estrutura "${target.nome}" inserida no mapa com sucesso! (Lat: ${lat}, Lon: ${lon})`
              });
            }
            if (mapInstanceRef.current?.map) {
              mapInstanceRef.current.map.flyTo([lat, lon], 17, { duration: 0.8 });
            }
            return;
          }
          handleSelectStructure(boundary.id);
          const match = estruturas.find(e => e.id === boundary.id || e.sigla === boundary.id || boundary.id.includes(e.sigla));
          if (match) {
            setSelectedEstrutura(match);
          }
          setIsSiderCollapsed(false);
          setIsSiderFlipped(true);
        });

        layer.addLayer(polygon);
      }

      // 2. Linha de Crista (se aplicável para barragens)
      if (boundary.crestLine && boundary.crestLine.length > 0) {
        const crest = new Polyline(boundary.crestLine, {
          color: '#ffffff',
          weight: 3,
          opacity: 0.85,
          dashArray: '3, 4'
        });
        crest.bindTooltip(`Crista ${boundary.nome} (Cota ${boundary.cotaCrista || '-'}m)`, { sticky: true });
        layer.addLayer(crest);
      }
    });

    // 3. Setores Poligonais Georreferenciados da Mina Engenho Seco (Modelo de Blocos CP Datamine)
    ENGENHO_SECO_SECTORS.forEach(sec => {
      if (sec.perimetroWgs84 && sec.perimetroWgs84.length > 0) {
        const secPoly = new Polygon(sec.perimetroWgs84, {
          color: '#10b981',
          weight: 2,
          fillColor: '#059669',
          fillOpacity: 0.20,
          dashArray: '5, 5'
        });

        secPoly.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 11px; padding: 4px 6px;">
            <strong style="color: #10b981;">📦 ${sec.nome}</strong><br/>
            <span style="color: #cbd5e1;">${sec.descricao}</span><br/>
            <span style="color: #38bdf8; font-weight: 600;">Cotas: ${sec.cotaMin}m a ${sec.cotaMax}m</span><br/>
            <span style="color: #f59e0b; font-size: 10px; font-weight: 600;">⚡ Clique para abrir Modelo de Blocos</span>
          </div>
        `, { sticky: true, opacity: 0.95 });

        secPoly.on('click', () => {
          setBlockModelModalOpen(true);
        });

        layer.addLayer(secPoly);
      }
    });
  }, [showPerimeters, activeStructureId, handleSelectStructure, estruturas]);

  // Função para renderizar marcadores de instrumentos
  const renderMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    try {
      const layer = markersLayerRef.current;
      layer.clearLayers();
      structureTooltipsRef.current = [];

    // 1. Badges das Estruturas da Mina (LayerGroup dedicado - NUNCA entra em cluster de instrumentos)
    if (structuresLayerRef.current) {
      const structLayer = structuresLayerRef.current;
      structLayer.clearLayers();
      structureTooltipsRef.current = [];

      const combinedStructuresMap = new globalThis.Map();
      (structures || []).forEach(s => {
        const key = s.id || s.sigla;
        if (key) combinedStructuresMap.set(key, { ...s });
      });
      (estruturas || []).forEach(e => {
        const key = e.id || e.sigla;
        if (key) {
          const existing = combinedStructuresMap.get(key) || {};
          const lat = e.lat ?? e.coordenadas?.lat ?? existing.lat;
          const lon = e.lon ?? e.coordenadas?.lon ?? existing.lon;
          const corMarcador = e.corMarcador || e.corPin || e.pinColor || existing.corMarcador;
          combinedStructuresMap.set(key, { ...existing, ...e, lat, lon, corMarcador });
        }
      });

      Array.from(combinedStructuresMap.values()).forEach(struct => {
        if (struct.lat && struct.lon) {
          const isCurrentActive = activeStructureId === struct.id || 
                                  activeStructureId === struct.sigla ||
                                  normalizeStructureKey(activeStructureId) === normalizeStructureKey(struct.id) ||
                                  normalizeStructureKey(activeStructureId) === normalizeStructureKey(struct.sigla);

          const pinColor = resolveStructureDefaultColor(struct);

          // Alfinete Cartográfico estilo QGIS (com ponta cônica na coordenada exata)
          const structIcon = new DivIcon({
            className: 'qgis-structure-pin-icon',
            html: createQgisPinMarkerHtml(struct, { isSelected: isCurrentActive }),
            iconSize: [32, 44],
            iconAnchor: [16, 42],
            popupAnchor: [0, -42],
            tooltipAnchor: [0, -42]
          });

          const structMarker = new Marker([struct.lat, struct.lon], { 
            icon: structIcon,
            zIndexOffset: isCurrentActive ? 1200 : 500
          });

          structMarker.bindTooltip(`
            <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 11px; padding: 4px 7px; text-align: center; border-radius: 6px;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 5px; margin-bottom: 2px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${pinColor}; box-shadow: 0 0 6px ${pinColor}; display: inline-block;"></span>
                <strong style="color: #ffffff; letter-spacing: 0.2px;">${struct.nome}</strong> 
                <span style="color: #38bdf8; font-weight: 700;">(${struct.sigla || struct.id})</span>
              </div>
              <span style="color: #94a3b8; font-size: 10px; font-family: monospace;">Lat: ${Number(struct.lat).toFixed(6)} | Lon: ${Number(struct.lon).toFixed(6)}</span>
            </div>
          `, {
            permanent: true,
            direction: 'top',
            offset: [0, -44],
            className: 'leaflet-tooltip-empreendimento'
          });
          
          structMarker.on('click', () => {
            handleSelectStructure(struct.id || struct.sigla);
            const match = estruturas.find(e => e.id === struct.id || e.sigla === struct.id || struct.id?.includes(e.sigla) || struct.sigla === e.sigla);
            setSelectedEstrutura(match || struct);
            setIsSiderCollapsed(false);
            setIsSiderFlipped(true);
          });
          
          structLayer.addLayer(structMarker);
          structureTooltipsRef.current.push(structMarker);
        }
      });
    }

    // 2. Marcadores dos Instrumentos Geotécnicos (Coordenadas Exatas Banco_De_Dados.xlsx)
    filteredInstruments.forEach(inst => {
      const isSelected = selectedInstrument && selectedInstrument.id === inst.id && selectedInstrument.estrutura === inst.estrutura;
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

      const tipoSigla = (inst.tipo === 'INA' ? 'IN' : inst.tipo === 'PZ' ? 'PZ' : inst.tipo === 'MV' ? 'MV' : inst.tipo === 'VT' ? 'VT' : (inst.tipo || 'IN')).slice(0, 2);

      const instIcon = new DivIcon({
        className: 'custom-geo-marker-wrapper',
        html: `
          <div class="custom-geo-marker ${markerClass}" style="
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
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
            ${tipoSigla}
          </div>
        `,
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14]
      });

      const marker = new Marker([inst.lat, inst.lon], { 
        icon: instIcon,
        geoStatus: inst.statusCalculado || 'NORMAL'
      });

      marker.bindTooltip(`
        <div style="font-family: 'Inter', sans-serif; font-size: 11px; padding: 4px 6px; min-width: 170px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
            <strong style="color: #38bdf8;">${inst.tipo} - ${inst.id}</strong>
            <span style="font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 3px; background: ${dotColor}22; color: ${dotColor};">${inst.statusCalculado || 'NORMAL'}</span>
          </div>
          <div style="color: #94a3b8; font-size: 10px;">${inst.estrutura} • Seção ${inst.secao || 'Geral'}</div>
          <div style="color: #f1f5f9; font-size: 10px; margin-top: 2px;">Cota: <strong>${inst.ultimaCota ? inst.ultimaCota + ' m' : (inst.cotaTopo ? inst.cotaTopo + ' m' : '-')}</strong></div>
          <div style="color: #64748b; font-size: 9px; font-family: var(--font-mono); margin-top: 1px;">UTM: E ${inst.coordenadaEW ? Math.round(inst.coordenadaEW) : '-'} / N ${inst.coordenadaNS ? Math.round(inst.coordenadaNS) : '-'}</div>
        </div>
      `, { sticky: true, opacity: 0.96 });
      
      marker.on('click', () => handleSelectInstrument(inst));
      layer.addLayer(marker);
    });

    // 3. Marcadores de Chamados e Anomalias de Campo (Banco Central PCMI & Fluig)
    if (showTickets && georeferencedTickets.length > 0) {
      georeferencedTickets.forEach(t => {
        const protoTarget = String(t.protocolo || t.proto || t.id);
        const isSelected = selectedTicket && String(selectedTicket.protocolo || selectedTicket.proto || selectedTicket.id) === protoTarget;
        
        const ticketIcon = new DivIcon({
          className: 'custom-chamado-fluig-pill-marker',
          html: createChamadoMarkerHtml(t, isSelected),
          iconSize: [0, 0]
        });

        const ticketMarker = new Marker([t.lat, t.lon], { icon: ticketIcon, zIndexOffset: isSelected ? 1000 : 700 });
        
        const popupContent = createChamadoPopupContent(t);
        ticketMarker.bindPopup(popupContent, {
          className: 'chamados-executive-popup',
          maxWidth: 340,
          minWidth: 280,
          offset: [0, -10],
          autoPan: true,
          autoPanPadding: [24, 24],
          closeButton: true
        });

        ticketMarker.on('click', () => {
          setSelectedInstrument(null);
          setSelectedInspectionRecord(null);
          setSelectedTicket(t);
        });
        layer.addLayer(ticketMarker);
      });
    }

    // 4. Marcadores de Ocorrências e Inspeções Geotécnicas (Padrão SYSDAM)
    if (showAnomalies && georeferencedAnomalies.length > 0) {
      georeferencedAnomalies.forEach(anom => {
        const isSelected = selectedInspectionRecord && selectedInspectionRecord.id === anom.id;
        const sevColor = anom.severidade === 3 ? '#ef4444' : (anom.severidade === 2 ? '#f59e0b' : '#10b981');
        const anomIcon = new DivIcon({
          className: 'custom-sysdam-inspection-marker',
          html: `
            <div style="
              background: rgba(15, 23, 42, 0.92);
              color: #ffffff;
              border: ${isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.45)'};
              border-radius: 6px;
              padding: 2px 7px;
              font-family: 'Inter', sans-serif;
              font-size: 10px;
              font-weight: 700;
              box-shadow: 0 4px 14px rgba(0,0,0,0.65);
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
              cursor: pointer;
              transform: translate(-50%, -50%);
              backdrop-filter: blur(4px);
              transition: all 0.2s ease;
            ">
              <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${sevColor}; box-shadow: 0 0 6px ${sevColor};"></span>
              <span>${anom.codigo || anom.id}</span>
            </div>
          `,
          iconSize: [0, 0]
        });

        const anomMarker = new Marker([anom.lat, anom.lon], { icon: anomIcon, zIndexOffset: 750 });
        anomMarker.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 11px; padding: 2px 4px; max-width: 250px;">
            <strong style="color: ${sevColor};">${anom.codigo || anom.id} - ${anom.tipo}</strong><br/>
            <span style="color: #94a3b8;">${anom.estrutura} • ${anom.localizacao || ''}</span><br/>
            <span>${anom.descricao ? anom.descricao.slice(0, 90) + '...' : ''}</span>
          </div>
        `, { sticky: true, opacity: 0.95 });

        anomMarker.on('click', () => {
          setSelectedInstrument(null);
          setSelectedTicket(null);
          setSelectedInspectionRecord(anom);
        });
        layer.addLayer(anomMarker);
      });
    }
  } catch (err) {
    console.warn('[MapTab] Falha ao renderizar marcadores no mapa:', err);
  }
  }, [
    structures, 
    estruturas,
    filteredInstruments, 
    georeferencedTickets, 
    showTickets, 
    georeferencedAnomalies, 
    showAnomalies, 
    activeStructureId, 
    selectedInstrument, 
    selectedTicket, 
    selectedInspectionRecord, 
    handleSelectStructure, 
    handleSelectInstrument
  ]);

  // Atualizar marcadores quando filtros ou seleção mudarem
  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  // Função para renderizar marcadores de SUMPs no mapa
  const renderSumps = useCallback(() => {
    if (!mapInstanceRef.current || !sumpsLayerRef.current) return;
    try {
      const layer = sumpsLayerRef.current;
      layer.clearLayers();
      if (!showSumps) return;

      const rawList = (sumps && sumps.length > 0) ? sumps : SUMPS_DATA;
      const activeSumps = rawList.filter(d => {
        if (!d.lat || !d.lon) return false;
        if (filterSumpMina !== 'Todas' && d.mina !== filterSumpMina) return false;
        if (filterSumpCrits.length > 0 && !filterSumpCrits.includes(d.crit)) return false;
        if (filterSumpAnom !== 'Todas' && d.anom !== filterSumpAnom) return false;
        return true;
      });

      const COL_SUMP = {
        'Crítico': '#ff4b4b',
        'Leve': '#33d17a',
        'Moderado': '#ffc21a',
        'Muito Crítico': '#7c8aa3'
      };

      activeSumps.forEach(s => {
        const isSelected = selectedSumpTag === s.tag;
        const color = COL_SUMP[s.crit] || '#71d1f8';

        // Marcador vetorial circular com raio em metros
        const marker = new Circle([s.lat, s.lon], {
          radius: isSelected ? 28 : 18,
          fillColor: color,
          color: isSelected ? '#38bdf8' : '#ffffff',
          weight: isSelected ? 3 : 1.5,
          opacity: 1,
          fillOpacity: s.aprox ? 0.45 : 0.95,
          dashArray: s.aprox ? '4 4' : undefined
        });

        marker.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 11px; padding: 2px 4px; min-width: 140px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
              <strong style="color: #38bdf8;">${s.tag}</strong>
              <span style="font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 3px; background: ${color}22; color: ${color};">${s.crit || '—'}</span>
            </div>
            <div style="color: #94a3b8; font-size: 10px; margin-top: 1px;">${s.mina || ''}</div>
            <div style="color: #f1f5f9; font-size: 9px; margin-top: 2px;">Anomalia: <strong>${s.anom || 'Sem anomalia'}</strong></div>
          </div>
        `, { sticky: true, opacity: 0.96 });

        marker.bindPopup(`
          <div style="font-family: 'Inter', sans-serif; font-size: 12px; padding: 4px; min-width: 190px; color: #0f172a;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
              <strong style="color: #0284c7; font-size: 13px;">${s.tag}</strong>
              <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${color}; color: #ffffff;">${s.crit || '—'}</span>
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 3px;"><strong>Mina:</strong> ${s.mina || '—'}</div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 3px;"><strong>Anomalia:</strong> ${s.anom || 'Sem anomalia'}</div>
            <div style="font-size: 11px; color: #0284c7; margin-bottom: 2px;"><strong>Capacidade:</strong> ${s.cap ? Math.round(s.cap).toLocaleString('pt-BR') : '-'} m³</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;"><strong>Volume Utilizado:</strong> ${s.util ? Math.round(s.util).toLocaleString('pt-BR') : '-'} m³</div>
            ${s.aprox ? '<div style="font-size: 10px; color: #f59e0b; font-style: italic;">Posição aproximada (sem coordenada exata na origem)</div>' : ''}
          </div>
        `);

        marker.on('click', () => {
          setSelectedSumpTag(s.tag);
          setShowSumpsPanel(true);
        });

        layer.addLayer(marker);
      });
    } catch (err) {
      console.warn('[MapTab] Falha ao renderizar marcadores de SUMPs:', err);
    }
  }, [showSumps, sumps, filterSumpMina, filterSumpCrits, filterSumpAnom, selectedSumpTag]);

  // Atualizar marcadores de SUMPs quando filtros mudarem
  useEffect(() => {
    renderSumps();
  }, [renderSumps]);

  const handleFocusSump = useCallback((sump) => {
    if (!mapInstanceRef.current?.map || !sump.lat || !sump.lon) return;
    const { map } = mapInstanceRef.current;
    map.flyTo([sump.lat, sump.lon], 17, { duration: 1.2 });
    setSelectedSumpTag(sump.tag);
    setShowSumps(true);
  }, []);

  // Função para renderizar marcadores das Estações Pluviométricas
  const renderPluviometriaStations = useCallback(() => {
    if (!mapInstanceRef.current || !pluviometriaLayerRef.current) return;
    try {
      const layer = pluviometriaLayerRef.current;
      layer.clearLayers();
      if (!showPluviometria) return;

      const locs = PLUVIOMETRIA_DATA?.locs || [];
      locs.forEach(st => {
        if (!st.lat || !st.lon) return;

        // Custom DivIcon com design executivo meteorológico
        const rainIcon = new DivIcon({
          className: 'pluviometria-map-marker',
          html: `
            <div style="
              background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
              border: 2px solid #38bdf8;
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 16px rgba(56, 189, 248, 0.7);
              cursor: pointer;
              transform: translate(-50%, -50%);
              color: #ffffff;
              font-size: 16px;
            ">
              🌧️
            </div>
          `,
          iconSize: [0, 0]
        });

        const marker = new Marker([st.lat, st.lon], { icon: rainIcon });

        marker.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 11px; padding: 2px 4px; min-width: 150px;">
            <div style="display: flex; align-items: center; gap: 4px; color: #38bdf8; font-weight: 700;">
              <span>🌧️ Estação Pluviométrica</span>
            </div>
            <strong style="color: #ffffff; font-size: 12px; display: block; margin-top: 2px;">${st.loc}</strong>
            <span style="color: #94a3b8; font-size: 10px;">Complexo Minerário Itaminas</span>
          </div>
        `, { sticky: true, opacity: 0.96 });

        marker.bindPopup(`
          <div style="font-family: 'Inter', sans-serif; font-size: 12px; padding: 6px; min-width: 200px; color: #0f172a;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
              <strong style="color: #0284c7; font-size: 13px;">🌧️ ${st.loc}</strong>
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 4px;"><strong>Tipo:</strong> Pluviômetro Automático Full-Time</div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px;"><strong>Coordenadas:</strong> ${st.lat.toFixed(6)}, ${st.lon.toFixed(6)}</div>
            <button 
              id="btn-open-pluvio-${st.loc.replace(/[^a-zA-Z0-9]/g, '_')}"
              style="width: 100%; background: #0284c7; color: white; border: none; border-radius: 6px; padding: 6px 10px; font-weight: 700; font-size: 11px; cursor: pointer;"
            >
              Abrir Painel de Pluviometria
            </button>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-open-pluvio-${st.loc.replace(/[^a-zA-Z0-9]/g, '_')}`);
          if (btn && onNavigateTab) {
            btn.onclick = () => onNavigateTab('pluviometria');
          }
        });

        layer.addLayer(marker);
      });
    } catch (err) {
      console.warn('[MapTab] Falha ao renderizar estações pluviométricas:', err);
    }
  }, [showPluviometria, onNavigateTab]);

  // Atualizar marcadores pluviométricos quando visibilidade mudar
  useEffect(() => {
    renderPluviometriaStations();
  }, [renderPluviometriaStations]);

  // Aplicação da Navegação Contextual vinda de outras sessões (Pluviometria, Modelo de Blocos, Dashboards, Estruturas, SUMPs)
  useEffect(() => {
    if (!navigationContext || !mapInstanceRef.current?.map) return;
    const { map } = mapInstanceRef.current;
    const ctx = navigationContext;

    // 1. Contexto de Pluviometria
    if (ctx.focus === 'pluviometria') {
      setShowPluviometria(true);
      const targetCoords = ctx.coords || [-20.082, -44.105];
      map.flyTo(targetCoords, ctx.zoom || 15, { duration: 1.2 });
    }
    // 2. Contexto de Modelo de Blocos / Engenho Seco
    else if (ctx.focus === 'block_model' || ctx.structureId === 'ENGENHO_SECO') {
      setShowPerimeters(true);
      if (typeof handleSelectStructure === 'function') {
        handleSelectStructure('ENGENHO_SECO');
      } else if (typeof selectStructure === 'function') {
        selectStructure('ENGENHO_SECO');
      }
      const targetCoords = ctx.coords || [-20.095810, -44.111803];
      map.flyTo(targetCoords, ctx.zoom || 16, { duration: 1.2 });
    }
    // 3. Contexto de SUMPs
    else if (ctx.focus === 'sumps') {
      setShowSumps(true);
      if (ctx.sump?.tag) {
        setSelectedSumpTag(ctx.sump.tag);
      }
      if (ctx.coords) {
        map.flyTo(ctx.coords, ctx.zoom || 17, { duration: 1.2 });
      }
    }
    // 4. Contexto de Estrutura / Dashboards / Piezometria / Vazão
    else {
      if (ctx.structureId && ctx.structureId !== 'TODAS') {
        if (typeof handleSelectStructure === 'function') {
          handleSelectStructure(ctx.structureId);
        } else if (typeof selectStructure === 'function') {
          selectStructure(ctx.structureId);
        }
      }
      if (ctx.filterType) {
        setFilterType(ctx.filterType);
      }
      if (ctx.filterStatus) {
        setFilterStatus(ctx.filterStatus);
      }
      if (ctx.locateStructureId) {
        const target = (estruturas || []).find(e => e.id === ctx.locateStructureId || e.sigla === ctx.locateStructureId) ||
                       (structures || []).find(s => s.id === ctx.locateStructureId || s.sigla === ctx.locateStructureId);
        if (target) {
          setLocateStructureTarget(target);
          const tLat = target.lat ?? target.coordenadas?.lat ?? -20.0825;
          const tLon = target.lon ?? target.coordenadas?.lon ?? -44.1085;
          map.flyTo([tLat, tLon], 16, { duration: 1.2 });
        }
      } else if (ctx.coords) {
        map.flyTo(ctx.coords, ctx.zoom || 17, { duration: 1.2 });
      } else if (ctx.structureId && ctx.structureId !== 'TODAS') {
        const bound = STRUCTURE_BOUNDARIES.find(b => b.id === ctx.structureId);
        const st = (structures || []).find(s => s.id === ctx.structureId || s.sigla === ctx.structureId);
        const est = (estruturas || []).find(e => e.id === ctx.structureId || e.sigla === ctx.structureId);
        const lat = est?.lat ?? est?.coordenadas?.lat ?? st?.lat;
        const lon = est?.lon ?? est?.coordenadas?.lon ?? st?.lon;
        const center = (lat && lon) ? [lat, lon] : (bound?.center || null);
        if (center) {
          map.flyTo(center, ctx.zoom || 16, { duration: 1.2 });
        }
      }
      if (ctx.instrumentId) {
        const matchInst = (instruments || []).find(i => i.id === ctx.instrumentId);
        if (matchInst) {
          setSelectedInstrument(matchInst);
        }
      }
    }

    if (onClearNavigationContext) {
      onClearNavigationContext();
    }
  }, [navigationContext, structures, instruments, estruturas, onClearNavigationContext]);

  // Tipos únicos de instrumentos para filtro
  const availableTypes = ['TODOS', 'INA', 'PZ', 'MV', 'VT', 'TILT', 'REF', 'ETR'];

  return (
    <div className="animate-page-enter" style={{ 
      position: 'relative', 
      width: '100%', 
      height: 'calc(100vh - 84px)', 
      minHeight: '680px', 
      borderRadius: '16px', 
      overflow: 'hidden', 
      border: '1px solid var(--border-medium)',
      boxShadow: 'var(--shadow-xl)'
    }}>
      {/* Contêiner Leaflet Principal */}
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          background: '#090d16',
          cursor: locateStructureTarget ? 'crosshair' : 'default'
        }} 
      />

      {/* Banner HUD de Posicionamento Direto no Mapa */}
      {locateStructureTarget && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '2px solid #0284c7',
          borderRadius: '12px',
          padding: '0.65rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 0 15px rgba(2, 132, 199, 0.4)',
          color: '#f8fafc',
          maxWidth: '90%'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0
          }}>
            <MapPin size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
              Modo de Posicionamento no Mapa
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              Clique em qualquer ponto do mapa para definir a localização de <strong>{locateStructureTarget.nome || locateStructureTarget.sigla}</strong>
            </div>
          </div>
          <button
            onClick={() => setLocateStructureTarget(null)}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              cursor: 'pointer',
              marginLeft: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* ========================================================
          Sider Flutuante SysDam: Empreendimentos, 3D Flip Card & Módulos
         ======================================================== */}
      <SysdamEmpreendimentosPanel
        estruturas={estruturas}
        selectedEstrutura={selectedEstrutura}
        onSelectEstrutura={(est) => {
          setSelectedEstrutura(est);
          if (est?.id || est?.sigla) {
            handleSelectStructure(est.id || est.sigla);
          }
        }}
        onFocusStructure={(est) => {
          if (est?.id || est?.sigla) {
            handleSelectStructure(est.id || est.sigla);
          }
        }}
        onOpenGeomReport={() => setBlockModelModalOpen(true)}
        onNavigateTab={onNavigateTab}
        instruments={instruments}
        anomalias={anomaliasGeotecnicas}
        fluigTickets={fluigTickets}
        isCollapsed={isSiderCollapsed}
        onToggleCollapse={() => setIsSiderCollapsed(prev => !prev)}
        isFlipped={isSiderFlipped}
        setIsFlipped={setIsSiderFlipped}
        onFlipChange={(flipped) => setIsSiderFlipped(flipped)}
        onNavigateModule={(modId, est) => {
          if (setSystemToast) {
            setSystemToast({
              message: `Abrindo módulo [${modId}] da estrutura ${est?.nome || ''}...`,
              type: 'info'
            });
          }
          const customEvent = new CustomEvent('mdsync:navigate-module', {
            detail: { moduleId: modId, estrutura: est }
          });
          window.dispatchEvent(customEvent);
          if (onNavigateTab) {
            onNavigateTab(modId, { structureId: est?.id, estrutura: est?.nome });
          }
        }}
      />

      {/* ========================================================
          BARRA SUPERIOR DO MAPA (HUD TOPBAR INTEGRADA ANTI-COLISÃO)
         ======================================================== */}
      <div className="map-hud-topbar">
        {/* 1. TOP-LEFT HUD: Botões Estratégicos de Abertura de Conteúdos */}
        <div className="map-hud-top-left">
          {/* Botão 1: Empreendimentos & Estruturas (Abre painel lateral 3D) */}
          <button
            onClick={() => setIsSiderCollapsed(prev => !prev)}
            className={`btn-subtle map-hud-trigger ${!isSiderCollapsed ? 'active-glow' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0.3rem 0.65rem',
              borderRadius: '10px',
              backgroundColor: !isSiderCollapsed ? 'rgba(56, 189, 248, 0.24)' : 'rgba(15, 23, 42, 0.85)',
              color: !isSiderCollapsed ? '#38bdf8' : '#e2e8f0',
              border: !isSiderCollapsed ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          title="Abrir Painel de Empreendimentos e Estruturas"
        >
          <Building2 size={15} style={{ color: '#38bdf8' }} />
          <span>Empreendimentos</span>
          <span style={{
            backgroundColor: 'rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            padding: '1px 6px',
            borderRadius: '999px',
            fontSize: '0.65rem',
            fontWeight: 800
          }}>
            {estruturas.length}
          </span>
        </button>

        {/* Botão 2: Painel Executivo Oficial de SUMPs */}
        <button
          onClick={() => setShowSumpsPanel(prev => !prev)}
          className={`btn-subtle map-hud-trigger ${showSumpsPanel ? 'active-glow' : ''}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '0.3rem 0.65rem',
            borderRadius: '10px',
            backgroundColor: showSumpsPanel ? 'rgba(2, 132, 199, 0.35)' : 'rgba(15, 23, 42, 0.85)',
            color: showSumpsPanel ? '#ffffff' : '#71d1f8',
            border: showSumpsPanel ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(16px)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          title="Abrir Painel Executivo Oficial de SUMPs de Drenagem"
        >
          <Droplet size={15} style={{ color: '#38bdf8' }} />
          <span>Painel SUMPs</span>
          <span style={{
            backgroundColor: 'rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            padding: '1px 6px',
            borderRadius: '999px',
            fontSize: '0.65rem',
            fontWeight: 800
          }}>
            {(sumps && sumps.length > 0) ? sumps.length : SUMPS_DATA.length}
          </span>
        </button>

        {/* Botão 3: Modelo de Blocos Curto Prazo 3D (Datamine) */}
        <button
          onClick={() => setBlockModelModalOpen(true)}
          className="btn-subtle"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '0.3rem 0.65rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.18)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(16px)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          title="Abrir Modelo de Blocos Curto Prazo (CP) Engenho Seco 3D (Datamine)"
        >
          <Layers size={15} style={{ color: '#10b981' }} />
          <span>Modelo 3D CP</span>
          <span style={{
            backgroundColor: 'rgba(16, 185, 129, 0.25)',
            color: '#10b981',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '0.62rem',
            fontWeight: 800
          }}>
            3D
          </span>
        </button>

        {/* Botão 4: Gaveta Lateral de Registros e Ocorrências */}
        <button
          onClick={() => setIsRecordDrawerOpen(prev => !prev)}
          className={`btn-subtle map-hud-trigger ${isRecordDrawerOpen ? 'active-glow' : ''}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '0.3rem 0.65rem',
            borderRadius: '10px',
            backgroundColor: isRecordDrawerOpen ? '#7c3aed' : 'rgba(15, 23, 42, 0.85)',
            color: isRecordDrawerOpen ? '#ffffff' : '#c084fc',
            border: isRecordDrawerOpen ? '1px solid #7c3aed' : '1px solid rgba(255, 255, 255, 0.12)',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(16px)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          title="Abrir Gaveta Lateral de Registros e Ocorrências Geotécnicas"
        >
          <ClipboardList size={15} />
          <span>Ocorrências</span>
          <span style={{
            backgroundColor: isRecordDrawerOpen ? 'rgba(255, 255, 255, 0.25)' : 'rgba(168, 85, 247, 0.25)',
            color: isRecordDrawerOpen ? '#ffffff' : '#c084fc',
            padding: '1px 6px',
            borderRadius: '999px',
            fontSize: '0.65rem',
            fontWeight: 800
          }}>
            {georeferencedAnomalies.length}
          </span>
        </button>

        {/* Botão 5: Menu de Ferramentas & Regras */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowToolsMenu(prev => !prev)}
            className={`btn-subtle map-hud-trigger ${showToolsMenu ? 'active-glow' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.3rem 0.65rem',
              borderRadius: '10px',
              backgroundColor: showToolsMenu ? 'rgba(255, 255, 255, 0.18)' : 'rgba(15, 23, 42, 0.85)',
              color: '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(16px)',
              whiteSpace: 'nowrap'
            }}
            title="Mais Ferramentas, Configurações de Template e Regras"
          >
            <Sliders size={14} />
            <span>Ferramentas</span>
          </button>

          {showToolsMenu && (
            <div 
              className="glass-panel map-hud-popover animate-page-enter"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                minWidth: '220px',
                borderRadius: '12px',
                padding: '6px',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'rgba(15, 23, 42, 0.96)',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <button
                onClick={() => { setTemplateModalOpen(true); setShowToolsMenu(false); }}
                className="btn-subtle"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.45rem 0.75rem', fontSize: '0.74rem', gap: '8px', color: '#c084fc', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Sparkles size={14} />
                <span>Configurar Template ID</span>
              </button>
              <button
                onClick={() => { setInspectionSettingsModalOpen(true); setShowToolsMenu(false); }}
                className="btn-subtle"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.45rem 0.75rem', fontSize: '0.74rem', gap: '8px', color: '#e2e8f0', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Wrench size={14} />
                <span>Regras de Inspeção</span>
              </button>
              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
              {isMapPresetModified && (
                <button
                  onClick={() => { handleSaveMapPreset(); setShowToolsMenu(false); }}
                  className="btn-subtle"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.45rem 0.75rem', fontSize: '0.74rem', gap: '8px', color: '#38bdf8', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Save size={14} />
                  <span>Salvar enquadramento atual</span>
                </button>
              )}
              {typeof window !== 'undefined' && localStorage.getItem('mdsync_map_preset') && (
                <button
                  onClick={() => { handleResetMapPreset(); setShowToolsMenu(false); }}
                  className="btn-subtle"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.45rem 0.75rem', fontSize: '0.74rem', gap: '8px', color: 'var(--text-muted)', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <RotateCcw size={14} />
                  <span>Restaurar visão padrão</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          2. TOP-CENTER HUD: Busca Instantânea & Filtro de Estrutura
         ======================================================== */}
      <div className="map-hud-top-center">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          padding: '3px 8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(16px)',
          gap: '8px'
        }}>
          {/* Seletor de Estrutura */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Building2 size={14} style={{ color: activeStructureId !== 'TODAS' ? '#38bdf8' : '#94a3b8' }} />
            <select
              value={allDisplayStructures.find(s => 
                s.id === activeStructureId || 
                s.sigla === activeStructureId || 
                normalizeStructureKey(s.id) === activeStructureId ||
                normalizeStructureKey(s.sigla) === activeStructureId
              )?.id || activeStructureId || 'TODAS'}
              onChange={(e) => handleSelectStructure(e.target.value)}
              className="form-select"
              style={{
                padding: '0.2rem 0.45rem',
                fontSize: '0.74rem',
                backgroundColor: 'rgba(30, 41, 59, 0.75)',
                borderRadius: '6px',
                border: activeStructureId !== 'TODAS' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                color: '#f8fafc',
                fontWeight: activeStructureId !== 'TODAS' ? 700 : 500,
                maxWidth: '145px',
                cursor: 'pointer'
              }}
            >
              <option value="TODAS">Complexo Geral ({allDisplayStructures.length})</option>
              {allDisplayStructures.map(s => {
                const count = instruments.filter(i => 
                  (i.estrutura?.replace(/\s+/g, '_') === s.id || i.estrutura === s.id || i.estrutura === s.nome)
                ).length;
                return (
                  <option key={s.id || s.sigla} value={s.id || s.sigla}>
                    {s.nome} {count > 0 ? `(${count})` : (s.lat && s.lon ? '(Locada)' : '')}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Divisor */}
          <span style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

          {/* Campo de Busca */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(30, 41, 59, 0.75)',
              borderRadius: '6px',
              padding: '0.2rem 0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              gap: '6px',
              width: '155px'
            }}>
              <Search size={13} style={{ color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Buscar (ex: PZ-01)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f8fafc',
                  fontSize: '0.74rem',
                  width: '100%'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Resultados da Busca */}
            {searchResults.length > 0 && (
              <div 
                className="map-hud-popover"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.98)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65)',
                  zIndex: 2000,
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}
              >
                {searchResults.map(inst => (
                  <div
                    key={inst.id}
                    onClick={() => handleSelectInstrument(inst)}
                    style={{
                      padding: '0.45rem 0.65rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div>
                      <strong style={{ color: '#38bdf8' }}>{inst.id}</strong>
                      <span style={{ color: '#94a3b8', marginLeft: '6px', fontSize: '0.68rem' }}>
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
        </div>
      </div>

      {/* ========================================================
          3. TOP-RIGHT HUD: GIS Basemap, Visão Geral & Camadas
         ======================================================== */}
      <div className="map-hud-top-right">
        {/* Alternador de Camada Satélite */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          borderRadius: '10px',
          padding: '3px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(16px)',
          gap: '2px'
        }}>
          <button
            onClick={() => setMapType('satellite_google')}
            style={{
              padding: '0.25rem 0.55rem',
              fontSize: '0.72rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: mapType === 'satellite_google' ? '#0094ea' : 'transparent',
              color: mapType === 'satellite_google' ? '#ffffff' : '#94a3b8',
              cursor: 'pointer'
            }}
            title="Google Hybrid Satellite"
          >
            Satélite HD
          </button>
          <button
            onClick={() => setMapType('satellite_esri')}
            style={{
              padding: '0.25rem 0.55rem',
              fontSize: '0.72rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: mapType === 'satellite_esri' ? '#0094ea' : 'transparent',
              color: mapType === 'satellite_esri' ? '#ffffff' : '#94a3b8',
              cursor: 'pointer'
            }}
            title="Esri World Imagery"
          >
            Esri
          </button>
          <button
            onClick={() => setMapType('topo')}
            style={{
              padding: '0.25rem 0.55rem',
              fontSize: '0.72rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: mapType === 'topo' ? '#0094ea' : 'transparent',
              color: mapType === 'topo' ? '#ffffff' : '#94a3b8',
              cursor: 'pointer'
            }}
            title="Relevo e Curvas Topográficas"
          >
            Relevo
          </button>
          <button
            onClick={() => setMapType('dark')}
            style={{
              padding: '0.25rem 0.55rem',
              fontSize: '0.72rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: mapType === 'dark' ? '#0094ea' : 'transparent',
              color: mapType === 'dark' ? '#ffffff' : '#94a3b8',
              cursor: 'pointer'
            }}
            title="Modo Escuro Geotécnico"
          >
            Dark
          </button>
        </div>

        {/* Botão Visão Geral / Reset Câmera */}
        <button
          onClick={() => {
            handleSelectStructure('TODAS');
            setSelectedInstrument(null);
          }}
          className="btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '0.35rem 0.65rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#e2e8f0',
            fontSize: '0.74rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(16px)'
          }}
          title="Centralizar e visualizar todo o complexo minerário"
        >
          <Compass size={14} style={{ color: '#38bdf8' }} />
          <span>Visão Geral</span>
        </button>

        {/* Botão Flutuante de Camadas & Filtros */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLayersMenu(prev => !prev)}
            className={`btn-subtle map-hud-trigger ${showLayersMenu ? 'active-glow' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0.35rem 0.7rem',
              borderRadius: '10px',
              backgroundColor: showLayersMenu ? 'rgba(56, 189, 248, 0.22)' : 'rgba(15, 23, 42, 0.85)',
              border: showLayersMenu ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
              color: showLayersMenu ? '#38bdf8' : '#e2e8f0',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(16px)'
            }}
            title="Alternar camadas do mapa e filtros de instrumentação"
          >
            <Filter size={14} style={{ color: '#38bdf8' }} />
            <span>Camadas</span>
            <span style={{
              backgroundColor: 'rgba(56, 189, 248, 0.25)',
              color: '#38bdf8',
              padding: '1px 5px',
              borderRadius: '999px',
              fontSize: '0.62rem',
              fontWeight: 800
            }}>
              {(useClustering ? 1 : 0) + (showPerimeters ? 1 : 0) + (showTickets ? 1 : 0) + (showAnomalies ? 1 : 0) + (showSumps ? 1 : 0) + (showPluviometria ? 1 : 0)}
            </span>
          </button>

          {/* Popover de Camadas e Filtros */}
          {showLayersMenu && (
            <div 
              className="glass-panel map-hud-popover animate-page-enter"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '300px',
                borderRadius: '14px',
                padding: '12px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'rgba(15, 23, 42, 0.96)',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} style={{ color: '#38bdf8' }} />
                  Camadas & Filtros GIS
                </span>
                <button
                  onClick={() => setShowLayersMenu(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                >
                  ✕
                </button>
              </div>

              {/* Toggles de Camadas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>Agrupamento (Clusters):</span>
                  <button
                    onClick={() => setUseClustering(!useClustering)}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: useClustering ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.06)',
                      color: useClustering ? '#38bdf8' : '#94a3b8',
                      border: useClustering ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer'
                    }}
                  >
                    {useClustering ? '● Clusters Ativos' : '○ Pinos Soltos'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>Perímetros das Estruturas:</span>
                  <button
                    onClick={() => setShowPerimeters(!showPerimeters)}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: showPerimeters ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)',
                      color: showPerimeters ? '#10b981' : '#94a3b8',
                      border: showPerimeters ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPerimeters ? 'Visíveis (8)' : 'Ocultos'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>Chamados PCMI / Fluig:</span>
                  <button
                    onClick={() => setShowTickets(!showTickets)}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: showTickets ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.06)',
                      color: showTickets ? '#f59e0b' : '#94a3b8',
                      border: showTickets ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer'
                    }}
                  >
                    {showTickets ? `Ativos (${georeferencedTickets.length})` : 'Ocultos'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>Ocorrências Geotécnicas:</span>
                  <button
                    onClick={() => setShowAnomalies(!showAnomalies)}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: showAnomalies ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.06)',
                      color: showAnomalies ? '#c084fc' : '#94a3b8',
                      border: showAnomalies ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer'
                    }}
                  >
                    {showAnomalies ? `Ativas (${georeferencedAnomalies.length})` : 'Ocultas'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>Camada de SUMPs (GIS):</span>
                  <button
                    onClick={() => setShowSumps(!showSumps)}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: showSumps ? 'rgba(2, 132, 199, 0.25)' : 'rgba(255,255,255,0.06)',
                      color: showSumps ? '#38bdf8' : '#94a3b8',
                      border: showSumps ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer'
                    }}
                  >
                    {showSumps ? `Visíveis (${(sumps && sumps.length > 0) ? sumps.length : SUMPS_DATA.length})` : 'Ocultos'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>Estações Pluviométricas:</span>
                  <button
                    onClick={() => setShowPluviometria(!showPluviometria)}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: showPluviometria ? 'rgba(2, 132, 199, 0.25)' : 'rgba(255,255,255,0.06)',
                      color: showPluviometria ? '#38bdf8' : '#94a3b8',
                      border: showPluviometria ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPluviometria ? `Visíveis (${PLUVIOMETRIA_DATA?.locs?.length || 5})` : 'Ocultas'}
                  </button>
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '2px 0' }} />

              {/* Filtros de Tipo e Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Tipo de Instrumento:</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="form-select"
                    style={{ width: '100%', padding: '0.25rem 0.4rem', fontSize: '0.72rem', backgroundColor: 'rgba(30, 41, 59, 0.8)', color: '#f8fafc', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {availableTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Status Operacional:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="form-select"
                    style={{ width: '100%', padding: '0.25rem 0.4rem', fontSize: '0.72rem', backgroundColor: 'rgba(30, 41, 59, 0.8)', color: '#f8fafc', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <option value="TODOS">Todos</option>
                    <option value="NORMAL">Normal</option>
                    <option value="ATENÇÃO">Atenção</option>
                    <option value="ALERTA">Alerta</option>
                    <option value="EMERGÊNCIA">Emergência</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* ========================================================
          4. BOTTOM-LEFT HUD: Coordenadas em Tempo Real & Legenda Minimalista
         ======================================================== */}
      <div className="map-hud-bottom-left">
        {/* Telemetria Geodésica */}
        {cursorCoords && (
          <div style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(16px)'
          }}>
            <span>LAT: <strong style={{ color: '#f8fafc' }}>{cursorCoords.lat}</strong></span>
            <span>LON: <strong style={{ color: '#f8fafc' }}>{cursorCoords.lon}</strong></span>
            <span>UTM 23S: <strong style={{ color: '#38bdf8' }}>E {cursorCoords.utmE} / N {cursorCoords.utmN}</strong></span>
            <span>ZOOM: <strong style={{ color: '#0094ea' }}>{mapZoom}x</strong></span>
            <button
              onClick={handleCopyCoords}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: copiedCoords ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                color: copiedCoords ? '#22c55e' : '#cbd5e1',
                border: copiedCoords ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.12)',
                cursor: 'pointer',
                fontSize: '0.66rem',
                fontWeight: 600,
                marginLeft: '2px'
              }}
              title="Copiar Coordenadas Geodésicas"
            >
              {copiedCoords ? <Check size={11} /> : <Copy size={11} />}
              <span>{copiedCoords ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        )}

        {/* Legenda Geotécnica Inline Compacta (Não obstrui o mapa) */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowLegendPopover(prev => !prev)}
            className="map-hud-trigger"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#e2e8f0',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(16px)',
              cursor: 'pointer'
            }}
            title="Clique para ver detalhes das convenções geotécnicas"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} style={{ color: '#38bdf8' }} />
              <span>Legenda:</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--geo-normal)' }} />
                <span>Normal</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--geo-atencao)' }} />
                <span>Atenção</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--geo-alerta)' }} />
                <span>Alerta</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--geo-emergencia)' }} />
                <span>Emergência</span>
              </span>
            </div>
          </div>

          {/* Popover Detalhado da Legenda */}
          {showLegendPopover && (
            <div 
              className="glass-panel map-hud-popover animate-page-enter"
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: 0,
                width: '230px',
                borderRadius: '10px',
                padding: '8px 12px',
                backgroundColor: 'rgba(15, 23, 42, 0.96)',
                border: '1px solid var(--border-medium)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65)',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '0.72rem'
              }}
            >
              <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>Convenções Geotécnicas</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'var(--geo-normal)' }} />
                <span>Normal (Operação Estável)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'var(--geo-atencao)' }} />
                <span>Atenção Operacional</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'var(--geo-alerta)' }} />
                <span>Alerta Geotécnico</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'var(--geo-emergencia)' }} />
                <span>Emergência (PAEBM)</span>
              </div>
            </div>
          )}
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

          {/* Coordenadas Exatas (SIRGAS 2000 UTM 23S & WGS-84) */}
          <div style={{
            padding: '0.45rem 0.65rem',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            borderRadius: '6px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            fontSize: '0.7rem'
          }}>
            <div style={{ color: 'var(--primary-accent)', fontWeight: 800, marginBottom: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>📍 COORDENADAS EXATAS (SIRGAS 2000)</span>
              <button
                onClick={() => {
                  const text = `ID: ${selectedInstrument.id} | UTM: E ${selectedInstrument.coordenadaEW} N ${selectedInstrument.coordenadaNS} | Lat: ${selectedInstrument.lat} Lon: ${selectedInstrument.lon}`;
                  navigator.clipboard?.writeText(text);
                  if (setSystemToast) {
                    setSystemToast({ type: 'success', message: `Coordenadas do ${selectedInstrument.id} copiadas!` });
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary-accent)',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textDecoration: 'underline'
                }}
                title="Copiar coordenadas para área de transferência"
              >
                Copiar
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)' }}>
              <span>UTM E: <strong>{selectedInstrument.coordenadaEW ? Math.round(selectedInstrument.coordenadaEW) : '-'}</strong></span>
              <span>UTM N: <strong>{selectedInstrument.coordenadaNS ? Math.round(selectedInstrument.coordenadaNS) : '-'}</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px', fontSize: '0.68rem' }}>
              <span>Lat: {selectedInstrument.lat}</span>
              <span>Lon: {selectedInstrument.lon}</span>
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
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (onSelectInstrumentForReading) {
                  onSelectInstrumentForReading(selectedInstrument);
                }
                onNavigateTab('campo');
              }}
              className="btn-primary"
              style={{ flex: 1, minWidth: '95px', fontSize: '0.75rem', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <ClipboardEdit size={14} />
              <span>Coletar</span>
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab('piezometria')}
              className="btn-secondary"
              style={{ flex: 1, minWidth: '95px', fontSize: '0.75rem', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              title="Abrir gráficos e curvas piezométricas"
            >
              <Eye size={14} />
              <span>Gráficos</span>
            </button>
          </div>
        </div>
      )}

      {/* Card Flutuante: Detalhes do Chamado PCMI Selecionado */}
      {selectedTicket && (
        <div className="card-panel glass-panel animate-page-enter" style={{
          position: 'absolute',
          top: '80px',
          right: '16px',
          width: '360px',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 800, 
                  color: '#f59e0b', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Chamado PCMI #{selectedTicket.protocolo || selectedTicket.proto || selectedTicket.id}
                </span>
                <span className="badge-status badge-atencao" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                  {selectedTicket.criticidade || selectedTicket.crit || 'Nível Alerta'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 2px' }}>
                {selectedTicket.titulo || selectedTicket.acaoCorretiva || 'Chamado de Manutenção'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {selectedTicket.estrutura || selectedTicket.estr || 'Complexo Itaminas'} • {selectedTicket.localizacao || selectedTicket.tipo || ''}
              </span>
            </div>
            <button
              onClick={() => setSelectedTicket(null)}
              className="btn-icon"
              title="Fechar painel"
              style={{ width: '28px', height: '28px', borderRadius: '50%' }}
            >
              ✕
            </button>
          </div>

          <div style={{
            padding: '0.6rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            fontSize: '0.75rem',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ color: 'var(--text-faint)', fontSize: '0.68rem', fontWeight: 700 }}>ANOMALIA / OCORRÊNCIA</div>
            <div style={{ color: 'var(--text-main)' }}>{selectedTicket.descricao || selectedTicket.planoAcao || selectedTicket.observacoes || 'Sem descrição cadastrada'}</div>
          </div>

          <div style={{
            padding: '0.6rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            fontSize: '0.75rem',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ color: 'var(--primary-accent)', fontSize: '0.68rem', fontWeight: 700 }}>AÇÃO RECOMENDADA (PCMI)</div>
            <div style={{ color: 'var(--text-main)' }}>{selectedTicket.acaoRecomendada || selectedTicket.acaoCorretiva || 'Acompanhamento e intervenção corretiva em campo.'}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
            <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-faint)', fontSize: '0.68rem' }}>Setor Responsável</div>
              <strong>{selectedTicket.setorResponsavel || selectedTicket.requerido || selectedTicket.setorResponsavelSigla || 'Manutenção Civil'}</strong>
            </div>
            <div style={{ padding: '0.45rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-faint)', fontSize: '0.68rem' }}>Prazo SLA</div>
              <strong style={{ color: '#f59e0b' }}>{selectedTicket.prazoSla || selectedTicket.limite || 'Ativo'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
            <button
              onClick={() => {
                if (onNavigateTab) onNavigateTab('chamados');
              }}
              className="btn-primary"
              style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <span>Ver no Painel TOTVS Fluig</span>
            </button>
            {selectedTicket.urlFluig && (
              <a
                href={selectedTicket.urlFluig}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Abrir no portal Fluig"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          Gaveta Lateral de Cards de Registros (SYSDAM Print 4)
         ======================================================== */}
      <MapInspectionRecordDrawer
        isOpen={isRecordDrawerOpen}
        onClose={() => setIsRecordDrawerOpen(false)}
        records={georeferencedAnomalies}
        selectedRecord={selectedInspectionRecord}
        onSelectRecord={(rec) => {
          setSelectedInspectionRecord(rec);
          setSelectedInstrument(null);
          setSelectedTicket(null);
          if (rec.lat && rec.lon && mapInstanceRef.current?.map) {
            mapInstanceRef.current.map.setView([rec.lat, rec.lon], 17, { animate: true });
          }
        }}
        onOpenNewRecord={() => {
          if (onNavigateTab) onNavigateTab('anomalias_inspecoes');
        }}
        onOpenSettings={() => setInspectionSettingsModalOpen(true)}
        onOpenTemplate={() => setTemplateModalOpen(true)}
      />

      {/* ========================================================
          Painel Detalhado de Registro de Inspeção (SYSDAM Print 3)
         ======================================================== */}
      {selectedInspectionRecord && (
        <MapInspectionDetailPanel
          record={selectedInspectionRecord}
          onClose={() => setSelectedInspectionRecord(null)}
          onGenerateReport={(rec) => {
            if (setSystemToast) {
              setSystemToast({
                type: 'success',
                message: `Relatório técnico da ocorrência "${rec.codigo || rec.id}" gerado com sucesso!`
              });
            }
            if (onNavigateTab) onNavigateTab('laudo');
          }}
          onShowAuditHistory={(rec) => {
            if (setSystemToast) {
              setSystemToast({
                type: 'info',
                message: `Auditoria: Criado em ${rec.dataIdentificacao || '2026-09-18'} por ${rec.responsavel || 'Eng. Geotécnico'}.`
              });
            }
          }}
          onConvertRecord={(rec) => {
            if (setSystemToast) {
              setSystemToast({
                type: 'success',
                message: `Ocorrência "${rec.codigo || rec.id}" convertida para Chamado de Campo PCMI!`
              });
            }
            if (onNavigateTab) onNavigateTab('chamados');
          }}
          onMergeRecord={() => {
            if (setSystemToast) {
              setSystemToast({
                type: 'info',
                message: `Fusão de registros: recurso ativado para agrupar históricos de ocorrência.`
              });
            }
          }}
          onCenterOnMap={(rec) => {
            if (rec.lat && rec.lon && mapInstanceRef.current?.map) {
              mapInstanceRef.current.map.setView([rec.lat, rec.lon], 18, { animate: true });
            }
          }}
        />
      )}

      {/* ========================================================
          Widget Flutuante Inferior Direito (SYSDAM Prints 3 & 4)
         ======================================================== */}
      <MapFloatingWidget
        records={georeferencedAnomalies}
      />

      {/* ========================================================
          Modais do SYSDAM: Template do ID e Regras de Inspeção
         ======================================================== */}
      <RecordIdTemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSave={(tpl) => {
          if (setSystemToast) {
            setSystemToast({
              type: 'success',
              message: `Template do identificador atualizado: "${tpl}"`
            });
          }
        }}
      />

      <InspectionSettingsModal
        isOpen={inspectionSettingsModalOpen}
        onClose={() => setInspectionSettingsModalOpen(false)}
        onSave={() => {
          if (setSystemToast) {
            setSystemToast({
              type: 'success',
              message: 'Parâmetros de inspeção atualizados com sucesso!'
            });
          }
        }}
      />

      {/* Modal Interativo do Modelo de Blocos Curto Prazo (CP) Engenho Seco */}
      {blockModelModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '1350px',
            maxHeight: '92vh',
            overflowY: 'auto',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
          }}>
            <EngenhoSecoBlockModelViewer 
              onClose={() => setBlockModelModalOpen(false)}
              onNavigateToMap={(target) => {
                setBlockModelModalOpen(false);
                if (mapInstanceRef.current?.map) {
                  if (target?.coords) {
                    mapInstanceRef.current.map.flyTo(target.coords, target.zoom || 16, { duration: 1.2 });
                  } else if (target?.centroideWgs84) {
                    mapInstanceRef.current.map.flyTo([target.centroideWgs84.lat, target.centroideWgs84.lon], 17, {
                      duration: 1.2
                    });
                  } else {
                    mapInstanceRef.current.map.flyTo([-20.095810, -44.111803], 16, { duration: 1.2 });
                  }
                }
              }}
            />
          </div>
        </div>
      )}
      {/* Painel Executivo Oficial de SUMPs (Fixado / Docked / Modal) */}
      <SumpsExecutivePanel
        sumpsList={(sumps && sumps.length > 0) ? sumps : SUMPS_DATA}
        isOpen={showSumpsPanel}
        onClose={() => setShowSumpsPanel(false)}
        isPinned={isSumpsPanelPinned}
        onTogglePin={() => setIsSumpsPanelPinned(!isSumpsPanelPinned)}
        onFocusSump={handleFocusSump}
        selectedSumpTag={selectedSumpTag}
        activeFilterMina={filterSumpMina}
        onChangeFilterMina={setFilterSumpMina}
        activeFilterCrits={filterSumpCrits}
        onChangeFilterCrits={setFilterSumpCrits}
        activeFilterAnom={filterSumpAnom}
        onChangeFilterAnom={setFilterSumpAnom}
      />
    </div>
  );
};

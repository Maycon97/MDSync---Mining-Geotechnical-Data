import React, { useEffect, useRef, useState } from 'react';
import L, { 
  Map, 
  TileLayer, 
  Marker, 
  DivIcon 
} from '../utils/leafletCompat';
import { 
  MapPin, 
  X, 
  Navigation, 
  Check, 
  RotateCcw, 
  Compass, 
  Layers,
  Palette
} from 'lucide-react';
import {
  QGIS_PIN_COLORS,
  resolveStructureDefaultColor,
  createQgisPinMarkerHtml,
  createQgisPinSvg
} from '../utils/qgisPinFormatter';

/**
 * StructureLocationPickerModal
 * Modal interativo com mapa Leaflet para selecionar ou ajustar
 * as coordenadas geográficas (Latitude / Longitude) e cor do alfinete QGIS de uma estrutura.
 */
export const StructureLocationPickerModal = ({
  isOpen,
  onClose,
  initialCoords,
  structureName = 'Nova Estrutura',
  structureSigla = '',
  initialColor = '#ef4444',
  existingStructures = [],
  onConfirm
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const activeMarkerRef = useRef(null);

  const defaultCenter = { lat: -20.0825, lon: -44.1085 }; // Complexo Itaminas / Sarzedo

  const [coords, setCoords] = useState(() => {
    const lat = initialCoords?.lat ? Number(initialCoords.lat) : defaultCenter.lat;
    const lon = initialCoords?.lon ? Number(initialCoords.lon) : defaultCenter.lon;
    return {
      lat: isNaN(lat) ? defaultCenter.lat : lat,
      lon: isNaN(lon) ? defaultCenter.lon : lon
    };
  });

  const [pinColor, setPinColor] = useState(() => initialColor || '#ef4444');
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [activeBaseLayer, setActiveBaseLayer] = useState('satellite');

  // Atualizar coordenadas e cor locais quando o modal abre
  useEffect(() => {
    if (isOpen) {
      const lat = initialCoords?.lat ? Number(initialCoords.lat) : defaultCenter.lat;
      const lon = initialCoords?.lon ? Number(initialCoords.lon) : defaultCenter.lon;
      const valid = {
        lat: isNaN(lat) ? defaultCenter.lat : lat,
        lon: isNaN(lon) ? defaultCenter.lon : lon
      };
      setCoords(valid);
      if (initialColor) {
        setPinColor(initialColor);
      }
    }
  }, [isOpen, initialCoords, initialColor]);

  // Função auxiliar para construir o DivIcon do alfinete ativo no mapa
  const buildActivePinIcon = (color) => {
    return new DivIcon({
      className: 'qgis-structure-pin-icon',
      html: createQgisPinMarkerHtml({
        sigla: structureSigla || 'NOVA',
        nome: structureName || 'Nova Estrutura',
        corMarcador: color
      }, { isSelected: true }),
      iconSize: [32, 44],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42],
      tooltipAnchor: [0, -42]
    });
  };

  // Atualizar visual do marcador no mapa quando o usuário troca a cor
  useEffect(() => {
    if (activeMarkerRef.current) {
      activeMarkerRef.current.setIcon(buildActivePinIcon(pinColor));
    }
  }, [pinColor]);

  // Inicializar mapa Leaflet
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let map = null;
    try {
      map = new Map(mapContainerRef.current, {
        center: [coords.lat, coords.lon],
        zoom: 15,
        maxZoom: 20,
        minZoom: 10,
        attributionControl: false,
        zoomControl: true
      });

      mapInstanceRef.current = map;

      // Camadas base
      const satGoogle = new TileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20
      });

      const osmStreets = new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      });

      satGoogle.addTo(map);

      // Renderizar marcadores de referência de outras estruturas existentes como alfinetes QGIS discretos
      (existingStructures || []).forEach(est => {
        const estLat = est.lat ?? est.coordenadas?.lat;
        const estLon = est.lon ?? est.coordenadas?.lon;
        if (estLat && estLon && (est.sigla !== structureSigla)) {
          const refColor = resolveStructureDefaultColor(est);
          const refIcon = new DivIcon({
            className: 'qgis-structure-pin-icon',
            html: createQgisPinMarkerHtml(est, { isSelected: false }),
            iconSize: [26, 36],
            iconAnchor: [13, 34],
            popupAnchor: [0, -34],
            tooltipAnchor: [0, -34]
          });
          const refMarker = new Marker([estLat, estLon], { icon: refIcon, opacity: 0.82 }).addTo(map);
          refMarker.bindTooltip(`
            <div style="font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 700; color: #ffffff;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${refColor}; margin-right: 4px;"></span>
              ${est.sigla || est.nome}
            </div>
          `, { direction: 'top', offset: [0, -34] });
        }
      });

      // Marcador da nova estrutura com Alfinete Cartográfico QGIS Interativo e Arrastável
      const pinIcon = buildActivePinIcon(pinColor);

      const pinMarker = new Marker([coords.lat, coords.lon], {
        icon: pinIcon,
        draggable: true,
        zIndexOffset: 1500
      }).addTo(map);

      activeMarkerRef.current = pinMarker;

      pinMarker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setCoords({ lat: Number(pos.lat.toFixed(6)), lon: Number(pos.lng.toFixed(6)) });
      });

      // Clique no mapa move o marcador instantaneamente
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const newCoords = { lat: Number(lat.toFixed(6)), lon: Number(lng.toFixed(6)) };
        pinMarker.setLatLng([newCoords.lat, newCoords.lon]);
        setCoords(newCoords);
      });

      // Invalidate size para garantir renderização perfeita no modal
      setTimeout(() => {
        try { map?.invalidateSize(); } catch (_) {}
      }, 150);

    } catch (err) {
      console.warn('[StructureLocationPickerModal] Falha ao instanciar mapa:', err);
    }

    return () => {
      if (map) {
        try { map.remove(); } catch (_) {}
      }
      mapInstanceRef.current = null;
      activeMarkerRef.current = null;
    };
  }, [isOpen]);

  // Atualizar posição do marcador quando coords mudar manualmente ou via GPS
  const updateMapPosition = (newLat, newLon) => {
    const latNum = Number(newLat);
    const lonNum = Number(newLon);
    if (!isNaN(latNum) && !isNaN(lonNum)) {
      setCoords({ lat: latNum, lon: lonNum });
      if (activeMarkerRef.current) {
        activeMarkerRef.current.setLatLng([latNum, lonNum]);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo([latNum, lonNum], { animate: true });
      }
    }
  };

  // Capturar GPS do dispositivo
  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não disponível no navegador.');
      return;
    }
    setIsCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsCapturingGps(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lon = Number(pos.coords.longitude.toFixed(6));
        updateMapPosition(lat, lon);
      },
      (err) => {
        setIsCapturingGps(false);
        alert(`Erro ao obter GPS: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Centralizar no complexo padrão
  const handleResetToSarzedo = () => {
    updateMapPosition(defaultCenter.lat, defaultCenter.lon);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm({
        lat: coords.lat,
        lon: coords.lon,
        corMarcador: pinColor
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop animate-fade-in"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        padding: '1rem'
      }}
    >
      <div 
        className="modal-container"
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-2xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Cabeçalho */}
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-accent)'
            }}>
              <Compass size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Definir Localização no Mapa
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Clique no mapa ou arraste o marcador para posicionar <strong>{structureName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '30px', height: '30px', borderRadius: '6px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Mapa Interativo */}
        <div style={{ position: 'relative', width: '100%', height: '380px', backgroundColor: '#0f172a' }}>
          <div 
            ref={mapContainerRef} 
            style={{ width: '100%', height: '100%', cursor: 'crosshair' }} 
          />

          {/* Dica flutuante sobre o mapa */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '0.72rem',
            color: '#f8fafc',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <MapPin size={12} style={{ color: '#38bdf8' }} />
            <span>Clique em qualquer ponto do terreno para fixar as coordenadas</span>
          </div>
        </div>

        {/* Faixa de Coordenadas e Ações Rápidas */}
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Latitude (Graus Decimais)
              </label>
              <input
                type="number"
                step="any"
                value={coords.lat}
                onChange={(e) => updateMapPosition(e.target.value, coords.lon)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-main)',
                  fontWeight: 600
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Longitude (Graus Decimais)
              </label>
              <input
                type="number"
                step="any"
                value={coords.lon}
                onChange={(e) => updateMapPosition(coords.lat, e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-main)',
                  fontWeight: 600
                }}
              />
            </div>
          </div>

          {/* Seletor de Simbologia & Cor do Alfinete QGIS (Requisito QGIS) */}
          <div style={{
            padding: '0.75rem 0.95rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Palette size={14} style={{ color: pinColor }} />
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.2px' }}>
                  Simbologia do Alfinete (Padrão QGIS)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cor Selecionada:</span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--bg-card)',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: pinColor
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: pinColor }}></span>
                  <span>{pinColor.toUpperCase()}</span>
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Paleta de Cores Padrão QGIS */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
                {QGIS_PIN_COLORS.map(c => {
                  const isCurrent = pinColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.id}
                      data-color={c.hex}
                      data-testid={`color-swatch-${c.id}`}
                      type="button"
                      onClick={() => setPinColor(c.hex)}
                      title={`${c.name} - ${c.desc}`}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: c.hex,
                        border: isCurrent ? '2.5px solid #ffffff' : '1.5px solid rgba(255,255,255,0.3)',
                        boxShadow: isCurrent ? `0 0 10px ${c.hex}, 0 2px 6px rgba(0,0,0,0.6)` : '0 2px 4px rgba(0,0,0,0.35)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: isCurrent ? 'scale(1.18)' : 'scale(1)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        padding: 0
                      }}
                    >
                      {isCurrent && <span style={{ color: '#ffffff', fontSize: '11px', fontWeight: 900, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Seletor Customizado / Pipeta HEX */}
              <label 
                title="Escolher cor personalizada no espectro..."
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  cursor: 'pointer',
                  fontSize: '0.73rem',
                  color: 'var(--text-main)',
                  fontWeight: 600
                }}
              >
                <span>🎨 Outra Cor</span>
                <input 
                  type="color" 
                  value={pinColor} 
                  onChange={(e) => setPinColor(e.target.value)}
                  style={{
                    width: '22px',
                    height: '22px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    padding: 0,
                    background: 'none'
                  }}
                />
              </label>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleCaptureGps}
                disabled={isCapturingGps}
                className="btn-secondary"
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Navigation size={13} style={{ color: '#38bdf8' }} />
                <span>{isCapturingGps ? 'Capturando GPS...' : 'Usar Meu GPS'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetToSarzedo}
                className="btn-secondary"
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Centralizar no Complexo Minerário Itaminas (Sarzedo/MG)"
              >
                <RotateCcw size={13} />
                <span>Complexo Sarzedo</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="btn-primary"
                style={{
                  padding: '0.45rem 1.1rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Check size={14} />
                <span>Confirmar Localização</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ============================================================
// MDSync — Leaflet bootstrap
// Leaflet 1.9.x (estável) + plugins clássicos (leaflet.markercluster).
//
// POR QUE 1.9.x: o leaflet.markercluster 1.x depende de L.FeatureGroup.extend()
// e L.featureGroup(), APIs removidas no Leaflet 2.0 (ESM-only, sem fábricas).
// Misturar os dois causava "L.featureGroup is not a function".
//
// Este módulo precisa ser o PRIMEIRO import do app (veja main.jsx): ele publica
// window.L antes de o plugin markercluster ser avaliado.
// ============================================================

import L from 'leaflet';

// Plugins clássicos esperam o global `L`.
if (typeof window !== 'undefined') {
  window.L = L;
}

// Re-exports nomeados (mantém compatibilidade com os imports existentes
// em MapTab.jsx, ex: `import L, { Map, TileLayer } from '../utils/leafletCompat'`).
export const Map = L.Map;
export const TileLayer = L.TileLayer;
export const Marker = L.Marker;
export const Circle = L.Circle;
export const CircleMarker = L.CircleMarker;
export const Polygon = L.Polygon;
export const Polyline = L.Polyline;
export const Popup = L.Popup;
export const Tooltip = L.Tooltip;
export const LayerGroup = L.LayerGroup;
export const FeatureGroup = L.FeatureGroup;
export const DivIcon = L.DivIcon;
export const Icon = L.Icon;
export const LatLng = L.LatLng;
export const LatLngBounds = L.LatLngBounds;
export const Control = L.Control;
export const CRS = L.CRS;
export const Browser = L.Browser;
export const DomEvent = L.DomEvent;
export const DomUtil = L.DomUtil;
export const Util = L.Util;

export default L;

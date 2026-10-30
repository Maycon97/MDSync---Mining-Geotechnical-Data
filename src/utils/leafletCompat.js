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

// Blindagem definitiva das fábricas Leaflet para plugins legados (ex: leaflet.markercluster)
const patchFactories = (target) => {
  if (!target) return;
  if (typeof target.featureGroup !== 'function') {
    target.featureGroup = function (layers, options) {
      return new (target.FeatureGroup || FeatureGroup)(layers, options);
    };
  }
  if (typeof target.layerGroup !== 'function') {
    target.layerGroup = function (layers, options) {
      return new (target.LayerGroup || LayerGroup)(layers, options);
    };
  }
  if (typeof target.circle !== 'function' && target.Circle) {
    target.circle = function (latlng, options) {
      return new target.Circle(latlng, options);
    };
  }
  if (typeof target.circleMarker !== 'function' && target.CircleMarker) {
    target.circleMarker = function (latlng, options) {
      return new target.CircleMarker(latlng, options);
    };
  }
  if (typeof target.polygon !== 'function' && target.Polygon) {
    target.polygon = function (latlngs, options) {
      return new target.Polygon(latlngs, options);
    };
  }
  if (typeof target.polyline !== 'function' && target.Polyline) {
    target.polyline = function (latlngs, options) {
      return new target.Polyline(latlngs, options);
    };
  }
  if (typeof target.marker !== 'function' && target.Marker) {
    target.marker = function (latlng, options) {
      return new target.Marker(latlng, options);
    };
  }
  if (typeof target.popup !== 'function' && target.Popup) {
    target.popup = function (options, source) {
      return new target.Popup(options, source);
    };
  }
  if (typeof target.tooltip !== 'function' && target.Tooltip) {
    target.tooltip = function (options, source) {
      return new target.Tooltip(options, source);
    };
  }
};

patchFactories(L);

// Plugins clássicos esperam o global `L`.
if (typeof window !== 'undefined') {
  window.L = L;
  patchFactories(window.L);
  if (window.L && window.L.default) {
    patchFactories(window.L.default);
  }
}
if (typeof globalThis !== 'undefined') {
  globalThis.L = L;
  patchFactories(globalThis.L);
  if (globalThis.L && globalThis.L.default) {
    patchFactories(globalThis.L.default);
  }
}

export default L;

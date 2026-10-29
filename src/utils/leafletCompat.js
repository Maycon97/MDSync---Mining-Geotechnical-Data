// ============================================================
// MDSync — Leaflet Compatibility & Polyfill Bridge
// Garante interoperabilidade 100% entre Leaflet 2.0 ESM e plugins
// clássicos do ecossistema Leaflet (ex: leaflet.markercluster)
// ============================================================

import LModule, {
  Map,
  TileLayer,
  Marker,
  Circle,
  CircleMarker,
  Polygon,
  Polyline,
  Popup,
  Tooltip,
  LayerGroup,
  FeatureGroup,
  DivIcon,
  Icon,
  LatLng,
  LatLngBounds,
  Control,
  CRS,
  Browser,
  DomEvent,
  DomUtil,
  Util
} from 'leaflet';

const L = LModule.default || LModule;

// 1. Classes Fundamentais
L.Map = Map;
L.TileLayer = TileLayer;
L.Marker = Marker;
L.Circle = Circle;
L.CircleMarker = CircleMarker;
L.Polygon = Polygon;
L.Polyline = Polyline;
L.Popup = Popup;
L.Tooltip = Tooltip;
L.LayerGroup = LayerGroup;
L.FeatureGroup = FeatureGroup;
L.DivIcon = DivIcon;
L.Icon = Icon;
L.LatLng = LatLng;
L.LatLngBounds = LatLngBounds;
L.Control = Control;
L.CRS = CRS;
L.Browser = Browser;
L.DomEvent = DomEvent;
L.DomUtil = DomUtil;

// 2. Utilitários esperados por plugins do Leaflet 1.x
L.Util = Util || {};
L.Util.extend = L.Util.extend || Object.assign;
L.extend = L.extend || Object.assign;
L.setOptions = L.setOptions || ((obj, options) => {
  obj.options = Object.assign({}, obj.options, options);
  return obj.options;
});
L.stamp = L.stamp || ((obj) => {
  obj._leaflet_id = obj._leaflet_id || ('_' + Math.random().toString(36).substring(2, 11));
  return obj._leaflet_id;
});
L.bind = L.bind || ((fn, obj) => fn.bind(obj));

// 3. Funções Fábrica Clássicas (Evita "L.featureGroup is not a function")
L.map = L.map || ((id, opts) => new Map(id, opts));
L.tileLayer = L.tileLayer || ((url, opts) => new TileLayer(url, opts));
L.marker = L.marker || ((latlng, opts) => new Marker(latlng, opts));
L.circle = L.circle || ((latlng, opts) => new Circle(latlng, opts));
L.circleMarker = L.circleMarker || ((latlng, opts) => new CircleMarker(latlng, opts));
L.polygon = L.polygon || ((latlngs, opts) => new Polygon(latlngs, opts));
L.polyline = L.polyline || ((latlngs, opts) => new Polyline(latlngs, opts));
L.popup = L.popup || ((opts, source) => new Popup(opts, source));
L.tooltip = L.tooltip || ((opts, source) => new Tooltip(opts, source));
L.layerGroup = L.layerGroup || ((layers, opts) => new LayerGroup(layers, opts));
L.featureGroup = L.featureGroup || ((layers, opts) => new FeatureGroup(layers, opts));
L.divIcon = L.divIcon || ((opts) => new DivIcon(opts));
L.icon = L.icon || ((opts) => new Icon(opts));
L.latLng = L.latLng || ((a, b, c) => new LatLng(a, b, c));
L.latLngBounds = L.latLngBounds || ((a, b) => new LatLngBounds(a, b));

// 4. Exposição Global para Plugins como leaflet.markercluster
if (typeof window !== 'undefined') {
  window.L = L;
}

export {
  Map,
  TileLayer,
  Marker,
  Circle,
  CircleMarker,
  Polygon,
  Polyline,
  Popup,
  Tooltip,
  LayerGroup,
  FeatureGroup,
  DivIcon,
  Icon,
  LatLng,
  LatLngBounds,
  Control,
  CRS,
  Browser,
  DomEvent,
  DomUtil,
  Util
};

export default L;


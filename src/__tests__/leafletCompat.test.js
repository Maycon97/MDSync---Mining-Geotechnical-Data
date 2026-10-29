// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import L, {
  Map,
  TileLayer,
  Marker,
  Polygon,
  Polyline,
  LayerGroup,
  FeatureGroup,
  DivIcon
} from '../utils/leafletCompat';
import 'leaflet.markercluster';

describe('Leaflet bootstrap (1.9.x + markercluster)', () => {
  it('exporta as classes primárias do Leaflet', () => {
    [Map, TileLayer, Marker, Polygon, Polyline, LayerGroup, FeatureGroup, DivIcon].forEach((c) =>
      expect(typeof c).toBe('function')
    );
  });

  it('expõe as fábricas clássicas (L.featureGroup não pode quebrar)', () => {
    expect(typeof L.featureGroup).toBe('function');
    expect(L.featureGroup() instanceof FeatureGroup).toBe(true);
    ['layerGroup', 'marker', 'divIcon', 'polygon', 'polyline', 'latLng', 'latLngBounds', 'map', 'tileLayer']
      .forEach((fn) => expect(typeof L[fn]).toBe('function'));
  });

  it('publica window.L antes do plugin e o markercluster registra L.markerClusterGroup', () => {
    expect(window.L).toBe(L);
    expect(typeof L.markerClusterGroup).toBe('function');
    const group = L.markerClusterGroup({ maxClusterRadius: 40 });
    expect(typeof group.addLayer).toBe('function');
  });

  it('cria um mapa real e adiciona marcadores em cluster sem erro', () => {
    const el = document.createElement('div');
    el.style.width = '400px';
    el.style.height = '300px';
    document.body.appendChild(el);

    const map = new Map(el, { center: [-20.0638, -44.1143], zoom: 15, maxZoom: 19 });
    const cluster = L.markerClusterGroup().addTo(map);
    cluster.addLayer(new Marker([-20.0638, -44.1143]));
    cluster.addLayer(new Marker([-20.0640, -44.1145]));

    expect(cluster.getLayers().length).toBe(2);
    map.remove();
  });
});

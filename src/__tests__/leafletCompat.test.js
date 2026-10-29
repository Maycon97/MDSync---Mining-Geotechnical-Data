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

describe('Leaflet Compatibility & Polyfill Bridge', () => {
  it('should export all primary Leaflet classes', () => {
    expect(Map).toBeDefined();
    expect(TileLayer).toBeDefined();
    expect(Marker).toBeDefined();
    expect(Polygon).toBeDefined();
    expect(Polyline).toBeDefined();
    expect(LayerGroup).toBeDefined();
    expect(FeatureGroup).toBeDefined();
    expect(DivIcon).toBeDefined();
  });

  it('should define L.featureGroup factory and not throw', () => {
    expect(typeof L.featureGroup).toBe('function');
    const fg = L.featureGroup();
    expect(fg).toBeDefined();
    expect(fg instanceof FeatureGroup || fg.addLayer).toBeDefined();
  });

  it('should define L.layerGroup, L.marker, L.divIcon, L.polygon and L.latLng factories', () => {
    expect(typeof L.layerGroup).toBe('function');
    expect(typeof L.marker).toBe('function');
    expect(typeof L.divIcon).toBe('function');
    expect(typeof L.polygon).toBe('function');
    expect(typeof L.polyline).toBe('function');
    expect(typeof L.latLng).toBe('function');
    expect(typeof L.latLngBounds).toBe('function');
  });

  it('should define L.extend, L.setOptions, L.stamp and L.bind for Leaflet 1.x plugins', () => {
    expect(typeof L.extend).toBe('function');
    expect(typeof L.setOptions).toBe('function');
    expect(typeof L.stamp).toBe('function');
    expect(typeof L.bind).toBe('function');

    const obj = {};
    L.setOptions(obj, { test: 123 });
    expect(obj.options.test).toBe(123);

    const id = L.stamp(obj);
    expect(id).toBeDefined();
  });

  it('should verify that window.L is bound', () => {
    if (typeof window !== 'undefined') {
      expect(window.L).toBeDefined();
      expect(typeof window.L.featureGroup).toBe('function');
    }
  });
});


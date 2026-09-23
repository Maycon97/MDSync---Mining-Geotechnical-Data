import { describe, it, expect } from 'vitest';
import { STRUCTURE_BOUNDARIES, STRUCTURE_CATEGORIES } from '../data/structureBoundaries';

describe('MapTab GIS Configuration & Boundaries', () => {
  it('should have all 8 mining structures defined with coordinates and categories', () => {
    expect(STRUCTURE_BOUNDARIES.length).toBe(8);

    const ids = STRUCTURE_BOUNDARIES.map(b => b.id);
    expect(ids).toContain('BARRAGEM_B1');
    expect(ids).toContain('BARRAGEM_B4');
    expect(ids).toContain('ENGENHO_SECO');
    expect(ids).toContain('JANGADA');
    expect(ids).toContain('PDE_ES1');
    expect(ids).toContain('PDE_JACÓ');
    expect(ids).toContain('PDE_MANGABA');
    expect(ids).toContain('PILHA_B2');
  });

  it('should have valid polygon coordinates for every structure boundary', () => {
    STRUCTURE_BOUNDARIES.forEach(boundary => {
      expect(boundary.coordinates).toBeDefined();
      expect(boundary.coordinates.length).toBeGreaterThanOrEqual(4); // Polygons must have at least 4 vertices
      expect(boundary.categoria).toBeDefined();
      expect(STRUCTURE_CATEGORIES[boundary.categoria]).toBeDefined();

      // Ensure center is in reasonable Itaminas coordinates (latitude around -20, longitude around -44)
      expect(boundary.center[0]).toBeLessThan(-19.5);
      expect(boundary.center[0]).toBeGreaterThan(-20.5);
      expect(boundary.center[1]).toBeLessThan(-43.5);
      expect(boundary.center[1]).toBeGreaterThan(-44.5);
    });
  });

  it('should define crest lines for major tailings dams B1 and B4', () => {
    const b1 = STRUCTURE_BOUNDARIES.find(b => b.id === 'BARRAGEM_B1');
    const b4 = STRUCTURE_BOUNDARIES.find(b => b.id === 'BARRAGEM_B4');
    expect(b1.crestLine).toBeDefined();
    expect(b1.crestLine.length).toBeGreaterThanOrEqual(2);
    expect(b4.crestLine).toBeDefined();
    expect(b4.crestLine.length).toBeGreaterThanOrEqual(2);
  });
});

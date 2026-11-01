// ============================================================================
// MDSync — Funções puras do visualizador de modelo de blocos
// (geometria, filtros, coloração, estatísticas e ficha de célula)
// ============================================================================
import { cellGeometry } from '../services/blockModelService';
import {
  GRADE_META, NO_DATA_RGB, categoryColor, categoryLabel, hexToRgb01, pointInPolygon, rampRgb
} from './blockModelFormat';

export const CATEGORICAL_MODES = ['lito', 'tipo', 'destino', 'risco', 'dm', 'city'];

// Coordenadas relativas à origem do modelo (metros) para uso no 3D
export function buildGeometry(meta, data) {
  const n = data.n;
  const px = new Float32Array(n), py = new Float32Array(n), pz = new Float32Array(n);
  const { tamanhoPai } = meta;
  let sx, sy, sz;
  if (data.kind === 'overview') {
    const { lx, ly, lz } = meta.overview;
    sx = lx * tamanhoPai.x; sy = ly * tamanhoPai.y; sz = lz * tamanhoPai.z;
    for (let c = 0; c < n; c++) {
      px[c] = data.i[c] * sx + sx / 2;
      py[c] = data.j[c] * sy + sy / 2;
      pz[c] = data.k[c] * sz + sz / 2;
    }
  } else {
    sx = tamanhoPai.x; sy = tamanhoPai.y; sz = tamanhoPai.z;
    for (let c = 0; c < n; c++) {
      px[c] = data.i[c] * sx + sx / 2;
      py[c] = data.j[c] * sy + sy / 2;
      pz[c] = data.kk[c] * sz + sz / 2;
    }
  }
  return { n, px, py, pz, sx, sy, sz };
}

// Mapeia nomes de categoria desligados -> vetor booleano por id
function allowedByName(meta, dim, offSet, onlyName) {
  const names = meta.categorias[dim];
  return names.map((nm) => (onlyName ? nm === onlyName : !offSet || !offSet.has(nm)));
}

export function computeVisible(meta, data, geom, f) {
  const n = data.n;
  const vis = new Uint8Array(n);
  const okTipo = allowedByName(meta, 'tipo', f.tipoOff);
  const okDest = allowedByName(meta, 'destino', f.destinoOff);
  const okRisco = allowedByName(meta, 'risco', f.riscoOff);
  const okLito = allowedByName(meta, 'lito', f.litoOff);
  const okDm = allowedByName(meta, 'dm', null, f.dm || null);
  const okCity = allowedByName(meta, 'city', null, f.city || null);
  const X0 = meta.origem.x, Y0 = meta.origem.y, Z0 = meta.origem.z;
  const zMin = f.zMin ?? -Infinity, zMax = f.zMax ?? Infinity;
  const poly = f.sectorPoly || null;
  for (let c = 0; c < n; c++) {
    if (!okTipo[data.cat.tipo[c]] || !okDest[data.cat.destino[c]] || !okRisco[data.cat.risco[c]]) continue;
    if (!okLito[data.cat.lito[c]] || !okDm[data.cat.dm[c]] || !okCity[data.cat.city[c]]) continue;
    const z = Z0 + geom.pz[c];
    if (z < zMin || z > zMax) continue;
    if (poly && !pointInPolygon(X0 + geom.px[c], Y0 + geom.py[c], poly)) continue;
    vis[c] = 1;
  }
  return vis;
}

export function categoryPalette(meta, dim) {
  return meta.categorias[dim].map((nm, id) => hexToRgb01(categoryColor(dim, nm, id)));
}

export function availableNumericModes(data) {
  return Object.keys(data.g);
}

// Cores (sRGB 0..1) por célula
export function computeColors(meta, data, geom, mode) {
  const n = data.n;
  const out = new Float32Array(n * 3);
  if (CATEGORICAL_MODES.includes(mode)) {
    const pal = categoryPalette(meta, mode);
    const arr = data.cat[mode];
    for (let c = 0; c < n; c++) {
      const rgb = pal[arr[c]] || NO_DATA_RGB;
      out[c * 3] = rgb[0]; out[c * 3 + 1] = rgb[1]; out[c * 3 + 2] = rgb[2];
    }
    return out;
  }
  if (mode === 'cota') {
    const zmin = meta.extensao.zmin, zmax = meta.extensao.zmax;
    for (let c = 0; c < n; c++) {
      const rgb = rampRgb((meta.origem.z + geom.pz[c] - zmin) / (zmax - zmin));
      out[c * 3] = rgb[0]; out[c * 3 + 1] = rgb[1]; out[c * 3 + 2] = rgb[2];
    }
    return out;
  }
  if (mode === 'dens') {
    for (let c = 0; c < n; c++) {
      const rgb = rampRgb((data.dens[c] - 1.5) / 2.5);
      out[c * 3] = rgb[0]; out[c * 3 + 1] = rgb[1]; out[c * 3 + 2] = rgb[2];
    }
    return out;
  }
  const col = data.g[mode];
  const gm = GRADE_META[mode];
  if (!col || !gm) {
    for (let c = 0; c < n; c++) { out[c * 3] = NO_DATA_RGB[0]; out[c * 3 + 1] = NO_DATA_RGB[1]; out[c * 3 + 2] = NO_DATA_RGB[2]; }
    return out;
  }
  const span = gm.max - gm.min;
  for (let c = 0; c < n; c++) {
    const v = col[c];
    const rgb = Number.isNaN(v) ? NO_DATA_RGB : rampRgb((v - gm.min) / span);
    out[c * 3] = rgb[0]; out[c * 3 + 1] = rgb[1]; out[c * 3 + 2] = rgb[2];
  }
  return out;
}

// Estatísticas das células visíveis (massa = volume x densidade; teores ponderados por massa)
export function computeStats(data, visible, vars = ['FEGL', 'SIGL', 'PGL', 'ALGL']) {
  let cnt = 0, vol = 0, mass = 0;
  const sw = {}, swv = {};
  vars.forEach((v) => { sw[v] = 0; swv[v] = 0; });
  for (let c = 0; c < data.n; c++) {
    if (!visible[c]) continue;
    cnt++;
    const m = data.vol[c] * data.dens[c];
    vol += data.vol[c];
    mass += m;
    for (const v of vars) {
      const x = data.g[v] ? data.g[v][c] : NaN;
      if (!Number.isNaN(x)) { const w = m > 0 ? m : data.vol[c] * 1e-3; sw[v] += w; swv[v] += w * x; }
    }
  }
  const g = {};
  vars.forEach((v) => { g[v] = sw[v] > 0 ? swv[v] / sw[v] : null; });
  return { n: cnt, vol, mass, g };
}

// Ficha completa de uma célula (inspector)
export function cellInfo(meta, data, idx) {
  const geo = cellGeometry(meta, data, idx);
  const cat = {};
  meta.colunasCat.forEach((d) => { cat[d] = meta.categorias[d][data.cat[d][idx]]; });
  const g = {};
  Object.keys(data.g).forEach((v) => { g[v] = Number.isNaN(data.g[v][idx]) ? null : data.g[v][idx]; });
  return {
    kind: data.kind,
    e: geo.e, n: geo.n, zMin: geo.z - geo.sz / 2, zMax: geo.z + geo.sz / 2,
    sx: geo.sx, sy: geo.sy, sz: geo.sz,
    cat,
    vol: data.vol[idx],
    dens: data.dens[idx],
    massa: data.vol[idx] * data.dens[idx],
    g
  };
}

// Legenda da coloração atual
export function buildLegend(meta, mode) {
  if (CATEGORICAL_MODES.includes(mode)) {
    return {
      type: 'cat',
      items: meta.categorias[mode].map((nm, id) => ({
        key: nm, label: categoryLabel(mode, nm), color: categoryColor(mode, nm, id)
      }))
    };
  }
  if (mode === 'cota') return { type: 'ramp', min: meta.extensao.zmin, max: meta.extensao.zmax, unit: 'm', title: 'Cota (m)' };
  if (mode === 'dens') return { type: 'ramp', min: 1.5, max: 4, unit: 't/m³', title: 'Densidade (t/m³)' };
  const gm = GRADE_META[mode];
  return { type: 'ramp', min: gm.min, max: gm.max, unit: gm.unit, title: gm.title };
}

// Teste raio x caixa alinhada aos eixos (método das "slabs"); retorna a distância ou -1
export function rayBoxDistance(ox, oy, oz, dx, dy, dz, cx, cy, cz, hx, hy, hz) {
  let tmin = -Infinity;
  let tmax = Infinity;
  // eixo X
  if (Math.abs(dx) < 1e-12) {
    if (ox < cx - hx || ox > cx + hx) return -1;
  } else {
    let t1 = (cx - hx - ox) / dx;
    let t2 = (cx + hx - ox) / dx;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    if (t1 > tmin) tmin = t1;
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return -1;
  }
  // eixo Y
  if (Math.abs(dy) < 1e-12) {
    if (oy < cy - hy || oy > cy + hy) return -1;
  } else {
    let t1 = (cy - hy - oy) / dy;
    let t2 = (cy + hy - oy) / dy;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    if (t1 > tmin) tmin = t1;
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return -1;
  }
  // eixo Z
  if (Math.abs(dz) < 1e-12) {
    if (oz < cz - hz || oz > cz + hz) return -1;
  } else {
    let t1 = (cz - hz - oz) / dz;
    let t2 = (cz + hz - oz) / dz;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    if (t1 > tmin) tmin = t1;
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return -1;
  }
  return tmax < 0 ? -1 : Math.max(tmin, 0);
}


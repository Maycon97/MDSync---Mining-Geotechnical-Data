// ============================================================================
// MDSync — Camadas geoespaciais do modelo 3D
// (superfície do terreno, imagem de satélite, instrumentos, estruturas, eixos)
// Todas as posições são relativas à origem do modelo: x = E - X0, y = cota - Z0, z = N - Y0
// (o componente 3D converte para o sistema do three: x, y*exagero, -z).
// ============================================================================
import {
  INSTRUMENT_TYPES, fmtInt, hexToRgb01, latLonToMercatorPx, latLonToUtm23S, statusColor, utm23SToLatLon
} from './blockModelFormat';

const TILE = 256;

// Retângulo (em pixels do Web Mercator, alinhado a tiles) que cobre a extensão do modelo
export function mosaicBounds(meta, zoom, marginM = 120) {
  const e = meta.extensao;
  const corners = [
    [e.xmin - marginM, e.ymin - marginM], [e.xmax + marginM, e.ymin - marginM],
    [e.xmin - marginM, e.ymax + marginM], [e.xmax + marginM, e.ymax + marginM]
  ];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  corners.forEach(([E, N]) => {
    const { lat, lon } = utm23SToLatLon(E, N);
    const p = latLonToMercatorPx(lat, lon, zoom);
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  });
  const tx0 = Math.floor(minX / TILE), tx1 = Math.floor(maxX / TILE);
  const ty0 = Math.floor(minY / TILE), ty1 = Math.floor(maxY / TILE);
  return {
    zoom, tx0, tx1, ty0, ty1,
    x0: tx0 * TILE, y0: ty0 * TILE,
    w: (tx1 - tx0 + 1) * TILE, h: (ty1 - ty0 + 1) * TILE,
    tiles: (tx1 - tx0 + 1) * (ty1 - ty0 + 1)
  };
}

// Escolhe o maior zoom cujo mosaico cabe na textura máxima da GPU e em um nº razoável de tiles
export function pickZoom(meta, maxTexture = 4096, maxTiles = 220) {
  for (const z of [18, 17, 16, 15]) {
    const b = mosaicBounds(meta, z);
    if (b.w <= maxTexture && b.h <= maxTexture && b.tiles <= maxTiles) return z;
  }
  return 15;
}

// UV de um ponto UTM no mosaico (canvas com origem no canto noroeste; flipY do three => v invertido)
export function surfaceUV(E, N, b) {
  const { lat, lon } = utm23SToLatLon(E, N);
  const p = latLonToMercatorPx(lat, lon, b.zoom);
  return [(p.x - b.x0) / b.w, 1 - (p.y - b.y0) / b.h];
}

// Malha da superfície: 'dem' (terreno derivado do modelo) ou 'flat' (base plana na cota flatZ)
export function buildSurface(meta, terrain, bounds, { mode = 'dem', stride = 2, flatZ } = {}) {
  const X0 = meta.origem.x, Y0 = meta.origem.y, Z0 = meta.origem.z;
  const ps = meta.tamanhoPai.x;
  const fz = flatZ ?? meta.extensao.zmin;
  let xs, ys; // coordenadas UTM das linhas/colunas da grade
  if (mode === 'dem' && terrain) {
    const { nx, ny } = terrain;
    const ii = [], jj = [];
    for (let i = 0; i < nx; i += stride) ii.push(i);
    if (ii[ii.length - 1] !== nx - 1) ii.push(nx - 1);
    for (let j = 0; j < ny; j += stride) jj.push(j);
    if (jj[jj.length - 1] !== ny - 1) jj.push(ny - 1);
    xs = ii.map((i) => ({ i, E: X0 + (i + 0.5) * ps }));
    ys = jj.map((j) => ({ j, N: meta.origem.y + (j + 0.5) * ps }));
  } else {
    const e = meta.extensao, m = 120;
    const nxs = 24, nys = 8;
    xs = Array.from({ length: nxs + 1 }, (_, a) => ({ i: -1, E: e.xmin - m + ((e.xmax - e.xmin + 2 * m) * a) / nxs }));
    ys = Array.from({ length: nys + 1 }, (_, a) => ({ j: -1, N: e.ymin - m + ((e.ymax - e.ymin + 2 * m) * a) / nys }));
  }
  const nvx = xs.length, nvy = ys.length;
  const positions = new Float32Array(nvx * nvy * 3);
  const uvs = new Float32Array(nvx * nvy * 2);
  let v = 0;
  for (let b = 0; b < nvy; b++) {
    for (let a = 0; a < nvx; a++) {
      const { E } = xs[a];
      const { N } = ys[b];
      let z = fz;
      if (mode === 'dem' && terrain) {
        const t = terrain.elev[xs[a].i * terrain.ny + ys[b].j];
        if (!Number.isNaN(t)) z = t;
      }
      positions[v * 3] = E - X0;
      positions[v * 3 + 1] = z - Z0;
      positions[v * 3 + 2] = N - Y0;
      if (bounds) {
        const [u, w] = surfaceUV(E, N, bounds);
        uvs[v * 2] = u; uvs[v * 2 + 1] = w;
      }
      v++;
    }
  }
  const index = new Uint32Array((nvx - 1) * (nvy - 1) * 6);
  let q = 0;
  for (let b = 0; b < nvy - 1; b++) {
    for (let a = 0; a < nvx - 1; a++) {
      const A = b * nvx + a, B = A + 1, C = A + nvx, D = C + 1;
      // z do three = -N: A->B->C é anti-horário visto de cima
      index[q++] = A; index[q++] = B; index[q++] = C;
      index[q++] = B; index[q++] = D; index[q++] = C;
    }
  }
  return { positions, uvs, index, nVerts: nvx * nvy };
}

function insideExtent(meta, E, N, margin) {
  const e = meta.extensao;
  return E >= e.xmin - margin && E <= e.xmax + margin && N >= e.ymin - margin && N <= e.ymax + margin;
}

// Instrumentos geotécnicos do MDSync dentro (ou perto) da área do modelo
export function buildInstrumentMarkers(assets, meta, { colorBy = 'status', margin = 300 } = {}) {
  const X0 = meta.origem.x, Y0 = meta.origem.y, Z0 = meta.origem.z;
  const items = [];
  let outside = 0;
  (assets?.instrumentos || []).forEach((ins) => {
    const E = Number(ins.coordenadaEW), N = Number(ins.coordenadaNS);
    if (!Number.isFinite(E) || !Number.isFinite(N)) { outside++; return; }
    if (!insideExtent(meta, E, N, margin)) { outside++; return; }
    const z = [ins.cotaTopo, ins.ultimaCota, ins.cotaBase].map(Number).find((x) => Number.isFinite(x));
    items.push({ ins, E, N, z: z ?? meta.extensao.zmin });
  });
  const positions = new Float32Array(items.length * 3);
  const colors = new Float32Array(items.length * 3);
  items.forEach((it, k) => {
    positions[k * 3] = it.E - X0;
    positions[k * 3 + 1] = it.z - Z0;
    positions[k * 3 + 2] = it.N - Y0;
    const hex = colorBy === 'tipo'
      ? (INSTRUMENT_TYPES[it.ins.tipo]?.color || '#94a3b8')
      : statusColor(it.ins.statusCalculado);
    const rgb = hexToRgb01(hex);
    colors[k * 3] = rgb[0]; colors[k * 3 + 1] = rgb[1]; colors[k * 3 + 2] = rgb[2];
  });
  return { n: items.length, positions, colors, items: items.map((i) => i.ins), outside };
}

// Rótulos das estruturas (barragens, cavas, pilhas) georreferenciadas pelo MDSync
export function buildStructureLabels(assets, meta, terrain) {
  const X0 = meta.origem.x, Y0 = meta.origem.y, Z0 = meta.origem.z;
  const labels = [];
  const items = [];
  let outside = 0;
  (assets?.estruturas || []).forEach((s) => {
    if (!Number.isFinite(s.lat) || !Number.isFinite(s.lon)) return;
    const { easting, northing } = latLonToUtm23S(s.lat, s.lon);
    if (!insideExtent(meta, easting, northing, 300)) { outside++; return; }
    let z = Number(s.cotaCrista);
    if (!Number.isFinite(z) && terrain) {
      const i = Math.floor((easting - X0) / meta.tamanhoPai.x), j = Math.floor((northing - Y0) / meta.tamanhoPai.y);
      const t = terrain.elev[i * terrain.ny + j];
      if (!Number.isNaN(t)) z = t;
    }
    if (!Number.isFinite(z)) z = meta.extensao.zmin;
    labels.push({ text: s.nome, x: easting - X0, y: z - Z0 + 25, z: northing - Y0, color: '#fde68a', weight: 1.25, kind: 'estrutura' });
    items.push({ nome: s.nome, E: easting, N: northing, z });
  });
  return { labels, items, outside };
}

// Rótulos de coordenadas UTM e cotas ao redor do modelo
export function buildAxisLabels(meta) {
  const X0 = meta.origem.x, Y0 = meta.origem.y, Z0 = meta.origem.z;
  const e = meta.extensao;
  const labels = [];
  const base = e.zmin - Z0;
  for (let E = Math.ceil(e.xmin / 1000) * 1000; E <= e.xmax; E += 1000) {
    labels.push({ text: `E ${fmtInt(E)}`, x: E - X0, y: base, z: e.ymin - Y0 - 90, color: '#94a3b8', weight: 0.8, kind: 'eixo' });
  }
  for (let N = Math.ceil(e.ymin / 500) * 500; N <= e.ymax; N += 500) {
    labels.push({ text: `N ${fmtInt(N)}`, x: e.xmin - X0 - 120, y: base, z: N - Y0, color: '#94a3b8', weight: 0.8, kind: 'eixo' });
  }
  for (let Z = Math.ceil(e.zmin / 100) * 100; Z <= e.zmax; Z += 100) {
    labels.push({ text: `${fmtInt(Z)} m`, x: e.xmin - X0 - 60, y: Z - Z0, z: e.ymin - Y0 - 60, color: '#64748b', weight: 0.7, kind: 'eixo' });
  }
  return labels;
}

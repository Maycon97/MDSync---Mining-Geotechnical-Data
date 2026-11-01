// ============================================================================
// MDSync — Modelo de Blocos: paletas, rótulos e metadados dos campos do .dm
// ============================================================================

// Cores das litologias já catalogadas no MDSync (DATAMINE_BLOCK_LITHOLOGIES)
const LITO_FIXED = {
  hgo: '#b91c1c', ifr: '#dc2626', igo: '#ea580c', if: '#f59e0b',
  ial: '#ca8a04', ic: '#0284c7', ia: '#7c3aed', at: '#64748b'
};

// Paleta categórica para as demais litologias / processos / municípios
const PALETTE = [
  '#22c55e', '#06b6d4', '#e879f9', '#f97316', '#84cc16', '#14b8a6', '#f43f5e',
  '#a78bfa', '#facc15', '#38bdf8', '#fb7185', '#34d399', '#c084fc', '#fdba74',
  '#2dd4bf', '#a3e635', '#f472b6', '#60a5fa', '#fbbf24', '#4ade80', '#818cf8',
  '#fca5a5', '#67e8f9', '#d946ef', '#bef264', '#fde047', '#93c5fd', '#5eead4'
];

export const TIPO_INFO = {
  minerio: { label: 'Minério', color: '#ef4444' },
  esteril: { label: 'Estéril', color: '#64748b' },
  pilha_esteril: { label: 'Pilha de estéril', color: '#a16207' },
  pilha_rejeito: { label: 'Pilha de rejeito', color: '#9333ea' },
  barragem: { label: 'Barragem', color: '#0ea5e9' },
  aterro: { label: 'Aterro', color: '#84cc16' },
  BLK: { label: 'BLK', color: '#f59e0b' }
};

export const DESTINO_INFO = {
  Especial: { label: 'ROM Especial', color: '#ef4444' },
  Comum: { label: 'ROM Comum', color: '#38bdf8' },
  Esteril: { label: 'Estéril', color: '#64748b' },
  WOV: { label: 'WOV', color: '#f59e0b' },
  OUT: { label: 'OUT', color: '#a78bfa' }
};

export const RISCO_INFO = {
  alto: { label: 'Alto', color: '#ef4444' },
  medio: { label: 'Médio', color: '#f59e0b' },
  baixo: { label: 'Baixo', color: '#10b981' },
  nc: { label: 'NC', color: '#64748b' }
};

// Dicas (tooltip) para códigos cujo significado não consta no arquivo .dm
export const CODE_HINTS = {
  WOV: 'Código de destino do modelo; o significado não está documentado no arquivo .dm.',
  OUT: 'Código do modelo (provavelmente "outros"); confirmar com a Geologia.',
  nc: 'Código do modelo (provavelmente "não classificado"); confirmar com a Geologia.',
  BLK: 'Código de tipo do modelo; o significado não está documentado no arquivo .dm.'
};

export function hexToRgb01(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  ];
}

export function categoryLabel(dim, name) {
  if (dim === 'tipo') return TIPO_INFO[name]?.label || name;
  if (dim === 'destino') return DESTINO_INFO[name]?.label || name;
  if (dim === 'risco') return RISCO_INFO[name]?.label || name;
  if (dim === 'lito') return String(name).toUpperCase();
  return String(name).replace(/_/g, ' ');
}

export function categoryColor(dim, name, index) {
  if (dim === 'tipo' && TIPO_INFO[name]) return TIPO_INFO[name].color;
  if (dim === 'destino' && DESTINO_INFO[name]) return DESTINO_INFO[name].color;
  if (dim === 'risco' && RISCO_INFO[name]) return RISCO_INFO[name].color;
  if (dim === 'lito' && LITO_FIXED[name]) return LITO_FIXED[name];
  return PALETTE[index % PALETTE.length];
}

// ----------------------------------------------------------------------------
// Teores / variáveis numéricas do modelo
//  GL  = global; G1, G23, G4 = frações (massa %) e teores por fração
// ----------------------------------------------------------------------------
const ELEMENTS = {
  FE: { label: 'Fe', unit: '%', min: 20, max: 68, dec: 2 },
  SI: { label: 'SiO₂', unit: '%', min: 0, max: 50, dec: 2 },
  P: { label: 'P', unit: '%', min: 0, max: 0.15, dec: 3 },
  AL: { label: 'Al₂O₃', unit: '%', min: 0, max: 5, dec: 2 },
  MN: { label: 'Mn', unit: '%', min: 0, max: 2, dec: 2 },
  PF: { label: 'PF', unit: '%', min: 0, max: 8, dec: 2 }
};

const GROUP_LABEL = { GL: 'global', 1: 'G1', 23: 'G23', 4: 'G4' };

export const GRADE_META = {};
['FE', 'SI', 'P', 'AL', 'MN', 'PF'].forEach((el) => {
  GRADE_META[`${el}GL`] = { ...ELEMENTS[el], group: 'GL', title: `${ELEMENTS[el].label} global` };
  ['1', '23', '4'].forEach((g) => {
    GRADE_META[`${el}${g}`] = { ...ELEMENTS[el], group: g, title: `${ELEMENTS[el].label} — ${GROUP_LABEL[g]}` };
  });
});
// Nomes gerados: FEGL, SIGL, PGL, ALGL, MNGL, PFGL | FE1, SI1, P1, AL1, MN1, PF1 | ... (iguais ao .dm)
['G1', 'G23', 'G4'].forEach((g) => {
  GRADE_META[g] = { label: g, unit: '%', min: 0, max: 100, dec: 1, group: g.slice(1), title: `Fração ${g} (% da massa)`, fraction: true };
});
GRADE_META.FQGL = { label: 'FQGL', unit: '%', min: 90, max: 110, dec: 2, group: 'GL', title: 'FQGL (global)' };

export const GROUP_DESCRIPTION = {
  G1: 'Fração G1 (granulado, conforme catálogo MDSync)',
  G23: 'Fração G23 (sinter feed, conforme catálogo MDSync)',
  G4: 'Fração G4 (fração fina)'
};

export function gradeTitle(v) {
  return GRADE_META[v]?.title || v;
}

export function formatGrade(v, value) {
  if (value == null || Number.isNaN(value)) return '—';
  const dec = GRADE_META[v]?.dec ?? 2;
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// ----------------------------------------------------------------------------
// Rampa contínua (azul → ciano → verde → amarelo → vermelho)
// ----------------------------------------------------------------------------
const RAMP = [
  [0.0, [0.16, 0.25, 0.75]],
  [0.25, [0.02, 0.71, 0.83]],
  [0.5, [0.2, 0.8, 0.35]],
  [0.75, [0.98, 0.8, 0.1]],
  [1.0, [0.9, 0.15, 0.12]]
];

export function rampRgb(t) {
  const x = Math.min(1, Math.max(0, t));
  for (let i = 1; i < RAMP.length; i++) {
    if (x <= RAMP[i][0]) {
      const [t0, c0] = RAMP[i - 1];
      const [t1, c1] = RAMP[i];
      const u = (x - t0) / (t1 - t0);
      return [c0[0] + (c1[0] - c0[0]) * u, c0[1] + (c1[1] - c0[1]) * u, c0[2] + (c1[2] - c0[2]) * u];
    }
  }
  return RAMP[RAMP.length - 1][1];
}

export function rampCss(t) {
  const [r, g, b] = rampRgb(t);
  return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
}

export const NO_DATA_RGB = [0.22, 0.25, 0.3];

// ----------------------------------------------------------------------------
// Formatação numérica (pt-BR)
// ----------------------------------------------------------------------------
export const fmtInt = (n) => (n == null ? '—' : Math.round(n).toLocaleString('pt-BR'));
export const fmtDec = (n, d = 2) =>
  n == null || Number.isNaN(n) ? '—' : Number(n).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtBytes = (b) => {
  if (b == null) return '—';
  if (b >= 1e9) return `${(b / 1e9).toFixed(2)} GB`;
  if (b >= 1e6) return `${(b / 1e6).toFixed(1)} MB`;
  return `${(b / 1e3).toFixed(0)} kB`;
};
export const fmtMt = (t) => {
  if (t == null) return '—';
  if (t >= 1e6) return `${fmtDec(t / 1e6, 2)} Mt`;
  if (t >= 1e3) return `${fmtDec(t / 1e3, 1)} kt`;
  return `${fmtInt(t)} t`;
};

// ----------------------------------------------------------------------------
// Conversor WGS-84/SIRGAS 2000 -> UTM 23S (mesma fórmula usada no MapTab)
// ----------------------------------------------------------------------------
export function latLonToUtm23S(lat, lon) {
  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const e2 = 2 * f - f * f;
  const ep2 = e2 / (1 - e2);
  const k0 = 0.9996;
  const lon0 = (-45.0 * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const lam = (lon * Math.PI) / 180;
  const N = a / Math.sqrt(1 - e2 * Math.sin(phi) ** 2);
  const T = Math.tan(phi) ** 2;
  const C = ep2 * Math.cos(phi) ** 2;
  const A = Math.cos(phi) * (lam - lon0);
  const M =
    a *
    ((1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 ** 3) / 256) * phi -
      ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * e2 ** 3) / 1024) * Math.sin(2 * phi) +
      ((15 * e2 * e2) / 256 + (45 * e2 ** 3) / 1024) * Math.sin(4 * phi) -
      ((35 * e2 ** 3) / 3072) * Math.sin(6 * phi));
  const easting =
    500000 +
    k0 * N * (A + ((1 - T + C) * A ** 3) / 6 + ((5 - 18 * T + T * T + 72 * C - 58 * ep2) * A ** 5) / 120);
  const northing =
    10000000 +
    k0 *
      (M +
        N *
          Math.tan(phi) *
          (A ** 2 / 2 + ((5 - T + 9 * C + 4 * C * C) * A ** 4) / 24 + ((61 - 58 * T + T * T + 600 * C - 330 * ep2) * A ** 6) / 720));
  return { easting, northing };
}

export function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

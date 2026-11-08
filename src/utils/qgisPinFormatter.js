/**
 * Utilitário de Simbologia e Formatação de Alfinetes QGIS para Estruturas
 * Padrão Corporativo de Cartografia e SIG Geotécnico
 */

export const QGIS_PIN_COLORS = [
  { id: 'red', name: 'Vermelho QGIS (Crítico / Alerta Máximo)', hex: '#ef4444', desc: 'Estruturas críticas ou de alta relevância' },
  { id: 'blue', name: 'Azul Geotécnico (Barragem / Hidro)', hex: '#0284c7', desc: 'Barragens de contenção, vertedouros e lagos' },
  { id: 'orange', name: 'Laranja Mineração (Pilha / Operação)', hex: '#f97316', desc: 'Pilhas de estéril (PDE), PDR e frentes ativas' },
  { id: 'green', name: 'Verde Ambiental (Dique / Vegetação)', hex: '#10b981', desc: 'Diques de contenção, drenos e revegetação' },
  { id: 'purple', name: 'Púrpura / Roxo (Cava / Escavação)', hex: '#8b5cf6', desc: 'Cavas em lavra e bancadas de minério' },
  { id: 'yellow', name: 'Amarelo Ouro (Pátio / Apoio)', hex: '#eab308', desc: 'Pátios de estocagem e infraestrutura de apoio' },
  { id: 'cyan', name: 'Ciano Elétrico (SUMP / Decantação)', hex: '#06b6d4', desc: 'Bacias de sedimentação, sumps e captações' },
  { id: 'pink', name: 'Magenta / Rosa (Geossintéticos)', hex: '#ec4899', desc: 'Obras de reforço, mantas e canais especiais' },
  { id: 'slate', name: 'Grafite / Titânio (Auxiliar)', hex: '#475569', desc: 'Instalações civis, balanças e portarias' }
];

/**
 * Resolve a cor padrão da estrutura no padrão QGIS caso o usuário não tenha definido
 */
export function resolveStructureDefaultColor(struct) {
  if (!struct) return '#ef4444';
  
  const custom = struct.corMarcador || struct.corPin || struct.pinColor;
  if (custom && typeof custom === 'string' && custom.trim() !== '') {
    return custom.trim();
  }

  const raw = String(
    struct.tipo || 
    struct.tipoEstrutura || 
    struct.categoria || 
    struct.nome || 
    struct.sigla || 
    ''
  ).toUpperCase();

  if (raw.includes('BARRAG') || raw.includes('REJEIT')) return '#0284c7'; // Azul
  if (raw.includes('PILHA') || raw.includes('PDE') || raw.includes('PDR') || raw.includes('ESTÉRIL') || raw.includes('ESTERIL')) return '#f97316'; // Laranja
  if (raw.includes('CAVA') || raw.includes('LAVRA') || raw.includes('JANGADA') || raw.includes('ENGENHO SECO')) return '#8b5cf6'; // Roxo
  if (raw.includes('DIQUE') || raw.includes('VERDE') || raw.includes('AMBIENT')) return '#10b981'; // Verde
  if (raw.includes('SUMP') || raw.includes('BACIA') || raw.includes('DECANT')) return '#06b6d4'; // Ciano
  if (raw.includes('PATIO') || raw.includes('PÁTIO') || raw.includes('APOIO')) return '#eab308'; // Amarelo

  return '#ef4444'; // Vermelho padrão QGIS
}

/**
 * Escurece ou clareia uma cor HEX para efeitos de profundidade / gradiente 3D
 */
function adjustHexBrightness(hex, percent) {
  let cleanHex = String(hex || '#ef4444').replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return '#b91c1c';

  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Gera o SVG puro do Alfinete Cartográfico estilo QGIS / GIS
 */
export function createQgisPinSvg({
  color = '#ef4444',
  isSelected = false,
  width = 32,
  height = 44,
  sigla = ''
} = {}) {
  const safeColor = color || '#ef4444';
  const darkerColor = adjustHexBrightness(safeColor, -25);
  const lighterColor = adjustHexBrightness(safeColor, 20);
  const gradId = `qgis-grad-${safeColor.replace('#', '')}-${isSelected ? 'sel' : 'norm'}`;

  // Seletor de letra do miolo do alfinete
  const letter = sigla ? sigla.slice(0, 2).toUpperCase() : '';

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow: visible; display: block;">
      <defs>
        <!-- Gradiente 3D do corpo do alfinete -->
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${lighterColor}" />
          <stop offset="45%" stop-color="${safeColor}" />
          <stop offset="100%" stop-color="${darkerColor}" />
        </linearGradient>
        
        <!-- Sombra realista de projeção no solo -->
        <radialGradient id="shadow-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(0, 0, 0, 0.65)" />
          <stop offset="60%" stop-color="rgba(0, 0, 0, 0.35)" />
          <stop offset="100%" stop-color="rgba(0, 0, 0, 0)" />
        </radialGradient>
      </defs>

      <!-- Sombra do alfinete no terreno (base na ponta da agulha) -->
      <ellipse cx="16" cy="42" rx="7.5" ry="2.2" fill="url(#shadow-grad)" />

      <!-- Halo pulsante quando ativo / selecionado -->
      ${isSelected ? `
        <ellipse cx="16" cy="42" rx="14" ry="4" fill="none" stroke="#38bdf8" stroke-width="1.8" opacity="0.8">
          <animate attributeName="rx" values="6;16;6" dur="2s" repeatCount="indefinite" />
          <animate attributeName="ry" values="2;4.5;2" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite" />
        </ellipse>
      ` : ''}

      <!-- Corpo do Alfinete Cartográfico QGIS -->
      <path 
        d="M16 2 C8.268 2 2 8.268 2 16 C2 26.5 14.5 39.8 15.35 40.8 C15.7 41.25 16.3 41.25 16.65 40.8 C17.5 39.8 30 26.5 30 16 C30 8.268 23.732 2 16 2 Z" 
        fill="url(#${gradId})" 
        stroke="${isSelected ? '#38bdf8' : '#ffffff'}" 
        stroke-width="${isSelected ? '2.4' : '1.8'}" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.45)); cursor: pointer;"
      />

      <!-- Miolo Circular Branco com Núcleo da Cor QGIS -->
      <circle cx="16" cy="15.5" r="7.5" fill="#ffffff" stroke="${safeColor}" stroke-width="1.2" />
      
      ${letter && letter.length <= 2 ? `
        <text 
          x="16" 
          y="18.5" 
          text-anchor="middle" 
          fill="${safeColor}" 
          font-family="'Inter', system-ui, -apple-system, sans-serif" 
          font-size="7.5px" 
          font-weight="900" 
          letter-spacing="-0.2px"
        >${letter}</text>
      ` : `
        <circle cx="16" cy="15.5" r="4.2" fill="${safeColor}" />
      `}
    </svg>
  `.trim();
}

/**
 * Cria o HTML completo para o marcador DivIcon do Leaflet
 */
export function createQgisPinMarkerHtml(struct, options = {}) {
  if (!struct) return '';

  const color = resolveStructureDefaultColor(struct);
  const isSelected = !!options.isSelected;
  const sigla = String(struct.sigla || struct.id || '').toUpperCase();
  const nome = String(struct.nome || sigla || 'Estrutura').replace(/"/g, '&quot;');

  const pinSvg = createQgisPinSvg({
    color,
    isSelected,
    width: 32,
    height: 44,
    sigla
  });

  return `
    <div 
      class="qgis-structure-pin-wrapper ${isSelected ? 'is-selected' : ''}" 
      title="${nome} (${sigla})"
      style="
        position: relative;
        width: 32px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease;
        transform-origin: 16px 42px;
      "
    >
      ${pinSvg}
    </div>
  `.trim();
}


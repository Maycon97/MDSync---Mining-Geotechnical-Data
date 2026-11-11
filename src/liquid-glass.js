// Liquid Glass — MDSync
// Importado em src/main.jsx. A preferência do usuário fica em localStorage
// ('mdsync_liquid_glass' = 'on' | 'off') e é aplicada em <html data-liquid-glass>.

const root = document.documentElement;

// 0. Garante o atributo mesmo que o script anti-FOUC do index.html não tenha rodado
if (!root.hasAttribute('data-liquid-glass')) {
  let pref = 'on';
  try { pref = localStorage.getItem('mdsync_liquid_glass') === 'off' ? 'off' : 'on'; } catch { /* modo privado */ }
  root.setAttribute('data-liquid-glass', pref);
}

// 1. Filtro SVG de refração (uma única vez)
if (!document.getElementById('lg-svg')) {
  const holder = document.createElement('div');
  holder.id = 'lg-svg';
  holder.setAttribute('aria-hidden', 'true');
  holder.innerHTML =
    '<svg width="0" height="0">' +
      '<filter id="lg" x="0" y="0" width="100%" height="100%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="2" seed="3" result="n"/>' +
        '<feGaussianBlur in="n" stdDeviation="2" result="m"/>' +
        '<feDisplacementMap id="lg-disp" in="SourceGraphic" in2="m" scale="30" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>' +
    '</svg>';
  document.body.prepend(holder);
}

// 2. Só Chromium (Chrome, Edge, WebView do Android) aceita url() no backdrop-filter.
//    Safari/iOS e Firefox continuam com o vidro fosco.
const ua = navigator.userAgent;
const isChromium = /(?:Chrome|Chromium|Edg)\/\d+/.test(ua) && !/(CriOS|FxiOS|EdgiOS)/.test(ua);
if (isChromium) root.setAttribute('data-lg-refract', '');

// 3. Animação "líquida": a distorção ondula e assenta quando um painel abre,
//    quando o usuário toca num botão do vidro e quando o efeito é ligado.
const BASE_SCALE = 30;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isOn = () => root.getAttribute('data-liquid-glass') !== 'off';
let frame = 0;

function pulse(from = 85, ms = 750) {
  const disp = document.getElementById('lg-disp');
  if (!disp || !isChromium || !isOn() || reduceMotion.matches) return;
  cancelAnimationFrame(frame);
  const t0 = performance.now();
  const step = (t) => {
    const p = Math.min((t - t0) / ms, 1);
    // oscilação amortecida: começa em `from` e assenta em BASE_SCALE
    const v = BASE_SCALE + (from - BASE_SCALE) * Math.exp(-5 * p) * Math.cos(p * Math.PI * 3);
    disp.setAttribute('scale', v.toFixed(1));
    if (p < 1) frame = requestAnimationFrame(step);
    else disp.setAttribute('scale', String(BASE_SCALE));
  };
  frame = requestAnimationFrame(step);
}

// painéis que abrem (modal, gaveta lateral)
const OPENING = '.modal-backdrop, .drawer-overlay';
new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const n of m.addedNodes) {
      if (n.nodeType === 1 && n.matches(OPENING)) { pulse(85, 750); return; }
    }
  }
}).observe(document.body, { childList: true, subtree: true });

// toque em botões dos painéis de vidro
document.addEventListener('pointerdown', (e) => {
  if (e.target instanceof Element && e.target.closest('button') &&
      e.target.closest('.glass-panel, .sysdam-map-topbar, .mobile-bottom-bar, .modal-content')) {
    pulse(60, 500);
  }
}, { passive: true });

// usuário ligou o efeito nas configurações: mostra o efeito uma vez
new MutationObserver(() => { if (isOn()) pulse(95, 900); })
  .observe(root, { attributes: true, attributeFilter: ['data-liquid-glass'] });

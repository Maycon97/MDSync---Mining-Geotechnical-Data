// Liquid Glass — MDSync
// Em src/main.jsx, depois dos imports de CSS: import './liquid-glass.js'

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
        '<feDisplacementMap in="SourceGraphic" in2="m" scale="30" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>' +
    '</svg>';
  document.body.prepend(holder);
}

// 2. Só Chromium (Chrome, Edge, WebView do Android) aceita url() no backdrop-filter.
//    Safari/iOS e Firefox continuam com o desfoque normal do site.
const ua = navigator.userAgent;
const isChromium = /(?:Chrome|Chromium|Edg)\/\d+/.test(ua) && !/(CriOS|FxiOS|EdgiOS)/.test(ua);
if (isChromium) document.documentElement.setAttribute('data-lg-refract', '');

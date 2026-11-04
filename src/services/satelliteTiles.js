// ============================================================================
// MDSync — Mosaico de imagem de satélite (Esri World Imagery) para o modelo 3D
// As imagens são carregadas com CORS e desenhadas em um canvas que vira textura.
// Falhas de rede não quebram o 3D: tiles ausentes ficam em cinza escuro.
// ============================================================================

export const ESRI_IMAGERY =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const cache = new Map();

export function maxTextureSize() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    const v = gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 4096;
    return Number.isFinite(v) ? v : 4096;
  } catch {
    return 4096;
  }
}

function loadImage(url, timeoutMs = 20000) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => { img.src = ''; resolve(null); }, timeoutMs);
    img.onload = () => { clearTimeout(timer); resolve(img); };
    img.onerror = () => { clearTimeout(timer); resolve(null); };
    img.src = url;
  });
}

export function loadSatelliteMosaic(bounds, { template = ESRI_IMAGERY, concurrency = 8, onStart, onProgress } = {}) {
  const key = `${template}|${bounds.zoom}|${bounds.tx0}|${bounds.ty0}|${bounds.tx1}|${bounds.ty1}`;
  if (cache.has(key)) return cache.get(key);
  const promise = (async () => {
    const canvas = document.createElement('canvas');
    canvas.width = bounds.w;
    canvas.height = bounds.h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Linhas de grade e coordenadas sutis estilo blueprint enquanto os tiles carregam
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < canvas.width; x += 128) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 128) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
    }

    if (onStart) onStart(canvas);

    const jobs = [];
    for (let ty = bounds.ty0; ty <= bounds.ty1; ty++) {
      for (let tx = bounds.tx0; tx <= bounds.tx1; tx++) jobs.push({ tx, ty });
    }
    let done = 0, ok = 0, failed = 0, next = 0;
    const worker = async () => {
      while (next < jobs.length) {
        const job = jobs[next++];
        const url = template.replace('{z}', bounds.zoom).replace('{x}', job.tx).replace('{y}', job.ty);
        const img = await loadImage(url);
        if (img) {
          if (ctx) ctx.drawImage(img, (job.tx - bounds.tx0) * 256, (job.ty - bounds.ty0) * 256, 256, 256);
          ok++;
        } else {
          failed++;
        }
        done++;
        if (onProgress) onProgress(done, jobs.length);
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
    return { canvas, ok, failed, total: jobs.length };
  })();
  cache.set(key, promise);
  promise.then((r) => { if (r.ok === 0) cache.delete(key); });
  return promise;
}

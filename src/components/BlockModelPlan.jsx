import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Planta de uma bancada (células-pai 10x10 m) desenhada em <canvas>, com zoom e pan.
export function BlockModelPlan({ data, meta, colors, visible, selected = -1, onPick, tipFor, height = 540 }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const viewRef = useRef({ scale: 0.2, ox: 0, oy: 0, fitted: false });
  const dragRef = useRef(null);
  const rafRef = useRef(0);
  const [size, setSize] = useState({ w: 800, h: height });
  const [hover, setHover] = useState(null); // {idx, x, y, e, n}

  const ps = meta.tamanhoPai.x;
  const X0 = meta.origem.x;
  const Y0 = meta.origem.y;
  const ext = meta.extensao;

  // lookup (i,j) -> índice da célula visível
  const lookup = useMemo(() => {
    const { nx, ny } = meta.dimensao;
    const arr = new Int32Array(nx * ny).fill(-1);
    if (data) {
      for (let c = 0; c < data.n; c++) {
        if (visible[c]) arr[data.i[c] * ny + data.j[c]] = c;
      }
    }
    return arr;
  }, [data, visible, meta]);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || !data) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, size.w, size.h);
    const v = viewRef.current;
    const nTop = ext.ymax;
    const cs = ps * v.scale;
    const cache = new Map();
    for (let c = 0; c < data.n; c++) {
      if (!visible[c]) continue;
      const E = X0 + data.i[c] * ps;
      const N = Y0 + (data.j[c] + 1) * ps;
      const x = (E - ext.xmin) * v.scale + v.ox;
      const y = (nTop - N) * v.scale + v.oy;
      if (x + cs < 0 || y + cs < 0 || x > size.w || y > size.h) continue;
      const r = Math.round(colors[c * 3] * 255), g = Math.round(colors[c * 3 + 1] * 255), b = Math.round(colors[c * 3 + 2] * 255);
      const key = (r << 16) | (g << 8) | b;
      let style = cache.get(key);
      if (!style) { style = `rgb(${r},${g},${b})`; cache.set(key, style); }
      ctx.fillStyle = style;
      const gap = cs > 6 ? 1 : 0;
      ctx.fillRect(x, y, Math.max(cs - gap, 1), Math.max(cs - gap, 1));
    }
    // célula selecionada
    if (selected >= 0 && selected < data.n) {
      const E = X0 + data.i[selected] * ps;
      const N = Y0 + (data.j[selected] + 1) * ps;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect((E - ext.xmin) * v.scale + v.ox - 1, (nTop - N) * v.scale + v.oy - 1, cs + 2, cs + 2);
    }
    // barra de escala
    const target = [50, 100, 200, 500, 1000].find((m) => m * v.scale > 70) || 1000;
    const len = target * v.scale;
    ctx.fillStyle = 'rgba(15,23,42,0.85)';
    ctx.fillRect(10, size.h - 34, len + 20, 24);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(20, size.h - 18, len, 2);
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillText(`${target} m`, 20, size.h - 22);
  }, [data, visible, colors, selected, size, ps, X0, Y0, ext]);

  const schedule = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);
  }, [draw]);

  // tamanho do canvas
  useEffect(() => {
    const el = wrapRef.current;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth || 800;
      setSize({ w, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [height]);

  useEffect(() => {
    const cv = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(size.w * dpr);
    cv.height = Math.round(size.h * dpr);
    cv.style.width = `${size.w}px`;
    cv.style.height = `${size.h}px`;
    const v = viewRef.current;
    if (!v.fitted || v.w !== size.w) {
      const sx = (size.w - 40) / (ext.xmax - ext.xmin);
      const sy = (size.h - 40) / (ext.ymax - ext.ymin);
      v.scale = Math.min(sx, sy);
      v.ox = (size.w - (ext.xmax - ext.xmin) * v.scale) / 2;
      v.oy = (size.h - (ext.ymax - ext.ymin) * v.scale) / 2;
      v.fitted = true;
      v.w = size.w;
    }
    schedule();
  }, [size, ext, schedule]);

  useEffect(() => { schedule(); }, [data, visible, colors, selected, schedule]);

  const toWorld = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const px = clientX - rect.left, py = clientY - rect.top;
    const v = viewRef.current;
    return { px, py, e: (px - v.ox) / v.scale + ext.xmin, n: ext.ymax - (py - v.oy) / v.scale };
  };

  const cellAt = (e, n) => {
    const { nx, ny } = meta.dimensao;
    const i = Math.floor((e - X0) / ps), j = Math.floor((n - Y0) / ps);
    if (i < 0 || j < 0 || i >= nx || j >= ny) return -1;
    return lookup[i * ny + j];
  };

  const onWheel = (ev) => {
    ev.preventDefault();
    const w = toWorld(ev.clientX, ev.clientY);
    const v = viewRef.current;
    const k = ev.deltaY < 0 ? 1.18 : 1 / 1.18;
    const ns = Math.min(8, Math.max(0.05, v.scale * k));
    v.ox = w.px - (w.e - ext.xmin) * ns;
    v.oy = w.py - (ext.ymax - w.n) * ns;
    v.scale = ns;
    schedule();
  };

  useEffect(() => {
    const cv = canvasRef.current;
    const handler = (e) => onWheel(e);
    cv.addEventListener('wheel', handler, { passive: false });
    return () => cv.removeEventListener('wheel', handler);
  }); // reanexa a cada render para usar closures atuais

  const onPointerDown = (e) => {
    dragRef.current = { x: e.clientX, y: e.clientY, ox: viewRef.current.ox, oy: viewRef.current.oy, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (d) {
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
      if (d.moved) {
        viewRef.current.ox = d.ox + dx;
        viewRef.current.oy = d.oy + dy;
        schedule();
        return;
      }
    }
    const w = toWorld(e.clientX, e.clientY);
    setHover({ idx: cellAt(w.e, w.n), x: w.px, y: w.py, e: w.e, n: w.n });
  };
  const onPointerUp = (e) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (d && !d.moved && onPick) {
      const w = toWorld(e.clientX, e.clientY);
      onPick(cellAt(w.e, w.n));
    }
  };

  const reset = () => { viewRef.current.fitted = false; setSize((s) => ({ ...s })); };

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', height: `${height}px`, background: '#070b14', borderRadius: '10px', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => setHover(null)}
        style={{ display: 'block', cursor: 'crosshair', touchAction: 'none' }}
      />
      <button
        onClick={reset}
        style={{ position: 'absolute', top: 10, right: 10, padding: '3px 9px', fontSize: '0.7rem', fontWeight: 600, borderRadius: 6, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(15,23,42,0.85)', color: '#e2e8f0' }}
      >
        Enquadrar
      </button>
      {hover && (
        <div style={{ position: 'absolute', left: Math.min(hover.x + 14, size.w - 230), top: Math.max(hover.y - 8, 6), pointerEvents: 'none', padding: '4px 8px', borderRadius: 6, backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.7rem', color: '#e2e8f0', maxWidth: 220 }}>
          <div style={{ color: '#94a3b8' }}>E {Math.round(hover.e).toLocaleString('pt-BR')} • N {Math.round(hover.n).toLocaleString('pt-BR')}</div>
          {hover.idx >= 0 && tipFor ? tipFor(hover.idx) : <span style={{ color: '#64748b' }}>sem bloco</span>}
        </div>
      )}
    </div>
  );
}

export default BlockModelPlan;

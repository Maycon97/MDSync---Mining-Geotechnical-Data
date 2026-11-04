import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { rayBoxDistance } from '../utils/blockModelView';

// sRGB (0..255) -> linear: o three trabalha em espaço linear
const LIN = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  LIN[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function makeCircleTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeLabelSprite(text, color, weight = 1) {
  const fontPx = 46;
  const canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.font = `700 ${fontPx}px Inter, Arial, sans-serif`;
  const w = Math.ceil(ctx.measureText(text).width) + 28;
  canvas.width = w;
  canvas.height = fontPx + 22;
  ctx = canvas.getContext('2d');
  ctx.font = `700 ${fontPx}px Inter, Arial, sans-serif`;
  ctx.fillStyle = 'rgba(7,11,20,0.7)';
  ctx.beginPath();
  const r = 14;
  ctx.moveTo(r, 0); ctx.lineTo(w - r, 0); ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, canvas.height - r); ctx.quadraticCurveTo(w, canvas.height, w - r, canvas.height);
  ctx.lineTo(r, canvas.height); ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 14, canvas.height / 2 + 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
  const sp = new THREE.Sprite(mat);
  sp.renderOrder = 20;
  sp.userData = { aspect: canvas.width / canvas.height, weight };
  return sp;
}

function disposeObject(o) {
  if (!o) return;
  o.geometry?.dispose?.();
  if (o.material) {
    o.material.map?.dispose?.();
    o.material.dispose?.();
  }
}

/**
 * Visualizador 3D de blocos (InstancedMesh compacto) com camadas geoespaciais.
 *  cells:   { n, px, py, pz, sx, sy, sz }  (metros relativos à origem do modelo)
 *  colors:  Float32Array(n*3) sRGB 0..1       visible: Uint8Array(n)
 *  surface: { positions, uvs, index, offset } malha do terreno/base (x=E-X0, y=cota-Z0, z=N-Y0)
 *  surfaceTexture: canvas com imagem de satélite (opcional)
 *  markers: { n, positions, colors } instrumentos (x=E-X0, y=cota-Z0, z=N-Y0)
 *  labels:  [{ text, x, y, z, color, weight }]
 */
export const BlockModel3D = forwardRef(function BlockModel3D(
  {
    cells, colors, visible, vExag = 1, selected = -1, onPick, fitKey, height = 540,
    surface = null, surfaceTexture = null, surfaceOpacity = 0.85,
    markers = null, selectedMarker = -1, onPickMarker, labels = null
  },
  ref
) {
  const hostRef = useRef(null);
  const compassRef = useRef(null);
  const stateRef = useRef({});
  const propsRef = useRef({});
  const surfaceOpacityRef = useRef(surfaceOpacity);
  const selectedMarkerRef = useRef(selectedMarker);
  const [error, setError] = useState(null);

  propsRef.current = { cells, colors, visible, vExag, selected, onPick, markers, onPickMarker, surface, labels };
  surfaceOpacityRef.current = surfaceOpacity;
  selectedMarkerRef.current = selectedMarker;

  const requestRender = () => {
    const st = stateRef.current;
    if (!st.renderer || st.pending) return;
    st.pending = true;
    requestAnimationFrame(() => {
      st.pending = false;
      if (!st.renderer) return;
      st.renderer.render(st.scene, st.camera);
      if (compassRef.current) {
        const t = st.controls.target.clone();
        const a = t.clone().project(st.camera);
        const b = t.clone().add(new THREE.Vector3(0, 0, -1)).project(st.camera);
        compassRef.current.style.transform = `rotate(${Math.atan2(b.x - a.x, b.y - a.y)}rad)`;
      }
    });
  };

  const applyLabelScale = () => {
    const st = stateRef.current;
    if (!st.labelGroup || !st.R) return;
    const H = st.R * 0.028;
    st.labelGroup.children.forEach((sp) => {
      const k = sp.userData.weight || 1;
      sp.scale.set(H * k * sp.userData.aspect, H * k, 1);
    });
  };

  const fitCamera = (view = 'iso') => {
    const st = stateRef.current;
    const { cells: c, vExag: ve } = propsRef.current;
    if (!st.camera || !c || !c.n) return;
    const min = new THREE.Vector3(Infinity, Infinity, Infinity);
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    for (let i = 0; i < c.n; i++) {
      const x = c.px[i], y = c.pz[i] * ve, z = -c.py[i];
      if (x < min.x) min.x = x; if (x > max.x) max.x = x;
      if (y < min.y) min.y = y; if (y > max.y) max.y = y;
      if (z < min.z) min.z = z; if (z > max.z) max.z = z;
    }
    const center = min.clone().add(max).multiplyScalar(0.5);
    const R = Math.max(max.x - min.x, max.y - min.y, max.z - min.z, 50) * 0.75;
    st.R = R;
    st.camera.near = R * 0.002;
    st.camera.far = R * 40;
    st.camera.updateProjectionMatrix();
    st.controls.target.copy(center);
    const offs = { iso: [-0.55, 0.85, 1.25], top: [0, 2.3, 0.18], south: [0, 0.18, 2.3] }[view] || [-0.55, 0.85, 1.25];
    st.camera.position.set(center.x + offs[0] * R, center.y + offs[1] * R, center.z + offs[2] * R);
    st.controls.update();
    st.grid.position.set(center.x, min.y - 0.5, center.z);
    const span = Math.max(max.x - min.x, max.z - min.z) * 1.4;
    const step = span > 3000 ? 500 : span > 1200 ? 200 : 100;
    st.grid.scale.setScalar(Math.max(span, step * 4) / st.gridSize);
    applyLabelScale();
    requestRender();
  };

  useImperativeHandle(ref, () => ({ setView: (v) => fitCamera(v) }));

  // ---- montagem única -----------------------------------------------------
  useEffect(() => {
    const host = hostRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch {
      setError('WebGL indisponível neste dispositivo/navegador.');
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x070b14, 1);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 1, 100000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI * 0.499;

    scene.add(new THREE.AmbientLight(0xffffff, 1.35));
    const sun = new THREE.DirectionalLight(0xffffff, 2.1);
    sun.position.set(-1, 2, 1.2);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffffff, 0.6);
    fill.position.set(1, 0.4, -1);
    scene.add(fill);

    const gridSize = 100;
    const grid = new THREE.GridHelper(gridSize, 20, 0x2b3a55, 0x1a2438);
    scene.add(grid);

    const labelGroup = new THREE.Group();
    scene.add(labelGroup);

    const st = stateRef.current;
    Object.assign(st, {
      renderer, scene, camera, controls, grid, gridSize, labelGroup,
      mesh: null, map: null, count: 0, pending: false, circle: makeCircleTexture()
    });

    const resize = () => {
      const w = host.clientWidth || 600;
      const h = host.clientHeight || height;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      requestRender();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    controls.addEventListener('change', requestRender);

    // clique (sem arrastar): instrumento mais próximo na tela, senão o bloco sob o cursor
    let down = null;
    const onDown = (e) => { down = { x: e.clientX, y: e.clientY }; };
    const onUp = (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 5) return;
      const p = propsRef.current;
      const rect = renderer.domElement.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;

      if (p.markers && p.markers.n && p.onPickMarker) {
        const v = new THREE.Vector3();
        let bestM = -1, bestD = 12;
        for (let k = 0; k < p.markers.n; k++) {
          v.set(p.markers.positions[k * 3], p.markers.positions[k * 3 + 1] * p.vExag, -p.markers.positions[k * 3 + 2]).project(camera);
          if (v.z < -1 || v.z > 1) continue;
          const d = Math.hypot((v.x * 0.5 + 0.5) * rect.width - mx, (-v.y * 0.5 + 0.5) * rect.height - my);
          if (d < bestD) { bestD = d; bestM = k; }
        }
        if (bestM >= 0) { p.onPickMarker(bestM); return; }
      }

      if (!p.cells || !p.onPick || !st.map) return;
      const ndc = new THREE.Vector2((mx / rect.width) * 2 - 1, -(my / rect.height) * 2 + 1);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc, camera);
      const o = ray.ray.origin, d = ray.ray.direction;
      const c = p.cells;
      const hx = c.sx / 2, hy = (c.sz / 2) * p.vExag, hz = c.sy / 2;
      let best = -1, bestT = Infinity;
      for (let k = 0; k < st.count; k++) {
        const i = st.map[k];
        const t = rayBoxDistance(o.x, o.y, o.z, d.x, d.y, d.z, c.px[i], c.pz[i] * p.vExag, -c.py[i], hx, hy, hz);
        if (t >= 0 && t < bestT) { bestT = t; best = i; }
      }
      p.onPick(best);
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);

    return () => {
      ro.disconnect();
      controls.removeEventListener('change', requestRender);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      controls.dispose();
      [st.mesh, st.sel, st.surfaceMesh, st.pts, st.ptsSel].forEach(disposeObject);
      labelGroup.children.forEach(disposeObject);
      st.circle?.dispose?.();
      st.texture?.dispose?.();
      grid.geometry.dispose();
      grid.material.dispose?.();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      st.renderer = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- instâncias (apenas células visíveis, compactadas) -----------------
  const syncInstances = () => {
    const st = stateRef.current;
    const p = propsRef.current;
    if (!st.mesh || !p.cells) return;
    const c = p.cells;
    const mat = st.mesh.instanceMatrix.array;
    const col = st.mesh.instanceColor.array;
    const g = 0.97;
    const sx = c.sx * g, sy = c.sz * p.vExag * g, sz = c.sy * g;
    const src = p.colors;
    let k = 0;
    for (let i = 0; i < c.n; i++) {
      if (!p.visible || !p.visible[i]) continue;
      const o = k * 16;
      mat[o] = sx; mat[o + 1] = 0; mat[o + 2] = 0; mat[o + 3] = 0;
      mat[o + 4] = 0; mat[o + 5] = sy; mat[o + 6] = 0; mat[o + 7] = 0;
      mat[o + 8] = 0; mat[o + 9] = 0; mat[o + 10] = sz; mat[o + 11] = 0;
      mat[o + 12] = c.px[i]; mat[o + 13] = c.pz[i] * p.vExag; mat[o + 14] = -c.py[i]; mat[o + 15] = 1;
      if (src) {
        col[k * 3] = LIN[(src[i * 3] * 255 + 0.5) | 0];
        col[k * 3 + 1] = LIN[(src[i * 3 + 1] * 255 + 0.5) | 0];
        col[k * 3 + 2] = LIN[(src[i * 3 + 2] * 255 + 0.5) | 0];
      }
      st.map[k] = i;
      k++;
    }
    st.count = k;
    st.mesh.count = k;
    st.mesh.instanceMatrix.needsUpdate = true;
    st.mesh.instanceColor.needsUpdate = true;
  };

  const syncSelection = () => {
    const st = stateRef.current;
    const p = propsRef.current;
    if (!st.scene) return;
    if (!st.sel) {
      const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
      st.sel = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
      st.scene.add(st.sel);
    }
    const c = p.cells;
    if (c && p.selected >= 0 && p.selected < c.n) {
      st.sel.visible = true;
      st.sel.position.set(c.px[p.selected], c.pz[p.selected] * p.vExag, -c.py[p.selected]);
      st.sel.scale.set(c.sx * 1.04, c.sz * p.vExag * 1.04, c.sy * 1.04);
    } else {
      st.sel.visible = false;
    }
  };

  // ---- superfície (terreno / base) ---------------------------------------
  const syncSurface = () => {
    const st = stateRef.current;
    const p = propsRef.current;
    if (!st.scene) return;
    if (!p.surface) {
      if (st.surfaceMesh) st.surfaceMesh.visible = false;
      st.grid.visible = true;
      return;
    }
    st.grid.visible = false;
    if (st.surfaceMesh && st.surfaceMesh.userData.src !== p.surface) {
      st.scene.remove(st.surfaceMesh);
      st.surfaceMesh.geometry.dispose();
      st.surfaceMesh.material.dispose();
      st.surfaceMesh = null;
    }
    if (!st.surfaceMesh) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(p.surface.positions, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(p.surface.uvs, 2));
      geo.setIndex(new THREE.BufferAttribute(p.surface.index, 1));
      const m = new THREE.MeshBasicMaterial({ color: 0x1f2937, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, m);
      mesh.userData.src = p.surface;
      mesh.renderOrder = 1;
      st.scene.add(mesh);
      st.surfaceMesh = mesh;
    }
    const mesh = st.surfaceMesh;
    mesh.visible = true;
    mesh.scale.set(1, p.vExag, -1); // z do three = -N
    mesh.position.y = (p.surface.offset || 0) * p.vExag;
    const op = Math.min(1, Math.max(0, surfaceOpacityRef.current));
    mesh.material.opacity = op;
    mesh.material.transparent = op < 0.999;
    mesh.material.depthWrite = op >= 0.999;
    const tex = st.texture || null;
    if (mesh.material.map !== tex) {
      mesh.material.map = tex;
      mesh.material.color.set(tex ? 0xffffff : 0x1f2937);
      mesh.material.needsUpdate = true;
    }
  };

  // ---- marcadores (instrumentos) -----------------------------------------
  const syncMarkers = () => {
    const st = stateRef.current;
    const p = propsRef.current;
    if (!st.scene) return;
    const m = p.markers;
    if (st.pts && st.pts.userData.src !== m) {
      st.scene.remove(st.pts);
      st.pts.geometry.dispose();
      st.pts.material.dispose();
      st.pts = null;
    }
    if (!m || !m.n) {
      if (st.ptsSel) st.ptsSel.visible = false;
      return;
    }
    if (!st.pts) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(m.n * 3), 3));
      geo.setAttribute('color', new THREE.BufferAttribute(m.colors, 3));
      const mat = new THREE.PointsMaterial({
        size: 11, sizeAttenuation: false, vertexColors: true, map: st.circle, alphaTest: 0.4, transparent: true, depthTest: false
      });
      const pts = new THREE.Points(geo, mat);
      pts.userData.src = m;
      pts.renderOrder = 15;
      pts.frustumCulled = false;
      st.scene.add(pts);
      st.pts = pts;
    }
    const pos = st.pts.geometry.attributes.position.array;
    for (let k = 0; k < m.n; k++) {
      pos[k * 3] = m.positions[k * 3];
      pos[k * 3 + 1] = m.positions[k * 3 + 1] * p.vExag;
      pos[k * 3 + 2] = -m.positions[k * 3 + 2];
    }
    st.pts.geometry.attributes.position.needsUpdate = true;

    if (!st.ptsSel) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));
      const mt = new THREE.PointsMaterial({ size: 22, sizeAttenuation: false, color: 0xffffff, map: st.circle, alphaTest: 0.4, transparent: true, depthTest: false });
      st.ptsSel = new THREE.Points(g, mt);
      st.ptsSel.renderOrder = 14;
      st.ptsSel.frustumCulled = false;
      st.scene.add(st.ptsSel);
    }
    const k = selectedMarkerRef.current;
    if (k >= 0 && k < m.n) {
      const a = st.ptsSel.geometry.attributes.position.array;
      a[0] = m.positions[k * 3]; a[1] = m.positions[k * 3 + 1] * p.vExag; a[2] = -m.positions[k * 3 + 2];
      st.ptsSel.geometry.attributes.position.needsUpdate = true;
      st.ptsSel.visible = true;
    } else {
      st.ptsSel.visible = false;
    }
  };

  // ---- rótulos --------------------------------------------------------------
  const syncLabels = () => {
    const st = stateRef.current;
    const p = propsRef.current;
    if (!st.labelGroup) return;
    if (st.labelSrc !== p.labels) {
      st.labelGroup.children.slice().forEach((sp) => { st.labelGroup.remove(sp); disposeObject(sp); });
      (p.labels || []).forEach((l) => {
        const sp = makeLabelSprite(l.text, l.color || '#e2e8f0', l.weight || 1);
        if (!sp) return;
        sp.userData.base = l;
        st.labelGroup.add(sp);
      });
      st.labelSrc = p.labels;
      applyLabelScale();
    }
    st.labelGroup.children.forEach((sp) => {
      const l = sp.userData.base;
      sp.position.set(l.x, l.y * p.vExag, -l.z);
    });
  };

  // ---- (re)constrói a malha quando as células mudam -----------------------
  useEffect(() => {
    const st = stateRef.current;
    if (!st.scene || !cells) return;
    if (st.mesh) {
      st.scene.remove(st.mesh);
      disposeObject(st.mesh);
      st.mesh = null;
    }
    const cap = Math.max(cells.n, 1);
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const mesh = new THREE.InstancedMesh(geo, mat, cap);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3);
    mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    st.scene.add(mesh);
    st.mesh = mesh;
    st.map = new Int32Array(cap);
    syncInstances();
    syncSelection();
    fitCamera('iso');
    syncSurface();
    syncMarkers();
    syncLabels();
    requestRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells]);

  useEffect(() => { syncInstances(); requestRender(); }, [colors, visible]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    syncInstances(); syncSelection(); syncSurface(); syncMarkers(); syncLabels(); requestRender();
  }, [vExag]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { syncSelection(); requestRender(); }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { syncMarkers(); requestRender(); }, [markers, selectedMarker]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { syncLabels(); requestRender(); }, [labels]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (cells) fitCamera('iso'); }, [fitKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // textura de satélite
  useEffect(() => {
    const st = stateRef.current;
    if (!st.scene) return;
    if (st.texture) { st.texture.dispose(); st.texture = null; }
    if (surfaceTexture) {
      const tex = new THREE.CanvasTexture(surfaceTexture);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = st.renderer?.capabilities?.getMaxAnisotropy?.() || 1;
      st.texture = tex;
    }
    if (st.surfaceMesh) st.surfaceMesh.material.map = null; // força reatribuição em syncSurface
    syncSurface();
    requestRender();
  }, [surfaceTexture]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { syncSurface(); requestRender(); }, [surface, surfaceOpacity]); // eslint-disable-line react-hooks/exhaustive-deps

  const btn = {
    padding: '3px 9px', fontSize: '0.7rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(15,23,42,0.85)', color: '#e2e8f0'
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px`, background: '#070b14', borderRadius: '10px', overflow: 'hidden' }}>
      <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />
      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}
      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button style={btn} onClick={() => fitCamera('iso')} title="Vista isométrica / enquadrar">Isométrica</button>
        <button style={btn} onClick={() => fitCamera('top')} title="Vista de planta (norte para cima)">Planta</button>
        <button style={btn} onClick={() => fitCamera('south')} title="Vista a partir do sul (seção)">Seção</button>
      </div>
      <div
        title="Norte"
        style={{ position: 'absolute', bottom: 12, right: 12, width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div ref={compassRef} style={{ width: 0, height: 0, position: 'relative', transition: 'none' }}>
          <div style={{ position: 'absolute', left: -5, top: -15, width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '14px solid #ef4444' }} />
          <div style={{ position: 'absolute', left: -4, top: -22, fontSize: 9, fontWeight: 800, color: '#fca5a5' }}>N</div>
        </div>
      </div>
    </div>
  );
});

export default BlockModel3D;

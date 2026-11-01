import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { rayBoxDistance } from '../utils/blockModelView';

// sRGB (0..1) -> linear, necessário porque o three trabalha em espaço linear
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

/**
 * Visualizador 3D de blocos (InstancedMesh).
 *  cells: { n, px, py, pz (Float32Array, metros relativos à origem), sx, sy, sz (tamanho da célula) }
 *  colors: Float32Array(n*3) em sRGB 0..1
 *  visible: Uint8Array(n)
 *  fitKey: muda quando o enquadramento da câmera deve ser refeito
 */
export const BlockModel3D = forwardRef(function BlockModel3D(
  { cells, colors, visible, vExag = 1, selected = -1, onPick, fitKey, height = 540 },
  ref
) {
  const hostRef = useRef(null);
  const compassRef = useRef(null);
  const stateRef = useRef({});
  const propsRef = useRef({});
  const [error, setError] = useState(null);

  propsRef.current = { cells, colors, visible, vExag, selected, onPick };

  const requestRender = () => {
    const st = stateRef.current;
    if (!st.renderer || st.pending) return;
    st.pending = true;
    requestAnimationFrame(() => {
      st.pending = false;
      if (!st.renderer) return;
      st.renderer.render(st.scene, st.camera);
      // bússola: projeta a direção Norte (-Z) na tela
      if (compassRef.current) {
        const t = st.controls.target.clone();
        const a = t.clone().project(st.camera);
        const b = t.clone().add(new THREE.Vector3(0, 0, -1)).project(st.camera);
        const ang = Math.atan2(b.x - a.x, b.y - a.y);
        compassRef.current.style.transform = `rotate(${ang}rad)`;
      }
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
    st.camera.near = R * 0.002;
    st.camera.far = R * 40;
    st.camera.updateProjectionMatrix();
    st.controls.target.copy(center);
    const offs = {
      iso: [-0.55, 0.85, 1.25],
      top: [0, 2.3, 0.18],
      south: [0, 0.18, 2.3]
    }[view] || [-0.55, 0.85, 1.25];
    st.camera.position.set(center.x + offs[0] * R, center.y + offs[1] * R, center.z + offs[2] * R);
    st.controls.update();
    st.grid.position.set(center.x, min.y - 0.5, center.z);
    const span = Math.max(max.x - min.x, max.z - min.z) * 1.4;
    const step = span > 3000 ? 500 : span > 1200 ? 200 : 100;
    st.grid.scale.setScalar(Math.max(span, step * 4) / st.gridSize);
    requestRender();
  };

  useImperativeHandle(ref, () => ({
    setView: (v) => fitCamera(v)
  }));

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

    const st = stateRef.current;
    Object.assign(st, { renderer, scene, camera, controls, grid, gridSize, mesh: null, pending: false });

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

    // clique (sem arrastar) => seleção
    let down = null;
    const onDown = (e) => { down = { x: e.clientX, y: e.clientY }; };
    const onUp = (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 5) return;
      const p = propsRef.current;
      if (!p.cells || !p.onPick) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc, camera);
      const o = ray.ray.origin, d = ray.ray.direction;
      const c = p.cells;
      const hx = c.sx / 2, hy = (c.sz / 2) * p.vExag, hz = c.sy / 2;
      let best = -1, bestT = Infinity;
      for (let i = 0; i < c.n; i++) {
        if (!p.visible[i]) continue;
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
      if (st.mesh) { st.mesh.geometry.dispose(); st.mesh.material.dispose(); }
      if (st.sel) { st.sel.geometry.dispose(); st.sel.material.dispose(); }
      grid.geometry.dispose();
      grid.material.dispose?.();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      st.renderer = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- (re)constrói a malha quando os dados mudam -------------------------
  useEffect(() => {
    const st = stateRef.current;
    if (!st.scene || !cells) return;
    if (st.mesh) {
      st.scene.remove(st.mesh);
      st.mesh.geometry.dispose();
      st.mesh.material.dispose();
      st.mesh.dispose?.();
      st.mesh = null;
    }
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const mesh = new THREE.InstancedMesh(geo, mat, Math.max(cells.n, 1));
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(cells.n, 1) * 3), 3);
    mesh.frustumCulled = false;
    st.scene.add(mesh);
    st.mesh = mesh;
    st.dataKey = cells;
    // dispara atualização de matrizes/cores/enquadramento
    st.rebuilt = true;
    syncAll();
    fitCamera('iso');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells]);

  const syncMatrices = () => {
    const st = stateRef.current;
    const p = propsRef.current;
    if (!st.mesh || !p.cells) return;
    const c = p.cells;
    const arr = st.mesh.instanceMatrix.array;
    const g = 0.97;
    for (let i = 0; i < c.n; i++) {
      const o = i * 16;
      const s = p.visible && p.visible[i] ? 1 : 0;
      arr[o] = c.sx * g * s; arr[o + 1] = 0; arr[o + 2] = 0; arr[o + 3] = 0;
      arr[o + 4] = 0; arr[o + 5] = c.sz * p.vExag * g * s; arr[o + 6] = 0; arr[o + 7] = 0;
      arr[o + 8] = 0; arr[o + 9] = 0; arr[o + 10] = c.sy * g * s; arr[o + 11] = 0;
      arr[o + 12] = c.px[i]; arr[o + 13] = c.pz[i] * p.vExag; arr[o + 14] = -c.py[i]; arr[o + 15] = 1;
    }
    st.mesh.instanceMatrix.needsUpdate = true;
  };

  const syncColors = () => {
    const st = stateRef.current;
    const p = propsRef.current;
    if (!st.mesh || !p.cells || !p.colors) return;
    const arr = st.mesh.instanceColor.array;
    const src = p.colors;
    const n = Math.min(p.cells.n * 3, src.length);
    for (let i = 0; i < n; i++) arr[i] = toLinear(src[i]);
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

  const syncAll = () => {
    syncMatrices();
    syncColors();
    syncSelection();
    requestRender();
  };

  useEffect(() => { syncColors(); requestRender(); }, [colors]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { syncMatrices(); syncSelection(); requestRender(); }, [visible, vExag]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { syncSelection(); requestRender(); }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (cells) fitCamera('iso'); }, [fitKey]); // eslint-disable-line react-hooks/exhaustive-deps

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

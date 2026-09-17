import React, { useState, useRef, useEffect } from 'react';
import { useGeotechData } from '../context/GeotechDataContext';
import { 
  Box, 
  Layers, 
  RotateCw, 
  Maximize2, 
  Eye, 
  Sliders, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Droplet, 
  Sun,
  Compass,
  Cpu,
  Info
} from 'lucide-react';

export const Spline3DViewerTab = () => {
  const { filteredInstruments, activeStructureId, structures } = useGeotechData();
  
  const canvasRef = useRef(null);
  const [rotationX, setRotationX] = useState(25);
  const [rotationY, setRotationY] = useState(-35);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Controle da linha freática (simulação 3D)
  const [waterLevelOffset, setWaterLevelOffset] = useState(0); // em metros
  const [selected3DInst, setSelected3DInst] = useState(null);
  const [viewPreset, setViewPreset] = useState('isometria'); // 'isometria' | 'corte' | 'crista' | 'jusante'
  const [splineUrl, setSplineUrl] = useState('https://prod.spline.design/geotech-dam-twin/scene.splinecode');
  const [showSplineSettings, setShowSplineSettings] = useState(false);

  // Amostra de instrumentos para renderizar em 3D
  const piezometros3D = filteredInstruments.slice(0, 12);

  // Configuração de presets de câmera
  const applyPreset = (preset) => {
    setViewPreset(preset);
    if (preset === 'isometria') {
      setRotationX(25);
      setRotationY(-35);
      setZoom(1);
    } else if (preset === 'corte') {
      setRotationX(0);
      setRotationY(0);
      setZoom(1.2);
    } else if (preset === 'crista') {
      setRotationX(45);
      setRotationY(-80);
      setZoom(1.1);
    } else if (preset === 'jusante') {
      setRotationX(15);
      setRotationY(75);
      setZoom(1.05);
    }
  };

  // Renderização do modelo 3D no Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 800;
    const height = canvas.height = 540;

    ctx.clearRect(0, 0, width, height);

    // Centro do Canvas
    const cx = width / 2;
    const cy = height / 2 + 30;

    // Fórmulas de projeção 3D isométrica com rotação
    const radX = (rotationX * Math.PI) / 180;
    const radY = (rotationY * Math.PI) / 180;

    const project = (x, y, z) => {
      // Rotação em Y
      const x1 = x * Math.cos(radY) + z * Math.sin(radY);
      const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

      // Rotação em X
      const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
      const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

      const scale = (350 / (350 + z2 * 0.5)) * zoom;
      return {
        px: cx + x1 * scale,
        py: cy - y2 * scale,
        depth: z2
      };
    };

    // Cores de materiais geotécnicos
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const colorGround = isDark ? '#1e293b' : '#e2e8f0';
    const colorSlopeUpstream = isDark ? '#334155' : '#cbd5e1';
    const colorSlopeDownstream = isDark ? '#475569' : '#94a3b8';
    const colorCrest = isDark ? '#64748b' : '#64748b';
    const colorWater = 'rgba(14, 165, 233, 0.55)';
    const colorWaterLine = '#0284c7';
    const colorPhreatic = 'rgba(56, 189, 248, 0.45)';

    // Desenhar Grid de Base Geotécnica
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    for (let gx = -220; gx <= 220; gx += 40) {
      const p1 = project(gx, -100, -180);
      const p2 = project(gx, -100, 180);
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();
    }
    for (let gz = -180; gz <= 180; gz += 40) {
      const p1 = project(-220, -100, gz);
      const p2 = project(220, -100, gz);
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();
    }

    // Geometria da Barragem (Montante -> Crista -> Jusante)
    // Coordenadas das seções da barragem
    const damLength = 160; // Z de -160 a +160
    const damHeight = 80;  // Y de -100 a -20 (Crista em Y = -20)
    const crestWidth = 35; // X de -15 a +20

    // Vértices da Seção Transversal
    // 1. Pé de montante: X = -180, Y = -100
    // 2. Crista montante: X = -20, Y = -20
    // 3. Crista jusante: X = 20, Y = -20
    // 4. Berma 1: X = 70, Y = -55
    // 5. Berma 2: X = 120, Y = -80
    // 6. Pé de jusante: X = 180, Y = -100

    // Desenhar Maciço de Aterro (Talude de Jusante com Bermas)
    for (let z = -damLength; z < damLength; z += 40) {
      const zNext = Math.min(z + 40, damLength);

      // Crista
      const c1 = project(-20, -20, z);
      const c2 = project(20, -20, z);
      const c3 = project(20, -20, zNext);
      const c4 = project(-20, -20, zNext);

      ctx.fillStyle = colorCrest;
      ctx.beginPath();
      ctx.moveTo(c1.px, c1.py);
      ctx.lineTo(c2.px, c2.py);
      ctx.lineTo(c3.px, c3.py);
      ctx.lineTo(c4.px, c4.py);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.stroke();

      // Talude de Montante (Reservatório)
      const m1 = project(-180, -100, z);
      const m2 = project(-20, -20, z);
      const m3 = project(-20, -20, zNext);
      const m4 = project(-180, -100, zNext);

      ctx.fillStyle = colorSlopeUpstream;
      ctx.beginPath();
      ctx.moveTo(m1.px, m1.py);
      ctx.lineTo(m2.px, m2.py);
      ctx.lineTo(m3.px, m3.py);
      ctx.lineTo(m4.px, m4.py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Talude de Jusante com Bermas
      const j1 = project(20, -20, z);
      const j2 = project(180, -100, z);
      const j3 = project(180, -100, zNext);
      const j4 = project(20, -20, zNext);

      ctx.fillStyle = colorSlopeDownstream;
      ctx.beginPath();
      ctx.moveTo(j1.px, j1.py);
      ctx.lineTo(j2.px, j2.py);
      ctx.lineTo(j3.px, j3.py);
      ctx.lineTo(j4.px, j4.py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Desenhar Superfície da Água do Reservatório (Montante)
    const waterY = -40 + waterLevelOffset;
    const w1 = project(-180, waterY, -damLength);
    const w2 = project(-60, waterY, -damLength);
    const w3 = project(-60, waterY, damLength);
    const w4 = project(-180, waterY, damLength);

    ctx.fillStyle = colorWater;
    ctx.beginPath();
    ctx.moveTo(w1.px, w1.py);
    ctx.lineTo(w2.px, w2.py);
    ctx.lineTo(w3.px, w3.py);
    ctx.lineTo(w4.px, w4.py);
    ctx.closePath();
    ctx.fill();

    // Linha de Borda da Água (Linha Azul Vibrante)
    ctx.strokeStyle = colorWaterLine;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w2.px, w2.py);
    ctx.lineTo(w3.px, w3.py);
    ctx.stroke();

    // Desenhar Linha Freática Interna (Superfície Piezométrica no Maciço)
    ctx.strokeStyle = '#38bdf8';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    for (let z = -damLength + 20; z <= damLength - 20; z += 50) {
      const f1 = project(-60, waterY, z);
      const f2 = project(0, waterY - 15, z);
      const f3 = project(70, -70, z);
      const f4 = project(140, -95, z);

      ctx.beginPath();
      ctx.moveTo(f1.px, f1.py);
      ctx.lineTo(f2.px, f2.py);
      ctx.lineTo(f3.px, f3.py);
      ctx.lineTo(f4.px, f4.py);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Desenhar Tubos Piezométricos em 3D
    piezometros3D.forEach((inst, index) => {
      // Posição calculada com base no tipo e índice
      const xPos = inst.tipo === 'INA' ? (index % 2 === 0 ? 10 : 60) : 100;
      const zPos = -120 + (index * 24);
      const topY = -20 - (xPos > 30 ? 25 : 0);
      const bottomY = -95;

      const pTop = project(xPos, topY + 12, zPos);
      const pBottom = project(xPos, bottomY, zPos);

      const isSelected = selected3DInst?.uid === inst.uid;
      const isNA = inst.condicaoHistorica === 'NA';
      const isSeco = inst.condicaoHistorica === 'SECO';

      // Haste do Piezômetro
      ctx.strokeStyle = isSelected ? '#38bdf8' : (isDark ? '#94a3b8' : '#475569');
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(pTop.px, pTop.py);
      ctx.lineTo(pBottom.px, pBottom.py);
      ctx.stroke();

      // Marcador no Topo (Cabeça do Instrumento com cor de Status)
      const statusColor = inst.statusCalculado === 'EMERGÊNCIA'
        ? '#ef4444'
        : (inst.statusCalculado === 'ATENÇÃO' ? '#f59e0b' : '#10b981');

      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(pTop.px, pTop.py, isSelected ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Rótulo 3D com ID e Ícone Condicional
      ctx.font = isSelected ? 'bold 11px Inter, sans-serif' : '9px Inter, sans-serif';
      ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
      const label = `${inst.tipo}-${inst.id} ${isNA ? '💧' : (isSeco ? '☀️' : '')}`;
      ctx.fillText(label, pTop.px + 8, pTop.py - 4);
    });

  }, [rotationX, rotationY, zoom, waterLevelOffset, selected3DInst, piezometros3D]);

  // Handlers para Rotação com Mouse ou Touch
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    setRotationY(prev => prev + deltaX * 0.6);
    setRotationX(prev => Math.max(-10, Math.min(80, prev - deltaY * 0.5)));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch Handlers para Smartphones e Tablets
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastMousePos.x;
    const deltaY = e.touches[0].clientY - lastMousePos.y;
    setRotationY(prev => prev + deltaX * 0.7);
    setRotationX(prev => Math.max(-10, Math.min(80, prev - deltaY * 0.6)));
    setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = () => setIsDragging(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Topo: Título e Controles Rápidos */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        backgroundColor: 'var(--bg-surface)',
        padding: '1.25rem',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
          }}>
            <Box size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Visualizador Geotécnico 3D & Spline
              </h2>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                backgroundColor: 'var(--primary-accent-bg)',
                color: 'var(--primary-accent)',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--border-highlight)'
              }}>
                GÊMEO DIGITAL 3D
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Seção transversal tridimensional com linha freática, tubos piezométricos e integração com Spline API.
            </p>
          </div>
        </div>

        {/* Presets de Câmera */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          <button
            onClick={() => applyPreset('isometria')}
            className={`btn-secondary ${viewPreset === 'isometria' ? 'active-preset' : ''}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            Vista 3D Isométrica
          </button>
          <button
            onClick={() => applyPreset('corte')}
            className={`btn-secondary ${viewPreset === 'corte' ? 'active-preset' : ''}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            Seção de Corte (A-A')
          </button>
          <button
            onClick={() => applyPreset('crista')}
            className={`btn-secondary ${viewPreset === 'crista' ? 'active-preset' : ''}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            Crista da Barragem
          </button>
          <button
            onClick={() => applyPreset('jusante')}
            className={`btn-secondary ${viewPreset === 'jusante' ? 'active-preset' : ''}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            Talude Jusante
          </button>
          <button
            onClick={() => { setRotationX(25); setRotationY(-35); setZoom(1); setWaterLevelOffset(0); }}
            className="btn-icon"
            title="Resetar Câmera"
          >
            <RotateCw size={16} />
          </button>
        </div>
      </div>

      {/* Grid Principal: Canvas 3D e Painel Lateral de Instrumentos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.25rem' }} className="grid-responsive-3d">
        {/* Janela de Renderização 3D */}
        <div className="card-panel" style={{ padding: 0, position: 'relative', overflow: 'hidden', minHeight: '540px', display: 'flex', flexDirection: 'column' }}>
          {/* Barra de Ferramentas Overlay */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            zIndex: 10,
            display: 'flex',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-surface-glass)',
            backdropFilter: 'blur(8px)',
            padding: '0.35rem 0.65rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)'
          }}>
            <span>Arraste com o dedo ou mouse para rotacionar 360°</span>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            right: '1rem',
            zIndex: 10,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            backgroundColor: 'var(--bg-surface-glass)',
            backdropFilter: 'blur(8px)',
            padding: '0.65rem 1rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            {/* Controle da Linha Freática */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '220px' }}>
              <Droplet size={16} style={{ color: '#0284c7' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                  <span>Nível do Reservatório / Linha Freática</span>
                  <span style={{ color: '#0284c7' }}>
                    {waterLevelOffset >= 0 ? `+${waterLevelOffset.toFixed(1)} m` : `${waterLevelOffset.toFixed(1)} m`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="15"
                  step="0.5"
                  value={waterLevelOffset}
                  onChange={(e) => setWaterLevelOffset(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Controle de Zoom */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={() => setZoom(prev => Math.max(0.6, prev - 0.1))}
                className="btn-secondary"
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
              >
                -
              </button>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(prev => Math.min(2.0, prev + 0.1))}
                className="btn-secondary"
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
              >
                +
              </button>
            </div>
          </div>

          {/* Canvas Interativo */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              width: '100%',
              height: '540px',
              cursor: isDragging ? 'grabbing' : 'grab',
              display: 'block'
            }}
          />
        </div>

        {/* Painel Lateral: Piezômetros 3D e Informações de Telemetria */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Card do Instrumento Selecionado em 3D */}
          <div className="card-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                Instrumento em Foco no Modelo:
              </span>
              {selected3DInst && (
                <button 
                  onClick={() => setSelected3DInst(null)}
                  style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: 'var(--primary-accent)', cursor: 'pointer' }}
                >
                  Limpar
                </button>
              )}
            </div>

            {selected3DInst ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {selected3DInst.tipo}-{selected3DInst.id}
                  </h3>
                  {selected3DInst.condicaoHistorica === 'NA' ? (
                    <span className="badge-na-water" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                      <span className="water-drip-icon">💧</span> N.A. DETECTADO
                    </span>
                  ) : (
                    <span className="badge-seco-animated" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                      <span className="sun-rotate-icon">☀️</span> SECO
                    </span>
                  )}
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Estrutura:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{selected3DInst.estrutura}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Última Leitura Piu:</span>
                    <strong style={{ color: 'var(--text-main)' }}>
                      {selected3DInst.ultimaLeituraPiu ? `${selected3DInst.ultimaLeituraPiu} m` : 'N/A'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Cota Calculada:</span>
                    <strong style={{ color: 'var(--primary-accent)' }}>
                      {Number(selected3DInst.ultimaCota || 0).toFixed(2)} m
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status de Segurança:</span>
                    <span style={{
                      fontWeight: 800,
                      color: selected3DInst.statusCalculado === 'EMERGÊNCIA'
                        ? 'var(--geo-emergencia)'
                        : (selected3DInst.statusCalculado === 'ATENÇÃO' ? 'var(--geo-atencao)' : 'var(--geo-normal)')
                    }}>
                      {selected3DInst.statusCalculado || 'NORMAL'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <Compass size={28} style={{ color: 'var(--primary-accent)', margin: '0 auto 0.5rem' }} />
                <p style={{ margin: 0 }}>Selecione um piezômetro abaixo para inspecionar no modelo 3D.</p>
              </div>
            )}
          </div>

          {/* Lista Seletora de Piezômetros 3D */}
          <div className="card-panel" style={{ padding: '1rem', flex: 1, maxHeight: '320px', overflowY: 'auto' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
              Instrumentos Representados ({piezometros3D.length}):
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
              {piezometros3D.map(inst => {
                const isSelected = selected3DInst?.uid === inst.uid;
                const isNA = inst.condicaoHistorica === 'NA';
                const isSeco = inst.condicaoHistorica === 'SECO';

                return (
                  <div
                    key={inst.uid}
                    onClick={() => setSelected3DInst(inst)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'var(--primary-accent-bg)' : 'var(--bg-secondary)',
                      border: isSelected ? '1.5px solid var(--primary-accent)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? 'var(--primary-accent)' : 'var(--text-main)' }}>
                        {inst.tipo}-{inst.id}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Cota: {Number(inst.ultimaCota || 0).toFixed(2)} m
                      </div>
                    </div>

                    <div>
                      {isNA ? (
                        <span className="badge-na-water" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                          <span className="water-drip-icon">💧</span> NA
                        </span>
                      ) : (
                        <span className="badge-seco-animated" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                          <span className="sun-rotate-icon">☀️</span> SECO
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seção de Integração Spline 3D API & Webhook */}
          <div className="card-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={16} style={{ color: 'var(--primary-accent)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Integração Spline 3D API
                </span>
              </div>
              <button
                onClick={() => setShowSplineSettings(!showSplineSettings)}
                className="btn-secondary"
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
              >
                {showSplineSettings ? 'Ocultar' : 'Configurar'}
              </button>
            </div>

            {showSplineSettings && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--text-muted)' }}>URL da Cena Spline (.splinecode):</label>
                <input
                  type="text"
                  value={splineUrl}
                  onChange={(e) => setSplineUrl(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.72rem', padding: '0.4rem' }}
                />
                <span style={{ fontSize: '0.68rem', color: 'var(--geo-normal)' }}>
                  ✓ Webhook do Spline sincronizado com eventos de telemetria Antigravity.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

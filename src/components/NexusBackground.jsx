import React, { useEffect, useRef } from 'react';
import { NEXUS_CONFIG, prefersReducedMotion } from '../utils/nexusMotion';

/**
 * NexusBackground — Renderiza o gradiente animado contínuo (9000ms loop)
 * e o sistema de 18 partículas flutuantes em 60 FPS com baixo consumo de CPU/GPU.
 */
export const NexusBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion() || !NEXUS_CONFIG.background.particles.enabled) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Inicializa exatamente 18 partículas conforme a especificação do modelo
    const count = NEXUS_CONFIG.background.particles.count || 18;
    const colors = [
      'rgba(124, 92, 255, 0.45)', // Primary glow
      'rgba(0, 217, 255, 0.40)',  // Secondary cyan
      'rgba(0, 245, 160, 0.35)'   // Accent green
    ];

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 1.2,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      baseAlpha: Math.random() * 0.25 + 0.15,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulseSpeed: Math.random() * 0.02 + 0.01,
      phase: Math.random() * Math.PI * 2
    }));

    let lastTime = performance.now();

    const render = (time) => {
      // 60 FPS delta
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < count; i++) {
        const p = particles[i];

        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;

        // Wrap around boundaries
        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;

        p.phase += p.pulseSpeed;
        const currentAlpha = p.baseAlpha + Math.sin(p.phase) * 0.1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.5, currentAlpha));
        ctx.shadowColor = '#7655FF';
        ctx.shadowBlur = p.radius * 3;
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div 
      className="nexus-background-wrapper"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Camada 1: Gradiente Animado de 9000ms */}
      <div className="nexus-animated-gradient" />

      {/* Camada 2: Canvas de Partículas Flutuantes */}
      <canvas 
        ref={canvasRef} 
        className="nexus-particles-canvas"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%'
        }} 
      />
    </div>
  );
};

import React, { useState } from 'react';
import { triggerHaptic } from '../utils/nexusMotion';
import { Sparkles, MessageSquare } from 'lucide-react';

/**
 * Avatar SVG vetorial oficial do Geotinho
 * Equipado com todos os EPIs de mineração:
 * - Capacete amarelo de segurança com refletivo e lanterna de mina (Headlamp)
 * - Luvas de proteção de alta visibilidade (NR-6 / NR-22)
 * - Martelo de geólogo / picareta de mineração
 * - Rosto robótico amigável com display de LED
 */
export const GeotinhoAvatarSvg = ({ size = 38, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 64 64" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ overflow: 'visible' }}
  >
    <defs>
      {/* Gradiente do Capacete */}
      <linearGradient id="geoFabHelmetGrad" x1="16" y1="8" x2="48" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="30%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>

      {/* Gradiente da Cabeça do Robô */}
      <linearGradient id="geoFabFaceGrad" x1="18" y1="20" x2="46" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="60%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* Gradiente do Visor Digital */}
      <linearGradient id="geoFabVisorGrad" x1="22" y1="26" x2="42" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#020617" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* Gradiente da Cabeça Metálica do Martelo de Geólogo */}
      <linearGradient id="geoFabHammerHead" x1="38" y1="36" x2="60" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="45%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      {/* Gradiente do Cabo do Martelo */}
      <linearGradient id="geoFabHammerHandle" x1="42" y1="36" x2="58" y2="54" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ea580c" />
        <stop offset="100%" stopColor="#9a3412" />
      </linearGradient>

      {/* Gradiente da Luva de EPI */}
      <linearGradient id="geoFabGloveGrad" x1="32" y1="40" x2="46" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fb923c" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>

      {/* Efeito Glow para LEDs */}
      <filter id="geoFabGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Orelhas / Parafusos do Robô */}
    <rect x="13" y="28" width="4" height="8" rx="2" fill="#64748b" stroke="#38bdf8" strokeWidth="0.8" />
    <rect x="47" y="28" width="4" height="8" rx="2" fill="#64748b" stroke="#38bdf8" strokeWidth="0.8" />
    <circle cx="15" cy="32" r="1.2" fill="#38bdf8" />
    <circle cx="49" cy="32" r="1.2" fill="#38bdf8" />

    {/* Cabeça do Robô */}
    <rect x="16" y="20" width="32" height="26" rx="8" fill="url(#geoFabFaceGrad)" stroke="#38bdf8" strokeWidth="1.4" />

    {/* Visor Digital Facial */}
    <rect x="20" y="25" width="24" height="15" rx="5" fill="url(#geoFabVisorGrad)" stroke="rgba(56,189,248,0.4)" strokeWidth="0.9" />

    {/* Olhos Digitais em LED Ciano */}
    <circle cx="26" cy="31" r="3.2" fill="#38bdf8" filter="url(#geoFabGlow)" />
    <circle cx="27" cy="30" r="1.2" fill="#ffffff" />
    <circle cx="38" cy="31" r="3.2" fill="#38bdf8" filter="url(#geoFabGlow)" />
    <circle cx="39" cy="30" r="1.2" fill="#ffffff" />

    {/* Sorriso Digital do Geotinho */}
    <path d="M28 36 Q32 39 36 36" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" fill="none" filter="url(#geoFabGlow)" />

    {/* Corpo / Colete com Faixa Refletiva (EPI de Mineração) */}
    <path d="M22 46 L20 57 C20 58.5 21.5 59 23 59 L41 59 C42.5 59 44 58.5 44 57 L42 46 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
    <path d="M21 51 L43 51" stroke="#f8fafc" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M21 51 L43 51" stroke="#38bdf8" strokeWidth="0.8" strokeLinecap="round" />

    {/* ========================================================
        EPI 1: CAPACETE DE MINERAÇÃO (Amarelo com Lanterna de Mina)
       ======================================================== */}
    {/* Casco protetor */}
    <path d="M16 20 C16 10 23 6.5 32 6.5 C41 6.5 48 10 48 20 Z" fill="url(#geoFabHelmetGrad)" stroke="#b45309" strokeWidth="1.1" />
    {/* Crista de reforço do capacete */}
    <path d="M30.5 7 C30.5 7 32 5.5 33.5 7 L34 19 L30 19 Z" fill="#fef08a" opacity="0.9" />
    {/* Aba frontal do capacete */}
    <path d="M13 20 C13 19 18 18 32 18 C46 18 51 19 51 20 C51 21.8 46 22.8 32 22.8 C18 22.8 13 21.8 13 20 Z" fill="#facc15" stroke="#a16207" strokeWidth="1" />
    {/* Fita refletiva do capacete */}
    <path d="M20 17.5 Q32 16 44 17.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.95" />

    {/* Lanterna de Cabeça de Mina (Headlamp) */}
    <rect x="29" y="13" width="6" height="5" rx="1.5" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
    <circle cx="32" cy="15.5" r="2.2" fill="#38bdf8" filter="url(#geoFabGlow)" />
    <circle cx="32" cy="15.5" r="0.9" fill="#ffffff" />

    {/* ========================================================
        EPI 2: MARTELO DE MINERAÇÃO / GEOLOGIA (Rock Pick Hammer)
       ======================================================== */}
    {/* Cabo do martelo de mineração */}
    <line x1="41" y1="36" x2="57" y2="54" stroke="url(#geoFabHammerHandle)" strokeWidth="3.2" strokeLinecap="round" />
    {/* Cabeça do martelo em aço temperado */}
    <g transform="rotate(-36 43 36)">
      {/* Ponta pontiaguda de quebra de rocha mineral */}
      <path d="M35 34 L48 34 L55 36 L48 38 L35 38 Z" fill="url(#geoFabHammerHead)" stroke="#334155" strokeWidth="0.8" />
      {/* Batedor quadrado do martelo */}
      <rect x="33" y="32.5" width="4" height="7" rx="0.8" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />
      {/* Brilho metálico da aresta */}
      <line x1="36" y1="35" x2="52" y2="35" stroke="#ffffff" strokeWidth="0.9" opacity="0.85" />
    </g>

    {/* ========================================================
        EPI 3: LUVAS DE SEGURANÇA (EPI Laranja de Alta Visibilidade)
       ======================================================== */}
    {/* Luva direita segurando com firmeza o cabo do martelo */}
    <ellipse cx="44" cy="41" rx="4.5" ry="4" fill="url(#geoFabGloveGrad)" stroke="#c2410c" strokeWidth="1" />
    <rect x="42" y="38" width="5.5" height="3" rx="1.4" fill="#fb923c" stroke="#9a3412" strokeWidth="0.7" />
    <rect x="41.5" y="41" width="5.5" height="3" rx="1.4" fill="#ea580c" stroke="#9a3412" strokeWidth="0.7" />
    <rect x="38" y="43" width="4.2" height="4.5" rx="1.2" fill="#78716c" stroke="#44403c" strokeWidth="0.6" />

    {/* Luva esquerda em pose de segurança / sinal positivo */}
    <ellipse cx="19" cy="45" rx="3.6" ry="3.6" fill="url(#geoFabGloveGrad)" stroke="#c2410c" strokeWidth="1" />
    <circle cx="18" cy="43.5" r="1.5" fill="#f97316" />
  </svg>
);

/**
 * GeotinhoFloatingButton - Botão flutuante no canto inferior direito para acesso instantâneo
 * ao chatbot e especialista em geotecnia Geotinho a qualquer momento da navegação.
 */
export const GeotinhoFloatingButton = ({ 
  activeTab, 
  onNavigateTab 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isChatActive = activeTab === 'ia';

  const handleClick = () => {
    triggerHaptic('medium');
    if (!isChatActive) {
      onNavigateTab('ia');
    } else {
      // Se já estiver no chat, tenta focar a caixa de mensagem
      const chatInput = document.querySelector('textarea, input[placeholder*="Pergunte sobre mineração"]');
      if (chatInput) {
        chatInput.focus();
      }
    }
  };

  return (
    <div 
      className="geotinho-floating-fab-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Balão / Tooltip Explicativo com Informações do Geotinho */}
      <div className={`geotinho-floating-tooltip ${isHovered ? 'visible' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <Sparkles size={13} style={{ color: '#38bdf8' }} />
          <strong style={{ fontSize: '0.78rem', color: '#f8fafc', letterSpacing: '0.02em' }}>
            Suporte Geotinho
          </strong>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#cbd5e1', lineHeight: 1.3 }}>
          {isChatActive 
            ? 'Você já está no chat · Clique para focar a mensagem' 
            : 'Fale com o especialista em mineração e geotecnia'}
        </div>
      </div>

      {/* Botão Flutuante Principal (FAB) */}
      <button
        type="button"
        onClick={handleClick}
        className={`geotinho-floating-btn ${isChatActive ? 'active' : ''}`}
        aria-label="Acessar o chatbot Geotinho - Inteligência Artificial Geotécnica"
        title="Falar com o Geotinho (IA de Mineração)"
      >
        {/* Anel de Pulso de Status Online */}
        <span className="geotinho-fab-pulse-ring" />
        
        {/* Ponto de Status Ativo no topo */}
        <span className="geotinho-fab-status-dot" title="Geotinho Online · Gemini 3.6 Flash" />

        {/* Ícone Vetorial com os EPIs */}
        <GeotinhoAvatarSvg size={42} />

        {/* Indicador de Mensagens */}
        <span className="geotinho-fab-chat-badge">
          <MessageSquare size={10} style={{ color: '#ffffff' }} />
        </span>
      </button>
    </div>
  );
};

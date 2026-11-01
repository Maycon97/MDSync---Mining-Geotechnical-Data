// ============================================================
// NEXUS FUTURE UI — Motion & Animation Engine
// Implements 60 FPS Spring Physics, Haptic Feedback & Gestures
// ============================================================

import NEXUS_CONFIG from '../config/nexusFutureAnimation.json';

export { NEXUS_CONFIG };

/**
 * Curvas de interpolação e easings calculadas a partir da especificação física:
 * damping: 18, stiffness: 180, mass: 0.8
 */
export const NEXUS_PHYSICS = {
  springEasing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  outCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  standardEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  durations: {
    global: NEXUS_CONFIG.global_animation.default_duration,
    screenEnter: NEXUS_CONFIG.screen_transitions.enter.duration,
    screenExit: NEXUS_CONFIG.screen_transitions.exit.duration,
    buttonPress: NEXUS_CONFIG.buttons.press.duration,
    cardEntrance: NEXUS_CONFIG.cards.entrance.duration,
    cardStagger: NEXUS_CONFIG.cards.entrance.stagger,
    navTransition: NEXUS_CONFIG.navigation.duration,
    gradientDuration: NEXUS_CONFIG.background.animated_gradient.duration
  }
};

/**
 * Dispara vibração háptica tátil nativa nos botões (Capacitor / Web Vibration API).
 */
export const triggerHaptic = (type = 'light') => {
  if (typeof window === 'undefined' || !NEXUS_CONFIG.buttons.haptic_feedback) return;
  try {
    if (window.Capacitor?.Plugins?.Haptics?.impact) {
      window.Capacitor.Plugins.Haptics.impact({ style: type.toUpperCase() });
    } else if (navigator.vibrate) {
      navigator.vibrate(type === 'medium' ? [25] : [12]);
    }
  } catch (err) {
    // Silencioso se não suportado pelo hardware
  }
};

/**
 * Verifica se o usuário prefere movimento reduzido por acessibilidade.
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};


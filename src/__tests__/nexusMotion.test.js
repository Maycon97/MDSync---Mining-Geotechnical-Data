import { describe, it, expect, vi } from 'vitest';
import { NEXUS_CONFIG, NEXUS_PHYSICS, triggerHaptic, prefersReducedMotion } from '../utils/nexusMotion';

describe('NEXUS_FUTURE_UI Animation & Motion Specification', () => {
  it('should conform to project specification metadata', () => {
    expect(NEXUS_CONFIG.project.name).toBe('NEXUS_FUTURE_UI');
    expect(NEXUS_CONFIG.project.version).toBe('1.0.0');
    expect(NEXUS_CONFIG.project.target_fps).toBe(60);
    expect(NEXUS_CONFIG.project.platforms).toContain('android');
    expect(NEXUS_CONFIG.project.platforms).toContain('ios');
  });

  it('should define the official futuristic palette and glow effects', () => {
    const { colors, effects } = NEXUS_CONFIG.theme;
    expect(colors.background).toBe('#080B16');
    expect(colors.surface).toBe('#11182A');
    expect(colors.primary).toBe('#7C5CFF');
    expect(colors.secondary).toBe('#00D9FF');
    expect(colors.accent).toBe('#00F5A0');
    expect(colors.glow).toBe('#7655FF');

    expect(effects.glassmorphism).toBe(true);
    expect(effects.neon_glow).toBe(true);
    expect(effects.gradient_backgrounds).toBe(true);
  });

  it('should configure spring physics and screen transition curves', () => {
    expect(NEXUS_CONFIG.global_animation.fps).toBe(60);
    expect(NEXUS_CONFIG.global_animation.spring.damping).toBe(18);
    expect(NEXUS_CONFIG.global_animation.spring.stiffness).toBe(180);
    expect(NEXUS_CONFIG.screen_transitions.enter.duration).toBe(450);
    expect(NEXUS_CONFIG.screen_transitions.enter.scale).toEqual([0.96, 1]);
    expect(NEXUS_CONFIG.cards.entrance.stagger).toBe(90);
    expect(NEXUS_CONFIG.cards.entrance.duration).toBe(550);
    expect(NEXUS_CONFIG.background.animated_gradient.duration).toBe(9000);
    expect(NEXUS_CONFIG.background.particles.count).toBe(18);
  });

  it('should safely execute triggerHaptic without throwing errors', () => {
    expect(() => triggerHaptic('light')).not.toThrow();
    expect(() => triggerHaptic('medium')).not.toThrow();
  });

  it('should correctly evaluate prefersReducedMotion', () => {
    expect(typeof prefersReducedMotion()).toBe('boolean');
  });
});

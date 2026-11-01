import { useEffect, useRef } from 'react';
import { NEXUS_CONFIG, triggerHaptic } from '../utils/nexusMotion';

/**
 * useNexusGestures — Hook para reconhecimento de gestos (Swipe, Long Press)
 * com sensibilidade de limiar (threshold 60px) e feedback háptico.
 */
export const useNexusGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeDown,
  onLongPress,
  elementRef
}) => {
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const longPressTimerRef = useRef(null);

  useEffect(() => {
    if (!NEXUS_CONFIG.gestures.swipe.enabled) return;

    const el = elementRef?.current || window;
    const threshold = NEXUS_CONFIG.gestures.swipe.threshold || 60;
    const longPressDuration = NEXUS_CONFIG.gestures.long_press.duration || 450;

    const handleTouchStart = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          triggerHaptic('medium');
          onLongPress();
        }, longPressDuration);
      }
    };

    const handleTouchMove = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartRef.current.y);

      // Cancela long press se o dedo se mover mais de 10px
      if (dx > 10 || dy > 10) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Limita a gestos intencionais (< 650ms)
      if (deltaTime > 650) return;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) >= threshold) {
        if (deltaX < 0 && onSwipeLeft) {
          triggerHaptic('light');
          onSwipeLeft();
        } else if (deltaX > 0 && onSwipeRight) {
          triggerHaptic('light');
          onSwipeRight();
        }
      } else if (deltaY >= threshold && onSwipeDown) {
        triggerHaptic('light');
        onSwipeDown();
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeDown, onLongPress, elementRef]);
};


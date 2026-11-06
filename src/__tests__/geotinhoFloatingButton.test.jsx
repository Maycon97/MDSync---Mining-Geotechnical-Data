// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { GeotinhoFloatingButton, GeotinhoAvatarSvg } from '../components/GeotinhoFloatingButton';

describe('GeotinhoFloatingButton Component & Navigation Suite', () => {
  let container, root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterAll(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('renders the floating button with Geotinho EPI avatar, status dot, and navigates to ia tab on click', async () => {
    const onNavigateTabMock = vi.fn();

    await act(async () => {
      root.render(
        <GeotinhoFloatingButton 
          activeTab="home"
          onNavigateTab={onNavigateTabMock}
        />
      );
    });

    // Check button exists
    const btn = container.querySelector('.geotinho-floating-btn');
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-label')).toContain('Geotinho');

    // Check avatar SVG exists
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    // Check status dot and chat badge
    expect(container.querySelector('.geotinho-fab-status-dot')).not.toBeNull();
    expect(container.querySelector('.geotinho-fab-chat-badge')).not.toBeNull();
    expect(container.querySelector('.geotinho-floating-tooltip')).not.toBeNull();

    // Click to navigate to 'ia'
    await act(async () => {
      btn.click();
    });

    expect(onNavigateTabMock).toHaveBeenCalledWith('ia');
  });

  it('reflects active state when activeTab is ia', async () => {
    const onNavigateTabMock = vi.fn();

    await act(async () => {
      root.render(
        <GeotinhoFloatingButton 
          activeTab="ia"
          onNavigateTab={onNavigateTabMock}
        />
      );
    });

    const btn = container.querySelector('.geotinho-floating-btn');
    expect(btn.classList.contains('active')).toBe(true);

    const tooltip = container.querySelector('.geotinho-floating-tooltip');
    expect(tooltip.textContent).toContain('Você já está no chat');
  });
});

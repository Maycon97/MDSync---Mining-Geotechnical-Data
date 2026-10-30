import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MobileBottomBar } from '../components/MobileBottomBar';

describe('MobileBottomBar Navigation Component', () => {
  it('deve renderizar a barra com os 5 botões de navegação padrão', () => {
    const html = renderToString(
      <MobileBottomBar 
        activeTab="home" 
        onNavigateTab={() => {}} 
        onToggleDrawer={() => {}} 
        offlineCount={0} 
      />
    );

    expect(html).toContain('Início');
    expect(html).toContain('Dashboard');
    expect(html).toContain('Planta GIS');
    expect(html).toContain('Inspeção');
    expect(html).toContain('Menu');
    expect(html).toContain('role="navigation"');
    expect(html).toContain('aria-label="Navegação móvel principal do aplicativo"');
  });

  it('deve marcar o item ativo correspondente à aba atual', () => {
    const htmlHome = renderToString(
      <MobileBottomBar 
        activeTab="home" 
        onNavigateTab={() => {}} 
        onToggleDrawer={() => {}} 
      />
    );
    expect(htmlHome).toContain('active');

    const htmlMap = renderToString(
      <MobileBottomBar 
        activeTab="mapa" 
        onNavigateTab={() => {}} 
        onToggleDrawer={() => {}} 
      />
    );
    expect(htmlMap).toContain('Planta GIS');
    expect(htmlMap).toContain('active');
  });

  it('deve exibir badge com a quantidade de itens offline pendentes quando maior que zero', () => {
    const htmlWithBadge = renderToString(
      <MobileBottomBar 
        activeTab="home" 
        onNavigateTab={() => {}} 
        onToggleDrawer={() => {}} 
        offlineCount={5} 
      />
    );

    expect(htmlWithBadge).toContain('mobile-bottom-bar-badge');
    expect(htmlWithBadge).toContain('5');
    expect(htmlWithBadge).toContain('5 itens pendentes de sincronização');
  });

  it('não deve exibir badge quando offlineCount for zero', () => {
    const htmlNoBadge = renderToString(
      <MobileBottomBar 
        activeTab="home" 
        onNavigateTab={() => {}} 
        onToggleDrawer={() => {}} 
        offlineCount={0} 
      />
    );

    expect(htmlNoBadge).not.toContain('mobile-bottom-bar-badge');
  });
});


// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import {
  CONTROLE_CHAMADOS_DATA,
  STATUS_COLORS,
  CRIT_PRAZO,
  getCritColor,
  getCritLabel,
  formatMesLabel,
  isTicketOpen,
  getDaysTo,
  getEffectivenessBand,
  formatNumber
} from '../data/controleChamadosData';
import { TABS } from '../components/Navigation';
import { ChamadosPainelExecutivo } from '../components/ChamadosPainelExecutivo';

describe('Controle de Chamados — Dataset & Business Logic', () => {
  it('should validate ticket dataset structure and count', () => {
    expect(CONTROLE_CHAMADOS_DATA.tickets).toBeDefined();
    expect(CONTROLE_CHAMADOS_DATA.tickets.length).toBe(220);
    expect(CONTROLE_CHAMADOS_DATA.mesanos.length).toBe(14);
    expect(CONTROLE_CHAMADOS_DATA.estruturas.length).toBeGreaterThanOrEqual(20);
    expect(CONTROLE_CHAMADOS_DATA.tipos.length).toBeGreaterThanOrEqual(10);
    expect(CONTROLE_CHAMADOS_DATA.statuses).toContain('Realizado e Aprovado');
    expect(CONTROLE_CHAMADOS_DATA.statuses).toContain('Não Realizado e Pendente');
  });

  it('should validate Cronograma PCM dataset', () => {
    expect(CONTROLE_CHAMADOS_DATA.cronogramaPCM).toBeDefined();
    expect(CONTROLE_CHAMADOS_DATA.cronogramaPCM.length).toBe(1693);
    const sample = CONTROLE_CHAMADOS_DATA.cronogramaPCM[0];
    expect(sample.estrutura).toBeDefined();
    expect(sample.acao).toBeDefined();
    expect(sample.status).toBeDefined();
  });

  it('should correctly format month labels', () => {
    expect(formatMesLabel('2025-06')).toBe('Jun/2025');
    expect(formatMesLabel('2026-01')).toBe('Jan/2026');
    expect(formatMesLabel('2026-07')).toBe('Jul/2026');
  });

  it('should determine correct GUT criticality colors and labels', () => {
    expect(getCritColor('A1')).toBe('#ff4b4b');
    expect(getCritColor('A2')).toBe('#ff4b4b');
    expect(getCritColor('M1')).toBe('#ff9f1a');
    expect(getCritColor('B2')).toBe('#33d17a');
    expect(getCritColor('R1')).toBe('#71d1f8');

    expect(getCritLabel('A1')).toBe('A1 · ≤7d');
    expect(getCritLabel('B3')).toBe('B3 · ≤120d');
  });

  it('should evaluate open/closed ticket status correctly', () => {
    expect(isTicketOpen({ status: 'Realizado e Aprovado' })).toBe(false);
    expect(isTicketOpen({ status: 'Não Realizado e Cancelado' })).toBe(false);
    expect(isTicketOpen({ status: 'Não Realizado e Pendente' })).toBe(true);
    expect(isTicketOpen({ status: 'Sem classificação' })).toBe(true);
  });

  it('should return appropriate effectiveness band and styling', () => {
    const bandAdequado = getEffectivenessBand(0.85);
    expect(bandAdequado.label).toBe('ADEQUADO');
    expect(bandAdequado.color).toBe('#17FF1F');

    const bandAtencao = getEffectivenessBand(0.65);
    expect(bandAtencao.label).toBe('ATENÇÃO');
    expect(bandAtencao.color).toBe('#F9FF4A');

    const bandCritico = getEffectivenessBand(0.40);
    expect(bandCritico.label).toBe('CRÍTICO');
    expect(bandCritico.color).toBe('#FF0000');
  });

  it('should register chamados in Navigation TABS', () => {
    const chamadosTab = TABS.find(t => t.id === 'chamados');
    expect(chamadosTab).toBeDefined();
    expect(chamadosTab.label).toContain('Chamados');
  });
});

describe('ChamadosPainelExecutivo Component Mount', () => {
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

  it('should render ChamadosPainelExecutivo without crashing and display titles', async () => {
    await act(async () => {
      root.render(
        <ChamadosPainelExecutivo
          onNavigateTab={vi.fn()}
          onOpenNewTicket={vi.fn()}
          onOpenFluigList={vi.fn()}
        />
      );
    });

    expect(container.textContent).toContain('PAINEL EXECUTIVO · GERÊNCIA DE GEOTECNIA');
    expect(container.textContent).toContain('Controle de Chamados & Efetividade PCM');
    expect(container.textContent).toContain('Efetividade PCM');
    expect(container.textContent).toContain('Realizado e Aprovado');
    expect(container.textContent).toContain('Status da Aprovação');
    expect(container.textContent).toContain('Chamados por Tipo');
    expect(container.textContent).toContain('Pontos de Anomalia');
  });
});

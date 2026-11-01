// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import {
  CRONOGRAMA_ITEMS,
  ESTRUTURAS_COORDENADAS,
  STATUS_CONFIG,
  MESES_ORDENADOS,
  getCronogramaStatusBadge
} from '../data/cronogramaData';
import { CronogramaSection } from '../components/CronogramaSection';

describe('Cronograma Geotécnico & PCM — Espelho Fiel XLSX', () => {
  it('should validate total items and data integrity from Excel file', () => {
    expect(CRONOGRAMA_ITEMS).toBeDefined();
    expect(CRONOGRAMA_ITEMS.length).toBe(1693);
    
    // Validar item 1
    const item1 = CRONOGRAMA_ITEMS[0];
    expect(item1.id).toBe(1);
    expect(item1.estrutura).toBe('PILHA B2');
    expect(item1.dataPlanejada).toBe('2025-04-14');
    expect(item1.acao).toContain('MONITORAMENTO DA INSTRUMENTAÇÃO GEOTÉCNICA');
    expect(item1.status).toBe('Concluído');
  });

  it('should validate specific tasks with delays, desvios and justificativas', () => {
    const item674 = CRONOGRAMA_ITEMS.find(i => i.id === 674);
    expect(item674).toBeDefined();
    expect(item674.estrutura).toBe('B4');
    expect(item674.desvio).toBe('Reprogramação');
    expect(item674.status).toBe('Realizado com Atraso');
    expect(item674.justificativa).toContain('feriado');

    const item725 = CRONOGRAMA_ITEMS.find(i => i.id === 725);
    expect(item725).toBeDefined();
    expect(item725.acao).toBe('VOO DE DRONE');
    expect(item725.desvio).toBe('Precipitação');
    expect(item725.status).toBe('Reprogramada');
  });

  it('should contain valid coordinates for complex structures', () => {
    expect(ESTRUTURAS_COORDENADAS).toBeDefined();
    expect(Object.keys(ESTRUTURAS_COORDENADAS).length).toBeGreaterThanOrEqual(18);

    const b1Coords = ESTRUTURAS_COORDENADAS['B1'];
    expect(b1Coords).toBeDefined();
    expect(b1Coords.lat).toBeCloseTo(-20.063981, 4);
    expect(b1Coords.lon).toBeCloseTo(-44.114408, 4);

    const b4Coords = ESTRUTURAS_COORDENADAS['B4'];
    expect(b4Coords).toBeDefined();
    expect(b4Coords.lat).toBeCloseTo(-20.090027, 4);
    expect(b4Coords.lon).toBeCloseTo(-44.100755, 4);
  });

  it('should correctly configure status badges', () => {
    const stConcluido = getCronogramaStatusBadge('Concluído');
    expect(stConcluido.color).toBe('#10b981');

    const stAtraso = getCronogramaStatusBadge('Realizado com Atraso');
    expect(stAtraso.color).toBe('#f59e0b');

    const stReprog = getCronogramaStatusBadge('Reprogramada');
    expect(stReprog.color).toBe('#ef4444');

    const stFuturas = getCronogramaStatusBadge('Ações futuras');
    expect(stFuturas.color).toBe('#38bdf8');
  });
});

describe('CronogramaSection Component Mount', () => {
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

  it('should render CronogramaSection without crashing and display titles and KPIs', async () => {
    await act(async () => {
      root.render(<CronogramaSection onNavigateTab={vi.fn()} />);
    });

    expect(container.textContent).toContain('Cronograma Geotécnico & PCM');
    expect(container.textContent).toContain('Espelho Fiel Excel (1.693 Tarefas)');
    expect(container.textContent).toContain('Total de Tarefas');
    expect(container.textContent).toContain('Concluídas');
    expect(container.textContent).toContain('Realizadas c/ Atraso');
    expect(container.textContent).toContain('Reprogramadas');
    expect(container.textContent).toContain('Ações Futuras');
    expect(container.textContent).toContain('Aderência no Prazo');
  });
});

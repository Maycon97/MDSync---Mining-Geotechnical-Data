// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { EmpreendimentosTab } from '../components/EmpreendimentosTab';
import { storageService } from '../services/storageService';

describe('Gestão Corporativa de Empreendimentos (SaaS Comercial)', () => {
  beforeEach(() => {
    if (typeof globalThis.localStorage === 'undefined') {
      const store = {};
      globalThis.localStorage = {
        getItem: (k) => store[k] || null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); }
      };
    } else {
      localStorage.clear();
    }
  });

  it('should return default initial enterprise (Complexo Minerário Itaminas)', () => {
    const list = storageService.getEmpreendimentos();
    expect(list.length).toBeGreaterThanOrEqual(1);

    const itaminas = list[0];
    expect(itaminas.nome).toContain('Complexo Minerário Itaminas');
    expect(itaminas.razaoSocial).toBe('Itaminas Mineração S/A');
    expect(itaminas.cnpj).toBe('17.214.288/0001-38');
    expect(itaminas.sigla).toBe('ITAMINAS');
    expect(itaminas.municipio).toBe('Sarzedo');
    expect(itaminas.uf).toBe('MG');
    expect(itaminas.coordenadas).toBeDefined();
    expect(itaminas.coordenadas.lat).toBeCloseTo(-20.088788, 4);
    expect(itaminas.coordenadas.lon).toBeCloseTo(-44.092452, 4);
    expect(itaminas.responsavelTecnico).toBeDefined();
    expect(itaminas.responsavelTecnico.nome).toContain('Maycon Douglas');
  });

  it('should register and persist a new enterprise for commercial multi-site capability', () => {
    const newEmp = {
      nome: 'Complexo Minerário Samarco Germano',
      razaoSocial: 'Samarco Mineração S.A.',
      cnpj: '16.634.426/0001-80',
      sigla: 'SAM-GER',
      processoAnm: '831.200/1985',
      substanciaMineral: 'Minério de Ferro',
      municipio: 'Mariana',
      uf: 'MG',
      baciaHidrografica: 'Bacia Hidrográfica do Rio Doce',
      lat: -20.245890,
      lon: -43.489120,
      rtNome: 'Dr. João Silva',
      rtCrea: 'CREA-MG 98.765/D',
      rtEmail: 'joao.silva@samarco.com',
      orgaoAmbiental: 'ANM & FEAM',
      licencaOperacao: 'LO nº 019/2023',
      faseOperacional: 'Em Operação Regular'
    };

    const saved = storageService.saveEmpreendimento(newEmp);
    expect(saved).toBeDefined();
    expect(saved.sigla).toBe('SAM-GER');
    expect(saved.nome).toBe('Complexo Minerário Samarco Germano');

    const updatedList = storageService.getEmpreendimentos();
    expect(updatedList.length).toBe(2);

    const found = updatedList.find(e => e.sigla === 'SAM-GER');
    expect(found).toBeDefined();
    expect(found.municipio).toBe('Mariana');
    expect(found.coordenadas.lat).toBe(-20.245890);
  });

  it('should allow setting and retrieving the active enterprise context', () => {
    const itaminas = storageService.getActiveEmpreendimento();
    expect(itaminas.sigla).toBe('ITAMINAS');

    storageService.saveEmpreendimento({
      id: 'EMP-VALE',
      sigla: 'VALE-VG',
      nome: 'Complexo Vargem Grande',
      razaoSocial: 'Vale S.A.'
    });

    storageService.setActiveEmpreendimento('EMP-VALE');
    const active = storageService.getActiveEmpreendimento();
    expect(active.sigla).toBe('VALE-VG');
    expect(active.nome).toBe('Complexo Vargem Grande');
  });

  it('should prevent deletion of the last remaining enterprise for system safety', () => {
    const list = storageService.getEmpreendimentos();
    expect(list.length).toBe(1);

    const result = storageService.deleteEmpreendimento(list[0].id);
    expect(result).toBe(false);
    expect(storageService.getEmpreendimentos().length).toBe(1);
  });

  it('should render EmpreendimentosTab component with enterprise list, KPIs and add button', async () => {
    const onNavigateTab = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<EmpreendimentosTab onNavigateTab={onNavigateTab} />);
    });

    // Verify main titles and KPIs
    expect(container.textContent).toContain('Gestão de Empreendimentos & Complexos Minerários');
    expect(container.textContent).toContain('MDSYNC ENTERPRISE · SAAS COMERCIAL');
    expect(container.textContent).toContain('Complexo Minerário Itaminas');
    expect(container.textContent).toContain('Itaminas Mineração S/A');
    expect(container.textContent).toContain('17.214.288/0001-38');
    expect(container.textContent).toContain('Sarzedo / MG');
    expect(container.textContent).toContain('Maycon Douglas');

    // Verify animated add button (+) with btn-structure-add class
    const addBtn = container.querySelector('.btn-structure-add');
    expect(addBtn).not.toBeNull();
    expect(addBtn.getAttribute('title')).toContain('Cadastrar novo empreendimento');
    expect(addBtn.querySelector('.icon-plus-animated')).not.toBeNull();

    // Verify clicking opens create enterprise modal
    await act(async () => {
      addBtn.click();
    });
    expect(container.textContent).toContain('Cadastrar Novo Empreendimento');

    // Clean up
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});


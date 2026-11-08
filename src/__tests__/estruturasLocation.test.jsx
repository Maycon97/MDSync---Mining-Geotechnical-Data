// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { EstruturasEmpreendimentoTab } from '../components/EstruturasEmpreendimentoTab';
import { StructureLocationPickerModal } from '../components/StructureLocationPickerModal';
import { GeotechDataProvider, useGeotechData } from '../context/GeotechDataContext';
import { AuthProvider } from '../context/AuthContext';
import { storageService } from '../services/storageService';

describe('Estruturas Location & Map Placement', () => {
  let container, root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    globalThis.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ estruturas: [], instrumentos: [] })
      });
    });
  });

  afterAll(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('storageService.saveEstruturaEmpreendimento correctly normalizes and saves lat/lon and dispatches event', () => {
    const eventSpy = vi.fn();
    window.addEventListener('mdsync:estruturas-changed', eventSpy);

    const testStruct = {
      id: 'PDE ES SMB',
      sigla: 'PDE ES SMB',
      nome: 'PDE Samambaia',
      lat: '-20.093978',
      lon: '-44.106216'
    };

    const saved = storageService.saveEstruturaEmpreendimento(testStruct);
    expect(saved).toBe(true);

    const list = storageService.getEstruturasEmpreendimento();
    const found = list.find(e => e.id === 'PDE ES SMB' || e.sigla === 'PDE ES SMB');
    expect(found).toBeDefined();
    expect(found.lat).toBe(-20.093978);
    expect(found.lon).toBe(-44.106216);
    expect(found.coordenadas.lat).toBe(-20.093978);
    expect(found.coordenadas.lon).toBe(-44.106216);

    expect(eventSpy).toHaveBeenCalled();
    window.removeEventListener('mdsync:estruturas-changed', eventSpy);
  });

  it('GeotechDataProvider automatically synchronizes structures when mdsync:estruturas-changed is dispatched', async () => {
    let capturedStructures = [];
    const Consumer = () => {
      const { structures } = useGeotechData();
      capturedStructures = structures;
      return <div data-testid="count">{structures.length}</div>;
    };

    await act(async () => {
      root.render(
        <AuthProvider>
          <GeotechDataProvider>
            <Consumer />
          </GeotechDataProvider>
        </AuthProvider>
      );
    });

    const hasSamambaia = capturedStructures.some(s => s.nome === 'PDE Samambaia' || s.id === 'PDE ES SMB');
    expect(hasSamambaia).toBe(true);
    const samambaia = capturedStructures.find(s => s.nome === 'PDE Samambaia' || s.id === 'PDE ES SMB');
    expect(samambaia.lat).toBe(-20.093978);
    expect(samambaia.lon).toBe(-44.106216);
  });

  it('renders location fields and actions inside the create structure modal', async () => {
    await act(async () => {
      root.render(
        <AuthProvider>
          <GeotechDataProvider>
            <EstruturasEmpreendimentoTab />
          </GeotechDataProvider>
        </AuthProvider>
      );
    });

    const addBtn = container.querySelector('.btn-structure-add');
    expect(addBtn).not.toBeNull();

    await act(async () => {
      addBtn.click();
    });

    // Check modal contains location section
    const modal = container.querySelector('.modal-backdrop');
    expect(modal).not.toBeNull();
    expect(modal.textContent).toContain('Localização Georreferenciada no Mapa');
    expect(modal.textContent).toContain('Marcar Ponto no Mapa');
    expect(modal.textContent).toContain('Capturar GPS');
    expect(modal.textContent).toContain('Centro Sarzedo');

    // Find latitude and longitude inputs
    const inputs = modal.querySelectorAll('input[type="number"]');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('clicking Ver no Georeferenciamento navigates to mapa with exact coords and structureId', async () => {
    const navigateSpy = vi.fn();

    await act(async () => {
      root.render(
        <AuthProvider>
          <GeotechDataProvider>
            <EstruturasEmpreendimentoTab onNavigateTab={navigateSpy} />
          </GeotechDataProvider>
        </AuthProvider>
      );
    });

    const geoButtons = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent.includes('Ver no Georeferenciamento') || b.textContent.includes('Ver no Mapa')
    );
    expect(geoButtons.length).toBeGreaterThan(0);

    await act(async () => {
      geoButtons[0].click();
    });

    expect(navigateSpy).toHaveBeenCalledWith(
      'mapa',
      expect.objectContaining({
        structureId: expect.any(String),
        coords: expect.any(Array),
        zoom: expect.any(Number)
      })
    );
  });

  it('StructureLocationPickerModal calls onConfirm with coords when confirmed', async () => {
    const onConfirmMock = vi.fn();
    const onCloseMock = vi.fn();

    const pickerContainer = document.createElement('div');
    document.body.appendChild(pickerContainer);
    const pickerRoot = createRoot(pickerContainer);

    await act(async () => {
      pickerRoot.render(
        <StructureLocationPickerModal
          isOpen={true}
          onClose={onCloseMock}
          initialCoords={{ lat: -20.0825, lon: -44.1085 }}
          structureName="Barragem Teste"
          structureSigla="BT-01"
          onConfirm={onConfirmMock}
        />
      );
    });

    expect(pickerContainer.textContent).toContain('Definir Localização no Mapa');
    expect(pickerContainer.textContent).toContain('Barragem Teste');

    const confirmBtn = Array.from(pickerContainer.querySelectorAll('button')).find(
      b => b.textContent.includes('Confirmar Localização')
    );
    expect(confirmBtn).toBeDefined();

    await act(async () => {
      confirmBtn.click();
    });

    expect(onConfirmMock).toHaveBeenCalledWith(
      expect.objectContaining({
        lat: expect.any(Number),
        lon: expect.any(Number)
      })
    );
    expect(onCloseMock).toHaveBeenCalled();

    act(() => pickerRoot.unmount());
    pickerContainer.remove();
  });
});

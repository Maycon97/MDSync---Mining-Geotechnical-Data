// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { EngenhoSecoBlockModelViewer } from '../components/EngenhoSecoBlockModelViewer';
import { PluviometriaTab } from '../components/PluviometriaTab';
import { DashboardTab } from '../components/DashboardTab';
import { EstruturasEmpreendimentoTab } from '../components/EstruturasEmpreendimentoTab';
import { MapTab } from '../components/MapTab';
import { GeotechDataProvider } from '../context/GeotechDataContext';

vi.mock('../components/BlockModelRealPanel', () => ({
  default: () => <div>Painel Datamine Real 3D</div>,
  BlockModelRealPanel: () => <div>Painel Datamine Real 3D</div>
}));

describe('Ver no Georeferenciamento - Contextual Navigation Verification', () => {
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

  it('renders "Ver no Georeferenciamento" in EngenhoSecoBlockModelViewer and dispatches block_model context', async () => {
    const mockNavigateToMap = vi.fn();
    await act(async () => {
      root.render(
        <EngenhoSecoBlockModelViewer 
          onClose={() => {}} 
          onNavigateToMap={mockNavigateToMap} 
        />
      );
    });

    const buttons = [...container.querySelectorAll('button')];
    const geoBtn = buttons.find(b => b.textContent?.includes('Ver no Georeferenciamento'));
    expect(geoBtn).toBeDefined();

    await act(async () => {
      geoBtn.click();
    });

    expect(mockNavigateToMap).toHaveBeenCalledWith(expect.objectContaining({
      structureId: 'ENGENHO_SECO',
      focus: 'block_model'
    }));
  });

  it('renders "Ver no Georeferenciamento" in PluviometriaTab and dispatches pluviometria focus', async () => {
    const mockNavigateTab = vi.fn();
    await act(async () => {
      root.render(
        <GeotechDataProvider>
          <PluviometriaTab onNavigateTab={mockNavigateTab} />
        </GeotechDataProvider>
      );
    });

    const buttons = [...container.querySelectorAll('button')];
    const geoBtn = buttons.find(b => b.textContent?.includes('Ver no Georeferenciamento'));
    expect(geoBtn).toBeDefined();

    await act(async () => {
      geoBtn.click();
    });

    expect(mockNavigateTab).toHaveBeenCalledWith('mapa', expect.objectContaining({
      focus: 'pluviometria'
    }));
  });

  it('renders "Ver no Georeferenciamento" in DashboardTab and dispatches contextual filter context', async () => {
    const mockNavigateTab = vi.fn();
    await act(async () => {
      root.render(
        <GeotechDataProvider>
          <DashboardTab onNavigateTab={mockNavigateTab} />
        </GeotechDataProvider>
      );
    });

    const buttons = [...container.querySelectorAll('button')];
    const geoBtn = buttons.find(b => b.textContent?.includes('Ver no Georeferenciamento'));
    expect(geoBtn).toBeDefined();

    await act(async () => {
      geoBtn.click();
    });

    expect(mockNavigateTab).toHaveBeenCalledWith('mapa', expect.objectContaining({
      structureId: expect.any(String),
      filterType: expect.any(String),
      filterStatus: expect.any(String)
    }));
  });

  it('renders "Ver no Georeferenciamento" in EstruturasEmpreendimentoTab and dispatches structureId', async () => {
    const mockNavigateTab = vi.fn();
    await act(async () => {
      root.render(
        <GeotechDataProvider>
          <EstruturasEmpreendimentoTab onNavigateTab={mockNavigateTab} />
        </GeotechDataProvider>
      );
    });

    const buttons = [...container.querySelectorAll('button')];
    const geoBtn = buttons.find(b => b.textContent?.includes('Ver no Georeferenciamento'));
    expect(geoBtn).toBeDefined();

    await act(async () => {
      geoBtn.click();
    });

    expect(mockNavigateTab).toHaveBeenCalledWith('mapa', expect.objectContaining({
      structureId: expect.any(String)
    }));
  });

  it('mounts MapTab with structureId navigationContext without ReferenceError', async () => {
    const mockClear = vi.fn();
    await act(async () => {
      root.render(
        <GeotechDataProvider>
          <MapTab 
            navigationContext={{ structureId: 'ENGENHO_SECO', focus: 'block_model' }}
            onClearNavigationContext={mockClear}
          />
        </GeotechDataProvider>
      );
    });

    expect(container).toBeDefined();
    expect(mockClear).toHaveBeenCalled();
  });

  it('mounts MapTab with pluviometria navigationContext without ReferenceError', async () => {
    const mockClear = vi.fn();
    await act(async () => {
      root.render(
        <GeotechDataProvider>
          <MapTab 
            navigationContext={{ focus: 'pluviometria' }}
            onClearNavigationContext={mockClear}
          />
        </GeotechDataProvider>
      );
    });

    expect(container).toBeDefined();
    expect(mockClear).toHaveBeenCalled();
  });
});

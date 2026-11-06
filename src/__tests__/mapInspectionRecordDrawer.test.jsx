// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { MapInspectionRecordDrawer } from '../components/MapInspectionRecordDrawer';

describe('MapInspectionRecordDrawer - Animated Add Button (+)', () => {
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

  const dummyRecords = [
    {
      id: 'REC-001',
      codigo: 'REC-001',
      estrutura: 'BARRAGEM B1',
      tipo: 'Trinca Longitudinal',
      severidade: 2,
      status: 'Pendente',
      dataIdentificacao: '2026-10-15',
      lat: -20.123,
      lon: -43.987
    }
  ];

  it('renders the animated plus (+) button with class btn-georef-add, title, and svg', async () => {
    const handleOpenNewRecord = vi.fn();

    await act(async () => {
      root.render(
        <MapInspectionRecordDrawer
          isOpen={true}
          onClose={() => {}}
          records={dummyRecords}
          onOpenNewRecord={handleOpenNewRecord}
        />
      );
    });

    // Check header text
    expect(container.textContent).toContain('Registros Georreferenciados');

    // Find animated add button
    const addButton = container.querySelector('.btn-georef-add');
    expect(addButton).toBeDefined();
    expect(addButton).not.toBeNull();
    expect(addButton.getAttribute('title')).toContain('(+)');
    expect(addButton.getAttribute('aria-label')).toContain('(+)');

    // Verify plus icon inside
    const iconSpan = addButton.querySelector('.icon-plus-animated');
    expect(iconSpan).toBeDefined();
    expect(iconSpan).not.toBeNull();
    const svgIcon = addButton.querySelector('svg');
    expect(svgIcon).toBeDefined();
    expect(svgIcon).not.toBeNull();

    // Verify click handler works
    act(() => {
      addButton.click();
    });
    expect(handleOpenNewRecord).toHaveBeenCalledTimes(1);
  });

  it('does not render the add button when onOpenNewRecord is not provided', async () => {
    await act(async () => {
      root.render(
        <MapInspectionRecordDrawer
          isOpen={true}
          onClose={() => {}}
          records={dummyRecords}
        />
      );
    });

    const addButton = container.querySelector('.btn-georef-add');
    expect(addButton).toBeNull();
  });
});

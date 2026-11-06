// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { ProfileSettingsTab } from '../components/ProfileSettingsTab';
import { AuthProvider } from '../context/AuthContext';
import { GeotechDataProvider } from '../context/GeotechDataContext';

describe('ProfileSettingsTab Navigation & Layout Suite', () => {
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

  it('renders all 9 navigation pills with full words and badges without truncation', async () => {
    await act(async () => {
      root.render(
        <AuthProvider>
          <GeotechDataProvider>
            <ProfileSettingsTab />
          </GeotechDataProvider>
        </AuthProvider>
      );
    });

    const pills = container.querySelectorAll('.settings-nav-pill');
    expect(pills.length).toBe(9);

    const expectedLabels = [
      '1. Perfil & RBAC',
      '2. Segurança & Senha',
      '3. Idioma & Unidades',
      '4. Tema & Campo',
      '5. Alertas & Sirene',
      '6. Armazenamento',
      '7. Versão & PWA',
      '8. Políticas & Compliance',
      '9. Regras de Inspeção'
    ];

    expectedLabels.forEach((label, idx) => {
      const pill = pills[idx];
      expect(pill).toBeDefined();
      expect(pill.textContent).toContain(label);
    });

    // Check header tags
    const headerCard = container.querySelector('.settings-header-card');
    expect(headerCard).not.toBeNull();
    expect(headerCard.textContent).toContain('Configurações & Perfil');
    expect(headerCard.textContent).toContain('MINING ENTERPRISE SUITE');
    expect(headerCard.textContent).toContain('PORTARIA ANM 95/2022');

    // First pill should be active by default
    expect(pills[0].classList.contains('active')).toBe(true);

    // Click 8th pill (Políticas & Compliance)
    await act(async () => {
      pills[7].click();
    });

    expect(pills[7].classList.contains('active')).toBe(true);
    expect(pills[0].classList.contains('active')).toBe(false);
  });
});

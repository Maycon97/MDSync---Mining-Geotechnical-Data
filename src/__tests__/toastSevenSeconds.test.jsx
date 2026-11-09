// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeotechDataProvider, useGeotechData } from '../context/GeotechDataContext';

// Componente de teste consumidor para disparar e inspecionar o systemToast
const ToastTesterComponent = () => {
  const { systemToast, setSystemToast, showToast } = useGeotechData();

  return (
    <div>
      <button 
        id="trigger-set"
        onClick={() => setSystemToast({ type: 'success', message: 'Nova estrutura cadastrada!' })}
      >
        Set Toast
      </button>
      <button 
        id="trigger-show"
        onClick={() => showToast('Mensagem informativa via showToast', 'info')}
      >
        Show Toast
      </button>
      {systemToast && (
        <div id="active-toast">
          <span>{systemToast.message}</span>
        </div>
      )}
    </div>
  );
};

describe('Pop-ups Informativos (Toasts) - Limite Estrito de 7 Segundos', () => {
  let container, root;

  beforeEach(() => {
    vi.useFakeTimers();
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('deve exibir o toast ao chamar setSystemToast e encerrar automaticamente após exatamente 7 segundos', async () => {
    await act(async () => {
      root.render(
        <GeotechDataProvider>
          <ToastTesterComponent />
        </GeotechDataProvider>
      );
    });

    // Inicialmente sem toast
    expect(container.querySelector('#active-toast')).toBeNull();

    // Dispara o toast via setSystemToast
    await act(async () => {
      container.querySelector('#trigger-set').click();
    });

    // Toast visível imediatamente
    expect(container.querySelector('#active-toast')).not.toBeNull();
    expect(container.textContent).toContain('Nova estrutura cadastrada!');

    // Avança 6.9 segundos: toast AINDA deve estar visível
    await act(async () => {
      vi.advanceTimersByTime(6900);
    });
    expect(container.querySelector('#active-toast')).not.toBeNull();

    // Avança mais 200ms (totalizando 7.1s > 7.0s): toast deve ter sido dispensado
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(container.querySelector('#active-toast')).toBeNull();
  });

  it('deve respeitar o limite de 7 segundos ao chamar showToast sem especificar duration', async () => {
    await act(async () => {
      root.render(
        <GeotechDataProvider>
          <ToastTesterComponent />
        </GeotechDataProvider>
      );
    });

    await act(async () => {
      container.querySelector('#trigger-show').click();
    });

    expect(container.textContent).toContain('Mensagem informativa via showToast');

    // Avança 7000ms
    await act(async () => {
      vi.advanceTimersByTime(7000);
    });

    expect(container.querySelector('#active-toast')).toBeNull();
  });
});

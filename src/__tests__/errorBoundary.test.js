import { describe, it, expect } from 'vitest';
import { ErrorBoundary } from '../components/ErrorBoundary';

describe('ErrorBoundary Component', () => {
  it('should initialize with hasError = false', () => {
    const boundary = new ErrorBoundary({ children: null });
    expect(boundary.state.hasError).toBe(false);
    expect(boundary.state.error).toBeNull();
  });

  it('should update state when getDerivedStateFromError is called', () => {
    const fakeError = new Error('Falha no renderizador do mapa');
    const newState = ErrorBoundary.getDerivedStateFromError(fakeError);
    expect(newState.hasError).toBe(true);
    expect(newState.error).toBe(fakeError);
  });

  it('should reset state when resetError is invoked', () => {
    const boundary = new ErrorBoundary({ children: null });
    boundary.setState = (update) => {
      boundary.state = typeof update === 'function' ? update(boundary.state) : { ...boundary.state, ...update };
    };
    boundary.state = { hasError: true, error: new Error('Crash'), errorInfo: null };
    boundary.resetError();
    expect(boundary.state.hasError).toBe(false);
    expect(boundary.state.error).toBeNull();
  });
});

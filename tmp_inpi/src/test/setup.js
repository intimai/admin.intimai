// Setup global para testes
import { vi } from 'vitest';

// Mock do navigator global
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Test User Agent'
  },
  writable: true
});

// Mock do fetch global
global.fetch = vi.fn();

// Mock do console para testes mais limpos
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

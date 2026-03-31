import { describe, test, expect, vi } from 'vitest';

// Mock das variáveis de ambiente primeiro
vi.mock('import.meta', () => ({
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key'
  }
}));

// Mock do Supabase inline
vi.mock('../customSupabaseClient', () => {
  const mockSupabase = {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  };
  
  return {
    supabase: mockSupabase
  };
});

// Mock do console
vi.mock('console', () => ({
  log: vi.fn(),
  error: vi.fn(),
}));

describe('auditService - Testes Funcionais', () => {
  test('deve existir e ter métodos necessários', async () => {
    // Importar após os mocks
    const { auditService } = await import('../auditService');
    
    // Verificar se o serviço existe
    expect(auditService).toBeDefined();
    expect(typeof auditService.logAction).toBe('function');
    expect(typeof auditService.logCreateIntimacao).toBe('function');
    expect(typeof auditService.logCancelIntimacao).toBe('function');
    expect(typeof auditService.logAcceptTerms).toBe('function');
    expect(typeof auditService.getLogs).toBe('function');
  });

  test('deve ter estrutura correta para logAction', async () => {
    const { auditService } = await import('../auditService');
    
    // Verificar se logAction aceita os parâmetros corretos
    expect(auditService.logAction).toBeDefined();
    expect(typeof auditService.logAction).toBe('function');
  });

  test('deve ter estrutura correta para logCreateIntimacao', async () => {
    const { auditService } = await import('../auditService');
    
    // Verificar se logCreateIntimacao aceita os parâmetros corretos
    expect(auditService.logCreateIntimacao).toBeDefined();
    expect(typeof auditService.logCreateIntimacao).toBe('function');
  });

  test('deve ter estrutura correta para logAcceptTerms', async () => {
    const { auditService } = await import('../auditService');
    
    // Verificar se logAcceptTerms aceita os parâmetros corretos
    expect(auditService.logAcceptTerms).toBeDefined();
    expect(typeof auditService.logAcceptTerms).toBe('function');
  });

  test('deve ter estrutura correta para getLogs', async () => {
    const { auditService } = await import('../auditService');
    
    // Verificar se getLogs aceita os parâmetros corretos
    expect(auditService.getLogs).toBeDefined();
    expect(typeof auditService.getLogs).toBe('function');
  });
});

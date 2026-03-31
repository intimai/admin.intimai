import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock das variáveis de ambiente
vi.mock('import.meta', () => ({
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key'
  }
}));

// Mock do Supabase mais simples
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn()
      }))
    }))
  }))
};

vi.mock('../customSupabaseClient', () => ({
  supabase: mockSupabase
}));

// Mock do console
vi.mock('console', () => ({
  log: vi.fn(),
  error: vi.fn(),
}));

// Importar após os mocks
import { auditService } from '../auditService';

describe('auditService - Testes Básicos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configurar mock de sucesso
    mockSupabase.from().insert().select().single.mockResolvedValue({
      data: { id: 'test-id', action_type: 'TEST' },
      error: null
    });
  });

  test('deve registrar log de criação de intimação', async () => {
    const mockUser = {
      id: 'user-123',
      nome: 'João Silva',
      email: 'joao@delegacia.gov.br',
      delegaciaNome: 'Delegacia Central'
    };

    const mockIntimacao = {
      intimacaoId: 'intimacao-456',
      nomeIntimado: 'Maria Santos',
      documento: '123.456.789-00'
    };

    const result = await auditService.logCreateIntimacao(mockUser, mockIntimacao);

    // Verificar se o método foi chamado
    expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    expect(mockSupabase.from().insert).toHaveBeenCalled();
    
    // Verificar se retornou dados
    expect(result).toBeTruthy();
  });

  test('deve registrar log de aceite de termos', async () => {
    const mockUser = {
      userId: 'user-456',
      nome: 'Ana Costa',
      email: 'ana@delegacia.gov.br'
    };

    const result = await auditService.logAcceptTerms(mockUser);

    // Verificar se o método foi chamado
    expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    expect(mockSupabase.from().insert).toHaveBeenCalled();
    
    // Verificar se retornou dados
    expect(result).toBeTruthy();
  });

  test('deve registrar log de cancelamento', async () => {
    const mockUser = {
      id: 'user-789',
      nome: 'Pedro Santos'
    };

    const result = await auditService.logCancelIntimacao(mockUser, 'intimacao-999', 'Cancelado pelo usuário');

    // Verificar se o método foi chamado
    expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    expect(mockSupabase.from().insert).toHaveBeenCalled();
    
    // Verificar se retornou dados
    expect(result).toBeTruthy();
  });

  test('deve funcionar com usuário null (formulários públicos)', async () => {
    const result = await auditService.logAction({
      user: null,
      actionType: 'LGPD_REQUEST',
      resourceType: 'lgpd_request',
      resourceId: 'request-123'
    });

    // Verificar se o método foi chamado
    expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    expect(mockSupabase.from().insert).toHaveBeenCalled();
    
    // Verificar se retornou dados
    expect(result).toBeTruthy();
  });

  test('deve retornar null em caso de erro', async () => {
    // Mock de erro
    mockSupabase.from().insert().select().single.mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    });

    const result = await auditService.logAction({
      user: { id: 'test' },
      actionType: 'TEST_ACTION',
      resourceType: 'test',
      resourceId: 'test-123'
    });

    // Deve retornar null em caso de erro
    expect(result).toBeNull();
  });
});

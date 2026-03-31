import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock das variáveis de ambiente
vi.mock('import.meta', () => ({
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key'
  }
}));

// Mock do Supabase
vi.mock('../customSupabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

// Importar após os mocks
import { auditService } from '../auditService';

// Mock do console para evitar logs nos testes
vi.mock('console', () => ({
  log: vi.fn(),
  error: vi.fn(),
}));

describe('auditService', () => {
  let mockSupabaseResponse;
  let mockSupabase;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Importar o mock do Supabase
    const { supabase } = await import('../customSupabaseClient');
    mockSupabase = supabase;
    
    // Mock da resposta do Supabase
    mockSupabaseResponse = {
      data: {
        id: 'test-audit-id',
        user_id: 'test-user-id',
        action_type: 'CREATE_INTIMACAO',
        created_at: new Date().toISOString()
      },
      error: null
    };
    
    // Configurar mock do Supabase
    mockSupabase.from().insert().select().single.mockResolvedValue(mockSupabaseResponse);
  });

  describe('logAction', () => {
    test('deve registrar ação com dados do usuário completos', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'policial@delegacia.gov.br',
        nome: 'João Silva',
        delegaciaNome: 'Delegacia Central'
      };

      const result = await auditService.logAction({
        user: mockUser,
        actionType: 'CREATE_INTIMACAO',
        resourceType: 'intimacao',
        resourceId: 'intimacao-123',
        details: { test: 'data' }
      });

      expect(result).toEqual(mockSupabaseResponse.data);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
      
      const insertCall = mockSupabase.from().insert.mock.calls[0][0][0];
      expect(insertCall).toMatchObject({
        user_id: 'test-user-id',
        user_email: 'policial@delegacia.gov.br',
        user_nome: 'João Silva',
        delegacia_nome: 'Delegacia Central',
        action_type: 'CREATE_INTIMACAO',
        resource_type: 'intimacao',
        resource_id: 'intimacao-123',
        details: { test: 'data' }
      });
    });

    test('deve funcionar com usuário null (formulários públicos)', async () => {
      const result = await auditService.logAction({
        user: null,
        actionType: 'LGPD_REQUEST',
        resourceType: 'lgpd_request',
        resourceId: 'request-123'
      });

      expect(result).toEqual(mockSupabaseResponse.data);
      
      const insertCall = mockSupabase.from().insert.mock.calls[0][0][0];
      expect(insertCall).toMatchObject({
        user_id: null,
        user_email: null,
        user_nome: null,
        delegacia_nome: null,
        action_type: 'LGPD_REQUEST',
        resource_type: 'lgpd_request',
        resource_id: 'request-123'
      });
    });

    test('deve retornar null se houver erro no Supabase', async () => {
      // Mock de erro
      mockSupabaseResponse.error = { message: 'Database error' };
      mockSupabaseResponse.data = null;
      
      mockSupabase.from().insert().select().single.mockResolvedValue(mockSupabaseResponse);

      const result = await auditService.logAction({
        user: { id: 'test' },
        actionType: 'TEST_ACTION',
        resourceType: 'test',
        resourceId: 'test-123'
      });

      expect(result).toBeNull();
    });
  });

  describe('logCreateIntimacao', () => {
    test('deve logar criação de intimação com dados corretos', async () => {
      const mockUser = {
        id: 'user-123',
        nome: 'Maria Santos',
        email: 'maria@delegacia.gov.br'
      };

      const mockIntimacao = {
        intimacaoId: 'intimacao-456',
        nomeIntimado: 'João Intimado',
        documento: '123.456.789-00',
        numeroProcesso: 'PROC-2024-001',
        tipoIntimacao: 'Oitiva',
        delegaciaId: 'delegacia-789'
      };

      await auditService.logCreateIntimacao(mockUser, mockIntimacao);

      const insertCall = mockSupabase.from().insert.mock.calls[0][0][0];
      
      expect(insertCall.action_type).toBe('CREATE_INTIMACAO');
      expect(insertCall.resource_type).toBe('intimacao');
      expect(insertCall.resource_id).toBe('intimacao-456');
      expect(insertCall.details).toMatchObject({
        nomeIntimado: 'João Intimado',
        documento: '123.456.789-00',
        numeroProcesso: 'PROC-2024-001',
        tipoIntimacao: 'Oitiva',
        delegaciaId: 'delegacia-789'
      });
    });
  });

  describe('logCancelIntimacao', () => {
    test('deve logar cancelamento com motivo', async () => {
      const mockUser = { id: 'user-123', nome: 'Pedro Costa' };
      
      await auditService.logCancelIntimacao(mockUser, 'intimacao-789', 'Cancelado pelo usuário');

      const insertCall = mockSupabase.from().insert.mock.calls[0][0][0];
      
      expect(insertCall.action_type).toBe('CANCEL_INTIMACAO');
      expect(insertCall.resource_type).toBe('intimacao');
      expect(insertCall.resource_id).toBe('intimacao-789');
      expect(insertCall.details.motivo).toBe('Cancelado pelo usuário');
      expect(insertCall.details.timestamp).toBeDefined();
    });
  });

  describe('logAcceptTerms', () => {
    test('deve logar aceite de termos', async () => {
      const mockUser = {
        userId: 'user-456',
        nome: 'Ana Silva',
        email: 'ana@delegacia.gov.br'
      };

      await auditService.logAcceptTerms(mockUser);

      const insertCall = mockSupabase.from().insert.mock.calls[0][0][0];
      
      expect(insertCall.action_type).toBe('ACCEPT_TERMS');
      expect(insertCall.resource_type).toBe('user_terms');
      expect(insertCall.resource_id).toBe('user-456');
      expect(insertCall.details.terms_version).toBe('1.0');
      expect(insertCall.details.timestamp).toBeDefined();
    });
  });

  describe('getLogs', () => {
    test('deve buscar logs com filtros', async () => {
      const mockLogs = [
        { id: '1', action_type: 'CREATE_INTIMACAO', created_at: '2024-01-01' },
        { id: '2', action_type: 'CANCEL_INTIMACAO', created_at: '2024-01-02' }
      ];

      // Mock para o método select
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      mockQuery.eq.mockResolvedValue({ data: mockLogs, error: null });
      
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await auditService.getLogs({
        userId: 'user-123',
        actionType: 'CREATE_INTIMACAO',
        limit: 10
      });

      expect(result).toEqual(mockLogs);
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockQuery.range).toHaveBeenCalledWith(0, 9);
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    test('deve retornar array vazio em caso de erro', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      };
      mockQuery.range.mockResolvedValue({ data: null, error: { message: 'Error' } });
      
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await auditService.getLogs();

      expect(result).toEqual([]);
    });
  });
});

-- 🔍 SCRIPT PARA VERIFICAR RLS NO SUPABASE
-- Execute este script no SQL Editor do Supabase para verificar as políticas RLS

-- 1. VERIFICAR SE RLS ESTÁ HABILITADO NAS TABELAS PRINCIPAIS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls as has_rls_policies
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('intimacoes', 'usuarios', 'delegacias', 'estados', 'audit_logs', 'lgpd_requests')
ORDER BY tablename;

-- 2. VERIFICAR POLÍTICAS RLS EXISTENTES
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. VERIFICAR PERMISSÕES DE USUÁRIOS
SELECT 
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND table_name IN ('intimacoes', 'usuarios', 'delegacias', 'estados', 'audit_logs', 'lgpd_requests')
ORDER BY table_name, privilege_type;

-- 4. VERIFICAR FUNÇÕES E TRIGGERS
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%intimacao%' OR routine_name LIKE '%audit%';

-- 5. VERIFICAR ÍNDICES (IMPORTANTE PARA PERFORMANCE)
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('intimacoes', 'usuarios', 'delegacias', 'estados', 'audit_logs', 'lgpd_requests')
ORDER BY tablename, indexname;

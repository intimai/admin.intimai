-- 🚀 SCRIPT CONSOLIDADO CORRIGIDO: PREPARAÇÃO DE AMBIENTE E TEMPLATES DE EMAIL
-- Copie e cole este script no SQL Editor do seu projeto Supabase

--------------------------------------------------------------------------------
-- 1. PREPARAR AMBIENTE DE TESTES (DOMÍNIO E DELEGACIA)
--------------------------------------------------------------------------------

-- Adicionar domínio intimai.app na tabela estados_dominios
-- Nota: A coluna correta é 'estado' e não 'nome'.
INSERT INTO public.estados_dominios (estado, sigla, dominio)
VALUES ('Teste Unificado', 'TU', 'intimai.app')
ON CONFLICT (dominio) DO UPDATE SET estado = EXCLUDED.estado, sigla = EXCLUDED.sigla;

-- Adicionar uma delegacia de teste vinculada a este domínio
INSERT INTO public.delegacias (nome, endereco, cidadeEstado, delegadoResponsavel, "estadoId")
SELECT 
    'Delegacia de Testes IntimAI', 
    'Rua Digital, 123', 
    'Nuvem/BR', 
    'Delegado Virtual',
    "estadoId"
FROM public.estados_dominios 
WHERE dominio = 'intimai.app'
LIMIT 1;

--------------------------------------------------------------------------------
-- 2. CONFIGURAR TEMPLATE DE CONFIRMAÇÃO DE CADASTRO
--------------------------------------------------------------------------------

INSERT INTO auth.email_templates (template_name, subject, content) 
VALUES (
    'confirm_signup',
    'Confirme sua conta no IntimAI - Sistema de Gestão de Intimações',
    '
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Cadastro - IntimAI</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f8fafc; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
        .logo { width: 80px; height: 80px; margin: 0 auto 20px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #667eea; }
        .logo img { width: 60px; height: 60px; object-fit: contain; }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 10px; background: linear-gradient(45deg, #ffffff, #e0e7ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .header p { font-size: 16px; opacity: 0.9; font-weight: 300; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 20px; }
        .message { font-size: 16px; color: #4a5568; margin-bottom: 30px; line-height: 1.7; }
        .cta-container { text-align: center; margin: 40px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.4); }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px 0 rgba(102, 126, 234, 0.6); }
        .footer { background: #1a1a1a; color: #9ca3af; padding: 30px; text-align: center; }
        .footer .logo-text { font-size: 20px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #e5e7eb, transparent); margin: 30px 0; }
        @media (max-width: 600px) { .email-container { margin: 0; border-radius: 0; } .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } .cta-button { padding: 14px 28px; font-size: 15px; } }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
                <img src="https://i.postimg.cc/ncksr6Lm/logo.png" alt="IntimAI Logo" onerror="this.style.display=''none''; this.nextElementSibling.style.display=''block'';">
                <span style="display: none;">IntimAI</span>
            </div>
            <h1>Confirmação de Cadastro</h1>
            <p>Sistema de Gestão de Intimações para Policiais Civis</p>
        </div>
        <div class="content">
            <div class="greeting">Olá, {{ .Email }}! 👋</div>
            <div class="message">
                <p>Seja muito bem-vindo(a) ao <strong>IntimAI</strong>! 🎉</p>
                <p>Estamos felizes em tê-lo(a) conosco nesta jornada que vai revolucionar a forma como você gerencia intimações e agendamentos.</p>
            </div>
            <div class="cta-container">
                <a href="{{ .ConfirmationURL }}" class="cta-button">🚀 Confirmar Minha Conta</a>
            </div>
        </div>
        <div class="footer">
            <div class="logo-text">IntimAI</div>
            <p>© 2025 IntimAI - Sistema de Gestão de Intimações</p>
            <div class="powered-by">Powered by Aurios AI</div>
        </div>
    </div>
</body>
</html>
    '
) ON CONFLICT (template_name) 
DO UPDATE SET 
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    updated_at = NOW();

--------------------------------------------------------------------------------
-- 3. CONFIGURAR TEMPLATE DE RECUPERAÇÃO DE SENHA
--------------------------------------------------------------------------------

INSERT INTO auth.email_templates (template_name, subject, content) 
VALUES (
    'reset_password',
    'Recuperação de Senha - IntimAI',
    '
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de Senha - IntimAI</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f8fafc; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
        .logo { width: 80px; height: 80px; margin: 0 auto 20px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #667eea; }
        .logo img { width: 60px; height: 60px; object-fit: contain; }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 10px; background: linear-gradient(45deg, #ffffff, #e0e7ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .header p { font-size: 16px; opacity: 0.9; font-weight: 300; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 20px; }
        .message { font-size: 16px; color: #4a5568; margin-bottom: 30px; line-height: 1.7; }
        .cta-container { text-align: center; margin: 40px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.4); }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px 0 rgba(102, 126, 234, 0.6); }
        .footer { background: #1a1a1a; color: #9ca3af; padding: 30px; text-align: center; }
        .footer .logo-text { font-size: 20px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #e5e7eb, transparent); margin: 30px 0; }
        @media (max-width: 600px) { .email-container { margin: 0; border-radius: 0; } .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } .cta-button { padding: 14px 28px; font-size: 15px; } }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
                <img src="https://i.postimg.cc/ncksr6Lm/logo.png" alt="IntimAI Logo" onerror="this.style.display=''none''; this.nextElementSibling.style.display=''block'';">
                <span style="display: none;">IntimAI</span>
            </div>
            <h1>Recuperação de Senha</h1>
            <p>Sistema de Gestão de Intimações</p>
        </div>
        <div class="content">
            <div class="greeting">Olá, {{ .Email }}! 🔐</div>
            <div class="message">
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>IntimAI</strong>.</p>
                <p>Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha segura:</p>
            </div>
            <div class="cta-container">
                <a href="{{ .ConfirmationURL }}" class="cta-button">🔑 Redefinir Minha Senha</a>
            </div>
        </div>
        <div class="footer">
            <div class="logo-text">IntimAI</div>
            <p>© 2025 IntimAI - Sistema de Gestão de Intimações</p>
            <div class="powered-by">Powered by Aurios AI</div>
        </div>
    </div>
</body>
</html>
    '
) ON CONFLICT (template_name) 
DO UPDATE SET 
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    updated_at = NOW();

--------------------------------------------------------------------------------
-- 4. VERIFICAR CONFIGURAÇÕES FINAIS
--------------------------------------------------------------------------------

SELECT 
    template_name,
    subject,
    LENGTH(content) as content_length,
    created_at,
    updated_at
FROM auth.email_templates 
WHERE template_name IN ('confirm_signup', 'reset_password')
ORDER BY template_name;

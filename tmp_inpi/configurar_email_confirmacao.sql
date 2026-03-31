-- 📧 CONFIGURAÇÃO DE EMAIL DE CONFIRMAÇÃO - SUPABASE
-- Execute este script no SQL Editor do Supabase para configurar templates de email

-- 1. VERIFICAR CONFIGURAÇÕES ATUAIS DE AUTH
SELECT 
    key,
    value
FROM auth.config 
WHERE key IN ('SITE_URL', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS');

-- 2. CONFIGURAR SMTP (se não estiver configurado)
-- IMPORTANTE: Configure estas variáveis no Dashboard > Settings > Auth > SMTP Settings

-- 3. VERIFICAR TEMPLATES DE EMAIL
SELECT 
    template_name,
    subject,
    content
FROM auth.email_templates 
WHERE template_name IN ('confirm_signup', 'reset_password', 'magic_link');

-- 4. CRIAR/ATUALIZAR TEMPLATE DE CONFIRMAÇÃO DE CADASTRO
INSERT INTO auth.email_templates (template_name, subject, content) 
VALUES (
    'confirm_signup',
    'Confirme sua conta no IntimAI - Sistema de Gestão de Intimações',
    '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Cadastro - IntimAI</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">IntimAI</div>
            <h1>Confirmação de Cadastro</h1>
            <p>Sistema de Gestão de Intimações para Policiais Civis</p>
        </div>
        
        <div class="content">
            <h2>Olá, {{ .Email }}!</h2>
            
            <p>Seja bem-vindo(a) ao <strong>IntimAI</strong>, a plataforma que revoluciona a gestão de intimações para policiais civis.</p>
            
            <p>Para ativar sua conta e começar a usar o sistema, clique no botão abaixo:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Confirmar Conta</a>
            </div>
            
            <p><strong>O que você pode fazer no IntimAI:</strong></p>
            <ul>
                <li>✅ Criar e gerenciar intimações</li>
                <li>✅ Agendar oitivas automaticamente</li>
                <li>✅ Enviar intimações via WhatsApp com IA</li>
                <li>✅ Acompanhar status em tempo real</li>
                <li>✅ Gerar relatórios e estatísticas</li>
            </ul>
            
            <p><strong>Próximos passos:</strong></p>
            <ol>
                <li>Clique no botão acima para confirmar sua conta</li>
                <li>Faça login com suas credenciais</li>
                <li>Explore o sistema e suas funcionalidades</li>
                <li>Comece a criar suas primeiras intimações</li>
            </ol>
            
            <p><strong>Suporte:</strong> Se tiver dúvidas, entre em contato conosco através do sistema de suporte.</p>
        </div>
        
        <div class="footer">
            <p>© 2025 IntimAI - Sistema de Gestão de Intimações</p>
            <p>Powered by Aurios AI</p>
            <p>Este é um email automático, não responda a esta mensagem.</p>
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

-- 5. CRIAR/ATUALIZAR TEMPLATE DE RECUPERAÇÃO DE SENHA
INSERT INTO auth.email_templates (template_name, subject, content) 
VALUES (
    'reset_password',
    'Recuperação de Senha - IntimAI',
    '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de Senha - IntimAI</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">IntimAI</div>
            <h1>Recuperação de Senha</h1>
        </div>
        
        <div class="content">
            <h2>Olá, {{ .Email }}!</h2>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>IntimAI</strong>.</p>
            
            <p>Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Redefinir Senha</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                    <li>Este link expira em 24 horas</li>
                    <li>Se você não solicitou esta recuperação, ignore este email</li>
                    <li>Nunca compartilhe este link com outras pessoas</li>
                </ul>
            </div>
            
            <p><strong>Dicas de segurança:</strong></p>
            <ul>
                <li>Use uma senha forte com pelo menos 8 caracteres</li>
                <li>Combine letras maiúsculas, minúsculas, números e símbolos</li>
                <li>Não use informações pessoais na senha</li>
                <li>Altere sua senha regularmente</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>© 2025 IntimAI - Sistema de Gestão de Intimações</p>
            <p>Powered by Aurios AI</p>
            <p>Este é um email automático, não responda a esta mensagem.</p>
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

-- 6. VERIFICAR CONFIGURAÇÕES FINAIS
SELECT 
    template_name,
    subject,
    LENGTH(content) as content_length,
    created_at,
    updated_at
FROM auth.email_templates 
WHERE template_name IN ('confirm_signup', 'reset_password')
ORDER BY template_name;

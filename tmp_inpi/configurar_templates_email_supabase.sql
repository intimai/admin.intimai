-- 📧 CONFIGURAÇÃO DE TEMPLATES DE EMAIL - SUPABASE
-- Execute este script no SQL Editor do Supabase para configurar os templates HTML personalizados

-- 1. VERIFICAR CONFIGURAÇÕES ATUAIS DE AUTH
SELECT 
    key,
    value
FROM auth.config 
WHERE key IN ('SITE_URL', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS');

-- 2. CONFIGURAR TEMPLATE DE CONFIRMAÇÃO DE CADASTRO
-- IMPORTANTE: Substitua 'https://seu-dominio.com' pela URL real do seu projeto
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
        .features { background: #f8fafc; border-radius: 8px; padding: 30px; margin: 30px 0; }
        .features h3 { font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 20px; text-align: center; }
        .features-list { list-style: none; padding: 0; }
        .features-list li { padding: 8px 0; color: #4a5568; font-size: 15px; display: flex; align-items: center; }
        .features-list li::before { content: "✅"; margin-right: 12px; font-size: 16px; }
        .steps { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 25px; margin: 30px 0; }
        .steps h3 { font-size: 18px; font-weight: 600; color: #9a3412; margin-bottom: 15px; }
        .steps ol { padding-left: 20px; }
        .steps li { margin: 8px 0; color: #7c2d12; font-size: 15px; }
        .security-notice { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0; }
        .security-notice h4 { color: #92400e; font-size: 16px; font-weight: 600; margin-bottom: 10px; }
        .security-notice p { color: #78350f; font-size: 14px; margin: 5px 0; }
        .footer { background: #1a1a1a; color: #9ca3af; padding: 30px; text-align: center; }
        .footer .logo-text { font-size: 20px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .footer p { font-size: 14px; margin: 5px 0; }
        .footer .powered-by { color: #6b7280; font-size: 12px; margin-top: 15px; }
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
            <div class="features">
                <h3>O que você pode fazer no IntimAI:</h3>
                <ul class="features-list">
                    <li>Criar e gerenciar intimações de forma inteligente</li>
                    <li>Agendar oitivas automaticamente com IA</li>
                    <li>Enviar intimações via WhatsApp com personalização</li>
                    <li>Acompanhar status em tempo real</li>
                    <li>Gerar relatórios e estatísticas detalhadas</li>
                    <li>Interface intuitiva e responsiva</li>
                </ul>
            </div>
            <div class="steps">
                <h3>📋 Próximos Passos:</h3>
                <ol>
                    <li><strong>Clique no botão acima</strong> para confirmar sua conta</li>
                    <li><strong>Faça login</strong> com suas credenciais</li>
                    <li><strong>Explore o sistema</strong> e suas funcionalidades</li>
                    <li><strong>Comece a criar</strong> suas primeiras intimações</li>
                </ol>
            </div>
            <div class="security-notice">
                <h4>🔒 Segurança e Privacidade</h4>
                <p>• Seus dados estão protegidos com criptografia de ponta</p>
                <p>• O sistema está em conformidade com a LGPD</p>
                <p>• Acesso restrito apenas a policiais civis autorizados</p>
            </div>
            <div class="divider"></div>
            <div class="message">
                <p><strong>💬 Suporte:</strong> Se tiver dúvidas ou precisar de ajuda, utilize o sistema de suporte integrado ou entre em contato conosco.</p>
                <p><strong>⏰ Prazo:</strong> Este link de confirmação expira em 24 horas por motivos de segurança.</p>
            </div>
        </div>
        <div class="footer">
            <div class="logo-text">IntimAI</div>
            <p>© 2025 IntimAI - Sistema de Gestão de Intimações</p>
            <p>Desenvolvido para Policiais Civis</p>
            <div class="powered-by">Powered by Aurios AI</div>
            <p style="margin-top: 15px; font-size: 12px; color: #6b7280;">Este é um email automático. Por favor, não responda a esta mensagem.</p>
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

-- 3. CONFIGURAR TEMPLATE DE RECUPERAÇÃO DE SENHA
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
        .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 25px; margin: 30px 0; }
        .warning h3 { color: #92400e; font-size: 18px; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center; }
        .warning h3::before { content: "⚠️"; margin-right: 10px; font-size: 20px; }
        .warning ul { list-style: none; padding: 0; }
        .warning li { color: #78350f; font-size: 15px; margin: 8px 0; padding-left: 20px; position: relative; }
        .warning li::before { content: "•"; color: #f59e0b; font-weight: bold; position: absolute; left: 0; }
        .security-tips { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 25px; margin: 30px 0; }
        .security-tips h3 { color: #0c4a6e; font-size: 18px; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center; }
        .security-tips h3::before { content: "🔒"; margin-right: 10px; font-size: 18px; }
        .security-tips ul { list-style: none; padding: 0; }
        .security-tips li { color: #075985; font-size: 15px; margin: 8px 0; padding-left: 20px; position: relative; }
        .security-tips li::before { content: "✓"; color: #0ea5e9; font-weight: bold; position: absolute; left: 0; }
        .footer { background: #1a1a1a; color: #9ca3af; padding: 30px; text-align: center; }
        .footer .logo-text { font-size: 20px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .footer p { font-size: 14px; margin: 5px 0; }
        .footer .powered-by { color: #6b7280; font-size: 12px; margin-top: 15px; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #e5e7eb, transparent); margin: 30px 0; }
        .expiry-notice { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .expiry-notice p { color: #dc2626; font-weight: 600; font-size: 15px; }
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
            <div class="expiry-notice">
                <p>⏰ Este link expira em 24 horas por motivos de segurança</p>
            </div>
            <div class="warning">
                <h3>Importante - Segurança</h3>
                <ul>
                    <li>Se você <strong>NÃO</strong> solicitou esta recuperação, ignore este email</li>
                    <li>Nunca compartilhe este link com outras pessoas</li>
                    <li>O link é único e só pode ser usado uma vez</li>
                    <li>Após 24 horas, você precisará solicitar um novo link</li>
                </ul>
            </div>
            <div class="security-tips">
                <h3>Dicas para uma Senha Segura</h3>
                <ul>
                    <li>Use pelo menos 8 caracteres</li>
                    <li>Combine letras maiúsculas e minúsculas</li>
                    <li>Inclua números e símbolos especiais</li>
                    <li>Evite informações pessoais óbvias</li>
                    <li>Não reutilize senhas de outros serviços</li>
                    <li>Considere usar um gerenciador de senhas</li>
                </ul>
            </div>
            <div class="divider"></div>
            <div class="message">
                <p><strong>💬 Precisa de ajuda?</strong> Se tiver dúvidas ou problemas, utilize o sistema de suporte integrado no IntimAI.</p>
                <p><strong>🔄 Não conseguiu acessar?</strong> Se o link não funcionar, solicite uma nova recuperação de senha.</p>
            </div>
        </div>
        <div class="footer">
            <div class="logo-text">IntimAI</div>
            <p>© 2025 IntimAI - Sistema de Gestão de Intimações</p>
            <p>Desenvolvido para Policiais Civis</p>
            <div class="powered-by">Powered by Aurios AI</div>
            <p style="margin-top: 15px; font-size: 12px; color: #6b7280;">Este é um email automático. Por favor, não responda a esta mensagem.</p>
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

-- 4. VERIFICAR CONFIGURAÇÕES FINAIS
SELECT 
    template_name,
    subject,
    LENGTH(content) as content_length,
    created_at,
    updated_at
FROM auth.email_templates 
WHERE template_name IN ('confirm_signup', 'reset_password')
ORDER BY template_name;

-- 5. VERIFICAR CONFIGURAÇÕES DE SMTP (se necessário)
-- IMPORTANTE: Configure estas variáveis no Dashboard > Settings > Auth > SMTP Settings
-- SITE_URL: https://seu-dominio.com
-- SMTP_HOST: seu-servidor-smtp.com
-- SMTP_PORT: 587
-- SMTP_USER: seu-email@dominio.com
-- SMTP_PASS: sua-senha-smtp

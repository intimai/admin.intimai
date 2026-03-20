// Supabase Edge Function: invite-colaborador
// Cria o usuário no auth.users via convite por email e salva na tabela admin_colaboradores

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Validar que o chamador é um super admin autenticado
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Não autorizado' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const supabaseCallerClient = createClient(
            Deno.env.get('SUPABASE_URL'),
            Deno.env.get('SUPABASE_ANON_KEY'),
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user: callerUser }, error: callerError } = await supabaseCallerClient.auth.getUser();
        if (callerError || !callerUser) {
            return new Response(JSON.stringify({ error: 'Sessão inválida' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Verificar se o chamador é super admin
        const { data: callerAdmin } = await supabaseCallerClient
            .from('usuarios')
            .select('is_admin')
            .eq('email', callerUser.email)
            .maybeSingle();

        if (callerAdmin?.is_admin !== true) {
            return new Response(JSON.stringify({ error: 'Permissão negada' }), {
                status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 2. Ler os dados do novo colaborador
        const { nome, email, role, admin_menus } = await req.json();
        if (!nome || !email) {
            return new Response(JSON.stringify({ error: 'nome e email são obrigatórios' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 3. Cliente com service role
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL'),
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        );

        // 4. Enviar convite via auth.admin.inviteUserByEmail
        // O redirectTo DEVE estar na lista de "Allow Redirect URLs" no painel do Supabase
        const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: 'https://admin.intimai.app',
            data: { nome },
        });

        if (inviteError && !inviteError.message?.includes('already been registered')) {
            return new Response(JSON.stringify({ error: inviteError.message }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 5. Inserir/Atualizar na tabela admin_colaboradores
        const { error: dbError } = await supabaseAdmin
            .from('admin_colaboradores')
            .upsert({
                nome,
                email,
                role: role || 'colaborador',
                admin_menus: admin_menus?.length ? admin_menus : null,
                ativo: true,
            }, { onConflict: 'email' });

        if (dbError) {
            return new Response(JSON.stringify({ error: dbError.message }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

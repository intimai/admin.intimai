import { createClient } from '@supabase/supabase-js';

// Cria o Supabase client sob demanda (mesmo padrão do send-whatsapp-lead.js)
function getSupabase() {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('VITE_SUPABASE_URL e service key não configurados no .env');
    return createClient(url, key);
}

// Busca token Meta mestre do admin_settings
async function getMetaToken() {
    const supabase = getSupabase();
    const { data: config, error } = await supabase
        .from('admin_settings')
        .select('meta_api_token')
        .eq('key', 'config_meta')
        .maybeSingle();
    
    if (error) throw new Error('Erro ao buscar token Meta no banco: ' + error.message);
    if (!config || !config.meta_api_token) {
        throw new Error('Token Meta não configurado. Vá em Conexões → Configurar Meta API.');
    }

    return config.meta_api_token;
}

// Monta o header padrão para chamadas Meta
function metaHeaders(token) {
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

const META_BASE = 'https://graph.facebook.com/v19.0';

// ─── 1. Listar todos os números do WABA ──────────────────────────────────────
export async function listPhoneNumbers(req, res) {
    try {
        const token = await getMetaToken();
        const supabase = getSupabase();

        // 1. Busca todos os WABAs cadastrados
        const { data: wabas, error: wabasError } = await supabase.from('meta_wabas').select('waba_id, name');
        if (wabasError) throw new Error('Erro ao buscar WABAs locais: ' + wabasError.message);

        let allPhones = [];

        // 2. Itera sobre cada WABA consultando a API da Meta
        for (const waba of (wabas || [])) {
            const resp = await fetch(
                `${META_BASE}/${waba.waba_id}/phone_numbers?fields=id,display_phone_number,verified_name,name_status,code_verification_status,quality_rating,status`,
                { headers: metaHeaders(token) }
            );
            const metaData = await resp.json();
            if (resp.ok && metaData.data) {
                // Injeta o waba_id para rastreabilidade
                const phonesEnriched = metaData.data.map(p => ({ ...p, waba_id: waba.waba_id, waba_name: waba.name }));
                allPhones = allPhones.concat(phonesEnriched);
            } else {
                console.error(`[Meta DB] WABA ${waba.name} indisponível ou erro da Meta:`, metaData);
            }
        }

        // 3. Busca status locais (custom_name, OTP, etc)
        const { data: localStatus, error: localError } = await supabase
            .from('meta_phones_status')
            .select('*');

        const statusMap = (localStatus || []).reduce((acc, curr) => {
            acc[curr.phone_id] = curr;
            return acc;
        }, {});

        const result = allPhones.map(phone => ({
            ...phone,
            local_otp_sent: statusMap[phone.id]?.otp_sent || false,
            local_otp_method: statusMap[phone.id]?.last_method || null,
            local_otp_updated_at: statusMap[phone.id]?.updated_at || null,
            custom_name: statusMap[phone.id]?.custom_name || null
        }));

        return res.json({ data: result });
    } catch (err) {
        console.error('[Meta] listPhoneNumbers:', err.message);
        return res.status(500).json({ error: err.message });
    }
}

// ─── 2. Cadastrar novo número no WABA e vincular à delegacia ─────────────────
export async function addPhoneNumber(req, res) {
    const { phone_number, verified_name, delegacia_id, custom_name, type, waba_id } = req.body;

    if (!phone_number || !verified_name || !waba_id) {
        return res.status(400).json({ error: 'phone_number, verified_name e waba_id são obrigatórios.' });
    }

    try {
        const token = await getMetaToken();
        const supabase = getSupabase();

        const resp = await fetch(`${META_BASE}/${waba_id}/phone_numbers`, {
            method: 'POST',
            headers: metaHeaders(token),
            body: JSON.stringify({
                phone_number: phone_number.replace(/\D/g, ''),
                verified_name,
                type: 'STANDARD_FREE_TIER'
            })
        });

        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error?.message || JSON.stringify(data));

        const phoneId = data.id;

        // Persiste as informações básicas na Fonte da Verdade local associada ao WABA pai
        await supabase.from('meta_phones_status').upsert({ 
            phone_id: phoneId, 
            waba_id: waba_id,
            custom_name: type === 'INTERNAL' ? custom_name : null,
            updated_at: new Date().toISOString()
        });

        // Se for para criar vínculo duro com a delegacia, atualiza
        if (type === 'DELEGACIA' && delegacia_id) {
            const { error: dbError } = await supabase
                .from('delegacias')
                .update({ whatsappPhoneNumberId: phoneId })
                .eq('delegaciaId', delegacia_id);
            if (dbError) throw new Error('Número criado na Meta, mas erro ao salvar delegacia: ' + dbError.message);
        }

        return res.json({ success: true, phone_id: phoneId, meta_response: data });
    } catch (err) {
        console.error('[Meta] addPhoneNumber:', err.message);
        return res.status(500).json({ error: err.message });
    }
}



// ─── 3. Consultar status de um número específico ──────────────────────────────
export async function getPhoneStatus(req, res) {
    const { phone_id } = req.params;
    if (!phone_id) return res.status(400).json({ error: 'phone_id é obrigatório.' });

    try {
        const token = await getMetaToken();
        const resp = await fetch(
            `${META_BASE}/${phone_id}?fields=id,display_phone_number,verified_name,name_status,code_verification_status,quality_rating,platform_type,status`,
            { headers: metaHeaders(token) }
        );
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error?.message || JSON.stringify(data));
        return res.json(data);
    } catch (err) {
        console.error('[Meta] getPhoneStatus:', err.message);
        return res.status(500).json({ error: err.message });
    }
}

// ─── 4. Solicitar código OTP (SMS ou voz) ────────────────────────────────────
export async function requestVerificationCode(req, res) {
    const { phone_id, code_method } = req.body;
    if (!phone_id) return res.status(400).json({ error: 'phone_id é obrigatório.' });

    try {
        const token = await getMetaToken();
        const supabase = getSupabase();

        // Se o método for MANUAL, apenas atualizamos o banco local
        if (code_method !== 'MANUAL') {
            const resp = await fetch(`${META_BASE}/${phone_id}/request_code`, {
                method: 'POST',
                headers: metaHeaders(token),
                body: JSON.stringify({ code_method: code_method || 'SMS', language: 'pt_BR' })
            });
            const data = await resp.json();
            if (!resp.ok) {
                console.error('[Meta] Erro Detalhado (request_code):', JSON.stringify(data, null, 2));
                throw new Error(data.error?.message || 'Request code error');
            }
        }

        // Atualiza status persistente no banco local
        await supabase
            .from('meta_phones_status')
            .upsert({ 
                phone_id, 
                otp_sent: true, 
                last_method: code_method || 'SMS',
                updated_at: new Date().toISOString()
            }, { onConflict: 'phone_id' }); // IMPORTANTE: adicionar onConflict se não estiver

        return res.json({ success: true });
    } catch (err) {
        console.error('[Meta] requestVerificationCode:', err.message);
        return res.status(500).json({ error: err.message });
    }
}

// ─── 5. Verificar código OTP inserido pelo admin ──────────────────────────────
export async function verifyCode(req, res) {
    const { phone_id, code } = req.body;
    if (!phone_id || !code) return res.status(400).json({ error: 'phone_id e code são obrigatórios.' });

    try {
        const token = await getMetaToken();
        const supabase = getSupabase();
        const resp = await fetch(`${META_BASE}/${phone_id}/verify_code`, {
            method: 'POST',
            headers: metaHeaders(token),
            body: JSON.stringify({ code })
        });
        const data = await resp.json();
        if (!resp.ok) {
            console.error('[Meta] Erro Detalhado (verify_code):', JSON.stringify(data, null, 2));
            throw new Error(data.error?.message || 'Verify code error');
        }

        // Resetar status persistente após sucesso
        await supabase
            .from('meta_phones_status')
            .update({ otp_sent: false })
            .eq('phone_id', phone_id);

        return res.json({ success: true });
    } catch (err) {
        console.error('[Meta] verifyCode:', err.message);
        return res.status(500).json({ error: err.message });
    }
}

// ─── 5.1 Resetar status OTP manualmente ──────────────────────────────────────
export async function resetOtpStatus(req, res) {
    const { phone_id } = req.body;
    if (!phone_id) return res.status(400).json({ error: 'phone_id é obrigatório.' });

    try {
        const supabase = getSupabase();
        await supabase
            .from('meta_phones_status')
            .update({ otp_sent: false })
            .eq('phone_id', phone_id);

        return res.json({ success: true });
    } catch (err) {
        console.error('[Meta] resetOtpStatus:', err.message);
        return res.status(500).json({ error: err.message });
    }
}

// ─── 5.2 Desvincular Delegacia ou Nome Interno ───────────────────────────────
export async function unlinkPhoneNumber(req, res) {
    const { phone_id } = req.body;
    if (!phone_id) return res.status(400).json({ error: 'phone_id é obrigatório.' });

    try {
        const supabase = getSupabase();
        
        // Remove de delegacias (se houver)
        const { error: delError } = await supabase
            .from('delegacias')
            .update({ whatsappPhoneNumberId: null })
            .eq('whatsappPhoneNumberId', phone_id);
            
        if (delError) throw new Error('Erro ao desvincular de delegacias: ' + delError.message);

        // Remove custom_name de meta_phones_status localmente
        const { error: statError } = await supabase
            .from('meta_phones_status')
            .update({ custom_name: null })
            .eq('phone_id', phone_id);
            
        return res.json({ success: true });
    } catch(err) {
        console.error('[Meta] unlinkPhoneNumber:', err.message);
        return res.status(500).json({ error: err.message });
    }
}

// ─── 6. Atualizar Nome de Exibição (verified_name) ───────────────────────────
export async function updatePhoneName(req, res) {
    const { phone_id } = req.params;
    const { verified_name } = req.body;
    
    if (!verified_name) return res.status(400).json({ error: 'Nenhum nome enviado.' });

    try {
        const token = await getMetaToken();
        const supabase = getSupabase();
        
        const resp = await fetch(`${META_BASE}/${phone_id}?verified_name=${encodeURIComponent(verified_name)}`, {
            method: 'POST',
            headers: metaHeaders(token)
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error?.message || JSON.stringify(data));
        return res.json({ success: true, meta_response: data });
    } catch (err) {
        console.error('[Meta] updatePhoneName:', err.message);
        return res.status(500).json({ error: err.message });
    }
}

// ─── 7. Buscar Perfil de Negócio (About, Endereço, etc) ───────────────────────
export async function getBusinessProfile(req, res) {
    const { phone_id } = req.params;
    try {
        const token = await getMetaToken();
        const resp = await fetch(`${META_BASE}/${phone_id}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical`, {
            headers: metaHeaders(token)
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error?.message || JSON.stringify(data));
        return res.json(data);
    } catch (err) {
        console.error('[Meta] getBusinessProfile:', err.message);
        return res.status(500).json({ error: err.message });
    }
}

// ─── 8. Atualizar Perfil de Negócio ──────────────────────────────────────────
export async function updateBusinessProfile(req, res) {
    const { phone_id } = req.params;
    const payload = req.body; // payload esperado: { about, address, description, email, websites, vertical }
    try {
        const token = await getMetaToken();
        const resp = await fetch(`${META_BASE}/${phone_id}/whatsapp_business_profile`, {
            method: 'POST',
            headers: metaHeaders(token),
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                ...payload
            })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error?.message || JSON.stringify(data));
        return res.json({ success: true, data });
    } catch (err) {
        console.error('[Meta] updateBusinessProfile:', err.message);
        return res.status(500).json({ error: err.message });
    }
}

// ─── Rotas CRUD de WABA Múltiplos ──────────────────────────────────────────

export async function listWabas(req, res) {
    try {
        const supabase = getSupabase();
        const { data: wabas, error } = await supabase.from('meta_wabas').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        return res.json(wabas || []);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function createWaba(req, res) {
    const { waba_id, name } = req.body;
    if (!waba_id || !name) return res.status(400).json({ error: 'waba_id e name são obrigatórios' });
    
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase.from('meta_wabas').insert([{ waba_id, name }]).select().single();
        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

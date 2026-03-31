import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para normalizar o número de telefone
function normalizePhoneNumber(phone: string): string {
  // Remove caracteres não numéricos, exceto o '+' inicial
  let normalized = phone.replace(/[^0-9+]/g, '');

  // Remove o código do país se presente (ex: +55)
  if (normalized.startsWith('+55')) {
    normalized = normalized.substring(3);
  }
  
  // Remove o '0' inicial de códigos de área, se houver
  if (normalized.length > 10 && normalized.startsWith('0')) {
      normalized = normalized.substring(1);
  }

  return normalized.replace(/\D/g, ''); // Garante que apenas dígitos permaneçam
}

// Função para gerar HMAC
async function generateHmac(data: string): Promise<string> {
  const hmacKey = Deno.env.get('HMAC_KEY');
  if (!hmacKey) {
    throw new Error('HMAC_KEY não configurada nas variáveis de ambiente.');
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(hmacKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  );

  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { telefone } = await req.json()

    if (!telefone) {
      return new Response(JSON.stringify({ error: 'O número de telefone é obrigatório.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const normalizedPhone = normalizePhoneNumber(telefone);
    const hmac = await generateHmac(normalizedPhone);

    return new Response(JSON.stringify({ telefone_normalizado: normalizedPhone, hmac }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
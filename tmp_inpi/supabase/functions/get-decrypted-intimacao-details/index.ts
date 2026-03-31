import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Função de descriptografia AES-256-GCM adaptada para Deno/Supabase
async function decrypt(encryptedText, key) {
  if (!key) {
    console.warn("Chave de criptografia não configurada.");
    return encryptedText;
  }

  try {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const keyData = encoder.encode(key.slice(0, 32));

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const combined = new Uint8Array(
      atob(encryptedText).split('').map(char => char.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      cryptoKey,
      encrypted
    );

    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Erro ao descriptografar:", error);
    // Em caso de erro (ex: texto não criptografado), retorna o texto original
    return encryptedText;
  }
}

serve(async (req) => {
  // Tratar requisição pre-flight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey' } });
  }

  try {
    const { intimacao_id } = await req.json();

    if (!intimacao_id) {
      return new Response(JSON.stringify({ error: 'intimacao_id é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Inicializar o cliente Supabase com as permissões de serviço
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Buscar a intimação pelo ID
    const { data: intimacao, error: fetchError } = await supabaseAdmin
      .from('intimacoes')
      .select('intimadoNome, documento')
      .eq('id', intimacao_id)
      .single();

    if (fetchError) throw fetchError;
    if (!intimacao) {
      return new Response(JSON.stringify({ error: 'Intimação não encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encryptionKey = Deno.env.get('ENCRYPTION_KEY');

    // Descriptografar os campos
    const decryptedNome = await decrypt(intimacao.intimadoNome, encryptionKey);
    const decryptedDocumento = await decrypt(intimacao.documento, encryptionKey);

    return new Response(
      JSON.stringify({
        intimadoNome: decryptedNome,
        documento: decryptedDocumento,
      }),
      {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
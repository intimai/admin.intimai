import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-control-allow-headers": "authorization, x-client-info, apikey, content-type"
};

// Função para normalizar o telefone (remove não-dígitos)
function normalizePhone(input: string): string {
  return String(input || "").replace(/\D/g, "");
}

// Função para gerar o HMAC (a "impressão digital" segura)
async function createHmac(data: string): Promise<string> {
  const hmacKey = Deno.env.get("HMAC_KEY");
  if (!hmacKey) {
    console.error("HMAC_KEY não configurada.");
    throw new Error("HMAC_KEY não configurada.");
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(hmacKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  // Converte o resultado para uma string hexadecimal
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Função para criptografar um campo
async function encryptField(text: string): Promise<string> {
    const key = Deno.env.get("ENCRYPTION_KEY");
    if (!key) {
        console.error("ENCRYPTION_KEY não configurada");
        return text;
    }
    try {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(key.slice(0, 32));
        const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["encrypt"]);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, encoder.encode(text));
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        return btoa(String.fromCharCode.apply(null, Array.from(combined)));
    } catch (error) {
        console.error("Erro ao criptografar:", error);
        return text;
    }
}


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const intimacaoData = await req.json();

    // Log para depuração: imprimir os dados recebidos
    console.log("Dados recebidos pela Edge Function:", JSON.stringify(intimacaoData, null, 2));

    // 1. Verificar duplicidade usando a Edge Function 'consulta_duplicada'
    const { data: duplicadaResponse, error: duplicadaError } = await supabaseClient.functions.invoke('consulta_duplicada', {
      body: {
        telefone: intimacaoData.telefone,
        status_para_verificar: ['pendente', 'ativa', 'entregue']
      },
    });

    if (duplicadaError) {
      console.error('Erro ao invocar a função de consulta de duplicados:', duplicadaError);
      throw new Error('Erro interno ao verificar duplicidade.');
    }

    // A resposta da função invocada é uma string, então precisamos fazer o parse.
    const duplicadaData = duplicadaResponse ? JSON.parse(duplicadaResponse) : null;

    if (duplicadaData?.existe_intimacao) {
      // Log removido para evitar poluir a saída em produção.
      return new Response(
        JSON.stringify({
          error: 'DUPLICATE_FOUND',
          message: `Já existe uma intimação para este telefone com o status "${duplicadaData.status_existente}".`,
          details: duplicadaData,
        }),
        { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Se não houver duplicata, prosseguir com a criação do HMAC para a inserção
    const telefoneNormalized = normalizePhone(intimacaoData.telefone);
    const telefoneHmac = await createHmac(telefoneNormalized);

    // 3. Criptografar os campos sensíveis
    const encryptedNome = await encryptField(intimacaoData.intimadoNome);
    const encryptedDocumento = await encryptField(intimacaoData.documento);
    const encryptedTelefone = await encryptField(intimacaoData.telefone);

    // 4. Montar o objeto final para o banco de dados
    const finalData = {
        intimadoNome: encryptedNome,
        documento: encryptedDocumento,
        telefone: encryptedTelefone,
        telefone_hmac: telefoneHmac,
        tipoProcedimento: intimacaoData.tipoProcedimento,
        numeroProcedimento: intimacaoData.numeroProcedimento,
        primeiraDisponibilidade: intimacaoData.primeiraDisponibilidade,
        motivo: intimacaoData.motivo,
        status: "pendente",
        userId: intimacaoData.userId,
        delegaciaId: intimacaoData.delegaciaId,
    };

    // 5. Inserir no banco de dados
    const { data, error } = await supabaseClient
        .from("intimacoes")
        .insert([finalData])
        .select();

    if (error) {
      console.error("Erro ao inserir intimação:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (e) {
    console.error("Erro inesperado:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
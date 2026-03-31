import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// Função de criptografia AES-256 (mesma da Edge Function principal)
function encrypt(text: string): string {
  const key = Deno.env.get("ENCRYPTION_KEY");
  if (!key) {
    console.error("❌ ENCRYPTION_KEY não configurada");
    return text;
  }
  
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const keyData = encoder.encode(key.slice(0, 32));
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      cryptoKey,
      data
    );
    
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("❌ Erro ao criptografar:", error);
    return text;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verificar se é uma chamada autorizada (apenas para admin)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("🔍 Iniciando criptografia de dados existentes...");

    // Buscar todas as intimações com dados sensíveis
    const { data: intimacoes, error: fetchError } = await supabase
      .from('intimacoes')
      .select('id, cpf, telefone, endereco, documento')
      .not('cpf', 'is', null);

    if (fetchError) {
      console.error("❌ Erro ao buscar intimações:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`🔍 Encontradas ${intimacoes?.length || 0} intimações para criptografar`);

    let successCount = 0;
    let errorCount = 0;

    // Criptografar cada intimação
    for (const intimacao of intimacoes || []) {
      try {
        const updateData: any = {};
        
        if (intimacao.cpf) updateData.cpf = encrypt(intimacao.cpf);
        if (intimacao.telefone) updateData.telefone = encrypt(intimacao.telefone);
        if (intimacao.endereco) updateData.endereco = encrypt(intimacao.endereco);
        if (intimacao.documento) updateData.documento = encrypt(intimacao.documento);

        const { error: updateError } = await supabase
          .from('intimacoes')
          .update(updateData)
          .eq('id', intimacao.id);

        if (updateError) {
          console.error(`❌ Erro ao criptografar intimação ${intimacao.id}:`, updateError);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Erro ao processar intimação ${intimacao.id}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ Criptografia concluída: ${successCount} sucessos, ${errorCount} erros`);

    return new Response(JSON.stringify({
      success: true,
      message: `Criptografia concluída: ${successCount} sucessos, ${errorCount} erros`,
      stats: {
        total: intimacoes?.length || 0,
        success: successCount,
        errors: errorCount
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("❌ Erro na função de criptografia:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

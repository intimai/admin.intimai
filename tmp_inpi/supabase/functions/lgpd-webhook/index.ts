import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Payload {
  data: any;
  user: any;
}

interface WebhookBody {
  webhookType: "LGPD";
  payload: Payload;
}

serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🔍 LGPD Webhook recebido:", req.method, req.url);
    const body: WebhookBody = await req.json();
    console.log("🔍 LGPD Body recebido:", JSON.stringify(body, null, 2));
    
    const { webhookType, payload } = body;
    
    // Verificar se é realmente LGPD
    if (webhookType !== 'LGPD') {
      console.log("❌ Tipo de webhook inválido para endpoint LGPD:", webhookType);
      return new Response(JSON.stringify({ error: "Invalid webhook type for LGPD endpoint" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log("🔍 Processando webhook LGPD público");
    
    // Obter URL do webhook LGPD
    const webhookUrl = Deno.env.get("WEBHOOK_LGPD_URL");
    
    if (!webhookUrl) {
      console.log("❌ WEBHOOK_LGPD_URL não configurada");
      return new Response(JSON.stringify({ error: "LGPD webhook URL not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log("🔍 Enviando para webhook LGPD:", webhookUrl);
    
    // Enviar para o webhook externo
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!webhookResponse.ok) {
      const errorBody = await webhookResponse.text();
      console.log("❌ Erro no webhook LGPD:", webhookResponse.status, errorBody);
      return new Response(JSON.stringify({ 
        error: "Failed to forward LGPD webhook",
        status: webhookResponse.status,
        details: errorBody
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log("✅ Webhook LGPD enviado com sucesso!");
    return new Response(JSON.stringify({ success: true, message: "LGPD webhook processed successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.log("❌ Erro na Edge Function LGPD:", error);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error", 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

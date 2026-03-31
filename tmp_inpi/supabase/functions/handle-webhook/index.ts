import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lgpd-public",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true"
};
// =============================
// 🔐 Funções de criptografia AES-256
// =============================
async function encrypt(text) {
  const key = Deno.env.get("ENCRYPTION_KEY");
  if (!key) {
    console.error("❌ ENCRYPTION_KEY não configurada");
    return text;
  }
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const keyData = encoder.encode(key.slice(0, 32)); // Usar apenas 32 bytes para AES-256
    const cryptoKey = await crypto.subtle.importKey("raw", keyData, {
      name: "AES-GCM"
    }, false, [
      "encrypt"
    ]);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({
      name: "AES-GCM",
      iv: iv
    }, cryptoKey, data);
    // Combinar IV e dados criptografados
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("❌ Erro ao criptografar:", error);
    return text; // Retorna texto original em caso de erro
  }
}
async function decrypt(encryptedText) {
  const key = Deno.env.get("ENCRYPTION_KEY");
  if (!key) {
    console.error("❌ ENCRYPTION_KEY não configurada");
    return encryptedText;
  }
  try {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const keyData = encoder.encode(key.slice(0, 32));
    const cryptoKey = await crypto.subtle.importKey("raw", keyData, {
      name: "AES-GCM"
    }, false, [
      "decrypt"
    ]);
    // Decodificar base64
    const combined = new Uint8Array(atob(encryptedText).split('').map((char)=>char.charCodeAt(0)));
    // Separar IV e dados criptografados
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({
      name: "AES-GCM",
      iv: iv
    }, cryptoKey, encrypted);
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("❌ Erro ao descriptografar:", error);
    return encryptedText; // Retorna texto original em caso de erro
  }
}
// =============================
// 🧩 Funções auxiliares
// =============================
async function encryptSensitiveData(data) {
  if (!data || typeof data !== 'object') return data;
  const encrypted = {
    ...data
  };
  // Campos sensíveis para criptografar
  const sensitiveFields = [
    'intimadoNome',
    'documento',
    'telefone'
  ];
  for (const field of sensitiveFields){
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = await encrypt(encrypted[field]);
    }
  }
  return encrypted;
}
async function decryptSensitiveData(data) {
  if (!data || typeof data !== 'object') return data;
  const decrypted = {
    ...data
  };
  // Campos sensíveis para descriptografar
  const sensitiveFields = [
    'intimadoNome',
    'documento',
    'telefone'
  ];
  for (const field of sensitiveFields){
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      console.log(`🔍 Tentando descriptografar campo: ${field}`);
      decrypted[field] = await decrypt(decrypted[field]);
      console.log(`✅ ${field} descriptografado com sucesso`);
    }
  }
  return decrypted;
}
// =============================
// 🚀 Servidor principal
// =============================
serve(async (req)=>{
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    // Verificar autenticação
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.log("❌ Chamada sem autenticação");
      return new Response(JSON.stringify({
        error: "Missing authorization header"
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const body = await req.json();
    const { webhookType, payload } = body;
    console.log("📬 Webhook recebido:", webhookType);
    console.log("🧠 Payload original:", JSON.stringify(payload, null, 2));
    let webhookUrl;
    // Determine the webhook URL based on the type
    switch(webhookType){
      case "CRIACAO":
        webhookUrl = Deno.env.get("WEBHOOK_CRIACAO_URL");
        break;
      case "REATIVACAO":
        webhookUrl = Deno.env.get("WEBHOOK_REATIVACAO_URL");
        break;
      case "CANCELAMENTO":
        webhookUrl = Deno.env.get("WEBHOOK_CANCELAMENTO_URL");
        break;
      case "SUPORTE":
        webhookUrl = Deno.env.get("WEBHOOK_SUPORTE_URL");
        break;
      case "LGPD":
        webhookUrl = Deno.env.get("WEBHOOK_LGPD_URL");
        break;
      default:
        return new Response(JSON.stringify({
          error: "Invalid webhook type"
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
    }
    if (!webhookUrl) {
      console.error(`❌ URL do webhook não configurada para o tipo: ${webhookType}`);
      return new Response(JSON.stringify({
        error: `Webhook URL for type ${webhookType} not configured`
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Preparar payload para N8N
    let payloadForN8N = {
      ...payload
    };
    // Verificar e descriptografar dados sensíveis antes de enviar para N8N
    if (payloadForN8N.data) {
      console.log("🔐 Dados sensíveis detectados em payloadForN8N.data, iniciando descriptografia...");
      payloadForN8N.data = await decryptSensitiveData(payloadForN8N.data);
      console.log("🔓 Dados após descriptografia:", JSON.stringify(payloadForN8N.data, null, 2));
    } else if (payloadForN8N.payload && payloadForN8N.payload.data) {
      // Caso a estrutura seja aninhada (payload.data)
      console.log("🔐 Dados sensíveis detectados em payloadForN8N.payload.data, iniciando descriptografia...");
      payloadForN8N.payload.data = await decryptSensitiveData(payloadForN8N.payload.data);
      console.log("🔓 Dados aninhados após descriptografia:", JSON.stringify(payloadForN8N.payload.data, null, 2));
    } else {
      console.log("⚠️ Nenhum campo 'data' encontrado no payload.");
    }
    console.log("🚀 Enviando payload final para N8N:", JSON.stringify(payloadForN8N, null, 2));
    // Forward the request to the appropriate webhook URL
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payloadForN8N)
    });
    if (!webhookResponse.ok) {
      const errorBody = await webhookResponse.text();
      console.error("❌ Erro no webhook:", webhookResponse.status, errorBody);
      return new Response(JSON.stringify({
        error: `Failed to forward webhook for ${webhookType}`,
        details: errorBody
      }), {
        status: 502,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log("✅ Webhook enviado com sucesso para N8N!");
    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("💥 Erro na Edge Function:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});

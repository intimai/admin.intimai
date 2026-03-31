import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true"
};

const ALLOWED_STATUSES = [
  "pendente",
  "entregue",
  "ativa",
  "agendada",
  "finalizada"
];

function normalizePhone(input) {
  return String(input || "").replace(/\D/g, "");
}

// Função para gerar o HMAC (a "impressão digital" segura)
async function createHmac(data) {
  const hmacKey = Deno.env.get("HMAC_KEY");
  if (!hmacKey) {
    console.error("HMAC_KEY não configurada.");
    throw new Error("HMAC_KEY não configurada.");
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(hmacKey), {
    name: "HMAC",
    hash: "SHA-256"
  }, false, [
    "sign"
  ]);

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  // Converte o resultado para uma string hexadecimal
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function parseStatuses(input, mode) {
  // Modo padrão do app: bloquear pendente, entregue, ativa
  const defaultApp = [
    "pendente",
    "entregue",
    "ativa"
  ];
  // Modo N8N: verificar entregue, ativa, agendada
  const defaultN8N = [
    "entregue",
    "ativa",
    "agendada"
  ];

  if (mode === "n8n") return defaultN8N;
  if (mode === "app") return defaultApp;

  if (typeof input === "string" && input.trim().length > 0) {
    const parts = input.split(",").map((s) => s.trim());
    const filtered = parts.filter((s) => ALLOWED_STATUSES.includes(s));
    return filtered.length > 0 ? filtered : defaultApp;
  }

  if (Array.isArray(input)) {
    const filtered = input.filter((s) => typeof s === "string" && ALLOWED_STATUSES.includes(s));
    return filtered.length > 0 ? filtered : defaultApp;
  }

  return defaultApp;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method not allowed"
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
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

    const {
      telefone,
      statuses,
      mode
    } = await req.json();
    const telefoneNormalized = normalizePhone(telefone);

    if (!/^\d{10,11}$/.test(telefoneNormalized)) {
      return new Response(JSON.stringify({
        error: "Telefone inválido. Use 10 ou 11 dígitos."
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    const statusList = parseStatuses(statuses, mode);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("❌ Variáveis SUPABASE_URL/SUPABASE_ANON_KEY não configuradas");
      return new Response(JSON.stringify({
        error: "Server misconfiguration"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    const telefoneHmac = await createHmac(telefoneNormalized);

    // Busca otimizada usando HMAC. Não há fallback, pois não há dados legados.
    const {
      data,
      error
    } = await supabaseClient.from("intimacoes").select("id, status, criadoEm").in("status", statusList).eq("telefone_hmac", telefoneHmac);

    if (error) {
      console.error("❌ Erro ao consultar com HMAC:", error);
      return new Response(JSON.stringify({
        error: "Erro ao consultar intimações"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // Retorna o array de resultados. Se vazio, não há correspondências.
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("❌ Erro inesperado na check-telefone:", err);
    return new Response(JSON.stringify({
      error: "Unexpected server error"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
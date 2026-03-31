import { supabase } from './customSupabaseClient';

/**
 * Triggers a Supabase Edge Function to send a webhook.
 *
 * @param {string} webhookType - The type of webhook to trigger (e.g., 'CRIACAO', 'CANCELAMENTO', 'REATIVACAO', 'SUPORTE', 'LGPD').
 * @param {object} data - The data related to the event (intimação, support request, etc.).
 * @param {object} user - The user object from useAuth (can be null for public forms like LGPD).
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const triggerWebhook = async (webhookType, data, user = null) => {
  // Para formulários públicos como LGPD, o usuário pode ser null
  if (webhookType !== 'LGPD' && !user) {
    console.error("Webhook trigger failed: User is not authenticated.");
    return { success: false, error: "User not authenticated" };
  }

  // Para formulários públicos como LGPD, o usuário pode ser null
  const userPayload = user ? {
    id: user.id,
    userId: user.userId,
    nome: user.nome,
    email: user.email,
    delegaciaId: user.delegaciaId,
    delegaciaNome: user.delegaciaNome,
    delegaciaEndereco: user.delegaciaEndereco,
    delegadoResponsavel: user.delegadoResponsavel,
  } : null;

  // For support, the main data is in the 'data' object itself.
  // For other types, it's nested under 'intimacao'.
  const payload = {
    webhookType,
    payload: {
      data, // This will contain either intimação data or support data
      user: userPayload,
    },
  };

  try {
    const { data: functionData, error } = await supabase.functions.invoke('handle-webhook', {
      body: payload,
    });

    if (error) {
      console.error(`Error triggering ${webhookType} webhook:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`${webhookType} webhook triggered successfully:`, functionData);
    return { success: true, data: functionData };
  } catch (e) {
    console.error(`Exception when triggering ${webhookType} webhook:`, e);
    return { success: false, error: e.message };
  }
};
/**
 * Serviço de criptografia para dados sensíveis
 * Usa AES-256-GCM para criptografar CPF, telefone e endereço
 */

// Função para criptografar dados sensíveis
export async function encryptSensitiveData(data) {
  if (!data || typeof data !== 'object') return data;
  
  const encrypted = { ...data };
  
  // Campos sensíveis para criptografar
  const sensitiveFields = ['intimadoNome', 'documento', 'telefone'];
  
  for (const field of sensitiveFields) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      try {
        encrypted[field] = await encrypt(encrypted[field]);
      } catch (error) {
        console.error(`❌ Erro ao criptografar campo ${field}:`, error);
        // Manter o valor original em caso de erro
      }
    }
  }
  
  return encrypted;
}

// Função para descriptografar dados sensíveis
export async function decryptSensitiveData(data) {
  if (!data || typeof data !== 'object') return data;
  
  const decrypted = { ...data };
  
  // Campos sensíveis para descriptografar
  const sensitiveFields = ['intimadoNome', 'documento', 'telefone'];
  
  for (const field of sensitiveFields) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      // Verificar se o campo está realmente criptografado
      if (isEncrypted(decrypted[field])) {
        try {
          const decryptedValue = await decrypt(decrypted[field]);
          decrypted[field] = decryptedValue;
        } catch (error) {
          console.error(`Erro ao descriptografar campo ${field}:`, error);
          // Manter o valor original em caso de erro
        }
      }
    }
  }
  
  return decrypted;
}

// Função de criptografia AES-256-GCM
async function encrypt(text) {
  const key = import.meta.env.VITE_ENCRYPTION_KEY;
  if (!key) {
    console.warn("⚠️ VITE_ENCRYPTION_KEY não configurada - dados não serão criptografados");
    return text;
  }
  
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const keyData = encoder.encode(key.slice(0, 32)); // Usar apenas 32 bytes para AES-256
    
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

// Função de descriptografia AES-256-GCM
async function decrypt(encryptedText) {
  const key = import.meta.env.VITE_ENCRYPTION_KEY;
  if (!key) {
    console.warn("⚠️ VITE_ENCRYPTION_KEY não configurada - dados não serão descriptografados");
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
    
    // Decodificar base64
    const combined = new Uint8Array(
      atob(encryptedText).split('').map(char => char.charCodeAt(0))
    );
    
    // Separar IV e dados criptografados
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
    return encryptedText; // Retorna texto original em caso de erro
  }
}

// Função para verificar se uma string está criptografada
export function isEncrypted(text) {
  if (!text || typeof text !== 'string') return false;
  
  // Verificar se é um texto muito curto (provavelmente não criptografado)
  if (text.length < 20) return false;
  
  // Verificar se contém caracteres típicos de texto não criptografado
  // Mas ser mais permissivo com textos de 40-60 caracteres (tamanho típico de dados criptografados)
  if (/[a-zA-Z\s]/.test(text) && text.length < 40) return false;
  
  try {
    // Tentar decodificar base64
    const decoded = atob(text);
    // Verificar se tem pelo menos 12 bytes (tamanho do IV)
    return decoded.length >= 12;
  } catch {
    return false;
  }
}

// Função para exibir dados mascarados (para interface)
export function maskSensitiveData(data, field) {
  if (!data || !data[field]) return '';
  
  const value = data[field];
  
  // Se estiver criptografado, mostrar como mascarado
  if (isEncrypted(value)) {
    switch (field) {
      case 'intimadoNome':
        return 'Nome criptografado';
      case 'documento':
        return 'Documento criptografado';
      case 'telefone':
        return '(**) *****-****';
      default:
        return '***';
    }
  }
  
  // Se não estiver criptografado, mascarar normalmente
  switch (field) {
    case 'intimadoNome':
      return value.length > 3 ? value.substring(0, 3) + '***' : '***';
    case 'documento':
      return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    case 'telefone':
      return value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    default:
      return value;
  }
}

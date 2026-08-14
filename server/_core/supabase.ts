import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "./env";

let _supabase: SupabaseClient | null = null;
let _initError: Error | null = null;

/**
 * Cliente Supabase usado no servidor para validar o token que o navegador manda
 * em cada requisição. Criado sob demanda (não no carregamento do módulo) —
 * assim, se SUPABASE_URL/SUPABASE_ANON_KEY estiverem ausentes ou inválidos,
 * só as chamadas que realmente precisam de login falham (com um erro claro),
 * em vez de derrubar a função inteira (inclusive rotas públicas) na inicialização.
 */
export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;
  if (_initError) throw _initError;

  if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) {
    _initError = new Error(
      "Supabase não configurado: SUPABASE_URL / SUPABASE_ANON_KEY ausentes ou vazios nas variáveis de ambiente."
    );
    throw _initError;
  }

  try {
    _supabase = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    return _supabase;
  } catch (error) {
    _initError = error instanceof Error ? error : new Error(String(error));
    throw _initError;
  }
}

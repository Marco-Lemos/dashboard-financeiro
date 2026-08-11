import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) {
  console.warn(
    "[Supabase] SUPABASE_URL / SUPABASE_ANON_KEY não configurados — verificação de login vai falhar até isso ser definido."
  );
}

// Cliente usado apenas no servidor para validar o token (JWT) que o navegador
// envia em cada requisição. Não persiste sessão nem faz refresh — cada
// requisição é validada de forma independente.
export const supabase = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getSupabase } from "./supabase";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  const authHeader = opts.req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (token) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        const profile = await db.getOrSyncUserProfile(data.user.id, {
          name: (data.user.user_metadata?.name as string | undefined) ?? null,
          email: data.user.email ?? null,
        });
        user = profile ?? null;
      }
    } catch (error) {
      // Token inválido/expirado OU Supabase/banco mal configurado — trata como
      // não autenticado em vez de derrubar a requisição inteira. error.cause
      // costuma ter a causa real (ex: erro de autenticação do Postgres),
      // enquanto error.message às vezes só mostra um wrapper genérico.
      const cause = error instanceof Error && error.cause
        ? ` | causa: ${error.cause instanceof Error ? error.cause.message : String(error.cause)}`
        : "";
      console.error("[Auth] Falha ao validar sessão:", error instanceof Error ? error.message + cause : error);
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

import type { Express } from "express";
import { sql } from "drizzle-orm";
import { getDb } from "../db";

/**
 * Rota chamada pelo Vercel Cron para gerar atividade real no banco e evitar
 * que o Supabase pause o projeto (planos gratuitos pausam após 7 dias sem uso).
 * Protegida pelo CRON_SECRET que a própria Vercel envia automaticamente nas
 * chamadas de cron — sem essa variável configurada, a checagem é pulada
 * (não trava o ambiente local, mas em produção o ideal é sempre configurá-la).
 */
export function registerCronRoutes(app: Express) {
  app.get("/api/cron/keep-alive", async (req, res) => {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
      res.status(401).json({ ok: false, error: "unauthorized" });
      return;
    }

    try {
      const db = await getDb();
      if (db) {
        await db.execute(sql`select 1`);
      }
      res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("[Cron] keep-alive falhou:", error instanceof Error ? error.message : error);
      // 200 mesmo em erro: o objetivo é não gerar alerta de cron quebrado por
      // uma instabilidade passageira do banco.
      res.status(200).json({ ok: false, timestamp: new Date().toISOString() });
    }
  });
}

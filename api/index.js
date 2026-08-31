// server/_core/app.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/_core/systemRouter.ts
import { z } from "zod";

// shared/const.ts
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  }))
});

// server/routers.ts
import { z as z2 } from "zod";

// server/db.ts
import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// drizzle/schema.ts
import { pgTable, uuid, text, timestamp, varchar, decimal, integer, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
var userRoleEnum = pgEnum("user_role", ["user", "admin"]);
var transactionTypeEnum = pgEnum("transaction_type", ["receita", "despesa", "investimento"]);
var categoryTypeEnum = pgEnum("category_type", ["receita", "despesa", "investimento"]);
var users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  role: userRoleEnum("role").default("user").notNull(),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var transactions = pgTable("transactions", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  // Preenchido quando a transação foi criada ao marcar uma conta fixa como paga.
  // Assim dá pra saber, por mês, se aquela conta fixa já foi paga ou está em aberto,
  // sem precisar de um status estático (que não tinha noção de "pago em qual mês").
  fixedAccountId: integer("fixedAccountId").references(() => fixedAccounts.id, { onDelete: "set null" }),
  // Preenchido quando a transação é uma contribuição pra uma meta financeira.
  // Progresso da meta = soma de tudo que aponta pra ela, mesma lógica das contas fixas.
  goalId: integer("goalId").references(() => goals.id, { onDelete: "set null" }),
  // Preenchido quando a transação é um aporte ou resgate de um investimento
  // específico. Valor negativo = resgate (retirada), positivo = aporte.
  investmentId: integer("investmentId").references(() => investments.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull()
});
var categories = pgTable("categories", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 64 }).notNull(),
  type: categoryTypeEnum("type").notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull()
});
var fixedAccounts = pgTable("fixedAccounts", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  dueDay: integer("dueDay").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull()
});
var installments = pgTable("installments", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }).notNull(),
  totalValue: decimal("totalValue", { precision: 10, scale: 2 }).notNull(),
  monthlyValue: decimal("monthlyValue", { precision: 10, scale: 2 }).notNull(),
  finalMonth: integer("finalMonth").notNull(),
  finalYear: integer("finalYear").notNull(),
  paidUntilMonth: integer("paidUntilMonth").notNull(),
  paidUntilYear: integer("paidUntilYear").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull()
});
var goals = pgTable("goals", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }).notNull(),
  targetValue: decimal("targetValue", { precision: 10, scale: 2 }).notNull(),
  targetMonth: integer("targetMonth"),
  targetYear: integer("targetYear"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull()
});
var investments = pgTable("investments", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull()
});
var usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  categories: many(categories),
  fixedAccounts: many(fixedAccounts),
  installments: many(installments)
}));
var transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  })
}));
var categoriesRelations = relations(categories, ({ one }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id]
  })
}));
var fixedAccountsRelations = relations(fixedAccounts, ({ one }) => ({
  user: one(users, {
    fields: [fixedAccounts.userId],
    references: [users.id]
  })
}));
var installmentsRelations = relations(installments, ({ one }) => ({
  user: one(users, {
    fields: [installments.userId],
    references: [users.id]
  })
}));

// shared/defaultCategories.ts
var DEFAULT_CATEGORIES = [
  { name: "Alimenta\xE7\xE3o", type: "despesa", color: "#2563EB" },
  { name: "Entretenimento", type: "despesa", color: "#7C3AED" },
  { name: "Contas", type: "despesa", color: "#059669" },
  { name: "Sa\xFAde", type: "despesa", color: "#DC2626" },
  { name: "Transporte", type: "despesa", color: "#0891B2" },
  { name: "Carro", type: "despesa", color: "#F59E0B" },
  { name: "Educa\xE7\xE3o", type: "despesa", color: "#EA580C" },
  { name: "Outros", type: "despesa", color: "#6B7280" },
  { name: "Sal\xE1rio", type: "receita", color: "#2563EB" },
  { name: "Freelance", type: "receita", color: "#2563EB" },
  { name: "Outros", type: "receita", color: "#2563EB" },
  { name: "BTC", type: "investimento", color: "#F7931A" },
  { name: "A\xE7\xF5es", type: "investimento", color: "#00AA44" },
  { name: "Terreno", type: "investimento", color: "#8B4513" },
  { name: "Im\xF3vel", type: "investimento", color: "#D4A574" }
];

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, { prepare: false, ssl: "require" });
      _db = drizzle(client);
    } catch (error) {
      const cause = error instanceof Error && error.cause ? ` | causa: ${error.cause instanceof Error ? error.cause.message : String(error.cause)}` : "";
      console.warn("[Database] Failed to connect:", error instanceof Error ? error.message + cause : error);
      _db = null;
    }
  }
  return _db;
}
async function getOrSyncUserProfile(id, profile) {
  const db = await getDb();
  if (!db) return void 0;
  const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (existing.length > 0) {
    return existing[0];
  }
  const inserted = await db.insert(users).values({ id, name: profile.name, email: profile.email }).onConflictDoNothing().returning();
  if (inserted.length > 0) {
    return inserted[0];
  }
  const retry = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return retry.length > 0 ? retry[0] : void 0;
}
async function getUserTransactions(userId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.date));
  return result.map((t2) => ({
    ...t2,
    amount: typeof t2.value === "string" ? parseFloat(t2.value) : t2.value,
    value: typeof t2.value === "string" ? parseFloat(t2.value) : t2.value
  }));
}
async function createTransaction(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(transactions).values(data);
}
async function updateTransaction(id, userId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(transactions).set(data).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}
async function deleteTransaction(id, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}
async function getUserCategories(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.userId, userId));
}
async function createCategory(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(categories).values(data);
}
async function updateCategory(id, userId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(categories).set(data).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}
async function deleteCategory(id, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}
async function seedDefaultCategoriesIfEmpty(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(categories).where(eq(categories.userId, userId)).limit(1);
  if (existing.length > 0) return { seeded: false };
  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((c) => ({ userId, name: c.name, type: c.type, color: c.color }))
  );
  return { seeded: true };
}
async function getUserFixedAccounts(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fixedAccounts).where(eq(fixedAccounts.userId, userId));
}
async function createFixedAccount(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(fixedAccounts).values(data);
}
async function updateFixedAccount(id, userId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(fixedAccounts).set(data).where(and(eq(fixedAccounts.id, id), eq(fixedAccounts.userId, userId)));
}
async function deleteFixedAccount(id, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(fixedAccounts).where(and(eq(fixedAccounts.id, id), eq(fixedAccounts.userId, userId)));
}
async function getUserInstallments(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(installments).where(eq(installments.userId, userId));
}
async function createInstallment(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(installments).values(data);
}
async function updateInstallment(id, userId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(installments).set(data).where(and(eq(installments.id, id), eq(installments.userId, userId)));
}
async function deleteInstallment(id, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(installments).where(and(eq(installments.id, id), eq(installments.userId, userId)));
}
async function completeOnboarding(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set({ onboardingCompleted: true }).where(eq(users.id, userId));
}
async function getUserGoals(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(goals).where(eq(goals.userId, userId));
}
async function createGoal(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(goals).values(data);
}
async function updateGoal(id, userId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(goals).set(data).where(and(eq(goals.id, id), eq(goals.userId, userId)));
}
async function deleteGoal(id, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, userId)));
}
async function getUserInvestments(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(investments).where(eq(investments.userId, userId));
}
async function createInvestment(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(investments).values(data);
}
async function updateInvestment(id, userId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(investments).set(data).where(and(eq(investments.id, id), eq(investments.userId, userId)));
}
async function deleteInvestment(id, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(investments).where(and(eq(investments.id, id), eq(investments.userId, userId)));
}

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    completeOnboarding: protectedProcedure.mutation(({ ctx }) => completeOnboarding(ctx.user.id))
  }),
  finance: router({
    transactions: router({
      list: protectedProcedure.query(({ ctx }) => getUserTransactions(ctx.user.id)),
      create: protectedProcedure.input(z2.object({
        description: z2.string(),
        category: z2.string(),
        type: z2.enum(["receita", "despesa", "investimento"]),
        amount: z2.number(),
        date: z2.string().transform((s) => new Date(s)),
        fixedAccountId: z2.number().optional(),
        goalId: z2.number().optional(),
        investmentId: z2.number().optional()
      })).mutation(({ ctx, input }) => createTransaction({
        userId: ctx.user.id,
        description: input.description,
        category: input.category,
        type: input.type,
        value: input.amount.toString(),
        date: input.date,
        fixedAccountId: input.fixedAccountId,
        goalId: input.goalId,
        investmentId: input.investmentId
      })),
      update: protectedProcedure.input(z2.object({
        id: z2.coerce.number(),
        description: z2.string().optional(),
        category: z2.string().optional(),
        type: z2.enum(["receita", "despesa", "investimento"]).optional(),
        amount: z2.number().optional(),
        date: z2.string().transform((s) => new Date(s)).optional()
      })).mutation(({ ctx, input }) => updateTransaction(input.id, ctx.user.id, {
        description: input.description,
        category: input.category,
        type: input.type,
        value: input.amount ? input.amount.toString() : void 0,
        date: input.date
      })),
      delete: protectedProcedure.input(z2.object({ id: z2.coerce.number() })).mutation(({ ctx, input }) => deleteTransaction(input.id, ctx.user.id))
    }),
    categories: router({
      list: protectedProcedure.query(({ ctx }) => getUserCategories(ctx.user.id)),
      seedDefaults: protectedProcedure.mutation(({ ctx }) => seedDefaultCategoriesIfEmpty(ctx.user.id)),
      create: protectedProcedure.input(z2.object({
        name: z2.string(),
        type: z2.enum(["receita", "despesa", "investimento"]),
        color: z2.string()
      })).mutation(({ ctx, input }) => createCategory({
        userId: ctx.user.id,
        name: input.name,
        type: input.type,
        color: input.color
      })),
      update: protectedProcedure.input(z2.object({
        id: z2.coerce.number(),
        name: z2.string().optional(),
        color: z2.string().optional()
      })).mutation(({ ctx, input }) => updateCategory(input.id, ctx.user.id, {
        name: input.name,
        color: input.color
      })),
      delete: protectedProcedure.input(z2.object({ id: z2.coerce.number() })).mutation(({ ctx, input }) => deleteCategory(input.id, ctx.user.id))
    }),
    fixedAccounts: router({
      list: protectedProcedure.query(({ ctx }) => getUserFixedAccounts(ctx.user.id)),
      create: protectedProcedure.input(z2.object({
        name: z2.string(),
        value: z2.string(),
        dueDay: z2.number()
      })).mutation(({ ctx, input }) => createFixedAccount({
        userId: ctx.user.id,
        name: input.name,
        value: input.value,
        dueDay: input.dueDay
      })),
      update: protectedProcedure.input(z2.object({
        id: z2.coerce.number(),
        name: z2.string().optional(),
        value: z2.string().optional(),
        dueDay: z2.number().optional()
      })).mutation(({ ctx, input }) => updateFixedAccount(input.id, ctx.user.id, {
        name: input.name,
        value: input.value,
        dueDay: input.dueDay
      })),
      delete: protectedProcedure.input(z2.object({ id: z2.coerce.number() })).mutation(({ ctx, input }) => deleteFixedAccount(input.id, ctx.user.id))
    }),
    installments: router({
      list: protectedProcedure.query(({ ctx }) => getUserInstallments(ctx.user.id)),
      create: protectedProcedure.input(z2.object({
        name: z2.string(),
        totalValue: z2.string(),
        monthlyValue: z2.string(),
        finalMonth: z2.number(),
        finalYear: z2.number(),
        paidUntilMonth: z2.number(),
        paidUntilYear: z2.number()
      })).mutation(({ ctx, input }) => createInstallment({
        userId: ctx.user.id,
        name: input.name,
        totalValue: input.totalValue,
        monthlyValue: input.monthlyValue,
        finalMonth: input.finalMonth,
        finalYear: input.finalYear,
        paidUntilMonth: input.paidUntilMonth,
        paidUntilYear: input.paidUntilYear
      })),
      update: protectedProcedure.input(z2.object({
        id: z2.coerce.number(),
        name: z2.string().optional(),
        totalValue: z2.string().optional(),
        monthlyValue: z2.string().optional(),
        finalMonth: z2.number().optional(),
        finalYear: z2.number().optional(),
        paidUntilMonth: z2.number().optional(),
        paidUntilYear: z2.number().optional()
      })).mutation(({ ctx, input }) => updateInstallment(input.id, ctx.user.id, {
        name: input.name,
        totalValue: input.totalValue,
        monthlyValue: input.monthlyValue,
        finalMonth: input.finalMonth,
        finalYear: input.finalYear,
        paidUntilMonth: input.paidUntilMonth,
        paidUntilYear: input.paidUntilYear
      })),
      delete: protectedProcedure.input(z2.object({ id: z2.coerce.number() })).mutation(({ ctx, input }) => deleteInstallment(input.id, ctx.user.id))
    }),
    goals: router({
      list: protectedProcedure.query(({ ctx }) => getUserGoals(ctx.user.id)),
      create: protectedProcedure.input(z2.object({
        name: z2.string(),
        targetValue: z2.string(),
        targetMonth: z2.number().optional(),
        targetYear: z2.number().optional()
      })).mutation(({ ctx, input }) => createGoal({
        userId: ctx.user.id,
        name: input.name,
        targetValue: input.targetValue,
        targetMonth: input.targetMonth,
        targetYear: input.targetYear
      })),
      update: protectedProcedure.input(z2.object({
        id: z2.coerce.number(),
        name: z2.string().optional(),
        targetValue: z2.string().optional(),
        targetMonth: z2.number().optional(),
        targetYear: z2.number().optional()
      })).mutation(({ ctx, input }) => updateGoal(input.id, ctx.user.id, {
        name: input.name,
        targetValue: input.targetValue,
        targetMonth: input.targetMonth,
        targetYear: input.targetYear
      })),
      delete: protectedProcedure.input(z2.object({ id: z2.coerce.number() })).mutation(({ ctx, input }) => deleteGoal(input.id, ctx.user.id))
    }),
    investments: router({
      list: protectedProcedure.query(({ ctx }) => getUserInvestments(ctx.user.id)),
      create: protectedProcedure.input(z2.object({
        name: z2.string(),
        category: z2.string()
      })).mutation(({ ctx, input }) => createInvestment({
        userId: ctx.user.id,
        name: input.name,
        category: input.category
      })),
      update: protectedProcedure.input(z2.object({
        id: z2.coerce.number(),
        name: z2.string().optional(),
        category: z2.string().optional()
      })).mutation(({ ctx, input }) => updateInvestment(input.id, ctx.user.id, {
        name: input.name,
        category: input.category
      })),
      delete: protectedProcedure.input(z2.object({ id: z2.coerce.number() })).mutation(({ ctx, input }) => deleteInvestment(input.id, ctx.user.id))
    })
  })
});

// server/_core/supabase.ts
import { createClient } from "@supabase/supabase-js";

// server/_core/env.ts
var ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  isProduction: process.env.NODE_ENV === "production"
};

// server/_core/supabase.ts
var _supabase = null;
var _initError = null;
function getSupabase() {
  if (_supabase) return _supabase;
  if (_initError) throw _initError;
  if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) {
    _initError = new Error(
      "Supabase n\xE3o configurado: SUPABASE_URL / SUPABASE_ANON_KEY ausentes ou vazios nas vari\xE1veis de ambiente."
    );
    throw _initError;
  }
  try {
    _supabase = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    return _supabase;
  } catch (error) {
    _initError = error instanceof Error ? error : new Error(String(error));
    throw _initError;
  }
}

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  const authHeader = opts.req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : void 0;
  if (token) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        const profile = await getOrSyncUserProfile(data.user.id, {
          name: data.user.user_metadata?.name ?? null,
          email: data.user.email ?? null
        });
        user = profile ?? null;
      }
    } catch (error) {
      const cause = error instanceof Error && error.cause ? ` | causa: ${error.cause instanceof Error ? error.cause.message : String(error.cause)}` : "";
      console.error("[Auth] Falha ao validar sess\xE3o:", error instanceof Error ? error.message + cause : error);
      user = null;
    }
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/cron.ts
import { sql } from "drizzle-orm";
function registerCronRoutes(app2) {
  app2.get("/api/cron/keep-alive", async (req, res) => {
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
      res.status(200).json({ ok: true, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    } catch (error) {
      console.error("[Cron] keep-alive falhou:", error instanceof Error ? error.message : error);
      res.status(200).json({ ok: false, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    }
  });
}

// server/_core/app.ts
function createApp() {
  const app2 = express();
  app2.use(express.json({ limit: "50mb" }));
  app2.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerCronRoutes(app2);
  app2.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  return app2;
}

// server/_core/vercel-entry.ts
var app = createApp();
var vercel_entry_default = app;
export {
  vercel_entry_default as default
};

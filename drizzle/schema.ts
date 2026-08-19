import { pgTable, uuid, text, timestamp, varchar, decimal, integer, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["receita", "despesa", "investimento"]);
export const categoryTypeEnum = pgEnum("category_type", ["receita", "despesa", "investimento"]);

/**
 * Tabela de perfis, espelhando auth.users (Supabase Auth).
 * O id é o MESMO uuid do auth.users — populado automaticamente por um
 * trigger (handle_new_user) toda vez que alguém se cadastra.
 * Não inserir diretamente aqui a partir do app; a criação é feita pelo trigger.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  role: userRoleEnum("role").default("user").notNull(),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabelas de Finanças
export const transactions = pgTable("transactions", {
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
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export const categories = pgTable("categories", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 64 }).notNull(),
  type: categoryTypeEnum("type").notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const fixedAccounts = pgTable("fixedAccounts", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  dueDay: integer("dueDay").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type FixedAccount = typeof fixedAccounts.$inferSelect;
export type InsertFixedAccount = typeof fixedAccounts.$inferInsert;

export const installments = pgTable("installments", {
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
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Installment = typeof installments.$inferSelect;
export type InsertInstallment = typeof installments.$inferInsert;

export const goals = pgTable("goals", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }).notNull(),
  targetValue: decimal("targetValue", { precision: 10, scale: 2 }).notNull(),
  targetMonth: integer("targetMonth"),
  targetYear: integer("targetYear"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

// Relações
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  categories: many(categories),
  fixedAccounts: many(fixedAccounts),
  installments: many(installments),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
}));

export const fixedAccountsRelations = relations(fixedAccounts, ({ one }) => ({
  user: one(users, {
    fields: [fixedAccounts.userId],
    references: [users.id],
  }),
}));

export const installmentsRelations = relations(installments, ({ one }) => ({
  user: one(users, {
    fields: [installments.userId],
    references: [users.id],
  }),
}));

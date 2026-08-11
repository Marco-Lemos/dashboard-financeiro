import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, transactions, categories, fixedAccounts, installments, User, Transaction, Category, FixedAccount, Installment, InsertTransaction, InsertCategory, InsertFixedAccount, InsertInstallment } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, { prepare: false });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Busca o perfil (public.users) de um usuário autenticado pelo Supabase Auth.
 * Normalmente já existe, criado automaticamente pelo trigger handle_new_user
 * assim que a pessoa se cadastra. Este upsert é só uma rede de segurança
 * (ex: alguma corrida entre o trigger e a primeira requisição).
 */
export async function getOrSyncUserProfile(
  id: string,
  profile: { name: string | null; email: string | null }
): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (existing.length > 0) {
    return existing[0];
  }

  const inserted = await db
    .insert(users)
    .values({ id, name: profile.name, email: profile.email })
    .onConflictDoNothing()
    .returning();

  if (inserted.length > 0) {
    return inserted[0];
  }

  // Outra requisição pode ter criado o perfil entre o select e o insert acima.
  const retry = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return retry.length > 0 ? retry[0] : undefined;
}

// Transações
export async function getUserTransactions(userId: string) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.date));
  return result.map(t => ({
    ...t,
    amount: typeof t.value === 'string' ? parseFloat(t.value) : t.value,
    value: typeof t.value === 'string' ? parseFloat(t.value) : t.value
  }));
}

export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(transactions).values(data);
}

export async function updateTransaction(id: number, userId: string, data: Partial<Transaction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(transactions).set(data).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function deleteTransaction(id: number, userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

// Categorias
export async function getUserCategories(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.userId, userId));
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(categories).values(data);
}

export async function updateCategory(id: number, userId: string, data: Partial<Category>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(categories).set(data).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

export async function deleteCategory(id: number, userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

// Contas Fixas
export async function getUserFixedAccounts(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fixedAccounts).where(eq(fixedAccounts.userId, userId));
}

export async function createFixedAccount(data: InsertFixedAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(fixedAccounts).values(data);
}

export async function updateFixedAccount(id: number, userId: string, data: Partial<FixedAccount>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(fixedAccounts).set(data).where(and(eq(fixedAccounts.id, id), eq(fixedAccounts.userId, userId)));
}

export async function deleteFixedAccount(id: number, userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(fixedAccounts).where(and(eq(fixedAccounts.id, id), eq(fixedAccounts.userId, userId)));
}

// Parcelamentos
export async function getUserInstallments(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(installments).where(eq(installments.userId, userId));
}

export async function createInstallment(data: InsertInstallment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(installments).values(data);
}

export async function updateInstallment(id: number, userId: string, data: Partial<Installment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(installments).set(data).where(and(eq(installments.id, id), eq(installments.userId, userId)));
}

export async function deleteInstallment(id: number, userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(installments).where(and(eq(installments.id, id), eq(installments.userId, userId)));
}

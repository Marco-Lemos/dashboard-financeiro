import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    completeOnboarding: protectedProcedure.mutation(({ ctx }) => db.completeOnboarding(ctx.user.id)),
  }),

  finance: router({
    transactions: router({
      list: protectedProcedure.query(({ ctx }) => db.getUserTransactions(ctx.user.id)),
      create: protectedProcedure.input(z.object({
        description: z.string(),
        category: z.string(),
        type: z.enum(["receita", "despesa", "investimento"]),
        amount: z.number(),
        date: z.string().transform(s => new Date(s)),
      })).mutation(({ ctx, input }) => db.createTransaction({
        userId: ctx.user.id,
        description: input.description,
        category: input.category,
        type: input.type,
        value: input.amount.toString(),
        date: input.date,
      })),
      update: protectedProcedure.input(z.object({
        id: z.coerce.number(),
        description: z.string().optional(),
        category: z.string().optional(),
        type: z.enum(["receita", "despesa", "investimento"]).optional(),
        amount: z.number().optional(),
        date: z.string().transform(s => new Date(s)).optional(),
      })).mutation(({ ctx, input }) => db.updateTransaction(input.id, ctx.user.id, {
        description: input.description,
        category: input.category,
        type: input.type,
        value: input.amount ? input.amount.toString() : undefined,
        date: input.date,
      })),
      delete: protectedProcedure.input(z.object({ id: z.coerce.number() })).mutation(({ ctx, input }) => db.deleteTransaction(input.id, ctx.user.id)),
    }),

    categories: router({
      list: protectedProcedure.query(({ ctx }) => db.getUserCategories(ctx.user.id)),
      create: protectedProcedure.input(z.object({
        name: z.string(),
        type: z.enum(["receita", "despesa", "investimento"]),
        color: z.string(),
      })).mutation(({ ctx, input }) => db.createCategory({
        userId: ctx.user.id,
        name: input.name,
        type: input.type,
        color: input.color,
      })),
      update: protectedProcedure.input(z.object({
        id: z.coerce.number(),
        name: z.string().optional(),
        color: z.string().optional(),
      })).mutation(({ ctx, input }) => db.updateCategory(input.id, ctx.user.id, {
        name: input.name,
        color: input.color,
      })),
      delete: protectedProcedure.input(z.object({ id: z.coerce.number() })).mutation(({ ctx, input }) => db.deleteCategory(input.id, ctx.user.id)),
    }),

    fixedAccounts: router({
      list: protectedProcedure.query(({ ctx }) => db.getUserFixedAccounts(ctx.user.id)),
      create: protectedProcedure.input(z.object({
        name: z.string(),
        value: z.string(),
        dueDay: z.number(),
        status: z.enum(["pago", "pendente"]),
      })).mutation(({ ctx, input }) => db.createFixedAccount({
        userId: ctx.user.id,
        name: input.name,
        value: input.value as any,
        dueDay: input.dueDay,
        status: input.status,
      })),
      update: protectedProcedure.input(z.object({
        id: z.coerce.number(),
        name: z.string().optional(),
        value: z.string().optional(),
        dueDay: z.number().optional(),
        status: z.enum(["pago", "pendente"]).optional(),
      })).mutation(({ ctx, input }) => db.updateFixedAccount(input.id, ctx.user.id, {
        name: input.name,
        value: input.value as any,
        dueDay: input.dueDay,
        status: input.status,
      })),
      delete: protectedProcedure.input(z.object({ id: z.coerce.number() })).mutation(({ ctx, input }) => db.deleteFixedAccount(input.id, ctx.user.id)),
    }),

    installments: router({
      list: protectedProcedure.query(({ ctx }) => db.getUserInstallments(ctx.user.id)),
      create: protectedProcedure.input(z.object({
        name: z.string(),
        totalValue: z.string(),
        monthlyValue: z.string(),
        finalMonth: z.number(),
        finalYear: z.number(),
        paidUntilMonth: z.number(),
        paidUntilYear: z.number(),
      })).mutation(({ ctx, input }) => db.createInstallment({
        userId: ctx.user.id,
        name: input.name,
        totalValue: input.totalValue as any,
        monthlyValue: input.monthlyValue as any,
        finalMonth: input.finalMonth,
        finalYear: input.finalYear,
        paidUntilMonth: input.paidUntilMonth,
        paidUntilYear: input.paidUntilYear,
      })),
      update: protectedProcedure.input(z.object({
        id: z.coerce.number(),
        name: z.string().optional(),
        totalValue: z.string().optional(),
        monthlyValue: z.string().optional(),
        finalMonth: z.number().optional(),
        finalYear: z.number().optional(),
        paidUntilMonth: z.number().optional(),
        paidUntilYear: z.number().optional(),
      })).mutation(({ ctx, input }) => db.updateInstallment(input.id, ctx.user.id, {
        name: input.name,
        totalValue: input.totalValue as any,
        monthlyValue: input.monthlyValue as any,
        finalMonth: input.finalMonth,
        finalYear: input.finalYear,
        paidUntilMonth: input.paidUntilMonth,
        paidUntilYear: input.paidUntilYear,
      })),
      delete: protectedProcedure.input(z.object({ id: z.coerce.number() })).mutation(({ ctx, input }) => db.deleteInstallment(input.id, ctx.user.id)),
    }),
  }),
});

export type AppRouter = typeof appRouter;

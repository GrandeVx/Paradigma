import { z } from "zod";

// Base transaction schema for common fields
const baseTransactionSchema = z.object({
  accountId: z.string(),
  description: z.string().min(1),
  date: z.date(),
  subCategoryId: z.string().optional(),
  notes: z.string().optional(),
});

// Schema for creating expense transactions
export const createExpenseSchema = baseTransactionSchema.extend({
  amount: z.number().positive(),
});

// Schema for creating income transactions
export const createIncomeSchema = baseTransactionSchema.extend({
  amount: z.number().positive(),
});

// Schema for creating transfer transactions
export const createTransferSchema = z.object({
  fromAccountId: z.string(),
  toAccountId: z.string(),
  amount: z.number().positive(),
  date: z.date(),
  description: z.string().min(1),
  notes: z.string().optional(),
});

// Schema for pagination and filtering transactions
export const listTransactionsSchema = z.object({
  accountId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  subCategoryId: z.string().optional(),
  type: z.enum(["income", "expense", "transfer"]).optional(),
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// Schema for getting transaction by ID
export const getTransactionByIdSchema = z.object({
  transactionId: z.string(),
});

// Schema for updating transaction
export const updateTransactionSchema = z.object({
  transactionId: z.string(),
  accountId: z.string().optional(),
  amount: z.number().optional(),
  date: z.date().optional(),
  description: z.string().min(1).optional(),
  subCategoryId: z.string().nullish(),
  notes: z.string().nullish(),
});

// Schema for deleting transaction
export const deleteTransactionSchema = z.object({
  transactionId: z.string(),
});

// Schema for getting monthly spending
export const getMonthlySpendingSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(1900).max(2100),
  accountId: z.string().optional(),
  macroCategoryIds: z.array(z.string()).optional(),
});

// Schema for getting category breakdown for charts
export const getCategoryBreakdownSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(1900).max(2100),
  accountId: z.string().optional(),
  type: z.enum(["income", "expense"]).default("expense"),
});

// Schema for getting monthly summary
export const getMonthlySummarySchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(1900).max(2100),
  accountId: z.string().optional(),
}); 
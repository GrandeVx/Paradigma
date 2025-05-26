import { z } from "zod";

// Schema for listing accounts with balances
export const listAccountsSchema = z.object({});

// Schema for getting account by ID
export const getAccountByIdSchema = z.object({
  accountId: z.string(),
});

// Schema for creating a new account
export const createAccountSchema = z.object({
  name: z.string().min(1),
  // type: z.enum(["BANK", "CREDIT_CARD", "CASH", "INVESTMENT", "SAVINGS", "OTHER"]),
  //currency: z.string(),
  initialBalance: z.number().default(0),
  iconName: z.string().optional(),
  color: z.string().optional(),
  default: z.boolean().default(false),
  currency: z.string().optional().default("EUR"),
  // Campi obiettivo
  isGoalAccount: z.boolean().optional().default(false),
  targetAmount: z.number().optional(),
  targetDate: z.date().optional(),
  goalDescription: z.string().optional(),
});

// Schema for updating an account
export const updateAccountSchema = z.object({
  accountId: z.string(),
  name: z.string().min(1).optional(),
  iconName: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  default: z.boolean().optional(),
  currency: z.string().optional(),
  // Campi obiettivo
  isGoalAccount: z.boolean().optional(),
  targetAmount: z.number().optional().nullable(),
  targetDate: z.date().optional().nullable(),
  goalDescription: z.string().optional().nullable(),
});

// Schema for deleting an account
export const deleteAccountSchema = z.object({
  accountId: z.string(),
});

// Schema for getting account progress (per i conti di tipo obiettivo)
export const getAccountProgressSchema = z.object({
  accountId: z.string(),
}); 
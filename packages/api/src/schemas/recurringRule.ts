import { z } from "zod";


// Schema for listing recurring rules
export const listRecurringRulesSchema = z.object({
  isInstallment: z.boolean().optional(),
});

// Schema for getting recurring rule by ID
export const getRecurringRuleByIdSchema = z.object({
  ruleId: z.string(),
});

// Schema for creating a recurring rule
export const createRecurringRuleSchema = z.object({
  accountId: z.string(),
  description: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default("EUR"),
  type: z.enum(["INCOME", "EXPENSE"]),
  subCategoryId: z.string().optional(),
  // TODO: Restore after goal refactor to MoneyAccount
  // goalId: z.string().optional(),
  
  // Recurrence configuration
  startDate: z.date(),
  frequencyType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  frequencyInterval: z.number().int().positive().default(1),
  dayOfWeek: z.number().int().min(0).max(6).optional(), // 0=Sunday, 6=Saturday
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  
  // End conditions (optional)
  endDate: z.date().optional(),
  totalOccurrences: z.number().int().positive().optional(),
  isInstallment: z.boolean().default(false),
  
  // Notes
  notes: z.string().optional(),
});

// Schema for updating a recurring rule
export const updateRecurringRuleSchema = z.object({
  ruleId: z.string(),
  
  // Optional fields to update
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  accountId: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"]),
  subCategoryId: z.string().nullable().optional(),
  // TODO: Restore after goal refactor to MoneyAccount
  // goalId: z.string().nullable().optional(),
  
  // Recurrence fields
  startDate: z.date().optional(),
  frequencyType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  frequencyInterval: z.number().optional(),
  dayOfWeek: z.number().nullable().optional(),
  dayOfMonth: z.number().nullable().optional(),
  
  // End conditions
  endDate: z.date().nullable().optional(),
  totalOccurrences: z.number().nullable().optional(),
  isInstallment: z.boolean().optional(),
  isActive: z.boolean().optional(),
  
  // Notes
  notes: z.string().nullable().optional(),
});

// Schema for toggling a recurring rule
export const toggleRecurringRuleSchema = z.object({
  ruleId: z.string(),
  isActive: z.boolean(),
});

// Schema for deleting a recurring rule
export const deleteRecurringRuleSchema = z.object({
  ruleId: z.string(),
  deleteFutureTransactions: z.boolean().default(false),
});

// Schema for converting frequency
export const convertFrequencySchema = z.object({
  frequencyDays: z.number(),
}); 
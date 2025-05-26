import { z } from "zod";
import { FrequencyType, RuleType } from "@prisma/client";

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
  description: z.string(),
  amount: z.number(),
  currency: z.string().default("EUR"),
  type: z.nativeEnum(RuleType),
  subCategoryId: z.string().optional(),
  goalId: z.string().optional(),
  
  // Recurrence fields
  startDate: z.date(),
  frequencyType: z.nativeEnum(FrequencyType),
  frequencyInterval: z.number().default(1),
  dayOfWeek: z.number().optional(),
  dayOfMonth: z.number().optional(),
  
  // End conditions
  endDate: z.date().optional(),
  totalOccurrences: z.number().optional(),
  isInstallment: z.boolean().default(false),
  
  // Notes
  notes: z.string().optional(),
});

// Schema for updating a recurring rule
export const updateRecurringRuleSchema = z.object({
  ruleId: z.string(),
  accountId: z.string().optional(),
  description: z.string().optional(),
  amount: z.number().optional(),
  type: z.nativeEnum(RuleType).optional(),
  subCategoryId: z.string().nullable().optional(),
  goalId: z.string().nullable().optional(),
  
  // Recurrence fields
  startDate: z.date().optional(),
  frequencyType: z.nativeEnum(FrequencyType).optional(),
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
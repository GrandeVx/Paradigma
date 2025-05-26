import { z } from "zod";

// Schema for getting current budget settings
export const getCurrentBudgetSettingsSchema = z.object({});

// Schema for setting a budget amount for a category
export const setBudgetAmountSchema = z.object({
  macroCategoryId: z.string(),
  allocatedAmount: z.number().positive(),
}); 
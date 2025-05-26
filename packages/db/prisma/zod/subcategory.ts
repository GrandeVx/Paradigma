import * as z from "zod"
import { CompleteMacroCategory, relatedMacroCategorySchema, CompleteTransaction, relatedTransactionSchema, CompleteRecurringTransactionRule, relatedRecurringTransactionRuleSchema } from "./index"

export const subCategorySchema = z.object({
  id: z.string(),
  macroCategoryId: z.string(),
  name: z.string(),
  icon: z.string(),
})

export interface CompleteSubCategory extends z.infer<typeof subCategorySchema> {
  macroCategory: CompleteMacroCategory
  transactions: CompleteTransaction[]
  recurringRules: CompleteRecurringTransactionRule[]
}

/**
 * relatedSubCategorySchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedSubCategorySchema: z.ZodSchema<CompleteSubCategory> = z.lazy(() => subCategorySchema.extend({
  macroCategory: relatedMacroCategorySchema,
  transactions: relatedTransactionSchema.array(),
  recurringRules: relatedRecurringTransactionRuleSchema.array(),
}))

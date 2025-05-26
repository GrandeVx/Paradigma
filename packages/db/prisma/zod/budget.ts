import * as z from "zod"
import { Decimal } from "decimal.js"
import { CompleteUser, relatedUserSchema, CompleteMacroCategory, relatedMacroCategorySchema } from "./index"

// Helper schema for Decimal fields
z
  .instanceof(Decimal)
  .or(z.string())
  .or(z.number())
  .refine((value) => {
    try {
      return new Decimal(value)
    } catch (error) {
      return false
    }
  })
  .transform((value) => new Decimal(value))

export const budgetSchema = z.object({
  id: z.string(),
  userId: z.string(),
  macroCategoryId: z.string(),
  allocatedAmount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteBudget extends z.infer<typeof budgetSchema> {
  user: CompleteUser
  macroCategory: CompleteMacroCategory
}

/**
 * relatedBudgetSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedBudgetSchema: z.ZodSchema<CompleteBudget> = z.lazy(() => budgetSchema.extend({
  user: relatedUserSchema,
  macroCategory: relatedMacroCategorySchema,
}))

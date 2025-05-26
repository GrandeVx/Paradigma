import * as z from "zod"
import { CategoryType } from "@prisma/client"
import { CompleteSubCategory, relatedSubCategorySchema, CompleteBudget, relatedBudgetSchema } from "./index"

export const macroCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(CategoryType),
  color: z.string(),
  icon: z.string(),
})

export interface CompleteMacroCategory extends z.infer<typeof macroCategorySchema> {
  subCategories: CompleteSubCategory[]
  budgets: CompleteBudget[]
}

/**
 * relatedMacroCategorySchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedMacroCategorySchema: z.ZodSchema<CompleteMacroCategory> = z.lazy(() => macroCategorySchema.extend({
  subCategories: relatedSubCategorySchema.array(),
  budgets: relatedBudgetSchema.array(),
}))

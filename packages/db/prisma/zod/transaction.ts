import * as z from "zod"
import { Decimal } from "decimal.js"
import { CompleteUser, relatedUserSchema, CompleteSubCategory, relatedSubCategorySchema, CompleteRecurringTransactionRule, relatedRecurringTransactionRuleSchema, CompleteMoneyAccount, relatedMoneyAccountSchema } from "./index"

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

export const transactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  description: z.string(),
  amount: z.number(),
  date: z.date(),
  subCategoryId: z.string().nullish(),
  notes: z.string().nullish(),
  transferId: z.string().nullish(),
  isRecurringInstance: z.boolean(),
  recurringRuleId: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  moneyAccountId: z.string().nullish(),
})

export interface CompleteTransaction extends z.infer<typeof transactionSchema> {
  user: CompleteUser
  subCategory?: CompleteSubCategory | null
  recurringRule?: CompleteRecurringTransactionRule | null
  moneyAccount?: CompleteMoneyAccount | null
}

/**
 * relatedTransactionSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedTransactionSchema: z.ZodSchema<CompleteTransaction> = z.lazy(() => transactionSchema.extend({
  user: relatedUserSchema,
  subCategory: relatedSubCategorySchema.nullish(),
  recurringRule: relatedRecurringTransactionRuleSchema.nullish(),
  moneyAccount: relatedMoneyAccountSchema.nullish(),
}))

import * as z from "zod"
import { Decimal } from "decimal.js"
import { CompleteUser, relatedUserSchema, CompleteTransaction, relatedTransactionSchema, CompleteRecurringTransactionRule, relatedRecurringTransactionRuleSchema } from "./index"

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

export const moneyAccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  iconName: z.string().nullish(),
  default: z.boolean(),
  color: z.string().nullish(),
  initialBalance: z.number(),
  currency: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  includeInTotal: z.boolean(),
  isGoalAccount: z.boolean(),
  targetAmount: z.number().nullish(),
  targetDate: z.date().nullish(),
  goalDescription: z.string().nullish(),
})

export interface CompleteMoneyAccount extends z.infer<typeof moneyAccountSchema> {
  user: CompleteUser
  transactions: CompleteTransaction[]
  recurringRules: CompleteRecurringTransactionRule[]
}

/**
 * relatedMoneyAccountSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedMoneyAccountSchema: z.ZodSchema<CompleteMoneyAccount> = z.lazy(() => moneyAccountSchema.extend({
  user: relatedUserSchema,
  transactions: relatedTransactionSchema.array(),
  recurringRules: relatedRecurringTransactionRuleSchema.array(),
}))

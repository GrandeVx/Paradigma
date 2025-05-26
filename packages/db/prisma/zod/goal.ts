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

export const goalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  iconName: z.string().nullish(),
  color: z.string().nullish(),
  targetAmount: z.number(),
  targetDate: z.date().nullish(),
  description: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteGoal extends z.infer<typeof goalSchema> {
  user: CompleteUser
  transactions: CompleteTransaction[]
  recurringRules: CompleteRecurringTransactionRule[]
}

/**
 * relatedGoalSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedGoalSchema: z.ZodSchema<CompleteGoal> = z.lazy(() => goalSchema.extend({
  user: relatedUserSchema,
  transactions: relatedTransactionSchema.array(),
  recurringRules: relatedRecurringTransactionRuleSchema.array(),
}))

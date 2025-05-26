import * as z from "zod"
import { CompleteMoneyAccount, relatedMoneyAccountSchema, CompleteRecurringTransactionRule, relatedRecurringTransactionRuleSchema, CompleteTransaction, relatedTransactionSchema, CompleteBudget, relatedBudgetSchema, CompleteSession, relatedSessionSchema, CompleteAccount, relatedAccountSchema } from "./index"

export const userSchema = z.object({
  id: z.string(),
  username: z.string().nullish(),
  email: z.string(),
  emailVerified: z.boolean(),
  phone: z.string().nullish(),
  name: z.string().nullish(),
  image: z.string().nullish(),
  language: z.string().nullish(),
  notifications: z.boolean(),
  notificationToken: z.string().nullish(),
  isDeleted: z.boolean(),
  deletedAt: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  currency: z.string().nullish(),
})

export interface CompleteUser extends z.infer<typeof userSchema> {
  moneyAccounts: CompleteMoneyAccount[]
  recurringRules: CompleteRecurringTransactionRule[]
  transactions: CompleteTransaction[]
  budgets: CompleteBudget[]
  sessions: CompleteSession[]
  accounts: CompleteAccount[]
}

/**
 * relatedUserSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedUserSchema: z.ZodSchema<CompleteUser> = z.lazy(() => userSchema.extend({
  moneyAccounts: relatedMoneyAccountSchema.array(),
  recurringRules: relatedRecurringTransactionRuleSchema.array(),
  transactions: relatedTransactionSchema.array(),
  budgets: relatedBudgetSchema.array(),
  sessions: relatedSessionSchema.array(),
  accounts: relatedAccountSchema.array(),
}))

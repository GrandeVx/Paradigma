import * as z from "zod"
import { Decimal } from "decimal.js"
import { RuleType, FrequencyType } from "@prisma/client"
import { CompleteUser, relatedUserSchema, CompleteSubCategory, relatedSubCategorySchema, CompleteTransaction, relatedTransactionSchema, CompleteMoneyAccount, relatedMoneyAccountSchema } from "./index"

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

export const recurringTransactionRuleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  description: z.string(),
  amount: z.number(),
  totalAmount: z.number().nullish(),
  type: z.nativeEnum(RuleType),
  subCategoryId: z.string().nullish(),
  startDate: z.date(),
  frequencyType: z.nativeEnum(FrequencyType),
  frequencyInterval: z.number().int(),
  dayOfWeek: z.number().int().nullish(),
  dayOfMonth: z.number().int().nullish(),
  nextDueDate: z.date(),
  endDate: z.date().nullish(),
  totalOccurrences: z.number().int().nullish(),
  occurrencesGenerated: z.number().int(),
  isInstallment: z.boolean(),
  lastProcessedAt: z.date().nullish(),
  processingKey: z.string().nullish(),
  isFirstOccurrenceGenerated: z.boolean(),
  transactionGroupId: z.string().nullish(),
  externalSystemId: z.string().nullish(),
  isActive: z.boolean(),
  notes: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  moneyAccountId: z.string().nullish(),
})

export interface CompleteRecurringTransactionRule extends z.infer<typeof recurringTransactionRuleSchema> {
  user: CompleteUser
  subCategory?: CompleteSubCategory | null
  generatedTransactions: CompleteTransaction[]
  moneyAccount?: CompleteMoneyAccount | null
}

/**
 * relatedRecurringTransactionRuleSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedRecurringTransactionRuleSchema: z.ZodSchema<CompleteRecurringTransactionRule> = z.lazy(() => recurringTransactionRuleSchema.extend({
  user: relatedUserSchema,
  subCategory: relatedSubCategorySchema.nullish(),
  generatedTransactions: relatedTransactionSchema.array(),
  moneyAccount: relatedMoneyAccountSchema.nullish(),
}))

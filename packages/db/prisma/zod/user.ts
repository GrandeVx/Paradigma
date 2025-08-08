import * as z from "zod"
import { SubscriptionStatus } from "@prisma/client"
import { CompleteSession, relatedSessionSchema, CompleteAccount, relatedAccountSchema } from "./index"

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
  isPremium: z.boolean(),
  subscriptionStatus: z.nativeEnum(SubscriptionStatus),
  subscriptionStartDate: z.date().nullish(),
  subscriptionEndDate: z.date().nullish(),
  trialEndDate: z.date().nullish(),
  superwallCustomerId: z.string().nullish(),
})

export interface CompleteUser extends z.infer<typeof userSchema> {
  sessions: CompleteSession[]
  accounts: CompleteAccount[]
}

/**
 * relatedUserSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedUserSchema: z.ZodSchema<CompleteUser> = z.lazy(() => userSchema.extend({
  sessions: relatedSessionSchema.array(),
  accounts: relatedAccountSchema.array(),
}))

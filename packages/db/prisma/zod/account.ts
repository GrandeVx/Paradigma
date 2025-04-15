import * as z from "zod"
import { CompleteUser, relatedUserSchema } from "./index"

export const accountSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().nullish(),
  refreshToken: z.string().nullish(),
  idToken: z.string().nullish(),
  accessTokenExpiresAt: z.date().nullish(),
  refreshTokenExpiresAt: z.date().nullish(),
  scope: z.string().nullish(),
  password: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteAccount extends z.infer<typeof accountSchema> {
  user: CompleteUser
}

/**
 * relatedAccountSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedAccountSchema: z.ZodSchema<CompleteAccount> = z.lazy(() => accountSchema.extend({
  user: relatedUserSchema,
}))

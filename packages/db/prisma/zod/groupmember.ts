import * as z from "zod"
import { CompleteUser, relatedUserSchema, CompleteGroup, relatedGroupSchema } from "./index"

export const groupMemberSchema = z.object({
  id: z.string(),
  joinedAt: z.date(),
  role: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  groupId: z.string(),
})

export interface CompleteGroupMember extends z.infer<typeof groupMemberSchema> {
  user: CompleteUser
  group: CompleteGroup
}

/**
 * relatedGroupMemberSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedGroupMemberSchema: z.ZodSchema<CompleteGroupMember> = z.lazy(() => groupMemberSchema.extend({
  user: relatedUserSchema,
  group: relatedGroupSchema,
}))

import * as z from "zod"
import { GroupRequestStatus } from "@prisma/client"
import { CompleteUser, relatedUserSchema, CompleteGroup, relatedGroupSchema } from "./index"

export const groupJoinRequestSchema = z.object({
  id: z.string(),
  message: z.string().nullish(),
  status: z.nativeEnum(GroupRequestStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  groupId: z.string(),
})

export interface CompleteGroupJoinRequest extends z.infer<typeof groupJoinRequestSchema> {
  user: CompleteUser
  group: CompleteGroup
}

/**
 * relatedGroupJoinRequestSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedGroupJoinRequestSchema: z.ZodSchema<CompleteGroupJoinRequest> = z.lazy(() => groupJoinRequestSchema.extend({
  user: relatedUserSchema,
  group: relatedGroupSchema,
}))

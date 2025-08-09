import * as z from "zod"
import { CompleteUser, relatedUserSchema, CompleteGroupMember, relatedGroupMemberSchema, CompletePost, relatedPostSchema, CompleteGroupJoinRequest, relatedGroupJoinRequestSchema } from "./index"

export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  isPublic: z.boolean(),
  image: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  ownerId: z.string(),
})

export interface CompleteGroup extends z.infer<typeof groupSchema> {
  owner: CompleteUser
  members: CompleteGroupMember[]
  posts: CompletePost[]
  joinRequests: CompleteGroupJoinRequest[]
}

/**
 * relatedGroupSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedGroupSchema: z.ZodSchema<CompleteGroup> = z.lazy(() => groupSchema.extend({
  owner: relatedUserSchema,
  members: relatedGroupMemberSchema.array(),
  posts: relatedPostSchema.array(),
  joinRequests: relatedGroupJoinRequestSchema.array(),
}))

import * as z from "zod"
import { CompleteUser, relatedUserSchema, CompleteGroup, relatedGroupSchema, CompleteLike, relatedLikeSchema, CompleteComment, relatedCommentSchema } from "./index"

export const postSchema = z.object({
  id: z.string(),
  content: z.string(),
  isPublic: z.boolean(),
  isDeleted: z.boolean(),
  deletedAt: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  authorId: z.string(),
  groupId: z.string(),
})

export interface CompletePost extends z.infer<typeof postSchema> {
  author: CompleteUser
  group: CompleteGroup
  likes: CompleteLike[]
  comments: CompleteComment[]
}

/**
 * relatedPostSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedPostSchema: z.ZodSchema<CompletePost> = z.lazy(() => postSchema.extend({
  author: relatedUserSchema,
  group: relatedGroupSchema,
  likes: relatedLikeSchema.array(),
  comments: relatedCommentSchema.array(),
}))

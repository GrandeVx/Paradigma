import * as z from "zod"
import { CompleteUser, relatedUserSchema, CompletePost, relatedPostSchema } from "./index"

export const commentSchema = z.object({
  id: z.string(),
  content: z.string(),
  isDeleted: z.boolean(),
  deletedAt: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  authorId: z.string(),
  postId: z.string(),
  parentId: z.string().nullish(),
})

export interface CompleteComment extends z.infer<typeof commentSchema> {
  author: CompleteUser
  post: CompletePost
  parent?: CompleteComment | null
  replies: CompleteComment[]
}

/**
 * relatedCommentSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedCommentSchema: z.ZodSchema<CompleteComment> = z.lazy(() => commentSchema.extend({
  author: relatedUserSchema,
  post: relatedPostSchema,
  parent: relatedCommentSchema.nullish(),
  replies: relatedCommentSchema.array(),
}))

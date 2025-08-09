import * as z from "zod"
import { CompleteUser, relatedUserSchema, CompletePost, relatedPostSchema } from "./index"

export const likeSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  userId: z.string(),
  postId: z.string(),
})

export interface CompleteLike extends z.infer<typeof likeSchema> {
  user: CompleteUser
  post: CompletePost
}

/**
 * relatedLikeSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedLikeSchema: z.ZodSchema<CompleteLike> = z.lazy(() => likeSchema.extend({
  user: relatedUserSchema,
  post: relatedPostSchema,
}))

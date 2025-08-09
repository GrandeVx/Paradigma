import { z } from "zod";

// Like operations schemas
export const toggleLikeSchema = z.object({
  postId: z.string().uuid(),
});

export const getPostLikesSchema = z.object({
  postId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
});

export const getLikeStatusSchema = z.object({
  postId: z.string().uuid(),
});

export const getPostLikesCountSchema = z.object({
  postId: z.string().uuid(),
});
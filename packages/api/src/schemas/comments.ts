import { z } from "zod";

// Comment operations schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(1000, "Comment too long"),
  postId: z.string().uuid(),
  parentId: z.string().uuid().optional(), // For replies
});

export const updateCommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1, "Comment content is required").max(1000, "Comment too long"),
});

export const deleteCommentSchema = z.object({
  id: z.string().uuid(),
});

export const getCommentSchema = z.object({
  id: z.string().uuid(),
});

// Comment listing schemas
export const getPostCommentsSchema = z.object({
  postId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
  includeReplies: z.boolean().default(true),
});

export const getCommentRepliesSchema = z.object({
  commentId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
});

export const getCommentThreadSchema = z.object({
  commentId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(20),
});
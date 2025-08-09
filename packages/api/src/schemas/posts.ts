import { z } from "zod";

// Base schemas for post operations
export const createPostSchema = z.object({
  content: z.string().min(1, "Post content is required").max(2000, "Post content too long"),
  groupId: z.string().uuid(),
  isPublic: z.boolean().default(true),
});

export const updatePostSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1, "Post content is required").max(2000, "Post content too long"),
});

export const getPostSchema = z.object({
  id: z.string().uuid(),
});

export const deletePostSchema = z.object({
  id: z.string().uuid(),
});

// Post listing and filtering schemas
export const getGroupPostsSchema = z.object({
  groupId: z.string().uuid(),
  limit: z.number().min(1).max(50).default(20),
  cursor: z.string().uuid().optional(),
  onlyPublic: z.boolean().default(false),
});

export const getUserPostsSchema = z.object({
  userId: z.string().uuid().optional(), // If not provided, gets current user's posts
  limit: z.number().min(1).max(50).default(20),
  cursor: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(), // Filter by specific group
});

export const getFeedPostsSchema = z.object({
  limit: z.number().min(1).max(50).default(20),
  cursor: z.string().uuid().optional(),
  onlyFollowedGroups: z.boolean().default(false),
});
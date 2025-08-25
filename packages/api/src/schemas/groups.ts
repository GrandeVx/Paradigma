import { z } from "zod";

// Base schemas for group operations
export const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100, "Group name too long"),
  description: z.string().max(500, "Description too long").optional(),
  isPublic: z.boolean().default(true),
  image: z.string().url().optional(),
});

export const updateGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Group name is required").max(100, "Group name too long").optional(),
  description: z.string().max(500, "Description too long").optional(),
  isPublic: z.boolean().optional(),
  image: z.string().url().optional(),
});

export const getGroupSchema = z.object({
  id: z.string().uuid(),
});

export const deleteGroupSchema = z.object({
  id: z.string().uuid(),
});

// Group member management schemas
export const getGroupMembersSchema = z.object({
  groupId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
});

export const removeMemberSchema = z.object({
  groupId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const updateMemberRoleSchema = z.object({
  groupId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["member", "moderator", "admin"]),
});

// Group listing schemas
export const listGroupsSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  onlyPublic: z.boolean().default(false),
});

// Group join request schemas
export const requestJoinSchema = z.object({
  groupId: z.string().uuid(),
  message: z.string().max(500, "Join message too long").optional(),
});

export const getPendingRequestsSchema = z.object({
  groupId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
});

export const respondToRequestSchema = z.object({
  requestId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
});

export const cancelRequestSchema = z.object({
  requestId: z.string().uuid(),
});

export const getUserPendingRequestsSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
});

// Leave group schema
export const leaveGroupSchema = z.object({
  groupId: z.string().uuid(),
});
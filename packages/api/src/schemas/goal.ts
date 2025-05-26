import { z } from "zod";

// Schema for listing all goals
export const listGoalsSchema = z.object({});

// Schema for getting goal by ID with progress
export const getGoalByIdWithProgressSchema = z.object({
  goalId: z.string(),
});

// Schema for creating a goal
export const createGoalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  targetDate: z.date().optional(),
  description: z.string().optional(),
  iconName: z.string().optional(),
  color: z.string().optional(),
});

// Schema for updating a goal
export const updateGoalSchema = z.object({
  goalId: z.string(),
  name: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  targetDate: z.date().nullish(),
  description: z.string().nullish(),
  iconName: z.string().nullish(),
  color: z.string().nullish(),
});

// Schema for deleting a goal
export const deleteGoalSchema = z.object({
  goalId: z.string(),
}); 
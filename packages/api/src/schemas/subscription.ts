import { z } from "zod";

// Superwall subscription status enum - matching the mobile app
export const SubscriptionStatusEnum = z.enum([
  "FREE",
  "TRIAL", 
  "ACTIVE",
  "EXPIRED",
  "CANCELLED"
]);

// Schema for syncing subscription status from Superwall
export const syncSubscriptionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  status: SubscriptionStatusEnum,
  isActive: z.boolean(),
  superwallCustomerId: z.string().optional(),
  subscriptionStartDate: z.date().optional(),
  subscriptionEndDate: z.date().optional(),
  trialEndDate: z.date().optional(),
});

// Schema for getting subscription status
export const getSubscriptionStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required").optional(), // Optional for current user
});

// Schema for Superwall webhook events
export const superwallWebhookSchema = z.object({
  event_type: z.string(),
  user_id: z.string(),
  customer_id: z.string().optional(),
  subscription_status: z.string().optional(),
  subscription_start_date: z.string().optional(),
  subscription_end_date: z.string().optional(),
  trial_end_date: z.string().optional(),
  // Additional webhook data
  product_id: z.string().optional(),
  transaction_id: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
});
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure } from "../../trpc";
import { syncSubscriptionSchema, superwallWebhookSchema } from "../../schemas/subscription";

export const mutations = {
  // Sync subscription status from Superwall (called by mobile app)
  sync: protectedProcedure
    .input(syncSubscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session?.user?.id;
      
      // Ensure user can only sync their own subscription
      if (currentUserId !== input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only sync your own subscription status",
        });
      }

      console.log(`[Subscription] Syncing status for user ${input.userId}:`, {
        status: input.status,
        isActive: input.isActive,
        superwallCustomerId: input.superwallCustomerId,
      });

      try {
        const updatedUser = await ctx.db.user.update({
          where: { id: input.userId },
          data: {
            isPremium: input.isActive,
            subscriptionStatus: input.status,
            subscriptionStartDate: input.subscriptionStartDate,
            subscriptionEndDate: input.subscriptionEndDate,
            trialEndDate: input.trialEndDate,
            superwallCustomerId: input.superwallCustomerId,
          },
          select: {
            id: true,
            isPremium: true,
            subscriptionStatus: true,
            subscriptionStartDate: true,
            subscriptionEndDate: true,
            trialEndDate: true,
            superwallCustomerId: true,
          },
          // Invalidate subscription cache when updated
          uncache: {
            uncacheKeys: [
              `balanceapp:subscription:${input.userId}`,
              `balanceapp:access:${input.userId}`,
              `balanceapp:user:id:${input.userId}`, // Also invalidate user cache
            ]
          }
        });

        console.log(`[Subscription] Successfully synced subscription for user ${input.userId}`);
        return {
          success: true,
          user: updatedUser,
        };

      } catch (error) {
        console.error(`[Subscription] Failed to sync subscription for user ${input.userId}:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync subscription status",
        });
      }
    }),

  // Handle Superwall webhook events (public endpoint for webhooks)
  webhook: publicProcedure
    .input(superwallWebhookSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(`[Subscription] Received webhook event:`, {
        eventType: input.event_type,
        userId: input.user_id,
        customerId: input.customer_id,
        status: input.subscription_status,
      });

      try {
        // Find user by Superwall customer ID or user ID
        let user = null;
        
        if (input.customer_id) {
          user = await ctx.db.user.findFirst({
            where: { superwallCustomerId: input.customer_id },
          });
        }
        
        if (!user && input.user_id) {
          user = await ctx.db.user.findUnique({
            where: { id: input.user_id },
          });
        }

        if (!user) {
          console.warn(`[Subscription] User not found for webhook:`, {
            userId: input.user_id,
            customerId: input.customer_id,
          });
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Map subscription status from webhook
        let subscriptionStatus: string;
        let isPremium = false;

        switch (input.subscription_status) {
          case "active":
            subscriptionStatus = "ACTIVE";
            isPremium = true;
            break;
          case "trial":
            subscriptionStatus = "TRIAL";
            isPremium = true;
            break;
          case "expired":
            subscriptionStatus = "EXPIRED";
            isPremium = false;
            break;
          case "cancelled":
            subscriptionStatus = "CANCELLED";  
            isPremium = false;
            break;
          default:
            subscriptionStatus = "FREE";
            isPremium = false;
            break;
        }

        // Parse dates if provided
        const subscriptionStartDate = input.subscription_start_date 
          ? new Date(input.subscription_start_date) 
          : undefined;
        const subscriptionEndDate = input.subscription_end_date 
          ? new Date(input.subscription_end_date) 
          : undefined;
        const trialEndDate = input.trial_end_date 
          ? new Date(input.trial_end_date) 
          : undefined;

        // Update user subscription status
        const updatedUser = await ctx.db.user.update({
          where: { id: user.id },
          data: {
            isPremium,
            subscriptionStatus: subscriptionStatus as any,
            subscriptionStartDate,
            subscriptionEndDate,
            trialEndDate,
            superwallCustomerId: input.customer_id || user.superwallCustomerId,
          },
          // Invalidate caches
          uncache: {
            uncacheKeys: [
              `balanceapp:subscription:${user.id}`,
              `balanceapp:access:${user.id}`,
              `balanceapp:user:id:${user.id}`,
            ]
          }
        });

        console.log(`[Subscription] Successfully processed webhook for user ${user.id}`);
        
        return {
          success: true,
          message: `Webhook processed for user ${user.id}`,
          eventType: input.event_type,
        };

      } catch (error) {
        console.error(`[Subscription] Webhook processing failed:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process webhook",
        });
      }
    }),
};
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure } from "../../trpc";
import { getSubscriptionStatusSchema } from "../../schemas/subscription";

export const queries = {
  // Get subscription status for current user or specific user
  getStatus: protectedProcedure
    .input(getSubscriptionStatusSchema)
    .query(async ({ ctx, input }) => {
      const targetUserId = input?.userId || ctx.session?.user?.id;
      
      if (!targetUserId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User ID is required",
        });
      }

      // Check if user is requesting their own data or if they have admin permissions
      const currentUserId = ctx.session?.user?.id;
      if (currentUserId !== targetUserId) {
        // In the future, you might want to add admin role checking here
        throw new TRPCError({
          code: "FORBIDDEN", 
          message: "You can only access your own subscription status",
        });
      }

      const user = await ctx.db.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          isPremium: true,
          subscriptionStatus: true,
          subscriptionStartDate: true,
          subscriptionEndDate: true,
          trialEndDate: true,
          superwallCustomerId: true,
        },
        // Cache the subscription status for performance
        cache: {
          key: `balanceapp:subscription:${targetUserId}`,
          ttl: 300, // 5 minutes cache
        }
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Calculate if subscription is currently active
      const now = new Date();
      const isActiveByDate = user.subscriptionEndDate ? now <= user.subscriptionEndDate : false;
      const isTrialActive = user.trialEndDate ? now <= user.trialEndDate : false;
      
      return {
        ...user,
        isActiveByDate,
        isTrialActive,
        hasActiveSubscription: user.isPremium && (isActiveByDate || isTrialActive),
      };
    }),

  // Check if user has access to premium features (lightweight endpoint)
  checkAccess: protectedProcedure
    .query(async ({ ctx }) => {
      const currentUserId = ctx.session?.user?.id;
      
      if (!currentUserId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const user = await ctx.db.user.findUnique({
        where: { id: currentUserId },
        select: {
          isPremium: true,
          subscriptionStatus: true,
          subscriptionEndDate: true,
          trialEndDate: true,
        },
        // Cache for even faster access checks
        cache: {
          key: `balanceapp:access:${currentUserId}`,
          ttl: 60, // 1 minute cache for access checks
        }
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const now = new Date();
      const isActiveByDate = user.subscriptionEndDate ? now <= user.subscriptionEndDate : false;
      const isTrialActive = user.trialEndDate ? now <= user.trialEndDate : false;
      
      return {
        hasAccess: user.isPremium && (isActiveByDate || isTrialActive),
        subscriptionStatus: user.subscriptionStatus,
        isPremium: user.isPremium,
      };
    }),
};
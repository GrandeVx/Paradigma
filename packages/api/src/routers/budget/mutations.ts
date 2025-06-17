import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { setBudgetAmountSchema } from "../../schemas/budget";

export const mutations = {
  setAmount: protectedProcedure
    .input(setBudgetAmountSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify macro category exists
      const macroCategory = await ctx.db.macroCategory.findUnique({
        where: {
          id: input.macroCategoryId,
        },
      });
      
      if (!macroCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Macro category not found"
        });
      }
      
      // Only allow setting budgets for expense categories
      if (macroCategory.type !== "EXPENSE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Budgets can only be set for expense categories"
        });
      }
      
      // Create precise cache keys for invalidation
      const budgetListCacheKey = ctx.db.getKey({ 
        params: [{ prisma: 'Budget' }, { operation: 'getCurrentSettings' }, { userId: userId }] 
      });
      
      // Use upsert to create or update the budget
      const budget = await ctx.db.budget.upsert({
        where: {
          userId_macroCategoryId: {
            userId,
            macroCategoryId: input.macroCategoryId,
          },
        },
        update: {
          allocatedAmount: input.allocatedAmount,
        },
        create: {
          userId,
          macroCategoryId: input.macroCategoryId,
          allocatedAmount: input.allocatedAmount,
        },
        // Invalidate budget-related caches
        uncache: {
          uncacheKeys: [
            // Invalidate user's budget list with precise key
            budgetListCacheKey,
            
            // Keep pattern-based invalidation for transaction aggregates
            `balanceapp:transaction:operation:aggregate:macro_category_id:${input.macroCategoryId}*`,
            `balanceapp:transaction:op:aggregate:user_id:${userId}:*`
          ],
          hasPattern: true
        }
      });
      
      return budget;
    })
}; 
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
            // Invalidate specific budget cache
            `balanceapp:budget:user_id:${userId}:macro_category_id:${input.macroCategoryId}*`,
            // Invalidate user's budget list
            `balanceapp:budget:user_id:${userId}*`,
            // Invalidate category aggregates that might show budget vs. actual
            `balanceapp:transaction:operation:aggregate:macro_category_id:${input.macroCategoryId}*`
          ],
          hasPattern: true
        }
      });
      
      return budget;
    }),
}; 
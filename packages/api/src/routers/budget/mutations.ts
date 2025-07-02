import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { setBudgetAmountSchema } from "../../schemas/budget";
import { getBudgetInvalidationKeys } from "../../utils/cacheInvalidation";

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
          uncacheKeys: getBudgetInvalidationKeys(ctx.db, userId, input.macroCategoryId)
        }
      });
      
      return budget;
    })
}; 
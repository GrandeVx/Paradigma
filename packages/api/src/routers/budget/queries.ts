import { protectedProcedure } from "../../trpc";
import { getCurrentBudgetSettingsSchema } from "../../schemas/budget";
import { CacheKeys, CacheTTL, formatCacheKeyParams } from "../../utils/cacheKeys";

export const queries = {
  getCurrentSettings: protectedProcedure
    .input(getCurrentBudgetSettingsSchema)
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      // Create custom cache key for this user's budget list
      const cacheKey = ctx.db.getKey({ 
        params: formatCacheKeyParams(
          CacheKeys.budget.getCurrentSettings(userId)
        )
      });
      
      // Get all budget settings for the user, including macro category details
      const budgets = await ctx.db.budget.findMany({
        where: {
          userId,
        },
        include: {
          macroCategory: true,
        },
        cache: { 
          ttl: CacheTTL.budgetList,
          key: cacheKey 
        }
      });
      
      return budgets;
    }),
}; 
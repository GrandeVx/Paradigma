import { protectedProcedure } from "../../trpc";
import { getCurrentBudgetSettingsSchema } from "../../schemas/budget";

export const queries = {
  getCurrentSettings: protectedProcedure
    .input(getCurrentBudgetSettingsSchema)
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      // Create custom cache key for this user's budget list
      const cacheKey = ctx.db.getKey({ 
        params: [{ prisma: 'Budget' }, { operation: 'getCurrentSettings' }, { userId: userId }] 
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
          ttl: 300, // 5 minutes TTL for budget lists
          key: cacheKey 
        }
      });
      
      return budgets;
    }),
}; 
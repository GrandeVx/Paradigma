import { protectedProcedure } from "../../trpc";
import { getCurrentBudgetSettingsSchema } from "../../schemas/budget";

export const queries = {
  getCurrentSettings: protectedProcedure
    .input(getCurrentBudgetSettingsSchema)
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      
      // Get all budget settings for the user, including macro category details
      const budgets = await ctx.db.budget.findMany({
        where: {
          userId,
        },
        include: {
          macroCategory: true,
        },
      });
      
      return budgets;
    }),
}; 
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { getGoalByIdWithProgressSchema, listGoalsSchema } from "../../schemas/goal";

export const queries = {
  list: protectedProcedure
    .input(listGoalsSchema)
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
    
      const goals = await ctx.db.goal.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      
      return goals;
    }),
    
  getByIdWithProgress: protectedProcedure
    .input(getGoalByIdWithProgressSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Get the goal
      const goal = await ctx.db.goal.findFirst({
        where: {
          id: input.goalId,
          userId,
        },
      });
      
      if (!goal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Goal not found"
        });
      }
      
      // Calculate total contributions from transactions
      const transactions = await ctx.db.transaction.findMany({
        where: {
          goalId: input.goalId,
          userId,
        },
        select: {
          amount: true,
        },
      });
      
      // Sum all transaction amounts
      // For expense transactions (negative), we consider the absolute value as contribution
      // For income transactions (positive), we consider them as is
      const totalContributed = transactions.reduce(
        (sum, transaction) => {
          const amount = Number(transaction.amount);
          return sum + (amount < 0 ? Math.abs(amount) : amount);
        }, 
        0
      );
      
      // Calculate progress as percentage
      const targetAmount = Number(goal.targetAmount);
      const progressPercentage = Math.min(100, (totalContributed / targetAmount) * 100);
      
      return {
        goal,
        progress: progressPercentage,
        totalContributed,
      };
    }),
}; 
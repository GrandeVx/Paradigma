import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { createGoalSchema, deleteGoalSchema, updateGoalSchema } from "../../schemas/goal";

export const mutations = {
  create: protectedProcedure
    .input(createGoalSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const goal = await ctx.db.goal.create({
        data: {
          ...input,
          userId,
        },
        // Invalidate goals list cache
        uncache: {
          uncacheKeys: [
            // Invalidate user's goals list
            `balanceapp:goal:user_id:${userId}*`,
            `balanceapp:money_account:user_id:${userId}*`
          ],
          hasPattern: true
        }
      });
      
      return goal;
    }),
    
  update: protectedProcedure
    .input(updateGoalSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify goal belongs to user
      const existingGoal = await ctx.db.goal.findFirst({
        where: {
          id: input.goalId,
          userId,
        },
      });
      
      if (!existingGoal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Goal not found"
        });
      }
      
      // Prepare update data
      const updateData: Record<string, unknown> = {};
      
      if (input.name) updateData.name = input.name;
      if (input.targetAmount) updateData.targetAmount = input.targetAmount;
      if ('targetDate' in input) updateData.targetDate = input.targetDate;
      if ('description' in input) updateData.description = input.description;
      if ('iconName' in input) updateData.iconName = input.iconName;
      if ('color' in input) updateData.color = input.color;
      
      // Update goal
      const updatedGoal = await ctx.db.goal.update({
        where: {
          id: input.goalId,
        },
        data: updateData,
        // Invalidate goal caches
        uncache: {
          uncacheKeys: [
            // Invalidate specific goal cache
            `balanceapp:goal:id:${input.goalId}*`,
            // Invalidate user's goals list
            `balanceapp:goal:user_id:${userId}*`,
            // Invalidate goal progress aggregates
            `balanceapp:transaction:operation:aggregate:goal_id:${input.goalId}*`
          ],
          hasPattern: true
        }
      });
      
      return updatedGoal;
    }),
    
  delete: protectedProcedure
    .input(deleteGoalSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify goal belongs to user
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
      
      // Remove goal reference from transactions
      await ctx.db.transaction.updateMany({
        where: {
          goalId: input.goalId,
          userId,
        },
        data: {
          goalId: null,
        },
        // Invalidate transaction caches
        uncache: {
          uncacheKeys: [
            // Invalidate transaction lists for this user
            `balanceapp:transaction:user_id:${userId}*`,
            // Invalidate transactions with this goal
            `balanceapp:transaction:goal_id:${input.goalId}*`
          ],
          hasPattern: true
        }
      });
      
      // Remove goal reference from recurring rules
      await ctx.db.recurringTransactionRule.updateMany({
        where: {
          goalId: input.goalId,
          userId,
        },
        data: {
          goalId: null,
        },
        // Invalidate recurring rule caches
        uncache: {
          uncacheKeys: [
            // Invalidate recurring rules for this user
            `balanceapp:recurring_transaction_rule:user_id:${userId}*`,
            // Invalidate recurring rules with this goal
            `balanceapp:recurring_transaction_rule:goal_id:${input.goalId}*`
          ],
          hasPattern: true
        }
      });
      
      // Delete goal
      await ctx.db.goal.delete({
        where: {
          id: input.goalId,
        },
        // Invalidate goal caches
        uncache: {
          uncacheKeys: [
            // Invalidate specific goal cache
            `balanceapp:goal:id:${input.goalId}*`,
            // Invalidate user's goals list
            `balanceapp:goal:user_id:${userId}*`,
            // Invalidate goal progress aggregates
            `balanceapp:transaction:operation:aggregate:goal_id:${input.goalId}*`
          ],
          hasPattern: true
        }
      });
      
      return { success: true };
    }),
}; 
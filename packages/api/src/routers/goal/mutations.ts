import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { createGoalSchema, deleteGoalSchema, updateGoalSchema } from "../../schemas/goal";
import { getGoalInvalidationKeys } from "../../utils/cacheInvalidation";

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
          uncacheKeys: getGoalInvalidationKeys(ctx.db, userId)
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
          uncacheKeys: getGoalInvalidationKeys(ctx.db, userId, input.goalId)
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
        }
      });
      
      // Delete goal
      await ctx.db.goal.delete({
        where: {
          id: input.goalId,
        },
        // Invalidate goal caches
        uncache: {
          uncacheKeys: getGoalInvalidationKeys(ctx.db, userId, input.goalId)
        }
      });
      
      return { success: true };
    }),
}; 
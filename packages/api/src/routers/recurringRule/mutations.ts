import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import {
  createRecurringRuleSchema,
  deleteRecurringRuleSchema,
  toggleRecurringRuleSchema,
  updateRecurringRuleSchema,
  convertFrequencySchema
} from "../../schemas/recurringRule";
import { calculateNextOccurrenceDate, convertDaysToFrequency } from "../../utils/dateCalculations";
import { getRecurringRuleInvalidationKeys } from "../../utils/cacheInvalidation";

export const mutations = {
  create: protectedProcedure
    .input(createRecurringRuleSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify account belongs to user
      const account = await ctx.db.moneyAccount.findFirst({
        where: {
          id: input.accountId,
          userId,
        },
      });
      
      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found"
        });
      }
      
      // Verify category if provided
      if (input.subCategoryId) {
        const subCategory = await ctx.db.subCategory.findUnique({
          where: { id: input.subCategoryId },
        });
        
        if (!subCategory) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }
      }
      
      // Convert input dates to UTC to ensure consistency
      const startDateUTC = new Date(input.startDate.toISOString());
      const endDateUTC = input.endDate ? new Date(input.endDate.toISOString()) : null;
      
      // For MONTHLY frequency, extract day of month from startDate if not provided
      let dayOfMonth = input.dayOfMonth;
      if (input.frequencyType === "MONTHLY" && !dayOfMonth) {
        dayOfMonth = startDateUTC.getUTCDate();
      }
      
      // Calculate next due date based on start date and frequency
      const nextDueDate = calculateNextOccurrenceDate(
        startDateUTC,
        input.frequencyType,
        input.frequencyInterval,
        dayOfMonth || null,
        input.dayOfWeek || null
      );
      
      // Create the recurring rule
      const recurringRule = await ctx.db.recurringTransactionRule.create({
        data: {
          userId,
          moneyAccountId: input.accountId,
          description: input.description,
          amount: input.amount,
          totalAmount: input.totalAmount || null,
          type: input.type,
          subCategoryId: input.subCategoryId || null,
          
          // Recurrence logic
          startDate: startDateUTC,
          frequencyType: input.frequencyType,
          frequencyInterval: input.frequencyInterval,
          dayOfWeek: input.dayOfWeek || null,
          dayOfMonth: dayOfMonth || null,
          nextDueDate,
          
          // End conditions
          endDate: endDateUTC,
          totalOccurrences: input.totalOccurrences || null,
          isInstallment: input.isInstallment || false,
          
          // Notes
          notes: input.notes || null,
        },
        uncache: {
          uncacheKeys: getRecurringRuleInvalidationKeys(ctx.db, userId, undefined, input.isInstallment)
        }
      });
      
      // Check if the first occurrence starts today or in the past (in UTC)
      // Skip auto-creation for installments as they are handled by the UI
      const todayUTC = new Date();
      todayUTC.setUTCHours(0, 0, 0, 0);
      const startDateNormalizedUTC = new Date(startDateUTC);
      startDateNormalizedUTC.setUTCHours(0, 0, 0, 0);
      
      if (startDateNormalizedUTC <= todayUTC && !input.isInstallment) {
        // Calculate the signed amount based on type
        const signedAmount = input.type === "EXPENSE" 
          ? -Math.abs(input.amount) 
          : Math.abs(input.amount);
        
        // Create the first transaction
        await ctx.db.transaction.create({
          data: {
            userId,
            moneyAccountId: input.accountId,
            description: input.description,
            amount: signedAmount,
            date: startDateUTC,
            subCategoryId: input.subCategoryId || null,
            notes: input.notes || null,
            isRecurringInstance: true,
            recurringRuleId: recurringRule.id,
          },
          // Transaction creation has its own cache invalidation
        });
        
        // Update the recurring rule to track that first occurrence was generated
        await ctx.db.recurringTransactionRule.update({
          where: { id: recurringRule.id },
          data: {
            occurrencesGenerated: 1,
            isFirstOccurrenceGenerated: true,
          },
          uncache: {
            uncacheKeys: getRecurringRuleInvalidationKeys(ctx.db, userId, recurringRule.id, input.isInstallment)
          }
        });
      }
      
      return recurringRule;
    }),
    
  update: protectedProcedure
    .input(updateRecurringRuleSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify recurring rule belongs to user
      const existingRule = await ctx.db.recurringTransactionRule.findFirst({
        where: {
          id: input.ruleId,
          userId,
        },
      });
      
      if (!existingRule) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurring rule not found",
        });
      }
      
      // Verify new account if changing
      if (input.accountId && input.accountId !== existingRule.moneyAccountId) {
        const account = await ctx.db.moneyAccount.findFirst({
          where: {
            id: input.accountId,
            userId,
          },
        });
        
        if (!account) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Account not found",
          });
        }
      }
      
      // Verify new category if changing
      if (input.subCategoryId !== undefined && input.subCategoryId !== existingRule.subCategoryId) {
        if (input.subCategoryId) {
          const subCategory = await ctx.db.subCategory.findUnique({
            where: { id: input.subCategoryId },
          });
          
          if (!subCategory) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Category not found",
            });
          }
        }
      }
      
      // Prepare update data
      const updateData: Record<string, unknown> = {};
      
      if (input.accountId !== undefined) updateData.moneyAccountId = input.accountId;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.amount !== undefined) updateData.amount = input.amount;
      if (input.totalAmount !== undefined) updateData.totalAmount = input.totalAmount;
      if (input.type !== undefined) updateData.type = input.type;
      if (input.subCategoryId !== undefined) updateData.subCategoryId = input.subCategoryId;
      if (input.frequencyType !== undefined) updateData.frequencyType = input.frequencyType;
      if (input.frequencyInterval !== undefined) updateData.frequencyInterval = input.frequencyInterval;
      if (input.dayOfWeek !== undefined) updateData.dayOfWeek = input.dayOfWeek;
      if (input.dayOfMonth !== undefined) updateData.dayOfMonth = input.dayOfMonth;
      if (input.endDate !== undefined) updateData.endDate = input.endDate;
      if (input.totalOccurrences !== undefined) updateData.totalOccurrences = input.totalOccurrences;
      if (input.occurrencesGenerated !== undefined) updateData.occurrencesGenerated = input.occurrencesGenerated;
      if (input.isFirstOccurrenceGenerated !== undefined) updateData.isFirstOccurrenceGenerated = input.isFirstOccurrenceGenerated;
      if (input.nextDueDate !== undefined) updateData.nextDueDate = input.nextDueDate;
      if (input.notes !== undefined) updateData.notes = input.notes;
      
      // If frequency settings changed, recalculate next due date
      if (
        input.frequencyType !== undefined ||
        input.frequencyInterval !== undefined ||
        input.dayOfWeek !== undefined ||
        input.dayOfMonth !== undefined
      ) {
        const lastOccurrenceDate = existingRule.nextDueDate;
        const nextDueDate = calculateNextOccurrenceDate(
          lastOccurrenceDate,
          input.frequencyType || existingRule.frequencyType,
          input.frequencyInterval || existingRule.frequencyInterval,
          input.dayOfMonth !== undefined ? input.dayOfMonth : existingRule.dayOfMonth,
          input.dayOfWeek !== undefined ? input.dayOfWeek : existingRule.dayOfWeek
        );
        updateData.nextDueDate = nextDueDate;
      }
      
      // Update the rule
      const updatedRule = await ctx.db.recurringTransactionRule.update({
        where: { id: input.ruleId },
        data: updateData,
        uncache: {
          uncacheKeys: getRecurringRuleInvalidationKeys(ctx.db, userId, input.ruleId, existingRule.isInstallment)
        }
      });
      
      return updatedRule;
    }),
    
  toggle: protectedProcedure
    .input(toggleRecurringRuleSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify recurring rule belongs to user
      const existingRule = await ctx.db.recurringTransactionRule.findFirst({
        where: {
          id: input.ruleId,
          userId,
        },
      });
      
      if (!existingRule) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurring rule not found",
        });
      }
      
      // Toggle the active status
      const updatedRule = await ctx.db.recurringTransactionRule.update({
        where: { id: input.ruleId },
        data: {
          isActive: !existingRule.isActive,
        },
        uncache: {
          uncacheKeys: getRecurringRuleInvalidationKeys(ctx.db, userId, input.ruleId, existingRule.isInstallment)
        }
      });
      
      return updatedRule;
    }),
    
  delete: protectedProcedure
    .input(deleteRecurringRuleSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify recurring rule belongs to user
      const existingRule = await ctx.db.recurringTransactionRule.findFirst({
        where: {
          id: input.ruleId,
          userId,
        },
      });
      
      if (!existingRule) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurring rule not found",
        });
      }
      
      // Check if any transactions have been generated from this rule
      const hasTransactions = await ctx.db.transaction.count({
        where: {
          recurringRuleId: input.ruleId,
        },
      });
      
      if (hasTransactions > 0 && !input.deleteFutureTransactions) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete recurring rule with existing transactions. Set deleteTransactions to true to delete all related transactions.",
        });
      }
      
      // Delete in transaction to ensure consistency
      await ctx.db.$transaction(async (tx) => {
        if (input.deleteFutureTransactions) {
          // Delete all transactions generated from this rule
          await tx.transaction.deleteMany({
            where: {
              recurringRuleId: input.ruleId,
            },
          });
        }
        
        // Delete the recurring rule
        await tx.recurringTransactionRule.delete({
          where: { id: input.ruleId },
          uncache: {
            uncacheKeys: getRecurringRuleInvalidationKeys(ctx.db, userId, input.ruleId, existingRule.isInstallment)
          }
        });
      });
      
      
      return { success: true };
    }),
    
  // Convert a frequency in days to a structured frequency type
  convertFrequency: protectedProcedure
    .input(convertFrequencySchema)
    .mutation(async ({ input }) => {
      const result = convertDaysToFrequency(input.frequencyDays);
      return result;
    }),
};
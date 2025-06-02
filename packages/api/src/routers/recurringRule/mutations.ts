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



// // Helper to calculate the next due date based on the rule settings
// function calculateNextDueDate(
//   startDate: Date,
//   frequencyType: string,
//   frequencyInterval: number,
//   dayOfWeek?: number | null,
//   dayOfMonth?: number | null
// ): Date {
//   const nextDate = new Date(startDate);
  
//   switch (frequencyType) {
//     case "DAILY":
//       nextDate.setDate(nextDate.getDate() + frequencyInterval);
//       break;
//     case "WEEKLY":
//       // If dayOfWeek is specified, find the next occurrence of that day
//       if (dayOfWeek !== undefined && dayOfWeek !== null) {
//         // Adjust to the specified day of week
//         const currentDay = nextDate.getDay();
//         const daysToAdd = (dayOfWeek - currentDay + 7) % 7;
//         nextDate.setDate(nextDate.getDate() + daysToAdd);
//       }
//       // Add the frequency interval in weeks
//       nextDate.setDate(nextDate.getDate() + (frequencyInterval * 7));
//       break;
//     case "MONTHLY":
//       // If dayOfMonth is specified, set to that day
//       if (dayOfMonth !== undefined && dayOfMonth !== null) {
//         nextDate.setDate(Math.min(dayOfMonth, getDaysInMonth(nextDate.getFullYear(), nextDate.getMonth() + 1)));
//       }
//       // Add the frequency interval in months
//       nextDate.setMonth(nextDate.getMonth() + frequencyInterval);
//       break;
//     case "YEARLY":
//       nextDate.setFullYear(nextDate.getFullYear() + frequencyInterval);
//       break;
//   }
  
//   return nextDate;
// }

// // Helper to get the number of days in a month
// function getDaysInMonth(year: number, month: number): number {
//   return new Date(year, month, 0).getDate();
// }

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
      
      // TODO: Implement goal verification after goal refactor to MoneyAccount
      // Verify goal if provided
      // if (input.goalId) {
      //   const goal = await ctx.db.goal.findFirst({
      //     where: {
      //       id: input.goalId,
      //       userId,
      //     },
      //   });
      //   
      //   if (!goal) {
      //     throw new TRPCError({
      //       code: "NOT_FOUND",
      //       message: "Goal not found",
      //     });
      //   }
      // }
      
      // For MONTHLY frequency, extract day of month from startDate if not provided
      let dayOfMonth = input.dayOfMonth;
      if (input.frequencyType === "MONTHLY" && !dayOfMonth) {
        dayOfMonth = input.startDate.getDate();
      }
      
      // Calculate next due date based on start date and frequency
      const nextDueDate = calculateNextOccurrenceDate(
        input.startDate,
        input.frequencyType,
        input.frequencyInterval,
        dayOfMonth || null,
        input.dayOfWeek || null
      );
      
      // Create the recurring rule and first transaction in a transaction
      return await ctx.db.$transaction(async (prisma) => {
        // Create the recurring rule
        const recurringRule = await prisma.recurringTransactionRule.create({
          data: {
            userId,
            moneyAccountId: input.accountId,
            description: input.description,
            amount: input.amount,
            type: input.type,
            subCategoryId: input.subCategoryId || null,
            // TODO: goalId removed until goal refactor is complete
            
            // Recurrence logic
            startDate: input.startDate,
            frequencyType: input.frequencyType,
            frequencyInterval: input.frequencyInterval,
            dayOfWeek: input.dayOfWeek || null,
            dayOfMonth: dayOfMonth || null,
            nextDueDate,
            
            // End conditions
            endDate: input.endDate || null,
            totalOccurrences: input.totalOccurrences || null,
            isInstallment: input.isInstallment || false,
            
            // Notes
            notes: input.notes || null,
          },
        });
        
        // Check if the first occurrence starts today
        const today = new Date();
        const startDate = new Date(input.startDate);
        const isStartingToday = 
          startDate.getDate() === today.getDate() &&
          startDate.getMonth() === today.getMonth() &&
          startDate.getFullYear() === today.getFullYear();
        
        // If starting today, create the first transaction immediately
        if (isStartingToday) {
          // Calculate appropriate amount for installments
          const transactionAmount = input.isInstallment && input.totalOccurrences 
            ? input.amount / input.totalOccurrences 
            : input.amount;
            
          // Set amount sign based on transaction type
          const signedAmount = input.type === "EXPENSE" 
            ? -Math.abs(transactionAmount) 
            : Math.abs(transactionAmount);
            
          // Create the first transaction
          await prisma.transaction.create({
            data: {
              userId,
              moneyAccountId: input.accountId,
              description: input.isInstallment && input.totalOccurrences 
                ? `${input.description} (1/${input.totalOccurrences})` 
                : input.description,
              amount: signedAmount,
              date: input.startDate,
              subCategoryId: input.subCategoryId || null,
              // TODO: goalId removed until goal refactor is complete
              notes: input.notes || null,
              isRecurringInstance: true,
              recurringRuleId: recurringRule.id,
            },
          });
          
          // Update the recurring rule to track that first occurrence was generated
          await prisma.recurringTransactionRule.update({
            where: { id: recurringRule.id },
            data: {
              occurrencesGenerated: 1,
              isFirstOccurrenceGenerated: true,
            },
          });
        }
        
        return recurringRule;
      });
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
      
      // Verify account if changing
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
      
      // Prepare update data
      const updateData: Record<string, unknown> = {};
      
      // Basic fields
      if (input.description) updateData.description = input.description;
      if (input.amount !== undefined) updateData.amount = input.amount;
      if (input.accountId) updateData.moneyAccountId = input.accountId;
      if ('subCategoryId' in input) updateData.subCategoryId = input.subCategoryId;
      // TODO: goalId removed until goal refactor is complete
      // if ('goalId' in input) updateData.goalId = input.goalId;
      if ('notes' in input) updateData.notes = input.notes;
      if ('isActive' in input) updateData.isActive = input.isActive;
      
      // Recurrence fields that require recalculating nextDueDate
      let recalculateNextDueDate = false;
      let dayOfMonth = 'dayOfMonth' in input ? input.dayOfMonth : existingRule.dayOfMonth;
      
      if (input.startDate && input.startDate.getTime() !== existingRule.startDate.getTime()) {
        updateData.startDate = input.startDate;
        recalculateNextDueDate = true;
        
        // Extract day of month from new start date if freq is MONTHLY and no dayOfMonth was provided
        if ((input.frequencyType === "MONTHLY" || existingRule.frequencyType === "MONTHLY") && !dayOfMonth) {
          dayOfMonth = input.startDate.getDate();
          updateData.dayOfMonth = dayOfMonth;
        }
      }
      
      if (input.frequencyType && input.frequencyType !== existingRule.frequencyType) {
        updateData.frequencyType = input.frequencyType;
        recalculateNextDueDate = true;
        
        // If switching to MONTHLY and no dayOfMonth, extract from start date
        if (input.frequencyType === "MONTHLY" && !dayOfMonth) {
          const startDate = input.startDate || existingRule.startDate;
          dayOfMonth = startDate.getDate();
          updateData.dayOfMonth = dayOfMonth;
        }
      }
      
      if (input.frequencyInterval && input.frequencyInterval !== existingRule.frequencyInterval) {
        updateData.frequencyInterval = input.frequencyInterval;
        recalculateNextDueDate = true;
      }
      
      if ('dayOfWeek' in input && input.dayOfWeek !== existingRule.dayOfWeek) {
        updateData.dayOfWeek = input.dayOfWeek;
        recalculateNextDueDate = true;
      }
      
      if ('dayOfMonth' in input && input.dayOfMonth !== existingRule.dayOfMonth) {
        updateData.dayOfMonth = input.dayOfMonth;
        recalculateNextDueDate = true;
      }
      
      // End conditions
      if ('endDate' in input) updateData.endDate = input.endDate;
      if ('totalOccurrences' in input) updateData.totalOccurrences = input.totalOccurrences;
      if ('isInstallment' in input) updateData.isInstallment = input.isInstallment;
      
      // Recalculate nextDueDate if needed
      if (recalculateNextDueDate) {
        const startDate = (input.startDate || existingRule.startDate);
        const frequencyType = (input.frequencyType || existingRule.frequencyType);
        const frequencyInterval = input.frequencyInterval || existingRule.frequencyInterval;
        const dayOfWeek = 'dayOfWeek' in input ? input.dayOfWeek : existingRule.dayOfWeek;
        
        updateData.nextDueDate = calculateNextOccurrenceDate(
          startDate,
          frequencyType,
          frequencyInterval,
          dayOfMonth,
          dayOfWeek
        );
      }
      
      // Update the recurring rule
      const updatedRule = await ctx.db.recurringTransactionRule.update({
        where: {
          id: input.ruleId,
        },
        data: updateData,
      });
      
      // If this is an installment and amount changed, we need to update future transactions
      if (existingRule.isInstallment && input.amount !== undefined && 
          input.amount.toString() !== existingRule.amount.toString()) {
        // Get total number of occurrences
        const totalOccurrences = existingRule.totalOccurrences || 0;
        
        // Calculate new amount per transaction
        const newTransactionAmount = input.amount / totalOccurrences;
        
        // Only update future transactions (not past ones)
        await ctx.db.transaction.updateMany({
          where: {
            recurringRuleId: input.ruleId,
            isRecurringInstance: true,
            date: {
              gte: new Date() // Only future transactions
            }
          },
          data: {
            amount: updatedRule.type === "EXPENSE" 
              ? -Math.abs(newTransactionAmount)
              : Math.abs(newTransactionAmount),
          }
        });
      }
      
      return updatedRule;
    }),
    
  toggleActive: protectedProcedure
    .input(toggleRecurringRuleSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify rule belongs to user
      const rule = await ctx.db.recurringTransactionRule.findFirst({
        where: {
          id: input.ruleId,
          userId,
        },
      });
      
      if (!rule) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurring transaction rule not found"
        });
      }
      
      // Update active status
      const updatedRule = await ctx.db.recurringTransactionRule.update({
        where: {
          id: input.ruleId,
        },
        data: {
          isActive: input.isActive,
        },
        // Invalidate recurring rule caches
        uncache: {
          uncacheKeys: [
            // Invalidate specific rule
            `balanceapp:recurring_transaction_rule:id:${input.ruleId}*`,
            // Invalidate user's recurring rules list
            `balanceapp:recurring_transaction_rule:user_id:${userId}*`,
          ],
          hasPattern: true
        }
      });
      
      return updatedRule;
    }),
    
  delete: protectedProcedure
    .input(deleteRecurringRuleSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify recurring rule belongs to user
      const rule = await ctx.db.recurringTransactionRule.findFirst({
        where: {
          id: input.ruleId,
          userId,
        },
      });
      
      if (!rule) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurring rule not found",
        });
      }
      
      // Handle deletion of future transactions
      if (input.deleteFutureTransactions) {
        await ctx.db.transaction.deleteMany({
          where: {
            recurringRuleId: input.ruleId,
            date: {
              gte: new Date(),
            },
          },
        });
      } else {
        // If not deleting transactions, just unlink them
        await ctx.db.transaction.updateMany({
          where: {
            recurringRuleId: input.ruleId,
            date: {
              gte: new Date(),
            },
          },
          data: {
            recurringRuleId: null,
            isRecurringInstance: false,
          },
        });
      }
      
      // Delete the recurring rule
      await ctx.db.recurringTransactionRule.delete({
        where: {
          id: input.ruleId,
        },
      });
      
      return { success: true };
    }),
    
  // Additional method for converting days to proper frequency (for client migration)
  convertFrequency: protectedProcedure
    .input(convertFrequencySchema)
    .mutation(async ({ input }) => {
      return convertDaysToFrequency(input.frequencyDays);
    }),
}; 
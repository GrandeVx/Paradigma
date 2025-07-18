import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { 
  getRecurringRuleByIdSchema, 
  listRecurringRulesSchema 
} from "../../schemas/recurringRule";

export const queries = {
  list: protectedProcedure
    .input(listRecurringRulesSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Build where clause
      const where: Record<string, unknown> = { userId };
      
      // If isInstallment filter is provided, add it to the query
      if (input.isInstallment !== undefined) {
        where.isInstallment = input.isInstallment;
      }
      
      const rules = await ctx.db.recurringTransactionRule.findMany({
        where,
        select: {
          id: true,
          userId: true,
          description: true,
          amount: true,
          totalAmount: true, // Explicitly include totalAmount field
          type: true,
          subCategoryId: true,
          startDate: true,
          frequencyType: true,
          frequencyInterval: true,
          dayOfWeek: true,
          dayOfMonth: true,
          nextDueDate: true,
          endDate: true,
          totalOccurrences: true,
          occurrencesGenerated: true,
          isInstallment: true,
          lastProcessedAt: true,
          processingKey: true,
          isFirstOccurrenceGenerated: true,
          transactionGroupId: true,
          externalSystemId: true,
          isActive: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          moneyAccountId: true,
          moneyAccount: {
            select: {
              id: true,
              name: true,
              iconName: true,
              color: true,
              default: true,
            }
          },
          subCategory: {
            select: {
              id: true,
              name: true,
              icon: true,
              key: true,
              macroCategory: {
                select: {
                  id: true,
                  name: true,
                  key: true,
                  type: true,
                  color: true,
                  icon: true,
                }
              }
            }
          },
          // TODO: Restore after goal refactor to MoneyAccount
          // goal: true,
        },
        orderBy: {
          nextDueDate: "asc",
        },
      });
      
      return rules;
    }),
    
  getById: protectedProcedure
    .input(getRecurringRuleByIdSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const rule = await ctx.db.recurringTransactionRule.findFirst({
        where: {
          id: input.ruleId,
          userId,
        },
        select: {
          id: true,
          userId: true,
          description: true,
          amount: true,
          totalAmount: true, // Explicitly include totalAmount field
          type: true,
          subCategoryId: true,
          startDate: true,
          frequencyType: true,
          frequencyInterval: true,
          dayOfWeek: true,
          dayOfMonth: true,
          nextDueDate: true,
          endDate: true,
          totalOccurrences: true,
          occurrencesGenerated: true,
          isInstallment: true,
          lastProcessedAt: true,
          processingKey: true,
          isFirstOccurrenceGenerated: true,
          transactionGroupId: true,
          externalSystemId: true,
          isActive: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          moneyAccountId: true,
          moneyAccount: {
            select: {
              id: true,
              name: true,
              iconName: true,
              color: true,
              default: true,
            }
          },
          subCategory: {
            select: {
              id: true,
              name: true,
              icon: true,
              key: true,
              macroCategory: {
                select: {
                  id: true,
                  name: true,
                  key: true,
                  type: true,
                  color: true,
                  icon: true,
                }
              }
            }
          },
          // TODO: Restore after goal refactor to MoneyAccount
          // goal: true,
        },
      });
      
      if (!rule) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurring transaction rule not found"
        });
      }
      
      return rule;
    }),
}; 
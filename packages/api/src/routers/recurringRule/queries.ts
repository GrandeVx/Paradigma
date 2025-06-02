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
        include: {
          moneyAccount: true,
          subCategory: {
            include: {
              macroCategory: true,
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
        include: {
          moneyAccount: true,
          subCategory: {
            include: {
              macroCategory: true,
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
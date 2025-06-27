/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { protectedProcedure } from "../../trpc";
import { 
  createExpenseSchema, 
  createIncomeSchema, 
  createTransferSchema, 
  deleteTransactionSchema, 
  updateTransactionSchema 
} from "../../schemas/transaction";
import { Decimal } from "@paradigma/db";
import { notFoundError, translatedError } from "../../utils/errors";

export const mutations = {
  // Create expense transaction
  createExpense: protectedProcedure
    .input(createExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(`💰 [Transaction] Starting createExpense mutation`);
      console.log(`📥 [Transaction] Input:`, input);
      
      const userId = ctx.session.user.id;
      console.log(`👤 [Transaction] User ID: ${userId}`);
      
      // Ensure date is available for TypeScript
      const transactionDate = input.date!;
      
      try {
        console.log(`🔍 [Transaction] Verifying account ownership for ID: ${input.accountId}`);
        
        // Verify account belongs to user
        const account = await ctx.db.moneyAccount.findFirst({
          where: {
            id: input.accountId,
            userId,
          },
        });
        
        if (!account) {
          console.log(`❌ [Transaction] Account not found or doesn't belong to user`);
          throw translatedError(ctx, 'NOT_FOUND', ['transaction', 'errors', 'accountNotFound']);
        }
        
        console.log(`✅ [Transaction] Account verified:`, account);
        
        // Store amount as negative for expenses
        const negativeAmount = -Math.abs(input.amount);
        console.log(`💱 [Transaction] Amount converted to negative: ${negativeAmount}`);
        
        console.log(`🔥 [Transaction] Creating expense with invalidations for date: ${input.date.toISOString()}`);
        console.log(`🔥 [Transaction] User ID: ${userId}, SubCategory: ${input.subCategoryId}`);
        
        console.log(`💾 [Transaction] Creating expense transaction`);
        const startTime = Date.now();
        
        const transaction = await ctx.db.transaction.create({
          data: {
            userId: userId,
            moneyAccountId: input.accountId,
            amount: negativeAmount,
            date: input.date,
            description: input.description,
            subCategoryId: input.subCategoryId || null,
            notes: input.notes || null,  
          },
          // Invalidate relevant caches after creating a transaction
          uncache: {
            uncacheKeys: [
              // === ACCOUNT BALANCE CACHES ===
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
              }),
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: input.accountId }] 
              }),
              ctx.db.getKey({ 
                params: [{ prisma: 'Transaction' }, { operation: 'findManyForBalance' }, { accountId: input.accountId }] 
              }),
              
              // === BUDGET SETTINGS CACHE ===
              ctx.db.getKey({ 
                params: [{ prisma: 'Budget' }, { operation: 'getCurrentSettings' }, { userId: userId }] 
              }),
              
              // === TRANSACTION QUERY CACHES ===
              // Monthly spending (used by TransactionsSection - without filters)
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getMonthlySpending' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { accountId: 'all' },
                  { macroCategoryIds: 'all' }
                ] 
              }),
              // Monthly spending with specific account
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getMonthlySpending' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { accountId: input.accountId },
                  { macroCategoryIds: 'all' }
                ] 
              }),
              
              // Monthly summary
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getMonthlySummary' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { accountId: 'all' }
                ] 
              }),
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getMonthlySummary' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { accountId: input.accountId }
                ] 
              }),
              
              // Category breakdown
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getCategoryBreakdown' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { type: 'expense' },
                  { accountId: 'all' }
                ] 
              }),
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getCategoryBreakdown' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { type: 'expense' },
                  { accountId: input.accountId }
                ] 
              }),
              
              // Daily spending
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getDailySpending' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { accountId: 'all' }
                ] 
              }),
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getDailySpending' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { accountId: input.accountId }
                ] 
              }),
              
              // Daily transactions for the specific date
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getDailyTransactions' }, 
                  { userId }, 
                  { date: transactionDate.toISOString().split('T')[0] },
                  { accountId: 'all' }
                ] 
              }),
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getDailyTransactions' }, 
                  { userId }, 
                  { date: transactionDate.toISOString().split('T')[0] },
                  { accountId: input.accountId }
                ] 
              }),
              
              // === BUDGET PROGRESS CACHES (if categorized) ===
              ...(input.subCategoryId ? await (async () => {
                // Get the macro category ID for this subcategory
                const subCategory = await ctx.db.subCategory.findUnique({
                  where: { id: input.subCategoryId },
                  select: { macroCategoryId: true }
                });
                
                if (subCategory) {
                  return [
                    // Monthly spending with specific category (used by BudgetScreen)
                    ctx.db.getKey({ 
                      params: [
                        { prisma: 'Transaction' }, 
                        { operation: 'getMonthlySpending' }, 
                        { userId }, 
                        { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                        { accountId: 'all' },
                        { macroCategoryIds: subCategory.macroCategoryId }
                      ] 
                    }),
                    
                    // Budget info for this category
                    ctx.db.getKey({ 
                      params: [
                        { prisma: 'Transaction' }, 
                        { operation: 'getBudgetInfo' }, 
                        { userId }, 
                        { categoryId: subCategory.macroCategoryId },
                        { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() }
                      ] 
                    }),
                    // Sub-category breakdown 
                    ctx.db.getKey({ 
                      params: [
                        { prisma: 'Transaction' }, 
                        { operation: 'getSubCategoryBreakdown' }, 
                        { userId }, 
                        { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                        { macroCategoryId: subCategory.macroCategoryId },
                        { accountId: 'all' }
                      ] 
                    }),
                    ctx.db.getKey({ 
                      params: [
                        { prisma: 'Transaction' }, 
                        { operation: 'getSubCategoryBreakdown' }, 
                        { userId }, 
                        { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                        { macroCategoryId: subCategory.macroCategoryId },
                        { accountId: input.accountId }
                      ] 
                    }),
                    // Category transactions
                    ctx.db.getKey({ 
                      params: [
                        { prisma: 'Transaction' }, 
                        { operation: 'getCategoryTransactions' }, 
                        { userId }, 
                        { categoryId: subCategory.macroCategoryId },
                        { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                        { accountId: 'all' }
                      ] 
                    }),
                    ctx.db.getKey({ 
                      params: [
                        { prisma: 'Transaction' }, 
                        { operation: 'getCategoryTransactions' }, 
                        { userId }, 
                        { categoryId: subCategory.macroCategoryId },
                        { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                        { accountId: input.accountId }
                      ] 
                    })
                  ];
                }
                return [];
              })() : []),
              
              // === BUDGET SCREEN SPECIFIC INVALIDATIONS ===
              // Get all current budget settings to invalidate their specific combinations
              ...(input.subCategoryId ? await (async () => {
                console.log(`🔥 [Cache] Getting budget settings to invalidate BudgetScreen queries`);
                
                try {
                  // Get current budget settings to know which category combinations to invalidate
                  const budgetSettings = await ctx.db.budget.findMany({
                    where: { userId },
                    select: { macroCategoryId: true }
                  });
                  
                  if (budgetSettings.length > 0) {
                    // Create the macroCategoryIds array as used by BudgetScreen
                    const budgetCategoryIds = budgetSettings.map(b => b.macroCategoryId);
                    const budgetCategoryIdsString = budgetCategoryIds.join(',');
                    
                    console.log(`🔥 [Cache] Invalidating BudgetScreen query with categories: ${budgetCategoryIdsString}`);
                    
                    return [
                      // This is the EXACT query used by BudgetScreen
                      ctx.db.getKey({ 
                        params: [
                          { prisma: 'Transaction' }, 
                          { operation: 'getMonthlySpending' }, 
                          { userId }, 
                          { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                          { accountId: 'all' },
                          { macroCategoryIds: budgetCategoryIdsString }
                        ] 
                      })
                    ];
                  }
                } catch (error) {
                  console.log(`🔥 [Cache] Error getting budget settings for invalidation:`, error);
                }
                
                return [];
              })() : []),
              
              // === PATTERN-BASED INVALIDATIONS FOR DYNAMIC BUDGET CACHES ===
              // For BudgetScreen that uses dynamic macroCategoryIds arrays, we need pattern matching
              ...(input.subCategoryId ? await (async () => {
                console.log(`🔥 [Cache] Adding pattern invalidations for categorized expense`);
                const month = (transactionDate.getMonth() + 1).toString();
                const year = transactionDate.getFullYear().toString();
                
                // Create patterns that match the actual cache key format from getKey()
                const patterns = [
                  // Primary pattern: Match any getMonthlySpending for this user/month with any macroCategoryIds
                  `balanceapp:transaction:operation:getMonthlySpending:userId:${userId}:month:${month}:year:${year}:accountId:all:macroCategoryIds:*`,
                  // Alternative pattern formats that might be generated
                  `balanceapp:transaction:operation:getMonthlySpending:user_id:${userId}:month:${month}:year:${year}:account_id:all:macro_category_ids:*`,
                  // More generic patterns for the same operation
                  `balanceapp:transaction:operation:getMonthlySpending:*:${userId}:*:${month}:*:${year}:*`,
                  // Ultra-aggressive: all queries for this user/month
                  `balanceapp:transaction:*:${userId}:*:${month}:*:${year}:*`,
                  // Nuclear option: anything with this user ID in this month
                  `*${userId}*${month}*${year}*`,
                  // Super nuclear: just user ID
                  `*${userId}*`
                ];
                console.log(`🔥 [Cache] Pattern invalidations:`, patterns);
                return patterns;
              })() : [])
            ],
            hasPattern: input.subCategoryId ? true : false // Use patterns only when we have categorized transactions
          }
        });
        
        const dbTime = Date.now() - startTime;
        console.log(`✅ [Transaction] Expense transaction created in ${dbTime}ms`);
        console.log(`📤 [Transaction] Created transaction:`, transaction);
        
        // ADDITIONAL: Direct tRPC invalidation as backup
        if (input.subCategoryId) {
          console.log(`🔥 [Cache] Additional direct tRPC invalidations`);
          // This will invalidate the query directly in tRPC's cache
          try {
            // Get current date for invalidation
            const currentMonth = transactionDate.getMonth() + 1;
            const currentYear = transactionDate.getFullYear();
            
            // We can't access tRPC utils here directly, but we can trigger a cache refresh
            // by doing a dummy query that will force refresh next time
            console.log(`🔥 [Cache] Would invalidate getMonthlySpending for month ${currentMonth}, year ${currentYear}`);
          } catch (error) {
            console.log(`🔥 [Cache] Direct invalidation failed:`, error);
          }
        }
        
        return transaction;
      } catch (error) {
        console.error(`❌ [Transaction] Error in createExpense:`, error);
        throw error;
      }
    }),
  
  // Create income transaction
  createIncome: protectedProcedure
    .input(createIncomeSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(`💰 [Transaction] Starting createIncome mutation`);
      console.log(`📥 [Transaction] Input:`, input);
      
      const userId = ctx.session.user.id;
      console.log(`👤 [Transaction] User ID: ${userId}`);
      
      // Ensure date is available for TypeScript
      const transactionDate = input.date!;
      
      try {
        console.log(`🔍 [Transaction] Verifying account ownership for ID: ${input.accountId}`);
        
        // Verify account belongs to user
        const account = await ctx.db.moneyAccount.findFirst({
          where: {
            id: input.accountId,
            userId,
          },
        });
        
        if (!account) {
          console.log(`❌ [Transaction] Account not found or doesn't belong to user`);
          throw translatedError(ctx, 'NOT_FOUND', ['transaction', 'errors', 'accountNotFound']);
        }
        
        console.log(`✅ [Transaction] Account verified:`, account);
        
        // Store amount as positive for income
        const positiveAmount = Math.abs(input.amount);
        console.log(`💱 [Transaction] Amount converted to positive: ${positiveAmount}`);
        
        console.log(`💾 [Transaction] Creating income transaction`);
        const startTime = Date.now();
        
        const transaction = await ctx.db.transaction.create({
          data: {
            userId,
            moneyAccountId: input.accountId,
            amount: positiveAmount,
            date: input.date,
            description: input.description,
            subCategoryId: input.subCategoryId || null,
            notes: input.notes || null,
          },
          // Invalidate relevant caches after creating a transaction
          uncache: {
            uncacheKeys: [
              // === ACCOUNT BALANCE CACHES ===
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
              }),
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: input.accountId }] 
              }),
              ctx.db.getKey({ 
                params: [{ prisma: 'Transaction' }, { operation: 'findManyForBalance' }, { accountId: input.accountId }] 
              }),
              
              // === BUDGET SETTINGS CACHE ===
              ctx.db.getKey({ 
                params: [{ prisma: 'Budget' }, { operation: 'getCurrentSettings' }, { userId: userId }] 
              }),
              
              // === TRANSACTION QUERY CACHES ===
              // Monthly spending (used by TransactionsSection - without filters)
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getMonthlySpending' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { accountId: 'all' },
                  { macroCategoryIds: 'all' }
                ] 
              }),
              // Monthly spending with specific account
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getMonthlySpending' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { accountId: input.accountId },
                  { macroCategoryIds: 'all' }
                ] 
              }),
              
              // Monthly summary
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getMonthlySummary' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { accountId: 'all' }
                ] 
              }),
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getMonthlySummary' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { accountId: input.accountId }
                ] 
              }),
              
              // Category breakdown
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getCategoryBreakdown' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { type: 'income' },
                  { accountId: 'all' }
                ] 
              }),
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getCategoryBreakdown' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { type: 'income' },
                  { accountId: input.accountId }
                ] 
              }),
              
              // Daily spending
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getDailySpending' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { accountId: 'all' }
                ] 
              }),
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getDailySpending' }, 
                  { userId }, 
                  { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                  { accountId: input.accountId }
                ] 
              }),
              
              // Daily transactions for the specific date
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getDailyTransactions' }, 
                  { userId }, 
                  { date: transactionDate.toISOString().split('T')[0] },
                  { accountId: 'all' }
                ] 
              }),
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getDailyTransactions' }, 
                  { userId }, 
                  { date: transactionDate.toISOString().split('T')[0] },
                  { accountId: input.accountId }
                ] 
              }),
              
              // === BUDGET PROGRESS CACHES (if categorized) ===
              ...(input.subCategoryId ? await (async () => {
                // Get the macro category ID for this subcategory
                const subCategory = await ctx.db.subCategory.findUnique({
                  where: { id: input.subCategoryId },
                  select: { macroCategoryId: true }
                });
                
                if (subCategory) {
                  // For income, we only need to invalidate category-specific queries, not budget
                  return [
                    // Sub-category breakdown (per completezza)
                    ctx.db.getKey({ 
                      params: [
                        { prisma: 'Transaction' }, 
                        { operation: 'getSubCategoryBreakdown' }, 
                        { userId }, 
                        { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                        { macroCategoryId: subCategory.macroCategoryId },
                        { accountId: 'all' }
                      ] 
                    }),
                    ctx.db.getKey({ 
                      params: [
                        { prisma: 'Transaction' }, 
                        { operation: 'getSubCategoryBreakdown' }, 
                        { userId }, 
                        { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                        { macroCategoryId: subCategory.macroCategoryId },
                        { accountId: input.accountId }
                      ] 
                    }),
                    // Category transactions
                    ctx.db.getKey({ 
                      params: [
                        { prisma: 'Transaction' }, 
                        { operation: 'getCategoryTransactions' }, 
                        { userId }, 
                        { categoryId: subCategory.macroCategoryId },
                        { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                        { accountId: 'all' }
                      ] 
                    }),
                    ctx.db.getKey({ 
                      params: [
                        { prisma: 'Transaction' }, 
                        { operation: 'getCategoryTransactions' }, 
                        { userId }, 
                        { categoryId: subCategory.macroCategoryId },
                        { month: (transactionDate.getMonth() + 1).toString(), year: transactionDate.getFullYear().toString() },
                        { accountId: input.accountId }
                      ] 
                    })
                  ];
                }
                return [];
              })() : [])
            ],
            hasPattern: false // Income doesn't need pattern invalidations for budgets
          }
        });
        
        const dbTime = Date.now() - startTime;
        console.log(`✅ [Transaction] Income transaction created in ${dbTime}ms`);
        console.log(`📤 [Transaction] Created transaction:`, transaction);
        
        return transaction;
      } catch (error) {
        console.error(`❌ [Transaction] Error in createIncome:`, error);
        throw error;
      }
    }),
  
  // Create transfer between accounts
  createTransfer: protectedProcedure
    .input(createTransferSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify both accounts belong to user
      const fromAccount = await ctx.db.moneyAccount.findFirst({
        where: {
          id: input.fromAccountId,
          userId,
        },
      });
      
      const toAccount = await ctx.db.moneyAccount.findFirst({
        where: {
          id: input.toAccountId,
          userId,
        },
      });
      
      if (!fromAccount || !toAccount) {
        throw translatedError(ctx, 'NOT_FOUND', ['transaction', 'errors', 'accountNotFound']);
      }
      
      // Generate a unique transferId to link the two transactions
      const transferId = `transfer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Create both transactions in a single Prisma transaction
      const result = await ctx.db.$transaction(async (prisma) => {
        // Create outflow transaction (negative amount)
        const outflowTransaction = await prisma.transaction.create({
          data: {
            userId,
            moneyAccountId: fromAccount.id,
            amount: -Math.abs(input.amount),
            date: input.date,
            description: input.description,
            notes: input.notes || null,
            transferId,
          },
        });
        
        // Create inflow transaction (positive amount)
        const inflowTransaction = await prisma.transaction.create({
          data: {
            userId,
            moneyAccountId: toAccount.id,
            amount: Math.abs(input.amount),
            date: input.date,
            description: input.description,
            notes: input.notes || null,
            transferId,
          },
        });
        
        return {
          outflowTransaction,
          inflowTransaction,
        };
      });
      
      // After transaction is created, invalidate affected caches
      // We can't directly use uncache in $transaction, so we manually invalidate by 
      // using individual updates with uncache option
      
      // Invalidate from account balance by doing a dummy update
      await ctx.db.moneyAccount.update({
        where: { id: input.fromAccountId },
        data: {}, // No changes needed, just triggering cache invalidation
        uncache: {
          uncacheKeys: [
            // === ACCOUNT BALANCE CACHES ===
            ctx.db.getKey({ 
              params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
            }),
            ctx.db.getKey({ 
              params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: input.fromAccountId }] 
            }),
            ctx.db.getKey({ 
              params: [{ prisma: 'Transaction' }, { operation: 'findManyForBalance' }, { accountId: input.fromAccountId }] 
            }),
            
            // === TRANSACTION QUERY CACHES ===
            // Use pattern for monthly data since transfers affect multiple months potentially
            `balanceapp:transaction:operation:getMonthlySpending:user_id:${userId}:*`,
            `balanceapp:transaction:operation:getMonthlySummary:user_id:${userId}:*`,
            `balanceapp:transaction:operation:getDailySpending:user_id:${userId}:*`,
            `balanceapp:transaction:operation:getDailyTransactions:user_id:${userId}:*`
          ],
          hasPattern: true
        }
      });
      
      // Invalidate to account balance if different
      if (input.fromAccountId !== input.toAccountId) {
        await ctx.db.moneyAccount.update({
          where: { id: input.toAccountId },
          data: {}, // No changes needed, just triggering cache invalidation
          uncache: {
            uncacheKeys: [
              // === ACCOUNT BALANCE CACHES ===
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
              }),
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: input.toAccountId }] 
              }),
              ctx.db.getKey({ 
                params: [{ prisma: 'Transaction' }, { operation: 'findManyForBalance' }, { accountId: input.toAccountId }] 
              }),
              
              // === TRANSACTION QUERY CACHES ===
              // Use pattern for monthly data since transfers affect multiple months potentially
              `balanceapp:transaction:operation:getMonthlySpending:user_id:${userId}:*`,
              `balanceapp:transaction:operation:getMonthlySummary:user_id:${userId}:*`,
              `balanceapp:transaction:operation:getDailySpending:user_id:${userId}:*`,
              `balanceapp:transaction:operation:getDailyTransactions:user_id:${userId}:*`
            ],
            hasPattern: true
          }
        });
      }
      
      return result;
    }),
  
  // Update transaction
  update: protectedProcedure
    .input(updateTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify transaction belongs to user
      const existingTransaction = await ctx.db.transaction.findFirst({
        where: {
          id: input.transactionId,
          userId,
        },
      });
      
      if (!existingTransaction) {
        throw notFoundError(ctx, 'transaction');
      }
      
      // If changing account, verify new account belongs to user
      if (input.accountId) {
        const account = await ctx.db.moneyAccount.findFirst({
          where: {
            id: input.accountId,
            userId,
          },
        });
        
        if (!account) {
          throw translatedError(ctx, 'NOT_FOUND', ['transaction', 'errors', 'accountNotFound']);
        }
      }
      
      // Prepare update data
      const updateData: Record<string, unknown> = {};
      
      if (input.accountId) updateData.accountId = input.accountId;
      if (input.description) updateData.description = input.description;
      if (input.date) updateData.date = input.date;
      
      // Handle optional/nullable fields
      if ('subCategoryId' in input) updateData.subCategoryId = input.subCategoryId;
      if ('notes' in input) updateData.notes = input.notes;
      
      // Special handling for amount to maintain sign conventions
      if (input.amount !== undefined) {
        // For transfers (with transferId), we need to be careful
        if (existingTransaction.transferId) {
          throw translatedError(ctx, 'BAD_REQUEST', ['transaction', 'errors', 'cannotUpdateTransferAmount']);
        }
        
        // For normal transactions, maintain sign convention
        // Convert Decimal to number for comparison
        const isExpense = (existingTransaction.amount as unknown as Decimal).lessThan(0);
        updateData.amount = isExpense ? -Math.abs(input.amount) : Math.abs(input.amount);
      }

      // Store account IDs for cache invalidation
      const oldAccountId = existingTransaction.moneyAccountId;
      const newAccountId = input.accountId || oldAccountId;
      
      // Update transaction
      const updatedTransaction = await ctx.db.transaction.update({
        where: {
          id: input.transactionId,
        },
        data: updateData,
        // Invalidate relevant caches with precise keys
        uncache: {
          uncacheKeys: [
            // === ACCOUNT BALANCE CACHES ===
            ctx.db.getKey({ 
              params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
            }),
            // Old account (if exists)
            ...(oldAccountId ? [
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: oldAccountId! }] 
              }),
              ctx.db.getKey({ 
                params: [{ prisma: 'Transaction' }, { operation: 'findManyForBalance' }, { accountId: oldAccountId! }] 
              })
            ] : []),
            // New account (if different)
            ...(oldAccountId !== newAccountId && newAccountId ? [
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: newAccountId! }] 
              }),
              ctx.db.getKey({ 
                params: [{ prisma: 'Transaction' }, { operation: 'findManyForBalance' }, { accountId: newAccountId! }] 
              })
            ] : []),
            
            // === BUDGET SETTINGS CACHE ===
            ctx.db.getKey({ 
              params: [{ prisma: 'Budget' }, { operation: 'getCurrentSettings' }, { userId: userId }] 
            }),
            
            // === TRANSACTION QUERY CACHES ===
            // Use pattern for monthly data since we might be changing months
            `balanceapp:transaction:operation:getMonthlySpending:user_id:${userId}:*`,
            `balanceapp:transaction:operation:getMonthlySummary:user_id:${userId}:*`,
            `balanceapp:transaction:operation:getCategoryBreakdown:user_id:${userId}:*`,
            `balanceapp:transaction:operation:getDailySpending:user_id:${userId}:*`,
            `balanceapp:transaction:operation:getDailyTransactions:user_id:${userId}:*`,
            `balanceapp:transaction:operation:getCategoryTransactions:user_id:${userId}:*`,
            `balanceapp:transaction:operation:getBudgetInfo:user_id:${userId}:*`,
            `balanceapp:transaction:operation:getSubCategoryBreakdown:user_id:${userId}:*`
          ],
          hasPattern: true
        }
      });
      
      return updatedTransaction;
    }),
  
  // Delete transaction
  delete: protectedProcedure
    .input(deleteTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(`🗑️ [Transaction] Starting delete mutation for ID: ${input.transactionId}`);
      
      const userId = ctx.session.user.id;
      console.log(`👤 [Transaction] User ID: ${userId}`);
      
      // Verify transaction belongs to user and get full details for cache invalidation
      const transaction = await ctx.db.transaction.findFirst({
        where: {
          id: input.transactionId,
          userId,
        },
        include: {
          subCategory: {
            include: {
              macroCategory: true,
            }
          },
        },
      });
      
      if (!transaction) {
        console.log(`❌ [Transaction] Transaction not found or doesn't belong to user`);
        throw notFoundError(ctx, 'transaction');
      }
      
      console.log(`✅ [Transaction] Transaction found:`, transaction);
      
      // Extract transaction details for cache invalidation
      const accountId = transaction.moneyAccountId;
      const transactionDate = new Date(transaction.date);
      const month = (transactionDate.getMonth() + 1).toString();
      const year = transactionDate.getFullYear().toString();
      const isExpense = Number(transaction.amount) < 0;
      const isIncome = Number(transaction.amount) > 0;
      
      console.log(`🗓️ [Transaction] Transaction date: ${transactionDate.toISOString()}, Month: ${month}, Year: ${year}`);
      console.log(`💰 [Transaction] Transaction type: ${isExpense ? 'expense' : isIncome ? 'income' : 'transfer'}`);

      // If this is part of a transfer, we need to delete both sides
      if (transaction.transferId) {
        console.log(`🔄 [Transaction] Deleting transfer with ID: ${transaction.transferId}`);
        
        // Find the other transaction in the transfer
        const otherTransaction = await ctx.db.transaction.findFirst({
          where: {
            transferId: transaction.transferId,
            id: { not: transaction.id },
            userId,
          },
        });

        // Store the other account ID to invalidate its cache 
        const otherAccountId = otherTransaction?.moneyAccountId;
        console.log(`🔄 [Transaction] Other transaction account ID: ${otherAccountId}`);
        
        // Delete both transactions in the transfer
        await ctx.db.transaction.deleteMany({
          where: {
            transferId: transaction.transferId,
            userId,
          },
          // Invalidate relevant caches with precise keys
          uncache: {
            uncacheKeys: [
              // === ACCOUNT BALANCE CACHES ===
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
              }),
              // Main account
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: accountId }] 
              }),
              ctx.db.getKey({ 
                params: [{ prisma: 'Transaction' }, { operation: 'findManyForBalance' }, { accountId: accountId }] 
              }),
              // Other account (if exists and different)
              ...(otherAccountId && otherAccountId !== accountId ? [
                ctx.db.getKey({ 
                  params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: otherAccountId }] 
                }),
                ctx.db.getKey({ 
                  params: [{ prisma: 'Transaction' }, { operation: 'findManyForBalance' }, { accountId: otherAccountId }] 
                })
              ] : []),
              
              // === BUDGET SETTINGS CACHE ===
              ctx.db.getKey({ 
                params: [{ prisma: 'Budget' }, { operation: 'getCurrentSettings' }, { userId: userId }] 
              }),
              
              // === MONTHLY SPENDING QUERIES (ALL ACCOUNTS) ===
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getMonthlySpending' }, 
                  { userId }, 
                  { month, year },
                  { accountId: 'all' },
                  { macroCategoryIds: 'all' }
                ] 
              }),
              // Account-specific monthly spending
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getMonthlySpending' }, 
                  { userId }, 
                  { month, year },
                  { accountId },
                  { macroCategoryIds: 'all' }
                ] 
              }),
              ...(otherAccountId && otherAccountId !== accountId ? [
                ctx.db.getKey({ 
                  params: [
                    { prisma: 'Transaction' }, 
                    { operation: 'getMonthlySpending' }, 
                    { userId }, 
                    { month, year },
                    { accountId: otherAccountId },
                    { macroCategoryIds: 'all' }
                  ] 
                })
              ] : []),
              
              // === MONTHLY SUMMARY QUERIES ===
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getMonthlySummary' }, 
                  { userId }, 
                  { month, year },
                  { accountId: 'all' }
                ] 
              }),
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getMonthlySummary' }, 
                  { userId }, 
                  { month, year },
                  { accountId }
                ] 
              }),
              ...(otherAccountId && otherAccountId !== accountId ? [
                ctx.db.getKey({ 
                  params: [
                    { prisma: 'Transaction' }, 
                    { operation: 'getMonthlySummary' }, 
                    { userId }, 
                    { month, year },
                    { accountId: otherAccountId }
                  ] 
                })
              ] : []),
              
              // === DAILY SPENDING QUERIES ===
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getDailySpending' }, 
                  { userId }, 
                  { month, year },
                  { accountId: 'all' }
                ] 
              }),
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getDailySpending' }, 
                  { userId }, 
                  { month, year },
                  { accountId }
                ] 
              }),
              ...(otherAccountId && otherAccountId !== accountId ? [
                ctx.db.getKey({ 
                  params: [
                    { prisma: 'Transaction' }, 
                    { operation: 'getDailySpending' }, 
                    { userId }, 
                    { month, year },
                    { accountId: otherAccountId }
                  ] 
                })
              ] : []),
              
              // === DAILY TRANSACTIONS QUERIES ===
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getDailyTransactions' }, 
                  { userId }, 
                  { date: transactionDate.toISOString().split('T')[0] },
                  { accountId: 'all' }
                ] 
              }),
              ctx.db.getKey({ 
                params: [
                  { prisma: 'Transaction' }, 
                  { operation: 'getDailyTransactions' }, 
                  { userId }, 
                  { date: transactionDate.toISOString().split('T')[0] },
                  { accountId }
                ] 
              }),
              ...(otherAccountId && otherAccountId !== accountId ? [
                ctx.db.getKey({ 
                  params: [
                    { prisma: 'Transaction' }, 
                    { operation: 'getDailyTransactions' }, 
                    { userId }, 
                    { date: transactionDate.toISOString().split('T')[0] },
                    { accountId: otherAccountId }
                  ] 
                })
              ] : [])
            ],
            hasPattern: false
          }
        });
        
        console.log(`✅ [Transaction] Transfer deleted successfully`);
        return { success: true };
      } else {
        console.log(`💾 [Transaction] Deleting single transaction`);
        
        // Prepare invalidation keys for single transaction deletion
        const invalidationKeys = [
          // === ACCOUNT BALANCE CACHES ===
          ctx.db.getKey({ 
            params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
          }),
          ctx.db.getKey({ 
            params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: accountId }] 
          }),
          ctx.db.getKey({ 
            params: [{ prisma: 'Transaction' }, { operation: 'findManyForBalance' }, { accountId: accountId }] 
          }),
          
          // === BUDGET SETTINGS CACHE ===
          ctx.db.getKey({ 
            params: [{ prisma: 'Budget' }, { operation: 'getCurrentSettings' }, { userId: userId }] 
          }),
          
          // === MONTHLY SPENDING QUERIES (ALL ACCOUNTS) ===
          ctx.db.getKey({ 
            params: [
              { prisma: 'Transaction' }, 
              { operation: 'getMonthlySpending' }, 
              { userId }, 
              { month, year },
              { accountId: 'all' },
              { macroCategoryIds: 'all' }
            ] 
          }),
          // Account-specific monthly spending
          ctx.db.getKey({ 
            params: [
              { prisma: 'Transaction' }, 
              { operation: 'getMonthlySpending' }, 
              { userId }, 
              { month, year },
              { accountId },
              { macroCategoryIds: 'all' }
            ] 
          }),
          
          // === MONTHLY SUMMARY QUERIES ===
          ctx.db.getKey({ 
            params: [
              { prisma: 'Transaction' }, 
              { operation: 'getMonthlySummary' }, 
              { userId }, 
              { month, year },
              { accountId: 'all' }
            ] 
          }),
          ctx.db.getKey({ 
            params: [
              { prisma: 'Transaction' }, 
              { operation: 'getMonthlySummary' }, 
              { userId }, 
              { month, year },
              { accountId }
            ] 
          }),
          
          // === CATEGORY BREAKDOWN QUERIES ===
          ...(isExpense ? [
            ctx.db.getKey({ 
              params: [
                { prisma: 'Transaction' }, 
                { operation: 'getCategoryBreakdown' }, 
                { userId }, 
                { month, year },
                { type: 'expense' },
                { accountId: 'all' }
              ] 
            }),
            ctx.db.getKey({ 
              params: [
                { prisma: 'Transaction' }, 
                { operation: 'getCategoryBreakdown' }, 
                { userId }, 
                { month, year },
                { type: 'expense' },
                { accountId }
              ] 
            })
          ] : []),
          ...(isIncome ? [
            ctx.db.getKey({ 
              params: [
                { prisma: 'Transaction' }, 
                { operation: 'getCategoryBreakdown' }, 
                { userId }, 
                { month, year },
                { type: 'income' },
                { accountId: 'all' }
              ] 
            }),
            ctx.db.getKey({ 
              params: [
                { prisma: 'Transaction' }, 
                { operation: 'getCategoryBreakdown' }, 
                { userId }, 
                { month, year },
                { type: 'income' },
                { accountId }
              ] 
            })
          ] : []),
          
          // === DAILY SPENDING QUERIES ===
          ctx.db.getKey({ 
            params: [
              { prisma: 'Transaction' }, 
              { operation: 'getDailySpending' }, 
              { userId }, 
              { month, year },
              { accountId: 'all' }
            ] 
          }),
          ctx.db.getKey({ 
            params: [
              { prisma: 'Transaction' }, 
              { operation: 'getDailySpending' }, 
              { userId }, 
              { month, year },
              { accountId }
            ] 
          }),
          
          // === DAILY TRANSACTIONS QUERIES ===
          ctx.db.getKey({ 
            params: [
              { prisma: 'Transaction' }, 
              { operation: 'getDailyTransactions' }, 
              { userId }, 
              { date: transactionDate.toISOString().split('T')[0] },
              { accountId: 'all' }
            ] 
          }),
          ctx.db.getKey({ 
            params: [
              { prisma: 'Transaction' }, 
              { operation: 'getDailyTransactions' }, 
              { userId }, 
              { date: transactionDate.toISOString().split('T')[0] },
              { accountId }
            ] 
          })
        ];
        
        // Add category-specific invalidations if transaction was categorized
        if (transaction.subCategoryId && transaction.subCategory?.macroCategory) {
          const macroCategoryId = transaction.subCategory.macroCategory.id;
          console.log(`📊 [Transaction] Adding category-specific invalidations for category: ${macroCategoryId}`);
          
          invalidationKeys.push(
            // Sub-category breakdown
            ctx.db.getKey({ 
              params: [
                { prisma: 'Transaction' }, 
                { operation: 'getSubCategoryBreakdown' }, 
                { userId }, 
                { month, year },
                { macroCategoryId },
                { accountId: 'all' }
              ] 
            }),
            ctx.db.getKey({ 
              params: [
                { prisma: 'Transaction' }, 
                { operation: 'getSubCategoryBreakdown' }, 
                { userId }, 
                { month, year },
                { macroCategoryId },
                { accountId }
              ] 
            }),
            
            // Category transactions
            ctx.db.getKey({ 
              params: [
                { prisma: 'Transaction' }, 
                { operation: 'getCategoryTransactions' }, 
                { userId }, 
                { categoryId: macroCategoryId },
                { month, year },
                { accountId: 'all' }
              ] 
            }),
            ctx.db.getKey({ 
              params: [
                { prisma: 'Transaction' }, 
                { operation: 'getCategoryTransactions' }, 
                { userId }, 
                { categoryId: macroCategoryId },
                { month, year },
                { accountId }
              ] 
            }),
            
            // Budget info for this category
            ctx.db.getKey({ 
              params: [
                { prisma: 'Transaction' }, 
                { operation: 'getBudgetInfo' }, 
                { userId }, 
                { categoryId: macroCategoryId },
                { month, year }
              ] 
            })
          );
          
          // Add budget-specific monthly spending invalidations
          try {
            // Get current budget settings to know which category combinations to invalidate
            const budgetSettings = await ctx.db.budget.findMany({
              where: { userId },
              select: { macroCategoryId: true }
            });
            
            if (budgetSettings.length > 0) {
              // Create the macroCategoryIds array as used by BudgetScreen
              const budgetCategoryIds = budgetSettings.map(b => b.macroCategoryId);
              const budgetCategoryIdsString = budgetCategoryIds.join(',');
              
              console.log(`🔥 [Transaction] Invalidating BudgetScreen query with categories: ${budgetCategoryIdsString}`);
              
              invalidationKeys.push(
                // This is the EXACT query used by BudgetScreen
                ctx.db.getKey({ 
                  params: [
                    { prisma: 'Transaction' }, 
                    { operation: 'getMonthlySpending' }, 
                    { userId }, 
                    { month, year },
                    { accountId: 'all' },
                    { macroCategoryIds: budgetCategoryIdsString }
                  ] 
                })
              );
            }
          } catch (error) {
            console.log(`🔥 [Transaction] Error getting budget settings for invalidation:`, error);
          }
        }
        
        console.log(`🔥 [Transaction] Invalidating ${invalidationKeys.length} cache keys`);
        
        // Delete single transaction
        await ctx.db.transaction.delete({
          where: {
            id: input.transactionId,
          },
          // Invalidate relevant caches with precise keys
          uncache: {
            uncacheKeys: invalidationKeys,
            hasPattern: false
          }
        });
        
        console.log(`✅ [Transaction] Transaction deleted successfully`);
        return { success: true };
      }
    }),
}; 
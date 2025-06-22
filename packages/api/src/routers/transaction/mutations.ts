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
              // Pattern specifici per userId per evitare invalidazione cross-user
              `balanceapp:transaction:operation:aggregate:money_account_id:${input.accountId}:*`,
              `balanceapp:transaction:user_id:${userId}:*`,
              `balanceapp:money_account:user_id:${userId}:*`,
              // Additional specific patterns for the new cache structure if needed
              `balanceapp:transaction:op:aggregate:user_id:${userId}:*`,
              `balanceapp:money_account:op:find_many:user_id:${userId}:*`,
              // Specific account cache keys
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
              }),
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: input.accountId }] 
              }),
              ctx.db.getKey({ 
                params: [{ prisma: 'Transaction' }, { operation: 'findManyForBalance' }, { accountId: input.accountId }] 
              }),
              // Recurring transaction cache keys
              ctx.db.getKey({ 
                params: [{ prisma: 'RecurringTransaction' }, { operation: 'findMany' }, { userId: userId }] 
              }),

            ],
            hasPattern: true
          }
        });
        
        const dbTime = Date.now() - startTime;
        console.log(`✅ [Transaction] Expense transaction created in ${dbTime}ms`);
        console.log(`📤 [Transaction] Created transaction:`, transaction);
        
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
              // Pattern specifici per userId per evitare invalidazione cross-user
              `balanceapp:transaction:operation:aggregate:money_account_id:${input.accountId}:*`,
              `balanceapp:transaction:user_id:${userId}:*`,
              `balanceapp:money_account:user_id:${userId}:*`,
              // Additional specific patterns for the new cache structure if needed
              `balanceapp:transaction:op:aggregate:user_id:${userId}:*`,
              `balanceapp:money_account:op:find_many:user_id:${userId}:*`,
              // Specific account cache keys
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
              }),
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: input.accountId }] 
              }),
              ctx.db.getKey({ 
                params: [{ prisma: 'Transaction' }, { operation: 'findManyForBalance' }, { accountId: input.accountId }] 
              })
            ],
            hasPattern: true
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
            // Pattern specifici per userId per evitare invalidazione cross-user
            `balanceapp:transaction:operation:aggregate:money_account_id:${input.fromAccountId}:*`,
            `balanceapp:transaction:user_id:${userId}:*`,
            `balanceapp:money_account:user_id:${userId}:*`,
            // Additional specific patterns for the new cache structure if needed
            `balanceapp:transaction:op:aggregate:user_id:${userId}:*`,
            `balanceapp:money_account:op:find_many:user_id:${userId}:*`,
            // Specific account cache keys
            ctx.db.getKey({ 
              params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
            }),
            ctx.db.getKey({ 
              params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: input.fromAccountId }] 
            }),
            ctx.db.getKey({ 
              params: [{ prisma: 'Transaction' }, { operation: 'findManyForBalance' }, { accountId: input.fromAccountId }] 
            })
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
              // Pattern specifici per userId per evitare invalidazione cross-user
              `balanceapp:transaction:operation:aggregate:money_account_id:${input.toAccountId}:*`,
              `balanceapp:transaction:user_id:${userId}:*`,
              `balanceapp:money_account:user_id:${userId}:*`,
              // Additional specific patterns for the new cache structure if needed
              `balanceapp:transaction:op:aggregate:user_id:${userId}:*`,
              `balanceapp:money_account:op:find_many:user_id:${userId}:*`,
              // Specific account cache keys
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'listWithBalances' }, { userId: userId }] 
              }),
              ctx.db.getKey({ 
                params: [{ prisma: 'MoneyAccount' }, { operation: 'getById' }, { userId: userId }, { accountId: input.toAccountId }] 
              }),
              ctx.db.getKey({ 
                params: [{ prisma: 'Transaction' }, { operation: 'findManyForBalance' }, { accountId: input.toAccountId }] 
              })
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
        // Invalidate relevant caches with user-specific patterns
        uncache: {
          uncacheKeys: [
            // Always invalidate current transaction and user's transaction lists
            `balanceapp:transaction:user_id:${userId}:*`,
            `balanceapp:transaction:op:find_many:user_id:${userId}:*`,
            
            // Invalidate old account balance if it exists
            ...(oldAccountId ? [
              `balanceapp:transaction:operation:aggregate:money_account_id:${oldAccountId}:*`,
              `balanceapp:transaction:op:aggregate:money_account_id:${oldAccountId}:*`
            ] : []),
            
            // If account changed, invalidate new account balance too
            ...(oldAccountId !== newAccountId ? [
              `balanceapp:transaction:operation:aggregate:money_account_id:${newAccountId}:*`,
              `balanceapp:transaction:op:aggregate:money_account_id:${newAccountId}:*`
            ] : []),
            
            // Always invalidate user's money account queries
            `balanceapp:money_account:user_id:${userId}:*`,
            `balanceapp:money_account:op:find_many:user_id:${userId}:*`
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
      const userId = ctx.session.user.id;
      
      // Verify transaction belongs to user
      const transaction = await ctx.db.transaction.findFirst({
        where: {
          id: input.transactionId,
          userId,
        },
      });
      
      if (!transaction) {
        throw notFoundError(ctx, 'transaction');
      }
      
      // Save the account ID to invalidate its cache
      const accountId = transaction.moneyAccountId;

      // If this is part of a transfer, we need to delete both sides
      if (transaction.transferId) {
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
        
        // Delete both transactions in the transfer
        await ctx.db.transaction.deleteMany({
          where: {
            transferId: transaction.transferId,
            userId,
          },
          // Invalidate relevant caches with user-specific patterns
          uncache: {
            uncacheKeys: [
              // Always invalidate user's transaction lists
              `balanceapp:transaction:user_id:${userId}:*`,
              `balanceapp:transaction:op:find_many:user_id:${userId}:*`,
              
              // Invalidate main account balance if it exists
              ...(accountId ? [
                `balanceapp:transaction:operation:aggregate:money_account_id:${accountId}:*`,
                `balanceapp:transaction:op:aggregate:money_account_id:${accountId}:*`
              ] : []),
              
              // Invalidate other account balance if it exists and is different
              ...(otherAccountId && otherAccountId !== accountId ? [
                `balanceapp:transaction:operation:aggregate:money_account_id:${otherAccountId}:*`,
                `balanceapp:transaction:op:aggregate:money_account_id:${otherAccountId}:*`
              ] : []),
              
              // Always invalidate user's money account queries
              `balanceapp:money_account:user_id:${userId}:*`,
              `balanceapp:money_account:op:find_many:user_id:${userId}:*`
            ],
            hasPattern: true
          }
        });
        
        return { success: true };
      } else {
        // Delete single transaction
        await ctx.db.transaction.delete({
          where: {
            id: input.transactionId,
          },
          // Invalidate relevant caches with user-specific patterns
          uncache: {
            uncacheKeys: [
              // Always invalidate user's transaction lists
              `balanceapp:transaction:user_id:${userId}:*`,
              `balanceapp:transaction:op:find_many:user_id:${userId}:*`,
              
              // Invalidate account balance if it exists
              ...(accountId ? [
                `balanceapp:transaction:operation:aggregate:money_account_id:${accountId}:*`,
                `balanceapp:transaction:op:aggregate:money_account_id:${accountId}:*`
              ] : []),
              
              // Always invalidate user's money account queries
              `balanceapp:money_account:user_id:${userId}:*`,
              `balanceapp:money_account:op:find_many:user_id:${userId}:*`
            ],
            hasPattern: true
          }
        });
        
        return { success: true };
      }
    }),
}; 
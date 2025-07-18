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
import { 
  getTransactionInvalidationKeys, 
  getTransactionUpdateInvalidationKeys 
} from "../../utils/cacheInvalidation";

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
        
        // Convert date to UTC to ensure consistency
        const dateUTC = new Date(input.date.toISOString());
        
        // Store amount as negative for expenses
        const negativeAmount = -Math.abs(input.amount);
        console.log(`💱 [Transaction] Amount converted to negative: ${negativeAmount}`);
        
        // Get macro category if subcategory is provided
        let macroCategoryId: string | null = null;
        if (input.subCategoryId) {
          const subCategory = await ctx.db.subCategory.findUnique({
            where: { id: input.subCategoryId },
            select: { macroCategoryId: true }
          });
          macroCategoryId = subCategory?.macroCategoryId || null;
          console.log(`🏷️ [Transaction] Macro category ID: ${macroCategoryId}`);
        }
        
        console.log(`🔥 [Transaction] Creating expense with invalidations for date: ${dateUTC.toISOString()}`);
        console.log(`🔥 [Transaction] User ID: ${userId}, SubCategory: ${input.subCategoryId}`);
        
        console.log(`💾 [Transaction] Creating expense transaction`);
        const startTime = Date.now();
        
        const transaction = await ctx.db.transaction.create({
          data: {
            userId: userId,
            moneyAccountId: input.accountId,
            amount: negativeAmount,
            date: dateUTC,
            description: input.description,
            subCategoryId: input.subCategoryId || null,
            notes: input.notes || null,
            recurringRuleId: input.recurringRuleId || null,
            isRecurringInstance: !!input.recurringRuleId,
          },
          // Invalidate relevant caches after creating a transaction
          uncache: {
            uncacheKeys: getTransactionInvalidationKeys(ctx.db, userId, {
              date: dateUTC,
              moneyAccountId: input.accountId,
              subCategoryId: input.subCategoryId || null,
              macroCategoryId: macroCategoryId,
              amount: negativeAmount
            })
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
        
        // Convert date to UTC to ensure consistency
        const dateUTC = new Date(input.date.toISOString());
        
        // Store amount as positive for income
        const positiveAmount = Math.abs(input.amount);
        console.log(`💱 [Transaction] Amount converted to positive: ${positiveAmount}`);
        
        // Get macro category if subcategory is provided
        let macroCategoryId: string | null = null;
        if (input.subCategoryId) {
          const subCategory = await ctx.db.subCategory.findUnique({
            where: { id: input.subCategoryId },
            select: { macroCategoryId: true }
          });
          macroCategoryId = subCategory?.macroCategoryId || null;
          console.log(`🏷️ [Transaction] Macro category ID: ${macroCategoryId}`);
        }
        
        console.log(`🔥 [Transaction] Creating income with invalidations for date: ${dateUTC.toISOString()}`);
        console.log(`💾 [Transaction] Creating income transaction`);
        const startTime = Date.now();
        
        const transaction = await ctx.db.transaction.create({
          data: {
            userId: userId,
            moneyAccountId: input.accountId,
            amount: positiveAmount,
            date: dateUTC,
            description: input.description,
            subCategoryId: input.subCategoryId || null,
            notes: input.notes || null,
            recurringRuleId: input.recurringRuleId || null,
            isRecurringInstance: !!input.recurringRuleId,
          },
          // Invalidate relevant caches after creating a transaction
          uncache: {
            uncacheKeys: getTransactionInvalidationKeys(ctx.db, userId, {
              date: dateUTC,
              moneyAccountId: input.accountId,
              subCategoryId: input.subCategoryId || null,
              macroCategoryId: macroCategoryId,
              amount: positiveAmount
            })
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
      console.log(`💸 [Transaction] Starting createTransfer mutation`);
      console.log(`📥 [Transaction] Input:`, input);
      
      const userId = ctx.session.user.id;
      console.log(`👤 [Transaction] User ID: ${userId}`);
      
      try {
        console.log(`🔍 [Transaction] Verifying account ownership for FROM account: ${input.fromAccountId} and TO account: ${input.toAccountId}`);
        
        // Verify both accounts belong to user
        const [fromAccount, toAccount] = await Promise.all([
          ctx.db.moneyAccount.findFirst({
            where: {
              id: input.fromAccountId,
              userId,
            },
          }),
          ctx.db.moneyAccount.findFirst({
            where: {
              id: input.toAccountId,
              userId,
            },
          }),
        ]);
        
        if (!fromAccount) {
          console.log(`❌ [Transaction] Source account not found or doesn't belong to user`);
          throw translatedError(ctx, 'NOT_FOUND', ['transaction', 'errors', 'fromAccountNotFound']);
        }
        
        if (!toAccount) {
          console.log(`❌ [Transaction] Destination account not found or doesn't belong to user`);
          throw translatedError(ctx, 'NOT_FOUND', ['transaction', 'errors', 'toAccountNotFound']);
        }
        
        if (input.fromAccountId === input.toAccountId) {
          console.log(`❌ [Transaction] Cannot transfer to the same account`);
          throw translatedError(ctx, 'BAD_REQUEST', ['transaction', 'errors', 'sameAccountTransfer']);
        }
        
        console.log(`✅ [Transaction] Both accounts verified`);
        console.log(`💸 [Transaction] Creating transfer: ${fromAccount.name} -> ${toAccount.name}`);
        
        // Convert date to UTC to ensure consistency
        const dateUTC = new Date(input.date.toISOString());
        
        // Generate a unique transfer ID to link both transactions
        const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`🔗 [Transaction] Transfer ID: ${transferId}`);
        
        console.log(`💾 [Transaction] Creating transfer transactions`);
        const startTime = Date.now();
        
        // Create both transactions in a single database transaction
        const [fromTransaction, toTransaction] = await ctx.db.$transaction([
          // Negative transaction (money out) for source account
          ctx.db.transaction.create({
            data: {
              userId: userId,
              moneyAccountId: input.fromAccountId,
              amount: -Math.abs(input.amount),
              date: dateUTC,
              description: input.description || `Transfer to ${toAccount.name}`,
              transferId: transferId,
              notes: input.notes || null,
              recurringRuleId: input.recurringRuleId || null,
              isRecurringInstance: !!input.recurringRuleId,
            },
          }),
          // Positive transaction (money in) for destination account
          ctx.db.transaction.create({
            data: {
              userId: userId,
              moneyAccountId: input.toAccountId,
              amount: Math.abs(input.amount),
              date: dateUTC,
              description: input.description || `Transfer from ${fromAccount.name}`,
              transferId: transferId,
              notes: input.notes || null,
              recurringRuleId: input.recurringRuleId || null,
              isRecurringInstance: !!input.recurringRuleId,
            },
          }),
        ]);
        
        const dbTime = Date.now() - startTime;
        console.log(`✅ [Transaction] Transfer transactions created in ${dbTime}ms`);
        
        // Invalidate caches for both accounts
        const invalidationKeys = [
          ...getTransactionInvalidationKeys(ctx.db, userId, {
            date: input.date,
            moneyAccountId: input.fromAccountId,
            amount: -Math.abs(input.amount)
          }),
          ...getTransactionInvalidationKeys(ctx.db, userId, {
            date: input.date,
            moneyAccountId: input.toAccountId,
            amount: Math.abs(input.amount)
          })
        ];
        
        // Remove duplicates
        const uniqueKeys = [...new Set(invalidationKeys)];
        
        // Manually invalidate caches since we used $transaction
        await ctx.db.invalidateKeys(uniqueKeys);
        
        console.log(`📤 [Transaction] Created transfer transactions:`, { fromTransaction, toTransaction });
        
        // Return the "from" transaction as the primary one
        return fromTransaction;
      } catch (error) {
        console.error(`❌ [Transaction] Error in createTransfer:`, error);
        throw error;
      }
    }),
  
  // Update transaction
  update: protectedProcedure
    .input(updateTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(`✏️ [Transaction] Starting update mutation`);
      console.log(`📥 [Transaction] Input:`, input);
      
      const userId = ctx.session.user.id;
      console.log(`👤 [Transaction] User ID: ${userId}`);
      
      try {
        console.log(`🔍 [Transaction] Finding existing transaction ID: ${input.transactionId}`);
        
        // Get existing transaction to verify ownership and get current state
        const existingTransaction = await ctx.db.transaction.findFirst({
          where: {
            id: input.transactionId,
            userId,
          },
          include: {
            subCategory: {
              select: {
                macroCategoryId: true
              }
            }
          }
        });
        
        if (!existingTransaction) {
          console.log(`❌ [Transaction] Transaction not found or doesn't belong to user`);
          throw notFoundError(ctx, 'transaction');
        }
        
        console.log(`✅ [Transaction] Transaction found:`, existingTransaction);
        
        // Prepare old transaction data for invalidation
        const oldTransactionData = {
          date: existingTransaction.date,
          moneyAccountId: existingTransaction.moneyAccountId,
          subCategoryId: existingTransaction.subCategoryId,
          macroCategoryId: existingTransaction.subCategory?.macroCategoryId || null,
          amount: Number(existingTransaction.amount)
        };
        
        // Get new macro category if new subcategory is provided
        let newMacroCategoryId: string | null = null;
        if (input.subCategoryId && input.subCategoryId !== existingTransaction.subCategoryId) {
          const newSubCategory = await ctx.db.subCategory.findUnique({
            where: { id: input.subCategoryId },
            select: { macroCategoryId: true }
          });
          newMacroCategoryId = newSubCategory?.macroCategoryId || null;
        } else if (input.subCategoryId === existingTransaction.subCategoryId) {
          newMacroCategoryId = existingTransaction.subCategory?.macroCategoryId || null;
        }
        
        // Prepare new transaction data for invalidation
        const newTransactionData = {
          date: input.date || existingTransaction.date,
          moneyAccountId: input.accountId || existingTransaction.moneyAccountId,
          subCategoryId: input.subCategoryId !== undefined ? input.subCategoryId : existingTransaction.subCategoryId,
          macroCategoryId: newMacroCategoryId,
          amount: input.amount !== undefined ? (
            existingTransaction.amount < 0 ? -Math.abs(input.amount) : Math.abs(input.amount)
          ) : Number(existingTransaction.amount)
        };
        
        console.log(`🔥 [Transaction] Updating transaction with invalidations`);
        console.log(`📅 [Transaction] Old date: ${oldTransactionData.date.toISOString()}, New date: ${newTransactionData.date.toISOString()}`);
        
        const startTime = Date.now();
        
        // Update the transaction
        const updatedTransaction = await ctx.db.transaction.update({
          where: {
            id: input.transactionId,
          },
          data: {
            ...(input.accountId && { moneyAccountId: input.accountId }),
            ...(input.amount !== undefined && { 
              amount: existingTransaction.amount < 0 ? -Math.abs(input.amount) : Math.abs(input.amount) 
            }),
            ...(input.date && { date: input.date }),
            ...(input.description !== undefined && { description: input.description }),
            ...(input.subCategoryId !== undefined && { subCategoryId: input.subCategoryId }),
            ...(input.notes !== undefined && { notes: input.notes }),
          },
          uncache: {
            uncacheKeys: getTransactionUpdateInvalidationKeys(ctx.db, userId, {
              oldData: oldTransactionData,
              newData: newTransactionData
            })
          }
        });
        
        const dbTime = Date.now() - startTime;
        console.log(`✅ [Transaction] Transaction updated in ${dbTime}ms`);
        console.log(`📤 [Transaction] Updated transaction:`, updatedTransaction);
        
        return updatedTransaction;
      } catch (error) {
        console.error(`❌ [Transaction] Error in update:`, error);
        throw error;
      }
    }),
  
  // Delete transaction
  delete: protectedProcedure
    .input(deleteTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(`🗑️ [Transaction] Starting delete mutation`);
      console.log(`📥 [Transaction] Input:`, input);
      
      const userId = ctx.session.user.id;
      console.log(`👤 [Transaction] User ID: ${userId}`);
      
      try {
        console.log(`🔍 [Transaction] Finding transaction to delete ID: ${input.transactionId}`);
        
        // Get existing transaction to verify ownership and for cache invalidation
        const existingTransaction = await ctx.db.transaction.findFirst({
          where: {
            id: input.transactionId,
            userId,
          },
          include: {
            subCategory: {
              select: {
                macroCategoryId: true
              }
            }
          }
        });
        
        if (!existingTransaction) {
          console.log(`❌ [Transaction] Transaction not found or doesn't belong to user`);
          throw notFoundError(ctx, 'transaction');
        }
        
        console.log(`✅ [Transaction] Transaction found:`, existingTransaction);
        
        // Check if it's a transfer (has transferId)
        if (existingTransaction.transferId) {
          console.log(`💸 [Transaction] This is a transfer transaction. Deleting both parts.`);
          
          // Find the other transaction in the transfer
          const otherTransaction = await ctx.db.transaction.findFirst({
            where: {
              transferId: existingTransaction.transferId,
              id: { not: input.transactionId },
              userId,
            }
          });
          
          if (otherTransaction) {
            console.log(`🔗 [Transaction] Found paired transfer transaction:`, otherTransaction.id);
            
            // Delete both transactions
            await ctx.db.$transaction([
              ctx.db.transaction.delete({
                where: { id: input.transactionId }
              }),
              ctx.db.transaction.delete({
                where: { id: otherTransaction.id }
              })
            ]);
            
            // Invalidate caches for both accounts
            const invalidationKeys = [
              ...getTransactionInvalidationKeys(ctx.db, userId, {
                date: existingTransaction.date,
                moneyAccountId: existingTransaction.moneyAccountId,
                amount: Number(existingTransaction.amount)
              }),
              ...getTransactionInvalidationKeys(ctx.db, userId, {
                date: otherTransaction.date,
                moneyAccountId: otherTransaction.moneyAccountId,
                amount: Number(otherTransaction.amount)
              })
            ];
            
            // Remove duplicates and invalidate
            const uniqueKeys = [...new Set(invalidationKeys)];
            await ctx.db.invalidateKeys(uniqueKeys);
            
            console.log(`✅ [Transaction] Both transfer transactions deleted`);
          } else {
            console.log(`⚠️ [Transaction] Paired transfer transaction not found, deleting only this one`);
            
            // Delete just this transaction
            await ctx.db.transaction.delete({
              where: { id: input.transactionId },
              uncache: {
                uncacheKeys: getTransactionInvalidationKeys(ctx.db, userId, {
                  date: existingTransaction.date,
                  moneyAccountId: existingTransaction.moneyAccountId,
                  subCategoryId: existingTransaction.subCategoryId,
                  macroCategoryId: existingTransaction.subCategory?.macroCategoryId || null,
                  amount: Number(existingTransaction.amount)
                })
              }
            });
          }
        } else {
          console.log(`💰 [Transaction] This is a regular transaction. Deleting.`);
          
          const startTime = Date.now();
          
          // Delete the transaction
          await ctx.db.transaction.delete({
            where: {
              id: input.transactionId,
            },
            uncache: {
              uncacheKeys: getTransactionInvalidationKeys(ctx.db, userId, {
                date: existingTransaction.date,
                moneyAccountId: existingTransaction.moneyAccountId,
                subCategoryId: existingTransaction.subCategoryId,
                macroCategoryId: existingTransaction.subCategory?.macroCategoryId || null,
                amount: Number(existingTransaction.amount)
              })
            }
          });
          
          const dbTime = Date.now() - startTime;
          console.log(`✅ [Transaction] Transaction deleted in ${dbTime}ms`);
        }
        
        return { success: true };
      } catch (error) {
        console.error(`❌ [Transaction] Error in delete:`, error);
        throw error;
      }
    }),
};
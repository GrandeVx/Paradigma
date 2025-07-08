import { db } from "@paradigma/db";
import { recurringTransactionRuleSchema } from "@paradigma/db/prisma/zod";
import { calculateNextDueDate } from "../../../../packages/api/src/utils/dateCalculations";
import { sendBatchNotification } from "./notificationService";
import { Decimal } from "@prisma/client/runtime/library";
import { getTransactionInvalidationKeys, getRecurringRuleInvalidationKeys } from "../../../../packages/api/src/utils/cacheInvalidation";

interface ProcessingResult {
  processedRules: number;
  createdTransactions: number;
  notifications: {
    sent: number;
    failed: number;
  };
  errors: string[];
}

export async function processRecurringTransactions(): Promise<ProcessingResult> {
  const now = new Date();
  const errors: string[] = [];
  let processedRules = 0;
  let createdTransactions = 0;
  const userNotifications = new Map<string, number>();

  try {
    // Find all active rules that are due
    const dueRules = await db.recurringTransactionRule.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          lte: now,
        },
      },
      include: {
        user: true,
        moneyAccount: true,
        subCategory: true,
      },
    });

    console.log(`Found ${dueRules.length} rules to process`);

    // Process each rule
    for (const rule of dueRules) {
      try {
        // Skip if user is deleted
        if (rule.user.isDeleted) {
          continue;
        }

        // Check if rule should still be active
        // @ts-expect-error - rule is of type RecurringTransactionRule
        if (shouldDeactivateRule(rule)) {
          await db.recurringTransactionRule.update({
            where: { id: rule.id },
            data: { isActive: false },
          });
          continue;
        }

        // Skip if this is the first occurrence and it was already generated at creation time
        if (rule.occurrencesGenerated === 1 && rule.isFirstOccurrenceGenerated) {
          // Check if the nextDueDate is still the same as startDate (meaning this is the first run)
          const startDateNormalized = new Date(rule.startDate);
          startDateNormalized.setHours(0, 0, 0, 0);
          const nextDueDateNormalized = new Date(rule.nextDueDate);
          nextDueDateNormalized.setHours(0, 0, 0, 0);
          
          if (startDateNormalized.getTime() === nextDueDateNormalized.getTime()) {
            // This is the first run after creation, skip creating duplicate transaction
            // Just update the nextDueDate to the actual next occurrence
            const nextDueDate = calculateNextDueDate(
              rule.nextDueDate,
              rule.frequencyType,
              rule.frequencyInterval,
              rule.dayOfWeek ?? undefined,
              rule.dayOfMonth ?? undefined
            );
            
            await db.recurringTransactionRule.update({
              where: { id: rule.id },
              data: { nextDueDate },
              uncache: {
                uncacheKeys: getRecurringRuleInvalidationKeys(
                  db,
                  rule.userId,
                  rule.id,
                  rule.isInstallment
                ),
              },
            });
            
            processedRules++;
            continue;
          }
        }

        // Get macro category for cache invalidation
        const macroCategoryId = rule.subCategory?.macroCategoryId;

        // Prepare cache invalidation keys
        const transactionInvalidationKeys = getTransactionInvalidationKeys(
          db,
          rule.userId,
          {
            date: rule.nextDueDate,
            moneyAccountId: rule.moneyAccountId,
            subCategoryId: rule.subCategoryId,
            macroCategoryId,
            amount: rule.type === "INCOME" ? Number(rule.amount) : -Number(rule.amount),
          }
        );

        const ruleInvalidationKeys = getRecurringRuleInvalidationKeys(
          db,
          rule.userId,
          rule.id,
          rule.isInstallment
        );

        const allInvalidationKeys = [...transactionInvalidationKeys, ...ruleInvalidationKeys];

        // Create the transaction with cache invalidation
        await db.transaction.create({
          data: {
            userId: rule.userId,
            description: rule.description,
            amount: rule.type === "INCOME" ? rule.amount : new Decimal(rule.amount).negated(),
            date: rule.nextDueDate,
            subCategoryId: rule.subCategoryId,
            moneyAccountId: rule.moneyAccountId,
            isRecurringInstance: true,
            recurringRuleId: rule.id,
            notes: rule.notes,
          },
          uncache: {
            uncacheKeys: allInvalidationKeys,
          },
        });

        // Calculate and update next due date
        const nextDueDate = calculateNextDueDate(
          rule.nextDueDate,
          rule.frequencyType,
          rule.frequencyInterval,
          rule.dayOfWeek ?? undefined,
          rule.dayOfMonth ?? undefined
        );

        // Update the rule
        await db.recurringTransactionRule.update({
          where: { id: rule.id },
          data: {
            nextDueDate,
            occurrencesGenerated: {
              increment: 1,
            },
            lastProcessedAt: now,
          },
        });

        createdTransactions++;

        // Track notifications
        if (rule.user.notifications && rule.user.notificationToken) {
          const count = userNotifications.get(rule.userId) ?? 0;
          userNotifications.set(rule.userId, count + 1);
        }

        processedRules++;
      } catch (error) {
        const errorMsg = `Failed to process rule ${rule.id}: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // Send notifications
    const notificationResult = await sendNotifications(userNotifications);

    return {
      processedRules,
      createdTransactions,
      notifications: notificationResult,
      errors,
    };
  } catch (error) {
    const errorMsg = `Fatal error in recurring transaction processor: ${error instanceof Error ? error.message : "Unknown error"}`;
    console.error(errorMsg);
    errors.push(errorMsg);
    
    return {
      processedRules,
      createdTransactions,
      notifications: { sent: 0, failed: 0 },
      errors,
    };
  }
}

function shouldDeactivateRule(rule: typeof recurringTransactionRuleSchema._type): boolean {
  // Check end date
  if (rule.endDate && new Date() > rule.endDate) {
    return true;
  }

  // Check total occurrences for installments
  if (rule.isInstallment && rule.totalOccurrences && rule.occurrencesGenerated >= rule.totalOccurrences) {
    return true;
  }

  return false;
}

async function sendNotifications(userNotifications: Map<string, number>): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const [userId, count] of userNotifications) {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { notificationToken: true, language: true },
      });

      if (!user?.notificationToken) {
        continue;
      }

      const success = await sendBatchNotification(
        user.notificationToken,
        count,
        user.language ?? "en"
      );

      if (success) {
        sent++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to send notification to user ${userId}:`, error);
      failed++;
    }
  }

  return { sent, failed };
}
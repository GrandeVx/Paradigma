import { getDatabase } from '../config/database.js';
import { logger } from '../config/logger.js';
import type { Prisma } from '@prisma/client';

interface ProcessingResult {
  processed: number;
  errors: number;
  createdTransactions: number;
  deactivatedRules: number;
}

// Use Prisma generated types with includes
type RecurringRuleWithIncludes = Prisma.RecurringTransactionRuleGetPayload<{
  include: {
    moneyAccount: true;
    subCategory: true;
    user: true;
  };
}>;

export async function processRecurringTransactions(): Promise<ProcessingResult> {
  const db = getDatabase();
  const result: ProcessingResult = {
    processed: 0,
    errors: 0,
    createdTransactions: 0,
    deactivatedRules: 0
  };

  try {
    logger.info('Starting recurring transaction processing');
    
    // DEBUG: Check database connection
    logger.debug('Testing database connection...');
    try {
      await db.$queryRaw`SELECT 1 as test`;
      logger.debug('Database connection successful');
    } catch (dbError) {
      logger.error('Database connection failed', { error: dbError });
      throw new Error(`Database connection failed: ${dbError}`);
    }

    // DEBUG: Check environment variables
    logger.debug('Environment check', {
      DATABASE_URL_defined: !!process.env.DATABASE_URL,
      DATABASE_URL_length: process.env.DATABASE_URL?.length || 0,
      NODE_ENV: process.env.NODE_ENV
    });

    // Get all active recurring rules that are due
    const now = new Date();
    logger.debug('Executing recurring transaction rules query', { currentTime: now });
    
    const dueRules = await db.recurringTransactionRule.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          // TODO: Troppo specifico... dovremmo lavorare sulla data di oggi, non sulle 00:00:00
          lte: now
        }
      },
      include: {
        moneyAccount: true,
        subCategory: true,
        user: true
      }
    });

    // DEBUG: Check query result
    logger.debug('Query executed', {
      resultType: typeof dueRules,
      isArray: Array.isArray(dueRules),
      resultValue: dueRules,
      hasLength: dueRules && 'length' in dueRules
    });

    if (!dueRules) {
      logger.error('Query returned null/undefined result');
      throw new Error('Database query returned null/undefined');
    }

    if (!Array.isArray(dueRules)) {
      logger.error('Query result is not an array', { actualType: typeof dueRules });
      throw new Error(`Expected array, got ${typeof dueRules}`);
    }

    logger.info(`Found ${dueRules.length} due recurring transaction rules`);

    for (const rule of dueRules) {
      try {
        await processRule(rule, result);
        result.processed++;
      } catch (error) {
        logger.error(`Error processing rule ${rule.id}`, { 
          ruleId: rule.id, 
          error 
        });
        result.errors++;
      }
    }

    logger.info('Recurring transaction processing completed', result);
    return result;

  } catch (error) {
    logger.error('Fatal error in recurring transaction processing', { error });
    throw error;
  }
}

async function processRule(
  rule: RecurringRuleWithIncludes,
  result: ProcessingResult
): Promise<void> {
  const db = getDatabase();

  logger.debug(`Processing rule ${rule.id}`, { 
    ruleId: rule.id,
    description: rule.description,
    amount: rule.amount,
    nextDueDate: rule.nextDueDate
  });

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
      const nextDueDate = calculateNextDueDate(rule);
      
      await db.recurringTransactionRule.update({
        where: { id: rule.id },
        data: { nextDueDate },
      });
      
      logger.info(`Skipped first occurrence for rule ${rule.id} (already generated at creation)`);
      return;
    }
  }

  await db.$transaction(async (tx) => {
    // Create the transaction
    const transaction = await tx.transaction.create({
      data: {
        userId: rule.userId,
        amount: rule.amount,
        description: rule.description || `Recurring: ${rule.description}`,
        date: new Date(),
        subCategoryId: rule.subCategoryId,
        moneyAccountId: rule.moneyAccountId,
        notes: `Auto-generated from recurring rule ${rule.id}`,
        isRecurringInstance: true,
        recurringRuleId: rule.id
      }
    });

    logger.debug(`Created transaction ${transaction.id} for rule ${rule.id}`);
    result.createdTransactions++;

    // Calculate next due date
    const nextDueDate = calculateNextDueDate(rule);
    
    // Update the rule
    const updatedRule = await tx.recurringTransactionRule.update({
      where: { id: rule.id },
      data: {
        nextDueDate,
        occurrencesGenerated: rule.occurrencesGenerated + 1,
        lastProcessedAt: new Date()
      }
    });

    // Check if rule should be deactivated
    if (shouldDeactivateRule(updatedRule)) {
      await tx.recurringTransactionRule.update({
        where: { id: rule.id },
        data: { isActive: false }
      });
      
      logger.info(`Deactivated recurring rule ${rule.id}`, {
        ruleId: rule.id,
        reason: getDeactivationReason(updatedRule)
      });
      result.deactivatedRules++;
    }
  });
}

function calculateNextDueDate(rule: RecurringRuleWithIncludes): Date {
  const current = new Date(rule.nextDueDate);
  
  switch (rule.frequencyType) {
    case 'DAILY':
      return new Date(current.getTime() + (rule.frequencyInterval * 24 * 60 * 60 * 1000));
    
    case 'WEEKLY':
      return new Date(current.getTime() + (rule.frequencyInterval * 7 * 24 * 60 * 60 * 1000));
    
    case 'MONTHLY':
      const nextMonth = new Date(current);
      nextMonth.setMonth(current.getMonth() + rule.frequencyInterval);
      
      // Handle end of month cases
      if (rule.dayOfMonth && rule.dayOfMonth > 28) {
        const lastDayOfMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
        nextMonth.setDate(Math.min(rule.dayOfMonth, lastDayOfMonth));
      } else if (rule.dayOfMonth) {
        nextMonth.setDate(rule.dayOfMonth);
      }
      
      return nextMonth;
    
    case 'YEARLY':
      const nextYear = new Date(current);
      nextYear.setFullYear(current.getFullYear() + rule.frequencyInterval);
      return nextYear;
    
    default:
      throw new Error(`Unsupported frequency: ${rule.frequencyType}`);
  }
}

function shouldDeactivateRule(rule: Pick<RecurringRuleWithIncludes, 'endDate' | 'isInstallment' | 'totalOccurrences' | 'occurrencesGenerated'>): boolean {
  const now = new Date();
  
  // Check if end date has passed
  if (rule.endDate && now > rule.endDate) {
    return true;
  }
  
  // Check if installment is complete
  if (rule.isInstallment && rule.totalOccurrences && 
      rule.occurrencesGenerated >= rule.totalOccurrences) {
    return true;
  }
  
  return false;
}

function getDeactivationReason(rule: Pick<RecurringRuleWithIncludes, 'endDate' | 'isInstallment' | 'totalOccurrences' | 'occurrencesGenerated'>): string {
  const now = new Date();
  
  if (rule.endDate && now > rule.endDate) {
    return 'End date reached';
  }
  
  if (rule.isInstallment && rule.totalOccurrences && 
      rule.occurrencesGenerated >= rule.totalOccurrences) {
    return 'All installments completed';
  }
  
  return 'Unknown reason';
} 
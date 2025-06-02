import { db } from '@paradigma/db';
import { logger } from './logger.js';

let database: typeof db;

export async function initializeDatabase(): Promise<typeof db> {
  if (!database) {
    database = db;
    logger.info('Database connection initialized');
    const accounts = await db.account.count();
    logger.info('Accounts found', { accounts });
    const recurringRules = await db.recurringTransactionRule.count();
    logger.info('Recurring rules found', { recurringRules: recurringRules });
  }

  return database;
}

export function getDatabase(): typeof db {
  if (!database) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return database;
}

export async function disconnectDatabase(): Promise<void> {
  if (database) {
    await database.$disconnect();
    logger.info('Database disconnected');
  }
} 
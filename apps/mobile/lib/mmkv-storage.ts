import { MMKV } from 'react-native-mmkv'
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client'

// Create MMKV storage instances
export const mmkvStorage = new MMKV({
  id: 'react-query-cache',
  encryptionKey: 'your-encryption-key-here' // Consider using a secure key from secure storage
})

// Create persister for React Query
export const mmkvPersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    try {
      mmkvStorage.set('react-query-cache', JSON.stringify(client))
    } catch (error) {
      console.error('Failed to persist client:', error)
    }
  },
  restoreClient: async (): Promise<PersistedClient | undefined> => {
    try {
      const cached = mmkvStorage.getString('react-query-cache')
      return cached ? JSON.parse(cached) : undefined
    } catch (error) {
      console.error('Failed to restore client:', error)
      return undefined
    }
  },
  removeClient: async () => {
    try {
      mmkvStorage.delete('react-query-cache')
    } catch (error) {
      console.error('Failed to remove client:', error)
    }
  }
}

// Memory management configuration
const CACHE_SIZE_LIMITS = {
  MAX_CACHE_SIZE_MB: 50, // 50MB limit for cache
  MAX_TRANSACTION_CACHE_MONTHS: 6, // Keep only 6 months of transaction cache
  MAX_CHARTS_CACHE_MONTHS: 3, // Keep only 3 months of charts cache
  CLEANUP_THRESHOLD_MB: 40, // Start cleanup when cache exceeds 40MB
}

// Utility functions for manual cache management with memory optimization
export const cacheUtils = {
  // Get cache size in bytes
  getCacheSize: () => mmkvStorage.size,
  
  // Get cache size in MB
  getCacheSizeMB: () => Math.round((mmkvStorage.size / (1024 * 1024)) * 100) / 100,
  
  // Check if cache size exceeds limits
  isCacheOverLimit: () => cacheUtils.getCacheSizeMB() > CACHE_SIZE_LIMITS.CLEANUP_THRESHOLD_MB,
  
  // Clear all cache
  clearCache: () => mmkvStorage.clearAll(),
  
  // Clear specific React Query cache
  clearReactQueryCache: () => {
    try {
      mmkvStorage.delete('react-query-cache')
      console.log('🗑️ [CacheUtils] React Query cache cleared')
    } catch (error) {
      console.error('Failed to clear React Query cache:', error)
    }
  },
  
  // Smart cleanup to keep cache under limits
  performSmartCleanup: () => {
    try {
      const currentSizeMB = cacheUtils.getCacheSizeMB();
      console.log(`🧹 [CacheUtils] Starting smart cleanup. Current size: ${currentSizeMB}MB`);
      
      if (currentSizeMB <= CACHE_SIZE_LIMITS.CLEANUP_THRESHOLD_MB) {
        return; // No cleanup needed
      }
      
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Clean old transaction caches
      for (let year = currentYear - 1; year <= currentYear; year++) {
        for (let month = 1; month <= 12; month++) {
          const monthsAgo = (currentYear - year) * 12 + (currentMonth - month);
          if (monthsAgo > CACHE_SIZE_LIMITS.MAX_TRANSACTION_CACHE_MONTHS) {
            transactionUtils.clearTransactionCache(month, year);
          }
        }
      }
      
      // Clean old charts caches
      for (let year = currentYear - 1; year <= currentYear; year++) {
        for (let month = 1; month <= 12; month++) {
          const monthsAgo = (currentYear - year) * 12 + (currentMonth - month);
          if (monthsAgo > CACHE_SIZE_LIMITS.MAX_CHARTS_CACHE_MONTHS) {
            chartsUtils.clearChartsCache(month, year);
          }
        }
      }
      
      const newSizeMB = cacheUtils.getCacheSizeMB();
      console.log(`✅ [CacheUtils] Cleanup completed. New size: ${newSizeMB}MB`);
    } catch (error) {
      console.error('❌ [CacheUtils] Error during smart cleanup:', error);
    }
  },
  
  // Get specific cached query
  getCachedQuery: (key: string) => {
    try {
      const cached = mmkvStorage.getString(key)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  },
  
  // Set specific cached query with size check
  setCachedQuery: (key: string, data: unknown) => {
    try {
      // Perform cleanup if needed before adding new data
      if (cacheUtils.isCacheOverLimit()) {
        cacheUtils.performSmartCleanup();
      }
      
      mmkvStorage.set(key, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to cache query:', error)
    }
  },
  
  // Remove specific cached query
  removeCachedQuery: (key: string) => {
    try {
      mmkvStorage.delete(key)
    } catch (error) {
      console.error('Failed to remove cached query:', error)
    }
  },
  
  // Get cache statistics
  getCacheStats: () => {
    try {
      const allKeys = mmkvStorage.getAllKeys();
      const transactionCacheKeys = allKeys.filter(key => key.startsWith('transaction-cache-'));
      const chartsCacheKeys = allKeys.filter(key => key.startsWith('charts-cache-'));
      
      return {
        totalSizeMB: cacheUtils.getCacheSizeMB(),
        totalKeys: allKeys.length,
        transactionCaches: transactionCacheKeys.length,
        chartsCaches: chartsCacheKeys.length,
        isOverLimit: cacheUtils.isCacheOverLimit(),
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return null;
    }
  }
}

// Types for budget cache
interface CachedBudgetInfo {
  id: string;
  name: string;
  color: string;
  icon?: string;
  allocatedAmount: number;
}

interface BudgetCacheData {
  count: number;
  budgets: CachedBudgetInfo[];
  lastUpdated: number;
}

interface BudgetData {
  id: string;
  macroCategoryId: string;
  allocatedAmount: string | number | { toString(): string };
}

interface CategoryData {
  id: string;
  name: string;
  color: string;
  icon?: string;
  type: string;
}

// Budget utilities for managing monthly total budget and cache
export const budgetUtils = {
  // Get monthly total budget (stored locally)
  getMonthlyTotalBudget: (): number => {
    try {
      const budget = mmkvStorage.getNumber('monthly-total-budget')
      return budget || 0
    } catch {
      return 0
    }
  },
  
  // Set monthly total budget (stored locally)
  setMonthlyTotalBudget: (amount: number): void => {
    try {
      mmkvStorage.set('monthly-total-budget', amount)
    } catch (error) {
      console.error('Failed to set monthly budget:', error)
    }
  },
  
  // Clear monthly total budget
  clearMonthlyTotalBudget: (): void => {
    try {
      mmkvStorage.delete('monthly-total-budget')
    } catch (error) {
      console.error('Failed to clear monthly budget:', error)
    }
  },

  // Cache budget structure for better skeleton loading
  getBudgetCacheData: (): BudgetCacheData | null => {
    try {
      const cached = mmkvStorage.getString('budget-cache-data')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  },

  // Set budget cache data
  setBudgetCacheData: (budgets: BudgetData[], categories: CategoryData[]): void => {
    try {
      // Filter only expense categories and map to cached format
      const cachedBudgets: CachedBudgetInfo[] = budgets
        .map(budget => {
          const category = categories?.find(cat => cat.id === budget.macroCategoryId);
          if (category && category.type === 'EXPENSE') {
            return {
              id: budget.id,
              name: category.name,
              color: category.color,
              icon: category.icon,
              allocatedAmount: Number(budget.allocatedAmount)
            };
          }
          return null;
        })
        .filter(Boolean) as CachedBudgetInfo[];

      const cacheData: BudgetCacheData = {
        count: cachedBudgets.length,
        budgets: cachedBudgets,
        lastUpdated: Date.now()
      };

      mmkvStorage.set('budget-cache-data', JSON.stringify(cacheData))
    } catch (error) {
      console.error('Failed to cache budget data:', error)
    }
  },

  // Clear budget cache
  clearBudgetCache: (): void => {
    try {
      mmkvStorage.delete('budget-cache-data')
    } catch (error) {
      console.error('Failed to clear budget cache:', error)
    }
  },

  // Check if user has budgets (from cache)
  hasBudgetsFromCache: (): boolean => {
    const cacheData = budgetUtils.getBudgetCacheData();
    return cacheData ? cacheData.count > 0 : false;
  },

  // Get budget count from cache
  getBudgetCountFromCache: (): number => {
    const cacheData = budgetUtils.getBudgetCacheData();
    return cacheData ? cacheData.count : 0;
  }
}

// Transaction cache types
interface CachedTransactionInfo {
  id: string;
  amount: number;
  description: string;
  categoryName?: string;
  categoryColor?: string;
  categoryIcon?: string;
  type: 'income' | 'expense';
}

interface TransactionData {
  id: string;
  amount: string | number | { toString(): string };
  description: string;
  date: string | Date | { toString(): string };
  subCategory?: {
    icon?: string;
    macroCategory?: {
      name: string;
      color: string;
    };
  } | null;
}

interface TransactionCacheData {
  count: number;
  transactions: CachedTransactionInfo[];
  dailyGroupsCount: number;
  lastUpdated: number;
  month: number;
  year: number;
}

// Transaction utilities for caching home data
export const transactionUtils = {
  // Get transaction cache data for a specific month/year
  getTransactionCacheData: (month: number, year: number): TransactionCacheData | null => {
    try {
      const cacheKey = `transaction-cache-${month}-${year}`;
      const cached = mmkvStorage.getString(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  // Set transaction cache data
  setTransactionCacheData: (transactions: TransactionData[], month: number, year: number): void => {
    try {
      const cacheKey = `transaction-cache-${month}-${year}`;
      
             // Process transactions for cache
       const cachedTransactions: CachedTransactionInfo[] = transactions.slice(0, 10).map(t => {
         // Safely convert amount to number
         let amountValue: number;
         if (typeof t.amount === 'number') {
           amountValue = t.amount;
         } else if (typeof t.amount === 'string') {
           amountValue = parseFloat(t.amount);
         } else {
           // Handle Decimal or other object types
           amountValue = Number(t.amount.toString());
         }

         return {
           id: t.id,
           amount: amountValue,
           description: t.description,
           categoryName: t.subCategory?.macroCategory?.name,
           categoryColor: t.subCategory?.macroCategory?.color,
           categoryIcon: t.subCategory?.icon,
           type: amountValue > 0 ? 'income' : 'expense'
         };
       });

             // Count daily groups (simplified)
       const dates = new Set(transactions.map(t => {
         try {
           // Handle different date types safely
           let dateObj: Date;
           if (t.date instanceof Date) {
             dateObj = t.date;
           } else if (typeof t.date === 'string') {
             dateObj = new Date(t.date);
           } else {
             // Handle object with toString method
             dateObj = new Date(String(t.date));
           }
           
           // Validate date
           if (isNaN(dateObj.getTime())) {
             dateObj = new Date();
           }
           
           return dateObj.toISOString().split('T')[0];
         } catch {
           return new Date().toISOString().split('T')[0];
         }
       }));

      const cacheData: TransactionCacheData = {
        count: transactions.length,
        transactions: cachedTransactions,
        dailyGroupsCount: dates.size,
        lastUpdated: Date.now(),
        month,
        year
      };

      mmkvStorage.set(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache transaction data:', error);
    }
  },

  // Check if we have transactions in cache for a month/year
  hasTransactionsInCache: (month: number, year: number): boolean => {
    const cacheData = transactionUtils.getTransactionCacheData(month, year);
    return cacheData ? cacheData.count > 0 : false;
  },

  // Get transaction count from cache
  getTransactionCountFromCache: (month: number, year: number): number => {
    const cacheData = transactionUtils.getTransactionCacheData(month, year);
    return cacheData ? cacheData.count : 0;
  },

  // Get daily groups count from cache
  getDailyGroupsCountFromCache: (month: number, year: number): number => {
    const cacheData = transactionUtils.getTransactionCacheData(month, year);
    return cacheData ? cacheData.dailyGroupsCount : 0;
  },

  // Clear transaction cache for a specific month/year
  clearTransactionCache: (month: number, year: number): void => {
    try {
      const cacheKey = `transaction-cache-${month}-${year}`;
      mmkvStorage.delete(cacheKey);
    } catch (error) {
      console.error('Failed to clear transaction cache:', error);
    }
  }
}

// Charts cache types
interface CachedCategoryInfo {
  id: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

interface CategoryInputData {
  id: string;
  name: string;
  color: string;
  amount?: string | number;
  percentage?: string | number;
}

interface ChartsCacheData {
  categoriesCount: number;
  categories: CachedCategoryInfo[];
  hasHeatmapData: boolean;
  lastUpdated: number;
  month: number;
  year: number;
}

// Charts utilities for caching chart data
export const chartsUtils = {
  // Get charts cache data for a specific month/year
  getChartsCacheData: (month: number, year: number): ChartsCacheData | null => {
    try {
      const cacheKey = `charts-cache-${month}-${year}`;
      const cached = mmkvStorage.getString(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  // Set charts cache data
  setChartsCacheData: (categories: CategoryInputData[], hasHeatmapData: boolean, month: number, year: number): void => {
    try {
      const cacheKey = `charts-cache-${month}-${year}`;
      
      // Process categories for cache
      const cachedCategories: CachedCategoryInfo[] = categories.slice(0, 8).map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        amount: Number(cat.amount || 0),
        percentage: Number(cat.percentage || 0)
      }));

      const cacheData: ChartsCacheData = {
        categoriesCount: categories.length,
        categories: cachedCategories,
        hasHeatmapData,
        lastUpdated: Date.now(),
        month,
        year
      };

      mmkvStorage.set(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache charts data:', error);
    }
  },

  // Check if we have charts data in cache
  hasChartsInCache: (month: number, year: number): boolean => {
    const cacheData = chartsUtils.getChartsCacheData(month, year);
    return cacheData ? cacheData.categoriesCount > 0 : false;
  },

  // Get categories count from cache
  getCategoriesCountFromCache: (month: number, year: number): number => {
    const cacheData = chartsUtils.getChartsCacheData(month, year);
    return cacheData ? cacheData.categoriesCount : 0;
  },

  // Clear charts cache for a specific month/year
  clearChartsCache: (month: number, year: number): void => {
    try {
      const cacheKey = `charts-cache-${month}-${year}`;
      mmkvStorage.delete(cacheKey);
    } catch (error) {
      console.error('Failed to clear charts cache:', error);
    }
  }
}

// Goals cache types
interface CachedGoalInfo {
  id: string;
  name: string;
  color: string;
  balance: number;
  targetAmount: number;
  progress: number;
}

interface GoalInputData {
  id: string;
  name: string;
  color: string;
  balance?: string | number;
  targetAmount?: string | number;
  progress?: string | number;
}

interface GoalsCacheData {
  goalsCount: number;
  goals: CachedGoalInfo[];
  lastUpdated: number;
}

// Goals utilities for caching goals data
export const goalsUtils = {
  // Get goals cache data
  getGoalsCacheData: (): GoalsCacheData | null => {
    try {
      const cached = mmkvStorage.getString('goals-cache-data');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  // Set goals cache data
  setGoalsCacheData: (goals: GoalInputData[]): void => {
    try {
      // Process goals for cache
      const cachedGoals: CachedGoalInfo[] = goals.slice(0, 10).map(goal => ({
        id: goal.id,
        name: goal.name,
        color: goal.color,
        balance: Number(goal.balance || 0),
        targetAmount: Number(goal.targetAmount || 0),
        progress: Number(goal.progress || 0)
      }));

      const cacheData: GoalsCacheData = {
        goalsCount: goals.length,
        goals: cachedGoals,
        lastUpdated: Date.now()
      };

      mmkvStorage.set('goals-cache-data', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache goals data:', error);
    }
  },

  // Check if we have goals in cache
  hasGoalsInCache: (): boolean => {
    const cacheData = goalsUtils.getGoalsCacheData();
    return cacheData ? cacheData.goalsCount > 0 : false;
  },

  // Get goals count from cache
  getGoalsCountFromCache: (): number => {
    const cacheData = goalsUtils.getGoalsCacheData();
    return cacheData ? cacheData.goalsCount : 0;
  },

  // Clear goals cache
  clearGoalsCache: (): void => {
    try {
      mmkvStorage.delete('goals-cache-data');
    } catch (error) {
      console.error('Failed to clear goals cache:', error);
    }
  }
}

// Category cache utilities for managing category-specific cache
export const categoryUtils = {
  // Clear all category-related cache (React Query + local cache)
  clearCategoryCache: (): void => {
    try {
      // Clear React Query cache
      cacheUtils.clearReactQueryCache();
      
      // Clear any category-specific local cache if it exists
      const allKeys = mmkvStorage.getAllKeys();
      const categoryKeys = allKeys.filter(key => key.includes('category'));
      
      categoryKeys.forEach(key => {
        mmkvStorage.delete(key);
      });
      
      console.log('🗑️ [CategoryUtils] All category cache cleared');
    } catch (error) {
      console.error('Failed to clear category cache:', error);
    }
  },
  
  // Clear React Query cache and force reload
  forceClearCategoryCache: (): void => {
    try {
      // Clear React Query persistent cache
      cacheUtils.clearReactQueryCache();
      
      // Also clear any MMKV keys that might contain category data
      const allKeys = mmkvStorage.getAllKeys();
      const relevantKeys = allKeys.filter(key => 
        key.includes('category') || 
        key.includes('react-query') ||
        key.includes('query-cache')
      );
      
      relevantKeys.forEach(key => {
        mmkvStorage.delete(key);
      });
      
      console.log('🗑️ [CategoryUtils] Force clear completed - all category and query cache cleared');
    } catch (error) {
      console.error('Failed to force clear category cache:', error);
    }
  }
}

// Notification preferences types
interface NotificationPreferences {
  dailyReminderEnabled: boolean;
  reminderTime: string;
  recurringNotificationsEnabled: boolean;
  notificationToken?: string;
}

// Notification utilities for managing notification preferences during onboarding
export const notificationUtils = {
  // Save notification preferences temporarily during onboarding
  saveNotificationPreferences: (preferences: NotificationPreferences): void => {
    try {
      mmkvStorage.set('onboarding-notifications', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  },

  // Get saved notification preferences
  getNotificationPreferences: (): NotificationPreferences | null => {
    try {
      const cached = mmkvStorage.getString('onboarding-notifications');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  // Clear notification preferences after they have been processed
  clearNotificationPreferences: (): void => {
    try {
      mmkvStorage.delete('onboarding-notifications');
    } catch (error) {
      console.error('Failed to clear notification preferences:', error);
    }
  },

  // Check if notification preferences have been set
  hasNotificationPreferences: (): boolean => {
    const preferences = notificationUtils.getNotificationPreferences();
    return preferences !== null;
  },

  // Persistent daily reminder settings (separate from onboarding)
  saveDailyReminderSettings: (enabled: boolean, time: string): void => {
    try {
      mmkvStorage.set('daily-reminder-enabled', enabled);
      mmkvStorage.set('daily-reminder-time', time);
    } catch (error) {
      console.error('Failed to save daily reminder settings:', error);
    }
  },

  // Get daily reminder enabled status
  getDailyReminderEnabled: (): boolean => {
    try {
      const enabled = mmkvStorage.getBoolean('daily-reminder-enabled');
      return enabled || false;
    } catch {
      return false;
    }
  },

  // Get daily reminder time
  getDailyReminderTime: (): string => {
    try {
      const time = mmkvStorage.getString('daily-reminder-time');
      return time || '19:00';
    } catch {
      return '19:00';
    }
  },

  // Clear daily reminder settings
  clearDailyReminderSettings: (): void => {
    try {
      mmkvStorage.delete('daily-reminder-enabled');
      mmkvStorage.delete('daily-reminder-time');
    } catch (error) {
      console.error('Failed to clear daily reminder settings:', error);
    }
  }
}

// Biometric authentication utilities for managing Face ID/Touch ID settings
export const biometricUtils = {
  // Enable biometric authentication
  setBiometricEnabled: (enabled: boolean): void => {
    try {
      mmkvStorage.set('biometric-authentication-enabled', enabled);
      console.log(`[Biometric] Authentication ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to set biometric authentication setting:', error);
    }
  },

  // Check if biometric authentication is enabled
  getBiometricEnabled: (): boolean => {
    try {
      const enabled = mmkvStorage.getBoolean('biometric-authentication-enabled');
      return enabled || false;
    } catch {
      return false;
    }
  },

  // Set whether the app needs biometric authentication (after going to background)
  setNeedsBiometricAuth: (needs: boolean): void => {
    try {
      mmkvStorage.set('needs-biometric-auth', needs);
    } catch (error) {
      console.error('Failed to set needs biometric auth flag:', error);
    }
  },

  // Check if the app needs biometric authentication
  getNeedsBiometricAuth: (): boolean => {
    try {
      const needs = mmkvStorage.getBoolean('needs-biometric-auth');
      return needs || false;
    } catch {
      return false;
    }
  },

  // Record the last time the app was authenticated
  setLastAuthenticatedTime: (): void => {
    try {
      mmkvStorage.set('last-authenticated-time', Date.now());
    } catch (error) {
      console.error('Failed to set last authenticated time:', error);
    }
  },

  // Get the last authenticated time
  getLastAuthenticatedTime: (): number => {
    try {
      const time = mmkvStorage.getNumber('last-authenticated-time');
      return time || 0;
    } catch {
      return 0;
    }
  },

  // Clear all biometric settings
  clearBiometricSettings: (): void => {
    try {
      mmkvStorage.delete('biometric-authentication-enabled');
      mmkvStorage.delete('needs-biometric-auth');
      mmkvStorage.delete('last-authenticated-time');
      console.log('[Biometric] All settings cleared');
    } catch (error) {
      console.error('Failed to clear biometric settings:', error);
    }
  },

  // Check if enough time has passed to require re-authentication (5 minutes)
  shouldRequireAuth: (): boolean => {
    const lastAuthTime = biometricUtils.getLastAuthenticatedTime();
    const now = Date.now();
    const timeoutMs = 5 * 60 * 1000; // 5 minutes
    return (now - lastAuthTime) > timeoutMs;
  }
}

// UI preferences utilities
export const uiUtils = {
  // Get balance blur state
  getBalanceBlurred: (): boolean => {
    try {
      return mmkvStorage.getBoolean('balance-blurred') || false
    } catch {
      return false
    }
  },
  
  // Set balance blur state
  setBalanceBlurred: (blurred: boolean): void => {
    try {
      mmkvStorage.set('balance-blurred', blurred)
    } catch (error) {
      console.error('Failed to set balance blur state:', error)
    }
  },
  
  // Clear all UI preferences
  clearUIPreferences: (): void => {
    try {
      mmkvStorage.delete('balance-blurred')
    } catch (error) {
      console.error('Failed to clear UI preferences:', error)
    }
  }
} 
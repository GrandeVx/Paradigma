import { useEffect, useMemo } from 'react';
import { api } from '@/lib/api';

export const useTabPrefetching = (currentTab: string) => {
  const utils = api.useContext();
  
  // Current month/year for queries
  const currentDate = useMemo(() => new Date(), []);
  const queryParams = useMemo(() => ({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  }), [currentDate]);

  useEffect(() => {
    const prefetchWithDelay = (delay: number, prefetchFn: () => Promise<any>) => {
      setTimeout(() => {
        prefetchFn().catch(() => {
          // Silently handle prefetch errors
        });
      }, delay);
    };

    // Prefetch strategies based on current tab
    if (currentTab === "(home)") {
      // When on home, prefetch other tab data with staggered delays
      prefetchWithDelay(500, () => 
        utils.budget.getCurrentSettings.prefetch({})
      );
      prefetchWithDelay(1000, () => 
        utils.account.listWithBalances.prefetch({})
      );
      prefetchWithDelay(1500, () =>
        utils.category.list.prefetch({})
      );
    } 
    else if (currentTab === "(budgets)") {
      // When on budgets, prefetch transaction data that might be needed
      prefetchWithDelay(300, () =>
        utils.transaction.getMonthlySpending.prefetch(queryParams)
      );
      prefetchWithDelay(600, () =>
        utils.account.listWithBalances.prefetch({})
      );
    }
    else if (currentTab === "(accounts)") {
      // When on accounts, prefetch recent transactions
      prefetchWithDelay(300, () =>
        utils.transaction.getDailySpending.prefetch(queryParams)
      );
      prefetchWithDelay(600, () =>
        utils.budget.getCurrentSettings.prefetch({})
      );
    }
    else if (currentTab === "(profile)") {
      // Profile tab might need user data, settings etc.
      // Add prefetching as needed
    }
  }, [currentTab, utils, queryParams]);

  // Prefetch static data that rarely changes (aggressive caching)
  useEffect(() => {
    // Categories change very rarely, prefetch with long stale time
    utils.category.list.prefetch({}, {
      staleTime: 1000 * 60 * 30, // 30 minutes for categories
    });
  }, [utils]);
}; 
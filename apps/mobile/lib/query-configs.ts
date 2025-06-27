// Query-specific configurations for optimal performance
export const queryConfigs = {
  // Static data that rarely changes
  categories: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 60 * 24 * 7, // 1 week
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  
  // Budget settings (change occasionally)
  budgetSettings: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
  },
  
  // Account balances (need fresher data)
  accountBalances: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: true,
  },
  
  // Transaction data (frequently changing)
  transactions: {
    staleTime: 1000 * 60 * 1, // 1 minute
    cacheTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: true,
  },
  
  // Daily/monthly summaries (medium freshness)
  summaries: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  },
};

// Helper function to apply configs
export const withQueryConfig = (type: keyof typeof queryConfigs) => {
  return queryConfigs[type];
}; 
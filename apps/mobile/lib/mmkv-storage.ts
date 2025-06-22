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

// Utility functions for manual cache management
export const cacheUtils = {
  // Get cache size
  getCacheSize: () => mmkvStorage.size,
  
  // Clear all cache
  clearCache: () => mmkvStorage.clearAll(),
  
  // Get specific cached query
  getCachedQuery: (key: string) => {
    try {
      const cached = mmkvStorage.getString(key)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  },
  
  // Set specific cached query
  setCachedQuery: (key: string, data: unknown) => {
    try {
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
  }
}

// Budget utilities for managing monthly total budget
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
  }
} 
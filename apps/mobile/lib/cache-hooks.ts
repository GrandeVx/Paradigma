import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { mmkvStorage, cacheUtils, categoryUtils } from './mmkv-storage';

// Current cache version - increment when API schema changes
const CACHE_VERSION = '1.1.3';
const CACHE_VERSION_KEY = 'cache-version';

// Custom hook for manual cache management
export const useMMKVCache = () => {
  const queryClient = useQueryClient();

  const getCachedData = <T = unknown>(key: string): T | null => {
    try {
      const cached = mmkvStorage.getString(key);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  const setCachedData = <T = unknown>(key: string, data: T): void => {
    try {
      mmkvStorage.set(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  };

  const invalidateCache = (key?: string): void => {
    if (key) {
      mmkvStorage.delete(key);
      // Also invalidate in React Query
      queryClient.invalidateQueries({ queryKey: [key] });
    } else {
      // Clear all cache
      mmkvStorage.clearAll();
      queryClient.clear();
    }
  };

  const getCacheStats = () => ({
    size: mmkvStorage.size,
    allKeys: mmkvStorage.getAllKeys(),
  });

  return {
    getCachedData,
    setCachedData,
    invalidateCache,
    getCacheStats,
    cacheUtils,
  };
};

// Hook to sync React Query with MMKV for specific queries
export const useQueryCacheSync = (queryKey: string[]) => {
  const { setCachedData, getCachedData } = useMMKVCache();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Try to restore data from MMKV on mount
    const cacheKey = queryKey.join('.');
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      queryClient.setQueryData(queryKey, cachedData);
      console.log(`🔄 [Cache] Restored query ${cacheKey} from MMKV`);
    }

    // Set up a listener for query data changes
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.query.queryKey.toString() === queryKey.toString()) {
        const data = event.query.state.data;
        if (data !== undefined) {
          setCachedData(cacheKey, data);
          console.log(`💾 [Cache] Saved query ${cacheKey} to MMKV`);
        }
      }
    });

    return unsubscribe;
  }, [queryKey.join('.'), setCachedData, getCachedData, queryClient]);
};

// Auto-sync hook for all queries
export const useAutoQuerySync = () => {
  const { setCachedData } = useMMKVCache();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔄 [Cache] Setting up auto-sync with MMKV');

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.query.state.data !== undefined) {
        const cacheKey = event.query.queryKey.join('.');
        setCachedData(`query.${cacheKey}`, {
          data: event.query.state.data,
          dataUpdatedAt: event.query.state.dataUpdatedAt,
        });
      }
    });

    return unsubscribe;
  }, [setCachedData, queryClient]);
};

// Cache versioning and automatic cleanup
export const useCacheVersioning = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkCacheVersion = () => {
      try {
        const storedVersion = mmkvStorage.getString(CACHE_VERSION_KEY);

        if (storedVersion !== CACHE_VERSION) {
          console.log(`🔄 [Cache] Version mismatch: ${storedVersion} → ${CACHE_VERSION}`);
          console.log('🗑️ [Cache] Clearing all cache due to version change');

          // Clear all cache
          mmkvStorage.clearAll();
          queryClient.clear();

          // Set new version
          mmkvStorage.set(CACHE_VERSION_KEY, CACHE_VERSION);

          console.log('✅ [Cache] Cache cleared and version updated');
        } else {
          console.log(`✅ [Cache] Version check passed: ${CACHE_VERSION}`);
        }
      } catch (error) {
        console.error('❌ [Cache] Error checking cache version:', error);
        // On error, clear cache to be safe
        mmkvStorage.clearAll();
        queryClient.clear();
        mmkvStorage.set(CACHE_VERSION_KEY, CACHE_VERSION);
      }
    };

    checkCacheVersion();
  }, [queryClient]);
};

// Enhanced cache management utilities
export const useCacheManagement = () => {
  const queryClient = useQueryClient();

  const clearAllCache = () => {
    console.log('🗑️ [Cache] Clearing all cache...');
    mmkvStorage.clearAll();
    queryClient.clear();
    mmkvStorage.set(CACHE_VERSION_KEY, CACHE_VERSION);
    console.log('✅ [Cache] All cache cleared');
  };

  const clearCategoryCache = () => {
    console.log('🗑️ [Cache] Clearing category cache...');
    categoryUtils.forceClearCategoryCache();
    queryClient.invalidateQueries({ queryKey: ['category'] });
    console.log('✅ [Cache] Category cache cleared');
  };

  const clearSpecificCache = (cacheKey: string) => {
    console.log(`🗑️ [Cache] Clearing cache for: ${cacheKey}`);
    mmkvStorage.delete(cacheKey);
    queryClient.invalidateQueries({ queryKey: [cacheKey] });
    console.log(`✅ [Cache] Cache cleared for: ${cacheKey}`);
  };

  const getCacheInfo = () => {
    const stats = cacheUtils.getCacheStats();
    const version = mmkvStorage.getString(CACHE_VERSION_KEY);

    return {
      version,
      expectedVersion: CACHE_VERSION,
      isVersionMismatch: version !== CACHE_VERSION,
      ...stats,
    };
  };

  const resetCacheVersion = () => {
    console.log('🔄 [Cache] Resetting cache version...');
    mmkvStorage.set(CACHE_VERSION_KEY, CACHE_VERSION);
    console.log('✅ [Cache] Cache version reset');
  };

  return {
    clearAllCache,
    clearCategoryCache,
    clearSpecificCache,
    getCacheInfo,
    resetCacheVersion,
    currentVersion: CACHE_VERSION,
  };
}; 
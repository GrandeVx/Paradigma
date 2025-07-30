import { MMKV } from 'react-native-mmkv';
import type { CategoryTranslations } from '@paradigma/shared';

// Dedicated MMKV instance for translations
const translationStorage = new MMKV({
  id: 'translation-cache',
  // No encryption needed for translations as they're not sensitive
});

// Cache keys
const CACHE_KEYS = {
  TRANSLATIONS: 'cached-translations',
  LANGUAGE: 'cached-language',
  VERSION: 'translation-cache-version',
  TIMESTAMP: 'cache-timestamp',
} as const;

// Cache version - increment when translation structure changes
const CACHE_VERSION = '1.0.0';

// Cache duration (24 hours in milliseconds)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

interface CachedTranslations {
  data: CategoryTranslations;
  language: string;
  timestamp: number;
  version: string;
}

export class TranslationCache {
  /**
   * Check if cached translations are valid
   */
  static isValidCache(language: string): boolean {
    try {
      const version = translationStorage.getString(CACHE_KEYS.VERSION);
      const cachedLanguage = translationStorage.getString(CACHE_KEYS.LANGUAGE);
      const timestamp = translationStorage.getNumber(CACHE_KEYS.TIMESTAMP);

      // Check version match
      if (version !== CACHE_VERSION) {
        return false;
      }

      // Check language match
      if (cachedLanguage !== language) {
        return false;
      }

      // Check if cache is still fresh (within 24 hours)
      if (!timestamp || Date.now() - timestamp > CACHE_DURATION) {
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Error checking translation cache validity:', error);
      return false;
    }
  }

  /**
   * Get cached translations if valid
   */
  static getCachedTranslations(language: string): CategoryTranslations | null {
    try {
      if (!this.isValidCache(language)) {
        return null;
      }

      const cachedData = translationStorage.getString(CACHE_KEYS.TRANSLATIONS);
      if (!cachedData) {
        return null;
      }

      const parsed: CachedTranslations = JSON.parse(cachedData);
      console.log(`📚 [TranslationCache] Retrieved cached translations for ${language}`);
      
      return parsed.data;
    } catch (error) {
      console.warn('Error retrieving cached translations:', error);
      return null;
    }
  }

  /**
   * Cache translations
   */
  static cacheTranslations(translations: CategoryTranslations, language: string): void {
    try {
      const cacheData: CachedTranslations = {
        data: translations,
        language,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };

      translationStorage.set(CACHE_KEYS.TRANSLATIONS, JSON.stringify(cacheData));
      translationStorage.set(CACHE_KEYS.LANGUAGE, language);
      translationStorage.set(CACHE_KEYS.VERSION, CACHE_VERSION);
      translationStorage.set(CACHE_KEYS.TIMESTAMP, Date.now());

      console.log(`💾 [TranslationCache] Cached translations for ${language}`);
    } catch (error) {
      console.warn('Error caching translations:', error);
    }
  }

  /**
   * Clear all cached translations
   */
  static clearCache(): void {
    try {
      Object.values(CACHE_KEYS).forEach(key => {
        translationStorage.delete(key);
      });
      console.log('🗑️ [TranslationCache] Translation cache cleared');
    } catch (error) {
      console.warn('Error clearing translation cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    try {
      const language = translationStorage.getString(CACHE_KEYS.LANGUAGE);
      const timestamp = translationStorage.getNumber(CACHE_KEYS.TIMESTAMP);
      const version = translationStorage.getString(CACHE_KEYS.VERSION);
      const size = translationStorage.size;

      return {
        language: language || 'none',
        lastCached: timestamp ? new Date(timestamp).toISOString() : 'never',
        version: version || 'unknown',
        sizeBytes: size,
        isValid: language ? this.isValidCache(language) : false,
      };
    } catch (error) {
      console.warn('Error getting cache stats:', error);
      return {
        language: 'error',
        lastCached: 'error',
        version: 'error',
        sizeBytes: 0,
        isValid: false,
      };
    }
  }

  /**
   * Preload common translations for better performance
   */
  static preloadCommonTranslations(language: string): void {
    // This could be used to preload the most commonly used translations
    // For now, it's a placeholder for future optimization
    console.log(`🚀 [TranslationCache] Preloading common translations for ${language}`);
  }
}

export default TranslationCache;
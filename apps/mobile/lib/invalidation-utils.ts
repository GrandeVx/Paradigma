import { api } from './api';

/**
 * Generic invalidation utility for boilerplate template.
 * Add your own invalidation patterns based on your app's specific needs.
 */
export class InvalidationUtils {
  /**
   * Generic invalidation method for when data changes.
   * Replace with your app's specific query invalidation logic.
   */
  static async invalidateDataRelatedQueries(
    utils: ReturnType<typeof api.useContext>,
    options?: {
      entityId?: string;
      clearCache?: boolean;
    }
  ) {
    const { entityId, clearCache = false } = options || {};

    console.log('🔄 [InvalidationUtils] Starting generic query invalidation...');

    try {
      // === ADD YOUR APP-SPECIFIC INVALIDATION LOGIC HERE ===
      // Example patterns:
      // await utils.yourRouter.yourQuery.invalidate();
      // if (entityId) {
      //   await utils.yourRouter.getById.invalidate({ id: entityId });
      // }
      
      // === CACHE CLEANUP ===
      if (clearCache) {
        // Add your cache cleanup logic here
        console.log('🧹 [InvalidationUtils] Cache cleanup requested');
      }

      console.log('✅ [InvalidationUtils] Generic queries invalidated successfully');
    } catch (error) {
      console.error('❌ [InvalidationUtils] Error during query invalidation:', error);
      throw error;
    }
  }

  /**
   * Generic pattern for entity-specific queries.
   * Replace with your app's specific entity invalidation logic.
   */
  static async invalidateEntityQueries(utils: ReturnType<typeof api.useContext>) {
    // Example: await utils.yourEntity.list.invalidate();
    // Example: await utils.yourEntity.getById.invalidate();
    console.log('🔄 [InvalidationUtils] Entity queries invalidation (add your logic here)');
  }

  /**
   * Generic pattern for feature-specific queries.
   * Replace with your app's specific feature invalidation logic.
   */
  static async invalidateFeatureQueries(
    utils: ReturnType<typeof api.useContext>,
    options?: {
      featureId?: string;
      additionalParams?: any[];
    }
  ) {
    console.log('🔄 [InvalidationUtils] Feature queries invalidation...');
    
    try {
      // === ADD YOUR FEATURE-SPECIFIC INVALIDATION HERE ===
      // Example patterns:
      // await utils.yourFeature.getSettings.invalidate();
      // if (options?.featureId) {
      //   await utils.yourFeature.getById.invalidate({ id: options.featureId });
      // }
      
      console.log('✅ [InvalidationUtils] Feature queries invalidated successfully');
    } catch (error) {
      console.error('❌ [InvalidationUtils] Error invalidating feature queries:', error);
      throw error;
    }
  }

  /**
   * Generic pattern for category or classification queries.
   * Replace with your app's specific classification invalidation logic.
   */
  static async invalidateClassificationQueries(
    utils: ReturnType<typeof api.useContext>,
    options: {
      classificationId: string;
      additionalFilters?: Record<string, any>;
    }
  ) {
    const { classificationId, additionalFilters } = options;
    
    console.log(`🏷️ [InvalidationUtils] Invalidating classification queries for ID: ${classificationId}...`);
    
    try {
      // === ADD YOUR CLASSIFICATION-SPECIFIC INVALIDATION HERE ===
      // Example patterns:
      // await utils.yourEntity.getByClassification.invalidate({ classificationId });
      // if (additionalFilters) {
      //   await utils.yourEntity.getFiltered.invalidate({ ...additionalFilters, classificationId });
      // }
      
      console.log(`✅ [InvalidationUtils] Classification queries invalidated for ${classificationId}`);
    } catch (error) {
      console.error(`❌ [InvalidationUtils] Error invalidating classification queries for ${classificationId}:`, error);
      throw error;
    }
  }

  /**
   * Generic pattern for dashboard/summary queries.
   * Replace with your app's specific dashboard invalidation logic.
   */
  static async invalidateDashboardQueries(
    utils: ReturnType<typeof api.useContext>,
    options?: {
      timeFilter?: Record<string, any>;
      scope?: string;
    }
  ) {
    console.log('📊 [InvalidationUtils] Invalidating dashboard queries...');
    
    try {
      // === ADD YOUR DASHBOARD-SPECIFIC INVALIDATION HERE ===
      // Example patterns:
      // await utils.dashboard.getSummary.invalidate(options?.timeFilter);
      // await utils.analytics.getBreakdown.invalidate(options?.scope);
      
      console.log('✅ [InvalidationUtils] Dashboard queries invalidated successfully');
    } catch (error) {
      console.error('❌ [InvalidationUtils] Error invalidating dashboard queries:', error);
      throw error;
    }
  }

  /**
   * Generic pattern for rule or configuration queries.
   * Replace with your app's specific configuration invalidation logic.
   */
  static async invalidateConfigurationQueries(
    utils: ReturnType<typeof api.useContext>
  ) {
    console.log('⚙️ [InvalidationUtils] Invalidating configuration queries...');
    
    try {
      // === ADD YOUR CONFIGURATION-SPECIFIC INVALIDATION HERE ===
      // Example patterns:
      // await utils.config.list.invalidate();
      // await utils.settings.getAll.invalidate();
      // await utils.rules.getById.invalidate();
      
      console.log('✅ [InvalidationUtils] Configuration queries invalidated successfully');
    } catch (error) {
      console.error('❌ [InvalidationUtils] Error invalidating configuration queries:', error);
      throw error;
    }
  }

  /**
   * Generic pattern for analytics/visualization queries.
   * Replace with your app's specific analytics invalidation logic.
   */
  static async invalidateAnalyticsQueries(
    utils: ReturnType<typeof api.useContext>,
    options?: {
      timeRange?: Record<string, any>;
      includeRelated?: boolean;
    }
  ) {
    console.log('📊 [InvalidationUtils] Analytics queries invalidation...');
    
    try {
      // === ADD YOUR ANALYTICS-SPECIFIC INVALIDATION HERE ===
      // Example patterns:
      // await utils.analytics.getSummary.invalidate(options?.timeRange);
      // await utils.charts.getData.invalidate();
      
      if (options?.includeRelated) {
        // Add related queries invalidation
        console.log('📊 [InvalidationUtils] Including related analytics queries...');
        // await utils.analytics.getRelatedData.invalidate();
      }
      
      console.log('✅ [InvalidationUtils] Analytics queries invalidated successfully');
    } catch (error) {
      console.error('❌ [InvalidationUtils] Error invalidating analytics queries:', error);
      throw error;
    }
  }

  /**
   * Lightweight invalidation for immediate UI updates.
   * Replace with your app's essential queries for quick updates.
   */
  static async invalidateEssentialQueries(
    utils: ReturnType<typeof api.useContext>,
    options: {
      entityId?: string;
      scope?: string;
    }
  ) {
    console.log(`⚡ [InvalidationUtils] Essential queries invalidation: ${options.entityId || 'all'}`);
    
    try {
      // === ADD YOUR ESSENTIAL QUERIES INVALIDATION HERE ===
      // Example patterns:
      // await utils.essential.getData.invalidate({ id: options.entityId });
      // await utils.summary.getQuick.invalidate({ scope: options.scope });
      
      console.log('✅ [InvalidationUtils] Essential queries invalidation completed');
    } catch (error) {
      console.error('❌ [InvalidationUtils] Error in essential queries invalidation:', error);
      throw error;
    }
  }
} 
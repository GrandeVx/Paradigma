import { useTabVisibility } from '@/app/(protected)/(home)';

/**
 * Hook per ottimizzare le animazioni nelle sezioni dei tab
 * Le animazioni possono essere disabilitate quando il tab non è visibile
 */
export const useTabOptimizations = () => {
  const { isTabVisible } = useTabVisibility();

  return {
    // Se il tab non è visibile, disabilita le animazioni costose
    shouldAnimateEntries: isTabVisible,
    // Riduce la durata delle animazioni per tab non attivi
    getAnimationDuration: (defaultDuration: number) => 
      isTabVisible ? defaultDuration : Math.min(defaultDuration * 0.5, 150),
    // Per animazioni che dovrebbero essere saltate completamente quando non visibili
    shouldSkipAnimation: !isTabVisible,
    // Per controlli condizionali di visibilità
    isTabVisible,
  };
}; 
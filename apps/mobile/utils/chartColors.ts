import type { SpendingIntensity } from '@/types/charts';

// Fallback colors if category color is missing from DB
export const FALLBACK_CATEGORY_COLORS = [
  '#E81411', '#409FF8', '#FDAD0C', '#FA6B97', 
  '#7E01FB', '#03965E', '#10B981', '#8B5CF6', 
  '#F59E0B', '#6B7280'
] as const;

// Heatmap intensity colors from Figma
export const INTENSITY_COLORS: Record<SpendingIntensity, string> = {
  none: '#F9FAFB',     // Gray - no spending
  low: '#ECF7E9',      // Light green - €1-50
  medium: '#FCF1DF',   // Light yellow - €51-100  
  high: '#FAE2E1',     // Light red - €100+
};

// Spending thresholds for intensity calculation
export const SPENDING_THRESHOLDS = {
  none: 0,
  low: 1,      // €1-50
  medium: 51,  // €51-100
  high: 101,   // €100+
} as const;

/**
 * Get fallback color for a category (when DB color is missing)
 */
export const getFallbackCategoryColor = (index: number): string => {
  return FALLBACK_CATEGORY_COLORS[index % FALLBACK_CATEGORY_COLORS.length];
};

/**
 * Calculate spending intensity based on amount
 */
export const getSpendingIntensity = (amount: number): SpendingIntensity => {
  if (amount === 0) return 'none';
  if (amount < SPENDING_THRESHOLDS.medium) return 'low';
  if (amount < SPENDING_THRESHOLDS.high) return 'medium';
  return 'high';
};

/**
 * Get color for spending intensity
 */
export const getIntensityColor = (intensity: SpendingIntensity): string => {
  return INTENSITY_COLORS[intensity];
};

/**
 * Get color for spending amount (combines intensity calculation + color)
 */
export const getSpendingColor = (amount: number): string => {
  const intensity = getSpendingIntensity(amount);
  return getIntensityColor(intensity);
};

/**
 * Generate a color palette for categories with fallbacks
 * (Categories should use colors from DB, this is only for fallback cases)
 */
export const generateFallbackColors = (count: number): string[] => {
  const colors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    colors.push(getFallbackCategoryColor(i));
  }
  
  return colors;
};

// Export all fallback colors as array for easier iteration
export const FALLBACK_COLOR_VALUES = Array.from(FALLBACK_CATEGORY_COLORS); 
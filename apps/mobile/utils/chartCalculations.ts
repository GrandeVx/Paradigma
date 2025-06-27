import type { CategoryData, DonutSegment, CalendarDay, DailySpending, TransactionWithCategory, MacroCategoryDB, CalendarWeek, CalendarMonth } from '@/types/charts';
import { getSpendingIntensity, getFallbackCategoryColor } from './chartColors';

/**
 * Calculate donut chart segments with angles and SVG paths
 */
export const calculateDonutSegments = (
  data: CategoryData[],
  size: number = 200,
  strokeWidth: number = 40
): DonutSegment[] => {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  
  if (total === 0) return [];
  
  let currentAngle = 0;
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = (size / 2) - (strokeWidth / 2);
  const innerRadius = outerRadius - strokeWidth;
  
  return data.map((item) => {
    const percentage = (item.amount / total) * 100;
    let angleSize = (percentage / 100) * 360;
    
    // Fix for 100% single category: reduce angle slightly to avoid SVG rendering issues
    if (angleSize >= 360) {
      angleSize = 359.99; // Slightly less than 360 to ensure proper SVG rendering
    }
    
    // Convert to radians for calculations
    const startAngleRad = (currentAngle * Math.PI) / 180;
    const endAngleRad = ((currentAngle + angleSize) * Math.PI) / 180;

    // Calculate start and end points for outer arc
    const startOuterX = centerX + outerRadius * Math.cos(startAngleRad);
    const startOuterY = centerY + outerRadius * Math.sin(startAngleRad);
    const endOuterX = centerX + outerRadius * Math.cos(endAngleRad);
    const endOuterY = centerY + outerRadius * Math.sin(endAngleRad);
    
    // Calculate start and end points for inner arc
    const startInnerX = centerX + innerRadius * Math.cos(endAngleRad);
    const startInnerY = centerY + innerRadius * Math.sin(endAngleRad);
    const endInnerX = centerX + innerRadius * Math.cos(startAngleRad);
    const endInnerY = centerY + innerRadius * Math.sin(startAngleRad);
    
    // Large arc flag for arcs > 180 degrees
    const largeArcFlag = angleSize > 180 ? 1 : 0;
    
    // Create SVG path for the segment
    const path = [
      `M ${startOuterX} ${startOuterY }`, // Move to start of outer arc
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}`, // Outer arc
      `L ${startInnerX} ${startInnerY}`, // Line to inner arc
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${endInnerX} ${endInnerY}`, // Inner arc (reverse)
      'Z' // Close path
    ].join(' ');
    
    const segment: DonutSegment = {
      ...item,
      percentage: Number(percentage.toFixed(1)),
      color: item.color, // Color should always come from DB now
      startAngle: currentAngle,
      endAngle: currentAngle + angleSize,
      angleSize,
      path
    };
    
    currentAngle += angleSize;
    return segment;
  });
};

/**
 * Generate calendar grid for heatmap
 */
export const generateCalendarGrid = (
  year: number,
  month: number,
  dailyData: DailySpending[] = []
): CalendarMonth => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const adjustedStartWeekday = startWeekday === 0 ? 6 : startWeekday - 1;
  
  // Create data map for quick lookup
  const dataMap = new Map<string, DailySpending>();
  dailyData.forEach(item => {
    dataMap.set(item.date, item);
  });
  
  const calendarWeeks: CalendarWeek[] = [];
  let currentDays: (CalendarDay | null)[] = [];
  
  // Add empty cells for days before month start
  for (let i = 0; i < adjustedStartWeekday; i++) {
    currentDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = dataMap.get(dateString);
    
    currentDays.push({
      day,
      amount: dayData?.amount || 0,
      intensity: dayData?.intensity || getSpendingIntensity(dayData?.amount || 0),
      isCurrentMonth: true
    });
    
    // Start new week on Sunday
    if (currentDays.length === 7) {
      calendarWeeks.push({ days: currentDays });
      currentDays = [];
    }
  }
  
  // Fill remaining cells in last week
  while (currentDays.length < 7 && currentDays.length > 0) {
    currentDays.push(null);
  }
  
  if (currentDays.length > 0) {
    calendarWeeks.push({ days: currentDays });
  }
  
  return {
    weeks: calendarWeeks,
    weekdayHeaders: getWeekdayNames()
  };
};

/**
 * Format amount for display
 */
export const formatChartAmount = (amount: number): string => {
  if (amount === 0) return '0';
  
  return amount.toLocaleString('it-IT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

/**
 * Calculate percentage with proper rounding
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(1));
};

/**
 * Sort categories by amount (descending)
 */
export const sortCategoriesByAmount = (categories: CategoryData[]): CategoryData[] => {
  return [...categories].sort((a, b) => b.amount - a.amount);
};

/**
 * Get weekday names for heatmap header
 */
export const getWeekdayNames = (): string[] => {
  return ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];
};

/**
 * Transform DB transactions into CategoryData for charts
 */
export const transformTransactionsToCategoryData = (
  transactions: TransactionWithCategory[]
): CategoryData[] => {
  // Group transactions by macro category
  const categoryMap = new Map<string, {
    macroCategory: MacroCategoryDB;
    totalAmount: number;
  }>();

  transactions.forEach(transaction => {
    if (!transaction.subCategory?.macroCategory) return;
    
    const macroCategory = transaction.subCategory.macroCategory;
    const amount = Math.abs(Number(transaction.amount));
    
    if (categoryMap.has(macroCategory.id)) {
      categoryMap.get(macroCategory.id)!.totalAmount += amount;
    } else {
      categoryMap.set(macroCategory.id, {
        macroCategory,
        totalAmount: amount
      });
    }
  });

  // Calculate total for percentages
  const totalAmount = Array.from(categoryMap.values())
    .reduce((sum, item) => sum + item.totalAmount, 0);

  // Transform to CategoryData
  const categories: CategoryData[] = Array.from(categoryMap.values()).map((item, index) => ({
    id: item.macroCategory.id,
    name: item.macroCategory.name,
    amount: item.totalAmount,
    percentage: calculatePercentage(item.totalAmount, totalAmount),
    color: item.macroCategory.color || getFallbackCategoryColor(index),
    icon: item.macroCategory.icon,
    type: item.macroCategory.type,
  }));

  return sortCategoriesByAmount(categories);
};

/**
 * Calculate optimal donut chart size based on container
 */
export const calculateOptimalChartSize = (containerWidth: number, maxSize: number = 300): number => {
  const padding = 32; // Account for padding
  const availableWidth = containerWidth - padding;
  return Math.min(availableWidth, maxSize);
}; 
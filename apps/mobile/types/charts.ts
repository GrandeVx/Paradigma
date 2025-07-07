// Chart data interfaces - Based on DB schema
export interface CategoryData {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string; // From MacroCategory.color in DB
  icon: string;  // From MacroCategory.icon in DB
  type: 'INCOME' | 'EXPENSE'; // From MacroCategory.type
  subCategories?: SubCategoryData[];
}

export interface SubCategoryData {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  icon: string; // From SubCategory.icon in DB
  macroCategoryId: string;
}

// Monthly summary data
export interface MonthlySummary {
  month: number;
  year: number;
  income: number;
  expenses: number;
  remaining: number;
  categoryBreakdown: CategoryData[];
}

// Daily spending for heatmap
export interface DailySpending {
  date: string; // YYYY-MM-DD format
  amount: number;
  transactionCount: number;
  intensity: SpendingIntensity;
}

export interface CalendarDay {
  day: number;
  amount: number;
  intensity: SpendingIntensity;
  isCurrentMonth: boolean;
}

// Donut chart specific
export interface DonutSegment extends CategoryData {
  startAngle: number;
  endAngle: number;
  angleSize: number;
  path: string;
}

// Heatmap intensity levels
export type SpendingIntensity = 'none' | 'low' | 'medium' | 'high';

// Chart props interfaces
export interface DonutChartProps {
  data: CategoryData[];
  totalAmount: number;
  size?: number;
  strokeWidth?: number;
  showLabels?: boolean;
  irregular?: boolean;
}

export interface HeatmapProps {
  data: DailySpending[];
  month: number;
  year: number;
  onDayPress?: (day: CalendarDay) => void;
}

// Calendar layout helpers for heatmap
export interface CalendarWeek {
  days: (CalendarDay | null)[];
}

export interface CalendarMonth {
  weeks: CalendarWeek[];
  weekdayHeaders: string[];
}

export interface CategoryLegendProps {
  data: CategoryData[];
  expandable?: boolean;
  expandedCategoryId?: string | null;
  onCategoryPress?: (category: CategoryData) => void;
  onToggleExpand?: (categoryId: string) => void;
}

// Sub-category data for drill-down
export interface SubCategoryBreakdown {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  icon: string;
  macroCategoryId: string;
}

// API response for sub-category breakdown
export interface SubCategoryBreakdownResponse {
  month: number;
  year: number;
  macroCategoryId: string;
  totalAmount: number;
  subCategories: SubCategoryBreakdown[];
}

// DB-based interfaces (Prisma schema)
export interface MacroCategoryDB {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
  icon: string;
}

export interface SubCategoryDB {
  id: string;
  macroCategoryId: string;
  name: string;
  icon: string;
  macroCategory: MacroCategoryDB;
}

export interface TransactionWithCategory {
  id: string;
  amount: number;
  date: Date;
  subCategory?: SubCategoryDB;
}

// API response interfaces
export interface CategoryBreakdownResponse {
  month: number;
  year: number;
  totalExpenses: number;
  categories: CategoryData[];
}

export interface DailySpendingResponse {
  month: number;
  year: number;
  dailySpending: DailySpending[];
} 
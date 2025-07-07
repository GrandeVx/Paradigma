import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import type { HeatmapProps, CalendarDay } from '@/types/charts';
import { generateCalendarGrid } from '@/utils/chartCalculations';
import { INTENSITY_COLORS } from '@/utils/chartColors';
import { useCurrency } from '@/hooks/use-currency';

const DayCell: React.FC<{
  day: CalendarDay | null;
  onPress?: (day: CalendarDay) => void;
  formatCurrency: (amount: number | string, options?: { showSymbol?: boolean; showSign?: boolean; decimals?: number; }) => string;
}> = ({ day, onPress, formatCurrency }) => {
  if (!day) {
    // Empty cell for days outside current month
    return <View className="flex-1 h-16" />;
  }

  const backgroundColor = INTENSITY_COLORS[day.intensity];
  const isVisible = day.isCurrentMonth;

  const handlePress = () => {
    if (day.isCurrentMonth && onPress) {
      onPress(day);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!day.isCurrentMonth || day.amount === 0}
      className="flex-1 h-16"
      activeOpacity={0.7}
    >
      <View
        className="flex-1 rounded-xl items-center justify-center mx-1"
        style={{
          backgroundColor,
          opacity: isVisible ? 1 : 0,
        }}
      >
        {isVisible && (
          <>
            {/* Day number */}
            <Text
              className="text-gray-600"
              style={{
                fontFamily: 'Apfel Grotezk',
                fontSize: 11,
                fontWeight: '500',
                lineHeight: 16,
              }}
            >
              {day.day}
            </Text>

            {/* Amount */}
            <Text
              className="text-gray-700"
              style={{
                fontFamily: 'Apfel Grotezk',
                fontSize: 11,
                fontWeight: '500',
                lineHeight: 16,
              }}
            >
              {formatCurrency(day.amount > 0 ? Math.round(day.amount) : 0, { decimals: 0, showSign: false })}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const WeekRow: React.FC<{
  days: (CalendarDay | null)[];
  onDayPress?: (day: CalendarDay) => void;
  formatCurrency: (amount: number | string, options?: { showSymbol?: boolean; showSign?: boolean; decimals?: number; }) => string;
}> = ({ days, onDayPress, formatCurrency }) => {
  return (
    <View className="flex-row justify-between items-stretch">
      {days.map((day, index) => (
        <DayCell
          key={day ? `${day.day}` : `empty-${index}`}
          day={day}
          onPress={onDayPress}
          formatCurrency={formatCurrency}
        />
      ))}
    </View>
  );
};

const WeekdayHeader: React.FC<{ weekdays: string[] }> = ({ weekdays }) => {
  return (
    <View className="flex-row justify-between items-center mb-2">
      {weekdays.map((weekday) => (
        <View key={weekday} className="flex-1 items-center">
          <Text
            className="text-gray-500"
            style={{
              fontFamily: 'DM Sans',
              fontSize: 12,
              fontWeight: '500',
              lineHeight: 16,
              letterSpacing: -0.12,
            }}
          >
            {weekday}
          </Text>
        </View>
      ))}
    </View>
  );
};

export const HeatmapCalendar: React.FC<HeatmapProps> = ({
  data,
  month,
  year,
  onDayPress,
}) => {
  const { formatCurrency } = useCurrency();

  // Generate calendar grid
  const calendarMonth = generateCalendarGrid(year, month, data);

  return (
    <View className="flex-col gap-2">
      {/* Weekday headers */}
      <WeekdayHeader weekdays={calendarMonth.weekdayHeaders} />

      {/* Calendar grid */}
      <View className="flex-col gap-2">
        {calendarMonth.weeks.map((week, weekIndex) => (
          <WeekRow
            key={`week-${weekIndex}`}
            days={week.days}
            onDayPress={onDayPress}
            formatCurrency={formatCurrency}
          />
        ))}
      </View>
    </View>
  );
};

export default HeatmapCalendar; 
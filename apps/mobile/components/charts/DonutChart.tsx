import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Text } from '@/components/ui/text';
import type { DonutChartProps } from '@/types/charts';
import { calculateDonutSegments, formatChartAmount, calculateOptimalChartSize } from '@/utils/chartCalculations';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  totalAmount,
  size,
  strokeWidth = 40,
  showLabels = true,
  animate = false,
}) => {
  const router = useRouter();

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/(protected)/(home)/(category-transactions)/${categoryId}`);
  };

  // Calculate optimal size if not provided
  const chartSize = useMemo(() => {
    return size || calculateOptimalChartSize(screenWidth - 32, 800);
  }, [size, screenWidth]);

  // Calculate donut segments
  const segments = useMemo(() => {
    return calculateDonutSegments(data, chartSize, strokeWidth);
  }, [data, chartSize, strokeWidth]);

  // Format total amount for display
  const formattedAmount = useMemo(() => {
    return formatChartAmount(totalAmount);
  }, [totalAmount]);

  // Split amount into integer and decimal parts for styling
  const [integerPart, decimalPart] = formattedAmount.includes(',')
    ? formattedAmount.split(',')
    : [formattedAmount, '00'];

  // Calculate center position and radius for background circle
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const backgroundRadius = (chartSize / 2) - (strokeWidth / 2);

  // If no data, show empty state
  if (!data.length || totalAmount === 0) {
    return (
      <View
        style={{
          width: chartSize,
          height: chartSize,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Svg width={chartSize} height={chartSize}>
          <Circle
            cx={centerX}
            cy={centerY}
            r={backgroundRadius}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth={strokeWidth}
          />
        </Svg>

        {/* Center text for empty state */}
        <View
          style={{
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            className="text-gray-400 text-base"
            style={{ fontFamily: 'DM Sans' }}
          >
            Nessun dato
          </Text>
        </View>
      </View>
    );
  }


  return (
    <View
      style={{
        width: chartSize,
        height: chartSize,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* SVG Donut Chart */}
      <Svg width={chartSize} height={chartSize}>
        {/* Background circle */}
        {/* <Circle
          cx={centerX}
          cy={centerY}
          r={backgroundRadius}
          fill="none"
          stroke="#F3F4F6"

          strokeWidth={strokeWidth}
        /> */}

        {/* Category segments */}
        {segments.map((segment, index) => (
          <Path
            key={segment.id || index}
            d={segment.path}
            fill={segment.color}
            stroke={segment.color}
            strokeWidth={1}
            opacity={animate ? 0.9 : 1}
            onPress={() => handleCategoryPress(segment.id)}
          />
        ))}
      </Svg>

      {/* Center text overlay */}
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Currency symbol and amount */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text
            className="text-gray-400"
            style={{
              fontFamily: 'Apfel Grotezk',
              fontSize: 23,
              fontWeight: '400'
            }}
          >
            €
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text
              className="text-black"
              style={{
                fontFamily: 'Apfel Grotezk',
                fontSize: 45,
                fontWeight: '500'
              }}
            >
              {integerPart}
            </Text>
            <Text
              className="text-black"
              style={{
                fontFamily: 'Apfel Grotezk',
                fontSize: 23,
                fontWeight: '400'
              }}
            >
              ,{decimalPart}
            </Text>
          </View>
        </View>

        {/* Optional label */}
        {showLabels && (
          <Text
            className="text-gray-500 text-xs mt-1"
            style={{ fontFamily: 'DM Sans' }}
          >
            Spese totali
          </Text>
        )}
      </View>
    </View>
  );
};

export default DonutChart; 
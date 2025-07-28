import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import { IconName } from '@/components/ui/icons';
import { useCurrency } from '@/hooks/use-currency';

interface AccountHeaderProps {
  name: string;
  icon: string;
  color: string;
  balance: number;
  onNamePress: () => void;
  onIconPress: () => void;
  onColorPress: () => void;
  onBalancePress: () => void;
}

// Memoized AccountHeader component for performance
export const AccountHeader = React.memo<AccountHeaderProps>(({
  name,
  icon,
  color,
  balance,
  onNamePress,
  onIconPress,
  onColorPress,
  onBalancePress
}) => {
  const { getCurrencySymbol } = useCurrency();
  // Format currency helper - optimized to prevent recalculation
  const formatCurrency = React.useMemo(() => {
    const [integer, decimal] = Math.abs(balance).toFixed(2).split('.');
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return { integer: formattedInteger, decimal: decimal };
  }, [balance]);

  return (
    <View className="px-4 py-6 mt-3 bg-white">
      <View className="flex-row items-center justify-center gap-3 mb-3">
        {/* Icon Section */}
        <Pressable
          className="w-16 h-16 rounded-xl items-center justify-center bg-gray-100"
          onPress={onIconPress}
        >
          <SvgIcon name={icon as IconName} width={24} height={24} color="#6b7280" />
        </Pressable>

        {/* Name Section */}
        <Pressable
          className="flex-1 px-4 bg-gray-100 h-16 items-start justify-center rounded-xl"
          onPress={onNamePress}
        >
          <Text className="text-black text-lg font-semibold" numberOfLines={1}>
            {name}
          </Text>
        </Pressable>

        {/* Color Section */}
        <Pressable
          className="w-16 h-16 rounded-xl  bg-gray-100 flex items-center justify-center"
          onPress={onColorPress}
        >
          <View className="w-8 h-8 rounded-full " style={{ backgroundColor: color }} />
        </Pressable>
      </View>

      {/* Balance Section */}
      <Pressable className="bg-gray-50 rounded-xl p-4 flex flex-row items-center justify-between" onPress={onBalancePress}>
        <Text className="text-gray-500 font-medium" style={{ fontFamily: 'DM Sans', fontSize: 16}} >Bilancio</Text>
        <View className="flex-row items-baseline">
          <Text className="text-gray-400 text-lg font-normal">{getCurrencySymbol()}</Text>
          <Text className="text-black font-medium" style={{ fontFamily: 'ApfelGrotezk', fontSize: 20 }}>
            {formatCurrency.integer}
          </Text>
          <Text className="text-black font-normal" style={{ fontFamily: 'ApfelGrotezk', fontSize: 20 }}>
            ,{formatCurrency.decimal}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}); 
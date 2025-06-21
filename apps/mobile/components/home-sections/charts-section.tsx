import React from 'react';
import { View, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';

interface ChartData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

const CategoryChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Spese per Categoria</Text>
      {data.map((item, index) => (
        <View key={index} className="flex-row items-center mb-3">
          <View
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: item.color }}
          />
          <View className="flex-1 flex-row items-center">
            <FontAwesome5
              name={item.icon}
              size={14}
              color="#6B7280"
              style={{ marginRight: 8, width: 16 }}
            />
            <Text className="text-gray-700 flex-1">{item.category}</Text>
            <Text className="text-gray-900 font-medium">€{item.amount.toFixed(2)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const MonthlyOverview: React.FC = () => {
  const totalIncome = 2500.00;
  const totalExpenses = 1245.50;
  const balance = totalIncome - totalExpenses;

  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Panoramica Mensile</Text>

      <View className="space-y-3">
        <View className="flex-row items-center justify-between py-2">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
              <FontAwesome5 name="arrow-up" size={12} color="#059669" />
            </View>
            <Text className="text-gray-700">Entrate</Text>
          </View>
          <Text className="text-green-600 font-semibold">+€{totalIncome.toFixed(2)}</Text>
        </View>

        <View className="flex-row items-center justify-between py-2">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-3">
              <FontAwesome5 name="arrow-down" size={12} color="#DC2626" />
            </View>
            <Text className="text-gray-700">Uscite</Text>
          </View>
          <Text className="text-red-600 font-semibold">-€{totalExpenses.toFixed(2)}</Text>
        </View>

        <View className="border-t border-gray-200 pt-2">
          <View className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                <FontAwesome5 name="wallet" size={12} color="#3B82F6" />
              </View>
              <Text className="text-gray-900 font-medium">Saldo</Text>
            </View>
            <Text className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance >= 0 ? '+' : ''}€{balance.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const SpendingTrend: React.FC = () => {
  // Mock data for weekly spending
  const weeklyData = [
    { day: 'Lun', amount: 45 },
    { day: 'Mar', amount: 32 },
    { day: 'Mer', amount: 78 },
    { day: 'Gio', amount: 23 },
    { day: 'Ven', amount: 95 },
    { day: 'Sab', amount: 67 },
    { day: 'Dom', amount: 41 },
  ];

  const maxAmount = Math.max(...weeklyData.map(d => d.amount));

  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Andamento Settimanale</Text>

      <View className="flex-row items-end justify-between h-32">
        {weeklyData.map((item, index) => {
          const height = (item.amount / maxAmount) * 80;
          return (
            <View key={index} className="items-center">
              <Text className="text-xs text-gray-500 mb-1">€{item.amount}</Text>
              <View
                className="w-6 bg-primary-500 rounded-t"
                style={{ height: Math.max(height, 8) }}
              />
              <Text className="text-xs text-gray-600 mt-2">{item.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const ChartsSection: React.FC = () => {
  // Mock data
  const categoryData: ChartData[] = [
    {
      category: 'Alimentari',
      amount: 350.50,
      percentage: 35,
      color: '#EF4444',
      icon: 'shopping-cart'
    },
    {
      category: 'Trasporti',
      amount: 280.00,
      percentage: 28,
      color: '#3B82F6',
      icon: 'car'
    },
    {
      category: 'Bollette',
      amount: 195.00,
      percentage: 20,
      color: '#F59E0B',
      icon: 'file-invoice'
    },
    {
      category: 'Svago',
      amount: 120.00,
      percentage: 12,
      color: '#10B981',
      icon: 'film'
    },
    {
      category: 'Altro',
      amount: 50.00,
      percentage: 5,
      color: '#8B5CF6',
      icon: 'ellipsis-h'
    }
  ];

  return (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      <MonthlyOverview />
      <CategoryChart data={categoryData} />
      <SpendingTrend />
    </ScrollView>
  );
}; 
import React from 'react';
import { View, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui';
import { useRouter } from 'expo-router';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  icon: string;
  color: string;
}

const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const daysLeft = Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${goal.color}20` }}
          >
            <FontAwesome5 name={goal.icon} size={20} color={goal.color} />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900">{goal.title}</Text>
            <Text className="text-sm text-gray-600">{goal.description}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-500">{daysLeft} giorni</Text>
        </View>
      </View>

      <View className="mb-3">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm font-medium text-gray-700">
            €{goal.currentAmount.toFixed(2)} di €{goal.targetAmount.toFixed(2)}
          </Text>
          <Text className="text-sm font-medium" style={{ color: goal.color }}>
            {progress.toFixed(1)}%
          </Text>
        </View>
        <View className="w-full h-2 bg-gray-200 rounded-full">
          <View
            className="h-2 rounded-full"
            style={{
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: goal.color
            }}
          />
        </View>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-xs text-gray-500">
          Scadenza: {goal.deadline.toLocaleDateString()}
        </Text>
        <Text className="text-xs font-medium" style={{ color: goal.color }}>
          Mancano €{(goal.targetAmount - goal.currentAmount).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const SavingsOverview: React.FC = () => {
  const totalSavings = 1254.50;
  const monthlyTarget = 500.00;
  const progress = (totalSavings / monthlyTarget) * 100;

  return (
    <View className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-white text-lg font-semibold">Risparmi Totali</Text>
          <Text className="text-primary-100 text-sm">Questo mese</Text>
        </View>
        <View className="w-12 h-12 bg-white bg-opacity-20 rounded-full items-center justify-center">
          <FontAwesome5 name="piggy-bank" size={20} color="white" />
        </View>
      </View>

      <Text className="text-white text-2xl font-bold mb-2">€{totalSavings.toFixed(2)}</Text>

      <View className="mb-2">
        <View className="flex-row justify-between mb-1">
          <Text className="text-primary-100 text-sm">Obiettivo mensile</Text>
          <Text className="text-white text-sm font-medium">{progress.toFixed(1)}%</Text>
        </View>
        <View className="w-full h-2 bg-white bg-opacity-20 rounded-full">
          <View
            className="h-2 bg-white rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </View>
      </View>

      <Text className="text-primary-100 text-sm">
        Obiettivo: €{monthlyTarget.toFixed(2)} • Mancano €{(monthlyTarget - totalSavings).toFixed(2)}
      </Text>
    </View>
  );
};

const QuickActions: React.FC = () => {
  const router = useRouter();

  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</Text>

      <View className="flex-row justify-between">
        <Button
          onPress={() => router.push('/(protected)/(creation-flow)/name')}
          className="flex-1 bg-primary-500 mr-2 py-3"
        >
          <View className="items-center">
            <FontAwesome5 name="plus" size={16} color="white" />
            <Text className="text-white text-sm mt-1">Nuovo Obiettivo</Text>
          </View>
        </Button>

        <Button
          onPress={() => router.push('/(protected)/(transaction-flow)/value')}
          className="flex-1 bg-green-500 ml-2 py-3"
        >
          <View className="items-center">
            <FontAwesome5 name="piggy-bank" size={16} color="white" />
            <Text className="text-white text-sm mt-1">Aggiungi Risparmio</Text>
          </View>
        </Button>
      </View>
    </View>
  );
};

export const GoalsSection: React.FC = () => {
  // Mock data
  const goals: Goal[] = [
    {
      id: '1',
      title: 'Vacanze Estive',
      description: 'Viaggio in Grecia per due settimane',
      targetAmount: 2500.00,
      currentAmount: 1750.00,
      deadline: new Date(2025, 6, 15), // July 15, 2025
      icon: 'plane',
      color: '#3B82F6'
    },
    {
      id: '2',
      title: 'Auto Nuova',
      description: 'Anticipo per auto elettrica',
      targetAmount: 8000.00,
      currentAmount: 3200.00,
      deadline: new Date(2025, 11, 31), // Dec 31, 2025
      icon: 'car',
      color: '#10B981'
    },
    {
      id: '3',
      title: 'Fondo Emergenza',
      description: 'Riserva per imprevisti',
      targetAmount: 5000.00,
      currentAmount: 2100.00,
      deadline: new Date(2025, 8, 30), // Sep 30, 2025
      icon: 'shield-alt',
      color: '#F59E0B'
    }
  ];

  return (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      <SavingsOverview />

      <View className="mb-4">
        <Text className="text-xl font-bold text-gray-900 mb-4">I Miei Obiettivi</Text>
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </View>

      <QuickActions />
    </ScrollView>
  );
}; 
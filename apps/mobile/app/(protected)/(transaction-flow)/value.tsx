import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { NumericKeyboard } from '@/components/primitives/NumericKeyboard';
import HeaderContainer from '@/components/layouts/_header';
import { useCurrency } from '@/hooks/use-currency';

type TransactionType = 'income' | 'expense' | 'transfer';

export default function ValueScreen() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('0');
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDecimalActive, setIsDecimalActive] = useState(false);
  const router = useRouter();
  const { getCurrencySymbol } = useCurrency();

  // Reset state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Resetta completamente gli state quando la pagina diventa attiva
      // Questo previene il problema di parametri rimasti in memoria
      setAmount('0');
      setTransactionType('expense');
      setIsAnimating(false);
      setIsDecimalActive(false);
      return () => {
        // Cleanup se necessario
      };
    }, [])
  );

  // Trigger animation when amount changes
  useEffect(() => {
    if (amount !== '0') {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [amount]);


  const handleNumberPress = (number: string) => {
    if (amount === '0') {
      setAmount(number);
    } else {
      setAmount((prev) => prev + number);
    }
  };

  const handleDeletePress = () => {
    if (amount.length > 1) {
      const toRemove = amount[amount.length - 1];
      console.log(toRemove);
      setAmount((prev) => prev.slice(0, -1));
      if (toRemove == '.') {
        setIsDecimalActive(false);
      }
    } else {
      setAmount('0');
    }
  };

  const handleCommaPress = () => {
    if (!amount.includes('.')) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setAmount((prev) => prev + '.');
      setIsDecimalActive(true);
    }
  };

  const handleContinuePress = () => {
    // Using type assertion to bypass type checking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const navigationParams: any = {
      pathname: '/(protected)/(transaction-flow)/summary',
      params: { amount, type: transactionType }
    };
    router.push(navigationParams);
  };

  // Format amount with currency symbol
  const formattedAmount = `${parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const handleBackPress = () => {
    // Se non possiamo tornare indietro nello stack, vai alla home
    if (router.canGoBack()) {
      router.back();
    } else {
      // Flow aperto direttamente dalla tab bar - vai alla home
      router.replace("/(protected)/(home)/");
    }
  };

  const handleTransactionTypePress = (type: TransactionType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTransactionType(type);
  };

  return (
    <HeaderContainer
      variant="secondary"
      customTitle={t('transaction.new.title')}
      onBackPress={handleBackPress}
      hideBackButton={false} // Forza la visualizzazione del back button
    >
      <View className="flex-1 bg-white">


        {/* Transaction Type Selector */}

        <View className="flex-1 justify-center items-center px-4">
          <View className="flex flex-row items-center gap-2">
            <Text className="text-gray-400 text-4xl font-bold">{getCurrencySymbol()}</Text>
            <View className={`flex flex-row items-center ${isAnimating ? 'scale-110' : 'scale-100'}`}>
              <Text className={`text-6xl font-bold ${formattedAmount.split('.')[0] === '0' ? 'text-gray-400' : 'text-primary-700'}`}>
                {formattedAmount.split('.')[0]}
              </Text>
              <Text className={`text-4xl font-bold ${isDecimalActive ? (formattedAmount.split('.')[0] === '0' ? 'text-gray-400' : 'text-primary-700') : 'text-gray-300'}`}>
                ,
              </Text>
              <Text className={`text-4xl font-bold ${isDecimalActive ? (formattedAmount.split('.')[1] === '00' ? 'text-gray-400' : 'text-primary-700') : 'text-gray-300'}`}>
                {formattedAmount.split('.')[1]}
              </Text>
            </View>
          </View>
          <View className="w-full flex-row justify-center items-center gap-3 px-4 pt-6">
            <Pressable
              className={`rounded-full px-3 py-1.5 ${transactionType === 'income' ? 'bg-success-500' : 'bg-transparent'}`}
              onPress={() => handleTransactionTypePress('income')}
            >
              <Text className={`font-medium text-sm ${transactionType === 'income' ? 'text-white' : 'text-gray-700'}`}>
                {t('transaction.types.income')}
              </Text>
            </Pressable>

            <Pressable
              className={`rounded-full px-3 py-1.5 ${transactionType === 'expense' ? 'bg-error-500' : 'bg-transparent'}`}
              onPress={() => handleTransactionTypePress('expense')}
            >
              <Text className={`font-medium text-sm ${transactionType === 'expense' ? 'text-white' : 'text-gray-700'}`}>
                {t('transaction.types.expense')}
              </Text>
            </Pressable>

            <Pressable
              className={`rounded-full px-3 py-1.5 ${transactionType === 'transfer' ? 'bg-gray-400' : 'bg-transparent'}`}
              onPress={() => handleTransactionTypePress('transfer')}
            >
              <Text className={`font-medium text-sm ${transactionType === 'transfer' ? 'text-white' : 'text-gray-700'}`}>
                {t('transaction.types.transfer')}
              </Text>
            </Pressable>
          </View>

        </View>

        <NumericKeyboard
          onNumberPress={handleNumberPress}
          onDeletePress={handleDeletePress}
          onCommaPress={handleCommaPress}
          onContinuePress={handleContinuePress}
          continueDisabled={amount === '0'}
        />
      </View>
    </HeaderContainer>
  );
} 
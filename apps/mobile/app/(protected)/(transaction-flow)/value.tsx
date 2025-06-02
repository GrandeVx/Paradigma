import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';


import { NumericKeyboard } from '@/components/primitives/NumericKeyboard';
import HeaderContainer from '@/components/layouts/_header';

type TransactionType = 'income' | 'expense' | 'transfer';

export default function ValueScreen() {
  const [amount, setAmount] = useState('0');
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  // Reset state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Resetta gli state quando la pagina diventa attiva
      setAmount('0');
      setTransactionType('expense');
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
      setAmount((prev) => prev.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  const handleCommaPress = () => {
    if (!amount.includes('.')) {
      setAmount((prev) => prev + '.');
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

  return (
    <HeaderContainer variant="secondary" customTitle="NUOVA TRANSAZIONE">
      <View className="flex-1 bg-white">


        {/* Transaction Type Selector */}

        <View className="flex-1 justify-center items-center px-4">
          <View className="flex flex-row items-center gap-2">
            <Text className="text-gray-400 text-5xl font-bold">€</Text>
            <View className={`flex flex-row items-center ${isAnimating ? 'scale-110' : 'scale-100'}`}>
              <Text className={`text-9xl font-bold ${formattedAmount.split('.')[0] === '0' ? 'text-gray-400' : 'text-primary-700'}`}>
                {formattedAmount.split('.')[0]}
              </Text>
              <Text className={`text-4xl font-bold ${formattedAmount.split('.')[0] === '0' ? 'text-gray-400' : 'text-primary-700'}`}>
                ,
              </Text>
              <Text className={`text-4xl font-bold ${formattedAmount.split('.')[0] === '0' ? 'text-gray-400' : 'text-primary-700'}`}>
                {formattedAmount.split('.')[1]}
              </Text>
            </View>
          </View>
          <View className="w-full flex-row justify-center items-center gap-3 px-4 pt-6">
            <Pressable
              className={`rounded-full px-3 py-1.5 ${transactionType === 'income' ? 'bg-success-500' : 'bg-transparent'}`}
              onPress={() => setTransactionType('income')}
            >
              <Text className={`font-medium text-base ${transactionType === 'income' ? 'text-white' : 'text-gray-700'}`}>
                Entrata
              </Text>
            </Pressable>

            <Pressable
              className={`rounded-full px-3 py-1.5 ${transactionType === 'expense' ? 'bg-error-500' : 'bg-transparent'}`}
              onPress={() => setTransactionType('expense')}
            >
              <Text className={`font-medium text-base ${transactionType === 'expense' ? 'text-white' : 'text-gray-700'}`}>
                Uscita
              </Text>
            </Pressable>

            <Pressable
              className={`rounded-full px-3 py-1.5 ${transactionType === 'transfer' ? 'bg-gray-400' : 'bg-transparent'}`}
              onPress={() => setTransactionType('transfer')}
            >
              <Text className={`font-medium text-base ${transactionType === 'transfer' ? 'text-white' : 'text-gray-700'}`}>
                Trasferimento
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
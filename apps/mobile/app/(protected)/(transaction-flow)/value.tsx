import { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { NumericKeyboard } from '@/components/primitives/NumericKeyboard';
import HeaderContainer from '@/components/layouts/_header';

export default function NumericInputScreen() {
  const { t } = useTranslation();
  const [value, setValue] = useState('0');
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  // Reset state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setValue('0');
      setIsAnimating(false);
      return () => {};
    }, [])
  );

  // Simple animation trigger
  useEffect(() => {
    if (value !== '0') {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const handleNumberPress = (number: string) => {
    if (value === '0') {
      setValue(number);
    } else {
      setValue((prev) => prev + number);
    }
  };

  const handleDeletePress = () => {
    if (value.length > 1) {
      setValue((prev) => prev.slice(0, -1));
    } else {
      setValue('0');
    }
  };

  const handleDecimalPress = () => {
    if (!value.includes('.')) {
      setValue((prev) => prev + '.');
    }
  };

  const handleContinuePress = () => {
    // Navigate to next step with entered value
    router.push({
      pathname: '/(protected)/(transaction-flow)/summary',
      params: { value }
    });
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(home)/");
    }
  };

  // Simple number formatting
  const formattedValue = parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <HeaderContainer
      variant="secondary"
      customTitle="Enter Number"
      onBackPress={handleBackPress}
      hideBackButton={false}
    >
      <View className="flex-1 bg-white">
        
        {/* Value Display */}
        <View className="flex-1 justify-center items-center px-4">
          <View className={`flex flex-row items-baseline gap-2 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            <Text className="text-gray-400 text-3xl font-bold">#</Text>
            <Text className="text-5xl font-bold text-primary-700">
              {formattedValue}
            </Text>
          </View>
          
          <Text className="text-gray-500 text-center mt-6 px-6">
            Enter a numeric value using the keypad below
          </Text>
        </View>

        {/* Numeric Keyboard */}
        <NumericKeyboard
          onNumberPress={handleNumberPress}
          onDeletePress={handleDeletePress}
          onCommaPress={handleDecimalPress}
          onContinuePress={handleContinuePress}
          continueDisabled={value === '0'}
        />
      </View>
    </HeaderContainer>
  );
}
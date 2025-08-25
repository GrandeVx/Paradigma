import React, { useState, useEffect, useCallback } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import * as Haptics from 'expo-haptics';

import { IconName } from "@/components/ui/icons";
import { SvgIcon } from "@/components/ui/svg-icon";
import { NumericKeyboard } from "@/components/primitives/NumericKeyboard";
import { useCurrency } from '@/hooks/use-currency';

export default function TargetStepFlow() {
  const { t } = useTranslation();
  const router = useRouter();
  const { getCurrencySymbol } = useCurrency();
  const [targetAmount, setTargetAmount] = useState('0');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDecimalActive, setIsDecimalActive] = useState(false);
  const params = useLocalSearchParams<{ 
    name: string, 
    icon: string, 
    color: string, 
    value: string,
    firstAccount: string,
    isBudgeting: string 
  }>();

  // Reset state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset all form state to prevent old data from persisting
      setTargetAmount('0');
      setIsAnimating(false);
      setIsDecimalActive(false);
      return () => {
        // Cleanup if necessary
      };
    }, [])
  );

  // Trigger animation when target amount changes
  useEffect(() => {
    if (targetAmount !== '0') {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [targetAmount]);

  const handleNumberPress = (number: string) => {
    if (targetAmount === '0') {
      setTargetAmount(number);
    } else {
      setTargetAmount((prev) => prev + number);
    }
  };

  const handleDeletePress = () => {
    if (targetAmount.length > 1) {
      const toRemove = targetAmount[targetAmount.length - 1];
      setTargetAmount((prev) => prev.slice(0, -1));
      if (toRemove === '.') {
        setIsDecimalActive(false);
      }
    } else {
      setTargetAmount('0');
      setIsDecimalActive(false);
    }
  };

  const handleCommaPress = () => {
    if (!targetAmount.includes('.')) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTargetAmount((prev) => prev + '.');
      setIsDecimalActive(true);
    }
  };

  const handleContinue = () => {
    router.push({
      pathname: "/(protected)/(creation-flow)/summary",
      params: {
        name: params.name,
        icon: params.icon,
        color: params.color,
        value: params.value,
        target: targetAmount,
        firstAccount: params.firstAccount,
        isBudgeting: params.isBudgeting,
      },
    });
  };

  // Format target amount with currency symbol
  const formattedTargetAmount = `${parseFloat(targetAmount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  // Check if target amount is valid (should be >= initial balance)
  const initialBalance = parseFloat(params.value || '0');
  const currentTarget = parseFloat(targetAmount);
  const isValidTarget = currentTarget >= initialBalance;

  return (
    <HeaderContainer variant="secondary" customTitle={t("flow.target.title")}>
      <View className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-4">
          <View className="w-full justify-center text-center flex flex-row items-center gap-2 mb-2">
            <Text className="text-gray-500">{t("flow.target.prompt")}</Text>
            <View className="flex-row items-center gap-2 justify-center">
              <SvgIcon name={params.icon as IconName} width={16} height={16} color={params.color} />
              <Text className="font-semibold font-sans" style={{ color: params.color }}>{params.name.toUpperCase()}</Text>
            </View>
          </View>

          <View className="flex flex-row items-center gap-2 justify-center">
            <Text className="text-gray-400 text-4xl font-bold">{getCurrencySymbol()}</Text>
            <View className={`flex flex-row items-center ${isAnimating ? 'scale-110' : 'scale-100'}`}>
              <Text className={`text-4xl font-bold ${formattedTargetAmount.split('.')[0] === '0' ? 'text-gray-400' : isValidTarget ? 'text-black' : 'text-red-500'}`}>
                {formattedTargetAmount.split('.')[0]}
              </Text>
              <Text className={`text-4xl font-bold ${isDecimalActive ? (formattedTargetAmount.split('.')[0] === '0' ? 'text-gray-400' : isValidTarget ? 'text-black' : 'text-red-500') : 'text-gray-300'}`}>
                ,
              </Text>
              <Text className={`text-4xl font-bold ${isDecimalActive ? (formattedTargetAmount.split('.')[0] === '0' ? 'text-gray-400' : isValidTarget ? 'text-black' : 'text-red-500') : 'text-gray-300'}`}>
                {formattedTargetAmount.split('.')[1]}
              </Text>
            </View>
          </View>

          {/* Validation message */}
          {!isValidTarget && currentTarget > 0 && (
            <View className="mt-4">
              <Text className="text-red-500 text-sm text-center">
                {t("flow.target.validation", { 
                  initial: `${getCurrencySymbol()}${initialBalance.toFixed(2)}` 
                })}
              </Text>
            </View>
          )}
        </View>

        <NumericKeyboard
          onNumberPress={handleNumberPress}
          onDeletePress={handleDeletePress}
          onCommaPress={handleCommaPress}
          onContinuePress={handleContinue}
          continueDisabled={targetAmount === '0' || !isValidTarget}
          continuePosition="top"
        />
      </View>
    </HeaderContainer>
  );
}
import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from 'expo-haptics';

import { IconName } from "@/components/ui/icons";
import { SvgIcon } from "@/components/ui/svg-icon";
import { NumericKeyboard } from "@/components/primitives/NumericKeyboard";
import { useCurrency } from '@/hooks/use-currency';

export default function ValueStepFlow() {
  const { t } = useTranslation();
  const router = useRouter();
  const { getCurrencySymbol } = useCurrency();
  const [amount, setAmount] = useState('0');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDecimalActive, setIsDecimalActive] = useState(false);
  const params = useLocalSearchParams<{ name: string, icon: string, color: string, firstAccount: string }>();

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
      setAmount((prev) => prev.slice(0, -1));
      if (toRemove === '.') {
        setIsDecimalActive(false);
      }
    } else {
      setAmount('0');
      setIsDecimalActive(false);
    }
  };

  const handleCommaPress = () => {
    if (!amount.includes('.')) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setAmount((prev) => prev + '.');
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
        value: amount,
        firstAccount: params.firstAccount,
      },
    });
  };

  // Format amount with currency symbol
  const formattedAmount = `${parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <HeaderContainer variant="secondary" customTitle={t(params.firstAccount === "true" ? "flow.name.firstAccount" : "flow.name.title")}>
      <View className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-4">
          <View className="w-full justify-center text-center flex flex-row items-center gap-2 mb-2">
            <Text className="text-gray-500">{t("flow.value.prompt")}</Text>
            <View className="flex-row items-center gap-2 justify-center">
              <SvgIcon name={params.icon as IconName} width={16} height={16} color={params.color} />
              <Text className="font-semibold font-sans" style={{ color: params.color }}>{params.name.toUpperCase()}</Text>
            </View>
          </View>

          <View className="flex flex-row items-center gap-2 justify-center">
            <Text className="text-gray-400 text-4xl font-bold">{getCurrencySymbol()}</Text>
            <View className={`flex flex-row items-center ${isAnimating ? 'scale-110' : 'scale-100'}`}>
              <Text className={`text-4xl font-bold ${formattedAmount.split('.')[0] === '0' ? 'text-gray-400' : 'text-black'}`}>
                {formattedAmount.split('.')[0]}
              </Text>
              <Text className={`text-4xl font-bold ${isDecimalActive ? (formattedAmount.split('.')[0] === '0' ? 'text-gray-400' : 'text-black') : 'text-gray-300'}`}>
                ,
              </Text>
              <Text className={`text-4xl font-bold ${isDecimalActive ? (formattedAmount.split('.')[0] === '0' ? 'text-gray-400' : 'text-black') : 'text-gray-300'}`}>
                {formattedAmount.split('.')[1]}
              </Text>
            </View>
          </View>
        </View>

        <NumericKeyboard
          onNumberPress={handleNumberPress}
          onDeletePress={handleDeletePress}
          onCommaPress={handleCommaPress}
          onContinuePress={handleContinue}
          continueDisabled={amount === '0'}
          continuePosition="top"
        />
      </View>
    </HeaderContainer>
  );
} 
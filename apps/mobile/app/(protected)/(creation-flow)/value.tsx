import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter } from "expo-router";

import { IconName } from "@/components/ui/icons";
import { SvgIcon } from "@/components/ui/svg-icon";
import { NumericKeyboard } from "@/components/primitives/NumericKeyboard";

export default function ValueStepFlow() {
  const { t } = useTranslation();
  const router = useRouter();
  const [amount, setAmount] = useState('0');
  const [isAnimating, setIsAnimating] = useState(false);
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
  const formattedAmount = `${parseFloat(amount).toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).replace('.', ',')}`;

  return (
    <HeaderContainer variant="secondary" customTitle={t(params.firstAccount === "true" ? "flow.name.first-account" : "flow.name.title", "NUOVO CONTO")}>
      <View className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-4">
          <View className="w-full justify-center text-center flex flex-row items-center gap-2 mb-2">
            <Text className="text-gray-500">{t("flow.name.prompt", "Imposta il budget di partenza per")}</Text>
            <View className="flex-row items-center gap-2 justify-center">
              <SvgIcon name={params.icon as IconName} width={16} height={16} color={params.color} />
              <Text className="font-semibold font-sans" style={{ color: params.color }}>{params.name.toUpperCase()}</Text>
            </View>
          </View>

          <View className="flex flex-row items-center gap-2 justify-center">
            <Text className="text-gray-400 text-5xl font-bold">€</Text>
            <View className={`flex flex-row items-center ${isAnimating ? 'scale-110' : 'scale-100'}`}>
              <Text className={`text-7xl font-bold ${formattedAmount.split(',')[0] === '0' ? 'text-gray-400' : 'text-black'}`}>
                {formattedAmount.split(',')[0]}
              </Text>
              <Text className={`text-4xl font-bold ${formattedAmount.split(',')[0] === '0' ? 'text-gray-400' : 'text-black'}`}>
                ,
              </Text>
              <Text className={`text-4xl font-bold ${formattedAmount.split(',')[0] === '0' ? 'text-gray-400' : 'text-black'}`}>
                {formattedAmount.split(',')[1]}
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
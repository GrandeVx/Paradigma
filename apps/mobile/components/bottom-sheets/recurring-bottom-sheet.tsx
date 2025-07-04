import React from 'react';
import { View, Pressable } from 'react-native';
import BottomSheet, { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { SvgIcon } from '@/components/ui/svg-icon';
import { Slider as AwesomeSlider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';

// Define types locally or import if they become shared
type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface RecurringBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  snapPoints: string[];
  renderBackdrop: (props: BottomSheetBackdropProps) => React.ReactNode;
  handleClosePress: () => void;
  numInstallments: number;
  setNumInstallments: (value: number) => void;
  frequency: FrequencyType;
  setFrequency: (value: FrequencyType) => void;
  frequencyDays: number;
  handleFrequencyChange?: (freq: FrequencyType, days: number) => void;
}

export const RecurringBottomSheet: React.FC<RecurringBottomSheetProps> = ({
  bottomSheetRef,
  snapPoints,
  renderBackdrop,
  handleClosePress,
  numInstallments,
  setNumInstallments,
  frequency,
  setFrequency,
  frequencyDays,
  handleFrequencyChange
}) => {
  // Predefined installment options for slider
  const installmentOptions = [3, 6, 9, 12, 24, 36, 48];

  // Update the min/max values to work with the slider component
  const min = useSharedValue(0);
  const max = useSharedValue(installmentOptions.length - 1);
  // Initial index in the installmentOptions array
  const initialIndex = installmentOptions.findIndex(val => val === numInstallments);
  const progress = useSharedValue(initialIndex !== -1 ? initialIndex : 0); // Ensure initialIndex is valid

  // Track slider steps
  const totalSteps = installmentOptions.length - 1;

  // Frequency options from the design
  type FrequencyOption = {
    label: string;
    value: FrequencyType;
    days: number;
  };

  const frequencyOptions: FrequencyOption[] = [
    { label: 'Ogni 14 giorni', value: 'daily', days: 14 },
    { label: 'Ogni 30 giorni', value: 'monthly', days: 30 },
    { label: 'Ogni 60 giorni', value: 'monthly', days: 60 },
    { label: 'Ogni 90 giorni', value: 'monthly', days: 90 },
    { label: 'Ogni 180 giorni', value: 'monthly', days: 180 }
  ];

  // React.useEffect to synchronize slider if numInstallments changes from parent
  React.useEffect(() => {
    const newIndex = installmentOptions.findIndex(val => val === numInstallments);
    if (newIndex !== -1) {
      progress.value = newIndex;
    }
  }, [numInstallments, installmentOptions, progress]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      handleStyle={{
        backgroundColor: '#FFFFFF', // Consider theme variables
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#000", // Consider theme variables
        width: 40,
      }}
      containerStyle={{
        zIndex: 1000,
      }}
      backgroundStyle={{
        backgroundColor: "#FFFFFF" // Consider theme variables
      }}
    >
      <View className="w-full h-full pt-4 px-4 flex flex-col">
        <View className="flex flex-row justify-between items-center border-b border-gray-300 mb-5 pb-4">
          <Text className="text-2xl font-normal">RATE</Text>
          <Pressable onPress={handleClosePress}>
            <SvgIcon name="close" size={24} color="black" />
          </Pressable>
        </View>

        {/* Number of Installments Section */}
        <View className="mb-6">
          <View className="bg-gray-50 flex flex-row items-center justify-between p-3 rounded-lg mb-4">
            <Pressable
              onPress={() => {
                const currentVal = numInstallments;
                const newDisplayValue = Math.max(installmentOptions[0], currentVal - 1);
                setNumInstallments(newDisplayValue);
              }}
              className="w-12 h-12 bg-white rounded-full items-center justify-center border border-gray-200"
            >
              <Text className="text-2xl font-medium">-</Text>
            </Pressable>

            <View className="flex flex-row items-baseline">
              <Text className="text-primary-500 text-3xl font-semibold">{numInstallments}</Text>
              <Text className="text-gray-400 text-3xl font-normal ml-1">Rate</Text>
            </View>

            <Pressable
              onPress={() => {
                const currentVal = numInstallments;
                const newDisplayValue = Math.min(installmentOptions[installmentOptions.length - 1], currentVal + 1);
                setNumInstallments(newDisplayValue);
              }}
              className="w-12 h-12 bg-white rounded-full items-center justify-center border border-gray-200"
            >
              <Text className="text-2xl font-medium">+</Text>
            </Pressable>
          </View>

          <View className="mb-6 px-2">

            <AwesomeSlider
              minimumValue={min}
              maximumValue={max}
              progress={progress}
              theme={{
                minimumTrackTintColor: '#007AFF', // Theme primary color
                maximumTrackTintColor: '#E5E7EB', // Theme gray color
                bubbleBackgroundColor: 'transparent',
                bubbleTextColor: "transparent",
              }}
              steps={totalSteps}
              snapToStep
              onValueChange={(value) => {
                const index = Math.round(value);
                if (index >= 0 && index < installmentOptions.length) {
                  const installmentValue = installmentOptions[index];
                  setNumInstallments(installmentValue);
                }
              }}
            />
            <View className="flex flex-row justify-between mt-4">
              {installmentOptions.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    setNumInstallments(option);
                  }}
                  className="items-center flex-1"
                >
                  <Text
                    className={`uppercase text-xs font-medium ${numInstallments === option ? 'text-primary-500' : 'text-gray-500'
                      }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Frequency Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">Frequenza</Text>
          <View className="flex flex-col bg-gray-50 rounded-lg p-1">
            {frequencyOptions.map((option, index) => {
              const isSelected = frequency === option.value && frequencyDays === option.days;

              return (
                <React.Fragment key={`${option.value}-${option.days}`}>
                  {index > 0 && <View className="h-px bg-gray-200 w-full my-1" />}
                  <Pressable
                    onPress={() => {
                      if (handleFrequencyChange) {
                        handleFrequencyChange(option.value, option.days);
                      } else {
                        setFrequency(option.value);
                      }
                    }}
                    className={`flex flex-row items-center py-3 px-3 rounded-md ${isSelected ? 'bg-primary-100' : 'bg-transparent'}`}
                  >
                    <View className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                      ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-400'}`}
                    >
                      {isSelected && (
                        <SvgIcon name="checks" size={10} color="white" />
                      )}
                    </View>
                    <Text className={`text-base ${isSelected ? 'text-primary-700 font-medium' : 'text-gray-700'}`}>{option.label}</Text>
                  </Pressable>
                </React.Fragment>
              );
            })}
          </View>
        </View>

        <View className="mt-auto">
          <Button
            variant="primary"
            size="lg"
            rounded="default"
            onPress={handleClosePress}
            className="w-full mb-10"
          >
            <Text className="text-white font-semibold text-lg">Salva</Text>
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}; 
import React, { useState } from 'react';
import { View, Pressable, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import BottomSheet, { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { SvgIcon } from '@/components/ui/svg-icon';
import DynamicallySelectedPicker from 'react-native-dynamically-selected-picker';
import { Button } from '@/components/ui/button';

export type RecurrenceOption = {
  id: string;
  label: string;
  value: number;
  days: number;
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
};

const recurrenceOptions: RecurrenceOption[] = [
  {
    id: 'none',
    label: 'Mai',
    value: 0,
    days: 0,
    type: 'none'
  },
  {
    id: 'daily',
    label: 'Ogni Giorno',
    value: 1,
    days: 1,
    type: 'daily'
  },
  {
    id: 'weekly',
    label: 'Ogni Settimana',
    value: 2,
    days: 7,
    type: 'weekly'
  },
  {
    id: 'biweekly',
    label: 'Ogni 2 Settimane',
    value: 3,
    days: 14,
    type: 'weekly'
  },
  {
    id: 'monthly',
    label: 'Ogni Mese',
    value: 4,
    days: 30,
    type: 'monthly'
  },
  {
    id: 'bimonthly',
    label: 'Ogni 2 Mesi',
    value: 5,
    days: 60,
    type: 'monthly'
  },
  {
    id: 'quarterly',
    label: 'Ogni 3 Mesi',
    value: 6,
    days: 90,
    type: 'monthly'
  },
  {
    id: 'semiannual',
    label: 'Ogni 6 Mesi',
    value: 7,
    days: 180,
    type: 'monthly'
  },
  {
    id: 'yearly',
    label: 'Ogni Anno',
    value: 8,
    days: 365,
    type: 'yearly'
  }
];

interface RecurrencePickerBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  snapPoints: string[];
  renderBackdrop: (props: BottomSheetBackdropProps) => React.ReactNode;
  handleClosePress: () => void;
  selectedRecurrence: RecurrenceOption;
  onRecurrenceChange: (recurrence: RecurrenceOption) => void;
}

export const RecurrencePickerBottomSheet: React.FC<RecurrencePickerBottomSheetProps> = ({
  bottomSheetRef,
  snapPoints,
  renderBackdrop,
  handleClosePress,
  selectedRecurrence,
  onRecurrenceChange
}) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(
    recurrenceOptions.findIndex(option => option.id === selectedRecurrence.id) || 0
  );

  const windowWidth = Dimensions.get('window').width;
  const pickerHeight = 250;

  const handleConfirm = () => {
    onRecurrenceChange(recurrenceOptions[selectedItemIndex]);
    handleClosePress();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1} // Start closed
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      handleStyle={{
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#000",
        width: 40,
      }}
      containerStyle={{
        zIndex: 1000,
      }}
      backgroundStyle={{
        backgroundColor: "#FFFFFF"
      }}
    >
      <View className="w-full pt-4 px-4">
        <View className="flex flex-row justify-between items-center border-b border-gray-300 mb-5 pb-4">
          <Text className="text-2xl font-normal">Seleziona Ricorrenza</Text>
          <Pressable onPress={handleClosePress}>
            <SvgIcon name="close" size={24} color="black" />
          </Pressable>
        </View>
      </View>

      <View className="flex-1 justify-center items-center px-4">
        <DynamicallySelectedPicker
          items={recurrenceOptions.map(option => ({
            value: option.value,
            label: option.label,
          }))}
          onScroll={({ index }) => setSelectedItemIndex(index)}
          onMomentumScrollBegin={({ index }) => setSelectedItemIndex(index)}
          onMomentumScrollEnd={({ index }) => setSelectedItemIndex(index)}
          onScrollBeginDrag={({ index }) => setSelectedItemIndex(index)}
          onScrollEndDrag={({ index }) => setSelectedItemIndex(index)}
          initialSelectedIndex={selectedItemIndex}
          height={pickerHeight}
          width={windowWidth - 32}
        />

        <View className="w-full px-4 pt-4 pb-8">
          <Button
            variant="primary"
            size="lg"
            onPress={handleConfirm}
          >
            <Text className="text-white font-semibold text-lg">Conferma</Text>
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}; 
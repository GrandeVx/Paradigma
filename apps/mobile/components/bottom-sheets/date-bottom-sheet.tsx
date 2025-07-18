import React from 'react';
import { View } from 'react-native';
import BottomSheet, { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import DatePicker from 'react-native-modern-datepicker';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';

interface DateBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  snapPoints: string[];
  mode?: 'calendar' | 'time' | 'datepicker';
  renderBackdrop: (props: BottomSheetBackdropProps) => React.ReactNode;
  handleClosePress: () => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  limited?: boolean;
}

export const DateBottomSheet: React.FC<DateBottomSheetProps> = (props) => {
  // Destructure props safely to avoid undefined issues
  const {
    bottomSheetRef,
    snapPoints,
    renderBackdrop,
    handleClosePress,
    selectedDate,
    setSelectedDate,
    mode = "calendar",
    limited = false,
  } = props;

  // Format date for DatePicker
  const formattedDate = `${selectedDate.getFullYear()}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${String(selectedDate.getDate()).padStart(2, '0')}`;

  // Handle date change
  const handleDateChange = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('/');
      const dateObject = new Date(Number(year), Number(month) - 1, Number(day));
      setSelectedDate(dateObject);
      handleClosePress();
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
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
      <View className="flex-row justify-between items-center px-6 w-full pb-4 ">
        <View className="">
          <Text className="text-black text-center font-medium uppercase" style={{ fontSize: 14 }}>
            Seleziona Data
          </Text>
        </View>
        <SvgIcon name="close" size={12} color="black" onPress={handleClosePress} />
      </View>




      <DatePicker
        key={formattedDate}
        options={{
          textHeaderColor: '#000000',
          textDefaultColor: '#000000',
          selectedTextColor: '#fff',
          mainColor: '#007AFF',
          textSecondaryColor: '#000000',
          borderColor: 'rgba(122, 146, 165, 0.1)',
        }}
        current={formattedDate}
        selected={formattedDate}
        locale="it"
        isGregorian={true}
        mode={mode}
        maximumDate={limited ? new Date().toISOString() : undefined}
        minuteInterval={30}
        style={{ borderRadius: 10 }}
        onDateChange={handleDateChange}
        onSelectedChange={() => { }}
      />
    </BottomSheet>
  );
}; 
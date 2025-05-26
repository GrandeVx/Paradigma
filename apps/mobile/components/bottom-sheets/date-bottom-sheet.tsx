import React from 'react';
// import { View } from 'react-native'; // View was not used
import BottomSheet, { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import DatePicker from 'react-native-modern-datepicker';

// Assuming SvgIcon might be needed if a header with close button is added later
// import { SvgIcon } from '@/components/ui/svg-icon';
// import { Text } from '@/components/ui/text';
// import { Pressable } from 'react-native';

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

export const DateBottomSheet: React.FC<DateBottomSheetProps> = ({
  bottomSheetRef,
  snapPoints,
  renderBackdrop,
  handleClosePress,
  selectedDate,
  setSelectedDate,
  mode = "calendar",
  limited = false,
}) => {

  /**
    * The DatePicker component doesn't accept selectedDate update directly for re-render for already selected dates,
    * so we need define a key for the DatePicker based on the formatted date
    * to force a re-render when the date changes externally.
  */
  const formattedDate = `${selectedDate.getFullYear()}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${String(selectedDate.getDate()).padStart(2, '0')}`;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1} // Start closed
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
      {/* Optional: Add a header like other bottom sheets if needed */}
      {/* 
      <View className="w-full pt-4 px-4">
        <View className="flex flex-row justify-between items-center border-b border-gray-300 mb-5 pb-4">
          <Text className="text-2xl font-normal">Seleziona Data</Text>
          <Pressable onPress={handleClosePress}>
            <SvgIcon name="close" size={24} color="black" />
          </Pressable>
        </View>
      </View>
      */}
      <DatePicker
        key={formattedDate} // Force re-render when date changes externally
        options={{
          textHeaderColor: '#000000',
          textDefaultColor: '#000000',
          selectedTextColor: '#fff',
          mainColor: '#007AFF', // Consider theme primary color
          textSecondaryColor: '#000000',
          borderColor: 'rgba(122, 146, 165, 0.1)',
        }}
        current={formattedDate}
        selected={formattedDate}
        locale="it"
        mode={mode}
        maximumDate={limited ? new Date().toISOString() : undefined}
        minuteInterval={30}
        style={{ borderRadius: 10 }}
        onDateChange={(dateString: string) => {
          /*
            * the date is in the format YYYY/MM/DD (library format)
            * we need to convert it to a date object so we can extract the day, month and year
            * and then set the date to the date object
          */
          const [year, month, day] = dateString.split('/');
          const dateObject = new Date(Number(year), Number(month) - 1, Number(day));
          setSelectedDate(dateObject);
          handleClosePress(); // Close sheet after date selection
        }}
      />
    </BottomSheet>
  );
}; 
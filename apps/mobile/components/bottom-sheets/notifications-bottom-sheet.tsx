import React, { useState } from 'react';
import { View, Pressable, TextInput, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import BottomSheet, { BottomSheetBackdropProps, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SvgIcon } from '@/components/ui/svg-icon';
import { useTabBar } from '@/context/TabBarContext';
import { notificationUtils } from '@/lib/mmkv-storage';
import { api } from '@/lib/api';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

interface NotificationsBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  snapPoints: string[];
  renderBackdrop: (props: BottomSheetBackdropProps) => React.ReactElement;
  handleClosePress: () => void;
  onSaveComplete?: () => void;
  mode?: 'onboarding' | 'settings'; // onboarding saves to MMKV, settings saves to database
  initialNotifications?: boolean;
  initialNotificationToken?: string;
}

export const NotificationsBottomSheet: React.FC<NotificationsBottomSheetProps> = ({
  bottomSheetRef,
  snapPoints,
  renderBackdrop,
  handleClosePress,
  onSaveComplete,
  mode = 'onboarding',
  initialNotifications = false,
  initialNotificationToken,
}) => {
  // States
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [recurringNotificationsEnabled, setRecurringNotificationsEnabled] = useState(initialNotifications);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [isLoading, setIsLoading] = useState(false);

  // Tab bar context
  const { hideTabBar, showTabBar } = useTabBar();

  // tRPC utils for cache invalidation
  const utils = api.useUtils();

  // API Mutations (only for settings mode)
  const updateProfileMutation = api.user.updateProfile.useMutation();

  // Load saved notification preferences for the given mode
  React.useEffect(() => {
    if (mode === 'settings') {
      // In settings mode, we use the props passed from parent for recurring notifications
      setRecurringNotificationsEnabled(initialNotifications);

      // Load daily reminder settings from MMKV storage
      const dailyEnabled = notificationUtils.getDailyReminderEnabled();
      const dailyTime = notificationUtils.getDailyReminderTime();
      setDailyReminderEnabled(dailyEnabled);
      setReminderTime(dailyTime);
    } else {
      // In onboarding mode, also load any existing settings
      const dailyEnabled = notificationUtils.getDailyReminderEnabled();
      const dailyTime = notificationUtils.getDailyReminderTime();
      setDailyReminderEnabled(dailyEnabled);
      setReminderTime(dailyTime);
      setRecurringNotificationsEnabled(initialNotifications);
    }
  }, [mode, initialNotifications]);

  // Format time input
  const formatTimeInput = (text: string) => {
    // Remove all non-numeric characters
    const numbers = text.replace(/[^\d]/g, '');

    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) {
      const hours = numbers.slice(0, 2);
      const minutes = numbers.slice(2);
      return `${hours}:${minutes}`;
    }

    // Limit to 4 digits (HHMM)
    const hours = numbers.slice(0, 2);
    const minutes = numbers.slice(2, 4);
    return `${hours}:${minutes}`;
  };



  // Request notification permissions
  const requestNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Autorizzazione necessaria',
          'Per attivare le notifiche, è necessario concedere i permessi nelle impostazioni del dispositivo.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Get push token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      return token;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };



  // Schedule daily reminder notification
  const scheduleDailyReminder = async (time: string) => {
    try {
      // Cancel all existing scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!dailyReminderEnabled) {
        return;
      }

      const [hours, minutes] = time.split(':').map(Number);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Balance',
          body: 'Hai aggiunto le tue spese oggi? 👀',
          sound: 'default',
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        } as Notifications.NotificationTriggerInput,
      });

      console.log(`Daily reminder scheduled for ${time}`);
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      setIsLoading(true);

      // If recurring notifications are enabled, request permissions
      let notificationToken: string | null = initialNotificationToken || null;
      if (recurringNotificationsEnabled) {
        const tokenResult = await requestNotificationPermissions();
        if (!tokenResult || typeof tokenResult !== 'string') {
          setRecurringNotificationsEnabled(false);
          setIsLoading(false);
          return;
        }
        notificationToken = tokenResult;
      }

      // Save daily reminder settings to MMKV storage (both modes)
      notificationUtils.saveDailyReminderSettings(dailyReminderEnabled, reminderTime);

      if (mode === 'onboarding') {
        // Save notification preferences to MMKV for later processing
        notificationUtils.saveNotificationPreferences({
          dailyReminderEnabled,
          reminderTime,
          recurringNotificationsEnabled,
          notificationToken: notificationToken as string | undefined,
        });
      } else {
        // Settings mode: update database directly for recurring notifications
        await updateProfileMutation.mutateAsync({
          notifications: recurringNotificationsEnabled,
          notificationToken: notificationToken as string | undefined,
        });

        // Invalidate user info cache to refresh the UI
        await utils.user.getUserInfo.invalidate();
      }

      // Schedule daily reminder if enabled (both modes)
      await scheduleDailyReminder(reminderTime);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleClosePress();
      onSaveComplete?.();
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Errore', 'Si è verificato un errore durante il salvataggio delle impostazioni.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle components
  const Toggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
    <Pressable onPress={onToggle} className="w-[51px] h-[31px] rounded-full p-0.5" style={{ backgroundColor: enabled ? '#005EFD' : '#E5E7EB' }}>
      <View
        className={`w-[27px] h-[27px] bg-white rounded-full shadow-sm transition-all duration-200 ${enabled ? 'translate-x-[20px]' : 'translate-x-0'}`}
        style={{
          transform: [{ translateX: enabled ? 20 : 0 }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
        }}
      />
    </Pressable>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#B6B6B6', width: 36, height: 5 }}
      handleStyle={{
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
      }}
      containerStyle={{
        zIndex: 1000,
      }}
      backgroundStyle={{
        backgroundColor: "#FFFFFF"
      }}
      onChange={(index) => {
        if (index === -1) {
          showTabBar();
        } else {
          hideTabBar();
        }
      }}
    >
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-2">
          <View className="flex-1">
            <Text className="text-black text-center font-medium text-xs uppercase tracking-wider">
              NOTIFICHE
            </Text>
          </View>
          <Pressable onPress={handleClosePress} className="p-2">
            <SvgIcon name="close" size={24} color="black" />
          </Pressable>
        </View>

        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <View className="px-4 gap-y-4">

            {/* Daily Reminder Section */}
            <View className="flex-row justify-center gap-x-6">
              <View className="flex-1 gap-y-1">
                <Text className="text-black text-base font-semibold">
                  Reminder giornaliero
                </Text>
                <Text className="text-gray-500 text-sm leading-5">
                  Ti invieremo una notifica al giorno, all'orario che preferisci, per ricordarti di aggiornare i tuoi conti
                </Text>
              </View>
              <Toggle
                enabled={dailyReminderEnabled}
                onToggle={() => setDailyReminderEnabled(!dailyReminderEnabled)}
              />
            </View>

            {/* Time Input when Daily Reminder is enabled */}
            {dailyReminderEnabled && (
              <View className="bg-gray-50 rounded-xl p-3 flex-row justify-center items-center gap-x-2">
                <Text className="text-gray-500 text-base font-semibold">Orario</Text>
                <TextInput
                  className="text-black text-base font-medium text-right min-w-[60px]"
                  value={reminderTime}
                  onChangeText={(text) => setReminderTime(formatTimeInput(text))}
                  placeholder="19:00"
                  keyboardType="numeric"
                  maxLength={5}
                  style={{ fontFamily: 'Apfel Grotezk' }}
                />
              </View>
            )}

            {/* Recurring Notifications Section */}
            <View className="flex-row justify-center gap-x-6">
              <View className="flex-1 gap-y-1">
                <Text className="text-black text-base font-semibold">
                  Ricorrenze e rate
                </Text>
                <Text className="text-gray-500 text-sm leading-5">
                  Ti invieremo una notifica per ricordarti dei tuoi pagamenti ricorrenti e delle rate
                </Text>
              </View>
              <Toggle
                enabled={recurringNotificationsEnabled}
                onToggle={() => setRecurringNotificationsEnabled(!recurringNotificationsEnabled)}
              />
            </View>

            {/* Preview Section */}
            <View className="gap-y-2 mt-4">
              <Text className="text-gray-500 text-xs uppercase font-medium tracking-wider">
                ANTEPRIMA
              </Text>

              <View className="bg-gray-100/90 rounded-[20px] p-3 flex-row items-center gap-x-3">
                <View className="w-[38px] h-[38px] bg-blue-500 rounded-lg items-center justify-center">
                  <Text className="text-white text-lg font-semibold">B</Text>
                </View>

                <View className="flex-1 gap-y-[-4px] py-1">
                  <View className="flex-row justify-between items-center gap-x-1 py-1">
                    <Text className="text-black text-[15px] font-semibold">Balance</Text>
                    <Text className="text-black/50 text-[13px]">Adesso</Text>
                  </View>
                  <Text className="text-black text-[15px] leading-[17px]">
                    Hai aggiunto le tue spese oggi? 👀
                  </Text>
                </View>
              </View>
            </View>

          </View>
        </BottomSheetScrollView>

        {/* Buttons */}
        <View className="absolute bottom-0 left-0 right-0 p-4 pb-9 bg-white border-t border-gray-200 gap-y-2">
          <Button
            variant="primary"
            size="lg"
            rounded="default"
            className="w-full"
            onPress={handleSave}
            isLoading={isLoading}
          >
            <Text className="text-white font-semibold">Salva</Text>
          </Button>

          <Pressable
            onPress={() => {
              handleClosePress();
              onSaveComplete?.();
            }}
            className="w-full py-3"
          >
            <Text className="text-blue-600 font-semibold text-center text-sm">
              Salta per ora
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}; 
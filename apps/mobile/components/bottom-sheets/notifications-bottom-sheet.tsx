import React, { useState } from 'react';
import { View, Pressable, Alert, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import BottomSheet, { BottomSheetBackdropProps, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SvgIcon } from '@/components/ui/svg-icon';
import { useTabBar } from '@/context/TabBarContext';
import { notificationUtils } from '@/lib/mmkv-storage';
import { api } from '@/lib/api';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import DatePicker from 'react-native-modern-datepicker';
import { useTranslation } from 'react-i18next';


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
  // Translation hook
  const { t } = useTranslation();

  // States
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [recurringNotificationsEnabled, setRecurringNotificationsEnabled] = useState(initialNotifications);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [isLoading, setIsLoading] = useState(false);

  // Time picker states
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

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

    // Debug: Check existing scheduled notifications on component mount
    const checkScheduledNotifications = async () => {
      try {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        console.log(`[📅 Notifications Debug] Found ${scheduledNotifications.length} scheduled notifications on mount:`);
        scheduledNotifications.forEach((notification, index) => {
          console.log(`[📅 Notifications Debug] Notification ${index + 1}:`, {
            id: notification.identifier,
            trigger: notification.trigger,
            content: notification.content
          });
        });
      } catch (error) {
        console.error('[📅 Notifications Debug] Error checking scheduled notifications:', error);
      }
    };

    checkScheduledNotifications();
  }, [mode, initialNotifications]);

  // Initialize selectedTime from reminderTime when component mounts
  React.useEffect(() => {
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const timeDate = new Date();
    timeDate.setHours(hours, minutes, 0, 0);
    setSelectedTime(timeDate);
  }, [reminderTime]);

  // Time picker functions
  const handleOpenTimePicker = () => {
    setShowTimePicker(true);
  };

  const handleTimeChange = (date: Date) => {
    setSelectedTime(date);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    setReminderTime(`${hours}:${minutes}`);
  };

  // Handle time picker change
  const handleTimePickerChange = (timeString: string) => {
    // Parse the time string from the picker (format could be different)
    // For time mode, react-native-modern-datepicker returns time in HH:mm format
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(selectedTime);
    newDate.setHours(hours, minutes, 0, 0);
    handleTimeChange(newDate);
    setShowTimePicker(false); // Hide time picker after selection
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
          t('notifications.permissions.required'),
          t('notifications.permissions.message'),
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
      console.log(`[📅 Notifications] Starting scheduleDailyReminder for time: ${time}, enabled: ${dailyReminderEnabled}`);

      // Cancel all existing scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('[📅 Notifications] Canceled all existing scheduled notifications');

      if (!dailyReminderEnabled) {
        console.log('[📅 Notifications] Daily reminder disabled, skipping scheduling');
        return;
      }

      const [hours, minutes] = time.split(':').map(Number);

      // Validate time format
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error(`[📅 Notifications] Invalid time format: ${time}`);
        return;
      }

      // Calculate next occurrence of this time
      const now = new Date();
      const nextNotification = new Date();
      nextNotification.setHours(hours, minutes, 0, 0);

      // If the time has already passed today, schedule for tomorrow
      if (nextNotification <= now) {
        nextNotification.setDate(nextNotification.getDate() + 1);
      }

      console.log(`[📅 Notifications] Scheduling notification for ${hours}:${minutes.toString().padStart(2, '0')}`);
      console.log(`[📅 Notifications] Next notification will fire at: ${nextNotification.toLocaleString()}`);

      const notificationRequest = await Notifications.scheduleNotificationAsync({
        content: {
          title: t('notifications.preview.appName'),
          body: t('notifications.dailyReminder.body'),
          sound: 'default',
        },
        trigger: {
          type: 'calendar',
          repeats: true,
          hour: hours,
          minute: minutes,
        },
      });

      console.log(`[📅 Notifications] Daily reminder scheduled successfully with ID: ${notificationRequest}`);

      // Verify scheduled notifications
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`[📅 Notifications] Total scheduled notifications: ${scheduledNotifications.length}`);
      scheduledNotifications.forEach((notification, index) => {
        console.log(`[📅 Notifications] Scheduled notification ${index + 1}:`, {
          id: notification.identifier,
          trigger: notification.trigger,
          content: notification.content
        });
      });

    } catch (error) {
      console.error('[📅 Notifications] Error scheduling daily reminder:', error);
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

      // Use impact feedback instead of notification feedback to avoid test notification
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      handleClosePress();
      onSaveComplete?.();
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('notifications.errors.saveError'));
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
          showTabBar('notifications-bottom-sheet');
        } else {
          hideTabBar('notifications-bottom-sheet');
        }
      }}
    >
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center w-full pb-8 px-4">
          <View className="">
            <Text className="text-black text-center font-medium uppercase" style={{ fontSize: 14 }}>
              {t('notifications.title')}
            </Text>
          </View>
          <SvgIcon name="close" size={12} color="black" onPress={handleClosePress} />
        </View>

        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <View className="px-4 gap-y-4">

            {/* Daily Reminder Section */}
            <View className="flex-row justify-center gap-x-6">
              <View className="flex-1 gap-y-1">
                <Text className="text-black text-base font-semibold">
                  {t('notifications.dailyReminder.title')}
                </Text>
                <Text className="text-gray-500 text-sm leading-5">
                  {t('notifications.dailyReminder.description')}
                </Text>
              </View>
              <Toggle
                enabled={dailyReminderEnabled}
                onToggle={() => setDailyReminderEnabled(!dailyReminderEnabled)}
              />
            </View>

            {/* Time Input when Daily Reminder is enabled */}
            {dailyReminderEnabled && (
              <>
                <Pressable
                  onPress={handleOpenTimePicker}
                  className="bg-gray-50 rounded-xl p-3 flex-row justify-center items-center gap-x-2"
                >
                  <Text className="text-gray-500 text-base font-semibold">{t('notifications.dailyReminder.timeLabel')}</Text>
                  <Text className="text-black text-base font-medium text-right min-w-[60px]" style={{ fontFamily: 'Apfel Grotezk' }}>
                    {reminderTime}
                  </Text>
                  <SvgIcon name={showTimePicker ? "up" : "down"} size={16} color="#6B7280" />
                </Pressable>

                {/* Inline Time Picker */}
                {showTimePicker && (
                  <View className="">
                    <DatePicker
                      options={{
                        textHeaderColor: '#000000',
                        textDefaultColor: '#000000',
                        selectedTextColor: '#fff',
                        mainColor: '#005EFD',
                        textSecondaryColor: '#000000',
                        borderColor: 'rgba(122, 146, 165, 0.1)',
                      }}
                      current={reminderTime}
                      selected={reminderTime}
                      locale="it"
                      isGregorian={true}
                      mode="time"
                      minuteInterval={15}
                      style={{ borderRadius: 10 }}
                      onTimeChange={handleTimePickerChange}
                    />
                  </View>
                )}
              </>
            )}

            {/* Recurring Notifications Section */}
            <View className="flex-row justify-center gap-x-6">
              <View className="flex-1 gap-y-1">
                <Text className="text-black text-base font-semibold">
                  {t('notifications.recurringPayments.title')}
                </Text>
                <Text className="text-gray-500 text-sm leading-5">
                  {t('notifications.recurringPayments.description')}
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
                {t('notifications.preview.title')}
              </Text>

              <View className="bg-gray-100/90 rounded-[20px] p-3 flex-row items-center gap-x-3">
                <Image
                  source={require("@/assets/images/icon.png")}
                  className="w-12 h-12 rounded-xl"
                  resizeMode="contain"
                />

                <View className="flex-1 gap-y-[-4px] py-1">
                  <View className="flex-row justify-between items-center gap-x-1 py-1">
                    <Text className="text-black text-[15px] font-semibold">{t('notifications.preview.appName')}</Text>
                    <Text className="text-black/50 text-[13px]">{t('notifications.preview.timeNow')}</Text>
                  </View>
                  <Text className="text-black text-[15px] leading-[17px]">
                    {t('notifications.dailyReminder.body')}
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
            <Text className="text-white font-semibold">{t('notifications.actions.save')}</Text>
          </Button>

          <Pressable
            onPress={() => {
              handleClosePress();
              onSaveComplete?.();
            }}
            className="w-full py-3"
          >
            <Text className="text-blue-600 font-semibold text-center text-sm">
              {t('notifications.actions.skipForNow')}
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}; 
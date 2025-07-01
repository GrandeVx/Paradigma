import React, { useState, useRef, RefObject, useMemo } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSupabase } from "@/context/supabase-provider";
import { api } from "@/lib/api";
import { z } from "zod";
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { NotificationsBottomSheet } from "@/components/bottom-sheets/notifications-bottom-sheet";
import { notificationUtils } from "@/lib/mmkv-storage";
import * as Notifications from 'expo-notifications';

export default function SignInVerify(
) {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ name: string, email: string, fromLogin: string }>();
  const { mutate: updateProfile } = api.user.updateProfile.useMutation();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const otpInputRef = useRef<TextInput>(null);
  const { signInWithVerificationOtp } = useSupabase();

  const snapPointsNotifications = useMemo(() => ["85%"], []);
  const bottomSheetNotificationsRef = useRef<BottomSheet>(null);
  const handleOpenNotificationsBottomSheet = () => bottomSheetNotificationsRef.current?.expand();
  const handleCloseNotificationsBottomSheet = () => bottomSheetNotificationsRef.current?.close();



  // Complete authentication flow after notifications modal
  const completeAuthenticationFlow = async () => {
    try {
      console.log("[🚥 SignInVerify] Starting authentication process...");

      await signInWithVerificationOtp(params.email, otp);

      // Process saved notification preferences
      const savedPreferences = notificationUtils.getNotificationPreferences();

      // Update profile with name and notification settings
      const profileUpdate: {
        name?: string;
        notifications?: boolean;
        notificationToken?: string;
      } = {};
      if (params.name) {
        profileUpdate.name = params.name;
      }

      if (savedPreferences) {
        profileUpdate.notifications = savedPreferences.recurringNotificationsEnabled;
        if (savedPreferences.notificationToken) {
          profileUpdate.notificationToken = savedPreferences.notificationToken;
        }

        // Ensure daily reminder settings are saved persistently
        notificationUtils.saveDailyReminderSettings(
          savedPreferences.dailyReminderEnabled,
          savedPreferences.reminderTime
        );

        // Schedule daily reminder if enabled
        if (savedPreferences.dailyReminderEnabled && savedPreferences.reminderTime) {
          await scheduleDailyReminder(savedPreferences.reminderTime);
        }

        // Clear saved preferences since they've been processed
        notificationUtils.clearNotificationPreferences();
      }

      // Only update profile if there are changes to make
      if (Object.keys(profileUpdate).length > 0) {
        await updateProfile(profileUpdate);
      }

      console.log("params.fromLogin", params.fromLogin);

      // Add a small delay to ensure the auth state is properly set
      await new Promise(resolve => setTimeout(resolve, 100));

      if (params.fromLogin === "true") {
        // Existing user login - go to home/accounts
        console.log("[🚥 SignInVerify] Existing user login - go to home/accounts");
        router.dismissTo({
          pathname: "/(protected)/(accounts)",
        });
      } else {
        // New user registration - start account creation flow from name step
        console.log("[🚥 SignInVerify] New user registration - start account creation flow from name step");
        router.dismissTo({
          pathname: "/(protected)/(creation-flow)/name",
          params: {
            firstAccount: "true",
          },
        });
      }
    } catch (error) {
      console.error("[🚥 SignInVerify] Error during authentication flow:", error);
    }
  };

  // Schedule daily reminder notification
  const scheduleDailyReminder = async (time: string) => {
    try {
      // Cancel all existing scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

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

      console.log(`[🚥 SignInVerify] Daily reminder scheduled for ${time}`);
    } catch (error) {
      console.error('[🚥 SignInVerify] Error scheduling daily reminder:', error);
    }
  };

  // Handle notifications save complete
  const handleNotificationsSaveComplete = () => {
    console.log("[🚥 SignInVerify] Notifications modal completed, proceeding with authentication");
    completeAuthenticationFlow();
  };

  const handleContinue = async () => {
    console.log("[🚥 SignInVerify] Opening notifications modal before authentication");
    handleOpenNotificationsBottomSheet();
  };

  const canContinue = otp && z.string().length(6).safeParse(otp).success;
  const isButtonDisabled = !canContinue; // Basic check, enhance with validation

  // Backdrop component for bottom sheet
  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
  );

  return (
    <>
      <HeaderContainer variant="secondary" customTitle={t("auth.email.title", "LA TUA EMAIL")}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjust offset as needed
        >
          <View className="flex-1 justify-between p-4 bg-white gap-2">
            <View className="flex-1 justify-center items-center w-max ">
              <Pressable onPress={() => otpInputRef.current?.focus()}>
                <Text className="text-gray-600 text-base font-sans font-normal mb-2 text-center">
                  {t("auth.verify.prompt", "Ti abbiamo inviato un codice di verifica")}
                </Text>
                <View className="relative w-max items-center">
                  <TextInput
                    autoFocus={true}
                    ref={otpInputRef}
                    className="text-[34px] placeholder:font-medium font-sans text-black pb-2"
                    placeholder={t("auth.verify.placeholder", "XXX-XXX")}
                    placeholderTextColor="text-gray-400" // Use Tailwind class if possible or direct color
                    value={otp}
                    onChangeText={setOtp}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next" // Or "done" if this is the last step initially
                    onSubmitEditing={handleContinue} // Submit on pressing return/next
                    autoComplete="email"
                    spellCheck={false}
                    style={{ fontSize: 34 }} // Ensure font size prevents iOS zoom
                    blurOnSubmit={false} // Keep keyboard open
                  />
                  {/* Optional: Add an animated cursor or indicator if needed */}
                </View>
              </Pressable>
            </View>

            {/* Floating Button at the bottom */}
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <Button
                variant="primary"
                size="lg" // Or adjust size as needed
                onPress={handleContinue}
                disabled={isButtonDisabled}
                className="mb-8" // Add margin if needed
              >
                <Text className="text-[16px] font-sans font-semibold">
                  {t("auth.actions.continue", "Continua")}
                </Text>
              </Button>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </HeaderContainer>
      {/* Notifications Bottom Sheet */}

      <NotificationsBottomSheet
        bottomSheetRef={bottomSheetNotificationsRef as RefObject<BottomSheet>}
        snapPoints={snapPointsNotifications}
        renderBackdrop={renderBackdrop}
        handleClosePress={handleCloseNotificationsBottomSheet}
        onSaveComplete={handleNotificationsSaveComplete}
      />

    </>
  );
} 
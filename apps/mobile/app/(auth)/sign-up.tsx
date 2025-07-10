import React, { useState, useRef, RefObject, useMemo } from "react";
import { Platform, View, Image } from "react-native";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

import HeaderContainer from "@/components/layouts/_header";
import { Input } from "@/components/ui/input";
import { KeyboardAvoidingView } from "react-native"
import { useSupabase } from "@/context/supabase-provider";
import { api } from "@/lib/api";
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { NotificationsBottomSheet } from "@/components/bottom-sheets/notifications-bottom-sheet";
import { notificationUtils } from "@/lib/mmkv-storage";
import * as Notifications from 'expo-notifications';




export default function AuthIndex() {
  const { t } = useTranslation();
  const router = useRouter();
  const { sendVerificationOtp, signInWithGoogle, signInWithApple, forceRouting } = useSupabase();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isCheckingAccounts, setIsCheckingAccounts] = useState(false);

  // Query to check user accounts (disabled by default)
  const { 
    refetch: refetchAccounts,
  } = api.account.listWithBalances.useQuery(
    {},
    { 
      enabled: false, // Only run when manually triggered
      retry: false
    }
  );

  // Notification bottom sheet setup
  const snapPointsNotifications = useMemo(() => ["85%"], []);
  const bottomSheetNotificationsRef = useRef<BottomSheet>(null);
  const handleOpenNotificationsBottomSheet = () => bottomSheetNotificationsRef.current?.expand();
  const handleCloseNotificationsBottomSheet = () => bottomSheetNotificationsRef.current?.close();

  // API mutation for profile updates
  const { mutate: updateProfile } = api.user.updateProfile.useMutation();

  const canSignUp = email && z.string().email().safeParse(email).success;

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

      console.log(`[🚥 OAuth] Daily reminder scheduled for ${time}`);
    } catch (error) {
      console.error('[🚥 OAuth] Error scheduling daily reminder:', error);
    }
  };

  // Complete authentication flow after notifications modal
  const completeOAuthFlow = async () => {
    try {
      setIsCheckingAccounts(true);
      console.log("[🚥 OAuth] Starting OAuth completion process...");

      // Wait a bit for the session to be fully established
      await new Promise(resolve => setTimeout(resolve, 500));

      // Process saved notification preferences
      const savedPreferences = notificationUtils.getNotificationPreferences();

      // Update profile with notification settings
      const profileUpdate: {
        notifications?: boolean;
        notificationToken?: string;
      } = {};

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

      // Check if user has any accounts
      const result = await refetchAccounts();
      const accounts = result.data || [];

      console.log("[OAuth] Found accounts:", accounts.length);

      if (accounts.length === 0) {
        // New user - no accounts, redirect to creation flow
        console.log("[OAuth] New user detected - redirecting to creation flow");
        router.replace({
          pathname: "/(protected)/(creation-flow)/name",
          params: {
            firstAccount: "true",
          },
        } as never);
      } else {
        // Existing user - has accounts, go to home
        console.log("[OAuth] Existing user detected - redirecting to home");
        router.replace("/(protected)/(accounts)" as never);
      }
    } catch (error) {
      console.error("[OAuth] Error during OAuth completion:", error);
      // If we can't determine, assume new user and go to creation flow
      console.log("[OAuth] Defaulting to creation flow due to error");
      router.replace({
        pathname: "/(protected)/(creation-flow)/name",
        params: {
          firstAccount: "true",
        },
      } as never);
    } finally {
      setIsCheckingAccounts(false);
    }
  };

  // Handle notifications save complete
  const handleNotificationsSaveComplete = () => {
    console.log("[🚥 OAuth] Notifications modal completed, proceeding with OAuth completion");
    forceRouting(); // Tell provider to allow routing
    completeOAuthFlow();
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      await sendVerificationOtp(email);
      router.push({
        pathname: "/(auth)/sign-in-verify",
        params: {
          email: email,
          fromLogin: "false", // This is sign-up, so fromLogin should be false
        },
      });
    } catch (error) {
      console.error("Error sending verification OTP:", error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // After successful authentication, open notifications modal
      console.log("[🚥 OAuth] Opening notifications modal after Google authentication");
      handleOpenNotificationsBottomSheet();
    } catch (error) {
      console.error("Google Sign-In error:", error);
      // You might want to show an error toast here
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    try {
      await signInWithApple();
      // After successful authentication, open notifications modal
      console.log("[🚥 OAuth] Opening notifications modal after Apple authentication");
      handleOpenNotificationsBottomSheet();
    } catch (error) {
      console.error("Apple Sign-In error:", error);
      // You might want to show an error toast here
    } finally {
      setIsAppleLoading(false);
    }
  };

  // Backdrop component for bottom sheet
  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
  );

  return (
    <>
      <HeaderContainer variant="secondary">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 170 : 0}
        >
          <View className="flex-1 bg-white px-6" >
            <View className="flex-1 justify-center gap-10 ">
              <View className="flex-col items-start justify-center w-full gap-10">
                <Text className="text-[56px] font-semibold  text-black text-left font-sans leading-[64px] -tracking-wider">
                  {t("auth.sign-up.title")}
                </Text>
                <View className="w-full flex-col gap-2 items-start justify-center text-gray-500">
                  <Text className="text-black text-base font-sans font-semibold">
                    {t("auth.sign-up.email-label")}
                  </Text>
                  <Input
                    placeholder={t("auth.sign-up.email-placeholder")}
                    className="text-black w-full bg-gray-50 !h-14 rounded-lg border-0"
                    value={email}
                    keyboardType="email-address"

                    autoCapitalize="none"
                    autoComplete="email"
                    onChangeText={setEmail}
                  />
                </View>
              </View>
              <View className="justify-end mt-2 flex-col gap-8 ">
                <Button
                  isLoading={isLoading}
                  variant="primary"
                  size="sm"
                  textClassName="text-[16px] font-sans font-semibold"
                  disabled={!canSignUp}
                  onPress={handleSignUp}
                >
                  <Text>
                    {t("auth.sign-up.button")}
                  </Text>
                </Button>
                <View className="flex-row gap-2 justify-center items-center">
                  <View className="flex-1 h-[1px] bg-gray-200" />
                  <Text className="text-gray-500 text-sm font-sans font-normal">
                    {t("auth.actions.or")}
                  </Text>
                  <View className="flex-1 h-[1px] bg-gray-200" />
                </View>
                <View className="justify-center">
                  <View className="flex-row gap-2 w-full">
                    <Button
                      variant="primary"
                      size="lg"
                      textClassName="text-[16px] font-sans font-semibold text-black"
                      className="flex-1 bg-gray-50"
                      isLoading={isGoogleLoading || isCheckingAccounts}
                      disabled={isLoading || isAppleLoading || isCheckingAccounts}
                      onPress={handleGoogleSignIn}
                      leftIcon={
                        <Image
                          source={require("@/assets/icons/google.png")}
                          style={{ width: 20, height: 20 }}
                        />
                      }
                    >

                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      textClassName="text-[16px] font-sans font-semibold text-black"
                      className="flex-1 bg-gray-50"
                      isLoading={isAppleLoading || isCheckingAccounts}
                      disabled={isLoading || isGoogleLoading || isCheckingAccounts}
                      onPress={handleAppleSignIn}
                      leftIcon={
                        <Image
                          source={require("@/assets/icons/apple.png")}
                          style={{ width: 20, height: 20 }}
                        />
                      }
                    >

                    </Button>
                  </View>
                </View>
              </View>
            </View>
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


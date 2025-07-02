import React, { useCallback } from "react";
import { StyleSheet, ScrollView, Pressable, Alert, View } from "react-native";
import { Text } from "@/components/ui/text";
import HeaderContainer from "@/components/layouts/_header";
import { SvgIcon } from "@/components/ui/svg-icon";
import { useRouter } from "expo-router";
import { useSupabase } from "@/context/supabase-provider";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRef } from "react";
import BottomSheet, { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import * as WebBrowser from "expo-web-browser";
import { reloadAppAsync } from "expo";
import { api } from "@/lib/api";
import { useTabBar } from "@/context/TabBarContext";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { ManualUpdateChecker } from "@/components/ui";
import { useCurrency, type Currency } from "@/hooks/use-currency";
import { useProfileIcon } from "@/hooks/use-profile-icon";
import { cacheUtils, budgetUtils, transactionUtils, goalsUtils, notificationUtils } from "@/lib/mmkv-storage";
import { NotificationsBottomSheet } from "@/components/bottom-sheets/notifications-bottom-sheet";

const LANGUAGES = [
  { code: "en-US", flag: "🇺🇸", name: "English" },
  { code: "it-IT", flag: "🇮🇹", name: "Italiano" },
];

// Section Component
const Section: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContainer}>
      {children}
    </View>
  </View>
);

// Category Item Component
const CategoryItem: React.FC<{
  label: string;
  value?: string;
  hasArrow?: boolean;
  isToggle?: boolean;
  toggleValue?: boolean;
  onPress?: () => void;
  textColor?: string;
}> = ({ label, value, hasArrow = false, isToggle = false, toggleValue = false, onPress, textColor = "#6B7280" }) => (
  <Pressable style={styles.categoryItem} onPress={onPress}>
    <Text style={[styles.categoryLabel, { color: textColor }]}>{label}</Text>
    {value && (
      <Text style={styles.categoryValue}>{value}</Text>
    )}
    {isToggle && (
      <View style={[styles.toggle, toggleValue && styles.toggleActive]}>
        <View style={[styles.toggleKnob, toggleValue && styles.toggleKnobActive]} />
      </View>
    )}
    {hasArrow && (
      <SvgIcon name="right" width={16} height={16} color="#6B7280" />
    )}
  </Pressable>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, user } = useSupabase();
  const { data: userInfo } = api.user.getUserInfo.useQuery();
  const { mutate: deleteAccount, isLoading: isDeletingAccount } = api.user.deleteAccount.useMutation({
    onSuccess: async (data) => {
      console.log('✅ Account deleted successfully:', data.deletedData);

      try {
        console.log('🧹 Clearing AsyncStorage...');
        await AsyncStorage.multiRemove([
          'language',
          'currency',
          'profileIcon',
          'onboarding_completed',
          'user_preferences'
        ]);

        console.log('🧹 Clearing MMKV cache data...');
        try {
          cacheUtils.clearCache();

          budgetUtils.clearMonthlyTotalBudget();
          budgetUtils.clearBudgetCache();
          goalsUtils.clearGoalsCache();

          // Clear notification settings
          notificationUtils.clearNotificationPreferences();
          notificationUtils.clearDailyReminderSettings();

          // Clear transaction caches for current and recent months
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear();

          // Clear last 12 months of transaction and chart caches
          for (let i = 0; i < 12; i++) {
            let month = currentMonth - i;
            let year = currentYear;

            if (month <= 0) {
              month += 12;
              year -= 1;
            }

            transactionUtils.clearTransactionCache(month, year);
          }

          console.log('✅ MMKV cache cleared successfully');
        } catch (error) {
          console.warn('⚠️ Some MMKV caches failed to clear:', error);
          // Continue with account deletion even if cache clearing fails
        }

        console.log('🔐 Signing out user...');
        // Sign out the user to clear session
        await signOut();

        // Show success message before redirect
        Alert.alert(
          t('profile.accountDeleted'),
          t('profile.accountDeletedMessage'),
          [
            {
              text: t('common.ok'),
            }
          ]
        );

      } catch (error) {
        console.error('Error during cleanup after account deletion:', error);
        // Even if cleanup fails, still redirect to auth
        router.replace("/(auth)");
      }
    },
    onError: (error) => {
      console.error('❌ Failed to delete account:', error);
      Alert.alert(
        t('common.error'),
        error.message || t('profile.errorDeletingAccount'),
        [{ text: t('common.ok'), style: 'default' }]
      );
    },
  });
  const { t, i18n: i18nInstance } = useTranslation();
  const { hideTabBar } = useTabBar();
  const { currency, setCurrency, supportedCurrencies } = useCurrency();
  const { icon, setIcon, supportedIcons } = useProfileIcon();

  const handleLanguageChange = async (language: string) => {
    try {
      await AsyncStorage.setItem("language", language);
      await i18nInstance.changeLanguage(language);
      languageBottomSheetRef.current?.close();
      reloadAppAsync();
    } catch (error) {
      console.error("Error changing language:", error);
      Alert.alert("Error", "Failed to change language. Please try again.");
    }
  };

  const handleCurrencyChange = async (selectedCurrency: Currency) => {
    try {
      await setCurrency(selectedCurrency);
      currencyBottomSheetRef.current?.close();
      Alert.alert(t('profile.currencyUpdated'), t('profile.currencyUpdatedMessage', { currency: selectedCurrency.name }), [
        {
          text: t('profile.restart'),
          onPress: () => {
            reloadAppAsync();
          }
        }
      ]);
    } catch (error) {
      console.error("Error changing currency:", error);
      Alert.alert(t('common.error'), t('profile.errorChangingCurrency'));
    }
  };

  const handleIconChange = async (selectedIcon: string) => {
    try {
      await setIcon(selectedIcon);
      profileIconBottomSheetRef.current?.close();
      // generate an alert to tell the user that we need to restart the app to see the new icon
      Alert.alert(t('profile.iconUpdated'), t('profile.iconUpdatedMessage'), [
        {
          text: t('profile.restart'),
          onPress: () => {
            reloadAppAsync();
          }
        }
      ])

    } catch (error) {
      console.error("Error changing icon:", error);
      Alert.alert(t('common.error'), t('profile.errorChangingIcon'));
    }
  };

  const currentLanguage = LANGUAGES.find(
    (lang) => lang.code === i18nInstance.language
  );

  const handleDeleteAccount = () => {
    // Don't allow deletion if already in progress
    if (isDeletingAccount) {
      return;
    }

    Alert.alert(
      t("settings.account.deleteConfirmTitle"),
      t("settings.account.deleteConfirmMessage"),
      [
        {
          text: t("settings.account.cancel"),
          style: "cancel",
        },
        {
          text: t("settings.account.delete"),
          style: "destructive",
          onPress: () => {
            // Show additional confirmation for such a destructive action
            Alert.alert(
              t("profile.finalDeleteConfirmTitle"),
              t("profile.finalDeleteConfirmMessage"),
              [
                {
                  text: t("settings.account.cancel"),
                  style: "cancel",
                },
                {
                  text: t("profile.deleteForever"),
                  style: "destructive",
                  onPress: () => {
                    console.log('🗑️ Starting account deletion process...');
                    deleteAccount();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(t("settings.signOut.title"), t("settings.signOut.message"), [
      {
        text: t("settings.account.cancel"),
        style: "cancel",
      },
      {
        text: t("settings.account.signOut"),
        style: "destructive",
        onPress: () => {
          console.log("Starting sign out process...");
          signOut();
          console.log("Sign out completed");
          router.replace("/(auth)");
        },
      },
    ]);
  };

  // Get user display name - fallback to email prefix if no name
  const getUserDisplayName = () => {
    if (userInfo?.name) {
      return userInfo.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return t('profile.user');
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        enableTouchThrough={false}
        pressBehavior="close"
        style={[
          { backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10 },
          props.style
        ]}
      />
    ),
    []
  );

  const languageBottomSheetRef = useRef<BottomSheet>(null);
  const currencyBottomSheetRef = useRef<BottomSheet>(null);
  const profileIconBottomSheetRef = useRef<BottomSheet>(null);
  const notificationsBottomSheetRef = useRef<BottomSheet>(null);
  return (
    <>
      <HeaderContainer variant="secondary" hideBackButton={true} customTitle={t('tab-bar.profile')}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* IMPOSTAZIONI ACCOUNT */}
          <Section title={t('profile.accountSettings')}>
            {/* Profile Picture */}
            <Pressable style={styles.profileContainer} onPress={() => profileIconBottomSheetRef.current?.expand()}>
              <View style={styles.profilePic}>
                <Text style={styles.profileEmoji}>{icon}</Text>
              </View>
            </Pressable>

            <CategoryItem
              label={t('profile.name')}
              value={getUserDisplayName()}
            />

            <CategoryItem
              label={t('profile.email')}
              value={user?.email || ""}
            />

            <CategoryItem
              label={t('profile.faceIdLogin')}
              isToggle={true}
              toggleValue={false}
              onPress={() => {
                Alert.alert(t('accounts.comingSoon'))
              }}
            />
          </Section>

          {/* PREFERENZE */}
          <Section title={t('profile.preferences')}>
            <CategoryItem
              label={t('profile.language')}
              value={currentLanguage ? `${currentLanguage.flag} ${currentLanguage.name}` : t('settings.language.select')}
              hasArrow={true}
              onPress={() => languageBottomSheetRef.current?.expand()}
            />

            <CategoryItem
              label={t('profile.currency')}
              value={`${currency.symbol} ${currency.name}`}
              hasArrow={true}
              onPress={() => currencyBottomSheetRef.current?.expand()}
            />

            <CategoryItem
              label={t('profile.notifications')}
              hasArrow={true}
              onPress={() => notificationsBottomSheetRef.current?.expand()}
            />
          </Section>



          {/* PAGAMENTI */}
          <Section title={t('profile.payments')}>
            <CategoryItem
              label={t('profile.recurring')}
              hasArrow={true}
              onPress={() => {
                hideTabBar();
                router.push("/(protected)/(profile)/(settings)")
              }}
            />

            <CategoryItem
              label={t('profile.installments')}
              hasArrow={true}
              onPress={() => {
                hideTabBar();
                router.push("/(protected)/(profile)/(settings)/installments")
              }}
            />
          </Section>

          {/* AIUTO */}
          <Section title={t('profile.help')}>
            <CategoryItem
              label={t('profile.requestFeatures')}
              hasArrow={true}
              onPress={() => WebBrowser.openBrowserAsync("https://www.google.com")}
            />

            <CategoryItem
              label={t('profile.support')}
              hasArrow={true}
              onPress={() => WebBrowser.openBrowserAsync("https://www.google.com")}
            />

            <CategoryItem
              label={t('profile.helpCenter')}
              hasArrow={true}
              onPress={() => WebBrowser.openBrowserAsync("https://www.google.com")}
            />
          </Section>

          {/* AGGIORNAMENTI */}
          <Section title={t('profile.updates')}>
            <View style={styles.updateSection}>
              <ManualUpdateChecker />
            </View>
            <View style={[styles.updateSection, { marginTop: 8 }]}>

            </View>
          </Section>


          {/* AZIONI */}
          <Section title="">
            <CategoryItem
              label={t('profile.signOut')}
              textColor="#DE4841"
              onPress={handleSignOut}
            />

            <CategoryItem
              label={isDeletingAccount ? t('profile.deletingAccount') : t('profile.deleteAccount')}
              textColor={isDeletingAccount ? "#9CA3AF" : "#DE4841"}
              onPress={isDeletingAccount ? undefined : handleDeleteAccount}
            />
          </Section>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </HeaderContainer>
      {/* Language Selection Bottom Sheet */}
      <BottomSheet
        ref={languageBottomSheetRef}
        snapPoints={["40%"]}
        index={-1}
        enablePanDownToClose

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
        <View style={styles.bottomSheetContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t("settings.language.select")}
            </Text>
          </View>
          {LANGUAGES.map((language) => (
            <Pressable
              key={language.code}
              style={[
                styles.languageOption,
                i18nInstance.language === language.code &&
                styles.selectedLanguage,
              ]}
              onPress={() => handleLanguageChange(language.code)}
            >
              <Text style={styles.languageText}>
                {language.flag} {language.name}
              </Text>
              {i18nInstance.language === language.code && (
                <SvgIcon name="checks" width={16} height={16} color="#007AFF" />
              )}
            </Pressable>
          ))}
        </View>
      </BottomSheet>

      {/* Currency Selection Bottom Sheet */}
      <BottomSheet
        ref={currencyBottomSheetRef}
        snapPoints={["60%"]}
        index={-1}
        enablePanDownToClose
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
        <View style={styles.bottomSheetContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('profile.selectCurrency')}</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {supportedCurrencies.map((currencyOption) => (
              <Pressable
                key={currencyOption.code}
                style={[
                  styles.languageOption,
                  currency.code === currencyOption.code && styles.selectedLanguage,
                ]}
                onPress={() => handleCurrencyChange(currencyOption)}
              >
                <Text style={styles.languageText}>
                  {currencyOption.symbol} {currencyOption.name}
                </Text>
                {currency.code === currencyOption.code && (
                  <SvgIcon name="checks" width={16} height={16} color="#007AFF" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </BottomSheet>

      {/* Profile Icon Selection Bottom Sheet */}
      <BottomSheet
        ref={profileIconBottomSheetRef}
        snapPoints={["60%"]}
        index={-1}
        enablePanDownToClose
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
        <View style={styles.bottomSheetContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('profile.selectIcon')}</Text>
          </View>
          <View style={styles.iconGrid}>
            {supportedIcons.map((iconOption) => (
              <Pressable
                key={iconOption}
                style={[
                  styles.iconOption,
                  icon === iconOption && styles.selectedIcon,
                ]}
                onPress={() => handleIconChange(iconOption)}
              >
                <Text style={styles.iconText}>
                  {iconOption}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </BottomSheet>

      {/* Notifications Bottom Sheet */}
      <NotificationsBottomSheet
        bottomSheetRef={notificationsBottomSheetRef as React.RefObject<BottomSheet>}
        snapPoints={["85%"]}
        renderBackdrop={renderBackdrop}
        handleClosePress={() => notificationsBottomSheetRef.current?.close()}
        mode="settings"
        initialNotifications={userInfo?.notifications || false}
        initialNotificationToken={userInfo?.notificationToken || undefined}
        onSaveComplete={() => {
          // Show success message
          Alert.alert('Successo', 'Le impostazioni delle notifiche sono state aggiornate.');
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  updateSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  profilePic: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#1E94FF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileEmoji: {
    fontSize: 32,
    lineHeight: 44,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  categoryValue: {
    fontSize: 16,
    color: "#D1D5DB",
    marginLeft: "auto",
  },
  toggle: {
    width: 51,
    height: 31,
    backgroundColor: "#E5E7EB",
    borderRadius: 100,
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#1E94FF",
  },
  toggleKnob: {
    width: 27,
    height: 27,
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  bottomSpacer: {
    height: 96,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: "#000",
    fontWeight: "600",
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  selectedLanguage: {
    backgroundColor: "#f0f0f0",
  },
  languageText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  iconOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  selectedIcon: {
    borderWidth: 2,
    borderColor: "#1E94FF",
  },
  iconText: {
    fontSize: 28,
  },
});

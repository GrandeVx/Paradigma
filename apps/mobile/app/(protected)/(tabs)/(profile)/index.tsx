import React, { RefObject, useCallback, useRef } from "react";
import { StyleSheet, ScrollView, Pressable, Alert, View } from "react-native";
import { Text } from "@/components/ui/text";
import HeaderContainer from "@/components/layouts/_header";
import { SvgIcon } from "@/components/ui/svg-icon";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth-provider";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet, { BottomSheetBackdropProps, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import * as WebBrowser from "expo-web-browser";
import { reloadAppAsync } from "expo";
import { api } from "@/lib/api";
import { useProfileIcon } from "@/hooks/use-profile-icon";
import { useUpdateStatus } from "@/hooks/use-update-status";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
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
  customIcon?: { name: string; color: string; size?: number };
  onPress?: () => void;
  textColor?: string;
}> = ({ label, value, hasArrow = false, isToggle = false, toggleValue = false, customIcon, onPress, textColor = "#6B7280" }) => (
  <Pressable style={styles.categoryItem} onPress={onPress} disabled={!onPress}>
    <Text style={[styles.categoryLabel, { color: textColor }]}>{label}</Text>
    {value && (
      <Text style={styles.categoryValue}>{value}</Text>
    )}
    {isToggle && (
      <View style={[styles.toggle, toggleValue && styles.toggleActive]}>
        <View style={[styles.toggleKnob, toggleValue && styles.toggleKnobActive]} />
      </View>
    )}
    {customIcon && (
      <SvgIcon
        name={customIcon.name as any}
        width={customIcon.size || 16}
        height={customIcon.size || 16}
        color={customIcon.color}
      />
    )}
    {hasArrow && !customIcon && (
      <SvgIcon name="right" width={16} height={16} color="#6B7280" />
    )}
  </Pressable>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, user, setIsOnboarded } = useAuth();
  const { data: userInfo } = api.user.getUserInfo.useQuery();
  const { isSupported, isEnabled, enableBiometric, disableBiometric } = useBiometricAuth();

  const { mutate: deleteAccount, isLoading: isDeletingAccount } = api.user.deleteAccount.useMutation({
    onSuccess: async () => {
      try {
        await AsyncStorage.multiRemove([
          'language',
          'profileIcon',
          'onboarding_completed',
          'user_preferences'
        ]);

        await signOut();

        Alert.alert(
          t('profile.accountDeleted'),
          t('profile.accountDeletedMessage'),
          [{ text: t('common.ok') }]
        );
      } catch (error) {
        console.error('Error during cleanup after account deletion:', error);
        router.replace("/(auth)");
      }
    },
    onError: (error) => {
      Alert.alert(
        t('common.error'),
        error.message || t('profile.errorDeletingAccount'),
        [{ text: t('common.ok') }]
      );
    },
  });

  const { t, i18n: i18nInstance } = useTranslation();
  const { icon, setIcon, supportedIcons } = useProfileIcon();
  const updateStatus = useUpdateStatus();

  // Bottom sheet refs
  const languageBottomSheetRef = useRef<BottomSheet>(null);
  const profileIconBottomSheetRef = useRef<BottomSheet>(null);
  const notificationsBottomSheetRef = useRef<BottomSheet>(null);

  const handleLanguageChange = async (language: string) => {
    try {
      await AsyncStorage.setItem("language", language);
      await i18nInstance.changeLanguage(language);
      languageBottomSheetRef.current?.close();
      reloadAppAsync();
    } catch (error) {
      Alert.alert("Error", "Failed to change language. Please try again.");
    }
  };

  const handleIconChange = async (selectedIcon: string) => {
    try {
      await setIcon(selectedIcon);
      profileIconBottomSheetRef.current?.close();
      Alert.alert(
        t('profile.iconUpdated'),
        t('profile.iconUpdatedMessage'),
        [{
          text: t('profile.restart'),
          onPress: () => reloadAppAsync()
        }]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.errorChangingIcon'));
    }
  };

  const handleBiometricToggle = async () => {
    if (!isSupported) {
      Alert.alert(
        'Biometric Authentication',
        'Biometric authentication is not available on this device or no biometrics are enrolled.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (isEnabled) {
      disableBiometric();
    } else {
      await enableBiometric();
    }
  };

  const currentLanguage = LANGUAGES.find(
    (lang) => lang.code === i18nInstance.language
  );

  const handleDeleteAccount = () => {
    if (isDeletingAccount) return;

    Alert.alert(
      t("settings.account.deleteConfirmTitle"),
      t("settings.account.deleteConfirmMessage"),
      [
        { text: t("settings.account.cancel"), style: "cancel" },
        {
          text: t("settings.account.delete"),
          style: "destructive",
          onPress: () => {
            Alert.alert(
              t("profile.finalDeleteConfirmTitle"),
              t("profile.finalDeleteConfirmMessage"),
              [
                { text: t("settings.account.cancel"), style: "cancel" },
                {
                  text: t("profile.deleteForever"),
                  style: "destructive",
                  onPress: () => deleteAccount(),
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      t("settings.signOut.title"),
      t("settings.signOut.message"),
      [
        { text: t("settings.account.cancel"), style: "cancel" },
        {
          text: t("settings.account.signOut"),
          style: "destructive",
          onPress: () => {
            signOut();
            router.replace("/(auth)");
          },
        },
      ]
    );
  };

  const handleRestartOnboarding = () => {
    Alert.alert(
      t("profile.restartOnboardingTitle"),
      t("profile.restartOnboardingMessage"),
      [
        { text: t("settings.account.cancel"), style: "cancel" },
        {
          text: t("profile.restartOnboarding"),
          onPress: async () => {
            try {
              await AsyncStorage.setItem("hasCompletedOnboarding", "false");
              await setIsOnboarded(false);
              router.replace("/(onboarding)");
            } catch (error) {
              Alert.alert(t("common.error"), t("profile.errorRestartingOnboarding"));
            }
          },
        },
      ]
    );
  };

  const getUserDisplayName = () => {
    if (userInfo?.name) return userInfo.name;
    if (user?.email) return user.email.split('@')[0];
    return t('profile.user');
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <>
      <HeaderContainer variant="secondary" hideBackButton={true} customTitle={t('tab-bar.profile')}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* ACCOUNT SETTINGS */}
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
              toggleValue={isEnabled}
              onPress={handleBiometricToggle}
            />
          </Section>

          {/* PREFERENCES */}
          <Section title={t('profile.preferences')}>
            <CategoryItem
              label={t('profile.language')}
              value={currentLanguage ? `${currentLanguage.flag} ${currentLanguage.name}` : t('settings.language.select')}
              hasArrow={true}
              onPress={() => languageBottomSheetRef.current?.expand()}
            />

            <CategoryItem
              label={t('profile.notifications')}
              hasArrow={true}
              onPress={() => notificationsBottomSheetRef.current?.expand()}
            />
          </Section>

          {/* HELP */}
          <Section title={t('profile.help')}>
            <CategoryItem
              label={t('profile.requestFeatures')}
              hasArrow={true}
              onPress={() => WebBrowser.openBrowserAsync("https://balance.userjot.com/")}
            />

            <CategoryItem
              label={t('profile.support')}
              hasArrow={true}
              onPress={() => WebBrowser.openBrowserAsync("mailto:info@metrica.dev")}
            />

            <CategoryItem
              label={t('profile.helpCenter')}
              hasArrow={true}
              onPress={() => WebBrowser.openBrowserAsync("https://trybalance.eu/privacy-policy")}
            />

            <CategoryItem
              label={t('profile.restartOnboarding')}
              hasArrow={true}
              onPress={handleRestartOnboarding}
            />
          </Section>

          {/* UPDATES */}
          <Section title={t('profile.updates')}>
            <CategoryItem
              label={t('profile.updates')}
              value={updateStatus.label}
              customIcon={{
                name: "refresh",
                color: updateStatus.iconColor,
                size: 16
              }}
              onPress={updateStatus.onPress}
            />
          </Section>

          {/* ACCOUNT ACTIONS */}
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
        </ScrollView>
      </HeaderContainer>

      {/* Language Bottom Sheet */}
      <BottomSheet
        ref={languageBottomSheetRef}
        index={-1}
        snapPoints={['40%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>{t('settings.language.title')}</Text>
          {LANGUAGES.map((language) => (
            <Pressable
              key={language.code}
              style={[
                styles.languageItem,
                i18nInstance.language === language.code && styles.languageItemActive
              ]}
              onPress={() => handleLanguageChange(language.code)}
            >
              <Text style={styles.languageFlag}>{language.flag}</Text>
              <Text style={styles.languageName}>{language.name}</Text>
              {i18nInstance.language === language.code && (
                <SvgIcon name="checks" width={20} height={20} color="#005EFD" />
              )}
            </Pressable>
          ))}
        </View>
      </BottomSheet>

      {/* Profile Icon Bottom Sheet */}
      <BottomSheet
        ref={profileIconBottomSheetRef}
        index={-1}
        snapPoints={['50%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>{t('profile.selectIcon')}</Text>
          <View style={styles.iconGrid}>
            {supportedIcons.map((supportedIcon) => (
              <Pressable
                key={supportedIcon}
                style={[
                  styles.iconItem,
                  icon === supportedIcon && styles.iconItemActive
                ]}
                onPress={() => handleIconChange(supportedIcon)}
              >
                <Text style={styles.iconText}>{supportedIcon}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </BottomSheet>

      {/* Notifications Bottom Sheet */}
      <NotificationsBottomSheet
        bottomSheetRef={notificationsBottomSheetRef as RefObject<BottomSheet>}
        snapPoints={['60%']}
        renderBackdrop={renderBackdrop}
        handleClosePress={() => notificationsBottomSheetRef.current?.close()}
        mode="settings"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 0,
    paddingVertical: 4,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileEmoji: {
    fontSize: 32,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  categoryValue: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#10B981',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  bottomSheetContent: {
    flex: 1,
    padding: 24,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  languageItemActive: {
    backgroundColor: '#EBF5FF',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '15%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconItemActive: {
    backgroundColor: '#EBF5FF',
    borderWidth: 2,
    borderColor: '#005EFD',
  },
  iconText: {
    fontSize: 24,
  },
});
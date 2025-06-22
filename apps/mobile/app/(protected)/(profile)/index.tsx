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
  const { mutate: deleteAccount } = api.user.deleteAccount.useMutation({
    onSuccess: () => {
      router.replace("/(auth)/sign-in");
    },
  });
  const { t, i18n: i18nInstance } = useTranslation();
  const { hideTabBar } = useTabBar();

  const handleLanguageChange = async (language: string) => {
    try {
      await AsyncStorage.setItem("language", language);
      await i18nInstance.changeLanguage(language);
      bottomSheetRef.current?.close();
      reloadAppAsync();
    } catch (error) {
      console.error("Error changing language:", error);
      Alert.alert("Error", "Failed to change language. Please try again.");
    }
  };

  const currentLanguage = LANGUAGES.find(
    (lang) => lang.code === i18nInstance.language
  );

  const handleDeleteAccount = () => {
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
            deleteAccount();
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
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  // Get user display name - fallback to email prefix if no name
  const getUserDisplayName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "Utente";
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

  const bottomSheetRef = useRef<BottomSheet>(null);
  return (
    <>
      <HeaderContainer variant="secondary" hideBackButton={true}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* IMPOSTAZIONI ACCOUNT */}
          <Section title="IMPOSTAZIONI ACCOUNT">
            {/* Profile Picture */}
            <View style={styles.profileContainer}>
              <View style={styles.profilePic}>
                <Text style={styles.profileEmoji}>🤩</Text>
              </View>
            </View>

            <CategoryItem
              label="Nome"
              value={getUserDisplayName()}
            />

            <CategoryItem
              label="Email"
              value={user?.email || ""}
            />

            <CategoryItem
              label="Accedi con Face ID"
              isToggle={true}
              toggleValue={false}
              onPress={() => {
                Alert.alert("Coming soon")
              }}
            />
          </Section>

          {/* PREFERENZE */}
          <Section title="PREFERENZE">
            <CategoryItem
              label="Lingua"
              value={currentLanguage ? `${currentLanguage.flag} ${currentLanguage.name}` : "Seleziona"}
              hasArrow={true}
              onPress={() => bottomSheetRef.current?.expand()}
            />

            <CategoryItem
              label="Valuta"
              value="EUR"
            />

            <CategoryItem
              label="Notifiche"
              hasArrow={true}
              onPress={() => { }}
            />
          </Section>

          {/* PAGAMENTI */}
          <Section title="PAGAMENTI">
            <CategoryItem
              label="Ricorrenti"
              hasArrow={true}
              onPress={() => {
                hideTabBar();
                router.push("/(protected)/(profile)/(settings)")
              }}
            />

            <CategoryItem
              label="Rate"
              hasArrow={true}
              onPress={() => {
                hideTabBar();
                router.push("/(protected)/(profile)/(settings)/installments")
              }}
            />
          </Section>

          {/* AIUTO */}
          <Section title="AIUTO">
            <CategoryItem
              label="Richiedi & Vota nuove feature"
              hasArrow={true}
              onPress={() => WebBrowser.openBrowserAsync("https://www.google.com")}
            />

            <CategoryItem
              label="Supporto"
              hasArrow={true}
              onPress={() => WebBrowser.openBrowserAsync("https://www.google.com")}
            />

            <CategoryItem
              label="Centro Assistenza"
              hasArrow={true}
              onPress={() => WebBrowser.openBrowserAsync("https://www.google.com")}
            />
          </Section>

          {/* AZIONI */}
          <Section title="">
            <CategoryItem
              label="Disconnettiti"
              textColor="#DE4841"
              onPress={handleSignOut}
            />

            <CategoryItem
              label="Elimina Account"
              textColor="#DE4841"
              onPress={handleDeleteAccount}
            />
          </Section>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </HeaderContainer>
      {/* Language Selection Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
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
});

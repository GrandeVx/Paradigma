import { StyleSheet, ScrollView, Pressable, Alert, View } from "react-native";
import { Text } from "@/components/ui/text";
import HeaderContainer from "@/components/layouts/_header";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSupabase } from "@/context/supabase-provider";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRef } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import * as WebBrowser from "expo-web-browser";
import { reloadAppAsync } from "expo";
import { api } from "@/lib/api";

const LANGUAGES = [
  { code: "en-US", flag: "🇺🇸" },
  { code: "it-IT", flag: "🇮🇹" },
];

export default function SettingsScreen() {
  const { signOut } = useSupabase();
  const { mutate: deleteAccount } = api.user.deleteAccount.useMutation({
    onSuccess: () => {
      router.replace("/(auth)/sign-in");
    },
  });
  const router = useRouter();
  const { t, i18n: i18nInstance } = useTranslation();
  const bottomSheetRef = useRef<BottomSheet>(null);

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

  return (
    <HeaderContainer variant="secondary">
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("settings.language.title")}
          </Text>
          <Pressable
            style={styles.option}
            onPress={() => {
              bottomSheetRef.current?.expand();
            }}
          >
            <FontAwesome6 name="globe" size={20} color="#666" />
            <Text style={styles.optionText}>
              {currentLanguage
                ? `${currentLanguage.flag} ${t(`settings.language.countries.${currentLanguage.code}`)}`
                : t("settings.language.select")}
            </Text>
            <FontAwesome6 name="chevron-right" size={16} color="#666" />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.account.title")}</Text>
          <Pressable style={styles.option} onPress={() => {}}>
            <FontAwesome6 name="user" size={20} color="#666" />
            <Text style={styles.optionText}>
              {t("settings.account.profileInfo")}
            </Text>
            <FontAwesome6 name="chevron-right" size={16} color="#666" />
          </Pressable>
          <Pressable style={styles.option} onPress={() => {}}>
            <FontAwesome6 name="bell" size={20} color="#666" />
            <Text style={styles.optionText}>
              {t("settings.account.notifications")}
            </Text>
            <FontAwesome6 name="chevron-right" size={16} color="#666" />
          </Pressable>
          <Pressable style={styles.option} onPress={handleSignOut}>
            <FontAwesome6 name="right-from-bracket" size={20} color="#666" />
            <Text style={styles.optionText}>
              {t("settings.account.signOut")}
            </Text>
            <FontAwesome6 name="chevron-right" size={16} color="#666" />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.privacy.title")}</Text>
          <Pressable
            style={styles.option}
            onPress={() => {
              WebBrowser.openBrowserAsync("https://www.google.com");
            }}
          >
            <FontAwesome6 name="lock" size={20} color="#666" />
            <Text style={styles.optionText}>
              {t("settings.privacy.privacySettings")}
            </Text>
            <FontAwesome6 name="chevron-right" size={16} color="#666" />
          </Pressable>
          <Pressable
            style={styles.option}
            onPress={() => {
              WebBrowser.openBrowserAsync("https://www.google.com");
            }}
          >
            <FontAwesome6 name="eye" size={20} color="#666" />
            <Text style={styles.optionText}>
              {t("settings.privacy.visibility")}
            </Text>
            <FontAwesome6 name="chevron-right" size={16} color="#666" />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.support.title")}</Text>
          <Pressable
            style={styles.option}
            onPress={() => {
              WebBrowser.openBrowserAsync("https://www.google.com");
            }}
          >
            <FontAwesome6 name="circle-question" size={20} color="#666" />
            <Text style={styles.optionText}>
              {t("settings.support.helpCenter")}
            </Text>
            <FontAwesome6 name="chevron-right" size={16} color="#666" />
          </Pressable>
          <Pressable
            style={styles.option}
            onPress={() => {
              WebBrowser.openBrowserAsync("https://www.google.com");
            }}
          >
            <FontAwesome6 name="envelope" size={20} color="#666" />
            <Text style={styles.optionText}>
              {t("settings.support.contactUs")}
            </Text>
            <FontAwesome6 name="chevron-right" size={16} color="#666" />
          </Pressable>
        </View>

        <View style={styles.dangerSection}>
          <Pressable style={styles.deleteButton} onPress={handleDeleteAccount}>
            <FontAwesome6 name="trash" size={20} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>
              {t("settings.account.deleteAccount")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["40%"]}
        index={-1}
        enablePanDownToClose
        onClose={() => {}}
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
                {language.flag}{" "}
                {t(`settings.language.countries.${language.code}`)}
              </Text>
              {i18nInstance.language === language.code && (
                <FontAwesome6 name="check" size={16} color="#007AFF" />
              )}
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </HeaderContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  section: {
    marginBottom: 15,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 16,
    color: "#666",
    textTransform: "uppercase",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
    marginBottom: 1,
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 17,
    color: "#000",
  },
  dangerSection: {
    marginTop: 0,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
    borderRadius: 8,
  },
  deleteButtonText: {
    marginLeft: 12,
    fontSize: 17,
    color: "#FF3B30",
    fontWeight: "500",
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

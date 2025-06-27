import React from "react";
import { StyleSheet, Pressable } from "react-native";

import { ExternalLink } from "./utils/ExternalLink";

import { Text } from "./ui/text";
import { View } from "react-native";

import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { P } from "./ui/typography";

export default function EditScreenInfo({ path }: { path: string }) {
  const { t, i18n } = useTranslation();

  // Toggle between Italian and English
  const toggleLanguage = async () => {
    const newLang = i18n.language === "it-IT" ? "en-US" : "it-IT";
    await AsyncStorage.setItem("language", newLang);
    await i18n.changeLanguage(newLang);
  };

  return (
    <View>
      <View style={styles.getStartedContainer}>
        <Text style={styles.getStartedText}>{t("home.welcome")}</Text>

        {/* Language Toggle Button */}
        <Pressable
          onPress={toggleLanguage}
          style={({ pressed }) => [
            styles.languageButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>
            {i18n.language === "it-IT" ? "🇬🇧 English" : "🇮🇹 Italiano"}
          </Text>
        </Pressable>

        <Text
          className="text-red-500"
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)"
        >
          {t('editScreen.codePrompt')}
        </Text>

        <View
          style={[styles.codeHighlightContainer, styles.homeScreenFilename]}
          darkColor="rgba(255,255,255,0.05)"
          lightColor="rgba(0,0,0,0.05)"
        >
          <P>{path}</P>
        </View>

        <Text
          style={styles.getStartedText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)"
        >
          {t('editScreen.changePrompt')}
        </Text>
      </View>

      <View style={styles.helpContainer}>
        <ExternalLink
          style={styles.helpLink}
          href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet"
        >
          <Text style={styles.helpLinkText} lightColor={"#0A7EA4"}>
            {t('editScreen.troubleshoot')}
          </Text>
        </ExternalLink>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
  },
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    alignItems: "center",
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    textAlign: "center",
  },
  languageButton: {
    backgroundColor: "#0A7EA4",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

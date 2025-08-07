import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import translationEn from "./locales/en-US/translation.json";
import translationIt from "./locales/it-IT/translation.json";

/**
 * Add new languages here
 */
const resources = {
  "en-US": { translation: translationEn },
  "it-IT": { translation: translationIt },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem("language");

  if (!savedLanguage) {
    savedLanguage = Localization.getLocales()[0].languageCode;
  }

  i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources,
    lng: savedLanguage || "it-IT",
    fallbackLng: "it-IT",
    interpolation: {
      escapeValue: false,
    },
  });
};

initI18n();

export default i18n;

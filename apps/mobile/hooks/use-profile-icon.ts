import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const supportedIcons = ["🤩", "😎", "🥳", "😊", "🤔", "🚀"];

const STORAGE_KEY = "user-profile-icon";
const DEFAULT_ICON = supportedIcons[0];

export const useProfileIcon = () => {
  const [icon, setIconState] = useState<string>(DEFAULT_ICON);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadIcon = async () => {
      try {
        const storedIcon = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedIcon && supportedIcons.includes(storedIcon)) {
          setIconState(storedIcon);
        }
      } catch (error) {
        console.error("Failed to load icon from storage", error);
      } finally {
        setIsReady(true);
      }
    };

    loadIcon();
  }, []);

  const setIcon = useCallback(async (newIcon: string) => {
    if (!supportedIcons.includes(newIcon)) {
        console.error("Unsupported icon selected");
        return;
    }
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newIcon);
      setIconState(newIcon);
    } catch (error) {
      console.error("Failed to save icon to storage", error);
    }
  }, []);

  return { icon, setIcon, supportedIcons, isIconReady: isReady };
};

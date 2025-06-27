import { StyleSheet, View, ScrollView } from "react-native";

import { TouchableOpacity } from "react-native-gesture-handler";
import { useSuperwall } from "@/components/useSuperwall";
import { useSupabase } from "@/context/supabase-provider";
import { SUPERWALL_TRIGGERS } from "@/config/superwall";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";

export default function FinalScreen() {
  const { showPaywall } = useSuperwall();
  const { setIsOnboarded } = useSupabase();
  const { t } = useTranslation();

  const handleGetStarted = async () => {
    try {
      await showPaywall(SUPERWALL_TRIGGERS.ONBOARDING);
      setIsOnboarded(true);
    } catch (error) {
      console.error("Failed to show paywall:", error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Ionicons name="rocket-outline" size={48} color="#0A7EA4" />
            <Text style={styles.title}>{t('onboarding.final.title')}</Text>
            <Text style={styles.description}>
              {t('onboarding.final.description')}
            </Text>
          </View>

          <View style={styles.benefits}>
            <Benefit icon="rocket-outline" text={t('onboarding.final.benefits.launchFaster')} />
            <Benefit icon="flower-outline" text={t('onboarding.final.benefits.professionalDesign')} />
            <Benefit icon="cash-outline" text={t('onboarding.final.benefits.readyMonetization')} />
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>{t('onboarding.final.getStarted')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

function Benefit({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.benefitContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color="#0A7EA4" />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 32,
  },
  header: {
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 32,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    fontSize: 18,
    lineHeight: 28,
    opacity: 0.7,
  },
  benefits: {
    gap: 16,
    paddingBottom: 24,
  },
  benefitContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#0A7EA410",
    padding: 16,
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0A7EA420",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 17,
  },
  button: {
    backgroundColor: "#0A7EA4",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});

import { StyleSheet, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";

export default function SolutionScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleNext = () => {
    router.push("/(onboarding)/features");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Ionicons name="link-outline" size={48} color="#0A7EA4" />
            <Text style={styles.title}>{t('onboarding.solution.title')}</Text>
          </View>

          <View style={styles.mainFeature}>
            <Text style={styles.mainTitle}>{t('onboarding.solution.coreValue')}</Text>
            <Text style={styles.mainDescription}>
              {t('onboarding.solution.description')}
            </Text>
          </View>

          <View style={styles.benefits}>
            <View style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={24} color="#0A7EA4" />
              <Text style={styles.benefitText}>
                {t('onboarding.solution.benefits.keyBenefit')}
              </Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={24} color="#0A7EA4" />
              <Text style={styles.benefitText}>
                {t('onboarding.solution.benefits.advantage')}
              </Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={24} color="#0A7EA4" />
              <Text style={styles.benefitText}>
                {t('onboarding.solution.benefits.compellingReason')}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>{t('onboarding.solution.showMeHow')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
    paddingBottom: 16,
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 32,
    textAlign: "center",
  },
  mainFeature: {
    backgroundColor: "#0A7EA410",
    padding: 24,
    borderRadius: 20,
    gap: 8,
  },
  mainTitle: {
    fontSize: 22,
    textAlign: "center",
  },
  mainDescription: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 22,
  },
  benefits: {
    gap: 12,
  },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0A7EA408",
    padding: 16,
    borderRadius: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  button: {
    backgroundColor: "#0A7EA4",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});

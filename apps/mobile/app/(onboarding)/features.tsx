import { StyleSheet, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text } from "@/components/ui/text";

export default function FeaturesScreen() {
  const router = useRouter();

  const handleNext = () => {
    router.push("/(onboarding)/final");
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
            <Ionicons name="checkmark-circle" size={48} color="#0A7EA4" />
            <Text style={styles.title}>Ready to Use</Text>
          </View>

          <View style={styles.features}>
            <Feature
              icon="cart-sharp"
              title="In-App Purchases"
              description="Superwall integration for subscriptions and one-time purchases"
            />
            <Feature
              icon="navigate"
              title="Modern Navigation"
              description="File-based routing with Expo Router for a great UX"
            />
            <Feature
              icon="sunny"
              title="Theming System"
              description="Beautiful dark and light mode support out of the box"
            />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Almost There</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color="#0A7EA4" />
        </View>
        <View style={styles.featureText}>
          <Text style={styles.featureTitle}>{title}</Text>
          {title}
          <Text style={styles.featureDescription}>{description}</Text>
        </View>
      </View>
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
  features: {
    gap: 16,
  },
  feature: {
    backgroundColor: "#0A7EA410",
    padding: 16,
    borderRadius: 12,
  },
  featureHeader: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0A7EA420",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 17,
  },
  featureDescription: {
    fontSize: 15,
    opacity: 0.7,
    lineHeight: 20,
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

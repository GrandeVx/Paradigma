import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleNext = () => {
    router.push("/(onboarding)/problem");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.main}>
            <Text style={styles.title}>Paradigma</Text>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>
                A short, compelling tagline that captures your app's value
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Get Started</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingVertical: 24,
  },
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  title: {
    fontSize: 36,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  subtitleContainer: {
    paddingHorizontal: 32,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 24,
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

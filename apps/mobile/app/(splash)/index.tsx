import React from "react";
import { StyleSheet, View, ActivityIndicator, Image } from "react-native";
import { Text } from "@/components/ui/text";
import { useSupabase } from "@/context/supabase-provider";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplashScreen() {
  const { isLoading } = useSupabase();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo or App Icon - replace with your actual logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Text style={styles.logoText}>P</Text>
          </View>
        </View>

        <Text style={styles.title}>Paradigma</Text>
        <Text style={styles.subtitle}>Starting your experience...</Text>

        <ActivityIndicator
          size="large"
          color="#0A7EA4"
          style={styles.loader}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: "#0A7EA4",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 60,
    fontWeight: "bold",
    color: "white",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 32,
    textAlign: "center",
  },
  loader: {
    marginTop: 20,
  },
}); 
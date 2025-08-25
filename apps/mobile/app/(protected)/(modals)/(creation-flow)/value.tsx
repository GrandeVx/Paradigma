import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import HeaderContainer from "@/components/layouts/_header";

export default function ValueScreen() {
  const { t } = useTranslation();

  return (
    <HeaderContainer variant="secondary" customTitle="Creation Flow - Value">
      <View style={styles.container}>
        <Text style={styles.title}>
          Creation Flow - Value
        </Text>
        <Text style={styles.subtitle}>
          Set amount or value
        </Text>
        <Text style={styles.description}>
          This is a template screen for the creation flow value step.
        </Text>
      </View>
    </HeaderContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 24,
  },
});
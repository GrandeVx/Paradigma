import React from 'react';
import { Stack } from 'expo-router';

export default function CategoryTransactionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="[categoryId]" />
    </Stack>
  );
} 
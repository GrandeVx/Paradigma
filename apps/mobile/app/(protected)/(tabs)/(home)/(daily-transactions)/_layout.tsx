import React from 'react';
import { Stack } from 'expo-router';

export default function DailyTransactionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="[date]" />
    </Stack>
  );
} 
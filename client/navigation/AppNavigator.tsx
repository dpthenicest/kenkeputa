// navigation/AppNavigator.tsx
import React from "react";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthContext } from "../context/AuthContext";

export default function AppNavigator() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      {/* Always show tabs — Products are public, Cart & Orders will protect themselves */}
      {/* Auth routes */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}

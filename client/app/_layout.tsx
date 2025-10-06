// app/_layout.tsx (RootLayout)
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { ThemeProvider } from "../context/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import AppNavigator from "../navigation/AppNavigator";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

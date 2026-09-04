import { Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { colors } from "@/theme";
import { navTheme } from "@/theme/navigation";
import { SplashScreenView } from "@/components/ui/AppSplash";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (!initializing) {
      // Small delay so the branded splash is visible and the transition feels deliberate
      const t = setTimeout(() => {
        void SplashScreen.hideAsync().catch(() => {});
      }, 900);
      return () => clearTimeout(t);
    } else {
      // Hide native splash as soon as JS takes over, we show the JS splash instead
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [initializing]);

  if (initializing) {
    // Branded splash while we restore the persisted session — logo + app-name + heart line
    return <SplashScreenView />;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="add-milk"
            options={{ presentation: "card", gestureEnabled: false }}
          />
          <Stack.Screen
            name="edit-milk/[id]"
            options={{ presentation: "card", gestureEnabled: false }}
          />
          <Stack.Screen
            name="update-profile"
            options={{ presentation: "card", gestureEnabled: true }}
          />
        </Stack.Protected>

        <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      {/* Vercel Web Analytics - only injected on web, no-op on native */}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={navTheme}>
        <AuthProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 40,
  },
});

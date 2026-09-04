import { Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { Text } from "@/components/ui/Text";
import { colors } from "@/theme";
import { navTheme } from "@/theme/navigation";
import { Analytics } from "@vercel/analytics/next";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (!initializing) void SplashScreen.hideAsync();
  }, [initializing]);

  if (initializing) {
    // Keep the native splash visible until the persisted session is restored,
    // so a signed-in user never sees the login screen flash.
    return (
      <View style={styles.loading} testID="auth-restoring">
        <Text variant="small" color={colors.textMuted} center>
          Getting ready...
        </Text>
      </View>
    );
  }

  return (
    <Analytics>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "fade",
        }}
      >
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
    </Analytics>
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

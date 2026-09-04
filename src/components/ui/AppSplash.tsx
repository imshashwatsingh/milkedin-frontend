import { useEffect, useRef } from "react";
import { Animated, Image, Platform, StyleSheet, View } from "react-native";

import { colors, radii } from "@/theme";

import { Text } from "./Text";

interface AppSplashProps {
  visible: boolean;
}

export function AppSplash({ visible }: AppSplashProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 260, friction: 20 }),
      ]).start();
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 320, useNativeDriver: true }).start();
    }
  }, [visible, opacity, scale]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.center}>
        <Animated.View style={[styles.logoWrap, { transform: [{ scale }] }]}>
          <Image
            source={require("../../../assets/images/logo-glow.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="milkedIn logo"
          />
        </Animated.View>
        <Text variant="huge" style={styles.appName}>
          milkedIn
        </Text>
        <Text variant="body" color={colors.textMuted} style={styles.tagline}>
          daily milk tracker
        </Text>
      </View>

      <View style={styles.bottom}>
        <Text variant="small" color={colors.textMuted} center>
          Developed with <Text style={styles.heart}>♥</Text> by Shashwat Singh for Meenakshi
        </Text>
        <Text variant="small" color={colors.textSoft} center style={styles.bottomSub}>
          {Platform.OS === "web" ? "milkdin • v1.0" : "v1.0 • milkdin"}
        </Text>
      </View>
    </Animated.View>
  );
}

export function SplashScreenView() {
  // Static version for use while auth is initializing (no animation loop)
  return (
    <View style={styles.container} testID="app-splash">
      <View style={styles.center}>
        <View style={styles.logoWrap}>
          <Image
            source={require("../../../assets/images/logo-glow.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="milkedIn logo"
          />
        </View>
        <Text variant="huge" style={styles.appName}>
          milkedIn
        </Text>
        <Text variant="body" color={colors.textMuted} style={styles.tagline}>
          daily milk tracker
        </Text>
      </View>
      <View style={styles.bottom}>
        <Text variant="small" color={colors.textMuted} center>
          Developed with <Text style={styles.heart}>♥</Text> by Shashwat Singh for Meenakshi
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    // ensure full screen on web
    ...(Platform.OS === "web" ? ({ minHeight: "100vh" as any, width: "100%" } as any) : {}),
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 40,
  },
  logoWrap: {
    width: 140,
    height: 140,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    // soft shadow
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 28,
  },
  appName: {
    color: colors.primary,
    textAlign: "center",
    letterSpacing: -0.8,
    fontSize: 38,
    lineHeight: 42,
  },
  tagline: {
    textAlign: "center",
    marginTop: -4,
  },
  bottom: {
    paddingBottom: 40,
    paddingTop: 20,
    gap: 6,
    alignItems: "center",
  },
  heart: {
    color: colors.danger,
    fontSize: 16,
    lineHeight: 20,
  },
  bottomSub: {
    opacity: 0.8,
  },
});

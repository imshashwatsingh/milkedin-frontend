import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { Image, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { colors, radii, spacing } from "@/theme";

export default function LandingScreen() {
  const { user, initializing } = useAuth();
  const router = useRouter();

  if (initializing) return null;
  if (user) return <Redirect href="/(tabs)" />;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/images/logo-glow.png")}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="milkedIn logo"
            />
          </View>
          <Text variant="huge" style={styles.brand}>
            milkedIn
          </Text>
          <Text variant="bodyStrong" style={styles.tagline}>
            Your milk, perfectly tracked.
          </Text>
          <Text variant="body" color={colors.textMuted} center style={styles.description}>
            Log daily milk in seconds. Watch spending, trends & streaks at a glance. Ask AI anything — grounded in your own data.
          </Text>

          <View style={styles.cta}>
            <Button
              label="Get Started — It's free"
              onPress={() => router.push("/(auth)/register")}
            />
            <Button
              label="I already have an account"
              variant="outline"
              onPress={() => router.push("/(auth)/login")}
            />
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <Card style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="water" size={20} color={colors.primary} />
            </View>
            <Text variant="bodyStrong" center>
              Log in seconds
            </Text>
            <Text variant="small" color={colors.textMuted} center>
              Quantity, price & date — with live total.
            </Text>
          </Card>
          <Card style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: colors.successSoft }]}>
              <Ionicons name="stats-chart" size={20} color={colors.success} />
            </View>
            <Text variant="bodyStrong" center>
              See your trends
            </Text>
            <Text variant="small" color={colors.textMuted} center>
              Daily, monthly & yearly insights.
            </Text>
          </Card>
          <Card style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="sparkles" size={20} color={colors.accent} />
            </View>
            <Text variant="bodyStrong" center>
              Ask AI
            </Text>
            <Text variant="small" color={colors.textMuted} center>
              Natural language, grounded in your logs.
            </Text>
          </Card>
        </View>

        {/* Story / trust */}
        <Card variant="warm" style={styles.storyCard}>
          <View style={styles.storyRow}>
            <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
            <Text variant="small" color={colors.textMuted} style={styles.storyText}>
              Private by design • Your data stays yours • No ads, no tracking
            </Text>
          </View>
        </Card>

        {/* Footer — developer & dedication */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text variant="small" color={colors.textMuted} center>
            Developed with <Text style={styles.heart}>♥</Text> by Shashwat Singh for Meenakshi
          </Text>
          <Text variant="small" color={colors.textSoft} center>
            Crafted for the love of a perfectly managed kitchen.
          </Text>
          <Text variant="small" color={colors.textSoft} center style={styles.copy}>
            © {new Date().getFullYear()} milkedIn • milkdin
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === "web" ? spacing.xxl : spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  hero: {
    alignItems: "center",
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  logoWrap: {
    width: 112,
    height: 112,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 22,
  },
  brand: {
    color: colors.primary,
    textAlign: "center",
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  tagline: {
    textAlign: "center",
    color: colors.text,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  description: {
    textAlign: "center",
    maxWidth: 520,
    marginTop: 2,
  },
  cta: {
    width: "100%",
    gap: spacing.md,
    marginTop: spacing.md,
    maxWidth: 420,
    alignSelf: "center",
  },
  features: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  featureCard: {
    flex: 1,
    minWidth: 160,
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  storyCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  storyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  storyText: {
    flexShrink: 1,
    textAlign: "center",
  },
  footer: {
    gap: spacing.xs,
    alignItems: "center",
    paddingTop: spacing.md,
  },
  footerDivider: {
    height: 1,
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.surfaceBorder,
    marginBottom: spacing.sm,
    opacity: 0.8,
  },
  heart: {
    color: colors.danger,
    fontSize: 14,
  },
  copy: {
    marginTop: 4,
    opacity: 0.9,
  },
});

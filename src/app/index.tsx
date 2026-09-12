import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, radii, shadows, spacing } from "@/theme";

export default function LandingScreen() {
  const { user, initializing } = useAuth();
  const router = useRouter();
  const { isDesktop, isWeb } = useResponsive();

  if (initializing) return null;
  if (user) return <Redirect href="/(tabs)" />;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Web top nav ── */}
        {isWeb ? (
          <View style={[styles.nav, isDesktop && styles.navDesktop]}>
            <View style={styles.navLeft}>
              <View style={styles.navLogoWrap}>
                <Image
                  source={require("../../assets/images/icon.png")}
                  style={styles.navLogo}
                  resizeMode="contain"
                />
              </View>
              <Text variant="bodyStrong" style={styles.navBrand}>
                milkedIn
              </Text>
              <View style={styles.navBadge}>
                <Text variant="small" style={styles.navBadgeText}>
                  milkdin
                </Text>
              </View>
            </View>

            {isDesktop ? (
              <View style={styles.navLinks}>
                <Text variant="small" color={colors.textMuted} style={styles.navLink}>
                  Features
                </Text>
                <Text variant="small" color={colors.textMuted} style={styles.navLink}>
                  How it works
                </Text>
                <Text variant="small" color={colors.textMuted} style={styles.navLink}>
                  AI Assistant
                </Text>
              </View>
            ) : null}

            <View style={styles.navActions}>
              <Pressable
                onPress={() => router.push("/(auth)/login")}
                style={styles.navGhost}
              >
                <Text variant="small" style={styles.navGhostLabel}>
                  Sign in
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/(auth)/register")}
                style={styles.navCta}
              >
                <Text variant="small" style={styles.navCtaLabel}>
                  Get started
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* ── Hero ── */}
        <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
          {/* Left copy */}
          <View style={[styles.heroLeft, isDesktop && styles.heroLeftDesktop]}>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text variant="small" style={styles.eyebrowText}>
                Trusted by families who never miss a litre
              </Text>
            </View>

            <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
              Your milk,{"\n"}
              <Text style={styles.heroAccent}>perfectly tracked.</Text>
            </Text>

            <Text variant="body" color={colors.textMuted} style={styles.heroSubtitle}>
              Log daily milk in seconds. Watch spending, trends and streaks at a glance.
              Ask <Text style={styles.inlineStrong}>MilkEdin AI</Text> anything — grounded in your own data, not guesswork.
            </Text>

            <View style={[styles.ctaRow, isDesktop && styles.ctaRowDesktop]}>
              <View style={styles.ctaPrimary}>
                <Button
                  label="Get started — It's free"
                  onPress={() => router.push("/(auth)/register")}
                />
              </View>
              <View style={styles.ctaSecondary}>
                <Button
                  label="I already have an account"
                  variant="outline"
                  onPress={() => router.push("/(auth)/login")}
                />
              </View>
            </View>

            <View style={styles.trustRow}>
              <View style={styles.trustAvatars}>
                <View style={[styles.avatar, { backgroundColor: "#D8E6FF", zIndex: 3 }]}>
                  <Ionicons name="person" size={12} color={colors.primary} />
                </View>
                <View style={[styles.avatar, { backgroundColor: "#FFE8C2", zIndex: 2, marginLeft: -8 }]}>
                  <Ionicons name="person" size={12} color={colors.accent} />
                </View>
                <View style={[styles.avatar, { backgroundColor: "#D1F0DE", zIndex: 1, marginLeft: -8 }]}>
                  <Ionicons name="person" size={12} color={colors.success} />
                </View>
              </View>
              <View style={styles.trustText}>
                <View style={styles.starsRow}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Ionicons key={i} name="star" size={12} color={colors.accent} />
                  ))}
                  <Text variant="small" style={styles.trustLabel}>
                    Loved by early users
                  </Text>
                </View>
                <Text variant="small" color={colors.textSoft}>
                  Private by design • No ads • No tracking
                </Text>
              </View>
            </View>
          </View>

          {/* Right visual — phone / dashboard mock */}
          <View style={[styles.heroRight, isDesktop && styles.heroRightDesktop]}>
            <View style={styles.phoneFrame}>
              {/* decorative blobs */}
              <View style={styles.blobA} />
              <View style={styles.blobB} />

              {/* mock header inside phone */}
              <View style={styles.phoneHeader}>
                <View style={styles.phoneNotch} />
                <View style={styles.phoneHeaderRow}>
                  <View>
                    <Text variant="small" style={styles.phoneEyebrow}>
                      Today • 12 May
                    </Text>
                    <Text variant="bodyStrong" style={styles.phoneTitle}>
                      1.5 L • ₹93
                    </Text>
                  </View>
                  <View style={styles.phonePill}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text variant="small" style={styles.phonePillText}>
                      Logged
                    </Text>
                  </View>
                </View>
              </View>

              {/* mini calendar heat */}
              <View style={styles.miniCalendar}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                  <View key={d + "h"} style={styles.miniCalHead}>
                    <Text variant="small" color={colors.textSoft} style={styles.miniCalHeadText}>
                      {d}
                    </Text>
                  </View>
                ))}
                {Array.from({ length: 21 }).map((_, i) => {
                  const intensity =
                    i === 10 ? "#2D6CDF" : i % 5 === 0 ? "#A9C2FD" : i % 3 === 0 ? "#D8E6FF" : "#EAF1FE";
                  return <View key={i} style={[styles.miniDay, { backgroundColor: intensity }]} />;
                })}
              </View>

              {/* breakdown card */}
              <View style={styles.phoneCard}>
                <View style={styles.phoneCardRow}>
                  <View style={styles.phoneCardIcon}>
                    <Ionicons name="water" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.phoneCardText}>
                    <Text variant="small" style={styles.phoneCardLabel}>
                      Full Cream • 1.0 L
                    </Text>
                    <Text variant="small" color={colors.textMuted}>
                      ₹62 / L
                    </Text>
                  </View>
                  <Text variant="bodyStrong" style={styles.phoneCardValue}>
                    ₹62
                  </Text>
                </View>
                <View style={styles.phoneCardRow}>
                  <View style={[styles.phoneCardIcon, { backgroundColor: colors.accentSoft }]}>
                    <Ionicons name="water-outline" size={16} color={colors.accent} />
                  </View>
                  <View style={styles.phoneCardText}>
                    <Text variant="small" style={styles.phoneCardLabel}>
                      Toned • 0.5 L
                    </Text>
                    <Text variant="small" color={colors.textMuted}>
                      ₹62 / L
                    </Text>
                  </View>
                  <Text variant="bodyStrong" style={styles.phoneCardValue}>
                    ₹31
                  </Text>
                </View>
              </View>

              {/* floating AI bubble */}
              <View style={styles.aiBubble}>
                <View style={styles.aiBubbleIcon}>
                  <Ionicons name="sparkles" size={14} color={colors.onPrimary} />
                </View>
                <View style={styles.aiBubbleText}>
                  <Text variant="small" style={styles.aiBubbleLabel}>
                    MilkEdin AI
                  </Text>
                  <Text variant="small" color={colors.textMuted} numberOfLines={2}>
                    You spent ₹2,340 this month — 12% more than April.
                  </Text>
                </View>
              </View>
            </View>

            {/* side stat */}
            <View style={styles.sideStat}>
              <Ionicons name="trending-up" size={16} color={colors.success} />
              <Text variant="small" style={styles.sideStatText}>
                <Text style={styles.sideStatStrong}>+18 day</Text> streak • Best: 2.5 L
              </Text>
            </View>
          </View>
        </View>

        {/* ── Social / proof strip ── */}
        <View style={[styles.strip, isDesktop && styles.stripDesktop]}>
          <View style={styles.stripItem}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
            <Text variant="small" color={colors.textMuted}>
              Your data stays yours
            </Text>
          </View>
          <View style={styles.stripDot} />
          <View style={styles.stripItem}>
            <Ionicons name="lock-closed" size={16} color={colors.primary} />
            <Text variant="small" color={colors.textMuted}>
              Encrypted & private
            </Text>
          </View>
          <View style={styles.stripDot} />
          <View style={styles.stripItem}>
            <Ionicons name="phone-portrait" size={16} color={colors.primary} />
            <Text variant="small" color={colors.textMuted}>
              Android • iOS • Web
            </Text>
          </View>
        </View>

        {/* ── Features ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="sectionTitle" center>
              Everything you need, nothing you don&apos;t
            </Text>
            <Text variant="body" color={colors.textMuted} center style={styles.sectionSub}>
              Built for Indian kitchens — fast to log, delightful to review, and honest about money.
            </Text>
          </View>

          <View style={[styles.features, isDesktop && styles.featuresDesktop]}>
            <Card style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="water" size={20} color={colors.primary} />
              </View>
              <Text variant="bodyStrong" center>
                Log in seconds
              </Text>
              <Text variant="small" color={colors.textMuted} center>
                Quantity, price and date with live total. Price snapshot preserved for history.
              </Text>
            </Card>
            <Card style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: colors.successSoft }]}>
                <Ionicons name="stats-chart" size={20} color={colors.success} />
              </View>
              <Text variant="bodyStrong" center>
                Trends that make sense
              </Text>
              <Text variant="small" color={colors.textMuted} center>
                Daily, monthly and yearly insights with streaks, averages and best days.
              </Text>
            </Card>
            <Card style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="calendar" size={20} color={colors.accent} />
              </View>
              <Text variant="bodyStrong" center>
                Heatmap calendar
              </Text>
              <Text variant="small" color={colors.textMuted} center>
                Spot gaps and peaks at a glance. Tap any day to view and edit.
              </Text>
            </Card>
            <Card style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#EDE7FF" }]}>
                <Ionicons name="sparkles" size={20} color="#6B5BFF" />
              </View>
              <Text variant="bodyStrong" center>
                MilkEdin AI
              </Text>
              <Text variant="small" color={colors.textMuted} center>
                Ask in plain English — spending, trends and categories grounded in your logs.
              </Text>
            </Card>
            <Card style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: "#FFE9E8" }]}>
                <Ionicons name="document-text" size={20} color={colors.danger} />
              </View>
              <Text variant="bodyStrong" center>
                Export anywhere
              </Text>
              <Text variant="small" color={colors.textMuted} center>
                One-tap PDF and Excel with Indian formatting for sharing or records.
              </Text>
            </Card>
            <Card style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="pricetags" size={20} color={colors.primary} />
              </View>
              <Text variant="bodyStrong" center>
                Milk & price control
              </Text>
              <Text variant="small" color={colors.textMuted} center>
                Manage categories and per-litre rates. History never rewrites past bills.
              </Text>
            </Card>
          </View>
        </View>

        {/* ── How it works ── */}
        <View style={[styles.howItWorks, isDesktop && styles.howItWorksDesktop]}>
          <View style={styles.howHead}>
            <Text variant="sectionTitle">How it works</Text>
            <Text variant="body" color={colors.textMuted}>
              Three steps to a perfectly managed kitchen.
            </Text>
          </View>
          <View style={[styles.steps, isDesktop && styles.stepsDesktop]}>
            <View style={styles.step}>
              <View style={styles.stepNum}>
                <Text variant="bodyStrong" style={styles.stepNumText}>
                  1
                </Text>
              </View>
              <Text variant="bodyStrong">Create your milks</Text>
              <Text variant="small" color={colors.textMuted} center>
                Add Full Cream, Toned, etc. with current per-litre price.
              </Text>
            </View>
            <View style={styles.stepArrow}>
              <Ionicons name="arrow-forward" size={16} color={colors.textSoft} />
            </View>
            <View style={styles.step}>
              <View style={[styles.stepNum, { backgroundColor: colors.success }]}>
                <Text variant="bodyStrong" style={styles.stepNumText}>
                  2
                </Text>
              </View>
              <Text variant="bodyStrong">Log each day</Text>
              <Text variant="small" color={colors.textMuted} center>
                Takes 5 seconds. Edit any day from the calendar.
              </Text>
            </View>
            <View style={styles.stepArrow}>
              <Ionicons name="arrow-forward" size={16} color={colors.textSoft} />
            </View>
            <View style={styles.step}>
              <View style={[styles.stepNum, { backgroundColor: colors.accent }]}>
                <Text variant="bodyStrong" style={styles.stepNumText}>
                  3
                </Text>
              </View>
              <Text variant="bodyStrong">Understand & share</Text>
              <Text variant="small" color={colors.textMuted} center>
                See insights, ask AI, export a bill for your family.
              </Text>
            </View>
          </View>
        </View>

        {/* ── AI showcase ── */}
        <Card variant="warm" style={[styles.aiCard, isDesktop && styles.aiCardDesktop]}>
          <View style={styles.aiCardLeft}>
            <View style={styles.aiPill}>
              <Ionicons name="sparkles" size={12} color={colors.primary} />
              <Text variant="small" style={styles.aiPillText}>
                MilkEdin AI • Powered by Gemini
              </Text>
            </View>
            <Text variant="sectionTitle">Ask anything. Get answers from your data.</Text>
            <Text variant="body" color={colors.textMuted}>
              No generic advice. Every answer is computed from your logs — spending, averages, highest month and category breakdowns.
            </Text>
            <View style={styles.aiChips}>
              <View style={styles.aiChip}>
                <Text variant="small" style={styles.aiChipText}>
                  “How much last month?”
                </Text>
              </View>
              <View style={styles.aiChip}>
                <Text variant="small" style={styles.aiChipText}>
                  “Am I spending more than usual?”
                </Text>
              </View>
              <View style={styles.aiChip}>
                <Text variant="small" style={styles.aiChipText}>
                  “Which milk do I use most?”
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.aiCardRight}>
            <View style={styles.chatMock}>
              <View style={styles.chatUser}>
                <Text variant="small" style={styles.chatUserText}>
                  Show my spending trend
                </Text>
              </View>
              <View style={styles.chatAssistant}>
                <View style={styles.chatAssistantIcon}>
                  <Ionicons name="sparkles" size={10} color={colors.onPrimary} />
                </View>
                <View style={styles.chatAssistantBubble}>
                  <Text variant="small" color={colors.textMuted}>
                    You spent <Text style={styles.chatBold}>₹1,860</Text> in April and{" "}
                    <Text style={styles.chatBold}>₹2,120</Text> in May. Up 13.9% — mostly Full Cream.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* ── Final CTA ── */}
        <View style={[styles.finalCta, isDesktop && styles.finalCtaDesktop]}>
          <View style={styles.finalCtaText}>
            <Text variant="sectionTitle" style={styles.finalCtaTitle}>
              Start tracking today.
            </Text>
            <Text variant="body" color={colors.textMuted}>
              Free to use. Takes less than a minute to set up.
            </Text>
          </View>
          <View style={styles.finalCtaActions}>
            <View style={styles.finalCtaBtn}>
              <Button label="Create your account" onPress={() => router.push("/(auth)/register")} />
            </View>
            <Pressable onPress={() => router.push("/(auth)/login")} style={styles.finalCtaGhost}>
              <Text variant="bodyStrong" style={styles.finalCtaGhostText}>
                Sign in
              </Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <View style={[styles.footerRow, isDesktop && styles.footerRowDesktop]}>
            <View style={styles.footerLeft}>
              <View style={styles.footerBrandRow}>
                <Image
                  source={require("../../assets/images/icon.png")}
                  style={styles.footerLogo}
                />
                <Text variant="bodyStrong" style={styles.footerBrand}>
                  milkedIn
                </Text>
                <Text variant="small" color={colors.textSoft}>
                  • milkdin
                </Text>
              </View>
              <Text variant="small" color={colors.textSoft}>
                Daily milk tracker for Indian households. Private, fast, and kind to your kitchen.
              </Text>
            </View>
            <View style={styles.footerLinks}>
              <Pressable onPress={() => router.push("/(auth)/login")}>
                <Text variant="small" color={colors.textMuted}>
                  Sign in
                </Text>
              </Pressable>
              <Pressable onPress={() => router.push("/(auth)/register")}>
                <Text variant="small" color={colors.textMuted}>
                  Create account
                </Text>
              </Pressable>
              <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
                <Text variant="small" color={colors.textMuted}>
                  Forgot password
                </Text>
              </Pressable>
            </View>
          </View>
          <Text variant="small" color={colors.textMuted} center>
            Developed with <Text style={styles.heart}>♥</Text> by Shashwat Singh for Meenakshi
          </Text>
          <Text variant="small" color={colors.textSoft} center>
            Crafted for the love of a perfectly managed kitchen.
          </Text>
          <Text variant="small" color={colors.textSoft} center style={styles.copy}>
            © {new Date().getFullYear()} milkedIn
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
    maxWidth: 1120,
    width: "100%",
    alignSelf: "center",
  },

  // nav
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    marginBottom: spacing.sm,
  },
  navDesktop: {
    paddingVertical: spacing.lg,
  },
  navLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  navLogoWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  navLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  navBrand: {
    color: colors.primary,
    letterSpacing: -0.5,
  },
  navBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  navBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  navLinks: {
    flexDirection: "row",
    gap: spacing.xl,
    alignItems: "center",
  },
  navLink: {
    fontWeight: "500",
  },
  navActions: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  navGhost: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  navGhostLabel: {
    color: colors.text,
    fontWeight: "700",
  },
  navCta: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    ...shadows.sm,
  },
  navCtaLabel: {
    color: colors.onPrimary,
    fontWeight: "700",
  },

  // hero
  hero: {
    gap: spacing.xl,
    paddingTop: spacing.md,
  },
  heroDesktop: {
    flexDirection: "row",
    gap: spacing.xl,
    alignItems: "center",
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  heroLeft: {
    gap: spacing.md,
    flex: 1,
  },
  heroLeftDesktop: {
    maxWidth: 560,
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    alignSelf: "flex-start",
  },
  eyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  eyebrowText: {
    color: colors.textMuted,
    fontWeight: "600",
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 40,
    lineHeight: 42,
    fontWeight: "800",
    letterSpacing: -1.2,
    color: colors.text,
  },
  heroTitleDesktop: {
    fontSize: 52,
    lineHeight: 54,
  },
  heroAccent: {
    color: colors.primary,
  },
  heroSubtitle: {
    fontSize: 17,
    lineHeight: 26,
    maxWidth: 520,
  },
  inlineStrong: {
    color: colors.text,
    fontWeight: "700",
  },
  ctaRow: {
    gap: spacing.md,
    marginTop: spacing.sm,
    maxWidth: 420,
  },
  ctaRowDesktop: {
    flexDirection: "row",
    maxWidth: 560,
    alignItems: "center",
  },
  ctaPrimary: {
    flex: 1,
    minWidth: 200,
  },
  ctaSecondary: {
    flex: 1,
    minWidth: 200,
  },
  trustRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
    flexWrap: "wrap",
  },
  trustAvatars: {
    flexDirection: "row",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  trustText: {
    gap: 2,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
  },
  trustLabel: {
    color: colors.text,
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 12,
  },

  // hero right
  heroRight: {
    gap: spacing.md,
    alignItems: "center",
  },
  heroRightDesktop: {
    flex: 1,
    alignItems: "center",
  },
  phoneFrame: {
    width: 300,
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.lg,
    overflow: "hidden",
    position: "relative",
  },
  blobA: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primarySoft,
    opacity: 0.9,
  },
  blobB: {
    position: "absolute",
    bottom: 30,
    left: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.accentSoft,
    opacity: 0.7,
  },
  phoneHeader: {
    gap: spacing.sm,
  },
  phoneNotch: {
    width: 80,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceBorder,
    alignSelf: "center",
    opacity: 0.6,
  },
  phoneHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  phoneEyebrow: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  phoneTitle: {
    color: colors.text,
    fontSize: 20,
  },
  phonePill: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: colors.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  phonePillText: {
    color: colors.success,
    fontWeight: "700",
    fontSize: 12,
  },
  miniCalendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingTop: spacing.sm,
  },
  miniCalHead: {
    width: 32,
    alignItems: "center",
  },
  miniCalHeadText: {
    fontSize: 10,
    fontWeight: "700",
  },
  miniDay: {
    width: 32,
    height: 28,
    borderRadius: 8,
  },
  phoneCard: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  phoneCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  phoneCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  phoneCardText: {
    flex: 1,
  },
  phoneCardLabel: {
    color: colors.text,
    fontWeight: "700",
  },
  phoneCardValue: {
    color: colors.text,
  },
  aiBubble: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.sm,
    marginTop: spacing.xs,
  },
  aiBubbleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  aiBubbleText: {
    flex: 1,
    gap: 2,
  },
  aiBubbleLabel: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  sideStat: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.sm,
  },
  sideStatText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  sideStatStrong: {
    color: colors.text,
    fontWeight: "700",
  },

  // strip
  strip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  stripDesktop: {
    justifyContent: "space-around",
    paddingVertical: spacing.lg,
  },
  stripItem: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  stripDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceBorder,
  },

  // section
  section: {
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionHead: {
    gap: spacing.sm,
    alignItems: "center",
    maxWidth: 640,
    alignSelf: "center",
  },
  sectionSub: {
    textAlign: "center",
  },
  features: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  featuresDesktop: {
    gap: spacing.lg,
  },
  featureCard: {
    flex: 1,
    minWidth: 160,
    maxWidth: 360,
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

  // how it works
  howItWorks: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  howItWorksDesktop: {
    padding: spacing.xxl,
  },
  howHead: {
    gap: spacing.xs,
    alignItems: "center",
  },
  steps: {
    gap: spacing.lg,
    alignItems: "center",
  },
  stepsDesktop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  step: {
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
    maxWidth: 280,
  },
  stepNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: {
    color: colors.onPrimary,
  },
  stepArrow: {
    paddingVertical: spacing.sm,
    ...(Platform.OS === "web" ? ({ transform: "rotate(0deg)" } as any) : {}),
  },

  // AI card
  aiCard: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  aiCardDesktop: {
    flexDirection: "row",
    gap: spacing.xl,
    padding: spacing.xxl,
    alignItems: "center",
  },
  aiCardLeft: {
    flex: 1,
    gap: spacing.md,
  },
  aiPill: {
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    alignSelf: "flex-start",
  },
  aiPillText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 11,
  },
  aiChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  aiChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  aiChipText: {
    color: colors.textMuted,
    fontWeight: "600",
    fontSize: 12,
  },
  aiCardRight: {
    flex: 1,
    maxWidth: 380,
    width: "100%",
  },
  chatMock: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.md,
  },
  chatUser: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    alignSelf: "flex-end",
    maxWidth: "85%",
  },
  chatUserText: {
    color: colors.onPrimary,
    fontWeight: "600",
  },
  chatAssistant: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  chatAssistantIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  chatAssistantBubble: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  chatBold: {
    color: colors.primary,
    fontWeight: "700",
  },

  // final CTA
  finalCta: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
  },
  finalCtaDesktop: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.xxl,
  },
  finalCtaText: {
    gap: spacing.xs,
    flex: 1,
  },
  finalCtaTitle: {
    color: colors.text,
  },
  finalCtaActions: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    flexWrap: "wrap",
  },
  finalCtaBtn: {
    minWidth: 200,
  },
  finalCtaGhost: {
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  finalCtaGhostText: {
    color: colors.primary,
  },

  // footer
  footer: {
    gap: spacing.xs,
    alignItems: "center",
    paddingTop: spacing.md,
  },
  footerDivider: {
    height: 1,
    width: "100%",
    maxWidth: 720,
    backgroundColor: colors.surfaceBorder,
    marginBottom: spacing.md,
    opacity: 0.8,
  },
  footerRow: {
    gap: spacing.lg,
    width: "100%",
    alignItems: "center",
  },
  footerRowDesktop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    textAlign: "left",
  },
  footerLeft: {
    gap: spacing.xs,
    flex: 1,
    alignItems: "center",
  },
  footerBrandRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  footerLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  footerBrand: {
    color: colors.primary,
  },
  footerLinks: {
    flexDirection: "row",
    gap: spacing.lg,
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

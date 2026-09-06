import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useResponsive } from '@/hooks/useResponsive';
import { colors, layout, spacing } from '@/theme';

import { Text } from './Text';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  /** Applied to the outer content container (not the scroll view). */
  contentStyle?: ViewStyle;
  /** Applied to the scrollable content wrapper. */
  scrollStyle?: ViewStyle;
  /** Max width variant: default centers at 1120px, narrow at 720px, wide at 1280px, or custom number */
  maxWidth?: 'default' | 'narrow' | 'wide' | 'full' | number;
  centered?: boolean;
  children: React.ReactNode;
}

/**
 * Standard app screen: white background, optional title header, and either a
 * constrained view or scroll view for the content.
 *
 * Wrapped in SafeAreaView (so it respects notches and the Android system/
 * navigation bar) and KeyboardAvoidingView (so focused inputs are revealed
 * when the soft keyboard opens).
 */
export function Screen({
  title,
  subtitle,
  scroll = true,
  contentStyle,
  scrollStyle,
  maxWidth = 'default',
  centered = true,
  children,
}: ScreenProps) {
  const { isDesktop, isWeb } = useResponsive();

  const resolvedMaxWidth =
    maxWidth === 'full'
      ? undefined
      : typeof maxWidth === 'number'
        ? maxWidth
        : maxWidth === 'narrow'
          ? layout.maxWidthNarrow
          : maxWidth === 'wide'
            ? layout.maxWidthWide
            : layout.maxWidth;

  const horizontalPadding = isDesktop ? layout.contentPaddingDesktop : spacing.xl;

  const header =
    title || subtitle ? (
      <View style={styles.header} accessible accessibilityRole="header">
        {title ? <Text variant="screenTitle">{title}</Text> : null}
        {subtitle ? (
          <Text variant="body" color={colors.textMuted} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    ) : null;

  const innerContent = (
    <View
      style={[
        styles.container,
        isWeb && centered && resolvedMaxWidth
          ? { maxWidth: resolvedMaxWidth, width: '100%', alignSelf: 'center' }
          : null,
        { paddingHorizontal: horizontalPadding },
        contentStyle,
      ]}>
      {header}
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, scrollStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={styles.flex}>{children}</View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={Platform.OS === 'android' ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        {innerContent}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface BackHeaderProps {
  onBack: () => void;
  title: string;
  /** Optional extra spacer width to keep the title centered. */
  rightSlot?: React.ReactNode;
}

export function BackHeader({ onBack, title, rightSlot }: BackHeaderProps) {
  return (
    <View style={styles.backHeader}>
      <Pressable
        onPress={onBack}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        android_ripple={{ color: 'rgba(45,108,223,0.12)', borderless: true }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={styles.backPressable}>
        <Ionicons name="chevron-back" size={32} color={colors.primary} />
      </Pressable>
      <Text variant="sectionTitle" style={styles.backTitle} numberOfLines={1}>
        {title}
      </Text>
      {rightSlot ?? <View style={styles.backSpacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xs,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  backPressable: {
    borderRadius: 16,
    padding: 2,
  },
  backTitle: {
    flex: 1,
    textAlign: 'center',
  },
  backSpacer: {
    width: 32,
  },
});

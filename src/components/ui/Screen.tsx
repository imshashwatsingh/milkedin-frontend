import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

import { Text } from './Text';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  /** Applied to the outer content container (not the scroll view). */
  contentStyle?: ViewStyle;
  /** Applied to the scrollable content wrapper. */
  scrollStyle?: ViewStyle;
  children: React.ReactNode;
}

/**
 * Standard app screen: white background, optional title header, and either a
 * constrained view or scroll view for the content.
 */
export function Screen({ title, subtitle, scroll = true, contentStyle, scrollStyle, children }: ScreenProps) {
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={[styles.container, contentStyle]}>
        {header}
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.scrollContent, scrollStyle]}
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={styles.flex}>{children}</View>
        )}
      </View>
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
      <Ionicons
        name="chevron-back"
        size={32}
        color={colors.primary}
        onPress={onBack}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      />
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
    paddingHorizontal: spacing.xl,
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
  backTitle: {
    flex: 1,
    textAlign: 'center',
  },
  backSpacer: {
    width: 32,
  },
});
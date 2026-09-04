import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';
import { Text } from '@/components/ui/Text';

type NavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  href: string;
  match: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Today',
    icon: 'today-outline',
    iconActive: 'today',
    href: '/(tabs)',
    match: (p) => p === '/' || p === '/(tabs)' || p.endsWith('/(tabs)') || p === '/(tabs)/' || p === '/today' || (p.includes('(tabs)') === false && p === '/'),
  },
  {
    label: 'History',
    icon: 'list-outline',
    iconActive: 'list',
    href: '/(tabs)/history',
    match: (p) => p.includes('/history'),
  },
  {
    label: 'Insights',
    icon: 'stats-chart-outline',
    iconActive: 'stats-chart',
    href: '/(tabs)/insights',
    match: (p) => p.includes('/insights'),
  },
  {
    label: 'AI',
    icon: 'sparkles-outline',
    iconActive: 'sparkles',
    href: '/(tabs)/ai',
    match: (p) => p.includes('/ai'),
  },
  {
    label: 'Milk & Price',
    icon: 'pricetags-outline',
    iconActive: 'pricetags',
    href: '/(tabs)/settings',
    match: (p) => p.includes('/settings'),
  },
];

function isActive(pathname: string, item: NavItem): boolean {
  // Special-case Today: it matches "/" or empty tabs root
  if (item.label === 'Today') {
    return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/' || pathname.endsWith('(tabs)') || pathname === '/index' || pathname === '//';
  }
  return item.match(pathname);
}

export function WebSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.sidebar}>
      <View style={styles.brandWrap}>
        <View style={styles.logoCircle}>
          <Ionicons name="water" size={20} color={colors.onPrimary} />
        </View>
        <View style={styles.brandText}>
          <Text variant="bodyStrong" style={styles.brandTitle}>
            milkedIn
          </Text>
          <Text variant="small" color={colors.textMuted} style={styles.brandTagline}>
            Daily milk tracker
          </Text>
        </View>
      </View>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname ?? '', item);
          return (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
              onPress={() => router.push(item.href as any)}
              style={({ pressed, hovered }: any) => [
                styles.navItem,
                active && styles.navItemActive,
                pressed && styles.navItemPressed,
                hovered && !active && styles.navItemHovered,
              ]}>
              <Ionicons
                name={active ? item.iconActive : item.icon}
                size={20}
                color={active ? colors.onPrimary : colors.textMuted}
              />
              <Text
                variant="bodyStrong"
                color={active ? colors.onPrimary : colors.text}
                style={styles.navLabel}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerCard}>
          <Text variant="caption" color={colors.textMuted} center>
            Tip: Press dates in History to quickly jump between days.
          </Text>
        </View>
        <View>
            <Text variant="caption" color={colors.textMuted} center>
              Developed by Shashwat Singh with ❤️ for Meenakshi
            </Text>
          </View>
          <View/>
        <Text variant="small" color={colors.textSoft} center>
          © {new Date().getFullYear()} milkedIn
        </Text>
      </View>
    </View>
  );
}

const styles: any = StyleSheet.create({
  sidebar: {
    width: 260,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.surfaceBorder,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
    height: '100vh' as any,
    position: 'sticky' as any,
    top: 0,
    flexShrink: 0,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    gap: 2,
  },
  brandTitle: {
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontSize: 12,
    lineHeight: 14,
  },
  nav: {
    gap: spacing.xs,
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: colors.primary,
  },
  navItemPressed: {
    opacity: 0.9,
  },
  navItemHovered: {
    backgroundColor: colors.background,
  },
  navLabel: {
    fontSize: 15,
  },
  footer: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  footerCard: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.md,
  },
});

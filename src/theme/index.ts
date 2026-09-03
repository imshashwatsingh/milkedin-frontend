/**
 * milkedIn design tokens.
 *
 * A calm, warm, white-first palette optimised for readability and large
 * touch targets. Colours are deliberately restrained.
 */

export const colors = {
  // Surfaces — a soft neutral canvas with white, elevated cards on top.
  background: '#F4F6F9',
  surface: '#FFFFFF',
  surfaceBorder: '#E8EBF0',
  surfaceAlt: '#FFF6E9', // soft warm highlight (dairy tint)

  // Text
  text: '#14181F',
  textMuted: '#6A7280',
  textSoft: '#9AA1AD',

  // Brand / actions
  primary: '#2D6CDF',
  primaryPressed: '#1F51B6',
  primarySoft: '#EAF1FE',
  onPrimary: '#FFFFFF',

  // Warm accent (dairy highlight)
  accent: '#E08A1E',
  accentSoft: '#FBEFD9',

  // Semantic
  success: '#1F8A5B',
  successSoft: '#E7F6EE',
  warning: '#B5790A',
  warningSoft: '#FBF0D9',
  danger: '#D6453B',
  dangerSoft: '#FBEAE8',

  tabBar: '#FFFFFF',
  tabBarBorder: '#ECEFF3',

  // Overlays
  overlay: 'rgba(17, 22, 34, 0.5)',
} as const;

/**
 * Layered, soft shadows for an elegant "floating card" feel.
 * `sm` for controls, `md` for cards, `lg` for the floating tab bar.
 */
export const shadows = {
  sm: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 8,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  // Large, high-contrast text with comfortable line spacing.
  screenTitle: { fontSize: 30, lineHeight: 38, fontWeight: '800' as const, letterSpacing: -0.5 },
  sectionTitle: { fontSize: 21, lineHeight: 28, fontWeight: '700' as const, letterSpacing: -0.3 },
  body: { fontSize: 18, lineHeight: 27, fontWeight: '500' as const },
  bodyStrong: { fontSize: 18, lineHeight: 27, fontWeight: '700' as const },
  caption: { fontSize: 16, lineHeight: 23, fontWeight: '500' as const },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  huge: { fontSize: 34, lineHeight: 42, fontWeight: '800' as const, letterSpacing: -0.5 },
} as const;

/**
 * Minimal touch target size. All interactive controls should be at least
 * this tall (and generally much taller in this app).
 */
export const touchTarget = {
  minHeight: 56,
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const layout = {
  maxWidth: 1120,
  maxWidthNarrow: 720,
  maxWidthWide: 1280,
  sidebarWidth: 260,
  contentPaddingMobile: 20,
  contentPaddingDesktop: 32,
} as const;

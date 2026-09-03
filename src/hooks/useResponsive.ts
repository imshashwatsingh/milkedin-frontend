import { Platform, useWindowDimensions } from 'react-native';

import { breakpoints } from '@/theme';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  const isXs = width < breakpoints.sm;
  const isSm = width >= breakpoints.sm && width < breakpoints.md;
  const isMd = width >= breakpoints.md && width < breakpoints.lg;
  const isLg = width >= breakpoints.lg && width < breakpoints.xl;
  const isXl = width >= breakpoints.xl;

  const breakpoint: Breakpoint = isXl ? 'xl' : isLg ? 'lg' : isMd ? 'md' : isSm ? 'sm' : 'xs';

  // Desktop web = lg and above. Tablet = md. Mobile = sm/xs.
  const isDesktop = isWeb && width >= breakpoints.lg;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isMobile = width < breakpoints.md;

  // Helpers for grid columns
  const columns = isDesktop ? 12 : isTablet ? 8 : 4;

  return {
    width,
    height,
    isWeb,
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    columns,
    // convenience: should we show sidebar nav?
    showSidebar: isDesktop,
    // should we show bottom tabs?
    showBottomTabs: !isDesktop,
  };
}

export function useBreakpointValue<T>(values: Partial<Record<Breakpoint, T>>, fallback: T): T {
  const { breakpoint } = useResponsive();
  // check from current breakpoint downwards for fallback
  const order: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs'];
  const idx = order.indexOf(breakpoint);
  for (let i = idx; i < order.length; i++) {
    const bp = order[i];
    if (values[bp] !== undefined) return values[bp] as T;
  }
  // also try upwards if nothing found
  for (let i = 0; i < idx; i++) {
    const bp = order[i];
    if (values[bp] !== undefined) return values[bp] as T;
  }
  return fallback;
}

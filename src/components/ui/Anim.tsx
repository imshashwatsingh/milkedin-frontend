import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, Pressable, type StyleProp, type ViewStyle } from 'react-native';

interface FadeInViewProps {
  children: ReactNode;
  /** Delay before the entrance animation starts (ms). */
  delay?: number;
  /** Entrance duration (ms). */
  duration?: number;
  /** Vertical offset to rise from (px). */
  y?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Gentle entrance animation: fades in while rising a few pixels.
 * Used across screens to make content feel alive without being distracting.
 */
export function FadeInView({ children, delay = 0, duration = 420, y = 14, style }: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(y)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, delay, duration]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

interface PressScaleProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Scale applied while pressed. */
  scale?: number;
  accessibilityRole?: 'button' | 'tab' | 'image' | 'text' | 'none';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * A Pressable that gives tactile feedback by scaling down slightly while
 * pressed. Replaces plain Pressables where a "physical" response helps.
 */
export function PressScale({
  children,
  onPress,
  onLongPress,
  disabled,
  style,
  scale = 0.96,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityHint,
}: PressScaleProps) {
  const animated = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(animated, {
      toValue: scale,
      useNativeDriver: true,
      tension: 280,
      friction: 18,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(animated, {
      toValue: 1,
      useNativeDriver: true,
      tension: 280,
      friction: 18,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      onPressIn={pressIn}
      onPressOut={pressOut}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [{ opacity: pressed && !disabled ? 0.92 : 1 }, style]}>
      <Animated.View style={{ transform: [{ scale: animated }] }}>{children}</Animated.View>
    </Pressable>
  );
}

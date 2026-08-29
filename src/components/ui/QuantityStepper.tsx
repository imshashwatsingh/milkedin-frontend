import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { Text } from './Text';

interface QuantityStepperProps {
  /** Whole number display + increment (litres). */
  displayValue: string;
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease?: boolean;
  canIncrease?: boolean;
  label: string;
}

/**
 * Large − / + control with a big value between. Minimum Android/iOS touch
 * target sizing so it is easy to press.
 */
export function QuantityStepper({
  displayValue,
  onDecrease,
  onIncrease,
  canDecrease = true,
  canIncrease = true,
  label,
}: QuantityStepperProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        accessibilityState={{ disabled: !canDecrease }}
        disabled={!canDecrease}
        onPress={onDecrease}
        style={({ pressed }) => [
          styles.roundButton,
          !canDecrease && styles.disabled,
          pressed && canDecrease && styles.pressed,
        ]}>
        <Ionicons name="remove" size={30} color={colors.onPrimary} accessibilityIgnoresInvertColors />
      </Pressable>

      <View style={styles.valueWrap} accessible accessibilityLabel={`${label}: ${displayValue}`}>
        <Text variant="huge" color={colors.text}>
          {displayValue}
        </Text>
        <Text variant="caption" color={colors.textMuted}>
          litres
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        accessibilityState={{ disabled: !canIncrease }}
        disabled={!canIncrease}
        onPress={onIncrease}
        style={({ pressed }) => [
          styles.roundButton,
          !canIncrease && styles.disabled,
          pressed && canIncrease && styles.pressed,
        ]}>
        <Ionicons name="add" size={30} color={colors.onPrimary} accessibilityIgnoresInvertColors />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  roundButton: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.primaryPressed,
  },
  disabled: {
    opacity: 0.35,
  },
  valueWrap: {
    alignItems: 'center',
    minWidth: 130,
  },
});
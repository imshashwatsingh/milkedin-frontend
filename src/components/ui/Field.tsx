import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

import { Text } from './Text';

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  error?: string | null;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'name' | 'off';
  maxLength?: number;
  hint?: string;
  accessibilityLabel?: string;
  editable?: boolean;
  onSubmit?: () => void;
}

/**
 * A large, clearly-labelled text input with an obvious error message below.
 * The label stays above the field so it can never be hidden by placeholder
 * text width.
 */
export function Field({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  placeholder,
  error,
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  autoComplete = 'off',
  maxLength,
  hint,
  accessibilityLabel,
  editable = true,
  onSubmit,
}: FieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text variant="bodyStrong" style={styles.label}>
        {label}
      </Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSoft}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        autoCorrect={false}
        maxLength={maxLength}
        editable={editable}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={hint}
        onEndEditing={onSubmit}
        returnKeyType="done"
        selectionColor={colors.primary}
      />
      {hint && !error ? (
        <Text variant="small" color={colors.textMuted}>
          {hint}
        </Text>
      ) : null}
      {error ? (
        <Text variant="small" color={colors.danger} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    marginBottom: 0,
  },
  input: {
    minHeight: 60,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: colors.surface,
  },
});
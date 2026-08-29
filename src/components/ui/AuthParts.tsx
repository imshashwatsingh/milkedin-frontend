import { StyleSheet } from 'react-native';

import { colors } from '@/theme';

import { ErrorBanner } from './Banner';
import { Button } from './Button';
import { Card } from './Card';
import { Field } from './Field';
import { Text } from './Text';

export function BrandHeader({ tagline = 'Your daily milk tracker' }: { tagline?: string }) {
  return (
    <>
      <Text variant="huge" style={styles.brand}>
        milkedIn
      </Text>
      <Text variant="body" color={colors.textMuted} center>
        {tagline}
      </Text>
    </>
  );
}

export function SignInFields({
  email,
  onChangeEmail,
  password,
  onChangePassword,
  error,
  submitting,
  submitLabel = 'Sign In',
  onSubmit,
}: {
  email: string;
  onChangeEmail: (v: string) => void;
  password: string;
  onChangePassword: (v: string) => void;
  error: string | null;
  submitting: boolean;
  submitLabel?: string;
  onSubmit: () => void;
}) {
  return (
    <Card style={styles.card}>
      <Field
        label="Email address"
        value={email}
        onChangeText={onChangeEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        placeholder="you@example.com"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={onChangePassword}
        secureTextEntry
        autoComplete="password"
        placeholder="Your password"
      />
      {error ? <ErrorBanner message={error} /> : null}
      <Button label={submitLabel} loading={submitting} accessibilityLabel={submitLabel} onPress={onSubmit} />
    </Card>
  );
}

export function AuthFooter({
  prompt,
  linkLabel,
  onLink,
}: {
  prompt: string;
  linkLabel: string;
  onLink: () => void;
}) {
  return (
    <Card style={styles.footer} variant="soft">
      <Text variant="body" color={colors.textMuted} center>
        {prompt}
      </Text>
      <Button label={linkLabel} variant="outline" onPress={onLink} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 20,
    borderWidth: 0,
  },
  footer: {
    borderWidth: 0,
    gap: 16,
  },
  brand: {
    color: colors.primary,
    textAlign: 'center',
  },
});
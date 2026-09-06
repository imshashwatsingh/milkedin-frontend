import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandHeader, AuthFooter } from '@/components/ui/AuthParts';
import { ErrorBanner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { spacing } from '@/theme';
import { forgotPassword } from '@/services/api/auth';
import { validateEmail } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    const normalized = email.trim().toLowerCase();
    // Cache email via route params and open enter-code screen immediately (don't wait for network).
    router.push({ pathname: '/reset-password', params: { email: normalized } });
    // Fire-and-forget: backend always returns success to avoid revealing accounts.
    void forgotPassword({ email: normalized }).catch(() => {
      // Silently ignore — user is already on the OTP screen where they can retry.
    });
  };

  return (
    <Screen title="Reset your password" subtitle="We will email you a reset link" scroll maxWidth="narrow" contentStyle={{ paddingTop: spacing.xxl }}>
      <View style={styles.stack}>
        <BrandHeader tagline="Back into your milk log in no time" />
        <Card style={styles.card}>
          <Field
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
            error={error}
          />
          {error ? <ErrorBanner message={error} /> : null}
          <Button
            label="Send Reset Code"
            onPress={handleSubmit}
            accessibilityLabel="Send reset code"
          />
        </Card>
        <AuthFooter prompt="Remembered it?" linkLabel="Back to Sign In" onLink={() => router.replace('/login')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.xl,
    flex: 1,
  },
  card: {
    borderWidth: 0,
    gap: spacing.lg,
  },
});

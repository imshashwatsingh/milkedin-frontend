import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandHeader, AuthFooter } from '@/components/ui/AuthParts';
import { ErrorBanner, SuccessBanner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { spacing } from '@/theme';
import { forgotPassword } from '@/services/api/auth';
import type { ApiError } from '@/services/api/client';
import { validateEmail } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; kind: 'success' | 'error' } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setNotice(null);
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    setSubmitting(true);
    try {
      await forgotPassword({ email: email.trim().toLowerCase() });
      // Always show the same reassuring message to avoid revealing accounts.
      setNotice({
        text: 'If that email is on our list, we have sent a reset link. Please check your inbox.',
        kind: 'success',
      });
      setEmail('');
    } catch (err) {
      const apiError = err as ApiError;
      setNotice({ text: apiError?.message ?? 'Something went wrong. Please try again.', kind: 'error' });
    } finally {
      setSubmitting(false);
    }
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
          {notice ? (
            notice.kind === 'success' ? (
              <SuccessBanner message={notice.text} />
            ) : (
              <ErrorBanner message={notice.text} />
            )
          ) : null}
          {notice?.kind === 'success' ? (
            <Button
              label="Enter Code"
              onPress={() => router.replace('/reset-password')}
              accessibilityLabel="Enter reset code"
            />
          ) : (
            <Button
              label={submitting ? 'Sending code...' : 'Send Reset Code'}
              loading={submitting}
              onPress={() => void handleSubmit()}
              accessibilityLabel="Send reset code"
            />
          )}
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

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
import { resetPassword } from '@/services/api/auth';
import type { ApiError } from '@/services/api/client';
import { validateEmail, validatePassword } from '@/utils/validation';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match. Please type them again.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ email: email.trim().toLowerCase(), password, otp });
      setNotice({ text: 'Your password has been reset. You can sign in now.', kind: 'success' });
      setEmail('');
      setOtp('');
      setPassword('');
      setConfirm('');
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError?.status === 401) {
        setError('This code is invalid or has expired. Please request a new one.');
      } else {
        setError(apiError?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen title="Choose a new password" subtitle="Enter the code we emailed you" scroll maxWidth="narrow" contentStyle={{ paddingTop: spacing.xxl }}>
      <View style={styles.stack}>
        <BrandHeader tagline="Almost back in" />
        <Card style={styles.card}>
          <Field
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Field
            label="Reset code"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            autoCapitalize="none"
            maxLength={6}
            placeholder="123456"
          />
          <Field
            label="New password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            hint="At least 8 characters with a capital letter and a number."
          />
          <Field
            label="Repeat new password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoComplete="password"
            placeholder="Same password again"
          />
          {error ? <ErrorBanner message={error} /> : null}
          {notice?.kind === 'success' ? <SuccessBanner message={notice.text} /> : null}
          <Button
            label={submitting ? 'Saving...' : 'Reset Password'}
            loading={submitting}
            onPress={() => void handleSubmit()}
            accessibilityLabel="Reset password"
          />
        </Card>
        <AuthFooter prompt="All done?" linkLabel="Sign In" onLink={() => router.replace('/login')} />
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

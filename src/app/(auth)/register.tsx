import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { AuthFooter, BrandHeader } from '@/components/ui/AuthParts';
import { ErrorBanner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import type { ApiError } from '@/services/api/client';
import { colors, spacing } from '@/theme';
import { validateEmail, validateName, validatePassword } from '@/utils/validation';

export default function RegisterScreen() {
  const router = useRouter();
  const { registerAndSignIn } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
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
      await registerAndSignIn({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      // The protected-route guard redirects to Home automatically.
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message ?? 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <Screen title="Create your account" subtitle="You only need to do this once" scroll maxWidth="narrow" contentStyle={{ paddingTop: spacing.xxl }}>
      <View style={styles.stack}>
        <BrandHeader tagline="Your daily milk tracker" />
        <Card style={styles.card}>
          <Field label="Your name" value={name} onChangeText={setName} autoComplete="name" placeholder="e.g. Ama" maxLength={50} />
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
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            hint="At least 8 characters with a capital letter and a number."
          />
          <Field
            label="Repeat password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoComplete="password"
            placeholder="Same password again"
          />
          {error ? <ErrorBanner message={error} /> : null}
          <Button label={submitting ? 'Creating account...' : 'Create Account'} loading={submitting} onPress={() => void handleSubmit()} />
        </Card>
        <AuthFooter prompt="Already have an account?" linkLabel="Sign In" onLink={() => router.replace('/login')} />
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
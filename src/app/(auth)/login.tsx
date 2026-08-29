import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { AuthFooter, BrandHeader, SignInFields } from '@/components/ui/AuthParts';
import { Screen } from '@/components/ui/Screen';
import { spacing } from '@/theme';
import { Button } from '@/components/ui/Button';
import type { ApiError } from '@/services/api/client';
import { validateEmail } from '@/utils/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setSubmitting(true);
    try {
      await signIn({ email: email.trim().toLowerCase(), password });
      // The protected-route guard in the root layout redirects to Home.
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError?.status === 401) {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError(apiError?.message ?? 'Something went wrong. Please try again.');
      }
      setSubmitting(false);
    }
  };

  return (
    <Screen title="Welcome back" subtitle="Sign in to see today's milk" scroll contentStyle={{ paddingTop: spacing.xxl }}>
      <View style={styles.stack}>
        <BrandHeader />
        <SignInFields
          email={email}
          onChangeEmail={setEmail}
          password={password}
          onChangePassword={setPassword}
          error={error}
          submitting={submitting}
          submitLabel={submitting ? 'Signing in...' : 'Sign In'}
          onSubmit={() => void handleSubmit()}
        />
        <AuthFooter
          prompt="New here? Set up your account."
          linkLabel="Create Account"
          onLink={() => router.push('/register')}
        />
        <Button
          label="Forgot your password?"
          variant="ghost"
          onPress={() => router.push('/forgot-password')}
          accessibilityLabel="Forgot your password"
        />
      </View>
    </Screen>
  );
}

const styles = {
  stack: {
    gap: spacing.xl,
    flex: 1,
  },
};
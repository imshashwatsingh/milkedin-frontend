import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { BackHeader, Screen } from '@/components/ui/Screen';
import { SuccessBanner } from '@/components/ui/Banner';
import { colors, spacing } from '@/theme';
import { validateEmail, validateName, validatePassword } from '@/utils/validation';

export default function UpdateProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.full_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [errors, setErrors] = useState<{ name?: string; email?: string; current?: string; next?: string; confirm?: string }>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nameChanged = name.trim() !== (user?.full_name ?? '');
  const emailChanged = email.trim().toLowerCase() !== (user?.email ?? '').toLowerCase();

  const validateForm = useCallback((): boolean => {
    const next: typeof errors = {};
    if (nameChanged) {
      const nameError = validateName(name);
      if (nameError) next.name = nameError;
    }
    if (emailChanged) {
      const emailError = validateEmail(email);
      if (emailError) next.email = emailError;
    }
    if (newPassword || confirm || currentPassword) {
      if (!currentPassword) {
        next.current = 'Enter your current password to change it.';
      }
      const passwordError = validatePassword(newPassword);
      if (passwordError) next.next = passwordError;
      if (newPassword !== confirm) {
        next.confirm = 'The two new passwords do not match.';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [name, email, newPassword, confirm, currentPassword, nameChanged, emailChanged]);

  const handleSubmit = useCallback(async () => {
    setNotice(null);
    if (!validateForm()) return;
    if (!nameChanged && !emailChanged && !newPassword) {
      setNotice('No changes to save.');
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile({
        ...(nameChanged ? { full_name: name.trim() } : {}),
        ...(emailChanged ? { email: email.trim().toLowerCase() } : {}),
        ...(newPassword ? { current_password: currentPassword, new_password: newPassword } : {}),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
      setNotice('Your profile has been updated.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save. Please try again.';
      setNotice(message);
    } finally {
      setSubmitting(false);
    }
  }, [name, email, newPassword, currentPassword, nameChanged, emailChanged, validateForm, updateProfile]);

  return (
    <Screen maxWidth="narrow">
      <BackHeader onBack={() => router.back()} title="Edit Profile" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.stack}>
          {notice ? <SuccessBanner message={notice} /> : null}
          <Card style={styles.card}>
            <Field label="Your name" value={name} onChangeText={setName} autoComplete="name" placeholder="e.g. Ama" maxLength={50} error={errors.name} />
            <Field
              label="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email}
              editable={false}
              hint="Your email is locked and cannot be changed."
            />
          </Card>

          <Card style={styles.card}>
            <Field
              label="Current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoComplete="password"
              placeholder="Needed only to set a new password"
              error={errors.current}
            />
            <Field
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoComplete="password"
              hint="At least 8 characters with a capital letter and a number. Leave blank to keep the current one."
              error={errors.next}
            />
            <Field
              label="Repeat new password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoComplete="password"
              placeholder="Same password again"
              error={errors.confirm}
            />
          </Card>

          <Button label={submitting ? 'Saving...' : 'Save Changes'} loading={submitting} onPress={() => void handleSubmit()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxxl,
  },
  stack: {
    gap: spacing.lg,
  },
  card: {
    borderWidth: 0,
    backgroundColor: colors.surface,
    gap: spacing.lg,
  },
});

import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/auth/AuthContext';
import { ErrorBanner, SuccessBanner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorView } from '@/components/ui/ErrorView';
import { Field } from '@/components/ui/Field';
import { LoadingView } from '@/components/ui/LoadingView';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useApiData } from '@/hooks/useApiData';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { createCategory, deleteCategory, listCategories, updateCategory } from '@/services/api/categories';
import { useResponsive } from '@/hooks/useResponsive';
import { colors, spacing } from '@/theme';
import { formatRupees, toNumber } from '@/utils/format';
import { validateCategoryName, validatePrice } from '@/utils/validation';

interface Notice {
  text: string;
  kind: 'success' | 'error';
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isDesktop } = useResponsive();
  const categories = useApiData(useCallback(() => listCategories(), []));
  useRefreshOnFocus(categories.refetch);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState<null | 'add' | 'edit'>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutTarget, setLogoutTarget] = useState(false);

  const handleSignOut = async () => {
    setLogoutTarget(false);
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const resetEditor = () => {
    setEditingId(null);
    setAdding(false);
    setNameInput('');
    setPriceInput('');
    setErrors({});
  };

  const startEdit = (category: { id: number; name: string; current_price: string }) => {
    setAdding(false);
    setEditingId(category.id);
    setNameInput(category.name);
    setPriceInput(toNumber(category.current_price).toString());
    setErrors({});
    setNotice(null);
  };

  const startAdd = () => {
    setEditingId(null);
    setAdding(true);
    setNameInput('');
    setPriceInput('');
    setErrors({});
    setNotice(null);
  };

  const validateForm = (): boolean => {
    const nextErrors: { name?: string; price?: string } = {};
    const nameError = validateCategoryName(nameInput);
    if (nameError) nextErrors.name = nameError;
    const priceError = validatePrice(priceInput);
    if (priceError) nextErrors.price = priceError;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveAdd = async () => {
    if (!validateForm()) return;
    setBusy('add');
    setNotice(null);
    try {
      await createCategory({ name: nameInput.trim(), current_price: toNumber(priceInput) });
      resetEditor();
      setNotice({ text: 'Milk type saved.', kind: 'success' });
      categories.refetch();
    } catch (err) {
      setNotice({ text: err instanceof Error ? err.message : 'Could not save. Please try again.', kind: 'error' });
    } finally {
      setBusy(null);
    }
  };

  const handleSaveEdit = async () => {
    if (editingId == null) return;
    if (!validateForm()) return;
    setBusy('edit');
    setNotice(null);
    try {
      await updateCategory(editingId, {
        name: nameInput.trim(),
        current_price: toNumber(priceInput),
      });
      resetEditor();
      setNotice({ text: 'Changes saved.', kind: 'success' });
      categories.refetch();
    } catch (err) {
      setNotice({ text: err instanceof Error ? err.message : 'Could not save. Please try again.', kind: 'error' });
    } finally {
      setBusy(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy('edit');
    try {
      await deleteCategory(deleteTarget.id);
      setNotice({ text: `Removed "${deleteTarget.name}". Your old entries are kept safe.`, kind: 'success' });
      categories.refetch();
    } catch (err) {
      setNotice({ text: err instanceof Error ? err.message : 'Could not remove. Please try again.', kind: 'error' });
    } finally {
      setDeleteTarget(null);
      setBusy(null);
    }
  };

  if (categories.loading && !categories.data) {
    return (
      <Screen title="Milk & Price">
        <LoadingView />
      </Screen>
    );
  }

  const list = categories.data ?? [];

  return (
    <Screen title="Milk & Price" subtitle="Name the milk you buy and set its price per litre.">
      <View style={[styles.stack, isDesktop && styles.stackDesktop]}>
        {isDesktop ? (
          <View style={styles.desktopGrid}>
            <View style={styles.desktopMain}>
              {categories.error ? (
                <ErrorView message={categories.error} onRetry={categories.refetch} />
              ) : (
                <>
                  {notice ? (
                    notice.kind === 'success' ? (
                      <SuccessBanner message={notice.text} />
                    ) : (
                      <ErrorBanner message={notice.text} />
                    )
                  ) : null}

                  {list.length === 0 ? (
                    <Card style={styles.formCard}>
                      <Text variant="bodyStrong">Let us set up your milk</Text>
                      <Text variant="body" color={colors.textMuted}>
                        Add the milk you buy and its price per litre, so you can record it every day.
                      </Text>
                      <Field
                        label="Milk name"
                        value={nameInput}
                        onChangeText={setNameInput}
                        placeholder="e.g. Toned Milk"
                        maxLength={100}
                        error={errors.name}
                        accessibilityLabel="Milk name"
                      />
                      <Field
                        label="Price per litre (₹)"
                        value={priceInput}
                        onChangeText={setPriceInput}
                        keyboardType="decimal-pad"
                        placeholder="e.g. 60"
                        error={errors.price}
                        accessibilityLabel="Price per litre in rupees"
                      />
                      <Button label="Save Milk Type" onPress={() => void handleSaveAdd()} loading={busy === 'add'} />
                    </Card>
                  ) : (
                    <>
                      <View style={styles.list}>
                        {list.map((category) =>
                          editingId === category.id ? (
                            <Card key={category.id} style={styles.formCard}>
                              <Text variant="bodyStrong">Change details</Text>
                              <Field
                                label="Milk name"
                                value={nameInput}
                                onChangeText={setNameInput}
                                maxLength={100}
                                error={errors.name}
                                accessibilityLabel="Milk name"
                              />
                              <Field
                                label="Price per litre (₹)"
                                value={priceInput}
                                onChangeText={setPriceInput}
                                keyboardType="decimal-pad"
                                error={errors.price}
                                accessibilityLabel="Price per litre in rupees"
                              />
                              <Button
                                label="Save Changes"
                                onPress={() => void handleSaveEdit()}
                                loading={busy === 'edit'}
                              />
                              <Button label="Cancel" variant="outline" onPress={resetEditor} />
                            </Card>
                          ) : (
                            <Card key={category.id} style={styles.row}>
                              <View style={styles.rowText}>
                                <Text variant="bodyStrong">{category.name}</Text>
                                <Text variant="body" color={colors.textMuted}>
                                  {formatRupees(category.current_price)} per litre
                                </Text>
                              </View>
                              <View style={styles.rowActions}>
                                <Button
                                  label="Change"
                                  variant="secondary"
                                  onPress={() => startEdit(category)}
                                  fullWidth={false}
                                />
                                <Button
                                  label="Remove"
                                  variant="outline"
                                  onPress={() => setDeleteTarget({ id: category.id, name: category.name })}
                                  fullWidth={false}
                                  accessibilityLabel={`Remove ${category.name}`}
                                />
                              </View>
                            </Card>
                          ),
                        )}
                      </View>

                      {adding ? (
                        <Card style={styles.formCard}>
                          <Text variant="bodyStrong">Add another milk type</Text>
                          <Field
                            label="Milk name"
                            value={nameInput}
                            onChangeText={setNameInput}
                            placeholder="e.g. Boiled Milk"
                            maxLength={100}
                            error={errors.name}
                            accessibilityLabel="Milk name"
                          />
                          <Field
                            label="Price per litre (₹)"
                            value={priceInput}
                            onChangeText={setPriceInput}
                            keyboardType="decimal-pad"
                            placeholder="e.g. 70"
                            error={errors.price}
                            accessibilityLabel="Price per litre in rupees"
                          />
                          <Button label="Save Milk Type" onPress={() => void handleSaveAdd()} loading={busy === 'add'} />
                          <Button label="Cancel" variant="outline" onPress={resetEditor} />
                        </Card>
                      ) : (
                        <Button label="Add Another Milk Type" variant="outline" onPress={startAdd} />
                      )}

                      <Text variant="small" color={colors.textMuted}>
                        Removing a milk type does not delete your past entries — it just stops offering that type for new
                        entries.
                      </Text>
                    </>
                  )}
                </>
              )}
            </View>

            <View style={styles.desktopSide}>
              <Card style={styles.accountCard}>
                <Text variant="sectionTitle">Account</Text>
                {user ? (
                  <View style={styles.accountRow}>
                    <Text variant="bodyStrong">{user.full_name}</Text>
                    <Text variant="body" color={colors.textMuted}>
                      {user.email}
                    </Text>
                  </View>
                ) : null}
                <Button label="Edit Profile" variant="outline" onPress={() => router.push('/update-profile')} fullWidth={false} />
                <Button
                  label={signingOut ? 'Signing out...' : 'Sign Out'}
                  variant="danger"
                  loading={signingOut}
                  onPress={() => setLogoutTarget(true)}
                  accessibilityLabel="Sign out"
                />
              </Card>
            </View>
          </View>
        ) : null}
        {/* Mobile layout — hidden on desktop via conditional */}
        <View style={isDesktop ? styles.hiddenOnDesktop : undefined}>
        {categories.error ? (
          <ErrorView message={categories.error} onRetry={categories.refetch} />
        ) : (
          <>
            {notice ? (
              notice.kind === 'success' ? (
                <SuccessBanner message={notice.text} />
              ) : (
                <ErrorBanner message={notice.text} />
              )
            ) : null}

            {list.length === 0 ? (
              <Card style={styles.formCard}>
                <Text variant="bodyStrong">Let us set up your milk</Text>
                <Text variant="body" color={colors.textMuted}>
                  Add the milk you buy and its price per litre, so you can record it every day.
                </Text>
                <Field
                  label="Milk name"
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="e.g. Toned Milk"
                  maxLength={100}
                  error={errors.name}
                  accessibilityLabel="Milk name"
                />
                <Field
                  label="Price per litre (₹)"
                  value={priceInput}
                  onChangeText={setPriceInput}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 60"
                  error={errors.price}
                  accessibilityLabel="Price per litre in rupees"
                />
                <Button label="Save Milk Type" onPress={() => void handleSaveAdd()} loading={busy === 'add'} />
              </Card>
            ) : (
              <>
                <View style={styles.list}>
                  {list.map((category) =>
                    editingId === category.id ? (
                      <Card key={category.id} style={styles.formCard}>
                        <Text variant="bodyStrong">Change details</Text>
                        <Field
                          label="Milk name"
                          value={nameInput}
                          onChangeText={setNameInput}
                          maxLength={100}
                          error={errors.name}
                          accessibilityLabel="Milk name"
                        />
                        <Field
                          label="Price per litre (₹)"
                          value={priceInput}
                          onChangeText={setPriceInput}
                          keyboardType="decimal-pad"
                          error={errors.price}
                          accessibilityLabel="Price per litre in rupees"
                        />
                        <Button label="Save Changes" onPress={() => void handleSaveEdit()} loading={busy === 'edit'} />
                        <Button label="Cancel" variant="outline" onPress={resetEditor} />
                      </Card>
                    ) : (
                      <Card key={category.id} style={styles.row}>
                        <View style={styles.rowText}>
                          <Text variant="bodyStrong">{category.name}</Text>
                          <Text variant="body" color={colors.textMuted}>
                            {formatRupees(category.current_price)} per litre
                          </Text>
                        </View>
                        <View style={styles.rowActions}>
                          <Button label="Change" variant="secondary" onPress={() => startEdit(category)} fullWidth={false} />
                          <Button
                            label="Remove"
                            variant="outline"
                            onPress={() => setDeleteTarget({ id: category.id, name: category.name })}
                            fullWidth={false}
                            accessibilityLabel={`Remove ${category.name}`}
                          />
                        </View>
                      </Card>
                    ),
                  )}
                </View>

                {adding ? (
                  <Card style={styles.formCard}>
                    <Text variant="bodyStrong">Add another milk type</Text>
                    <Field
                      label="Milk name"
                      value={nameInput}
                      onChangeText={setNameInput}
                      placeholder="e.g. Boiled Milk"
                      maxLength={100}
                      error={errors.name}
                      accessibilityLabel="Milk name"
                    />
                    <Field
                      label="Price per litre (₹)"
                      value={priceInput}
                      onChangeText={setPriceInput}
                      keyboardType="decimal-pad"
                      placeholder="e.g. 70"
                      error={errors.price}
                      accessibilityLabel="Price per litre in rupees"
                    />
                    <Button label="Save Milk Type" onPress={() => void handleSaveAdd()} loading={busy === 'add'} />
                    <Button label="Cancel" variant="outline" onPress={resetEditor} />
                  </Card>
                ) : (
                  <Button label="Add Another Milk Type" variant="outline" onPress={startAdd} />
                )}

                <Text variant="small" color={colors.textMuted}>
                  Removing a milk type does not delete your past entries — it just stops offering that
                  type for new entries.
                </Text>
              </>
            )}
          </>
        )}

        <Card style={styles.accountCard}>
          <Text variant="sectionTitle">Account</Text>
          {user ? (
            <View style={styles.accountRow}>
              <Text variant="bodyStrong">{user.full_name}</Text>
              <Text variant="body" color={colors.textMuted}>
                {user.email}
              </Text>
            </View>
          ) : null}
          <Button label="Edit Profile" variant="outline" onPress={() => router.push('/update-profile')} fullWidth={false} />
          <Button
            label={signingOut ? 'Signing out...' : 'Sign Out'}
            variant="danger"
            loading={signingOut}
            onPress={() => setLogoutTarget(true)}
            accessibilityLabel="Sign out"
          />
        </Card>
        </View>
      </View>

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Remove this milk?"
        message={`This removes "${deleteTarget?.name ?? ''}" from your list. Your previous milk entries will not be deleted.`}
        confirmLabel="Remove"
        cancelLabel="Keep It"
        destructive
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        visible={logoutTarget}
        title="Sign out?"
        message="You will need to sign in again to see your milk log."
        confirmLabel="Sign Out"
        cancelLabel="Stay"
        destructive
        onConfirm={() => void handleSignOut()}
        onCancel={() => setLogoutTarget(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  stackDesktop: {
    gap: spacing.xl,
  },
  desktopGrid: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'flex-start',
  },
  desktopMain: {
    flex: 1.6,
    gap: spacing.lg,
  },
  desktopSide: {
    flex: 0.9,
    gap: spacing.lg,
  },
  hiddenOnDesktop: {
    display: 'none',
  },
  list: {
    gap: spacing.md,
  },
  row: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 140,
  },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  formCard: {
    borderWidth: 0,
    backgroundColor: colors.surface,
    gap: spacing.lg,
  },
  accountCard: {
    borderWidth: 0,
    backgroundColor: colors.surface,
    gap: spacing.lg,
  },
  accountRow: {
    gap: spacing.xs,
  },
});
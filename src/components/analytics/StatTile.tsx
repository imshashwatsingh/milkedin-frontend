import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

interface StatTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  iconColor?: string;
}

/** A single metric card used across the Insights dashboard. */
export function StatTile({ icon, label, value, sub, accent = colors.primarySoft, iconColor = colors.primary }: StatTileProps) {
  return (
    <Card style={styles.tile}>
      <View style={[styles.iconCircle, { backgroundColor: accent }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text variant="caption" color={colors.textMuted}>
        {label}
      </Text>
      <Text variant="huge" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {value}
      </Text>
      {sub ? (
        <Text variant="small" color={colors.textMuted}>
          {sub}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 150,
    gap: spacing.xs,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
});

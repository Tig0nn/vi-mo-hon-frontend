import { StyleSheet, Text, View } from 'react-native';
import { formatValue } from '../utils/formatValue';
import { colors } from '../theme/colors';

export function StatCard({ label, value, icon, isPrimary }) {
  return (
    <View style={[styles.statCard, isPrimary && styles.primaryCard]}>
      <View style={styles.contentRow}>
        {icon}
        <View style={styles.textContainer}>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
      </View>
      <Text selectable style={[styles.statValue, isPrimary && styles.primaryValue]}>
        {formatValue(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: colors.surfaceMist,
    borderRadius: 12,
    alignItems: 'stretch',
    gap: 8,
    justifyContent: 'center',
    minHeight: 88,
    padding: 12,
  },
  primaryCard: {
    backgroundColor: colors.surfaceRice,
  },
  contentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  statLabel: {
    color: colors.onSurface,
    flexShrink: 1,
    flexWrap: 'wrap',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  statValue: {
    color: colors.onSurface,
    flexShrink: 1,
    flexWrap: 'wrap',
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    lineHeight: 26,
    minWidth: 0,
  },
  primaryValue: {
    color: colors.primary,
  },
});

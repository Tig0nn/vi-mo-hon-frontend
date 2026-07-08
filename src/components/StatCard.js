import { StyleSheet, Text, View } from 'react-native';
import { formatValue } from '../utils/formatValue';
import { colors } from '../theme/colors';

export function StatCard({ label, value, icon, isPrimary }) {
  return (
    <View style={[styles.statCard, isPrimary && styles.primaryCard]}>
      <View style={styles.contentRow}>
        {icon && (
          <View style={[styles.iconWrapper, isPrimary && styles.primaryIconWrapper]}>
            {icon}
          </View>
        )}
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
    borderColor: colors.softBorder,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  primaryCard: {
    backgroundColor: 'rgba(110, 166, 56, 0.1)', // primaryContainer/10
    borderColor: 'rgba(58, 106, 0, 0.2)', // primary/20
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryIconWrapper: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  textContainer: {
    justifyContent: 'center',
  },
  statLabel: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '600',
  },
  statValue: {
    color: colors.onSurface,
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  primaryValue: {
    color: colors.primary,
  },
});

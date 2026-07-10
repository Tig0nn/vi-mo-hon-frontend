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
    alignItems: 'stretch',
    gap: 8,
    justifyContent: 'center',
    minHeight: 88,
    padding: 12,
  },
  primaryCard: {
    backgroundColor: 'rgba(110, 166, 56, 0.1)', // primaryContainer/10
    borderColor: 'rgba(58, 106, 0, 0.2)', // primary/20
  },
  contentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minWidth: 0,
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

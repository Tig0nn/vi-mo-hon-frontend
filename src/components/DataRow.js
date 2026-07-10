import { StyleSheet, Text, View } from 'react-native';
import { formatValue } from '../utils/formatValue';
import { colors } from '../theme/colors';

export function DataRow({ label, value }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text selectable style={styles.dataValue}>
        {formatValue(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dataRow: {
    borderBottomColor: colors.softBorder,
    borderBottomWidth: 1,
    gap: 6,
    paddingVertical: 12,
  },
  dataLabel: {
    color: colors.mossText,
    fontSize: 14,
    fontWeight: '600',
  },
  dataValue: {
    color: colors.onSurface,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    lineHeight: 22,
  },
});

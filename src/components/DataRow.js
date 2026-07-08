import { StyleSheet, Text, View } from 'react-native';
import { formatValue } from '../utils/formatValue';

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
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
    gap: 4,
    paddingBottom: 10,
  },
  dataLabel: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  dataValue: {
    color: '#0f172a',
    fontSize: 15,
    lineHeight: 21,
  },
});

import { StyleSheet, Text, View } from 'react-native';
import { formatValue } from '../utils/formatValue';

export function MetricCard({ label, value }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text selectable style={styles.metricValue}>
        {formatValue(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  metricValue: {
    color: '#0f172a',
    fontSize: 20,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
});

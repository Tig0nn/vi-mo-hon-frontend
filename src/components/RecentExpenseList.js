import { StyleSheet, Text, View } from 'react-native';
import { formatValue } from '../utils/formatValue';

export function RecentExpenseList({ expenses }) {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return <Text style={styles.mutedText}>No recent expenses yet.</Text>;
  }

  return (
    <View style={styles.list}>
      {expenses.map((expense, index) => (
        <View key={expense?.id || expense?._id || index} style={styles.listItem}>
          <Text selectable style={styles.itemTitle}>
            {expense?.text || expense?.description || `Expense ${index + 1}`}
          </Text>
          <Text selectable style={styles.mutedText}>
            Amount: {formatValue(expense?.amount)}
          </Text>
          {expense?.category ? (
            <Text selectable style={styles.mutedText}>
              Category: {formatValue(expense.category)}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  listItem: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  itemTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  mutedText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
});

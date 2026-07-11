import { StyleSheet, Text, View } from 'react-native';
import { formatValue } from '../utils/formatValue';
import { colors } from '../theme/colors';

const { formatExpenseCategory } = require('../utils/expenseCategory.cjs');

export function RecentExpenseList({ expenses }) {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconWrapper}>
          <Text style={styles.emptyIconText}>₫</Text>
        </View>
        <Text style={styles.emptyTitle}>Chưa có giao dịch</Text>
        <Text style={styles.emptyDescription}>
          Bạn chưa ghi khoản chi nào. Hãy nhập khoản chi đầu tiên ở ô phía trên.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {expenses.map((expense, index) => {
        const categoryLabel = formatExpenseCategory(expense?.category);

        return <View key={expense?.id || expense?._id || index} style={styles.listItem}>
          <View style={styles.row}>
            <Text selectable style={styles.itemTitle}>
              {expense?.text || expense?.description || `Giao dịch ${index + 1}`}
            </Text>
            <Text selectable style={styles.amountText}>
              {formatValue(expense?.amount)}
            </Text>
          </View>
          {categoryLabel ? (
            <View style={styles.categoryBadge}>
              <Text selectable style={styles.categoryText}>
                {categoryLabel}
              </Text>
            </View>
          ) : null}
        </View>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 28,
  },
  emptyIconWrapper: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMist,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 8,
    width: 64,
  },
  emptyIconText: {
    color: colors.mossText,
    fontSize: 24,
    fontWeight: '800',
  },
  emptyTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDescription: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  listItem: {
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  itemTitle: {
    color: colors.onSurface,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  amountText: {
    color: colors.error,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    color: colors.mossText,
    fontSize: 12,
    fontWeight: '600',
  },
});

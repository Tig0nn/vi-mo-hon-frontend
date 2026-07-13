import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const {
  formatExpenseCategory,
  getExpenseCategoryShortLabel,
} = require('../utils/expenseCategory.cjs');
const {
  formatExpenseAmount,
  formatExpenseDateTime,
  getExpenseTitle,
} = require('../utils/expenseDisplay.cjs');

export function RecentExpenseList({ expenses }) {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconWrapper}>
          <Text style={styles.emptyIconText}>₫</Text>
        </View>
        <Text style={styles.emptyTitle}>Chưa có khoản chi</Text>
        <Text style={styles.emptyDescription}>
          Ghi khoản đầu tiên để Coach bắt đầu nhận ra thói quen của bạn.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {expenses.slice(0, 5).map((expense, index) => {
        const categoryLabel = formatExpenseCategory(expense?.category) || 'Khác';
        const categoryShortLabel = getExpenseCategoryShortLabel(expense?.category);

        return (
          <View
            key={expense?.id || expense?._id || `${getExpenseTitle(expense, index)}-${index}`}
            style={[styles.listItem, index > 0 && styles.listItemWithDivider]}
          >
            <View style={styles.categoryIcon}>
              <Text style={styles.categoryIconText}>{categoryShortLabel}</Text>
            </View>

            <View style={styles.itemContent}>
              <Text numberOfLines={1} selectable style={styles.itemTitle}>
                {getExpenseTitle(expense, index)}
              </Text>
              <Text numberOfLines={1} selectable style={styles.metadataText}>
                {formatExpenseDateTime(expense)} · {categoryLabel}
              </Text>
            </View>

            <Text selectable style={styles.amountText}>
              {formatExpenseAmount(expense?.amount)}
            </Text>
          </View>
        );
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
    maxWidth: 280,
    textAlign: 'center',
  },
  list: {
    marginHorizontal: -20,
    marginBottom: -8,
  },
  listItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  listItemWithDivider: {
    borderColor: colors.softBorder,
    borderTopWidth: 1,
  },
  categoryIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMist,
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  categoryIconText: {
    color: colors.mossText,
    fontSize: 10,
    fontWeight: '800',
  },
  itemContent: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
  metadataText: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 17,
  },
  amountText: {
    color: colors.onSurface,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
});

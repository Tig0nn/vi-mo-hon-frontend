import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const {
  formatExpenseCategory,
  normalizeCategory,
} = require('../utils/expenseCategory.cjs');
const {
  formatExpenseAmount,
  formatExpenseDateTime,
  getExpenseTitle,
} = require('../utils/expenseDisplay.cjs');

const CATEGORY_ICONS = {
  FOOD_DRINK: 'restaurant-outline',
  SHOPPING: 'bag-handle-outline',
  TRANSPORT: 'car-outline',
  ENTERTAINMENT: 'game-controller-outline',
  EDUCATION: 'book-outline',
  SAVING: 'wallet-outline',
  OTHER: 'receipt-outline',
};

export function RecentExpenseList({ expenses }) {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="receipt-outline" size={34} color={colors.primary} />
        <Text style={styles.emptyTitle}>Chưa có giao dịch</Text>
        <Text style={styles.emptyDescription}>
          Ghi khoản đầu tiên để Coach bắt đầu nhận ra thói quen của bạn.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {expenses.slice(0, 5).map((expense, index) => {
        const category = normalizeCategory(expense?.category) || 'OTHER';
        const categoryLabel = formatExpenseCategory(category) || 'Khác';

        return (
          <View
            key={expense?.id || expense?._id || index}
            style={[styles.listItem, index > 0 && styles.listItemWithDivider]}
          >
            <Ionicons
              name={CATEGORY_ICONS[category] || CATEGORY_ICONS.OTHER}
              size={22}
              color={colors.primary}
            />

            <View style={styles.itemContent}>
              <Text selectable style={styles.itemTitle} numberOfLines={1}>
                {getExpenseTitle(expense, index)}
              </Text>
              <Text selectable style={styles.metadataText} numberOfLines={1}>
                {categoryLabel} · {formatExpenseDateTime(expense)}
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
  emptyTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyDescription: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 280,
    textAlign: 'center',
  },
  list: {
    marginBottom: -8,
    marginHorizontal: -20,
  },
  listItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 68,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  listItemWithDivider: {
    borderColor: colors.softBorder,
    borderTopWidth: 1,
  },
  itemContent: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  itemTitle: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '800',
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
    fontWeight: '900',
  },
});

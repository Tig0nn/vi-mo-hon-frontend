import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { RecentExpenseList } from '../components/RecentExpenseList';
import { colors } from '../theme/colors';
import { safeTextInputStyles } from '../theme/inputStyles';
import { formatVnd, GOAL_LABELS } from '../utils/profile';

const mascotImage = require('../../design-reference/ảnh Mascot.png');

function clampPercent(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, numericValue));
}

function ProgressPill({ value, color = colors.primary }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clampPercent(value)}%`, backgroundColor: color }]} />
    </View>
  );
}

function MetricProgress({ icon, label, value }) {
  const numericValue = clampPercent(value);

  return (
    <View style={styles.metricItem}>
      <View style={styles.metricHeader}>
        <Ionicons name={icon} size={18} color={colors.primary} />
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{numericValue}/100</Text>
      </View>
      <ProgressPill value={numericValue} />
    </View>
  );
}

export function HomeScreen({
  dashboard,
  expenseText,
  isLoading,
  onChangeExpenseText,
  onSubmitExpense,
}) {
  const data = dashboard?.data ?? dashboard ?? {};
  const profile = data.profile ?? {};
  const monthlyBudget = Number(profile.monthlyBudget ?? profile.budget ?? 0);
  const monthlySpent = Number(profile.monthlySpent ?? 0);
  const budgetProgress = monthlyBudget > 0 ? (monthlySpent / monthlyBudget) * 100 : 0;
  const remainingBudget = Math.max(0, monthlyBudget - monthlySpent);
  const goalLabel = GOAL_LABELS[profile.mainGoal] || profile.mainGoal || 'Mục tiêu tài chính';

  // TODO: expose savings/knowledge in Dashboard API when user_progress is ready for these stats.
  const discipline = profile.discipline ?? 0;
  const savings = profile.savings ?? profile.saving ?? 0;
  const knowledge = profile.knowledge ?? 0;

  return (
    <View style={styles.container}>
      <Card>
        <View style={styles.goalHeader}>
          <Ionicons name="flag" size={24} color={colors.primary} />
          <View style={styles.goalTitleGroup}>
            <Text style={styles.eyebrow}>Mục tiêu của bạn</Text>
            <Text selectable style={styles.goalTitle} numberOfLines={2}>
              {goalLabel}
            </Text>
          </View>
          <View style={styles.levelPill}>
            <Ionicons name="sparkles" size={14} color={colors.goldAccent} />
            <Text style={styles.levelText}>Cấp {profile.level ?? 1}</Text>
          </View>
        </View>

        <View style={styles.budgetPanel}>
          <View style={styles.budgetRow}>
            <View>
              <Text style={styles.budgetLabel}>Đã chi tháng này</Text>
              <Text selectable style={styles.budgetValue}>
                {formatVnd(monthlySpent)}
              </Text>
            </View>
            <View style={styles.budgetRight}>
              <Text style={styles.budgetLabel}>Còn lại</Text>
              <Text selectable style={styles.remainingValue}>
                {formatVnd(remainingBudget)}
              </Text>
            </View>
          </View>
          <ProgressPill value={budgetProgress} />
          <Text style={styles.progressCaption}>
            Giới hạn tháng: {formatVnd(monthlyBudget)}
          </Text>
        </View>

        <View style={styles.metricList}>
          <MetricProgress icon="shield-checkmark" label="Discipline" value={discipline} />
          <MetricProgress icon="wallet" label="Saving" value={savings} />
          <MetricProgress icon="book" label="Knowledge" value={knowledge} />
        </View>
      </Card>

      <Card>
        <View style={styles.quickHeader}>
          <View>
            <Text style={styles.sectionTitle}>Ghi chép chi tiêu</Text>
            <Text style={styles.sectionHint}>Nhập nhanh khoản chi hôm nay</Text>
          </View>
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </View>

        <View style={styles.inputShell}>
          <Ionicons name="cash-outline" size={18} color={colors.onSurfaceVariant} />
          <TextInput
            autoCapitalize="none"
            editable={!isLoading}
            onChangeText={onChangeExpenseText}
            placeholder="Ví dụ: trà sữa 45k"
            placeholderTextColor={colors.onSurfaceVariant}
            style={styles.input}
            value={expenseText}
          />
        </View>

        <Pressable
          disabled={isLoading}
          onPress={onSubmitExpense}
          style={({ pressed }) => [
            styles.primaryButton,
            (pressed || isLoading) && styles.buttonPressed,
          ]}
        >
          <Ionicons name="add-circle" size={20} color={colors.surfaceRice} />
          <Text style={styles.primaryButtonText}>Thêm khoản chi</Text>
        </Pressable>
      </Card>

      <Card>
        <View style={styles.quickHeader}>
          <View>
            <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
            <Text style={styles.sectionHint}>Từ dashboard backend hiện tại</Text>
          </View>
          <Ionicons name="receipt-outline" size={22} color={colors.primary} />
        </View>
        <RecentExpenseList expenses={data.recentExpenses} />
      </Card>

      <Image source={mascotImage} style={styles.mascotPeek} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 22,
  },
  goalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  goalTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '800',
  },
  goalTitle: {
    color: colors.onSurface,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  levelPill: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  levelText: {
    color: colors.onSurface,
    fontSize: 12,
    fontWeight: '900',
  },
  budgetPanel: {
    backgroundColor: colors.surfaceMist,
    borderRadius: 18,
    gap: 10,
    padding: 14,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  budgetRight: {
    alignItems: 'flex-end',
  },
  budgetLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '800',
  },
  budgetValue: {
    color: colors.onSurface,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
  remainingValue: {
    color: colors.primary,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
  progressTrack: {
    backgroundColor: colors.primaryFixedDim,
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  progressCaption: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '700',
  },
  metricList: {
    gap: 12,
  },
  metricItem: {
    gap: 8,
  },
  metricHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  metricLabel: {
    color: colors.onSurface,
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
  },
  metricValue: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  quickHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionHint: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  input: {
    ...safeTextInputStyles.singleLine,
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: colors.onSurface,
    flex: 1,
    paddingHorizontal: 0,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 16,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ translateY: 1 }],
  },
  primaryButtonText: {
    color: colors.surfaceRice,
    fontSize: 16,
    fontWeight: '900',
  },
  mascotPeek: {
    alignSelf: 'flex-end',
    height: 82,
    marginBottom: -28,
    marginRight: 4,
    marginTop: -6,
    width: 112,
  },
});

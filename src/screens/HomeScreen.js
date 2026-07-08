import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '../components/Card';
import { IconBadge } from '../components/IconBadge';
import { RecentExpenseList } from '../components/RecentExpenseList';
import { StatCard } from '../components/StatCard';
import { colors } from '../theme/colors';

export function HomeScreen({
  dashboard,
  expenseText,
  isLoading,
  onChangeExpenseText,
  onSubmitExpense,
}) {
  const data = dashboard?.data ?? dashboard ?? {};
  const profile = data.profile ?? {};

  return (
    <View style={styles.container}>
      <Card title="Ghi chú chi tiêu" icon={<IconBadge label="+" />}>
        <TextInput
          autoCapitalize="none"
          editable={!isLoading}
          onChangeText={onChangeExpenseText}
          placeholder="Ví dụ: trà sữa 45k"
          placeholderTextColor={colors.onSurfaceVariant}
          style={styles.input}
          value={expenseText}
        />
        <Pressable
          disabled={isLoading}
          onPress={onSubmitExpense}
          style={({ pressed }) => [
            styles.primaryButton,
            (pressed || isLoading) && styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Gửi khoản chi</Text>
        </Pressable>
      </Card>

      <Card title="Tổng quan" icon={<IconBadge label="XP" />}>
        <View style={styles.metricGrid}>
          <StatCard label="XP" value={profile.xp} isPrimary />
          <StatCard label="Cấp độ" value={profile.level} />
          <StatCard label="Đã chi tháng này" value={profile.monthlySpent} />
          <StatCard label="Ngân sách tháng" value={profile.monthlyBudget} />
        </View>
      </Card>

      <Card title="Giao dịch gần đây" icon={<IconBadge label="GD" />}>
        <RecentExpenseList expenses={data.recentExpenses} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  input: {
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.onSurface,
    fontSize: 16,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ translateY: 1 }],
  },
  primaryButtonText: {
    color: colors.surfaceRice,
    fontSize: 16,
    fontWeight: '700',
  },
  metricGrid: {
    gap: 12,
  },
});

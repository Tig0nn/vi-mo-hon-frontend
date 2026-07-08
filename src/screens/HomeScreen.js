import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MetricCard } from '../components/MetricCard';
import { RecentExpenseList } from '../components/RecentExpenseList';
import { Section } from '../components/Section';

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
    <>
      <Section title="Quick expense">
        <TextInput
          autoCapitalize="none"
          editable={!isLoading}
          onChangeText={onChangeExpenseText}
          placeholder="Example: milk tea 45k"
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
          <Text style={styles.primaryButtonText}>Submit expense</Text>
        </Pressable>
      </Section>

      <Section title="Mini dashboard">
        <View style={styles.metricGrid}>
          <MetricCard label="XP" value={profile.xp} />
          <MetricCard label="Level" value={profile.level} />
          <MetricCard label="Monthly spent" value={profile.monthlySpent} />
          <MetricCard label="Monthly budget" value={profile.monthlyBudget} />
        </View>
      </Section>

      <Section title="Recent expenses">
        <RecentExpenseList expenses={data.recentExpenses} />
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    color: '#0f172a',
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  buttonPressed: {
    opacity: 0.72,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  metricGrid: {
    gap: 12,
  },
});

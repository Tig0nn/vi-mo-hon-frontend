import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { apiGet, apiPost } from "./src/api/client";

const USER_ID = "mock-user";

function formatValue(value) {
  if (value === null || value === undefined) {
    return "Chưa có dữ liệu";
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("vi-VN").format(value);
  }

  if (typeof value === "boolean") {
    return value ? "Có" : "Không";
  }

  return String(value);
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function MetricCard({ label, value }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text selectable style={styles.metricValue}>
        {formatValue(value)}
      </Text>
    </View>
  );
}

function BossProgress({ boss }) {
  if (!boss) {
    return <Text style={styles.mutedText}>Chưa có boss progress.</Text>;
  }

  const currentHp = Number(boss.currentHp ?? 0);
  const maxHp = Number(boss.maxHp ?? 0);

  const hpRemainingPercent =
    maxHp > 0 ? Math.round((currentHp / maxHp) * 100) : 0;

  const defeatProgressPercent =
    maxHp > 0 ? Math.round(((maxHp - currentHp) / maxHp) * 100) : 0;

  return (
    <View style={styles.list}>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Boss name</Text>
        <Text selectable style={styles.rowValue}>
          {formatValue(boss.name)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Boss HP</Text>
        <Text selectable style={styles.rowValue}>
          {currentHp} / {maxHp}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>HP còn lại</Text>
        <Text selectable style={styles.rowValue}>
          {hpRemainingPercent}%
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${hpRemainingPercent}%` }]}
          />
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Tiến độ đánh boss</Text>
        <Text selectable style={styles.rowValue}>
          {defeatProgressPercent}%
        </Text>
      </View>
    </View>
  );
}

function ChallengeList({ challenges }) {
  if (!Array.isArray(challenges) || challenges.length === 0) {
    return (
      <Text style={styles.mutedText}>Chưa có thử thách đang hoạt động.</Text>
    );
  }

  return (
    <View style={styles.list}>
      {challenges.map((challenge, index) => {
        const title =
          challenge?.title ||
          challenge?.name ||
          challenge?.description ||
          `Thử thách ${index + 1}`;

        return (
          <View
            key={challenge?.id || challenge?._id || title}
            style={styles.listItem}
          >
            <Text selectable style={styles.itemTitle}>
              {title}
            </Text>
            {challenge?.progress !== undefined ? (
              <Text selectable style={styles.mutedText}>
                Tiến độ: {formatValue(challenge.progress)}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function RecentExpenseList({ expenses }) {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return <Text style={styles.mutedText}>Chưa có khoản chi gần đây.</Text>;
  }

  return (
    <View style={styles.list}>
      {expenses.map((expense, index) => (
        <View
          key={expense?.id || expense?._id || index}
          style={styles.listItem}
        >
          <Text selectable style={styles.itemTitle}>
            {expense?.text || expense?.description || `Khoản chi ${index + 1}`}
          </Text>
          {expense?.amount !== undefined ? (
            <Text selectable style={styles.mutedText}>
              Số tiền: {formatValue(expense.amount)}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export default function App() {
  const [healthStatus, setHealthStatus] = useState("checking");
  const [dashboard, setDashboard] = useState(null);
  const [expenseText, setExpenseText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadHealth = useCallback(async () => {
    try {
      await apiGet("/health");
      setHealthStatus("connected");
    } catch (healthError) {
      setHealthStatus("failed");
      setError(healthError.message);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiGet(`/dashboard/${USER_ID}`);
      console.log("Dashboard response", response);
      setDashboard(response);
    } catch (dashboardError) {
      setError(dashboardError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const handleSubmit = async () => {
    const trimmedText = expenseText.trim();

    if (!trimmedText) {
      setError("Vui lòng nhập khoản chi trước khi gửi.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await apiPost("/expenses/quick-input", {
        userId: USER_ID,
        text: trimmedText,
      });
      setExpenseText("");
      const response = await apiGet(`/dashboard/${USER_ID}`);
      console.log("Dashboard response", response);
      setDashboard(response);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const healthLabel = useMemo(() => {
    if (healthStatus === "connected") {
      return "Connected";
    }

    if (healthStatus === "failed") {
      return "Failed";
    }

    return "Checking...";
  }, [healthStatus]);

  const profile = dashboard?.data?.profile;
  const boss = dashboard?.data?.boss;
  const activeChallenges = dashboard?.data?.activeChallenges;
  const recentExpenses = dashboard?.data?.recentExpenses;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Ví Mỏ Hỗn</Text>
          <Text style={styles.subtitle}>Quick expense slice</Text>
        </View>

        <Section title="Backend">
          <View style={[styles.statusPill, styles[healthStatus]]}>
            <Text style={styles.statusText}>{healthLabel}</Text>
          </View>
        </Section>

        <Section title="Nhập nhanh khoản chi">
          <TextInput
            autoCapitalize="none"
            editable={!isLoading}
            onChangeText={setExpenseText}
            placeholder="VD: trà sữa 45k"
            style={styles.input}
            value={expenseText}
          />
          <Pressable
            disabled={isLoading}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.button,
              (pressed || isLoading) && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Gửi khoản chi</Text>
          </Pressable>
        </Section>

        {error ? (
          <View style={styles.errorBox}>
            <Text selectable style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.mutedText}>Đang tải dữ liệu...</Text>
          </View>
        ) : null}

        <Section title="Dashboard">
          <Pressable
            disabled={isLoading}
            onPress={loadDashboard}
            style={({ pressed }) => [
              styles.secondaryButton,
              (pressed || isLoading) && styles.secondaryButtonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Refresh dashboard</Text>
          </Pressable>

          <View style={styles.metricGrid}>
            <MetricCard label="Total XP" value={profile?.xp} />
            <MetricCard label="Level" value={profile?.level} />
            <MetricCard label="Monthly spent" value={profile?.monthlySpent} />
            <MetricCard label="Monthly budget" value={profile?.monthlyBudget} />
          </View>
        </Section>

        <Section title="Stats">
          <Text style={styles.mutedText}>
            Stats chưa được backend trả về trong slice này.
          </Text>
        </Section>

        <Section title="Boss progress">
          <BossProgress boss={boss} />
        </Section>

        <Section title="Active challenges">
          <ChallengeList challenges={activeChallenges} />
        </Section>

        <Section title="Recent expenses">
          <RecentExpenseList expenses={recentExpenses} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 4,
    paddingTop: 8,
  },
  appTitle: {
    color: "#0f172a",
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: "#64748b",
    fontSize: 15,
  },
  section: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  sectionTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "700",
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  checking: {
    backgroundColor: "#fef3c7",
  },
  connected: {
    backgroundColor: "#dcfce7",
  },
  failed: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    color: "#0f172a",
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonPressed: {
    opacity: 0.72,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#2563eb",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryButtonPressed: {
    backgroundColor: "#eff6ff",
    opacity: 0.75,
  },
  secondaryButtonText: {
    color: "#1d4ed8",
    fontSize: 15,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 14,
    lineHeight: 20,
  },
  loadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  metricGrid: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  metricLabel: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
  },
  metricValue: {
    color: "#0f172a",
    fontSize: 20,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  list: {
    gap: 10,
  },
  row: {
    alignItems: "flex-start",
    borderBottomColor: "#e2e8f0",
    borderBottomWidth: 1,
    gap: 4,
    paddingBottom: 10,
  },
  rowLabel: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
  },
  rowValue: {
    color: "#0f172a",
    fontSize: 15,
    lineHeight: 21,
  },
  listItem: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  itemTitle: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
  },
  mutedText: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 20,
  },
  progressTrack: {
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    height: 10,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    backgroundColor: "#22c55e",
    borderRadius: 999,
    height: "100%",
  },
});

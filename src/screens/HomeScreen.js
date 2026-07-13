import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Card } from "../components/Card";
import { IconBadge } from "../components/IconBadge";
import { RecentExpenseList } from "../components/RecentExpenseList";
import { colors } from "../theme/colors";
import { safeTextInputStyles } from "../theme/inputStyles";

const { formatExpenseCategory } = require("../utils/expenseCategory.cjs");
const { formatIsoDateForDisplay } = require("../utils/date.cjs");

const EXPENSE_CATEGORIES = [
  { value: "FOOD_DRINK", label: "Ăn uống" },
  { value: "SHOPPING", label: "Mua sắm" },
  { value: "TRANSPORT", label: "Đi lại" },
  { value: "ENTERTAINMENT", label: "Giải trí" },
  { value: "OTHER", label: "Khác" },
];

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function getTodayChallenge(data) {
  if (hasOwn(data, "todayChallenge")) return data.todayChallenge;
  return Array.isArray(data.activeChallenges)
    ? (data.activeChallenges[0] ?? null)
    : null;
}

function formatUnlockDate(value) {
  if (!value) return "";

  const dateOnly = typeof value === "string" ? value.slice(0, 10) : "";
  return formatIsoDateForDisplay(dateOnly) || String(value);
}

function normalizeInsight(value) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (!value || typeof value !== "object") return "";

  for (const key of ["message", "text", "content", "summary", "insight"]) {
    if (typeof value[key] === "string" && value[key].trim())
      return value[key].trim();
  }

  return "";
}

function buildFallbackInsight(expenses) {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return "Ghi vài khoản chi để Coach nhận ra thói quen và nhắc đúng chỗ hơn.";
  }

  const lateExpenses = expenses.filter((expense) => {
    const rawDate =
      expense?.occurredAt || expense?.spentAt || expense?.createdAt;
    if (!rawDate) return false;
    const date = new Date(rawDate);
    return !Number.isNaN(date.getTime()) && date.getHours() >= 20;
  });

  if (lateExpenses.length >= 2) {
    return "Bạn thường ghi khoản chi sau 20:00. Đây có thể là khung giờ dễ tiêu theo cảm xúc.";
  }

  const categoryCount = new Map();
  for (const expense of expenses) {
    const category = expense?.category || "OTHER";
    categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
  }

  const topCategory = [...categoryCount.entries()].sort(
    (left, right) => right[1] - left[1],
  )[0]?.[0];
  const categoryLabel = formatExpenseCategory(topCategory);

  if (categoryLabel) {
    return `Gần đây ${categoryLabel.toLocaleLowerCase("vi-VN")} xuất hiện nhiều nhất. Thử đặt một giới hạn nhỏ cho hôm nay.`;
  }

  return "Bạn đã bắt đầu ghi chi tiêu đều hơn. Tiếp tục thêm dữ liệu để Coach tìm ra điểm dễ vung tay.";
}

function ExpenseInputCard({
  expenseText,
  isLoading,
  selectedExpenseCategory,
  onChangeExpenseText,
  onSelectExpenseCategory,
  onSubmitExpense,
}) {
  return (
    <Card title="Ghi chi tiêu">
      <View style={styles.inputRow}>
        <TextInput
          autoCapitalize="sentences"
          editable={!isLoading}
          onChangeText={onChangeExpenseText}
          placeholder="Ví dụ: trà sữa 45k"
          placeholderTextColor={colors.onSurfaceVariant}
          returnKeyType="done"
          onSubmitEditing={onSubmitExpense}
          style={styles.input}
          value={expenseText}
        />
        <Pressable
          accessibilityLabel="Lưu khoản chi"
          disabled={isLoading}
          onPress={onSubmitExpense}
          style={({ pressed }) => [
            styles.arrowButton,
            (pressed || isLoading) && styles.buttonPressed,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.surfaceRice} size="small" />
          ) : (
            <Text style={styles.arrowButtonText}>→</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.categoryRow}>
        {EXPENSE_CATEGORIES.map((category) => {
          const isSelected = selectedExpenseCategory === category.value;

          return (
            <Pressable
              key={category.value}
              disabled={isLoading}
              onPress={() => onSelectExpenseCategory(category.value)}
              style={({ pressed }) => [
                styles.categoryChip,
                isSelected && styles.categoryChipSelected,
                pressed && styles.categoryChipPressed,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextSelected,
                ]}
              >
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

function CurrentChallengeCard({
  challenge,
  challengeMessage,
  nextChallengeAvailableOn,
  completingChallengeId,
  onCompleteChallenge,
}) {
  if (!challenge) {
    const unlockDate = formatUnlockDate(nextChallengeAvailableOn);

    return (
      <Card
        title="Thử thách hiện tại"
        icon={<IconBadge label="OK" variant="primary" />}
      >
        <View style={styles.challengeEmptyBox}>
          <Text style={styles.challengeEmptyTitle}>
            {challengeMessage || "Hôm nay chưa có thử thách mới"}
          </Text>
          <Text style={styles.challengeDescription}>
            {unlockDate
              ? `Thử thách tiếp theo sẽ mở vào ${unlockDate}.`
              : "Quay lại sau hoặc làm mới dashboard để xem nhiệm vụ tiếp theo."}
          </Text>
        </View>
      </Card>
    );
  }

  const challengeId = challenge?.id || challenge?._id;
  const isCompleting = completingChallengeId === challengeId;
  const currentOrder = Number(challenge?.sequenceOrder || 0);
  const totalChallenges = Number(challenge?.totalChallenges || 0);

  return (
    <Card
      title="Thử thách hiện tại"
      icon={<IconBadge label="!" variant="primary" />}
      headerRight={
        currentOrder > 0 && totalChallenges > 0 ? (
          <Text style={styles.challengeSequence}>
            {currentOrder}/{totalChallenges}
          </Text>
        ) : null
      }
    >
      <View style={styles.challengeContent}>
        <Text selectable style={styles.challengeTitle}>
          {challenge?.title || challenge?.name || "Thử thách hôm nay"}
        </Text>
        <Text selectable style={styles.challengeDescription}>
          {challenge?.description ||
            "Hoàn thành nhiệm vụ nhỏ này để boss yếu đi."}
        </Text>
      </View>

      <View style={styles.rewardRow}>
        <View style={[styles.rewardBadge, styles.rewardBadgePrimary]}>
          <Text style={styles.rewardBadgePrimaryText}>
            +{challenge?.rewardXp || 0} XP
          </Text>
        </View>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardBadgeText}>
            Boss -{challenge?.bossDamage || 0} HP
          </Text>
        </View>
      </View>

      <Pressable
        disabled={!challengeId || isCompleting}
        onPress={() => onCompleteChallenge(challengeId)}
        style={({ pressed }) => [
          styles.challengeButton,
          (pressed || !challengeId || isCompleting) && styles.buttonPressed,
        ]}
      >
        {isCompleting ? (
          <ActivityIndicator color={colors.surfaceRice} />
        ) : (
          <Text style={styles.challengeButtonText}>Hoàn thành hôm nay</Text>
        )}
      </Pressable>
    </Card>
  );
}

function BossSummaryCard({ boss }) {
  const currentHp = Math.max(
    0,
    Number(boss?.currentHp ?? boss?.hpRemaining ?? 0),
  );
  const maxHp = Math.max(0, Number(boss?.maxHp ?? boss?.totalHp ?? 0));
  const hpPercent =
    maxHp > 0 ? Math.min(100, Math.round((currentHp / maxHp) * 100)) : 0;
  const completedChallenges = Number(boss?.completedChallenges || 0);
  const totalChallenges = Number(boss?.totalChallenges || 0);
  const isDefeated =
    boss?.status === "defeated" || (maxHp > 0 && currentHp === 0);

  return (
    <Card>
      <View style={styles.bossHeader}>
        <View style={styles.bossTitleGroup}>
          <Text style={styles.bossTitle}>{boss?.name || "Boss hiện tại"}</Text>
          {totalChallenges > 0 ? (
            <Text style={styles.bossChallengeCount}>
              {completedChallenges}/{totalChallenges} thử thách
            </Text>
          ) : null}
        </View>
        <Text style={[styles.bossHp, isDefeated && styles.bossDefeatedText]}>
          {isDefeated ? "ĐÃ HẠ" : `${currentHp}/${maxHp} HP`}
        </Text>
      </View>

      <Text style={styles.bossDescription}>
        {isDefeated
          ? "Bạn đã đánh bại boss này. Thành quả ngoài đời mới là phần đáng giữ."
          : "Hoàn thành thử thách mỗi ngày để boss yếu dần."}
      </Text>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${isDefeated ? 0 : hpPercent}%` },
          ]}
        />
      </View>
    </Card>
  );
}

function CoachInsightCard({ insight }) {
  return (
    <Card>
      <View style={styles.insightRow}>
        <IconBadge label="AI" />
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>Coach Insight</Text>
          <Text selectable style={styles.insightText}>
            {insight}
          </Text>
        </View>
      </View>
    </Card>
  );
}

export function HomeScreen({
  dashboard,
  expenseText,
  isLoading,
  selectedExpenseCategory,
  completingChallengeId,
  onChangeExpenseText,
  onSelectExpenseCategory,
  onSubmitExpense,
  onCompleteChallenge,
}) {
  const data = dashboard?.data ?? dashboard ?? {};
  const recentExpenses = Array.isArray(data.recentExpenses)
    ? data.recentExpenses
    : [];
  const currentChallenge = getTodayChallenge(data);
  const insight =
    normalizeInsight(data.aiInsight) ||
    normalizeInsight(data.coachInsight) ||
    normalizeInsight(data.insight) ||
    normalizeInsight(data.simpleInsight) ||
    buildFallbackInsight(recentExpenses);

  return (
    <View style={styles.container}>
      <ExpenseInputCard
        expenseText={expenseText}
        isLoading={isLoading}
        selectedExpenseCategory={selectedExpenseCategory}
        onChangeExpenseText={onChangeExpenseText}
        onSelectExpenseCategory={onSelectExpenseCategory}
        onSubmitExpense={onSubmitExpense}
      />

      <CurrentChallengeCard
        challenge={currentChallenge}
        challengeMessage={data.challengeMessage}
        nextChallengeAvailableOn={data.nextChallengeAvailableOn}
        completingChallengeId={completingChallengeId}
        onCompleteChallenge={onCompleteChallenge}
      />

      <BossSummaryCard boss={data.boss ?? {}} />

      <CoachInsightCard insight={insight} />

      <Card
        title="Gần đây"
        headerRight={<Text style={styles.recentCaption}>5 khoản gần nhất</Text>}
      >
        <RecentExpenseList expenses={recentExpenses} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  inputRow: {
    alignItems: "center",
    borderColor: colors.softBorder,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 8,
  },
  input: {
    ...safeTextInputStyles.singleLine,
    backgroundColor: "transparent",
    borderWidth: 0,
    color: colors.onSurface,
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  arrowButton: {
    alignItems: "center",
    backgroundColor: colors.primaryContainer,
    borderRadius: 11,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  arrowButtonText: {
    color: colors.onPrimaryContainer,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 26,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryChipSelected: {
    backgroundColor: colors.successSoft,
    borderColor: colors.primaryContainer,
  },
  categoryChipPressed: {
    opacity: 0.72,
  },
  categoryChipText: {
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: "700",
  },
  categoryChipTextSelected: {
    color: colors.primary,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primaryContainer,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: 16,
  },
  buttonPressed: {
    opacity: 0.74,
    transform: [{ translateY: 1 }],
  },
  primaryButtonText: {
    color: colors.onPrimaryContainer,
    fontSize: 16,
    fontWeight: "800",
  },
  challengeContent: {
    gap: 6,
  },
  challengeTitle: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 25,
  },
  challengeDescription: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 21,
  },
  challengeSequence: {
    color: colors.mossText,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  challengeEmptyBox: {
    gap: 6,
  },
  challengeEmptyTitle: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "800",
  },
  rewardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  rewardBadge: {
    backgroundColor: colors.surfaceMist,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  rewardBadgePrimary: {
    backgroundColor: colors.primaryFixedDim,
  },
  rewardBadgeText: {
    color: colors.onSurface,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  rewardBadgePrimaryText: {
    color: colors.onPrimaryContainer,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  challengeButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  challengeButtonText: {
    color: colors.surfaceRice,
    fontSize: 14,
    fontWeight: "800",
  },
  bossHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  bossTitleGroup: {
    flex: 1,
    gap: 4,
  },
  bossTitle: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: "800",
  },
  bossChallengeCount: {
    color: colors.mossText,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
  },
  bossHp: {
    color: colors.error,
    fontSize: 17,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  bossDefeatedText: {
    color: colors.primary,
  },
  bossDescription: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 21,
  },
  progressTrack: {
    backgroundColor: "#E3DED3",
    borderColor: colors.softBorder,
    borderRadius: 999,
    borderWidth: 1,
    height: 12,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.error,
    borderRadius: 999,
    height: "100%",
  },
  insightRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  insightContent: {
    flex: 1,
    gap: 4,
  },
  insightTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: "800",
  },
  insightText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 21,
  },
  recentCaption: {
    color: colors.mossText,
    fontSize: 12,
    fontWeight: "700",
  },
});

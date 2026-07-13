import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatValue } from '../utils/formatValue';
import { colors } from '../theme/colors';

const { formatIsoDateForDisplay } = require('../utils/date.cjs');

function formatNextDate(value) {
  if (!value) return '';
  const dateOnly = typeof value === 'string' ? value.slice(0, 10) : '';
  return formatIsoDateForDisplay(dateOnly) || String(value);
}

function getStatusPresentation(status) {
  switch (status) {
    case 'completed':
      return {
        icon: 'checkmark-circle',
        label: 'Đã hoàn thành',
        color: colors.primary,
      };
    case 'active':
      return {
        icon: 'flag',
        label: 'Nhiệm vụ hôm nay',
        color: colors.primary,
      };
    case 'failed':
      return {
        icon: 'close-circle-outline',
        label: 'Chưa hoàn thành',
        color: colors.error,
      };
    case 'skipped':
      return {
        icon: 'play-skip-forward-outline',
        label: 'Đã bỏ qua',
        color: colors.onSurfaceVariant,
      };
    default:
      return {
        icon: 'lock-closed-outline',
        label: 'Chưa mở',
        color: colors.onSurfaceVariant,
      };
  }
}

export function ChallengeList({
  challenges,
  completingChallengeId,
  onCompleteChallenge,
  challengeMessage,
  nextChallengeAvailableOn,
  bossStatus,
  showCompletionAction = true,
}) {
  if (!Array.isArray(challenges) || challenges.length === 0) {
    const nextDate = formatNextDate(nextChallengeAvailableOn);
    const title =
      bossStatus === 'defeated'
        ? 'Boss đã bị đánh bại'
        : challengeMessage || 'Hôm nay chưa có nhiệm vụ mới';

    return (
      <View style={styles.emptyState}>
        <Ionicons name="checkmark-done" size={34} color={colors.primary} />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyDescription}>
          {nextDate
            ? `Nhiệm vụ tiếp theo sẽ mở vào ${nextDate}.`
            : bossStatus === 'defeated'
              ? 'Bạn đã hoàn thành toàn bộ chuỗi nhiệm vụ của boss này.'
              : 'Quay lại vào ngày tiếp theo để tiếp tục tiến độ.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {challenges.map((challenge, index) => {
        const challengeId = challenge?.id || challenge?._id;
        const title = challenge?.title || challenge?.name || `Nhiệm vụ ${index + 1}`;
        const status = challenge?.status || 'locked';
        const statusPresentation = getStatusPresentation(status);
        const isCompleting = completingChallengeId === challengeId;
        const currentOrder = Number(challenge?.sequenceOrder || index + 1);
        const totalChallenges = Number(challenge?.totalChallenges || challenges.length);
        const canComplete =
          showCompletionAction &&
          status === 'active' &&
          Boolean(challengeId) &&
          typeof onCompleteChallenge === 'function';

        return (
          <View
            key={challengeId || `${currentOrder}-${title}`}
            style={[styles.listItem, status === 'locked' && styles.lockedItem]}
          >
            <View style={styles.header}>
              <Ionicons
                name={statusPresentation.icon}
                size={23}
                color={statusPresentation.color}
              />
              <View style={styles.titleContainer}>
                <View style={styles.titleRow}>
                  <Text selectable style={styles.itemTitle}>
                    {title}
                  </Text>
                  <Text style={styles.sequenceText}>
                    {currentOrder}/{totalChallenges}
                  </Text>
                </View>
                <Text selectable style={styles.itemDescription}>
                  {formatValue(challenge?.description)}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.statusText, { color: statusPresentation.color }]}>
                {statusPresentation.label}
              </Text>
              <Text style={styles.rewardText}>+{challenge?.rewardXp || 0} XP</Text>
              <Text style={styles.rewardText}>Boss -{challenge?.bossDamage || 0} HP</Text>
            </View>

            {canComplete ? (
              <Pressable
                disabled={isCompleting}
                onPress={() => onCompleteChallenge(challengeId)}
                style={({ pressed }) => [
                  styles.primaryButton,
                  (pressed || isCompleting) && styles.buttonPressed,
                ]}
              >
                {isCompleting ? (
                  <ActivityIndicator color={colors.surfaceRice} />
                ) : (
                  <Text style={styles.primaryButtonText}>Hoàn thành hôm nay</Text>
                )}
              </Pressable>
            ) : null}
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
    paddingVertical: 24,
  },
  emptyTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDescription: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 300,
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  listItem: {
    backgroundColor: colors.surfaceMist,
    borderRadius: 14,
    gap: 14,
    padding: 15,
  },
  lockedItem: {
    opacity: 0.68,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 11,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  itemTitle: {
    color: colors.onSurface,
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  sequenceText: {
    color: colors.mossText,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
  itemDescription: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
  },
  rewardText: {
    color: colors.mossText,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 16,
  },
  buttonPressed: {
    opacity: 0.72,
    transform: [{ translateY: 1 }],
  },
  primaryButtonText: {
    color: colors.surfaceRice,
    fontSize: 15,
    fontWeight: '900',
  },
});

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { IconBadge } from './IconBadge';
import { formatValue } from '../utils/formatValue';
import { colors } from '../theme/colors';

const { formatIsoDateForDisplay } = require('../utils/date.cjs');

function formatNextDate(value) {
  if (!value) return '';
  const dateOnly = typeof value === 'string' ? value.slice(0, 10) : '';
  return formatIsoDateForDisplay(dateOnly) || String(value);
}

export function ChallengeList({
  challenges,
  completingChallengeId,
  onCompleteChallenge,
  challengeMessage,
  nextChallengeAvailableOn,
  bossStatus,
}) {
  if (!Array.isArray(challenges) || challenges.length === 0) {
    const nextDate = formatNextDate(nextChallengeAvailableOn);
    const title =
      bossStatus === 'defeated'
        ? 'Boss đã bị đánh bại'
        : challengeMessage || 'Hôm nay chưa có nhiệm vụ mới';

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconWrapper}>
          <Text style={styles.emptyIconText}>OK</Text>
        </View>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyDescription}>
          {nextDate
            ? `Nhiệm vụ tiếp theo sẽ mở vào ${nextDate}.`
            : 'Hoàn thành từng nhiệm vụ nhỏ và quay lại dashboard để theo dõi tiến độ.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {challenges.map((challenge, index) => {
        const challengeId = challenge?.id || challenge?._id;
        const title = challenge?.title || challenge?.name || `Nhiệm vụ ${index + 1}`;
        const isCompleting = completingChallengeId === challengeId;
        const currentOrder = Number(challenge?.sequenceOrder || 0);
        const totalChallenges = Number(challenge?.totalChallenges || 0);

        return (
          <View key={challengeId || title} style={styles.listItem}>
            <View style={styles.header}>
              <IconBadge label="!" variant="warm" />
              <View style={styles.titleContainer}>
                <View style={styles.titleRow}>
                  <Text selectable style={styles.itemTitle}>
                    {title}
                  </Text>
                  {currentOrder > 0 && totalChallenges > 0 ? (
                    <Text style={styles.sequenceText}>
                      {currentOrder}/{totalChallenges}
                    </Text>
                  ) : null}
                </View>
                <Text selectable style={styles.itemDescription}>
                  {formatValue(challenge?.description)}
                </Text>
              </View>
            </View>

            <View style={styles.rewardBox}>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardText}>+{challenge?.rewardXp || 0} XP</Text>
              </View>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardText}>Boss -{challenge?.bossDamage || 0} HP</Text>
              </View>
            </View>

            <Pressable
              disabled={!challengeId || isCompleting}
              onPress={() => onCompleteChallenge(challengeId)}
              style={({ pressed }) => [
                styles.primaryButton,
                (pressed || isCompleting || !challengeId) && styles.buttonPressed,
              ]}
            >
              {isCompleting ? (
                <ActivityIndicator color={colors.surfaceRice} />
              ) : (
                <Text style={styles.primaryButtonText}>Hoàn thành hôm nay</Text>
              )}
            </Pressable>
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
    fontSize: 13,
    fontWeight: '800',
  },
  emptyTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '700',
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
    borderColor: colors.softBorder,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
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
    fontWeight: '700',
  },
  sequenceText: {
    color: colors.mossText,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  itemDescription: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  rewardBox: {
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 10,
  },
  rewardItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  rewardText: {
    color: colors.mossText,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  buttonPressed: {
    opacity: 0.72,
    transform: [{ translateY: 1 }],
  },
  primaryButtonText: {
    color: colors.surfaceRice,
    fontSize: 15,
    fontWeight: '700',
  },
});

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { IconBadge } from './IconBadge';
import { formatValue } from '../utils/formatValue';
import { colors } from '../theme/colors';

export function ChallengeList({ challenges, completingChallengeId, onCompleteChallenge }) {
  if (!Array.isArray(challenges) || challenges.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconWrapper}>
          <Text style={styles.emptyIconText}>OK</Text>
        </View>
        <Text style={styles.emptyTitle}>Chưa có nhiệm vụ</Text>
        <Text style={styles.emptyDescription}>
          Hiện tại chưa có nhiệm vụ đang mở. Hãy làm mới dashboard sau khi backend tạo thử thách mới.
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

        return (
          <View key={challengeId || title} style={styles.listItem}>
            <View style={styles.header}>
              <IconBadge label="!" variant="warm" />
              <View style={styles.titleContainer}>
                <Text selectable style={styles.itemTitle}>
                  {title}
                </Text>
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
                <Text style={styles.rewardText}>{challenge?.bossDamage || 0} sát thương</Text>
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
                <Text style={styles.primaryButtonText}>Hoàn thành</Text>
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
  itemTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '700',
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

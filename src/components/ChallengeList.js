import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatValue } from '../utils/formatValue';
import { DataRow } from './DataRow';

export function ChallengeList({ challenges, completingChallengeId, onCompleteChallenge }) {
  if (!Array.isArray(challenges) || challenges.length === 0) {
    return <Text style={styles.mutedText}>No active challenges yet.</Text>;
  }

  return (
    <View style={styles.list}>
      {challenges.map((challenge, index) => {
        const challengeId = challenge?.id || challenge?._id;
        const title = challenge?.title || challenge?.name || `Challenge ${index + 1}`;
        const isCompleting = completingChallengeId === challengeId;

        return (
          <View key={challengeId || title} style={styles.listItem}>
            <Text selectable style={styles.itemTitle}>
              {title}
            </Text>
            <Text selectable style={styles.itemDescription}>
              {formatValue(challenge?.description)}
            </Text>
            <View style={styles.detailGrid}>
              <DataRow label="Reward XP" value={challenge?.rewardXp} />
              <DataRow label="Boss damage" value={challenge?.bossDamage} />
              <DataRow label="Difficulty" value={challenge?.difficulty} />
              <DataRow label="Status" value={challenge?.status} />
            </View>
            <Pressable
              disabled={!challengeId || isCompleting}
              onPress={() => onCompleteChallenge(challengeId)}
              style={({ pressed }) => [
                styles.primaryButton,
                styles.successButton,
                (pressed || isCompleting || !challengeId) && styles.buttonPressed,
              ]}
            >
              {isCompleting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Complete challenge</Text>
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  listItem: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  itemTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  itemDescription: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  detailGrid: {
    gap: 8,
  },
  mutedText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  successButton: {
    backgroundColor: '#16a34a',
  },
  buttonPressed: {
    opacity: 0.72,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

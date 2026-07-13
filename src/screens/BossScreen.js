import { StyleSheet, View } from 'react-native';
import { BossProgress } from '../components/BossProgress';
import { Card } from '../components/Card';
import { ChallengeList } from '../components/ChallengeList';
import { IconBadge } from '../components/IconBadge';

function getVisibleChallenges(data) {
  const hasTodayChallengeField = Object.prototype.hasOwnProperty.call(data, 'todayChallenge');
  if (hasTodayChallengeField) {
    return data.todayChallenge ? [data.todayChallenge] : [];
  }
  return Array.isArray(data.activeChallenges) ? data.activeChallenges : [];
}

export function BossScreen({ dashboard, completingChallengeId, onCompleteChallenge }) {
  const data = dashboard?.data ?? dashboard ?? {};

  return (
    <View style={styles.container}>
      <Card title="Tiến độ Boss" icon={<IconBadge label="B" />}>
        <BossProgress boss={data.boss ?? {}} />
      </Card>

      <Card title="Nhiệm vụ hôm nay" icon={<IconBadge label="NV" variant="warm" />}>
        <ChallengeList
          challenges={getVisibleChallenges(data)}
          challengeMessage={data.challengeMessage}
          nextChallengeAvailableOn={data.nextChallengeAvailableOn}
          bossStatus={data.boss?.status}
          completingChallengeId={completingChallengeId}
          onCompleteChallenge={onCompleteChallenge}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});

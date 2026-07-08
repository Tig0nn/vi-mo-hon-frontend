import { StyleSheet, View } from 'react-native';
import { BossProgress } from '../components/BossProgress';
import { Card } from '../components/Card';
import { ChallengeList } from '../components/ChallengeList';
import { IconBadge } from '../components/IconBadge';

export function BossScreen({ dashboard, completingChallengeId, onCompleteChallenge }) {
  const data = dashboard?.data ?? dashboard ?? {};

  return (
    <View style={styles.container}>
      <Card title="Tiến độ Boss" icon={<IconBadge label="B" />}>
        <BossProgress boss={data.boss ?? {}} />
      </Card>

      <Card title="Nhiệm vụ đang mở" icon={<IconBadge label="NV" variant="warm" />}>
        <ChallengeList
          challenges={data.activeChallenges}
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

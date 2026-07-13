import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BossProgress } from '../components/BossProgress';
import { Card } from '../components/Card';
import { ChallengeList } from '../components/ChallengeList';
import { colors } from '../theme/colors';

export function BossScreen({ dashboard, completingChallengeId, onCompleteChallenge }) {
  const data = dashboard?.data ?? dashboard ?? {};

  return (
    <View style={styles.container}>
      <Card title="Tiến độ Boss" icon={<Ionicons name="skull-outline" size={22} color={colors.primary} />}>
        <BossProgress boss={data.boss ?? {}} />
      </Card>

      <Card title="Nhiệm vụ đang mở" icon={<Ionicons name="flag-outline" size={22} color={colors.primary} />}>
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

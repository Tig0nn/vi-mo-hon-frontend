import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BossProgress } from '../components/BossProgress';
import { Card } from '../components/Card';
import { ChallengeList } from '../components/ChallengeList';
import { LessonList } from '../components/LessonList';
import { colors } from '../theme/colors';

const { buildBossChallengeList } = require('../utils/bossChallenges.cjs');

export function BossScreen({
  dashboard,
  userId,
  completingChallengeId,
  onCompleteChallenge,
  onSelectLesson,
  lessonRefreshKey,
}) {
  const data = dashboard?.data ?? dashboard ?? {};
  const challenges = buildBossChallengeList(data);

  return (
    <View style={styles.container}>
      <Card
        title="Tiến độ Boss"
        icon={<Ionicons name="skull-outline" size={22} color={colors.primary} />}
      >
        <BossProgress boss={data.boss ?? {}} />
      </Card>

      <Card
        title="Bài học 1 phút"
        icon={<Ionicons name="book-outline" size={22} color={colors.primary} />}
      >
        <Text style={styles.helperText}>
          Hiểu chiêu của Boss trước khi làm thử thách.
        </Text>
        <LessonList
          userId={userId}
          bossId={data.boss?.bossId}
          onSelectLesson={onSelectLesson}
          refreshKey={lessonRefreshKey}
        />
      </Card>

      <Card
        title="Tất cả nhiệm vụ"
        icon={<Ionicons name="list-outline" size={22} color={colors.primary} />}
        headerRight={
          <Text style={styles.countText}>
            {Number(data.boss?.completedChallenges || 0)}/{challenges.length}
          </Text>
        }
      >
        <Text style={styles.helperText}>
          Hoàn thành theo thứ tự, mỗi ngày một nhiệm vụ để làm boss yếu dần.
        </Text>
        <ChallengeList
          challenges={challenges}
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
  countText: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
  helperText: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
    marginTop: -4,
  },
});

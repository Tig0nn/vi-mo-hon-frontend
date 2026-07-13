import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const bossImage = require('../../assets/images/boss-tra-sua-cropped.png');

function ProgressBar({ percent, color }) {
  const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));

  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${safePercent}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

export function BossProgress({ boss }) {
  const currentHp = Number(boss?.currentHp ?? boss?.hpRemaining ?? 0);
  const maxHp = Number(boss?.maxHp ?? boss?.totalHp ?? 0);
  const completedChallenges = Number(boss?.completedChallenges || 0);
  const totalChallenges = Number(boss?.totalChallenges || 0);
  const isDefeated = boss?.status === 'defeated' || (maxHp > 0 && currentHp === 0);

  const hpRemainingPercent = maxHp > 0 ? Math.round((currentHp / maxHp) * 100) : 0;
  const defeatProgressPercent = maxHp > 0 ? Math.round(((maxHp - currentHp) / maxHp) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.nameBox}>
        <View style={styles.nameContent}>
          <Text style={styles.nameLabel}>{isDefeated ? 'Đã đánh bại' : 'Boss hiện tại'}</Text>

          <Text selectable style={styles.nameValue}>
            {boss?.name || 'Chưa có dữ liệu'}
          </Text>

          {totalChallenges > 0 ? (
            <Text style={styles.challengeProgressText}>
              {completedChallenges}/{totalChallenges} thử thách đã hoàn thành
            </Text>
          ) : null}
        </View>

        <Image source={bossImage} style={styles.bossImage} resizeMode="contain" />
      </View>

      <View style={styles.statGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Boss HP</Text>

          <Text style={styles.value}>
            <Text style={[styles.highlight, isDefeated && styles.defeatedHighlight]}>
              {Math.max(0, currentHp)}
            </Text>{' '}
            / {maxHp}
          </Text>
        </View>

        <ProgressBar percent={isDefeated ? 0 : hpRemainingPercent} color={colors.error} />
      </View>

      <View style={styles.statGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Tiến độ hạ Boss</Text>
          <Text style={styles.value}>{defeatProgressPercent}%</Text>
        </View>

        <ProgressBar percent={defeatProgressPercent} color={colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  nameBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nameContent: {
    flex: 1,
    gap: 4,
    paddingRight: 16,
  },
  nameLabel: {
    color: colors.mossText,
    fontSize: 12,
    fontWeight: '700',
  },
  nameValue: {
    color: colors.onSurface,
    fontSize: 20,
    fontWeight: '800',
  },
  challengeProgressText: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
    lineHeight: 17,
  },
  bossImage: {
    flexShrink: 0,
    height: 100,
    width: 130,
  },
  statGroup: {
    gap: 8,
  },
  labelRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: colors.onSurface,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  highlight: {
    color: colors.error,
    fontWeight: '700',
  },
  defeatedHighlight: {
    color: colors.primary,
  },
  progressTrack: {
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 999,
    borderWidth: 1,
    height: 12,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
});

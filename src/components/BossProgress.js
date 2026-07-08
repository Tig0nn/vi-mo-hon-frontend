import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

function ProgressBar({ percent, color }) {
  const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${safePercent}%`, backgroundColor: color }]} />
    </View>
  );
}

export function BossProgress({ boss }) {
  const currentHp = Number(boss?.currentHp ?? boss?.hpRemaining ?? 0);
  const maxHp = Number(boss?.maxHp ?? boss?.totalHp ?? 0);
  const hpRemainingPercent = maxHp > 0 ? Math.round((currentHp / maxHp) * 100) : 0;
  const defeatProgressPercent =
    maxHp > 0 ? Math.round(((maxHp - currentHp) / maxHp) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.nameBox}>
        <Text style={styles.nameLabel}>Boss hiện tại</Text>
        <Text selectable style={styles.nameValue}>
          {boss?.name || 'Chưa có dữ liệu'}
        </Text>
      </View>

      <View style={styles.statGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Boss HP</Text>
          <Text style={styles.value}>
            <Text style={styles.highlight}>{currentHp}</Text> / {maxHp}
          </Text>
        </View>
        <ProgressBar percent={hpRemainingPercent} color={colors.error} />
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
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  nameLabel: {
    color: colors.mossText,
    fontSize: 12,
    fontWeight: '700',
  },
  nameValue: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '800',
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

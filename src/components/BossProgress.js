import { StyleSheet, View } from 'react-native';
import { DataRow } from './DataRow';

function ProgressBar({ percent }) {
  const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${safePercent}%` }]} />
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
    <>
      <DataRow label="Name" value={boss?.name} />
      <DataRow label="HP remaining" value={maxHp > 0 ? `${currentHp} / ${maxHp}` : currentHp} />
      <DataRow label="HP remaining percent" value={`${hpRemainingPercent}%`} />
      <ProgressBar percent={hpRemainingPercent} />
      <DataRow label="Defeat progress" value={`${defeatProgressPercent}%`} />
      <ProgressBar percent={defeatProgressPercent} />
    </>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: '#22c55e',
    borderRadius: 999,
    height: '100%',
  },
});

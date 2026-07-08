import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { DataRow } from '../components/DataRow';
import { IconBadge } from '../components/IconBadge';
import { colors } from '../theme/colors';

export function CharacterScreen({ dashboard }) {
  const profile = (dashboard?.data ?? dashboard ?? {}).profile ?? {};
  const currentXp = Number(profile.xp || 0);
  const level = Number(profile.level || 0);
  const nextLevelXp = level * 100 + 100;
  const xpPercent = nextLevelXp > 0 ? Math.min(100, (currentXp / nextLevelXp) * 100) : 0;
  const avatarInitial = (profile.displayName || profile.name || 'Ví').slice(0, 1).toUpperCase();

  return (
    <View style={styles.container}>
      <Card>
        <View style={styles.avatarSection}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{avatarInitial}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Cấp {level}</Text>
          </View>

          <View style={styles.xpContainer}>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>XP</Text>
              <Text style={styles.xpValue}>
                <Text style={styles.xpHighlight}>{currentXp}</Text> / {nextLevelXp}
              </Text>
            </View>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${xpPercent}%` }]} />
            </View>
          </View>
        </View>
      </Card>

      <Card title="Chỉ số nhân vật" icon={<IconBadge label="NV" />}>
        <DataRow label="Tên hiển thị" value={profile.displayName || profile.name} />
        <DataRow label="XP" value={profile.xp} />
        <DataRow label="Cấp độ" value={profile.level} />
        <DataRow label="Kỷ luật" value={profile.discipline} />
      </Card>

      <Card title="Chỉ số phụ" icon={<IconBadge label="CS" />}>
        <DataRow label="Chuỗi tiết kiệm" value={profile.savingStreak} />
        <DataRow label="Tổng giao dịch đã ghi" value={profile.totalExpensesLogged} />
        <DataRow label="Boss đã hạ" value={profile.bossesDefeated} />
        <Text style={styles.mutedText}>
          Các chỉ số khác sẽ xuất hiện khi backend trả thêm dữ liệu.
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 16,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 60,
    borderWidth: 4,
    height: 120,
    justifyContent: 'center',
    width: 120,
  },
  avatarInitial: {
    color: colors.primary,
    fontSize: 40,
    fontWeight: '800',
  },
  levelBadge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  levelText: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '700',
  },
  xpContainer: {
    gap: 8,
    paddingHorizontal: 8,
    width: '100%',
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '700',
  },
  xpValue: {
    color: colors.onSurface,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  xpHighlight: {
    color: colors.primary,
  },
  xpTrack: {
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 999,
    borderWidth: 1,
    height: 12,
    overflow: 'hidden',
  },
  xpFill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: '100%',
  },
  mutedText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});

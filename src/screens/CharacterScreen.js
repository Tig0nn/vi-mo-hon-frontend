import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { DataRow } from '../components/DataRow';
import { colors } from '../theme/colors';

const mascotImage = require('../../design-reference/ảnh Mascot.png');

function clampPercent(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, numericValue));
}

function ProgressPill({ value, danger = false }) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          { width: `${clampPercent(value)}%`, backgroundColor: danger ? colors.error : colors.primary },
        ]}
      />
    </View>
  );
}

function BadgeItem({ icon, title, subtitle, earned }) {
  return (
    <View style={[styles.badgeItem, !earned && styles.badgeLocked]}>
      <View style={[styles.badgeIcon, earned ? styles.badgeIconEarned : styles.badgeIconLocked]}>
        <Ionicons
          name={earned ? icon : 'lock-closed'}
          size={22}
          color={earned ? colors.surfaceRice : colors.onSurfaceVariant}
        />
      </View>
      <View style={styles.badgeCopy}>
        <Text style={[styles.badgeTitle, !earned && styles.lockedText]}>{title}</Text>
        <Text style={styles.badgeSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

export function CharacterScreen({ dashboard }) {
  const data = dashboard?.data ?? dashboard ?? {};
  const profile = data.profile ?? {};
  const boss = data.boss ?? {};
  const recentExpenses = Array.isArray(data.recentExpenses) ? data.recentExpenses : [];
  const currentXp = Number(profile.xp || 0);
  const level = Number(profile.level || 1);
  const nextLevelXp = level * 100 + 100;
  const xpPercent = nextLevelXp > 0 ? (currentXp / nextLevelXp) * 100 : 0;
  const completedChallenges = Number(boss.completedChallenges || 0);
  const totalChallenges = Number(boss.totalChallenges || 0);
  const chapterPercent = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;
  const bossHpPercent = boss.maxHp > 0 ? (Number(boss.currentHp || 0) / Number(boss.maxHp)) * 100 : 0;

  const badges = [
    {
      icon: 'receipt',
      title: 'Ghi chép đầu tiên',
      subtitle: recentExpenses.length > 0 ? 'Đã có giao dịch gần đây' : 'Ghi một khoản chi để mở khóa',
      earned: recentExpenses.length > 0,
    },
    {
      icon: 'shield-checkmark',
      title: 'Kỷ luật 10 điểm',
      subtitle: `${clampPercent(profile.discipline)}/10 discipline`,
      earned: Number(profile.discipline || 0) >= 10,
    },
    {
      icon: 'trophy',
      title: 'Thử thách đầu tiên',
      subtitle: `${completedChallenges}/${totalChallenges || 1} challenge`,
      earned: completedChallenges > 0,
    },
    {
      icon: 'star',
      title: 'Lên cấp',
      subtitle: `Cấp hiện tại: ${level}`,
      earned: level > 1,
    },
  ];

  return (
    <View style={styles.container}>
      <Card>
        <View style={styles.hero}>
          <View style={styles.mascotWrap}>
            <Image source={mascotImage} style={styles.mascotImage} resizeMode="contain" />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Thành tựu</Text>
            <Text selectable style={styles.heroTitle}>
              Cấp {level}
            </Text>
            <Text selectable style={styles.heroSubtitle}>
              {currentXp} / {nextLevelXp} XP
            </Text>
          </View>
        </View>

        <View style={styles.xpBlock}>
          <View style={styles.rowBetween}>
            <Text style={styles.progressLabel}>Tiến độ cấp độ</Text>
            <Text style={styles.progressValue}>{Math.round(clampPercent(xpPercent))}%</Text>
          </View>
          <ProgressPill value={xpPercent} />
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Huy hiệu</Text>
            <Text style={styles.sectionHint}>Dựa trên dữ liệu dashboard hiện có</Text>
          </View>
          <Ionicons name="ribbon" size={22} color={colors.goldAccent} />
        </View>
        <View style={styles.badgeList}>
          {badges.map((badge) => (
            <BadgeItem key={badge.title} {...badge} />
          ))}
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Tiến độ chapter</Text>
            <Text style={styles.sectionHint}>{boss.name || 'Boss hiện tại'}</Text>
          </View>
          <Ionicons name="flag" size={22} color={colors.primary} />
        </View>

        <View style={styles.chapterBlock}>
          <View style={styles.rowBetween}>
            <Text style={styles.progressLabel}>Challenge đã hoàn thành</Text>
            <Text style={styles.progressValue}>
              {completedChallenges}/{totalChallenges || 0}
            </Text>
          </View>
          <ProgressPill value={chapterPercent} />
        </View>

        <View style={styles.chapterBlock}>
          <View style={styles.rowBetween}>
            <Text style={styles.progressLabel}>HP boss còn lại</Text>
            <Text style={styles.progressValue}>
              {boss.currentHp ?? 0}/{boss.maxHp ?? 0}
            </Text>
          </View>
          <ProgressPill value={bossHpPercent} danger />
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Chỉ số nhân vật</Text>
            <Text style={styles.sectionHint}>Field thật từ profile/dashboard</Text>
          </View>
          <Ionicons name="person" size={22} color={colors.primary} />
        </View>
        <DataRow label="Tên hiển thị" value={profile.displayName || profile.name} />
        <DataRow label="XP" value={profile.xp} />
        <DataRow label="Cấp độ" value={profile.level} />
        <DataRow label="Kỷ luật" value={profile.discipline} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  hero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  mascotWrap: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMist,
    borderColor: colors.primaryFixedDim,
    borderRadius: 999,
    borderWidth: 2,
    height: 96,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 96,
  },
  mascotImage: {
    height: 86,
    width: 118,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroEyebrow: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '900',
  },
  heroTitle: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  heroSubtitle: {
    color: colors.onSurface,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
  },
  xpBlock: {
    gap: 8,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '800',
  },
  progressValue: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
  progressTrack: {
    backgroundColor: colors.primaryFixedDim,
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionHint: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  badgeList: {
    gap: 10,
  },
  badgeItem: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  badgeLocked: {
    opacity: 0.68,
  },
  badgeIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  badgeIconEarned: {
    backgroundColor: colors.goldAccent,
  },
  badgeIconLocked: {
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderWidth: 1,
  },
  badgeCopy: {
    flex: 1,
    minWidth: 0,
  },
  badgeTitle: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '900',
  },
  lockedText: {
    color: colors.onSurfaceVariant,
  },
  badgeSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  chapterBlock: {
    gap: 8,
  },
});

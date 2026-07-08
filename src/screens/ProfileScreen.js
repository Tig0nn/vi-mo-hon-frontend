import { StyleSheet, View } from 'react-native';
import { Card } from '../components/Card';
import { DataRow } from '../components/DataRow';
import { IconBadge } from '../components/IconBadge';

export function ProfileScreen({ dashboard }) {
  const profile = (dashboard?.data ?? dashboard ?? {}).profile ?? {};

  return (
    <View style={styles.container}>
      <Card title="Hồ sơ" icon={<IconBadge label="HS" />}>
        <DataRow label="Tên hiển thị" value={profile.displayName || profile.name} />
        <DataRow label="XP" value={profile.xp} />
        <DataRow label="Cấp độ" value={profile.level} />
        <DataRow label="Kỷ luật" value={profile.discipline} />
      </Card>

      <Card title="Kế hoạch tiền bạc" icon={<IconBadge label="₫" />}>
        <DataRow label="Ngân sách" value={profile.monthlyBudget ?? profile.budget} />
        <DataRow label="Đã chi tháng này" value={profile.monthlySpent} />
        <DataRow label="Mục tiêu" value={profile.goal} />
        <DataRow label="Tác nhân chi tiêu" value={profile.triggers} />
        <DataRow label="Giọng nhắc nhở" value={profile.tone} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});

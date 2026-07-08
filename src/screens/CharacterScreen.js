import { StyleSheet, Text } from 'react-native';
import { DataRow } from '../components/DataRow';
import { Section } from '../components/Section';

export function CharacterScreen({ dashboard }) {
  const profile = (dashboard?.data ?? dashboard ?? {}).profile ?? {};

  return (
    <>
      <Section title="Character">
        <DataRow label="Display name" value={profile.displayName || profile.name} />
        <DataRow label="XP" value={profile.xp} />
        <DataRow label="Level" value={profile.level} />
        <DataRow label="Discipline" value={profile.discipline} />
      </Section>

      <Section title="Other stats">
        <DataRow label="Saving streak" value={profile.savingStreak} />
        <DataRow label="Total expenses logged" value={profile.totalExpensesLogged} />
        <DataRow label="Bosses defeated" value={profile.bossesDefeated} />
        <Text style={styles.mutedText}>
          More character stats can appear here once the backend returns them.
        </Text>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  mutedText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
});

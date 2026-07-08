import { DataRow } from '../components/DataRow';
import { Section } from '../components/Section';

export function ProfileScreen({ dashboard }) {
  const profile = (dashboard?.data ?? dashboard ?? {}).profile ?? {};

  return (
    <>
      <Section title="Profile">
        <DataRow label="Display name" value={profile.displayName || profile.name} />
        <DataRow label="XP" value={profile.xp} />
        <DataRow label="Level" value={profile.level} />
        <DataRow label="Discipline" value={profile.discipline} />
      </Section>

      <Section title="Money plan">
        <DataRow label="Budget" value={profile.monthlyBudget ?? profile.budget} />
        <DataRow label="Monthly spent" value={profile.monthlySpent} />
        <DataRow label="Goal" value={profile.goal} />
        <DataRow label="Triggers" value={profile.triggers} />
        <DataRow label="Tone" value={profile.tone} />
      </Section>
    </>
  );
}

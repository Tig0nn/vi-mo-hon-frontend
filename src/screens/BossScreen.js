import { BossProgress } from '../components/BossProgress';
import { ChallengeList } from '../components/ChallengeList';
import { Section } from '../components/Section';

export function BossScreen({ dashboard, completingChallengeId, onCompleteChallenge }) {
  const data = dashboard?.data ?? dashboard ?? {};

  return (
    <>
      <Section title="Boss">
        <BossProgress boss={data.boss ?? {}} />
      </Section>

      <Section title="Active challenges">
        <ChallengeList
          challenges={data.activeChallenges}
          completingChallengeId={completingChallengeId}
          onCompleteChallenge={onCompleteChallenge}
        />
      </Section>
    </>
  );
}

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildBossChallengeList,
  getTodayChallenge,
} = require('../src/utils/bossChallenges.cjs');

test('builds the full boss sequence while keeping only today challenge active', () => {
  const dashboard = {
    boss: {
      completedChallenges: 2,
      totalChallenges: 5,
      status: 'active',
    },
    todayChallenge: {
      id: 'challenge-live-3',
      title: 'Nhiệm vụ thật từ backend',
      sequenceOrder: 3,
      totalChallenges: 5,
      rewardXp: 30,
      bossDamage: 20,
    },
  };

  const challenges = buildBossChallengeList(dashboard);

  assert.equal(challenges.length, 5);
  assert.deepEqual(challenges.map((item) => item.status), [
    'completed',
    'completed',
    'active',
    'locked',
    'locked',
  ]);
  assert.equal(challenges[2].id, 'challenge-live-3');
  assert.equal(challenges[2].title, 'Nhiệm vụ thật từ backend');
});

test('prefers an allChallenges payload when backend provides it', () => {
  const dashboard = {
    boss: { completedChallenges: 1, totalChallenges: 2, status: 'active' },
    allChallenges: [
      { id: 'one', sequenceOrder: 1, title: 'Một', status: 'completed' },
      { id: 'two', sequenceOrder: 2, title: 'Hai', status: 'active' },
    ],
    todayChallenge: { id: 'two', sequenceOrder: 2, title: 'Hai' },
  };

  const challenges = buildBossChallengeList(dashboard);

  assert.equal(challenges.length, 2);
  assert.equal(challenges[0].title, 'Một');
  assert.equal(challenges[1].status, 'active');
  assert.equal(challenges[1].isCatalogFallback, false);
});

test('falls back to the first active challenge for older dashboard responses', () => {
  const active = { id: 'legacy-active', sequenceOrder: 1 };
  assert.equal(getTodayChallenge({ activeChallenges: [active] }), active);
});

const DEFAULT_BOSS_CHALLENGES = [
  {
    sequenceOrder: 1,
    title: 'Không uống trà sữa hôm nay',
    description: 'Không uống trà sữa trong ngày hôm nay.',
    rewardXp: 30,
    bossDamage: 20,
    disciplineReward: 5,
  },
  {
    sequenceOrder: 2,
    title: 'Ghi lại mọi khoản mua đồ uống',
    description: 'Ghi lại tất cả khoản chi cho đồ uống trong ngày.',
    rewardXp: 30,
    bossDamage: 20,
    disciplineReward: 5,
  },
  {
    sequenceOrder: 3,
    title: 'Không mua đồ uống sau 20:00',
    description: 'Sau 20:00, dùng đồ uống có sẵn thay vì mua thêm.',
    rewardXp: 30,
    bossDamage: 20,
    disciplineReward: 5,
  },
  {
    sequenceOrder: 4,
    title: 'Chọn món rẻ hơn bình thường',
    description: 'Nếu mua đồ uống, chọn một lựa chọn rẻ hơn thường ngày.',
    rewardXp: 30,
    bossDamage: 20,
    disciplineReward: 5,
  },
  {
    sequenceOrder: 5,
    title: 'Giữ chi tiêu đồ uống dưới 30.000đ',
    description: 'Tổng chi tiêu đồ uống hôm nay không vượt quá 30.000đ.',
    rewardXp: 30,
    bossDamage: 20,
    disciplineReward: 8,
  },
];

function getDashboardData(dashboard) {
  return dashboard?.data ?? dashboard ?? {};
}

function getTodayChallenge(dashboard) {
  const data = getDashboardData(dashboard);
  if (data.todayChallenge) return data.todayChallenge;
  return Array.isArray(data.activeChallenges) ? data.activeChallenges[0] ?? null : null;
}

function getChallengeOrder(challenge, fallbackOrder) {
  const order = Number(challenge?.sequenceOrder ?? challenge?.sequence_order ?? fallbackOrder);
  return Number.isFinite(order) && order > 0 ? order : fallbackOrder;
}

function getAllChallengeSource(data) {
  const candidates = [
    data.allChallenges,
    data.boss?.challenges,
    data.challenges,
  ];

  return candidates.find((value) => Array.isArray(value) && value.length > 0) ?? null;
}

function isSameChallenge(left, right) {
  if (!left || !right) return false;
  const leftId = left.id ?? left._id;
  const rightId = right.id ?? right._id;
  if (leftId && rightId) return leftId === rightId;

  return getChallengeOrder(left, 0) === getChallengeOrder(right, -1);
}

function buildBossChallengeList(dashboard) {
  const data = getDashboardData(dashboard);
  const boss = data.boss ?? {};
  const todayChallenge = getTodayChallenge(data);
  const completedChallenges = Math.max(0, Number(boss.completedChallenges ?? 0));
  const configuredTotal = Math.max(0, Number(boss.totalChallenges ?? 0));
  const apiChallenges = getAllChallengeSource(data);
  const todayOrder = todayChallenge
    ? getChallengeOrder(todayChallenge, completedChallenges + 1)
    : null;

  // TODO: remove this catalog fallback when the dashboard API exposes allChallenges.
  const fallbackTotal = configuredTotal > 0 ? configuredTotal : DEFAULT_BOSS_CHALLENGES.length;
  const source = apiChallenges ?? DEFAULT_BOSS_CHALLENGES.slice(0, fallbackTotal);
  const totalChallenges = Math.max(configuredTotal, source.length, todayChallenge ? 1 : 0);

  return source
    .map((sourceChallenge, index) => {
      const sequenceOrder = getChallengeOrder(sourceChallenge, index + 1);
      const matchesToday =
        isSameChallenge(sourceChallenge, todayChallenge) ||
        (todayOrder !== null && sequenceOrder === todayOrder);
      const mergedChallenge = matchesToday
        ? { ...sourceChallenge, ...todayChallenge }
        : { ...sourceChallenge };
      const explicitStatus = mergedChallenge.status;

      let status = 'locked';
      if (boss.status === 'defeated' || explicitStatus === 'completed' || sequenceOrder <= completedChallenges) {
        status = 'completed';
      } else if (matchesToday || explicitStatus === 'active') {
        status = 'active';
      } else if (explicitStatus === 'failed' || explicitStatus === 'skipped') {
        status = explicitStatus;
      }

      return {
        ...mergedChallenge,
        sequenceOrder,
        totalChallenges,
        status,
        isCatalogFallback: !apiChallenges,
      };
    })
    .sort((left, right) => left.sequenceOrder - right.sequenceOrder);
}

module.exports = {
  DEFAULT_BOSS_CHALLENGES,
  buildBossChallengeList,
  getTodayChallenge,
};

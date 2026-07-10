export const GOAL_LABELS = {
  save_money: 'Tiết kiệm cho một kế hoạch cá nhân',
  reduce_impulse_shopping: 'Giảm mua sắm bốc đồng',
  reduce_food_drink: 'Giảm chi cho ăn uống',
  reduce_sale_spending: 'Bớt mua hàng vì giảm giá',
  emergency_fund: 'Tạo quỹ khẩn cấp',
  other: 'Mục tiêu cá nhân',
};

export function formatVnd(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 'Chưa có dữ liệu';
  }

  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(amount)}đ`;
}

export function formatTargetDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return 'Chưa có dữ liệu';
  }

  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export function isCompleteProfile(profile) {
  const targetAmount = Number(profile?.targetAmount);
  const monthlyBudget = Number(profile?.monthlyBudget);
  const hasFutureDate =
    typeof profile?.targetDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(profile.targetDate) &&
    new Date(`${profile.targetDate}T00:00:00`).getTime() > new Date().setHours(0, 0, 0, 0);

  return Boolean(
    profile?.displayName?.trim() &&
      profile?.mainGoal &&
      Number.isInteger(targetAmount) &&
      targetAmount > 0 &&
      Number.isInteger(monthlyBudget) &&
      monthlyBudget > 0 &&
      hasFutureDate &&
      Array.isArray(profile?.triggers) &&
      profile.triggers.length
  );
}

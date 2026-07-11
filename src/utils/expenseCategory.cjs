const CATEGORY_LABELS = {
  FOOD_DRINK: 'Ăn uống',
  SHOPPING: 'Mua sắm',
  ENTERTAINMENT: 'Giải trí',
  TRANSPORT: 'Di chuyển',
  EDUCATION: 'Học tập',
  SAVING: 'Tiết kiệm',
};

function formatExpenseCategory(value) {
  if (typeof value !== 'string') return null;

  const category = value.trim().toUpperCase();
  if (!category || category === 'OTHER') return null;

  return CATEGORY_LABELS[category] || null;
}

module.exports = { CATEGORY_LABELS, formatExpenseCategory };

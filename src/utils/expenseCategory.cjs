const CATEGORY_LABELS = {
  FOOD_DRINK: 'Ăn uống',
  SHOPPING: 'Mua sắm',
  TRANSPORT: 'Đi lại',
  ENTERTAINMENT: 'Giải trí',
  EDUCATION: 'Học tập',
  SAVING: 'Tiết kiệm',
  OTHER: 'Khác',
};

const CATEGORY_SHORT_LABELS = {
  FOOD_DRINK: 'AU',
  SHOPPING: 'MS',
  TRANSPORT: 'DL',
  ENTERTAINMENT: 'GT',
  EDUCATION: 'HT',
  SAVING: 'TK',
  OTHER: 'K',
};

const CATEGORY_KEYWORDS = {
  FOOD_DRINK: [
    'ăn', 'uống', 'trà sữa', 'cà phê', 'cafe', 'coffee', 'cơm', 'phở', 'bún',
    'bánh', 'nước', 'đồ ăn', 'ăn trưa', 'ăn tối', 'ăn sáng', 'snack',
  ],
  SHOPPING: [
    'mua sắm', 'shopee', 'tiktok shop', 'lazada', 'quần', 'áo', 'giày', 'túi',
    'mỹ phẩm', 'đồng hồ', 'phụ kiện', 'sale',
  ],
  TRANSPORT: [
    'grab', 'be ', 'taxi', 'xăng', 'xe buýt', 'bus', 'gửi xe', 'đi lại', 'vé xe',
  ],
  ENTERTAINMENT: [
    'phim', 'netflix', 'spotify', 'game', 'karaoke', 'concert', 'giải trí', 'vé xem',
  ],
  EDUCATION: [
    'sách', 'khóa học', 'học phí', 'tài liệu', 'giáo trình', 'udemy', 'coursera',
  ],
  SAVING: ['tiết kiệm', 'bỏ heo', 'gửi tiết kiệm', 'quỹ khẩn cấp'],
};

function normalizeCategory(value) {
  if (typeof value !== 'string') return null;
  const category = value.trim().toUpperCase();
  return CATEGORY_LABELS[category] ? category : null;
}

function formatExpenseCategory(value) {
  const category = normalizeCategory(value);
  return category ? CATEGORY_LABELS[category] : null;
}

function getExpenseCategoryShortLabel(value) {
  const category = normalizeCategory(value) || 'OTHER';
  return CATEGORY_SHORT_LABELS[category];
}

function containsKeyword(text, keyword) {
  if (keyword.trim().includes(' ')) return text.includes(keyword.trim());

  const tokens = text.split(/[^\p{L}\p{N}_]+/u).filter(Boolean);
  return tokens.includes(keyword.trim());
}

function inferExpenseCategory(text) {
  if (typeof text !== 'string') return 'OTHER';
  const normalizedText = text.trim().toLocaleLowerCase('vi-VN');
  if (!normalizedText) return 'OTHER';

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => containsKeyword(normalizedText, keyword))) {
      return category;
    }
  }

  return 'OTHER';
}

module.exports = {
  CATEGORY_LABELS,
  CATEGORY_SHORT_LABELS,
  formatExpenseCategory,
  getExpenseCategoryShortLabel,
  inferExpenseCategory,
  normalizeCategory,
};

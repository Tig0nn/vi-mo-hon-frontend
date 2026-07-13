const test = require('node:test');
const assert = require('node:assert/strict');

const {
  formatExpenseCategory,
  getExpenseCategoryShortLabel,
  inferExpenseCategory,
} = require('../src/utils/expenseCategory.cjs');

test('maps all supported API category codes to Vietnamese labels', () => {
  assert.equal(formatExpenseCategory('FOOD_DRINK'), 'Ăn uống');
  assert.equal(formatExpenseCategory('shopping'), 'Mua sắm');
  assert.equal(formatExpenseCategory('ENTERTAINMENT'), 'Giải trí');
  assert.equal(formatExpenseCategory('TRANSPORT'), 'Đi lại');
  assert.equal(formatExpenseCategory('EDUCATION'), 'Học tập');
  assert.equal(formatExpenseCategory('SAVING'), 'Tiết kiệm');
  assert.equal(formatExpenseCategory('OTHER'), 'Khác');
});

test('does not expose missing or unknown raw category codes', () => {
  for (const category of ['', null, undefined, 'NEW_BACKEND_CODE']) {
    assert.equal(formatExpenseCategory(category), null);
  }
});

test('provides compact labels for expense icons', () => {
  assert.equal(getExpenseCategoryShortLabel('FOOD_DRINK'), 'AU');
  assert.equal(getExpenseCategoryShortLabel('SHOPPING'), 'MS');
  assert.equal(getExpenseCategoryShortLabel('NEW_BACKEND_CODE'), 'K');
});

test('infers a useful default category from quick expense text', () => {
  assert.equal(inferExpenseCategory('trà sữa 45k'), 'FOOD_DRINK');
  assert.equal(inferExpenseCategory('mua áo trên Shopee 199k'), 'SHOPPING');
  assert.equal(inferExpenseCategory('đổ xăng 70k'), 'TRANSPORT');
  assert.equal(inferExpenseCategory('xem phim 120k'), 'ENTERTAINMENT');
  assert.equal(inferExpenseCategory('một khoản lạ 10k'), 'OTHER');
});

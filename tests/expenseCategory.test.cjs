const test = require('node:test');
const assert = require('node:assert/strict');

const { formatExpenseCategory } = require('../src/utils/expenseCategory.cjs');

test('hides missing and OTHER expense categories', () => {
  for (const category of ['OTHER', 'other', '', null, undefined]) {
    assert.equal(formatExpenseCategory(category), null);
  }
});

test('maps meaningful API category codes to Vietnamese labels', () => {
  assert.equal(formatExpenseCategory('FOOD_DRINK'), 'Ăn uống');
  assert.equal(formatExpenseCategory('shopping'), 'Mua sắm');
  assert.equal(formatExpenseCategory('ENTERTAINMENT'), 'Giải trí');
  assert.equal(formatExpenseCategory('TRANSPORT'), 'Di chuyển');
  assert.equal(formatExpenseCategory('EDUCATION'), 'Học tập');
  assert.equal(formatExpenseCategory('SAVING'), 'Tiết kiệm');
});

test('does not expose an unknown raw category code', () => {
  assert.equal(formatExpenseCategory('NEW_BACKEND_CODE'), null);
});

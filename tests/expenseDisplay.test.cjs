const test = require('node:test');
const assert = require('node:assert/strict');

const {
  formatExpenseAmount,
  formatExpenseDateTime,
  getExpenseTitle,
  stripAmountFromExpenseText,
} = require('../src/utils/expenseDisplay.cjs');

test('derives a readable expense title from quick input text', () => {
  assert.equal(stripAmountFromExpenseText('trà sữa 45k'), 'trà sữa');
  assert.equal(getExpenseTitle({ text: 'ăn trưa 55.000đ' }), 'ăn trưa');
  assert.equal(getExpenseTitle({ title: 'Xe công nghệ', text: 'grab 35k' }), 'Xe công nghệ');
});

test('formats expense amount as a negative VND value', () => {
  assert.equal(formatExpenseAmount(45000), '-45.000đ');
  assert.equal(formatExpenseAmount('35000'), '-35.000đ');
});

test('formats today and yesterday timestamps for the recent list', () => {
  const now = new Date(2026, 6, 13, 18, 0, 0);
  assert.equal(
    formatExpenseDateTime({ occurredAt: new Date(2026, 6, 13, 14, 30).toISOString() }, now),
    'Hôm nay, 14:30'
  );
  assert.equal(
    formatExpenseDateTime({ occurredAt: new Date(2026, 6, 12, 12, 0).toISOString() }, now),
    'Hôm qua, 12:00'
  );
});

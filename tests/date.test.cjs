const test = require('node:test');
const assert = require('node:assert/strict');

const {
  formatIsoDateForDisplay,
  getTargetDateError,
  isoDateFromLocalDate,
  parseIsoDate,
} = require('../src/utils/date.cjs');

test('formats an API ISO date for Vietnamese display', () => {
  assert.equal(formatIsoDateForDisplay('2027-12-31'), '31/12/2027');
});

test('converts a locally selected date back to the API format', () => {
  assert.equal(isoDateFromLocalDate(new Date(2027, 11, 31)), '2027-12-31');
});

test('rejects impossible calendar dates', () => {
  assert.equal(parseIsoDate('2027-02-31'), null);
  assert.equal(
    getTargetDateError('2027-02-31', new Date(2026, 6, 11)),
    'Vui lòng chọn một ngày hợp lệ.'
  );
});

test('requires the target date to be after today', () => {
  const today = new Date(2026, 6, 11);

  assert.equal(
    getTargetDateError('2026-07-11', today),
    'Thời hạn phải sau ngày hôm nay.'
  );
  assert.equal(getTargetDateError('2026-07-12', today), '');
});

const INVALID_DATE_MESSAGE = 'Vui lòng chọn một ngày hợp lệ.';
const NON_FUTURE_DATE_MESSAGE = 'Thời hạn phải sau ngày hôm nay.';

function padDatePart(value) {
  return String(value).padStart(2, '0');
}

function parseIsoDate(value) {
  if (typeof value !== 'string') return null;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

function isoDateFromLocalDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';

  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join('-');
}

function formatIsoDateForDisplay(value) {
  const date = parseIsoDate(value);
  if (!date) return '';

  return [
    padDatePart(date.getDate()),
    padDatePart(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/');
}

function startOfLocalDay(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function tomorrow(date = new Date()) {
  const result = startOfLocalDay(date);
  result.setDate(result.getDate() + 1);
  return result;
}

function getTargetDateError(value, today = new Date()) {
  const date = parseIsoDate(value);
  if (!date) return INVALID_DATE_MESSAGE;
  if (date.getTime() <= startOfLocalDay(today).getTime()) return NON_FUTURE_DATE_MESSAGE;
  return '';
}

module.exports = {
  INVALID_DATE_MESSAGE,
  NON_FUTURE_DATE_MESSAGE,
  formatIsoDateForDisplay,
  getTargetDateError,
  isoDateFromLocalDate,
  parseIsoDate,
  tomorrow,
};

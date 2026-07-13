function getExpenseTimestamp(expense) {
  return expense?.occurredAt || expense?.spentAt || expense?.createdAt || expense?.created_at || null;
}

function stripAmountFromExpenseText(value) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/(?:^|\s)[+-]?\d[\d.,]*(?:\s?)(?:k|m|đ|₫|vnd)?(?=\s|$)/giu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getExpenseTitle(expense, fallbackIndex = 0) {
  const explicitTitle = expense?.title || expense?.name || expense?.description;
  if (typeof explicitTitle === 'string' && explicitTitle.trim()) {
    return explicitTitle.trim();
  }

  const rawText = expense?.text || expense?.rawText || expense?.raw_text;
  const derivedTitle = stripAmountFromExpenseText(rawText);
  if (derivedTitle) return derivedTitle;

  return `Khoản chi ${fallbackIndex + 1}`;
}

function formatExpenseAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';

  return `-${new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))}đ`;
}

function isSameLocalDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatExpenseDateTime(expense, now = new Date()) {
  const timestamp = getExpenseTimestamp(expense);
  if (!timestamp) return 'Chưa rõ thời gian';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Chưa rõ thời gian';

  const time = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  if (isSameLocalDay(date, now)) return `Hôm nay, ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameLocalDay(date, yesterday)) return `Hôm qua, ${time}`;

  const calendarDate = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

  return `${calendarDate}, ${time}`;
}

module.exports = {
  formatExpenseAmount,
  formatExpenseDateTime,
  getExpenseTimestamp,
  getExpenseTitle,
  stripAmountFromExpenseText,
};

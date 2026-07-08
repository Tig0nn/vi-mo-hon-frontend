export function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'No data yet';
  }

  if (typeof value === 'number') {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return value.length ? value.map(formatValue).join(', ') : 'No data yet';
  }

  return String(value);
}

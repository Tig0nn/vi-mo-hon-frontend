export function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'Chưa có dữ liệu';
  }

  if (typeof value === 'number') {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'Có' : 'Không';
  }

  if (Array.isArray(value)) {
    return value.length ? value.map(formatValue).join(', ') : 'Chưa có dữ liệu';
  }

  return String(value);
}

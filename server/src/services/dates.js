const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(n) {
  return String(n).padStart(2, '0');
}

function format(y, m, d) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function isValidDateString(str) {
  if (typeof str !== 'string') return false;
  const match = DATE_RE.exec(str);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  if (m < 1 || m > 12 || d < 1) return false;
  return d <= daysInMonth(y, m);
}

function todayString(now = new Date()) {
  return format(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function isFutureDate(dateStr, today = todayString()) {
  return dateStr > today;
}

function dailyRange(dateStr) {
  return { from: dateStr, to: dateStr };
}

function monthToDateRange(dateStr) {
  const [y, m] = dateStr.split('-').map(Number);
  return { from: format(y, m, 1), to: dateStr };
}

function previousMonthRange(dateStr) {
  let [y, m] = dateStr.split('-').map(Number);
  m -= 1;
  if (m === 0) {
    m = 12;
    y -= 1;
  }
  return { from: format(y, m, 1), to: format(y, m, daysInMonth(y, m)) };
}

module.exports = {
  isValidDateString,
  todayString,
  isFutureDate,
  dailyRange,
  monthToDateRange,
  previousMonthRange,
};
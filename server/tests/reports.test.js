const test = require('node:test');
const assert = require('node:assert/strict');
const { computeStats } = require('../src/services/reports');
const {
  dailyRange,
  monthToDateRange,
  previousMonthRange,
  isValidDateString,
} = require('../src/services/dates');

test('computeStats gives highest, lowest, average (1 decimal) and count', () => {
  const stats = computeStats([{ value: 100 }, { value: 111 }, { value: 140 }]);
  assert.deepEqual(stats, { count: 3, highest: 140, lowest: 100, average: 117 });
});

test('average is rounded to 1 decimal place', () => {
  assert.equal(computeStats([{ value: 100 }, { value: 101 }, { value: 101 }]).average, 100.7);
});

test('empty list returns null so the UI can show an empty state', () => {
  assert.equal(computeStats([]), null);
});

test('daily range is just the selected date', () => {
  assert.deepEqual(dailyRange('2026-10-15'), { from: '2026-10-15', to: '2026-10-15' });
});

test('month-to-date runs from the 1st to the selected date', () => {
  assert.deepEqual(monthToDateRange('2026-10-15'), { from: '2026-10-01', to: '2026-10-15' });
});

test('monthly is the whole previous month (matches the assignment example)', () => {
  assert.deepEqual(previousMonthRange('2026-10-15'), { from: '2026-09-01', to: '2026-09-30' });
});

test('monthly handles January -> December of the previous year', () => {
  assert.deepEqual(previousMonthRange('2026-01-20'), { from: '2025-12-01', to: '2025-12-31' });
});

test('monthly handles leap-year February', () => {
  assert.deepEqual(previousMonthRange('2028-03-10'), { from: '2028-02-01', to: '2028-02-29' });
  assert.deepEqual(previousMonthRange('2026-03-10'), { from: '2026-02-01', to: '2026-02-28' });
});

test('isValidDateString', () => {
  assert.equal(isValidDateString('2028-02-29'), true);
  assert.equal(isValidDateString('2026-02-29'), false);
  assert.equal(isValidDateString(20261015), false);
});
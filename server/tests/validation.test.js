const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateReadingInput,
  checkDayRules,
  validateRegistration,
  MESSAGES,
} = require('../src/services/validation');

const TODAY = '2026-10-15';
const valid = { date: '2026-10-15', slot: 'morning', value: 110 };

test('accepts a valid reading and returns the integer value', () => {
  const { errors, value } = validateReadingInput({ ...valid, value: '110' }, TODAY);
  assert.deepEqual(errors, {});
  assert.equal(value, 110);
});

test('value is required', () => {
  for (const missing of [undefined, null, '', '   ']) {
    const { errors } = validateReadingInput({ ...valid, value: missing }, TODAY);
    assert.equal(errors.value, 'Please enter a glucose value.');
  }
});

test('value must be a whole number between 40 and 600', () => {
  const bad = [39, 601, 0, -5, 100.5, 'abc', '12.3'];
  for (const value of bad) {
    const { errors } = validateReadingInput({ ...valid, value }, TODAY);
    assert.equal(errors.value, 'Value must be between 40 and 600 mg/dl.', `value ${value}`);
  }
});

test('boundary values 40 and 600 are accepted', () => {
  for (const value of [40, 600]) {
    const { errors } = validateReadingInput({ ...valid, value }, TODAY);
    assert.equal(errors.value, undefined);
  }
});

test('date cannot be in the future', () => {
  const { errors } = validateReadingInput({ ...valid, date: '2026-10-16' }, TODAY);
  assert.equal(errors.date, 'Date cannot be in the future.');
});

test('today is allowed', () => {
  const { errors } = validateReadingInput({ ...valid, date: TODAY }, TODAY);
  assert.equal(errors.date, undefined);
});

test('rejects impossible calendar dates', () => {
  for (const date of ['2026-02-30', '2026-13-01', 'yesterday', '15/10/2026']) {
    const { errors } = validateReadingInput({ ...valid, date }, TODAY);
    assert.equal(errors.date, MESSAGES.dateInvalid, date);
  }
});

test('slot must be one of the four known slots', () => {
  const { errors } = validateReadingInput({ ...valid, slot: 'midnight' }, TODAY);
  assert.equal(errors.slot, MESSAGES.slotRequired);
});

test('only one reading per slot per day', () => {
  const result = checkDayRules('after_lunch', [{ slot: 'after_lunch' }]);
  assert.equal(result.slot, 'You already have an After lunch reading for this date.');
});

test('a different slot on the same day is fine', () => {
  assert.equal(checkDayRules('after_dinner', [{ slot: 'after_lunch' }]), null);
});

test('maximum 4 readings per day', () => {
  const existing = [
    { slot: 'morning' },
    { slot: 'after_breakfast' },
    { slot: 'after_lunch' },
    { slot: 'after_dinner' },
  ];
  assert.equal(checkDayRules('morning', existing).slot, 'You can add only 4 readings per day.');
});

test('registration requires name, valid email and 8+ char password', () => {
  assert.deepEqual(Object.keys(validateRegistration({})).sort(), ['email', 'name', 'password']);
  assert.equal(
    validateRegistration({ name: 'A', email: 'not-an-email', password: 'longenough' }).email,
    'Please enter a valid email address.',
  );
  assert.equal(
    validateRegistration({ name: 'A', email: 'a@b.co', password: 'short' }).password,
    'Password must be at least 8 characters.',
  );
  assert.deepEqual(validateRegistration({ name: 'A', email: 'a@b.co', password: 'longenough' }), {});
});
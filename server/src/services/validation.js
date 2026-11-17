const { isValidDateString, isFutureDate } = require('./dates');

const SLOTS = {
  morning: 'Morning (fasting)',
  after_breakfast: 'After breakfast',
  after_lunch: 'After lunch',
  after_dinner: 'After dinner',
};

const MIN_VALUE = 40;
const MAX_VALUE = 600;
const MAX_READINGS_PER_DAY = 4;

const MESSAGES = {
  valueRequired: 'Please enter a glucose value.',
  valueRange: `Value must be between ${MIN_VALUE} and ${MAX_VALUE} mg/dl.`,
  dateRequired: 'Please choose a date.',
  dateInvalid: 'Please enter a valid date (YYYY-MM-DD).',
  dateFuture: 'Date cannot be in the future.',
  slotRequired: 'Please choose a time slot.',
  maxPerDay: `You can add only ${MAX_READINGS_PER_DAY} readings per day.`,
  duplicateSlot: (slot) => `You already have an ${SLOTS[slot]} reading for this date.`,
};

function validateReadingInput(input, today) {
  const errors = {};
  const { date, slot } = input || {};
  let value = input ? input.value : undefined;

  if (value === undefined || value === null || String(value).trim() === '') {
    errors.value = MESSAGES.valueRequired;
  } else {
    const num = typeof value === 'number' ? value : Number(String(value).trim());
    if (!Number.isInteger(num) || num < MIN_VALUE || num > MAX_VALUE) {
      errors.value = MESSAGES.valueRange;
    } else {
      value = num;
    }
  }
  if (!date) {
    errors.date = MESSAGES.dateRequired;
  } else if (!isValidDateString(date)) {
    errors.date = MESSAGES.dateInvalid;
  } else if (isFutureDate(date, today)) {
    errors.date = MESSAGES.dateFuture;
  }

  if (!slot || !Object.prototype.hasOwnProperty.call(SLOTS, slot)) {
    errors.slot = MESSAGES.slotRequired;
  }

  return { errors, value };
}

function checkDayRules(slot, existing) {
  if (existing.length >= MAX_READINGS_PER_DAY) {
    return { slot: MESSAGES.maxPerDay };
  }
  if (existing.some((r) => r.slot === slot)) {
    return { slot: MESSAGES.duplicateSlot(slot) };
  }
  return null;
}

function validateRegistration({ name, email, password } = {}) {
  const errors = {};
  if (!name || !String(name).trim()) errors.name = 'Please enter your name.';
  if (!email || !String(email).trim()) {
    errors.email = 'Please enter your email.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Please enter a password.';
  } else if (String(password).length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  return errors;
}

module.exports = {
  SLOTS,
  MIN_VALUE,
  MAX_VALUE,
  MAX_READINGS_PER_DAY,
  MESSAGES,
  validateReadingInput,
  checkDayRules,
  validateRegistration,
};
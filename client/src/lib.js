export const SLOTS = [
  { key: 'morning', label: 'Morning (fasting)' },
  { key: 'after_breakfast', label: 'After breakfast' },
  { key: 'after_lunch', label: 'After lunch' },
  { key: 'after_dinner', label: 'After dinner' },
];

export const slotLabel = (key) => SLOTS.find((s) => s.key === key)?.label ?? key;

function pad(n) {
  return String(n).padStart(2, '0');
}

export function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function prettyDate(dateStr) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${months[m - 1]} ${y}`;
}


export function validateReadingForm({ date, slot, value }) {
  const errors = {};
  if (value === '' || value === null || value === undefined) {
    errors.value = 'Please enter a glucose value.';
  } else {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 40 || n > 600) {
      errors.value = 'Value must be between 40 and 600 mg/dl.';
    }
  }
  if (!date) errors.date = 'Please choose a date.';
  else if (date > todayString()) errors.date = 'Date cannot be in the future.';
  if (!slot) errors.slot = 'Please choose a time slot.';
  return errors;
}
const SLOTS = {
  morning: 'Morning (fasting)',
  after_breakfast: 'After breakfast',
  after_lunch: 'After lunch',
  after_dinner: 'After dinner',
};
const pad = (n) => String(n).padStart(2, '0');
const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const isValidDate = (s) => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

// Returns an array of error messages (empty array = valid)
function validateReading({ date, slot, value }, today = todayString()) {
  const errors = [];
  if (value === undefined || value === null || String(value).trim() === '') {
    errors.push('Please enter a glucose value.');
  } else {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 40 || n > 600) errors.push('Value must be between 40 and 600 mg/dl.');
  }
  if (!SLOTS[slot]) errors.push('Please choose a time slot.');
  if (!isValidDate(date)) errors.push('Please choose a valid date.');
  else if (date > today) errors.push('Date cannot be in the future.');
  return errors;
}

function validateSignup({ name, email, password }) {
  const errors = [];
  if (!name || !name.trim()) errors.push('Please enter your name.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Please enter a valid email.');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');
  return errors;
}

module.exports = { SLOTS, todayString, isValidDate, validateReading, validateSignup };

const { validateReading } = require('../src/validation');
const TODAY = '2026-10-15';
const ok = { date: '2026-10-15', slot: 'after_lunch', value: 120 };

describe('validateReading', () => {
  test('accepts a valid reading', () => expect(validateReading(ok, TODAY)).toEqual([]));
  test('value is required', () => expect(validateReading({ ...ok, value: '' }, TODAY)).toContain('Please enter a glucose value.'));
  test.each([39, 601, 120.5, 'abc'])('rejects value %p', (value) =>
    expect(validateReading({ ...ok, value }, TODAY)).toContain('Value must be between 40 and 600 mg/dl.'));
  test.each([40, 600])('accepts boundary %p', (value) => expect(validateReading({ ...ok, value }, TODAY)).toEqual([]));
  test('rejects future date', () => expect(validateReading({ ...ok, date: '2026-10-16' }, TODAY)).toContain('Date cannot be in the future.'));
  test('rejects unknown slot', () => expect(validateReading({ ...ok, slot: 'brunch' }, TODAY)).toContain('Please choose a time slot.'));
  test('rejects impossible date', () => expect(validateReading({ ...ok, date: '2026-02-31' }, TODAY)).toContain('Please choose a valid date.'));
});

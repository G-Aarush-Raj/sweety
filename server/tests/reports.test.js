const { stats, getRanges } = require('../src/reportUtils');

describe('stats', () => {
  test('empty list', () => expect(stats([])).toEqual({ count: 0, highest: null, lowest: null, average: null }));
  test('highest, lowest, average rounded to 1 decimal', () =>
    expect(stats([{ value: 100 }, { value: 101 }, { value: 140 }])).toEqual({ count: 3, highest: 140, lowest: 100, average: 113.7 }));
});

describe('getRanges', () => {
  test('example from the brief (15 Oct 2026)', () => {
    const r = getRanges('2026-10-15');
    expect(r.daily).toEqual({ from: '2026-10-15', to: '2026-10-15' });
    expect(r.monthToDate).toEqual({ from: '2026-10-01', to: '2026-10-15' });
    expect(r.monthly).toEqual({ from: '2026-09-01', to: '2026-09-30' });
  });
  test('January wraps to previous December', () => expect(getRanges('2026-01-10').monthly).toEqual({ from: '2025-12-01', to: '2025-12-31' }));
  test('March after leap year February', () => expect(getRanges('2028-03-05').monthly).toEqual({ from: '2028-02-01', to: '2028-02-29' }));
});

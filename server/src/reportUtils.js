const pad = (n) => String(n).padStart(2, '0');

function stats(readings) {
  if (!readings.length) return { count: 0, highest: null, lowest: null, average: null };
  const values = readings.map((r) => r.value);
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    count: values.length,
    highest: Math.max(...values),
    lowest: Math.min(...values),
    average: Math.round((sum / values.length) * 10) / 10,
  };
}

// For a selected date 'YYYY-MM-DD' returns the three date ranges
function getRanges(date) {
  const [y, m] = date.split('-').map(Number);
  const prevYear = m === 1 ? y - 1 : y;
  const prevMonth = m === 1 ? 12 : m - 1;
  const lastDayPrev = new Date(Date.UTC(y, m - 1, 0)).getUTCDate();
  return {
    daily: { from: date, to: date },
    monthToDate: { from: `${y}-${pad(m)}-01`, to: date },
    monthly: { from: `${prevYear}-${pad(prevMonth)}-01`, to: `${prevYear}-${pad(prevMonth)}-${pad(lastDayPrev)}` },
  };
}

module.exports = { stats, getRanges };

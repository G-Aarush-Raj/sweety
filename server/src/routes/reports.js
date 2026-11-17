const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware');
const { isValidDate, todayString } = require('../validation');
const { stats, getRanges } = require('../reportUtils');

router.use(auth);

async function fetchRange(userId, { from, to }) {
  const { rows } = await pool.query(
    `SELECT id, reading_date AS date, slot, value FROM readings
     WHERE user_id=$1 AND reading_date BETWEEN $2 AND $3 ORDER BY reading_date, id`,
    [userId, from, to]
  );
  return rows;
}

// GET /api/reports?date=YYYY-MM-DD  -> daily, month-to-date and previous-month reports
router.get('/', async (req, res, next) => {
  try {
    const date = req.query.date || todayString();
    if (!isValidDate(date)) return res.status(400).json({ errors: ['Please choose a valid date.'] });
    if (date > todayString()) return res.status(400).json({ errors: ['Date cannot be in the future.'] });
    const ranges = getRanges(date);
    const [daily, mtd, monthly] = await Promise.all(
      [ranges.daily, ranges.monthToDate, ranges.monthly].map((r) => fetchRange(req.userId, r))
    );
    res.json({
      daily: { range: ranges.daily, ...stats(daily), readings: daily },
      monthToDate: { range: ranges.monthToDate, ...stats(mtd) },
      monthly: { range: ranges.monthly, ...stats(monthly) },
    });
  } catch (e) { next(e); }
});

module.exports = router;

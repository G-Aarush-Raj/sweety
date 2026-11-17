const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware');
const { SLOTS, validateReading } = require('../validation');

router.use(auth);
const COLS = 'id, reading_date AS date, slot, value';

// GET /api/readings?date=YYYY-MM-DD&page=1&limit=20
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const params = [req.userId];
    let where = 'user_id = $1';
    if (req.query.date) { params.push(req.query.date); where += ` AND reading_date = $${params.length}`; }
    const total = (await pool.query(`SELECT COUNT(*)::int AS n FROM readings WHERE ${where}`, params)).rows[0].n;
    const { rows } = await pool.query(
      `SELECT ${COLS} FROM readings WHERE ${where} ORDER BY reading_date DESC, id
       LIMIT ${limit} OFFSET ${(page - 1) * limit}`, params);
    res.json({ data: rows, page, limit, total });
  } catch (e) { next(e); }
});

// Business rules that need the database: one per slot per day, max 4 per day
async function checkDayRules(userId, { date, slot }, ignoreId = null) {
  const { rows } = await pool.query(
    'SELECT id, slot FROM readings WHERE user_id = $1 AND reading_date = $2 AND id <> $3',
    [userId, date, ignoreId || 0]
  );
  if (rows.some((r) => r.slot === slot)) return `You already have an ${SLOTS[slot]} reading for this date.`;
  if (rows.length >= 4) return 'You can add only 4 readings per day.';
  return null;
}

router.post('/', async (req, res, next) => {
  try {
    const errors = validateReading(req.body);
    if (errors.length) return res.status(400).json({ errors });
    const dbError = await checkDayRules(req.userId, req.body);
    if (dbError) return res.status(409).json({ errors: [dbError] });
    const { date, slot, value } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO readings (user_id, reading_date, slot, value) VALUES ($1,$2,$3,$4) RETURNING ${COLS}`,
      [req.userId, date, slot, Number(value)]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ errors: [`You already have an ${SLOTS[req.body.slot]} reading for this date.`] });
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const errors = validateReading(req.body);
    if (errors.length) return res.status(400).json({ errors });
    const id = parseInt(req.params.id);
    const dbError = await checkDayRules(req.userId, req.body, id);
    if (dbError) return res.status(409).json({ errors: [dbError] });
    const { date, slot, value } = req.body;
    const { rows } = await pool.query(
      `UPDATE readings SET reading_date=$1, slot=$2, value=$3 WHERE id=$4 AND user_id=$5 RETURNING ${COLS}`,
      [date, slot, Number(value), id, req.userId]
    );
    if (!rows.length) return res.status(404).json({ errors: ['Reading not found.'] });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM readings WHERE id=$1 AND user_id=$2', [parseInt(req.params.id), req.userId]);
    if (!rowCount) return res.status(404).json({ errors: ['Reading not found.'] });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;

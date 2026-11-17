const bcrypt = require('bcrypt');
const pool = require('./db');
const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const SLOTS = ['morning', 'after_breakfast', 'after_lunch', 'after_dinner'];
const BASE = { morning: 105, after_breakfast: 150, after_lunch: 145, after_dinner: 140 };

(async () => {
  const hash = await bcrypt.hash('demo1234', 10);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash) VALUES ('Demo Patient','demo@sweety.app',$1)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id`, [hash]);
  const userId = rows[0].id;
  await pool.query('DELETE FROM readings WHERE user_id=$1', [userId]);
  for (let i = 0; i < 50; i++) { // last 50 days, so previous month always has data
    const d = new Date(); d.setDate(d.getDate() - i);
    const count = 2 + (i % 3); // 2-4 readings per day
    for (const slot of SLOTS.slice(0, count)) {
      const value = Math.min(600, Math.max(40, BASE[slot] + Math.round((Math.random() - 0.5) * 60)));
      await pool.query('INSERT INTO readings (user_id, reading_date, slot, value) VALUES ($1,$2,$3,$4)', [userId, fmt(d), slot, value]);
    }
  }
  console.log('Seeded demo user -> demo@sweety.app / demo1234');
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });

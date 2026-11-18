const bcrypt = require('bcrypt');
const pool = require('./pool');
const { SLOTS } = require('../services/validation');

const DEMO = { name: 'Demo Patient', email: 'demo@sweety.app', password: 'Demo@1234' };
const DAYS_BACK = 45; 

const RANGES = {
  morning: [85, 130],
  after_breakfast: [120, 180],
  after_lunch: [115, 175],
  after_dinner: [110, 170],
};

function pad(n) {
  return String(n).padStart(2, '0');
}

function dateString(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function makeRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

async function seed() {
  const hash = await bcrypt.hash(DEMO.password, 10);

  const userResult = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (LOWER(email)) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash
     RETURNING id`,
    [DEMO.name, DEMO.email, hash],
  );
  const userId = userResult.rows[0].id;

  await pool.query('DELETE FROM readings WHERE user_id = $1', [userId]);

  const random = makeRandom(42);
  const slotKeys = Object.keys(SLOTS);
  let inserted = 0;

  for (let i = 0; i < DAYS_BACK; i += 1) {
    const day = new Date();
    day.setDate(day.getDate() - i);

    const roll = random();
    const howMany = roll < 0.1 ? 0 : roll < 0.3 ? 2 : roll < 0.5 ? 3 : 4;

    for (const slot of slotKeys.slice(0, howMany)) {
      const [low, high] = RANGES[slot];
      const value = Math.round(low + random() * (high - low));
      await pool.query(
        'INSERT INTO readings (user_id, reading_date, slot, value) VALUES ($1, $2, $3, $4)',
        [userId, dateString(day), slot, value],
      );
      inserted += 1;
    }
  }

  console.log(`Seeded demo user (${DEMO.email} / ${DEMO.password}) with ${inserted} readings.`);
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
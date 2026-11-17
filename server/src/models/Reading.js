const pool = require('../db/pool');

const COLUMNS = 'id, reading_date AS date, slot, value';

const Reading = {
  async list(userId, { date, page, limit }) {
    const where = ['user_id = $1'];
    const params = [userId];
    if (date) {
      params.push(date);
      where.push(`reading_date = $${params.length}`);
    }
    const whereSql = where.join(' AND ');

    const total = await pool.query(`SELECT COUNT(*)::int AS n FROM readings WHERE ${whereSql}`, params);
    const { rows } = await pool.query(
      `SELECT ${COLUMNS} FROM readings WHERE ${whereSql}
       ORDER BY reading_date DESC, id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, (page - 1) * limit],
    );
    return { rows, total: total.rows[0].n };
  },

  async onDate(userId, date, excludeId = null) {
    const { rows } = await pool.query(
      'SELECT id, slot FROM readings WHERE user_id = $1 AND reading_date = $2 AND id <> $3',
      [userId, date, excludeId || 0],
    );
    return rows;
  },

  async isOwnedBy(id, userId) {
    const { rows } = await pool.query('SELECT 1 FROM readings WHERE id = $1 AND user_id = $2', [id, userId]);
    return rows.length > 0;
  },

  async create(userId, { date, slot, value }) {
    const { rows } = await pool.query(
      `INSERT INTO readings (user_id, reading_date, slot, value)
       VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
      [userId, date, slot, value],
    );
    return rows[0];
  },

  async update(id, userId, { date, slot, value }) {
    const { rows } = await pool.query(
      `UPDATE readings SET reading_date = $1, slot = $2, value = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5 RETURNING ${COLUMNS}`,
      [date, slot, value, id, userId],
    );
    return rows[0] || null;
  },

  async remove(id, userId) {
    const result = await pool.query('DELETE FROM readings WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rowCount > 0;
  },

  async inRange(userId, from, to) {
    const { rows } = await pool.query(
      `SELECT ${COLUMNS} FROM readings
       WHERE user_id = $1 AND reading_date BETWEEN $2 AND $3
       ORDER BY reading_date, id`,
      [userId, from, to],
    );
    return rows;
  },
};

module.exports = Reading;
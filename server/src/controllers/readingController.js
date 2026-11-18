const Reading = require('../models/Reading');
const { validateReadingInput, checkDayRules, MESSAGES } = require('../services/validation');
const { isValidDateString } = require('../services/dates');

function fail(res, errors, status = 400) {
  return res.status(status).json({ error: Object.values(errors)[0], errors });
}

function parseId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const { date } = req.query;
    if (date && !isValidDateString(date)) return fail(res, { date: MESSAGES.dateInvalid });

    const { rows, total } = await Reading.list(req.user.id, { date, page, limit });
    return res.json({
      readings: rows,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { errors, value } = validateReadingInput(req.body);
    if (Object.keys(errors).length) return fail(res, errors);

    const { date, slot } = req.body;
    const dayError = checkDayRules(slot, await Reading.onDate(req.user.id, date));
    if (dayError) return fail(res, dayError, 409);

    try {
      const reading = await Reading.create(req.user.id, { date, slot, value });
      return res.status(201).json({ reading });
    } catch (err) {
     
      if (err.code === '23505') return fail(res, { slot: MESSAGES.duplicateSlot(slot) }, 409);
      throw err;
    }
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseId(req);
    if (!id || !(await Reading.isOwnedBy(id, req.user.id))) {
      return res.status(404).json({ error: 'Reading not found.' });
    }

    const { errors, value } = validateReadingInput(req.body);
    if (Object.keys(errors).length) return fail(res, errors);

    const { date, slot } = req.body;
    const dayError = checkDayRules(slot, await Reading.onDate(req.user.id, date, id));
    if (dayError) return fail(res, dayError, 409);

    try {
      const reading = await Reading.update(id, req.user.id, { date, slot, value });
      return res.json({ reading });
    } catch (err) {
      if (err.code === '23505') return fail(res, { slot: MESSAGES.duplicateSlot(slot) }, 409);
      throw err;
    }
  } catch (err) {
    return next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseId(req);
    if (!id || !(await Reading.remove(id, req.user.id))) {
      return res.status(404).json({ error: 'Reading not found.' });
    }
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};
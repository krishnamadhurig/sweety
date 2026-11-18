const Reading = require('../models/Reading');
const { computeStats } = require('../services/reports');
const {
  isValidDateString,
  todayString,
  isFutureDate,
  dailyRange,
  monthToDateRange,
  previousMonthRange,
} = require('../services/dates');
const { MESSAGES } = require('../services/validation');

function readDate(req, res) {
  const date = req.query.date || todayString();
  if (!isValidDateString(date)) {
    res.status(400).json({ error: MESSAGES.dateInvalid });
    return null;
  }
  if (isFutureDate(date)) {
    res.status(400).json({ error: MESSAGES.dateFuture });
    return null;
  }
  return date;
}

function makeReport(type, rangeFn, { includeReadings }) {
  return async (req, res, next) => {
    try {
      const date = readDate(req, res);
      if (!date) return undefined;

      const range = rangeFn(date);
      const readings = await Reading.inRange(req.user.id, range.from, range.to);
      const body = {
        type,
        selectedDate: date,
        from: range.from,
        to: range.to,
        stats: computeStats(readings), 
      };
      if (includeReadings) body.readings = readings;
             return res.json(body);
    } catch (err) {
      return next(err);
    }
  };
}

exports.daily = makeReport('daily', dailyRange, { includeReadings: true });
exports.monthToDate = makeReport('month-to-date', monthToDateRange, { includeReadings: false });
exports.monthly = makeReport('monthly', previousMonthRange, { includeReadings: false });
function computeStats(readings) {
  if (!readings.length) return null;
  const values = readings.map((r) => r.value);
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    count: values.length,
    highest: Math.max(...values),
    lowest: Math.min(...values),
    average: Math.round((sum / values.length) * 10) / 10,
  };
}

module.exports = { computeStats };
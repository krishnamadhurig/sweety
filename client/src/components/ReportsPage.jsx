import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { prettyDate, slotLabel, todayString } from '../lib.js';

const REPORTS = [
  { type: 'daily', title: 'Daily report' },
  { type: 'month-to-date', title: 'Month-to-date report' },
  { type: 'monthly', title: 'Monthly report (previous month)' },
];

function rangeText(report) {
  return report.from === report.to
    ? prettyDate(report.from)
    : `${prettyDate(report.from)} – ${prettyDate(report.to)}`;
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function ReportCard({ title, state }) {
  const { report, error, loading } = state;

  return (
    <section className="card">
      <h3>{title}</h3>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="alert" role="alert">{error}</p>}
      {report && (
        <>
          <p className="muted small">{rangeText(report)}</p>
          {report.stats ? (
            <div className="stats">
              <Stat label="Highest" value={report.stats.highest} />
              <Stat label="Lowest" value={report.stats.lowest} />
              <Stat label="Average" value={report.stats.average.toFixed(1)} />
              <Stat label="Readings" value={report.stats.count} />
            </div>
          ) : (
            <p className="empty">No readings in this period yet. Add some and they will show up here.</p>
          )}

          {report.readings && report.readings.length > 0 && (
            <ul className="reading-list compact">
              {report.readings.map((r) => (
                <li key={r.id}>
                  <span>{slotLabel(r.slot)}</span>
                  <span className="value">{r.value} mg/dl</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

export default function ReportsPage() {
  const [date, setDate] = useState(todayString());
  const [states, setStates] = useState({});

  useEffect(() => {
    let cancelled = false;
    setStates(Object.fromEntries(REPORTS.map((r) => [r.type, { loading: true }])));

    REPORTS.forEach(async ({ type }) => {
      let next;
      try {
        next = { report: await api.report(type, date) };
      } catch (err) {
        next = { error: err.message };
      }
      if (!cancelled) setStates((prev) => ({ ...prev, [type]: next }));
    });

    return () => {
      cancelled = true;
    };
  }, [date]);

  return (
    <div>
      <div className="card">
        <label>
          Selected date
          <input
            type="date"
            value={date}
            max={todayString()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
          />
        </label>
      </div>
      <div className="report-grid">
        {REPORTS.map(({ type, title }) => (
          <ReportCard key={type} title={title} state={states[type] || { loading: true }} />
        ))}
      </div>
    </div>
  );
}
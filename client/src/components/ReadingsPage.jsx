import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { prettyDate, slotLabel, todayString } from '../lib.js';
import ReadingForm from './ReadingForm.jsx';

export default function ReadingsPage() {
  const [date, setDate] = useState(todayString());
  const [readings, setReadings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.listReadings(date);
      setReadings(data.readings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
    setEditing(null);
  }, [load]);

  async function remove(reading) {
    if (!window.confirm(`Delete the ${slotLabel(reading.slot)} reading (${reading.value} mg/dl)?`)) return;
    try {
      await api.deleteReading(reading.id);
      if (editing?.id === reading.id) setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid">
      <section className="card">
        <label>
          Date
          <input
            type="date"
            value={date}
            max={todayString()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
          />
        </label>

        <ReadingForm
          date={date}
          editing={editing}
          onSaved={() => {
            setEditing(null);
            load();
          }}
          onCancelEdit={() => setEditing(null)}
        />
      </section>

      <section className="card">
        <h3>Readings for {prettyDate(date)}</h3>
        {error && <p className="alert" role="alert">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : readings.length === 0 ? (
          <p className="empty">No readings for this day yet. Add your first one on the left.</p>
        ) : (
          <ul className="reading-list">
            {readings.map((r) => (
              <li key={r.id}>
                <div>
                  <strong>{slotLabel(r.slot)}</strong>
                  <span className="value">{r.value} mg/dl</span>
                </div>
                <div className="row">
                  <button type="button" onClick={() => setEditing(r)}>Edit</button>
                  <button type="button" className="danger" onClick={() => remove(r)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="muted small">{readings.length} of 4 readings added.</p>
      </section>
    </div>
  );
}
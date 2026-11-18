import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { SLOTS, validateReadingForm } from '../lib.js';


export default function ReadingForm({ date, editing, onSaved, onCancelEdit }) {
  const [slot, setSlot] = useState(SLOTS[0].key);
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (editing) {
      setSlot(editing.slot);
      setValue(String(editing.value));
    } else {
      setValue('');
    }
    setErrors({});
  }, [editing]);

  async function submit(e) {
    e.preventDefault();
    const payload = { date, slot, value };
    const clientErrors = validateReadingForm(payload);
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }

    setBusy(true);
    setErrors({});
    try {
      if (editing) await api.updateReading(editing.id, payload);
      else await api.addReading(payload);
      setValue('');
      onSaved();
    } catch (err) {
      setErrors(Object.keys(err.errors || {}).length ? err.errors : { form: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="reading-form" noValidate>
      <h3>{editing ? 'Edit reading' : 'Add a reading'}</h3>

      <label>
        Time slot
        <select value={slot} onChange={(e) => setSlot(e.target.value)}>
          {SLOTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        {errors.slot && <span className="field-error">{errors.slot}</span>}
      </label>

      <label>
        Glucose value (mg/dl)
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 110"
        />
        {errors.value && <span className="field-error">{errors.value}</span>}
      </label>

      {errors.date && <p className="field-error">{errors.date}</p>}
      {errors.form && <p className="alert" role="alert">{errors.form}</p>}

      <div className="row">
        <button type="submit" className="primary" disabled={busy}>
          {busy ? 'Saving…' : editing ? 'Save changes' : 'Add reading'}
        </button>
        {editing && (
          <button type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
import { useState } from 'react';
import { api, SLOTS, todayString } from './api.js';
import { Errors } from './App.jsx';

export default function ReadingForm({ token, date, editing, onSaved, onCancel }) {
  const [slot, setSlot] = useState(editing?.slot || 'morning');
  const [value, setValue] = useState(editing?.value ?? '');
  const [formDate, setFormDate] = useState(editing?.date || date);
  const [errors, setErrors] = useState([]);

  async function submit(e) {
    e.preventDefault();
    setErrors([]);
    try {
      const body = { date: formDate, slot, value };
      if (editing) await api(`/readings/${editing.id}`, { method: 'PUT', body, token });
      else await api('/readings', { method: 'POST', body, token });
      setValue('');
      onSaved(formDate);
    } catch (err) { setErrors(err.messages); }
  }

  return (
    <form onSubmit={submit} className="card reading-form" noValidate>
      <h2>{editing ? 'Edit reading' : 'Add a reading'}</h2>
      <label>Date<input type="date" max={todayString()} value={formDate} onChange={(e) => setFormDate(e.target.value)} /></label>
      <label>Time slot
        <select value={slot} onChange={(e) => setSlot(e.target.value)}>
          {Object.entries(SLOTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label>Glucose (mg/dl)<input inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 110" /></label>
      <Errors list={errors} />
      <div className="row">
        <button className="primary">{editing ? 'Save changes' : 'Add reading'}</button>
        {editing && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

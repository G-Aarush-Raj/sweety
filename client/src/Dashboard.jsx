import { useCallback, useEffect, useState } from 'react';
import { api, SLOTS, todayString, prettyDate } from './api.js';
import ReadingForm from './ReadingForm.jsx';
import Reports from './Reports.jsx';

export default function Dashboard({ session, onLogout }) {
  const { token, user } = session;
  const [date, setDate] = useState(todayString());
  const [readings, setReadings] = useState([]);
  const [reports, setReports] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [list, rep] = await Promise.all([
        api(`/readings?date=${date}`, { token }),
        api(`/reports?date=${date}`, { token }),
      ]);
      setReadings(list.data);
      setReports(rep);
      setError('');
    } catch (err) {
      if (err.status === 401) onLogout();
      else setError(err.messages[0]);
    }
  }, [date, token, onLogout]);

  useEffect(() => { load(); }, [load]);

  async function remove(id) {
    if (!window.confirm('Delete this reading?')) return;
    await api(`/readings/${id}`, { method: 'DELETE', token });
    load();
  }

  return (
    <div className="layout">
      <header>
        <h1>Sweety</h1>
        <div className="row">
          <span>Hi, {user.name}</span>
          <button onClick={onLogout}>Log out</button>
        </div>
      </header>

      <div className="datebar">
        <label>Viewing date
          <input type="date" max={todayString()} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </label>
      </div>
      {error && <div className="errors" role="alert"><p>{error}</p></div>}

      <div className="columns">
        <div>
          <ReadingForm
            key={editing ? `edit-${editing.id}` : `new-${date}`}
            token={token} date={date} editing={editing}
            onSaved={(d) => { setEditing(null); setDate(d); load(); }}
            onCancel={() => setEditing(null)}
          />
          <section className="card">
            <h2>Readings for {prettyDate(date)}</h2>
            {readings.length === 0 ? (
              <p className="empty">Nothing logged for this day yet.</p>
            ) : (
              <ul className="slot-list">
                {readings.map((r) => (
                  <li key={r.id}>
                    <span>{SLOTS[r.slot]}</span>
                    <strong>{r.value} mg/dl</strong>
                    <span className="row">
                      <button onClick={() => { setEditing(r); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
                      <button className="danger" onClick={() => remove(r.id)}>Delete</button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <Reports reports={reports} />
      </div>
    </div>
  );
}

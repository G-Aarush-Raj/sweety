import { useState } from 'react';
import { api } from './api.js';
import Dashboard from './Dashboard.jsx';

function Errors({ list }) {
  if (!list.length) return null;
  return (
    <div className="errors" role="alert">
      {list.map((m) => <p key={m}>{m}</p>)}
    </div>
  );
}

function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState([]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErrors([]);
    try {
      const data = await api(`/auth/${mode === 'login' ? 'login' : 'register'}`, { method: 'POST', body: form });
      onAuth(data);
    } catch (err) { setErrors(err.messages); }
  }

  return (
    <main className="auth">
      <h1>Sweety</h1>
      <p className="tagline">Log your blood glucose, see how the month is going.</p>
      <form onSubmit={submit} className="card">
        <h2>{mode === 'login' ? 'Log in' : 'Create your account'}</h2>
        {mode === 'signup' && (
          <label>Name<input value={form.name} onChange={set('name')} autoComplete="name" /></label>
        )}
        <label>Email<input type="email" value={form.email} onChange={set('email')} autoComplete="email" /></label>
        <label>Password<input type="password" value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        <Errors list={errors} />
        <button className="primary">{mode === 'login' ? 'Log in' : 'Sign up'}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrors([]); }}>
          {mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in'}
        </button>
        {mode === 'login' && <p className="hint">Demo: demo@sweety.app / demo1234</p>}
      </form>
    </main>
  );
}

export default function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('sweety') || 'null'));
  const save = (s) => { if (s) localStorage.setItem('sweety', JSON.stringify(s)); else localStorage.removeItem('sweety'); setSession(s); };
  if (!session) return <AuthForm onAuth={save} />;
  return <Dashboard session={session} onLogout={() => save(null)} />;
}
export { Errors };

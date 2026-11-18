import { useState } from 'react';
import { api, setToken } from '../api.js';

export default function AuthForm({ onLoggedIn }) {
  const [mode, setMode] = useState('login'); 
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setBusy(true);
    try {
      const data = isRegister
        ? await api.register(form)
        : await api.login({ email: form.email, password: form.password });
      setToken(data.token);
      onLoggedIn(data.user);
    } catch (err) {
      setErrors(err.errors || {});
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card auth-card">
      <h2>{isRegister ? 'Create your account' : 'Welcome back'}</h2>
      <form onSubmit={submit} noValidate>
        {isRegister && (
          <label>
            Name
            <input value={form.name} onChange={update('name')} autoComplete="name" />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>
        )}
        <label>
          Email
          <input type="email" value={form.email} onChange={update('email')} autoComplete="email" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={update('password')}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>

        {message && !Object.keys(errors).length && <p className="alert" role="alert">{message}</p>}

        <button type="submit" className="primary" disabled={busy}>
          {busy ? 'Please wait…' : isRegister ? 'Sign up' : 'Log in'}
        </button>
      </form>

      <p className="switch">
        {isRegister ? 'Already have an account?' : 'New to Sweety?'}{' '}
        <button
          type="button"
          className="link"
          onClick={() => {
            setMode(isRegister ? 'login' : 'register');
            setErrors({});
            setMessage('');
          }}
        >
          {isRegister ? 'Log in' : 'Sign up'}
        </button>
      </p>
    </div>
  );
}
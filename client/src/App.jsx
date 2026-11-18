import { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import AuthForm from './components/AuthForm.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setToken(null))
      .finally(() => setChecking(false));
  }, []);

  function logout() {
    setToken(null);
    setUser(null);
  }

  if (checking) return <p className="center muted">Loading…</p>;

  return (
    <div className="app">
      <header className="topbar">
        <h1>🩸 Sweety</h1>
        {user && (
          <div className="row">
            <span className="muted">Hi, {user.name}</span>
            <button type="button" onClick={logout}>Log out</button>
          </div>
        )}
      </header>

      {!user ? <AuthForm onLoggedIn={setUser} /> : <p className="card">You are logged in. Readings come next.</p>}
    </div>
  );
}
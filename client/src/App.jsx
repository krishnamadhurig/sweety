import { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import AuthForm from './components/AuthForm.jsx';
import ReadingsPage from './components/ReadingsPage.jsx';
import ReportsPage from './components/ReportsPage.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));
  const [tab, setTab] = useState('readings');

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
    setTab('readings');
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

      {!user ? (
        <AuthForm onLoggedIn={setUser} />
      ) : (
        <>
          <nav className="tabs">
            <button type="button" className={tab === 'readings' ? 'active' : ''} onClick={() => setTab('readings')}>
              Readings
            </button>
            <button type="button" className={tab === 'reports' ? 'active' : ''} onClick={() => setTab('reports')}>
              Reports
            </button>
          </nav>
{tab === 'readings' ? <ReadingsPage /> : <ReportsPage />}
        </>
      )}
    </div>
  );
}
import { useState } from 'react';
import { Routes, Route, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api, session } from './api';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Categories from './pages/Categories.jsx';
import Authors from './pages/Authors.jsx';
import Books from './pages/Books.jsx';
import Readers from './pages/Readers.jsx';
import Loans from './pages/Loans.jsx';
import Users from './pages/Users.jsx';

const links = [
  ['/', '🏠', 'Dashboard', true],
  ['/loans', '🔄', 'Empréstimos'],
  ['/books', '📚', 'Acervo'],
  ['/readers', '👥', 'Leitores'],
  ['/categories', '🏷️', 'Categorias'],
  ['/authors', '✍️', 'Autores'],
  ['/users', '🛡️', 'Atendentes', true],
];

function Layout({ user, onLogout }) {
  if (!session.access || !user) return <Navigate to="/login" replace />;
  return (
    <div className="app">
      <aside className="side">
        <div className="brand">📚 <span>Biblioteca</span></div>
        <nav>
          {links.filter((l) => !l[3] || user.isAdmin).map(([to, icon, label]) => (
            <NavLink key={to} to={to} end={to === '/'}><i>{icon}</i>{label}</NavLink>
          ))}
        </nav>
        <div className="me">
          <span className="avatar">{user.name?.[0]?.toUpperCase()}</span>
          <div><b>{user.name}</b><small>{user.isAdmin ? 'Administrador' : 'Atendente'}</small></div>
        </div>
        <button className="out" onClick={onLogout}>Sair</button>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}

function AdminOnly({ user, children }) {
  return user?.isAdmin ? children : <Navigate to="/loans" replace />;
}

export default function App() {
  const [user, setUser] = useState(session.user);
  const navigate = useNavigate();

  const onLogin = (u) => { setUser(u); navigate(u.isAdmin ? '/' : '/loans'); };
  const onLogout = async () => {
    try { await api.post('/auth/logout', { refreshToken: session.refresh }); } catch { /* ignora */ }
    session.clear();
    setUser(null);
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={onLogin} />} />
      <Route element={<Layout user={user} onLogout={onLogout} />}>
        <Route index element={<AdminOnly user={user}><Dashboard /></AdminOnly>} />
        <Route path="loans" element={<Loans />} />
        <Route path="books" element={<Books isAdmin={!!user?.isAdmin} />} />
        <Route path="readers" element={<Readers />} />
        <Route path="categories" element={<Categories isAdmin={!!user?.isAdmin} />} />
        <Route path="authors" element={<Authors isAdmin={!!user?.isAdmin} />} />
        <Route path="users" element={<AdminOnly user={user}><Users currentId={user?.id} /></AdminOnly>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

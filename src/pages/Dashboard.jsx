import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errMsg, money, session } from '../api';

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/reports/dashboard').then((r) => setD(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  const h = new Date().getHours();
  const greet = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const items = d ? [
    ['📖', 'Títulos no acervo', d.totalBooks, '#6d4aff', '#a78bfa'],
    ['🗃️', 'Exemplares', d.totalCopies, '#0d9488', '#5eead4'],
    ['🔄', 'Empréstimos ativos', d.activeLoans, '#2563eb', '#93c5fd'],
    ['⚠️', 'Atrasados', d.overdueLoans, '#dc2626', '#fca5a5'],
    ['💰', 'Multas', money(d.totalFines), '#d97706', '#fcd34d'],
  ] : [];

  return (
    <>
      <section className="hero">
        <div>
          <small>{today}</small>
          <h1>{greet}, {session.user?.name?.split(' ')[0]}!</h1>
          <p>Veja como está a biblioteca hoje e registre empréstimos e devoluções com um clique.</p>
          <div className="qa">
            <Link to="/loans" className="btn">Novo empréstimo</Link>
            <Link to="/books" className="btn ghost">Ver acervo</Link>
          </div>
        </div>
      </section>

      {error && <div className="msg">{error}</div>}
      {!d && !error && <p>Carregando...</p>}
      <div className="stats">
        {items.map(([icon, label, value, c1, c2]) => (
          <div className="stat" key={label}>
            <span className="ico" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>{icon}</span>
            <div><small>{label}</small><strong>{value}</strong></div>
          </div>
        ))}
      </div>
    </>
  );
}

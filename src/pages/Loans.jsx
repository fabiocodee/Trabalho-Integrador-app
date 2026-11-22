import { useEffect, useState } from 'react';
import { api, errMsg, fmtDate, money } from '../api';
import Cover from '../Cover.jsx';

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [status, setStatus] = useState('');
  const [readers, setReaders] = useState([]);
  const [books, setBooks] = useState([]);
  const [readerQ, setReaderQ] = useState('');
  const [bookQ, setBookQ] = useState('');
  const [readerId, setReaderId] = useState('');
  const [bookId, setBookId] = useState('');
  const [days, setDays] = useState(7);
  const [msg, setMsg] = useState(null); // { text, ok }

  const loadLoans = () => api.get('/loans', { params: status ? { status } : {} })
    .then((r) => setLoans(r.data)).catch((e) => setMsg({ text: errMsg(e) }));
  const loadOptions = () => {
    api.get('/readers').then((r) => setReaders(r.data));
    api.get('/books', { params: { available: 'true' } }).then((r) => setBooks(r.data));
  };

  useEffect(() => { loadLoans(); }, [status]);
  useEffect(() => { loadOptions(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/loans', { bookId: Number(bookId), readerId: Number(readerId), days: Number(days) });
      setMsg({ text: 'Empréstimo registrado.', ok: true });
      setBookId('');
      loadLoans(); loadOptions();
    } catch (err) { setMsg({ text: errMsg(err) }); }
  };

  const giveBack = async (l) => {
    try {
      const { data } = await api.patch(`/loans/${l.id}/return`);
      setMsg({ text: data.fine > 0 ? `Devolvido com atraso. Multa: ${money(data.fine)}` : 'Devolução registrada, sem multa.', ok: true });
      loadLoans(); loadOptions();
    } catch (err) { setMsg({ text: errMsg(err) }); }
  };

  const match = (text, q) => text.toLowerCase().includes(q.toLowerCase());
  const readerOpts = readers.filter((r) => match(`${r.name} ${r.cpf}`, readerQ) || String(r.id) === readerId);
  const bookOpts = books.filter((b) => match(`${b.title} ${b.isbn}`, bookQ) || String(b.id) === bookId);

  return (
    <>
      <form className="card" onSubmit={create}>
        <h2>Novo empréstimo</h2>
        <div className="grid2">
          <div>
            <label>Leitor<input placeholder="Buscar por nome ou CPF" value={readerQ} onChange={(e) => setReaderQ(e.target.value)} /></label>
            <select required value={readerId} onChange={(e) => setReaderId(e.target.value)}>
              <option value="">Selecione o leitor</option>
              {readerOpts.map((r) => <option key={r.id} value={r.id}>{r.name} — {r.cpf}</option>)}
            </select>
          </div>
          <div>
            <label>Livro<input placeholder="Buscar por título ou ISBN" value={bookQ} onChange={(e) => setBookQ(e.target.value)} /></label>
            <select required value={bookId} onChange={(e) => setBookId(e.target.value)}>
              <option value="">Selecione o livro</option>
              {bookOpts.map((b) => <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} disp.)</option>)}
            </select>
          </div>
        </div>
        <div className="grid2">
          <label>Prazo do empréstimo
            <select value={days} onChange={(e) => setDays(e.target.value)}>
              {[3, 7, 14, 21, 30].map((d) => <option key={d} value={d}>{d} dias{d === 7 ? ' (padrão)' : ''}</option>)}
            </select>
          </label>
          <label>Devolução prevista
            <input readOnly value={fmtDate(new Date(Date.now() + Number(days) * 86400000))} />
          </label>
        </div>
        <p><button type="submit">Registrar empréstimo</button></p>
      </form>

      <div className="card">
        <div className="bar">
          <h2>Empréstimos</h2>
          <select style={{ width: 'auto' }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos</option>
            <option value="ATIVO">Ativos</option>
            <option value="ATRASADO">Atrasados</option>
            <option value="DEVOLVIDO">Devolvidos</option>
          </select>
        </div>
        {msg && <div className={`msg ${msg.ok ? 'ok' : ''}`}>{msg.text}</div>}
        <table>
          <thead><tr><th>Livro</th><th>Leitor</th><th>Empréstimo</th><th>Prazo</th><th>Status</th><th>Multa</th><th /></tr></thead>
          <tbody>
            {loans.map((l) => (
              <tr key={l.id}>
                <td><div className="row" style={{ gap: 10 }}>{l.Book && <Cover book={l.Book} size="xs" />}<span>{l.Book?.title}</span></div></td><td>{l.Reader?.name}</td>
                <td>{fmtDate(l.loanDate)}</td><td>{fmtDate(l.dueDate)}</td>
                <td><span className={`tag ${l.status}`}>{l.status}</span></td>
                <td>{money(l.fine)}</td>
                <td style={{ textAlign: 'right' }}>
                  {l.status !== 'DEVOLVIDO' && <button onClick={() => giveBack(l)}>Devolver</button>}
                </td>
              </tr>
            ))}
            {loans.length === 0 && <tr><td colSpan="7">Nenhum empréstimo.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

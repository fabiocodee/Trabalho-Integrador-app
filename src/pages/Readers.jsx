import { useState } from 'react';
import Crud from '../Crud.jsx';
import { api, errMsg, fmtDate, money } from '../api';

export default function Readers() {
  const [history, setHistory] = useState(null);

  const show = async (r) => {
    try {
      const { data } = await api.get(`/readers/${r.id}/loans`);
      setHistory({ reader: r, loans: data });
    } catch (e) { alert(errMsg(e)); }
  };

  return (
    <>
      <Crud
        title="Leitores" path="/readers" canDelete={false}
        fields={[
          { name: 'name', label: 'Nome', required: true },
          { name: 'cpf', label: 'CPF', required: true },
          { name: 'email', label: 'E-mail', type: 'email' },
          { name: 'phone', label: 'Telefone' },
        ]}
        columns={[
          { key: 'name', label: 'Nome' }, { key: 'cpf', label: 'CPF' },
          { key: 'email', label: 'E-mail' }, { key: 'phone', label: 'Telefone' },
        ]}
        rowActions={(r) => <button className="sec" onClick={() => show(r)}>Histórico</button>}
      />
      {history && (
        <div className="modal">
          <div className="card">
            <h3>Histórico de {history.reader.name}</h3>
            <table>
              <thead><tr><th>Livro</th><th>Empréstimo</th><th>Prazo</th><th>Status</th><th>Multa</th></tr></thead>
              <tbody>
                {history.loans.map((l) => (
                  <tr key={l.id}>
                    <td>{l.Book?.title}</td><td>{fmtDate(l.loanDate)}</td><td>{fmtDate(l.dueDate)}</td>
                    <td><span className={`tag ${l.status}`}>{l.status}</span></td><td>{money(l.fine)}</td>
                  </tr>
                ))}
                {history.loans.length === 0 && <tr><td colSpan="5">Sem empréstimos.</td></tr>}
              </tbody>
            </table>
            <p><button onClick={() => setHistory(null)}>Fechar</button></p>
          </div>
        </div>
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import { api, errMsg } from './api';

// Tela generica de listagem + cadastro/edicao/exclusao
export default function Crud({ title, path, fields, columns, canWrite = true, canDelete = true, rowActions }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => api.get(path).then((r) => setRows(r.data)).catch((e) => setMsg(errMsg(e)));
  useEffect(() => { load(); }, [path]);

  const open = (row) => {
    setEditing(row ? row.id : null);
    setForm(Object.fromEntries(fields.map((f) => [f.name, row?.[f.name] ?? (f.type === 'checkbox' ? false : '')])));
    setMsg('');
  };

  const save = async (e) => {
    e.preventDefault();
    const body = {};
    for (const f of fields) {
      const v = form[f.name];
      if (v === '' || v == null) continue;
      body[f.name] = v;
    }
    try {
      if (editing) await api.put(`${path}/${editing}`, body);
      else await api.post(path, body);
      setForm(null);
      load();
    } catch (err) { setMsg(errMsg(err)); }
  };

  const remove = async (row) => {
    if (!confirm('Excluir este registro?')) return;
    try { await api.delete(`${path}/${row.id}`); setMsg(''); load(); } catch (err) { setMsg(errMsg(err)); }
  };

  return (
    <div className="card">
      <div className="bar">
        <h2>{title}</h2>
        {canWrite && <button onClick={() => open(null)}>Novo</button>}
      </div>
      {msg && <div className="msg">{msg}</div>}
      <table>
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}<th /></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              {columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>)}
              <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                {rowActions && rowActions(r, load)}
                {canWrite && <button className="sec" onClick={() => open(r)}>Editar</button>}
                {canWrite && canDelete && <button className="danger" onClick={() => remove(r)}>Excluir</button>}
              </td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={columns.length + 1}>Nenhum registro.</td></tr>}
        </tbody>
      </table>

      {form && (
        <div className="modal">
          <form className="card" onSubmit={save}>
            <h3>{editing ? 'Editar' : 'Novo'} registro</h3>
            {fields.map((f) => f.type === 'checkbox' ? (
              <label key={f.name} className="check">
                <input type="checkbox" checked={!!form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })} />
                {f.label}
              </label>
            ) : (
              <label key={f.name}>{f.label}
                <input
                  type={f.type || 'text'}
                  value={form[f.name]}
                  required={f.required || (f.createOnly && !editing)}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                />
              </label>
            ))}
            {msg && <div className="msg">{msg}</div>}
            <button type="submit">Salvar</button>
            <button type="button" className="sec" onClick={() => setForm(null)}>Cancelar</button>
          </form>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { api, errMsg } from '../api';
import Cover, { findCover } from '../Cover.jsx';

const empty = { title: '', isbn: '', year: '', totalCopies: 1, categoryId: '', coverUrl: '', authorIds: [] };

export default function Books({ isAdmin }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [filters, setFilters] = useState({ title: '', categoryId: '', authorId: '', available: false });
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const [searching, setSearching] = useState(false);

  const load = () => {
    const params = {};
    if (filters.title) params.title = filters.title;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.authorId) params.authorId = filters.authorId;
    if (filters.available) params.available = 'true';
    api.get('/books', { params }).then((r) => setBooks(r.data)).catch((e) => setMsg(errMsg(e)));
  };

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data));
    api.get('/authors').then((r) => setAuthors(r.data));
  }, []);
  useEffect(() => { load(); }, [filters]);

  const open = (b) => {
    setMsg('');
    setEditing(b ? b.id : null);
    setForm(b ? {
      title: b.title, isbn: b.isbn, year: b.year ?? '', totalCopies: b.totalCopies, coverUrl: b.coverUrl || '',
      categoryId: b.categoryId, authorIds: (b.Authors || []).map((a) => a.id),
    } : { ...empty });
  };

  const fetchCover = async () => {
    if (!form.title) return setMsg('Preencha o título antes de buscar a capa.');
    setSearching(true); setMsg('');
    const author = authors.find((a) => a.id === form.authorIds[0]);
    const url = await findCover(form.title, author?.name);
    setSearching(false);
    if (url) setForm((f) => ({ ...f, coverUrl: url }));
    else setMsg('Capa não encontrada. Cole o endereço de uma imagem no campo.');
  };

  const save = async (e) => {
    e.preventDefault();
    const body = {
      title: form.title, isbn: form.isbn, totalCopies: Number(form.totalCopies),
      categoryId: Number(form.categoryId), authorIds: form.authorIds, coverUrl: form.coverUrl,
    };
    if (form.year !== '') body.year = Number(form.year);
    try {
      if (editing) await api.put(`/books/${editing}`, body);
      else await api.post('/books', body);
      setForm(null);
      load();
    } catch (err) { setMsg(errMsg(err)); }
  };

  const remove = async (b) => {
    if (!confirm(`Excluir "${b.title}"?`)) return;
    try { await api.delete(`/books/${b.id}`); setMsg(''); load(); } catch (err) { setMsg(errMsg(err)); }
  };

  return (
    <div className="card">
      <div className="bar">
        <h2>Acervo</h2>
        {isAdmin && <button onClick={() => open(null)}>Novo livro</button>}
      </div>
      <div className="filters">
        <input placeholder="Buscar por título" value={filters.title} onChange={(e) => setFilters({ ...filters, title: e.target.value })} />
        <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
          <option value="">Todas as categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.authorId} onChange={(e) => setFilters({ ...filters, authorId: e.target.value })}>
          <option value="">Todos os autores</option>
          {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <label className="check" style={{ margin: 0 }}>
          <input type="checkbox" checked={filters.available} onChange={(e) => setFilters({ ...filters, available: e.target.checked })} />
          Só disponíveis
        </label>
      </div>
      {msg && !form && <div className="msg">{msg}</div>}

      <div className="shelf">
        {books.map((b) => (
          <article className="book" key={b.id}>
            <Cover book={b} />
            <div className="info">
              <strong title={b.title}>{b.title}</strong>
              <span className="by">{(b.Authors || []).map((a) => a.name).join(', ') || 'Autor não informado'}</span>
              <div className="meta">
                {b.Category && <span className="tag">{b.Category.name}</span>}
                <span className={`tag ${b.availableCopies > 0 ? 'DEVOLVIDO' : 'ATRASADO'}`}>
                  {b.availableCopies > 0 ? `${b.availableCopies} de ${b.totalCopies} disponíveis` : 'Indisponível'}
                </span>
              </div>
              {isAdmin && (
                <div className="acts">
                  <button className="sec" onClick={() => open(b)}>Editar</button>
                  <button className="danger" onClick={() => remove(b)}>Excluir</button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
      {books.length === 0 && <p>Nenhum livro encontrado.</p>}

      {form && (
        <div className="modal">
          <form className="card" onSubmit={save}>
            <h3>{editing ? 'Editar livro' : 'Novo livro'}</h3>
            <label>Título<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <div className="grid2">
              <label>ISBN<input required value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} /></label>
              <label>Ano<input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></label>
              <label>Exemplares<input type="number" min="0" required value={form.totalCopies} onChange={(e) => setForm({ ...form, totalCopies: e.target.value })} /></label>
              <label>Categoria
                <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Selecione</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            </div>
            <label>Autores (Ctrl/Cmd para vários)
              <select multiple size="4" value={form.authorIds.map(String)}
                onChange={(e) => setForm({ ...form, authorIds: [...e.target.selectedOptions].map((o) => Number(o.value)) })}>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
            <label>Capa (endereço da imagem)
              <div className="row">
                <input value={form.coverUrl} placeholder="https://..." onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} />
                <button type="button" className="sec" onClick={fetchCover} disabled={searching}>{searching ? 'Buscando...' : 'Buscar capa'}</button>
              </div>
            </label>
            {form.coverUrl && <div className="preview"><Cover book={{ title: form.title || 'Capa', coverUrl: form.coverUrl }} size="sm" /></div>}
            {msg && <div className="msg">{msg}</div>}
            <button type="submit">Salvar</button>
            <button type="button" className="sec" onClick={() => setForm(null)}>Cancelar</button>
          </form>
        </div>
      )}
    </div>
  );
}

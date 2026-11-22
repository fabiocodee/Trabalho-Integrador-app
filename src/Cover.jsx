import { useEffect, useState } from 'react';

const memo = new Map();

// Busca a URL da capa na Open Library (usa cache para não repetir a consulta)
export function findCover(title, author) {
  const key = `cover:${title}|${author || ''}`;
  if (memo.has(key)) return memo.get(key);

  let cached = null;
  try { cached = localStorage.getItem(key); } catch { /* ignora */ }
  if (cached !== null) {
    const p = Promise.resolve(cached);
    memo.set(key, p);
    return p;
  }

  const q = new URLSearchParams({ title, limit: '1', fields: 'cover_i' });
  if (author) q.set('author', author);
  const p = fetch(`https://openlibrary.org/search.json?${q}`)
    .then((r) => r.json())
    .then((d) => {
      const id = d.docs?.[0]?.cover_i;
      const url = id ? `https://covers.openlibrary.org/b/id/${id}-M.jpg` : '';
      try { localStorage.setItem(key, url); } catch { /* ignora */ }
      return url;
    })
    .catch(() => { memo.delete(key); return ''; });
  memo.set(key, p);
  return p;
}

const hash = (str) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

// Capa do livro: imagem real quando existe, senão uma capa desenhada com o título
export default function Cover({ book, size = 'md' }) {
  const author = book.Authors?.[0]?.name;
  const [src, setSrc] = useState(book.coverUrl || '');
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    let alive = true;
    setBroken(false);
    if (book.coverUrl) { setSrc(book.coverUrl); return undefined; }
    setSrc('');
    findCover(book.title, author).then((url) => alive && setSrc(url));
    return () => { alive = false; };
  }, [book.title, book.coverUrl, author]);

  if (src && !broken) {
    return (
      <div className={`cover ${size}`}>
        <img src={src} alt={`Capa de ${book.title}`} loading="lazy" onError={() => setBroken(true)} />
      </div>
    );
  }

  const h = hash(book.title) % 360;
  return (
    <div className={`cover ${size} ph`} style={{ background: `linear-gradient(145deg, hsl(${h} 55% 38%), hsl(${(h + 40) % 360} 60% 22%))` }}>
      <span className="ph-title">{book.title}</span>
      {size !== 'xs' && author && <span className="ph-author">{author}</span>}
    </div>
  );
}

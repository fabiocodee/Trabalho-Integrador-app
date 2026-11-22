import { useState } from 'react';
import { api, session, errMsg } from '../api';

const emptyReg = { name: '', username: '', email: '', password: '', confirm: '' };

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reg, setReg] = useState(emptyReg);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const switchMode = (m) => { setMode(m); setError(''); setInfo(''); };
  const fail = (err) => setError(err.response ? errMsg(err) : 'Não foi possível conectar à API');

  const submitLogin = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Informe um e-mail válido');
    if (password.length < 6) return setError('A senha deve ter ao menos 6 caracteres');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      session.save(data);
      onLogin(data.user);
    } catch (err) { fail(err); } finally { setBusy(false); }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!/^\S+@\S+\.\S+$/.test(reg.email)) return setError('Informe um e-mail válido');
    if (reg.password.length < 6) return setError('A senha deve ter ao menos 6 caracteres');
    if (reg.password !== reg.confirm) return setError('As senhas não conferem');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: reg.name, username: reg.username, email: reg.email, password: reg.password,
      });
      setEmail(reg.email); setPassword(''); setReg(emptyReg);
      setMode('login');
      setInfo(data.message);
    } catch (err) { fail(err); } finally { setBusy(false); }
  };

  const setR = (k) => (e) => setReg({ ...reg, [k]: e.target.value });

  return (
    <div className="auth">
      <section className="auth-hero">
        <div className="logo">📚 Biblioteca</div>
        <h1>Cada livro, no lugar e no prazo certos.</h1>
        <p>Gerencie acervo, leitores, empréstimos e devoluções em um só lugar, com controle de multas e relatórios.</p>
      </section>

      <section className="auth-side">
        <div className="auth-box">
          <div className="tabs">
            <button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => switchMode('login')}>Entrar</button>
            <button type="button" className={mode === 'register' ? 'on' : ''} onClick={() => switchMode('register')}>Criar conta</button>
          </div>

          {error && <div className="msg">{error}</div>}
          {info && <div className="msg ok">{info}</div>}

          {mode === 'login' ? (
            <form onSubmit={submitLogin}>
              <h2>Bem-vindo de volta</h2>
              <p className="sub">Entre com a sua conta de atendente.</p>
              <label>E-mail<input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@biblioteca.com" /></label>
              <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" /></label>
              <button className="full" type="submit" disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button>
            </form>
          ) : (
            <form onSubmit={submitRegister}>
              <h2>Crie sua conta</h2>
              <p className="sub">Seu cadastro será liberado após a aprovação do administrador.</p>
              <label>Nome completo<input required value={reg.name} onChange={setR('name')} /></label>
              <div className="grid2">
                <label>Usuário<input required value={reg.username} onChange={setR('username')} /></label>
                <label>E-mail<input type="email" required value={reg.email} onChange={setR('email')} /></label>
                <label>Senha<input type="password" required value={reg.password} onChange={setR('password')} /></label>
                <label>Confirmar senha<input type="password" required value={reg.confirm} onChange={setR('confirm')} /></label>
              </div>
              <button className="full" type="submit" disabled={busy}>{busy ? 'Enviando...' : 'Solicitar cadastro'}</button>
            </form>
          )}
          <div className="hint">Sistema de gestão de biblioteca</div>
        </div>
      </section>
    </div>
  );
}

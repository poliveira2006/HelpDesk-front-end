import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';

const Icon = ({ children, size = 18, stroke = 1.8 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);
const I = {
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A16.6 16.6 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.2-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};

const Shell = ({ title, sub, children, footer }) => (
  <div className="auth">
    <aside className="auth-side">
      <div className="auth-brand">
        HelpDesk<em>.</em>
      </div>
    </aside>
    <main className="auth-main">
      <div className="auth-card">
        <h2>{title}</h2>
        <p className="auth-sub">{sub}</p>
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </main>
  </div>
);

export function Login() {
  const { login, user } = useAuth(),
    nav = useNavigate(),
    [e, setE] = useState(''),
    [p, setP] = useState(''),
    [m, setM] = useState(''),
    [show, setShow] = useState(false),
    [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  const go = async (ev) => {
    ev.preventDefault();
    if (!e || !p) return setM('Preencha e-mail e senha');
    setLoading(true);
    setM('');
    try {
      await login(e, p);
      nav('/dashboard');
    } catch (x) {
      setM(x.message);
      setLoading(false);
    }
  };
  return (
    <Shell
      title="Entrar"
      sub="Acesse com suas credenciais."
      footer={<Link to="/esqueci-senha">Esqueci minha senha</Link>}
    >
      <form className="auth-form" onSubmit={go}>
        <label htmlFor="email">E-mail</label>
        <div className="field">
          <Icon size={17}>{I.mail}</Icon>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu.nome@empresa.com"
            value={e}
            onChange={(t) => setE(t.target.value)}
            autoFocus
            required
          />
        </div>

        <label htmlFor="senha">Senha</label>
        <div className="field">
          <Icon size={17}>{I.lock}</Icon>
          <input
            id="senha"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={p}
            onChange={(t) => setP(t.target.value)}
            required
          />
          <button
            type="button"
            className="eye"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={show}
            title={show ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Icon size={17}>{show ? I.eyeOff : I.eye}</Icon>
          </button>
        </div>

        {m && (
          <div className="auth-err" role="alert">
            {m}
          </div>
        )}

        <button className="btn-auth" type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
          {!loading && (
            <Icon size={17} stroke={2}>
              {I.arrow}
            </Icon>
          )}
        </button>
      </form>
    </Shell>
  );
}

export function Forgot() {
  const [e, setE] = useState(''),
    [m, setM] = useState(''),
    [sent, setSent] = useState(false);
  const go = async (ev) => {
    ev.preventDefault();
    try {
      await api('/auth/forgot', { method: 'POST', body: { email: e } });
      setSent(true);
      setM('Se o e-mail existir, enviaremos o link.');
    } catch (x) {
      setM(x.message);
    }
  };
  return (
    <Shell
      title="Recuperar senha"
      sub="Enviaremos um link de redefinição para o seu e-mail."
      footer={<Link to="/login">Voltar para o login</Link>}
    >
      <form className="auth-form" onSubmit={go}>
        <label htmlFor="email">E-mail</label>
        <div className="field">
          <Icon size={17}>{I.mail}</Icon>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu.nome@empresa.com"
            value={e}
            onChange={(t) => setE(t.target.value)}
            autoFocus
            required
          />
        </div>
        {m && (
          <div className={sent ? 'auth-ok' : 'auth-err'} role="status">
            {m}
          </div>
        )}
        <button className="btn-auth" type="submit">
          Enviar link
          <Icon size={17} stroke={2}>
            {I.arrow}
          </Icon>
        </button>
      </form>
    </Shell>
  );
}

export function Reset() {
  const [sp] = useSearchParams(),
    nav = useNavigate(),
    [p, setP] = useState(''),
    [m, setM] = useState(''),
    [show, setShow] = useState(false);
  const go = async (ev) => {
    ev.preventDefault();
    try {
      await api('/auth/reset', {
        method: 'POST',
        body: { token: sp.get('token') || '', senha: p },
      });
      nav('/login');
    } catch (x) {
      setM(x.message);
    }
  };
  return (
    <Shell
      title="Criar nova senha"
      sub="Escolha uma senha com pelo menos 8 caracteres."
      footer={<Link to="/login">Voltar para o login</Link>}
    >
      <form className="auth-form" onSubmit={go}>
        <label htmlFor="senha">Nova senha</label>
        <div className="field">
          <Icon size={17}>{I.lock}</Icon>
          <input
            id="senha"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={p}
            onChange={(t) => setP(t.target.value)}
            autoFocus
            minLength={8}
            required
          />
          <button
            type="button"
            className="eye"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={show}
          >
            <Icon size={17}>{show ? I.eyeOff : I.eye}</Icon>
          </button>
        </div>
        {m && (
          <div className="auth-err" role="alert">
            {m}
          </div>
        )}
        <button className="btn-auth" type="submit">
          Salvar senha
          <Icon size={17} stroke={2}>
            {I.arrow}
          </Icon>
        </button>
      </form>
    </Shell>
  );
}

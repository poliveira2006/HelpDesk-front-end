import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const I = ({ d, size = 17, className }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {d}
  </svg>
);
const USER = (
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </>
);
const MAIL = (
  <>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </>
);
const LOCK = (
  <>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </>
);
const CHEV = <path d="m9 6 6 6-6 6" />;
const EYE = (
  <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </>
);
const EYE_OFF = (
  <>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A16.6 16.6 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.2-.9" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </>
);

const initials = (nome) =>
  (nome || '?')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
const PERFIL = {
  admin: 'Administrador',
  analista: 'Analista',
  usuario: 'Usuário',
};
const EMPTY = { atual: '', nova: '', conf: '' };

export default function ProfileMenu({ align = 'left', children }) {
  const { user: sessionUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 280 });
  const [view, setView] = useState('info'),
    [pf, setPf] = useState(EMPTY),
    [msg, setMsg] = useState(null),
    [show, setShow] = useState(false),
    [saving, setSaving] = useState(false);
  const btnRef = useRef(null);
  const popRef = useRef(null);

  // busca os dados frescos do perfil na primeira abertura (cai no usuário da sessão se falhar)
  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: () => api('/auth/me'),
    enabled: open,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const me = data?.user || sessionUser || {};
  const nome = me.nome || 'Usuário';
  const email = me.email || '';

  // o formulário sempre começa limpo ao abrir o menu
  useEffect(() => {
    if (!open) return;
    setView('info');
    setPf(EMPTY);
    setMsg(null);
    setShow(false);
  }, [open]);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const width = Math.min(280, window.innerWidth - 24);
      const left = Math.max(
        12,
        Math.min(
          align === 'right' ? r.right - width : r.left,
          window.innerWidth - width - 12,
        ),
      );
      setPos({ top: Math.round(r.bottom + 10), left: Math.round(left), width });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (popRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onResize = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const save = async (ev) => {
    ev.preventDefault();
    if (!pf.atual || !pf.nova || !pf.conf)
      return setMsg({ ok: false, text: 'Preencha todos os campos.' });
    if (pf.nova.length < 8)
      return setMsg({
        ok: false,
        text: 'A nova senha deve ter pelo menos 8 caracteres.',
      });
    if (pf.nova !== pf.conf)
      return setMsg({
        ok: false,
        text: 'A confirmação não confere com a nova senha.',
      });
    setSaving(true);
    setMsg(null);
    try {
      await api('/auth/trocar-senha', {
        method: 'POST',
        body: { senhaAtual: pf.atual, novaSenha: pf.nova },
      });
      setPf(EMPTY);
      setMsg({ ok: true, text: 'Senha alterada com sucesso.' });
    } catch (x) {
      setMsg({ ok: false, text: x.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <span className="prof">
      <button
        type="button"
        className={`prof-btn${children ? ' me-btn' : ''}`}
        ref={btnRef}
        onClick={toggle}
        aria-label="Ver perfil"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Ver perfil"
      >
        <span className="prof-ava">{initials(nome)}</span>
        {children}
      </button>
      {open && (
        <div
          className="prof-pop"
          role="dialog"
          aria-label="Meu perfil"
          ref={popRef}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
          }}
        >
          <div className="prof-head">
            <div className="prof-ava lg">{initials(nome)}</div>
            <div className="prof-id">
              <div className="prof-nome">{nome}</div>
              <div className="prof-cargo">
                {me.cargo || PERFIL[me.perfil] || 'Usuário'}
              </div>
            </div>
          </div>
          <div className="prof-body">
            {view === 'senha' ? (
              <form className="prof-form" onSubmit={save}>
                <div>
                  <label htmlFor="prof-atual">Senha atual</label>
                  <div className="fld">
                    <I d={LOCK} size={14} className="fld-ic" />
                    <input
                      id="prof-atual"
                      type={show ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={pf.atual}
                      onChange={(e) => setPf({ ...pf, atual: e.target.value })}
                      autoFocus
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="prof-nova">Nova senha</label>
                  <div className="fld">
                    <I d={LOCK} size={14} className="fld-ic" />
                    <input
                      id="prof-nova"
                      type={show ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Mínimo 8 caracteres"
                      minLength={8}
                      value={pf.nova}
                      onChange={(e) => setPf({ ...pf, nova: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="eye"
                      onClick={() => setShow((v) => !v)}
                      aria-label={show ? 'Ocultar senhas' : 'Mostrar senhas'}
                      aria-pressed={show}
                      title={show ? 'Ocultar senhas' : 'Mostrar senhas'}
                    >
                      <I d={show ? EYE_OFF : EYE} size={15} />
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="prof-conf">Confirmar nova senha</label>
                  <div className="fld">
                    <I d={LOCK} size={14} className="fld-ic" />
                    <input
                      id="prof-conf"
                      type={show ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={pf.conf}
                      onChange={(e) => setPf({ ...pf, conf: e.target.value })}
                      required
                    />
                  </div>
                </div>
                {msg && (
                  <div
                    className={msg.ok ? 'prof-msg ok' : 'prof-msg err'}
                    role={msg.ok ? 'status' : 'alert'}
                  >
                    {msg.text}
                  </div>
                )}
                <div className="prof-actions">
                  <button
                    type="button"
                    className="btn sec sm"
                    onClick={() => setView('info')}
                  >
                    Voltar
                  </button>
                  <button className="btn sm" disabled={saving}>
                    {saving ? 'Salvando…' : 'Salvar'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <button
                  type="button"
                  className="prof-item"
                  onClick={() => setView('senha')}
                >
                  <I d={LOCK} size={15} />
                  Alterar senha
                  <I d={CHEV} size={14} className="chev" />
                </button>
                <div className="prof-row">
                  <I d={MAIL} size={15} />
                  <div>
                    <small>E-mail</small>
                    <span>{email || 'E-mail não disponível'}</span>
                  </div>
                </div>
                {me.perfil && (
                  <div className="prof-row">
                    <I d={USER} size={15} />
                    <div>
                      <small>Perfil</small>
                      <span>{PERFIL[me.perfil] || me.perfil}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </span>
  );
}

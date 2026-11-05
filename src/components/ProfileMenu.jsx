import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const I = ({ d, size = 17 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
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
const ID = (
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
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

export default function ProfileMenu({ align = 'left', children }) {
  const { user: sessionUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 280 });
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
            <div className="prof-row">
              <I d={ID} size={15} />
              <div>
                <small>Nome completo</small>
                <span>{nome}</span>
              </div>
            </div>
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
          </div>
        </div>
      )}
    </span>
  );
}

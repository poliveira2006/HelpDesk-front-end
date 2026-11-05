import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth.jsx';
import ProfileMenu from './ProfileMenu.jsx';

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
const P = {
  tag: (
    <>
      <path d="M20.59 13.41 11 3H4v7l9.59 10.41a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82Z" />
      <circle cx="7" cy="6" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  box: (
    <>
      <rect x="3" y="4" width="18" height="5" rx="1" />
      <path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
      <path d="M10 13h4" />
    </>
  ),
  list: (
    <>
      <line x1="9" y1="6" x2="21" y2="6" />
      <line x1="9" y1="12" x2="21" y2="12" />
      <line x1="9" y1="18" x2="21" y2="18" />
      <circle cx="4.6" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="4.6" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="4.6" cy="18" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  pie: (
    <>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 2 12 12" />
      <path d="M22 2h-7" />
      <path d="M22 2v7" />
    </>
  ),
  plus: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
  burger: (
    <>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </>
  ),
};
const links = [
  ['meus', 'Meus Tickets', 'tag'],
  ['ativos', 'Tickets Ativos', 'box'],
  ['todos', 'Todos os Tickets', 'list'],
  ['dashboard', 'Dashboard', 'pie'],
  ['novo', 'Novo Ticket', 'plus'],
  ['manual', 'Manual', 'info'],
];
const TITLES = {
  '/meus': 'Meus Tickets',
  '/ativos': 'Tickets Ativos',
  '/todos': 'Todos os Tickets',
  '/dashboard': 'Visão Geral - Dashboard',
  '/novo': 'Novo Ticket',
  '/manual': 'Manual',
};

export default function Layout() {
  const { user, logout } = useAuth(),
    qc = useQueryClient(),
    [col, setCol] = useState(false),
    loc = useLocation();
  return (
    <div className={col ? 'collapsed' : ''}>
      <div id="side">
        <div className="me">
          <ProfileMenu>
            <span className="who">
              <span className="n">{user.nome}</span>
              <small>{user.cargo || 'Usuário'}</small>
            </span>
          </ProfileMenu>
        </div>
        {links.map(([to, t, ic]) => (
          <NavLink
            key={to}
            to={'/' + to}
            className={({ isActive }) => (isActive ? 'on' : '')}
          >
            <I d={P[ic]} />
            {t}
          </NavLink>
        ))}
      </div>
      <div id="main">
        <div className="top">
          <button
            className="burger"
            onClick={() => setCol(!col)}
            aria-label="Alternar menu"
          >
            <I d={P.burger} size={22} />
          </button>
          <span className="title">{TITLES[loc.pathname] || 'HelpDesk'}</span>
          <a
            href="#/login"
            className="logout"
            onClick={() => {
              qc.clear();
              logout();
            }}
          >
            <I d={P.logout} size={16} />
            Logout
          </a>
        </div>
        <Outlet />
        <div className="foot">
          <b>Atendimento ao Cliente</b>
          <span>Copyright © {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}

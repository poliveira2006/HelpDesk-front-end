import { useEffect, useState } from 'react';

const KEY = 'helpdesk-theme';
const getTheme = () => document.documentElement.dataset.theme || 'light';
const syncMeta = (t) =>
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', t === 'dark' ? '#0f151d' : '#f0f2f5');

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    const onChange = () => setTheme(getTheme());
    window.addEventListener('theme-change', onChange);
    return () => window.removeEventListener('theme-change', onChange);
  }, []);

  const dark = theme === 'dark';
  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* armazenamento indisponível: tema só nesta sessão */
    }
    document.documentElement.dataset.theme = next;
    syncMeta(next);
    window.dispatchEvent(new Event('theme-change'));
  };

  const label = dark ? 'Mudar para tema claro' : 'Mudar para tema escuro';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={dark}
    >
      {dark ? (
        <svg
          viewBox="0 0 24 24"
          width="17"
          height="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4.2" />
          <line x1="12" y1="2.5" x2="12" y2="4.5" />
          <line x1="12" y1="19.5" x2="12" y2="21.5" />
          <line x1="2.5" y1="12" x2="4.5" y2="12" />
          <line x1="19.5" y1="12" x2="21.5" y2="12" />
          <line x1="4.6" y1="4.6" x2="6" y2="6" />
          <line x1="18" y1="18" x2="19.4" y2="19.4" />
          <line x1="4.6" y1="19.4" x2="6" y2="18" />
          <line x1="18" y1="6" x2="19.4" y2="4.6" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          width="17"
          height="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.4 13.2A8.5 8.5 0 1 1 10.8 3.6a7 7 0 0 0 9.6 9.6Z" />
        </svg>
      )}
    </button>
  );
}

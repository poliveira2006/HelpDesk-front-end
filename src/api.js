const BASE =
  (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1';
export const session = {
  get token() {
    return sessionStorage.getItem('tk');
  },
  get user() {
    return JSON.parse(sessionStorage.getItem('me') || 'null');
  },
  set(t, u) {
    sessionStorage.setItem('tk', t);
    sessionStorage.setItem('me', JSON.stringify(u));
  },
  clear() {
    sessionStorage.clear();
  },
};
export async function api(path, { method = 'GET', body, blob } = {}) {
  const r = await fetch(BASE + path, {
    method,
    body: body && JSON.stringify(body),
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(session.token ? { Authorization: 'Bearer ' + session.token } : {}),
    },
  });
  if (r.status === 401 && session.token) {
    session.clear();
    window.dispatchEvent(new Event('logout'));
  }
  if (blob && r.ok) return r.blob();
  const j = await r.json().catch(() => ({}));
  if (!r.ok)
    throw new Error(
      j.detalhes?.length
        ? `${j.erro}: ${j.detalhes.join(', ')}`
        : j.erro || 'Erro',
    );
  return j;
}
export const fmt = (d) =>
  d
    ? new Date(d).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : '';
export const qs = (o) =>
  new URLSearchParams(
    Object.entries(o).filter(([, v]) => v !== '' && v != null && v !== false),
  ).toString();

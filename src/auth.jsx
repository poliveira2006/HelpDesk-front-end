import { createContext, useContext, useEffect, useState } from 'react';
import { api, session } from './api.js';
const Ctx = createContext();
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(session.user);
  useEffect(() => {
    const f = () => setUser(null);
    addEventListener('logout', f);
    return () => removeEventListener('logout', f);
  }, []);
  // atualiza os dados da sessão (inclui o perfil, usado para permissões na UI)
  useEffect(() => {
    if (!session.token) return;
    let alive = true;
    api('/auth/me')
      .then((r) => {
        if (!alive) return;
        const merged = { ...session.user, ...r.user };
        session.set(session.token, merged);
        setUser(merged);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const login = async (email, senha) => {
    const r = await api('/auth/login', {
      method: 'POST',
      body: { email, senha },
    });
    session.set(r.token, r.user);
    setUser(r.user);
  };
  const logout = () => {
    session.clear();
    setUser(null);
  };
  return (
    <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>
  );
}

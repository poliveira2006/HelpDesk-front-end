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

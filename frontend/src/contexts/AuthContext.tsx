import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api';

interface User { id: string; email: string; name: string; }
interface AuthCtx {
  user: User | null; token: string | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void; loading: boolean;
}

const AuthContext = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('pollify_token');
    const savedUser = localStorage.getItem('pollify_user');
    if (savedToken && savedUser) { setToken(savedToken); setUser(JSON.parse(savedUser)); }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('pollify_token', t); localStorage.setItem('pollify_user', JSON.stringify(u));
    setToken(t); setUser(u);
  };

  const register = async (email: string, name: string, password: string) => {
    const res = await authApi.register({ email, name, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('pollify_token', t); localStorage.setItem('pollify_user', JSON.stringify(u));
    setToken(t); setUser(u);
  };

  const googleLogin = async (idToken: string) => {
    const res = await authApi.googleLogin({ idToken });
    const { token: t, user: u } = res.data;
    localStorage.setItem('pollify_token', t); localStorage.setItem('pollify_user', JSON.stringify(u));
    setToken(t); setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('pollify_token'); localStorage.removeItem('pollify_user');
    setToken(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, googleLogin, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

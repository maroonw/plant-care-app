import React, { createContext, useEffect, useMemo, useState } from 'react';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ehp_token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('ehp_user');
    return raw ? JSON.parse(raw) : null;
  });

  // persist on change
  useEffect(() => {
    if (token) localStorage.setItem('ehp_token', token);
    else localStorage.removeItem('ehp_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('ehp_user', JSON.stringify(user));
    else localStorage.removeItem('ehp_user');
  }, [user]);

  const value = useMemo(() => ({
    token,
    user,
    isAuthed: !!token,
    login: ({ token, user }) => { setToken(token); setUser(user); },
    logout: () => { setToken(''); setUser(null); },
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

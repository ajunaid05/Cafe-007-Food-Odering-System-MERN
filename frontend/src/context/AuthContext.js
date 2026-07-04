import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem('auth', JSON.stringify(auth));
    } else {
      localStorage.removeItem('auth');
    }
  }, [auth]);

  const login = (data) => {
    if (data.user) {
      setAuth({
        token: data.token,
        role: 'user',
        user: data.user,
      });
    } else if (data.owner) {
      setAuth({
        token: data.token,
        role: 'owner',
        owner: data.owner,
      });
    } else {
      setAuth(data);
    }
  };

  const logout = () => setAuth(null);

  const isUser = () => auth?.role === 'user' && !!auth?.token;
  const isOwner = () => auth?.role === 'owner' && !!auth?.token;

  return (
    <AuthContext.Provider value={{ auth, login, logout, isUser, isOwner }}>
      {children}
    </AuthContext.Provider>
  );
};

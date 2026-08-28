import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, storage } from '../services/api.ts';
import type { AuthUser } from '../types/index.ts';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isDocente: boolean;
  isAluno: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(storage.getToken());
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const currentToken = storage.getToken();
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.auth.me();
      setUser(response.user);
    } catch (err) {
      console.warn('Falha na autenticação do token salvo:', err);
      storage.removeToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, senha: string): Promise<AuthUser> => {
    setLoading(true);
    try {
      const response = await api.auth.login(email, senha);
      storage.setToken(response.token);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    storage.removeToken();
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.perfil === 'ADMINISTRADOR';
  const isDocente = user?.perfil === 'DOCENTE';
  const isAluno = user?.perfil === 'ALUNO';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
        isAdmin,
        isDocente,
        isAluno,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

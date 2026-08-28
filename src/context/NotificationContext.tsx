import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';
import type { Notificacao } from '../types/index.ts';

interface NotificationContextType {
  notificacoes: Notificacao[];
  unreadCount: number;
  loading: boolean;
  refreshNotificacoes: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  toast: { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  hideToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const refreshNotificacoes = useCallback(async () => {
    if (!user) {
      setNotificacoes([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const res = await api.notificacoes.list();
      setNotificacoes(res.notificacoes);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshNotificacoes();
    const interval = setInterval(refreshNotificacoes, 15000);
    return () => clearInterval(interval);
  }, [refreshNotificacoes]);

  const markAsRead = async (id: string) => {
    try {
      await api.notificacoes.markRead(id);
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.notificacoes.markAllRead();
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
      setUnreadCount(0);
      showToast('Todas as notificações foram marcadas como lidas.', 'info');
    } catch (err) {
      console.error('Erro ao marcar todas notificações como lidas:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notificacoes,
        unreadCount,
        loading,
        refreshNotificacoes,
        markAsRead,
        markAllAsRead,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de NotificationProvider');
  }
  return context;
}

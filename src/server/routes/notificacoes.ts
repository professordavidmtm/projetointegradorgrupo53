import { Router, type Response } from 'express';
import { getDB, saveDB } from '../db.ts';
import { authenticate, type AuthenticatedRequest } from '../middleware.ts';

export const notificacoesRouter = Router();

notificacoesRouter.use(authenticate);

// Listar notificações do usuário logado (ou gerais para admins)
notificacoesRouter.get('/', (req: AuthenticatedRequest, res: Response): void => {
  const db = getDB();
  const currentUser = req.user!;

  const lista = db.notificacoes.filter((n) => {
    if (n.destinatarioId === currentUser.id) return true;
    if (n.destinatarioId === 'ALL_ADMINS' && currentUser.perfil === 'ADMINISTRADOR') return true;
    return false;
  });

  // Mais recentes primeiro
  lista.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = lista.filter((n) => !n.lida).length;

  res.json({
    notificacoes: lista,
    unreadCount,
  });
});

// Marcar notificação individual como lida
notificacoesRouter.patch('/:id/lida', (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDB();
  const notif = db.notificacoes.find((n) => n.id === id);

  if (!notif) {
    res.status(404).json({ error: 'Notificação não encontrada.' });
    return;
  }

  notif.lida = true;
  saveDB(db);

  res.json({ message: 'Notificação marcada como lida.', notificacao: notif });
});

// Marcar todas as notificações do usuário como lidas
notificacoesRouter.patch('/ler-todas', (req: AuthenticatedRequest, res: Response): void => {
  const db = getDB();
  const currentUser = req.user!;

  for (const n of db.notificacoes) {
    if (
      n.destinatarioId === currentUser.id ||
      (n.destinatarioId === 'ALL_ADMINS' && currentUser.perfil === 'ADMINISTRADOR')
    ) {
      n.lida = true;
    }
  }

  saveDB(db);

  res.json({ message: 'Todas as notificações foram marcadas como lidas.' });
});

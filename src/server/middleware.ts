import type { Request, Response, NextFunction } from 'express';
import { verifyToken, toAuthUser } from './auth.ts';
import { getDB } from './db.ts';
import type { AuthUser, UserRole } from '../types/index.ts';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Não autorizado. Token de autenticação não fornecido.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Sessão expirada ou token inválido. Faça login novamente.' });
    return;
  }

  const db = getDB();
  const user = db.pessoas.find((p) => p.id === payload.id);

  if (!user || user.status === 'Inativo') {
    res.status(401).json({ error: 'Usuário inativo ou não encontrado.' });
    return;
  }

  req.user = toAuthUser(user);
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado.' });
      return;
    }

    if (!allowedRoles.includes(req.user.perfil)) {
      res.status(403).json({
        error: `Acesso negado. Ação permitida apenas para: ${allowedRoles.join(', ')}.`,
      });
      return;
    }

    next();
  };
}

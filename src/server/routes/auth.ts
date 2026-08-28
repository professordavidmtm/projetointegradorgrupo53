import { Router, type Response } from 'express';
import { getDB, saveDB } from '../db.ts';
import { verifyPassword, generateToken, toAuthUser, hashPassword } from '../auth.ts';
import { authenticate, type AuthenticatedRequest } from '../middleware.ts';
import { isValidEmail } from '../validators.ts';

export const authRouter = Router();

authRouter.post('/login', (req, res: Response): void => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    res.status(400).json({ error: 'Informe e-mail e senha para acessar o sistema.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const db = getDB();
  const user = db.pessoas.find((p) => p.email.toLowerCase() === normalizedEmail);

  if (!user) {
    res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
    return;
  }

  if (user.status === 'Inativo') {
    res.status(403).json({ error: 'Sua conta está inativa. Entre em contato com a administração.' });
    return;
  }

  if (!user.senhaHash || !verifyPassword(senha, user.senhaHash)) {
    res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
    return;
  }

  const token = generateToken(user);
  res.json({
    token,
    user: toAuthUser(user),
  });
});

authRouter.get('/me', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  res.json({ user: req.user });
});

authRouter.post('/recover-password', (req, res: Response): void => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    res.status(400).json({ error: 'Informe um e-mail válido para recuperação.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const db = getDB();
  const user = db.pessoas.find((p) => p.email.toLowerCase() === normalizedEmail);

  if (!user) {
    // Por segurança e clareza, confirmamos a recepção
    res.json({
      message: 'Se este e-mail estiver cadastrado, as instruções de recuperação foram enviadas.',
    });
    return;
  }

  // Reseta para senha padrão '123456' em ambiente de demonstração institucional
  user.senhaHash = hashPassword('123456');
  user.updatedAt = new Date().toISOString();
  saveDB(db);

  res.json({
    message: 'Instruções de redefinição processadas! Sua senha temporária foi redefinida para: 123456',
  });
});

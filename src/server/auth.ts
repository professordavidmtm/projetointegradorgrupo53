import crypto from 'node:crypto';
import type { AuthUser, PessoaFisica } from '../types/index.ts';

const TOKEN_SECRET = process.env.AUTH_SECRET || 'uni-equip-sec-key-2026-prod-auth';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

export function generateToken(user: PessoaFisica): string {
  const payload = {
    id: user.id,
    email: user.email,
    perfil: user.perfil,
    nome: user.nome,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  const jsonStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonStr).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

export function verifyToken(token: string): { id: string; email: string; perfil: string; nome: string } | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [base64Payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(base64Payload)
    .digest('base64url');

  if (signature !== expectedSig) return null;

  try {
    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf8');
    const payload = JSON.parse(jsonStr);
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function toAuthUser(p: PessoaFisica): AuthUser {
  return {
    id: p.id,
    nome: p.nome,
    email: p.email,
    cpf: p.cpf,
    telefone: p.telefone,
    perfil: p.perfil,
    status: p.status,
    bloqueadoPorAtraso: p.bloqueadoPorAtraso,
    matricula: p.matricula,
    departamentoCurso: p.departamentoCurso,
  };
}

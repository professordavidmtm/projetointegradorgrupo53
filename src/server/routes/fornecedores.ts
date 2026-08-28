import { Router, type Response } from 'express';
import crypto from 'node:crypto';
import { getDB, saveDB } from '../db.ts';
import { authenticate, requireRole, type AuthenticatedRequest } from '../middleware.ts';
import {
  isValidCNPJ,
  isValidEmail,
  formatCNPJ,
  formatPhone,
  cleanNumeric,
} from '../validators.ts';
import type { Fornecedor } from '../../types/index.ts';

export const fornecedoresRouter = Router();

fornecedoresRouter.use(authenticate);

// Listar fornecedores (Administrador)
fornecedoresRouter.get('/', (req: AuthenticatedRequest, res: Response): void => {
  const { busca, status } = req.query;
  const db = getDB();

  let lista = [...db.fornecedores];

  if (busca && typeof busca === 'string') {
    const q = busca.toLowerCase();
    const cleanQ = cleanNumeric(busca);
    lista = lista.filter(
      (f) =>
        f.razaoSocial.toLowerCase().includes(q) ||
        f.nomeFantasia.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        (cleanQ && cleanNumeric(f.cnpj).includes(cleanQ))
    );
  }

  if (status && typeof status === 'string') {
    lista = lista.filter((f) => f.status === status);
  }

  res.json(lista);
});

// Detalhes de um fornecedor
fornecedoresRouter.get('/:id', (req: AuthenticatedRequest, res: Response): void => {
  const db = getDB();
  const forn = db.fornecedores.find((f) => f.id === req.params.id);
  if (!forn) {
    res.status(404).json({ error: 'Fornecedor não encontrado.' });
    return;
  }
  res.json(forn);
});

// Cadastrar fornecedor (Apenas Administrador)
fornecedoresRouter.post('/', requireRole(['ADMINISTRADOR']), (req: AuthenticatedRequest, res: Response): void => {
  const {
    razaoSocial,
    nomeFantasia,
    cnpj,
    endereco,
    telefone,
    email,
    status = 'Ativo',
  } = req.body;

  const errors: Record<string, string> = {};
  if (!razaoSocial || !razaoSocial.trim()) errors.razaoSocial = 'Razão Social é obrigatória.';
  if (!nomeFantasia || !nomeFantasia.trim()) errors.nomeFantasia = 'Nome Fantasia é obrigatório.';
  if (!cnpj || !cnpj.trim()) errors.cnpj = 'CNPJ é obrigatório.';
  if (!endereco || !endereco.trim()) errors.endereco = 'Endereço é obrigatório.';
  if (!telefone || !telefone.trim()) errors.telefone = 'Telefone é obrigatório.';
  if (!email || !email.trim()) errors.email = 'E-mail é obrigatório.';

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: 'Preencha todos os campos obrigatórios.', fields: errors });
    return;
  }

  if (!isValidCNPJ(cnpj)) {
    res.status(400).json({
      error: 'CNPJ inválido. Verifique os dígitos informados.',
      fields: { cnpj: 'CNPJ inválido.' },
    });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({
      error: 'E-mail inválido.',
      fields: { email: 'E-mail em formato inválido.' },
    });
    return;
  }

  const db = getDB();
  const cleanCnpj = cleanNumeric(cnpj);
  const existsCnpj = db.fornecedores.some((f) => cleanNumeric(f.cnpj) === cleanCnpj);

  if (existsCnpj) {
    res.status(400).json({
      error: 'CNPJ já cadastrado. Verifique os dados.',
      fields: { cnpj: 'CNPJ já cadastrado. Verifique os dados.' },
    });
    return;
  }

  const novoFornecedor: Fornecedor = {
    id: `forn-${crypto.randomUUID()}`,
    razaoSocial: razaoSocial.trim(),
    nomeFantasia: nomeFantasia.trim(),
    cnpj: formatCNPJ(cnpj),
    endereco: endereco.trim(),
    telefone: formatPhone(telefone),
    email: email.trim().toLowerCase(),
    status: status || 'Ativo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.fornecedores.push(novoFornecedor);
  saveDB(db);

  res.status(201).json({
    message: 'Fornecedor cadastrado com sucesso.',
    fornecedor: novoFornecedor,
  });
});

// Editar fornecedor (Apenas Administrador)
fornecedoresRouter.put('/:id', requireRole(['ADMINISTRADOR']), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const {
    razaoSocial,
    nomeFantasia,
    cnpj,
    endereco,
    telefone,
    email,
    status,
  } = req.body;

  const db = getDB();
  const forn = db.fornecedores.find((f) => f.id === id);

  if (!forn) {
    res.status(404).json({ error: 'Fornecedor não encontrado.' });
    return;
  }

  const errors: Record<string, string> = {};
  if (!razaoSocial || !razaoSocial.trim()) errors.razaoSocial = 'Razão Social é obrigatória.';
  if (!nomeFantasia || !nomeFantasia.trim()) errors.nomeFantasia = 'Nome Fantasia é obrigatório.';
  if (!cnpj || !cnpj.trim()) errors.cnpj = 'CNPJ é obrigatório.';
  if (!endereco || !endereco.trim()) errors.endereco = 'Endereço é obrigatório.';
  if (!telefone || !telefone.trim()) errors.telefone = 'Telefone é obrigatório.';
  if (!email || !email.trim()) errors.email = 'E-mail é obrigatório.';

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: 'Preencha todos os campos obrigatórios.', fields: errors });
    return;
  }

  if (!isValidCNPJ(cnpj)) {
    res.status(400).json({
      error: 'CNPJ inválido.',
      fields: { cnpj: 'CNPJ inválido.' },
    });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({
      error: 'E-mail inválido.',
      fields: { email: 'E-mail em formato inválido.' },
    });
    return;
  }

  const cleanCnpj = cleanNumeric(cnpj);
  const duplicateCnpj = db.fornecedores.some((f) => f.id !== id && cleanNumeric(f.cnpj) === cleanCnpj);
  if (duplicateCnpj) {
    res.status(400).json({
      error: 'CNPJ já cadastrado. Verifique os dados.',
      fields: { cnpj: 'CNPJ já cadastrado. Verifique os dados.' },
    });
    return;
  }

  forn.razaoSocial = razaoSocial.trim();
  forn.nomeFantasia = nomeFantasia.trim();
  forn.cnpj = formatCNPJ(cnpj);
  forn.endereco = endereco.trim();
  forn.telefone = formatPhone(telefone);
  forn.email = email.trim().toLowerCase();
  if (status) forn.status = status;
  forn.updatedAt = new Date().toISOString();

  // Atualiza nome fantasia nos equipamentos vinculados se houver alteração
  for (const eq of db.equipamentos) {
    if (eq.fornecedorId === id) {
      eq.fornecedorNome = forn.nomeFantasia;
    }
  }

  saveDB(db);

  res.json({
    message: 'Fornecedor atualizado com sucesso.',
    fornecedor: forn,
  });
});

// Inativar fornecedor (Apenas Administrador)
fornecedoresRouter.delete('/:id', requireRole(['ADMINISTRADOR']), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDB();
  const forn = db.fornecedores.find((f) => f.id === id);

  if (!forn) {
    res.status(404).json({ error: 'Fornecedor não encontrado.' });
    return;
  }

  forn.status = 'Inativo';
  forn.updatedAt = new Date().toISOString();
  saveDB(db);

  res.json({ message: 'Fornecedor inativado com sucesso.' });
});

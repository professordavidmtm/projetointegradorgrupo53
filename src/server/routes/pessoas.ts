import { Router, type Response } from 'express';
import crypto from 'node:crypto';
import { getDB, saveDB } from '../db.ts';
import { authenticate, requireRole, type AuthenticatedRequest } from '../middleware.ts';
import {
  isValidCPF,
  isValidEmail,
  formatCPF,
  formatPhone,
  cleanNumeric,
} from '../validators.ts';
import { hashPassword, toAuthUser } from '../auth.ts';
import type { PessoaFisica, UserRole } from '../../types/index.ts';

export const pessoasRouter = Router();

// Apenas Administrador pode acessar e gerenciar o módulo de Pessoas
pessoasRouter.use(authenticate);

// Listagem de pessoas (Alunos, Docentes, Administradores)
// Admin pode listar todas. Para o dropdown de beneficiários em novos empréstimos, docentes/administradores também podem obter a lista resumida.
pessoasRouter.get('/', (req: AuthenticatedRequest, res: Response): void => {
  const { busca, perfil, status } = req.query;
  const db = getDB();

  let lista = [...db.pessoas];

  // Se for aluno, não pode listar outras pessoas
  if (req.user?.perfil === 'ALUNO') {
    res.status(403).json({ error: 'Acesso restrito a Administradores e Docentes.' });
    return;
  }

  if (busca && typeof busca === 'string') {
    const q = busca.toLowerCase();
    const cleanQ = cleanNumeric(busca);
    lista = lista.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (cleanQ && cleanNumeric(p.cpf).includes(cleanQ)) ||
        (p.matricula && p.matricula.toLowerCase().includes(q))
    );
  }

  if (perfil && typeof perfil === 'string') {
    lista = lista.filter((p) => p.perfil === perfil);
  }

  if (status && typeof status === 'string') {
    lista = lista.filter((p) => p.status === status);
  }

  const result = lista.map((p) => toAuthUser(p));
  res.json(result);
});

// Detalhes de uma pessoa
pessoasRouter.get('/:id', (req: AuthenticatedRequest, res: Response): void => {
  const db = getDB();
  const pessoa = db.pessoas.find((p) => p.id === req.params.id);

  if (!pessoa) {
    res.status(404).json({ error: 'Pessoa não encontrada.' });
    return;
  }

  // Aluno só pode ver o próprio perfil
  if (req.user?.perfil === 'ALUNO' && req.user.id !== pessoa.id) {
    res.status(403).json({ error: 'Acesso não autorizado.' });
    return;
  }

  res.json(toAuthUser(pessoa));
});

// Cadastrar pessoa (Apenas Administrador)
pessoasRouter.post('/', requireRole(['ADMINISTRADOR']), (req: AuthenticatedRequest, res: Response): void => {
  const {
    nome,
    cpf,
    email,
    telefone,
    perfil,
    status = 'Ativo',
    senha = '123456',
    matricula,
    departamentoCurso,
  } = req.body;

  // Validação de campos obrigatórios
  const errors: Record<string, string> = {};
  if (!nome || !nome.trim()) errors.nome = 'Nome completo é obrigatório.';
  if (!cpf || !cpf.trim()) errors.cpf = 'CPF é obrigatório.';
  if (!email || !email.trim()) errors.email = 'E-mail é obrigatório.';
  if (!telefone || !telefone.trim()) errors.telefone = 'Telefone é obrigatório.';
  if (!perfil) errors.perfil = 'Perfil de acesso é obrigatório.';

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: 'Preencha todos os campos obrigatórios.', fields: errors });
    return;
  }

  // Validação de formato de CPF
  if (!isValidCPF(cpf)) {
    res.status(400).json({ error: 'CPF inválido. Verifique os dígitos informados.', fields: { cpf: 'CPF inválido.' } });
    return;
  }

  // Validação de formato de E-mail
  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'E-mail inválido.', fields: { email: 'E-mail em formato inválido.' } });
    return;
  }

  const db = getDB();
  const cpfClean = cleanNumeric(cpf);
  const emailNorm = email.trim().toLowerCase();

  // Validação de duplicidade de CPF
  const existsCpf = db.pessoas.some((p) => cleanNumeric(p.cpf) === cpfClean);
  if (existsCpf) {
    res.status(400).json({ error: 'CPF já cadastrado.', fields: { cpf: 'CPF já cadastrado.' } });
    return;
  }

  // Validação de duplicidade de E-mail
  const existsEmail = db.pessoas.some((p) => p.email.toLowerCase() === emailNorm);
  if (existsEmail) {
    res.status(400).json({ error: 'E-mail já cadastrado.', fields: { email: 'E-mail já cadastrado.' } });
    return;
  }

  const novaPessoa: PessoaFisica = {
    id: `usr-${crypto.randomUUID()}`,
    nome: nome.trim(),
    cpf: formatCPF(cpf),
    email: emailNorm,
    telefone: formatPhone(telefone),
    perfil: perfil as UserRole,
    status: status || 'Ativo',
    matricula: matricula ? matricula.trim() : undefined,
    departamentoCurso: departamentoCurso ? departamentoCurso.trim() : undefined,
    senhaHash: hashPassword(senha || '123456'),
    bloqueadoPorAtraso: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.pessoas.push(novaPessoa);
  saveDB(db);

  res.status(201).json({
    message: 'Pessoa cadastrada com sucesso.',
    pessoa: toAuthUser(novaPessoa),
  });
});

// Editar pessoa (Apenas Administrador)
pessoasRouter.put('/:id', requireRole(['ADMINISTRADOR']), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const {
    nome,
    cpf,
    email,
    telefone,
    perfil,
    status,
    senha,
    matricula,
    departamentoCurso,
  } = req.body;

  const db = getDB();
  const pessoa = db.pessoas.find((p) => p.id === id);

  if (!pessoa) {
    res.status(404).json({ error: 'Pessoa não encontrada.' });
    return;
  }

  const errors: Record<string, string> = {};
  if (!nome || !nome.trim()) errors.nome = 'Nome completo é obrigatório.';
  if (!cpf || !cpf.trim()) errors.cpf = 'CPF é obrigatório.';
  if (!email || !email.trim()) errors.email = 'E-mail é obrigatório.';
  if (!telefone || !telefone.trim()) errors.telefone = 'Telefone é obrigatório.';

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: 'Preencha todos os campos obrigatórios.', fields: errors });
    return;
  }

  if (!isValidCPF(cpf)) {
    res.status(400).json({ error: 'CPF inválido.', fields: { cpf: 'CPF inválido.' } });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'E-mail inválido.', fields: { email: 'E-mail em formato inválido.' } });
    return;
  }

  const cpfClean = cleanNumeric(cpf);
  const emailNorm = email.trim().toLowerCase();

  // Checa duplicidade com outras pessoas
  const duplicateCpf = db.pessoas.some((p) => p.id !== id && cleanNumeric(p.cpf) === cpfClean);
  if (duplicateCpf) {
    res.status(400).json({ error: 'CPF já cadastrado.', fields: { cpf: 'CPF já cadastrado.' } });
    return;
  }

  const duplicateEmail = db.pessoas.some((p) => p.id !== id && p.email.toLowerCase() === emailNorm);
  if (duplicateEmail) {
    res.status(400).json({ error: 'E-mail já cadastrado.', fields: { email: 'E-mail já cadastrado.' } });
    return;
  }

  pessoa.nome = nome.trim();
  pessoa.cpf = formatCPF(cpf);
  pessoa.email = emailNorm;
  pessoa.telefone = formatPhone(telefone);
  if (perfil) pessoa.perfil = perfil as UserRole;
  if (status) pessoa.status = status;
  if (matricula !== undefined) pessoa.matricula = matricula.trim();
  if (departamentoCurso !== undefined) pessoa.departamentoCurso = departamentoCurso.trim();
  if (senha && senha.trim()) {
    pessoa.senhaHash = hashPassword(senha.trim());
  }
  pessoa.updatedAt = new Date().toISOString();

  saveDB(db);

  res.json({
    message: 'Pessoa atualizada com sucesso.',
    pessoa: toAuthUser(pessoa),
  });
});

// Inativar / Excluir pessoa (Apenas Administrador)
pessoasRouter.delete('/:id', requireRole(['ADMINISTRADOR']), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDB();
  const pessoa = db.pessoas.find((p) => p.id === id);

  if (!pessoa) {
    res.status(404).json({ error: 'Pessoa não encontrada.' });
    return;
  }

  // Verifica se possui empréstimos ativos
  const hasActiveLoans = db.emprestimos.some(
    (e) => e.beneficiarioId === id && (e.status === 'Em Andamento' || e.status === 'Atrasado')
  );

  if (hasActiveLoans) {
    res.status(400).json({
      error: 'Não é possível inativar usuário com empréstimos em andamento ou atrasados.',
    });
    return;
  }

  pessoa.status = 'Inativo';
  pessoa.updatedAt = new Date().toISOString();
  saveDB(db);

  res.json({ message: 'Pessoa inativada com sucesso.' });
});

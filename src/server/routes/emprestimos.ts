import { Router, type Response } from 'express';
import crypto from 'node:crypto';
import { getDB, saveDB, generateNextLoanCode, addNotification } from '../db.ts';
import { authenticate, type AuthenticatedRequest } from '../middleware.ts';
import type { Emprestimo, ItemEmprestimo, UserRole } from '../../types/index.ts';

export const emprestimosRouter = Router();

emprestimosRouter.use(authenticate);

// Listar empréstimos
// Admin: vê todos
// Aluno / Docente: vê apenas os seus próprios
emprestimosRouter.get('/', (req: AuthenticatedRequest, res: Response): void => {
  const { busca, status, beneficiarioId } = req.query;
  const db = getDB();
  const currentUser = req.user!;

  let lista = [...db.emprestimos];

  // Restrição de perfil: Aluno e Docente só veem os seus
  if (currentUser.perfil === 'ALUNO' || currentUser.perfil === 'DOCENTE') {
    lista = lista.filter((e) => e.beneficiarioId === currentUser.id);
  } else if (beneficiarioId && typeof beneficiarioId === 'string') {
    lista = lista.filter((e) => e.beneficiarioId === beneficiarioId);
  }

  if (busca && typeof busca === 'string') {
    const q = busca.toLowerCase();
    lista = lista.filter(
      (e) =>
        e.codigo.toLowerCase().includes(q) ||
        e.beneficiarioNome.toLowerCase().includes(q) ||
        e.beneficiarioCpf.includes(q) ||
        e.itens.some(
          (item) =>
            item.equipamentoNome.toLowerCase().includes(q) ||
            item.equipamentoNumeroSerie.toLowerCase().includes(q)
        )
    );
  }

  if (status && typeof status === 'string') {
    lista = lista.filter((e) => e.status === status);
  }

  // Ordena pelos mais recentes
  lista.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(lista);
});

// Detalhes do empréstimo
emprestimosRouter.get('/:id', (req: AuthenticatedRequest, res: Response): void => {
  const db = getDB();
  const emp = db.emprestimos.find((e) => e.id === req.params.id);

  if (!emp) {
    res.status(404).json({ error: 'Empréstimo não encontrado.' });
    return;
  }

  const currentUser = req.user!;
  if (currentUser.perfil !== 'ADMINISTRADOR' && emp.beneficiarioId !== currentUser.id) {
    res.status(403).json({ error: 'Acesso não autorizado a este empréstimo.' });
    return;
  }

  res.json(emp);
});

// Criar novo empréstimo (Multi-equipamentos)
emprestimosRouter.post('/', (req: AuthenticatedRequest, res: Response): void => {
  const currentUser = req.user!;
  const {
    beneficiarioId: reqBeneficiarioId,
    equipamentosIds,
    dataEmprestimo,
    dataPrevistaDevolucao,
    observacoes,
  } = req.body;

  const db = getDB();

  // 1. Determinação do beneficiário
  let targetBeneficiarioId = currentUser.id;
  if (currentUser.perfil === 'ADMINISTRADOR' && reqBeneficiarioId) {
    targetBeneficiarioId = reqBeneficiarioId;
  }

  const beneficiario = db.pessoas.find((p) => p.id === targetBeneficiarioId);
  if (!beneficiario) {
    res.status(400).json({ error: 'Beneficiário não encontrado no sistema.' });
    return;
  }

  if (beneficiario.status === 'Inativo') {
    res.status(400).json({ error: 'Usuário inativo no sistema. Não é possível realizar empréstimo.' });
    return;
  }

  // 2. Validação de empréstimo atrasado / bloqueio
  const hasDelayedLoans = db.emprestimos.some(
    (e) => e.beneficiarioId === targetBeneficiarioId && e.status === 'Atrasado'
  );

  if (beneficiario.bloqueadoPorAtraso || hasDelayedLoans) {
    res.status(400).json({
      error: 'Empréstimo bloqueado. Regularize a devolução pendente.',
      bloqueado: true,
    });
    return;
  }

  // 3. Validação de equipamentos selecionados
  if (!equipamentosIds || !Array.isArray(equipamentosIds) || equipamentosIds.length === 0) {
    res.status(400).json({ error: 'Selecione pelo menos um equipamento para o empréstimo.' });
    return;
  }

  // 4. Validação de datas
  if (!dataPrevistaDevolucao) {
    res.status(400).json({ error: 'Informe a data prevista para devolução.' });
    return;
  }

  const startDate = dataEmprestimo ? new Date(dataEmprestimo) : new Date();
  const returnDate = new Date(dataPrevistaDevolucao);

  if (isNaN(returnDate.getTime())) {
    res.status(400).json({ error: 'Data de devolução prevista inválida.' });
    return;
  }

  // 5. Validação de disponibilidade de cada equipamento
  const selectedEquipments = [];
  for (const eqId of equipamentosIds) {
    const eq = db.equipamentos.find((e) => e.id === eqId);
    if (!eq) {
      res.status(400).json({ error: `Equipamento com ID ${eqId} não foi encontrado.` });
      return;
    }
    if (eq.status !== 'Disponível') {
      res.status(400).json({
        error: `Equipamento indisponível. Selecione outro. (${eq.nome} - Status: ${eq.status})`,
        equipamentoId: eq.id,
      });
      return;
    }
    selectedEquipments.push(eq);
  }

  const loanId = `emp-${crypto.randomUUID()}`;
  const loanCode = generateNextLoanCode(db);

  // Criação dos itens do empréstimo (Entidade intermediária ItemEmprestimo)
  const itens: ItemEmprestimo[] = selectedEquipments.map((eq) => ({
    id: `item-${crypto.randomUUID()}`,
    emprestimoId: loanId,
    equipamentoId: eq.id,
    equipamentoNome: eq.nome,
    equipamentoNumeroSerie: eq.numeroSerie,
    equipamentoTipo: eq.tipo,
    equipamentoMarca: eq.marca,
    equipamentoModelo: eq.modelo,
  }));

  const novoEmprestimo: Emprestimo = {
    id: loanId,
    codigo: loanCode,
    beneficiarioId: beneficiario.id,
    beneficiarioNome: beneficiario.nome,
    beneficiarioCpf: beneficiario.cpf,
    beneficiarioEmail: beneficiario.email,
    beneficiarioPerfil: beneficiario.perfil,
    responsavelOperacaoId: currentUser.id,
    responsavelOperacaoNome: currentUser.nome,
    dataEmprestimo: startDate.toISOString(),
    dataPrevistaDevolucao: dataPrevistaDevolucao,
    status: 'Em Andamento',
    observacoes: observacoes ? observacoes.trim() : undefined,
    itens,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Alterar status dos equipamentos para "Emprestado"
  for (const eq of selectedEquipments) {
    eq.status = 'Emprestado';
    eq.updatedAt = new Date().toISOString();
  }

  db.emprestimos.unshift(novoEmprestimo);

  // Criar notificação para o usuário
  addNotification(db, {
    destinatarioId: beneficiario.id,
    tipo: 'EMPRESTIMO_REALIZADO',
    titulo: 'Empréstimo Registrado com Sucesso',
    mensagem: `Seu empréstimo ${loanCode} com ${itens.length} equipamento(s) foi registrado. Devolução prevista até ${dataPrevistaDevolucao}.`,
    referenciaId: novoEmprestimo.id,
  });

  // Criar notificação para os administradores se foi feito por docente ou aluno
  if (currentUser.id !== beneficiario.id || currentUser.perfil !== 'ADMINISTRADOR') {
    addNotification(db, {
      destinatarioId: 'ALL_ADMINS',
      tipo: 'EMPRESTIMO_REALIZADO',
      titulo: 'Novo Empréstimo Solicitado',
      mensagem: `${beneficiario.nome} (${beneficiario.perfil}) registrou empréstimo ${loanCode} com ${itens.length} item(ns).`,
      referenciaId: novoEmprestimo.id,
    });
  }

  saveDB(db);

  res.status(201).json({
    message: 'Empréstimo realizado com sucesso.',
    emprestimo: novoEmprestimo,
  });
});

import { Router, type Response } from 'express';
import crypto from 'node:crypto';
import { getDB, saveDB } from '../db.ts';
import { authenticate, requireRole, type AuthenticatedRequest } from '../middleware.ts';
import type { Equipamento, EquipmentStatus } from '../../types/index.ts';

export const equipamentosRouter = Router();

equipamentosRouter.use(authenticate);

// Listar equipamentos (Alunos, Docentes e Administradores)
equipamentosRouter.get('/', (req: AuthenticatedRequest, res: Response): void => {
  const { busca, tipo, marca, fornecedorId, status } = req.query;
  const db = getDB();

  let lista = [...db.equipamentos];

  if (busca && typeof busca === 'string') {
    const q = busca.toLowerCase();
    lista = lista.filter(
      (eq) =>
        eq.nome.toLowerCase().includes(q) ||
        eq.numeroSerie.toLowerCase().includes(q) ||
        eq.modelo.toLowerCase().includes(q) ||
        eq.marca.toLowerCase().includes(q) ||
        eq.tipo.toLowerCase().includes(q)
    );
  }

  if (tipo && typeof tipo === 'string') {
    lista = lista.filter((eq) => eq.tipo.toLowerCase() === tipo.toLowerCase());
  }

  if (marca && typeof marca === 'string') {
    lista = lista.filter((eq) => eq.marca.toLowerCase() === marca.toLowerCase());
  }

  if (fornecedorId && typeof fornecedorId === 'string') {
    lista = lista.filter((eq) => eq.fornecedorId === fornecedorId);
  }

  if (status && typeof status === 'string') {
    lista = lista.filter((eq) => eq.status === status);
  }

  res.json(lista);
});

// Detalhes de um equipamento
equipamentosRouter.get('/:id', (req: AuthenticatedRequest, res: Response): void => {
  const db = getDB();
  const eq = db.equipamentos.find((e) => e.id === req.params.id);
  if (!eq) {
    res.status(404).json({ error: 'Equipamento não encontrado.' });
    return;
  }
  res.json(eq);
});

// Cadastrar equipamento (Apenas Administrador)
equipamentosRouter.post('/', requireRole(['ADMINISTRADOR']), (req: AuthenticatedRequest, res: Response): void => {
  const {
    nome,
    tipo,
    numeroSerie,
    marca,
    modelo,
    fornecedorId,
    dataAquisicao,
    observacoes,
  } = req.body;

  const errors: Record<string, string> = {};
  if (!nome || !nome.trim()) errors.nome = 'Nome do equipamento é obrigatório.';
  if (!tipo || !tipo.trim()) errors.tipo = 'Tipo de equipamento é obrigatório.';
  if (!numeroSerie || !numeroSerie.trim()) errors.numeroSerie = 'Número de série é obrigatório.';
  if (!marca || !marca.trim()) errors.marca = 'Marca é obrigatória.';
  if (!modelo || !modelo.trim()) errors.modelo = 'Modelo é obrigatório.';
  if (!fornecedorId || !fornecedorId.trim()) errors.fornecedorId = 'Fornecedor é obrigatório.';
  if (!dataAquisicao) errors.dataAquisicao = 'Data de aquisição é obrigatória.';

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: 'Preencha todos os campos obrigatórios.', fields: errors });
    return;
  }

  const db = getDB();

  // Verifica se fornecedor existe
  const fornecedor = db.fornecedores.find((f) => f.id === fornecedorId);
  if (!fornecedor) {
    res.status(400).json({
      error: 'Fornecedor selecionado não existe. Cadastre o fornecedor previamente.',
      fields: { fornecedorId: 'Fornecedor inválido.' },
    });
    return;
  }

  // Verifica unicidade de número de série
  const numSerieTrim = numeroSerie.trim().toUpperCase();
  const existsSerial = db.equipamentos.some(
    (e) => e.numeroSerie.trim().toUpperCase() === numSerieTrim
  );

  if (existsSerial) {
    res.status(400).json({
      error: 'Número de série já registrado.',
      fields: { numeroSerie: 'Número de série já registrado.' },
    });
    return;
  }

  const novoEquipamento: Equipamento = {
    id: `eq-${crypto.randomUUID()}`,
    nome: nome.trim(),
    tipo: tipo.trim(),
    numeroSerie: numSerieTrim,
    marca: marca.trim(),
    modelo: modelo.trim(),
    fornecedorId: fornecedor.id,
    fornecedorNome: fornecedor.nomeFantasia,
    dataAquisicao: dataAquisicao,
    observacoes: observacoes ? observacoes.trim() : undefined,
    status: 'Disponível', // Status inicial obrigatório
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.equipamentos.push(novoEquipamento);
  saveDB(db);

  res.status(201).json({
    message: 'Equipamento cadastrado com sucesso.',
    equipamento: novoEquipamento,
  });
});

// Editar equipamento (Apenas Administrador)
equipamentosRouter.put('/:id', requireRole(['ADMINISTRADOR']), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const {
    nome,
    tipo,
    numeroSerie,
    marca,
    modelo,
    fornecedorId,
    dataAquisicao,
    observacoes,
    status,
  } = req.body;

  const db = getDB();
  const eq = db.equipamentos.find((e) => e.id === id);

  if (!eq) {
    res.status(404).json({ error: 'Equipamento não encontrado.' });
    return;
  }

  const errors: Record<string, string> = {};
  if (!nome || !nome.trim()) errors.nome = 'Nome do equipamento é obrigatório.';
  if (!tipo || !tipo.trim()) errors.tipo = 'Tipo de equipamento é obrigatório.';
  if (!numeroSerie || !numeroSerie.trim()) errors.numeroSerie = 'Número de série é obrigatório.';
  if (!marca || !marca.trim()) errors.marca = 'Marca é obrigatória.';
  if (!modelo || !modelo.trim()) errors.modelo = 'Modelo é obrigatório.';
  if (!fornecedorId || !fornecedorId.trim()) errors.fornecedorId = 'Fornecedor é obrigatório.';

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: 'Preencha todos os campos obrigatórios.', fields: errors });
    return;
  }

  const fornecedor = db.fornecedores.find((f) => f.id === fornecedorId);
  if (!fornecedor) {
    res.status(400).json({ error: 'Fornecedor selecionado não existe.', fields: { fornecedorId: 'Fornecedor inválido.' } });
    return;
  }

  const numSerieTrim = numeroSerie.trim().toUpperCase();
  const duplicateSerial = db.equipamentos.some(
    (e) => e.id !== id && e.numeroSerie.trim().toUpperCase() === numSerieTrim
  );

  if (duplicateSerial) {
    res.status(400).json({
      error: 'Número de série já registrado.',
      fields: { numeroSerie: 'Número de série já registrado.' },
    });
    return;
  }

  eq.nome = nome.trim();
  eq.tipo = tipo.trim();
  eq.numeroSerie = numSerieTrim;
  eq.marca = marca.trim();
  eq.modelo = modelo.trim();
  eq.fornecedorId = fornecedor.id;
  eq.fornecedorNome = fornecedor.nomeFantasia;
  if (dataAquisicao) eq.dataAquisicao = dataAquisicao;
  eq.observacoes = observacoes !== undefined ? observacoes.trim() : eq.observacoes;
  if (status) eq.status = status as EquipmentStatus;
  eq.updatedAt = new Date().toISOString();

  saveDB(db);

  res.json({
    message: 'Equipamento atualizado com sucesso.',
    equipamento: eq,
  });
});

// Inativar equipamento (Apenas Administrador)
equipamentosRouter.delete('/:id', requireRole(['ADMINISTRADOR']), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDB();
  const eq = db.equipamentos.find((e) => e.id === id);

  if (!eq) {
    res.status(404).json({ error: 'Equipamento não encontrado.' });
    return;
  }

  if (eq.status === 'Emprestado') {
    res.status(400).json({
      error: 'Não é possível inativar um equipamento que está atualmente emprestado.',
    });
    return;
  }

  eq.status = 'Inativo';
  eq.updatedAt = new Date().toISOString();
  saveDB(db);

  res.json({ message: 'Equipamento inativado com sucesso.' });
});

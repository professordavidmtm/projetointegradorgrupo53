import { Router, type Response } from 'express';
import { getDB } from '../db.ts';
import { authenticate, type AuthenticatedRequest } from '../middleware.ts';

export const historicoRouter = Router();

historicoRouter.use(authenticate);

historicoRouter.get('/', (req: AuthenticatedRequest, res: Response): void => {
  const { dataInicio, dataFim, usuarioId, buscaEquipamento, status, buscaGeral } = req.query;
  const db = getDB();
  const currentUser = req.user!;

  let lista = [...db.emprestimos];

  // Restrição de perfil: Aluno e Docente só veem o seu próprio histórico
  if (currentUser.perfil === 'ALUNO' || currentUser.perfil === 'DOCENTE') {
    lista = lista.filter((e) => e.beneficiarioId === currentUser.id);
  } else if (usuarioId && typeof usuarioId === 'string') {
    lista = lista.filter((e) => e.beneficiarioId === usuarioId);
  }

  // Filtro por período de data do empréstimo
  if (dataInicio && typeof dataInicio === 'string') {
    lista = lista.filter((e) => e.dataEmprestimo.split('T')[0] >= dataInicio);
  }

  if (dataFim && typeof dataFim === 'string') {
    lista = lista.filter((e) => e.dataEmprestimo.split('T')[0] <= dataFim);
  }

  // Filtro por status
  if (status && typeof status === 'string') {
    lista = lista.filter((e) => e.status === status);
  }

  // Filtro por equipamento
  if (buscaEquipamento && typeof buscaEquipamento === 'string') {
    const qEq = buscaEquipamento.toLowerCase();
    lista = lista.filter((e) =>
      e.itens.some(
        (item) =>
          item.equipamentoNome.toLowerCase().includes(qEq) ||
          item.equipamentoNumeroSerie.toLowerCase().includes(qEq) ||
          item.equipamentoTipo.toLowerCase().includes(qEq) ||
          item.equipamentoMarca.toLowerCase().includes(qEq)
      )
    );
  }

  // Filtro por busca geral
  if (buscaGeral && typeof buscaGeral === 'string') {
    const q = buscaGeral.toLowerCase();
    lista = lista.filter(
      (e) =>
        e.codigo.toLowerCase().includes(q) ||
        e.beneficiarioNome.toLowerCase().includes(q) ||
        e.beneficiarioCpf.includes(q) ||
        (e.observacoes && e.observacoes.toLowerCase().includes(q)) ||
        (e.registroDevolucao?.observacoes && e.registroDevolucao.observacoes.toLowerCase().includes(q)) ||
        e.itens.some((i) => i.equipamentoNome.toLowerCase().includes(q) || i.equipamentoNumeroSerie.toLowerCase().includes(q))
    );
  }

  // Ordenação decrescente por data de empréstimo
  lista.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(lista);
});

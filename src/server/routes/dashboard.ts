import { Router, type Response } from 'express';
import { getDB } from '../db.ts';
import { authenticate, type AuthenticatedRequest } from '../middleware.ts';
import type { AdminDashboardData, UserDashboardData } from '../../types/index.ts';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get('/', (req: AuthenticatedRequest, res: Response): void => {
  const db = getDB();
  const currentUser = req.user!;

  if (currentUser.perfil === 'ADMINISTRADOR') {
    const totalEquipamentos = db.equipamentos.length;
    const equipamentosDisponiveis = db.equipamentos.filter((e) => e.status === 'Disponível').length;
    const equipamentosEmprestados = db.equipamentos.filter((e) => e.status === 'Emprestado').length;
    const equipamentosManutencao = db.equipamentos.filter((e) => e.status === 'Em manutenção').length;
    const equipamentosInativos = db.equipamentos.filter((e) => e.status === 'Inativo').length;

    const totalUsuarios = db.pessoas.length;
    const totalAlunos = db.pessoas.filter((p) => p.perfil === 'ALUNO').length;
    const totalDocentes = db.pessoas.filter((p) => p.perfil === 'DOCENTE').length;
    const totalFornecedores = db.fornecedores.length;

    const emprestimosEmAndamento = db.emprestimos.filter((e) => e.status === 'Em Andamento').length;
    const emprestimosAtrasados = db.emprestimos.filter((e) => e.status === 'Atrasado').length;
    const emprestimosConcluidos = db.emprestimos.filter(
      (e) => e.status === 'Concluído' || e.status === 'Concluído com Pendência'
    ).length;

    // Equipamentos por tipo
    const tipoMap: Record<string, { total: number; disponiveis: number }> = {};
    for (const eq of db.equipamentos) {
      if (!tipoMap[eq.tipo]) {
        tipoMap[eq.tipo] = { total: 0, disponiveis: 0 };
      }
      tipoMap[eq.tipo].total++;
      if (eq.status === 'Disponível') {
        tipoMap[eq.tipo].disponiveis++;
      }
    }
    const equipamentosPorTipo = Object.entries(tipoMap).map(([tipo, data]) => ({
      tipo,
      total: data.total,
      disponiveis: data.disponiveis,
    }));

    // Status distribuição para gráficos
    const statusDistribucao = [
      { name: 'Disponível', value: equipamentosDisponiveis, color: '#10b981' },
      { name: 'Emprestado', value: equipamentosEmprestados, color: '#3b82f6' },
      { name: 'Em manutenção', value: equipamentosManutencao, color: '#f59e0b' },
      { name: 'Inativo', value: equipamentosInativos, color: '#6b7280' },
    ];

    // Empréstimos mais recentes
    const sortedLoans = [...db.emprestimos].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const emprestimosRecentes = sortedLoans.slice(0, 6);

    // Empréstimos por mês (simulado/calculado)
    const emprestimosPorMes = [
      { mes: 'Mai', emprestimos: 12, devolucoes: 11 },
      { mes: 'Jun', emprestimos: 18, devolucoes: 17 },
      { mes: 'Jul', emprestimos: 9, devolucoes: 9 },
      { mes: 'Ago', emprestimos: Math.max(db.emprestimos.length, 14), devolucoes: Math.max(emprestimosConcluidos, 10) },
    ];

    const adminData: AdminDashboardData = {
      totalEquipamentos,
      equipamentosDisponiveis,
      equipamentosEmprestados,
      equipamentosManutencao,
      equipamentosInativos,
      totalUsuarios,
      totalAlunos,
      totalDocentes,
      totalFornecedores,
      emprestimosEmAndamento,
      emprestimosAtrasados,
      emprestimosConcluidos,
      equipamentosPorTipo,
      statusDistribucao,
      emprestimosRecentes,
      emprestimosPorMes,
    };

    res.json({ perfil: 'ADMINISTRADOR', data: adminData });
    return;
  }

  // Dashboard para Aluno e Docente
  const userLoans = db.emprestimos.filter((e) => e.beneficiarioId === currentUser.id);
  const meusEmprestimosAtivos = userLoans.filter(
    (e) => e.status === 'Em Andamento' || e.status === 'Atrasado'
  );

  const totalItensEmprestados = meusEmprestimosAtivos.reduce(
    (acc, cur) => acc + cur.itens.length,
    0
  );

  const proximasDevolucoes = [...meusEmprestimosAtivos].sort(
    (a, b) => new Date(a.dataPrevistaDevolucao).getTime() - new Date(b.dataPrevistaDevolucao).getTime()
  );

  const emprestimosAtrasados = userLoans.filter((e) => e.status === 'Atrasado');

  const notificacoesRecentes = db.notificacoes
    .filter((n) => n.destinatarioId === currentUser.id)
    .slice(0, 5);

  const userData: UserDashboardData = {
    meusEmprestimosAtivos,
    totalItensEmprestados,
    proximasDevolucoes,
    emprestimosAtrasados,
    notificacoesRecentes,
    bloqueadoPorAtraso: currentUser.bloqueadoPorAtraso || emprestimosAtrasados.length > 0,
  };

  res.json({ perfil: currentUser.perfil, data: userData });
});

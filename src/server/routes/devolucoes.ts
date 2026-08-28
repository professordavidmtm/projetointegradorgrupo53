import { Router, type Response } from 'express';
import { getDB, saveDB, addNotification, checkAndApplyDelays } from '../db.ts';
import { authenticate, requireRole, type AuthenticatedRequest } from '../middleware.ts';
import type { ReturnCondition } from '../../types/index.ts';

export const devolucoesRouter = Router();

// Somente Administrador e Docente podem registrar devoluções (Regra 8)
devolucoesRouter.use(authenticate);
devolucoesRouter.use(requireRole(['ADMINISTRADOR', 'DOCENTE']));

// Listar empréstimos pendentes de devolução (Em Andamento ou Atrasado)
devolucoesRouter.get('/pendentes', (req: AuthenticatedRequest, res: Response): void => {
  const { busca } = req.query;
  const db = getDB();

  let lista = db.emprestimos.filter(
    (e) => e.status === 'Em Andamento' || e.status === 'Atrasado'
  );

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
            item.equipamentoNumeroSerie.toLowerCase().includes(q) ||
            item.equipamentoTipo.toLowerCase().includes(q)
        )
    );
  }

  res.json(lista);
});

// Registrar devolução de um empréstimo
devolucoesRouter.post('/:id', (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const {
    estado, // 'Bom estado' | 'Com avaria'
    descricaoAvaria,
    observacoes,
    itensEstado, // Opcional: estado individual de cada item [{ itemId, estado, descricaoAvaria }]
  } = req.body;

  const db = getDB();
  const emp = db.emprestimos.find((e) => e.id === id);

  if (!emp) {
    res.status(404).json({ error: 'Empréstimo não encontrado.' });
    return;
  }

  if (emp.status === 'Concluído' || emp.status === 'Concluído com Pendência') {
    res.status(400).json({ error: 'Este empréstimo já foi finalizado anteriormente.' });
    return;
  }

  const currentUser = req.user!;
  const returnCondition: ReturnCondition = estado === 'Com avaria' ? 'Com avaria' : 'Bom estado';

  let hasAnyDamage = returnCondition === 'Com avaria';

  // Atualizar itens do empréstimo e equipamentos no banco
  for (const item of emp.itens) {
    let itemCond: ReturnCondition = returnCondition;
    let itemAvaria = descricaoAvaria;

    if (itensEstado && Array.isArray(itensEstado)) {
      const customItem = itensEstado.find((ie) => ie.itemId === item.id || ie.equipamentoId === item.equipamentoId);
      if (customItem) {
        itemCond = customItem.estado;
        itemAvaria = customItem.descricaoAvaria;
      }
    }

    item.statusDevolucao = itemCond;
    item.descricaoAvaria = itemCond === 'Com avaria' ? itemAvaria : undefined;

    if (itemCond === 'Com avaria') {
      hasAnyDamage = true;
    }

    // Atualizar equipamento
    const eq = db.equipamentos.find((e) => e.id === item.equipamentoId);
    if (eq) {
      if (itemCond === 'Com avaria') {
        eq.status = 'Em manutenção';
        eq.observacoes = itemAvaria
          ? `[Devolução com avaria em ${new Date().toLocaleDateString('pt-BR')}]: ${itemAvaria}`
          : eq.observacoes;
      } else {
        eq.status = 'Disponível';
      }
      eq.updatedAt = new Date().toISOString();
    }
  }

  // Atualiza Empréstimo
  const finalLoanStatus = hasAnyDamage ? 'Concluído com Pendência' : 'Concluído';
  emp.status = finalLoanStatus;
  emp.dataEfetivaDevolucao = new Date().toISOString();
  emp.registroDevolucao = {
    dataDevolucao: new Date().toISOString(),
    responsavelId: currentUser.id,
    responsavelNome: currentUser.nome,
    estado: hasAnyDamage ? 'Com avaria' : 'Bom estado',
    descricaoAvaria: hasAnyDamage ? descricaoAvaria : undefined,
    observacoes: observacoes ? observacoes.trim() : undefined,
  };
  emp.updatedAt = new Date().toISOString();

  // Verifica se o beneficiário ainda tem outros empréstimos atrasados
  const remainingDelayed = db.emprestimos.some(
    (e) => e.beneficiarioId === emp.beneficiarioId && e.id !== emp.id && e.status === 'Atrasado'
  );

  const beneficiario = db.pessoas.find((p) => p.id === emp.beneficiarioId);
  if (beneficiario && !remainingDelayed && beneficiario.bloqueadoPorAtraso) {
    beneficiario.bloqueadoPorAtraso = false;
    beneficiario.updatedAt = new Date().toISOString();

    addNotification(db, {
      destinatarioId: beneficiario.id,
      tipo: 'USUARIO_DESBLOQUEADO',
      titulo: 'Bloqueio Removido',
      mensagem: 'Suas pendências foram regularizadas. Você já pode solicitar novos empréstimos.',
      referenciaId: emp.id,
    });
  }

  // Notificações de devolução
  if (hasAnyDamage) {
    addNotification(db, {
      destinatarioId: emp.beneficiarioId,
      tipo: 'AVARIA_REGISTRADA',
      titulo: 'Equipamento Devolvido com Avaria',
      mensagem: `A devolução do empréstimo ${emp.codigo} foi registrada com pendência de avaria e encaminhada para manutenção.`,
      referenciaId: emp.id,
    });

    addNotification(db, {
      destinatarioId: 'ALL_ADMINS',
      tipo: 'AVARIA_REGISTRADA',
      titulo: 'Avaria Registrada na Devolução',
      mensagem: `Equipamento do empréstimo ${emp.codigo} (${emp.beneficiarioNome}) foi devolvido com avaria e movido para manutenção: "${descricaoAvaria || 'Sem descrição'}"`,
      referenciaId: emp.id,
    });
  } else {
    addNotification(db, {
      destinatarioId: emp.beneficiarioId,
      tipo: 'DEVOLUCAO_REGISTRADA',
      titulo: 'Devolução Registrada com Sucesso',
      mensagem: `A devolução do empréstimo ${emp.codigo} foi concluída com sucesso em bom estado.`,
      referenciaId: emp.id,
    });
  }

  checkAndApplyDelays(db);
  saveDB(db);

  res.json({
    message: hasAnyDamage
      ? 'Devolução registrada. Equipamento encaminhado para manutenção.'
      : 'Devolução registrada com sucesso.',
    emprestimo: emp,
  });
});

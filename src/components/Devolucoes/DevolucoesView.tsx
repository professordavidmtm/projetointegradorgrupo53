import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Search,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  Package,
  Wrench,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { Input } from '../UI/Input.tsx';
import { Button } from '../UI/Button.tsx';
import { Badge } from '../UI/Badge.tsx';
import { Modal } from '../UI/Modal.tsx';
import { ComprovanteModal } from '../ComprovanteModal.tsx';
import type { Emprestimo, ItemDevolucaoPayload } from '../../types/index.ts';

export const DevolucoesView: React.FC = () => {
  const { user, isAdmin, isDocente } = useAuth();
  const { showToast } = useNotifications();

  const [emprestimosPendentes, setEmprestimosPendentes] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  // Devolução em andamento (Modal de Devolução)
  const [selectedEmprestimo, setSelectedEmprestimo] = useState<Emprestimo | null>(null);
  const [dataEfetivaDevolucao, setDataEfetivaDevolucao] = useState('');
  const [observacoesDevolucao, setObservacoesDevolucao] = useState('');
  const [itensStatus, setItensStatus] = useState<
    Record<string, { temAvaria: boolean; descricaoAvaria: string }>
  >({});
  const [submitting, setSubmitting] = useState(false);

  // Comprovante visualizado
  const [comprovanteEmprestimo, setComprovanteEmprestimo] = useState<Emprestimo | null>(null);

  const fetchPendentes = useCallback(async () => {
    try {
      setLoading(true);
      // Buscar todos empréstimos e filtrar os pendentes (Em Andamento ou Atrasado)
      const data = await api.emprestimos.list();
      const pendentes = data.filter(
        (e) => e.status === 'Em Andamento' || e.status === 'Atrasado'
      );
      setEmprestimosPendentes(pendentes);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar devoluções pendentes.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPendentes();
  }, [fetchPendentes]);

  const handleOpenDevolverModal = (emp: Emprestimo) => {
    setSelectedEmprestimo(emp);
    setDataEfetivaDevolucao(new Date().toISOString().split('T')[0]);
    setObservacoesDevolucao('');

    const initialStatuses: Record<string, { temAvaria: boolean; descricaoAvaria: string }> = {};
    emp.itens.forEach((item) => {
      initialStatuses[item.id] = { temAvaria: false, descricaoAvaria: '' };
    });
    setItensStatus(initialStatuses);
  };

  const handleItemAvariaToggle = (itemId: string, temAvaria: boolean) => {
    setItensStatus((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        temAvaria,
        descricaoAvaria: temAvaria ? prev[itemId]?.descricaoAvaria || '' : '',
      },
    }));
  };

  const handleItemDescricaoChange = (itemId: string, desc: string) => {
    setItensStatus((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        descricaoAvaria: desc,
      },
    }));
  };

  const handleSubmitDevolucao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmprestimo) return;

    // Validar descrições de avaria
    for (const item of selectedEmprestimo.itens) {
      const status = itensStatus[item.id];
      if (status?.temAvaria && !status.descricaoAvaria.trim()) {
        showToast(`Informe a descrição da avaria do item ${item.equipamentoNome}.`, 'warning');
        return;
      }
    }

    try {
      setSubmitting(true);
      const itensPayload: ItemDevolucaoPayload[] = selectedEmprestimo.itens.map((item) => ({
        itemId: item.id,
        temAvaria: !!itensStatus[item.id]?.temAvaria,
        descricaoAvaria: itensStatus[item.id]?.descricaoAvaria?.trim() || undefined,
      }));

      const res = await api.devolucoes.create({
        emprestimoId: selectedEmprestimo.id,
        dataEfetivaDevolucao,
        observacoesDevolucao,
        itens: itensPayload,
      });

      showToast(res.message || 'Devolução registrada com sucesso!', 'success');
      setComprovanteEmprestimo(res.emprestimo);
      setSelectedEmprestimo(null);
      fetchPendentes();
    } catch (err: any) {
      showToast(err.message || 'Erro ao registrar devolução.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPendentes = emprestimosPendentes.filter((e) => {
    const term = busca.toLowerCase();
    return (
      e.codigo.toLowerCase().includes(term) ||
      e.beneficiarioNome.toLowerCase().includes(term) ||
      e.beneficiarioCpf.toLowerCase().includes(term) ||
      e.itens.some((i) => i.equipamentoNome.toLowerCase().includes(term) || i.equipamentoNumeroSerie.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Registro de Devoluções & Vistoria Técnica
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Recebimento de equipamentos, conferência de integridade física e registro de avarias
            </p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <Input
          placeholder="Buscar por código do empréstimo, nome do beneficiário, CPF ou nº de série..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Lista de Empréstimos Pendentes de Devolução */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Empréstimos Aguardando Devolução ({filteredPendentes.length})
          </h3>
          <span className="text-xs text-slate-500">
            Permissão: {isAdmin ? 'Administrador' : 'Docente'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Carregando empréstimos em aberto...
            </div>
          ) : filteredPendentes.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhum empréstimo pendente de devolução no momento.
            </div>
          ) : (
            filteredPendentes.map((emp) => {
              const isOverdue = emp.status === 'Atrasado';

              return (
                <div
                  key={emp.id}
                  className={`p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-colors ${
                    isOverdue ? 'bg-rose-50/40' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                        {emp.codigo}
                      </span>
                      <Badge status={emp.status} />
                      <span className="text-xs font-bold text-slate-900">
                        {emp.beneficiarioNome}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({emp.beneficiarioPerfil} • {emp.beneficiarioCpf})
                      </span>
                    </div>

                    {/* Itens */}
                    <div className="space-y-1">
                      <p className="text-xs text-slate-700">
                        <strong className="text-slate-900">Itens ({emp.itens.length}):</strong>{' '}
                        {emp.itens.map((i) => `${i.equipamentoNome} [${i.equipamentoNumeroSerie}]`).join(' • ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
                      <span>Retirada: {new Date(emp.dataEmprestimo).toLocaleDateString('pt-BR')}</span>
                      <span>
                        Previsão Devolução:{' '}
                        <strong className={isOverdue ? 'text-rose-700 font-bold' : 'text-slate-700'}>
                          {new Date(emp.dataPrevistaDevolucao + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </strong>
                      </span>
                      {emp.observacoes && <span>Obs: {emp.observacoes}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FileText className="w-4 h-4" />}
                      onClick={() => setComprovanteEmprestimo(emp)}
                    >
                      Ver Comprovante
                    </Button>
                    <Button
                      variant={isOverdue ? 'danger' : 'primary'}
                      size="sm"
                      icon={<RotateCcw className="w-4 h-4" />}
                      onClick={() => handleOpenDevolverModal(emp)}
                    >
                      Registrar Devolução
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de Registro de Devolução & Vistoria */}
      <Modal
        isOpen={!!selectedEmprestimo}
        onClose={() => setSelectedEmprestimo(null)}
        title={`Registrar Devolução • ${selectedEmprestimo?.codigo}`}
        subtitle={`Beneficiário: ${selectedEmprestimo?.beneficiarioNome} (${selectedEmprestimo?.beneficiarioPerfil})`}
        maxWidth="xl"
      >
        {selectedEmprestimo && (
          <form onSubmit={handleSubmitDevolucao} className="space-y-5">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1">
              <p><strong>Data de Retirada:</strong> {selectedEmprestimo.dataEmprestimo}</p>
              <p>
                <strong>Data Prevista:</strong>{' '}
                <span className={selectedEmprestimo.status === 'Atrasado' ? 'text-rose-700 font-bold' : ''}>
                  {selectedEmprestimo.dataPrevistaDevolucao}
                </span>
              </p>
            </div>

            <Input
              label="Data Efetiva da Devolução"
              type="date"
              value={dataEfetivaDevolucao}
              onChange={(e) => setDataEfetivaDevolucao(e.target.value)}
              required
            />

            {/* Vistoria de Itens */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Vistoria de Itens do Empréstimo ({selectedEmprestimo.itens.length})
              </label>

              <div className="space-y-3">
                {selectedEmprestimo.itens.map((item) => {
                  const hasDamage = itensStatus[item.id]?.temAvaria;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-colors space-y-3 ${
                        hasDamage
                          ? 'bg-amber-50/70 border-amber-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.equipamentoNome}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Nº Série: {item.equipamentoNumeroSerie} • {item.equipamentoMarca} {item.equipamentoModelo}
                          </p>
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleItemAvariaToggle(item.id, false)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              !hasDamage
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Normal (Sem Avaria)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItemAvariaToggle(item.id, true)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              hasDamage
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Com Avaria / Dano
                          </button>
                        </div>
                      </div>

                      {/* Campo de Descrição da Avaria */}
                      {hasDamage && (
                        <div className="space-y-1.5 pt-2 border-t border-amber-200 animate-in fade-in duration-200">
                          <label className="block text-[11px] font-bold text-amber-900 uppercase">
                            Descrição Detalhada do Dano / Avaria *
                          </label>
                          <textarea
                            className="w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                            rows={2}
                            placeholder="Ex: Tela trincada, lente riscada, cabo rompido..."
                            value={itensStatus[item.id]?.descricaoAvaria || ''}
                            onChange={(e) => handleItemDescricaoChange(item.id, e.target.value)}
                            required
                          />
                          <p className="text-[10px] text-amber-700">
                            O status deste equipamento será alterado automaticamente para <strong>"Em manutenção"</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Observações Gerais da Devolução */}
            <div className="space-y-1 text-left">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Observações Gerais da Devolução
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                rows={2}
                placeholder="Observações complementares..."
                value={observacoesDevolucao}
                onChange={(e) => setObservacoesDevolucao(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedEmprestimo(null)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={submitting}
                className="bg-blue-600 hover:bg-blue-700 font-bold"
              >
                Confirmar e Finalizar Devolução
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Comprovante */}
      <ComprovanteModal
        isOpen={!!comprovanteEmprestimo}
        onClose={() => setComprovanteEmprestimo(null)}
        emprestimo={comprovanteEmprestimo}
      />
    </div>
  );
};

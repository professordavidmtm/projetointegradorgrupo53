import React, { useState, useEffect } from 'react';
import {
  Share2,
  PackageCheck,
  Search,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { Input } from '../UI/Input.tsx';
import { Select } from '../UI/Select.tsx';
import { Button } from '../UI/Button.tsx';
import { Badge } from '../UI/Badge.tsx';
import { ComprovanteModal } from '../ComprovanteModal.tsx';
import type { AuthUser, Equipamento, Emprestimo } from '../../types/index.ts';

interface NovoEmprestimoViewProps {
  onSuccessNavigate?: () => void;
}

export const NovoEmprestimoView: React.FC<NovoEmprestimoViewProps> = ({
  onSuccessNavigate,
}) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  // Dados carregados
  const [pessoas, setPessoas] = useState<AuthUser[]>([]);
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState<Equipamento[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State
  const [beneficiarioId, setBeneficiarioId] = useState('');
  const [selectedEquipamentoIds, setSelectedEquipamentoIds] = useState<string[]>([]);
  const [dataEmprestimo, setDataEmprestimo] = useState('');
  const [dataPrevistaDevolucao, setDataPrevistaDevolucao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Filtros de busca de equipamentos
  const [searchEquip, setSearchEquip] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');

  // Submit & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  // Comprovante gerado
  const [createdEmprestimo, setCreatedEmprestimo] = useState<Emprestimo | null>(null);

  // Inicializar datas padrão (Hoje e +3 dias)
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setDataEmprestimo(todayStr);

    const returnDate = new Date();
    returnDate.setDate(today.getDate() + 3);
    setDataPrevistaDevolucao(returnDate.toISOString().split('T')[0]);

    if (!isAdmin && user) {
      setBeneficiarioId(user.id);
    }
  }, [user, isAdmin]);

  // Carregar pessoas e equipamentos disponíveis
  const loadData = async () => {
    try {
      setLoadingInitial(true);
      const [pessoasData, eqData] = await Promise.all([
        isAdmin ? api.pessoas.list({ status: 'Ativo' }) : Promise.resolve([]),
        api.equipamentos.list({ status: 'Disponível' }),
      ]);
      setPessoas(pessoasData);
      setEquipamentosDisponiveis(eqData);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar dados para empréstimo.', 'error');
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const selectedBeneficiario = isAdmin
    ? pessoas.find((p) => p.id === beneficiarioId)
    : user;

  const isBeneficiarioBlocked = !!selectedBeneficiario?.bloqueadoPorAtraso;

  const handleToggleEquipamento = (id: string) => {
    if (selectedEquipamentoIds.includes(id)) {
      setSelectedEquipamentoIds(selectedEquipamentoIds.filter((item) => item !== id));
    } else {
      setSelectedEquipamentoIds([...selectedEquipamentoIds, id]);
    }
  };

  const handleRemoveSelected = (id: string) => {
    setSelectedEquipamentoIds(selectedEquipamentoIds.filter((item) => item !== id));
  };

  const filteredEquipamentos = equipamentosDisponiveis.filter((eq) => {
    const matchesSearch =
      eq.nome.toLowerCase().includes(searchEquip.toLowerCase()) ||
      eq.numeroSerie.toLowerCase().includes(searchEquip.toLowerCase()) ||
      eq.marca.toLowerCase().includes(searchEquip.toLowerCase());
    const matchesTipo = !tipoFilter || eq.tipo === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  const selectedEquipamentosObjects = equipamentosDisponiveis.filter((eq) =>
    selectedEquipamentoIds.includes(eq.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setGeneralError('');

    const errors: Record<string, string> = {};
    if (!beneficiarioId) errors.beneficiarioId = 'Selecione o beneficiário do empréstimo.';
    if (selectedEquipamentoIds.length === 0) {
      errors.equipamentos = 'Selecione ao menos 1 equipamento disponível.';
    }
    if (!dataEmprestimo) errors.dataEmprestimo = 'Informe a data de empréstimo.';
    if (!dataPrevistaDevolucao) errors.dataPrevistaDevolucao = 'Informe a data prevista de devolução.';
    if (dataPrevistaDevolucao < dataEmprestimo) {
      errors.dataPrevistaDevolucao = 'A data prevista de devolução não pode ser anterior à data de empréstimo.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setGeneralError('Corrija os campos destacados antes de prosseguir.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.emprestimos.create({
        beneficiarioId,
        equipamentosIds: selectedEquipamentoIds,
        dataEmprestimo,
        dataPrevistaDevolucao,
        observacoes,
      });

      showToast(`Empréstimo ${res.emprestimo.codigo} registrado com sucesso!`, 'success');
      setCreatedEmprestimo(res.emprestimo);
      setSelectedEquipamentoIds([]);
      setObservacoes('');
      loadData(); // Atualiza lista de equipamentos disponíveis
    } catch (err: any) {
      setGeneralError(err.message || 'Erro ao registrar empréstimo.');
      showToast(err.message || 'Erro ao registrar empréstimo.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isAdmin ? 'Realizar Novo Empréstimo Institucional' : 'Solicitar Empréstimo de Equipamentos'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecione um ou múltiplos equipamentos disponíveis no acervo e defina a data de devolução
            </p>
          </div>
        </div>
      </div>

      {/* Alerta de Bloqueio do Beneficiário */}
      {isBeneficiarioBlocked && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 flex items-start gap-3.5 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Usuário Bloqueado para Novos Empréstimos
            </h4>
            <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
              O solicitante selecionado (<strong>{selectedBeneficiario?.nome}</strong>) possui empréstimos
              com atraso pendente de regularização. Novas retiradas estão suspensas até a devolução dos itens pendentes.
            </p>
          </div>
        </div>
      )}

      {generalError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1 & 2: Seleção de Equipamentos */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-blue-600" />
                    <span>Equipamentos Disponíveis para Retirada</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selecione um ou mais equipamentos da lista ({equipamentosDisponiveis.length} disponíveis)
                  </p>
                </div>

                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {selectedEquipamentoIds.length} selecionado(s)
                </span>
              </div>

              {/* Filtros de busca de equipamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Filtrar por nome, série ou modelo..."
                  value={searchEquip}
                  onChange={(e) => setSearchEquip(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
                <Select
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                  options={[
                    { value: '', label: 'Todos os Tipos' },
                    { value: 'Notebook', label: 'Notebooks' },
                    { value: 'Projetor', label: 'Projetores' },
                    { value: 'Câmera', label: 'Câmeras Digitais' },
                    { value: 'Tablet', label: 'Tablets' },
                    { value: 'Acessório', label: 'Acessórios' },
                    { value: 'Áudio', label: 'Áudio' },
                  ]}
                />
              </div>

              {formErrors.equipamentos && (
                <p className="text-xs text-rose-600 font-semibold">{formErrors.equipamentos}</p>
              )}

              {/* Lista de Seleção de Equipamentos */}
              <div className="max-h-72 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                {loadingInitial ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Carregando catálogo de equipamentos...
                  </div>
                ) : filteredEquipamentos.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Nenhum equipamento disponível encontrado com os filtros aplicados.
                  </div>
                ) : (
                  filteredEquipamentos.map((eq) => {
                    const isSelected = selectedEquipamentoIds.includes(eq.id);
                    return (
                      <div
                        key={eq.id}
                        onClick={() => handleToggleEquipamento(eq.id)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-400 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by div onClick
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{eq.nome}</p>
                            <p className="text-[11px] text-slate-500">
                              {eq.tipo} • {eq.marca} {eq.modelo}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {eq.numeroSerie}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Coluna 3: Dados do Empréstimo & Beneficiário */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Dados da Solicitação
              </h3>

              {/* Seleção do Beneficiário */}
              {isAdmin ? (
                <div>
                  <Select
                    label="Beneficiário (Aluno / Docente)"
                    value={beneficiarioId}
                    onChange={(e) => setBeneficiarioId(e.target.value)}
                    error={formErrors.beneficiarioId}
                    placeholder="Selecione o usuário..."
                    options={pessoas.map((p) => ({
                      value: p.id,
                      label: `${p.nome} (${p.perfil} - ${p.cpf})${p.bloqueadoPorAtraso ? ' [BLOQUEADO]' : ''}`,
                    }))}
                    required
                  />
                  {selectedBeneficiario && (
                    <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                      <p><strong>CPF:</strong> {selectedBeneficiario.cpf}</p>
                      <p><strong>E-mail:</strong> {selectedBeneficiario.email}</p>
                      <p><strong>Perfil:</strong> {selectedBeneficiario.perfil}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Solicitante:</span>
                  <p className="font-bold text-slate-900">{user?.nome}</p>
                  <p className="text-slate-600">{user?.email} • {user?.cpf}</p>
                  <Badge status={user?.perfil} size="sm" />
                </div>
              )}

              {/* Datas */}
              <div className="space-y-3 pt-2">
                <Input
                  label="Data de Retirada"
                  type="date"
                  value={dataEmprestimo}
                  onChange={(e) => setDataEmprestimo(e.target.value)}
                  error={formErrors.dataEmprestimo}
                  required
                />

                <Input
                  label="Data Prevista para Devolução"
                  type="date"
                  value={dataPrevistaDevolucao}
                  min={dataEmprestimo}
                  onChange={(e) => setDataPrevistaDevolucao(e.target.value)}
                  error={formErrors.dataPrevistaDevolucao}
                  helperText="A devolução deve ocorrer até a data limite para evitar bloqueio automático."
                  required
                />
              </div>

              {/* Observações */}
              <div className="space-y-1 text-left">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Finalidade / Observações
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  rows={2}
                  placeholder="Ex: Utilização em aula prática de laboratório ou pesquisa de campo..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>

              {/* Resumo de Itens Selecionados */}
              {selectedEquipamentosObjects.length > 0 && (
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <p className="text-xs font-bold text-slate-800">
                    Itens a Retirar ({selectedEquipamentosObjects.length}):
                  </p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedEquipamentosObjects.map((eq) => (
                      <div
                        key={eq.id}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200 text-xs"
                      >
                        <span className="truncate max-w-[170px] font-medium text-slate-800">{eq.nome}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSelected(eq.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão de Finalizar */}
              <div className="pt-3 border-t border-slate-100">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  disabled={isBeneficiarioBlocked || selectedEquipamentoIds.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
                >
                  {isAdmin ? 'Confirmar Empréstimo & Emitir' : 'Confirmar Solicitação'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de Comprovante após Empréstimo */}
      <ComprovanteModal
        isOpen={!!createdEmprestimo}
        onClose={() => setCreatedEmprestimo(null)}
        emprestimo={createdEmprestimo}
      />
    </div>
  );
};

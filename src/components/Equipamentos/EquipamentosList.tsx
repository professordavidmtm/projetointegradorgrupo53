import React, { useState, useEffect, useCallback } from 'react';
import {
  Laptop,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Wrench,
  Ban,
  Tag,
  Building2,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { Button } from '../UI/Button.tsx';
import { Input } from '../UI/Input.tsx';
import { Select } from '../UI/Select.tsx';
import { Badge } from '../UI/Badge.tsx';
import { Pagination } from '../UI/Pagination.tsx';
import { ConfirmDialog } from '../UI/ConfirmDialog.tsx';
import { EquipamentoModal } from './EquipamentoModal.tsx';
import type { Equipamento, EquipmentStatus } from '../../types/index.ts';

export const EquipamentosList: React.FC = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipamento, setEditingEquipamento] = useState<Equipamento | null>(null);

  const [inactivatingEquipamento, setInactivatingEquipamento] = useState<Equipamento | null>(null);
  const [inactivateLoading, setInactivateLoading] = useState(false);

  const fetchEquipamentos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.equipamentos.list({
        busca: busca || undefined,
        tipo: tipoFilter || undefined,
        status: (statusFilter as EquipmentStatus) || undefined,
      });
      setEquipamentos(data);
      setCurrentPage(1);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar equipamentos.', 'error');
    } finally {
      setLoading(false);
    }
  }, [busca, tipoFilter, statusFilter, showToast]);

  useEffect(() => {
    fetchEquipamentos();
  }, [fetchEquipamentos]);

  const handleOpenCreate = () => {
    setEditingEquipamento(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (eq: Equipamento) => {
    setEditingEquipamento(eq);
    setIsModalOpen(true);
  };

  const handleConfirmInactivate = async () => {
    if (!inactivatingEquipamento) return;
    try {
      setInactivateLoading(true);
      await api.equipamentos.delete(inactivatingEquipamento.id);
      showToast('Equipamento inativado com sucesso.', 'success');
      setInactivatingEquipamento(null);
      fetchEquipamentos();
    } catch (err: any) {
      showToast(err.message || 'Erro ao inativar equipamento.', 'error');
    } finally {
      setInactivateLoading(false);
    }
  };

  const totalItems = equipamentos.length;
  const paginated = equipamentos.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Laptop className="w-5 h-5 text-blue-600" />
            <span>{isAdmin ? 'Catálogo & Gestão de Equipamentos' : 'Equipamentos Institucionais'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulta de patrimônio, números de série e disponibilidade ({totalItems} itens)
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            Cadastrar Equipamento
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Input
            placeholder="Buscar por nome, marca ou nº de série..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div>
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

        <div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos os Status' },
              { value: 'Disponível', label: 'Disponíveis' },
              { value: 'Emprestado', label: 'Emprestados' },
              { value: 'Em manutenção', label: 'Em manutenção' },
              { value: 'Inativo', label: 'Inativos' },
            ]}
          />
        </div>
      </div>

      {/* Tabela de Equipamentos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Equipamento & Modelo</th>
                <th className="py-3.5 px-4">Nº de Série</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Fornecedor</th>
                <th className="py-3.5 px-4">Status</th>
                {isAdmin && <th className="py-3.5 px-4 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-400">
                    Carregando equipamentos...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-400">
                    Nenhum equipamento encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginated.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{eq.nome}</p>
                      <p className="text-[10px] text-slate-500">
                        {eq.marca} • {eq.modelo}
                      </p>
                      {eq.observacoes && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5 truncate max-w-xs">
                          {eq.observacoes}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {eq.numeroSerie}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {eq.tipo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="font-medium text-slate-800">{eq.fornecedorNome || '—'}</p>
                      <p className="text-[10px] text-slate-400">
                        Aquisição: {eq.dataAquisicao ? new Date(eq.dataAquisicao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={eq.status} />
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(eq)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="Editar Equipamento"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {eq.status !== 'Inativo' && (
                          <button
                            onClick={() => setInactivatingEquipamento(eq)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Inativar Equipamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal */}
      {isAdmin && (
        <EquipamentoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchEquipamentos}
          equipamentoToEdit={editingEquipamento}
        />
      )}

      {/* Diálogo */}
      <ConfirmDialog
        isOpen={!!inactivatingEquipamento}
        onClose={() => setInactivatingEquipamento(null)}
        onConfirm={handleConfirmInactivate}
        title="Inativar Equipamento"
        message={`Deseja realmente inativar o equipamento ${inactivatingEquipamento?.nome} (${inactivatingEquipamento?.numeroSerie})? Ele ficará indisponível para novos empréstimos.`}
        confirmText="Inativar"
        variant="danger"
        loading={inactivateLoading}
      />
    </div>
  );
};

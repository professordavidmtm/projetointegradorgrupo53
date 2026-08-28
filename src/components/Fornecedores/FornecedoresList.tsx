import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { Button } from '../UI/Button.tsx';
import { Input } from '../UI/Input.tsx';
import { Select } from '../UI/Select.tsx';
import { Badge } from '../UI/Badge.tsx';
import { Pagination } from '../UI/Pagination.tsx';
import { ConfirmDialog } from '../UI/ConfirmDialog.tsx';
import { FornecedorModal } from './FornecedorModal.tsx';
import type { Fornecedor } from '../../types/index.ts';

export const FornecedoresList: React.FC = () => {
  const { showToast } = useNotifications();

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);

  const [inactivatingFornecedor, setInactivatingFornecedor] = useState<Fornecedor | null>(null);
  const [inactivateLoading, setInactivateLoading] = useState(false);

  const fetchFornecedores = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.fornecedores.list({
        busca: busca || undefined,
        status: statusFilter || undefined,
      });
      setFornecedores(data);
      setCurrentPage(1);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar fornecedores.', 'error');
    } finally {
      setLoading(false);
    }
  }, [busca, statusFilter, showToast]);

  useEffect(() => {
    fetchFornecedores();
  }, [fetchFornecedores]);

  const handleOpenCreate = () => {
    setEditingFornecedor(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: Fornecedor) => {
    setEditingFornecedor(f);
    setIsModalOpen(true);
  };

  const handleConfirmInactivate = async () => {
    if (!inactivatingFornecedor) return;
    try {
      setInactivateLoading(true);
      await api.fornecedores.delete(inactivatingFornecedor.id);
      showToast('Fornecedor inativado com sucesso.', 'success');
      setInactivatingFornecedor(null);
      fetchFornecedores();
    } catch (err: any) {
      showToast(err.message || 'Erro ao inativar fornecedor.', 'error');
    } finally {
      setInactivateLoading(false);
    }
  };

  const totalItems = fornecedores.length;
  const paginated = fornecedores.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Módulo de Fornecedores</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Empresas homologadas para fornecimento de equipamentos institucionais ({totalItems} registros)
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Cadastrar Fornecedor
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Input
            placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos os Status' },
              { value: 'Ativo', label: 'Ativo' },
              { value: 'Inativo', label: 'Inativo' },
            ]}
          />
        </div>
      </div>

      {/* Tabela de Fornecedores */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Nome Fantasia & Razão Social</th>
                <th className="py-3.5 px-4">CNPJ</th>
                <th className="py-3.5 px-4">Contato (Tel / E-mail)</th>
                <th className="py-3.5 px-4">Endereço</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Carregando fornecedores...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhum fornecedor encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginated.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{f.nomeFantasia}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-xs">{f.razaoSocial}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{f.cnpj}</td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <p className="text-slate-800 font-medium flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{f.email}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{f.telefone}</span>
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      <span title={f.endereco}>{f.endereco}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={f.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(f)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                        title="Editar Fornecedor"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {f.status === 'Ativo' && (
                        <button
                          onClick={() => setInactivatingFornecedor(f)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Inativar Fornecedor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
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
      <FornecedorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchFornecedores}
        fornecedorToEdit={editingFornecedor}
      />

      {/* Diálogo */}
      <ConfirmDialog
        isOpen={!!inactivatingFornecedor}
        onClose={() => setInactivatingFornecedor(null)}
        onConfirm={handleConfirmInactivate}
        title="Inativar Fornecedor"
        message={`Deseja realmente inativar o fornecedor ${inactivatingFornecedor?.nomeFantasia}?`}
        confirmText="Inativar"
        variant="danger"
        loading={inactivateLoading}
      />
    </div>
  );
};

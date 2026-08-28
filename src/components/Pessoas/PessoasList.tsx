import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Shield,
  BookOpen,
  User,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { Button } from '../UI/Button.tsx';
import { Input } from '../UI/Input.tsx';
import { Select } from '../UI/Select.tsx';
import { Badge } from '../UI/Badge.tsx';
import { Pagination } from '../UI/Pagination.tsx';
import { ConfirmDialog } from '../UI/ConfirmDialog.tsx';
import { PessoaModal } from './PessoaModal.tsx';
import type { AuthUser } from '../../types/index.ts';

export const PessoasList: React.FC = () => {
  const { showToast } = useNotifications();

  const [pessoas, setPessoas] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [perfilFilter, setPerfilFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPessoa, setEditingPessoa] = useState<AuthUser | null>(null);

  // Inactivate Dialog State
  const [inactivatingPessoa, setInactivatingPessoa] = useState<AuthUser | null>(null);
  const [inactivateLoading, setInactivateLoading] = useState(false);

  const fetchPessoas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.pessoas.list({
        busca: busca || undefined,
        perfil: perfilFilter || undefined,
        status: statusFilter || undefined,
      });
      setPessoas(data);
      setCurrentPage(1);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar lista de pessoas.', 'error');
    } finally {
      setLoading(false);
    }
  }, [busca, perfilFilter, statusFilter, showToast]);

  useEffect(() => {
    fetchPessoas();
  }, [fetchPessoas]);

  const handleOpenCreate = () => {
    setEditingPessoa(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: AuthUser) => {
    setEditingPessoa(p);
    setIsModalOpen(true);
  };

  const handleConfirmInactivate = async () => {
    if (!inactivatingPessoa) return;
    try {
      setInactivateLoading(true);
      await api.pessoas.delete(inactivatingPessoa.id);
      showToast('Pessoa inativada com sucesso.', 'success');
      setInactivatingPessoa(null);
      fetchPessoas();
    } catch (err: any) {
      showToast(err.message || 'Erro ao inativar pessoa.', 'error');
    } finally {
      setInactivateLoading(false);
    }
  };

  // Paginação dos dados locais
  const totalItems = pessoas.length;
  const paginatedPessoas = pessoas.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Módulo de Pessoas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de discentes, docentes e administradores autorizados ({totalItems} registros)
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Cadastrar Pessoa
        </Button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <Input
            placeholder="Buscar por nome, CPF ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div>
          <Select
            value={perfilFilter}
            onChange={(e) => setPerfilFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos os Perfis' },
              { value: 'ALUNO', label: 'Alunos' },
              { value: 'DOCENTE', label: 'Docentes' },
              { value: 'ADMINISTRADOR', label: 'Administradores' },
            ]}
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

      {/* Tabela de Pessoas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Nome & Matrícula</th>
                <th className="py-3.5 px-4">CPF</th>
                <th className="py-3.5 px-4">Contato (E-mail / Tel)</th>
                <th className="py-3.5 px-4">Perfil</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Carregando registros de pessoas...
                  </td>
                </tr>
              ) : paginatedPessoas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhuma pessoa encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginatedPessoas.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{p.nome}</p>
                      <p className="text-[10px] text-slate-500">
                        {p.matricula ? `Matrícula: ${p.matricula}` : p.departamentoCurso || '—'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{p.cpf}</td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <p className="text-slate-800 font-medium">{p.email}</p>
                      <p className="text-[10px] text-slate-500">{p.telefone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={p.perfil} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Badge status={p.status} />
                        {p.bloqueadoPorAtraso && (
                          <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-200">
                            Bloqueado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                        title="Editar Pessoa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {p.status === 'Ativo' && (
                        <button
                          onClick={() => setInactivatingPessoa(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Inativar Pessoa"
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

      {/* Modal de Cadastro / Edição */}
      <PessoaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPessoas}
        pessoaToEdit={editingPessoa}
      />

      {/* Diálogo de Inativação */}
      <ConfirmDialog
        isOpen={!!inactivatingPessoa}
        onClose={() => setInactivatingPessoa(null)}
        onConfirm={handleConfirmInactivate}
        title="Inativar Pessoa"
        message={`Deseja realmente inativar o cadastro de ${inactivatingPessoa?.nome}? O usuário perderá acesso a novos empréstimos no sistema.`}
        confirmText="Inativar"
        variant="danger"
        loading={inactivateLoading}
      />
    </div>
  );
};

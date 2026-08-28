import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  Calendar,
  Filter,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  Download,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { Input } from '../UI/Input.tsx';
import { Select } from '../UI/Select.tsx';
import { Button } from '../UI/Button.tsx';
import { Badge } from '../UI/Badge.tsx';
import { Pagination } from '../UI/Pagination.tsx';
import { ComprovanteModal } from '../ComprovanteModal.tsx';
import type { Emprestimo, LoanStatus } from '../../types/index.ts';

export const HistoricoView: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [busca, setBusca] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Comprovante Modal
  const [selectedEmprestimo, setSelectedEmprestimo] = useState<Emprestimo | null>(null);

  const fetchHistorico = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.historico.list({
        busca: busca || undefined,
        status: (statusFilter as LoanStatus) || undefined,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
      });
      setEmprestimos(data);
      setCurrentPage(1);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar histórico.', 'error');
    } finally {
      setLoading(false);
    }
  }, [busca, statusFilter, dataInicio, dataFim, showToast]);

  useEffect(() => {
    fetchHistorico();
  }, [fetchHistorico]);

  const totalItems = emprestimos.length;
  const paginated = emprestimos.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>{isAdmin ? 'Histórico Geral de Empréstimos' : 'Meu Histórico de Empréstimos'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro cronológico e comprovação de retiradas e devoluções ({totalItems} registros)
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <Input
            placeholder={isAdmin ? 'Buscar código, beneficiário, CPF...' : 'Buscar código ou equipamento...'}
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
              { value: 'Em Andamento', label: 'Em Andamento' },
              { value: 'Concluído', label: 'Concluído' },
              { value: 'Concluído com Pendência', label: 'Concluído com Pendência' },
              { value: 'Atrasado', label: 'Atrasado' },
            ]}
          />
        </div>

        <div>
          <Input
            type="date"
            placeholder="A partir de"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            helperText="Data início"
          />
        </div>

        <div>
          <Input
            type="date"
            placeholder="Até"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            helperText="Data fim"
          />
        </div>
      </div>

      {/* Tabela de Histórico */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Código</th>
                {isAdmin && <th className="py-3.5 px-4">Beneficiário</th>}
                <th className="py-3.5 px-4">Equipamentos</th>
                <th className="py-3.5 px-4">Data Empréstimo</th>
                <th className="py-3.5 px-4">Previsão Devolução</th>
                <th className="py-3.5 px-4">Data Devolução</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Comprovante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-slate-400">
                    Carregando histórico...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-slate-400">
                    Nenhum empréstimo encontrado no histórico para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginated.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {emp.codigo}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{emp.beneficiarioNome}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {emp.beneficiarioPerfil} • {emp.beneficiarioCpf}
                        </p>
                      </td>
                    )}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">
                        {emp.itens.map((i) => i.equipamentoNome).join(', ')}
                      </p>
                      <p className="text-[10px] text-slate-500">{emp.itens.length} item(ns)</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(emp.dataEmprestimo).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {new Date(emp.dataPrevistaDevolucao + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {emp.dataEfetivaDevolucao ? (
                        <span className="font-medium text-emerald-700">
                          {new Date(emp.dataEfetivaDevolucao + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={emp.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedEmprestimo(emp)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors font-medium text-xs border border-slate-200"
                        title="Visualizar Comprovante"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Comprovante</span>
                      </button>
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

      {/* Modal de Comprovante */}
      <ComprovanteModal
        isOpen={!!selectedEmprestimo}
        onClose={() => setSelectedEmprestimo(null)}
        emprestimo={selectedEmprestimo}
      />
    </div>
  );
};

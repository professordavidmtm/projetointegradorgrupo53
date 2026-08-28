import React from 'react';
import {
  Laptop,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Wrench,
  Ban,
  ArrowRight,
  TrendingUp,
  Share2,
  RotateCcw,
  PlusCircle,
  FileText,
  Bell,
} from 'lucide-react';
import { Badge } from '../UI/Badge.tsx';
import { Button } from '../UI/Button.tsx';
import type { AdminDashboardData, Emprestimo } from '../../types/index.ts';
import type { TabType } from '../Layout/Sidebar.tsx';

interface AdminDashboardProps {
  data: AdminDashboardData;
  onNavigate: (tab: TabType) => void;
  onOpenComprovante: (emp: Emprestimo) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  data,
  onNavigate,
  onOpenComprovante,
}) => {
  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Painel Administrativo</h2>
          <p className="text-slate-500 text-sm mt-0.5">Bem-vindo, acompanhe os indicadores em tempo real.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            icon={<Share2 className="w-4 h-4" />}
            onClick={() => onNavigate('novo-emprestimo')}
          >
            + Novo Empréstimo
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={() => onNavigate('devolucoes')}
          >
            Devoluções
          </Button>
        </div>
      </div>

      {/* Alerta de Empréstimos Atrasados se houver */}
      {data.emprestimosAtrasados > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-900 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg text-red-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">
                Atenção: {data.emprestimosAtrasados} empréstimo(s) em atraso detectado(s)!
              </h4>
              <p className="text-xs text-red-700 mt-0.5">
                Os usuários associados foram bloqueados automaticamente para novos empréstimos até a devolução.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onNavigate('devolucoes')}
            className="shrink-0"
          >
            Registrar Devoluções
          </Button>
        </div>
      )}

      {/* Grid de 4 Cards Estatísticos Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Equipamentos */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Equipamentos</p>
          <div className="flex items-end justify-between mt-3">
            <h3 className="text-3xl font-bold text-slate-900">{data.totalEquipamentos}</h3>
            <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded">
              {data.equipamentosDisponiveis} disp.
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-50">
            {data.totalFornecedores} fornecedores cadastrados
          </p>
        </div>

        {/* Emprestados */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Emprestados</p>
          <div className="flex items-end justify-between mt-3">
            <h3 className="text-3xl font-bold text-blue-600">{data.equipamentosEmprestados}</h3>
            <span className="text-slate-400 text-xs font-medium">
              {data.totalEquipamentos ? Math.round((data.equipamentosEmprestados / data.totalEquipamentos) * 100) : 0}% do estoque
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-50">
            {data.emprestimosEmAndamento} empréstimo(s) ativos
          </p>
        </div>

        {/* Em Atraso */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-red-500 flex flex-col justify-between">
          <p className="text-red-500 text-xs font-semibold uppercase tracking-wider">Em Atraso</p>
          <div className="flex items-end justify-between mt-3">
            <h3 className="text-3xl font-bold text-red-600">
              {String(data.emprestimosAtrasados).padStart(2, '0')}
            </h3>
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {data.emprestimosAtrasados > 0 ? 'URGENTE' : 'REGULAR'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-50">
            {data.emprestimosAtrasados > 0 ? 'Exige contato com o usuário' : 'Nenhuma pendência crítica'}
          </p>
        </div>

        {/* Em Manutenção */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Em Manutenção</p>
          <div className="flex items-end justify-between mt-3">
            <h3 className="text-3xl font-bold text-slate-800">
              {String(data.equipamentosManutencao).padStart(2, '0')}
            </h3>
            <span className="text-slate-400 text-xs font-medium">
              {data.equipamentosManutencao} pendentes
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-50">
            Itens em assistência ou reparo
          </p>
        </div>
      </div>

      {/* Grid Central: 2 Colunas (Tabela Recentes) + 1 Coluna (Notificações / Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tabela de Empréstimos Recentes (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Empréstimos Recentes</h4>
              <p className="text-xs text-slate-400">Últimas movimentações de equipamentos registradas</p>
            </div>
            <button
              onClick={() => onNavigate('historico')}
              className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Ver Todos
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Usuário</th>
                  <th className="py-3.5 px-4">Equipamento</th>
                  <th className="py-3.5 px-4">Data Devolução</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.emprestimosRecentes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      Nenhum empréstimo registrado até o momento.
                    </td>
                  </tr>
                ) : (
                  data.emprestimosRecentes.map((emp) => {
                    const initials = emp.beneficiarioNome
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{emp.beneficiarioNome}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-medium">{emp.beneficiarioPerfil}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-slate-800">
                            {emp.itens.map((i) => i.equipamentoNome).join(', ')}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">Cód: {emp.codigo}</p>
                        </td>
                        <td className="py-4 px-4 font-medium">
                          <span className={emp.status === 'Atrasado' ? 'text-red-600 font-bold' : 'text-slate-600'}>
                            {new Date(emp.dataPrevistaDevolucao + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge status={emp.status} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => onOpenComprovante(emp)}
                            className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                            title="Ver Comprovante"
                          >
                            <FileText className="w-4 h-4" />
                            <span className="hidden sm:inline">Recibo</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Notificações Críticas & Distribuição de Status */}
        <div className="space-y-6">
          {/* Card: Notificações Críticas */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">Notificações Críticas</h4>
              <button
                onClick={() => onNavigate('notificacoes')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Todas
              </button>
            </div>
            <div className="p-5 space-y-3.5">
              {data.emprestimosAtrasados > 0 ? (
                <div className="flex items-start space-x-3 p-3.5 bg-red-50 rounded-lg border border-red-100">
                  <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-red-800">Empréstimos Vencidos</h5>
                    <p className="text-xs text-red-600 mt-0.5">
                      {data.emprestimosAtrasados} equipamento(s) não foram devolvidos na data limite.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3 p-3.5 bg-green-50 rounded-lg border border-green-100">
                  <div className="w-2 h-2 mt-1.5 bg-green-500 rounded-full shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-green-800">Situação Regular</h5>
                    <p className="text-xs text-green-600 mt-0.5">
                      Nenhum empréstimo em atraso no momento.
                    </p>
                  </div>
                </div>
              )}

              {data.equipamentosManutencao > 0 && (
                <div className="flex items-start space-x-3 p-3.5 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="w-2 h-2 mt-1.5 bg-amber-500 rounded-full shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-800">Equipamentos em Reparo</h5>
                    <p className="text-xs text-amber-600 mt-0.5">
                      {data.equipamentosManutencao} item(ns) estão sob vistoria técnica ou assistência.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3 p-3.5 bg-blue-50 rounded-lg border border-blue-100">
                <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-blue-800">Estoque Geral</h5>
                  <p className="text-xs text-blue-600 mt-0.5">
                    {data.equipamentosDisponiveis} de {data.totalEquipamentos} equipamentos prontos para retirada.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Status dos Equipamentos */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 text-sm">Status do Acervo</h4>
              <span className="text-xs text-slate-400">{data.totalEquipamentos} total</span>
            </div>

            <div className="space-y-3">
              {data.statusDistribucao.map((item) => {
                const percentage = data.totalEquipamentos
                  ? Math.round((item.value / data.totalEquipamentos) * 100)
                  : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="text-slate-900 font-bold">
                        {item.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Usuários cadastrados:</span>
              <strong className="text-slate-800 font-semibold">{data.totalUsuarios}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


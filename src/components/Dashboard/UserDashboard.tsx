import React from 'react';
import {
  Laptop,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Share2,
  RotateCcw,
  Bell,
  ArrowRight,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '../UI/Badge.tsx';
import { Button } from '../UI/Button.tsx';
import type { UserDashboardData, Emprestimo } from '../../types/index.ts';
import type { TabType } from '../Layout/Sidebar.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface UserDashboardProps {
  data: UserDashboardData;
  onNavigate: (tab: TabType) => void;
  onOpenComprovante: (emp: Emprestimo) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  data,
  onNavigate,
  onOpenComprovante,
}) => {
  const { user, isDocente } = useAuth();

  const getDaysDiff = (dateStr: string) => {
    const target = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Alerta de Bloqueio por Atraso */}
      {data.bloqueadoPorAtraso && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-900 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-rose-100 rounded-xl text-rose-700 shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Empréstimo Bloqueado: Regularize a devolução pendente
              </h4>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                Você possui empréstimos com data prevista de devolução ultrapassada. Conforme as normas institucionais,
                a solicitação de novos equipamentos fica suspensa até a entrega e vistoria dos itens em atraso.
              </p>
            </div>
          </div>
          {isDocente ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onNavigate('devolucoes')}
              className="shrink-0"
            >
              Registrar Minha Devolução
            </Button>
          ) : (
            <div className="px-3 py-1.5 bg-rose-100 rounded-lg text-xs font-bold text-rose-800 shrink-0">
              Procure a Diretoria de TI
            </div>
          )}
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Meus Empréstimos Ativos */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Meus Empréstimos Ativos
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold text-slate-900">
              {data.meusEmprestimosAtivos.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">em andamento</span>
          </div>
          <p className="text-[11px] text-slate-400 border-t border-slate-50 pt-2.5 mt-3">
            Total de {data.totalItensEmprestados} equipamento(s) sob sua guarda
          </p>
        </div>

        {/* Empréstimos Atrasados */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-red-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">
              Em Atraso
            </span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold text-red-600">
              {String(data.emprestimosAtrasados.length).padStart(2, '0')}
            </span>
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {data.emprestimosAtrasados.length > 0 ? 'URGENTE' : 'REGULAR'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 border-t border-slate-50 pt-2.5 mt-3">
            {data.emprestimosAtrasados.length > 0 ? (
              <strong className="text-red-600">Devolução obrigatória imediata</strong>
            ) : (
              <span className="text-green-600 font-medium">Nenhum atraso registrado</span>
            )}
          </p>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ações Rápidas
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Precisa de novos equipamentos para aulas ou pesquisas acadêmicas?
            </p>
          </div>
          <div className="pt-3 flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              disabled={data.bloqueadoPorAtraso}
              onClick={() => onNavigate('novo-emprestimo')}
              className="w-full font-semibold"
            >
              + Solicitar Empréstimo
            </Button>
            {isDocente && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigate('devolucoes')}
                className="shrink-0"
                title="Registrar Devolução"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Meus Empréstimos Ativos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Meus Empréstimos em Andamento</h3>
            <p className="text-xs text-slate-400">Equipamentos atualmente vinculados ao seu usuário</p>
          </div>
          <button
            onClick={() => onNavigate('historico')}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider flex items-center gap-1"
          >
            Ver Histórico <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {data.meusEmprestimosAtivos.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-400">
              <Laptop className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500">Você não possui nenhum empréstimo ativo no momento.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('novo-emprestimo')}
            >
              Solicitar Equipamento Agora
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.meusEmprestimosAtivos.map((emp) => {
              const daysLeft = getDaysDiff(emp.dataPrevistaDevolucao);
              const isOverdue = daysLeft < 0;

              return (
                <div
                  key={emp.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                    isOverdue ? 'bg-rose-50/40' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {emp.codigo}
                      </span>
                      <Badge status={isOverdue ? 'Atrasado' : emp.status} />
                      {isOverdue ? (
                        <span className="text-xs font-bold text-rose-600">
                          Venceu há {Math.abs(daysLeft)} dia(s)!
                        </span>
                      ) : daysLeft === 0 ? (
                        <span className="text-xs font-bold text-amber-600">
                          Vence Hoje!
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">
                          Resta(m) {daysLeft} dia(s) para devolução
                        </span>
                      )}
                    </div>

                    {/* Itens */}
                    <div className="pt-1">
                      <p className="text-xs font-bold text-slate-900">
                        {emp.itens.map((i) => `${i.equipamentoNome} (${i.equipamentoNumeroSerie})`).join(' • ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
                      <span>Data Retirada: {new Date(emp.dataEmprestimo).toLocaleDateString('pt-BR')}</span>
                      <span>
                        Data Prevista: <strong>{new Date(emp.dataPrevistaDevolucao + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>
                      </span>
                      {emp.observacoes && <span>Obs: {emp.observacoes}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FileText className="w-4 h-4" />}
                      onClick={() => onOpenComprovante(emp)}
                    >
                      Comprovante
                    </Button>
                    {isDocente && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<RotateCcw className="w-4 h-4" />}
                        onClick={() => onNavigate('devolucoes')}
                      >
                        Devolver
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notificações Recentes */}
      {data.notificacoesRecentes.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Avisos e Notificações Recentes</span>
            </h3>
            <button
              onClick={() => onNavigate('notificacoes')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-2">
            {data.notificacoesRecentes.map((n) => (
              <div key={n.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{n.titulo}</p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5">{n.mensagem}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  CheckCheck,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { Button } from '../UI/Button.tsx';
import { Badge } from '../UI/Badge.tsx';

export const NotificacoesView: React.FC = () => {
  const { notificacoes, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'todas' | 'nao_lidas'>('todas');

  const filtered = notificacoes.filter((n) => {
    if (filter === 'nao_lidas') return !n.lida;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Central de Notificações</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Alertas sobre prazos de devolução, confirmações e avisos institucionais ({unreadCount} não lidas)
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={<CheckCheck className="w-4 h-4" />}
            onClick={markAllAsRead}
          >
            Marcar Todas como Lidas
          </Button>
        )}
      </div>

      {/* Filtros em Abas */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setFilter('todas')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
            filter === 'todas'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Todas ({notificacoes.length})
        </button>
        <button
          onClick={() => setFilter('nao_lidas')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            filter === 'nao_lidas'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Não Lidas</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Lista de Notificações */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Nenhuma notificação encontrada nesta categoria.
          </div>
        ) : (
          filtered.map((n) => {
            const isWarning =
              n.tipo === 'EMPRESTIMO_ATRASADO' ||
              n.tipo === 'USUARIO_BLOQUEADO' ||
              n.tipo === 'AVARIA_REGISTRADA';
            const isDeadline = n.tipo === 'PROXIMO_VENCIMENTO';

            return (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-4 sm:p-5 flex items-start gap-3.5 transition-colors cursor-pointer hover:bg-slate-50 ${
                  !n.lida ? 'bg-blue-50/30' : ''
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    isWarning
                      ? 'bg-rose-100 text-rose-600'
                      : isDeadline
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {isWarning ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : isDeadline ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-bold ${!n.lida ? 'text-slate-900' : 'text-slate-700'}`}>
                      {n.titulo}
                    </h4>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(n.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{n.mensagem}</p>
                </div>

                {!n.lida && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-2" title="Não lida" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React from 'react';
import {
  LayoutDashboard,
  Laptop,
  Users,
  Building2,
  Share2,
  RotateCcw,
  History,
  Bell,
  LogOut,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';

export type TabType =
  | 'dashboard'
  | 'novo-emprestimo'
  | 'devolucoes'
  | 'equipamentos'
  | 'pessoas'
  | 'fornecedores'
  | 'historico'
  | 'notificacoes';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, logout, isAdmin, isDocente, isAluno } = useAuth();
  const { unreadCount } = useNotifications();

  const handleNav = (tab: TabType) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  // Itens de navegação com restrições por perfil
  const navItems: Array<{
    id: TabType;
    label: string;
    icon: React.ReactNode;
    allowed: boolean;
    badge?: number;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      allowed: true,
    },
    {
      id: 'novo-emprestimo',
      label: isAdmin ? 'Realizar Empréstimo' : 'Solicitar Empréstimo',
      icon: <Share2 className="w-5 h-5" />,
      allowed: true,
    },
    {
      id: 'devolucoes',
      label: 'Registrar Devolução',
      icon: <RotateCcw className="w-5 h-5" />,
      allowed: isAdmin || isDocente, // Apenas Administrador e Docente
    },
    {
      id: 'equipamentos',
      label: isAdmin ? 'Gerenciar Equipamentos' : 'Consultar Equipamentos',
      icon: <Laptop className="w-5 h-5" />,
      allowed: true,
    },
    {
      id: 'pessoas',
      label: 'Gerenciar Pessoas',
      icon: <Users className="w-5 h-5" />,
      allowed: isAdmin, // Apenas Administrador
    },
    {
      id: 'fornecedores',
      label: 'Gerenciar Fornecedores',
      icon: <Building2 className="w-5 h-5" />,
      allowed: isAdmin, // Apenas Administrador
    },
    {
      id: 'historico',
      label: isAdmin ? 'Histórico Geral' : 'Meu Histórico',
      icon: <History className="w-5 h-5" />,
      allowed: true,
    },
    {
      id: 'notificacoes',
      label: 'Notificações',
      icon: <Bell className="w-5 h-5" />,
      allowed: true,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800/80">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <span className="text-white font-bold text-base">U</span>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-white font-bold tracking-tight text-lg leading-tight truncate">
              UniControl
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide truncate">
              Sistema de Empréstimos
            </p>
          </div>
        </div>

        {/* User profile compact card in sidebar */}
        <div className="p-3 mx-4 mt-4 rounded-xl bg-slate-800/50 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-500/20">
              {user?.nome.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.nome}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : isDocente
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {user?.perfil}
                </span>
                {user?.bloqueadoPorAtraso && (
                  <span className="bg-red-600 text-white text-[9px] px-1 py-0.2 rounded font-bold animate-pulse">
                    BLOQUEADO
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 space-y-1 py-4 text-slate-400 text-sm overflow-y-auto">
          {navItems
            .filter((item) => item.allowed)
            .map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full px-3 py-2 rounded-lg flex items-center justify-between space-x-3 transition-colors cursor-pointer text-left text-xs font-medium ${
                    active
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={active ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  ) : active ? (
                    <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                  ) : null}
                </button>
              );
            })}
        </nav>

        {/* Footer with version and logout */}
        <div className="p-4 mt-auto border-t border-slate-800 flex flex-col items-center gap-2">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
          <p className="text-slate-500 text-[11px] text-center">
            Sistema de Controle v2.4
          </p>
        </div>
      </aside>
    </>
  );
};

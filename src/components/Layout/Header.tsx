import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  UserCheck,
  Shield,
  BookOpen,
  User,
  ArrowRight,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { ArquiteturaDocModal } from '../ArquiteturaDocModal.tsx';
import type { TabType } from './Sidebar.tsx';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileSidebar,
}) => {
  const { user, logout, login, isAdmin, isDocente, isAluno } = useAuth();
  const { notificacoes, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showArquiteturaModal, setShowArquiteturaModal] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setShowRoleSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabTitles: Record<TabType, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Painel Geral',
      subtitle: 'Visão unificada de equipamentos e operações',
    },
    'novo-emprestimo': {
      title: isAdmin ? 'Realizar Novo Empréstimo' : 'Solicitar Empréstimo',
      subtitle: 'Seleção de equipamentos institucionais disponíveis',
    },
    devolucoes: {
      title: 'Registro de Devoluções',
      subtitle: 'Controle de retorno e vistoria técnica de avarias',
    },
    equipamentos: {
      title: isAdmin ? 'Catálogo & Gestão de Equipamentos' : 'Equipamentos Institucionais',
      subtitle: 'Controle de disponibilidade, modelos e números de série',
    },
    pessoas: {
      title: 'Controle de Pessoas',
      subtitle: 'Alunos, Docentes e Administradores cadastrados',
    },
    fornecedores: {
      title: 'Gestão de Fornecedores',
      subtitle: 'Parceiros e empresas fornecedoras homologadas',
    },
    historico: {
      title: isAdmin ? 'Histórico Geral de Empréstimos' : 'Meu Histórico de Empréstimos',
      subtitle: 'Registro completo de movimentações e devoluções',
    },
    notificacoes: {
      title: 'Central de Notificações',
      subtitle: 'Alertas de prazos, atrasos e avisos do sistema',
    },
  };

  const handleQuickSwitch = async (email: string, pass: string) => {
    try {
      await login(email, pass);
      setShowRoleSwitcher(false);
    } catch (err) {
      console.error('Erro ao alternar usuário de teste:', err);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center space-x-4 flex-1">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base font-bold text-slate-800 leading-tight">
            {tabTitles[currentTab]?.title || 'Sistema de Empréstimos'}
          </h2>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            {tabTitles[currentTab]?.subtitle}
          </p>
        </div>
      </div>

      {/* Right side: Block warning, Role Switcher, Notifications, User info */}
      <div className="flex items-center space-x-4">
        {/* Alerta de usuário bloqueado */}
        {user?.bloqueadoPorAtraso && (
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Bloqueado por Atraso</span>
          </div>
        )}

        {/* Alternador Rápido de Perfis de Demonstração */}
        <div className="relative" ref={switcherRef}>
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
            title="Alternar entre contas de teste de demonstração"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Perfil de Teste:</span>
            <span className="font-semibold text-slate-900">{user?.perfil}</span>
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-1.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Perfis de Demonstração</p>
                <p className="text-[10px] text-slate-500">Alterne instantaneamente para testar permissões</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => handleQuickSwitch('admin@universidade.edu.br', 'admin123')}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between text-xs ${
                    isAdmin ? 'bg-blue-50/70 font-semibold text-blue-900' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="font-medium">Administrador</p>
                      <p className="text-[10px] text-slate-500 font-normal">admin@universidade.edu.br</p>
                    </div>
                  </div>
                  {isAdmin && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">Ativo</span>}
                </button>

                <button
                  onClick={() => handleQuickSwitch('carlos.souza@universidade.edu.br', '123456')}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between text-xs ${
                    isDocente ? 'bg-blue-50/70 font-semibold text-blue-900' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="font-medium">Prof. Carlos Souza (Docente)</p>
                      <p className="text-[10px] text-slate-500 font-normal">carlos.souza@universidade.edu.br</p>
                    </div>
                  </div>
                  {isDocente && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">Ativo</span>}
                </button>

                <button
                  onClick={() => handleQuickSwitch('lucas.martins@aluno.universidade.edu.br', '123456')}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between text-xs ${
                    isAluno && user?.email.includes('lucas') ? 'bg-blue-50/70 font-semibold text-blue-900' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium">Lucas Oliveira (Aluno)</p>
                      <p className="text-[10px] text-slate-500 font-normal">lucas.martins@aluno.universidade.edu.br</p>
                    </div>
                  </div>
                  {isAluno && user?.email.includes('lucas') && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">Ativo</span>}
                </button>

                <button
                  onClick={() => handleQuickSwitch('gabriel.santos@aluno.universidade.edu.br', '123456')}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between text-xs ${
                    isAluno && user?.email.includes('gabriel') ? 'bg-blue-50/70 font-semibold text-blue-900' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="font-medium">Gabriel Santos (Aluno Bloqueado)</p>
                      <p className="text-[10px] text-red-600 font-normal">Possui atraso pendente</p>
                    </div>
                  </div>
                  {isAluno && user?.email.includes('gabriel') && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">Ativo</span>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notificações Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative transition-colors"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Notificações</h4>
                  <p className="text-[10px] text-slate-500">{unreadCount} não lida(s)</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    Marcar todas lidas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notificacoes.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Nenhuma notificação recebida.
                  </div>
                ) : (
                  notificacoes.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-50 ${
                        !n.lida ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold ${!n.lida ? 'text-slate-900' : 'text-slate-700'}`}>
                          {n.titulo}
                        </p>
                        {!n.lida && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">{n.mensagem}</p>
                      <span className="text-[10px] text-slate-400 mt-1.5 block">
                        {new Date(n.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    onSelectTab('notificacoes');
                    setShowNotifications(false);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                >
                  <span>Ver todas as notificações</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User initials pill */}
        <div className="flex items-center space-x-3">
          {/* Botão de Documentação de Arquitetura */}
          <button
            onClick={() => setShowArquiteturaModal(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-xs font-semibold text-blue-700 transition-colors shadow-2xs"
            title="Visualizar, Imprimir PDF e Baixar Documento de Arquitetura (.DOC)"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Doc Arquitetura</span>
          </button>

          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-none text-slate-800">{user?.nome}</p>
            <p className="text-xs text-slate-400 uppercase mt-1">{user?.perfil}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200">
            {user?.nome
              ? user.nome
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : 'U'}
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal de Documento de Arquitetura */}
      <ArquiteturaDocModal
        isOpen={showArquiteturaModal}
        onClose={() => setShowArquiteturaModal(false)}
      />
    </header>
  );
};

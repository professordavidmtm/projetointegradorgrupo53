import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { Layout } from './components/Layout/Layout.tsx';
import type { TabType } from './components/Layout/Sidebar.tsx';
import { LoginView } from './components/Auth/LoginView.tsx';
import { AdminDashboard } from './components/Dashboard/AdminDashboard.tsx';
import { UserDashboard } from './components/Dashboard/UserDashboard.tsx';
import { PessoasList } from './components/Pessoas/PessoasList.tsx';
import { FornecedoresList } from './components/Fornecedores/FornecedoresList.tsx';
import { EquipamentosList } from './components/Equipamentos/EquipamentosList.tsx';
import { NovoEmprestimoView } from './components/Emprestimos/NovoEmprestimoView.tsx';
import { DevolucoesView } from './components/Devolucoes/DevolucoesView.tsx';
import { HistoricoView } from './components/Historico/HistoricoView.tsx';
import { NotificacoesView } from './components/Notificacoes/NotificacoesView.tsx';
import { ComprovanteModal } from './components/ComprovanteModal.tsx';
import { api } from './services/api.ts';
import type { AdminDashboardData, UserDashboardData, Emprestimo } from './types/index.ts';
import { Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading, isAdmin, isDocente } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  // Dashboard Data State
  const [adminDashboardData, setAdminDashboardData] = useState<AdminDashboardData | null>(null);
  const [userDashboardData, setUserDashboardData] = useState<UserDashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Global Comprovante Modal
  const [activeComprovante, setActiveComprovante] = useState<Emprestimo | null>(null);

  const fetchDashboardData = async () => {
    if (!isAuthenticated) return;
    try {
      setDashboardLoading(true);
      if (isAdmin) {
        const data = await api.dashboard.admin();
        setAdminDashboardData(data);
      } else {
        const data = await api.dashboard.user();
        setUserDashboardData(data);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user?.id, isAdmin]);

  // Se trocar para dashboard, recarrega os dados
  useEffect(() => {
    if (currentTab === 'dashboard' && isAuthenticated) {
      fetchDashboardData();
    }
  }, [currentTab]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-semibold text-slate-400">Iniciando sistema institucional...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Render do conteúdo com base na aba ativa
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        if (dashboardLoading && !adminDashboardData && !userDashboardData) {
          return (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs">Carregando painel institucional...</span>
            </div>
          );
        }
        if (isAdmin && adminDashboardData) {
          return (
            <AdminDashboard
              data={adminDashboardData}
              onNavigate={setCurrentTab}
              onOpenComprovante={setActiveComprovante}
            />
          );
        }
        if (!isAdmin && userDashboardData) {
          return (
            <UserDashboard
              data={userDashboardData}
              onNavigate={setCurrentTab}
              onOpenComprovante={setActiveComprovante}
            />
          );
        }
        return (
          <div className="p-12 text-center text-slate-500 text-xs">
            Nenhum dado disponível no momento.
          </div>
        );

      case 'novo-emprestimo':
        return <NovoEmprestimoView onSuccessNavigate={() => setCurrentTab('historico')} />;

      case 'devolucoes':
        if (!isAdmin && !isDocente) {
          return (
            <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-xl border border-rose-200 text-xs font-bold">
              Acesso restrito a Administradores e Docentes.
            </div>
          );
        }
        return <DevolucoesView />;

      case 'equipamentos':
        return <EquipamentosList />;

      case 'pessoas':
        if (!isAdmin) {
          return (
            <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-xl border border-rose-200 text-xs font-bold">
              Acesso restrito ao Administrador do Sistema.
            </div>
          );
        }
        return <PessoasList />;

      case 'fornecedores':
        if (!isAdmin) {
          return (
            <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-xl border border-rose-200 text-xs font-bold">
              Acesso restrito ao Administrador do Sistema.
            </div>
          );
        }
        return <FornecedoresList />;

      case 'historico':
        return <HistoricoView />;

      case 'notificacoes':
        return <NotificacoesView />;

      default:
        return <NovoEmprestimoView />;
    }
  };

  return (
    <Layout currentTab={currentTab} onSelectTab={setCurrentTab}>
      {renderTabContent()}

      {/* Comprovante Modal Global */}
      <ComprovanteModal
        isOpen={!!activeComprovante}
        onClose={() => setActiveComprovante(null)}
        emprestimo={activeComprovante}
      />
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainAppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

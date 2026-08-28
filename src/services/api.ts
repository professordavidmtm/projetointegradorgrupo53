import type {
  AuthResponse,
  AuthUser,
  PessoaFisica,
  Fornecedor,
  Equipamento,
  Emprestimo,
  Notificacao,
  AdminDashboardData,
  UserDashboardData,
} from '../types/index.ts';

const TOKEN_KEY = 'uni_equip_token';

export const storage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  removeToken: (): void => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = storage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Erro na requisição (${response.status})`;
    const errorObj = new Error(errorMsg) as Error & { fields?: Record<string, string>; status?: number; data?: any };
    errorObj.fields = data.fields;
    errorObj.status = response.status;
    errorObj.data = data;
    throw errorObj;
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    login: (email: string, senha: string) =>
      request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      }),
    me: () => request<{ user: AuthUser }>('/api/auth/me'),
    recoverPassword: (email: string) =>
      request<{ message: string }>('/api/auth/recover-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },

  // Pessoas
  pessoas: {
    list: (params?: { busca?: string; perfil?: string; status?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<AuthUser[]>(`/api/pessoas${q ? `?${q}` : ''}`);
    },
    get: (id: string) => request<AuthUser>(`/api/pessoas/${id}`),
    create: (data: Partial<PessoaFisica> & { senha?: string }) =>
      request<{ message: string; pessoa: AuthUser }>('/api/pessoas', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<PessoaFisica> & { senha?: string }) =>
      request<{ message: string; pessoa: AuthUser }>(`/api/pessoas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/api/pessoas/${id}`, {
        method: 'DELETE',
      }),
  },

  // Fornecedores
  fornecedores: {
    list: (params?: { busca?: string; status?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<Fornecedor[]>(`/api/fornecedores${q ? `?${q}` : ''}`);
    },
    get: (id: string) => request<Fornecedor>(`/api/fornecedores/${id}`),
    create: (data: Partial<Fornecedor>) =>
      request<{ message: string; fornecedor: Fornecedor }>('/api/fornecedores', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Fornecedor>) =>
      request<{ message: string; fornecedor: Fornecedor }>(`/api/fornecedores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/api/fornecedores/${id}`, {
        method: 'DELETE',
      }),
  },

  // Equipamentos
  equipamentos: {
    list: (params?: { busca?: string; tipo?: string; marca?: string; fornecedorId?: string; status?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<Equipamento[]>(`/api/equipamentos${q ? `?${q}` : ''}`);
    },
    get: (id: string) => request<Equipamento>(`/api/equipamentos/${id}`),
    create: (data: Partial<Equipamento>) =>
      request<{ message: string; equipamento: Equipamento }>('/api/equipamentos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Equipamento>) =>
      request<{ message: string; equipamento: Equipamento }>(`/api/equipamentos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/api/equipamentos/${id}`, {
        method: 'DELETE',
      }),
  },

  // Empréstimos
  emprestimos: {
    list: (params?: { busca?: string; status?: string; beneficiarioId?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<Emprestimo[]>(`/api/emprestimos${q ? `?${q}` : ''}`);
    },
    get: (id: string) => request<Emprestimo>(`/api/emprestimos/${id}`),
    create: (data: {
      beneficiarioId?: string;
      equipamentosIds: string[];
      dataEmprestimo?: string;
      dataPrevistaDevolucao: string;
      observacoes?: string;
    }) =>
      request<{ message: string; emprestimo: Emprestimo }>('/api/emprestimos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Devoluções
  devolucoes: {
    listPendentes: (busca?: string) => {
      const q = busca ? `?busca=${encodeURIComponent(busca)}` : '';
      return request<Emprestimo[]>(`/api/devolucoes/pendentes${q}`);
    },
    register: (
      id: string,
      data: {
        estado: 'Bom estado' | 'Com avaria';
        descricaoAvaria?: string;
        observacoes?: string;
        itensEstado?: Array<{ itemId: string; estado: 'Bom estado' | 'Com avaria'; descricaoAvaria?: string }>;
      }
    ) =>
      request<{ message: string; emprestimo: Emprestimo }>(`/api/devolucoes/${id}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    create: (data: {
      emprestimoId: string;
      dataEfetivaDevolucao?: string;
      observacoesDevolucao?: string;
      itens: Array<{ itemId: string; temAvaria: boolean; descricaoAvaria?: string }>;
    }) => {
      const hasAnyAvaria = data.itens.some((i) => i.temAvaria);
      const avariaDescriptions = data.itens
        .filter((i) => i.temAvaria && i.descricaoAvaria)
        .map((i) => i.descricaoAvaria)
        .join('; ');

      return request<{ message: string; emprestimo: Emprestimo }>(`/api/devolucoes/${data.emprestimoId}`, {
        method: 'POST',
        body: JSON.stringify({
          estado: hasAnyAvaria ? 'Com avaria' : 'Bom estado',
          descricaoAvaria: avariaDescriptions || undefined,
          observacoes: data.observacoesDevolucao || undefined,
          itensEstado: data.itens.map((i) => ({
            itemId: i.itemId,
            estado: i.temAvaria ? 'Com avaria' : 'Bom estado',
            descricaoAvaria: i.descricaoAvaria,
          })),
        }),
      });
    },
  },

  // Notificações
  notificacoes: {
    list: () => request<{ notificacoes: Notificacao[]; unreadCount: number }>('/api/notificacoes'),
    markRead: (id: string) => request<{ message: string; notificacao: Notificacao }>(`/api/notificacoes/${id}/lida`, { method: 'PATCH' }),
    markAllRead: () => request<{ message: string }>('/api/notificacoes/ler-todas', { method: 'PATCH' }),
  },

  // Dashboard
  dashboard: {
    get: () =>
      request<{ perfil: string; data: AdminDashboardData | UserDashboardData }>('/api/dashboard'),
    admin: async () => {
      const res = await request<{ perfil: string; data: AdminDashboardData }>('/api/dashboard');
      return res.data;
    },
    user: async () => {
      const res = await request<{ perfil: string; data: UserDashboardData }>('/api/dashboard');
      return res.data;
    },
  },

  // Histórico
  historico: {
    query: (params?: {
      dataInicio?: string;
      dataFim?: string;
      usuarioId?: string;
      buscaEquipamento?: string;
      status?: string;
      buscaGeral?: string;
    }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<Emprestimo[]>(`/api/historico${q ? `?${q}` : ''}`);
    },
    list: (params?: {
      dataInicio?: string;
      dataFim?: string;
      usuarioId?: string;
      buscaEquipamento?: string;
      status?: string;
      busca?: string;
    }) => {
      const payload: any = { ...params };
      if (params?.busca) {
        payload.buscaGeral = params.busca;
        delete payload.busca;
      }
      const q = new URLSearchParams(payload).toString();
      return request<Emprestimo[]>(`/api/historico${q ? `?${q}` : ''}`);
    },
  },
};

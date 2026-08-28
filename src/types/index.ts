export type UserRole = 'ADMINISTRADOR' | 'DOCENTE' | 'ALUNO';

export type UserStatus = 'Ativo' | 'Inativo' | 'Bloqueado';

export type EquipmentStatus = 'Disponível' | 'Emprestado' | 'Em manutenção' | 'Inativo';

export type LoanStatus = 'Em Andamento' | 'Atrasado' | 'Concluído' | 'Concluído com Pendência' | 'Cancelado';

export type ReturnCondition = 'Bom estado' | 'Com avaria';

export type NotificationType =
  | 'EMPRESTIMO_REALIZADO'
  | 'PROXIMO_VENCIMENTO'
  | 'EMPRESTIMO_ATRASADO'
  | 'DEVOLUCAO_REGISTRADA'
  | 'AVARIA_REGISTRADA'
  | 'USUARIO_BLOQUEADO'
  | 'USUARIO_DESBLOQUEADO'
  | 'INFO';

// 1. Pessoa (Base)
export interface Pessoa {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

// 2. PessoaFisica (Aluno, Docente, Administrador)
export interface PessoaFisica extends Pessoa {
  cpf: string;
  perfil: UserRole;
  matricula?: string;
  departamentoCurso?: string;
  senhaHash?: string;
  bloqueadoPorAtraso: boolean;
}

// 3. PessoaJuridica -> Fornecedor
export interface Fornecedor {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  status: 'Ativo' | 'Inativo';
  createdAt: string;
  updatedAt: string;
}

// 4. Equipamento
export interface Equipamento {
  id: string;
  nome: string;
  tipo: string;
  numeroSerie: string;
  marca: string;
  modelo: string;
  fornecedorId: string;
  fornecedorNome?: string;
  dataAquisicao: string;
  observacoes?: string;
  status: EquipmentStatus;
  createdAt: string;
  updatedAt: string;
}

// 5. ItemEmprestimo
export interface ItemEmprestimo {
  id: string;
  emprestimoId: string;
  equipamentoId: string;
  equipamentoNome: string;
  equipamentoNumeroSerie: string;
  equipamentoTipo: string;
  equipamentoMarca: string;
  equipamentoModelo: string;
  statusDevolucao?: ReturnCondition;
  descricaoAvaria?: string;
}

// 6. Emprestimo
export interface Emprestimo {
  id: string;
  codigo: string;
  beneficiarioId: string;
  beneficiarioNome: string;
  beneficiarioCpf: string;
  beneficiarioEmail: string;
  beneficiarioPerfil: UserRole;
  responsavelOperacaoId: string;
  responsavelOperacaoNome: string;
  dataEmprestimo: string; // ISO string
  dataPrevistaDevolucao: string; // YYYY-MM-DD
  dataEfetivaDevolucao?: string; // ISO string
  status: LoanStatus;
  observacoes?: string;
  itens: ItemEmprestimo[];
  registroDevolucao?: {
    dataDevolucao: string;
    responsavelId: string;
    responsavelNome: string;
    estado: ReturnCondition;
    descricaoAvaria?: string;
    observacoes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 7. Notificacao
export interface ItemDevolucaoPayload {
  itemId: string;
  temAvaria: boolean;
  descricaoAvaria?: string;
}

export interface Notificacao {
  id: string;
  destinatarioId: string; // User ID or 'ALL_ADMINS'
  tipo: NotificationType;
  titulo: string;
  mensagem: string;
  lida: boolean;
  referenciaId?: string; // e.g. emprestimo ID or equipamento ID
  createdAt: string;
}

// Auth Types
export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  perfil: UserRole;
  status: UserStatus;
  bloqueadoPorAtraso: boolean;
  matricula?: string;
  departamentoCurso?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Dashboard Data
export interface AdminDashboardData {
  totalEquipamentos: number;
  equipamentosDisponiveis: number;
  equipamentosEmprestados: number;
  equipamentosManutencao: number;
  equipamentosInativos: number;
  totalUsuarios: number;
  totalAlunos: number;
  totalDocentes: number;
  totalFornecedores: number;
  emprestimosEmAndamento: number;
  emprestimosAtrasados: number;
  emprestimosConcluidos: number;
  equipamentosPorTipo: { tipo: string; total: number; disponiveis: number }[];
  statusDistribucao: { name: string; value: number; color: string }[];
  emprestimosRecentes: Emprestimo[];
  emprestimosPorMes: { mes: string; emprestimos: number; devolucoes: number }[];
}

export interface UserDashboardData {
  meusEmprestimosAtivos: Emprestimo[];
  totalItensEmprestados: number;
  proximasDevolucoes: Emprestimo[];
  emprestimosAtrasados: Emprestimo[];
  notificacoesRecentes: Notificacao[];
  bloqueadoPorAtraso: boolean;
}

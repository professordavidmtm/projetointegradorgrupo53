import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  PessoaFisica,
  Fornecedor,
  Equipamento,
  Emprestimo,
  Notificacao,
} from '../types/index.ts';
import { hashPassword } from './auth.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface DatabaseSchema {
  pessoas: PessoaFisica[];
  fornecedores: Fornecedor[];
  equipamentos: Equipamento[];
  emprestimos: Emprestimo[];
  notificacoes: Notificacao[];
}

let dbCache: DatabaseSchema | null = null;

function getInitialSeedData(): DatabaseSchema {
  const defaultPasswordHash = hashPassword('123456');
  const adminPasswordHash = hashPassword('admin123');

  const pessoas: PessoaFisica[] = [
    {
      id: 'usr-admin-01',
      nome: 'Administrador do Sistema',
      email: 'admin@universidade.edu.br',
      cpf: '111.444.777-35',
      telefone: '(11) 98765-4321',
      perfil: 'ADMINISTRADOR',
      status: 'Ativo',
      matricula: 'ADM-001',
      departamentoCurso: 'DTI - Depto de Tecnologia da Informação',
      senhaHash: adminPasswordHash,
      bloqueadoPorAtraso: false,
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: '2026-01-10T08:00:00.000Z',
    },
    {
      id: 'usr-doc-01',
      nome: 'Prof. Dr. Carlos Eduardo Souza',
      email: 'carlos.souza@universidade.edu.br',
      cpf: '222.555.888-46',
      telefone: '(11) 97654-3210',
      perfil: 'DOCENTE',
      status: 'Ativo',
      matricula: 'DOC-1024',
      departamentoCurso: 'Engenharia da Computação',
      senhaHash: defaultPasswordHash,
      bloqueadoPorAtraso: false,
      createdAt: '2026-01-15T09:30:00.000Z',
      updatedAt: '2026-01-15T09:30:00.000Z',
    },
    {
      id: 'usr-doc-02',
      nome: 'Profa. Dra. Ana Beatriz Lima',
      email: 'ana.lima@universidade.edu.br',
      cpf: '333.666.999-57',
      telefone: '(11) 96543-2109',
      perfil: 'DOCENTE',
      status: 'Ativo',
      matricula: 'DOC-1055',
      departamentoCurso: 'Comunicação Social e Multimídia',
      senhaHash: defaultPasswordHash,
      bloqueadoPorAtraso: false,
      createdAt: '2026-01-20T10:15:00.000Z',
      updatedAt: '2026-01-20T10:15:00.000Z',
    },
    {
      id: 'usr-alu-01',
      nome: 'Lucas Oliveira Martins',
      email: 'lucas.martins@aluno.universidade.edu.br',
      cpf: '444.777.000-68',
      telefone: '(11) 95432-1098',
      perfil: 'ALUNO',
      status: 'Ativo',
      matricula: '202301458',
      departamentoCurso: 'Sistemas de Informação',
      senhaHash: defaultPasswordHash,
      bloqueadoPorAtraso: false,
      createdAt: '2026-02-01T11:00:00.000Z',
      updatedAt: '2026-02-01T11:00:00.000Z',
    },
    {
      id: 'usr-alu-02',
      nome: 'Mariana Silva Ferreira',
      email: 'mariana.silva@aluno.universidade.edu.br',
      cpf: '555.888.111-79',
      telefone: '(11) 94321-0987',
      perfil: 'ALUNO',
      status: 'Ativo',
      matricula: '202202981',
      departamentoCurso: 'Design e Mídias Digitais',
      senhaHash: defaultPasswordHash,
      bloqueadoPorAtraso: false,
      createdAt: '2026-02-05T14:20:00.000Z',
      updatedAt: '2026-02-05T14:20:00.000Z',
    },
    {
      id: 'usr-alu-03',
      nome: 'Gabriel Santos Nogueira',
      email: 'gabriel.santos@aluno.universidade.edu.br',
      cpf: '666.999.222-80',
      telefone: '(11) 93210-9876',
      perfil: 'ALUNO',
      status: 'Ativo',
      matricula: '202401123',
      departamentoCurso: 'Engenharia Elétrica',
      senhaHash: defaultPasswordHash,
      bloqueadoPorAtraso: true, // Começa com atraso de demonstração
      createdAt: '2026-02-10T16:45:00.000Z',
      updatedAt: '2026-02-10T16:45:00.000Z',
    },
  ];

  const fornecedores: Fornecedor[] = [
    {
      id: 'forn-01',
      razaoSocial: 'Dell Computadores do Brasil Ltda',
      nomeFantasia: 'Dell Technologies',
      cnpj: '72.381.189/0001-10',
      endereco: 'Av. Industrial, 1500 - Hortolândia, SP',
      telefone: '(19) 3887-0000',
      email: 'corporativo@dell.com.br',
      status: 'Ativo',
      createdAt: '2026-01-05T09:00:00.000Z',
      updatedAt: '2026-01-05T09:00:00.000Z',
    },
    {
      id: 'forn-02',
      razaoSocial: 'Epson do Brasil Indústria e Comércio Ltda',
      nomeFantasia: 'Epson Brasil',
      cnpj: '52.106.911/0001-44',
      endereco: 'Alameda Santos, 2400 - Cerqueira César, São Paulo, SP',
      telefone: '(11) 3146-2000',
      email: 'comercial@epson.com.br',
      status: 'Ativo',
      createdAt: '2026-01-06T10:00:00.000Z',
      updatedAt: '2026-01-06T10:00:00.000Z',
    },
    {
      id: 'forn-03',
      razaoSocial: 'Sony Brasil Audiovisual e Imagem S.A.',
      nomeFantasia: 'Sony Pro Brasil',
      cnpj: '43.447.044/0001-00',
      endereco: 'Rua Verbo Divino, 1488 - Chácara Santo Antônio, São Paulo, SP',
      telefone: '(11) 2196-9000',
      email: 'atendimento.pro@sony.com.br',
      status: 'Ativo',
      createdAt: '2026-01-07T11:00:00.000Z',
      updatedAt: '2026-01-07T11:00:00.000Z',
    },
    {
      id: 'forn-04',
      razaoSocial: 'Shure Áudio e Acústica Equipamentos Ltda',
      nomeFantasia: 'Shure Brasil Pro',
      cnpj: '10.334.821/0001-92',
      endereco: 'Rua Funchal, 418 - Vila Olímpia, São Paulo, SP',
      telefone: '(11) 3045-8800',
      email: 'suporte@shurebrasil.com.br',
      status: 'Ativo',
      createdAt: '2026-01-08T14:00:00.000Z',
      updatedAt: '2026-01-08T14:00:00.000Z',
    },
  ];

  const equipamentos: Equipamento[] = [
    {
      id: 'eq-01',
      nome: 'Notebook Dell Latitude 5430 Core i7',
      tipo: 'Notebook',
      numeroSerie: 'DL-LAT5430-88912',
      marca: 'Dell',
      modelo: 'Latitude 5430 (16GB RAM, 512GB SSD)',
      fornecedorId: 'forn-01',
      fornecedorNome: 'Dell Technologies',
      dataAquisicao: '2025-08-15',
      observacoes: 'Acompanha carregador original 65W USB-C e capa protetora.',
      status: 'Disponível',
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-01-10T10:00:00.000Z',
    },
    {
      id: 'eq-02',
      nome: 'Notebook Dell Inspiron 15 Core i5',
      tipo: 'Notebook',
      numeroSerie: 'DL-INSP15-99201',
      marca: 'Dell',
      modelo: 'Inspiron 15 3520 (8GB RAM, 256GB SSD)',
      fornecedorId: 'forn-01',
      fornecedorNome: 'Dell Technologies',
      dataAquisicao: '2025-09-20',
      observacoes: 'Acompanha carregador e mouse sem fio.',
      status: 'Emprestado', // Emprestado para Lucas
      createdAt: '2026-01-10T10:15:00.000Z',
      updatedAt: '2026-01-10T10:15:00.000Z',
    },
    {
      id: 'eq-03',
      nome: 'Projetor Multimídia Epson PowerLite E20',
      tipo: 'Projetor',
      numeroSerie: 'EP-PWL-3400-A',
      marca: 'Epson',
      modelo: 'PowerLite E20 3400 Lumens 3LCD',
      fornecedorId: 'forn-02',
      fornecedorNome: 'Epson Brasil',
      dataAquisicao: '2025-06-10',
      observacoes: 'Acompanha cabo HDMI 5m, cabo de força e controle remoto.',
      status: 'Disponível',
      createdAt: '2026-01-11T09:00:00.000Z',
      updatedAt: '2026-01-11T09:00:00.000Z',
    },
    {
      id: 'eq-04',
      nome: 'Projetor Interativo Epson BrightLink 725Wi',
      tipo: 'Projetor',
      numeroSerie: 'EP-BL725-7741',
      marca: 'Epson',
      modelo: 'BrightLink 725Wi Ultra-curta distância',
      fornecedorId: 'forn-02',
      fornecedorNome: 'Epson Brasil',
      dataAquisicao: '2025-07-22',
      observacoes: 'Inclui 2 canetas interativas e suporte de parede.',
      status: 'Disponível',
      createdAt: '2026-01-11T09:30:00.000Z',
      updatedAt: '2026-01-11T09:30:00.000Z',
    },
    {
      id: 'eq-05',
      nome: 'Câmera Profissional Sony Alpha 7 IV 4K',
      tipo: 'Câmera',
      numeroSerie: 'SN-A7M4-55091',
      marca: 'Sony',
      modelo: 'Alpha 7 IV Mirrorless 33MP',
      fornecedorId: 'forn-03',
      fornecedorNome: 'Sony Pro Brasil',
      dataAquisicao: '2025-10-05',
      observacoes: 'Acompanha lente 24-70mm f/2.8, 2 baterias, carregador duplo e case rígido.',
      status: 'Emprestado', // Emprestado para Gabriel (atrasado)
      createdAt: '2026-01-12T14:00:00.000Z',
      updatedAt: '2026-01-12T14:00:00.000Z',
    },
    {
      id: 'eq-06',
      nome: 'Câmera Cinema Sony FX30 Super 35',
      tipo: 'Câmera',
      numeroSerie: 'SN-FX30-10943',
      marca: 'Sony',
      modelo: 'ILME-FX30B Cine Line',
      fornecedorId: 'forn-03',
      fornecedorNome: 'Sony Pro Brasil',
      dataAquisicao: '2025-11-12',
      observacoes: 'Top handle XLR incluído, 2 cartões SD V90 de 128GB.',
      status: 'Disponível',
      createdAt: '2026-01-12T14:30:00.000Z',
      updatedAt: '2026-01-12T14:30:00.000Z',
    },
    {
      id: 'eq-07',
      nome: 'Tablet Samsung Galaxy Tab S8 Ultra',
      tipo: 'Tablet',
      numeroSerie: 'SM-X900-33821',
      marca: 'Samsung',
      modelo: 'Galaxy Tab S8 Ultra 14.6" Wi-Fi 256GB',
      fornecedorId: 'forn-01',
      fornecedorNome: 'Dell Technologies',
      dataAquisicao: '2025-05-18',
      observacoes: 'S-Pen inclusa e capa teclado oficial.',
      status: 'Disponível',
      createdAt: '2026-01-13T11:00:00.000Z',
      updatedAt: '2026-01-13T11:00:00.000Z',
    },
    {
      id: 'eq-08',
      nome: 'Microfone Vocal Dinâmico Shure SM58',
      tipo: 'Microfone',
      numeroSerie: 'SH-SM58-88432',
      marca: 'Shure',
      modelo: 'SM58-LC Cardioide',
      fornecedorId: 'forn-04',
      fornecedorNome: 'Shure Brasil Pro',
      dataAquisicao: '2025-04-10',
      observacoes: 'Acompanha cabo XLR 10m e cachimbo padrão.',
      status: 'Disponível',
      createdAt: '2026-01-14T08:30:00.000Z',
      updatedAt: '2026-01-14T08:30:00.000Z',
    },
    {
      id: 'eq-09',
      nome: 'Sistema Sem Fio Duplo Shure BLX288/PG58',
      tipo: 'Microfone',
      numeroSerie: 'SH-BLX288-9921',
      marca: 'Shure',
      modelo: 'BLX288BR/PG58 Receptor duplo',
      fornecedorId: 'forn-04',
      fornecedorNome: 'Shure Brasil Pro',
      dataAquisicao: '2025-07-01',
      observacoes: 'Fonte bivolt e 2 transmissores de mão.',
      status: 'Em manutenção', // Em manutenção de demonstração
      createdAt: '2026-01-14T09:00:00.000Z',
      updatedAt: '2026-01-14T09:00:00.000Z',
    },
    {
      id: 'eq-10',
      nome: 'Caixa de Som Ativa JBL EON715 1300W',
      tipo: 'Caixa de som',
      numeroSerie: 'JBL-EON715-6672',
      marca: 'JBL Professional',
      modelo: 'EON715 15" Bluetooth DSP',
      fornecedorId: 'forn-04',
      fornecedorNome: 'Shure Brasil Pro',
      dataAquisicao: '2025-03-15',
      observacoes: 'Acompanha tripé regulável e cabo de energia.',
      status: 'Disponível',
      createdAt: '2026-01-15T15:00:00.000Z',
      updatedAt: '2026-01-15T15:00:00.000Z',
    },
    {
      id: 'eq-11',
      nome: 'Monitor Profissional LG UltraWide 34"',
      tipo: 'Monitor',
      numeroSerie: 'LG-34WN750-1120',
      marca: 'LG',
      modelo: '34WN750-B UltraWide QHD IPS',
      fornecedorId: 'forn-01',
      fornecedorNome: 'Dell Technologies',
      dataAquisicao: '2025-09-01',
      observacoes: 'Cabo DisplayPort e HDMI inclusos.',
      status: 'Disponível',
      createdAt: '2026-01-16T10:00:00.000Z',
      updatedAt: '2026-01-16T10:00:00.000Z',
    },
    {
      id: 'eq-12',
      nome: 'Webcam Profissional 4K Logitech Brio',
      tipo: 'Webcam',
      numeroSerie: 'LOGI-BRIO4K-7711',
      marca: 'Logitech',
      modelo: 'Brio Ultra HD Pro 4K HDR',
      fornecedorId: 'forn-01',
      fornecedorNome: 'Dell Technologies',
      dataAquisicao: '2025-11-20',
      observacoes: 'Clipe de fixação e cabo USB-C 2.2m.',
      status: 'Inativo',
      createdAt: '2026-01-16T10:30:00.000Z',
      updatedAt: '2026-01-16T10:30:00.000Z',
    },
  ];

  const emprestimos: Emprestimo[] = [
    // 1. Empréstimo em andamento normal
    {
      id: 'emp-2026-001',
      codigo: 'EMP-2026-0001',
      beneficiarioId: 'usr-alu-01',
      beneficiarioNome: 'Lucas Oliveira Martins',
      beneficiarioCpf: '444.777.000-68',
      beneficiarioEmail: 'lucas.martins@aluno.universidade.edu.br',
      beneficiarioPerfil: 'ALUNO',
      responsavelOperacaoId: 'usr-admin-01',
      responsavelOperacaoNome: 'Administrador do Sistema',
      dataEmprestimo: '2026-08-22T10:00:00.000Z',
      dataPrevistaDevolucao: '2026-08-29',
      status: 'Em Andamento',
      observacoes: 'Utilização para projeto final da disciplina de Redes.',
      itens: [
        {
          id: 'item-01',
          emprestimoId: 'emp-2026-001',
          equipamentoId: 'eq-02',
          equipamentoNome: 'Notebook Dell Inspiron 15 Core i5',
          equipamentoNumeroSerie: 'DL-INSP15-99201',
          equipamentoTipo: 'Notebook',
          equipamentoMarca: 'Dell',
          equipamentoModelo: 'Inspiron 15 3520 (8GB RAM, 256GB SSD)',
        },
      ],
      createdAt: '2026-08-22T10:00:00.000Z',
      updatedAt: '2026-08-22T10:00:00.000Z',
    },
    // 2. Empréstimo ATRASADO (para teste de bloqueio e alertas)
    {
      id: 'emp-2026-002',
      codigo: 'EMP-2026-0002',
      beneficiarioId: 'usr-alu-03',
      beneficiarioNome: 'Gabriel Santos Nogueira',
      beneficiarioCpf: '666.999.222-80',
      beneficiarioEmail: 'gabriel.santos@aluno.universidade.edu.br',
      beneficiarioPerfil: 'ALUNO',
      responsavelOperacaoId: 'usr-admin-01',
      responsavelOperacaoNome: 'Administrador do Sistema',
      dataEmprestimo: '2026-08-10T14:30:00.000Z',
      dataPrevistaDevolucao: '2026-08-17', // Vencido!
      status: 'Atrasado',
      observacoes: 'Gravação externa de documentário acadêmico.',
      itens: [
        {
          id: 'item-02',
          emprestimoId: 'emp-2026-002',
          equipamentoId: 'eq-05',
          equipamentoNome: 'Câmera Profissional Sony Alpha 7 IV 4K',
          equipamentoNumeroSerie: 'SN-A7M4-55091',
          equipamentoTipo: 'Câmera',
          equipamentoMarca: 'Sony',
          equipamentoModelo: 'Alpha 7 IV Mirrorless 33MP',
        },
      ],
      createdAt: '2026-08-10T14:30:00.000Z',
      updatedAt: '2026-08-18T00:00:00.000Z',
    },
    // 3. Empréstimo Concluído com Sucesso
    {
      id: 'emp-2026-003',
      codigo: 'EMP-2026-0003',
      beneficiarioId: 'usr-doc-01',
      beneficiarioNome: 'Prof. Dr. Carlos Eduardo Souza',
      beneficiarioCpf: '222.555.888-46',
      beneficiarioEmail: 'carlos.souza@universidade.edu.br',
      beneficiarioPerfil: 'DOCENTE',
      responsavelOperacaoId: 'usr-admin-01',
      responsavelOperacaoNome: 'Administrador do Sistema',
      dataEmprestimo: '2026-08-01T08:00:00.000Z',
      dataPrevistaDevolucao: '2026-08-05',
      dataEfetivaDevolucao: '2026-08-05T17:20:00.000Z',
      status: 'Concluído',
      observacoes: 'Apresentação de seminário departamental.',
      itens: [
        {
          id: 'item-03',
          emprestimoId: 'emp-2026-003',
          equipamentoId: 'eq-03',
          equipamentoNome: 'Projetor Multimídia Epson PowerLite E20',
          equipamentoNumeroSerie: 'EP-PWL-3400-A',
          equipamentoTipo: 'Projetor',
          equipamentoMarca: 'Epson',
          equipamentoModelo: 'PowerLite E20 3400 Lumens 3LCD',
          statusDevolucao: 'Bom estado',
        },
      ],
      registroDevolucao: {
        dataDevolucao: '2026-08-05T17:20:00.000Z',
        responsavelId: 'usr-admin-01',
        responsavelNome: 'Administrador do Sistema',
        estado: 'Bom estado',
        observacoes: 'Devolvido em perfeitas condições com todos os cabos.',
      },
      createdAt: '2026-08-01T08:00:00.000Z',
      updatedAt: '2026-08-05T17:20:00.000Z',
    },
  ];

  const notificacoes: Notificacao[] = [
    {
      id: 'notif-01',
      destinatarioId: 'ALL_ADMINS',
      tipo: 'EMPRESTIMO_ATRASADO',
      titulo: 'Empréstimo Atrasado Detectado',
      mensagem: 'O empréstimo EMP-2026-0002 de Gabriel Santos Nogueira venceu em 17/08/2026 e está com status atrasado.',
      lida: false,
      referenciaId: 'emp-2026-002',
      createdAt: '2026-08-18T00:05:00.000Z',
    },
    {
      id: 'notif-02',
      destinatarioId: 'usr-alu-03',
      tipo: 'USUARIO_BLOQUEADO',
      titulo: 'Bloqueio de Novos Empréstimos',
      mensagem: 'Você possui um empréstimo em atraso (EMP-2026-0002). Novos empréstimos estão bloqueados até a devolução.',
      lida: false,
      referenciaId: 'emp-2026-002',
      createdAt: '2026-08-18T00:05:00.000Z',
    },
    {
      id: 'notif-03',
      destinatarioId: 'usr-alu-01',
      tipo: 'PROXIMO_VENCIMENTO',
      titulo: 'Lembrete de Devolução',
      mensagem: 'Seu empréstimo EMP-2026-0001 (Notebook Dell Inspiron) vence em 29/08/2026. Fique atento ao prazo.',
      lida: false,
      referenciaId: 'emp-2026-001',
      createdAt: '2026-08-24T08:00:00.000Z',
    },
  ];

  return {
    pessoas,
    fornecedores,
    equipamentos,
    emprestimos,
    notificacoes,
  };
}

export function getDB(): DatabaseSchema {
  if (dbCache) {
    checkAndApplyDelays(dbCache);
    return dbCache;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(content);
    } else {
      dbCache = getInitialSeedData();
      saveDB(dbCache);
    }
  } catch (err) {
    console.error('Error loading DB from file, using in-memory seed:', err);
    dbCache = getInitialSeedData();
  }

  if (dbCache) {
    checkAndApplyDelays(dbCache);
  }
  return dbCache!;
}

export function saveDB(data: DatabaseSchema): void {
  dbCache = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB to file:', err);
  }
}

/**
 * Verifica atrasos automáticos em todos os empréstimos em andamento.
 * Atualiza status para 'Atrasado', bloqueia usuários e cria notificações caso necessário.
 */
export function checkAndApplyDelays(db: DatabaseSchema): boolean {
  let changed = false;
  const todayStr = new Date().toISOString().split('T')[0];

  // Map of delayed users
  const delayedBeneficiaryIds = new Set<string>();

  for (const emp of db.emprestimos) {
    if (emp.status === 'Em Andamento') {
      if (emp.dataPrevistaDevolucao < todayStr) {
        emp.status = 'Atrasado';
        emp.updatedAt = new Date().toISOString();
        delayedBeneficiaryIds.add(emp.beneficiarioId);
        changed = true;

        // Notificar usuário se não houver notificação recente de atraso
        const existsNotif = db.notificacoes.some(
          (n) => n.referenciaId === emp.id && n.tipo === 'EMPRESTIMO_ATRASADO'
        );
        if (!existsNotif) {
          db.notificacoes.push({
            id: `notif-${crypto.randomUUID()}`,
            destinatarioId: emp.beneficiarioId,
            tipo: 'EMPRESTIMO_ATRASADO',
            titulo: 'Empréstimo Atrasado',
            mensagem: `O prazo de devolução do empréstimo ${emp.codigo} venceu em ${emp.dataPrevistaDevolucao}. Regularize com urgência.`,
            lida: false,
            referenciaId: emp.id,
            createdAt: new Date().toISOString(),
          });
          db.notificacoes.push({
            id: `notif-${crypto.randomUUID()}`,
            destinatarioId: 'ALL_ADMINS',
            tipo: 'EMPRESTIMO_ATRASADO',
            titulo: 'Atraso Registrado',
            mensagem: `Empréstimo ${emp.codigo} de ${emp.beneficiarioNome} está atrasado.`,
            lida: false,
            referenciaId: emp.id,
            createdAt: new Date().toISOString(),
          });
        }
      }
    } else if (emp.status === 'Atrasado') {
      delayedBeneficiaryIds.add(emp.beneficiarioId);
    }
  }

  // Atualiza flag bloqueadoPorAtraso nas pessoas
  for (const pessoa of db.pessoas) {
    const shouldBeBlocked = delayedBeneficiaryIds.has(pessoa.id);
    if (pessoa.bloqueadoPorAtraso !== shouldBeBlocked) {
      pessoa.bloqueadoPorAtraso = shouldBeBlocked;
      pessoa.updatedAt = new Date().toISOString();
      changed = true;
    }
  }

  if (changed) {
    saveDB(db);
  }

  return changed;
}

export function generateNextLoanCode(db: DatabaseSchema): string {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `EMP-${currentYear}-`;
  const matchingLoans = db.emprestimos.filter((e) => e.codigo && e.codigo.startsWith(yearPrefix));
  let maxSeq = 0;
  for (const l of matchingLoans) {
    const seqStr = l.codigo.replace(yearPrefix, '');
    const seq = parseInt(seqStr, 10);
    if (!isNaN(seq) && seq > maxSeq) {
      maxSeq = seq;
    }
  }
  const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
  return `${yearPrefix}${nextSeq}`;
}

export function addNotification(
  db: DatabaseSchema,
  notif: Omit<Notificacao, 'id' | 'createdAt' | 'lida'>
): Notificacao {
  const newNotif: Notificacao = {
    id: `notif-${crypto.randomUUID()}`,
    ...notif,
    lida: false,
    createdAt: new Date().toISOString(),
  };
  db.notificacoes.unshift(newNotif);
  saveDB(db);
  return newNotif;
}

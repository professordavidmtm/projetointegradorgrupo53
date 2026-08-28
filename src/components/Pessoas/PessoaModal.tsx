import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal.tsx';
import { Input } from '../UI/Input.tsx';
import { Select } from '../UI/Select.tsx';
import { Button } from '../UI/Button.tsx';
import { api } from '../../services/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { formatCPF, formatPhone } from '../../server/validators.ts';
import type { AuthUser, UserRole, UserStatus } from '../../types/index.ts';

interface PessoaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pessoaToEdit?: AuthUser | null;
}

export const PessoaModal: React.FC<PessoaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  pessoaToEdit,
}) => {
  const { showToast } = useNotifications();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [perfil, setPerfil] = useState<UserRole>('ALUNO');
  const [status, setStatus] = useState<UserStatus>('Ativo');
  const [senha, setSenha] = useState('');
  const [matricula, setMatricula] = useState('');
  const [departamentoCurso, setDepartamentoCurso] = useState('');

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (pessoaToEdit) {
      setNome(pessoaToEdit.nome || '');
      setCpf(pessoaToEdit.cpf || '');
      setEmail(pessoaToEdit.email || '');
      setTelefone(pessoaToEdit.telefone || '');
      setPerfil(pessoaToEdit.perfil || 'ALUNO');
      setStatus(pessoaToEdit.status || 'Ativo');
      setSenha('');
      setMatricula(pessoaToEdit.matricula || '');
      setDepartamentoCurso(pessoaToEdit.departamentoCurso || '');
    } else {
      setNome('');
      setCpf('');
      setEmail('');
      setTelefone('');
      setPerfil('ALUNO');
      setStatus('Ativo');
      setSenha('123456');
      setMatricula('');
      setDepartamentoCurso('');
    }
    setFormErrors({});
    setGeneralError('');
  }, [pessoaToEdit, isOpen]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setGeneralError('');

    const errors: Record<string, string> = {};
    if (!nome.trim()) errors.nome = 'Nome completo é obrigatório.';
    if (!cpf.trim()) errors.cpf = 'CPF é obrigatório.';
    if (!email.trim()) errors.email = 'E-mail institucional é obrigatório.';
    if (!telefone.trim()) errors.telefone = 'Telefone é obrigatório.';
    if (!perfil) errors.perfil = 'Perfil de acesso é obrigatório.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setGeneralError('Preencha todos os campos destacados em vermelho.');
      return;
    }

    try {
      setLoading(true);
      if (pessoaToEdit) {
        await api.pessoas.update(pessoaToEdit.id, {
          nome,
          cpf,
          email,
          telefone,
          perfil,
          status,
          senha: senha ? senha : undefined,
          matricula,
          departamentoCurso,
        });
        showToast('Pessoa atualizada com sucesso!', 'success');
      } else {
        await api.pessoas.create({
          nome,
          cpf,
          email,
          telefone,
          perfil,
          status,
          senha: senha || '123456',
          matricula,
          departamentoCurso,
        });
        showToast('Pessoa cadastrada com sucesso.', 'success');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.fields) {
        setFormErrors(err.fields);
      }
      setGeneralError(err.message || 'Erro ao salvar cadastro de pessoa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={pessoaToEdit ? 'Editar Cadastro de Pessoa' : 'Cadastrar Nova Pessoa'}
      subtitle="Gerenciamento de Alunos, Docentes e Administradores"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {generalError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
            {generalError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Nome Completo"
              placeholder="Ex: Carlos Eduardo da Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              error={formErrors.nome}
              required
            />
          </div>

          <div>
            <Input
              label="CPF"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={handleCpfChange}
              error={formErrors.cpf}
              maxLength={14}
              required
            />
          </div>

          <div>
            <Input
              label="Telefone / Celular"
              placeholder="(11) 90000-0000"
              value={telefone}
              onChange={handlePhoneChange}
              error={formErrors.telefone}
              maxLength={15}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="E-mail Institucional"
              type="email"
              placeholder="usuario@universidade.edu.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={formErrors.email}
              required
            />
          </div>

          <div>
            <Select
              label="Perfil de Acesso"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as UserRole)}
              error={formErrors.perfil}
              options={[
                { value: 'ALUNO', label: 'Aluno (Discente)' },
                { value: 'DOCENTE', label: 'Docente (Professor)' },
                { value: 'ADMINISTRADOR', label: 'Administrador (TI / Patrimônio)' },
              ]}
              required
            />
          </div>

          <div>
            <Select
              label="Status da Conta"
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              options={[
                { value: 'Ativo', label: 'Ativo' },
                { value: 'Inativo', label: 'Inativo' },
              ]}
            />
          </div>

          <div>
            <Input
              label="Matrícula / Registro Acadêmico"
              placeholder="Ex: 202601002"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Curso / Departamento"
              placeholder="Ex: Ciência da Computação"
              value={departamentoCurso}
              onChange={(e) => setDepartamentoCurso(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label={pessoaToEdit ? 'Alterar Senha (Opcional)' : 'Senha Inicial'}
              type="password"
              placeholder={pessoaToEdit ? 'Deixe em branco para manter a atual' : 'Padrão: 123456'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              helperText={!pessoaToEdit ? 'A senha padrão inicial recomendada é 123456.' : undefined}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            {pessoaToEdit ? 'Atualizar Pessoa' : 'Cadastrar Pessoa'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

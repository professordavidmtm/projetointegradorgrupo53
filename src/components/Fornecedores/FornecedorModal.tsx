import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal.tsx';
import { Input } from '../UI/Input.tsx';
import { Select } from '../UI/Select.tsx';
import { Button } from '../UI/Button.tsx';
import { api } from '../../services/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { formatCNPJ, formatPhone } from '../../server/validators.ts';
import type { Fornecedor } from '../../types/index.ts';

interface FornecedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fornecedorToEdit?: Fornecedor | null;
}

export const FornecedorModal: React.FC<FornecedorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  fornecedorToEdit,
}) => {
  const { showToast } = useNotifications();

  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (fornecedorToEdit) {
      setRazaoSocial(fornecedorToEdit.razaoSocial || '');
      setNomeFantasia(fornecedorToEdit.nomeFantasia || '');
      setCnpj(fornecedorToEdit.cnpj || '');
      setEndereco(fornecedorToEdit.endereco || '');
      setTelefone(fornecedorToEdit.telefone || '');
      setEmail(fornecedorToEdit.email || '');
      setStatus(fornecedorToEdit.status || 'Ativo');
    } else {
      setRazaoSocial('');
      setNomeFantasia('');
      setCnpj('');
      setEndereco('');
      setTelefone('');
      setEmail('');
      setStatus('Ativo');
    }
    setFormErrors({});
    setGeneralError('');
  }, [fornecedorToEdit, isOpen]);

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCNPJ(e.target.value));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setGeneralError('');

    const errors: Record<string, string> = {};
    if (!razaoSocial.trim()) errors.razaoSocial = 'Razão Social é obrigatória.';
    if (!nomeFantasia.trim()) errors.nomeFantasia = 'Nome Fantasia é obrigatório.';
    if (!cnpj.trim()) errors.cnpj = 'CNPJ é obrigatório.';
    if (!endereco.trim()) errors.endereco = 'Endereço é obrigatório.';
    if (!telefone.trim()) errors.telefone = 'Telefone é obrigatório.';
    if (!email.trim()) errors.email = 'E-mail de contato é obrigatório.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setGeneralError('Preencha todos os campos destacados.');
      return;
    }

    try {
      setLoading(true);
      if (fornecedorToEdit) {
        await api.fornecedores.update(fornecedorToEdit.id, {
          razaoSocial,
          nomeFantasia,
          cnpj,
          endereco,
          telefone,
          email,
          status,
        });
        showToast('Fornecedor atualizado com sucesso!', 'success');
      } else {
        await api.fornecedores.create({
          razaoSocial,
          nomeFantasia,
          cnpj,
          endereco,
          telefone,
          email,
          status,
        });
        showToast('Fornecedor cadastrado com sucesso.', 'success');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.fields) {
        setFormErrors(err.fields);
      }
      setGeneralError(err.message || 'Erro ao processar cadastro de fornecedor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fornecedorToEdit ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}
      subtitle="Parceiros e fabricantes de equipamentos institucionais"
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
              label="Razão Social"
              placeholder="Ex: Dell Computadores do Brasil Ltda"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              error={formErrors.razaoSocial}
              required
            />
          </div>

          <div>
            <Input
              label="Nome Fantasia"
              placeholder="Ex: Dell Technologies"
              value={nomeFantasia}
              onChange={(e) => setNomeFantasia(e.target.value)}
              error={formErrors.nomeFantasia}
              required
            />
          </div>

          <div>
            <Input
              label="CNPJ"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={handleCnpjChange}
              error={formErrors.cnpj}
              maxLength={18}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Endereço Completo"
              placeholder="Ex: Av. Industrial, 1500 - Hortolândia, SP"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              error={formErrors.endereco}
              required
            />
          </div>

          <div>
            <Input
              label="Telefone Comercial"
              placeholder="(11) 3000-0000"
              value={telefone}
              onChange={handlePhoneChange}
              error={formErrors.telefone}
              maxLength={15}
              required
            />
          </div>

          <div>
            <Input
              label="E-mail de Contato"
              type="email"
              placeholder="contato@fornecedor.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={formErrors.email}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Ativo' | 'Inativo')}
              options={[
                { value: 'Ativo', label: 'Ativo (Homologado para Novos Equipamentos)' },
                { value: 'Inativo', label: 'Inativo' },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            {fornecedorToEdit ? 'Atualizar Fornecedor' : 'Cadastrar Fornecedor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal.tsx';
import { Input } from '../UI/Input.tsx';
import { Select } from '../UI/Select.tsx';
import { Button } from '../UI/Button.tsx';
import { api } from '../../services/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import type { Equipamento, EquipmentStatus, Fornecedor } from '../../types/index.ts';

interface EquipamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipamentoToEdit?: Equipamento | null;
}

export const EquipamentoModal: React.FC<EquipamentoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  equipamentoToEdit,
}) => {
  const { showToast } = useNotifications();

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Notebook');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [dataAquisicao, setDataAquisicao] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [status, setStatus] = useState<EquipmentStatus>('Disponível');
  const [observacoes, setObservacoes] = useState('');

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Carregar lista de fornecedores ativos
      api.fornecedores.list({ status: 'Ativo' }).then((data) => {
        setFornecedores(data);
      });
    }

    if (equipamentoToEdit) {
      setNome(equipamentoToEdit.nome || '');
      setTipo(equipamentoToEdit.tipo || 'Notebook');
      setMarca(equipamentoToEdit.marca || '');
      setModelo(equipamentoToEdit.modelo || '');
      setNumeroSerie(equipamentoToEdit.numeroSerie || '');
      setDataAquisicao(equipamentoToEdit.dataAquisicao || '');
      setFornecedorId(equipamentoToEdit.fornecedorId || '');
      setStatus(equipamentoToEdit.status || 'Disponível');
      setObservacoes(equipamentoToEdit.observacoes || '');
    } else {
      setNome('');
      setTipo('Notebook');
      setMarca('');
      setModelo('');
      setNumeroSerie('');
      setDataAquisicao(new Date().toISOString().split('T')[0]);
      setFornecedorId('');
      setStatus('Disponível');
      setObservacoes('');
    }
    setFormErrors({});
    setGeneralError('');
  }, [equipamentoToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setGeneralError('');

    const errors: Record<string, string> = {};
    if (!nome.trim()) errors.nome = 'Nome do equipamento é obrigatório.';
    if (!tipo.trim()) errors.tipo = 'Tipo de equipamento é obrigatório.';
    if (!marca.trim()) errors.marca = 'Marca é obrigatória.';
    if (!modelo.trim()) errors.modelo = 'Modelo é obrigatório.';
    if (!numeroSerie.trim()) errors.numeroSerie = 'Número de série é obrigatório.';
    if (!dataAquisicao.trim()) errors.dataAquisicao = 'Data de aquisição é obrigatória.';
    if (!fornecedorId.trim()) errors.fornecedorId = 'Selecione um fornecedor cadastrado.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setGeneralError('Preencha todos os campos destacados.');
      return;
    }

    try {
      setLoading(true);
      if (equipamentoToEdit) {
        await api.equipamentos.update(equipamentoToEdit.id, {
          nome,
          tipo,
          marca,
          modelo,
          numeroSerie: numeroSerie.trim().toUpperCase(),
          dataAquisicao,
          fornecedorId,
          status,
          observacoes,
        });
        showToast('Equipamento atualizado com sucesso!', 'success');
      } else {
        await api.equipamentos.create({
          nome,
          tipo,
          marca,
          modelo,
          numeroSerie: numeroSerie.trim().toUpperCase(),
          dataAquisicao,
          fornecedorId,
          status,
          observacoes,
        });
        showToast('Equipamento cadastrado com sucesso.', 'success');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.fields) {
        setFormErrors(err.fields);
      }
      setGeneralError(err.message || 'Erro ao cadastrar equipamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={equipamentoToEdit ? 'Editar Equipamento' : 'Cadastrar Novo Equipamento'}
      subtitle="Patrimônio tecnológico institucional"
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
              label="Nome do Equipamento"
              placeholder="Ex: Notebook Dell Latitude 3420"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              error={formErrors.nome}
              required
            />
          </div>

          <div>
            <Select
              label="Tipo / Categoria"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              error={formErrors.tipo}
              options={[
                { value: 'Notebook', label: 'Notebook' },
                { value: 'Projetor', label: 'Projetor' },
                { value: 'Câmera', label: 'Câmera Digital' },
                { value: 'Tablet', label: 'Tablet' },
                { value: 'Acessório', label: 'Acessório / Adaptador' },
                { value: 'Áudio', label: 'Equipamento de Áudio' },
                { value: 'Outro', label: 'Outro' },
              ]}
              required
            />
          </div>

          <div>
            <Input
              label="Número de Série Único"
              placeholder="Ex: SN-DELL-88492"
              value={numeroSerie}
              onChange={(e) => setNumeroSerie(e.target.value.toUpperCase())}
              error={formErrors.numeroSerie}
              required
            />
          </div>

          <div>
            <Input
              label="Marca / Fabricante"
              placeholder="Ex: Dell, Epson, Sony"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              error={formErrors.marca}
              required
            />
          </div>

          <div>
            <Input
              label="Modelo"
              placeholder="Ex: Latitude 3420 i5 16GB"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              error={formErrors.modelo}
              required
            />
          </div>

          <div>
            <Input
              label="Data de Aquisição"
              type="date"
              value={dataAquisicao}
              onChange={(e) => setDataAquisicao(e.target.value)}
              error={formErrors.dataAquisicao}
              required
            />
          </div>

          <div>
            <Select
              label="Fornecedor Homologado"
              value={fornecedorId}
              onChange={(e) => setFornecedorId(e.target.value)}
              error={formErrors.fornecedorId}
              placeholder="Selecione um fornecedor..."
              options={fornecedores.map((f) => ({
                value: f.id,
                label: `${f.nomeFantasia} (${f.cnpj})`,
              }))}
              helperText={
                fornecedores.length === 0
                  ? 'Nenhum fornecedor cadastrado. Cadastre um fornecedor antes.'
                  : undefined
              }
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Select
              label="Status do Equipamento"
              value={status}
              onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
              options={[
                { value: 'Disponível', label: 'Disponível (Pronto para Empréstimo)' },
                { value: 'Em manutenção', label: 'Em manutenção' },
                { value: 'Emprestado', label: 'Emprestado' },
                { value: 'Inativo', label: 'Inativo' },
              ]}
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Observações / Especificações
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              rows={2}
              placeholder="Acompanha carregador, case protetora, cabos..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            {equipamentoToEdit ? 'Atualizar Equipamento' : 'Cadastrar Equipamento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

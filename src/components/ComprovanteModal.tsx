import React from 'react';
import { Modal } from './UI/Modal.tsx';
import { Button } from './UI/Button.tsx';
import { Printer, ShieldCheck, Download, Calendar, User, Package } from 'lucide-react';
import type { Emprestimo } from '../types/index.ts';

interface ComprovanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  emprestimo: Emprestimo | null;
}

export const ComprovanteModal: React.FC<ComprovanteModalProps> = ({
  isOpen,
  onClose,
  emprestimo,
}) => {
  if (!emprestimo) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    try {
      if (dateStr.includes('T')) {
        return new Date(dateStr).toLocaleString('pt-BR');
      }
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comprovante de Empréstimo Institucional" maxWidth="2xl">
      <div className="space-y-6 print:m-0" id="comprovante-content">
        {/* Header do Comprovante */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-slate-900">
            <ShieldCheck className="w-7 h-7 text-blue-900" />
            <h2 className="text-lg font-bold uppercase tracking-wider">Universidade Federal Institucional</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Diretoria de Tecnologia da Informação & Patrimônio Acadêmico
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-md border border-slate-200">
            <span className="text-xs font-bold text-slate-800 tracking-widest">
              COMPROVANTE Nº: {emprestimo.codigo}
            </span>
          </div>
        </div>

        {/* Informações Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 uppercase">
              <User className="w-4 h-4 text-blue-800" />
              <span>Dados do Beneficiário</span>
            </div>
            <p><span className="font-medium text-slate-500">Nome:</span> <strong className="text-slate-900">{emprestimo.beneficiarioNome}</strong></p>
            <p><span className="font-medium text-slate-500">CPF:</span> <strong className="text-slate-900">{emprestimo.beneficiarioCpf}</strong></p>
            <p><span className="font-medium text-slate-500">E-mail:</span> {emprestimo.beneficiarioEmail}</p>
            <p><span className="font-medium text-slate-500">Perfil:</span> <span className="uppercase font-semibold">{emprestimo.beneficiarioPerfil}</span></p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 uppercase">
              <Calendar className="w-4 h-4 text-blue-800" />
              <span>Prazos e Responsáveis</span>
            </div>
            <p><span className="font-medium text-slate-500">Data Retirada:</span> <strong>{formatDate(emprestimo.dataEmprestimo)}</strong></p>
            <p><span className="font-medium text-slate-500">Data Prevista Devolução:</span> <strong className="text-rose-700 font-bold">{formatDate(emprestimo.dataPrevistaDevolucao)}</strong></p>
            {emprestimo.dataEfetivaDevolucao && (
              <p><span className="font-medium text-slate-500">Data Efetiva Devolução:</span> <strong className="text-emerald-700">{formatDate(emprestimo.dataEfetivaDevolucao)}</strong></p>
            )}
            <p><span className="font-medium text-slate-500">Responsável Operação:</span> {emprestimo.responsavelOperacaoNome}</p>
          </div>
        </div>

        {/* Lista de Equipamentos */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 uppercase">
            <Package className="w-4 h-4 text-blue-800" />
            <span>Equipamentos Vinculados ({emprestimo.itens.length})</span>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="p-2.5">Item</th>
                  <th className="p-2.5">Tipo</th>
                  <th className="p-2.5">Nº de Série</th>
                  <th className="p-2.5">Marca / Modelo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emprestimo.itens.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-medium text-slate-900">{idx + 1}. {item.equipamentoNome}</td>
                    <td className="p-2.5 text-slate-600">{item.equipamentoTipo}</td>
                    <td className="p-2.5 font-mono text-slate-700">{item.equipamentoNumeroSerie}</td>
                    <td className="p-2.5 text-slate-600">{item.equipamentoMarca} {item.equipamentoModelo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Observações */}
        {emprestimo.observacoes && (
          <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-xs text-amber-900">
            <strong>Observações:</strong> {emprestimo.observacoes}
          </div>
        )}

        {/* Termo de Compromisso */}
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1 leading-relaxed">
          <p className="font-semibold text-slate-800 uppercase text-xs">Termo de Responsabilidade e Guarda:</p>
          <p>
            O beneficiário declara que recebeu os equipamentos listados em perfeito estado de funcionamento e conservação,
            comprometendo-se a zelar pelo bom uso e devolvê-los no prazo estipulado. O atraso na devolução acarretará no
            bloqueio automático de novas solicitações. Em caso de dano ou avaria, será lavrado registro circunstanciado de manutenção.
          </p>
        </div>

        {/* Linhas de Assinatura */}
        <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
          <div className="space-y-1">
            <div className="border-t border-slate-400 w-full pt-1" />
            <p className="font-semibold text-slate-900">{emprestimo.beneficiarioNome}</p>
            <p className="text-[10px] text-slate-500">Beneficiário / Solicitante</p>
          </div>

          <div className="space-y-1">
            <div className="border-t border-slate-400 w-full pt-1" />
            <p className="font-semibold text-slate-900">{emprestimo.responsavelOperacaoNome}</p>
            <p className="text-[10px] text-slate-500">Responsável pelo Atendimento</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 print:hidden">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="primary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Imprimir Comprovante
          </Button>
        </div>
      </div>
    </Modal>
  );
};

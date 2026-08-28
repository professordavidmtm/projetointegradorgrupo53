import React from 'react';
import type { EquipmentStatus, LoanStatus, UserRole, UserStatus } from '../../types/index.ts';

interface BadgeProps {
  status?: EquipmentStatus | LoanStatus | UserStatus | UserRole | string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, children, size = 'md' }) => {
  let computedVariant = variant || 'default';
  const label = children || status;

  if (!variant && status) {
    switch (status) {
      // Status de Equipamento
      case 'Disponível':
      case 'Ativo':
      case 'Concluído':
        computedVariant = 'success';
        break;
      case 'Emprestado':
      case 'Em Andamento':
        computedVariant = 'info';
        break;
      case 'Em manutenção':
      case 'Concluído com Pendência':
      case 'DOCENTE':
        computedVariant = 'warning';
        break;
      case 'Inativo':
      case 'Cancelado':
        computedVariant = 'neutral';
        break;
      case 'Atrasado':
      case 'Bloqueado':
      case 'ADMINISTRADOR':
        computedVariant = 'danger';
        break;
      case 'ALUNO':
        computedVariant = 'info';
        break;
      default:
        computedVariant = 'default';
    }
  }

  const variantStyles: Record<string, string> = {
    success: 'bg-green-100 text-green-700 border border-green-200/60',
    info: 'bg-blue-100 text-blue-700 border border-blue-200/60',
    warning: 'bg-amber-100 text-amber-700 border border-amber-200/60',
    danger: 'bg-red-100 text-red-700 border border-red-200/60',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    default: 'bg-slate-100 text-slate-600 border border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] font-bold px-2 py-0.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded uppercase tracking-wider font-bold whitespace-nowrap ${sizeStyles[size]} ${
        variantStyles[computedVariant] || variantStyles.default
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          computedVariant === 'success'
            ? 'bg-green-600'
            : computedVariant === 'info'
            ? 'bg-blue-600'
            : computedVariant === 'warning'
            ? 'bg-amber-600'
            : computedVariant === 'danger'
            ? 'bg-red-600'
            : 'bg-slate-500'
        }`}
      />
      {label}
    </span>
  );
};

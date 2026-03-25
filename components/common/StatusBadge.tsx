import { cn } from '@/lib/utils';

type StatusType = 'ativo' | 'inativo' | 'stable' | 'mild' | 'critical';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  ativo: {
    label: 'Ativo',
    className: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
  },
  inativo: {
    label: 'Inativo',
    className: 'bg-gray-100 text-[var(--color-text-muted)]',
  },
  stable: {
    label: 'Stable',
    className: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
  },
  mild: {
    label: 'Mild',
    className: 'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
  },
  critical: {
    label: 'Critical',
    className: 'bg-[var(--color-error-light)] text-[var(--color-error)]',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

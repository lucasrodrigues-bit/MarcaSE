import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-alt)]">
        <Icon className="h-8 w-8 text-[var(--color-text-muted)]" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-[var(--color-text-secondary)]">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

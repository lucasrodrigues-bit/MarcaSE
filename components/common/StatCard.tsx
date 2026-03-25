import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-primary-light)]">
        <Icon className="h-6 w-6 text-[var(--color-primary)]" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
          {trend && (
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
              )}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

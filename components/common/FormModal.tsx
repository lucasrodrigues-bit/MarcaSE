'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface FormModalProps {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
  submitLabel?: string;
  footer?: React.ReactNode;
}

export function FormModal({
  title,
  description,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  children,
  submitLabel = 'Salvar',
  footer,
}: FormModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <div
          className={cn(
            'relative flex flex-col bg-white rounded-lg shadow-xl',
            'w-full max-w-2xl max-h-[90vh]',
            'sm:w-full sm:max-h-[90vh]',
            'max-sm:w-full max-sm:h-full max-sm:max-h-full max-sm:rounded-none',
            'animate-in fade-in-0 zoom-in-95 duration-200'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Fixed Header */}
          <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{title}</h2>
              {description && (
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

          {/* Fixed Footer */}
          {footer || (
            <div className="flex items-center justify-end gap-3 border-t px-6 py-4 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={onSubmit}
                disabled={isLoading}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Salvando...
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

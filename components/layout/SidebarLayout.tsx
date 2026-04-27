'use client';
import { useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { cn } from '@/lib/utils';

interface SidebarLayoutProps {
  children: React.ReactNode;
  /** Classe(s) CSS extra aplicadas ao <main>. Opcional. */
  className?: string;
}

export function SidebarLayout({ children, className }: SidebarLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      {}
      <main
        className={cn(
          'min-h-screen p-6 transition-all duration-300',
          collapsed ? 'ml-16' : 'ml-60',
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
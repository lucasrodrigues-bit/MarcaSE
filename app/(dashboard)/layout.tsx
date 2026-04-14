import type { ReactNode } from 'react';
import { RootLayout } from '@/components/layout/RootLayout';
import { DataProvider } from '@/context/DataContext';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DataProvider>
      <RootLayout>{children}</RootLayout>
      <Toaster position="top-right" />
    </DataProvider>
  );
}

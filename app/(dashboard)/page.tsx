'use client';

import { RootLayout } from '@/components/layout/RootLayout';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { DataProvider } from '@/context/DataContext';
import { Toaster } from '@/components/ui/sonner';

export default function HomePage() {
  return (
    <DataProvider>
      <RootLayout>
        <Dashboard />
      </RootLayout>
      <Toaster position="top-right" />
    </DataProvider>
  );
}

'use client';

import { RootLayout } from '@/components/layout/RootLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { DoctorList } from '@/components/doctors/DoctorList';
import { DataProvider } from '@/context/DataContext';
import { Toaster } from '@/components/ui/sonner';

export default function MedicosPage() {
  return (
    <DataProvider>
      <RootLayout>
        <PageHeader
          title="Médicos"
          description="Gerencie os médicos cadastrados no sistema"
        />
        <DoctorList />
      </RootLayout>
      <Toaster position="top-right" />
    </DataProvider>
  );
}

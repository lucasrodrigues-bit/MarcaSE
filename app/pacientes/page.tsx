'use client';

import { RootLayout } from '@/components/layout/RootLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { PatientList } from '@/components/patients/PatientList';
import { DataProvider } from '@/context/DataContext';
import { Toaster } from '@/components/ui/sonner';

export default function PacientesPage() {
  return (
    <DataProvider>
      <RootLayout>
        <PageHeader
          title="Pacientes"
          description="Gerencie os pacientes cadastrados no sistema"
        />
        <PatientList />
      </RootLayout>
      <Toaster position="top-right" />
    </DataProvider>
  );
}

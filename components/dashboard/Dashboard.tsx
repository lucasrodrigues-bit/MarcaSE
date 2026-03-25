'use client';

import Link from 'next/link';
import { Stethoscope, Users, Calendar, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { useData } from '@/context/DataContext';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';

export function Dashboard() {
  const { doctors, patients, isLoaded } = useData();

  // Get 5 most recent patients
  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  // Show loading state while data is being loaded from localStorage
  if (!isLoaded) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8 text-[var(--color-primary)]" />
      </div>
    );
  }

  // Calculate stats from actual data
  const totalDoctors = doctors.length;
  const totalPatients = patients.length;
  // These will be 0 until appointments feature is implemented
  const appointmentsToday = 0;
  const upcomingAppointments = 0;

  // Get specialty breakdown (only if doctors exist)
  const specialtyBreakdown = doctors.length > 0
    ? Object.entries(
        doctors.reduce(
          (acc, doc) => {
            acc[doc.specialty] = (acc[doc.specialty] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        )
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  // Get neighborhood breakdown (only if patients exist)
  const neighborhoodBreakdown = patients.length > 0
    ? Object.entries(
        patients.reduce(
          (acc, pat) => {
            acc[pat.neighborhood] = (acc[pat.neighborhood] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        )
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">MarcaSE</h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">
            Saúde pública mais próxima de você
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/medicos">
            <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Médico
            </Button>
          </Link>
          <Link href="/pacientes">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Paciente
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Médicos"
          value={totalDoctors}
          icon={Stethoscope}
        />
        <StatCard
          title="Total Pacientes"
          value={totalPatients}
          icon={Users}
        />
        <StatCard
          title="Consultas Hoje"
          value={appointmentsToday}
          icon={Calendar}
        />
        <StatCard
          title="Próximas Consultas"
          value={upcomingAppointments}
          icon={Clock}
        />
      </div>

      {/* Recent Patients */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Pacientes Recentes
          </h2>
          <Link href="/pacientes">
            <Button variant="ghost" size="sm" className="text-[var(--color-primary)]">
              Ver todos
            </Button>
          </Link>
        </div>
        {recentPatients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum paciente cadastrado ainda"
            description="Comece cadastrando seu primeiro paciente para visualizar aqui."
            actionLabel="Cadastrar primeiro paciente"
            onAction={() => window.location.href = '/pacientes'}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Último Atendimento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPatients.map((patient) => {
                const initials = patient.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <TableRow key={patient.id} className="hover:bg-[var(--color-primary-light)]">
                    <TableCell>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={patient.photo} alt={patient.name} />
                        <AvatarFallback className="bg-[var(--color-primary)] text-white text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">
                      {patient.cellphone}
                    </TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">{patient.city}</TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">
                      {formatDate(patient.lastAppointment)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Quick Stats by Specialty */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
            Médicos por Especialidade
          </h3>
          {specialtyBreakdown.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
              Nenhum médico cadastrado ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {specialtyBreakdown.map(([specialty, count]) => (
                <div key={specialty} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-secondary)]">{specialty}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-[var(--color-primary)]"
                      style={{ width: `${Math.max((count / doctors.length) * 100, 10)}px` }}
                    />
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
            Pacientes por Bairro
          </h3>
          {neighborhoodBreakdown.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
              Nenhum paciente cadastrado ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {neighborhoodBreakdown.map(([neighborhood, count]) => (
                <div key={neighborhood} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-secondary)]">{neighborhood}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-[var(--color-success)]"
                      style={{ width: `${Math.max((count / patients.length) * 100, 10)}px` }}
                    />
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

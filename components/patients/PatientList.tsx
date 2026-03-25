'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Pencil, Trash2, Archive, Users, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PatientForm } from './PatientForm';
import { PatientCard } from './PatientCard';
import { useData } from '@/context/DataContext';
import type { Patient } from '@/types';
import { toast } from 'sonner';
import { format, isSameMonth } from 'date-fns';

const ITEMS_PER_PAGE = 10;

export function PatientList() {
  const { patients, updatePatient, deletePatient } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vipFilter, setVipFilter] = useState(false);
  const [birthdayFilter, setBirthdayFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [hasAppointments, setHasAppointments] = useState(false);

  // Filter and search logic
  const filteredPatients = useMemo(() => {
    const now = new Date();
    return patients.filter((patient) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        patient.name.toLowerCase().includes(searchLower) ||
        patient.cpf.replace(/\D/g, '').includes(searchLower.replace(/\D/g, '')) ||
        patient.sus.includes(searchLower);

      const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
      const matchesVip = !vipFilter || patient.isVip;

      const patientBirthDate = new Date(patient.birthDate);
      const matchesBirthday = !birthdayFilter || isSameMonth(patientBirthDate, now);

      return matchesSearch && matchesStatus && matchesVip && matchesBirthday;
    });
  }, [patients, search, statusFilter, vipFilter, birthdayFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleView = (patient: Patient) => {
    setSelectedPatient(patient);
    setCardOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormOpen(true);
  };

  const handleDelete = (patient: Patient) => {
    setSelectedPatient(patient);
    // Check if patient has appointments
    const hasLinkedAppointments = !!(patient.lastAppointment || patient.nextAppointment);
    setHasAppointments(hasLinkedAppointments);

    if (hasLinkedAppointments) {
      setArchiveDialogOpen(true);
    } else {
      setDeleteDialogOpen(true);
    }
  };

  const confirmArchive = () => {
    if (selectedPatient) {
      updatePatient({ ...selectedPatient, status: 'inativo' });
      toast.success('Paciente arquivado com sucesso');
      setArchiveDialogOpen(false);
      setSelectedPatient(null);
    }
  };

  const confirmDelete = () => {
    if (selectedPatient) {
      deletePatient(selectedPatient.id);
      toast.success('Paciente removido com sucesso');
      setDeleteDialogOpen(false);
      setSelectedPatient(null);
    }
  };

  const handleProceedToDelete = () => {
    setArchiveDialogOpen(false);
    setDeleteDialogOpen(true);
  };

  const handleNewPatient = () => {
    setSelectedPatient(null);
    setFormOpen(true);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <Input
            placeholder="Buscar por nome, CPF ou cartão SUS..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[var(--color-text-muted)]" />
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="vip-filter"
              checked={vipFilter}
              onCheckedChange={(checked) => {
                setVipFilter(checked);
                setCurrentPage(1);
              }}
            />
            <Label htmlFor="vip-filter" className="text-sm cursor-pointer">
              VIP
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="birthday-filter"
              checked={birthdayFilter}
              onCheckedChange={(checked) => {
                setBirthdayFilter(checked);
                setCurrentPage(1);
              }}
            />
            <Label htmlFor="birthday-filter" className="text-sm cursor-pointer">
              Aniversariantes
            </Label>
          </div>

          <Button
            onClick={handleNewPatient}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
          >
            Novo Paciente
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        {paginatedPatients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum paciente encontrado"
            description="Não há pacientes cadastrados ou que correspondam aos filtros aplicados."
            actionLabel="Cadastrar Paciente"
            onAction={handleNewPatient}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>SUS</TableHead>
                    <TableHead>Bairro</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Último Atend.</TableHead>
                    <TableHead>Próx. Atend.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPatients.map((patient) => {
                    const initials = patient.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <TableRow
                        key={patient.id}
                        className="hover:bg-[var(--color-primary-light)] cursor-pointer"
                        onClick={() => handleView(patient)}
                      >
                        <TableCell>
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={patient.photo} alt={patient.name} />
                            <AvatarFallback className="bg-[var(--color-primary)] text-white text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{patient.name}</span>
                            {patient.isVip && (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 h-5 px-1">
                                <Star className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[var(--color-text-secondary)]">
                          {patient.cpf}
                        </TableCell>
                        <TableCell className="text-[var(--color-text-secondary)]">
                          {patient.sus}
                        </TableCell>
                        <TableCell className="text-[var(--color-text-secondary)]">
                          {patient.neighborhood}
                        </TableCell>
                        <TableCell className="text-[var(--color-text-secondary)]">
                          {patient.city}
                        </TableCell>
                        <TableCell className="text-[var(--color-text-secondary)]">
                          {formatDate(patient.lastAppointment)}
                        </TableCell>
                        <TableCell className="text-[var(--color-text-secondary)]">
                          {formatDate(patient.nextAppointment)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={patient.status} />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Ações</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleView(patient);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(patient);
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(patient);
                                }}
                                className="text-[var(--color-error)]"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredPatients.length)} de{' '}
                  {filteredPatients.length} registros
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <PatientForm open={formOpen} onOpenChange={setFormOpen} patient={selectedPatient} />
      <PatientCard open={cardOpen} onOpenChange={setCardOpen} patient={selectedPatient} />

      {/* Archive Dialog (for patients with appointments) */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Paciente com histórico de atendimentos</AlertDialogTitle>
            <AlertDialogDescription>
              O paciente {selectedPatient?.name} possui atendimentos vinculados. Recomendamos
              arquivar (desativar) em vez de excluir definitivamente para manter o histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmArchive}
              className="bg-[var(--color-warning)] text-white hover:bg-[var(--color-warning)]/90"
            >
              <Archive className="mr-2 h-4 w-4" />
              Arquivar paciente
            </AlertDialogAction>
            <AlertDialogAction
              onClick={handleProceedToDelete}
              className="bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Paciente"
        description={`Tem certeza que deseja excluir ${selectedPatient?.name}? ${
          hasAppointments
            ? 'ATENÇÃO: Esta ação removerá permanentemente o paciente e seu histórico. Esta ação não pode ser desfeita.'
            : 'Esta ação não pode ser desfeita.'
        }`}
        confirmLabel="Excluir definitivamente"
        onConfirm={confirmDelete}
        isDestructive
      />
    </div>
  );
}

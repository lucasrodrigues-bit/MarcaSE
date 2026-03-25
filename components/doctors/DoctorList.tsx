'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Pencil, Trash2, Stethoscope } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DoctorForm } from './DoctorForm';
import { DoctorCard } from './DoctorCard';
import { useData } from '@/context/DataContext';
import type { Doctor } from '@/types';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

const SPECIALTIES = [
  'Cardiologia',
  'Clínica Geral',
  'Dermatologia',
  'Endocrinologia',
  'Gastroenterologia',
  'Ginecologia',
  'Neurologia',
  'Oftalmologia',
  'Ortopedia',
  'Pediatria',
  'Psiquiatria',
  'Urologia',
];

export function DoctorList() {
  const { doctors, deleteDoctor } = useData();
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Filter and search logic
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        doctor.name.toLowerCase().includes(searchLower) ||
        doctor.crm.toLowerCase().includes(searchLower) ||
        doctor.specialty.toLowerCase().includes(searchLower);

      const matchesSpecialty = specialtyFilter === 'all' || doctor.specialty === specialtyFilter;
      const matchesStatus = statusFilter === 'all' || doctor.status === statusFilter;

      return matchesSearch && matchesSpecialty && matchesStatus;
    });
  }, [doctors, search, specialtyFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleView = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setCardOpen(true);
  };

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setFormOpen(true);
  };

  const handleDelete = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDoctor) {
      deleteDoctor(selectedDoctor.id);
      toast.success('Médico removido com sucesso');
      setDeleteDialogOpen(false);
      setSelectedDoctor(null);
    }
  };

  const handleNewDoctor = () => {
    setSelectedDoctor(null);
    setFormOpen(true);
  };

  // Get unique specialties from current doctors
  const availableSpecialties = useMemo(() => {
    const specialtiesInUse = [...new Set(doctors.map((d) => d.specialty))];
    return [...new Set([...SPECIALTIES, ...specialtiesInUse])].sort();
  }, [doctors]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <Input
            placeholder="Buscar por nome, CRM ou especialidade..."
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
              value={specialtyFilter}
              onValueChange={(value) => {
                setSpecialtyFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Especialidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {availableSpecialties.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <Button
            onClick={handleNewDoctor}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
          >
            Novo Médico
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        {paginatedDoctors.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="Nenhum médico cadastrado ainda"
            description={
              search || specialtyFilter !== 'all' || statusFilter !== 'all'
                ? 'Não há médicos que correspondam aos filtros aplicados.'
                : 'Comece cadastrando o primeiro médico para gerenciar a equipe médica.'
            }
            actionLabel="Cadastrar primeiro médico"
            onAction={handleNewDoctor}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>CRM</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDoctors.map((doctor) => {
                    const initials = doctor.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <TableRow
                        key={doctor.id}
                        className="hover:bg-[var(--color-primary-light)] cursor-pointer"
                        onClick={() => handleView(doctor)}
                      >
                        <TableCell>
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={doctor.photo} alt={doctor.name} />
                            <AvatarFallback className="bg-[var(--color-primary)] text-white text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{doctor.name}</TableCell>
                        <TableCell className="text-[var(--color-text-secondary)]">
                          {doctor.crm}
                        </TableCell>
                        <TableCell className="text-[var(--color-text-secondary)]">
                          {doctor.specialty}
                        </TableCell>
                        <TableCell className="text-[var(--color-text-secondary)]">
                          {doctor.cellphone}
                        </TableCell>
                        <TableCell className="text-[var(--color-text-secondary)]">
                          {doctor.email}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={doctor.status} />
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
                                  handleView(doctor);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(doctor);
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(doctor);
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
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredDoctors.length)} de{' '}
                  {filteredDoctors.length} registros
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
      <DoctorForm open={formOpen} onOpenChange={setFormOpen} doctor={selectedDoctor} />
      <DoctorCard open={cardOpen} onOpenChange={setCardOpen} doctor={selectedDoctor} />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Médico"
        description={`Tem certeza que deseja excluir ${selectedDoctor?.name}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={confirmDelete}
        isDestructive
      />
    </div>
  );
}

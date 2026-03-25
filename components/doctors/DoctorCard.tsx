'use client';

import { Mail, Phone, Smartphone, Calendar, Stethoscope, Pencil, User, Building } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { Doctor } from '@/types';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { DoctorForm } from './DoctorForm';

interface DoctorCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor | null;
}

const RACE_LABELS: Record<string, string> = {
  branca: 'Branca',
  preta: 'Preta',
  parda: 'Parda',
  amarela: 'Amarela',
  indigena: 'Indígena',
};

const GENDER_LABELS: Record<string, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  outro: 'Outro',
};

const MARITAL_STATUS_LABELS: Record<string, string> = {
  solteiro: 'Solteiro(a)',
  casado: 'Casado(a)',
  divorciado: 'Divorciado(a)',
  viuvo: 'Viúvo(a)',
  uniao_estavel: 'União estável',
};

export function DoctorCard({ open, onOpenChange, doctor }: DoctorCardProps) {
  const [editOpen, setEditOpen] = useState(false);

  if (!doctor) return null;

  const initials = doctor.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatShortDate = (dateString: string | undefined) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return null;
    try {
      return differenceInYears(new Date(), new Date(birthDate));
    } catch {
      return null;
    }
  };

  const handleEdit = () => {
    onOpenChange(false);
    setTimeout(() => setEditOpen(true), 200);
  };

  const age = calculateAge(doctor.birthDate);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="text-left">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={doctor.photo} alt={doctor.name} />
                <AvatarFallback className="bg-[var(--color-primary)] text-white text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <SheetTitle className="text-xl">{doctor.name}</SheetTitle>
                <SheetDescription className="flex items-center gap-2 mt-1">
                  <Stethoscope className="h-4 w-4" />
                  {doctor.specialty}
                </SheetDescription>
                <div className="mt-2">
                  <StatusBadge status={doctor.status} />
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-8 space-y-6">
            {/* Personal Info */}
            <div className="rounded-lg border bg-[var(--color-surface-alt)] p-4">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados Pessoais
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--color-text-muted)]">CPF</span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {doctor.cpf}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--color-text-muted)]">Sexo</span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {GENDER_LABELS[doctor.gender] || doctor.gender}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--color-text-muted)]">Data de nascimento</span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {formatShortDate(doctor.birthDate)} {age !== null && `(${age} anos)`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--color-text-muted)]">Raça/Cor</span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {RACE_LABELS[doctor.race] || doctor.race}
                  </span>
                </div>
                {doctor.maritalStatus && (
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">Estado civil</span>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {MARITAL_STATUS_LABELS[doctor.maritalStatus] || doctor.maritalStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Info */}
            <div className="rounded-lg border bg-[var(--color-surface-alt)] p-4">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Dados Profissionais
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--color-text-muted)]">CRM</span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    CRM/{doctor.ufCrm || 'SE'} {doctor.crm}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--color-text-muted)]">Especialidade</span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {doctor.specialty}
                  </span>
                </div>
                {doctor.clinic && (
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--color-text-muted)]">Clínica/UBS</span>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {doctor.clinic}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contato
              </h3>
              
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-light)]">
                  <Mail className="h-4 w-4 text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">E-mail</p>
                  <a
                    href={`mailto:${doctor.email}`}
                    className="font-medium text-[var(--color-primary)] hover:underline"
                  >
                    {doctor.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-light)]">
                  <Smartphone className="h-4 w-4 text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">Celular</p>
                  <a
                    href={`tel:${doctor.cellphone.replace(/\D/g, '')}`}
                    className="font-medium text-[var(--color-text-primary)]"
                  >
                    {doctor.cellphone}
                  </a>
                </div>
              </div>

              {doctor.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-light)]">
                    <Phone className="h-4 w-4 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <p className="text-[var(--color-text-muted)]">Telefone fixo</p>
                    <a
                      href={`tel:${doctor.phone.replace(/\D/g, '')}`}
                      className="font-medium text-[var(--color-text-primary)]"
                    >
                      {doctor.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Calendar className="h-4 w-4" />
                <span>Cadastrado em: {formatDate(doctor.createdAt)}</span>
              </div>
              {doctor.updatedAt && (
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <Calendar className="h-4 w-4" />
                  <span>Última atualização: {formatDate(doctor.updatedAt)}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
              <Button
                className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
                onClick={handleEdit}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <DoctorForm open={editOpen} onOpenChange={setEditOpen} doctor={doctor} />
    </>
  );
}

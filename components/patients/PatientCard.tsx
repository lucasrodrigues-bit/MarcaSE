'use client';

import { User, Mail, Phone, MapPin, Calendar, FileText, Heart, Star } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { Patient } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | undefined;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-surface-alt)]">
        {icon}
      </div>
      <div>
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{value}</p>
      </div>
    </div>
  );
}



export function PatientCard({ open, onOpenChange, patient }: PatientCardProps) {
  if (!patient) return null;

  const initials = patient.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatShortDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const genderLabel = {
    masculino: 'Masculino',
    feminino: 'Feminino',
    outro: 'Outro',
  }[patient.gender];

  const fullAddress = [
    patient.street,
    patient.number && `nº ${patient.number}`,
    patient.complement,
    patient.neighborhood,
    patient.city,
    patient.state,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={patient.photo} alt={patient.name} />
              <AvatarFallback className="bg-[var(--color-primary)] text-white text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-left text-lg">{patient.name}</SheetTitle>
                {patient.isVip && (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                    <Star className="mr-1 h-3 w-3" /> VIP
                  </Badge>
                )}
              </div>
              {patient.socialName && (
                <p className="text-sm text-[var(--color-text-muted)]">{patient.socialName}</p>
              )}
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                  SUS: {patient.sus}
                </span>
                <StatusBadge status={patient.status} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Health Info */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
              Informações de Saúde
            </h4>
            <div className="space-y-3">
              <InfoRow
                icon={<Heart className="h-4 w-4 text-[var(--color-text-muted)]" />}
                label="Cartão SUS"
                value={patient.sus}
              />
              {patient.healthPlan && (
                <InfoRow
                  icon={<Heart className="h-4 w-4 text-[var(--color-text-muted)]" />}
                  label="Convênio"
                  value={patient.healthPlan}
                />
              )}
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Contato</h4>
            <div className="space-y-3">
              <InfoRow
                icon={<Phone className="h-4 w-4 text-[var(--color-text-muted)]" />}
                label="Celular"
                value={patient.cellphone}
              />
              {patient.email && (
                <InfoRow
                  icon={<Mail className="h-4 w-4 text-[var(--color-text-muted)]" />}
                  label="E-mail"
                  value={patient.email}
                />
              )}
              {patient.phone1 && (
                <InfoRow
                  icon={<Phone className="h-4 w-4 text-[var(--color-text-muted)]" />}
                  label="Telefone 1"
                  value={patient.phone1}
                />
              )}
            </div>
          </div>

          <Separator />

          {/* Address */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Endereço</h4>
            <div className="space-y-3">
              <InfoRow
                icon={<MapPin className="h-4 w-4 text-[var(--color-text-muted)]" />}
                label="Endereço completo"
                value={fullAddress || `${patient.neighborhood}, ${patient.city}`}
              />
              {patient.reference && (
                <InfoRow
                  icon={<MapPin className="h-4 w-4 text-[var(--color-text-muted)]" />}
                  label="Ponto de referência"
                  value={patient.reference}
                />
              )}
            </div>
          </div>

          <Separator />

          {/* Personal Info */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
              Dados Pessoais
            </h4>
            <div className="space-y-3">
              <InfoRow
                icon={<User className="h-4 w-4 text-[var(--color-text-muted)]" />}
                label="CPF"
                value={patient.cpf}
              />
              {patient.rg && (
                <InfoRow
                  icon={<FileText className="h-4 w-4 text-[var(--color-text-muted)]" />}
                  label="RG"
                  value={patient.rg}
                />
              )}
              <InfoRow
                icon={<User className="h-4 w-4 text-[var(--color-text-muted)]" />}
                label="Sexo"
                value={genderLabel}
              />
              <InfoRow
                icon={<Calendar className="h-4 w-4 text-[var(--color-text-muted)]" />}
                label="Data de Nascimento"
                value={formatDate(patient.birthDate)}
              />
              {patient.profession && (
                <InfoRow
                  icon={<User className="h-4 w-4 text-[var(--color-text-muted)]" />}
                  label="Profissão"
                  value={patient.profession}
                />
              )}
            </div>
          </div>

          <Separator />

          {/* Audit Info */}
          <div className="text-xs text-[var(--color-text-muted)]">
            <p>Cadastrado em: {formatDate(patient.createdAt)}</p>
            {patient.updatedAt && <p>Atualizado em: {formatDate(patient.updatedAt)}</p>}
            {patient.lastAppointment && (
              <p>Último atendimento: {formatShortDate(patient.lastAppointment)}</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

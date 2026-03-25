'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormModal } from '@/components/common/FormModal';
import { FormSection } from '@/components/common/FormSection';
import { useData } from '@/context/DataContext';
import { doctorSchema, type DoctorFormData } from '@/schemas';
import type { Doctor } from '@/types';
import { toast } from 'sonner';
import { User, Briefcase, Phone } from 'lucide-react';

interface DoctorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor | null;
}

const SPECIALTIES = [
  'Cardiologia',
  'Clínica Geral',
  'Dermatologia',
  'Ginecologia',
  'Neurologia',
  'Oftalmologia',
  'Oncologia',
  'Ortopedia',
  'Pediatria',
  'Psiquiatria',
  'Urologia',
  'Outro',
];

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const RACE_OPTIONS = [
  { value: 'branca', label: 'Branca' },
  { value: 'preta', label: 'Preta' },
  { value: 'parda', label: 'Parda' },
  { value: 'amarela', label: 'Amarela' },
  { value: 'indigena', label: 'Indígena' },
];

const MARITAL_STATUS_OPTIONS = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
  { value: 'uniao_estavel', label: 'União estável' },
];

// Input mask functions
function maskCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

function maskPhone(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
}

function maskLandline(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
}

export function DoctorForm({ open, onOpenChange, doctor }: DoctorFormProps) {
  const { addDoctor, updateDoctor, checkDuplicateCRM } = useData();
  const isEditing = !!doctor;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      cpf: '',
      gender: 'masculino',
      birthDate: '',
      race: 'branca',
      maritalStatus: undefined,
      crm: '',
      ufCrm: 'SE',
      specialty: '',
      clinic: '',
      email: '',
      cellphone: '',
      phone: '',
      status: 'ativo',
    },
  });

  const status = watch('status');
  const specialty = watch('specialty');
  const ufCrm = watch('ufCrm');
  const gender = watch('gender');
  const race = watch('race');
  const maritalStatus = watch('maritalStatus');

  useEffect(() => {
    if (open) {
      if (doctor) {
        reset({
          name: doctor.name,
          cpf: doctor.cpf,
          gender: doctor.gender,
          birthDate: doctor.birthDate,
          race: doctor.race,
          maritalStatus: doctor.maritalStatus,
          crm: doctor.crm,
          ufCrm: doctor.ufCrm || 'SE',
          specialty: doctor.specialty,
          clinic: doctor.clinic || '',
          email: doctor.email,
          cellphone: doctor.cellphone,
          phone: doctor.phone || '',
          status: doctor.status,
        });
      } else {
        reset({
          name: '',
          cpf: '',
          gender: 'masculino',
          birthDate: '',
          race: 'branca',
          maritalStatus: undefined,
          crm: '',
          ufCrm: 'SE',
          specialty: '',
          clinic: '',
          email: '',
          cellphone: '',
          phone: '',
          status: 'ativo',
        });
      }
    }
  }, [open, doctor, reset]);

  const onSubmit = handleSubmit(async (data: DoctorFormData) => {
    // Check for duplicate CRM
    const crmFull = `${data.crm}/${data.ufCrm}`;
    const isDuplicateCRM = checkDuplicateCRM(crmFull, doctor?.id);
    if (isDuplicateCRM) {
      toast.error('Já existe um médico cadastrado com este CRM');
      return;
    }

    try {
      if (isEditing && doctor) {
        updateDoctor({
          ...doctor,
          ...data,
        });
        toast.success('Médico atualizado com sucesso');
      } else {
        addDoctor(data);
        toast.success('Médico cadastrado com sucesso');
      }
      onOpenChange(false);
    } catch {
      toast.error('Erro ao salvar médico');
    }
  });

  return (
    <FormModal
      title={isEditing ? 'Editar Médico' : 'Novo Médico'}
      description={
        isEditing
          ? 'Atualize as informações do médico.'
          : 'Preencha os dados para cadastrar um novo médico.'
      }
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      isLoading={isSubmitting}
      submitLabel={isEditing ? 'Salvar alterações' : 'Cadastrar médico'}
    >
      <div className="space-y-4">
        {/* Dados Pessoais */}
        <FormSection title="Dados Pessoais" icon={<User className="h-4 w-4" />} defaultOpen={true}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Dr. João da Silva"
                className={errors.name ? 'border-[var(--color-error)]' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                {...register('cpf')}
                placeholder="000.000.000-00"
                onChange={(e) => setValue('cpf', maskCPF(e.target.value), { shouldValidate: true })}
                className={errors.cpf ? 'border-[var(--color-error)]' : ''}
              />
              {errors.cpf && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{errors.cpf.message}</p>
              )}
            </div>

            <div>
              <Label>Sexo *</Label>
              <RadioGroup
                value={gender}
                onValueChange={(value) => setValue('gender', value as 'masculino' | 'feminino' | 'outro', { shouldValidate: true })}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="masculino" id="gender-m" />
                  <Label htmlFor="gender-m" className="cursor-pointer font-normal">Masculino</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="feminino" id="gender-f" />
                  <Label htmlFor="gender-f" className="cursor-pointer font-normal">Feminino</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="outro" id="gender-o" />
                  <Label htmlFor="gender-o" className="cursor-pointer font-normal">Outro</Label>
                </div>
              </RadioGroup>
              {errors.gender && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{errors.gender.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="birthDate">Data de nascimento *</Label>
              <Input
                id="birthDate"
                type="date"
                {...register('birthDate')}
                max={new Date().toISOString().split('T')[0]}
                className={errors.birthDate ? 'border-[var(--color-error)]' : ''}
              />
              {errors.birthDate && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{errors.birthDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="race">Raça/Cor *</Label>
              <Select
                value={race}
                onValueChange={(value) => setValue('race', value as DoctorFormData['race'], { shouldValidate: true })}
              >
                <SelectTrigger className={errors.race ? 'border-[var(--color-error)]' : ''}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {RACE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.race && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{errors.race.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="maritalStatus">Estado civil</Label>
              <Select
                value={maritalStatus || ''}
                onValueChange={(value) => setValue('maritalStatus', value as DoctorFormData['maritalStatus'], { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {MARITAL_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormSection>

        {/* Dados Profissionais */}
        <FormSection title="Dados Profissionais" icon={<Briefcase className="h-4 w-4" />} defaultOpen={true}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="crm">CRM *</Label>
                <Input
                  id="crm"
                  {...register('crm')}
                  placeholder="12345"
                  className={errors.crm ? 'border-[var(--color-error)]' : ''}
                />
                {errors.crm && (
                  <p className="mt-1 text-xs text-[var(--color-error)]">{errors.crm.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="ufCrm">UF do CRM *</Label>
                <Select
                  value={ufCrm}
                  onValueChange={(value) => setValue('ufCrm', value, { shouldValidate: true })}
                >
                  <SelectTrigger className={errors.ufCrm ? 'border-[var(--color-error)]' : ''}>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {UF_OPTIONS.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ufCrm && (
                  <p className="mt-1 text-xs text-[var(--color-error)]">{errors.ufCrm.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="specialty">Especialidade *</Label>
              <Select
                value={specialty}
                onValueChange={(value) => setValue('specialty', value, { shouldValidate: true })}
              >
                <SelectTrigger className={errors.specialty ? 'border-[var(--color-error)]' : ''}>
                  <SelectValue placeholder="Selecione uma especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.specialty && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{errors.specialty.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="clinic">Clínica / UBS vinculada *</Label>
              <Input
                id="clinic"
                {...register('clinic')}
                placeholder="Nome da clínica ou UBS"
                className={errors.clinic ? 'border-[var(--color-error)]' : ''}
              />
              {errors.clinic && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{errors.clinic.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="status">Médico ativo</Label>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Médicos inativos não aparecem para agendamentos
                </p>
              </div>
              <Switch
                id="status"
                checked={status === 'ativo'}
                onCheckedChange={(checked) =>
                  setValue('status', checked ? 'ativo' : 'inativo', { shouldValidate: true })
                }
              />
            </div>
          </div>
        </FormSection>

        {/* Contato */}
        <FormSection title="Contato" icon={<Phone className="h-4 w-4" />} defaultOpen={true}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="medico@email.com"
                className={errors.email ? 'border-[var(--color-error)]' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cellphone">Celular *</Label>
              <Input
                id="cellphone"
                {...register('cellphone')}
                placeholder="(79) 99999-9999"
                onChange={(e) => setValue('cellphone', maskPhone(e.target.value), { shouldValidate: true })}
                maxLength={15}
                className={errors.cellphone ? 'border-[var(--color-error)]' : ''}
              />
              {errors.cellphone && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{errors.cellphone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Telefone fixo</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="(79) 3211-1234"
                onChange={(e) => setValue('phone', maskLandline(e.target.value))}
                maxLength={14}
              />
            </div>
          </div>
        </FormSection>
      </div>
    </FormModal>
  );
}

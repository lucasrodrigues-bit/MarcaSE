'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Heart, Phone, MapPin, FileText, Users, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormModal } from '@/components/common/FormModal';
import { FormSection } from '@/components/common/FormSection';
import { patientSchema, type PatientFormData } from '@/schemas';
import { useData } from '@/context/DataContext';
import type { Patient, Attachment } from '@/types';
import { toast } from 'sonner';

interface PatientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
}

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

const OTHER_DOC_OPTIONS = [
  { value: 'cnh', label: 'CNH' },
  { value: 'passaporte', label: 'Passaporte' },
  { value: 'certidao', label: 'Certidão' },
  { value: 'outro', label: 'Outro' },
];

const NATIONALITY_OPTIONS = [
  'Brasileira',
  'Estrangeira',
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

function maskCEP(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
}

function maskSUS(value: string): string {
  return value.replace(/\D/g, '').slice(0, 15);
}

export function PatientForm({ open, onOpenChange, patient }: PatientFormProps) {
  const { addPatient, updatePatient, checkDuplicateCPF } = useData();
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      status: 'ativo',
      gender: 'masculino',
      city: 'Aracaju',
      state: 'SE',
      isVip: false,
      isNewborn: false,
    },
  });

  const gender = watch('gender');
  const race = watch('race');
  const maritalStatus = watch('maritalStatus');
  const otherDocType = watch('otherDocType');
  const isVip = watch('isVip');
  const isNewborn = watch('isNewborn');
  const status = watch('status');
  const nationality = watch('nationality');

  useEffect(() => {
    if (open) {
      if (patient) {
        reset({
          name: patient.name,
          socialName: patient.socialName || '',
          cpf: patient.cpf,
          rg: patient.rg || '',
          otherDocType: patient.otherDocType,
          otherDocNumber: patient.otherDocNumber || '',
          gender: patient.gender,
          birthDate: patient.birthDate,
          ethnicity: patient.ethnicity || '',
          race: patient.race,
          nationality: patient.nationality || '',
          naturalness: patient.naturalness || '',
          profession: patient.profession || '',
          maritalStatus: patient.maritalStatus,
          motherName: patient.motherName || '',
          motherProfession: patient.motherProfession || '',
          fatherName: patient.fatherName || '',
          fatherProfession: patient.fatherProfession || '',
          guardianName: patient.guardianName || '',
          guardianCpf: patient.guardianCpf || '',
          spouseName: patient.spouseName || '',
          isNewborn: patient.isNewborn || false,
          sus: patient.sus,
          healthPlan: patient.healthPlan || '',
          isVip: patient.isVip || false,
          legacyCode: patient.legacyCode || '',
          email: patient.email || '',
          cellphone: patient.cellphone,
          phone1: patient.phone1 || '',
          phone2: patient.phone2 || '',
          zipCode: patient.zipCode || '',
          street: patient.street || '',
          number: patient.number || '',
          complement: patient.complement || '',
          neighborhood: patient.neighborhood,
          city: patient.city,
          state: patient.state || '',
          reference: patient.reference || '',
          notes: patient.notes || '',
          status: patient.status,
        });
        setAttachments(patient.attachments || []);
      } else {
        reset({
          status: 'ativo',
          gender: 'masculino',
          city: 'Aracaju',
          state: 'SE',
          isVip: false,
          isNewborn: false,
          name: '',
          cpf: '',
          sus: '',
          cellphone: '',
          neighborhood: '',
          birthDate: '',
        });
        setAttachments([]);
      }
    }
  }, [open, patient, reset]);

  const onSubmitForm = handleSubmit(async (data: PatientFormData) => {
    // Check for duplicate CPF
    if (checkDuplicateCPF(data.cpf, patient?.id)) {
      toast.error('Já existe um paciente com este CPF cadastrado');
      return;
    }

    try {
      if (patient) {
        updatePatient({
          ...patient,
          ...data,
          attachments,
        });
        toast.success('Paciente atualizado com sucesso!');
      } else {
        addPatient({
          ...data,
          attachments,
        });
        toast.success('Paciente cadastrado com sucesso!');
      }
      onOpenChange(false);
    } catch {
      toast.error('Erro ao salvar paciente');
    }
  });

  const handleCEPChange = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    setValue('zipCode', maskCEP(cep));

    if (cleanCEP.length === 8) {
      setIsLoadingCEP(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setValue('street', data.logradouro || '');
          setValue('neighborhood', data.bairro || '', { shouldValidate: true });
          setValue('city', data.localidade || '', { shouldValidate: true });
          setValue('state', data.uf || '');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setIsLoadingCEP(false);
      }
    }
  };

  const handleAddAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const newAttachment: Attachment = {
          id: crypto.randomUUID(),
          name: file.name,
          url: URL.createObjectURL(file),
          createdAt: new Date().toISOString(),
        };
        setAttachments((prev) => [...prev, newAttachment]);
      }
    };
    input.click();
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <FormModal
      title={patient ? 'Editar Paciente' : 'Novo Paciente'}
      description={
        patient
          ? 'Atualize as informações do paciente.'
          : 'Preencha os dados para cadastrar um novo paciente.'
      }
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmitForm}
      isLoading={isSubmitting}
      submitLabel={patient ? 'Salvar alterações' : 'Cadastrar paciente'}
    >
      <div className="space-y-4">
        {/* Dados Pessoais */}
        <FormSection title="Dados Pessoais" icon={<User className="h-4 w-4" />} defaultOpen={true}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nome completo do paciente"
                className={errors.name ? 'border-[var(--color-error)]' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="socialName">Nome social</Label>
              <Input id="socialName" {...register('socialName')} placeholder="Nome social" />
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
              <Label htmlFor="rg">RG</Label>
              <Input id="rg" {...register('rg')} placeholder="RG" />
            </div>

            <div>
              <Label htmlFor="otherDocType">Outros documentos</Label>
              <Select
                value={otherDocType || ''}
                onValueChange={(value) => setValue('otherDocType', value as PatientFormData['otherDocType'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {OTHER_DOC_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {otherDocType && (
              <div>
                <Label htmlFor="otherDocNumber">Número do documento</Label>
                <Input id="otherDocNumber" {...register('otherDocNumber')} placeholder="Número" />
              </div>
            )}

            <div className="sm:col-span-2">
              <Label>Sexo *</Label>
              <RadioGroup
                value={gender}
                onValueChange={(value) => setValue('gender', value as 'masculino' | 'feminino' | 'outro', { shouldValidate: true })}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="masculino" id="p-gender-m" />
                  <Label htmlFor="p-gender-m" className="cursor-pointer font-normal">Masculino</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="feminino" id="p-gender-f" />
                  <Label htmlFor="p-gender-f" className="cursor-pointer font-normal">Feminino</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="outro" id="p-gender-o" />
                  <Label htmlFor="p-gender-o" className="cursor-pointer font-normal">Outro</Label>
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
              <Label htmlFor="race">Raça/Cor</Label>
              <Select
                value={race || ''}
                onValueChange={(value) => setValue('race', value as PatientFormData['race'])}
              >
                <SelectTrigger>
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
            </div>

            <div>
              <Label htmlFor="naturalness">Naturalidade</Label>
              <Input id="naturalness" {...register('naturalness')} placeholder="Cidade de nascimento" />
            </div>

            <div>
              <Label htmlFor="nationality">Nacionalidade</Label>
              <Select
                value={nationality || ''}
                onValueChange={(value) => setValue('nationality', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {NATIONALITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="profession">Profissão</Label>
              <Input id="profession" {...register('profession')} placeholder="Profissão" />
            </div>

            <div>
              <Label htmlFor="maritalStatus">Estado civil</Label>
              <Select
                value={maritalStatus || ''}
                onValueChange={(value) => setValue('maritalStatus', value as PatientFormData['maritalStatus'])}
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

        {/* Família */}
        <FormSection title="Família" icon={<Users className="h-4 w-4" />} defaultOpen={false}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="motherName">Nome da mãe</Label>
              <Input id="motherName" {...register('motherName')} placeholder="Nome da mãe" />
            </div>
            <div>
              <Label htmlFor="motherProfession">Profissão da mãe</Label>
              <Input id="motherProfession" {...register('motherProfession')} placeholder="Profissão" />
            </div>
            <div>
              <Label htmlFor="fatherName">Nome do pai</Label>
              <Input id="fatherName" {...register('fatherName')} placeholder="Nome do pai" />
            </div>
            <div>
              <Label htmlFor="fatherProfession">Profissão do pai</Label>
              <Input id="fatherProfession" {...register('fatherProfession')} placeholder="Profissão" />
            </div>
            <div>
              <Label htmlFor="guardianName">Nome do responsável</Label>
              <Input id="guardianName" {...register('guardianName')} placeholder="Nome do responsável" />
            </div>
            <div>
              <Label htmlFor="guardianCpf">CPF do responsável</Label>
              <Input
                id="guardianCpf"
                {...register('guardianCpf')}
                placeholder="000.000.000-00"
                onChange={(e) => setValue('guardianCpf', maskCPF(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="spouseName">Nome do(a) cônjuge</Label>
              <Input id="spouseName" {...register('spouseName')} placeholder="Nome do cônjuge" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="isNewborn"
                checked={isNewborn}
                onCheckedChange={(checked) => setValue('isNewborn', checked)}
              />
              <Label htmlFor="isNewborn" className="cursor-pointer">
                RN na guia do convênio
              </Label>
            </div>
          </div>
        </FormSection>

        {/* Dados de Saúde */}
        <FormSection title="Dados de Saúde" icon={<Heart className="h-4 w-4" />} defaultOpen={true}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sus">Número do Cartão SUS *</Label>
              <Input
                id="sus"
                {...register('sus')}
                placeholder="000000000000000"
                onChange={(e) => setValue('sus', maskSUS(e.target.value), { shouldValidate: true })}
                className={errors.sus ? 'border-[var(--color-error)]' : ''}
              />
              {errors.sus && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{errors.sus.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="healthPlan">Plano de saúde / Convênio</Label>
              <Input id="healthPlan" {...register('healthPlan')} placeholder="Nome do convênio" />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isVip"
                checked={isVip}
                onCheckedChange={(checked) => setValue('isVip', checked)}
              />
              <Label htmlFor="isVip" className="cursor-pointer">
                Paciente VIP
              </Label>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="status">Paciente ativo</Label>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Pacientes inativos não aparecem para agendamentos
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cellphone">Celular *</Label>
              <Input
                id="cellphone"
                {...register('cellphone')}
                placeholder="(00) 00000-0000"
                onChange={(e) => setValue('cellphone', maskPhone(e.target.value), { shouldValidate: true })}
                className={errors.cellphone ? 'border-[var(--color-error)]' : ''}
              />
              {errors.cellphone && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{errors.cellphone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="phone1">Telefone 1</Label>
              <Input
                id="phone1"
                {...register('phone1')}
                placeholder="(00) 00000-0000"
                onChange={(e) => setValue('phone1', maskPhone(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="phone2">Telefone 2</Label>
              <Input
                id="phone2"
                {...register('phone2')}
                placeholder="(00) 00000-0000"
                onChange={(e) => setValue('phone2', maskPhone(e.target.value))}
              />
            </div>
          </div>
        </FormSection>

        {/* Endereço */}
        <FormSection title="Endereço" icon={<MapPin className="h-4 w-4" />} defaultOpen={false}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                value={watch('zipCode') || ''}
                onChange={(e) => handleCEPChange(e.target.value)}
                placeholder="00000-000"
                disabled={isLoadingCEP}
              />
              {isLoadingCEP && (
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Buscando CEP...</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="street">Logradouro</Label>
              <Input id="street" {...register('street')} placeholder="Rua, Avenida, etc." />
            </div>

            <div>
              <Label htmlFor="number">Número</Label>
              <Input id="number" {...register('number')} placeholder="Número" />
            </div>

            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" {...register('complement')} placeholder="Apt, Bloco, etc." />
            </div>

            <div>
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                {...register('neighborhood')}
                placeholder="Bairro"
                className={errors.neighborhood ? 'border-[var(--color-error)]' : ''}
              />
              {errors.neighborhood && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{errors.neighborhood.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Cidade"
                className={errors.city ? 'border-[var(--color-error)]' : ''}
              />
              {errors.city && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{errors.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">Estado</Label>
              <Input id="state" {...register('state')} placeholder="UF" />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <Label htmlFor="reference">Ponto de referência</Label>
              <Input id="reference" {...register('reference')} placeholder="Próximo a..." />
            </div>
          </div>
        </FormSection>

        {/* Observações */}
        <FormSection title="Observações" icon={<FileText className="h-4 w-4" />} defaultOpen={false}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Observações adicionais (alergias, medicações, etc.)"
                rows={4}
              />
            </div>

            <div>
              <Label>Anexos</Label>
              <div className="mt-2 space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <span className="text-sm truncate flex-1">{attachment.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[var(--color-error)]"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAttachment}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar anexo
                </Button>
              </div>
            </div>
          </div>
        </FormSection>
      </div>
    </FormModal>
  );
}

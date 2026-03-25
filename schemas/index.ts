import { z } from 'zod';

// CPF validation function
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleaned[10]);
}

// Doctor Schema - Full version with all required fields
export const doctorSchema = z.object({
  photo: z.string().optional(),
  // Personal data
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().min(11, 'CPF inválido').refine((val) => isValidCPF(val), {
    message: 'CPF inválido',
  }),
  gender: z.enum(['masculino', 'feminino', 'outro'], {
    required_error: 'Selecione o sexo',
  }),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  race: z.enum(['branca', 'preta', 'parda', 'amarela', 'indigena'], {
    required_error: 'Selecione a raça/cor',
  }),
  maritalStatus: z.enum(['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel']).optional(),
  // Professional data
  crm: z.string().min(4, 'CRM deve ter no mínimo 4 dígitos'),
  ufCrm: z.string().min(2, 'UF é obrigatória'),
  specialty: z.string().min(1, 'Especialidade é obrigatória'),
  clinic: z.string().min(1, 'Clínica/UBS é obrigatória'),
  // Contact
  email: z.string().email('E-mail inválido'),
  cellphone: z.string().min(10, 'Celular inválido'),
  phone: z.string().optional(),
  status: z.enum(['ativo', 'inativo']),
});

export type DoctorFormData = z.infer<typeof doctorSchema>;

// Patient Schema
export const patientSchema = z.object({
  photo: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  socialName: z.string().optional(),
  cpf: z.string().min(11, 'CPF inválido').refine((val) => isValidCPF(val), {
    message: 'CPF inválido',
  }),
  rg: z.string().optional(),
  otherDocType: z.enum(['cnh', 'passaporte', 'certidao', 'outro']).optional(),
  otherDocNumber: z.string().optional(),
  gender: z.enum(['masculino', 'feminino', 'outro'], {
    required_error: 'Selecione o sexo',
  }),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  ethnicity: z.string().optional(),
  race: z.enum(['branca', 'preta', 'parda', 'amarela', 'indigena']).optional(),
  nationality: z.string().optional(),
  naturalness: z.string().optional(),
  profession: z.string().optional(),
  maritalStatus: z.enum(['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel']).optional(),
  motherName: z.string().optional(),
  motherProfession: z.string().optional(),
  fatherName: z.string().optional(),
  fatherProfession: z.string().optional(),
  guardianName: z.string().optional(),
  guardianCpf: z.string().optional(),
  spouseName: z.string().optional(),
  isNewborn: z.boolean().optional(),
  sus: z.string().length(15, 'Cartão SUS deve ter 15 dígitos'),
  healthPlan: z.string().optional(),
  isVip: z.boolean().optional(),
  legacyCode: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  cellphone: z.string().min(10, 'Celular inválido'),
  phone1: z.string().optional(),
  phone2: z.string().optional(),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['ativo', 'inativo']),
});

export type PatientFormData = z.infer<typeof patientSchema>;

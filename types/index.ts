// Doctor Types
export interface Doctor {
  id: string;
  photo?: string;
  name: string;
  cpf: string;
  gender: 'masculino' | 'feminino' | 'outro';
  birthDate: string;
  race: 'branca' | 'preta' | 'parda' | 'amarela' | 'indigena';
  maritalStatus?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
  crm: string;
  ufCrm: string;
  specialty: string;
  clinic: string;
  email: string;
  cellphone: string;
  phone?: string;
  status: 'ativo' | 'inativo';
  createdAt: string;
  updatedAt?: string;
}

// Patient Types
export interface Patient {
  id: string;
  photo?: string;
  name: string;
  socialName?: string;
  cpf: string;
  rg?: string;
  otherDocType?: 'cnh' | 'passaporte' | 'certidao' | 'outro';
  otherDocNumber?: string;
  gender: 'masculino' | 'feminino' | 'outro';
  birthDate: string;
  ethnicity?: string;
  race?: 'branca' | 'preta' | 'parda' | 'amarela' | 'indigena';
  nationality?: string;
  naturalness?: string;
  profession?: string;
  maritalStatus?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
  motherName?: string;
  motherProfession?: string;
  fatherName?: string;
  fatherProfession?: string;
  guardianName?: string;
  guardianCpf?: string;
  spouseName?: string;
  isNewborn?: boolean;
  sus: string;
  healthPlan?: string;
  isVip?: boolean;
  legacyCode?: string;
  email?: string;
  cellphone: string;
  phone1?: string;
  phone2?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state?: string;
  reference?: string;
  notes?: string;
  attachments?: Attachment[];
  status: 'ativo' | 'inativo';
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  lastAppointment?: string;
  nextAppointment?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  createdAt: string;
}

// Action types for reducers
export type DoctorAction =
  | { type: 'ADD_DOCTOR'; payload: Doctor }
  | { type: 'UPDATE_DOCTOR'; payload: Doctor }
  | { type: 'DELETE_DOCTOR'; payload: string }
  | { type: 'SET_DOCTORS'; payload: Doctor[] };

export type PatientAction =
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: Patient }
  | { type: 'DELETE_PATIENT'; payload: string }
  | { type: 'SET_PATIENTS'; payload: Patient[] };

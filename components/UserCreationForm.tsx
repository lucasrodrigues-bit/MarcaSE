"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import { usersService } from "@/services/usersApi.mjs";
import { isValidCPF } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AllowedRole =
  | "paciente"
  | "medico"
  | "secretaria"
  | "gestor"
  | "admin";

interface FormData {
  // comum a todos
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  cpf: string;
  role: AllowedRole | "";
  // staff (admin/gestor/secretaria)
  phone: string;
  phone_mobile: string;
  // médico
  crm: string;
  crm_uf: string;
  specialty: string;
  // paciente + médico
  birth_date: string;
  // paciente – dados pessoais
  social_name: string;
  rg: string;
  document_type: string;
  document_number: string;
  sex: string;
  race: string;
  ethnicity: string;
  nationality: string;
  naturality: string;
  profession: string;
  marital_status: string;
  // paciente – família
  mother_name: string;
  mother_profession: string;
  father_name: string;
  father_profession: string;
  guardian_name: string;
  guardian_cpf: string;
  spouse_name: string;
  // paciente – contato extra
  phone1: string;
  phone2: string;
  // paciente – endereço
  cep: string;
  street: string;
  address_number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  reference: string;
  // paciente – saúde
  blood_type: string;
  weight_kg: string;
  height_m: string;
  bmi: string;
  legacy_code: string;
  rn_in_insurance: boolean;
  vip: boolean;
  notes: string;
}

const EMPTY_FORM: FormData = {
  full_name: "",
  email: "",
  password: "",
  confirm_password: "",
  cpf: "",
  role: "",
  phone: "",
  phone_mobile: "",
  crm: "",
  crm_uf: "",
  specialty: "",
  birth_date: "",
  social_name: "",
  rg: "",
  document_type: "",
  document_number: "",
  sex: "",
  race: "",
  ethnicity: "",
  nationality: "",
  naturality: "",
  profession: "",
  marital_status: "",
  mother_name: "",
  mother_profession: "",
  father_name: "",
  father_profession: "",
  guardian_name: "",
  guardian_cpf: "",
  spouse_name: "",
  phone1: "",
  phone2: "",
  cep: "",
  street: "",
  address_number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  reference: "",
  blood_type: "",
  weight_kg: "",
  height_m: "",
  bmi: "",
  legacy_code: "",
  rn_in_insurance: false,
  vip: false,
  notes: "",
};

const ROLE_LABELS: Record<AllowedRole, string> = {
  paciente: "Paciente",
  medico: "Médico",
  secretaria: "Secretária",
  gestor: "Gestor",
  admin: "Administrador",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cleanDigits = (v: string) => v.replace(/\D/g, "");

const formatPhone = (v: string) => {
  const d = cleanDigits(v).substring(0, 11);
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return d;
};

const formatCPF = (v: string) => {
  const d = cleanDigits(v).substring(0, 11);
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (d.length > 6) return d.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  if (d.length > 3) return d.replace(/(\d{3})(\d+)/, "$1.$2");
  return d;
};

const formatCEP = (v: string) => {
  const d = cleanDigits(v).substring(0, 8);
  if (d.length > 5) return d.replace(/(\d{5})(\d+)/, "$1-$2");
  return d;
};

function calcBMI(weight: string, height: string): string {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  if (!w || !h || h === 0) return "";
  return (w / (h * h)).toFixed(2);
}

function parseApiError(rawError: unknown): string {
  const fallback =
    "Não foi possível criar o usuário. Verifique os dados e tente novamente.";
  const rawMessage =
    rawError instanceof Error ? rawError.message : String(rawError ?? "");
  if (!rawMessage) return fallback;

  let errorText = rawMessage;
  try {
    const m = rawMessage.match(/\{[\s\S]*\}/);
    if (m) {
      const p = JSON.parse(m[0]) as Record<string, unknown>;
      errorText = String(p.error ?? p.message ?? p.detail ?? rawMessage);
    }
  } catch {
    /* not JSON */
  }

  const lower = errorText.toLowerCase();
  if (lower.includes("doctors_cpf_key") || (lower.includes("cpf") && lower.includes("duplicate")))
    return "Já existe um médico cadastrado com este CPF.";
  if (lower.includes("doctors_crm_key") || (lower.includes("crm") && lower.includes("duplicate")))
    return "Já existe um médico cadastrado com este CRM.";
  if (lower.includes("email") && lower.includes("duplicate"))
    return "Este e-mail já está cadastrado. Use outro ou recupere a senha.";
  if (lower.includes("user already registered") || lower.includes("already been registered"))
    return "Este e-mail já possui uma conta no sistema.";
  if (lower.includes("password") && lower.includes("least"))
    return "A senha deve ter no mínimo 6 caracteres.";
  if (lower.includes("invalid email"))
    return "O e-mail informado é inválido.";
  if (lower.includes("unique constraint") || lower.includes("duplicate key"))
    return "Já existe um registro com esses dados. Verifique e tente novamente.";

  return (
    errorText
      .replace(/^erro na api:\s*/i, "")
      .replace(/^error:\s*/i, "")
      .replace(/\\/g, "")
      .trim() || fallback
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:col-span-2 pt-4 border-t first:border-t-0 first:pt-0">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {children}
      </h3>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserCreationFormProps {
  allowedRoles: AllowedRole[];
  successHref: string;
  cancelHref: string;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function UserCreationForm({
  allowedRoles,
  successHref,
  cancelHref,
}: UserCreationFormProps) {
  const [form, setForm] = useState<FormData>({
    ...EMPTY_FORM,
    role: allowedRoles.length === 1 ? allowedRoles[0] : "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (key: keyof FormData, value: string | boolean) => {
    if (typeof value === "boolean") {
      setForm((prev) => ({ ...prev, [key]: value }));
      return;
    }
    let v = value;
    if (key === "phone" || key === "phone_mobile" || key === "phone1" || key === "phone2")
      v = formatPhone(value);
    else if (key === "cpf" || key === "guardian_cpf") v = formatCPF(value);
    else if (key === "crm_uf" || key === "state") v = value.toUpperCase().substring(0, 2);
    else if (key === "cep") v = formatCEP(value);

    setForm((prev) => {
      const next = { ...prev, [key]: v };
      if (key === "weight_kg" || key === "height_m") {
        next.bmi = calcBMI(
          key === "weight_kg" ? v : prev.weight_kg,
          key === "height_m" ? v : prev.height_m
        );
      }
      return next;
    });
  };

  const isDoctor = form.role === "medico";
  const isPatient = form.role === "paciente";
  const isStaff = form.role === "admin" || form.role === "gestor" || form.role === "secretaria";

  const pageTitle =
    form.role && form.role in ROLE_LABELS
      ? `Novo ${ROLE_LABELS[form.role as AllowedRole]}`
      : "Novo Usuário";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.role) { setError("Selecione a função do usuário."); return; }
    if (!form.full_name || !form.email || !form.password || !form.confirm_password || !form.cpf) {
      setError("Preencha todos os campos obrigatórios."); return;
    }
    if (form.password !== form.confirm_password) {
      setError("A senha e a confirmação não coincidem."); return;
    }
    if (form.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres."); return;
    }
    if (!isValidCPF(cleanDigits(form.cpf))) {
      setError("CPF inválido. Verifique os dígitos."); return;
    }
    if (isDoctor && (!form.crm || !form.crm_uf)) {
      setError("Para médico, CRM e UF do CRM são obrigatórios."); return;
    }
    if (isPatient && !form.phone_mobile) {
      setError("Para paciente, o celular é obrigatório."); return;
    }

    setIsSaving(true);
    try {
      const cpfRaw = cleanDigits(form.cpf);

      const payload: Record<string, unknown> = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        full_name: form.full_name.trim(),
        cpf: cpfRaw,
        role: form.role,
      };

      if (isStaff) {
        if (form.phone) payload.phone = cleanDigits(form.phone) || null;
        if (form.phone_mobile) payload.phone_mobile = cleanDigits(form.phone_mobile) || null;
      }

      if (isDoctor) {
        payload.crm = form.crm.trim();
        payload.crm_uf = form.crm_uf;
        if (form.phone_mobile) payload.phone_mobile = cleanDigits(form.phone_mobile) || null;
        if (form.specialty) payload.specialty = form.specialty.trim();
        if (form.birth_date) payload.birth_date = form.birth_date;
      }

      if (isPatient) {
        payload.create_patient_record = true;
        payload.phone_mobile = cleanDigits(form.phone_mobile);
        if (form.social_name) payload.social_name = form.social_name.trim();
        if (form.rg) payload.rg = form.rg.trim();
        if (form.document_type) payload.document_type = form.document_type;
        if (form.document_number) payload.document_number = form.document_number.trim();
        if (form.birth_date) payload.birth_date = form.birth_date;
        if (form.phone1) payload.phone1 = cleanDigits(form.phone1);
        if (form.phone2) payload.phone2 = cleanDigits(form.phone2);
        if (form.sex) payload.sex = form.sex;
        if (form.race) payload.race = form.race;
        if (form.ethnicity) payload.ethnicity = form.ethnicity.trim();
        if (form.nationality) payload.nationality = form.nationality.trim();
        if (form.naturality) payload.naturality = form.naturality.trim();
        if (form.profession) payload.profession = form.profession.trim();
        if (form.marital_status) payload.marital_status = form.marital_status;
        if (form.mother_name) payload.mother_name = form.mother_name.trim();
        if (form.mother_profession) payload.mother_profession = form.mother_profession.trim();
        if (form.father_name) payload.father_name = form.father_name.trim();
        if (form.father_profession) payload.father_profession = form.father_profession.trim();
        if (form.guardian_name) payload.guardian_name = form.guardian_name.trim();
        if (form.guardian_cpf) payload.guardian_cpf = cleanDigits(form.guardian_cpf);
        if (form.spouse_name) payload.spouse_name = form.spouse_name.trim();
        if (form.cep) payload.cep = cleanDigits(form.cep);
        if (form.street) payload.street = form.street.trim();
        if (form.address_number) payload.number = form.address_number.trim();
        if (form.complement) payload.complement = form.complement.trim();
        if (form.neighborhood) payload.neighborhood = form.neighborhood.trim();
        if (form.city) payload.city = form.city.trim();
        if (form.state) payload.state = form.state;
        if (form.reference) payload.reference = form.reference.trim();
        if (form.blood_type) payload.blood_type = form.blood_type;
        if (form.weight_kg) payload.weight_kg = parseFloat(form.weight_kg);
        if (form.height_m) payload.height_m = parseFloat(form.height_m);
        if (form.bmi) payload.bmi = parseFloat(form.bmi);
        if (form.legacy_code) payload.legacy_code = form.legacy_code.trim();
        if (form.rn_in_insurance) payload.rn_in_insurance = form.rn_in_insurance;
        if (form.vip) payload.vip = form.vip;
        if (form.notes) payload.notes = form.notes.trim();
      }

      await usersService.create_user(payload);
      setSuccess(true);
      setTimeout(() => { window.location.href = successHref; }, 800);
    } catch (e: unknown) {
      setError(parseApiError(e));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="w-full h-full p-4 md:p-8 flex justify-center items-start">
      <div className="w-full max-w-screen-lg space-y-8">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground">
              Preencha os dados para cadastrar um novo usuário no sistema.
            </p>
          </div>
          <Link href={cancelHref}>
            <Button variant="outline">Cancelar</Button>
          </Link>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-card p-6 md:p-10 border rounded-xl shadow-lg"
        >
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive">
              <p className="font-semibold text-sm">Erro no cadastro:</p>
              <p className="text-sm break-words">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-500/10 text-green-700 rounded-lg border border-green-500">
              <p className="font-semibold text-sm">Usuário criado com sucesso! Redirecionando...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ── Seleção de role ── */}
            {allowedRoles.length > 1 && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="role">Função *</Label>
                <Select value={form.role} onValueChange={(v) => set("role", v)} required>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione a função do usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedRoles.map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                CAMPOS COMUNS A TODOS OS PERFIS
            ══════════════════════════════════════════════════════════════════ */}
            <SectionTitle>Dados de Acesso</SectionTitle>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="Nome e Sobrenome"
                maxLength={255}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="exemplo@dominio.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={form.cpf}
                onChange={(e) => set("cpf", e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirmar Senha *</Label>
              <Input
                id="confirm_password"
                type="password"
                value={form.confirm_password}
                onChange={(e) => set("confirm_password", e.target.value)}
                placeholder="Repita a senha"
                required
              />
              {form.password && form.confirm_password && form.password !== form.confirm_password && (
                <p className="text-xs text-destructive">As senhas não coincidem.</p>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                STAFF (admin / gestor / secretaria)
            ══════════════════════════════════════════════════════════════════ */}
            {isStaff && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_mobile">Celular</Label>
                  <Input
                    id="phone_mobile"
                    value={form.phone_mobile}
                    onChange={(e) => set("phone_mobile", e.target.value)}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>
              </>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                MÉDICO
            ══════════════════════════════════════════════════════════════════ */}
            {isDoctor && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="crm">CRM *</Label>
                  <Input
                    id="crm"
                    value={form.crm}
                    onChange={(e) => set("crm", e.target.value)}
                    placeholder="Ex: 123456"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crm_uf">UF do CRM *</Label>
                  <Input
                    id="crm_uf"
                    value={form.crm_uf}
                    onChange={(e) => set("crm_uf", e.target.value)}
                    placeholder="Ex: SP"
                    maxLength={2}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_mobile_doc">Celular</Label>
                  <Input
                    id="phone_mobile_doc"
                    value={form.phone_mobile}
                    onChange={(e) => set("phone_mobile", e.target.value)}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    value={form.specialty}
                    onChange={(e) => set("specialty", e.target.value)}
                    placeholder="Ex: Cardiologia"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date_doc">Data de Nascimento</Label>
                  <Input
                    id="birth_date_doc"
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => set("birth_date", e.target.value)}
                  />
                </div>
              </>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                PACIENTE
            ══════════════════════════════════════════════════════════════════ */}
            {isPatient && (
              <>
                {/* ── Dados Pessoais ── */}
                <SectionTitle>Dados Pessoais</SectionTitle>

                <div className="space-y-2">
                  <Label htmlFor="social_name">Nome Social / Apelido</Label>
                  <Input
                    id="social_name"
                    value={form.social_name}
                    onChange={(e) => set("social_name", e.target.value)}
                    placeholder="Nome social ou apelido"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={form.rg}
                    onChange={(e) => set("rg", e.target.value)}
                    placeholder="Número do RG"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document_type">Tipo de Documento</Label>
                  <Select value={form.document_type} onValueChange={(v) => set("document_type", v)}>
                    <SelectTrigger id="document_type">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CNH">CNH</SelectItem>
                      <SelectItem value="Passaporte">Passaporte</SelectItem>
                      <SelectItem value="RNE">RNE</SelectItem>
                      <SelectItem value="CTPS">CTPS</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document_number">Número do Documento</Label>
                  <Input
                    id="document_number"
                    value={form.document_number}
                    onChange={(e) => set("document_number", e.target.value)}
                    placeholder="Número do documento"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => set("birth_date", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sex">Sexo</Label>
                  <Select value={form.sex} onValueChange={(v) => set("sex", v)}>
                    <SelectTrigger id="sex">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Feminino">Feminino</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                      <SelectItem value="Não informar">Não informar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="race">Raça / Cor (IBGE)</Label>
                  <Select value={form.race} onValueChange={(v) => set("race", v)}>
                    <SelectTrigger id="race">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Branca">Branca</SelectItem>
                      <SelectItem value="Preta">Preta</SelectItem>
                      <SelectItem value="Parda">Parda</SelectItem>
                      <SelectItem value="Amarela">Amarela</SelectItem>
                      <SelectItem value="Indígena">Indígena</SelectItem>
                      <SelectItem value="Não declarada">Não declarada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ethnicity">Etnia</Label>
                  <Input
                    id="ethnicity"
                    value={form.ethnicity}
                    onChange={(e) => set("ethnicity", e.target.value)}
                    placeholder="Etnia"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nacionalidade</Label>
                  <Input
                    id="nationality"
                    value={form.nationality}
                    onChange={(e) => set("nationality", e.target.value)}
                    placeholder="Ex: Brasileira"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="naturality">Naturalidade (cidade natal)</Label>
                  <Input
                    id="naturality"
                    value={form.naturality}
                    onChange={(e) => set("naturality", e.target.value)}
                    placeholder="Cidade natal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession">Profissão</Label>
                  <Input
                    id="profession"
                    value={form.profession}
                    onChange={(e) => set("profession", e.target.value)}
                    placeholder="Profissão"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marital_status">Estado Civil</Label>
                  <Select value={form.marital_status} onValueChange={(v) => set("marital_status", v)}>
                    <SelectTrigger id="marital_status">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                      <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                      <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                      <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                      <SelectItem value="União Estável">União Estável</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* ── Contato ── */}
                <SectionTitle>Contato</SectionTitle>

                <div className="space-y-2">
                  <Label htmlFor="phone_mobile">Celular *</Label>
                  <Input
                    id="phone_mobile"
                    value={form.phone_mobile}
                    onChange={(e) => set("phone_mobile", e.target.value)}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone1">Telefone fixo 1</Label>
                  <Input
                    id="phone1"
                    value={form.phone1}
                    onChange={(e) => set("phone1", e.target.value)}
                    placeholder="(00) 0000-0000"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone2">Telefone fixo 2</Label>
                  <Input
                    id="phone2"
                    value={form.phone2}
                    onChange={(e) => set("phone2", e.target.value)}
                    placeholder="(00) 0000-0000"
                    maxLength={15}
                  />
                </div>

                {/* ── Família ── */}
                <SectionTitle>Filiação e Família</SectionTitle>

                <div className="space-y-2">
                  <Label htmlFor="mother_name">Nome da Mãe</Label>
                  <Input
                    id="mother_name"
                    value={form.mother_name}
                    onChange={(e) => set("mother_name", e.target.value)}
                    placeholder="Nome completo da mãe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mother_profession">Profissão da Mãe</Label>
                  <Input
                    id="mother_profession"
                    value={form.mother_profession}
                    onChange={(e) => set("mother_profession", e.target.value)}
                    placeholder="Profissão da mãe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="father_name">Nome do Pai</Label>
                  <Input
                    id="father_name"
                    value={form.father_name}
                    onChange={(e) => set("father_name", e.target.value)}
                    placeholder="Nome completo do pai"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="father_profession">Profissão do Pai</Label>
                  <Input
                    id="father_profession"
                    value={form.father_profession}
                    onChange={(e) => set("father_profession", e.target.value)}
                    placeholder="Profissão do pai"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spouse_name">Nome do Cônjuge</Label>
                  <Input
                    id="spouse_name"
                    value={form.spouse_name}
                    onChange={(e) => set("spouse_name", e.target.value)}
                    placeholder="Nome do cônjuge"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian_name">Nome do Responsável</Label>
                  <Input
                    id="guardian_name"
                    value={form.guardian_name}
                    onChange={(e) => set("guardian_name", e.target.value)}
                    placeholder="Para menores ou dependentes"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardian_cpf">CPF do Responsável</Label>
                  <Input
                    id="guardian_cpf"
                    value={form.guardian_cpf}
                    onChange={(e) => set("guardian_cpf", e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>

                {/* ── Endereço ── */}
                <SectionTitle>Endereço</SectionTitle>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={form.cep}
                    onChange={(e) => set("cep", e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Logradouro</Label>
                  <Input
                    id="street"
                    value={form.street}
                    onChange={(e) => set("street", e.target.value)}
                    placeholder="Rua, Avenida, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_number">Número</Label>
                  <Input
                    id="address_number"
                    value={form.address_number}
                    onChange={(e) => set("address_number", e.target.value)}
                    placeholder="Nº"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={form.complement}
                    onChange={(e) => set("complement", e.target.value)}
                    placeholder="Apto, bloco, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={form.neighborhood}
                    onChange={(e) => set("neighborhood", e.target.value)}
                    placeholder="Bairro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="Cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">UF</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    placeholder="Ex: SE"
                    maxLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Ponto de Referência</Label>
                  <Input
                    id="reference"
                    value={form.reference}
                    onChange={(e) => set("reference", e.target.value)}
                    placeholder="Ponto de referência"
                  />
                </div>

                {/* ── Saúde ── */}
                <SectionTitle>Dados de Saúde</SectionTitle>

                <div className="space-y-2">
                  <Label htmlFor="blood_type">Tipo Sanguíneo</Label>
                  <Select value={form.blood_type} onValueChange={(v) => set("blood_type", v)}>
                    <SelectTrigger id="blood_type">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                        <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight_kg">Peso (kg)</Label>
                  <Input
                    id="weight_kg"
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.weight_kg}
                    onChange={(e) => set("weight_kg", e.target.value)}
                    placeholder="Ex: 70.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height_m">Altura (m)</Label>
                  <Input
                    id="height_m"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.height_m}
                    onChange={(e) => set("height_m", e.target.value)}
                    placeholder="Ex: 1.75"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bmi">IMC (calculado automaticamente)</Label>
                  <Input
                    id="bmi"
                    value={form.bmi}
                    readOnly
                    placeholder="—"
                    className="bg-muted cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Observações (alergias, restrições, etc.)</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Alergias, restrições, observações médicas..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="rn_in_insurance"
                    checked={form.rn_in_insurance}
                    onCheckedChange={(v) => set("rn_in_insurance", v)}
                  />
                  <Label htmlFor="rn_in_insurance" className="cursor-pointer">
                    RN na guia do convênio
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="vip"
                    checked={form.vip}
                    onCheckedChange={(v) => set("vip", v)}
                  />
                  <Label htmlFor="vip" className="cursor-pointer">
                    Paciente VIP
                  </Label>
                </div>

                {/* ── Sistema ── */}
                <SectionTitle>Dados do Sistema</SectionTitle>

                <div className="space-y-2">
                  <Label htmlFor="legacy_code">Código legado</Label>
                  <Input
                    id="legacy_code"
                    value={form.legacy_code}
                    onChange={(e) => set("legacy_code", e.target.value)}
                    placeholder="Identificador de outro sistema"
                  />
                </div>
              </>
            )}
          </div>

          {/* ── Ações ── */}
          <div className="flex justify-end gap-4 pt-6 border-t mt-6">
            <Link href={cancelHref}>
              <Button type="button" variant="outline" disabled={isSaving}>
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isSaving || success}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving ? "Salvando..." : "Salvar Usuário"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  cpf: string;
  phone: string;
  role: AllowedRole | "";
  // médico
  crm: string;
  crm_uf: string;
  specialty: string;
  // paciente
  phone_mobile: string;
  birth_date: string;
  sex: string;
}

const EMPTY_FORM: FormData = {
  full_name: "",
  email: "",
  password: "",
  confirm_password: "",
  cpf: "",
  phone: "",
  role: "",
  crm: "",
  crm_uf: "",
  specialty: "",
  phone_mobile: "",
  birth_date: "",
  sex: "",
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserCreationFormProps {
  /** Roles que o usuário logado tem permissão de criar */
  allowedRoles: AllowedRole[];
  /** Rota para redirecionar após sucesso */
  successHref: string;
  /** Rota do botão Cancelar */
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

  const set = (key: keyof FormData, value: string) => {
    let v = value;
    if (key === "phone" || key === "phone_mobile") v = formatPhone(value);
    else if (key === "cpf") v = formatCPF(value);
    else if (key === "crm_uf") v = value.toUpperCase().substring(0, 2);
    setForm((prev) => ({ ...prev, [key]: v }));
  };

  const isDoctor = form.role === "medico";
  const isPatient = form.role === "paciente";

  const pageTitle =
    form.role && form.role in ROLE_LABELS
      ? `Novo ${ROLE_LABELS[form.role as AllowedRole]}`
      : "Novo Usuário";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ── Validações ────────────────────────────────────────────────────────────
    if (!form.role) {
      setError("Selecione a função do usuário.");
      return;
    }
    if (!form.full_name || !form.email || !form.password || !form.confirm_password || !form.cpf) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("A senha e a confirmação não coincidem.");
      return;
    }
    if (form.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (!isValidCPF(cleanDigits(form.cpf))) {
      setError("CPF inválido. Verifique os dígitos.");
      return;
    }
    if (isDoctor && (!form.crm || !form.crm_uf)) {
      setError("Para médico, CRM e UF do CRM são obrigatórios.");
      return;
    }
    if (isPatient && !form.phone_mobile) {
      setError("Para paciente, o celular é obrigatório.");
      return;
    }

    setIsSaving(true);
    try {
      const cpfRaw = cleanDigits(form.cpf);
      const phoneRaw = cleanDigits(form.phone) || null;

      const payload: Record<string, unknown> = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        full_name: form.full_name.trim(),
        cpf: cpfRaw,
        phone: phoneRaw,
        role: form.role,
      };

      if (isPatient) {
        payload.create_patient_record = true;
        payload.phone_mobile = cleanDigits(form.phone_mobile);
        if (form.birth_date) payload.birth_date = form.birth_date;
        if (form.sex) payload.sex = form.sex;
      }

      if (isDoctor) {
        payload.create_doctor_record = true;
        payload.crm = form.crm.trim();
        payload.crm_uf = form.crm_uf;
        payload.phone_mobile = phoneRaw;
        if (form.specialty) payload.specialty = form.specialty.trim();
      }

      await usersService.create_user(payload);
      setSuccess(true);

      // redireciona após breve feedback visual
      setTimeout(() => {
        window.location.href = successHref;
      }, 800);
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
          {/* Feedback de erro */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive">
              <p className="font-semibold text-sm">Erro no cadastro:</p>
              <p className="text-sm break-words">{error}</p>
            </div>
          )}

          {/* Feedback de sucesso */}
          {success && (
            <div className="p-4 bg-green-500/10 text-green-700 rounded-lg border border-green-500">
              <p className="font-semibold text-sm">Usuário criado com sucesso! Redirecionando...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ── Seleção de role (só aparece quando há mais de uma opção) ── */}
            {allowedRoles.length > 1 && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="role">Função *</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => set("role", v)}
                  required
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione a função do usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedRoles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ── Campos comuns ── */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="Nome e Sobrenome"
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

            {/* ── Campos de Paciente ── */}
            {isPatient && (
              <>
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
              </>
            )}

            {/* ── Campos de Médico ── */}
            {isDoctor && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="crm">CRM *</Label>
                  <Input
                    id="crm"
                    value={form.crm}
                    onChange={(e) => set("crm", e.target.value)}
                    placeholder="Número do CRM"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crm_uf">UF do CRM *</Label>
                  <Input
                    id="crm_uf"
                    value={form.crm_uf}
                    onChange={(e) => set("crm_uf", e.target.value)}
                    placeholder="Ex: SE"
                    maxLength={2}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    value={form.specialty}
                    onChange={(e) => set("specialty", e.target.value)}
                    placeholder="Ex: Cardiologia"
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

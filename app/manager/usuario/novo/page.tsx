// ARQUIVO COMPLETO PARA: app/manager/usuario/novo/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { doctorsService } from "@/services/doctorsApi.mjs";
import { login } from "@/services/api.mjs";
import { isValidCPF } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserFormData {
  email: string;
  nomeCompleto: string;
  telefone: string;
  papel: string;
  senha: string;
  confirmarSenha: string;
  cpf: string;
  crm: string;
  crm_uf: string;
  specialty: string;
}

const defaultFormData: UserFormData = {
  email: "",
  nomeCompleto: "",
  telefone: "",
  papel: "",
  senha: "",
  confirmarSenha: "",
  cpf: "",
  crm: "",
  crm_uf: "",
  specialty: "",
};

// ─── Helpers de formatação ────────────────────────────────────────────────────

const cleanNumber = (value: string): string => value.replace(/\D/g, "");

const formatPhone = (value: string): string => {
  const cleaned = cleanNumber(value).substring(0, 11);
  if (cleaned.length === 11)
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (cleaned.length === 10)
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return cleaned;
};

// ─── Parser de erros da API → mensagem amigável em PT-BR ─────────────────────
//
// O problema original: o catch usava split('detail:"') que só funciona com
// erros PostgREST. A Edge Function create-doctor retorna {"error":"..."} e
// o parser não encontrava o padrão, exibindo o JSON cru para o usuário.
//
// Esta função resolve os dois formatos e mapeia constraint names para frases
// legíveis.

function parseApiError(rawError: unknown): string {
  const fallback =
    "Não foi possível criar o usuário. Verifique os dados e tente novamente.";

  const rawMessage =
    rawError instanceof Error ? rawError.message : String(rawError ?? "");

  if (!rawMessage) return fallback;

  // Extrai o texto de erro do JSON embutido na mensagem (se houver)
  let errorText = rawMessage;
  try {
    const jsonMatch = rawMessage.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
      // Edge Function → { error: "..." }
      // PostgREST     → { message: "...", detail: "..." }
      errorText = String(
        parsed.error ?? parsed.message ?? parsed.detail ?? rawMessage,
      );
    }
  } catch {
    // Não é JSON — segue com rawMessage
  }

  const lower = errorText.toLowerCase();

  // ── Violações de unicidade ────────────────────────────────────────────────

  if (
    lower.includes("doctors_cpf_key") ||
    (lower.includes("cpf") && lower.includes("duplicate"))
  ) {
    return "Já existe um médico cadastrado com este CPF. Verifique o número e tente novamente.";
  }

  if (
    lower.includes("doctors_crm_key") ||
    (lower.includes("crm") && lower.includes("duplicate"))
  ) {
    return "Já existe um médico cadastrado com este CRM. Verifique o número e tente novamente.";
  }

  if (
    lower.includes("doctors_email_key") ||
    lower.includes("profiles_email_key") ||
    lower.includes("users_email_key") ||
    (lower.includes("email") && lower.includes("duplicate"))
  ) {
    return "Este e-mail já está cadastrado no sistema. Use outro e-mail ou recupere a senha.";
  }

  if (lower.includes("unique constraint") || lower.includes("duplicate key")) {
    return "Já existe um registro com esses dados. Verifique os campos e tente novamente.";
  }

  // ── Erros de autenticação ─────────────────────────────────────────────────

  if (
    lower.includes("user already registered") ||
    lower.includes("already been registered")
  ) {
    return "Este e-mail já possui uma conta no sistema.";
  }

  if (lower.includes("password") && lower.includes("least")) {
    return "A senha não atende aos requisitos mínimos (mínimo 8 caracteres).";
  }

  if (lower.includes("invalid email")) {
    return "O e-mail informado é inválido. Verifique e tente novamente.";
  }

  // ── Fallback: limpa prefixos técnicos e exibe a mensagem bruta ───────────

  return (
    errorText
      .replace(/^erro na api:\s*/i, "")
      .replace(/^error:\s*/i, "")
      .replace(/\\/g, "")
      .trim() || fallback
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (key: keyof UserFormData, value: string) => {
    let updatedValue = value;
    if (key === "telefone") {
      updatedValue = formatPhone(value);
    } else if (key === "crm_uf") {
      updatedValue = value.toUpperCase();
    }
    setFormData((prev) => ({ ...prev, [key]: updatedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ── Validações client-side ──────────────────────────────────────────────

    if (
      !formData.email ||
      !formData.nomeCompleto ||
      !formData.papel ||
      !formData.senha ||
      !formData.confirmarSenha ||
      !formData.cpf
    ) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError("A Senha e a Confirmação de Senha não coincidem.");
      return;
    }

    if (!isValidCPF(formData.cpf)) {
      setError("O CPF informado é inválido. Por favor, verifique os dígitos.");
      return;
    }

    if (formData.papel === "medico" && (!formData.crm || !formData.crm_uf)) {
      setError("Para a função 'Médico', o CRM e a UF do CRM são obrigatórios.");
      return;
    }

    setIsSaving(true);

    try {
      if (formData.papel === "medico") {
        await doctorsService.create({
          email: formData.email.trim().toLowerCase(),
          full_name: formData.nomeCompleto,
          cpf: formData.cpf,
          crm: formData.crm,
          crm_uf: formData.crm_uf,
          specialty: formData.specialty || null,
          phone_mobile: formData.telefone || null,
        });
      } else {
        const isPatient = formData.papel === "paciente";
        await usersService.create_user({
          email: formData.email.trim().toLowerCase(),
          password: formData.senha,
          full_name: formData.nomeCompleto,
          phone: formData.telefone || null,
          roles: [formData.papel, "paciente"],
          cpf: formData.cpf,
          create_patient_record: isPatient,
          phone_mobile: isPatient ? formData.telefone || null : undefined,
        });
      }

      router.push("/manager/usuario");
    } catch (e: unknown) {
      console.error("Erro ao criar usuário:", e);
      setError(parseApiError(e));
    } finally {
      setIsSaving(false);
    }
  };

  const isMedico = formData.papel === "medico";

  return (
    <Sidebar>
      <div className="w-full h-full p-4 md:p-8 flex justify-center items-start">
        <div className="w-full max-w-screen-lg space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h1 className="text-3xl font-extrabold">Novo Usuário</h1>
              <p className="text-md text-muted-foreground">
                Preencha os dados para cadastrar um novo usuário no sistema.
              </p>
            </div>
            <Link href="/manager/usuario">
              <Button variant="outline">Cancelar</Button>
            </Link>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-card p-6 md:p-10 border rounded-xl shadow-lg"
          >
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive">
                <p className="font-semibold">Erro no Cadastro:</p>
                <p className="text-sm break-words">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                <Input
                  id="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={(e) =>
                    handleInputChange("nomeCompleto", e.target.value)
                  }
                  placeholder="Nome e Sobrenome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="exemplo@dominio.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="papel">Papel (Função) *</Label>
                <Select
                  value={formData.papel}
                  onValueChange={(v) => handleInputChange("papel", v)}
                  required
                >
                  <SelectTrigger id="papel">
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="medico">Médico</SelectItem>
                    <SelectItem value="secretaria">Secretária</SelectItem>
                    <SelectItem value="paciente">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isMedico && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="crm">CRM *</Label>
                    <Input
                      id="crm"
                      value={formData.crm}
                      onChange={(e) => handleInputChange("crm", e.target.value)}
                      placeholder="Número do CRM"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="crm_uf">UF do CRM *</Label>
                    <Input
                      id="crm_uf"
                      value={formData.crm_uf}
                      onChange={(e) =>
                        handleInputChange("crm_uf", e.target.value)
                      }
                      placeholder="Ex: SE"
                      maxLength={2}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="specialty">Especialidade (opcional)</Label>
                    <Input
                      id="specialty"
                      value={formData.specialty}
                      onChange={(e) =>
                        handleInputChange("specialty", e.target.value)
                      }
                      placeholder="Ex: Cardiologia"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => handleInputChange("senha", e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  value={formData.confirmarSenha}
                  onChange={(e) =>
                    handleInputChange("confirmarSenha", e.target.value)
                  }
                  placeholder="Repita a senha"
                  required
                />
                {formData.senha &&
                  formData.confirmarSenha &&
                  formData.senha !== formData.confirmarSenha && (
                    <p className="text-xs text-destructive">
                      As senhas não coincidem.
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) =>
                    handleInputChange("telefone", e.target.value)
                  }
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange("cpf", e.target.value)}
                placeholder="Apenas números"
                required
              />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t mt-6">
              <Link href="/manager/usuario">
                <Button type="button" variant="outline" disabled={isSaving}>
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={isSaving}
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
    </Sidebar>
  );
}

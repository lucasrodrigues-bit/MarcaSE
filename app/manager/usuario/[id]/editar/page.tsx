"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Save, Loader2, ArrowLeft } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import { patientsService } from "@/services/patientsApi.mjs"
import { doctorsService } from "@/services/doctorsApi.mjs"
import { api } from "@/services/api.mjs"
import { isValidCPF } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cleanDigits = (v: string) => (v ?? "").replace(/\D/g, "")

const formatPhone = (v: string) => {
  const d = cleanDigits(v).substring(0, 11)
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  return d
}

const formatCPF = (v: string) => {
  const d = cleanDigits(v).substring(0, 11)
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  if (d.length > 6) return d.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3")
  if (d.length > 3) return d.replace(/(\d{3})(\d+)/, "$1.$2")
  return d
}

const formatCEP = (v: string) => {
  const d = cleanDigits(v).substring(0, 8)
  if (d.length > 5) return d.replace(/(\d{5})(\d+)/, "$1-$2")
  return d
}

function calcBMI(weight: string, height: string): string {
  const w = parseFloat(weight)
  const h = parseFloat(height)
  if (!w || !h || h === 0) return ""
  return (w / (h * h)).toFixed(2)
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:col-span-2 pt-4 border-t">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {children}
      </h3>
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditForm {
  full_name: string
  email: string
  cpf: string
  role: string
  phone: string
  phone_mobile: string
  department: string
  // doctor
  crm: string
  crm_uf: string
  specialty: string
  active: boolean
  birth_date: string
  // patient – personal
  social_name: string
  rg: string
  document_type: string
  document_number: string
  sex: string
  race: string
  ethnicity: string
  nationality: string
  naturality: string
  profession: string
  marital_status: string
  // patient – family
  mother_name: string
  mother_profession: string
  father_name: string
  father_profession: string
  guardian_name: string
  guardian_cpf: string
  spouse_name: string
  // patient – contact
  phone1: string
  phone2: string
  // patient – address
  cep: string
  street: string
  address_number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  reference: string
  // patient – health
  blood_type: string
  weight_kg: string
  height_m: string
  bmi: string
  legacy_code: string
  rn_in_insurance: boolean
  vip: boolean
  notes: string
}

const EMPTY: EditForm = {
  full_name: "", email: "", cpf: "", role: "", phone: "", phone_mobile: "",
  department: "", crm: "", crm_uf: "", specialty: "", active: true, birth_date: "",
  social_name: "", rg: "", document_type: "", document_number: "", sex: "", race: "",
  ethnicity: "", nationality: "", naturality: "", profession: "", marital_status: "",
  mother_name: "", mother_profession: "", father_name: "", father_profession: "",
  guardian_name: "", guardian_cpf: "", spouse_name: "", phone1: "", phone2: "",
  cep: "", street: "", address_number: "", complement: "", neighborhood: "", city: "",
  state: "", reference: "", blood_type: "", weight_kg: "", height_m: "", bmi: "",
  legacy_code: "", rn_in_insurance: false, vip: false, notes: "",
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  medico: "Médico",
  secretaria: "Secretária",
  paciente: "Paciente",
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditarUsuarioPage() {
  const router = useRouter()
  const params = useParams()
  const userId = Array.isArray(params.id) ? params.id[0] : params.id as string

  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<EditForm>({ ...EMPTY })

  const isPatient = form.role === "paciente"
  const isDoctor = form.role === "medico"
  const needsDepartment = form.role === "gestor" || form.role === "secretaria"

  const set = (key: keyof EditForm, value: string | boolean) => {
    if (typeof value === "boolean") {
      setForm(prev => ({ ...prev, [key]: value }))
      return
    }
    let v = value
    if (["phone", "phone_mobile", "phone1", "phone2"].includes(key as string)) v = formatPhone(value)
    else if (key === "cpf" || key === "guardian_cpf") v = formatCPF(value)
    else if (key === "crm_uf" || key === "state") v = value.toUpperCase().substring(0, 2)
    else if (key === "cep") v = formatCEP(value)
    setForm(prev => {
      const next = { ...prev, [key]: v }
      if (key === "weight_kg" || key === "height_m") {
        next.bmi = calcBMI(
          key === "weight_kg" ? v : prev.weight_kg,
          key === "height_m" ? v : prev.height_m
        )
      }
      return next
    })
  }

  // ── Load ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      try {
        const [profiles, roles] = await Promise.all([
          api.get(`/rest/v1/profiles?id=eq.${userId}`),
          api.get(`/rest/v1/user_roles?user_id=eq.${userId}`),
        ])
        const profile = Array.isArray(profiles) ? profiles[0] : profiles
        const roleRecord = Array.isArray(roles) ? roles[0] : roles
        const currentRole: string = roleRecord?.role ?? ""

        const base: Partial<EditForm> = {
          full_name: profile?.full_name ?? "",
          email: profile?.email ?? "",
          cpf: profile?.cpf ? formatCPF(String(profile.cpf)) : "",
          phone: profile?.phone ? formatPhone(String(profile.phone)) : "",
          role: currentRole,
        }

        if (currentRole === "paciente") {
          const patientArr = await patientsService.getById(userId)
          const p = Array.isArray(patientArr) ? patientArr[0] : patientArr
          if (p) {
            Object.assign(base, {
              full_name: p.full_name ?? base.full_name,
              cpf: p.cpf ? formatCPF(String(p.cpf)) : base.cpf,
              phone_mobile: p.phone_mobile ? formatPhone(String(p.phone_mobile)) : "",
              phone1: p.phone1 ? formatPhone(String(p.phone1)) : "",
              phone2: p.phone2 ? formatPhone(String(p.phone2)) : "",
              social_name: p.social_name ?? "",
              rg: p.rg ?? "",
              document_type: p.document_type ?? "",
              document_number: p.document_number ?? "",
              birth_date: p.birth_date ?? "",
              sex: p.sex ?? "",
              race: p.race ?? "",
              ethnicity: p.ethnicity ?? "",
              nationality: p.nationality ?? "",
              naturality: p.naturality ?? "",
              profession: p.profession ?? "",
              marital_status: p.marital_status ?? "",
              mother_name: p.mother_name ?? "",
              mother_profession: p.mother_profession ?? "",
              father_name: p.father_name ?? "",
              father_profession: p.father_profession ?? "",
              guardian_name: p.guardian_name ?? "",
              guardian_cpf: p.guardian_cpf ? formatCPF(String(p.guardian_cpf)) : "",
              spouse_name: p.spouse_name ?? "",
              cep: p.cep ? formatCEP(String(p.cep)) : "",
              street: p.street ?? "",
              address_number: p.number ?? "",
              complement: p.complement ?? "",
              neighborhood: p.neighborhood ?? "",
              city: p.city ?? "",
              state: p.state ?? "",
              reference: p.reference ?? "",
              blood_type: p.blood_type ?? "",
              weight_kg: p.weight_kg != null ? String(p.weight_kg) : "",
              height_m: p.height_m != null ? String(p.height_m) : "",
              bmi: p.bmi != null ? String(p.bmi) : "",
              legacy_code: p.legacy_code ?? "",
              rn_in_insurance: p.rn_in_insurance ?? false,
              vip: p.vip ?? false,
              notes: p.notes ?? "",
            })
          }
        }

        if (currentRole === "medico") {
          const doctor = await doctorsService.getById(userId)
          if (doctor) {
            Object.assign(base, {
              full_name: doctor.full_name ?? base.full_name,
              cpf: doctor.cpf ? formatCPF(String(doctor.cpf)) : base.cpf,
              crm: doctor.crm ?? "",
              crm_uf: doctor.crm_uf ?? "",
              specialty: doctor.specialty ?? "",
              active: doctor.active ?? true,
              birth_date: doctor.birth_date ?? "",
              phone_mobile: doctor.phone_mobile ? formatPhone(String(doctor.phone_mobile)) : "",
            })
          }
        }

        if (currentRole === "gestor") {
          const rows = await api.get(`/rest/v1/managers?user_id=eq.${userId}`)
          const row = Array.isArray(rows) ? rows[0] : rows
          if (row?.department) base.department = row.department
        }
        if (currentRole === "secretaria") {
          const rows = await api.get(`/rest/v1/secretaries?user_id=eq.${userId}`)
          const row = Array.isArray(rows) ? rows[0] : rows
          if (row?.department) base.department = row.department
        }

        setForm(prev => ({ ...prev, ...base }))
      } catch (e: any) {
        setError(e.message || "Não foi possível carregar os dados do usuário.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!userId) { setError("ID inválido."); return }
    if (!form.full_name.trim()) { setError("O nome é obrigatório."); return }
    if (!form.cpf.trim() || !isValidCPF(cleanDigits(form.cpf))) {
      setError("CPF inválido. Verifique os dígitos."); return
    }
    if (!form.email.trim()) { setError("O e-mail é obrigatório."); return }
    if (isDoctor && (!form.crm || !form.crm_uf)) {
      setError("Para médico, CRM e UF do CRM são obrigatórios."); return
    }
    if (isPatient && !form.phone_mobile) {
      setError("Para paciente, o celular é obrigatório."); return
    }
    if (needsDepartment && !form.department.trim()) {
      setError("O departamento é obrigatório para gestor e secretária."); return
    }

    setIsSaving(true)
    try {
      const cpfRaw = cleanDigits(form.cpf)

      await Promise.all([
        api.patch(`/rest/v1/profiles?id=eq.${userId}`, {
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: cleanDigits(form.phone) || null,
          ...(cpfRaw && { cpf: cpfRaw }),
        }),
        api.patch(`/rest/v1/user_roles?user_id=eq.${userId}`, { role: form.role }),
      ])

      if (isDoctor) {
        await doctorsService.update(userId, {
          full_name: form.full_name.trim(),
          cpf: cpfRaw,
          crm: form.crm.trim(),
          crm_uf: form.crm_uf,
          specialty: form.specialty.trim() || null,
          active: form.active,
          birth_date: form.birth_date || null,
          phone_mobile: cleanDigits(form.phone_mobile) || null,
        })
      }

      if (isPatient) {
        await patientsService.update(userId, {
          full_name: form.full_name.trim(),
          cpf: cpfRaw,
          phone_mobile: cleanDigits(form.phone_mobile),
          social_name: form.social_name.trim() || null,
          rg: form.rg.trim() || null,
          document_type: form.document_type || null,
          document_number: form.document_number.trim() || null,
          birth_date: form.birth_date || null,
          sex: form.sex || null,
          race: form.race || null,
          ethnicity: form.ethnicity.trim() || null,
          nationality: form.nationality.trim() || null,
          naturality: form.naturality.trim() || null,
          profession: form.profession.trim() || null,
          marital_status: form.marital_status || null,
          mother_name: form.mother_name.trim() || null,
          mother_profession: form.mother_profession.trim() || null,
          father_name: form.father_name.trim() || null,
          father_profession: form.father_profession.trim() || null,
          guardian_name: form.guardian_name.trim() || null,
          guardian_cpf: cleanDigits(form.guardian_cpf) || null,
          spouse_name: form.spouse_name.trim() || null,
          phone1: cleanDigits(form.phone1) || null,
          phone2: cleanDigits(form.phone2) || null,
          cep: cleanDigits(form.cep) || null,
          street: form.street.trim() || null,
          number: form.address_number.trim() || null,
          complement: form.complement.trim() || null,
          neighborhood: form.neighborhood.trim() || null,
          city: form.city.trim() || null,
          state: form.state || null,
          reference: form.reference.trim() || null,
          blood_type: form.blood_type || null,
          weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
          height_m: form.height_m ? parseFloat(form.height_m) : null,
          bmi: form.bmi ? parseFloat(form.bmi) : null,
          legacy_code: form.legacy_code.trim() || null,
          rn_in_insurance: form.rn_in_insurance,
          vip: form.vip,
          notes: form.notes.trim() || null,
        })
      }

      if (needsDepartment) {
        const table = form.role === "gestor" ? "managers" : "secretaries"
        await api.patch(`/rest/v1/${table}?user_id=eq.${userId}`, {
          department: form.department.trim() || null,
        })
      }

      toast({ title: "Usuário atualizado com sucesso!" })
      router.push("/manager/usuario")
    } catch (e: any) {
      setError(e.message || "Ocorreu um erro ao salvar. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Sidebar>
        <div className="flex justify-center items-center h-full w-full py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Carregando dados do usuário...</p>
        </div>
      </Sidebar>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Sidebar>
      <div className="w-full max-w-screen-lg mx-auto space-y-6 p-4 md:p-8">

        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Editar Usuário: <span className="text-primary">{form.full_name || "—"}</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {form.role ? `Perfil: ${ROLE_LABELS[form.role] ?? form.role}` : `ID: ${userId}`}
            </p>
          </div>
          <Link href="/manager/usuario">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 md:p-10 border rounded-xl shadow-sm">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive">
              <p className="font-semibold text-sm">Erro:</p>
              <p className="text-sm break-words">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ══════════════════════════════════════════
                DADOS DE ACESSO — comuns a todos
            ══════════════════════════════════════════ */}
            <SectionTitle>Dados de Acesso</SectionTitle>

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
              <Label htmlFor="role">Função</Label>
              <Select value={form.role} onValueChange={(v) => set("role", v)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([v, label]) => (
                    <SelectItem key={v} value={v}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {needsDepartment && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="department">Departamento *</Label>
                <Input
                  id="department"
                  value={form.department}
                  onChange={(e) => set("department", e.target.value)}
                  placeholder="Ex: Administrativo, Recepção..."
                  required
                />
              </div>
            )}

            {/* ══════════════════════════════════════════
                MÉDICO
            ══════════════════════════════════════════ */}
            {isDoctor && (
              <>
                <SectionTitle>Dados Profissionais</SectionTitle>

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
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    value={form.specialty}
                    onChange={(e) => set("specialty", e.target.value)}
                    placeholder="Ex: Cardiologia"
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
                  <Label htmlFor="birth_date_doc">Data de Nascimento</Label>
                  <Input
                    id="birth_date_doc"
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => set("birth_date", e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="active"
                    checked={form.active}
                    onCheckedChange={(v) => set("active", v)}
                  />
                  <Label htmlFor="active" className="cursor-pointer">Médico Ativo</Label>
                </div>
              </>
            )}

            {/* ══════════════════════════════════════════
                PACIENTE
            ══════════════════════════════════════════ */}
            {isPatient && (
              <>
                <SectionTitle>Dados Pessoais</SectionTitle>

                <div className="space-y-2">
                  <Label htmlFor="social_name">Nome Social / Apelido</Label>
                  <Input id="social_name" value={form.social_name} onChange={(e) => set("social_name", e.target.value)} placeholder="Nome social ou apelido" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input id="rg" value={form.rg} onChange={(e) => set("rg", e.target.value)} placeholder="Número do RG" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document_type">Tipo de Documento</Label>
                  <Select value={form.document_type} onValueChange={(v) => set("document_type", v)}>
                    <SelectTrigger id="document_type"><SelectValue placeholder="Selecione" /></SelectTrigger>
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
                  <Input id="document_number" value={form.document_number} onChange={(e) => set("document_number", e.target.value)} placeholder="Número do documento" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input id="birth_date" type="date" value={form.birth_date} onChange={(e) => set("birth_date", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">Sexo</Label>
                  <Select value={form.sex} onValueChange={(v) => set("sex", v)}>
                    <SelectTrigger id="sex"><SelectValue placeholder="Selecione" /></SelectTrigger>
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
                    <SelectTrigger id="race"><SelectValue placeholder="Selecione" /></SelectTrigger>
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
                  <Input id="ethnicity" value={form.ethnicity} onChange={(e) => set("ethnicity", e.target.value)} placeholder="Etnia" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nacionalidade</Label>
                  <Input id="nationality" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} placeholder="Ex: Brasileira" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="naturality">Naturalidade (cidade natal)</Label>
                  <Input id="naturality" value={form.naturality} onChange={(e) => set("naturality", e.target.value)} placeholder="Cidade natal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profession">Profissão</Label>
                  <Input id="profession" value={form.profession} onChange={(e) => set("profession", e.target.value)} placeholder="Profissão" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marital_status">Estado Civil</Label>
                  <Select value={form.marital_status} onValueChange={(v) => set("marital_status", v)}>
                    <SelectTrigger id="marital_status"><SelectValue placeholder="Selecione" /></SelectTrigger>
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

                <SectionTitle>Contato</SectionTitle>

                <div className="space-y-2">
                  <Label htmlFor="phone_mobile">Celular *</Label>
                  <Input id="phone_mobile" value={form.phone_mobile} onChange={(e) => set("phone_mobile", e.target.value)} placeholder="(00) 00000-0000" maxLength={15} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone1">Telefone fixo 1</Label>
                  <Input id="phone1" value={form.phone1} onChange={(e) => set("phone1", e.target.value)} placeholder="(00) 0000-0000" maxLength={15} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone2">Telefone fixo 2</Label>
                  <Input id="phone2" value={form.phone2} onChange={(e) => set("phone2", e.target.value)} placeholder="(00) 0000-0000" maxLength={15} />
                </div>

                <SectionTitle>Filiação e Família</SectionTitle>

                <div className="space-y-2">
                  <Label htmlFor="mother_name">Nome da Mãe</Label>
                  <Input id="mother_name" value={form.mother_name} onChange={(e) => set("mother_name", e.target.value)} placeholder="Nome completo da mãe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mother_profession">Profissão da Mãe</Label>
                  <Input id="mother_profession" value={form.mother_profession} onChange={(e) => set("mother_profession", e.target.value)} placeholder="Profissão da mãe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="father_name">Nome do Pai</Label>
                  <Input id="father_name" value={form.father_name} onChange={(e) => set("father_name", e.target.value)} placeholder="Nome completo do pai" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="father_profession">Profissão do Pai</Label>
                  <Input id="father_profession" value={form.father_profession} onChange={(e) => set("father_profession", e.target.value)} placeholder="Profissão do pai" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spouse_name">Nome do Cônjuge</Label>
                  <Input id="spouse_name" value={form.spouse_name} onChange={(e) => set("spouse_name", e.target.value)} placeholder="Nome do cônjuge" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardian_name">Nome do Responsável</Label>
                  <Input id="guardian_name" value={form.guardian_name} onChange={(e) => set("guardian_name", e.target.value)} placeholder="Para menores ou dependentes" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardian_cpf">CPF do Responsável</Label>
                  <Input id="guardian_cpf" value={form.guardian_cpf} onChange={(e) => set("guardian_cpf", e.target.value)} placeholder="000.000.000-00" maxLength={14} />
                </div>

                <SectionTitle>Endereço</SectionTitle>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" value={form.cep} onChange={(e) => set("cep", e.target.value)} placeholder="00000-000" maxLength={9} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Logradouro</Label>
                  <Input id="street" value={form.street} onChange={(e) => set("street", e.target.value)} placeholder="Rua, Avenida, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_number">Número</Label>
                  <Input id="address_number" value={form.address_number} onChange={(e) => set("address_number", e.target.value)} placeholder="Nº" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input id="complement" value={form.complement} onChange={(e) => set("complement", e.target.value)} placeholder="Apto, bloco, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input id="neighborhood" value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} placeholder="Bairro" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Cidade" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">UF</Label>
                  <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="Ex: SE" maxLength={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Ponto de Referência</Label>
                  <Input id="reference" value={form.reference} onChange={(e) => set("reference", e.target.value)} placeholder="Ponto de referência" />
                </div>

                <SectionTitle>Dados de Saúde</SectionTitle>

                <div className="space-y-2">
                  <Label htmlFor="blood_type">Tipo Sanguíneo</Label>
                  <Select value={form.blood_type} onValueChange={(v) => set("blood_type", v)}>
                    <SelectTrigger id="blood_type"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                        <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_kg">Peso (kg)</Label>
                  <Input id="weight_kg" type="number" step="0.1" min="0" value={form.weight_kg} onChange={(e) => set("weight_kg", e.target.value)} placeholder="Ex: 70.5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height_m">Altura (m)</Label>
                  <Input id="height_m" type="number" step="0.01" min="0" value={form.height_m} onChange={(e) => set("height_m", e.target.value)} placeholder="Ex: 1.75" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bmi">IMC (calculado automaticamente)</Label>
                  <Input id="bmi" value={form.bmi} readOnly placeholder="—" className="bg-muted cursor-not-allowed" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Observações (alergias, restrições, etc.)</Label>
                  <Textarea id="notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Alergias, restrições, observações médicas..." rows={3} />
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="rn_in_insurance" checked={form.rn_in_insurance} onCheckedChange={(v) => set("rn_in_insurance", v)} />
                  <Label htmlFor="rn_in_insurance" className="cursor-pointer">RN na guia do convênio</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="vip" checked={form.vip} onCheckedChange={(v) => set("vip", v)} />
                  <Label htmlFor="vip" className="cursor-pointer">Paciente VIP</Label>
                </div>

                <SectionTitle>Dados do Sistema</SectionTitle>

                <div className="space-y-2">
                  <Label htmlFor="legacy_code">Código legado</Label>
                  <Input id="legacy_code" value={form.legacy_code} onChange={(e) => set("legacy_code", e.target.value)} placeholder="Identificador de outro sistema" />
                </div>
              </>
            )}

          </div>

          <div className="flex justify-end gap-4 pt-6 border-t mt-6">
            <Link href="/manager/usuario">
              <Button type="button" variant="outline" disabled={isSaving}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSaving}>
              {isSaving
                ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                : <Save className="w-4 h-4 mr-2" />
              }
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </Sidebar>
  )
}

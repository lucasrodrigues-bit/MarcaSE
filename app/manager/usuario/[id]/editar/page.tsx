"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, ArrowLeft, Mail } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import { usersService } from "@/services/usersApi.mjs"

interface UserFormData {
  nomeCompleto: string
  email: string
  telefone: string
  papel: string
  departamento: string
}

const defaultFormData: UserFormData = {
  nomeCompleto: "",
  email: "",
  telefone: "",
  papel: "",
  departamento: "",
}

const cleanNumber = (value: string): string => value.replace(/\D/g, "")
const formatPhone = (value: string): string => {
  const cleaned = cleanNumber(value).substring(0, 11)
  if (cleaned.length > 10) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
}

export default function EditarUsuarioPage() {
  const router = useRouter()
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [formData, setFormData] = useState<UserFormData>(defaultFormData)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchUser = async () => {
      try {
        const data = await usersService.full_data(id)
        const role = data.roles[0] ?? ""
        let departamento = ""
        if (role === "secretaria") {
          try {
            const [sec] = await (await import("@/services/api.mjs")).api.get(`/rest/v1/secretaries?user_id=eq.${id}&select=department`)
            departamento = sec?.department ?? ""
          } catch (_) {}
        } else if (role === "gestor") {
          try {
            const [mgr] = await (await import("@/services/api.mjs")).api.get(`/rest/v1/managers?user_id=eq.${id}&select=department`)
            departamento = mgr?.department ?? ""
          } catch (_) {}
        }
        setFormData({
          nomeCompleto: data.profile.full_name ?? "",
          email: data.profile.email ?? "",
          telefone: data.profile.phone ?? "",
          papel: role,
          departamento,
        })
      } catch (e: any) {
        setError(e.message || "Não foi possível carregar os dados do usuário.")
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id])

  const handleInputChange = (key: keyof UserFormData, value: string) => {
    const updatedValue = key === "telefone" ? formatPhone(value) : value
    setFormData((prev) => ({ ...prev, [key]: updatedValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setIsSaving(true)

    if (!id) {
      setError("ID do usuário ausente.")
      setIsSaving(false)
      return
    }

    try {
      await usersService.update_user(id, {
        full_name: formData.nomeCompleto,
        email: formData.email,
        phone: formData.telefone.trim() || null,
        role: formData.papel,
        department: formData.departamento.trim() || undefined,
      })
      router.push("/manager/usuario")
    } catch (e: any) {
      setError(e.message || "Ocorreu um erro inesperado ao atualizar.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetPassword = async () => {
    if (!formData.email) {
      setError("E-mail do usuário não encontrado.")
      return
    }
    setIsSendingReset(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await usersService.resetPassword(formData.email)
      setSuccessMessage("Link de reset de senha enviado para o e-mail do usuário.")
    } catch (e: any) {
      setError(e.message || "Erro ao enviar o link de reset.")
    } finally {
      setIsSendingReset(false)
    }
  }

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

  return (
    <Sidebar>
      <div className="w-full max-w-2xl mx-auto space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Editar Usuário: <span className="text-primary">{formData.nomeCompleto}</span>
            </h1>
            <p className="text-sm text-muted-foreground">Atualize as informações do usuário (ID: {id}).</p>
          </div>
          <Link href="/manager/usuario">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 border border-border rounded-lg shadow-sm">
          {error && (
            <div className="p-3 rounded-lg border bg-destructive/10 text-destructive border-destructive/30">
              <p className="font-medium">Erro:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-lg border bg-green-500/10 text-green-700 border-green-500/30">
              <p className="text-sm">{successMessage}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCompleto">Nome Completo</Label>
              <Input
                id="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResetPassword}
                  disabled={isSendingReset}
                >
                  {isSendingReset ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  {isSendingReset ? "Enviando..." : "Enviar link de reset de senha"}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="papel">Papel (Função)</Label>
                <Select value={formData.papel} onValueChange={(v) => handleInputChange("papel", v)}>
                  <SelectTrigger id="papel">
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="medico">Médico</SelectItem>
                    <SelectItem value="secretaria">Secretaria</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(formData.papel === "gestor" || formData.papel === "secretaria") && (
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento *</Label>
                <Input
                  id="departamento"
                  value={formData.departamento}
                  onChange={(e) => handleInputChange("departamento", e.target.value)}
                  placeholder="Ex: Administrativo, Recepção..."
                  maxLength={100}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link href="/manager/usuario">
              <Button type="button" variant="outline" disabled={isSaving}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </Sidebar>
  )
}
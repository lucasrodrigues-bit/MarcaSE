// Caminho: app/patient/profile/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuthLayout } from "@/hooks/useAuthLayout";
import { patientsService } from "@/services/patientsApi.mjs";
import { usersService } from "@/services/usersApi.mjs";
import { api } from "@/services/api.mjs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User, Mail, Phone, Calendar, Upload, Lock, Pencil, Save,
  MapPin, Info, Shield,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PatientReadOnly {
  name: string;
  cpf: string;
  birthDate: string;
  cep: string;
  avatarFullUrl?: string;
  memberSince?: string;
  role?: string;
}

interface EditableFields {
  phone: string;
  street: string;
  number: string;
  city: string;
  email: string;
}

const ROLE_LABELS: Record<string, string> = {
  paciente: "Paciente",
  admin: "Administrador",
  medico: "Médico",
  gestor: "Gestor",
  secretaria: "Secretária",
};

export default function PatientProfile() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuthLayout({
    requiredRole: ["paciente", "admin", "medico", "gestor", "secretaria"],
  });

  const [readOnly, setReadOnly] = useState<PatientReadOnly | null>(null);
  const [editableFields, setEditableFields] = useState<EditableFields>({
    phone: "",
    street: "",
    number: "",
    city: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  };

  const buildAvatarUrl = (path: string | null | undefined) => {
    if (!path) return undefined;
    const baseUrl = "https://yuanqfswhberkoevtmfr.supabase.co";
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const sep = cleanPath.includes("?") ? "&" : "?";
    return `${baseUrl}/storage/v1/object/avatars/${cleanPath}${sep}t=${Date.now()}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Não informado";
    return new Date(dateStr).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  const formatMemberSince = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  useEffect(() => {
    if (!user?.id) return;
    const loadData = async () => {
      try {
        const [[patientDetails], userSystemData] = await Promise.all([
          patientsService.getById(user.id),
          usersService.getMe(),
        ]);

        const freshAvatarUrl = buildAvatarUrl(userSystemData?.profile?.avatar_url);
        const userRole = userSystemData?.roles?.[0] ?? "paciente";

        setReadOnly({
          name: patientDetails?.full_name || user.name || "—",
          cpf: patientDetails?.cpf || "Não informado",
          birthDate: patientDetails?.birth_date || "",
          cep: patientDetails?.cep || "Não informado",
          avatarFullUrl: freshAvatarUrl,
          memberSince: userSystemData?.profile?.created_at,
          role: userRole,
        });

        setEditableFields({
          phone: patientDetails?.phone_mobile || "",
          street: patientDetails?.street || "",
          number: patientDetails?.number || "",
          city: patientDetails?.city || "",
          email: userSystemData?.profile?.email || user.email || "",
        });
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível exibir seus dados. Tente recarregar a página.",
          variant: "destructive",
        });
      }
    };
    loadData();
  }, [user?.id]);

  const handleEditableChange = (field: keyof EditableFields, value: string) => {
    setEditableFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await Promise.all([
        patientsService.update(user.id, {
          phone_mobile: editableFields.phone,
          street: editableFields.street,
          number: editableFields.number,
          city: editableFields.city,
        }),
        api.patch(`/rest/v1/profiles?id=eq.${user.id}`, {
          email: editableFields.email,
        }),
      ]);

      toast({
        title: "Dados atualizados!",
        description: "Suas informações foram salvas com sucesso.",
      });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas alterações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    router.refresh();
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    try {
      await api.storage.upload("avatars", filePath, file);
      await api.patch(`/rest/v1/profiles?id=eq.${user.id}`, { avatar_url: filePath });

      const newFullUrl = buildAvatarUrl(filePath);
      setReadOnly((prev) => (prev ? { ...prev, avatarFullUrl: newFullUrl } : null));

      toast({ title: "Foto atualizada!", description: "Sua foto de perfil foi atualizada." });
      setTimeout(() => router.refresh(), 800);
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro ao atualizar foto",
        description: "Não foi possível salvar sua foto de perfil. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isAuthLoading || !readOnly) {
    return (
      <Sidebar>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando seus dados...</p>
        </div>
      </Sidebar>
    );
  }

  const roleLabel = ROLE_LABELS[readOnly.role ?? "paciente"] ?? "Paciente";
  const memberSince = formatMemberSince(readOnly.memberSince);

  return (
    <Sidebar>
      <div className="space-y-6 max-w-5xl">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Meus Dados</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gerencie suas informações de perfil
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar Dados
              </Button>
            )}
          </div>
        </div>

        {/* Edit Mode Banner */}
        {isEditing && (
          <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5">
            <Info className="h-4 w-4 shrink-0" />
            <span>Modo de edição ativo — altere os campos desejados e salve.</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Coluna principal ────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Card 1: Dados Pessoais (read-only) */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <User className="h-4 w-4 text-primary" />
                    Dados Pessoais
                  </CardTitle>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Dados protegidos
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      Nome Completo
                      <Lock className="h-2.5 w-2.5 opacity-50" />
                    </Label>
                    <div className="px-3 py-2 rounded-md bg-muted/40 text-sm text-foreground min-h-9 flex items-center">
                      {readOnly.name}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      CPF
                      <Lock className="h-2.5 w-2.5 opacity-50" />
                    </Label>
                    <div className="px-3 py-2 rounded-md bg-muted/40 text-sm text-foreground min-h-9 flex items-center">
                      {readOnly.cpf}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    Data de Nascimento
                    <Lock className="h-2.5 w-2.5 opacity-50" />
                  </Label>
                  <div className="px-3 py-2 rounded-md bg-muted/40 text-sm text-foreground min-h-9 flex items-center">
                    {readOnly.birthDate ? formatDate(readOnly.birthDate) : "Não informado"}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5 pt-1">
                  <Shield className="h-3 w-3 shrink-0" />
                  Entre em contato com o suporte para solicitar alterações nesses dados.
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Informações de Contato (editável) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Mail className="h-4 w-4 text-primary" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-foreground/80">
                    Email de Contato
                    {isEditing && (
                      <span className="ml-1.5 text-[10px] font-normal text-primary/70">editável</span>
                    )}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editableFields.email}
                    onChange={(e) => handleEditableChange("email", e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/40 border-transparent cursor-default" : ""}
                    placeholder="seu@email.com"
                  />
                  <p className="text-[10px] text-muted-foreground/60">
                    Atualiza o email de contato cadastral. O email de acesso ao sistema não é alterado aqui.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-medium text-foreground/80">
                    Telefone / Celular
                    {isEditing && (
                      <span className="ml-1.5 text-[10px] font-normal text-primary/70">editável</span>
                    )}
                  </Label>
                  <Input
                    id="phone"
                    value={editableFields.phone}
                    onChange={(e) => handleEditableChange("phone", e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/40 border-transparent cursor-default" : ""}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Endereço */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <MapPin className="h-4 w-4 text-primary" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    CEP
                    <Lock className="h-2.5 w-2.5 opacity-50" />
                  </Label>
                  <div className="px-3 py-2 rounded-md bg-muted/40 text-sm text-foreground min-h-9 flex items-center">
                    {readOnly.cep}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="street" className="text-xs font-medium text-foreground/80">
                    Rua / Logradouro
                    {isEditing && (
                      <span className="ml-1.5 text-[10px] font-normal text-primary/70">editável</span>
                    )}
                  </Label>
                  <Input
                    id="street"
                    value={editableFields.street}
                    onChange={(e) => handleEditableChange("street", e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted/40 border-transparent cursor-default" : ""}
                    placeholder="Rua Exemplo, Av. ..."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="number" className="text-xs font-medium text-foreground/80">
                      Número
                      {isEditing && (
                        <span className="ml-1.5 text-[10px] font-normal text-primary/70">editável</span>
                      )}
                    </Label>
                    <Input
                      id="number"
                      value={editableFields.number}
                      onChange={(e) => handleEditableChange("number", e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted/40 border-transparent cursor-default" : ""}
                      placeholder="123"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-medium text-foreground/80">
                      Cidade
                      {isEditing && (
                        <span className="ml-1.5 text-[10px] font-normal text-primary/70">editável</span>
                      )}
                    </Label>
                    <Input
                      id="city"
                      value={editableFields.city}
                      onChange={(e) => handleEditableChange("city", e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted/40 border-transparent cursor-default" : ""}
                      placeholder="Sua cidade"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* ── Sidebar: Resumo do Perfil ────────────────────────────────── */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 overflow-hidden">
              {/* Gradient header with avatar */}
              <div className="bg-gradient-to-b from-primary/10 to-transparent pt-7 pb-4 flex flex-col items-center px-4">
                <div className="relative group">
                  <Avatar
                    className="w-20 h-20 cursor-pointer ring-4 ring-background ring-offset-2 ring-offset-primary/10 transition-all group-hover:ring-primary/30"
                    onClick={handleAvatarClick}
                  >
                    <AvatarImage src={readOnly.avatarFullUrl} className="object-cover" />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                      {getInitials(readOnly.name)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    title="Alterar foto"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                  />
                </div>
                <h2 className="text-base font-semibold text-foreground mt-3 text-center leading-snug">
                  {readOnly.name}
                </h2>
                <Badge variant="secondary" className="mt-2 text-xs">
                  {roleLabel}
                </Badge>
              </div>

              <CardContent className="pt-0 px-5 pb-5">
                <div className="space-y-2.5 border-t border-border pt-4">
                  <div className="flex items-start gap-2.5 text-sm">
                    <Mail className="h-3.5 w-3.5 text-primary/60 shrink-0 mt-0.5" />
                    <span className="text-foreground break-all leading-snug">
                      {editableFields.email || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Phone className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                    <span className="text-foreground">
                      {editableFields.phone || "Não informado"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                    <span className="text-foreground">
                      {readOnly.birthDate ? formatDate(readOnly.birthDate) : "Não informado"}
                    </span>
                  </div>
                  {(editableFields.city || editableFields.street) && (
                    <div className="flex items-start gap-2.5 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-primary/60 shrink-0 mt-0.5" />
                      <span className="text-foreground leading-snug">
                        {[editableFields.street, editableFields.number, editableFields.city]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                {memberSince && (
                  <p className="text-xs text-muted-foreground/60 text-center mt-4 pt-3 border-t border-border">
                    Membro desde {memberSince}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </Sidebar>
  );
}
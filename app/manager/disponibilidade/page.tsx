"use client";

import { useState, useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MoreHorizontal, Plus, Pencil, Trash2, Filter, CalendarRange } from "lucide-react";

import { AvailabilityService } from "@/services/availabilityApi.mjs";
import { doctorsService } from "@/services/doctorsApi.mjs";
import { AvailabilityEditModal } from "@/components/ui/availability-edit-modal";
import { toast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";

type Doctor = {
  id: string;
  full_name: string;
  specialty: string;
  active: boolean;
};

type Availability = {
  id: string;
  doctor_id: string;
  weekday: string;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  appointment_type: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
};

const WEEKDAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const weekdaysPT: Record<string, string> = {
  sunday:    "Domingo",
  monday:    "Segunda-Feira",
  tuesday:   "Terça-Feira",
  wednesday: "Quarta-Feira",
  thursday:  "Quinta-Feira",
  friday:    "Sexta-Feira",
  saturday:  "Sábado",
};

export default function ManagerAvailabilityPage() {
  const [authUserId, setAuthUserId] = useState<string | undefined>();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros da listagem principal
  const [filterName, setFilterName] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");

  // Dialog de gerenciamento do médico selecionado
  const [managingDoctor, setManagingDoctor] = useState<Doctor | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [addForm, setAddForm] = useState({
    weekday: "",
    start_time: "",
    end_time: "",
    slot_minutes: "30",
    appointment_type: "presencial",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit modal (AvailabilityEditModal)
  const [editTarget, setEditTarget] = useState<Availability | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Availability | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const formatTime = (t?: string | null) => t?.slice(0, 5) ?? "";

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [doctorList, availList] = await Promise.all([
        doctorsService.list(),
        AvailabilityService.list(),
      ]);
      setDoctors(Array.isArray(doctorList) ? doctorList : []);
      setAvailabilities(Array.isArray(availList) ? availList : []);
    } catch (e: any) {
      toast({ title: "Erro ao carregar", description: "Não foi possível exibir as disponibilidades. Tente recarregar a página." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userInfoStr = typeof window !== "undefined" ? localStorage.getItem("user_info") : null;
    if (userInfoStr) setAuthUserId(JSON.parse(userInfoStr).id);
    fetchAll();
  }, []);

  const specialties = useMemo(() => {
    const unique = new Set(doctors.map((d) => d.specialty).filter(Boolean));
    return Array.from(unique).sort();
  }, [doctors]);

  // Apenas médicos que têm ao menos uma disponibilidade
  const doctorsWithAvailability = useMemo(() => {
    const idsWithAvail = new Set(availabilities.map((a) => a.doctor_id));
    return doctors
      .filter((d) => idsWithAvail.has(d.id))
      .filter((d) => filterName === "" || d.full_name.toLowerCase().includes(filterName.toLowerCase()))
      .filter((d) => filterSpecialty === "all" || d.specialty === filterSpecialty)
      .sort((a, b) => a.full_name.localeCompare(b.full_name, "pt"));
  }, [doctors, availabilities, filterName, filterSpecialty]);

  // Disponibilidades do médico sendo gerenciado
  const doctorSlots = useMemo(() => {
    if (!managingDoctor) return [];
    return availabilities
      .filter((a) => a.doctor_id === managingDoctor.id)
      .sort((a, b) => WEEKDAY_ORDER.indexOf(a.weekday) - WEEKDAY_ORDER.indexOf(b.weekday));
  }, [availabilities, managingDoctor]);

  // ── GERENCIAR ────────────────────────────────────────
  const openManage = (doctor: Doctor) => {
    setManagingDoctor(doctor);
    setShowAddForm(false);
    setAddForm({ weekday: "", start_time: "", end_time: "", slot_minutes: "30", appointment_type: "presencial" });
    setIsManageOpen(true);
  };

  const closeManage = () => {
    setIsManageOpen(false);
    setManagingDoctor(null);
    setShowAddForm(false);
  };

  // ── ADICIONAR ─────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.weekday)   { toast({ title: "Atenção", description: "Selecione o dia da semana." }); return; }
    if (!addForm.start_time || !addForm.end_time) { toast({ title: "Atenção", description: "Informe os horários." }); return; }
    if (addForm.start_time >= addForm.end_time)   { toast({ title: "Atenção", description: "Entrada deve ser anterior à saída." }); return; }
    const slot = Number(addForm.slot_minutes);
    if (!slot || slot < 15 || slot > 120) { toast({ title: "Atenção", description: "Duração entre 15 e 120 minutos." }); return; }
    if (!authUserId || !managingDoctor) { toast({ title: "Sessão expirada", description: "Sua sessão expirou. Faça login novamente.", variant: "destructive" }); return; }

    setIsSubmitting(true);
    try {
      await AvailabilityService.create({
        doctor_id: managingDoctor.id,
        weekday: addForm.weekday,
        start_time: addForm.start_time,
        end_time: addForm.end_time,
        slot_minutes: slot,
        appointment_type: addForm.appointment_type,
        active: true,
        created_by: authUserId,
      });
      toast({ title: "Sucesso", description: "Disponibilidade cadastrada com sucesso." });
      setAddForm({ weekday: "", start_time: "", end_time: "", slot_minutes: "30", appointment_type: "presencial" });
      setShowAddForm(false);
      await fetchAll();
    } catch (err: any) {
      toast({ title: "Erro ao adicionar horário", description: "Não foi possível adicionar o horário. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── EDITAR ────────────────────────────────────────────
  const openEdit = (slot: Availability) => {
    setEditTarget(slot);
    setIsEditOpen(true);
  };

  const handleEdit = async (formData: {
    start_time: string;
    end_time: string;
    slot_minutes: string;
    appointment_type: string;
    id: string;
  }) => {
    try {
      await AvailabilityService.update(formData.id, {
        start_time: formData.start_time,
        end_time: formData.end_time,
        slot_minutes: formData.slot_minutes,
        appointment_type: formData.appointment_type,
      });
      toast({ title: "Sucesso", description: "Disponibilidade editada com sucesso." });
      await fetchAll();
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar as alterações. Tente novamente." });
    } finally {
      setIsEditOpen(false);
      setEditTarget(null);
    }
  };

  // ── EXCLUIR ───────────────────────────────────────────
  const openDelete = (slot: Availability) => {
    setDeleteTarget(slot);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await AvailabilityService.delete(deleteTarget.id);
      toast({ title: "Sucesso", description: "Disponibilidade excluída com sucesso." });
      setAvailabilities((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    } catch (e: any) {
      toast({ title: "Erro ao remover", description: "Não foi possível remover o horário. Tente novamente." });
    } finally {
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <Sidebar>
      <div className="space-y-6 p-4">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-2xl font-bold">Disponibilidade dos Médicos</h1>
          <p className="text-muted-foreground">
            {loading
              ? "Carregando..."
              : `${doctorsWithAvailability.length} médico${doctorsWithAvailability.length !== 1 ? "s" : ""} com disponibilidade cadastrada`}
          </p>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3 items-end">
              <Filter className="w-4 h-4 text-muted-foreground mb-2" />
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Médico</Label>
                <Input
                  placeholder="Buscar por nome..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="w-56"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Especialidade</Label>
                <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as especialidades</SelectItem>
                    {specialties.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFilterName(""); setFilterSpecialty("all"); }}>
                Limpar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de médicos */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Médico</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Slots cadastrados</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : doctorsWithAvailability.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                    Nenhum médico com disponibilidade encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                doctorsWithAvailability.map((doctor) => {
                  const slots = availabilities.filter((a) => a.doctor_id === doctor.id);
                  return (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.full_name}</TableCell>
                      <TableCell className="text-muted-foreground">{doctor.specialty || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <CalendarRange className="w-3 h-3 mr-1" />
                          {slots.length} slot{slots.length !== 1 ? "s" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openManage(doctor)}>
                              <CalendarRange className="w-4 h-4 mr-2" />
                              Gerenciar disponibilidades
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog de gerenciamento de disponibilidade do médico */}
      <Dialog open={isManageOpen} onOpenChange={closeManage}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {managingDoctor?.full_name}
              {managingDoctor?.specialty && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">— {managingDoctor.specialty}</span>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Botão adicionar */}
          <div className="flex justify-end">
            <Button
              size="sm"
              variant={showAddForm ? "outline" : "default"}
              onClick={() => setShowAddForm((v) => !v)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? "Cancelar" : "Adicionar disponibilidade"}
            </Button>
          </div>

          {/* Formulário de adição (inline, expansível) */}
          {showAddForm && (
            <form onSubmit={handleAdd} className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h3 className="text-sm font-semibold">Nova Disponibilidade</h3>

              <div className="grid gap-2">
                <Label className="text-sm">Dia da Semana *</Label>
                <Select value={addForm.weekday} onValueChange={(v) => setAddForm((f) => ({ ...f, weekday: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAY_ORDER.map((d) => (
                      <SelectItem key={d} value={d}>{weekdaysPT[d]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-sm">Horário de Entrada *</Label>
                  <Input
                    type="time"
                    value={addForm.start_time}
                    onChange={(e) => setAddForm((f) => ({ ...f, start_time: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm">Horário de Saída *</Label>
                  <Input
                    type="time"
                    value={addForm.end_time}
                    onChange={(e) => setAddForm((f) => ({ ...f, end_time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-sm">Duração (min) *</Label>
                  <Input
                    type="number"
                    min={15}
                    max={120}
                    value={addForm.slot_minutes}
                    onChange={(e) => setAddForm((f) => ({ ...f, slot_minutes: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm">Modalidade</Label>
                  <Select
                    value={addForm.appointment_type}
                    onValueChange={(v) => setAddForm((f) => ({ ...f, appointment_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="telemedicina">Telemedicina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          )}

          <Separator />

          {/* Lista de slots existentes */}
          {doctorSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhuma disponibilidade cadastrada.
            </p>
          ) : (
            <div className="space-y-2">
              {doctorSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{weekdaysPT[slot.weekday]}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                      {" · "}
                      {slot.slot_minutes} min
                      {" · "}
                      {slot.appointment_type === "telemedicina" ? "Telemedicina" : "Presencial"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(slot)}
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => openDelete(slot)}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de edição */}
      <AvailabilityEditModal
        availability={editTarget}
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditTarget(null); }}
        onSubmit={handleEdit}
      />

      {/* Dialog de exclusão */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  Excluir disponibilidade de {weekdaysPT[deleteTarget.weekday]},{" "}
                  {formatTime(deleteTarget.start_time)} às {formatTime(deleteTarget.end_time)}?
                  <br />Esta ação não pode ser desfeita.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}

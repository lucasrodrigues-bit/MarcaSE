"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Importei o Input
import { Calendar as CalendarShadcn } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Phone,
  User,
  Pencil,
  List,
  RefreshCw,
  Loader2,
  Search,
  CheckCheck,
  Ban,
} from "lucide-react";
import { format, parseISO, isValid, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";
import { appointmentsService } from "@/services/appointmentsApi.mjs";
import { patientsService } from "@/services/patientsApi.mjs";
import { doctorsService } from "@/services/doctorsApi.mjs";
import Sidebar from "@/components/Sidebar";

export default function SecretaryAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Estados dos Modais
  const [deleteModal, setDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  // Estado da Busca
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para o formulário de edição
  const [editFormData, setEditFormData] = useState({
    date: "",
    time: "",
    status: "",
  });

  // Estado de data selecionada
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const queryParams = "order=scheduled_at.asc";

      const [appointmentList, patientList, doctorList] = await Promise.all([
        appointmentsService.search_appointment(queryParams),
        patientsService.list(),
        doctorsService.list(),
      ]);

      const patientMap = new Map(patientList.map((p: any) => [p.id, p]));
      const doctorMap = new Map(doctorList.map((d: any) => [d.id, d]));

      const enrichedAppointments = appointmentList.map((apt: any) => ({
        ...apt,
        patient: patientMap.get(apt.patient_id) || {
          full_name: "Paciente não encontrado",
        },
        doctor: doctorMap.get(apt.doctor_id) || {
          full_name: "Médico não encontrado",
          specialty: "N/A",
        },
      }));

      setAppointments(enrichedAppointments);
    } catch (error) {
      console.error("Falha ao buscar agendamentos:", error);
      toast.error("Não foi possível carregar a lista de agendamentos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Filtragem e Agrupamento ---
  const groupedAppointments = useMemo(() => {
    let filteredList = appointments;

    // 1. Filtro de Texto (Nome do Paciente ou Médico)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filteredList = filteredList.filter(
        (apt) =>
          apt.patient.full_name.toLowerCase().includes(lowerTerm) ||
          apt.doctor.full_name.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Filtro de Data (se selecionada)
    if (selectedDate) {
      filteredList = filteredList.filter((apt) => {
        if (!apt.scheduled_at) return false;
        const iso = apt.scheduled_at.toString();
        return iso.startsWith(format(selectedDate, "yyyy-MM-dd"));
      });
    }

    // 3. Agrupamento por dia
    return filteredList.reduce((acc: Record<string, any[]>, apt: any) => {
      if (!apt.scheduled_at) return acc;
      const dateObj = new Date(apt.scheduled_at);
      if (!isValid(dateObj)) return acc;
      const key = format(dateObj, "yyyy-MM-dd");
      if (!acc[key]) acc[key] = [];
      acc[key].push(apt);
      return acc;
    }, {});
  }, [appointments, selectedDate, searchTerm]);

  // Dias que têm consulta (para destacar no calendário)
  const bookedDays = useMemo(
    () =>
      appointments
        .map((apt) =>
          apt.scheduled_at ? new Date(apt.scheduled_at) : null
        )
        .filter((d): d is Date => d !== null && isValid(d)),
    [appointments]
  );

  const formatDisplayDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return `Hoje, ${format(date, "dd 'de' MMMM", { locale: ptBR })}`;
    }
    if (isTomorrow(date)) {
      return `Amanhã, ${format(date, "dd 'de' MMMM", { locale: ptBR })}`;
    }
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  // --- LÓGICA DE EDIÇÃO E DELEÇÃO ---
  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment);
    const appointmentDate = new Date(appointment.scheduled_at);

    setEditFormData({
      date: appointmentDate.toISOString().split("T")[0],
      time: appointmentDate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }),
      status: appointment.status,
    });
    setEditModal(true);
  };

  const confirmEdit = async () => {
    if (
      !selectedAppointment ||
      !editFormData.date ||
      !editFormData.time ||
      !editFormData.status
    ) {
      toast.error("Todos os campos são obrigatórios para a edição.");
      return;
    }

    try {
      const newScheduledAt = new Date(
        `${editFormData.date}T${editFormData.time}:00Z`
      ).toISOString();
      const updatePayload = {
        scheduled_at: newScheduledAt,
        status: editFormData.status,
      };

      await appointmentsService.update(selectedAppointment.id, updatePayload);
      await fetchData();
      setEditModal(false);
      toast.success("Consulta atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar consulta:", error);
      toast.error("Não foi possível atualizar a consulta.");
    }
  };

  const handleDelete = (appointment: any) => {
    setSelectedAppointment(appointment);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedAppointment) return;
    try {
      await appointmentsService.delete(selectedAppointment.id);
      setAppointments((prev) =>
        prev.filter((apt) => apt.id !== selectedAppointment.id)
      );
      setDeleteModal(false);
      toast.success("Consulta deletada com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar consulta:", error);
      toast.error("Não foi possível deletar a consulta.");
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      await appointmentsService.update(id, { status: newStatus });
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
      );
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Não foi possível atualizar o status.");
    }
  };

  const handleCancelAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setDeleteModal(true);
  };

  const confirmCancelAppointment = async () => {
    if (!selectedAppointment) return;
    try {
      await appointmentsService.cancelAppointment(selectedAppointment.id);
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? { ...apt, status: "cancelled" }
            : apt
        )
      );
      setDeleteModal(false);
      toast.success("Consulta cancelada com sucesso!");
    } catch (error) {
      console.error("Erro ao cancelar consulta:", error);
      toast.error("Não foi possível cancelar a consulta.");
    }
  };

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Cabeçalho principal */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Agenda Médica
            </h1>
            <p className="text-muted-foreground">
              Consultas para os pacientes
            </p>
          </div>
          <Link href="/secretary/schedule">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Agendar Nova Consulta
            </Button>
          </Link>
        </div>

        {/* Barra de Filtros e Ações */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-semibold capitalize whitespace-nowrap">
            {selectedDate
              ? `Agenda de ${format(selectedDate, "dd/MM/yyyy")}`
              : "Todas as Consultas"}
          </h2>
          
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            {/* BARRA DE PESQUISA ADICIONADA AQUI */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar paciente ou médico..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button
                onClick={() => {
                    setSelectedDate(undefined);
                    setSearchTerm("");
                }}
                variant="ghost"
                size="sm"
                className="flex-1 md:flex-none"
              >
                <List className="mr-2 h-4 w-4" />
                Mostrar Todas
              </Button>
              <Button
                onClick={() => fetchData()}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex-1 md:flex-none"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Grid com calendário + lista */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna esquerda: calendário */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Filtrar por Data
                </CardTitle>
                <CardDescription>
                  Selecione um dia para ver os detalhes.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center p-2">
                <CalendarShadcn
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{ booked: bookedDays }}
                  modifiersClassNames={{ booked: "bg-primary/20" }}
                  className="rounded-md border p-2"
                  locale={ptBR}
                />
              </CardContent>
            </Card>
          </div>

          {/* Coluna direita: lista de consultas */}
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : Object.keys(groupedAppointments).length === 0 ? (
              <Card className="flex flex-col items-center justify-center h-48 text-center">
                <CardHeader>
                  <CardTitle>Nenhuma consulta encontrada</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {searchTerm 
                        ? "Nenhum resultado para a busca." 
                        : selectedDate
                            ? "Não há agendamentos para esta data."
                            : "Não há consultas agendadas."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedAppointments).map(
                ([date, appointmentsForDay]) => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold text-foreground mb-3 capitalize">
                      {formatDisplayDate(date)}
                    </h3>
                    <div className="space-y-4">
                      {appointmentsForDay.map((appointment: any) => {
                        const scheduledAtDate = new Date(
                          appointment.scheduled_at
                        );

                        return (
                          <Card
                            key={appointment.id}
                            className="shadow-sm hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                              {/* Coluna 1: Paciente + hora */}
                              <div className="col-span-1 flex flex-col gap-2">
                                <div className="font-semibold flex items-center text-foreground">
                                  <User className="mr-2 h-4 w-4 text-primary" />
                                  {appointment.patient.full_name}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="mr-2 h-4 w-4" />
                                  {isValid(scheduledAtDate)
                                    ? format(scheduledAtDate, "HH:mm")
                                    : "--:--"}
                                </div>
                              </div>

                              {/* Coluna 2: Médico / local / telefone */}
                              <div className="col-span-1 flex flex-col gap-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <User className="mr-2 h-4 w-4" />
                                  {appointment.doctor.full_name}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="mr-2 h-4 w-4" />
                                  {appointment.doctor.location ||
                                    "Local a definir"}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Phone className="mr-2 h-4 w-4" />
                                  {appointment.doctor.phone || "N/A"}
                                </div>
                                <div>{getStatusBadge(appointment.status)}</div>
                              </div>

                              {/* Coluna 3: Ações */}
                              <div className="col-span-1 flex justify-start md:justify-end">
                                <div className="flex flex-wrap gap-2">
                                  {appointment.status === "requested" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                                      onClick={() =>
                                        handleQuickStatusChange(
                                          appointment.id,
                                          "confirmed"
                                        )
                                      }
                                    >
                                      <CheckCheck className="mr-1.5 h-4 w-4" />
                                      Confirmar
                                    </Button>
                                  )}
                                  {appointment.status === "confirmed" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                      onClick={() =>
                                        handleQuickStatusChange(
                                          appointment.id,
                                          "completed"
                                        )
                                      }
                                    >
                                      <CheckCheck className="mr-1.5 h-4 w-4" />
                                      Realizada
                                    </Button>
                                  )}
                                  {!["cancelled", "completed"].includes(
                                    appointment.status
                                  ) && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        handleCancelAppointment(appointment)
                                      }
                                    >
                                      <Ban className="mr-1.5 h-4 w-4" />
                                      Cancelar
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(appointment)}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    <Separator className="my-6" />
                  </div>
                )
              )
            )}
          </div>
        </div>

        {/* MODAL DE EDIÇÃO */}
        <Dialog open={editModal} onOpenChange={setEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Consulta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={editFormData.date}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input
                  type="time"
                  value={editFormData.time}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(val) =>
                    setEditFormData((prev) => ({ ...prev, status: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requested">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="completed">Realizada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Fechar</Button>
              </DialogClose>
              <Button onClick={confirmEdit}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmação de Cancelamento */}
        <Dialog open={deleteModal} onOpenChange={setDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancelar Consulta</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground text-sm">
              Tem certeza que deseja cancelar a consulta de{" "}
              <strong>{selectedAppointment?.patient?.full_name}</strong>? O
              agendamento será marcado como cancelado.
            </p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Voltar</Button>
              </DialogClose>
              <Button variant="destructive" onClick={confirmCancelAppointment}>
                Confirmar Cancelamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  );
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "requested":
      return (
        <Badge className="bg-yellow-400/10 text-yellow-400">Solicitada</Badge>
      );
    case "confirmed":
      return <Badge className="bg-primary/10 text-primary">Confirmada</Badge>;
    case "checked_in":
      return (
        <Badge className="bg-indigo-400/10 text-indigo-400">Check-in</Badge>
      );
    case "completed":
      return <Badge className="bg-green-400/10 text-green-400">Realizada</Badge>;
    case "cancelled":
      return (
        <Badge className="bg-destructive/10 text-destructive">Cancelada</Badge>
      );
    case "no_show":
      return (
        <Badge className="bg-muted text-foreground">Não Compareceu</Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};
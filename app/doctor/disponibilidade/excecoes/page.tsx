"use client";

import type React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { exceptionsService } from "@/services/exceptionApi.mjs";
import { api } from "@/services/api.mjs";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import Sidebar from "@/components/Sidebar";

type ExceptionRecord = {
  id: string;
  doctor_id: string;
  date: string;
  kind: "bloqueio" | "disponibilidade_extra";
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
  created_by: string;
};

export default function ExceptionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExceptions, setIsLoadingExceptions] = useState(false);
  const [doctorId, setDoctorId] = useState<string | undefined>();
  const [authUserId, setAuthUserId] = useState<string | undefined>();
  const [exceptions, setExceptions] = useState<ExceptionRecord[]>([]);
  const [tipo, setTipo] = useState<string>("");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date());

  const bookedDays = exceptions.map((ex) => new Date(`${ex.date}T12:00:00`));

  const fetchDoctorAndExceptions = async () => {
    try {
      const userInfoStr = typeof window !== "undefined" ? localStorage.getItem("user_info") : null;
      if (!userInfoStr) throw new Error("Sessão não encontrada.");
      const uid: string = JSON.parse(userInfoStr).id;
      setAuthUserId(uid);

      const doctorRes = await api.get(`/rest/v1/doctors?user_id=eq.${uid}&select=id`);
      const did: string | undefined = Array.isArray(doctorRes) ? doctorRes[0]?.id : undefined;
      setDoctorId(did);

      if (!did) {
        toast({ title: "Atenção", description: "Registro de médico não encontrado para este usuário." });
        return;
      }

      await fetchExceptions(did);
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message || "Erro ao carregar dados." });
    }
  };

  const fetchExceptions = async (did?: string) => {
    const id = did ?? doctorId;
    if (!id) return;
    setIsLoadingExceptions(true);
    try {
      const data = await exceptionsService.listByDoctorId(id);
      setExceptions(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message || "Erro ao carregar exceções." });
    } finally {
      setIsLoadingExceptions(false);
    }
  };

  useEffect(() => {
    fetchDoctorAndExceptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    if (!selectedCalendarDate) {
      toast({ title: "Atenção", description: "Selecione uma data no calendário." });
      return;
    }
    if (!tipo) {
      toast({ title: "Atenção", description: "Selecione o tipo da exceção." });
      return;
    }
    if (!doctorId || !authUserId) {
      toast({ title: "Erro", description: "Sessão inválida. Recarregue a página." });
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const startRaw = formData.get("horarioEntrada") as string | null;
    const endRaw = formData.get("horarioSaida") as string | null;
    const start_time = startRaw ? `${startRaw}:00` : null;
    const end_time = endRaw ? `${endRaw}:00` : null;

    if ((start_time && !end_time) || (!start_time && end_time)) {
      toast({ title: "Atenção", description: "Informe ambos os horários ou deixe em branco para o dia inteiro." });
      return;
    }

    setIsLoading(true);
    try {
      await exceptionsService.create({
        doctor_id: doctorId,
        created_by: authUserId,
        date: format(selectedCalendarDate, "yyyy-MM-dd"),
        start_time,
        end_time,
        kind: tipo,
        reason: formData.get("reason") as string | null,
      });
      toast({ title: "Sucesso", description: "Exceção cadastrada com sucesso" });
      form.reset();
      setTipo("");
      await fetchExceptions();
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message || "Não foi possível cadastrar a exceção" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await exceptionsService.delete(id);
      toast({ title: "Sucesso", description: "Exceção removida com sucesso" });
      setExceptions((prev) => prev.filter((ex) => ex.id !== id));
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message || "Não foi possível remover a exceção" });
    }
  };

  const formatTime = (t: string | null) => (t ? t.slice(0, 5) : null);

  const displayDate = selectedCalendarDate
    ? new Date(selectedCalendarDate).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    : "Selecione uma data";

  return (
    <Sidebar>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Adicionar Exceções</h1>
          <p className="text-muted-foreground">Bloqueie ou adicione disponibilidade extra em datas específicas.</p>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">Data selecionada: {displayDate}</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Calendário
                </CardTitle>
                <p className="text-sm text-muted-foreground">Datas com exceção aparecem marcadas.</p>
              </CardHeader>
              <CardContent className="flex justify-center p-2">
                <Calendar
                  mode="single"
                  selected={selectedCalendarDate}
                  onSelect={setSelectedCalendarDate}
                  autoFocus
                  modifiers={{ booked: bookedDays }}
                  modifiersClassNames={{
                    booked: "bg-blue-600 text-white aria-selected:!bg-blue-700 hover:!bg-blue-700/90",
                  }}
                  className="rounded-md border p-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedCalendarDate ? (
              <p className="text-center text-lg text-muted-foreground">Selecione uma data.</p>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Nova Exceção</h2>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="horarioEntrada" className="text-sm font-medium">
                          Horário De Entrada
                        </Label>
                        <Input type="time" id="horarioEntrada" name="horarioEntrada" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="horarioSaida" className="text-sm font-medium">
                          Horário De Saída
                        </Label>
                        <Input type="time" id="horarioSaida" name="horarioSaida" className="mt-1" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground -mt-4">
                      Deixe em branco para bloquear / adicionar o dia inteiro.
                    </p>

                    <div>
                      <Label htmlFor="tipo" className="text-sm font-medium">
                        Tipo
                      </Label>
                      <Select onValueChange={(value) => setTipo(value)} value={tipo}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bloqueio">Bloqueio</SelectItem>
                          <SelectItem value="disponibilidade_extra">Disponibilidade Extra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="reason" className="text-sm font-medium">
                        Motivo
                      </Label>
                      <Input type="text" id="reason" name="reason" className="mt-1" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Link href="/doctor/disponibilidade">
                    <Button variant="outline">Cancelar</Button>
                  </Link>
                  <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
                    Salvar Exceção
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Tabela de exceções existentes */}
        <Card>
          <CardHeader>
            <CardTitle>Exceções Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingExceptions ? (
              <p className="text-center text-muted-foreground py-4">Carregando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exceptions.length > 0 ? (
                    exceptions.map((ex) => (
                      <TableRow key={ex.id}>
                        <TableCell>
                          {new Date(`${ex.date}T12:00:00`).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          {ex.kind === "bloqueio" ? (
                            <Badge variant="destructive">Bloqueio</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Disponibilidade Extra
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {ex.start_time && ex.end_time
                            ? `${formatTime(ex.start_time)} - ${formatTime(ex.end_time)}`
                            : "Dia inteiro"}
                        </TableCell>
                        <TableCell>{ex.reason ?? "—"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ex.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhuma exceção cadastrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Sidebar>
  );
}

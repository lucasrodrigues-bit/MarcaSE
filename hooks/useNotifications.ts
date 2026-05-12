"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/services/api.mjs";

export interface NotificationItem {
  id: string;
  type: "appointment" | "appointment_update" | "report" | "patient" | "doctor";
  title: string;
  message: string;
  timestamp: string;
}

const LAST_READ_KEY = "notif_last_read";
const POLL_MS = 60_000;

function getLastRead(): Date {
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    if (raw) return new Date(raw);
  } catch {}
  // Primeira vez: considera lido 1h atrás para mostrar eventos recentes como novos
  return new Date(Date.now() - 60 * 60 * 1000);
}

function saveLastRead() {
  try {
    localStorage.setItem(LAST_READ_KEY, new Date().toISOString());
  } catch {}
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function getAppointments(params: string): Promise<any[]> {
  try {
    const data = await api.get(`/rest/v1/appointments?${params}`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getReports(params: string): Promise<any[]> {
  try {
    const data = await api.get(`/rest/v1/reports?${params}`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getPatients(params = ""): Promise<any[]> {
  try {
    const data = await api.get(`/rest/v1/patients?order=created_at.desc&limit=8${params ? "&" + params : ""}`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getDoctors(): Promise<any[]> {
  try {
    const data = await api.get(`/rest/v1/doctors?order=created_at.desc&limit=5`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Converte agendamento em notificação dependendo do papel
function aptToNotif(
  apt: any,
  role: string,
  doctorName?: string
): NotificationItem {
  const ts = apt.created_at || apt.scheduled_at || new Date().toISOString();
  const scheduled = apt.scheduled_at ? fmtDate(apt.scheduled_at) : "—";

  if (role === "paciente") {
    const titles: Record<string, string> = {
      completed: "Consulta realizada",
      cancelled: "Consulta cancelada",
      confirmed: "Consulta confirmada",
    };
    return {
      id: `appt_${apt.id}`,
      type: apt.status === "completed" || apt.status === "cancelled"
        ? "appointment_update"
        : "appointment",
      title: titles[apt.status] ?? "Consulta agendada",
      message: doctorName
        ? `Com ${doctorName} — ${scheduled}`
        : `Agendada para ${scheduled}`,
      timestamp: ts,
    };
  }

  if (role === "medico") {
    return {
      id: `appt_${apt.id}`,
      type: "appointment",
      title: "Nova consulta agendada",
      message: `Paciente marcou para ${scheduled}`,
      timestamp: ts,
    };
  }

  // secretaria / gestor / admin
  return {
    id: `appt_${apt.id}`,
    type: "appointment",
    title: "Nova consulta",
    message: `Agendada para ${scheduled}`,
    timestamp: ts,
  };
}

async function buildForPatient(userId: string): Promise<NotificationItem[]> {
  const [apts, reports, doctors] = await Promise.all([
    getAppointments(`patient_id=eq.${userId}&order=created_at.desc&limit=10`),
    getReports(`patient_id=eq.${userId}&order=created_at.desc&limit=8`),
    getDoctors(),
  ]);

  const doctorMap = new Map(doctors.map((d: any) => [d.id, d.full_name]));

  const aptNotifs = apts.map((a) =>
    aptToNotif(a, "paciente", doctorMap.get(a.doctor_id))
  );

  const reportNotifs = reports.map((r: any) => ({
    id: `report_${r.id}`,
    type: "report" as const,
    title: "Laudo disponível",
    message: `Laudo de ${r.exam || "exame"} foi emitido`,
    timestamp: r.created_at || new Date().toISOString(),
  }));

  return [...aptNotifs, ...reportNotifs];
}

async function buildForDoctor(userId: string): Promise<NotificationItem[]> {
  // Descobre o doctor_id a partir do user_id
  const doctors = await getDoctors();
  const me = doctors.find((d: any) => d.user_id === userId);
  if (!me) return [];

  const apts = await getAppointments(
    `doctor_id=eq.${me.id}&order=created_at.desc&limit=15`
  );

  return apts.map((a) => aptToNotif(a, "medico"));
}

async function buildForSecretary(): Promise<NotificationItem[]> {
  const [apts, patients, doctors] = await Promise.all([
    getAppointments("order=created_at.desc&limit=12"),
    getPatients(),
    getDoctors(),
  ]);

  const aptNotifs = apts.map((a) => aptToNotif(a, "secretaria"));

  const patNotifs = patients.map((p: any) => ({
    id: `patient_${p.id}`,
    type: "patient" as const,
    title: "Novo paciente cadastrado",
    message: p.full_name || "Novo paciente adicionado ao sistema",
    timestamp: p.created_at || new Date().toISOString(),
  }));

  const docNotifs = doctors.map((d: any) => ({
    id: `doctor_${d.id}`,
    type: "doctor" as const,
    title: "Novo médico cadastrado",
    message: d.full_name || "Novo médico adicionado ao sistema",
    timestamp: d.created_at || new Date().toISOString(),
  }));

  return [...aptNotifs, ...patNotifs, ...docNotifs];
}

async function buildForManager(): Promise<NotificationItem[]> {
  const [apts, reports, patients, doctors] = await Promise.all([
    getAppointments("order=created_at.desc&limit=12"),
    getReports("order=created_at.desc&limit=8"),
    getPatients(),
    getDoctors(),
  ]);

  const aptNotifs = apts.map((a) => aptToNotif(a, "gestor"));

  const reportNotifs = reports.map((r: any) => ({
    id: `report_${r.id}`,
    type: "report" as const,
    title: "Laudo emitido",
    message: `Laudo de ${r.exam || "exame"}`,
    timestamp: r.created_at || new Date().toISOString(),
  }));

  const patNotifs = patients.map((p: any) => ({
    id: `patient_${p.id}`,
    type: "patient" as const,
    title: "Novo paciente cadastrado",
    message: p.full_name || "Novo paciente adicionado ao sistema",
    timestamp: p.created_at || new Date().toISOString(),
  }));

  const docNotifs = doctors.map((d: any) => ({
    id: `doctor_${d.id}`,
    type: "doctor" as const,
    title: "Novo médico cadastrado",
    message: d.full_name || "Novo médico adicionado ao sistema",
    timestamp: d.created_at || new Date().toISOString(),
  }));

  return [...aptNotifs, ...reportNotifs, ...patNotifs, ...docNotifs];
}

export function useNotifications(
  userId: string | undefined,
  role: string | undefined
) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastRead, setLastRead] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    if (!userId || !role) return;

    let items: NotificationItem[] = [];

    if (role === "paciente" || role === "patient") {
      items = await buildForPatient(userId);
    } else if (role === "medico" || role === "doctor") {
      items = await buildForDoctor(userId);
    } else if (role === "secretaria" || role === "secretary") {
      items = await buildForSecretary();
    } else if (role === "gestor" || role === "admin" || role === "manager") {
      items = await buildForManager();
    }

    // Deduplica por ID e ordena do mais recente ao mais antigo
    const unique = Array.from(
      new Map(items.map((n) => [n.id, n])).values()
    ).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setNotifications(unique.slice(0, 25));
    setLoading(false);
  }, [userId, role]);

  useEffect(() => {
    if (!userId || !role) return;

    setLastRead(getLastRead());
    fetchAll();

    timerRef.current = setInterval(fetchAll, POLL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [userId, role, fetchAll]);

  const markAllRead = useCallback(() => {
    saveLastRead();
    setLastRead(new Date());
  }, []);

  const unreadCount = notifications.filter(
    (n) => new Date(n.timestamp) > lastRead
  ).length;

  return { notifications, unreadCount, loading, markAllRead };
}

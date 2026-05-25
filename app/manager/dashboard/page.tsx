"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowUpRight,
  Stethoscope,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { usersService } from "@/services/usersApi.mjs";
import { appointmentsService } from "@/services/appointmentsApi.mjs";
import { doctorsService } from "@/services/doctorsApi.mjs";
import { api } from "@/services/api.mjs";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Appointment {
  id: string;
  patient_id?: string;
  doctor_id?: string;
  scheduled_at: string;
  status: "scheduled" | "confirmed" | "cancelled" | "no_show" | "completed";
  notes?: string;
  patient_name?: string;
  doctor_name?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  created_at?: string;
}

interface RecentUser extends UserRole {
  full_name: string;
  email: string;
}

interface Doctor {
  id?: string;
  full_name?: string;
  specialty?: string;
  active?: boolean;
}

interface DashboardStats {
  totalAppointments: number;
  upcomingCount: number;
  noShowCount: number;
  noShowRate: number;
  cancelledCount: number;
  completedCount: number;
  confirmedCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  scheduled: {
    label: "Agendado",
    color: "#3b82f6",
    bg: "bg-blue-500/10  text-blue-400  border-blue-500/20",
  },
  confirmed: {
    label: "Confirmado",
    color: "#10b981",
    bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  cancelled: {
    label: "Cancelado",
    color: "#f43f5e",
    bg: "bg-rose-500/10   text-rose-400   border-rose-500/20",
  },
  no_show: {
    label: "Ausente",
    color: "#f59e0b",
    bg: "bg-amber-500/10  text-amber-400  border-amber-500/20",
  },
  completed: {
    label: "Concluído",
    color: "#8b5cf6",
    bg: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
} as const;

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  medico: "Médico",
  secretaria: "Secretária",
  paciente: "Paciente",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  gestor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  medico: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  secretaria: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  paciente: "bg-slate-500/10 text-muted-foreground border-slate-500/20",
};

const CHART_BLUES = ["#3b82f6", "#6366f1", "#0ea5e9", "#8b5cf6", "#06b6d4"];

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    time: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function getDayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { weekday: "short" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  loading,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  loading?: boolean;
}) {
  return (
    <Card className="border-border bg-card backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-lg bg-black-500/10 p-2">
          <Icon className="h-4 w-4 text-blue-400" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-8 w-20 bg-secondary" />
            <Skeleton className="mt-2 h-3 w-32 bg-secondary" />
          </>
        ) : (
          <>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            <div className="mt-1 flex items-center gap-2">
              {trend && (
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    trend.positive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {trend.positive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(trend.value)}%
                </span>
              )}
              <p className="text-xs text-muted-foreground/70">{subtitle}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function AppointmentStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? {
    label: status,
    bg: "bg-slate-500/10 text-muted-foreground border-slate-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.bg}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium text-foreground/70">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function ManagerDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      await Promise.allSettled([
        fetchAppointments(),
        fetchUsers(),
        fetchDoctors(),
      ]);
      setLoading(false);
    }
    fetchAll();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // fetchAppointments
  //
  // 1. Busca consultas com join direto na tabela doctors (PostgREST embedded).
  // 2. Extrai os patient_ids únicos e busca nomes na tabela profiles em uma
  //    única requisição extra (IN filter).
  // 3. Monta o array final com patient_name e doctor_name resolvidos.
  // ─────────────────────────────────────────────────────────────────────────
  async function fetchAppointments() {
    try {
      // Join com doctors via PostgREST: doctor:doctors(full_name)
      const raw = (await api.get(
        "/rest/v1/appointments?select=id,patient_id,doctor_id,scheduled_at,status,notes,doctor:doctors(full_name)&order=scheduled_at.desc&limit=200",
      )) as Array<{
        id: string;
        patient_id?: string;
        doctor_id?: string;
        scheduled_at: string;
        status: Appointment["status"];
        notes?: string;
        doctor?: { full_name?: string } | null;
      }>;

      if (!Array.isArray(raw)) return;

      // Coleta patient_ids únicos para buscar nomes de uma só vez
      const patientIds = [
        ...new Set(raw.map((a) => a.patient_id).filter(Boolean)),
      ] as string[];

      let profileMap = new Map<string, string>();
      if (patientIds.length > 0) {
        const profiles = (await api.get(
          `/rest/v1/profiles?select=id,full_name&id=in.(${patientIds.join(",")})`,
        )) as UserProfile[];
        if (Array.isArray(profiles)) {
          profileMap = new Map(profiles.map((p) => [p.id, p.full_name ?? "—"]));
        }
      }

      const enriched: Appointment[] = raw.map((a) => ({
        id: a.id,
        patient_id: a.patient_id,
        doctor_id: a.doctor_id,
        scheduled_at: a.scheduled_at,
        status: a.status,
        notes: a.notes,
        // Nomes resolvidos — nunca mais UUIDs na UI
        patient_name: a.patient_id
          ? (profileMap.get(a.patient_id) ?? "—")
          : "—",
        doctor_name: a.doctor?.full_name ?? "—",
      }));

      setAppointments(enriched);
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
    }
  }

  async function fetchUsers() {
    try {
      const roles = (await usersService.list_roles()) as UserRole[];
      if (!Array.isArray(roles) || roles.length === 0) return;

      // Pega os 8 mais recentes pelo created_at
      const sorted = [...roles].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      const recent = sorted.slice(0, 8);

      // Busca perfis em paralelo
      const ids = recent.map((r) => r.user_id).join(",");
      const profiles = (await api.get(
        `/rest/v1/profiles?select=id,full_name,email,created_at&id=in.(${ids})`,
      )) as UserProfile[];

      const profileMap = new Map(profiles.map((p) => [p.id, p]));

      setRecentUsers(
        recent.map((r) => {
          const profile = profileMap.get(r.user_id);
          return {
            ...r,
            full_name: profile?.full_name ?? "—",
            email: profile?.email ?? "—",
          };
        }),
      );
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
    }
  }

  async function fetchDoctors() {
    try {
      const data = await doctorsService.list();
      if (Array.isArray(data)) setDoctors(data as Doctor[]);
    } catch (err) {
      console.error("Erro ao buscar médicos:", err);
    }
  }

  // ── Derived stats ──────────────────────────────────────────────────────────

  const stats = useMemo<DashboardStats>(() => {
    const now = new Date();
    const upcoming = appointments.filter(
      (a) =>
        new Date(a.scheduled_at) > now &&
        (a.status === "scheduled" || a.status === "confirmed"),
    );
    const noShow = appointments.filter((a) => a.status === "no_show");
    const cancelled = appointments.filter((a) => a.status === "cancelled");
    const completed = appointments.filter((a) => a.status === "completed");
    const confirmed = appointments.filter((a) => a.status === "confirmed");
    const noShowRate =
      appointments.length > 0
        ? Math.round((noShow.length / appointments.length) * 100)
        : 0;

    return {
      totalAppointments: appointments.length,
      upcomingCount: upcoming.length,
      noShowCount: noShow.length,
      noShowRate,
      cancelledCount: cancelled.length,
      completedCount: completed.length,
      confirmedCount: confirmed.length,
    };
  }, [appointments]);

  // ── Chart: Agendamentos por dia (últimos 7 dias) ────────────────────────────

  const weeklyData = useMemo(() => {
    const days: Record<
      string,
      { dia: string; total: number; confirmados: number; ausentes: number }
    > = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
      });
      days[key] = { dia: label, total: 0, confirmados: 0, ausentes: 0 };
    }

    appointments.forEach((a) => {
      const key = a.scheduled_at?.split("T")[0];
      if (days[key]) {
        days[key].total++;
        if (a.status === "confirmed" || a.status === "completed")
          days[key].confirmados++;
        if (a.status === "no_show") days[key].ausentes++;
      }
    });

    return Object.values(days);
  }, [appointments]);

  // ── Chart: Distribuição de status ──────────────────────────────────────────

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((a) => {
      counts[a.status] = (counts[a.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name:
        STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label ?? status,
      value,
      color:
        STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color ?? "#64748b",
    }));
  }, [appointments]);

  // ── Upcoming appointments ──────────────────────────────────────────────────

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(
        (a) =>
          new Date(a.scheduled_at) >= now &&
          a.status !== "cancelled" &&
          a.status !== "no_show",
      )
      .slice(0, 6);
  }, [appointments]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Sidebar>
      <div className="min-h-screen space-y-6 p-6 bg-background">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-blue-400" />
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground/70">
              Visão geral da clínica —{" "}
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2">
  <Link href="/manager/usuario/novo">
    <Button
      size="sm"
      className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
    >
      <UserPlus className="h-4 w-4" /> Novo Usuário
    </Button>
  </Link>
</div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Total de Consultas"
            value={stats.totalAppointments}
            subtitle="no histórico completo"
            icon={Calendar}
            loading={loading}
          />
          <StatCard
            title="Próximas Consultas"
            value={stats.upcomingCount}
            subtitle="agendadas ou confirmadas"
            icon={Clock}
            loading={loading}
          />
          <StatCard
            title="Taxa de Absenteísmo"
            value={`${stats.noShowRate}%`}
            subtitle={`${stats.noShowCount} ausências registradas`}
            icon={AlertCircle}
            trend={{ value: stats.noShowRate, positive: stats.noShowRate < 20 }}
            loading={loading}
          />
          <StatCard
            title="Médicos Ativos"
            value={doctors.filter((d) => d.active !== false).length}
            subtitle={`de ${doctors.length} cadastrados`}
            icon={Stethoscope}
            loading={loading}
          />
        </div>

        {/* ── Tabs ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="border border-border bg-card/80">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-muted-foreground"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-muted-foreground"
            >
              Consultas
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-muted-foreground"
            >
              Usuários
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: Overview ── */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* BarChart — Consultas por dia */}
              <Card className="col-span-2 border-border bg-card backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-400" />
                    Consultas — Últimos 7 dias
                  </CardTitle>
                  <CardDescription className="text-muted-foreground/70">
                    Total, confirmados e ausências por dia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-56 w-full bg-secondary" />
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={weeklyData} barGap={2}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1e293b"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="dia"
                          tick={{ fill: "#64748b", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#64748b", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar
                          dataKey="total"
                          name="Total"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="confirmados"
                          name="Confirmados"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="ausentes"
                          name="Ausentes"
                          fill="#f59e0b"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {/* Legend manual */}
                  <div className="mt-2 flex gap-4">
                    {[
                      { label: "Total", color: "#3b82f6" },
                      { label: "Confirmados", color: "#10b981" },
                      { label: "Ausentes", color: "#f59e0b" },
                    ].map((l) => (
                      <span
                        key={l.label}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground/70"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ background: l.color }}
                        />
                        {l.label}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* PieChart — Status */}
              <Card className="border-border bg-card backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-violet-400" />
                    Status das Consultas
                  </CardTitle>
                  <CardDescription className="text-muted-foreground/70">
                    Distribuição por status
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  {loading ? (
                    <Skeleton className="h-48 w-full bg-secondary" />
                  ) : statusData.length === 0 ? (
                    <p className="mt-8 text-sm text-muted-foreground/70">
                      Nenhum dado disponível
                    </p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={72}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {statusData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number, name: string) => [
                              value,
                              name,
                            ]}
                            contentStyle={{
                              background: "#0f172a",
                              border: "1px solid #1e293b",
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-2 w-full space-y-1.5">
                        {statusData.map((s) => (
                          <div
                            key={s.name}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ background: s.color }}
                              />
                              {s.name}
                            </span>
                            <span className="font-medium text-foreground/70">
                              {s.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  href: "/manager/medicos",
                  label: "Gestão de Médicos",
                  icon: Stethoscope,
                  color: "text-blue-400",
                },
                {
                  href: "/manager/usuario",
                  label: "Usuários",
                  icon: Users,
                  color: "text-violet-400",
                },
                {
                  href: "/secretary/appointments",
                  label: "Agendamentos",
                  icon: Calendar,
                  color: "text-emerald-400",
                },
                {
                  href: "/manager/disponibilidade",
                  label: "Disponibilidade",
                  icon: TrendingUp,
                  color: "text-amber-400",
                },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="group cursor-pointer border-border bg-card transition-all hover:border-blue-500/40 hover:bg-secondary/80">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <span className="text-sm font-medium text-foreground/70">
                          {item.label}
                        </span>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-blue-400" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* ── Tab: Consultas ── */}
          <TabsContent value="appointments" className="mt-4 space-y-4">
            {/* Métricas de consulta */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                {
                  label: "Concluídas",
                  value: stats.completedCount,
                  icon: CheckCircle2,
                  color: "text-emerald-400",
                },
                {
                  label: "Confirmadas",
                  value: stats.confirmedCount,
                  icon: CheckCircle2,
                  color: "text-blue-400",
                },
                {
                  label: "Canceladas",
                  value: stats.cancelledCount,
                  icon: XCircle,
                  color: "text-rose-400",
                },
                {
                  label: "Ausências",
                  value: stats.noShowCount,
                  icon: AlertCircle,
                  color: "text-amber-400",
                },
              ].map((m) => (
                <Card key={m.label} className="border-border bg-card">
                  <CardContent className="flex items-center gap-3 p-4">
                    <m.icon className={`h-5 w-5 ${m.color}`} />
                    <div>
                      <p className="text-xs text-muted-foreground/70">
                        {m.label}
                      </p>
                      {loading ? (
                        <Skeleton className="h-5 w-10 bg-secondary" />
                      ) : (
                        <p className="text-xl font-bold text-foreground">
                          {m.value}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Próximas consultas — tabela */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  Próximas Consultas
                </CardTitle>
                <CardDescription className="text-muted-foreground/70">
                  Agendamentos futuros confirmados ou pendentes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="space-y-3 p-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full bg-secondary" />
                    ))}
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground/70">
                    Nenhuma consulta futura encontrada.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground/70">
                          Data
                        </TableHead>
                        <TableHead className="text-muted-foreground/70">
                          Horário
                        </TableHead>
                        {/* ← Colunas agora exibem nomes reais */}
                        <TableHead className="text-muted-foreground/70">
                          Paciente
                        </TableHead>
                        <TableHead className="text-muted-foreground/70">
                          Médico
                        </TableHead>
                        <TableHead className="text-muted-foreground/70">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingAppointments.map((appt) => {
                        const { date, time } = formatDateTime(
                          appt.scheduled_at,
                        );
                        return (
                          <TableRow
                            key={appt.id}
                            className="border-border hover:bg-secondary/40"
                          >
                            <TableCell className="font-medium text-foreground/70">
                              {date}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {time}
                            </TableCell>
                            {/* ← Nomes reais em vez de UUID truncado */}
                            <TableCell className="text-sm text-foreground/80">
                              {appt.patient_name ?? "—"}
                            </TableCell>
                            <TableCell className="text-sm text-foreground/80">
                              {appt.doctor_name ?? "—"}
                            </TableCell>
                            <TableCell>
                              <AppointmentStatusBadge status={appt.status} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* LineChart — Absenteísmo ao longo da semana */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-amber-400" />
                  Tendência de Absenteísmo — 7 dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-40 w-full bg-secondary" />
                ) : (
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={weeklyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1e293b"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="dia"
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="ausentes"
                        name="Ausências"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: "#f59e0b", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Usuários ── */}
          <TabsContent value="users" className="mt-4 space-y-4">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                    <Users className="h-4 w-4 text-violet-400" />
                    Últimos Usuários Cadastrados
                  </CardTitle>
                  <CardDescription className="text-muted-foreground/70">
                    Os 8 usuários mais recentes do sistema
                  </CardDescription>
                </div>
                <Link href="/manager/usuario">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-foreground/70 hover:bg-secondary"
                  >
                    Ver todos
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="space-y-3 p-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full bg-secondary" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3 w-32 bg-secondary" />
                          <Skeleton className="h-3 w-48 bg-secondary" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentUsers.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground/70">
                    Nenhum usuário encontrado.
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {recentUsers.map((user) => {
                      const name = user.full_name || "Usuário";
                      const initials = getInitials(name);
                      const roleLabel = ROLE_LABELS[user.role] ?? user.role;
                      const roleColor =
                        ROLE_COLORS[user.role] ??
                        "bg-slate-500/10 text-muted-foreground";
                      const createdAt = user.created_at
                        ? new Date(user.created_at).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "—";

                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-secondary/40"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border">
                              <AvatarFallback className="bg-blue-500/20 text-blue-300 text-xs font-medium">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground/90">
                                {name}
                              </p>
                              <p className="text-xs text-muted-foreground/70">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${roleColor}`}
                            >
                              {roleLabel}
                            </span>
                            <span className="text-xs text-muted-foreground/50">
                              {createdAt}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Médicos cadastrados */}
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-blue-400" />
                    Médicos Cadastrados
                  </CardTitle>
                  <CardDescription className="text-muted-foreground/70">
                    {doctors.filter((d) => d.active !== false).length} ativos de{" "}
                    {doctors.length} no total
                  </CardDescription>
                </div>
                <Link href="/manager/medicos">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-foreground/70 hover:bg-secondary"
                  >
                    Gerenciar
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="space-y-3 p-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full bg-secondary" />
                    ))}
                  </div>
                ) : doctors.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground/70">
                    Nenhum médico cadastrado.
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {doctors.slice(0, 5).map((doc, i) => {
                      const name = doc.full_name || "Sem nome";
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-secondary/40"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border">
                              <AvatarFallback className="bg-violet-500/20 text-violet-300 text-xs font-medium">
                                {getInitials(name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground/90">
                                {name}
                              </p>
                              <p className="text-xs text-muted-foreground/70">
                                {doc.specialty ?? "Especialidade não informada"}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                              doc.active !== false
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-500/10 text-muted-foreground border-slate-500/20"
                            }`}
                          >
                            {doc.active !== false ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Sidebar>
  );
}

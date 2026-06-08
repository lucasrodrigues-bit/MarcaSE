"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Stethoscope,
  CalendarCheck,
  Users,
  ShieldCheck,
  Clock,
  BarChart2,
  ArrowRight,
  CheckCircle2,
  UserCog,
  HeartPulse,
  ClipboardList,
  CalendarClock,
  Lock,
  Zap,
  Phone,
  Mail,
  MapPin,
  Star,
} from "lucide-react"

// ─── Dados ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Stethoscope,
    title: "Atendimentos",
    description:
      "Gerencie consultas e histórico médico com facilidade. Informações centralizadas e acessíveis para toda a equipe.",
  },
  {
    icon: CalendarCheck,
    title: "Agendamentos",
    description:
      "Organização completa da agenda da clínica. Reduza ausências com confirmação automática e lembretes.",
  },
  {
    icon: Users,
    title: "Pacientes",
    description:
      "manager/medicostro e controle inteligente de pacientes. Prontuários e históricos em um só lugar, sempre atualizados.",
  },
  {
    icon: ClipboardList,
    title: "Laudos",
    description:
      "Emita e gerencie laudos médicos digitalmente. Acesso rápido ao histórico de exames e resultados.",
  },
  {
    icon: CalendarClock,
    title: "Disponibilidade",
    description:
      "Defina horários de atendimento por médico. Controle bloqueios, exceções e janelas abertas com precisão.",
  },
  {
    icon: BarChart2,
    title: "Relatórios",
    description:
      "Métricas e indicadores em tempo real para decisões estratégicas. Visualize o desempenho da clínica.",
  },
]

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "manager/medicostro simples",
    description:
      "Administradores configuram médicos, secretárias e a agenda da clínica em poucos minutos.",
  },
  {
    step: "02",
    title: "Agendamento fácil",
    description:
      "Pacientes e secretárias agendam consultas com visibilidade total de horários disponíveis.",
  },
  {
    step: "03",
    title: "Atendimento organizado",
    description:
      "Médicos acessam prontuários, emitem laudos e controlam sua agenda diretamente no sistema.",
  },
  {
    step: "04",
    title: "Gestão completa",
    description:
      "Gestores acompanham métricas, relatórios e o desempenho geral da clínica em tempo real.",
  },
]

const PROFILES = [
  {
    icon: UserCog,
    role: "Gestor",
    color: "bg-violet-50 border-violet-200 text-violet-700",
    iconBg: "bg-violet-100 text-violet-600",
    items: ["Dashboard completo", "Gestão de usuários", "Relatórios e métricas", "Controle de laudos"],
  },
  {
    icon: Stethoscope,
    role: "Médico",
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    iconBg: "bg-emerald-100 text-emerald-600",
    items: ["Agenda pessoal", "Gestão de pacientes", "Emissão de laudos", "Controle de disponibilidade"],
  },
  {
    icon: HeartPulse,
    role: "Secretária",
    color: "bg-sky-50 border-sky-200 text-sky-700",
    iconBg: "bg-sky-100 text-sky-600",
    items: ["Agendamento de consultas", "Gestão de pacientes", "Consulta de médicos", "Controle de agenda"],
  },
  {
    icon: Users,
    role: "Paciente",
    color: "bg-amber-50 border-amber-200 text-amber-700",
    iconBg: "bg-amber-100 text-amber-600",
    items: ["Agendamento online", "Histórico de consultas", "Acesso a laudos", "Dados pessoais"],
  },
]

const TRUST = [
  { icon: ShieldCheck, label: "LGPD Compliant", description: "Dados protegidos conforme a lei." },
  { icon: Lock, label: "Acesso por perfil", description: "Cada usuário vê apenas o que precisa." },
  { icon: Clock, label: "Disponível 24/7", description: "Sistema online, sem horário de corte." },
  { icon: Zap, label: "Tempo real", description: "Atualizações instantâneas para toda a equipe." },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">

      {/* ── Top bar ── */}
      <div className="bg-primary text-primary-foreground text-xs py-2 px-6 flex flex-col sm:flex-row justify-between items-center gap-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 opacity-80" />
            Seg – Sex: 08h00 – 21h00
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 opacity-80" />
            (79) 3000-0000
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 opacity-80" />
            contato@marcase.com
          </span>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="h-[68px] border-b border-border bg-background/90 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src="/Logo MedConnect.png"
            alt="MarcaSE Logo"
            width={38}
            height={38}
            className="object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-lg tracking-tight text-foreground">MarcaSE</span>
            <span className="text-[9px] text-muted-foreground/70 tracking-widest uppercase">Saúde Digital</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Funcionalidades
          </button>
          <button
            onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Como funciona
          </button>
          <button
            onClick={() => document.getElementById("profiles")?.scrollIntoView({ behavior: "smooth" })}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Perfis
          </button>
        </nav>

        <Link href="/login">
          <Button className="rounded-full px-6 shadow-sm hover:shadow-md transition-all gap-1.5">
            Acessar sistema
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="flex items-center justify-center px-6 md:px-12 py-20 md:py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 70% 60% at 10% -10%, oklch(0.48 0.19 242 / 0.1), transparent),
              radial-gradient(ellipse 50% 40% at 90% 110%, oklch(0.5 0.16 210 / 0.07), transparent)
            `,
          }}
        />

        <div className="max-w-4xl w-full text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm text-primary font-medium mb-6 shadow-sm">
            <HeartPulse className="w-3.5 h-3.5" />
            Sistema completo de gestão clínica — Sergipe
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-[4.5rem] font-extrabold leading-[1.1] tracking-tight text-foreground">
            A gestão da sua clínica
            <br />
            <span className="text-primary">simples e profissional</span>
          </h1>

          <p className="mt-6 text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Controle pacientes, agendamentos, laudos e atendimentos em um único sistema.
            Pensado para clínicas médicas que buscam eficiência e organização.
          </p>

          <div className="mt-10 flex gap-3 justify-center flex-wrap">
            <Link href="/login">
              <Button
                size="lg"
                className="shadow-md hover:shadow-lg hover:scale-[1.02] transition-all gap-2 px-8 rounded-full h-12"
              >
                Acessar o sistema
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="px-8 rounded-full h-12 border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all"
              onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
            >
              Como funciona
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 divide-x divide-border max-w-sm mx-auto bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {[
              { value: "4", label: "Perfis de acesso" },
              { value: "24/7", label: "Disponível" },
              { value: "LGPD", label: "Compliant" },
            ].map((stat) => (
              <div key={stat.label} className="text-center py-4 px-1">
                <p className="text-xl font-bold text-primary">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider leading-tight">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-6 md:px-12 py-16 bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Funcionalidades</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Tudo que sua clínica precisa</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              Do agendamento ao laudo, cada funcionalidade foi pensada para o fluxo real de uma clínica médica.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <CardContent className="p-6">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <f.icon className="w-5 h-5 text-primary" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section id="how" className="px-6 md:px-12 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Como funciona</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Simples de usar, do primeiro acesso</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(100%-1rem)] w-8 h-px bg-border z-10" />
                )}
                <div className="flex flex-col gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Perfis de acesso ── */}
      <section id="profiles" className="px-6 md:px-12 py-16 bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Perfis de acesso</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Para cada função, uma visão ideal</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              Quatro perfis distintos com permissões específicas para cada membro da equipe.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROFILES.map((p) => (
              <div
                key={p.role}
                className={`rounded-2xl border p-5 flex flex-col gap-4 ${p.color}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.iconBg}`}>
                  <p.icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-bold text-sm">{p.role}</h3>
                <ul className="space-y-1.5">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs opacity-80">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 opacity-60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Confiança e segurança ── */}
      <section className="px-6 md:px-12 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Segurança</p>
            <h2 className="text-2xl font-bold text-foreground">Confiável por design</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((t) => (
              <div key={t.label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <t.icon className="w-4 h-4 text-primary" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="px-6 md:px-12 pb-20">
        <div
          className="max-w-3xl mx-auto rounded-3xl p-10 md:p-14 text-center border border-primary/15 shadow-sm relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, oklch(0.48 0.19 242 / 0.06), oklch(0.5 0.16 210 / 0.04))`,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 60% 60% at 50% 0%, oklch(0.48 0.19 242 / 0.08), transparent)`,
            }}
          />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5">
              <Star className="w-3 h-3" />
              Acesso imediato
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Pronto para transformar sua clínica?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-sm leading-relaxed">
              Acesse o MarcaSE agora e leve a gestão da sua clínica a um novo nível.
              Simples, rápido e profissional.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="shadow-md hover:shadow-lg hover:scale-[1.02] transition-all gap-2 px-10 rounded-full h-12"
              >
                Entrar no sistema
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-muted/20 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/Logo MedConnect.png"
              alt="MarcaSE"
              width={22}
              height={22}
              className="object-contain opacity-60"
            />
            <div>
              <span className="font-semibold text-sm text-foreground">MarcaSE</span>
              <p className="text-xs text-muted-foreground">Sistema de gestão clínica</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              <span>Sergipe, Brasil</span>
            </div>
            <span>© {new Date().getFullYear()} MarcaSE — Todos os direitos reservados</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              contato@marcase.com
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              (79) 3000-0000
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
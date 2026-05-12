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
} from "lucide-react"

const FEATURES = [
  {
    icon: Stethoscope,
    title: "Atendimentos",
    description:
      "Gerencie consultas e histórico médico com facilidade. Informações centralizadas e acessíveis.",
  },
  {
    icon: CalendarCheck,
    title: "Agendamentos",
    description:
      "Organização completa da agenda da clínica. Reduza ausências com confirmação automática.",
  },
  {
    icon: Users,
    title: "Pacientes",
    description:
      "Cadastro e controle inteligente de clientes. Prontuários e históricos em um só lugar.",
  },
]

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    label: "Dados seguros",
    description: "Criptografia e controle de acesso por perfil.",
  },
  {
    icon: Clock,
    label: "Tempo real",
    description: "Atualizações instantâneas para toda a equipe.",
  },
  {
    icon: BarChart2,
    label: "Relatórios",
    description: "Métricas e indicadores para decisões estratégicas.",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">

      {/* ── Top bar ── */}
      <div className="bg-primary text-primary-foreground text-xs py-2 px-6 flex justify-between items-center">
        <span>Seg – Sex: 08h00 – 21h00</span>
        <span>contato@marcase.com</span>
      </div>

      {/* ── Header ── */}
      <header className="h-[68px] border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Image
            src="/Logo MedConnect.png"
            alt="MarcaSE Logo"
            width={36}
            height={36}
            className="object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-lg tracking-tight text-foreground">
              MarcaSE
            </span>
            <span className="text-[9px] text-muted-foreground/60 tracking-widest uppercase">
              Saúde Digital
            </span>
          </div>
        </div>

        <Link href="/login">
          <Button className="rounded-full px-6 shadow-sm hover:shadow-md transition-all gap-1.5">
            Entrar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="flex-1 flex items-center justify-center px-6 md:px-12 py-20 relative overflow-hidden">

        {/* Gradiente de fundo em duas camadas */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 20% 0%, oklch(0.52 0.18 195 / 0.14), transparent),
              radial-gradient(ellipse 50% 40% at 80% 100%, oklch(0.55 0.2 265 / 0.08), transparent)
            `,
          }}
        />

        <div className="max-w-3xl w-full text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-sm text-muted-foreground mb-6 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Sistema de gestão clínica — Sergipe
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-foreground">
            Gestão inteligente
            <br />
            <span className="text-primary">para clínicas modernas</span>
          </h1>

          {/* Subtítulo */}
          <p className="mt-6 text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
            Controle pacientes, agendamentos e atendimentos com eficiência.
            Um sistema simples, rápido e profissional.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex gap-4 justify-center flex-wrap">
            <Link href="/login">
              <Button
                size="lg"
                className="shadow-md hover:shadow-lg hover:scale-[1.02] transition-all gap-2 px-8 rounded-full"
              >
                Acessar sistema
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="hover:bg-muted transition-all px-8 rounded-full"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              Ver funcionalidades
            </Button>
          </div>

          {/* Stats rápidas — agrupadas em card */}
          <div className="mt-16 grid grid-cols-3 divide-x divide-border max-w-md mx-auto bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {[
              { value: "100%", label: "Web-based" },
              { value: "24/7", label: "Disponível" },
              { value: "LGPD", label: "Compliant" },
            ].map((stat) => (
              <div key={stat.label} className="text-center py-4 px-2">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features principais ── */}
      <section id="features" className="px-6 md:px-12 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            Tudo que sua clínica precisa
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all group"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 group-hover:from-primary/30 transition-all">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base text-foreground mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Diferenciais ── */}
      <section
        className="border-y border-border px-6 md:px-12 py-14"
        style={{
          background: "linear-gradient(135deg, oklch(0.94 0.02 240 / 0.6), oklch(0.93 0.04 265 / 0.3))",
        }}
      >
        <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-primary/10">
                <h.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{h.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  {h.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="px-6 md:px-12 py-16">
        <div
          className="max-w-2xl mx-auto rounded-3xl p-10 text-center border border-primary/15 shadow-sm"
          style={{
            background: "linear-gradient(135deg, oklch(0.52 0.18 195 / 0.06), oklch(0.55 0.2 265 / 0.05))",
          }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Pronto para começar?
          </h2>
          <p className="text-muted-foreground mb-8">
            Acesse o sistema agora e transforme a gestão da sua clínica.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="shadow-md hover:shadow-lg hover:scale-[1.02] transition-all gap-2 px-10 rounded-full"
            >
              Entrar no sistema
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-6 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Image
            src="/Logo MedConnect.png"
            alt="MarcaSE"
            width={20}
            height={20}
            className="object-contain opacity-60"
          />
          <span>MarcaSE</span>
        </div>
        <span>© {new Date().getFullYear()} MarcaSE — Sistema de gestão clínica</span>
      </footer>
    </div>
  )
}

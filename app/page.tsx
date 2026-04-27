"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Stethoscope, CalendarCheck, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">

      {/* TOP BAR */}
      <div className="bg-primary text-primary-foreground text-xs py-2 px-4 flex justify-between">
        <span>08h00 - 21h00</span>
        <span>contato@marcase.com</span>
      </div>

      {/* HEADER */}
      <header className="h-[70px] border-b bg-white/70 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        
        {/* LOGO + NOME */}
        <div className="flex items-center gap-3">
          <Image
            src="/Logo MedConnect.png"
            alt="MarcaSE Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="font-semibold text-xl tracking-tight">
            MarcaSE
          </span>
        </div>

        {/* LOGIN */}
        <Link href="/login">
          <Button className="rounded-full px-6 shadow-md hover:shadow-lg transition-all">
            Entrar
          </Button>
        </Link>
      </header>

      {/* HERO */}
      <section className="flex-1 flex items-center justify-center px-6 md:px-12 py-16 relative overflow-hidden">

        {/* BACKGROUND GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-400/10 to-transparent pointer-events-none" />

        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center relative z-10">

          {/* TEXTO */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Gestão inteligente para clínicas modernas
            </h1>

            <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
              Controle pacientes, agendamentos e atendimentos com eficiência.
              Um sistema simples, rápido e profissional.
            </p>

            <div className="mt-8 flex gap-4 flex-wrap">
              <Link href="/login">
                <Button size="lg" className="shadow-lg hover:scale-[1.02] transition-all">
                  Acessar sistema
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="hover:bg-muted transition-all"
              >
                Ver funcionalidades
              </Button>
            </div>
          </div>

          {/* CARD VISUAL (SUBSTITUI IMAGEM GENÉRICA) */}
          <div className="flex justify-center">
  <div className="relative w-full max-w-md h-[320px] rounded-2xl overflow-hidden shadow-2xl group">
    
    <Image
      src="https://t4.ftcdn.net/jpg/03/20/52/31/360_F_320523164_tx7Rdd7I2XDTvvKfz2oRuRpKOPE5z0ni.jpg"
      alt="Preview do sistema"
      fill
      className="object-cover group-hover:scale-105 transition-all duration-500"
      priority
    />

    {/* Overlay elegante */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

    {/* Texto sutil */}
    <div className="absolute bottom-4 left-4 text-white text-sm opacity-90">
      Interface do sistema
    </div>
  </div>
</div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3">

          <Card className="rounded-2xl shadow-sm hover:shadow-xl transition-all border">
            <CardContent className="p-6">
              <Stethoscope className="text-primary mb-4" />
              <h3 className="font-semibold text-lg">
                Atendimentos
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Gerencie consultas e histórico médico com facilidade.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm hover:shadow-xl transition-all border">
            <CardContent className="p-6">
              <CalendarCheck className="text-primary mb-4" />
              <h3 className="font-semibold text-lg">
                Agendamentos
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Organização completa da agenda da clínica.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm hover:shadow-xl transition-all border">
            <CardContent className="p-6">
              <Users className="text-primary mb-4" />
              <h3 className="font-semibold text-lg">
                Pacientes
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Cadastro e controle inteligente de clientes.
              </p>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} MarcaSE — Sistema de gestão clínica
      </footer>

    </div>
  )
}
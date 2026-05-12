// Caminho: app/login/page.tsx

"use client";

import { usersService } from "@/services/usersApi.mjs";
import { LoginForm } from "@/components/LoginForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, X, Shield } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleOpenModal = () => {
    const emailInput = document.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement;
    if (emailInput?.value) {
      setEmail(emailInput.value);
    }
    setIsModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setMessage({
        type: "error",
        text: "Por favor, insira um e-mail válido.",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const data = await usersService.resetPassword(email);
      console.log("Resposta resetPassword:", data);

      setMessage({
        type: "success",
        text: "E-mail de recuperação enviado! Verifique sua caixa de entrada.",
      });

      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
        setEmail("");
      }, 2000);
    } catch (error) {
      console.error("Erro no reset de senha:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Erro ao enviar e-mail. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMessage(null);
    setEmail("");
  };

  return (
    <>
      {/* ── Fundo com gradiente em duas camadas ── */}
      <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden px-4">

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at -10% 10%, oklch(0.52 0.18 195 / 0.1), transparent),
              radial-gradient(ellipse 60% 50% at 110% 90%, oklch(0.55 0.2 265 / 0.08), transparent)
            `,
          }}
        />

        {/* ── Link de volta ── */}
        <div className="absolute top-6 left-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>

        {/* ── Card de login ── */}
        <div className="w-full max-w-md bg-card border border-border/60 rounded-3xl shadow-2xl p-10 ring-1 ring-primary/5 relative z-10">

          {/* Logo + nome */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <img
              src="/Logo MedConnect.png"
              alt="Logo MediConnect"
              className="w-14 h-14 object-contain"
            />
            <span className="text-3xl font-extrabold text-primary">
              MarcaSE
            </span>
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Acesse sua conta
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Bem-vindo(a) de volta ao MarcaSE!
            </p>
          </div>

          {/* Formulário */}
          <LoginForm>
            <div className="mt-4 text-center text-sm">
              <button
                onClick={handleOpenModal}
                className="text-muted-foreground hover:text-primary cursor-pointer underline bg-transparent border-none transition-colors"
              >
                Esqueceu sua senha?
              </button>
            </div>
          </LoginForm>

          {/* Cadastro */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Não tem uma conta de paciente?{" "}
            </span>
            <Link href="/patient/register">
              <span className="font-semibold text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors">
                Crie uma agora
              </span>
            </Link>
          </div>
        </div>

        {/* Rodapé de segurança */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground/60 relative z-10">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary/50" />
            <span>Conexão segura</span>
          </div>
          <span className="text-border hidden sm:inline">|</span>
          <span>Dados protegidos — LGPD</span>
          <span className="text-border hidden sm:inline">|</span>
          <span>MarcaSE 2025</span>
        </div>
      </div>

      {/* ── Modal de Recuperação de Senha ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-md bg-card border border-border p-8 rounded-3xl shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">
                Recuperar Senha
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                Insira seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  className="w-full"
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                />
              </div>

              {message && (
                <div
                  className={`p-3 rounded-xl text-sm ${
                    message.type === "success"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Enviando..." : "Resetar Senha"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

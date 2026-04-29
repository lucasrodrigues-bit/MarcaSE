// ARQUIVO CORRIGIDO: components/LoginForm.tsx

"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/api.mjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { usersService } from "@/services/usersApi.mjs";

interface LoginFormProps {
  children?: React.ReactNode;
}

interface FormState {
  email: string;
  password: string;
}

export function LoginForm({ children }: LoginFormProps) {
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // ──────────────────────────────────────────────────────────────────────────
  // Redireciona o usuário para o dashboard correspondente ao perfil escolhido.
  // ──────────────────────────────────────────────────────────────────────────
  const handleRoleSelection = (selectedDashboardRole: string, user: any) => {
    if (!user) {
      toast({
        title: "Erro de Sessão",
        description:
          "Não foi possível encontrar os dados do usuário. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    const roleInLowerCase = selectedDashboardRole.toLowerCase();
    console.log("Salvando no localStorage com o perfil:", roleInLowerCase);

    const completeUserInfo = {
      ...user,
      user_metadata: { ...user.user_metadata, role: roleInLowerCase },
    };
    localStorage.setItem("user_info", JSON.stringify(completeUserInfo));

    const dashboardMap: Record<string, string> = {
      gestor: "/manager/dashboard",
      admin: "/manager/dashboard",
      medico: "/doctor/dashboard",
      secretaria: "/secretary/dashboard",
      paciente: "/patient/dashboard",
    };

    const redirectPath = dashboardMap[roleInLowerCase];

    if (redirectPath) {
      toast({ title: `Entrando como ${roleInLowerCase}...` });
      router.push(redirectPath);
    } else {
      toast({
        title: "Erro",
        description: "Perfil selecionado inválido.",
        variant: "destructive",
      });
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Submit do formulário de login.
  // ──────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    localStorage.removeItem("token");
    localStorage.removeItem("user_info");

    try {
      // 1. Autentica e obtém o token JWT
      const authData = await login(form.email, form.password);
      const user = authData.user;

      if (!user || !user.id) {
        throw new Error("Resposta de autenticação inválida.");
      }

      // ✅ CORREÇÃO BUG 1:
      // A chamada abaixo foi REMOVIDA. Ela fazia um GET em /rest/v1/user_roles
      // diretamente via REST, mas essa tabela possui RLS que bloqueava a query
      // logo após o login. O erro era capturado pelo catch, apagava o token e
      // exibia "Erro no Login" — simulando credenciais inválidas mesmo com o
      // auth tendo funcionado corretamente. A variável `rolesData` também nunca
      // era utilizada em lugar algum.
      //
      // REMOVIDO:
      // const rolesData = await api.get(
      //   `/rest/v1/user_roles?user_id=eq.${user.id}&select=role`
      // );

      // 2. Busca perfis do usuário via Edge Function (já autenticada)
      const me = await usersService.getMeSimple();
      console.log("Perfis encontrados:", me.roles);

      if (!me.roles || me.roles.length === 0) {
        throw new Error(
          "Nenhum perfil de acesso foi encontrado para este usuário.",
        );
      }

      // 3. Se houver apenas um perfil, entra direto.
      //    Se houver múltiplos, poderia apresentar seleção (ver estados abaixo).
      handleRoleSelection(me.roles[0], user);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_info");
      toast({
        title: "Erro no Login",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-transparent border-0 shadow-none">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="pl-10 h-11 focus-visible:ring-blue-600 focus-visible:ring-2"
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="pl-10 pr-12 h-11 focus-visible:ring-blue-600 focus-visible:ring-2"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
        {children}
      </CardContent>
    </Card>
  );
}

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { api } from "@/services/api.mjs";
import { usersService } from "@/services/usersApi.mjs";
import { useAccessibility } from "@/app/context/AccessibilityContext";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck2,
  CalendarRange,
  Users,
  UserCircle,
  UserCog,
  FileText,
  Stethoscope,
  HeartPulse,
  Activity,
} from "lucide-react";

import UserTopbarMenu from "@/components/ui/userToolTip";

interface UserData {
  id: string;
  email: string;
  app_metadata: {
    user_role: string;
  };
  user_metadata: {
    cpf: string;
    email_verified: boolean;
    full_name: string;
    phone_mobile: string;
    role: string;
    avatar_url?: string;
  };
  identities: {
    identity_id: string;
    id: string;
    user_id: string;
    provider: string;
  }[];
  is_anonymous: boolean;
}

interface MenuItem {
  href: string;
  icon: React.ElementType;
  label: string;
  description?: string;
}

interface SidebarProps {
  children: React.ReactNode;
}

const roleLabelMap: Record<string, { label: string; color: string }> = {
  gestor: {
    label: "Gestor",
    color: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  },
  admin: {
    label: "Admin",
    color: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  },
  medico: {
    label: "Médico",
    color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  secretaria: {
    label: "Secretaria",
    color: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  },
  paciente: {
    label: "Paciente",
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
};

export default function Sidebar({ children }: SidebarProps) {
  const [userData, setUserData] = useState<UserData>();
  const [role, setRole] = useState<string>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [avatarFullUrl, setAvatarFullUrl] = useState<string | undefined>(
    undefined,
  );
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const buildAvatarUrl = (path: string) => {
    if (!path) return undefined;
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const separator = cleanPath.includes("?") ? "&" : "?";
    return `${baseUrl}/storage/v1/object/avatars/${cleanPath}${separator}t=${new Date().getTime()}`;
  };

  const { theme, contrast } = useAccessibility();

  useEffect(() => {
    const userInfoString = localStorage.getItem("user_info");
    const token = localStorage.getItem("token");

    if (userInfoString && token) {
      try {
        const userInfo = JSON.parse(userInfoString);
        let rawAvatarPath =
          userInfo.profile?.avatar_url ||
          userInfo.user_metadata?.avatar_url ||
          userInfo.app_metadata?.avatar_url ||
          "";

        setUserData({
          id: userInfo.id ?? "",
          email: userInfo.email ?? "",
          app_metadata: {
            user_role: userInfo.app_metadata?.user_role ?? "patient",
          },
          user_metadata: {
            cpf: userInfo.user_metadata?.cpf ?? "",
            email_verified: userInfo.user_metadata?.email_verified ?? false,
            full_name:
              userInfo.user_metadata?.full_name ||
              userInfo.profile?.full_name ||
              "Usuário",
            phone_mobile: userInfo.user_metadata?.phone_mobile ?? "",
            role: userInfo.user_metadata?.role ?? "",
            avatar_url: rawAvatarPath,
          },
          identities: userInfo.identities ?? [],
          is_anonymous: userInfo.is_anonymous ?? false,
        });

        setRole(userInfo.user_metadata?.role);
        if (rawAvatarPath) setAvatarFullUrl(buildAvatarUrl(rawAvatarPath));

        if (!rawAvatarPath || !userInfo.profile) {
          usersService
            .getMe()
            .then((freshData) => {
              if (freshData?.profile) {
                const freshAvatar = freshData.profile.avatar_url;
                const updatedUserInfo = {
                  ...userInfo,
                  profile: freshData.profile,
                  user_metadata: {
                    ...userInfo.user_metadata,
                    avatar_url:
                      freshAvatar || userInfo.user_metadata.avatar_url,
                  },
                };
                localStorage.setItem(
                  "user_info",
                  JSON.stringify(updatedUserInfo),
                );
                if (freshAvatar && freshAvatar !== rawAvatarPath) {
                  setAvatarFullUrl(buildAvatarUrl(freshAvatar));
                  setUserData((prev) =>
                    prev
                      ? {
                          ...prev,
                          user_metadata: {
                            ...prev.user_metadata,
                            avatar_url: freshAvatar,
                          },
                        }
                      : undefined,
                  );
                }
              }
            })
            .catch((err) =>
              console.error("[Sidebar] Falha no auto-reparo:", err),
            );
        }
      } catch (e) {
        console.error("Erro ao processar dados do usuário na Sidebar:", e);
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => setShowLogoutDialog(true);
  const confirmLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    } finally {
      localStorage.removeItem("user_info");
      localStorage.removeItem("token");
      Cookies.remove("access_token");
      setShowLogoutDialog(false);
      router.push("/");
    }
  };
  const cancelLogout = () => setShowLogoutDialog(false);

  const SetMenuItems = (role: any): MenuItem[] => {
    const patientItems: MenuItem[] = [
      {
        href: "/patient/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        description: "Visão geral",
      },
      {
        href: "/patient/schedule",
        icon: CalendarPlus,
        label: "Agendar Consulta",
        description: "Nova consulta",
      },
      {
        href: "/patient/appointments",
        icon: CalendarCheck2,
        label: "Minhas Consultas",
        description: "Histórico",
      },
      {
        href: "/patient/reports",
        icon: FileText,
        label: "Meus Laudos",
        description: "Documentos",
      },
      {
        href: "/patient/profile",
        icon: UserCircle,
        label: "Meus Dados",
        description: "Perfil",
      },
    ];

    const doctorItems: MenuItem[] = [
      {
        href: "/doctor/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        description: "Visão geral",
      },
      {
        href: "/doctor/medicos",
        icon: HeartPulse,
        label: "Gestão de Pacientes",
        description: "Pacientes",
      },
      {
        href: "/doctor/consultas",
        icon: Stethoscope,
        label: "Consultas",
        description: "Atendimentos",
      },
      {
        href: "/doctor/disponibilidade",
        icon: CalendarRange,
        label: "Disponibilidade",
        description: "Agenda",
      },
    ];

    const secretaryItems: MenuItem[] = [
      {
        href: "/secretary/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        description: "Visão geral",
      },
      {
        href: "/secretary/appointments",
        icon: CalendarCheck2,
        label: "Consultas",
        description: "Agendamentos",
      },
      {
        href: "/secretary/schedule",
        icon: CalendarPlus,
        label: "Agendar Consulta",
        description: "Nova consulta",
      },
      {
        href: "/secretary/pacientes",
        icon: Users,
        label: "Gestão de Pacientes",
        description: "Pacientes",
      },
    ];

    const managerItems: MenuItem[] = [
      {
        href: "/manager/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        description: "Visão geral",
      },
      {
        href: "/manager/usuario",
        icon: UserCog,
        label: "Gestão de Usuários",
        description: "Usuários",
      },
      {
        href: "/manager/home",
        icon: Stethoscope,
        label: "Gestão de Médicos",
        description: "Médicos",
      },
      {
        href: "/manager/pacientes",
        icon: Users,
        label: "Gestão de Pacientes",
        description: "Pacientes",
      },
      {
        href: "/secretary/appointments",
        icon: CalendarCheck2,
        label: "Consultas",
        description: "Agendamentos",
      },
      {
        href: "/manager/disponibilidade",
        icon: CalendarRange,
        label: "Disponibilidade",
        description: "Agenda",
      },
      {
        href: "/patient/reports",
        icon: CalendarRange,
        label: "Meus Laudos",
        description: "Laudos",
      },
      {
        href: "/patient/profile",
        icon: CalendarRange,
        label: "Meus Dados",
        description: "Dados do usuario",
      },
    ];

    switch (role) {
      case "gestor":
      case "admin":
        return managerItems;
      case "medico":
        return doctorItems;
      case "secretaria":
        return secretaryItems;
      case "paciente":
      default:
        return patientItems;
    }
  };

  const menuItems = SetMenuItems(role);
  const isDefaultMode = theme === "light" && contrast === "normal";
  const roleInfo = role ? roleLabelMap[role] : null;

  if (!userData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-muted-foreground animate-pulse" />
          <span className="text-sm text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-background flex">
        {/* ─── SIDEBAR ─────────────────────────────────────────────── */}
        <aside
          className={`
            fixed top-0 h-screen flex flex-col z-30
            transition-all duration-300 ease-in-out
            ${sidebarCollapsed ? "w-[68px]" : "w-64"}
            ${
              isDefaultMode
                ? "bg-[#0f2d4e] text-white shadow-xl shadow-black/20"
                : "bg-sidebar text-sidebar-foreground shadow-md"
            }
          `}
        >
          {/* ── LOGO ÁREA ─────────────────────────────────────── */}
          <div
            className={`
              flex items-center h-16 px-3 shrink-0
              border-b transition-colors duration-300
              ${isDefaultMode ? "border-white/10" : "border-sidebar-border"}
              ${sidebarCollapsed ? "justify-center" : "justify-between"}
            `}
          >
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className={`
                    rounded-xl p-1.5 shrink-0 transition-colors
                    ${isDefaultMode ? "bg-white/10 ring-1 ring-white/20" : "bg-background"}
                  `}
                >
                  <img
                    src="/Logo MedConnect.png"
                    alt="Logo MarcaSE"
                    className="w-9 h-9 object-contain"
                  />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-[15px] tracking-tight">
                    MarcaSE
                  </span>
                  <span
                    className={`text-[10px] font-medium tracking-widest uppercase mt-0.5
                      ${isDefaultMode ? "text-white/40" : "text-sidebar-foreground/40"}`}
                  >
                    Saúde Digital
                  </span>
                </div>
              </div>
            )}

            {sidebarCollapsed && (
              <div
                className={`
                  rounded-xl p-1.5
                  ${isDefaultMode ? "bg-white/10 ring-1 ring-white/20" : "bg-background"}
                `}
              >
                <img
                  src="/Logo MedConnect.png"
                  alt="Logo MarcaSE"
                  className="w-8 h-8 object-contain"
                />
              </div>
            )}

            {!sidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(true)}
                className={`
                  w-7 h-7 rounded-lg shrink-0 transition-colors
                  ${
                    isDefaultMode
                      ? "text-white/60 hover:text-white hover:bg-white/10"
                      : "hover:bg-sidebar-accent"
                  }
                `}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* ── ROLE BADGE ─────────────────────────────────────── */}
          {!sidebarCollapsed && roleInfo && (
            <div className="px-4 pt-4 pb-1">
              <span
                className={`
                  inline-flex items-center gap-1.5 text-[10px] font-semibold
                  tracking-widest uppercase px-2.5 py-1 rounded-full border
                  ${
                    isDefaultMode
                      ? "bg-white/10 text-white/70 border-white/20"
                      : roleInfo.color
                  }
                `}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                {roleInfo.label}
              </span>
            </div>
          )}

          {/* ── NAVIGATION ─────────────────────────────────────── */}
          <nav className="flex-1 px-2 py-3 overflow-y-auto flex flex-col gap-0.5 scrollbar-thin">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isHovered = hoveredItem === item.href;

              const navItem = (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div
                    className={`
                      relative flex items-center gap-3 rounded-xl
                      transition-all duration-150 ease-out
                      ${sidebarCollapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"}
                      ${
                        isActive
                          ? isDefaultMode
                            ? "bg-white/15 text-white shadow-sm"
                            : "bg-sidebar-primary text-sidebar-primary-foreground"
                          : isDefaultMode
                            ? "text-white/65 hover:text-white hover:bg-white/8"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/75"
                      }
                    `}
                    style={{
                      animationDelay: `${index * 40}ms`,
                    }}
                  >
                    {/* Active left indicator */}
                    {isActive && (
                      <span
                        className={`
                          absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full
                          ${isDefaultMode ? "bg-white" : "bg-sidebar-primary-foreground"}
                        `}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={`
                        flex items-center justify-center w-[18px] h-[18px] shrink-0
                        transition-transform duration-150
                        ${isActive || isHovered ? "scale-110" : "scale-100"}
                      `}
                    >
                      <Icon
                        className="w-[18px] h-[18px]"
                        strokeWidth={isActive ? 2.5 : 1.75}
                      />
                    </div>

                    {/* Label + Description */}
                    {!sidebarCollapsed && (
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-sm leading-none ${isActive ? "font-semibold" : "font-medium"}`}
                        >
                          {item.label}
                        </span>
                        {item.description && !isActive && (
                          <span
                            className={`text-[10px] mt-0.5 truncate
                              ${isDefaultMode ? "text-white/35" : "text-sidebar-foreground/40"}`}
                          >
                            {item.description}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              );

              return sidebarCollapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="flex flex-col gap-0.5"
                  >
                    <span className="font-semibold text-sm">{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </TooltipContent>
                </Tooltip>
              ) : (
                navItem
              );
            })}
          </nav>

          {/* ── EXPAND BUTTON (collapsed state) ────────────────── */}
          {sidebarCollapsed && (
            <div className="flex justify-center px-2 pb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarCollapsed(false)}
                    className={`
                      w-9 h-9 rounded-xl transition-colors
                      ${
                        isDefaultMode
                          ? "text-white/50 hover:text-white hover:bg-white/10"
                          : "hover:bg-sidebar-accent"
                      }
                    `}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Expandir menu</TooltipContent>
              </Tooltip>
            </div>
          )}
        </aside>

        {/* ─── MAIN CONTENT ────────────────────────────────────────── */}
        <div
          className={`
            flex-1 flex flex-col min-h-screen
            transition-all duration-300 ease-in-out
            ${sidebarCollapsed ? "ml-[68px]" : "ml-64"}
          `}
        >
          {/* ── TOPBAR ──────────────────────────────────────────── */}
          <header className="h-16 border-b flex items-center justify-end px-6 bg-background shrink-0">
            <UserTopbarMenu
              userData={userData}
              avatarUrl={avatarFullUrl}
              handleLogout={handleLogout}
              role={role}
            />
          </header>

          <main className="flex-1 p-4 md:p-6">{children}</main>

          {/* ── LOGOUT DIALOG ──────────────────────────────────── */}
          <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <LogOut className="w-5 h-5 text-destructive" />
                  Confirmar Saída
                </DialogTitle>
                <DialogDescription className="pt-1">
                  Deseja realmente sair do sistema? Você precisará fazer login
                  novamente para acessar sua conta.
                </DialogDescription>
              </DialogHeader>
              <Separator />
              <DialogFooter className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={cancelLogout}
                  className="flex-1 sm:flex-none"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmLogout}
                  className="flex-1 sm:flex-none gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
}

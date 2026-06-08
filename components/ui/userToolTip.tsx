"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserData {
  user_metadata: {
    full_name: string;
    role: string;
  };
  app_metadata: {
    user_role: string;
  };
  email: string;
}

const roleLabelMap: Record<string, string> = {
  gestor: "Gestor",
  admin: "Admin",
  medico: "Médico",
  secretaria: "Secretaria",
  paciente: "Paciente",
};

interface Props {
  userData: UserData;
  handleLogout: () => void;
  avatarUrl?: string;
  role?: string;
}

export default function UserTopbarMenu({
  userData,
  handleLogout,
  avatarUrl,
  role,
}: Props) {
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const roleLabel = role ? (roleLabelMap[role] ?? role) : "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 rounded-full hover:bg-muted/60 pl-1 pr-3 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={avatarUrl}
              alt={userData.user_metadata.full_name}
              className="object-cover"
            />
            <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-sm">
              {getInitials(userData.user_metadata.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start leading-none gap-0.5">
            <span className="text-sm font-medium text-foreground">
              {userData.user_metadata.full_name}
            </span>
            {roleLabel && (
              <span className="text-xs text-muted-foreground">{roleLabel}</span>
            )}
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5 pb-2">
          <span className="font-semibold">{userData.user_metadata.full_name}</span>
          <span className="text-xs text-muted-foreground font-normal">
            {userData.email}
          </span>
          {roleLabel && (
            <span className="text-xs text-muted-foreground font-normal">
              {roleLabel}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

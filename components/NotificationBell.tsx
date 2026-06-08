"use client";

import { Bell, CalendarCheck, CalendarX, FileText, Users, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, type NotificationItem } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  appointment:        { icon: CalendarCheck, color: "text-blue-500" },
  appointment_update: { icon: CalendarX,     color: "text-orange-500" },
  report:             { icon: FileText,       color: "text-emerald-500" },
  patient:            { icon: Users,          color: "text-violet-500" },
  doctor:             { icon: Stethoscope,    color: "text-sky-500" },
};

function NotifItem({ n }: { n: NotificationItem }) {
  const { icon: Icon, color } = TYPE_CONFIG[n.type] ?? { icon: Bell, color: "text-muted-foreground" };
  return (
    <div className="flex gap-3 px-4 py-3 border-b last:border-0">
      <div className={`mt-0.5 shrink-0 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{n.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{n.message}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {formatDistanceToNow(new Date(n.timestamp), { locale: ptBR, addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

interface Props {
  userId: string | undefined;
  role: string | undefined;
}

export default function NotificationBell({ userId, role }: Props) {
  const { notifications, unreadCount, markAllRead } = useNotifications(userId, role);

  if (!userId) return null;

  return (
    <Popover onOpenChange={(open) => { if (open) markAllRead(); }}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} nova{unreadCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-center px-6 gap-3">
              <Bell className="h-10 w-10 text-muted-foreground/25" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tudo em dia por aqui!</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Nenhuma atividade recente.</p>
              </div>
            </div>
          ) : (
            notifications.map((n) => <NotifItem key={n.id} n={n} />)
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
'use client';

import { useState } from 'react';
import { RootLayout } from '@/components/layout/RootLayout';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, CalendarDays, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mockAppointments = [
  { time: '08:00', patient: 'Maria Silva', type: 'Consulta', status: 'confirmado', color: 'bg-green-500' },
  { time: '08:30', patient: 'João Pedro', type: 'Retorno', status: 'pendente', color: 'bg-yellow-500' },
  { time: '09:00', patient: '-', type: '-', status: 'livre', color: 'bg-transparent' },
  { time: '09:30', patient: 'Ana Oliveira', type: 'Exame', status: 'faltou', color: 'bg-red-500' },
  { time: '10:00', patient: 'Carlos Henrique', type: 'Consulta', status: 'confirmado', color: 'bg-green-500' },
];

export default function AgendaPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <RootLayout>
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Sidebar Calendário */}
        <div className="w-full xl:w-80 space-y-4">
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Navegação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow-sm"
              />
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Legenda de Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                  <span className="text-sm font-medium">Confirmado</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></div>
                  <span className="text-sm font-medium">Aguardando IA</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-200"></div>
                  <span className="text-sm font-medium">Falta / Cancelado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Horários */}
        <div className="flex-1">
          <Card className="shadow-sm border-none bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Agenda do Dia {date?.toLocaleDateString('pt-BR')}
                </CardTitle>
                <CardDescription>Gerencie os agendamentos e arraste para reagendar (Simulação)</CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Novo Horário
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {mockAppointments.map((apt, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "group relative p-4 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing hover:shadow-md",
                      apt.status === 'livre' 
                        ? "border-dashed border-gray-100 bg-gray-50/50 text-muted-foreground opacity-60" 
                        : "border-transparent bg-white shadow-sm border-l-4",
                      apt.status === 'confirmado' && "border-l-emerald-500",
                      apt.status === 'pendente' && "border-l-amber-500",
                      apt.status === 'faltou' && "border-l-rose-500"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="font-mono text-xl font-bold text-gray-400 w-16">{apt.time}</div>
                        
                        <div className="flex flex-col">
                          <p className={cn(
                            "font-bold text-lg",
                            apt.status === 'livre' ? "text-gray-400" : "text-gray-900"
                          )}>
                            {apt.patient === '-' ? 'Horário Disponível' : apt.patient}
                          </p>
                          {apt.type !== '-' && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-2 py-0">
                                {apt.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">Dr. Ricardo Souza</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {apt.status !== 'livre' && (
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "capitalize px-3 py-1 border-none font-bold",
                              apt.status === 'confirmado' && "bg-emerald-50 text-emerald-700",
                              apt.status === 'pendente' && "bg-amber-50 text-amber-700",
                              apt.status === 'faltou' && "bg-rose-50 text-rose-700"
                            )}
                          >
                            {apt.status}
                          </Badge>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RootLayout>
  );
}

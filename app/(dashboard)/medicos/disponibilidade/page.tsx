'use client';

import { useState } from 'react';
import { RootLayout } from '@/components/layout/RootLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Plus, Trash2, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

const daysOfWeek = [
  { id: 'seg', name: 'Segunda-feira' },
  { id: 'ter', name: 'Terça-feira' },
  { id: 'qua', name: 'Quarta-feira' },
  { id: 'qui', name: 'Quinta-feira' },
  { id: 'sex', name: 'Sexta-feira' },
  { id: 'sab', name: 'Sábado' },
  { id: 'dom', name: 'Domingo' },
];

export default function DisponibilidadePage() {
  // Apenas mockup state
  const [activeDays, setActiveDays] = useState<Record<string, boolean>>({
    seg: true, ter: true, qua: true, qui: true, sex: true, sab: false, dom: false
  });

  const handleSave = () => {
    toast.success('Grade de horários salva com sucesso!');
  };

  return (
    <RootLayout>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Disponibilidade e Grade</h1>
          <p className="text-muted-foreground">Vincule os dias e horários de atendimento, e declare exceções ou férias.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Padrão</CardTitle>
                <CardDescription>
                  Estes são os horários fixos em que os agendamentos online e da secretaria estarão disponíveis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {daysOfWeek.map((day) => (
                  <div key={day.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-40 flex items-center space-x-2">
                      <Switch 
                        id={day.id} 
                        checked={activeDays[day.id]}
                        onCheckedChange={(c) => setActiveDays(prev => ({...prev, [day.id]: c}))}
                      />
                      <Label htmlFor={day.id} className="font-medium cursor-pointer">{day.name}</Label>
                    </div>
                    
                    {activeDays[day.id] ? (
                      <div className="flex flex-1 items-center gap-2">
                        <Input type="time" defaultValue="08:00" className="w-32" />
                        <span className="text-muted-foreground">-</span>
                        <Input type="time" defaultValue="18:00" className="w-32" />
                        
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:flex">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground flex-1 pt-2 sm:pt-0">Indisponível</div>
                    )}
                  </div>
                ))}
              </CardContent>
              <CardFooter className="bg-muted/30 border-t justify-end p-4">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" /> Salvar Grade
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Exceções */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <CalendarDays className="w-5 h-5"/>
                  Bloqueios e Exceções
                </CardTitle>
                <CardDescription>
                  Adicione férias, feriados ou bloqueios específicos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Feriado Nacional</p>
                      <p className="text-xs text-muted-foreground">01/05/2026</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Separator />

                <div className="space-y-3 pt-2">
                  <Label>Adicionar novo bloqueio</Label>
                  <Input type="text" placeholder="Motivo (Ex: Congresso)" />
                  <div className="flex gap-2">
                    <Input type="date" className="flex-1" />
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Plus className="w-4 h-4" /> Registrar Bloqueio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}

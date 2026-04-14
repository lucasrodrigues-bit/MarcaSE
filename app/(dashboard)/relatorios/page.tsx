'use client';

import { RootLayout } from '@/components/layout/RootLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, Download, Filter } from 'lucide-react';
import { useState } from 'react';

const absenteismoData = [
  { name: 'Seg', atual: 20, previsto: 25 },
  { name: 'Ter', atual: 15, previsto: 18 },
  { name: 'Qua', atual: 22, previsto: 30 },
  { name: 'Qui', atual: 12, previsto: 15 },
  { name: 'Sex', atual: 28, previsto: 35 },
  { name: 'Sáb', atual: 5, previsto: 10 },
];

const motivosFaltaData = [
  { name: 'Esquecimento', value: 45, color: '#f59e0b' },
  { name: 'Imprevisto Médico', value: 25, color: '#3b82f6' },
  { name: 'Falta de Transporte', value: 15, color: '#ef4444' },
  { name: 'Clima/Chuva', value: 10, color: '#8b5cf6' },
  { name: 'Outros', value: 5, color: '#64748b' },
];

export default function RelatoriosPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <RootLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics e Relatórios</h1>
            <p className="text-muted-foreground">Monitore o desempenho e reduza o absenteísmo na clínica.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Clock className="w-4 h-4" /> Periodo
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>

            <Select defaultValue="todos">
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2"/>
                <SelectValue placeholder="Médico / Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Médicos</SelectItem>
                <SelectItem value="dr_ricardo">Dr. Ricardo Souza</SelectItem>
                <SelectItem value="dra_carla">Dra. Carla Mendes</SelectItem>
              </SelectContent>
            </Select>

            <Button className="gap-2 bg-primary">
              <Download className="w-4 h-4"/> Exportar
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="tracking-tight text-sm font-medium">Consultas Realizadas</h3>
              </div>
              <div className="text-2xl font-bold">1,245</div>
              <p className="text-xs text-green-500 mt-1 inline-flex items-center">
                +15% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="tracking-tight text-sm font-medium">Taxa de Absenteísmo Atual</h3>
              </div>
              <div className="text-2xl font-bold text-red-500">18.4%</div>
              <p className="text-xs text-green-500 mt-1 inline-flex items-center">
                -4.2% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="tracking-tight text-sm font-medium">Lembretes IA Enviados</h3>
              </div>
              <div className="text-2xl font-bold">8,432</div>
              <p className="text-xs text-muted-foreground mt-1">
                WhatsApp e Email combinados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="tracking-tight text-sm font-medium">Faturamento Estimado Retido</h3>
              </div>
              <div className="text-2xl font-bold text-green-600">R$ 42.500</div>
              <p className="text-xs text-muted-foreground mt-1">
                Graças à redução nas faltas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Gráfico 1: Absenteísmo */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Absenteísmo: Atual vs. Previsto IA</CardTitle>
              <CardDescription>
                Acompanhamento semanal de faltas (em unidades). O modelo previu muito mais faltas do que as reais concretizadas após os *reminders*.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={absenteismoData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAtual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPrevisto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" name="Previsto (S/ IA)" dataKey="previsto" stroke="#ef4444" fillOpacity={1} fill="url(#colorPrevisto)" />
                    <Area type="monotone" name="Atual (Pos-Lembrete IA)" dataKey="atual" stroke="#10b981" fillOpacity={1} fill="url(#colorAtual)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico 2: Motivos das faltas */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Causas Mapeadas de Absenteísmo</CardTitle>
              <CardDescription>
                Respostas obtidas via bot de remarcação no WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={motivosFaltaData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {motivosFaltaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </RootLayout>
  );
}

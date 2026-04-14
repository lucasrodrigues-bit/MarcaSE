'use client';

import { useState } from 'react';
import { RootLayout } from '@/components/layout/RootLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bot, Save, FileText, Send, Printer } from 'lucide-react';

export default function LaudosPage() {
  const [template, setTemplate] = useState('cardiologia_retorno');

  return (
    <RootLayout>
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
        {/* Painel de Templates */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Assistente de Laudos
              </CardTitle>
              <CardDescription>
                Selecione o paciente e o template inteligente. A IA irá preencher os dados do histórico automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div className="space-y-2">
                <label className="text-sm font-medium">Paciente</label>
                <Select defaultValue="maria_silva">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maria_silva">Maria Silva (Cardiologia)</SelectItem>
                    <SelectItem value="joao_pedro">João Pedro (Clinico Geral)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Template Dinâmico</label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiologia_retorno">Cardiologia - Retorno Base</SelectItem>
                    <SelectItem value="encaminhamento_exame">Encaminhamento Universal</SelectItem>
                    <SelectItem value="atestado_padrao">Atestado Padrão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg border border-dashed">
                  <Bot className="h-4 w-4" />
                  O modelo "Cardiologia - Retorno" está otimizado para extrair dados dos últimos exames de sangue e aferições de pressão.
                </div>
                <Button className="w-full gap-2">
                  <Bot className="h-4 w-4" />
                  Gerar Rascunho com IA
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor Principal */}
        <div className="flex-1 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2 border-b bg-muted/20 flex flex-wrap gap-2 items-center justify-between">
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm">Negrito</Button>
                <Button variant="ghost" size="sm">Itálico</Button>
                <div className="w-px h-4 bg-border mx-2"></div>
                <Button variant="ghost" size="sm"><FileText className="w-4 h-4 mr-2" /> Template</Button>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm"><Printer className="w-4 h-4 mr-2"/>Imprimir</Button>
                <Button variant="outline" size="sm"><Send className="w-4 h-4 mr-2"/>Enviar via WhatsApp</Button>
                <Button size="sm"><Save className="w-4 h-4 mr-2"/>Finalizar</Button>
              </div>
            </div>
            
            <div className="p-8 flex-1 overflow-auto bg-white dark:bg-card">
              <div className="max-w-[21cm] mx-auto min-h-[29.7cm] p-[2cm] shadow-xl border bg-white text-zinc-900 rounded-sm">
                {/* Simulated Document Content */}
                <h1 className="text-2xl font-bold text-center mb-8 uppercase underline decoration-2 underline-offset-4">Relatório Médico - Cardiologia</h1>
                
                <div className="mb-6 space-y-4">
                  <p className="text-lg">
                    Atesto para os devidos fins que o paciente <Badge variant="default" className="text-sm select-none mx-1">Maria Silva</Badge>, portador do CPF 
                    <Badge variant="default" className="text-sm select-none mx-1">111.222.333-44</Badge>, de <Badge variant="default" className="text-sm select-none mx-1">54 anos</Badge>.
                  </p>
                  
                  <p className="text-lg">
                    Esteve em consulta no dia <Badge variant="default" className="text-sm select-none mx-1">{new Date().toLocaleDateString('pt-BR')}</Badge>, apresentando histórico de Hipertensão Arterial Sistêmica. A inteligência artificial identificou em seu histórico a indicação medicamentosa de <Badge variant="secondary" className="text-sm cursor-help bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Losartana 50mg</Badge> de uso contínuo.
                  </p>

                  <p className="text-lg">
                    Constata-se evolução favorável segundo últimos parâmetros clínicos, sugerindo manutenção do quadro atual (CID-10: <Badge variant="destructive" className="text-sm uppercase mx-1">I10</Badge>). O paciente está apto para atividades laborais de baixo impacto físico.
                  </p>
                </div>
                
                <div className="mt-32 border-t border-zinc-400 w-64 mx-auto pt-2 text-center text-zinc-600">
                  <p className="font-bold">Dr. Ricardo Souza</p>
                  <p className="text-sm">CRM-SE 123456</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </RootLayout>
  );
}

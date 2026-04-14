**ENTREGA PARCIAL — RISE UP**

**MediConnect**

Plataforma de Gestão Clínica com IA Preditiva

**EMPRESA: Popcode**

**Squad 21**

# **1\. DESCRIÇÃO DO PROBLEMA E PERSONAS IA-Augmented**

## **1.1 — Descrição do Problema, Solução e Oportunidade de IA**

### **Problema**

| 📌 Problema (250 caracteres) O absenteísmo em clínicas médicas brasileiras atinge 25–38% das consultas agendadas, gerando desperdício financeiro, sobrecarga operacional e atrasos no acesso à saúde, causados principalmente por falhas de comunicação e falta de lembretes ativos ao paciente. |
| :---- |

### **Solução**

| ✅ Solução (250 caracteres) O MediConnect é uma plataforma SaaS de gestão clínica com IA preditiva que identifica pacientes com alto risco de falta, automatiza lembretes via WhatsApp e e-mail, otimiza agendas em tempo real e fornece analytics acionáveis para reduzir absenteísmo em até 75%. |
| :---- |

### **Onde a IA Gera Valor**

**A IA está presente em três camadas distintas da solução:**

| Tipo de IA | Descrição e Aplicação |
| :---- | :---- |
| **🤖 Predição** | O Modelo de Machine Learning analisa histórico do paciente (faltas anteriores, perfil socioeconômico, tipo de consulta, canal de comunicação preferido) para prever a probabilidade de absenteísmo e acionar alertas preventivos. |
| **⚡ Automação** | Fluxos automáticos de confirmação e lembrete por WhatsApp, e-mail e SMS, com resposta inteligente: o paciente confirma, cancelar ou remarcar diretamente na mensagem recebida — sem intervenção humana. |
| **📊 Geração de Conteúdo** | Geração automatizada de laudos médicos com templates inteligentes, preenchimento de campos dinâmicos (nome, CID, diagnóstico) e produção de relatórios gerenciais e financeiros em PDF com análise contextualizada de desempenho. |

### 

### 

### 

### **Personas**

|  👩‍⚕️ Persona 1 — Dra. Carla Mendes | Clínica Geral Perfil: Médica, 38 anos, administra consultório próprio em Aracaju/SE com 2 secretárias. Dores: Perde em média 8 consultas/semana por faltas sem aviso; controla agenda em planilha; gasta 1h/dia em WhatsApp manual com pacientes; laudos demoram 15–20 min cada. Objetivo com o MediConnect: Automatizar lembretes, reduzir faltas e gerar laudos em menos de 5 minutos com templates pré-configurados por especialidade. |
| :---- |

| 🗂️ Persona 2 — Fernanda Alves | Secretária Clínica Perfil: Secretária, 27 anos, gerencia agenda de 3 médicos em clínica de média complexidade. Dores: Recebe dezenas de ligações por dia para confirmar consultas; perde tempo reagendando faltas; não tem visão consolidada dos horários disponíveis dos médicos. Objetivo com o MediConnect: Visualizar agenda centralizada, acionar fila de espera automaticamente e registrar confirmações sem precisar ligar para cada paciente. |
| :---- |

| 📊 Persona 3 — Ricardo Souza | Gestor / Coordenador Perfil: Gestor operacional, 44 anos, responsável por clínica com 5+ médicos e controle financeiro. Dores: Falta de visibilidade em tempo real sobre taxa de absenteísmo e produtividade médica; relatórios manuais e imprecisos; dificuldade de controlar convênios e inadimplência. Objetivo com o MediConnect: Acessar dashboard executivo com KPIs em tempo real, relatórios automáticos e análises preditivas para tomada de decisão baseada em dados. |
| :---- |

## **1.2 — Cenários de Uso e Casos de Borda (Edge Cases) de IA**

### **Cenários de Uso Esperados**

* Paciente com alto histórico de faltas recebe lembrete 48h \+ 4h antes da consulta via WhatsApp com link de confirmação ou reagendamento em 1 clique.

* IA prediz probabilidade de falta acima de 70% → sistema aciona automaticamente paciente da fila de espera para o mesmo horário.

* Médico seleciona template de laudo de cardiologia → IA preenche campos dinâmicos (nome, idade, CID) → laudo finalizado em menos de 5 minutos.

* Dashboard exibe em tempo real a taxa de absenteísmo diária, semanal e mensal com comparativo histórico e alertas de desvio.

### **Casos de Borda e Cenários de Falha**

| Caso de Borda / Falha | Tratamento / Mitigação |
| :---- | :---- |
| **Paciente sem WhatsApp ou internet** | Fallback automático para SMS ou ligação telefônica; campo de preferência de contato cadastrado no perfil do paciente. |
| **Número de telefone incorreto ou desatualizado** | Validação de formato no cadastro \+ alerta ao sistema quando a mensagem não é entregue (webhook da API do WhatsApp). |
| **Paciente não responde à confirmação** | Após 24h sem resposta, reenvio automático. Após 2 tentativas sem retorno, horário entra na fila de disponibilidade. |
| **Modelo de IA com baixa acurácia inicial** | Sistema utiliza regras de negócio como fallback (ex: \>2 faltas nos últimos 6 meses \= alto risco) até o modelo ter dados suficientes para predição confiável. |
| **Indisponibilidade da API do WhatsApp** | Fila de mensagens com retry automático; alerta para a secretaria para contato manual; logs de falha para auditoria. |
| **Laudo gerado com dados errados pelo template** | Pré-visualização obrigatória antes da finalização; médico deve confirmar todos os campos dinâmicos; versão em rascunho salva automaticamente. |
| **Timeout na geração de relatório analítico** | Processamento assíncrono em background; usuário recebe notificação quando o relatório estiver pronto; interface exibe estado de carregamento. |
| **Sobrecarga de mensagens — paciente irritado** | Configuração de frequência máxima de notificações por paciente; opção de opt-out respeita LGPD; preferências salvas no perfil. |

# **2\. BACKLOG E ENGENHARIA DE REQUISITOS AI-FIRST**

## **2.1 — Backlog Priorizado e Categorizado**

O backlog do MediConnect foi organizado com metodologia Scrum em sprints quinzenais. As prioridades seguem a lógica MoSCoW (Must Have, Should Have, Could Have) e cada épico agrupa histórias de usuário relacionadas.

### **Épicos**

| ID | Épico — Descrição |
| :---- | :---- |
| **EP-01** | Gestão de Pacientes — Cadastro, edição, busca e histórico de atendimentos. |
| **EP-02** | Agendamento Inteligente — Calendário visual, controle de disponibilidade e fila de espera. |
| **EP-03** | Anti-Absenteísmo com IA — Predição de faltas, lembretes automáticos e confirmações. |
| **EP-04** | Editor de Laudos — Templates, editor rico, assinatura digital e geração de PDF. |
| **EP-05** | Comunicação com Pacientes — WhatsApp Business API, e-mail e templates de mensagens. |
| **EP-06** | Módulo Financeiro — Faturamento, controle de convênios e fluxo de caixa. |
| **EP-07** | Analytics e Relatórios — Dashboard executivo, KPIs e relatórios automatizados. |
| **EP-08** | Controle de Acesso e Perfis — Login, RBAC, log de auditoria e sessões. |

### **Histórias de Usuário por Épico**

**EP-01 — Gestão de Pacientes**

| ID | História de Usuário |
| :---- | :---- |
| **HU-01** | Como secretária, quero cadastrar um novo paciente com nome, CPF, contato e convênio para que ele possa ser agendado. |
| **HU-02** | Como médico, quero visualizar o histórico completo de atendimentos de um paciente para embasar minha consulta. |
| **HU-03** | Como secretária, quero buscar pacientes por nome, CPF ou convênio para localizar rapidamente o registro correto. |
| **HU-04** | Como gestor, quero anexar documentos e resultados de exames ao prontuário do paciente para centralizar informações clínicas. |

**EP-02 — Agendamento Inteligente**

| ID | História de Usuário |
| :---- | :---- |
| **HU-05** | Como secretária, quero visualizar a agenda por dia, semana e mês para organizar os horários dos médicos. |
| **HU-06** | Como secretária, quero agendar uma consulta selecionando médico, paciente, data/hora e tipo de atendimento. |
| **HU-07** | Como gestor, quero configurar bloqueios de horário para feriados, reuniões e intervalos dos médicos. |
| **HU-08** | Como secretária, quero acessar a fila de espera para chamar automaticamente o próximo paciente disponível em caso de desistência. |

**EP-03 — Anti-Absenteísmo com IA**

| ID | História de Usuário |
| :---- | :---- |
| **HU-09** | Como gestor, quero que o sistema envie lembretes automáticos 48h e 4h antes da consulta via WhatsApp para reduzir faltas. |
| **HU-10** | Como paciente, quero confirmar, cancelar ou remarcar minha consulta diretamente pela mensagem recebida, sem precisar ligar. |
| **HU-11** | Como gestor, quero visualizar o score de risco de absenteísmo de cada paciente agendado para priorizar ações preventivas. |
| **HU-12** | Como gestor, quero que o sistema ative automaticamente a fila de espera quando a IA prevê alta probabilidade de falta. |

**EP-04 — Editor de Laudos**

| ID | História de Usuário |
| :---- | :---- |
| **HU-13** | Como médico, quero selecionar um template de laudo por especialidade e ter os campos dinâmicos preenchidos automaticamente. |
| **HU-14** | Como médico, quero assinar digitalmente o laudo para que ele tenha validade jurídica e seja enviado ao paciente. |
| **HU-15** | Como médico, quero pré-visualizar o laudo antes de finalizar para garantir que todas as informações estão corretas. |
| **HU-16** | Como médico, quero importar resultados de exames externos em PDF para anexar ao laudo do paciente. |

**EP-07 — Analytics e Relatórios**

| ID | História de Usuário |
| :---- | :---- |
| **HU-17** | Como gestor, quero acessar um dashboard com KPIs em tempo real (taxa de absenteísmo, consultas realizadas, faturamento) para monitorar a operação. |
| **HU-18** | Como gestor, quero exportar relatórios mensais de produtividade médica e financeiro em PDF ou Excel. |
| **HU-19** | Como gestor, quero filtrar relatórios por médico, período, convênio e tipo de consulta para análises específicas. |

### **Padrões de Uso de Ferramentas de IA no Projeto**

As seguintes ferramentas de IA estão sendo utilizadas no desenvolvimento do MediConnect:

| Ferramenta | Uso no Projeto |
| :---- | :---- |
| **Claude (Anthropic)** | Geração de código frontend (componentes React/Next.js), revisão de lógica de UI, criação de documentação técnica e suporte a decisões de arquitetura. |
| **GitHub Copilot** | Autocomplete de código no VS Code; sugestões de funções TypeScript, hooks React e queries SQL para o backend (fornecido pronto). |
| **ChatGPT (OpenAI)** | Rascunho de templates de mensagens WhatsApp/e-mail, geração de conteúdo para laudos de exemplo e apoio na criação de user stories. |
| **v0 (Vercel)** | Prototipação rápida de componentes UI com Shadcn/UI e Tailwind CSS, acelerando a criação de wireframes funcionais. |

## **2.2 — Histórias de Usuário e Critérios de Aceite de IA**

Abaixo estão os critérios de aceitação detalhados para as histórias de usuário que envolvem funcionalidades de IA:

| HU-09 — Lembrete automático 48h e 4h antes da consulta ✅ Critérios de Aceite: Mensagem enviada automaticamente 48h antes, com link de confirmação funcional. Segunda mensagem enviada 4h antes apenas se o paciente não confirmou. Status de entrega da mensagem visível no sistema (entregue / lido / sem resposta). Em caso de falha na entrega, sistema registra o erro e aciona fallback (SMS ou alerta manual). Opt-out do paciente respeita LGPD e desativa o envio imediatamente. |
| :---- |

| HU-11 — Score de risco de absenteísmo por paciente ✅ Critérios de Aceite: Score exibido na listagem de agendamentos do dia (verde/amarelo/vermelho). Score baseado em: histórico de faltas, tipo de consulta, tempo de antecedência do agendamento e canal de comunicação. Quando score \> 70%, sistema sinaliza visualmente e sugere ação (ligar, chamar fila). Fallback por regras de negócio quando modelo de ML ainda não tem dados suficientes. Score recalculado a cada nova ação do paciente (confirmação, cancelamento, falta). |
| :---- |

# **3\. UX/UI PARA INTERFACES INTELIGENTES**

## **3.1 — Wireframes e Fluxos de Conversação**

Os wireframes e protótipos navegáveis do MediConnect foram desenvolvidos no Figma, seguindo o design system baseado em Shadcn/UI e Tailwind CSS. Abaixo está a descrição das telas principais e dos fluxos de navegação.

### **Telas Principais**

| Tela | Descrição |
| :---- | :---- |
| **Login / Autenticação** | Tela limpa com logo MediConnect, campos de e-mail e senha, recuperação de senha e identificação automática de perfil após login (médico, secretária, gestor, financeiro). |
| **Esqueci Senha** | Tela onde o usuário pode colocar que esqueceu a senha e vão receber um link pelo email ou SMS para redefinição de senha  |
| **Dashboard Executivo** | KPIs em cards (consultas do dia, taxa de absenteísmo, faturamento); gráfico de linha com histórico semanal; alertas de pacientes com alto risco de falta; ações rápidas. |
| **Agenda (Calendário)** | Visualização diária/semanal/mensal; slots coloridos por status (confirmado \= verde, pendente \= amarelo, faltou \= vermelho); drag & drop para reagendamento; painel lateral com detalhes do agendamento selecionado. |
| **Cadastro de Usuários** | Formulário em etapas (dados pessoais, contato, convênio, preferências de comunicação); validação inline; máscara de CPF/telefone; upload de foto opcional. |
| **Editor de Laudos** | Editor de texto rico (bold, itálico, listas); seletor de template por especialidade; campos dinâmicos destacados; pré-visualização em PDF; status do laudo (rascunho / finalizado / enviado). |
| **Relatórios e Analytics** | Filtros por período, médico e convênio; gráficos de barras e pizza (Recharts); exportação em PDF/Excel; comparativo mês a mês de absenteísmo. |
| **Disponibilidade Médico** | Médicos do sistema devem adicionar as datas e horários que tem disponíveis na semana ou mês e adicionar as exeções,tais como,férias,feriado,abono,atestado médico |

### **Detalhamento de Navegação**

* Sidebar fixa com ícones e labels: Dashboard, Agenda, Pacientes, Laudos, Comunicação, Financeiro, Relatórios, Configurações.

* Breadcrumb no topo para orientação contextual.

* Header com avatar do usuário, nome do perfil ativo e botão de logout.

* Notificações em tempo real via badge no ícone de sino (alertas de absenteísmo, mensagens sem resposta, laudos pendentes).

* Rotas protegidas por perfil: secretária não vê Financeiro nem Laudos; financeiro não vê Prontuário.

### **Telas de Processamento e Tratamento de Erros**

* Skeleton loaders em todos os componentes de lista e tabela durante carregamento de dados.

* Toast notifications (Shadcn/UI) para confirmações de ações (salvo, enviado, excluído).

* Empty states ilustrados quando não há dados a exibir (nenhum agendamento hoje, nenhum laudo pendente).

* Página de erro 404 e 500 customizadas com opção de voltar ao dashboard.

* Modal de confirmação antes de ações destrutivas (cancelar consulta, excluir paciente).

* Indicador de conexão offline com banner no topo da tela.

# **4\. ARQUITETURA DE SOFTWARE E STACK DE DESENVOLVIMENTO**

## **4.1 — Escolha da Stack de Desenvolvimento e IA**

### **Stack do Frontend (Escopo da Equipe)**

| Tecnologia | Uso no Projeto |
| :---- | :---- |
| **Next.js 14 (App Router)** | Framework React com SSR/SSG; roteamento baseado em arquivos; suporte a Server Actions e API Routes para integração com backend. |
| **React 18** | Biblioteca de componentes; uso de hooks (useState, useEffect, useContext, useSWR) para gerenciamento de estado e dados. |
| **TypeScript** | Tipagem estática em todo o projeto; interfaces para entidades do domínio (Paciente, Agendamento, Laudo); maior segurança e produtividade. |
| **Tailwind CSS** | Utilitários CSS para estilização rápida e responsiva; design system baseado em variáveis customizadas; dark mode configurado. |
| **Shadcn/UI** | Componentes acessíveis e customizáveis (Dialog, Table, Calendar, Form, Toast); base do design system do MediConnect. |
| **React Hook Form \+ Zod** | Gerenciamento de formulários com validação tipada; integrado ao Shadcn/UI para experiência consistente. |

### **Ferramentas de IA — Gratuitas vs Pagas**

| Ferramenta de IA | Uso / Custo |
| :---- | :---- |
| **Claude (Anthropic) — Pago** | Geração de código, revisão de componentes, documentação e apoio a decisões de arquitetura frontend. |
| **GitHub Copilot — Pago** | Autocomplete inteligente no VS Code; integrado ao fluxo diário de desenvolvimento da equipe. |
| **v0 (Vercel) — Freemium** | Prototipação de componentes UI; geração inicial de telas a partir de descrição em linguagem natural. |
| **ChatGPT (OpenAI) — Freemium** | Rascunho de mensagens, templates de laudo e suporte a criação de documentação. |
| **Figma AI — Freemium** | Sugestão de layouts, auto-layout e exportação de componentes para o frontend React. |

### **Backend (Fornecido Pronto — Referência)**

O backend do MediConnect está integralmente desenvolvido e entregue pela empresa. A equipe de frontend consome as APIs REST disponibilizadas. Tecnologias do backend para referência de integração.

## **4.2 — Desenho de Arquitetura e Tratamento de Erros**

### **Estrutura de Pastas do Frontend (Next.js App Router)**

| mediconnect-frontend/ ├── app/                          \# App Router (Next.js 14\) │   ├── (auth)/                   \# Grupo: rotas de autenticação │   │   ├── login/page.tsx │   │   └── recuperar-senha/page.tsx │   ├── (dashboard)/              \# Grupo: rotas autenticadas │   │   ├── layout.tsx            \# Layout com sidebar \+ header │   │   ├── agenda/page.tsx │   │   ├── pacientes/page.tsx │   │   ├── laudos/page.tsx │   │   ├── financeiro/page.tsx │   │   └── relatorios/page.tsx │   ├── api/                      \# API Routes (proxy para backend) │   ├── globals.css │   └── layout.tsx                \# Root layout ├── components/ │   ├── ui/                       \# Shadcn/UI base components │   ├── agenda/                   \# Componentes do módulo agenda │   ├── pacientes/                \# Componentes do módulo pacientes │   ├── laudos/                   \# Componentes do módulo laudos │   └── shared/                   \# Componentes reutilizáveis ├── hooks/                        \# Custom hooks (useAgenda, usePacientes...) ├── lib/                          \# Utils, API client, validadores │   ├── api.ts                    \# Fetch wrapper com interceptors │   └── validations/              \# Schemas Zod ├── types/                        \# Interfaces TypeScript globais ├── providers/                    \# Providers (QueryClient, Auth, Theme) └── middleware.ts                 \# Proteção de rotas por perfil |
| :---- |

### **Integração Frontend com APIs de IA**

O frontend não chama diretamente as APIs de IA. O modelo de integração segue o padrão:

| Fluxo de Integração com IA: Frontend (Next.js) → API Route (proxy) → Backend REST → Serviços O frontend exibe o score de risco (número já processado pelo backend) e os status de envio de mensagens. Não há lógica de IA no cliente — somente apresentação dos dados retornados pela API. |
| :---- |

### **Tratamento de Erros — Latência, Timeout e Indisponibilidade**

| Cenário | Estratégia no Frontend |
| :---- | :---- |
| **Timeout de API (\>10s)** | TanStack Query com timeout configurado; exibe skeleton loader durante espera; mensagem de erro amigável com botão de retry após timeout. |
| **Erro de rede / offline** | Interceptor no fetch wrapper detecta falha de rede; exibe banner de 'modo offline'; dados em cache do React Query permanecem acessíveis. |
| **Erro 500 do backend** | Boundary de erro por rota (error.tsx do Next.js); log do erro no console; exibe página de erro com detalhes e opção de reportar. |
| **API de WhatsApp indisponível** | Frontend exibe status 'Pendente' no campo de envio; polling automático a cada 30s para verificar atualização; ícone de alerta com tooltip explicativo. |
| **Erro de autenticação (401)** | Middleware Next.js redireciona para login; token expirado é limpo do storage; mensagem explica o motivo do redirecionamento. |
| **Erro de permissão (403)** | Componente de 'Acesso Negado' exibido in-page; não redireciona; exibe o perfil necessário para acessar aquela funcionalidade. |
| **Falha ao gerar laudo (PDF)** | Processamento assíncrono; progresso exibido via WebSocket ou polling; notificação Toast quando pronto ou com detalhes do erro. |


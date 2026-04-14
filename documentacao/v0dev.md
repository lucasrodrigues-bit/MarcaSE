# Prompt para Geração de Telas no v0.dev (Projeto MediConnect)

Este documento contém o prompt principal que você deve copiar e colar no **v0.dev** ou usar em outras IAs geradoras de UI. Ele foi desenhado para criar todas as telas e fluxos necessários do MediConnect, usando os mesmos padrões de cor e layout do projeto **MarcaSE**.

---

## 🎯 Instruções de Uso
1. Acesse [v0.dev](https://v0.dev)
2. Copie o bloco de texto abaixo no campo de prompt.
3. Se o v0 gerar apenas algumas telas por vez (devido a limites de tamanho), peça para ele continuar a geração das próximas telas no mesmo chat.

---

## 📝 O Mega-Prompt

```text
Atue como um Engenheiro de Frontend Sênior e UI/UX Designer. O objetivo é criar o protótipo funcional de uma plataforma SaaS médica chamada "MediConnect", focada em reduzir absenteísmo usando IA preditiva.

### 🛠️ Stack Tecnológica:
- Next.js (App Router)
- React 19
- Tailwind CSS 4
- Shadcn UI (versão da base v4)
- Componentes visuais: Recharts para gráficos, Lucide React para ícones, React Hook Form.

### 🎨 Design System e Identidade Visual (Baseado no MarcaSE):
- **Cores**: Estilo minimalista/neutro (monocromático elegante).
  - Background principal claro (oklch 1 0 0), textos escuros (oklch 0.145 0 0).
  - Primary button: Fundo escuro (oklch 0.205 0 0) com texto claro.
  - Suporte nativo a Dark Mode: Background principal escuro (oklch 0.145 0 0).
- **Tipografia**: Família de fontes global "Geist".
- **Bordas**: `--radius: 0.625rem` (arredondamento médio/suave).
- **Semântica de Status**: Usar cores consistentes para estados: Verde (Sucesso/Confirmado), Amarelo claro (Aviso/Pendente), Vermelho escuro/Destructive (Perigo/Falta).

### 📐 Layout Global da Aplicação:
Quero que TODAS as views pós-login obedeçam ao seguinte layout responsivo:
- **Sidebar (Esquerda)**: Sidebar vertical contendo a logo "MediConnect", seções agrupando links com ícones limpos (Dashboard, Agenda, Pacientes, Laudos, Comunicação, Financeiro, Relatórios, Configurações). Use Shadcn Sidebar.
- **Header**: Fixo superior contendo Breadcrumb dinâmico de navegação. No lado direito: um ícone de sino para notificações com um badge indicativo (ex: "2"), e o menu com o Avatar dropdown do usuário logado (ex. "Gestor Ricardo").

### 📱 Componentes e Telas para Gerar:
Por favor, construa uma única interface tipo "Tabs" ou "Menu Interativo" onde o usuário possa clicar em uma aba lateral (sidebar) e ver a tela renderizando do lado principal. Requisitos das telas:

1. **Login e Recuperação de Senha (Tela Solta)**
   - Um grid limpo dividido ao meio: Lado esquerdo com uma imagem placeholder inspiradora médica gerada pela IA e lado direito com centralização do formulário. Card com inputs minimalistas, "Lembra de mim?" em checkbox, "Esqueceu a senha?" como link e botão primário escuro.
   
2. **Dashboard Executivo (Home)**
   - Breadcrumb: "Dashboard > Visão Geral".
   - 3 Cards superiores: Consultas do Dia (45), Taxa Absenteísmo Atual (18%, seta verde apontando melhoria) e Pacientes com Risco Alto (4).
   - Área central: Um gráfico AreaChart ou LineChart suave com o histórico do mês vs mês anterior.
   - Área inferior: "Destaques de Risco" com listagem de 3 nomes de pacientes sinalizando % de probabilidade de não virem. Botões rápidos de "Ligar" ou "Enviar Zap".

3. **Visão de Agenda Médica**
   - Breadcrumb: "Agenda > Hoje".
   - Coluna menor na esquerda contendo um pequeno calendário Shadcn DatePicker interativo.
   - Coluna principal: Lista tipo cronograma/horários (08:00, 08:30, 09:00).
   - Bloquear horários de pacientes com status por cores: Verde (Confirmado), Amarelo (Aguardando Resposta) e Vermelho (Recusado/Cancelado). Adicione funcionalidade *Drag and Drop* se viável ou faça visualmente preparado para isso.

4. **Novo Paciente / Novo Modal**
   - Modal ou Sheet (deslizando da direita) simulando cadastro com abas: Dados Pessoais e Configurações de IA (se aceita receber SMS ou WhatsApp).
   - Inclua componentes Select, Checkbox e espaçamento adequado.

5. **Editor de Laudos IA**
   - Breadcrumb: "Laudos > Novo Laudo".
   - Layout híbrido: de um lado seletor de "Templates" com nomes padronizados (ex: Cardiologia, Pediatria). Opcionalmente com a área principal grande estilo "Rich Text Editor" falso.
   - Destaque no fluxo visual os campos dinâmicos {NOME_PACIENTE} em azul ou badge para mostrar que a IA substituirá.

6. **Relatórios**
   - Tabela densa usando Table do shadcn/ui.
   - Filtros superiores: Data de, Data até, Médico.
   - Pelo menos um gráfico PieChart mostrando a causa da evasão: Chuva, Esqueceu, etc.

### ✨ Ações Dinâmicas para Mock (Obrigatório!):
- Adicione na própria layout um botão superior isolado de "Testar Notificação Flutuante" para emitir um Error e um Success Toast (Shadcn Toast).
- Inclua pelo menos uma view com "Skeleton Loader" caso a conexão esteja ruim.
```

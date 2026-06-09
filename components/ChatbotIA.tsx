"use client";

import { useState, useRef, useEffect } from "react";
import { X, MessageCircleHeart, Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `Você é um assistente virtual do MarcaSE, um sistema de agendamento médico em Sergipe, Brasil.
Seu nome é MarcaBot e você é simpático, prestativo e profissional.

Você pode ajudar pacientes com:
- Dúvidas sobre como agendar, remarcar ou cancelar consultas
- Informações sobre documentos necessários para consultas
- Explicar como funciona o sistema MarcaSE
- Orientar sobre o cadastro de pacientes
- Tirar dúvidas gerais sobre o funcionamento da clínica

Você NÃO deve:
- Dar diagnósticos médicos
- Prescrever medicamentos
- Substituir orientação médica profissional
- Inventar informações sobre médicos ou horários específicos

Seja sempre cordial, use linguagem simples e clara. Responda em português brasileiro.
Mantenha respostas concisas (máximo 3 parágrafos).`;

export default function ChatbotIA() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! 👋 Sou o MarcaBot, assistente virtual do MarcaSE. Como posso te ajudar hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      const assistantText =
        data?.content?.[0]?.text || "Desculpe, não consegui processar sua mensagem. Tente novamente.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantText },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ops! Ocorreu um erro de conexão. Tente novamente em instantes. 🙏",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-200"
        aria-label="Abrir chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      {/* Janela do chat */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-[350px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "480px" }}>

          {/* Header */}
          <div className="bg-primary text-primary-foreground px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">MarcaBot</p>
              <p className="text-xs opacity-75">Assistente Virtual · MarcaSE</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs
                  ${msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"}`}>
                  {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Balão */}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed
                    ${msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Digitando... */}
            {isLoading && (
              <div className="flex gap-2 flex-row">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-muted text-muted-foreground">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-muted px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Digitando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

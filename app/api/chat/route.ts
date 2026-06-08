import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, system } = await req.json();

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
    },
    body: JSON.stringify({
model: "nvidia/nemotron-3-ultra-550b-a55b:free",      messages: [
        { role: "system", content: system },
        ...messages,
      ],
    }),
  });

  const data = await response.json();
  console.log("📥 OpenRouter:", JSON.stringify(data));

  const text = data?.choices?.[0]?.message?.content
    || "Desculpe, não consegui processar sua mensagem.";

  return NextResponse.json({ content: [{ text }] });
}
import { streamText, UIMessage, convertToModelMessages, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function POST(req: Request) {
  const body = await req.json();
  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  console.log(incoming);
  const uiMessages = [
    {
      role: "system",
      parts: [
        {
          type: "text",
          text: `
You are a professional engineering assistant for a software engineering intern. Keep answers clear, polite, and concise. Provide step‑by‑step instructions, runnable code examples, and exact commands when relevant. Ask clarifying questions if requirements are missing. Do not use profanity or inappropriate language.


      `.trim(),
        },
      ],
    },
    ...incoming.map((m: any) => {
      // If the message already has parts (UIMessage shape from useChat), extract text from them
      if (Array.isArray(m.parts) && m.parts.length > 0) {
        const textParts = m.parts
          .filter((p: any) => p?.type === "text" && typeof p.text === "string")
          .map((p: any) => ({ type: "text", text: p.text.trim() }));
        return {
          role: m.role ?? "user",
          parts:
            textParts.length > 0 ? textParts : [{ type: "text", text: "" }],
        };
      }
      // Fallback: simple { role, content } shape
      const text = (typeof m.content === "string" ? m.content : (m.text ?? ""))
        ?.toString()
        .trim();
      return { role: m.role ?? "user", parts: [{ type: "text", text }] };
    }),
  ];
  // Remove messages with no text parts and ensure there's at least one non-empty message
  const filtered = uiMessages
    .map((msg: any) => ({
      ...msg,
      parts: Array.isArray(msg.parts)
        ? msg.parts.filter(
            (p: any) =>
              p?.type === "text" &&
              typeof p.text === "string" &&
              p.text.trim() !== "",
          )
        : [],
    }))
    .filter((m: any) => Array.isArray(m.parts) && m.parts.length > 0);

  if (filtered.length === 0) {
    filtered.push({ role: "user", parts: [{ type: "text", text: "Hello" }] });
  }

  // Build a plain text prompt containing the full conversation history
  const promptParts = [] as string[];

  // Include the system instruction first (if present)
  const system = filtered.find(
    (m: any) => (m.role || "").toLowerCase() === "system",
  );
  if (system) {
    const sysText = system.parts
      .map((p: any) => p.text)
      .join("\n")
      .trim();
    if (sysText) promptParts.push(`SYSTEM: ${sysText}`);
  }

  // Add conversation messages in order (excluding system)
  filtered
    .filter((m: any) => (m.role || "").toLowerCase() !== "system")
    .forEach((m: any) => {
      const roleLabel = (m.role || "user").toString().toUpperCase();
      const text = m.parts
        .map((p: any) => p.text)
        .join("\n")
        .trim();
      if (text) promptParts.push(`${roleLabel}: ${text}`);
    });

  const finalPrompt = promptParts.join("\n\n").trim() || "Hello";

  // Log outgoing request messages for debugging
  try {
    console.log(
      "[api/chat] Outgoing messages:",
      JSON.stringify(filtered, null, 2),
    );
    console.log("[api/chat] Final prompt:\n", finalPrompt);
  } catch (e) {
    console.log("[api/chat] Failed to stringify outgoing messages", e);
  }

  const result = streamText({
    model: google("gemini-2.5-flash-lite"),
    prompt: finalPrompt,
    tools: {
      weather: tool({
        description: "Get the weather in a location (fahrenheit)",
        //  the description is for the model to understand when to use the tool
        inputSchema: z.object({
          //
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature,
          };
        },
      }),
    },
  });
  return result.toUIMessageStreamResponse();
}

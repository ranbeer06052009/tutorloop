import { z } from "zod";

export const PackSchema = z.object({
  parentRecap: z.string().min(1),
  topicsCovered: z.array(z.string()).default([]),
  nextSessionFocus: z.string().default(""),
  studentHomework: z
    .array(
      z.object({
        title: z.string(),
        detail: z.string().default(""),
      }),
    )
    .default([]),
  invoiceNotes: z.string().default(""),
});

export type SessionPack = z.infer<typeof PackSchema>;

export type GenerateInput = {
  tutorName: string;
  parentTone: string;
  studentName: string;
  parentName: string;
  subject: string;
  durationHours: number;
  rate: number;
  currency: string;
  notes: string;
  imageDataUrl?: string;
};

export type GenerateResult = {
  pack: SessionPack;
  modelUsed: string;
  provider: "ollama" | "google" | "demo";
};

function stripFences(text: string) {
  const trimmed = text.trim();
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (match ? match[1] : trimmed).trim();
}

function parsePack(text: string): SessionPack {
  const raw = stripFences(text);
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) {
    throw new Error("Gemma did not return JSON. Try a larger model or shorter notes.");
  }
  const parsed = JSON.parse(raw.slice(start, end + 1));
  return PackSchema.parse(parsed);
}

function buildPrompt(input: GenerateInput) {
  const parent = input.parentName || "the parent";
  return `You are TutorLoop, a session-closer for independent tutors. Write in English. Be concrete. Never invent grades that were not in the notes. Never shame the student.

Return ONLY valid JSON with this shape:
{
  "parentRecap": "WhatsApp-ready message to ${parent}, 90-160 words, first person as the tutor (${input.tutorName})",
  "topicsCovered": ["short topic", "short topic"],
  "nextSessionFocus": "one sentence",
  "studentHomework": [
    { "title": "task name", "detail": "how to do it, time estimate" }
  ],
  "invoiceNotes": "one line the parent would accept on an invoice"
}

Tone for the recap: ${input.parentTone}

Session facts:
- Student: ${input.studentName}
- Parent: ${input.parentName || "not given"}
- Subject: ${input.subject || "general"}
- Duration: ${input.durationHours} hour(s)
- Rate: ${input.currency} ${input.rate}/hour
- Tutor notes (source of truth):
${input.notes}

If a whiteboard photo is attached, use it only to fill gaps the notes leave. Prefer the notes when they conflict.`;
}

const demoPack = (input: GenerateInput): SessionPack => ({
  parentRecap: `Hi${input.parentName ? ` ${input.parentName}` : ""}, this is ${input.tutorName}. Today's ${input.durationHours}h ${input.subject || "session"} with ${input.studentName} went steadily. We worked through ${input.notes.slice(0, 140) || "the planned set"}. I am sending homework they can finish in about 25 minutes before next class. Happy to adjust the pace if anything felt heavy.`,
  topicsCovered: [input.subject || "Core practice", "Error-checking"],
  nextSessionFocus: "Revisit today's weakest step with two fresh problems.",
  studentHomework: [
    {
      title: "Two warm-up problems",
      detail: "Same type as class. Show every step. 15 minutes.",
    },
    {
      title: "Explain one mistake",
      detail: "Write two sentences on where today's first error started.",
    },
  ],
  invoiceNotes: `${input.subject || "Tutoring"} session — ${input.durationHours}h`,
});

async function ollamaReachable(host: string) {
  try {
    const res = await fetch(`${host.replace(/\/$/, "")}/api/tags`, {
      signal: AbortSignal.timeout(2500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function generateWithOllama(input: GenerateInput): Promise<GenerateResult> {
  const host = (process.env.OLLAMA_HOST || "http://127.0.0.1:11434").replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || "gemma3:4b";
  const messages: Array<{ role: string; content: string; images?: string[] }> = [
    { role: "user", content: buildPrompt(input) },
  ];

  if (input.imageDataUrl) {
    const base64 = input.imageDataUrl.split(",").pop() || "";
    messages[0].images = [base64];
  }

  const res = await fetch(`${host}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      messages,
      options: { temperature: 0.3 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama error (${res.status}): ${err.slice(0, 280)}`);
  }

  const data = (await res.json()) as { message?: { content?: string } };
  const text = data.message?.content || "";
  return { pack: parsePack(text), modelUsed: `ollama/${model}`, provider: "ollama" };
}

type GeminiPart = { text: string } | { inline_data: { mime_type: string; data: string } };

async function generateWithGoogle(input: GenerateInput): Promise<GenerateResult> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new Error("Missing GEMINI_API_KEY");

  const model = process.env.GEMMA_MODEL || "gemma-3-12b-it";
  const parts: GeminiPart[] = [{ text: buildPrompt(input) }];

  if (input.imageDataUrl) {
    const [meta, data] = input.imageDataUrl.split(",");
    const mime = meta.match(/data:(.*?);/)?.[1] || "image/jpeg";
    if (data) {
      parts.push({ inline_data: { mime_type: mime, data } });
    }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Gemma error (${res.status}): ${err.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  return { pack: parsePack(text), modelUsed: `google/${model}`, provider: "google" };
}

export async function generatePack(input: GenerateInput): Promise<GenerateResult> {
  if (process.env.DEMO_MODE === "true") {
    return { pack: demoPack(input), modelUsed: "demo", provider: "demo" };
  }

  const host = (process.env.OLLAMA_HOST || "http://127.0.0.1:11434").replace(/\/$/, "");
  if (await ollamaReachable(host)) {
    return generateWithOllama(input);
  }

  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY) {
    return generateWithGoogle(input);
  }

  throw new Error(
    "No Gemma endpoint. Run `ollama pull gemma3:4b` locally, or set GEMINI_API_KEY on Render.",
  );
}

export async function describeGemma() {
  const host = (process.env.OLLAMA_HOST || "http://127.0.0.1:11434").replace(/\/$/, "");
  const ollama = await ollamaReachable(host);
  return {
    ollama,
    ollamaHost: host,
    ollamaModel: process.env.OLLAMA_MODEL || "gemma3:4b",
    google: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY),
    googleModel: process.env.GEMMA_MODEL || "gemma-3-12b-it",
    demo: process.env.DEMO_MODE === "true",
  };
}

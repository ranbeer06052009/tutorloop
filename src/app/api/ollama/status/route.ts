import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const settings = (db.prepare("SELECT ollama_url, ollama_model FROM settings WHERE id = 1").get() as any) || {
    ollama_url: "http://localhost:11434",
    ollama_model: "gemma2:2b",
  };

  const url = settings.ollama_url || "http://localhost:11434";
  const configuredModel = settings.ollama_model || "gemma2:2b";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // quick 2s ping

    const res = await fetch(`${url}/api/tags`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const models = (data.models || []).map((m: any) => m.name);
      const hasConfiguredModel = models.some((m: string) =>
        m.toLowerCase().startsWith(configuredModel.toLowerCase())
      );

      return NextResponse.json({
        connected: true,
        url,
        configuredModel,
        hasConfiguredModel,
        models,
      });
    }
  } catch {
    // offline or unreachable
  }

  return NextResponse.json({
    connected: false,
    url,
    configuredModel,
    hasConfiguredModel: false,
    models: [],
  });
}


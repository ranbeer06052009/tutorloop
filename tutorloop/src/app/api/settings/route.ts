import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tutor_name,
      tutor_email,
      tutor_phone,
      payment_methods,
      currency_symbol,
      ollama_url,
      ollama_model,
    } = body;

    const db = getDb();
    db.prepare(`
      UPDATE settings SET
        tutor_name = ?,
        tutor_email = ?,
        tutor_phone = ?,
        payment_methods = ?,
        currency_symbol = ?,
        ollama_url = ?,
        ollama_model = ?
      WHERE id = 1
    `).run(
      tutor_name || "Jordan Lee",
      tutor_email || "",
      tutor_phone || "",
      payment_methods || "",
      currency_symbol || "$",
      ollama_url || "http://localhost:11434",
      ollama_model || "gemma2:2b"
    );

    const updated = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


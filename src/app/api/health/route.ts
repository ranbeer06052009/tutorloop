import { NextResponse } from "next/server";
import { connectDB, hasMongoUri } from "@/lib/db";
import { describeGemma } from "@/lib/gemma";

export const dynamic = "force-dynamic";

export async function GET() {
  let mongo = "missing-uri";
  if (hasMongoUri()) {
    try {
      await connectDB();
      mongo = "connected";
    } catch (error) {
      mongo = error instanceof Error ? error.message : "failed";
    }
  }

  const gemma = await describeGemma();
  return NextResponse.json({
    ok: mongo === "connected" && (gemma.ollama || gemma.google || gemma.demo),
    mongo,
    gemma,
    service: "tutorloop",
  });
}

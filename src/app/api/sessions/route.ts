import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { toSessionDTO } from "@/lib/session-dto";
import { roundMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

const CreateSession = z.object({
  tutorId: z.string().min(1),
  studentName: z.string().min(1).max(80),
  parentName: z.string().max(80).optional(),
  subject: z.string().max(80).optional(),
  heldAt: z.string().optional(),
  durationHours: z.number().min(0.25),
  rate: z.number().min(0),
  currency: z.string().optional(),
  rawNotes: z.string().max(12_000).optional(),
  parentRecap: z.string().optional(),
  studentHomework: z
    .array(z.object({ title: z.string(), detail: z.string().default("") }))
    .optional(),
  topicsCovered: z.array(z.string()).optional(),
  nextSessionFocus: z.string().optional(),
  invoiceNotes: z.string().optional(),
  modelUsed: z.string().optional(),
  status: z.enum(["draft", "sent"]).optional(),
});

export async function GET(request: Request) {
  try {
    const tutorId = new URL(request.url).searchParams.get("tutorId");
    if (!tutorId) return NextResponse.json({ error: "tutorId required" }, { status: 400 });
    await connectDB();
    const sessions = await Session.find({ tutorId }).sort({ heldAt: -1 }).limit(50).lean();
    return NextResponse.json(sessions.map(toSessionDTO));
  } catch (error) {
    const message = error instanceof Error ? error.message : "List failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = CreateSession.parse(await request.json());
    await connectDB();
    const hours = body.durationHours;
    const rate = body.rate;
    const amount = roundMoney(hours * rate);
    const session = await Session.create({
      ...body,
      heldAt: body.heldAt ? new Date(body.heldAt) : new Date(),
      lineItems: [
        {
          description: body.invoiceNotes || body.subject || "Tutoring session",
          hours,
          rate,
          amount,
        },
      ],
      total: amount,
    });
    return NextResponse.json(toSessionDTO(session.toObject()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

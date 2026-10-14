import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { toSessionDTO } from "@/lib/session-dto";
import { roundMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

const PatchSession = z.object({
  parentRecap: z.string().optional(),
  studentHomework: z
    .array(z.object({ title: z.string(), detail: z.string().default("") }))
    .optional(),
  topicsCovered: z.array(z.string()).optional(),
  nextSessionFocus: z.string().optional(),
  invoiceNotes: z.string().optional(),
  status: z.enum(["draft", "sent"]).optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const session = await Session.findById(id).lean();
    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(toSessionDTO(session));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = PatchSession.parse(await request.json());
    await connectDB();
    const existing = await Session.findById(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.parentRecap !== undefined) existing.parentRecap = body.parentRecap;
    if (body.studentHomework !== undefined) existing.studentHomework = body.studentHomework;
    if (body.topicsCovered !== undefined) existing.topicsCovered = body.topicsCovered;
    if (body.nextSessionFocus !== undefined) existing.nextSessionFocus = body.nextSessionFocus;
    if (body.status !== undefined) existing.status = body.status;
    if (body.invoiceNotes !== undefined) {
      existing.invoiceNotes = body.invoiceNotes;
      const amount = roundMoney(existing.durationHours * existing.rate);
      existing.lineItems = [
        {
          description: body.invoiceNotes || existing.subject || "Tutoring session",
          hours: existing.durationHours,
          rate: existing.rate,
          amount,
        },
      ];
      existing.total = amount;
    }

    await existing.save();
    return NextResponse.json(toSessionDTO(existing.toObject()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Tutor } from "@/models/Tutor";
import { generatePack } from "@/lib/gemma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GenerateBody = z.object({
  tutorId: z.string(),
  studentName: z.string().min(1),
  parentName: z.string().optional(),
  subject: z.string().optional(),
  durationHours: z.number().min(0.25),
  notes: z.string().min(8).max(12_000),
  imageDataUrl: z.string().max(4_000_000).optional(),
});

export async function POST(request: Request) {
  try {
    const body = GenerateBody.parse(await request.json());
    await connectDB();
    const tutor = await Tutor.findById(body.tutorId).lean();
    if (!tutor) return NextResponse.json({ error: "Set up your tutor desk first." }, { status: 404 });

    const result = await generatePack({
      tutorName: tutor.name,
      parentTone: tutor.parentTone,
      studentName: body.studentName,
      parentName: body.parentName || "",
      subject: body.subject || tutor.subjects,
      durationHours: body.durationHours,
      rate: tutor.hourlyRate,
      currency: tutor.currency,
      notes: body.notes,
      imageDataUrl: body.imageDataUrl,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generate failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

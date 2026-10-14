import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Tutor } from "@/models/Tutor";
import { toTutorDTO } from "@/lib/session-dto";

export const dynamic = "force-dynamic";

const CreateTutor = z.object({
  name: z.string().min(2).max(80),
  subjects: z.string().max(160).optional(),
  hourlyRate: z.number().min(0),
  currency: z.string().max(8).optional(),
  parentTone: z.string().max(400).optional(),
});

export async function POST(request: Request) {
  try {
    const body = CreateTutor.parse(await request.json());
    await connectDB();
    const tutor = await Tutor.create({
      name: body.name,
      subjects: body.subjects || "Maths & Physics",
      hourlyRate: body.hourlyRate,
      currency: body.currency || "INR",
      parentTone: body.parentTone,
    });
    return NextResponse.json(toTutorDTO(tutor.toObject()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create tutor";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Tutor } from "@/models/Tutor";
import { toTutorDTO } from "@/lib/session-dto";

export const dynamic = "force-dynamic";

const PatchTutor = z.object({
  name: z.string().min(2).max(80).optional(),
  subjects: z.string().max(160).optional(),
  hourlyRate: z.number().min(0).optional(),
  currency: z.string().max(8).optional(),
  parentTone: z.string().max(400).optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const tutor = await Tutor.findById(id).lean();
    if (!tutor) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(toTutorDTO(tutor));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = PatchTutor.parse(await request.json());
    await connectDB();
    const tutor = await Tutor.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!tutor) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(toTutorDTO(tutor));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

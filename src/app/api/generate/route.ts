import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateSessionCloser } from "@/lib/gemma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentId,
      studentName,
      gradeLevel,
      parentName,
      durationHours = 1.0,
      hourlyRate = 35.0,
      rawNotes,
      preferredChannel = "whatsapp",
    } = body;

    if (!rawNotes || !rawNotes.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter session notes or whiteboard text" },
        { status: 400 }
      );
    }

    const db = getDb();
    const settings = (db.prepare("SELECT * FROM settings WHERE id = 1").get() as any) || {
      tutor_name: "Jordan Lee",
      tutor_email: "jordan.tutors@example.com",
      payment_methods: "Venmo: @jordan-tutors",
      currency_symbol: "$",
      ollama_url: "http://localhost:11434",
      ollama_model: "gemma2:2b",
    };

    let resolvedStudentName = studentName;
    let resolvedGradeLevel = gradeLevel;
    let resolvedParentName = parentName;
    let resolvedRate = Number(hourlyRate);

    // If studentId was supplied, fetch student data
    if (studentId) {
      const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId) as any;
      if (student) {
        resolvedStudentName = student.name;
        resolvedGradeLevel = student.grade_level;
        resolvedParentName = student.parent_name;
        resolvedRate = student.hourly_rate;
      }
    }

    const duration = Number(durationHours) || 1.0;
    const totalAmount = Math.round(duration * resolvedRate * 100) / 100;
    const todayStr = new Date().toISOString().split("T")[0];
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Run Gemma local model inference
    const aiResult = await generateSessionCloser({
      studentName: resolvedStudentName || "Student",
      gradeLevel: resolvedGradeLevel,
      parentName: resolvedParentName,
      tutorName: settings.tutor_name,
      durationHours: duration,
      hourlyRate: resolvedRate,
      rawNotes: rawNotes.trim(),
      preferredChannel,
      ollamaUrl: settings.ollama_url,
      modelName: settings.ollama_model,
    });

    const invoice = {
      invoiceNumber,
      date: todayStr,
      dueDate: "Upon Receipt",
      tutorName: settings.tutor_name,
      tutorEmail: settings.tutor_email,
      studentName: resolvedStudentName,
      parentName: resolvedParentName,
      durationHours: duration,
      hourlyRate: resolvedRate,
      currency: settings.currency_symbol || "$",
      totalAmount,
      paymentInstructions: settings.payment_methods,
    };

    return NextResponse.json({
      success: true,
      data: {
        parentRecap: aiResult.parentRecap,
        homeworkStudent: aiResult.homeworkStudent,
        subjectSummary: aiResult.subjectSummary,
        confidenceScore: aiResult.confidenceScore,
        modelUsed: aiResult.modelUsed,
        isSimulated: aiResult.isSimulated,
        invoice,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


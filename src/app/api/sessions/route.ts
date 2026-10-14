import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const db = getDb();

    let query = `
      SELECT 
        sess.*, 
        s.name as student_name, 
        s.grade_level,
        s.parent_name,
        s.parent_phone,
        s.parent_email,
        s.preferred_channel
      FROM sessions sess
      JOIN students s ON s.id = sess.student_id
    `;

    const params: any[] = [];
    if (studentId) {
      query += ` WHERE sess.student_id = ? `;
      params.push(studentId);
    }

    query += ` ORDER BY sess.session_date DESC, sess.id DESC `;

    const sessions = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      student_id,
      session_date,
      duration_hours,
      hourly_rate,
      raw_notes,
      recap_parent,
      homework_student,
      invoice_number,
      status = "sent",
    } = body;

    if (!student_id || !raw_notes) {
      return NextResponse.json({ success: false, error: "Missing required session parameters" }, { status: 400 });
    }

    const duration = Number(duration_hours) || 1.0;
    const rate = Number(hourly_rate) || 35.0;
    const totalAmount = Math.round(duration * rate * 100) / 100;
    const date = session_date || new Date().toISOString().split("T")[0];
    const invNum = invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO sessions (
        student_id, session_date, duration_hours, hourly_rate, total_amount,
        raw_notes, recap_parent, homework_student, invoice_number, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      student_id,
      date,
      duration,
      rate,
      totalAmount,
      raw_notes,
      recap_parent || "",
      homework_student || "",
      invNum,
      status
    );

    const savedSession = db.prepare(`
      SELECT sess.*, s.name as student_name, s.parent_name, s.parent_phone, s.parent_email
      FROM sessions sess
      JOIN students s ON s.id = sess.student_id
      WHERE sess.id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json({ success: true, session: savedSession }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Session ID and status are required" }, { status: 400 });
    }

    const db = getDb();
    db.prepare("UPDATE sessions SET status = ? WHERE id = ?").run(status, id);

    return NextResponse.json({ success: true, updatedId: id, status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


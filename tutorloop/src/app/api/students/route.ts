import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const students = db.prepare(`
      SELECT 
        s.*, 
        COUNT(sess.id) as session_count,
        COALESCE(SUM(sess.total_amount), 0) as total_billed,
        COALESCE(SUM(CASE WHEN sess.status = 'sent' THEN sess.total_amount ELSE 0 END), 0) as unpaid_balance
      FROM students s
      LEFT JOIN sessions sess ON sess.student_id = s.id
      GROUP BY s.id
      ORDER BY s.name ASC
    `).all();

    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, grade_level, hourly_rate, parent_name, parent_phone, parent_email, preferred_channel, notes } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Student name is required" }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO students (name, grade_level, hourly_rate, parent_name, parent_phone, parent_email, preferred_channel, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      grade_level || "",
      Number(hourly_rate) || 35.0,
      parent_name || "",
      parent_phone || "",
      parent_email || "",
      preferred_channel || "whatsapp",
      notes || ""
    );

    const newStudent = db.prepare("SELECT * FROM students WHERE id = ?").get(result.lastInsertRowid);
    return NextResponse.json({ success: true, student: newStudent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


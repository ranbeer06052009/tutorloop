"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Mail,
  Printer,
  Save,
  Image as ImageIcon,
  Clock,
  DollarSign,
  User,
  BookOpen,
  Calendar,
  AlertCircle,
  FileText,
  RotateCcw,
} from "lucide-react";
import { InvoiceModal } from "./InvoiceModal";

interface Student {
  id: number;
  name: string;
  grade_level: string;
  hourly_rate: number;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  preferred_channel: string;
}

interface SessionCloserProps {
  students: Student[];
  onSessionSaved: () => void;
  currencySymbol: string;
}

const SAMPLE_NOTES = {
  calculus: `Covered polynomial division & remainder theorem. Marcus solved 3 challenge problems independently once we color-coded the signs! Still making minor negative sign errors on step 2 of long division. HW: p.114 #5-15 odd, review problem 13.`,
  chemistry: `Stoichiometry and mole ratios. Sophia converted grams to moles flawlessly today! Struggled a bit with limiting reactant identification when given two masses. Built a 3-step reactant table which helped a lot. HW: finish problems 4, 6, 8 on worksheet.`,
  sat: `SAT Reading evidence-based paired questions. Liam improved passage pacing by 3 minutes! Got 8/10 on the historical literature passage. Need to reinforce vocabulary in context (secondary word meanings). HW: SAT Practice Test 4 Section 1 questions 1-20.`,
};

export function SessionCloser({ students, onSessionSaved, currencySymbol }: SessionCloserProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">(students[0]?.id || "");
  const [durationHours, setDurationHours] = useState<number>(1.0);
  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [rawNotes, setRawNotes] = useState<string>(SAMPLE_NOTES.calculus);
  const [whiteboardImage, setWhiteboardImage] = useState<string | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [recapText, setRecapText] = useState("");
  const [homeworkText, setHomeworkText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Copy feedback states
  const [copiedRecap, setCopiedRecap] = useState(false);
  const [copiedHw, setCopiedHw] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const selectedStudent = students.find((s) => s.id === Number(selectedStudentId));
  const currentRate = selectedStudent ? selectedStudent.hourly_rate : 35.0;
  const currentTotal = Math.round(durationHours * currentRate * 100) / 100;

  useEffect(() => {
    if (students.length > 0 && selectedStudentId === "") {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const handleGenerate = async () => {
    if (!rawNotes.trim()) {
      setErrorMsg("Please enter notes or choose a preset example.");
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);
    setIsSaved(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId || undefined,
          studentName: selectedStudent?.name || "Student",
          gradeLevel: selectedStudent?.grade_level || "General",
          parentName: selectedStudent?.parent_name || "Parent",
          durationHours,
          hourlyRate: currentRate,
          rawNotes,
          preferredChannel: selectedStudent?.preferred_channel || "whatsapp",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedData(data.data);
        setRecapText(data.data.parentRecap);
        setHomeworkText(data.data.homeworkStudent);
      } else {
        setErrorMsg(data.error || "Generation failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect to local generation endpoint.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyRecap = () => {
    navigator.clipboard.writeText(recapText);
    setCopiedRecap(true);
    setTimeout(() => setCopiedRecap(false), 2000);
  };

  const handleCopyHw = () => {
    navigator.clipboard.writeText(homeworkText);
    setCopiedHw(true);
    setTimeout(() => setCopiedHw(false), 2000);
  };

  const handleOpenEmail = () => {
    if (!selectedStudent) return;
    const email = selectedStudent.parent_email || "";
    const subject = encodeURIComponent(
      `Tutoring Update for ${selectedStudent.name} (${sessionDate})`
    );
    const body = encodeURIComponent(
      `${recapText}\n\n---\nNext-Week Homework:\n${homeworkText}\n\nInvoice: ${currencySymbol}${currentTotal.toFixed(
        2
      )} (${durationHours} hr @ ${currencySymbol}${currentRate}/hr)`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleSaveSession = async () => {
    if (!selectedStudentId || !rawNotes) return;

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudentId,
          session_date: sessionDate,
          duration_hours: durationHours,
          hourly_rate: currentRate,
          raw_notes: rawNotes,
          recap_parent: recapText,
          homework_student: homeworkText,
          status: "sent",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSaved(true);
        onSessionSaved();
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch {
      setErrorMsg("Failed to save session to local database.");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setWhiteboardImage(event.target?.result as string);
        // Append note indicating whiteboard attached
        setRawNotes((prev) =>
          prev.includes("[Whiteboard photo attached]")
            ? prev
            : `${prev}\n\n[Whiteboard photo attached: review diagrams and equations]`.trim()
        );
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Privacy Guarantee */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            TutorLoop Session Closer
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Turn messy post-class scribbles into a parent-ready recap, homework plan, and invoice in seconds.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>Zero cloud leaks: FERPA-safe student privacy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs & Messy Notes */}
        <div className="lg:col-span-5 space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Student
            </label>
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.grade_level || "Student"}) — {currencySymbol}
                    {s.hourly_rate}/hr
                  </option>
                ))}
              </select>
            </div>
            {selectedStudent && (
              <div className="mt-2 text-xs text-slate-500 flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Parent: <strong className="text-slate-700">{selectedStudent.parent_name || "N/A"}</strong>
                </span>
                <span>
                  Rate: <strong className="text-slate-800">{currencySymbol}{currentRate}/hr</strong>
                </span>
              </div>
            )}
          </div>

          {/* Duration & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Duration (Hours)
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
                <Clock className="h-4 w-4 text-slate-400 mr-2" />
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="8.0"
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseFloat(e.target.value) || 1.0)}
                  className="w-full bg-transparent font-semibold text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Session Date
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs"
                />
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Raw Notes / Scribbles
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400">Presets:</span>
                <button
                  type="button"
                  onClick={() => setRawNotes(SAMPLE_NOTES.calculus)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 font-medium"
                >
                  Math
                </button>
                <button
                  type="button"
                  onClick={() => setRawNotes(SAMPLE_NOTES.chemistry)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 font-medium"
                >
                  Chem
                </button>
                <button
                  type="button"
                  onClick={() => setRawNotes(SAMPLE_NOTES.sat)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 font-medium"
                >
                  SAT
                </button>
              </div>
            </div>
            <textarea
              rows={6}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="Paste shorthand notes, topics covered, formulas solved, mistakes made, homework assigned..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono text-xs leading-relaxed"
            />
          </div>

          {/* Whiteboard / Scratch Paper Photo Upload */}
          <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Whiteboard / Scratch Photo</p>
                  <p className="text-[11px] text-slate-500">Attach photo of handwritten math/diagrams</p>
                </div>
              </div>
              <label className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-indigo-50">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            {whiteboardImage && (
              <div className="mt-3 relative rounded-lg overflow-hidden border border-slate-200 max-h-36">
                <img
                  src={whiteboardImage}
                  alt="Whiteboard note"
                  className="w-full object-cover"
                />
                <button
                  onClick={() => setWhiteboardImage(null)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Calculated Totals Pill */}
          <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl text-xs">
            <span className="text-indigo-900 font-medium">Session Total:</span>
            <span className="font-bold text-indigo-700 text-sm">
              {durationHours} hr × {currencySymbol}{currentRate} = {currencySymbol}
              {currentTotal.toFixed(2)}
            </span>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="h-4 w-4 animate-spin" />
                <span>Closing session with Gemma...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Session Closer (Gemma)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output: AI Generated Closer */}
        <div className="lg:col-span-7 space-y-5">
          {generatedData ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Meta header card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {generatedData.subjectSummary}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Model: <span className="font-mono text-indigo-600">{generatedData.modelUsed}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Confidence: {generatedData.confidenceScore}
                  </span>
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    <Printer className="h-3.5 w-3.5 text-slate-600" />
                    Invoice #{generatedData.invoice?.invoiceNumber?.split("-")[2] || "001"}
                  </button>
                </div>
              </div>

              {/* 1. Parent Recap Box */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      1. Parent-Facing Recap (WhatsApp / Email)
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyRecap}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    >
                      {copiedRecap ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Recap</span>
                        </>
                      )}
                    </button>
                    {selectedStudent?.parent_email && (
                      <button
                        onClick={handleOpenEmail}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Email</span>
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  rows={6}
                  value={recapText}
                  onChange={(e) => setRecapText(e.target.value)}
                  className="w-full text-sm text-slate-800 bg-slate-50/50 border border-slate-100 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
                />
              </div>

              {/* 2. Homework & Action Plan */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-violet-500"></span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      2. Next-Week Homework Checklist
                    </h4>
                  </div>
                  <button
                    onClick={handleCopyHw}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors"
                  >
                    {copiedHw ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Homework</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={homeworkText}
                  onChange={(e) => setHomeworkText(e.target.value)}
                  className="w-full text-sm text-slate-800 bg-slate-50/50 border border-slate-100 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-violet-500 leading-relaxed font-mono text-xs"
                />
              </div>

              {/* 3. Session Invoice Summary Card & Save */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Invoice Amount:</span>
                    <span className="text-lg font-black text-slate-900">
                      {currencySymbol}{currentTotal.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({durationHours} hr × {currencySymbol}{currentRate})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ready to deliver to {selectedStudent?.parent_name || "parent"}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>View Invoice</span>
                  </button>

                  <button
                    onClick={handleSaveSession}
                    disabled={isSaved}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
                  >
                    {isSaved ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Saved to SQLite!</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        <span>Save to History</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State Placeholder */
            <div className="h-full min-h-[420px] bg-white rounded-2xl border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                <FileText className="h-8 w-8" />
              </div>
              <div className="max-w-sm">
                <h3 className="text-base font-bold text-slate-900">No session closed yet</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Paste your raw lesson notes or select one of the quick presets on the left, then click
                  <strong className="text-indigo-600"> "Generate Session Closer"</strong>.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-left w-full max-w-md pt-4 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[11px] font-bold text-slate-700">1. Parent Message</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Warm progress update</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[11px] font-bold text-slate-700">2. Homework</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Bite-sized practice items</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[11px] font-bold text-slate-700">3. Invoice</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Hours × rate calculation</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        invoice={generatedData?.invoice || null}
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />
    </div>
  );
}


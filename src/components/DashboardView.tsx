"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { InvoiceModal } from "./InvoiceModal";

interface Session {
  id: number;
  student_id: number;
  student_name: string;
  grade_level: string;
  session_date: string;
  duration_hours: number;
  hourly_rate: number;
  total_amount: number;
  raw_notes: string;
  recap_parent: string;
  homework_student: string;
  invoice_number: string;
  status: "paid" | "sent" | "draft";
  parent_name: string;
  parent_email: string;
}

interface DashboardViewProps {
  sessions: Session[];
  currencySymbol: string;
  onRefresh: () => void;
  onOpenCloser: () => void;
}

export function DashboardView({
  sessions,
  currencySymbol,
  onRefresh,
  onOpenCloser,
}: DashboardViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Financial metrics
  const totalBilled = sessions.reduce((sum, s) => sum + s.total_amount, 0);
  const totalPaid = sessions
    .filter((s) => s.status === "paid")
    .reduce((sum, s) => sum + s.total_amount, 0);
  const totalUnpaid = sessions
    .filter((s) => s.status !== "paid")
    .reduce((sum, s) => sum + s.total_amount, 0);
  const totalHours = sessions.reduce((sum, s) => sum + s.duration_hours, 0);

  const filteredSessions = sessions.filter((s) =>
    s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.grade_level && s.grade_level.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleStatus = async (sessionId: number, currentStatus: string) => {
    const newStatus = currentStatus === "paid" ? "sent" : "paid";
    try {
      await fetch("/api/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sessionId, status: newStatus }),
      });
      onRefresh();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const openInvoiceForSession = (s: Session) => {
    setSelectedInvoice({
      invoiceNumber: s.invoice_number || `INV-2026-${s.id}`,
      date: s.session_date,
      dueDate: "Upon Receipt",
      tutorName: "Jordan Lee",
      tutorEmail: "jordan.tutors@example.com",
      studentName: s.student_name,
      parentName: s.parent_name,
      durationHours: s.duration_hours,
      hourlyRate: s.hourly_rate,
      currency: currencySymbol,
      totalAmount: s.total_amount,
      paymentInstructions: "Venmo: @jordan-tutors | Zelle: jordan.tutors@example.com",
    });
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Billed
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {currencySymbol}{totalBilled.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across {sessions.length} recorded sessions</p>
        </div>

        {/* Paid / Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Collected (Paid)
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600">
              {currencySymbol}{totalPaid.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Remitted directly to tutor</p>
        </div>

        {/* Outstanding / Unpaid */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Unpaid Balance
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-600">
              {currencySymbol}{totalUnpaid.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pending parent payments</p>
        </div>

        {/* Total Hours Tutored */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Hours Tutored
            </span>
            <div className="h-8 w-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {totalHours.toFixed(1)} hrs
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Lifetime lesson time</p>
        </div>
      </div>

      {/* Sessions Table Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Session Ledger & History</h3>
            <p className="text-xs text-slate-500">
              All past lessons stored locally in SQLite on your device.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60"
              />
            </div>
            <button
              onClick={onOpenCloser}
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              + Close New Session
            </button>
          </div>
        </div>

        {/* Table Content */}
        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No sessions match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map((s) => {
                  const isExpanded = expandedSessionId === s.id;
                  return (
                    <React.Fragment key={s.id}>
                      <tr className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                          {s.session_date}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div>{s.student_name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            {s.grade_level || "Student"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {s.duration_hours} hr
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          {currencySymbol}{s.total_amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(s.id, s.status)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                              s.status === "paid"
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                            }`}
                            title="Click to toggle Paid/Unpaid"
                          >
                            {s.status === "paid" ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                <span>Paid</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 text-amber-600" />
                                <span>Sent (Unpaid)</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => openInvoiceForSession(s)}
                            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2.5 py-1 rounded-md transition-colors"
                          >
                            <Printer className="h-3 w-3" />
                            <span>Invoice</span>
                          </button>
                          <button
                            onClick={() =>
                              setExpandedSessionId(isExpanded ? null : s.id)
                            }
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 p-1 rounded-md hover:bg-slate-100"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={6} className="p-4 border-t border-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Parent Recap */}
                              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                                  Delivered Parent Recap
                                </span>
                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mt-1">
                                  {s.recap_parent}
                                </p>
                              </div>

                              {/* Homework & Raw Notes */}
                              <div className="space-y-3">
                                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                                    Assigned Homework
                                  </span>
                                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mt-1 font-mono text-[11px]">
                                    {s.homework_student}
                                  </p>
                                </div>

                                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                                    Original Raw Notes
                                  </span>
                                  <p className="text-slate-500 whitespace-pre-wrap leading-relaxed mt-1 font-mono text-[11px]">
                                    {s.raw_notes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InvoiceModal
        invoice={selectedInvoice}
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}


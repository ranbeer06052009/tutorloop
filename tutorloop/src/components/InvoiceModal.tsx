"use client";

import React from "react";
import { X, Printer, Copy, Check } from "lucide-react";

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  tutorName: string;
  tutorEmail: string;
  studentName: string;
  parentName?: string;
  durationHours: number;
  hourlyRate: number;
  currency: string;
  totalAmount: number;
  paymentInstructions: string;
}

interface InvoiceModalProps {
  invoice: InvoiceData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceModal({ invoice, isOpen, onClose }: InvoiceModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !invoice) return null;

  const handleCopyText = () => {
    const text = `INVOICE: ${invoice.invoiceNumber}
Date: ${invoice.date}
Tutor: ${invoice.tutorName} (${invoice.tutorEmail})
Student: ${invoice.studentName}
Parent: ${invoice.parentName || "Parent"}
-----------------------------------
Duration: ${invoice.durationHours} hr @ ${invoice.currency}${invoice.hourlyRate.toFixed(2)}/hr
TOTAL DUE: ${invoice.currency}${invoice.totalAmount.toFixed(2)}
-----------------------------------
Payment Methods:
${invoice.paymentInstructions}

Thank you for your business!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Printable Invoice</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-mono">
              {invoice.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Text"}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 space-y-6 text-slate-800 printable-area">
          {/* Header Row */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{invoice.tutorName}</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Private Academic Tutoring Services</p>
              <p className="text-xs text-slate-600 mt-1">{invoice.tutorEmail}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-600 tracking-wider">INVOICE</span>
              <p className="text-xs text-slate-500 font-mono mt-1">#{invoice.invoiceNumber}</p>
              <p className="text-xs text-slate-500 mt-0.5">Date: {invoice.date}</p>
              <p className="text-xs font-semibold text-emerald-600 mt-0.5">Due: {invoice.dueDate}</p>
            </div>
          </div>

          {/* Billed To Row */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Billed To (Parent)</span>
              <p className="font-semibold text-slate-900 mt-1">{invoice.parentName || "Parent / Guardian"}</p>
              <p className="text-xs text-slate-600">Student: {invoice.studentName}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Payment Status</span>
              <p className="font-semibold text-amber-600 mt-1">Pending Payment</p>
              <p className="text-xs text-slate-500">Local-first verified record</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/75 text-xs uppercase font-semibold text-slate-600">
                <tr>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Hours</th>
                  <th className="py-3 px-4 text-right">Rate</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    Academic Tutoring Session — {invoice.studentName}
                  </td>
                  <td className="py-3 px-4 text-center">{invoice.durationHours} hr</td>
                  <td className="py-3 px-4 text-right">{invoice.currency}{invoice.hourlyRate.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {invoice.currency}{invoice.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Due Section */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-right">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal:</span>
                <span>{invoice.currency}{invoice.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Due:</span>
                <span className="text-indigo-600 font-extrabold text-lg">
                  {invoice.currency}{invoice.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods Footer */}
          <div className="border-t border-slate-200 pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Payment Instructions
            </span>
            <div className="mt-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs font-mono text-indigo-950">
              {invoice.paymentInstructions || "Please remit payment via Venmo or Zelle."}
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-6">
              Generated locally via TutorLoop • Zero cloud exposure for student privacy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


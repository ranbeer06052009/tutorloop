"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  MessageSquare,
  BookOpen,
  DollarSign,
  Sparkles,
  X,
  Check,
} from "lucide-react";

interface Student {
  id: number;
  name: string;
  grade_level: string;
  hourly_rate: number;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  preferred_channel: string;
  notes?: string;
  session_count?: number;
  total_billed?: number;
  unpaid_balance?: number;
}

interface StudentsViewProps {
  students: Student[];
  currencySymbol: string;
  onRefresh: () => void;
  onSelectStudentForCloser: (studentId: number) => void;
}

export function StudentsView({
  students,
  currencySymbol,
  onRefresh,
  onSelectStudentForCloser,
}: StudentsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [hourlyRate, setHourlyRate] = useState("40");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [preferredChannel, setPreferredChannel] = useState("whatsapp");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          grade_level: gradeLevel.trim(),
          hourly_rate: parseFloat(hourlyRate) || 35.0,
          parent_name: parentName.trim(),
          parent_phone: parentPhone.trim(),
          parent_email: parentEmail.trim(),
          preferred_channel: preferredChannel,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setName("");
        setGradeLevel("");
        setParentName("");
        setParentPhone("");
        setParentEmail("");
        setNotes("");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Active Student Roster
          </h2>
          <p className="text-xs text-slate-500">
            Manage your tutoring clients, rates, and parent contact information securely stored offline.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Grid of Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {students.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:border-indigo-200 transition-all"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{s.name}</h3>
                  <p className="text-xs text-indigo-600 font-medium">{s.grade_level || "Student"}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900">
                    {currencySymbol}{s.hourly_rate}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-normal">per hour</span>
                </div>
              </div>

              {/* Parent Info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Parent Contact</span>
                  <span className="text-[10px] font-semibold bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700 uppercase">
                    {s.preferred_channel}
                  </span>
                </div>
                <p className="font-semibold text-slate-800">{s.parent_name || "Parent"}</p>
                {s.parent_phone && (
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{s.parent_phone}</span>
                  </div>
                )}
                {s.parent_email && (
                  <div className="flex items-center gap-1.5 text-slate-600 truncate">
                    <Mail className="h-3 w-3 text-slate-400" />
                    <span className="truncate">{s.parent_email}</span>
                  </div>
                )}
              </div>

              {s.notes && (
                <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                  "{s.notes}"
                </p>
              )}
            </div>

            {/* Bottom Actions & Stats */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px]">Sessions</span>
                <span className="font-bold text-slate-800">{s.session_count || 0} completed</span>
              </div>
              <button
                onClick={() => onSelectStudentForCloser(s.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Close Session</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Add New Student</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Grade / Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9th Grade Geometry"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Hourly Rate ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="10"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Parent Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Robert Lin"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Preferred App
                  </label>
                  <select
                    value={preferredChannel}
                    onChange={(e) => setPreferredChannel(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS Text</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Parent Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Parent Email
                  </label>
                  <input
                    type="email"
                    placeholder="parent@example.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Private Tutor Notes (Learning Style / Challenges)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Needs extra encouragement with proofs, test scheduled Nov 12"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  {isSubmitting ? "Saving..." : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


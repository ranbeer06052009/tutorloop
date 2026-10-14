"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { SessionCloser } from "@/components/SessionCloser";
import { DashboardView } from "@/components/DashboardView";
import { StudentsView } from "@/components/StudentsView";
import { SettingsView } from "@/components/SettingsView";
import { Sparkles, ShieldCheck, Heart } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"closer" | "dashboard" | "students" | "settings">("closer");
  const [students, setStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    tutor_name: "Jordan Lee",
    tutor_email: "jordan.tutors@example.com",
    tutor_phone: "+1 (555) 789-0123",
    payment_methods: "Venmo: @jordan-tutors | Zelle: jordan.tutors@example.com",
    currency_symbol: "$",
    ollama_url: "http://localhost:11434",
    ollama_model: "gemma2:2b",
  });
  const [ollamaStatus, setOllamaStatus] = useState({
    connected: false,
    configuredModel: "gemma2:2b",
    hasConfiguredModel: false,
    models: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  }, []);

  const fetchOllamaStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/ollama/status");
      const data = await res.json();
      setOllamaStatus({
        connected: data.connected,
        configuredModel: data.configuredModel,
        hasConfiguredModel: data.hasConfiguredModel,
        models: data.models || [],
      });
    } catch (err) {
      console.error("Error checking ollama:", err);
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchStudents(),
        fetchSessions(),
        fetchSettings(),
        fetchOllamaStatus(),
      ]);
      setIsLoading(false);
    };
    loadAll();
  }, [fetchStudents, fetchSessions, fetchSettings, fetchOllamaStatus]);

  const handleSelectStudentForCloser = (studentId: number) => {
    setActiveTab("closer");
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col font-sans text-slate-800">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ollamaStatus={ollamaStatus}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
            <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading TutorLoop local workspace...</p>
          </div>
        ) : (
          <>
            {activeTab === "closer" && (
              <SessionCloser
                students={students}
                onSessionSaved={() => {
                  fetchSessions();
                  fetchStudents();
                }}
                currencySymbol={settings.currency_symbol || "$"}
              />
            )}

            {activeTab === "dashboard" && (
              <DashboardView
                sessions={sessions}
                currencySymbol={settings.currency_symbol || "$"}
                onRefresh={() => {
                  fetchSessions();
                  fetchStudents();
                }}
                onOpenCloser={() => setActiveTab("closer")}
              />
            )}

            {activeTab === "students" && (
              <StudentsView
                students={students}
                currencySymbol={settings.currency_symbol || "$"}
                onRefresh={fetchStudents}
                onSelectStudentForCloser={handleSelectStudentForCloser}
              />
            )}

            {activeTab === "settings" && (
              <SettingsView
                settings={settings}
                onRefreshSettings={fetchSettings}
                ollamaStatus={ollamaStatus}
                onRefreshOllama={fetchOllamaStatus}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span>TutorLoop</span>
            <span>•</span>
            <span className="text-indigo-600 font-semibold">Hacktoberfest 2026: Side Hustle Challenge</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Open weights with Google Gemma 2</span>
            <span>•</span>
            <span>Local SQLite</span>
            <span>•</span>
            <span>Preserved with DevRelay</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

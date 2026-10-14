"use client";

import React from "react";
import { Sparkles, Users, LayoutDashboard, Settings, Cpu, ShieldCheck } from "lucide-react";

interface NavbarProps {
  activeTab: "closer" | "dashboard" | "students" | "settings";
  setActiveTab: (tab: "closer" | "dashboard" | "students" | "settings") => void;
  ollamaStatus: {
    connected: boolean;
    configuredModel: string;
    hasConfiguredModel: boolean;
  };
}

export function Navbar({ activeTab, setActiveTab, ollamaStatus }: NavbarProps) {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  Tutor<span className="text-indigo-600">Loop</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="h-3 w-3" />
                  100% Local AI
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Session closer & parent communicator for student tutors
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab("closer")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "closer"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Session Closer</span>
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "students"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Students</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "settings"
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </nav>

          {/* Ollama / Model Pill */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                ollamaStatus.connected && ollamaStatus.hasConfiguredModel
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : ollamaStatus.connected
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-indigo-50 text-indigo-800 border-indigo-200"
              }`}
              title={
                ollamaStatus.connected
                  ? `Connected to Ollama (${ollamaStatus.configuredModel})`
                  : "Local Gemma Simulation Engine Active (Zero Cloud Sending)"
              }
            >
              <Cpu className="h-3.5 w-3.5" />
              <span className="font-semibold">
                {ollamaStatus.connected
                  ? `Gemma 2 Live`
                  : `Gemma Engine (Offline)`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


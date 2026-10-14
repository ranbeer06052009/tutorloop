"use client";

import React, { useState } from "react";
import {
  Settings,
  Cpu,
  ShieldCheck,
  DollarSign,
  Save,
  Check,
  Terminal,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface SettingsData {
  tutor_name: string;
  tutor_email: string;
  tutor_phone: string;
  payment_methods: string;
  currency_symbol: string;
  ollama_url: string;
  ollama_model: string;
}

interface SettingsViewProps {
  settings: SettingsData;
  onRefreshSettings: () => void;
  ollamaStatus: {
    connected: boolean;
    configuredModel: string;
    hasConfiguredModel: boolean;
    models?: string[];
  };
  onRefreshOllama: () => void;
}

export function SettingsView({
  settings,
  onRefreshSettings,
  ollamaStatus,
  onRefreshOllama,
}: SettingsViewProps) {
  const [formData, setFormData] = useState<SettingsData>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        onRefreshSettings();
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-600" />
          Tutor Configuration & Local AI Engine
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal payment methods, currency, and local Gemma Ollama parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tutor Profile & Payments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            Tutor Profile & Payment Instructions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Your Name (Tutor)
              </label>
              <input
                type="text"
                value={formData.tutor_name}
                onChange={(e) =>
                  setFormData({ ...formData, tutor_name: e.target.value })
                }
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.tutor_email}
                onChange={(e) =>
                  setFormData({ ...formData, tutor_email: e.target.value })
                }
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.tutor_phone}
                onChange={(e) =>
                  setFormData({ ...formData, tutor_phone: e.target.value })
                }
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Currency Symbol
              </label>
              <select
                value={formData.currency_symbol}
                onChange={(e) =>
                  setFormData({ ...formData, currency_symbol: e.target.value })
                }
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="$">$ (USD / CAD / AUD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="₹">₹ (INR)</option>
                <option value="¥">¥ (JPY / CNY)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Payment Handles (Appears on Invoices & Recaps)
            </label>
            <input
              type="text"
              value={formData.payment_methods}
              onChange={(e) =>
                setFormData({ ...formData, payment_methods: e.target.value })
              }
              placeholder="e.g. Venmo: @jordan-tutor | Zelle: jordan@example.com | CashApp: $jordantutoring"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Auto-inserted into printable invoice receipts and payment reminder texts.
            </p>
          </div>
        </div>

        {/* Local Gemma / Ollama Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-600" />
              Open-Weight Gemma Model & Ollama Engine
            </h3>
            <button
              type="button"
              onClick={onRefreshOllama}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 p-1 rounded-md hover:bg-indigo-50"
              title="Test connection"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Ping Ollama</span>
            </button>
          </div>

          {/* Connection Status Box */}
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
              ollamaStatus.connected
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-indigo-50/50 text-indigo-900 border-indigo-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  ollamaStatus.connected ? "bg-emerald-500 animate-pulse" : "bg-indigo-400"
                }`}
              />
              <div>
                <span className="font-bold">
                  {ollamaStatus.connected
                    ? "Local Ollama Connected & Ready"
                    : "Zero-Setup Gemma Simulation Engine Active"}
                </span>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {ollamaStatus.connected
                    ? `Running on ${formData.ollama_url} with model ${formData.ollama_model}`
                    : "Offline heuristic generator active. Run 'ollama run gemma2:2b' for live weights."}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase bg-white/70 px-2 py-0.5 rounded border border-current">
              {ollamaStatus.connected ? "Live Weights" : "Zero-Config Fallback"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Ollama Endpoint URL
              </label>
              <input
                type="text"
                value={formData.ollama_url}
                onChange={(e) =>
                  setFormData({ ...formData, ollama_url: e.target.value })
                }
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Ollama Model Tag
              </label>
              <input
                type="text"
                value={formData.ollama_model}
                onChange={(e) =>
                  setFormData({ ...formData, ollama_model: e.target.value })
                }
                placeholder="e.g. gemma2:2b, gemma2:9b, gemma:2b"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Quick Terminal Guide */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                Quick Setup Command
              </span>
              <span>100% Free • Open Weights</span>
            </div>
            <p className="text-slate-300"># Pull and run Gemma 2 2B locally:</p>
            <p className="text-emerald-400 select-all bg-black/40 p-2 rounded">
              ollama run gemma2:2b
            </p>
          </div>
        </div>

        {/* Why Open Innovation Callout */}
        <div className="bg-gradient-to-br from-indigo-50 to-emerald-50 border border-indigo-100 p-5 rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Why Open-Source AI is Mandatory for Student Tutors
          </div>
          <p className="text-slate-600 leading-relaxed">
            <strong>FERPA & Minor Data Protection:</strong> Sending a 14-year-old's name, grade, learning struggles, or parent emails to third-party cloud APIs violates student confidentiality and parental trust. TutorLoop keeps 100% of student data inside SQLite on your laptop.
          </p>
          <p className="text-slate-600 leading-relaxed">
            <strong>Zero Marginal Cost:</strong> Student tutors earn $25–$45/hr. Paying $20/month SaaS subscriptions eats into slim student margins. With open-weight Gemma running locally, inference costs literally <strong>$0.00 forever</strong>.
          </p>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end items-center gap-3">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="h-4 w-4" />
              Settings saved!
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}


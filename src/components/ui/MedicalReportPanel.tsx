"use client";
import { useState } from "react";
import { PrescriptionRow } from "./PrescriptionRow";
import { Icons } from "./Icons";
import type { Prescription } from "@/lib/type/communication";

interface MedicalReportPanelProps {
  onClose?: () => void;
}

export function MedicalReportPanel({ onClose }: MedicalReportPanelProps) {
  const [symptoms, setSymptoms]         = useState("");
  const [diagnosis, setDiagnosis]       = useState("");
  const [notes, setNotes]               = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [hasUnsaved, setHasUnsaved]     = useState(true);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    { id: 1, medicine: "Aspirin", dosage: "75mg", frequency: "Once daily" },
  ]);
  const [newMedicine, setNewMedicine] = useState({ medicine: "", dosage: "", frequency: "" });

  const mark = () => setHasUnsaved(true);

  const addPrescription = () => {
    if (!newMedicine.medicine) return;
    setPrescriptions((p) => [...p, { id: Date.now(), ...newMedicine }]);
    setNewMedicine({ medicine: "", dosage: "", frequency: "" });
    setShowAddMedicine(false);
    mark();
  };

  return (
    <aside className="flex flex-col w-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Medical Consultation Report</h2>
            <p className="text-xs text-slate-400 mt-0.5">APT-2024-0847 · Dr. Sarah Chen</p>
          </div>
          {hasUnsaved && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 px-6 py-5 overflow-y-auto">

        {/* Symptoms */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Symptoms</label>
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            placeholder="Describe patient symptoms..."
            rows={3}
            value={symptoms}
            onChange={(e) => { setSymptoms(e.target.value); mark(); }}
          />
        </div>

        {/* Diagnosis */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Diagnosis</label>
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            placeholder="Enter diagnosis..."
            rows={2}
            value={diagnosis}
            onChange={(e) => { setDiagnosis(e.target.value); mark(); }}
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</label>
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            placeholder="Additional notes..."
            rows={2}
            value={notes}
            onChange={(e) => { setNotes(e.target.value); mark(); }}
          />
        </div>

        {/* Prescription */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Prescription</label>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col gap-2">
            {prescriptions.map((p) => (
              <PrescriptionRow
                key={p.id}
                {...p}
                onDelete={() => { setPrescriptions((prev) => prev.filter((x) => x.id !== p.id)); mark(); }}
              />
            ))}

            {showAddMedicine && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                {(["medicine", "dosage", "frequency"] as const).map((field) => (
                  <input
                    key={field}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={newMedicine[field]}
                    onChange={(e) => setNewMedicine((m) => ({ ...m, [field]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addPrescription()}
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
                  />
                ))}
              </div>
            )}

            <button
              onClick={() => setShowAddMedicine((v) => !v)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700 transition mt-1 w-fit"
            >
              <Icons.Plus /> Add medicine
            </button>
          </div>
        </div>

        {/* Follow-Up Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Follow-Up Date</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icons.Calendar />
            </span>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => { setFollowUpDate(e.target.value); mark(); }}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Lab Reports */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lab Reports</label>
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition">
            <span className="text-slate-400"><Icons.Upload /></span>
            <p className="text-sm text-slate-500 font-medium">Drag & drop files or click to upload</p>
            <p className="text-xs text-slate-400">PDF, JPG, PNG up to 10MB</p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => setHasUnsaved(false)}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
        >
          Save Report
        </button>
      </div>
    </aside>
  );
}
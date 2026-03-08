"use client";
import { useState } from "react";
import { reportApi } from "@/lib/api/reportApi";
import type { MedicineForm, ReportRequestDto, ReportResponseDto, ReportType } from "@/lib/type/report";

// ── Icons ──────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

// ── Medicine Row ───────────────────────────────────────
function MedicineRow({
  medicine,
  index,
  disabled,
  onDelete,
  onChange,
}: {
  medicine: MedicineForm;
  index: number;
  disabled: boolean;
  onDelete: () => void;
  onChange: (field: keyof MedicineForm, value: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">Medicine #{index + 1}</span>
        {!disabled && (
          <button onClick={onDelete} className="text-slate-400 hover:text-red-500 transition">
            <TrashIcon />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          disabled={disabled}
          placeholder="Medicine name *"
          value={medicine.name}
          onChange={(e) => onChange("name", e.target.value)}
          className="col-span-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <input
          disabled={disabled}
          placeholder="Dosage (e.g. 500mg)"
          value={medicine.dosage}
          onChange={(e) => onChange("dosage", e.target.value)}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <input
          disabled={disabled}
          placeholder="Frequency (e.g. twice a day)"
          value={medicine.frequency}
          onChange={(e) => onChange("frequency", e.target.value)}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <input
          disabled={disabled}
          placeholder="Duration (e.g. 7 days)"
          value={medicine.duration}
          onChange={(e) => onChange("duration", e.target.value)}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <input
          disabled={disabled}
          placeholder="Instructions (e.g. after food)"
          value={medicine.instructions}
          onChange={(e) => onChange("instructions", e.target.value)}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────
interface MedicalReportPanelProps {
  appointmentId: number;
  doctorName?: string;
  onClose?: () => void;
  onSaved?: (report: ReportResponseDto) => void;
}

export function MedicalReportPanel({
  appointmentId,
  doctorName = "Doctor",
  onClose,
  onSaved,
}: MedicalReportPanelProps) {

  const [title, setTitle]                   = useState("");
  const [symptoms, setSymptoms]             = useState("");
  const [diagnosis, setDiagnosis]           = useState("");
  const [treatmentPlan, setTreatmentPlan]   = useState("");
  const [notes, setNotes]                   = useState("");
  const [reportType, setReportType]         = useState<ReportType>("CONSULTATION");
  const [medicines, setMedicines]           = useState<MedicineForm[]>([]);
  const [hasUnsaved, setHasUnsaved]         = useState(false);
  const [loading, setLoading]               = useState(false);
  const [finalizing, setFinalizing]         = useState(false);
  const [savedReport, setSavedReport]       = useState<ReportResponseDto | null>(null);
  const [error, setError]                   = useState<string | null>(null);

  const mark = () => setHasUnsaved(true);
  const isFinalized = savedReport?.status === "FINALIZED";

  // ── Medicine handlers ──────────────────────────────
  const addMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ]);
    mark();
  };

  const deleteMedicine = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
    mark();
  };

  const updateMedicine = (index: number, field: keyof MedicineForm, value: string) => {
    setMedicines((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
    mark();
  };

  // ── Save Draft ─────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim()) { setError("Title is required"); return; }
    setError(null);
    setLoading(true);
    try {
      const payload: ReportRequestDto = {
        appointmentId,
        title,
        diagnosis,
        symptoms,
        treatmentPlan,
        notes,
        reportType,
        medicines,
      };

      const report = savedReport
        ? await reportApi.update(savedReport.id, payload)
        : await reportApi.create(payload);

      setSavedReport(report);
      setHasUnsaved(false);
      onSaved?.(report);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save report");
    } finally {
      setLoading(false);
    }
  };

  // ── Finalize ───────────────────────────────────────
  const handleFinalize = async () => {
    if (!savedReport) { setError("Save the report first before finalizing"); return; }
    setError(null);
    setFinalizing(true);
    try {
      const report = await reportApi.finalize(savedReport.id);
      setSavedReport(report);
      setHasUnsaved(false);
      onSaved?.(report);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to finalize report");
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <aside className="flex flex-col w-full h-full">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Medical Consultation Report</h2>
            <p className="text-xs text-slate-400 mt-0.5">APT-{appointmentId} · {doctorName}</p>
          </div>
          <div className="flex items-center gap-2">
            {isFinalized && (
              <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1 flex items-center gap-1">
                <CheckIcon /> Finalized
              </span>
            )}
            {hasUnsaved && !isFinalized && (
              <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                Unsaved changes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-5 px-6 py-5 overflow-y-auto">

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* Report Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Report Type</label>
          <div className="flex gap-2">
            {(["CONSULTATION", "LAB", "DISCHARGE"] as const).map((type) => (
              <button
                key={type}
                disabled={isFinalized}
                onClick={() => { setReportType(type); mark(); }}
                className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition ${
                  reportType === type
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            disabled={isFinalized}
            placeholder="e.g. Fever Consultation"
            value={title}
            onChange={(e) => { setTitle(e.target.value); mark(); }}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Symptoms */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Symptoms</label>
          <textarea
            disabled={isFinalized}
            placeholder="Describe patient symptoms..."
            rows={3}
            value={symptoms}
            onChange={(e) => { setSymptoms(e.target.value); mark(); }}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Diagnosis */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Diagnosis</label>
          <textarea
            disabled={isFinalized}
            placeholder="Enter diagnosis..."
            rows={2}
            value={diagnosis}
            onChange={(e) => { setDiagnosis(e.target.value); mark(); }}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Treatment Plan */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Treatment Plan</label>
          <textarea
            disabled={isFinalized}
            placeholder="Describe treatment plan..."
            rows={2}
            value={treatmentPlan}
            onChange={(e) => { setTreatmentPlan(e.target.value); mark(); }}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</label>
          <textarea
            disabled={isFinalized}
            placeholder="Additional notes..."
            rows={2}
            value={notes}
            onChange={(e) => { setNotes(e.target.value); mark(); }}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Medicines */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Medicines</label>
          <div className="flex flex-col gap-2">
            {medicines.map((medicine, index) => (
              <MedicineRow
                key={index}
                medicine={medicine}
                index={index}
                disabled={!!isFinalized}
                onDelete={() => deleteMedicine(index)}
                onChange={(field, value) => updateMedicine(index, field, value)}
              />
            ))}
            {!isFinalized && (
              <button
                onClick={addMedicine}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-700 transition w-fit mt-1"
              >
                <PlusIcon /> Add medicine
              </button>
            )}
          </div>
        </div>

        {/* Buttons */}
        {!isFinalized && (
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : savedReport ? "Update Report" : "Save Draft"}
            </button>

            {savedReport && (
              <button
                onClick={handleFinalize}
                disabled={finalizing}
                className="w-full rounded-xl border-2 border-green-500 py-3 text-sm font-semibold text-green-600 hover:bg-green-50 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {finalizing ? "Finalizing..." : "Finalize Report"}
              </button>
            )}
          </div>
        )}

        {isFinalized && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-xs text-green-700 font-medium text-center">
            ✓ This report has been finalized and cannot be edited
          </div>
        )}

      </div>
    </aside>
  );
}

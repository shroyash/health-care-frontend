"use client";
import { useState } from "react";
import type { ReportResponseDto } from "@/lib/type/report";

// ── Icons ──────────────────────────────────────────────────────────────────────
export const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const PillIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.309 48.309 0 01-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
  </svg>
);

export const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const EmptyIcon = () => (
  <svg className="w-14 h-14 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────
export function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function formatDateTime(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export const TYPE_COLORS: Record<string, string> = {
  CONSULTATION: "bg-blue-50 text-blue-700 border-blue-200",
  LAB:          "bg-purple-50 text-purple-700 border-purple-200",
  DISCHARGE:    "bg-orange-50 text-orange-700 border-orange-200",
};

export const STATUS_COLORS: Record<string, string> = {
  DRAFT:     "bg-amber-50 text-amber-700 border-amber-300",
  FINALIZED: "bg-green-50 text-green-700 border-green-300",
};

// ── Section block ──────────────────────────────────────────────────────────────
function Section({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-line">{value}</p>
    </div>
  );
}

// ── Report Detail Modal ────────────────────────────────────────────────────────
export function ReportDetailModal({
  report,
  onClose,
  idLabel,
  idValue,
}: {
  report: ReportResponseDto;
  onClose: () => void;
  idLabel: string;
  idValue: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">

        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-start justify-between px-6 py-5 bg-white border-b border-slate-100 rounded-t-3xl">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-950 truncate">{report.title}</h2>
              <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-0.5 shrink-0 ${TYPE_COLORS[report.reportType] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
                {report.reportType}
              </span>
              <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-0.5 shrink-0 ${STATUS_COLORS[report.status] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
                {report.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <ClockIcon /> {formatDateTime(report.createdAt)}
              </span>
              <span className="text-xs text-slate-600">
                · APT <span className="font-semibold text-slate-800">#{report.appointmentId}</span>
              </span>
              {/* ✅ Show name instead of ID */}
              <span className="text-xs text-slate-600">
                · {idLabel}: <span className="font-semibold text-slate-800">{idValue}</span>
              </span>
            </div>
            {/* ✅ Show both doctor and patient names in modal */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              {report.patientName && (
                <span className="text-xs text-slate-600">
                  Patient: <span className="font-semibold text-slate-800">{report.patientName}</span>
                </span>
              )}
              {report.doctorName && (
                <span className="text-xs text-slate-600">
                  · Doctor: <span className="font-semibold text-slate-800">{report.doctorName}</span>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <Section label="Symptoms"       value={report.symptoms} />
            <Section label="Diagnosis"      value={report.diagnosis} />
            <Section label="Treatment Plan" value={report.treatmentPlan} />
            <Section label="Notes"          value={report.notes} />
            {!report.symptoms && !report.diagnosis && !report.treatmentPlan && !report.notes && (
              <p className="text-xs text-slate-500 italic">No clinical details recorded.</p>
            )}
          </div>

          {report.medicines && report.medicines.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <PillIcon /> Prescribed Medicines ({report.medicines.length})
              </span>
              <div className="flex flex-col gap-2">
                {report.medicines.map((med, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">{med.name || "—"}</span>
                      {med.dosage && (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5 shrink-0">
                          {med.dosage}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {med.frequency    && <span className="text-xs text-slate-700"><span className="font-semibold">Frequency:</span> {med.frequency}</span>}
                      {med.duration     && <span className="text-xs text-slate-700"><span className="font-semibold">Duration:</span> {med.duration}</span>}
                      {med.instructions && <span className="text-xs text-slate-700"><span className="font-semibold">Instructions:</span> {med.instructions}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.reportUrl && (
            <a
              href={report.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              View Full Report Document
            </a>
          )}

          {report.status === "FINALIZED" && (
            <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-xs text-green-800 font-semibold text-center">
              ✓ Report finalized{report.finalizedAt && <> on {formatDate(report.finalizedAt)}</>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Report Card ────────────────────────────────────────────────────────────────
export function ReportCard({
  report,
  idLabel,
  idValue,
  onClick,
}: {
  report: ReportResponseDto;
  idLabel: string;
  idValue: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.99] group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5 group-hover:bg-blue-100 transition-colors">
            <FileIcon />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{report.title}</p>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <ClockIcon /> {formatDate(report.createdAt)}
              </span>
              {/* ✅ Show name instead of UUID */}
              <span className="text-xs text-slate-500">
                · {idLabel}: <span className="font-semibold text-slate-700">{idValue}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-[10px] font-bold border rounded-full px-2 py-0.5 ${TYPE_COLORS[report.reportType] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
            {report.reportType}
          </span>
          <span className={`text-[10px] font-bold border rounded-full px-2 py-0.5 ${STATUS_COLORS[report.status] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
            {report.status}
          </span>
        </div>
      </div>

      {(report.diagnosis || report.symptoms) && (
        <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 pl-12">
          {report.diagnosis || report.symptoms}
        </p>
      )}

      {report.medicines && report.medicines.length > 0 && (
        <div className="mt-2 pl-12 flex items-center gap-1 text-xs text-slate-500">
          <PillIcon />
          <span>{report.medicines.length} medicine{report.medicines.length > 1 ? "s" : ""} prescribed</span>
        </div>
      )}

      {report.reportUrl && (
        <div className="mt-2 pl-12">
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
            Document attached
          </span>
        </div>
      )}
    </button>
  );
}

// ── Shared Report List Layout ──────────────────────────────────────────────────
export function ReportListLayout({
  heading,
  subheading,
  reports,
  loading,
  error,
  onRetry,
  idLabel,
  getId,
}: {
  heading: string;
  subheading: string;
  reports: ReportResponseDto[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  idLabel: string;
  getId: (r: ReportResponseDto) => string;
}) {
  const [filterType,   setFilterType]   = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search,       setSearch]       = useState("");
  const [selected,     setSelected]     = useState<ReportResponseDto | null>(null);

  const filtered = reports.filter((r) => {
    const matchType   = filterType   === "ALL" || r.reportType === filterType;
    const matchStatus = filterStatus === "ALL" || r.status     === filterStatus;
    // ✅ Also search by patientName and doctorName
    const matchSearch = !search.trim() ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
      r.symptoms?.toLowerCase().includes(search.toLowerCase()) ||
      r.treatmentPlan?.toLowerCase().includes(search.toLowerCase()) ||
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.doctorName?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-950">{heading}</h1>
          <p className="text-sm text-slate-600 mt-1">{subheading}</p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, diagnosis, symptoms, name..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          >
            <option value="ALL">All Types</option>
            <option value="CONSULTATION">Consultation</option>
            <option value="LAB">Lab</option>
            <option value="DISCHARGE">Discharge</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="FINALIZED">Finalized</option>
          </select>
        </div>

        {/* Stats */}
        {!loading && !error && (
          <div className="flex gap-3 mb-5 flex-wrap">
            {[
              { label: "Total",     value: reports.length,                                       color: "bg-white border-slate-200 text-slate-800" },
              { label: "Finalized", value: reports.filter(r => r.status === "FINALIZED").length, color: "bg-green-50 border-green-200 text-green-800" },
              { label: "Draft",     value: reports.filter(r => r.status === "DRAFT").length,     color: "bg-amber-50 border-amber-200 text-amber-800" },
            ].map((s) => (
              <div key={s.label} className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${s.color}`}>
                <span className="text-lg font-bold">{s.value}</span>
                <span className="text-xs font-semibold">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-600">Loading reports...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-red-700">Failed to load reports</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
              <button onClick={onRetry} className="mt-2 text-xs font-bold text-red-700 underline hover:no-underline">
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <EmptyIcon />
            <p className="text-base font-bold text-slate-700">
              {reports.length === 0 ? "No reports yet" : "No results found"}
            </p>
            <p className="text-sm text-slate-500 max-w-xs">
              {reports.length === 0 ? subheading : "Try adjusting your search or filters."}
            </p>
            {reports.length > 0 && (
              <button
                onClick={() => { setSearch(""); setFilterType("ALL"); setFilterStatus("ALL"); }}
                className="mt-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Grid — 1 col mobile, 2 col md, 3 col xl */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                idLabel={idLabel}
                idValue={getId(r)}
                onClick={() => setSelected(r)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <ReportDetailModal
          report={selected}
          idLabel={idLabel}
          idValue={getId(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
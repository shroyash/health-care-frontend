"use client";
import { useState } from "react";
import { reportApi } from "@/lib/api/reportApi";
import { ReportDetailModal } from "@/components/ui/Reportshared";
import type { ReportResponseDto } from "@/lib/type/report";
import type { PatientAppointmentDto, DoctorAppointmentDto } from "@/lib/type/appointment";

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  COMPLETED: {
    label: "Completed",
    dot:   "bg-emerald-400",
    text:  "text-emerald-700",
    bg:    "bg-emerald-50 border-emerald-200",
  },
  CANCELLED: {
    label: "Cancelled",
    dot:   "bg-rose-400",
    text:  "text-rose-700",
    bg:    "bg-rose-50 border-rose-200",
  },
};

// ── Report Fetch Modal ─────────────────────────────────────────────────────────
function ReportFetchModal({
  appointmentId,
  idLabel,
  onClose,
}: {
  appointmentId: number;
  idLabel: string;
  onClose: () => void;
}) {
  const [report,  setReport]  = useState<ReportResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useState(() => {
    reportApi.getByAppointment(appointmentId)
      .then(setReport)
      .catch(() => setError("No report found for this appointment."))
      .finally(() => setLoading(false));
  });

  if (loading) return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="bg-white rounded-3xl px-10 py-8 flex flex-col items-center gap-3 shadow-2xl">
        <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-600 font-medium">Loading report...</p>
      </div>
    </div>
  );

  if (error || !report) return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="bg-white rounded-3xl px-8 py-8 flex flex-col items-center gap-3 shadow-2xl max-w-sm w-full text-center">
        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-sm font-bold text-slate-700">No report available</p>
        <p className="text-xs text-slate-400">The doctor hasn&apos;t generated a report for this appointment.</p>
        <button
          onClick={onClose}
          className="mt-1 px-5 py-2 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <ReportDetailModal
      report={report}
      idLabel={idLabel}
      idValue={idLabel === "Doctor Name" ? report.doctorName : report.patientName}
      onClose={onClose}
    />
  );
}

// ── Appointment Card ───────────────────────────────────────────────────────────
function AppointmentCard({
  name,
  appointment,
  isDoctor,
  onViewReport,
}: {
  name: string;
  appointment: PatientAppointmentDto | DoctorAppointmentDto;
  isDoctor: boolean;
  onViewReport: () => void;
}) {
  const s = STATUS_CONFIG[appointment.status as keyof typeof STATUS_CONFIG];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all h-full flex flex-col">

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
            {name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{name ?? "—"}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {appointment.checkupType?.toString().replace("_", " ")}
            </p>
          </div>
        </div>
        {s && (
          <span className={`text-[10px] font-bold border rounded-full px-2.5 py-1 shrink-0 flex items-center gap-1.5 ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        )}
      </div>

      {/* Date + time */}
      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
          </svg>
          {formatDate(appointment.appointmentDate)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatTime(appointment.startTime)} — {formatTime(appointment.endTime)}
        </div>
      </div>

      {/* Spacer pushes button to bottom */}
      <div className="flex-1" />

      {/* View Report — only COMPLETED */}
      {appointment.status === "COMPLETED" && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <button
            onClick={onViewReport}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            View Report
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AppointmentHistoryPage({
  appointments = [],
  isDoctor,
}: {
  appointments: (PatientAppointmentDto | DoctorAppointmentDto)[];
  isDoctor: boolean;
}) {
  const [filter,     setFilter]     = useState<"ALL" | "COMPLETED" | "CANCELLED">("ALL");
  const [search,     setSearch]     = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  function getName(a: PatientAppointmentDto | DoctorAppointmentDto): string {
    return isDoctor
      ? (a as DoctorAppointmentDto).patientName
      : (a as PatientAppointmentDto).doctorName;
  }

  const filtered = appointments.filter((a) => {
    const matchStatus = filter === "ALL" || a.status === filter;
    const matchSearch = !search.trim() ||
      getName(a)?.toLowerCase().includes(search.toLowerCase()) ||
      a.checkupType?.toString().toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    total:     appointments.length,
    completed: appointments.filter(a => a.status === "COMPLETED").length,
    cancelled: appointments.filter(a => a.status === "CANCELLED").length,
  };

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Appointment History</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isDoctor ? "Your past appointments with patients" : "Your past appointments with doctors"}
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-5 flex-wrap">
          {[
            { label: "Total",     value: counts.total,     color: "bg-white border-slate-200 text-slate-800" },
            { label: "Completed", value: counts.completed, color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
            { label: "Cancelled", value: counts.cancelled, color: "bg-rose-50 border-rose-200 text-rose-800" },
          ].map(s => (
            <div key={s.label} className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${s.color}`}>
              <span className="text-lg font-bold">{s.value}</span>
              <span className="text-xs font-semibold">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isDoctor ? "Search by patient name..." : "Search by doctor name..."}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "COMPLETED", "CANCELLED"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  filter === f
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                }`}
              >
                {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <svg className="w-14 h-14 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
            </svg>
            <p className="text-base font-bold text-slate-600">No appointments found</p>
            <p className="text-sm text-slate-400">
              {appointments.length === 0
                ? "Your history will appear here after appointments are completed or cancelled"
                : "Try adjusting your filters"}
            </p>
            {appointments.length > 0 && (
              <button
                onClick={() => { setFilter("ALL"); setSearch(""); }}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Grid — 1 col mobile, 2 col md, 3 col xl */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(a => (
              <AppointmentCard
                key={a.appointmentId}
                name={getName(a)}
                appointment={a}
                isDoctor={isDoctor}
                onViewReport={() => setSelectedId(a.appointmentId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Report modal */}
      {selectedId !== null && (
        <ReportFetchModal
          appointmentId={selectedId}
          idLabel={isDoctor ? "Patient Name" : "Doctor Name"}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
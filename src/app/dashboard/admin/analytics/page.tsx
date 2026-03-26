"use client";

import { useEffect, useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  RadialBarChart, RadialBar,
  ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Scatter, ScatterChart, ZAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import {
  getAdminDashboardStats,
  getRecentAppointments,
  getWeeklyAppointments,
  getPatientsGenderCount,
} from "@/lib/api/adminDashboard";
import type {
  AdminDashboardStats,
  AppointmentFull,
  WeeklyAppointmentCountResponse,
} from "@/lib/type/adminDashboard";

// ── Palette — matches your dashboard exactly ──────────────────────────────────
const INDIGO  = "#4f46e5";
const GREEN   = "#22c55e";
const AMBER   = "#f59e0b";
const ROSE    = "#ef4444";
const SLATE   = "#1e293b";
const MUTED   = "#94a3b8";
const BORDER  = "#e2e8f0";

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: "#3b82f6",
  CONFIRMED:  INDIGO,
  COMPLETED:  GREEN,
  CANCELLED:  ROSE,
};

const GENDER_COLORS = [INDIGO, GREEN];

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = Math.max(1, Math.ceil(value / 40));
    const t = setInterval(() => {
      cur += step;
      if (cur >= value) { setDisplay(value); clearInterval(t); }
      else setDisplay(cur);
    }, 25);
    return () => clearInterval(t);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border text-xs px-3 py-2" style={{ borderColor: BORDER }}>
      {label && <p className="text-slate-400 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || SLATE }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildBubbleData(appts: AppointmentFull[]) {
  const counts: Record<string, Record<string, number>> = {};
  appts.forEach(a => {
    const type = a.checkupType || "OTHER";
    if (!counts[type]) counts[type] = {};
    counts[type][a.status] = (counts[type][a.status] || 0) + 1;
  });
  return Object.entries(counts).flatMap(([type, statuses], xi) =>
    Object.entries(statuses).map(([status, count], yi) => ({
      x: xi + 1, y: yi + 1, z: count * 20, type, status, count,
    }))
  );
}

function buildRadarData(stats: AdminDashboardStats, appts: AppointmentFull[]) {
  return [
    { metric: "Doctors",   value: Math.min(stats.totalDoctors * 5, 100) },
    { metric: "Patients",  value: Math.min(stats.totalPatients / 2, 100) },
    { metric: "Today",     value: Math.min(stats.totalAppointmentsToday * 10, 100) },
    { metric: "Completed", value: Math.min(appts.filter(a => a.status === "COMPLETED").length * 15, 100) },
    { metric: "Confirmed", value: Math.min(appts.filter(a => a.status === "CONFIRMED").length * 15, 100) },
    { metric: "Pending",   value: Math.min(stats.pendingDoctorApprovals * 12, 100) },
  ];
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [stats,        setStats]        = useState<AdminDashboardStats | null>(null);
  const [appointments, setAppointments] = useState<AppointmentFull[]>([]);
  const [weekly,       setWeekly]       = useState<WeeklyAppointmentCountResponse[]>([]);
  const [gender,       setGender]       = useState<{ name: string; value: number; fill: string }[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const [s, a, w, g] = await Promise.all([
        getAdminDashboardStats(),
        getRecentAppointments(),
        getWeeklyAppointments(),
        getPatientsGenderCount(),
      ]);
      setStats(s); setAppointments(a); setWeekly(w);
      setGender([
        { name: "Male Patients",   value: g.male   ?? 0, fill: INDIGO },
        { name: "Female Patients", value: g.female ?? 0, fill: GREEN  },
      ]);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Loading — matches your dashboard skeleton pattern ──────────────────────
  if (loading) return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 h-[280px] animate-pulse bg-muted" />
        <Card className="p-6 h-[280px] animate-pulse bg-muted" />
        <Card className="p-6 h-[280px] animate-pulse bg-muted" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Card key={i} className="p-6 h-28 animate-pulse bg-muted" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 h-[340px] animate-pulse bg-muted" />
        <Card className="p-6 h-[340px] animate-pulse bg-muted" />
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-red-500 font-medium">{error}</p>
      <button onClick={fetchAll} className="text-sm text-indigo-600 underline">Retry</button>
    </div>
  );

  const bubbleData   = buildBubbleData(appointments);
  const radarData    = stats ? buildRadarData(stats, appointments) : [];
  const totalGender  = gender.reduce((s, d) => s + d.value, 0);
  const weeklyMax    = Math.max(...weekly.map(w => w.count), 1);
  const statusGroups = ["SCHEDULED","CONFIRMED","COMPLETED","CANCELLED"].map(s => ({
    status: s, count: appointments.filter(a => a.status === s).length,
  }));

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* ── Page title — same style as your dashboard ────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
          <p className="text-sm text-slate-400 mt-0.5">Platform-wide insights</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:bg-slate-100"
          style={{ color: INDIGO }}>
          ↺ Refresh
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TOP ROW: Gender | Appointment Matrix | Status Split
      ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1 — Gender Distribution */}
        <Card className="shadow-soft p-6">
          <h2 className="text-lg font-semibold mb-1">Patient Distribution</h2>
          <p className="text-xs text-slate-400 mb-4">Gender breakdown</p>

          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart
              innerRadius="30%"
              outerRadius="90%"
              data={gender}
              startAngle={180}
              endAngle={-180}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={6}
                background={{ fill: "#f1f5f9" }}
                label={{ position: "insideStart", fill: "#fff", fontSize: 11, fontWeight: 700 }}
              />
              <Tooltip content={<ChartTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>

          <div className="mt-3 space-y-3">
            {gender.map(g => {
              const pct = totalGender > 0 ? Math.round((g.value / totalGender) * 100) : 0;
              return (
                <div key={g.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-500">{g.name}</span>
                    <span className="font-bold" style={{ color: g.fill }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: g.fill }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 2 — Appointment Matrix */}
        <Card className="shadow-soft p-6">
          <h2 className="text-lg font-semibold mb-1">Appointment Matrix</h2>
          <p className="text-xs text-slate-400 mb-4">Type × Status distribution</p>

          <ResponsiveContainer width="100%" height={180}>
            <ScatterChart margin={{ top: 8, right: 8, left: -24, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" dataKey="x" tick={false} axisLine={false} tickLine={false} domain={[0, 6]} />
              <YAxis type="number" dataKey="y" tick={false} axisLine={false} tickLine={false} domain={[0, 6]} />
              <ZAxis dataKey="z" range={[40, 360]} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="bg-white rounded-xl shadow-lg border text-xs px-3 py-2" style={{ borderColor: BORDER }}>
                    <p className="font-bold text-slate-700">{d.type}</p>
                    <p style={{ color: STATUS_COLOR[d.status] ?? MUTED }}>{d.status} · {d.count}</p>
                  </div>
                );
              }} />
              <Scatter data={bubbleData}>
                {bubbleData.map((d, i) => (
                  <Cell key={i} fill={STATUS_COLOR[d.status] ?? MUTED} opacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {Object.entries(STATUS_COLOR).map(([s, c]) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                <span className="text-xs text-slate-500 font-medium">{s}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 3 — Status Split */}
        <Card className="shadow-soft p-6">
          <h2 className="text-lg font-semibold mb-1">Status Split</h2>
          <p className="text-xs text-slate-400 mb-5">Recent appointment breakdown</p>

          <div className="space-y-4">
            {statusGroups.map(({ status, count }) => {
              const pct = appointments.length > 0 ? (count / appointments.length) * 100 : 0;
              const col = STATUS_COLOR[status] ?? MUTED;
              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: col }} />
                      <span className="text-sm font-medium text-slate-600">{status}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: col }}>{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: col }} />
                  </div>
                  <p className="text-right text-xs text-slate-400 mt-0.5">{pct.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>

          {/* Mini sparkline */}
          <div className="mt-5 pt-4 border-t border-dashed border-slate-200">
            <p className="text-xs text-slate-400 mb-2">7-day trend</p>
            <div className="flex items-end gap-1 h-10">
              {weekly.map((w, i) => (
                <div key={i} className="flex-1 rounded-sm"
                  style={{
                    height: `${(w.count / weeklyMax) * 100}%`,
                    minHeight: 3,
                    background: INDIGO,
                    opacity: 0.3 + (i / weekly.length) * 0.7,
                  }} />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════
          STAT CARDS — same size/style as your dashboard cards
      ══════════════════════════════════════════════════════════ */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Doctors",     value: stats.totalDoctors,           color: INDIGO, icon: "⚕️" },
            { label: "Total Patients",    value: stats.totalPatients,          color: GREEN,  icon: "🧑" },
            { label: "Appointments Today",value: stats.totalAppointmentsToday, color: AMBER,  icon: "📅" },
            { label: "Pending Approvals", value: stats.pendingDoctorApprovals, color: ROSE,   icon: "⏳" },
          ].map(({ label, value, color, icon }) => (
            <Card key={label} className="shadow-soft p-5 relative overflow-hidden">
              {/* Top accent — same pattern as indigo line chart stroke */}
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                <span className="text-xl">{icon}</span>
              </div>
              <p className="text-3xl font-bold text-slate-800">
                <AnimatedNumber value={value} />
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          CHARTS — same Card + same grid as your dashboard charts
      ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">

        {/* Weekly — ComposedChart with Bar + Line, matching your line stroke color */}
        <Card className="shadow-soft p-6">
          <h2 className="text-lg font-semibold mb-4">Weekly Appointments Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={weekly} margin={{ left: -20, right: 4 }}>
              <defs>
                <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={INDIGO} stopOpacity={0.85} />
                  <stop offset="100%" stopColor={INDIGO} stopOpacity={0.25} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Appointments" fill="url(#barG)" radius={[4,4,0,0]} />
              <Line type="monotone" dataKey="count" name="Trend" stroke={GREEN} strokeWidth={3} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Platform Pulse radar */}
        <Card className="shadow-soft p-6">
          <h2 className="text-lg font-semibold mb-4">Platform Pulse</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={BORDER} />
              <PolarAngleAxis dataKey="metric" tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }} />
              <Radar name="Score" dataKey="value" stroke={INDIGO} fill={INDIGO} fillOpacity={0.15} strokeWidth={2.5} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════
          RECENT APPOINTMENTS
      ══════════════════════════════════════════════════════════ */}
      <Card className="shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Appointments</h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {appointments.length} records
          </span>
        </div>

        {appointments.length === 0 ? (
          <p className="text-center text-slate-400 py-12 text-sm">No appointments found</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {appointments.map((appt) => {
              const col = STATUS_COLOR[appt.status] ?? MUTED;
              return (
                <div key={appt.appointmentId}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">{appt.patientName}</p>
                    <p className="text-xs text-slate-400">Dr. {appt.doctorName}</p>
                  </div>
                  <p className="text-xs text-slate-400 flex-shrink-0 tabular-nums">
                    {new Date(appt.appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded flex-shrink-0">
                    {appt.checkupType}
                  </span>
                  <span className="text-xs font-semibold px-3 py-0.5 rounded-full flex-shrink-0"
                    style={{ color: col, background: `${col}15`, border: `1px solid ${col}30` }}>
                    {appt.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
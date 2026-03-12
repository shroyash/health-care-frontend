"use client";
import { useEffect, useState } from "react";
import { getAllAvailableDoctors } from "@/lib/api/patientDashboard";
import { DoctorWithSchedule } from "@/lib/type/patientDashboard";
import { toast } from "react-toastify";

// ── Avatar initials ────────────────────────────────────────────────────────────
function DoctorAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Fixed blue gradient
  const color = "from-blue-400 to-indigo-500";

  return (
    <div
      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0`}
    >
      {initials}
    </div>
  );
}

// ── Doctor Card ────────────────────────────────────────────────────────────────
function DoctorCard({
  doctor,
  onViewSchedule,
  index,
}: {
  doctor: DoctorWithSchedule;
  onViewSchedule: () => void;
  index: number;
}) {
  return (
    <div
      className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col gap-4"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top — avatar + info */}
      <div className="flex items-start gap-4">
        <DoctorAvatar name={doctor.name} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 truncate leading-tight">
            Dr. {doctor.name}
          </p>
          <p className="text-xs text-blue-600 font-semibold mt-0.5 truncate">
            {doctor.specialty}
          </p>

          {/* Available badge */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">
              Available
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100" />

      {/* Schedule preview — if schedules exist */}
      {doctor.schedules && doctor.schedules.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Upcoming slots
          </p>
          <div className="flex flex-wrap gap-1.5">
            {doctor.schedules.length > 3 && (
              <span className="text-[10px] font-semibold text-slate-400 px-1 py-1">
                +{doctor.schedules.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* CTA button */}
      <button
        onClick={onViewSchedule}
        className="w-full mt-auto py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md"
      >
        View Schedule
      </button>
    </div>
  );
}

// ── Skeleton loader ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-200 shrink-0" />
        <div className="flex-1 flex flex-col gap-2 pt-1">
          <div className="h-3.5 bg-slate-200 rounded-full w-3/4" />
          <div className="h-3 bg-slate-100 rounded-full w-1/2" />
          <div className="h-3 bg-slate-100 rounded-full w-1/3 mt-1" />
        </div>
      </div>
      <div className="h-px bg-slate-100" />
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-slate-100 rounded-lg" />
        <div className="h-6 w-16 bg-slate-100 rounded-lg" />
      </div>
      <div className="h-9 bg-slate-100 rounded-xl" />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export const AvailableDoctors = ({
  onViewSchedule,
}: {
  onViewSchedule: (doctor: DoctorWithSchedule) => void;
}) => {
  const [doctors, setDoctors] = useState<DoctorWithSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await getAllAvailableDoctors();
        setDoctors(res);
      } catch (err) {
        toast.error("Failed to fetch doctors");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filtered = doctors.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Header + search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Available Doctors</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading
              ? "Loading..."
              : `${doctors.length} doctor${doctors.length !== 1 ? "s" : ""} available`}
          </p>
        </div>

        {/* Search */}
        {!loading && doctors.length > 0 && (
          <div className="relative sm:w-64">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or specialty..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>
        )}
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-700">
            {doctors.length === 0 ? "No doctors available" : "No results found"}
          </p>
          <p className="text-xs text-slate-400">
            {doctors.length === 0
              ? "Check back later for available doctors"
              : "Try a different name or specialty"}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-sm font-bold text-blue-600 hover:text-blue-800 transition"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doctor, i) => (
            <DoctorCard
              key={doctor.doctorProfileId}
              doctor={doctor}
              index={i}
              onViewSchedule={() => onViewSchedule(doctor)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
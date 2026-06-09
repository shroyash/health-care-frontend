"use client";
import { useEffect, useState } from "react";
import { doctorAppointmentApi } from "@/lib/api/appointment.api";
import AppointmentHistoryPage, { PageResponse } from "@/components/ui/Appointmenthistorypage";
import { DoctorAppointmentDto } from "@/lib/type/appointment.types";

export default function DoctorHistoryPage() {
  const [appointments, setAppointments] = useState<DoctorAppointmentDto[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [currentPage,  setCurrentPage]  = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    doctorAppointmentApi
      .getHistory(currentPage)
      .then((res: PageResponse<DoctorAppointmentDto>) => {
        if (!cancelled) {
          setAppointments(res.content);
          setTotalPages(res.totalPages);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[DoctorHistoryPage] getHistory failed:", err);
          setError("Failed to load appointment history.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [currentPage]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-sm text-red-600 font-semibold">{error}</p>
    </div>
  );

  return (
    <AppointmentHistoryPage
      appointments={appointments}
      isDoctor={true}
      totalPages={totalPages}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    />
  );
}
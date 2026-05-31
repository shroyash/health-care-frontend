"use client";
import { useEffect, useState } from "react";
import { patientAppointmentApi } from "@/lib/api/appointment.api";
import type { PatientAppointmentDto } from "@/lib/type/appointment.types";
import AppointmentHistoryPage from "@/components/ui/Appointmenthistorypage";

export default function PatientHistoryPage() {
  const [appointments, setAppointments] = useState<PatientAppointmentDto[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

 useEffect(() => {
  patientAppointmentApi.getHistory()
    .then((data) => {
      if (data && data.content) {
        setAppointments(data.content);
      } else {
        setAppointments([]);
      }
    })
    .catch(() => setError("Failed to load appointment history."))
    .finally(() => setLoading(false));
}, []);
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

  return <AppointmentHistoryPage appointments={appointments} isDoctor={false} />;
}
"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api/api";
import { AppointmentAccess } from "@/lib/type/appointment";

const MeetingPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const requestId = Array.isArray(params.id) ? params.id[0] : params.id;
  const token = searchParams.get("token") || "";

  const [appointment, setAppointment] = useState<AppointmentAccess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await api.get<AppointmentAccess>(`/appointments/appointments/${requestId}/access`, {
          params: { token },
        });
        setAppointment(res.data);
      } catch (err) {
        console.error(err);
        alert("Invalid or expired meeting link.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [requestId, token]);

  if (loading) return <p>Loading...</p>;
  if (!appointment) return <p>Invalid appointment.</p>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Appointment Details</h2>
      <p><strong>Doctor:</strong> {appointment.doctorName}</p>
      <p><strong>Patient:</strong> {appointment.patientName}</p>
      <p><strong>Date & Time:</strong> {new Date(appointment.appointmentTime).toLocaleString()}</p>

      {appointment.canJoin ? (
        <button
          onClick={() =>
            router.push(`/appointment-room/${appointment.appointmentId}?token=${appointment.meetingToken}`)
          }
          className="mt-6 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Join Meeting
        </button>
      ) : (
        <p className="mt-6 text-red-500">You can join 5 minutes before the appointment.</p>
      )}
    </div>
  );
};

export default MeetingPage;

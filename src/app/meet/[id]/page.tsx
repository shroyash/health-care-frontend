"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api/api";
import { AppointmentAccess } from "@/lib/type/appointment";

const MeetingPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const appointmentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const token = searchParams.get("token") || "";

  const [appointment, setAppointment] = useState<AppointmentAccess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await api.get<AppointmentAccess>(
          `/appointments/appointments/${appointmentId}/access`,
          { params: { token } }
        );
        setAppointment(res.data);
      } catch (err) {
        console.error(err);
        alert("Invalid or expired meeting link.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [appointmentId, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-pulse bg-white p-6 rounded-xl shadow-md w-96">
          <div className="h-6 bg-gray-200 rounded mb-4" />
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-10 bg-gray-200 rounded mt-6" />
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Invalid appointment.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Appointment Details
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Online consultation session
        </p>

        <div className="space-y-3 text-gray-700">
          <div className="flex justify-between">
            <span className="font-medium">Doctor</span>
            <span>{appointment.doctorName}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Patient</span>
            <span>{appointment.patientName}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Date & Time</span>
            <span>
              {new Date(appointment.appointmentTime).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-6">
          {appointment.canJoin ? (
            <span className="inline-block px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
              Ready to Join
            </span>
          ) : (
            <span className="inline-block px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
              Not Available Yet
            </span>
          )}
        </div>

        {/* Join Button */}
        {appointment.canJoin ? (
          <button
            onClick={() =>
              router.push(
                `/appointment-room/${appointment.appointmentId}?token=${appointment.meetingToken}`
              )
            }
            className="mt-6 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold
                       hover:bg-blue-700 transition-all duration-200 shadow-md"
          >
            Join Meeting
          </button>
        ) : (
          <p className="mt-6 text-sm text-red-500">
            You can join 5 minutes before the appointment.
          </p>
        )}
      </div>
    </div>
  );
};

export default MeetingPage;

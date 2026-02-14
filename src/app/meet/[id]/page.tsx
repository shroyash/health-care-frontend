"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api/api";

// ✅ Updated interface with UUID
interface AppointmentAccess {
  appointmentId: number;      // ✅ UUID instead of number
  doctorId: string;           // ✅ UUID
  patientId: string;          // ✅ UUID
  doctorName: string;
  patientName: string;
  appointmentTime: string;    // ISO 8601 datetime
  canJoin: boolean;
  meetingToken: string;       // JWT token for this specific meeting
}

const MeetingPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // ✅ Get UUID appointment ID from URL
  const appointmentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const token = searchParams.get("token") || "";

  const [appointment, setAppointment] = useState<AppointmentAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        // ✅ Call backend with UUID
        const res = await api.get<AppointmentAccess>(
          `/appointments/${appointmentId}/access`,  // ✅ UUID in URL
          { 
            params: { token },
            headers: {
              // If using Bearer token:
              // "Authorization": `Bearer ${token}`
            }
          }
        );

        setAppointment(res.data);
        
        // ✅ Store JWT token if provided
        if (res.data.meetingToken) {
          localStorage.setItem('jwt', res.data.meetingToken);
        }

      } catch (err: any) {
        console.error("Failed to fetch appointment:", err);
        setError(err.response?.data?.message || "Invalid or expired meeting link.");
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    } else {
      setError("No appointment ID provided");
      setLoading(false);
    }
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

  if (error || !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">{error || "Invalid appointment"}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
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
          
          {/* ✅ Show appointment ID (for debugging) */}
          <div className="flex justify-between text-xs text-gray-400">
            <span>Appointment ID</span>
            <span className="font-mono">{appointment.appointmentId.substring(0, 8)}...</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-6">
          {appointment.canJoin ? (
            <span className="inline-block px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
              ✅ Ready to Join
            </span>
          ) : (
            <span className="inline-block px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
              ⏳ Not Available Yet
            </span>
          )}
        </div>

        {/* Join Button */}
        {appointment.canJoin ? (
          <button
            onClick={() => {
              // ✅ Navigate to room with UUID
              router.push(
                `/appointment-room/${appointment.appointmentId}?token=${appointment.meetingToken}`
              );
            }}
            className="mt-6 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold
                       hover:bg-blue-700 transition-all duration-200 shadow-md
                       active:scale-95"
          >
            🎥 Join Meeting
          </button>
        ) : (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⏰ You can join 5 minutes before the appointment.
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Available from: {new Date(new Date(appointment.appointmentTime).getTime() - 5 * 60000).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingPage;
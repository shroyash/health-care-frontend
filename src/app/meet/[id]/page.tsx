"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { API } from "@/lib/api/api";

interface AppointmentAccess {
  appointmentId: string;
  userId: string;
  doctorName: string;
  patientName: string;
  appointmentTime: string;
  canJoin: boolean;
  meetingToken: string;
}

const MeetingPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const appointmentId = Number(
    Array.isArray(params.id) ? params.id[0] : params.id
  );
  const token = searchParams.get("token") || "";

  const [appointment, setAppointment] =
    useState<AppointmentAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client-side validation
  const [canJoinNow, setCanJoinNow] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const data = await API.getOne<AppointmentAccess>(
          `/api/appointments/${appointmentId}/access?token=${token}`
        );

        setAppointment(data);

        if (data.meetingToken) {
          localStorage.setItem("jwt", data.meetingToken);
        }
      } catch (err: any) {
        console.error("Failed to fetch appointment:", err);
        setError(
          err.response?.data?.message || "Invalid or expired meeting link."
        );
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

  // Live timer
  useEffect(() => {
    if (!appointment) return;

    const updateJoinStatus = () => {
      const now = Date.now();
      const appointmentTime = new Date(
        appointment.appointmentTime
      ).getTime();

      // Allow joining 5 minutes before
      const joinTime = appointmentTime - 5 * 60 * 1000;

      if (now >= joinTime) {
        setCanJoinNow(true);
        setTimeLeft("");
      } else {
        setCanJoinNow(false);

        const diff = joinTime - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(
          (diff % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      }
    };

    updateJoinStatus();

    const interval = setInterval(updateJoinStatus, 1000);

    return () => clearInterval(interval);
  }, [appointment]);

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

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>

          <p className="text-gray-600">
            {error || "Invalid appointment"}
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const joinEnabled = appointment.canJoin && canJoinNow;

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
              {new Date(
                appointment.appointmentTime
              ).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-xs text-gray-400">
            <span>Appointment ID</span>
            <span className="font-mono">
              {appointment.appointmentId}
            </span>
          </div>
        </div>

        <div className="mt-6">
          {joinEnabled ? (
            <span className="inline-block px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
              ✅ Ready to Join
            </span>
          ) : (
            <span className="inline-block px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
              ⏳ Waiting for meeting time
            </span>
          )}
        </div>

        <button
          disabled={!joinEnabled}
          onClick={() => {
            if (!joinEnabled) return;

            router.push(
              `/appointments/${appointment.appointmentId}?token=${appointment.meetingToken}`
            );
          }}
          className={`mt-6 w-full py-3 rounded-xl font-semibold transition-all duration-200 shadow-md
            ${
              joinEnabled
                ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          {joinEnabled ? "🎥 Join Meeting" : "⏳ Join Meeting"}
        </button>

        {!joinEnabled && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              You can join 5 minutes before the appointment.
            </p>

            <p className="text-xs text-yellow-600 mt-2">
              Available from:{" "}
              {new Date(
                new Date(appointment.appointmentTime).getTime() -
                  5 * 60 * 1000
              ).toLocaleString()}
            </p>

            {timeLeft && (
              <p className="text-center font-semibold text-blue-600 mt-3">
                Join available in {timeLeft}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingPage;
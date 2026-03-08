"use client";
import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { VideoCall } from "@/components/ui/VideoCall";
import { LiveChat } from "@/components/ui/LiveChat";
import { MedicalReportPanel } from "@/components/ui/MedicalReportPanel";
import { useChat } from "@/hooks/useChat";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AppointmentRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const appointmentId = Number(params.id);
  const token = searchParams.get("token") || "";

  const { userId, username, isDoctor, ready } = useCurrentUser();
  const [showReport, setShowReport] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "files" | "vitals">(
    "notes",
  );
  const [notes, setNotes] = useState("");

  const {
    messages,
    input,
    setInput,
    connected,
    stompClient,
    sendMessage,
    messagesEndRef,
  } = useChat(appointmentId, token, username);

  if (!ready) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  const doctorInitials = username
    ? username
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DR";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {doctorInitials}
            </div>
            <div>
              <div className="text-[15px] font-semibold text-gray-800 leading-tight">
                {username || "Doctor"}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                General Physician
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1.5 bg-white">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`}
              />
              <span className="text-xs font-semibold text-gray-600">
                {connected ? "Live" : "Offline"}
              </span>
            </div>
            <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </button>
            <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            {isDoctor && (
              <button
                onClick={() => setShowReport(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all active:scale-95 shadow-sm ml-1"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Generate Report
              </button>
            )}
          </div>
        </div>

        {/* Video — takes all remaining space */}
        <div className="flex-1 overflow-hidden relative min-h-0">
          <VideoCall
            stompClient={stompClient}
            appointmentId={appointmentId}
            userId={userId}
            wsConnected={connected}
            username={username}
            isDoctor={isDoctor}
          />
        </div>
      </div>

      {/* ── RIGHT COLUMN: Chat ─────────────────────────────────────── */}
      <div className="w-80 shrink-0 flex flex-col bg-white border-l border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="text-[15px] font-semibold text-gray-800">
            Messages
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            Live consultation chat
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <LiveChat
            messages={messages}
            input={input}
            setInput={setInput}
            connected={connected}
            userId={userId}
            username={username}
            isDoctor={isDoctor}
            sendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>

      {/* ── REPORT MODAL ──────────────────────────────────────────── */}
      {showReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReport(false);
          }}
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <button
              onClick={() => setShowReport(false)}
              className="absolute top-4 right-4 z-10 rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <MedicalReportPanel
              appointmentId={appointmentId}
              doctorName={username || "Doctor"}
              onClose={() => setShowReport(false)}
              onSaved={(report) => {
                console.log("Report saved:", report);
                // optionally close modal on finalize
                if (report.status === "FINALIZED") setShowReport(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

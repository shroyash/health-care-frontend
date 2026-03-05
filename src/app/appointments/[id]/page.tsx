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

  console.log("=== useCurrentUser ===", { userId, username, isDoctor, ready });

  const [showReport, setShowReport] = useState(false);

  const {
    messages,
    input,
    setInput,
    connected,
    stompClient,
    sendMessage,
    messagesEndRef,
  } = useChat(appointmentId, token, username);

  // ✅ Wait for user data before rendering
  if (!ready) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
        <div className="text-slate-400 text-sm animate-pulse">
          Loading session...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900">
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden relative min-h-0">
          <VideoCall
            stompClient={stompClient}
            appointmentId={appointmentId}
            userId={userId}
            wsConnected={connected}
          />

          {isDoctor && (
            <button
              onClick={() => setShowReport(true)}
              className="absolute top-4 right-4 z-30 flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur-md border border-blue-100 px-4 py-2.5 text-sm font-semibold text-blue-600 shadow-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95 transition-all duration-200"
            >
              <svg
                className="w-4 h-4 shrink-0"
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

        <div className="h-80 shrink-0 border-t border-slate-700">
          <div className="h-80 shrink-0 border-t border-slate-700">
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
      </div>

      {isDoctor && showReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReport(false);
          }}
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <button
              onClick={() => setShowReport(false)}
              className="absolute top-4 right-4 z-10 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
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
            <MedicalReportPanel onClose={() => setShowReport(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

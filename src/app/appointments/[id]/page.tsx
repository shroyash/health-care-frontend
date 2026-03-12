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

  // Mobile: which tab is active — "video" | "chat"
  const [mobileTab, setMobileTab] = useState<"video" | "chat">("video");

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
    /**
     * Mobile  : single-column, stacked — p-0, no gap, bg-white
     * Desktop : two-column side-by-side — p-3, gap-3, bg-gray-100
     */
    <div className="flex h-screen w-screen overflow-hidden
                    flex-col
                    lg:flex-row lg:bg-gray-100 lg:p-6 lg:gap-4">

      {/* ════════════════════════════════════════════════════════════
          LEFT COLUMN  (video + how-to)
          Mobile : fills screen when mobileTab === "video"
          Desktop: flex-1 card
      ════════════════════════════════════════════════════════════ */}
      <div className={`
        flex flex-col overflow-hidden min-w-0 bg-white
        ${mobileTab === "video" ? "flex-1" : "hidden"}
        lg:flex lg:flex-1 lg:rounded-2xl lg:shadow-sm
      `}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between
                        px-4 py-3
                        sm:px-6 sm:py-3.5
                        bg-white border-b border-gray-100 shrink-0
                        lg:rounded-t-2xl">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-teal-600
                            flex items-center justify-center
                            text-white text-xs sm:text-sm font-bold shrink-0">
              {doctorInitials}
            </div>
            <div>
              <div className="text-[14px] sm:text-[15px] font-semibold text-gray-950 leading-tight">
                {username || "Doctor"}
              </div>
              <div className="text-[11px] sm:text-xs text-gray-600 mt-0.5">
                General Physician
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Live pill */}
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-full px-2.5 py-1.5 sm:px-3 bg-white">
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
              <span className="text-[11px] sm:text-xs font-semibold text-gray-800 tabular-nums">
                {connected ? "Live" : "Offline"}
              </span>
            </div>

            {/* Chat tab toggle — mobile only */}
            <button
              className="lg:hidden w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors relative"
              onClick={() => setMobileTab("chat")}
              title="Open chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              {messages.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>



            {isDoctor && (
              <button
                onClick={() => setShowReport(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all active:scale-95 shadow-sm ml-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Generate Report</span>
                <span className="sm:hidden">Report</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Video ── */}
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

        {/* ── How to use panel — hidden on very small screens to save space ── */}
        <div className="shrink-0 bg-white border-t border-gray-100 px-4 py-3 sm:px-6 sm:py-4 lg:rounded-b-2xl">
          <p className="text-sm font-semibold text-gray-950 mb-2 sm:mb-3">
            How to use your consultation
          </p>
          <div className="flex flex-col gap-2 sm:gap-2.5">
            {[
              {
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                ),
                title: "Video Call",
                desc: "Use the controls below the video to mute, toggle camera, share screen, or end the call.",
              },
              {
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                ),
                title: "Chat",
                desc: "Send messages, share files, or medical images with your doctor in real-time.",
              },
              {
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: "Generate Report",
                desc: "Only the doctor can generate the medical report & prescription after the consultation ends.",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-50 border border-blue-100
                                flex items-center justify-center text-blue-600
                                shrink-0 text-[10px] sm:text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <span className="text-blue-400 mt-0.5 shrink-0">{item.icon}</span>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">{item.title} </span>
                    <span className="text-[11px] sm:text-xs text-gray-700">{item.desc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          RIGHT COLUMN  (chat)
          Mobile : fills full screen when mobileTab === "chat"
          Desktop: fixed-width sidebar card
      ════════════════════════════════════════════════════════════ */}
      <div className={`
        flex flex-col bg-white overflow-hidden
        ${mobileTab === "chat" ? "flex-1" : "hidden"}
        lg:flex lg:flex-none lg:w-96 lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100
      `}>
        {/* Chat header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100 shrink-0 flex items-center gap-3">
          {/* Back to video — mobile only */}
          <button
            className="lg:hidden w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors shrink-0"
            onClick={() => setMobileTab("video")}
            title="Back to video"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div>
            <div className="text-[15px] font-semibold text-gray-950">Messages</div>
            <div className="text-xs text-gray-600 mt-0.5">Live consultation chat</div>
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReport(false);
          }}
        >
          {/* On mobile slides up from bottom; on desktop it's a centred dialog */}
          <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto
                          rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
            <button
              onClick={() => setShowReport(false)}
              className="absolute top-4 right-4 z-10 rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <MedicalReportPanel
              appointmentId={appointmentId}
              doctorName={username || "Doctor"}
              onClose={() => setShowReport(false)}
              onSaved={(report) => {
                console.log("Report saved:", report);
                if (report.status === "FINALIZED") setShowReport(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
"use client";
import type { Client } from "@stomp/stompjs";
import { useWebRTC } from "@/hooks/useWebRTC";
import { CallTimer } from "@/components/ui/CallTimer";

interface VideoCallProps {
  stompClient:   Client | null;
  appointmentId: number;
  userId:        string;
  wsConnected:   boolean;
  username:      string;
  isDoctor:      boolean;
}

export function VideoCall({
  stompClient, appointmentId, userId, wsConnected, username, isDoctor,
}: VideoCallProps) {
  const {
    callState, isMuted, isCameraOff,
    localVideoRef, remoteVideoRef,
    joinRoom, leaveCall, toggleMute, toggleCamera,
  } = useWebRTC(stompClient, appointmentId, userId, wsConnected);

  const isActive = callState === "calling" || callState === "connected";

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden rounded-b-none">

      {/* ── Remote video ───────────────────────────────────────────── */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* ── Local PiP — bottom right ────────────────────────────────── */}
      <div className="absolute bottom-20 right-3 flex flex-col items-center gap-1">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-28 h-20 rounded-xl object-cover bg-gray-800 border border-white/10 shadow-xl"
        />
        <span className="text-white/70 text-[10px] font-medium">You</span>
      </div>

      {/* ── IDLE: not started ──────────────────────────────────────── */}
      {callState === "idle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
          {/* Doctor avatar placeholder */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-teal-700/60 border-2 border-teal-400/30 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
              {username?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "DR"}
            </div>
            <p className="text-white/80 text-sm font-medium">{username || "Doctor"}</p>
            <p className="text-white/40 text-xs">Ready to connect</p>
          </div>

          <button
            onClick={joinRoom}
            disabled={!wsConnected}
            className={`flex items-center gap-2 px-7 py-3 rounded-2xl font-semibold text-sm text-white transition-all active:scale-95 shadow-lg ${
              wsConnected
                ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/50"
                : "bg-gray-700 cursor-not-allowed opacity-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
            {wsConnected ? "Start Video Call" : "Connecting..."}
          </button>
        </div>
      )}

      {/* ── JOINING ─────────────────────────────────────────────────── */}
      {callState === "joining" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Starting camera...</p>
        </div>
      )}

      {/* ── CALLING: waiting for other party ────────────────────────── */}
      {callState === "calling" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <p className="text-white/80 text-xs font-medium">Waiting for other party...</p>
        </div>
      )}

      {/* ── ENDED ───────────────────────────────────────────────────── */}
      {callState === "ended" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-900/80">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-white/60 text-sm">Call ended</p>
          <button
            onClick={joinRoom}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all active:scale-95"
          >
            🔄 Rejoin
          </button>
        </div>
      )}

      {/* ── BUSY ────────────────────────────────────────────────────── */}
      {callState === "busy" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl px-6 py-4 text-center">
            <p className="text-yellow-400 text-sm font-semibold">Room is busy</p>
            <p className="text-white/50 text-xs mt-1">Please try again shortly</p>
          </div>
        </div>
      )}

      {/* ── ACTIVE CONTROLS ─────────────────────────────────────────── */}
      {isActive && (
        <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 px-4">

          {/* Timer pill */}
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 text-white text-xs font-semibold tabular-nums mr-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <CallTimer active={isActive} />
          </div>

          {/* Mute mic */}
          <button
            onClick={toggleMute}
            title={isMuted ? "Unmute microphone" : "Mute microphone"}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg ${
              isMuted
                ? "bg-red-500 text-white shadow-red-900/40"
                : "bg-white/15 backdrop-blur-md text-white hover:bg-white/25"
            }`}
          >
            {isMuted ? (
              /* mic off */
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            ) : (
              /* mic on */
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Camera toggle */}
          <button
            onClick={toggleCamera}
            title={isCameraOff ? "Turn on camera" : "Turn off camera"}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg ${
              isCameraOff
                ? "bg-red-500 text-white shadow-red-900/40"
                : "bg-white/15 backdrop-blur-md text-white hover:bg-white/25"
            }`}
          >
            {isCameraOff ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 00-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
            )}
          </button>

          {/* Screen share */}
          <button
            title="Share screen"
            className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-md text-white hover:bg-white/25 flex items-center justify-center transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
          </button>

          {/* End call — red, prominent */}
          <button
            onClick={leaveCall}
            title="End call"
            className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all active:scale-95 shadow-xl shadow-red-900/50 ml-1"
          >
            <svg className="w-5 h-5 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
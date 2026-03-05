"use client";
import type { Client } from "@stomp/stompjs";
import { useWebRTC } from "@/hooks/useWebRTC";
import { CallTimer } from "./CallTimer";
import { Icons } from "./Icons";
import { videoStyles,ctrlBtnStyle } from "@/styles";

interface VideoCallProps {
  stompClient: Client | null;
  appointmentId: number;
  userId: string;
  wsConnected: boolean;
}

export function VideoCall({ stompClient, appointmentId, userId, wsConnected }: VideoCallProps) {
  const {
    callState, isMuted, isCameraOff,
    localVideoRef, remoteVideoRef,
    joinRoom, leaveCall, toggleMute, toggleCamera,
  } = useWebRTC(stompClient, appointmentId, userId);

  const isCallActive = callState === "calling" || callState === "connected";

  return (
    <div style={videoStyles.container}>
      <video ref={remoteVideoRef} autoPlay playsInline style={videoStyles.remoteVideo} />
      <video ref={localVideoRef}  autoPlay playsInline muted style={videoStyles.localVideo} />

      <div style={videoStyles.overlay}>
        {/* Top bar */}
        <div style={videoStyles.topBar}>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={videoStyles.badge}>
              <span style={{ ...videoStyles.connectedDot, background: wsConnected ? "#22c55e" : "#ef4444" }} />
              {wsConnected ? "Connected" : "Disconnected"}
            </div>
            {isCallActive && (
              <div style={videoStyles.badge}>🕐 <CallTimer active={isCallActive} /></div>
            )}
          </div>
          <button style={videoStyles.expandBtn}><Icons.Expand /></button>
        </div>

        {/* State overlays */}
        {callState === "idle" && (
          <div style={videoStyles.idleOverlay}>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>Video call not started</div>
            <button style={videoStyles.joinBtn} onClick={joinRoom}>🎥 Start Video Call</button>
          </div>
        )}
        {callState === "joining" && (
          <div style={videoStyles.idleOverlay}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Connecting camera...</div>
          </div>
        )}
        {callState === "busy" && (
          <div style={videoStyles.idleOverlay}>
            <div style={{ color: "#fbbf24", fontSize: "14px", fontWeight: 600 }}>⏳ Room is busy — try again</div>
          </div>
        )}
        {callState === "ended" && (
          <div style={videoStyles.idleOverlay}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Call ended</div>
            <button style={videoStyles.joinBtn} onClick={joinRoom}>🔄 Rejoin</button>
          </div>
        )}

        {/* Active call controls */}
        {isCallActive && (
          <div style={videoStyles.controls}>
            <button style={ctrlBtnStyle(isMuted ? "active" : "normal")} onClick={toggleMute}>
              {isMuted ? <Icons.MicOff /> : <Icons.MicOn />}
            </button>
            <button style={ctrlBtnStyle(isCameraOff ? "active" : "normal")} onClick={toggleCamera}>
              {isCameraOff ? <Icons.CamOff /> : <Icons.CamOn />}
            </button>
            <button style={ctrlBtnStyle("normal")}><Icons.Screen /></button>
            <button style={ctrlBtnStyle("danger")} onClick={leaveCall}><Icons.EndCall /></button>
          </div>
        )}
      </div>
    </div>
  );
}
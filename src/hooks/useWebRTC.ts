"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Client } from "@stomp/stompjs";
import type { CallState, SignalMessage } from "@/lib/type/communication";

export function useWebRTC(
  stompClient: Client | null,
  appointmentId: number,
  userId: string,
  wsConnected: boolean  // ✅ added
) {
  const [callState, setCallState]     = useState<CallState>("idle");
  const [isMuted, setIsMuted]         = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const localVideoRef     = useRef<HTMLVideoElement>(null);
  const remoteVideoRef    = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef    = useRef<MediaStream | null>(null);

  const sendSignal = useCallback(
    (msg: Partial<SignalMessage>) => {
      if (!stompClient?.connected) {
        console.warn("STOMP not connected — signal dropped:", msg.type);
        return;
      }
      stompClient.publish({
        destination: "/app/webrtc.signal",
        body: JSON.stringify({ ...msg, senderId: userId, appointmentId }),
      });
    },
    [stompClient, userId, appointmentId]
  );

  const createPeerConnection = useCallback(async (): Promise<RTCPeerConnection> => {
    let iceServers: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:8001"}/api/communication/webrtc/ice-servers`,
        { credentials: "include" }
      );
      if (res.ok) iceServers = await res.json();
    } catch (_) {}

    const pc = new RTCPeerConnection({ iceServers });

    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal({ type: "ICE", candidate: e.candidate.toJSON() });
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") setCallState("connected");
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setCallState("ended");
        cleanup();
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [sendSignal]);

  const getLocalMedia = useCallback(async (): Promise<MediaStream> => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  }, []);

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    localStreamRef.current    = null;
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  const handleSignal = useCallback(
    async (msg: SignalMessage) => {
      switch (msg.type) {
        case "JOIN": {
          const stream = localStreamRef.current ?? (await getLocalMedia());
          const pc     = await createPeerConnection();
          stream.getTracks().forEach((t) => pc.addTrack(t, stream));
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal({ type: "OFFER", sdp: offer.sdp, targetId: msg.senderId });
          setCallState("calling");
          break;
        }
        case "OFFER": {
          const stream = localStreamRef.current ?? (await getLocalMedia());
          const pc     = await createPeerConnection();
          stream.getTracks().forEach((t) => pc.addTrack(t, stream));
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: "offer", sdp: msg.sdp! })
          );
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal({ type: "ANSWER", sdp: answer.sdp, targetId: msg.senderId });
          break;
        }
        case "ANSWER":
          await peerConnectionRef.current?.setRemoteDescription(
            new RTCSessionDescription({ type: "answer", sdp: msg.sdp! })
          );
          break;
        case "ICE":
          if (peerConnectionRef.current && msg.candidate)
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(msg.candidate)
            );
          break;
        case "LEAVE":
          setCallState("ended");
          cleanup();
          break;
        case "BUSY":
          setCallState("busy");
          break;
      }
    },
    [getLocalMedia, createPeerConnection, sendSignal, cleanup]
  );

  // ✅ only subscribe when actually connected
  useEffect(() => {
    if (!stompClient || !userId || !wsConnected) return;

    const sub = stompClient.subscribe(
      `/user/${userId}/queue/webrtc`,
      (frame) => {
        try { handleSignal(JSON.parse(frame.body)); }
        catch (e) { console.error("Signal parse error", e); }
      }
    );
    return () => sub.unsubscribe();
  }, [stompClient, userId, wsConnected, handleSignal]); // ✅ wsConnected in deps

  const joinRoom = async () => {
    if (!stompClient?.connected) {
      console.warn("Cannot join — WebSocket not connected yet");
      return;
    }
    setCallState("joining");
    await getLocalMedia();
    sendSignal({ type: "JOIN" });
  };

  const leaveCall = () => {
    sendSignal({ type: "LEAVE" });
    cleanup();
    setCallState("idle");
  };

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsMuted((m) => !m);
  };

  const toggleCamera = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsCameraOff((c) => !c);
  };

  return {
    callState,
    isMuted,
    isCameraOff,
    localVideoRef,
    remoteVideoRef,
    joinRoom,
    leaveCall,
    toggleMute,
    toggleCamera,
  };
}
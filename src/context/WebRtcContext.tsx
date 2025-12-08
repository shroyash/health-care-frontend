"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Stomp from "stompjs";

interface WebRtcContextType {
  localStream: MediaStream | null;
  remoteStreams: MediaStream[];
  messages: string[];
  sendMessage: (msg: string) => void;
  joinRoom: () => void;
}

const WebRtcContext = createContext<WebRtcContextType | undefined>(undefined);

interface Props {
  children: React.ReactNode;
  roomId: string;
  userId: string;
}

export const WebRtcProvider = ({ children, roomId, userId }: Props) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const stompClientRef = useRef<any>(null);

  useEffect(() => {
    // Initialize local media
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Add local tracks
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Listen for remote tracks
      pc.ontrack = (event) => {
        setRemoteStreams(prev => [...prev, ...event.streams]);
      };
    };
    init();
  }, []);

  const joinRoom = () => {
    const ws = new WebSocket("ws://localhost:8080/ws"); // your backend ws endpoint
    const stompClient = Stomp.over(ws);
    stompClientRef.current = stompClient;

    stompClient.connect({}, () => {
      // Subscribe to room topic
      stompClient.subscribe(`/topic/appointment.${roomId}`, (msg: any) => {
        const payload = JSON.parse(msg.body);
        if (payload.type === "CHAT") setMessages(prev => [...prev, payload.content]);
      });

      // Notify backend user joined
      stompClient.send("/app/join", {}, JSON.stringify({ roomId, senderId: userId, type: "join" }));
    });
  };

  const sendMessage = (msg: string) => {
    if (!stompClientRef.current) return;
    stompClientRef.current.send("/app/chat", {}, JSON.stringify({ roomId, senderId: userId, content: msg, type: "CHAT" }));
  };

  return (
    <WebRtcContext.Provider value={{ localStream, remoteStreams, messages, sendMessage, joinRoom }}>
      {children}
    </WebRtcContext.Provider>
  );
};

export const useWebRtc = () => {
  const context = useContext(WebRtcContext);
  if (!context) throw new Error("useWebRtc must be used within WebRtcProvider");
  return context;
};

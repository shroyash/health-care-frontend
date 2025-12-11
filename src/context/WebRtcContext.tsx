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

interface Props {
  children: React.ReactNode;
  roomId: string;
  userId: string;
  token?: string; // optional token for secure join
}

interface StompMessage {
  roomId: string;
  senderId: string;
  type: string;
  content?: string;
}

const WebRtcContext = createContext<WebRtcContextType | undefined>(undefined);

export const WebRtcProvider: React.FC<Props> = ({ children, roomId, userId, token }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const [messages, setMessages] = useState<string[]>([]);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const stompClientRef = useRef<any>(null); // use any because STOMP lacks TS types

  // Initialize local media & PeerConnection
  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);

        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        // Add local tracks
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // Listen for remote tracks
        pc.ontrack = (event) => {
          event.streams.forEach(remoteStream => {
            setRemoteStreams(prev => {
              // avoid duplicates
              if (!prev.some(s => s.id === remoteStream.id)) return [...prev, remoteStream];
              return prev;
            });
          });
        };
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    init();
  }, []);

  // Join room via WebSocket + STOMP
  const joinRoom = () => {
    if (!token) console.warn("Token not provided! Room access might be insecure.");

    const ws = new WebSocket("ws://localhost:8080/ws"); // Replace with your backend WS endpoint
    const stompClient = Stomp.over(ws);
    stompClientRef.current = stompClient;

    stompClient.connect({}, () => {
      // Subscribe to room topic
      stompClient.subscribe(`/topic/appointment.${roomId}`, (msg: { body: string }) => {
        const payload: StompMessage = JSON.parse(msg.body);

        // Only append valid chat messages
        if (payload.type === "CHAT" && payload.content) {
          setMessages(prev => [...prev, payload.content!]); // '!' ensures TS knows it's string
        }
      });

      // Notify backend user joined
      const joinPayload: StompMessage = { roomId, senderId: userId, type: "JOIN" };
      stompClient.send("/app/join", {}, JSON.stringify(joinPayload));
    });
  };

  const sendMessage = (msg: string) => {
    if (!stompClientRef.current) return;
    const payload: StompMessage = { roomId, senderId: userId, type: "CHAT", content: msg };
    stompClientRef.current.send("/app/chat", {}, JSON.stringify(payload));
    setMessages(prev => [...prev, msg]); // show own message immediately
  };

  return (
    <WebRtcContext.Provider value={{ localStream, remoteStreams, messages, sendMessage, joinRoom }}>
      {children}
    </WebRtcContext.Provider>
  );
};

export const useWebRtc = (): WebRtcContextType => {
  const context = useContext(WebRtcContext);
  if (!context) throw new Error("useWebRtc must be used within WebRtcProvider");
  return context;
};

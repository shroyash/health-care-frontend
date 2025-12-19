"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

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
}

interface StompMessage {
  appointmentId: number;
  senderId: string;
  type: "CHAT" | "JOIN";
  content?: string;
}

const WebRtcContext = createContext<WebRtcContextType | undefined>(undefined);

export const WebRtcProvider: React.FC<Props> = ({ children, roomId, userId }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  
  const stompClientRef = useRef<Client | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  /* ======== INIT LOCAL STREAM & PEER CONNECTION ======== */
  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setLocalStream(stream);

        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          event.streams.forEach((remote) => {
            setRemoteStreams((prev) => {
              if (!prev.find((s) => s.id === remote.id)) return [...prev, remote];
              return prev;
            });
          });
        };
      } catch (err) {
        console.error("Failed to access media devices:", err);
      }
    };

    init();

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
      pcRef.current?.close();
      stompClientRef.current?.deactivate();
    };
  }, []);

  /* ======== STOMP CHAT ======== */
  const joinRoom = () => {
    console.log("🚀 Attempting to join room:", roomId);
    
    const client = new Client({
      webSocketFactory: () => {
        console.log("🔌 Creating SockJS connection to http://localhost:8006/ws");
        return new SockJS("http://localhost:8006/ws", null, {
          transports: ['websocket', 'xhr-streaming', 'xhr-polling'] // ✅ Multiple fallbacks
        });
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log("📡 STOMP:", str),
      onStompError: (frame) => {
        console.error("❌ STOMP Error:", frame);
      },
      onWebSocketError: (event) => {
        console.error("❌ WebSocket Error:", event);
      },
      onWebSocketClose: (event) => {
        console.warn("⚠️ WebSocket Closed:", event);
      }
    });

    stompClientRef.current = client;

    client.onConnect = () => {
      console.log("✅ STOMP connected successfully!");

      client.subscribe(`/topic/appointment.${roomId}`, (message: IMessage) => {
        console.log("📨 Received message:", message.body);
        const payload: StompMessage = JSON.parse(message.body);
        
        if (payload.type === "CHAT" && payload.content) {
          setMessages((prev) => [...prev, payload.content!]);
        }
      });

      // Send JOIN message
      client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({
          appointmentId: Number(roomId),
          senderId: userId,
          type: "JOIN",
        }),
      });
      
      console.log("📤 JOIN message sent");
    };

    client.activate();
  };

  const sendMessage = (msg: string) => {
    if (!stompClientRef.current?.connected) {
      console.warn("⚠️ STOMP not connected, cannot send message");
      return;
    }

    stompClientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({
        appointmentId: Number(roomId),
        senderId: userId,
        type: "CHAT",
        content: msg,
      }),
    });
    
    console.log("📤 Message sent:", msg);
  };

  return (
    <WebRtcContext.Provider 
      value={{ localStream, remoteStreams, messages, sendMessage, joinRoom }}
    >
      {children}
    </WebRtcContext.Provider>
  );
};

export const useWebRtc = (): WebRtcContextType => {
  const ctx = useContext(WebRtcContext);
  if (!ctx) throw new Error("useWebRtc must be used inside WebRtcProvider");
  return ctx;
};

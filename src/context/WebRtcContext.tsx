"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export interface ChatMessage {
  sender: string;
  content: string;
}

interface WebRtcContextType {
  localStream: MediaStream | null;
  remoteStreams: { id: string; stream: MediaStream; name: string }[];
  messages: ChatMessage[];
  sendMessage: (msg: string) => void;
  joinRoom: () => void;
  error: string | null;
}

interface Props {
  children: React.ReactNode;
  roomId: string;  // UUID string
  userId: string;  // UUID string
}

interface StompMessage {
  appointmentId: number
  senderId: string;       
  receiverId?: string;    
  type: "TEXT" | "NOTIFICATION";
  content?: string;
  timestamp?: string;
}

const WebRtcContext = createContext<WebRtcContextType | undefined>(undefined);

export const WebRtcProvider: React.FC<Props> = ({ children, roomId, userId }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ id: string; stream: MediaStream; name: string }[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const stompClientRef = useRef<Client | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const isJoinedRef = useRef(false);

  /* ================= INIT MEDIA ================= */
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setLocalStream(stream);

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        });
        pcRef.current = pc;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          event.streams.forEach((remote) => {
            setRemoteStreams((prev) => {
              if (!prev.find((s) => s.stream.id === remote.id)) {
                return [...prev, { id: remote.id, stream: remote, name: "Remote User" }];
              }
              return prev;
            });
          });
        };
      } catch (err) {
        console.error("Media error:", err);
        setError("Camera or microphone permission denied");
      }
    };

    initMedia();

    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      isJoinedRef.current = false;
    };
  }, [roomId, userId]);

  /* ================= LOAD CHAT HISTORY ================= */
  const loadMessageHistory = useCallback(async () => {
    try {
      // ✅ UUID in URL
      const res = await fetch(`https://localhost:8001/api/appointments/${roomId}/messages`, {
        method: "GET",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error("Failed to load messages:", res.status);
        return;
      }

      const history = await res.json();

      const formatted: ChatMessage[] = history
        .filter((m: any) => m.type === "TEXT") // ✅ Changed from "CHAT" to "TEXT"
        .map((m: any) => ({
          sender: m.senderId === userId ? "You" : m.senderId,
          content: m.content ?? "",
        }));

      setMessages(formatted);
    } catch (e) {
      console.error("History load failed", e);
    }
  }, [roomId, userId]);

  /* ================= JOIN ROOM (STOMP) ================= */
  const joinRoom = useCallback(() => {
    if (error || isJoinedRef.current) return;

    loadMessageHistory();
    isJoinedRef.current = true;

    const client = new Client({
      webSocketFactory: () => new SockJS("https://localhost:8001/ws"),
      reconnectDelay: 5000,
      debug: (str) => console.log("STOMP:", str),
      connectHeaders: {
        // If using Bearer token:
        // "Authorization": `Bearer ${localStorage.getItem('jwt')}`
      },
    });

    stompClientRef.current = client;

    client.onConnect = () => {
      console.log("✅ STOMP connected");

      // ✅ Subscribe to appointment topic (UUID)
      client.subscribe(`/topic/appointment.${roomId}`, (msg: IMessage) => {
        const payload: StompMessage = JSON.parse(msg.body);

        console.log("📨 Received message:", payload);

        // ✅ Handle TEXT messages (not CHAT)
        if (payload.type === "TEXT" && payload.senderId !== userId && payload.content) {
          setMessages((prev) => [...prev, { 
            sender: payload.senderId, 
            content: payload.content 
          }]);
        }

        // ✅ Handle NOTIFICATION messages
        if (payload.type === "NOTIFICATION" && payload.content) {
          console.log("🔔 Notification:", payload.content);
        }
      });

      // ✅ Send JOIN notification (optional, backend handles this via WebRTC handler)
      client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({
          appointmentId: roomId,  // ✅ UUID string
          senderId: userId,       // ✅ UUID string (server overrides this from JWT)
          type: "NOTIFICATION",
          content: `${userId} joined`,
        }),
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame);
      setError("WebSocket authentication failed");
    };

    client.activate();
  }, [roomId, userId, error, loadMessageHistory]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = useCallback(
    (msg: string) => {
      if (!stompClientRef.current?.connected) {
        console.error("STOMP not connected");
        return;
      }

      // ✅ Optimistic update
      setMessages((prev) => [...prev, { sender: "You", content: msg }]);

      // ✅ Send to backend
      stompClientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({
          appointmentId: roomId,  // ✅ UUID string
          senderId: userId,       // ✅ UUID string (server overrides from JWT)
          type: "TEXT",           // ✅ Changed from "CHAT" to "TEXT"
          content: msg,
        }),
      });
    },
    [roomId, userId]
  );

  return (
    <WebRtcContext.Provider
      value={{ localStream, remoteStreams, messages, sendMessage, joinRoom, error }}
    >
      {children}
    </WebRtcContext.Provider>
  );
};

export const useWebRtc = () => {
  const ctx = useContext(WebRtcContext);
  if (!ctx) throw new Error("useWebRtc must be used inside WebRtcProvider");
  return ctx;
};
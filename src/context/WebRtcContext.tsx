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
  roomId: string;
  userId: string;
}

interface StompMessage {
  appointmentId: number;
  senderId: string;
  type: "CHAT" | "JOIN" | "NOTIFICATION";
  content?: string;
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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);

        const pc = new RTCPeerConnection();
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
      const res = await fetch(`http://localhost:8006/api/appointments/${roomId}/messages`, {
        method: "GET",
        credentials: "include", // ✅ send HttpOnly cookie automatically
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) return;

      const history = await res.json();

      const formatted: ChatMessage[] = history
        .filter((m: any) => m.type === "CHAT")
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
      webSocketFactory: () => new SockJS("http://localhost:8006/ws"),
      reconnectDelay: 5000,
      debug: (str) => console.log("STOMP:", str),
      // Do not send JWT manually, backend reads HttpOnly cookie
    });

    stompClientRef.current = client;

    client.onConnect = () => {
      console.log("✅ STOMP connected");

      client.subscribe(`/topic/appointment.${roomId}`, (msg: IMessage) => {
        const payload: StompMessage = JSON.parse(msg.body);

        if (payload.type === "CHAT" && payload.senderId !== userId && payload.content) {
          setMessages((prev) => [...prev, { sender: payload.senderId, content: payload.content }]);
        }
      });

      client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({
          appointmentId: Number(roomId),
          senderId: userId,
          type: "JOIN",
        }),
      });
    };

    client.onStompError = (frame) => setError("WebSocket authentication failed");
    client.activate();
  }, [roomId, userId, error, loadMessageHistory]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = useCallback(
    (msg: string) => {
      if (!stompClientRef.current?.connected) return;

      setMessages((prev) => [...prev, { sender: "You", content: msg }]);

      stompClientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({
          appointmentId: Number(roomId),
          senderId: userId,
          type: "CHAT",
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

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
  token?: string;
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
  const stompClientRef = useRef<Client | null>(null);

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
              if (!prev.some(s => s.id === remoteStream.id)) {
                return [...prev, remoteStream];
              }
              return prev;
            });
          });
        };
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    init();

    // Cleanup
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  // Join room via WebSocket + STOMP
  const joinRoom = () => {
    if (!token) console.warn("Token not provided! Room access might be insecure.");

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8006/ws"),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
    });

    stompClientRef.current = client;

    client.onConnect = () => {
      console.log("STOMP connected successfully");

      // Subscribe to room topic
      client.subscribe(`/topic/appointment.${roomId}`, (message: IMessage) => {
        const payload: StompMessage = JSON.parse(message.body);
        
        // Only append valid chat messages
        if (payload.type === "CHAT" && payload.content) {
          setMessages(prev => [...prev, payload.content!]);
        }
      });

      // Notify backend user joined
      const joinPayload: StompMessage = { 
        roomId, 
        senderId: userId, 
        type: "JOIN" 
      };
      
      client.publish({
        destination: "/app/join",
        body: JSON.stringify(joinPayload),
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers["message"]);
      console.error("Details:", frame.body);
    };

    client.onWebSocketError = (event) => {
      console.error("WebSocket error:", event);
    };

    client.activate();
  };

  const sendMessage = (msg: string) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.warn("STOMP not connected yet");
      return;
    }

    const payload: StompMessage = { 
      roomId, 
      senderId: userId, 
      type: "CHAT", 
      content: msg 
    };

    stompClientRef.current.publish({
      destination: "/app/chat",
      body: JSON.stringify(payload),
    });

    setMessages(prev => [...prev, msg]); // show own message immediately
  };

  const value: WebRtcContextType = {
    localStream,
    remoteStreams,
    messages,
    sendMessage,
    joinRoom,
  };

  return (
    <WebRtcContext.Provider value={value}>
      {children}
    </WebRtcContext.Provider>
  );
};

export const useWebRtc = (): WebRtcContextType => {
  const context = useContext(WebRtcContext);
  if (!context) {
    throw new Error("useWebRtc must be used within WebRtcProvider");
  }
  return context;
};
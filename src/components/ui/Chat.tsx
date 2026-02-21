"use client";

import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

interface ChatMessage {
  appointmentId: number;
  content: string;
  type: string;
  senderId?: string;
  timestamp?: string;
}

interface ChatProps {
  appointmentId: number;
}

export default function Chat({ appointmentId }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // SockJS is necessary because native WebSocket doesn't send cookies in some browsers
    const socket = new SockJS("https://localhost:8001/ws");

    const client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
      // DO NOT set connectHeaders for JWT, let browser send HttpOnly cookie
      onConnect: () => {
        console.log("Connected to WebSocket via cookie!");
        setConnected(true);

        client.subscribe(`/topic/appointment.${appointmentId}`, (message) => {
          const received: ChatMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, received]);
        });
      },
      onStompError: (frame) => {
        console.error("Broker error:", frame.headers["message"]);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [appointmentId]);

  const sendMessage = () => {
    if (!stompClient || !stompClient.connected || !input.trim()) return;

    const msg = {
      appointmentId,
      content: input,
      type: "TEXT",
    };

    stompClient.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(msg),
    });

    setInput("");
  };

  return (
    <div style={{ border: "1px solid gray", padding: "15px" }}>
      <h2>Appointment Chat</h2>

      <div
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "5px" }}>
            <strong>{msg.senderId?.slice(0, 6)}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
          style={{ flex: 1 }}
        />
        <button onClick={sendMessage} disabled={!connected}>
          Send
        </button>
      </div>
    </div>
  );
}

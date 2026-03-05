"use client";
import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";

interface ChatMessage {
  id?: number;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load existing messages from DB on mount
  useEffect(() => {
    fetch(`https://localhost:8001/api/communication/appointments/${appointmentId}/messages`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: ChatMessage[]) => setMessages(data))
      .catch((err) => console.error("Failed to load messages:", err));
  }, [appointmentId]);

  // WebSocket connection
  useEffect(() => {
    const client = new Client({
      brokerURL: "wss://localhost:8001/ws",
      reconnectDelay: 5000,
      debug: (str) => console.log(str),

      onConnect: () => {
        console.log("Connected to WebSocket!");
        setConnected(true);
        client.subscribe(`/topic/appointment.${appointmentId}`, (message) => {
          const received: ChatMessage = JSON.parse(message.body);
          setMessages((prev) => {
            if (prev.some((m) => m.id && m.id === received.id)) return prev;
            return [...prev, received];
          });
        });
      },

      onDisconnect: () => {
        setConnected(false);
      },

      onStompError: (frame) => {
        console.error("Broker error:", frame.headers["message"]);
        setConnected(false);
      },

      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
        setConnected(false);
      },
    });

    client.activate();
    setStompClient(client);
    return () => { client.deactivate(); };
  }, [appointmentId]);

  const sendMessage = () => {
    if (!stompClient || !stompClient.connected || !input.trim()) return;
    stompClient.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ appointmentId, content: input.trim(), type: "TEXT" }),
    });
    setInput("");
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  };

  return (
    <div style={{ border: "1px solid gray", padding: "15px", maxWidth: "600px" }}>
      <h2>Appointment Chat</h2>
      <p style={{ color: connected ? "green" : "red", margin: "0 0 10px 0" }}>
        {connected ? "● Connected" : "● Disconnected"}
      </p>
      <div style={{
        height: "300px", overflowY: "auto", border: "1px solid #ccc",
        padding: "10px", marginBottom: "10px", display: "flex",
        flexDirection: "column", gap: "6px",
      }}>
        {messages.length === 0 && (
          <p style={{ color: "#999", textAlign: "center" }}>No messages yet.</p>
        )}
        {messages.map((msg, index) => (
          <div key={msg.id ?? index}>
            <span style={{ fontWeight: "bold", fontSize: "0.85em" }}>
              {msg.senderId ? msg.senderId.slice(0, 8) : "Unknown"}
            </span>
            <span style={{ color: "#999", fontSize: "0.75em", marginLeft: "8px" }}>
              {formatTime(msg.timestamp)}
            </span>
            <div>{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type message..."
          style={{ flex: 1, padding: "6px" }}
          disabled={!connected}
        />
        <button onClick={sendMessage} disabled={!connected || !input.trim()} style={{ padding: "6px 16px" }}>
          Send
        </button>
      </div>
    </div>
  );
}
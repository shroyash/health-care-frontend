"use client";
import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import type { ChatMessage } from "@/lib/type/communication";

export function useChat(appointmentId: number, token: string, username: string) { // ✅ add username
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [input, setInput]             = useState("");
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [connected, setConnected]     = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetch(`/api/communication/appointments/${appointmentId}/messages`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ChatMessage[]) => setMessages(data))
      .catch(() => {});
  }, [appointmentId]);

  useEffect(() => {
    const client = new Client({
      brokerURL: `${process.env.NEXT_PUBLIC_WS_URL ?? "wss://localhost:8001"}/ws`,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(
          `/topic/appointment.${appointmentId}`,
          (frame) => {
            const received: ChatMessage = JSON.parse(frame.body);
            setMessages((prev) =>
              prev.some((m) => m.id && m.id === received.id)
                ? prev
                : [...prev, received]
            );
          }
        );
      },
      onDisconnect: () => setConnected(false),
      onStompError:  () => setConnected(false),
    });
    client.activate();
    setStompClient(client);
    return () => { client.deactivate(); };
  }, [appointmentId, token]);

  const sendMessage = () => {
    if (!stompClient?.connected || !input.trim()) return;
    stompClient.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({
        appointmentId,
        content: input.trim(),
        type:       "TEXT",
        senderName: username, // ✅ send name with message
      }),
    });
    setInput("");
  };

  return { messages, input, setInput, connected, stompClient, sendMessage, messagesEndRef };
}
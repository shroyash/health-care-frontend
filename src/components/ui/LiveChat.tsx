"use client";
import type { RefObject } from "react";
import { formatTime } from "@/lib/utils";
import type { ChatMessage } from "@/lib/type/communication";

interface LiveChatProps {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  connected: boolean;
  userId: string;
  username: string;
  isDoctor: boolean;
  sendMessage: () => void;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function LiveChat({
  messages, input, setInput, connected, userId,
  username, isDoctor, sendMessage, messagesEndRef,
}: LiveChatProps) {

  type Group = { senderId: string; items: ChatMessage[] };
  const grouped = messages.reduce<Group[]>((acc, msg) => {
    const last = acc[acc.length - 1];
    if (last && last.senderId === msg.senderId) {
      last.items.push(msg);
    } else {
      acc.push({ senderId: msg.senderId ?? "", items: [msg] });
    }
    return acc;
  }, []);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-sm text-gray-400">No messages yet</p>
          </div>
        )}

        {grouped.map((group, gi) => {
          const isMine = group.senderId === userId;
          const displayName = isMine
            ? username || (isDoctor ? "Doctor" : "Patient")
            : group.items[0]?.senderName || (isDoctor ? "Patient" : "Doctor");

          return (
            <div key={gi} className={`flex gap-2.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-auto ${isMine ? "bg-blue-500" : "bg-teal-600"}`}>
                {getInitials(displayName)}
              </div>

              {/* Bubbles */}
              <div className={`flex flex-col gap-1 max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
                {/* Full name label */}
                <span className={`text-xs text-gray-500 font-medium mb-0.5 ${isMine ? "text-right" : "text-left"}`}>
                  {displayName}
                </span>

                {group.items.map((msg, mi) => {
                  const isLast = mi === group.items.length - 1;
                  return (
                    <div key={msg.id ?? mi}>
                      <div className={`
                        px-4 py-2.5 text-sm leading-relaxed break-words rounded-2xl
                        ${isMine
                          ? "bg-blue-500 text-white rounded-tr-sm"
                          : "bg-gray-100 text-gray-800 rounded-tl-sm"
                        }
                      `}>
                        {msg.content}
                      </div>
                      {isLast && (
                        <span className={`text-[11px] text-gray-400 mt-1 block ${isMine ? "text-right pr-1" : "text-left pl-1"}`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 px-4 py-3 border-t border-gray-100">
        <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition-all ${
          connected
            ? "bg-white border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
            : "bg-gray-50 border-gray-100 opacity-60"
        }`}>
          <button className="text-gray-400 hover:text-blue-500 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-blue-500 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
          </button>
          <input
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            disabled={!connected}
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !input.trim()}
            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              connected && input.trim()
                ? "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
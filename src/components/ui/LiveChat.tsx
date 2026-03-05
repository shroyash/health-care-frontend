"use client";
import type { RefObject } from "react";
import { Icons } from "./Icons";
import { formatTime } from "@/lib/utils";
import type { ChatMessage } from "@/lib/type/communication";

interface LiveChatProps {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  connected: boolean;
  userId: string;
  username: string;
  isDoctor: boolean; // ✅ added
  sendMessage: () => void;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

function getInitial(name: string) {
  return name ? name.charAt(0).toUpperCase() : "?";
}

function getAvatarColor(senderId: string) {
  const colors = [
    "bg-purple-500", "bg-pink-500", "bg-indigo-500",
    "bg-teal-500", "bg-orange-500", "bg-cyan-500",
  ];
  let hash = 0;
  for (let i = 0; i < senderId.length; i++) hash += senderId.charCodeAt(i);
  return colors[hash % colors.length];
}

export function LiveChat({
  messages, input, setInput, connected, userId, username, isDoctor, sendMessage, messagesEndRef,
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
    <div className="flex flex-col h-full bg-slate-900">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/60 shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <span className="text-sm font-semibold text-slate-200">Live Chat</span>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          connected
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
            : "bg-red-500/10 text-red-400 border border-red-500/30"
        }`}>
          ● {connected ? "Live" : "Offline"}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-sm text-slate-500">No messages yet</p>
          </div>
        )}

        {grouped.map((group, gi) => {
          const isMine      = group.senderId === userId;
          const avatarColor = getAvatarColor(group.senderId);

          // ✅ Use senderName from message, fallback to role label
          const displayName = isMine
            ? username || (isDoctor ? "Doctor" : "Patient")
            : group.items[0]?.senderName || (isDoctor ? "Patient" : "Doctor");

          return (
            <div key={gi} className={`flex gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>

              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white mt-auto ${avatarColor}`}>
                {getInitial(displayName)}
              </div>

              {/* Name + bubbles */}
              <div className={`flex flex-col gap-0.5 max-w-xs ${isMine ? "items-end" : "items-start"}`}>

                {/* Name */}
                <span className={`text-xs font-semibold px-1 ${isMine ? "text-blue-400" : "text-slate-400"}`}>
                  {displayName} {/* ✅ always clean name */}
                </span>

                {/* Bubble group */}
                {group.items.map((msg, mi) => {
                  const isFirst = mi === 0;
                  const isLast  = mi === group.items.length - 1;

                  const baseRounded = "rounded-2xl";
                  const myCorner    = isMine
                    ? isFirst ? "rounded-tr-sm" : isLast ? "rounded-br-sm" : "rounded-r-sm"
                    : isFirst ? "rounded-tl-sm" : isLast ? "rounded-bl-sm" : "rounded-l-sm";

                  return (
                    <div key={msg.id ?? mi} className="flex flex-col" style={{ alignItems: isMine ? "flex-end" : "flex-start" }}>
                      <div className={`
                        px-3.5 py-2 text-sm leading-relaxed break-words
                        ${baseRounded} ${myCorner}
                        ${isMine
                          ? "bg-blue-500 text-white"
                          : "bg-slate-700 text-slate-100"
                        }
                      `}>
                        {msg.content}
                      </div>

                      {/* Timestamp only on last bubble */}
                      {isLast && (
                        <span className="text-xs text-slate-500 px-1 mt-1">
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

      {/* Input */}
      <div className="shrink-0 px-3 py-3 border-t border-slate-700/60">
        <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-all
          ${connected
            ? "bg-slate-800 border-slate-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/40"
            : "bg-slate-800/50 border-slate-700 opacity-60"
          }`}>
          <button className="text-slate-500 hover:text-blue-400 transition-colors shrink-0">
            <Icons.Attachment />
          </button>
          <button className="text-slate-500 hover:text-blue-400 transition-colors shrink-0">
            <Icons.Emoji />
          </button>
          <input
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={connected ? "Type a message..." : "Connecting..."}
            disabled={!connected}
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !input.trim()}
            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all
              ${connected && input.trim()
                ? "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
          >
            <Icons.Send />
          </button>
        </div>
      </div>
    </div>
  );
}
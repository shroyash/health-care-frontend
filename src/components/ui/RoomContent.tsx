"use client";

import { useWebRtc } from "@/context/WebRtcContext";
import { useEffect, useRef, useState } from "react";
import { Send, Video, Mic, X } from "lucide-react";

const RoomContent: React.FC = () => {
  const { localStream, remoteStreams, sendMessage, messages, joinRoom } =
    useWebRtc();

  const [msg, setMsg] = useState("");
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Join room once
  useEffect(() => {
    joinRoom();
  }, [joinRoom]);

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const handleSend = () => {
    if (!msg.trim()) return;
    sendMessage(msg);
    setMsg("");
  };

  return (
    <div className="h-screen w-full flex bg-gray-100">
      {/* ================= VIDEO SECTION ================= */}
      <div className="flex-1 flex flex-col p-4 gap-4 bg-gray-900">
        {/* Top bar */}
        <div className="flex justify-between items-center text-white mb-2">
          <span className="font-semibold text-lg">Video Room</span>
          <button className="p-2 rounded-full hover:bg-gray-800 transition">
            <X size={20} />
          </button>
        </div>

        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Local Video */}
          <div className="relative rounded-xl overflow-hidden bg-black shadow-lg border-2 border-gray-700">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
              You
            </span>
          </div>

          {/* Remote Videos */}
          {remoteStreams.map((stream, i) => (
            <div
              key={i}
              className="relative rounded-xl overflow-hidden bg-black shadow-lg border-2 border-gray-700"
            >
              <video
                autoPlay
                playsInline
                ref={(el) => {
                  if (el) el.srcObject = stream;
                }}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
                User {i + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Call Controls */}
        <div className="flex justify-center gap-4 mt-4">
          <button className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition text-white">
            <Video />
          </button>
          <button className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition text-white">
            <Mic />
          </button>
        </div>
      </div>

      {/* ================= CHAT SECTION ================= */}
      <div className="w-full md:w-[400px] bg-white flex flex-col shadow-xl">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <span className="font-semibold text-lg text-gray-900">Room Chat</span>
          <span className="text-sm text-gray-500">{remoteStreams.length} users</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] break-words px-4 py-2 text-sm rounded-2xl shadow 
                ${
                  m.startsWith("me:")
                    ? "ml-auto bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
            >
              {m.replace(/^me:/, "")}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 flex items-center gap-2 border-t border-gray-200 bg-gray-50">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type a message…"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-2 rounded-full bg-white border border-gray-300 outline-none placeholder-gray-400 focus:ring-1 focus:ring-blue-400"
          />
          <button
            onClick={handleSend}
            className="p-3 bg-blue-500 rounded-full hover:bg-blue-400 transition text-white"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomContent;

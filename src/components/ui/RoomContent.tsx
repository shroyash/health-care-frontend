"use client";
import { useWebRtc } from "@/context/WebRtcContext";
import { useEffect, useRef, useState } from "react";
import { Send, Video, Mic, PhoneOff, VideoOff, MicOff } from "lucide-react";

const RoomContent: React.FC = () => {
  const { localStream, remoteStreams, sendMessage, joinRoom, messages } = useWebRtc();
  const [msg, setMsg] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Always join room immediately
  useEffect(() => {
    joinRoom();
    setTimeout(() => setIsLoadingMessages(false), 2000); // simulate message loading
  }, [joinRoom]);

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

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Video Section */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
        <div
          className="flex-1 p-4 grid gap-4"
          style={{
            gridTemplateColumns: remoteStreams.length > 1 ? "repeat(2, 1fr)" : "1fr",
            gridTemplateRows: remoteStreams.length > 2 ? "repeat(2, 1fr)" : "1fr",
          }}
        >
          {remoteStreams.map((r) => (
            <div key={r.id} className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
              <video
                ref={(el) => { if (el) el.srcObject = r.stream; }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-full text-white text-sm font-medium">
                {r.name}
              </div>
            </div>
          ))}

          {/* Local Video */}
          <div className={`relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl ${remoteStreams.length === 0 ? "col-span-2 row-span-2" : ""}`}>
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 bg-blue-500 px-2 py-1 rounded-full text-white text-sm font-medium">
              You
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <div className="p-6 flex items-center justify-center gap-4">
          <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${isMuted ? "bg-red-500" : "bg-gray-700"} text-white`}>
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <button onClick={toggleVideo} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${isVideoOff ? "bg-red-500" : "bg-gray-700"} text-white`}>
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
          <button className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg text-white">
            <PhoneOff size={28} />
          </button>
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-96 flex flex-col bg-white border-l border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Chat</h2>
          <p className="text-sm text-gray-500 mt-0.5">{remoteStreams.length + 1} participant{remoteStreams.length !== 0 ? "s" : ""}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 text-sm">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 text-sm">No messages yet. Say hi! 👋</div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => {
                const isMe = m.sender === "You";
                return (
                  <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-3xl ${isMe ? "bg-blue-500 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
                      <p className="text-xs font-semibold">{m.sender}</p>
                      <p className="text-sm leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Aa"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
            />
            <button onClick={handleSend} disabled={!msg.trim()} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${msg.trim() ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomContent;

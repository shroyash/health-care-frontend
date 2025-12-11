"use client";

import { useWebRtc } from "@/context/WebRtcContext";
import { useEffect, useState } from "react";

const RoomContent: React.FC = () => {
  const { localStream, remoteStreams, sendMessage, messages, joinRoom } = useWebRtc();
  const [msg, setMsg] = useState("");

  useEffect(() => {
    joinRoom();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Appointment Room</h1>

      {/* Video Streams */}
      <div className="flex gap-4 mb-4">
        <video
          ref={(el) => { if (el && localStream) el.srcObject = localStream; }}
          autoPlay
          muted
          className="w-48 h-48 bg-black"
        />
        {remoteStreams.map((stream, i) => (
          <video
            key={i}
            ref={(el) => { if (el) el.srcObject = stream; }}
            autoPlay
            className="w-48 h-48 bg-black"
          />
        ))}
      </div>

      {/* Chat */}
      <div className="flex mb-2">
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="border p-2 flex-1"
        />
        <button
          onClick={() => { sendMessage(msg); setMsg(""); }}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>

      <div className="border p-2 h-32 overflow-y-auto">
        {messages.map((m, i) => <div key={i}>{m}</div>)}
      </div>
    </div>
  );
};

export default RoomContent;

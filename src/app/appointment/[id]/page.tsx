"use client";

import { WebRtcProvider, useWebRtc } from "@/context/WebRtcContext";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const RoomContent = () => {
  const { localStream, remoteStreams, sendMessage, messages, joinRoom } = useWebRtc();
  const [msg, setMsg] = useState("");

  useEffect(() => {
    joinRoom();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Appointment Room</h1>

      <div className="flex gap-4 mb-4">
        {/* Local video */}
        <video
          ref={(el) => {
            if (el && localStream) el.srcObject = localStream;
          }}
          autoPlay
          muted
          className="w-48 h-48 bg-black"
        />

        {/* Remote videos */}
        {remoteStreams.map((stream, i) => (
          <video
            key={i}
            ref={(el) => {
              if (el) el.srcObject = stream;
            }}
            autoPlay
            className="w-48 h-48 bg-black"
          />
        ))}
      </div>

      {/* Chat input */}
      <div className="flex mb-2">
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="border p-2 flex-1"
        />
        <button
          onClick={() => {
            sendMessage(msg);
            setMsg("");
          }}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>

      {/* Chat messages */}
      <div className="border p-2 h-32 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
    </div>
  );
};

export default function AppointmentRoomPage() {
  const params = useParams();
  const roomId = Array.isArray(params.id) ? params.id[0] : params.id;

  const userId = "patient-" + Math.floor(Math.random() * 10000);

  return (
    <WebRtcProvider roomId={roomId} userId={userId}>
      <RoomContent />
    </WebRtcProvider>
  );
}

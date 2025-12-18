"use client";
import { useMemo } from "react";
import { WebRtcProvider } from "@/context/WebRtcContext";
import { useParams, useSearchParams } from "next/navigation";
import RoomContent from "@/components/ui/RoomContent";

const AppointmentRoomPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const roomId = Array.isArray(params.id) ? params.id[0] : params.id;
  const token = searchParams.get("token") || "";
  
  // Generate userId once and keep it stable
  const userId = useMemo(() => "user-" + Math.floor(Math.random() * 10000), []);

  if (!roomId) {
    return <p>Invalid room ID</p>;
  }

  return (
    <WebRtcProvider roomId={roomId} userId={userId} token={token}>
      <RoomContent />
    </WebRtcProvider>
  );
};

export default AppointmentRoomPage;
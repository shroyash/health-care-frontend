"use client";
import { useMemo, useEffect } from "react";
import { WebRtcProvider } from "@/context/WebRtcContext";
import { useParams, useSearchParams } from "next/navigation";
import RoomContent from "@/components/ui/RoomContent";

const AppointmentRoomPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const roomId = Array.isArray(params.id) ? params.id[0] : params.id;
  const token = searchParams.get("token") || "";

  // Generate a stable userId once per session
  const userId = useMemo(() => "user-" + Math.floor(Math.random() * 100000), []);

  if (!roomId) {
    return <p>Invalid room ID</p>;
  }

  // Optional: Auto-join the room when the component mounts
  useEffect(() => {
    const joinTimer = setTimeout(() => {
      const joinEvent = new CustomEvent("joinRoom");
      window.dispatchEvent(joinEvent);
    }, 500); // small delay to ensure context is ready
    return () => clearTimeout(joinTimer);
  }, []);

  return (
    <WebRtcProvider roomId={roomId} userId={userId} >
      <RoomContent />
    </WebRtcProvider>
  );
};

export default AppointmentRoomPage;
